// ═══════════════════════════════════════════════════════════════════════════
// /api/voice/stream — Twilio Media Stream Bridge (HTTP Signaling)
// ═══════════════════════════════════════════════════════════════════════════
// NOTE: Next.js App Router on Firebase Hosting is serverless — it cannot
// maintain a persistent WebSocket connection for Twilio Media Streams.
//
// The WebSocket bridge lives on the Pipecat Cloud Run server:
//   wss://jenny-pipecat-uc4oqbsooa-uc.a.run.app/voice-stream
//
// This route handles signaling only — it responds to Twilio's status
// callbacks and passes call metadata to the Pipecat bridge.
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";

const PIPECAT_SERVER = process.env.NEXT_PUBLIC_PIPECAT_SERVER_URL || "https://jenny-pipecat-uc4oqbsooa-uc.a.run.app";

export async function POST(req: NextRequest) {
    const body = await req.formData().catch(() => new FormData());
    const callSid = (body.get("CallSid") as string) || "";
    const caller = (body.get("From") as string) || "";
    const event = (body.get("StreamEvent") as string) || "connected";

    console.log(`[VoiceStream] 📡 Status event: ${event} | SID: ${callSid} | From: ${caller}`);

    // Forward to Pipecat for logging/session management
    try {
        await fetch(`${PIPECAT_SERVER}/stream-event`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ callSid, caller, event }),
        });
    } catch {
        // Non-blocking — don't fail the Twilio request
    }

    return new NextResponse("OK", { status: 200 });
}
