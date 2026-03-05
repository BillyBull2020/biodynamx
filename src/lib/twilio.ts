// ============================================================================
// Twilio Integration — BioDynamX Nurture Engine
// ============================================================================
// Handles SMS, voice calls, and automated follow-ups via Twilio.
// Integrates with the Supabase lead pipeline for event logging.
// ============================================================================

import twilio from "twilio";

// ── Twilio Client ────────────────────────────────────────────────────────────
function getTwilioClient() {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;

    if (!accountSid || !authToken) {
        console.warn(
            "⚠️ Twilio not configured. Set TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN in .env.local"
        );
        return null;
    }

    return twilio(accountSid, authToken);
}

const FROM_PHONE = process.env.TWILIO_PHONE_NUMBER || "+1XXXXXXXXXX";

// ── SMS Functions ────────────────────────────────────────────────────────────

/**
 * Send an SMS message
 */
export async function sendSMS(to: string, body: string, mediaUrl?: string) {
    const client = getTwilioClient();
    if (!client) {
        console.log(`📱 SMS (Twilio offline) → ${to}: ${body.slice(0, 80)}...`);
        return { success: true, sid: `local_${Date.now()}`, offline: true };
    }

    try {
        const message = await client.messages.create({
            body,
            from: FROM_PHONE,
            to,
            mediaUrl: mediaUrl ? [mediaUrl] : undefined,
        });
        console.log(`✅ SMS sent → ${to} (SID: ${message.sid})`);
        return { success: true, sid: message.sid, offline: false };
    } catch (error) {
        console.error("❌ SMS failed:", error);
        return { success: false, sid: null, error: String(error) };
    }
}

/**
 * Initiate an outbound voice call with inline TwiML
 * Uses the `twiml` parameter so Twilio doesn't need to fetch from a public URL
 */
export async function initiateCall(to: string, twimlContent: string) {
    const client = getTwilioClient();
    if (!client) {
        console.log(`📞 Call (Twilio offline) → ${to}`);
        return { success: true, sid: `local_${Date.now()}`, offline: true };
    }

    try {
        const call = await client.calls.create({
            twiml: twimlContent,
            from: FROM_PHONE,
            to,
        });
        console.log(`✅ Call initiated → ${to} (SID: ${call.sid})`);
        return { success: true, sid: call.sid, offline: false };
    } catch (error) {
        console.error("❌ Call failed:", error);
        return { success: false, sid: null, error: String(error) };
    }
}

/**
 * Initiate an outbound call with Jenny's personalized greeting
 * Builds the TwiML inline — no external URL needed
 */
export async function initiateCallWithGreeting(
    to: string,
    prospectName: string,
    purpose: string
) {
    let greeting: string;

    switch (purpose) {
        case "demo_callback":
            greeting = `Hi ${prospectName}! This is Jenny from BioDynamX. I'm calling because you were just chatting with our AI team and wanted to experience our voice technology first-hand. Pretty cool that I can call you directly, right? This is exactly what happens for your customers too — every missed call gets answered instantly by AI. So tell me, what kind of business are you running?`;
            break;
        case "audit_walkthrough":
            greeting = `Hi ${prospectName}, this is Jenny from BioDynamX. I just finished analyzing your business audit and I found some really interesting opportunities. Your site has some revenue leaks that we can fix — I'd love to walk you through what I found. Do you have about 60 seconds?`;
            break;
        case "consultation":
            greeting = `Hey ${prospectName}! Jenny here from BioDynamX. Thanks for requesting a consultation. I specialize in helping businesses like yours recover lost revenue using AI voice agents. Before we get started, can you tell me what's your biggest challenge with handling inbound leads right now?`;
            break;
        case "follow_up":
            greeting = `Hi ${prospectName}, it's Jenny from BioDynamX following up. I know you were looking at our AI revenue recovery system, and I wanted to make sure all your questions got answered. Our partners recover an average of eighteen thousand dollars per month. Is now a good time to chat for 60 seconds?`;
            break;
        default:
            greeting = `Hi ${prospectName}! This is Jenny from BioDynamX Engineering Group. We help businesses recover revenue they didn't know they were losing using AI. I'd love to give you a free 60-second diagnostic. Is now a good time?`;
    }

    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna" language="en-US">${greeting}</Say>
  <Pause length="1"/>
  <Gather input="speech" timeout="5" speechTimeout="auto">
    <Say voice="Polly.Joanna">I'm here whenever you're ready. Just say yes to continue, or I can call back at a better time.</Say>
  </Gather>
  <Say voice="Polly.Joanna">No worries at all, ${prospectName}! You can always reach us at biodynamx.com or call us at 303-392-3700. Have an awesome day!</Say>
</Response>`;

    return initiateCall(to, twiml);
}

// ── Nurture SMS Templates ────────────────────────────────────────────────────

export const NURTURE_SMS = {
    // Step 1: Immediate after audit (2 minutes)
    auditResults: (name: string, monthlyLeak: string) =>
        `Hey ${name}! 👋 Your BioDynamX audit just found ${monthlyLeak}/mo in recoverable revenue. Jenny & Mark (our AI agents) can walk you through the fix in 60 seconds: https://biodynamx.com — Billy`,

    // Step 2: Follow-up (24 hours)
    followUp: (name: string) =>
        `${name}, did you get a chance to review your audit results? Our partners recover an average of $18k/mo. Ready to talk? Reply YES and I'll have Jenny call you. — Billy, BioDynamX`,

    // Step 3: Value add (3 days)
    caseStudy: (name: string) =>
        `${name}, thought you'd want to see this — a call center just like yours recovered $4,200/mo in 72 hours using our AI. Full case study: https://biodynamx.com/case-studies — Billy`,

    // Step 4: Urgency (7 days)
    urgency: (name: string) =>
        `Last call, ${name}. Your audit showed recoverable revenue and the longer you wait, the more you lose. Book your free AI diagnostic before this week's spots fill: https://biodynamx.com — Billy`,
};

// ── Nurture Call TwiML ───────────────────────────────────────────────────────

export function generateJennyCallTwiml(leadName: string, auditGrade?: string) {
    const greeting = auditGrade
        ? `Hi ${leadName}, this is Jenny from BioDynamX. I'm calling because we ran your business audit and found some opportunities — your grade was ${auditGrade}. I'd love to walk you through what we found and how our AI can help recover that revenue. Do you have 60 seconds?`
        : `Hi ${leadName}, this is Jenny from BioDynamX. We help businesses like yours recover lost revenue using AI. I'd love to give you a free diagnostic — it takes just 60 seconds. Is now a good time?`;

    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="Polly.Joanna" language="en-US">${greeting}</Say>
  <Gather input="speech" timeout="5" speechTimeout="auto">
    <Say voice="Polly.Joanna">Press any key or just say yes to continue.</Say>
  </Gather>
  <Say voice="Polly.Joanna">No worries! You can always reach us at biodynamx.com. Have a great day!</Say>
</Response>`;
}

