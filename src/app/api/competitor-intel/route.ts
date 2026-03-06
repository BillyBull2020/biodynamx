import { NextRequest, NextResponse } from "next/server";

// ═══════════════════════════════════════════════════════════════════════════════
// COMPETITOR INTEL — Real-Time Competitive Analysis
// ═══════════════════════════════════════════════════════════════════════════════
// Uses Gemini + Google Search grounding to find REAL competitor data.
// Jenny/Mark use this to create urgency: "Your competitor ranks #1 and you're invisible."

interface CompetitorProfile {
    name: string;
    website: string;
    googleRating: number | null;
    reviewCount: number | null;
    estimatedTraffic: string;
    strengths: string[];
    weaknesses: string[];
    threatLevel: "critical" | "high" | "medium" | "low";
    whatTheyDoBetter: string;
    revenueTheyreStealingMonthly: string;
}

interface CompetitorIntelResult {
    domain: string;
    competitors: CompetitorProfile[];
    marketPosition: "leader" | "contender" | "follower" | "at_risk";
    totalRevenueAtRisk: string;
    keyInsight: string;
    agentScript: string;
    timestamp: string;
}

export async function POST(req: NextRequest) {
    try {
        const { domain, industry, auditData } = await req.json();

        if (!domain) {
            return NextResponse.json({ error: "Domain is required" }, { status: 400 });
        }

        const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
        const apiKey = process.env.GEMINI_API_KEY || process.env.GEMINI_AUDIT_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: "API key not configured" }, { status: 500 });
        }

        // ── Use Gemini + Google Search for real competitor data ──
        const prompt = `You are a competitive intelligence analyst. Research the business at ${cleanDomain} and find their TOP 3 direct competitors.

For EACH competitor, provide REAL data from Google Search:

1. Company name (real business name, not made up)
2. Website URL
3. Google rating (actual star rating if available, or null)
4. Approximate Google review count
5. Estimated monthly website traffic (use terms like "~5,000/mo" or "~50,000/mo")
6. 2-3 specific strengths they have over ${cleanDomain}
7. 1-2 weaknesses or gaps they have
8. Threat level: "critical" (they dominate), "high" (strong competitor), "medium" (comparable), "low" (weak)
9. One specific thing they do better than ${cleanDomain}
10. Estimated monthly revenue they're capturing that ${cleanDomain} is missing (conservative estimate)

${industry ? `Industry context: ${industry}` : ""}
${auditData?.siteSpeed?.score ? `The prospect's site speed score is ${auditData.siteSpeed.score}/100 and their SEO score is ${auditData.seo?.score || "unknown"}/100.` : ""}

Also provide:
- Overall market position of ${cleanDomain}: "leader", "contender", "follower", or "at_risk"
- Total estimated revenue at risk from ALL competitors combined monthly
- One key insight that would make the business owner uncomfortable (in a motivating way)
- A brief agent script (2-3 sentences) Jenny could use to present this data

Return ONLY valid JSON in this exact format:
{
  "competitors": [
    {
      "name": "...",
      "website": "...",
      "googleRating": 4.5,
      "reviewCount": 150,
      "estimatedTraffic": "~15,000/mo",
      "strengths": ["...", "..."],
      "weaknesses": ["..."],
      "threatLevel": "high",
      "whatTheyDoBetter": "...",
      "revenueTheyreStealingMonthly": "$4,200"
    }
  ],
  "marketPosition": "follower",
  "totalRevenueAtRisk": "$12,500/mo",
  "keyInsight": "...",
  "agentScript": "..."
}`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: prompt }] }],
                    tools: [{ googleSearch: {} }],
                    generationConfig: {
                        temperature: 0.3,
                        maxOutputTokens: 4096,
                    },
                }),
            }
        );

        const data = await response.json();
        // Google Search grounding may return text across multiple parts
        const allParts = data?.candidates?.[0]?.content?.parts || [];
        const text = allParts.map((p: { text?: string }) => p.text || "").join("\n");
        console.log("[Competitor Intel] Gemini response length:", text.length, "chars");

        if (!text) {
            console.warn("[Competitor Intel] Empty response from Gemini. Status:", response.status);
        }

        // Extract JSON from response — try code block first, then raw JSON
        const codeBlockMatch = text.match(/```json\s*([\s\S]*?)```/);
        const jsonStr = codeBlockMatch ? codeBlockMatch[1].trim() : text;
        const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
            try {
                const parsed = JSON.parse(jsonMatch[0]);
                const result: CompetitorIntelResult = {
                    domain: cleanDomain,
                    competitors: parsed.competitors || [],
                    marketPosition: parsed.marketPosition || "at_risk",
                    totalRevenueAtRisk: parsed.totalRevenueAtRisk || "$0",
                    keyInsight: parsed.keyInsight || "Competitor analysis inconclusive",
                    agentScript: parsed.agentScript || "",
                    timestamp: new Date().toISOString(),
                };
                console.log(`[Competitor Intel] ✅ Found ${result.competitors.length} competitors for ${cleanDomain}`);
                return NextResponse.json(result);
            } catch (parseErr) {
                console.error("[Competitor Intel] JSON parse failed:", parseErr, "Raw text:", text.slice(0, 300));
            }
        }

        // Fallback if parsing fails
        return NextResponse.json({
            domain: cleanDomain,
            competitors: [],
            marketPosition: "at_risk",
            totalRevenueAtRisk: "Unable to calculate",
            keyInsight: "We couldn't pull competitor data right now, but based on typical industry patterns, you're likely losing ground.",
            agentScript: `I wasn't able to pull live competitor data for ${cleanDomain} right now, but in most industries, businesses without AI automation are losing 15-20% of their leads to competitors who respond faster.`,
            timestamp: new Date().toISOString(),
        });
    } catch (err) {
        console.error("[Competitor Intel] Error:", err);
        return NextResponse.json({ error: "Competitor analysis failed: " + String(err) }, { status: 500 });
    }
}
