// ═══════════════════════════════════════════════════════════════════════════
// /api/voice/status — Twilio Call Status Webhook
// ═══════════════════════════════════════════════════════════════════════════
// Twilio calls this when a call completes (or fails).
// Configure in Twilio: Phone Number → Status Callback → POST here.
//
// We use this to:
//   1. Record the call as an ROI event in Supabase
//   2. Send the business owner an SMS summary
//   3. Trigger follow-up sequence if lead was captured
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { sendSMS } from "@/lib/twilio";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://biodynamx.com";
const OWNER_PHONE = process.env.BUSINESS_OWNER_PHONE || process.env.TWILIO_NOTIFY_PHONE || "";

export async function POST(req: NextRequest) {
    const body = await req.formData().catch(() => new FormData());

    const callSid = body.get("CallSid") as string || "";
    const callStatus = body.get("CallStatus") as string || "";
    const callerNumber = body.get("From") as string || "Unknown";
    const duration = body.get("CallDuration") as string || "0";
    const recordingUrl = body.get("RecordingUrl") as string || "";
    const clientNumber = body.get("To") as string || ""; // business number

    console.log(`[Voice Status] 📞 Call ${callSid} — Status: ${callStatus} — Duration: ${duration}s — From: ${callerNumber}`);

    // Only process completed calls
    if (callStatus !== "completed" && callStatus !== "no-answer" && callStatus !== "busy") {
        return NextResponse.json({ received: true });
    }

    const durationSec = parseInt(duration) || 0;
    const wasAnswered = callStatus === "completed" && durationSec > 5;

    try {
        // 1. Record the call as a session/ROI event
        await fetch(`${APP_URL}/api/client-roi`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                clientId: "auto", // Will be resolved from the Twilio number
                type: wasAnswered ? "call_answered" : "missed_call",
                amount: 0, // Revenue calculated when leads convert
                description: wasAnswered
                    ? `Aria answered inbound call from ${callerNumber} — ${durationSec}s duration`
                    : `Missed call from ${callerNumber} — auto-text-back sent`,
                agentName: "Aria",
                metadata: { callSid, callerNumber, clientNumber, duration: durationSec, recordingUrl },
            }),
        }).catch(() => { });

        // 2. If missed (no answer) — send text-back immediately
        if (!wasAnswered && callerNumber !== "Unknown" && callerNumber !== "blocked") {
            const textBack = `Hi! We just missed your call. This is the AI assistant for [Your Business]. We'd love to help! What can we assist you with? Or call us back at ${clientNumber} anytime — we answer 24/7.`;

            await sendSMS(callerNumber, textBack);
            console.log(`[Voice Status] 📱 Missed call text-back sent to ${callerNumber}`);
        }

        // 3. Notify business owner of calls (if configured)
        if (OWNER_PHONE && wasAnswered) {
            const summary = `📞 Aria answered a call!\nFrom: ${callerNumber}\nDuration: ${durationSec}s\nLead captured → check your BioDynamX portal: ${APP_URL}/portal`;
            await sendSMS(OWNER_PHONE, summary).catch(() => { });
        }

        return NextResponse.json({
            received: true,
            callSid,
            status: callStatus,
            duration: durationSec,
            wasAnswered,
        });
    } catch (err) {
        console.error("[Voice Status] Error:", err);
        return NextResponse.json({ received: true, error: String(err) });
    }
}

export async function GET() {
    return NextResponse.json({
        endpoint: "Twilio Voice Status Webhook",
        configure: "Set this as your Twilio Voice Status Callback URL",
        url: `${APP_URL}/api/voice/status`,
        events: ["completed", "no-answer", "busy", "failed"],
    });
}
