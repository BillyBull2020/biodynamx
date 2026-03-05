// ═══════════════════════════════════════════════════════════════════════════
// /api/voice/inbound — Twilio Inbound Call → Gemini Live via Pipecat
// ═══════════════════════════════════════════════════════════════════════════
// Twilio Dashboard → Phone Numbers → Your Number → Voice & Fax:
//   Webhook (POST): https://biodynamx.com/api/voice/inbound
//
// Architecture:
//   Caller → Twilio → (TwiML Stream) → Pipecat Cloud Run (WebSocket)
//                                    ↕ bidirectional audio
//                              Gemini Live 2.5 Flash Native Audio (Jenny)
//
// Why Pipecat for the WebSocket?
//   Next.js on Firebase Hosting is serverless — connections are stateless.
//   Twilio Media Streams require a PERSISTENT WebSocket. Pipecat runs on
//   Cloud Run which maintains long-lived connections.
//
// Pipecat server: https://jenny-pipecat-uc4oqbsooa-uc.a.run.app
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://biodynamx.com";
const PIPECAT_URL = process.env.NEXT_PUBLIC_PIPECAT_SERVER_URL || "https://jenny-pipecat-uc4oqbsooa-uc.a.run.app";

// Convert https:// → wss:// for WebSocket
const PIPECAT_WS = PIPECAT_URL.replace(/^https?:\/\//, "wss://");

export async function POST(req: NextRequest) {
  const body = await req.formData().catch(() => new FormData());

  const callerNumber = (body.get("From") as string) || "Unknown";
  const clientNumber = (body.get("To") as string) || "";
  const callSid = (body.get("CallSid") as string) || "";
  const callerCity = (body.get("CallerCity") as string) || "";
  const callerState = (body.get("CallerState") as string) || "";

  console.log(`[Jenny INBOUND] 📞 ${callerNumber} → ${clientNumber} | SID: ${callSid} | ${callerCity} ${callerState}`);

  // Pipecat WebSocket URL — carries call context so Jenny knows who's calling
  const streamUrl = `${PIPECAT_WS}/voice-stream?callSid=${callSid}&caller=${encodeURIComponent(callerNumber)}&city=${encodeURIComponent(callerCity)}&state=${encodeURIComponent(callerState)}&agent=jenny`;

  // Status callback URL — fires on call end for post-call automation
  const statusUrl = `${APP_URL}/api/voice/status?callSid=${callSid}`;

  // TwiML: Connect audio stream immediately to Pipecat/Gemini Live
  // No greeting needed — Jenny speaks first through the stream
  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Connect>
    <Stream url="${streamUrl}">
      <Parameter name="callSid" value="${callSid}" />
      <Parameter name="caller" value="${callerNumber}" />
      <Parameter name="city" value="${callerCity}" />
    </Stream>
  </Connect>
  <Say voice="Google.en-US-Neural2-F">If you are still connected, please hold while we reconnect you.</Say>
  <Redirect method="POST">${APP_URL}/api/voice/inbound</Redirect>
</Response>`;

  return new NextResponse(twiml, {
    status: 200,
    headers: {
      "Content-Type": "text/xml",
      "Cache-Control": "no-store",
    },
  });
}
