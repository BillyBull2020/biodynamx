// ============================================================================
// /api/twilio/missed-call — Missed Call Text-Back (THE KILLER QUICK WIN)
// ============================================================================
// "62% of incoming calls to small businesses go unanswered."
// This webhook fires when a call goes to voicemail or no-answer.
// It immediately texts the caller back + captures them as a lead.
//
// Twilio Configuration:
//   Phone Number → Voice → "When a call comes in" → Webhook → /api/twilio/missed-call
//   Or: Use Twilio Studio flow with "no-answer" → POST to this URL
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { createLead, logNurtureEvent } from "@/lib/supabase";
import { sendSMS } from "@/lib/twilio";
import { sendLeadAlert } from "@/lib/lead-alerts";

// ── Missed Call Text Templates ─────────────────────────────────────────────
const MISSED_CALL_TEXTS = {
    // Primary: Friendly, immediate, action-oriented
    primary: (businessName: string) =>
        `Hey! 👋 Sorry we missed your call to ${businessName}. How can we help? Reply here or book a quick call: https://biodynamx.com — we respond in under 60 seconds.`,

    // After hours variant
    afterHours: (businessName: string) =>
        `Thanks for calling ${businessName}! 🌙 We're currently closed but your message is important to us. Reply here and we'll get back to you first thing in the morning, or visit https://biodynamx.com for instant AI assistance.`,

    // Repeat caller (called before)
    repeat: (businessName: string) =>
        `Hey again! We see you tried reaching ${businessName}. We want to make sure you get help — reply here with your question and we'll prioritize your response. 🚀`,
};

export async function POST(req: NextRequest) {
    try {
        // Twilio sends form-encoded data for voice webhooks
        const formData = await req.formData();

        const callSid = formData.get("CallSid") as string;
        const callerPhone = formData.get("From") as string;
        const calledNumber = formData.get("To") as string;
        const callStatus = formData.get("CallStatus") as string;
        const direction = formData.get("Direction") as string;
        const callerCity = formData.get("FromCity") as string;
        const callerState = formData.get("FromState") as string;
        const callerCountry = formData.get("FromCountry") as string;

        console.log(`📞 Missed call detected: ${callerPhone} → ${calledNumber} (Status: ${callStatus})`);

        // Only process missed/no-answer/busy calls
        const missedStatuses = ["no-answer", "busy", "failed", "canceled"];
        if (!missedStatuses.includes(callStatus) && callStatus !== "completed") {
            // If it's a ringing or in-progress call, return TwiML to keep ringing
            return new NextResponse(
                `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Ring duration="20"/>
  <Say>We're sorry, all agents are currently busy. You'll receive a text message shortly with options to reach us.</Say>
</Response>`,
                { headers: { "Content-Type": "application/xml" } }
            );
        }

        // ── Step 1: Determine time-based template ──────────────────
        const hour = new Date().getHours();
        const isAfterHours = hour < 8 || hour >= 18; // Before 8am or after 6pm
        const businessName = process.env.BUSINESS_NAME || "BioDynamX";

        // ── Step 2: Send immediate text-back ──────────────────────
        if (callerPhone && callerPhone !== "anonymous") {
            const smsBody = isAfterHours
                ? MISSED_CALL_TEXTS.afterHours(businessName)
                : MISSED_CALL_TEXTS.primary(businessName);

            const smsResult = await sendSMS(callerPhone, smsBody);

            console.log(`📱 Text-back sent to ${callerPhone}: ${smsResult.success ? "✅" : "❌"}`);

            // ── Step 3: Capture as lead ────────────────────────────
            const location = [callerCity, callerState, callerCountry].filter(Boolean).join(", ");

            const { data: lead } = await createLead({
                email: "", // No email yet — will capture via SMS conversation
                phone: callerPhone,
                name: undefined,
                business_url: undefined,
                business_type: undefined,
                source: "voice_diagnostic",
                audit_grade: undefined,
                audit_score: undefined,
                monthly_leak: undefined,
                annual_leak: undefined,
                nurture_stage: "captured",
                nurture_sequence_step: 0,
                metadata: {
                    call_sid: callSid,
                    call_status: callStatus,
                    direction,
                    location,
                    is_after_hours: isAfterHours,
                    captured_via: "missed_call_textback",
                },
            });

            // ── Step 4: Log the nurture event ────────────────────
            await logNurtureEvent({
                lead_id: lead?.id || `missed_${Date.now()}`,
                event_type: "sms",
                status: smsResult.success ? "sent" : "failed",
                content: smsBody,
                scheduled_at: new Date().toISOString(),
                sent_at: new Date().toISOString(),
                metadata: {
                    trigger: "missed_call_textback",
                    call_sid: callSid,
                    sms_sid: smsResult.sid,
                },
            });

            // ── Step 5: Alert business owner ─────────────────────
            sendLeadAlert({
                phone: callerPhone,
                source: "missed_call",
                urgency: "hot",
            }).catch(err => console.error("[Missed Call] Alert failed:", err));
        }

        // ── Step 5: Return confirmation ────────────────────────
        // Twilio expects TwiML response for voice webhooks
        return new NextResponse(
            `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna">
    We're sorry we couldn't answer your call. We've sent you a text message with ways to reach us. Have a great day!
  </Say>
</Response>`,
            { headers: { "Content-Type": "application/xml" } }
        );
    } catch (err) {
        console.error("❌ Missed call handler error:", err);
        return new NextResponse(
            `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say>We're experiencing technical difficulties. Please try again later.</Say>
</Response>`,
            { headers: { "Content-Type": "application/xml" } }
        );
    }
}

// ── GET handler for Twilio validation ──────────────────────────────────────
export async function GET() {
    return NextResponse.json({
        service: "BioDynamX Missed Call Text-Back",
        status: "active",
        description: "Automatically texts back missed callers and captures them as leads",
        stat: "62% of calls to small businesses go unanswered — we fix that.",
    });
}
