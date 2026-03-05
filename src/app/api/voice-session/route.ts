// ════════════════════════════════════════════════════════════════
// /api/voice-session/route.ts — Daily + Pipecat Session Broker
// ════════════════════════════════════════════════════════════════
// The frontend calls this to start a voice session.
// It forwards the request to the Pipecat bot server which creates
// the Daily room and spins up Jenny or Mark.

import { NextRequest, NextResponse } from "next/server";

const PIPECAT_SERVER_URL = process.env.PIPECAT_SERVER_URL || "http://localhost:8080";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { agent = "Jenny", industry = "", sessionId } = body;

        const resp = await fetch(`${PIPECAT_SERVER_URL}/start-bot`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ agent, industry, session_id: sessionId }),
        });

        if (!resp.ok) {
            const error = await resp.text();
            console.error("[voice-session] Pipecat server error:", error);
            return NextResponse.json({ error: "Failed to start voice session" }, { status: 500 });
        }

        const data = await resp.json();

        // Returns: { room_url, token, session_id, agent }
        return NextResponse.json({
            roomUrl: data.room_url,
            token: data.token,
            sessionId: data.session_id,
            agent: data.agent,
        });
    } catch (err) {
        console.error("[voice-session] Error:", err);
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
