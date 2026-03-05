import { NextRequest, NextResponse } from "next/server";

// ═══════════════════════════════════════════════════════════════════════════
// IndexNow API — Instant Indexing for Bing, Yahoo, Yandex, Seznam, Naver
// ═══════════════════════════════════════════════════════════════════════════
// IndexNow notifies search engines IMMEDIATELY when content changes.
// Instead of waiting days/weeks for crawlers, Bing, Yandex, Seznam, and
// Naver pick up changes within MINUTES.
//
// Supported engines: Bing, Yahoo (uses Bing index), Yandex, Seznam.cz, Naver
// Docs: https://www.indexnow.org/documentation
// ═══════════════════════════════════════════════════════════════════════════

const INDEXNOW_KEY = "7e9a76b157a1ead848fe81f4f188cf6a";
const HOST = "biodynamx.com";
const KEY_LOCATION = `https://${HOST}/${INDEXNOW_KEY}.txt`;

// All BioDynamX URLs that should be indexed
const ALL_URLS = [
    `https://${HOST}`,
    `https://${HOST}/audit`,
    `https://${HOST}/about`,
    // Blog
    `https://${HOST}/blog`,
    `https://${HOST}/blog/what-is-neuromarketing`,
    `https://${HOST}/blog/ai-for-dental-practices`,
    `https://${HOST}/blog/ai-receptionist-vs-answering-service`,
    `https://${HOST}/blog/missed-calls-cost-business`,
    `https://${HOST}/blog/neurobiology-of-choice`,
    `https://${HOST}/blog/ai-for-real-estate`,
    `https://${HOST}/blog/ai-for-med-spas`,
    `https://${HOST}/blog/how-ai-voice-agents-work`,
    `https://${HOST}/blog/roi-of-ai-business-automation`,
    // Dashboard & Tools
    `https://${HOST}/dashboard`,
    `https://${HOST}/dashboard/gmb-setup`,
    `https://${HOST}/pricing`,
    `https://${HOST}/testimonials`,
    // Industry landing pages
    `https://${HOST}/industries/dental`,
    `https://${HOST}/industries/real-estate`,
    `https://${HOST}/industries/call-centers`,
    `https://${HOST}/industries/med-spas`,
    `https://${HOST}/industries/startups`,
    // Other
    `https://${HOST}/portal/login`,
    `https://${HOST}/dashboard/connect`,
    `https://${HOST}/dashboard/client`,
    `https://${HOST}/success`,
    `https://${HOST}/sitemap.xml`,
];

// IndexNow submission endpoints — submit to ALL engines simultaneously
const INDEXNOW_ENDPOINTS = [
    "https://api.indexnow.org/indexnow",     // Bing + Yahoo + DuckDuckGo
    "https://yandex.com/indexnow",           // Yandex
    "https://search.seznam.cz/indexnow",     // Seznam.cz
];

/**
 * POST /api/indexnow — Submit URLs for instant indexing
 * Body: { urls?: string[] } — optional, defaults to all site URLs
 * Also callable via GET for a quick "re-index everything" trigger
 */
export async function POST(req: NextRequest) {
    try {
        const body = await req.json().catch(() => ({}));
        const urls = body.urls || ALL_URLS;

        const results = await submitToIndexNow(urls);

        return NextResponse.json({
            success: true,
            submitted: urls.length,
            engines: results,
            message: `Submitted ${urls.length} URLs to ${INDEXNOW_ENDPOINTS.length} search engines for instant indexing`,
        });
    } catch (err) {
        console.error("[IndexNow] Error:", err);
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}

/**
 * GET /api/indexnow — Quick trigger to re-index all pages
 * Usage: curl https://biodynamx.com/api/indexnow
 */
export async function GET() {
    try {
        const results = await submitToIndexNow(ALL_URLS);

        return NextResponse.json({
            success: true,
            submitted: ALL_URLS.length,
            engines: results,
            urls: ALL_URLS,
            message: "All BioDynamX pages submitted for instant indexing",
        });
    } catch (err) {
        console.error("[IndexNow] Error:", err);
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}

async function submitToIndexNow(urls: string[]) {
    const payload = {
        host: HOST,
        key: INDEXNOW_KEY,
        keyLocation: KEY_LOCATION,
        urlList: urls,
    };

    const results: Array<{ engine: string; status: number | string; ok: boolean }> = [];

    // Submit to all engines in parallel
    const submissions = INDEXNOW_ENDPOINTS.map(async (endpoint) => {
        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const engineName = new URL(endpoint).hostname;
            const result = { engine: engineName, status: res.status, ok: res.ok };
            results.push(result);

            if (res.ok) {
                console.log(`[IndexNow] ✅ Submitted ${urls.length} URLs to ${engineName}`);
            } else {
                const text = await res.text().catch(() => "");
                console.warn(`[IndexNow] ⚠️ ${engineName} returned ${res.status}: ${text}`);
            }
        } catch (err) {
            const engineName = new URL(endpoint).hostname;
            results.push({ engine: engineName, status: String(err), ok: false });
            console.error(`[IndexNow] ❌ Failed to submit to ${engineName}:`, err);
        }
    });

    await Promise.all(submissions);
    return results;
}
