// ============================================================================
// /api/jules — Direct Jules API Proxy
// ============================================================================
// Exposes Jules session management directly for the portal and dashboard.
//
// GET  /api/jules                    — Health check
// GET  /api/jules?action=sessions    — List sessions
// GET  /api/jules?action=sources     — List connected repos
// GET  /api/jules?action=activities&sessionId=xxx — List activities
// POST /api/jules                    — Create session or send message
//   { action: "create_session", prompt, title?, sourceResourceName? }
//   { action: "send_message", sessionId, message }
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { getJulesClient } from "@/lib/jules-api";

export async function GET(req: NextRequest) {
    const client = getJulesClient();
    if (!client) {
        return NextResponse.json({
            error: "Jules API key not configured",
            fix: "Set STITCH_API_KEY or JULES_API_KEY in .env.local",
        }, { status: 503 });
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "health";

    try {
        switch (action) {
            case "health": {
                const health = await client.healthCheck();
                return NextResponse.json(health);
            }

            case "sessions": {
                const pageSize = parseInt(url.searchParams.get("pageSize") || "10");
                const pageToken = url.searchParams.get("pageToken") || undefined;
                const result = await client.listSessions(pageSize, pageToken);
                return NextResponse.json({
                    sessions: result.items.map(s => ({
                        ...s,
                        url: `https://jules.google.com/session/${s.name?.replace("sessions/", "")}`,
                    })),
                    nextPageToken: result.nextPageToken,
                });
            }

            case "sources": {
                const sources = await client.listSources();
                return NextResponse.json({ sources });
            }

            case "activities": {
                const sessionId = url.searchParams.get("sessionId");
                if (!sessionId) {
                    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
                }
                const activities = await client.listActivities(sessionId);
                return NextResponse.json({ activities });
            }

            case "session": {
                const sessionId = url.searchParams.get("sessionId");
                if (!sessionId) {
                    return NextResponse.json({ error: "sessionId required" }, { status: 400 });
                }
                const session = await client.getSession(sessionId);
                return NextResponse.json({
                    ...session,
                    url: `https://jules.google.com/session/${session.name?.replace("sessions/", "")}`,
                });
            }

            default:
                return NextResponse.json({
                    error: `Unknown action: ${action}`,
                    available: ["health", "sessions", "sources", "activities", "session"],
                }, { status: 400 });
        }
    } catch (err) {
        return NextResponse.json({
            error: err instanceof Error ? err.message : String(err),
        }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    const client = getJulesClient();
    if (!client) {
        return NextResponse.json({
            error: "Jules API key not configured",
        }, { status: 503 });
    }

    try {
        const body = await req.json();
        const { action } = body;

        switch (action) {
            case "create_session": {
                const { prompt, title, sourceResourceName, automationMode } = body;
                if (!prompt) {
                    return NextResponse.json({ error: "prompt required" }, { status: 400 });
                }

                const sessionParams: {
                    prompt: string;
                    title?: string;
                    sourceContext?: { source: string };
                    automationMode?: "AUTO_CREATE_PR" | "MANUAL";
                } = { prompt };

                if (title) sessionParams.title = title;
                if (sourceResourceName) {
                    sessionParams.sourceContext = { source: sourceResourceName };
                    sessionParams.automationMode = automationMode || "AUTO_CREATE_PR";
                }

                const session = await client.createSession(sessionParams);
                return NextResponse.json({
                    success: true,
                    session: {
                        ...session,
                        url: `https://jules.google.com/session/${session.name?.replace("sessions/", "")}`,
                    },
                });
            }

            case "send_message": {
                const { sessionId, message } = body;
                if (!sessionId || !message) {
                    return NextResponse.json({ error: "sessionId and message required" }, { status: 400 });
                }
                const activity = await client.sendMessage(sessionId, message);
                return NextResponse.json({ success: true, activity });
            }

            default:
                return NextResponse.json({
                    error: `Unknown action: ${action}`,
                    available: ["create_session", "send_message"],
                }, { status: 400 });
        }
    } catch (err) {
        return NextResponse.json({
            error: err instanceof Error ? err.message : String(err),
        }, { status: 500 });
    }
}
