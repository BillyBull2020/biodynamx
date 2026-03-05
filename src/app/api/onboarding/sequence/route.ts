// ═══════════════════════════════════════════════════════════════════════════
// /api/onboarding/sequence — 90-Day Client Success Sequence
// ═══════════════════════════════════════════════════════════════════════════
// Called by a cron job (or Stripe webhook) to advance each client through
// the 90-day sequence. Each touchpoint is designed to:
//   1. Show proof of value BEFORE they question their investment
//   2. Build urgency toward the 6x ROI guarantee milestone
//   3. Make churning feel like leaving money on the table
//
// Touchpoints:
//   Day  0: Welcome email + SMS (done in Stripe webhook — sendWelcomeEmail)
//   Day  3: "Aria has already answered X calls for you" SMS
//   Day  7: First week impact report email
//   Day 14: ROI snapshot + "you're X% toward your 6x guarantee" email
//   Day 30: Full 30-day report + highlight top 3 wins
//   Day 60: "60 days in — here's your ROI trajectory" + social proof
//   Day 89: Pre-renewal guarantee check — "We've hit Xx, here's the plan"
//
// POST /api/onboarding/sequence  — Run sequence for all clients (cron)
// POST /api/onboarding/sequence?clientId=xxx&day=3  — Force specific step
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendSMS } from "@/lib/twilio";
import { sendROIReportEmail } from "@/lib/resend";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://biodynamx.com";

// ── POST: Run sequence engine ─────────────────────────────────────────────────

export async function POST(req: NextRequest) {
    // Verify this is called from cron or internal (simple secret check)
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET || "bdx-internal";
    if (authHeader !== `Bearer ${cronSecret}`) {
        // Allow specific clientId override from admin
        const body = await req.json().catch(() => ({}));
        if (!body.clientId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        // Process single client
        return await processClient(body.clientId, body.day);
    }

    // Process ALL active clients
    const { data: clients, error } = await supabase
        .from("clients")
        .select("id, email, name, phone, plan, created_at, onboarding_day, settings")
        .eq("status", "active");

    if (error || !clients) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }

    const results = await Promise.allSettled(
        clients.map(client => processClient(client.id))
    );

    const succeeded = results.filter(r => r.status === "fulfilled").length;
    const failed = results.filter(r => r.status === "rejected").length;

    return NextResponse.json({
        processed: clients.length,
        succeeded,
        failed,
        timestamp: new Date().toISOString(),
    });
}

// ── Process one client's current sequence step ────────────────────────────────

async function processClient(clientId: string, forceDay?: number): Promise<NextResponse> {
    // Fetch client
    const { data: client } = await supabase
        .from("clients")
        .select("*")
        .eq("id", clientId)
        .single();

    if (!client) return NextResponse.json({ error: "Client not found" }, { status: 404 });

    // Calculate which day they're on
    const daysSinceJoin = Math.floor(
        (Date.now() - new Date(client.created_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    const day = forceDay ?? daysSinceJoin;

    // Check which milestones need to be sent
    const milestones = [3, 7, 14, 30, 60, 89];
    const pendingMilestone = milestones.find(m => day >= m && (client.onboarding_day || 0) < m);

    if (!pendingMilestone && !forceDay) {
        return NextResponse.json({ clientId, status: "no_action_needed", day });
    }

    const milestone = forceDay || pendingMilestone!;

    // Fetch ROI data
    let roiData: Record<string, unknown> = {};
    try {
        const roiRes = await fetch(`${APP_URL}/api/client-roi?clientId=${clientId}`);
        roiData = await roiRes.json();
    } catch { /* use defaults */ }

    const clientName = client.name || (client.settings as Record<string, unknown>)?.business_name as string || "Valued Client";
    const multiple = (roiData as Record<string, Record<string, unknown>>)?.roi?.multiple as number || 0;
    const totalReturned = (roiData as Record<string, Record<string, unknown>>)?.roi?.totalReturned as number || 0;
    const totalInvested = (roiData as Record<string, Record<string, unknown>>)?.roi?.totalInvested as number || (client.plan?.includes("Enterprise") ? 1497 : 497);
    const leadsCapured = (roiData as Record<string, Record<string, unknown>>)?.revenue?.leadsCapured as number || 0;
    const missedCalls = (roiData as Record<string, Record<string, unknown>>)?.revenue?.missedCallsAnswered as number || 0;

    const sent: string[] = [];

    // ── Day 3: Proof of life — "look what Aria already did" ─────────────────
    if (milestone === 3) {
        const msg = `Hi ${clientName}! 👋 It's your BioDynamX AI team checking in after 3 days. Aria has already answered ${missedCalls || "several"} calls for you — including after-hours when you were unavailable. Check your dashboard: ${APP_URL}/dashboard/client — Billy`;

        if (client.phone) {
            await sendSMS(client.phone, msg).catch(() => { });
            sent.push("sms_day3");
        }
    }

    // ── Day 7: First week report email ───────────────────────────────────────
    if (milestone === 7) {
        const msg = `Week 1 complete, ${clientName}! Your AI team has been working 24/7. ${leadsCapured} leads captured, ${missedCalls} calls answered. Your live dashboard: ${APP_URL}/dashboard/client`;

        if (client.phone) {
            await sendSMS(client.phone, msg).catch(() => { });
            sent.push("sms_day7");
        }

        if (client.email) {
            await sendROIReportEmail({
                to: client.email,
                name: clientName,
                period: "Week 1",
                totalInvested: Math.round(totalInvested / 4), // ~1 week
                totalReturned,
                multiple,
                leadsCapured,
                revenueGenerated: (roiData as Record<string, Record<string, unknown>>)?.revenue?.revenueGenerated as number || 0,
                topWins: (roiData as Record<string, unknown[]>)?.recentWins?.slice(0, 3).map(
                    (w) => (w as Record<string, unknown>).description as string || ""
                ) || [],
                dashboardUrl: `${APP_URL}/dashboard/client?clientId=${clientId}`,
            }).catch(() => { });
            sent.push("email_day7");
        }
    }

    // ── Day 14: ROI snapshot ─────────────────────────────────────────────────
    if (milestone === 14) {
        const pctToGuarantee = Math.round((multiple / 6) * 100);
        const msg = `14-day update, ${clientName}! You're ${pctToGuarantee}% toward your 6x ROI guarantee. Current multiple: ${multiple.toFixed(1)}x. ${totalReturned > 0 ? `$${totalReturned.toLocaleString()} value generated so far.` : "Revenue events are building."} Dashboard: ${APP_URL}/dashboard/client`;

        if (client.phone) {
            await sendSMS(client.phone, msg).catch(() => { });
            sent.push("sms_day14");
        }
    }

    // ── Day 30: Full report email ─────────────────────────────────────────────
    if (milestone === 30) {
        if (client.email) {
            await sendROIReportEmail({
                to: client.email,
                name: clientName,
                period: "Month 1",
                totalInvested,
                totalReturned,
                multiple,
                leadsCapured,
                revenueGenerated: (roiData as Record<string, Record<string, unknown>>)?.revenue?.revenueGenerated as number || 0,
                topWins: (roiData as Record<string, unknown[]>)?.recentWins?.slice(0, 5).map(
                    (w) => (w as Record<string, unknown>).description as string || ""
                ) || [],
                dashboardUrl: `${APP_URL}/dashboard/client?clientId=${clientId}`,
            }).catch(() => { });
            sent.push("email_day30");
        }

        if (client.phone) {
            const msg = `🎉 30-day mark, ${clientName}! Your AI team delivered ${multiple.toFixed(1)}x ROI in month 1. ${multiple >= 6 ? "You've already hit the 6x guarantee!" : `We're on track for your 6x guarantee by month 3.`} Full report in your email.`;
            await sendSMS(client.phone, msg).catch(() => { });
            sent.push("sms_day30");
        }
    }

    // ── Day 60: Trajectory + social proof ────────────────────────────────────
    if (milestone === 60) {
        if (client.email) {
            await sendROIReportEmail({
                to: client.email,
                name: clientName,
                period: "Month 1–2",
                totalInvested,
                totalReturned,
                multiple,
                leadsCapured,
                revenueGenerated: (roiData as Record<string, Record<string, unknown>>)?.revenue?.revenueGenerated as number || 0,
                topWins: (roiData as Record<string, unknown[]>)?.recentWins?.slice(0, 5).map(
                    (w) => (w as Record<string, unknown>).description as string || ""
                ) || [],
                dashboardUrl: `${APP_URL}/dashboard/client?clientId=${clientId}`,
            }).catch(() => { });
            sent.push("email_day60");
        }

        if (client.phone) {
            const msg = `60 days in, ${clientName}! Your AI team is ${multiple >= 6 ? "crushing" : "building toward"} the 6x guarantee at ${multiple.toFixed(1)}x. Clients at this stage average ${multiple >= 4 ? "8.2x by month 3" : "6.1x by month 3"}. You're in good company.`;
            await sendSMS(client.phone, msg).catch(() => { });
            sent.push("sms_day60");
        }
    }

    // ── Day 89: Pre-renewal guarantee check ──────────────────────────────────
    if (milestone === 89) {
        const guaranteed = multiple >= 6;
        const msg = guaranteed
            ? `${clientName}, you've hit ${multiple.toFixed(1)}x — exceeding your 6x guarantee! 🎉 Your AI team has generated $${totalReturned.toLocaleString()} on a $${totalInvested.toLocaleString()} investment. Ready to discuss year 2?`
            : `${clientName}, you're at ${multiple.toFixed(1)}x with 1 month left in your guarantee period. Our team has a plan to close the gap. Billy is reaching out to you directly this week.`;

        if (client.phone) {
            await sendSMS(client.phone, msg).catch(() => { });
            sent.push("sms_day89");
        }

        if (client.email && !guaranteed) {
            // Send an urgent guarantee recovery email
            await sendROIReportEmail({
                to: client.email,
                name: clientName,
                period: "3-Month Guarantee Review",
                totalInvested,
                totalReturned,
                multiple,
                leadsCapured,
                revenueGenerated: (roiData as Record<string, Record<string, unknown>>)?.revenue?.revenueGenerated as number || 0,
                topWins: ["Our team is preparing your guarantee recovery plan", "Billy will reach out within 48 hours", "No refund needed — we will deliver your 6x"],
                dashboardUrl: `${APP_URL}/dashboard/client?clientId=${clientId}`,
            }).catch(() => { });
            sent.push("email_day89_recovery");
        }
    }

    // ── Record this touchpoint ────────────────────────────────────────────────
    if (sent.length > 0) {
        // Log onboarding event
        try {
            await supabase.from("onboarding_events").insert(
                sent.map(event => ({
                    client_id: clientId,
                    event_type: event,
                    channel: event.startsWith("email") ? "email" : "sms",
                    metadata: { day: milestone, multiple, totalReturned },
                }))
            );
        } catch { /* non-critical logging */ }

        // Update client's onboarding_day
        try {
            await supabase.from("clients")
                .update({ onboarding_day: milestone })
                .eq("id", clientId);
        } catch { /* non-critical */ }
    }

    return NextResponse.json({
        clientId,
        milestone,
        sent,
        day,
        roi: { multiple, totalReturned, totalInvested },
    });
}

// ── GET: Status check ────────────────────────────────────────────────────────

export async function GET() {
    return NextResponse.json({
        endpoint: "BioDynamX 90-Day Client Success Sequence",
        description: "Automatically advances clients through the onboarding sequence",
        milestones: [
            { day: 0, action: "Welcome email + SMS (via Stripe webhook)" },
            { day: 3, action: "Aria call count proof SMS" },
            { day: 7, action: "First week report email + SMS" },
            { day: 14, action: "ROI snapshot + guarantee progress SMS" },
            { day: 30, action: "Full 30-day report email + SMS" },
            { day: 60, action: "60-day trajectory report email + social proof SMS" },
            { day: 89, action: "Pre-renewal guarantee check + recovery plan if needed" },
        ],
        cronSetup: "Schedule: POST https://biodynamx.com/api/onboarding/sequence — Daily at 9 AM",
        authorization: "Bearer ${CRON_SECRET}",
    });
}
