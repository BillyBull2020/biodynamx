// ============================================================================
// /api/nurture/run — Nurture Sequence Runner
// ============================================================================
// Executes the next step in each lead's nurture sequence.
// Called by a cron job (Vercel Cron, Firebase Scheduler, or manual trigger).
//
// NURTURE SEQUENCE:
// Step 1: SMS — Audit results + link (2 min after capture)        ✅ Auto-triggered
// Step 2: SMS — Follow-up "did you review?"  (24 hours)
// Step 3: CALL — Jenny follow-up call (24 hours after Step 2)
// Step 4: SMS — Case study proof (3 days after capture)
// Step 5: EMAIL — Full audit PDF + CTA (3 days)
// Step 6: SMS — Urgency/scarcity (7 days)
// Step 7: CALL — Final Jenny call (7 days)
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getLeadsForNurture, updateLeadStage, logNurtureEvent } from "@/lib/supabase";
import { sendSMS, initiateCall, NURTURE_SMS, generateJennyCallTwiml } from "@/lib/twilio";

// Step timing in milliseconds
const STEP_DELAYS: Record<number, number> = {
    1: 2 * 60 * 1000,           // 2 minutes (auto-triggered on capture)
    2: 24 * 60 * 60 * 1000,     // 24 hours
    3: 48 * 60 * 60 * 1000,     // 48 hours
    4: 3 * 24 * 60 * 60 * 1000, // 3 days
    5: 3 * 24 * 60 * 60 * 1000, // 3 days
    6: 7 * 24 * 60 * 60 * 1000, // 7 days
    7: 7 * 24 * 60 * 60 * 1000, // 7 days
};

export async function POST(req: NextRequest) {
    // Optional: Verify cron secret
    const authHeader = req.headers.get("authorization");
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { data: leads, error } = await getLeadsForNurture();

        if (error) {
            return NextResponse.json({ error: String(error) }, { status: 500 });
        }

        const results = [];
        const now = Date.now();
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://biodynamx.com";

        for (const lead of leads) {
            const nextStep = (lead.nurture_sequence_step || 0) + 1;
            const delay = STEP_DELAYS[nextStep];

            // Check if enough time has passed for next step
            if (!delay) continue; // No more steps
            const leadAge = now - new Date(lead.created_at).getTime();
            if (leadAge < delay) continue; // Not ready yet

            const firstName = lead.name?.split(" ")[0] || "there";
            let result: { action: string; success: boolean; step: number } = {
                action: "skipped",
                success: false,
                step: nextStep,
            };

            switch (nextStep) {
                case 2: {
                    // SMS: Follow-up
                    if (lead.phone) {
                        const sms = await sendSMS(lead.phone, NURTURE_SMS.followUp(firstName));
                        await logNurtureEvent({
                            lead_id: lead.id,
                            event_type: "sms",
                            status: sms.success ? "sent" : "failed",
                            content: NURTURE_SMS.followUp(firstName),
                            scheduled_at: new Date().toISOString(),
                            sent_at: new Date().toISOString(),
                            metadata: { sid: sms.sid, step: 2 },
                        });
                        result = { action: "sms_followup", success: sms.success, step: 2 };
                    }
                    break;
                }

                case 3: {
                    // CALL: Jenny follow-up
                    if (lead.phone) {
                        const twimlUrl = `${appUrl}/api/nurture/twiml?name=${encodeURIComponent(firstName)}&grade=${encodeURIComponent(lead.audit_grade || "")}`;
                        const call = await initiateCall(lead.phone, twimlUrl);
                        await logNurtureEvent({
                            lead_id: lead.id,
                            event_type: "call",
                            status: call.success ? "sent" : "failed",
                            content: `Jenny follow-up call to ${firstName}`,
                            scheduled_at: new Date().toISOString(),
                            sent_at: new Date().toISOString(),
                            metadata: { sid: call.sid, step: 3 },
                        });
                        result = { action: "call_jenny", success: call.success, step: 3 };
                    }
                    break;
                }

                case 4: {
                    // SMS: Case study
                    if (lead.phone) {
                        const sms = await sendSMS(lead.phone, NURTURE_SMS.caseStudy(firstName));
                        await logNurtureEvent({
                            lead_id: lead.id,
                            event_type: "sms",
                            status: sms.success ? "sent" : "failed",
                            content: NURTURE_SMS.caseStudy(firstName),
                            scheduled_at: new Date().toISOString(),
                            sent_at: new Date().toISOString(),
                            metadata: { sid: sms.sid, step: 4 },
                        });
                        result = { action: "sms_casestudy", success: sms.success, step: 4 };
                    }
                    break;
                }

                case 5: {
                    // EMAIL: Audit PDF (placeholder — integrate SendGrid/Resend later)
                    console.log(`📧 Email Step 5 for ${lead.email} — audit PDF delivery`);
                    await logNurtureEvent({
                        lead_id: lead.id,
                        event_type: "email",
                        status: "pending",
                        content: "Audit PDF + full report email",
                        scheduled_at: new Date().toISOString(),
                        metadata: { step: 5, template: "audit_pdf" },
                    });
                    result = { action: "email_audit_pdf", success: true, step: 5 };
                    break;
                }

                case 6: {
                    // SMS: Urgency
                    if (lead.phone) {
                        const sms = await sendSMS(lead.phone, NURTURE_SMS.urgency(firstName));
                        await logNurtureEvent({
                            lead_id: lead.id,
                            event_type: "sms",
                            status: sms.success ? "sent" : "failed",
                            content: NURTURE_SMS.urgency(firstName),
                            scheduled_at: new Date().toISOString(),
                            sent_at: new Date().toISOString(),
                            metadata: { sid: sms.sid, step: 6 },
                        });
                        result = { action: "sms_urgency", success: sms.success, step: 6 };
                    }
                    break;
                }

                case 7: {
                    // CALL: Final Jenny call
                    if (lead.phone) {
                        const twimlUrl = `${appUrl}/api/nurture/twiml?name=${encodeURIComponent(firstName)}&grade=${encodeURIComponent(lead.audit_grade || "")}&final=true`;
                        const call = await initiateCall(lead.phone, twimlUrl);
                        await logNurtureEvent({
                            lead_id: lead.id,
                            event_type: "call",
                            status: call.success ? "sent" : "failed",
                            content: `Final Jenny call to ${firstName}`,
                            scheduled_at: new Date().toISOString(),
                            sent_at: new Date().toISOString(),
                            metadata: { sid: call.sid, step: 7 },
                        });
                        result = { action: "call_final", success: call.success, step: 7 };
                        // Mark as qualified after final touch
                        await updateLeadStage(lead.id, "qualified", 7);
                    }
                    break;
                }
            }

            // Update lead to next step
            if (result.success) {
                const newStage = nextStep >= 5 ? "engaged" : "contacted";
                await updateLeadStage(lead.id, newStage, nextStep);
            }

            results.push({ leadId: lead.id, email: lead.email, ...result });
        }

        return NextResponse.json({
            success: true,
            processed: results.length,
            results,
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        console.error("Nurture runner error:", err);
        return NextResponse.json(
            { error: "Nurture sequence failed" },
            { status: 500 }
        );
    }
}
