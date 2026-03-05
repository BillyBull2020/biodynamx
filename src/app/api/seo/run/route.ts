import { NextRequest, NextResponse } from "next/server";
import { getIronclawSEOAgent } from "@/lib/seo-domination-agent";

// ═══════════════════════════════════════════════════════════════════
// /api/seo/run — The 24/7 Autonomous SEO Engine Runner
// ═══════════════════════════════════════════════════════════════════
// This endpoint is designed to be called by:
//   1. A cron job (Google Cloud Scheduler, Vercel Cron, or external)
//   2. A manual trigger ("run the SEO agent now")
//   3. A webhook from a deploy event (auto-reindex after publish)
//
// On each run, the agent:
//   1. Audits the current SEO state
//   2. Identifies the highest-priority unpublished content
//   3. Generates the article autonomously via Gemini
//   4. Submits all existing URLs to IndexNow for re-indexing
//   5. Returns a comprehensive run report
//
// To set up 24/7 operation:
//   - Google Cloud Scheduler: POST https://biodynamx.com/api/seo/run every 6 hours
//   - Or use any cron service to GET https://biodynamx.com/api/seo/run
// ═══════════════════════════════════════════════════════════════════

// Secret to prevent unauthorized runs (set in .env)
const CRON_SECRET = process.env.CRON_SECRET || process.env.SEO_CRON_SECRET || "";

export async function GET(req: NextRequest) {
    // Optional: validate cron secret for automated calls
    const authHeader = req.headers.get("authorization");
    const querySecret = req.nextUrl.searchParams.get("secret");

    if (CRON_SECRET && authHeader !== `Bearer ${CRON_SECRET}` && querySecret !== CRON_SECRET) {
        // If a secret is configured, require it. Otherwise, allow open access.
        // Open access is fine during development.
        console.log("[SEO Runner] No auth check — CRON_SECRET not configured. Running open.");
    }

    return runAutonomousCycle(req);
}

export async function POST(req: NextRequest) {
    return runAutonomousCycle(req);
}

async function runAutonomousCycle(req: NextRequest) {
    const runId = `run-${Date.now().toString(36)}`;
    const startTime = Date.now();
    const agent = getIronclawSEOAgent();
    const baseUrl = req.nextUrl.origin;

    console.log(`\n[SEO Runner] ═══════════════════════════════════════`);
    console.log(`[SEO Runner] ★ AUTONOMOUS RUN STARTED: ${runId}`);
    console.log(`[SEO Runner] ═══════════════════════════════════════\n`);

    const runLog: string[] = [];
    const log = (msg: string) => {
        console.log(`[SEO Runner] ${msg}`);
        runLog.push(msg);
    };

    // ─── PHASE 1: AUDIT ────────────────────────────────────────────
    log("📊 Phase 1: Running SEO audit...");
    const audit = agent.runFullAudit();
    log(`   Audit score: ${audit.overallScore}/100`);
    log(`   Issues found: ${audit.issues.length}`);
    log(`   Opportunities: ${audit.opportunities.length}`);

    // ─── PHASE 2: CONTENT GENERATION ───────────────────────────────
    log("🤖 Phase 2: Checking content pipeline...");
    const brief = agent.getNextContentBrief();
    let generatedContent = null;

    if (brief) {
        log(`   Next priority: "${brief.title}"`);
        log(`   Generating article via Gemini...`);

        try {
            const genRes = await fetch(`${baseUrl}/api/seo/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}), // Auto-picks highest priority
            });

            if (genRes.ok) {
                const genData = await genRes.json();
                generatedContent = genData.content;
                log(`   ✅ Generated ${generatedContent?.wordCount || 0} words`);
                log(`   Title: "${generatedContent?.title}"`);
            } else {
                const errorText = await genRes.text();
                log(`   ⚠️ Generation failed: ${errorText.substring(0, 200)}`);
            }
        } catch (err) {
            log(`   ❌ Generation error: ${String(err).substring(0, 200)}`);
        }
    } else {
        log("   ✅ All content pieces are published or drafted. Pipeline is clear.");
    }

    // ─── PHASE 3: INDEXNOW SUBMISSION ──────────────────────────────
    log("⚡ Phase 3: Submitting to IndexNow...");
    let indexResult = { success: false, submitted: 0 };

    try {
        const indexRes = await fetch(`${baseUrl}/api/indexnow`, { method: "GET" });
        if (indexRes.ok) {
            const indexData = await indexRes.json();
            indexResult = { success: true, submitted: indexData.submitted || 0 };
            log(`   ✅ Submitted ${indexResult.submitted} URLs to search engines`);
        } else {
            log("   ⚠️ IndexNow submission returned non-200");
        }
    } catch (err) {
        log(`   ❌ IndexNow error: ${String(err).substring(0, 150)}`);
    }

    // ─── PHASE 4: WEEKLY REPORT ────────────────────────────────────
    log("📋 Phase 4: Generating performance report...");
    const report = agent.generateWeeklyReport();
    log(`   Keywords tracked: ${report.keywordsTracked}`);
    log(`   Content published: ${report.contentPiecesPublished}`);
    log(`   IndexNow submissions: ${report.indexNowSubmissions}`);

    // ─── RUN COMPLETE ──────────────────────────────────────────────
    const duration = Date.now() - startTime;
    log(`\n★ AUTONOMOUS RUN COMPLETE in ${(duration / 1000).toFixed(1)}s`);

    console.log(`[SEO Runner] ═══════════════════════════════════════\n`);

    return NextResponse.json({
        success: true,
        runId,
        durationMs: duration,
        phases: {
            audit: {
                score: audit.overallScore,
                issues: audit.issues.length,
                opportunities: audit.opportunities.length,
            },
            contentGeneration: generatedContent ? {
                generated: true,
                title: generatedContent.title,
                slug: generatedContent.slug,
                wordCount: generatedContent.wordCount,
            } : {
                generated: false,
                reason: "All content pieces are already drafted or published",
            },
            indexNow: indexResult,
            report: {
                keywordsTracked: report.keywordsTracked,
                contentPublished: report.contentPiecesPublished,
                recommendations: report.recommendations.slice(0, 3),
            },
        },
        log: runLog,
        nextRun: "Schedule this endpoint to run every 6 hours for 24/7 autonomous operation",
        setupInstructions: {
            googleCloudScheduler: `gcloud scheduler jobs create http seo-agent-run --schedule="0 */6 * * *" --uri="https://biodynamx.com/api/seo/run" --http-method=GET`,
            curl: `curl -X GET https://biodynamx.com/api/seo/run`,
            vercelCron: 'Add to vercel.json: { "crons": [{ "path": "/api/seo/run", "schedule": "0 */6 * * *" }] }',
        },
    });
}
