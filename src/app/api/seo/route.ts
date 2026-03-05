import { NextRequest, NextResponse } from "next/server";
import {
    getIronclawSEOAgent,
    type SEOReport,
    type ContentPiece,
    type SEOAuditResult,
} from "@/lib/seo-domination-agent";

// ═══════════════════════════════════════════════════════════════════
// /api/seo — Ironclaw SEO Domination Agent API
// ═══════════════════════════════════════════════════════════════════
// Endpoints:
//   GET  /api/seo              → Agent status + keyword summary
//   GET  /api/seo?action=audit → Run full SEO audit
//   GET  /api/seo?action=brief → Get next content brief
//   GET  /api/seo?action=report → Generate weekly report
//   GET  /api/seo?action=llms  → Generate llms.txt content
//   GET  /api/seo?action=index → Trigger IndexNow submission
//   POST /api/seo              → Custom keyword/content operations
// ═══════════════════════════════════════════════════════════════════

export async function GET(req: NextRequest) {
    const agent = getIronclawSEOAgent();
    const action = req.nextUrl.searchParams.get("action");

    switch (action) {
        case "audit": {
            const result: SEOAuditResult = agent.runFullAudit();
            return NextResponse.json({
                success: true,
                agent: agent.getAgentId(),
                audit: result,
            });
        }

        case "brief": {
            const brief = agent.getNextContentBrief();
            if (!brief) {
                return NextResponse.json({
                    success: true,
                    message: "All content pieces are published or in progress. No new briefs needed.",
                });
            }
            return NextResponse.json({
                success: true,
                agent: agent.getAgentId(),
                content: brief,
            });
        }

        case "report": {
            const report: SEOReport = agent.generateWeeklyReport();
            return NextResponse.json({
                success: true,
                agent: agent.getAgentId(),
                report,
            });
        }

        case "llms": {
            const llmsTxt = agent.generateLlmsTxt();
            return new NextResponse(llmsTxt, {
                headers: {
                    "Content-Type": "text/plain; charset=utf-8",
                },
            });
        }

        case "index": {
            const result = await agent.triggerIndexNow();
            return NextResponse.json({
                success: result.success,
                agent: agent.getAgentId(),
                submitted: result.submitted,
            });
        }

        case "keywords": {
            const keywords = agent.getKeywords();
            const categories = {
                primary: keywords.filter(k => k.category === "primary"),
                secondary: keywords.filter(k => k.category === "secondary"),
                long_tail: keywords.filter(k => k.category === "long_tail"),
                local: keywords.filter(k => k.category === "local"),
                ai_query: keywords.filter(k => k.category === "ai_query"),
            };
            return NextResponse.json({
                success: true,
                agent: agent.getAgentId(),
                total: keywords.length,
                categories,
            });
        }

        case "content": {
            const plan = agent.getContentPlan();
            return NextResponse.json({
                success: true,
                agent: agent.getAgentId(),
                total: plan.length,
                planned: plan.filter((c: ContentPiece) => c.status === "planned"),
                needsUpdate: plan.filter((c: ContentPiece) => c.status === "needs_update"),
                published: plan.filter((c: ContentPiece) => c.status === "published"),
            });
        }

        case "schema": {
            const plan = agent.getContentPlan();
            const schemas = plan.map(piece => ({
                title: piece.title,
                slug: piece.slug,
                schema: agent.generateSchema(piece),
            }));
            return NextResponse.json({
                success: true,
                agent: agent.getAgentId(),
                schemas,
            });
        }

        default: {
            // Default: return agent status
            return NextResponse.json({
                success: true,
                agent: agent.getAgentId(),
                status: agent.getStatus(),
                availableActions: [
                    "GET /api/seo?action=audit    — Run full SEO audit",
                    "GET /api/seo?action=brief    — Get next content brief",
                    "GET /api/seo?action=report   — Generate weekly report",
                    "GET /api/seo?action=llms     — Generate llms.txt",
                    "GET /api/seo?action=index    — Trigger IndexNow",
                    "GET /api/seo?action=keywords — View all tracked keywords",
                    "GET /api/seo?action=content  — View content plan",
                    "GET /api/seo?action=schema   — Generate all schemas",
                ],
            });
        }
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { action } = body;

        if (action === "index_urls" && body.urls) {
            // Submit specific URLs to IndexNow
            const res = await fetch(`${req.nextUrl.origin}/api/indexnow`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ urls: body.urls }),
            });
            const data = await res.json();
            return NextResponse.json({ success: true, ...data });
        }

        return NextResponse.json({
            success: false,
            error: "Unknown action. Use GET /api/seo for available actions.",
        }, { status: 400 });

    } catch (err) {
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}
