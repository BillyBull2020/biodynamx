// ════════════════════════════════════════════════════════════════
// /api/bot/events — SSE Proxy from Pipecat → Browser
// ════════════════════════════════════════════════════════════════
// Cloud Run SSE doesn't survive directly browser→Cloud Run because:
//   1. Cloud Run times out streaming responses at 60s
//   2. CORS restrictions on Cloud Run origin
//   3. Firebase Functions handle long-lived streams correctly
//
// This route proxies the SSE from the Pipecat server to the browser
// through Firebase, keeping the connection alive indefinitely.
// ════════════════════════════════════════════════════════════════

import { NextRequest } from "next/server";

const PIPECAT_SERVER_URL = process.env.PIPECAT_SERVER_URL || "http://localhost:8080";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
    const sessionId = req.nextUrl.searchParams.get("session_id");
    if (!sessionId) {
        return new Response("Missing session_id", { status: 400 });
    }

    // Open SSE stream from the Pipecat server
    const upstream = await fetch(`${PIPECAT_SERVER_URL}/visual-events/${sessionId}`, {
        headers: { Accept: "text/event-stream" },
    });

    if (!upstream.ok || !upstream.body) {
        return new Response("Failed to connect to bot server", { status: 502 });
    }

    // Forward the stream to the browser
    const { readable, writable } = new TransformStream();
    upstream.body.pipeTo(writable).catch(() => {
        // Upstream closed — that's normal when session ends
    });

    return new Response(readable, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
            Connection: "keep-alive",
            "Access-Control-Allow-Origin": "*",
        },
    });
}
