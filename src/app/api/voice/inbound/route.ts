// ═══════════════════════════════════════════════════════════════════════════
// /api/voice/inbound — Twilio Inbound Call Webhook (Aria Live)
// ═══════════════════════════════════════════════════════════════════════════
// Configure your Twilio phone number webhook to POST here.
// When a client's customer calls → Aria answers → qualifies → captures lead.
//
// Twilio Dashboard → Phone Numbers → Your Number → Voice Webhook:
//   POST https://biodynamx.com/api/voice/inbound
//
// Flow:
//   1. Caller dials business number
//   2. Aria greets + discloses recording
//   3. Gather speech for 8 seconds (what they need)
//   4. POST to /api/voice/respond for AI response ← Aria's dynamic brain
//   5. After call: Twilio posts to /api/voice/status with full transcript
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://biodynamx.com";
const ARIA_VOICE = "Polly.Joanna"; // Warm, professional female voice

// ── Inbound call handler ───────────────────────────────────────────────────────
// Twilio calls this when a customer dials. Returns TwiML.

export async function POST(req: NextRequest) {
    const body = await req.formData().catch(() => new FormData());

    const callerNumber = body.get("From") as string || "Unknown";
    const clientNumber = body.get("To") as string || ""; // the business's number
    const callSid = body.get("CallSid") as string || "";
    const callerCity = body.get("CallerCity") as string || "";
    const callerState = body.get("CallerState") as string || "";

    console.log(`[Aria INBOUND] 📞 Call from ${callerNumber} → ${clientNumber} (SID: ${callSid})`);

    // Look up which client owns this Twilio number
    // (In production, query Supabase: SELECT * FROM clients WHERE twilio_number = clientNumber)
    // For now, pull from env or use generic Aria greeting

    const greeting = `Hello! Thanks for calling. This is Aria, your AI assistant. 
Just so you know, this call may be recorded for quality purposes. 
I'm here 24 hours a day to help you. How can I help you today?`;

    // Build TwiML — Gather speech, then POST to our AI responder
    const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${ARIA_VOICE}" language="en-US">${escapeXml(greeting)}</Say>
  <Pause length="0.5"/>
  <Gather 
    input="speech" 
    timeout="8" 
    speechTimeout="2"
    action="${APP_URL}/api/voice/respond?callSid=${callSid}&amp;caller=${encodeURIComponent(callerNumber)}&amp;clientNum=${encodeURIComponent(clientNumber)}&amp;city=${encodeURIComponent(callerCity)}"
    method="POST"
  >
    <Say voice="${ARIA_VOICE}">I'm ready to help whenever you are.</Say>
  </Gather>
  <Say voice="${ARIA_VOICE}">I didn't catch that. Let me connect you. One moment please.</Say>
  <Redirect method="POST">${APP_URL}/api/voice/respond?callSid=${callSid}&amp;caller=${encodeURIComponent(callerNumber)}&amp;noSpeech=true</Redirect>
</Response>`;

    return new NextResponse(twiml, {
        status: 200,
        headers: { "Content-Type": "text/xml" },
    });
}

function escapeXml(str: string): string {
    return str
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;");
}
