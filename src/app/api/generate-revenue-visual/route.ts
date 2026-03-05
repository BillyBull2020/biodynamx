/**
 * NANA BANANA 2 — LIVE PERSONALIZED REVENUE CALCULATOR VISUAL
 *
 * This is the NLP gut-punch: Jenny collects their numbers,
 * IronClaw sends them here, Nana Banana generates an image
 * with THEIR EXACT DOLLARS showing on screen in real-time.
 *
 * Neuroscience principle: Specificity = Reality.
 * A generic "$47K" feels like marketing. THEIR "$47,200" feels like
 * a diagnosis. The brain treats personalized numbers as REAL threats.
 *
 * Two visual types:
 *   "loss" → Their money BLEEDING out. Activates cortisol. Old brain snaps awake.
 *   "roi"  → The size comparison: $497 (tiny) vs $THEIR_RECOVERY (huge).
 *             The brain reads SIZE as importance — no explanation needed.
 *   "both" → Sequential: loss first (pain), then roi (solution).
 *
 * POST /api/generate-revenue-visual
 * Body: { missedCallsPerWeek, avgSaleValue, industry, businessName?, type }
 */

import { NextRequest, NextResponse } from "next/server";

const GEMINI_API_KEY =
    process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const IMAGE_MODEL = "gemini-2.0-flash-exp-image-generation";

// ── Revenue Math Engine ─────────────────────────────────────────────────────

interface RevenueData {
    missedCallsPerWeek: number;
    avgSaleValue: number;
    industry: string;
    businessName?: string;
    type: "loss" | "roi" | "winback";
}

interface RevenueCalc {
    monthlyMissedCalls: number;
    recoverable: number;       // 40% recovery rate = what BioDynamX gets back
    monthlyLoss: number;       // How much they're currently losing
    annualLoss: number;
    avgSaleValue: number;      // Original sale value — used in derived prompts
    biodynamxCost: number;     // $497/month
    roiMultiple: number;       // monthlyRecovery / $497
    daysToBeProfitable: number;
    formattedLoss: string;
    formattedRecovery: string;
    formattedAnnual: string;
    formattedROI: string;
}

function calculateRevenue(data: RevenueData): RevenueCalc {
    const monthlyMissedCalls = data.missedCallsPerWeek * 4.3;
    // 40% of missed calls can be recovered with text-back + AI follow-up
    const recoverable = Math.round(monthlyMissedCalls * 0.40);
    const monthlyLoss = Math.round(recoverable * data.avgSaleValue);
    const annualLoss = monthlyLoss * 12;
    const biodynamxCost = 497;
    const roiMultiple = Math.round(monthlyLoss / biodynamxCost);
    // How many days into month 1 before they're profitable
    const dailyRecovery = monthlyLoss / 30;
    const daysToBeProfitable = Math.ceil(biodynamxCost / dailyRecovery);

    const fmt = (n: number) => new Intl.NumberFormat("en-US", {
        style: "currency", currency: "USD", maximumFractionDigits: 0
    }).format(n);

    return {
        monthlyMissedCalls: Math.round(monthlyMissedCalls),
        recoverable,
        monthlyLoss,
        annualLoss,
        avgSaleValue: data.avgSaleValue,
        biodynamxCost,
        roiMultiple,
        daysToBeProfitable,
        formattedLoss: fmt(monthlyLoss),
        formattedRecovery: fmt(monthlyLoss), // same — what they recover
        formattedAnnual: fmt(annualLoss),
        formattedROI: `${roiMultiple}x`,
    };
}

// ── Prompt Builders ─────────────────────────────────────────────────────────
// NLP Principle: Use SUBMODALITY contrast — the SIZE of the number IS the message.
// No bullet points. No explanations. Pure visual weight.
// The Reptilian brain reads: BIG = IMPORTANT. GOLD = VALUE. DISSOLVING = LOSS.

function buildLossPrompt(calc: RevenueCalc): string {
    return `Create a powerful, cinematic NLP visual metaphor image. NO text except the ONE big number and minimal anchor phrase.

VISUAL CONCEPT: A single, massive, glowing golden number floats center-frame against a deep black background.

The number: "${calc.formattedLoss}" — rendered in luminous gold, slightly melting/dripping at the edges like hot wax, suggesting money that is LEAKING and DISSOLVING. The number is ENORMOUS — it fills 70% of the frame. It has weight and gravity.

Below the number, in very small, faint white italic text: "every month. walked out the door."

NO other text. NO labels. NO bullet points. NO company names.

Atmosphere: The background is pure cinema-black with a barely perceptible deep red glow at the bottom — like something is on fire, slowly, invisibly. The number feels heavy. It has the emotional weight of a hospital bill.

NLP Anchoring: The image should trigger a visceral stomach-drop reaction. Like seeing your bank account overdrawn. This is THEIR specific number — not generic. That specificity is the weapon.

Visual style: Ultra-premium dark art direction, photorealistic, dramatic chiaroscuro lighting on the number, 16:9 widescreen, 8K quality. The number is the ONLY star. No watermarks. No borders. Just consequence.`;
}

function buildROIPrompt(calc: RevenueCalc): string {
    return `Create a powerful cinematic NLP submodality contrast image. NO body text — only two numbers. The SIZE difference IS the message.

VISUAL CONCEPT: Two numbers side-by-side against cinema-black:

LEFT NUMBER: "$497" — TINY. Barely visible. Rendered in cold, thin grey text, almost apologetically small. Maybe 4% of the frame height. Like a footnote.

RIGHT NUMBER: "${calc.formattedRecovery}" — ENORMOUS. Luminous gold, glowing, filling 75% of the frame height. It radiates warmth and energy. This is what they GET BACK.

Between them, in faint grey: "per month"

Nothing else. No explanation. The brain reads SIZE as importance — no caption needed. The visual argument is: this tiny grey thing buys you this massive golden thing. Every month.

Below both numbers, barely visible italic text: "day ${calc.daysToBeProfitable} — you're profitable."

Atmosphere: The left side of the frame is slightly dim, almost cold. The right side where "${calc.formattedRecovery}" lives is warm, golden, alive. Light emanates from the right number — as if it's the source of light in the whole image.

NLP Principle: Submodality contrast — manipulating SIZE and BRIGHTNESS to signal value without a single word of explanation.

Style: Ultra-premium cinema-black art direction, electric gold glow on the ROI number, very faint cool blue tones on the $497 side, 16:9 widescreen, 8K, photorealistic. No watermarks. Pure impact.`;
}

function buildWinbackPrompt(calc: RevenueCalc): string {
    // Dormant customer reactivation — shows the sleeping money waking up
    const dormantRevenue = Math.round(calc.avgSaleValue * 250 * 0.20); // 250 avg dormant × 20% reactivation
    const formattedDormant = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(dormantRevenue);

    return `Create a cinematic visual metaphor for dormant money awakening. No bullet points — pure metaphor.

VISUAL CONCEPT: A dark, still room with rows of softly glowing amber spheres — each one represents a past customer, dormant, barely lit. They hang in the air like embers almost out.

One by one, from left to right, a ripple of energy moves through them — and they IGNITE. Warm gold light flooding the frame from right to left as they wake up. The contrast between dim left and blazing gold right is dramatic.

At the very center of the image, the number "${formattedDormant}" materializes — bold, warm gold — as the dormant spheres light up around it. It appears as if the act of waking them creates the number.

No labels. Just: the sleeping → the awakened → the VALUE that appears.

Tiny footer text, barely visible: "they remember you. they just needed to be asked."

Atmosphere: The emotional register is warmth, recognition, reunion — not urgency. Oxytocin, not cortisol. The color palette transitions from cold blue-grey (left, sleeping) to deep amber gold (right, awakened).

Style: Ultra-premium, cinematic, abstract but immediately legible metaphor, 16:9, 8K. No watermarks.`;
}

// ── Image Generation ─────────────────────────────────────────────────────────

async function generateNanaBananaImage(prompt: string): Promise<{ base64: string; mimeType: string } | null> {
    if (!GEMINI_API_KEY) return null;

    const url = `https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

    try {
        const response = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
            }),
        });

        if (!response.ok) {
            const err = await response.text();
            console.error("[RevenueVisual] Gemini API error:", err.substring(0, 200));
            return null;
        }

        const data = await response.json() as {
            candidates?: Array<{ content?: { parts?: Array<{ inlineData?: { data: string; mimeType: string } }> } }>;
        };
        const parts = data?.candidates?.[0]?.content?.parts ?? [];

        for (const part of parts) {
            if (part.inlineData?.data) {
                return { base64: part.inlineData.data, mimeType: part.inlineData.mimeType || "image/png" };
            }
        }
    } catch (err) {
        console.error("[RevenueVisual] Error:", err);
    }

    return null;
}

// ── Route Handler ─────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
    try {
        const body = await req.json() as Partial<RevenueData & { recoveryRate?: number }>;

        const {
            missedCallsPerWeek = 15,
            avgSaleValue = 500,
            industry = "general",
            businessName,
            type = "loss",
        } = body;

        // Validate inputs
        if (missedCallsPerWeek <= 0 || avgSaleValue <= 0) {
            return NextResponse.json({ error: "Invalid revenue inputs" }, { status: 400 });
        }

        const calc = calculateRevenue({ missedCallsPerWeek, avgSaleValue, industry, businessName, type });

        // Choose which NLP visual to generate
        let prompt: string;
        let visualType: string;

        if (type === "roi") {
            prompt = buildROIPrompt(calc);
            visualType = "roi_calculator";
        } else if (type === "winback") {
            prompt = buildWinbackPrompt(calc);
            visualType = "winback_reactivation";
        } else {
            prompt = buildLossPrompt(calc);
            visualType = "revenue_loss";
        }

        // Generate the personalized image
        const imageResult = await generateNanaBananaImage(prompt);

        if (!imageResult) {
            // Return the math even without an image — agent can still use it
            return NextResponse.json({
                success: false,
                calc,
                visualType,
                message: "Revenue math computed — image generation failed",
            });
        }

        // Return base64 for immediate display + the calc for Jenny's verbal delivery
        return NextResponse.json({
            success: true,
            imageBase64: `data:${imageResult.mimeType};base64,${imageResult.base64}`,
            calc,
            visualType,
            // Jenny's verbal delivery line — IronClaw can read this out
            jennyLine: type === "roi"
                ? `So here's the math, ${businessName ? businessName + " — " : ""}your investment is $497 a month. Based on what you told me, we recover ${calc.formattedRecovery} a month for you. That's ${calc.formattedROI} return on investment. And you're profitable on day ${calc.daysToBeProfitable} of month one.`
                : `Based on what you just told me — ${calc.recoverable} calls a month at ${new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(avgSaleValue)} each — that's ${calc.formattedLoss} walking out the door every single month. ${calc.formattedAnnual} a year. That's what we're here to get back for you.`,
        });

    } catch (error) {
        console.error("[RevenueVisual] Route error:", error);
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}

// GET — useful for testing with query params
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const mockBody = {
        missedCallsPerWeek: Number(searchParams.get("calls") ?? 20),
        avgSaleValue: Number(searchParams.get("value") ?? 1500),
        industry: searchParams.get("industry") ?? "dental",
        type: (searchParams.get("type") ?? "loss") as "loss" | "roi" | "winback",
    };

    const fakeReq = new Request(req.url, {
        method: "POST",
        body: JSON.stringify(mockBody),
        headers: { "Content-Type": "application/json" },
    });

    return POST(new NextRequest(fakeReq));
}
