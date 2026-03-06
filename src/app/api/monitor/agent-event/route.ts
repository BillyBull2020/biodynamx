/**
 * BioDynamX Agent Monitoring
 * POST /api/monitor/agent-event
 *
 * Called by the browser (via navigator.sendBeacon) when an agent
 * connection closes with a non-1000 (error) code.
 *
 * What it does:
 *  1. Logs the event to Supabase for dashboarding
 *  2. Sends an SMS alert to the owner when a 1007/1008 error fires
 *     (these are the "silent killers" — users get errors, owner doesn't know)
 *  3. Rate-limits to prevent alert spam (max 10 alerts/hour)
 */

import { NextRequest, NextResponse } from "next/server";
import { checkRateLimit, getClientIp } from "@/lib/rate-limiter";

// Twilio SMS alert — fires when a hard error (1007/1008) happens
const TWILIO_SID = process.env.TWILIO_ACCOUNT_SID || "";
const TWILIO_TOKEN = process.env.TWILIO_AUTH_TOKEN || "";
const TWILIO_FROM = process.env.TWILIO_PHONE_NUMBER || "";
const OWNER_PHONE = process.env.OWNER_ALERT_PHONE || "+17205732344";

// Supabase for persistent logging
const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

// SMS alert rate limit: max 10 per hour (prevents alert storms)
const ALERT_RATE_KEY = "sms_alert_global";

export async function POST(req: NextRequest) {
    // Rate-limit per IP: max 30 events per minute (prevents beacon spam)
    const ip = getClientIp(req);
    const rl = checkRateLimit(`monitor:${ip}`, 30, 60_000);
    if (!rl.allowed) {
        return NextResponse.json({ ok: false }, { status: 429 });
    }

    let body: {
        agentId?: string;
        agentName?: string;
        closeCode?: number;
        closeReason?: string;
        sessionDurationMs?: number;
        userAgent?: string;
    };

    try {
        body = await req.json();
    } catch {
        return NextResponse.json({ ok: false, error: "Invalid body" }, { status: 400 });
    }

    const { agentId, agentName, closeCode, closeReason, sessionDurationMs } = body;
    const isHardError = closeCode === 1007 || closeCode === 1008;
    const timestamp = new Date().toISOString();

    // ── 1. Log to Supabase ────────────────────────────────────────
    if (SUPABASE_URL && SUPABASE_KEY) {
        try {
            await fetch(`${SUPABASE_URL}/rest/v1/agent_events`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "apikey": SUPABASE_KEY,
                    "Authorization": `Bearer ${SUPABASE_KEY}`,
                    "Prefer": "return=minimal",
                },
                body: JSON.stringify({
                    agent_id: agentId ?? "unknown",
                    agent_name: agentName ?? "unknown",
                    close_code: closeCode ?? 0,
                    close_reason: closeReason ?? "",
                    session_duration_ms: sessionDurationMs ?? 0,
                    ip_hash: ip.slice(0, 8) + "****", // partial hash for privacy
                    is_hard_error: isHardError,
                    created_at: timestamp,
                }),
            });
        } catch (err) {
            console.error("[monitor] Supabase log failed:", err);
        }
    }

    // ── 2. SMS Alert for hard errors ──────────────────────────────
    if (isHardError && TWILIO_SID && TWILIO_TOKEN && TWILIO_FROM) {
        // Rate limit: max 10 SMS per hour globally
        const alertRl = checkRateLimit(ALERT_RATE_KEY, 10, 60 * 60_000);

        if (alertRl.allowed) {
            try {
                const message = `🚨 BioDynamX Agent Error\nAgent: ${agentName ?? agentId}\nCode: ${closeCode} — ${closeCode === 1008 ? "Safety policy" : "Invalid protocol"}\nTime: ${new Date().toLocaleTimeString("en-US", { timeZone: "America/Denver" })} MT`;

                await fetch(
                    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`,
                    {
                        method: "POST",
                        headers: {
                            Authorization: `Basic ${Buffer.from(`${TWILIO_SID}:${TWILIO_TOKEN}`).toString("base64")}`,
                            "Content-Type": "application/x-www-form-urlencoded",
                        },
                        body: new URLSearchParams({
                            From: TWILIO_FROM,
                            To: OWNER_PHONE,
                            Body: message,
                        }),
                    }
                );
                console.log(`[monitor] SMS alert sent for agent ${agentName}, code ${closeCode}`);
            } catch (err) {
                console.error("[monitor] SMS alert failed:", err);
            }
        }
    }

    // Log all events to Cloud Run console (visible in Firebase/GCP logs)
    console.log(`[agent-event] ${timestamp} agent=${agentName} code=${closeCode} duration=${sessionDurationMs}ms`);

    return NextResponse.json({ ok: true });
}
