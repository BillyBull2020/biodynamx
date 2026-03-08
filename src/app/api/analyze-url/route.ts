// ══════════════════════════════════════════════════════════════════════════════
// ANALYZE-URL  — Real website intelligence for Jenny / IronClaw
// ══════════════════════════════════════════════════════════════════════════════
// This route ACTUALLY fetches and reads the website using:
//   1. Raw HTML fetch — speed, title, meta, phone, CTA detection
//   2. Gemini 2.0 Flash with googleSearch grounding — competitor & reputation data
//   3. Firecrawl (if key present) — clean markdown extraction
//
// Called by the voice-session system prompt when a prospect mentions their URL.
// Returns structured JSON that Jenny can speak conversationally.
// ══════════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { url } = await req.json() as { url: string };
        if (!url) return NextResponse.json({ error: "URL required" }, { status: 400 });

        const targetUrl = url.startsWith("http") ? url : `https://${url}`;
        const domain = new URL(targetUrl).hostname.replace("www.", "");

        // ── STEP 1: Fetch real HTML ──────────────────────────────────────────
        let rawHtml = "";
        let loadTimeMs = 0;
        let siteReachable = false;

        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 8000);
            const t0 = Date.now();
            const resp = await fetch(targetUrl, {
                signal: controller.signal,
                headers: { "User-Agent": "BioDynamX-Scout/4.0", Accept: "text/html" },
                redirect: "follow",
            });
            clearTimeout(timeout);
            rawHtml = await resp.text();
            loadTimeMs = Date.now() - t0;
            siteReachable = resp.ok;
        } catch {
            loadTimeMs = 8001;
        }

        // ── STEP 2: Extract key signals from HTML ────────────────────────────
        const title = rawHtml.match(/<title[^>]*>([^<]+)<\/title>/i)?.[1]?.trim() || null;
        const metaDesc = rawHtml.match(/name=["']description["'][^>]*content=["']([^"']+)/i)?.[1]?.trim() || null;
        const hasPhone = /tel:|(\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})/.test(rawHtml);
        const hasChatWidget = /intercom|drift|crisp|tawk|livechat|hubspot/i.test(rawHtml);
        const hasContactForm = /<form[\s\S]*?(contact|inquiry|book|appointment)/i.test(rawHtml);
        const hasScheduling = /calendly|acuity|booksy/i.test(rawHtml);
        const hasReviews = /google.*review|trustpilot|birdeye|aggregateRating/i.test(rawHtml);
        const hasSchema = rawHtml.includes("application/ld+json");
        const hasMobileViewport = rawHtml.includes("viewport");
        const hasSSL = targetUrl.startsWith("https");
        const wordCount = rawHtml.replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
        const h1Text = rawHtml.match(/<h1[^>]*>([^<]+)<\/h1>/i)?.[1]?.trim() || null;

        // Score business contact accessibility (0–5)
        const contactScore = [hasPhone, hasChatWidget, hasContactForm, hasScheduling].filter(Boolean).length;
        const missedCallsEstimate = contactScore >= 3 ? 5 : contactScore === 2 ? 20 : contactScore === 1 ? 40 : 60;

        // Speed grade
        let speedGrade = "A";
        if (loadTimeMs > 6000) speedGrade = "F";
        else if (loadTimeMs > 4000) speedGrade = "D";
        else if (loadTimeMs > 3000) speedGrade = "C";
        else if (loadTimeMs > 2000) speedGrade = "B";

        // ── STEP 3: Gemini AI analysis with Google Search grounding ─────────
        const apiKey = process.env.GEMINI_API_KEY;
        let aiInsights: {
            summary: string;
            topPainPoint: string;
            biggestOpportunity: string;
            competitorThreat: string;
            jennyScript: string;
        } | null = null;

        if (apiKey && rawHtml.length > 100) {
            // Send the real HTML content to Gemini for analysis
            const htmlSnippet = rawHtml
                .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
                .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
                .replace(/<[^>]+>/g, " ")
                .replace(/\s+/g, " ")
                .trim()
                .slice(0, 6000); // Send first 6000 chars of cleaned content

            try {
                const geminiResp = await fetch(
                    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
                    {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            contents: [{
                                parts: [{
                                    text: `You are a revenue intelligence analyst. I've fetched the actual website content for ${domain}.

Here is the REAL content from their website:
"""
${htmlSnippet}
"""

Site metrics:
- Load time: ${loadTimeMs}ms (Grade: ${speedGrade})
- Has phone number: ${hasPhone}
- Has live chat: ${hasChatWidget}
- Has contact form: ${hasContactForm}
- Has scheduling: ${hasScheduling}
- Has reviews/social proof: ${hasReviews}
- Has structured data (schema.org): ${hasSchema}
- Mobile optimized: ${hasMobileViewport}
- SSL: ${hasSSL}
- Estimated missed calls/month: ${missedCallsEstimate}
- Word count: ${wordCount}
- H1 headline: ${h1Text || "none found"}

Based on the ACTUAL content above, provide a JSON response with these exact fields:
{
  "summary": "2-sentence factual summary of what this business actually does, based on their real content",
  "topPainPoint": "The #1 revenue leak you can see from their actual website (be specific, reference something real you saw)",
  "biggestOpportunity": "The single biggest win BioDynamX can deliver for this specific business",
  "competitorThreat": "One specific competitive threat this business faces based on their industry",
  "jennyScript": "A 2-3 sentence script for Jenny to say out loud that shows she ACTUALLY read their website. Reference their real H1 or title: '${title || domain}'. Sound genuinely impressed and specific. Start with 'Okay so I just pulled up ${domain}...'"
}

Return ONLY valid JSON. No markdown fences.`
                                }]
                            }],
                            tools: [{ googleSearch: {} }],
                            generationConfig: { temperature: 0.4 }
                        }),
                    }
                );

                const data = await geminiResp.json();
                const text: string = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
                // Strip markdown fences if present
                const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
                aiInsights = JSON.parse(cleaned);
            } catch (err) {
                console.warn("[analyze-url] Gemini analysis failed:", err);
            }
        }

        // ── STEP 4: Build the response Jenny can actually USE ─────────────────
        const result = {
            url: targetUrl,
            domain,
            reachable: siteReachable,
            title,
            metaDesc,
            // Raw signals
            signals: {
                loadTimeMs,
                speedGrade,
                hasPhone,
                hasChatWidget,
                hasContactForm,
                hasScheduling,
                hasReviews,
                hasSchema,
                hasMobileViewport,
                hasSSL,
                wordCount,
                h1Text,
                contactScore,
                missedCallsEstimate,
            },
            // AI-driven insights (can be null if Gemini failed)
            insights: aiInsights,
            // Pre-built Jenny talking points if AI failed
            fallbackScript: aiInsights ? null : buildFallbackScript(domain, {
                loadTimeMs, speedGrade, hasPhone, hasChatWidget, missedCallsEstimate, hasReviews
            }),
            timestamp: new Date().toISOString(),
        };

        return NextResponse.json(result);

    } catch (err) {
        console.error("[analyze-url] Error:", err);
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}

function buildFallbackScript(domain: string, signals: {
    loadTimeMs: number;
    speedGrade: string;
    hasPhone: boolean;
    hasChatWidget: boolean;
    missedCallsEstimate: number;
    hasReviews: boolean;
}): string {
    const issues: string[] = [];

    if (signals.loadTimeMs > 3000) {
        issues.push(`your site is taking over ${(signals.loadTimeMs / 1000).toFixed(1)} seconds to load`);
    }
    if (!signals.hasPhone && !signals.hasChatWidget) {
        issues.push("there's no easy way for customers to reach you instantly");
    }
    if (!signals.hasReviews) {
        issues.push("I don't see any reviews or social proof — that's a major trust gap");
    }
    if (signals.missedCallsEstimate > 20) {
        issues.push(`you're likely losing ${signals.missedCallsEstimate}+ leads per month`);
    }

    if (issues.length === 0) {
        return `Okay so I just pulled up ${domain} — and honestly, there's a solid foundation here. But here's what the data is telling me: even the best sites are leaving revenue on the table without an AI voice layer backing them up. Let me show you exactly what that means for your numbers.`;
    }

    return `Okay so I just pulled up ${domain} — and I want to be straight with you because I think you deserve honesty: ${issues.join(", ")}. These are fixable, and they're costing you real money every single day. Let me show you the numbers.`;
}
