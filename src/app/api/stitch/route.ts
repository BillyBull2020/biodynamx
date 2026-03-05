// ============================================================================
// /api/stitch — Jules AI Architecture Engine
// ============================================================================
// Creates Jules sessions to implement designs, fix audit findings, or deploy
// full BioDynamX stacks for clients.
//
// POST /api/stitch — Create a new Jules session
//   { prompt, sessionId, taskType?, clientName?, clientDomain?, auditData? }
//
// GET /api/stitch — Health check + list recent sessions
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import {
    getJulesClient,
    createBioDynamXSession,
    JulesSession,
} from "@/lib/jules-api";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            prompt,
            taskType = "design_implement",
            clientName = "Prospect",
            clientDomain,
            auditData,
            sourceResourceName,
        } = body;

        const client = getJulesClient();

        if (!client) {
            console.warn("[Stitch API] ⚠️ No Jules API key. Returning graceful fallback.");
            return NextResponse.json({
                success: true,
                simulated: true,
                previewUrl: "https://jules.google.com",
                message:
                    "Jules is initializing. Connect your Jules API key to enable autonomous architecture sessions.",
            });
        }

        // ── Strategy: Use BioDynamX session templates for structured tasks,
        //    or raw Jules sessions for ad-hoc design prompts. ──────────────

        let session: JulesSession | null = null;

        if (clientDomain || auditData) {
            // Structured deployment — uses our BioDynamX templates
            session = await createBioDynamXSession({
                clientName,
                clientDomain: clientDomain || "unknown.com",
                auditData,
                taskType,
                customPrompt: prompt,
                sourceResourceName,
            });
        } else {
            // Ad-hoc design prompt (from voice agent "stitch_design" tool)
            session = await client.createSession({
                prompt: `## BioDynamX Design Request

Create a high-fidelity, conversion-optimized design based on this request:

${prompt}

Apply BioDynamX persuasive design principles:
- Neurobiology of Choice frameworks (loss aversion, scarcity, social proof)
- Dark premium aesthetic with green (#00ff41) accent system
- Mobile-first responsive design
- Clear CTAs with friction reducers
- Schema.org structured data for SEO/AEO/GEO`,
                title: `Stitch Design — ${prompt.slice(0, 60)}`,
            });
        }

        if (!session) {
            return NextResponse.json({
                success: false,
                message:
                    "Jules session creation failed. The AI architect will retry automatically.",
            }, { status: 503 });
        }

        const sessionId = session.name?.replace("sessions/", "") || "";
        const julesUrl = `https://jules.google.com/session/${sessionId}`;

        console.log(`[Stitch API] ✅ Jules session live: ${julesUrl}`);

        return NextResponse.json({
            success: true,
            sessionId: session.name,
            previewUrl: julesUrl,
            state: session.state,
            title: session.title,
            message: `Jules is now working on your project. Session: ${session.title}`,
        });
    } catch (err) {
        console.error("[Stitch API] Fatal Error:", err);
        return NextResponse.json(
            {
                success: false,
                message: `Jules engine error: ${err instanceof Error ? err.message : String(err)}`,
            },
            { status: 500 }
        );
    }
}

// ── GET: Health check + recent sessions ─────────────────────────────────────

export async function GET() {
    const client = getJulesClient();

    if (!client) {
        return NextResponse.json({
            service: "BioDynamX Stitch / Jules Engine",
            status: "no_api_key",
            message:
                "Jules API key not configured. Set STITCH_API_KEY or JULES_API_KEY in .env.local",
            endpoints: {
                post: "POST /api/stitch — Create a new Jules session",
                get: "GET /api/stitch — Health check + recent sessions",
            },
        });
    }

    try {
        // Run health check
        const health = await client.healthCheck();

        // List recent sessions
        let recentSessions: { name: string; title: string; state: string; url: string }[] = [];
        try {
            const { items } = await client.listSessions(5);
            recentSessions = items.map((s) => ({
                name: s.name,
                title: s.title,
                state: s.state,
                url: `https://jules.google.com/session/${s.name?.replace("sessions/", "")}`,
            }));
        } catch {
            // Listing might fail on some plans — that's OK
        }

        // List connected sources
        let sources: { name: string; displayName: string; repositoryUrl: string }[] = [];
        try {
            const rawSources = await client.listSources();
            sources = rawSources.map((s) => ({
                name: s.name,
                displayName: s.displayName,
                repositoryUrl: s.repositoryUrl,
            }));
        } catch {
            // Sources listing might fail — OK
        }

        return NextResponse.json({
            service: "BioDynamX Stitch / Jules Engine",
            status: health.healthy ? "online" : "degraded",
            health: health.message,
            sources,
            recentSessions,
            capabilities: [
                "full_deployment — Deploy complete BioDynamX AI stack",
                "audit_fix — Fix audit findings automatically",
                "design_implement — Create conversion-optimized designs",
                "jules_qa_inspection — Final QA gate before going live",
                "custom — Any development task",
            ],
        });
    } catch (err) {
        return NextResponse.json(
            {
                service: "BioDynamX Stitch / Jules Engine",
                status: "error",
                message: `Health check failed: ${err instanceof Error ? err.message : String(err)}`,
            },
            { status: 500 }
        );
    }
}
