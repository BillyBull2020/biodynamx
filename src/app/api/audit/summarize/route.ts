// ============================================================================
// /api/audit/summarize — Gemini-Powered Document & Audit Summarizer
// ============================================================================
// Takes raw audit data or uploaded document text and uses Gemini to produce
// a comprehensive, human-readable executive summary with actionable insights.
// This is the AI layer on top of the raw audit probes.
// ============================================================================

import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextRequest, NextResponse } from "next/server";

// ─── Secure Gemini Client ────────────────────────────────────────────────────
// Uses server-side env var (never exposed to browser)
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_AUDIT_API_KEY;
  if (!apiKey) throw new Error("GEMINI_AUDIT_API_KEY not configured");
  return new GoogleGenerativeAI(apiKey);
};

// ─── The Master Summarizer Prompt ────────────────────────────────────────────
const buildSummarizerPrompt = (
  auditData: Record<string, unknown>,
  documentText?: string
) => {
  return `You are the Chief AI Auditor for BioDynamX Engineering Group and AI Expert Solutions. You have just completed a comprehensive automated audit of a business. Your job is to create a powerful executive summary that:

1. Translates raw data into human-readable insights
2. Identifies the TOP revenue leaks with dollar amounts
3. Prescribes exactly what AI Expert Solutions and BioDynamX can fix
4. Creates urgency without being manipulative (use real cost-of-delay numbers)

RAW AUDIT DATA:
${JSON.stringify(auditData, null, 2)}

${documentText ? `ADDITIONAL BUSINESS DOCUMENTS:\n${documentText}\n` : ""}

Create a comprehensive summary with the following structure. Return ONLY valid JSON:

{
  "grade": "<A+ through F>",
  "overallHealthScore": <0-100>,
  "headline": "<One powerful sentence summarizing the biggest finding>",
  "executiveSummary": "<3-4 sentence executive summary for the business owner>",
  "criticalFindings": [
    {
      "category": "<SEO|AEO|GEO|Website|GMB|CTA|AI Readiness|Missed Calls|Revenue Leak|Content>",
      "severity": "<critical|warning|good>",
      "finding": "<specific finding in plain English>",
      "monthlyImpact": "<dollar amount being lost>",
      "fix": "<what BioDynamX/AI Expert Solutions will do>",
      "timeToFix": "<estimated implementation time>"
    }
  ],
  "revenueSummary": {
    "totalMonthlyLeak": "<total dollars leaking per month>",
    "totalAnnualLeak": "<total dollars leaking per year>",
    "recoverableWithAI": "<how much BioDynamX can recover>",
    "roiProjection": "<expected ROI multiple>"
  },
  "competitorGap": "<2 sentences about how competitors are outpacing this business>",
  "top3Actions": [
    {
      "priority": 1,
      "action": "<specific action to take>",
      "expectedResult": "<what will happen when fixed>",
      "urgency": "<why this can't wait>"
    },
    {
      "priority": 2,
      "action": "<specific action>",
      "expectedResult": "<result>",
      "urgency": "<why>"
    },
    {
      "priority": 3,
      "action": "<specific action>",
      "expectedResult": "<result>",
      "urgency": "<why>"
    }
  ],
  "biodynamxPitch": "<3-4 sentence pitch for how BioDynamX Engineering Group and AI Expert Solutions are uniquely positioned to fix ALL of these issues using their proprietary AI platform — Jenny (diagnostic) and Mark (implementation). Mention the guaranteed 5x ROI.>"
}`;
};

// ─── POST Handler ────────────────────────────────────────────────────────────
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { auditData, documentText } = body;

    if (!auditData && !documentText) {
      return NextResponse.json(
        { error: "Provide audit data or document text to summarize" },
        { status: 400 }
      );
    }

    // Initialize Gemini
    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.6,       // More factual for summaries
        maxOutputTokens: 4096,
      },
    });

    // Build and send the prompt
    const prompt = buildSummarizerPrompt(auditData || {}, documentText);
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Clean and parse JSON
    let cleanJson = text.trim();
    if (cleanJson.startsWith("```")) {
      cleanJson = cleanJson.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const summary = JSON.parse(cleanJson);
    summary.generatedAt = new Date().toISOString();
    summary.engine = "Google Gemini 2.0 Flash";

    return NextResponse.json(summary, { status: 200 });
  } catch (error: unknown) {
    console.error("[Summarizer API] Error:", error);
    const msg = error instanceof Error ? error.message : "Summarization failed";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
