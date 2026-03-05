// ════════════════════════════════════════════════════════════════
// /api/bot/start — Proxy to Pipecat Bot Server
// ════════════════════════════════════════════════════════════════
// Keeps PIPECAT_SERVER_URL server-side only.
// The browser never sees the Python server URL or any AI keys.
// ════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";

const PIPECAT_SERVER_URL =
    process.env.NEXT_PUBLIC_PIPECAT_SERVER_URL ||
    process.env.PIPECAT_SERVER_URL ||
    "https://jenny-pipecat-uc4oqbsooa-uc.a.run.app";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { agent = "Jenny", industry = "", session_id, handoff_context } = body;

        const resp = await fetch(`${PIPECAT_SERVER_URL}/start-bot`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ agent, industry, session_id, handoff_context }),
        });

        if (!resp.ok) {
            const error = await resp.text();
            console.error("[/api/bot/start] Pipecat server error:", error);
            return NextResponse.json({ error: "Bot server error", detail: error }, { status: 502 });
        }

        const data = await resp.json();

        // Return the room details + server URL for SSE connection
        return NextResponse.json({
            room_url: data.room_url,
            token: data.token,
            session_id: data.session_id,
            agent: data.agent,
            // The SSE endpoint the browser connects to directly (CORS-allowed)
            sse_url: `${PIPECAT_SERVER_URL}/visual-events/${data.session_id}`,
        });
    } catch (err: any) {
        console.error("[/api/bot/start] Error:", err);
        return NextResponse.json(
            { error: "Failed to start bot", detail: err?.message || "Unknown error" },
            { status: 500 }
        );
    }
}

export async function GET() {
    return NextResponse.json({ status: "ok", endpoint: "/api/bot/start" });
}
