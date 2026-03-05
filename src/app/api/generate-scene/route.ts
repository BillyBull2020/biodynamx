import { NextRequest, NextResponse } from "next/server";
import {
    getCachedVisual,
    cacheGeneratedVisual,
    normalizeIndustry,
    type BrainPhase,
} from "@/lib/visual-asset-cache";

// ═══════════════════════════════════════════════════════════════════════════
// NANA BANANA 2 — NEUROSCIENCE VISUAL ENGINE
// Powered by: Gemini Flash Image (Gemini API — separate from Vertex AI voice)
//
// SCIENTIFIC PRINCIPLE: Every image has one neuro-purpose.
// Images are not decoration — they are biological triggers.
//
// THE TRIUNE BRAIN VISUAL MAP:
//   REPTILIAN phase  → Loss/threat/statistics showing what they're LOSING NOW
//   LIMBIC phase     → Hope/connection/before-after showing what's POSSIBLE
//   NEOCORTEX phase  → Data/ROI/proof giving the brain PERMISSION to decide
//
// TWO-TIER VISUAL DELIVERY:
//   Tier 1: Supabase cache (< 50ms) — pre-generated industry images
//           Looks like MIND READING. Jenny detects "dental" → dental image
//           appears almost before they finish saying the word.
//   Tier 2: Live Gemini generation (2-5 sec) — for personalized scenes
//           after audit, after name known, with real ROI numbers.
//           Auto-stored to Supabase to feed Tier 1 for next visitor.
//
// IronClaw orchestrates WHEN each image fires — based on conversation phase.
// ═══════════════════════════════════════════════════════════════════════════

export async function POST(req: NextRequest) {
    try {
        const {
            prospectName,
            businessName,
            industry,
            topic,
            conversationPhase,    // "reptilian" | "limbic" | "neocortex" | "close"
            painPoint,
            auditData,            // Optional: real audit numbers to incorporate
            style = "modern cinematic professional dark premium",
        } = await req.json();

        const apiKey =
            process.env.NEXT_PUBLIC_GEMINI_API_KEY ||
            process.env.GEMINI_API_KEY;

        if (!apiKey) {
            return NextResponse.json({ error: "No API key" }, { status: 500 });
        }

        // ── STEP 1: Get industry-specific statistical data ──
        const industryStats = getIndustryStatistics(industry || "business");
        const industryVisuals = getIndustryVisuals(industry || "business");

        const resolvedPhase: BrainPhase = (conversationPhase || derivePhaseFromTopic(topic || "")) as BrainPhase;

        // ── STEP 2: TIER 1 — Check Supabase cache first (the mind-reading hit) ──
        // If we have a pre-generated image for this industry + phase,
        // return it INSTANTLY — no Gemini call needed.
        // Only bypass cache if we have personalized audit data to show.
        const hasPersonalizedData = !!(auditData || (prospectName && businessName));
        if (!hasPersonalizedData) {
            const cachedVisual = await getCachedVisual(industry || "default", resolvedPhase);
            if (cachedVisual) {
                console.log(`[NanaBanana2] ⚡ INSTANT CACHE HIT: ${normalizeIndustry(industry || "")}/${resolvedPhase} — served in < 50ms`);
                return NextResponse.json({
                    imageDataUrl: cachedVisual.image_url,
                    prompt: "(served from Supabase cache)",
                    neuroReason: cachedVisual.neuro_reason,
                    brainLayer: resolvedPhase.toUpperCase(),
                    topic,
                    conversationPhase: resolvedPhase,
                    prospectName,
                    businessName,
                    industryStats: cachedVisual.industry_stat,
                    fromCache: true,
                });
            }
        }

        // ── STEP 3: Build the neuroscience-locked prompt for live generation ──
        // Clean auditData to prevent visual hallucinations (Mark's audit, etc.)
        const cleanedAuditData = auditData ? {
            siteSpeed: auditData.siteSpeed,
            mobileScore: auditData.mobileScore,
            revenueEstimate: auditData.revenueEstimate,
            grade: auditData.grade,
            // DO NOT pass deepDiagnostic scripts (markScript/journeyScript) to the image generator
            // because it makes Gemini think Mark or Journey is doing the audit visually.
        } : null;

        const { imagePrompt, neuroReason, brainLayer } = buildNeuroPrompt({
            prospectName,
            businessName,
            industry: industry || "business",
            topic: topic || conversationPhase || "discovery",
            conversationPhase: resolvedPhase,
            painPoint,
            auditData: cleanedAuditData as any,
            style,
            industryStats,
            industryVisuals,
        });

        console.log(`[NanaBanana2] 🧠 Live generation — Brain layer: ${brainLayer} | Industry: ${industry} | Phase: ${resolvedPhase} | Personalized: ${hasPersonalizedData}`);
        console.log(`[NanaBanana2] 🎨 Neuroscience reason: ${neuroReason}`);

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${apiKey}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: imagePrompt }] }],
                    generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
                }),
            }
        );

        if (!response.ok) {
            const err = await response.text();
            console.error("[NanaBanana2] API error:", err);
            return NextResponse.json(
                { error: "Image generation failed", details: err },
                { status: 500 }
            );
        }

        const data = await response.json();
        const parts = data?.candidates?.[0]?.content?.parts || [];
        let imageBase64: string | null = null;
        let mimeType = "image/png";

        for (const part of parts) {
            if (part.inlineData?.data) {
                imageBase64 = part.inlineData.data;
                mimeType = part.inlineData.mimeType || "image/png";
                break;
            }
        }

        if (!imageBase64) {
            console.error("[NanaBanana2] No image in response:", JSON.stringify(data).slice(0, 300));
            return NextResponse.json(
                { error: "No image returned", prompt: imagePrompt },
                { status: 500 }
            );
        }

        // ── STEP 5: Auto-cache for Tier 1 future use (non-blocking) ──
        // Store in Supabase so next visitor with same industry gets instant load.
        // Only cache non-personalized requests (industry-level, not audit-specific)
        if (!hasPersonalizedData && imageBase64) {
            cacheGeneratedVisual({
                industry: industry || "default",
                phase: resolvedPhase,
                imageBase64,
                mimeType,
                industryStats: industryStats.headline,
                neuroReason,
            }).catch(err => console.warn("[NanaBanana2] Cache write failed (non-fatal):", err));
        }

        return NextResponse.json({
            imageDataUrl: `data:${mimeType};base64,${imageBase64}`,
            prompt: imagePrompt,
            neuroReason,
            brainLayer,
            topic,
            conversationPhase: resolvedPhase,
            prospectName,
            businessName,
            industryStats: industryStats.headline,
            fromCache: false,
        });

    } catch (err) {
        console.error("[NanaBanana2] Error:", err);
        return NextResponse.json({ error: String(err) }, { status: 500 });
    }
}

// ─────────────────────────────────────────────────────────────────────────────
// INDUSTRY STATISTICAL DATABASE
// Real national statistics — used in Reptilian phase to show ACTUAL losses
// Sources: industry reports, US Labor Bureau, Harvard Business Review, Forbes
// ─────────────────────────────────────────────────────────────────────────────

interface IndustryStats {
    headline: string;             // Primary statistic — the gut punch
    stat1: string;
    stat2: string;
    stat3: string;
    avgMissedRevenue: string;     // Industry average monthly revenue leak
    competitorAdvantage: string;  // What their competitor has that they don't
    biggestFear: string;          // The #1 reptilian trigger for this industry
}

function getIndustryStatistics(industry: string): IndustryStats {
    const ind = industry.toLowerCase();

    if (ind.includes("bookkeep") || ind.includes("account") || ind.includes("cpa") || ind.includes("tax")) {
        return {
            headline: "62% of accounting firms lose clients to faster competitors",
            stat1: "Average accounting firm misses 8-12 calls/week during tax season",
            stat2: "47% of small business owners switch accountants due to slow response",
            stat3: "Firms using AI follow-up retain 34% more clients annually",
            avgMissedRevenue: "$6,200–$14,000/month",
            competitorAdvantage: "AI-powered intake that responds in under 8 seconds",
            biggestFear: "Losing a $15,000/year client to a competitor who answered the phone first",
        };
    }

    if (ind.includes("attorney") || ind.includes("law") || ind.includes("legal")) {
        return {
            headline: "42% of legal leads contact the second firm within 5 minutes of not reaching the first",
            stat1: "Law firms miss an average of 35% of inbound calls during court hours",
            stat2: "Average missed case value: $8,500–$45,000",
            stat3: "Firms with 24/7 AI intake close 67% more cases per inquiry",
            avgMissedRevenue: "$22,000–$65,000/month",
            competitorAdvantage: "24/7 legal intake AI that qualifies leads while you're in court",
            biggestFear: "A $50,000 personal injury case going to a competitor because no one answered",
        };
    }

    if (ind.includes("restaurant") || ind.includes("food") || ind.includes("cafe") || ind.includes("bar")) {
        return {
            headline: "Restaurants that don't respond to online inquiries within 5 min lose 78% of bookings",
            stat1: "Average restaurant loses $3,200/month in unanswered reservation calls",
            stat2: "37% of diners choose competing restaurants after one bad response experience",
            stat3: "AI-powered reservation systems increase covers by 23% on average",
            avgMissedRevenue: "$4,000–$9,000/month",
            competitorAdvantage: "AI that books reservations 24/7 and sends automated reminders",
            biggestFear: "Tables going empty on Friday night because nobody answered the booking line",
        };
    }

    if (ind.includes("dental") || ind.includes("dentist")) {
        return {
            headline: "Dental practices miss 40% of new patient calls — each worth $1,200–$4,500",
            stat1: "62% of dental calls go unanswered during procedures",
            stat2: "Average no-show rate without AI reminders: 23% of appointments",
            stat3: "Practices using AI booking recover $8,400/month in missed appointments",
            avgMissedRevenue: "$8,000–$24,000/month",
            competitorAdvantage: "AI receptionist that answers, books, and reminds — 24/7",
            biggestFear: "A dental implant patient ($5,000 case) going to the practice down the street",
        };
    }

    if (ind.includes("real estate") || ind.includes("realtor") || ind.includes("realty")) {
        return {
            headline: "78% of home buyers choose the agent who responds FIRST — not the best agent",
            stat1: "Real estate agents lose 60% of leads by not responding within 5 minutes",
            stat2: "Average missed commission per deal: $9,000–$18,000",
            stat3: "Teams using AI lead qualification close 3.2x more deals from the same leads",
            avgMissedRevenue: "$18,000–$42,000/month",
            competitorAdvantage: "Instant AI lead response that qualifies buyers before competitors call back",
            biggestFear: "A $600,000 listing going to a competitor because you were with another client",
        };
    }

    if (ind.includes("med spa") || ind.includes("spa") || ind.includes("aesthetic") || ind.includes("beauty")) {
        return {
            headline: "Med spas lose $7,200/month on average to after-hours inquiries that go unanswered",
            stat1: "67% of high-value aesthetic patients research and book after 6 PM",
            stat2: "Average botox/filler patient LTV: $4,200/year",
            stat3: "Spas with AI booking show 41% higher revenue per square foot",
            avgMissedRevenue: "$6,000–$15,000/month",
            competitorAdvantage: "24/7 AI that upsells add-on treatments at booking",
            biggestFear: "A $3,000 package inquiry going unanswered while competitors close it by morning",
        };
    }

    if (ind.includes("hvac") || ind.includes("plumb") || ind.includes("electrical") || ind.includes("roofi") || ind.includes("home service")) {
        return {
            headline: "Home service companies miss 55% of after-hours emergency calls — average job: $850",
            stat1: "HVAC companies lose $12,000+/month in missed emergency dispatch calls",
            stat2: "67% of homeowners with an emergency call 3 companies and use the first to respond",
            stat3: "Home service AI averages $4,200 extra revenue per month from overflow calls alone",
            avgMissedRevenue: "$5,000–$18,000/month",
            competitorAdvantage: "AI that answers emergency calls at 2 AM and dispatches instantly",
            biggestFear: "A competitor getting the furnace repair call because you didn't pick up at midnight",
        };
    }

    if (ind.includes("medical") || ind.includes("doctor") || ind.includes("clinic") || ind.includes("health")) {
        return {
            headline: "Medical practices lose $14,000/month average to scheduling gaps and no-shows",
            stat1: "Average no-show rate without automated reminders: 18–24%",
            stat2: "Each missed appointment slot costs $150–$450 in direct revenue",
            stat3: "Clinics with AI scheduling reduce no-shows by 73% in 60 days",
            avgMissedRevenue: "$10,000–$28,000/month",
            competitorAdvantage: "AI patient intake that reduces no-shows and fills cancellation slots",
            biggestFear: "Half-empty appointment books costing $14,000/month in lost patient revenue",
        };
    }

    if (ind.includes("retail") || ind.includes("shop") || ind.includes("store") || ind.includes("ecommerce")) {
        return {
            headline: "E-commerce stores lose 73% of cart abandoners — AI recovers 28% of them",
            stat1: "Average cart abandonment rate: 69.8% — each % = hundreds to thousands monthly",
            stat2: "Stores with instant AI chat recover $8,700/month in abandoned carts on average",
            stat3: "AI customer service reduces return rates by 34% by preempting buyer's remorse",
            avgMissedRevenue: "$6,000–$20,000/month",
            competitorAdvantage: "AI that recovers abandoned carts and converts lookers into buyers 24/7",
            biggestFear: "Thousands in revenue leaving in abandoned carts every single night",
        };
    }

    if (ind.includes("coach") || ind.includes("consult") || ind.includes("agency") || ind.includes("market")) {
        return {
            headline: "Marketing agencies lose 45% of their inbound leads to slow response times",
            stat1: "Average consulting firm misses 6–10 qualified leads/week during client delivery",
            stat2: "Cost of a missed agency lead: $2,400–$18,000 in annual contract value",
            stat3: "Agencies with AI intake close 2.8x more proposals from the same ad spend",
            avgMissedRevenue: "$8,000–$25,000/month",
            competitorAdvantage: "AI that qualifies leads and books discovery calls while you focus on delivery",
            biggestFear: "A $15,000/month retainer going to a competitor because you were heads-down on a client",
        };
    }

    if (ind.includes("call center") || ind.includes("bpo") || ind.includes("contact center")) {
        return {
            headline: "Call centers lose 62% of overflow calls — each one is a lead going to zero",
            stat1: "Average cost per human agent interaction: $3–$6 | AI: $0.25",
            stat2: "Call centers handling 10,000 calls/month save $27,500–$57,000/month with AI",
            stat3: "AI agents handle 80% of Tier 1 inquiries with 94% customer satisfaction",
            avgMissedRevenue: "$30,000–$120,000/month",
            competitorAdvantage: "AI agents that handle overflow at $0.25/call, 24/7, with zero bad days",
            biggestFear: "Paying $600,000/year in agent salaries for calls AI could handle for $50,000",
        };
    }

    // Default — generic small business
    return {
        headline: "Small businesses miss 62% of inbound calls — each a potential customer lost forever",
        stat1: "Average small business loses $4,200–$7,500/month to missed calls and slow follow-up",
        stat2: "80% of callers don't leave voicemails — they call a competitor instead",
        stat3: "Businesses with AI response see 3.4x more leads convert to clients",
        avgMissedRevenue: "$4,200–$7,500/month",
        competitorAdvantage: "AI that answers every call in under 1 second, 24/7/365",
        biggestFear: "Losing a perfect customer to a competitor who simply answered the phone faster",
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// INDUSTRY VISUAL LANGUAGE
// Maps each industry to color, mood, and physical elements
// ─────────────────────────────────────────────────────────────────────────────

interface IndustryVisual {
    elements: string;
    colors: string;
    mood: string;
}

function getIndustryVisuals(industry: string): IndustryVisual {
    const ind = industry.toLowerCase();

    if (ind.includes("bookkeep") || ind.includes("account") || ind.includes("cpa")) {
        return {
            elements: "modern accounting office, financial dashboards, spreadsheets with glowing data rows, professional desk setup, calculator, tax documents",
            colors: "navy blue, gold, crisp white",
            mood: "precise, trustworthy, authoritative",
        };
    }
    if (ind.includes("attorney") || ind.includes("law") || ind.includes("legal")) {
        return {
            elements: "prestigious law office, scales of justice, legal books, courtroom architecture, gavel, mahogany desk, case files",
            colors: "deep mahogany, brass gold, dark navy",
            mood: "authoritative, established, trustworthy",
        };
    }
    if (ind.includes("restaurant") || ind.includes("food") || ind.includes("cafe") || ind.includes("bar")) {
        return {
            elements: "beautifully plated cuisine, warm restaurant lighting, busy kitchen brigade, reservation book, premium ingredients",
            colors: "warm amber, deep burgundy, cream",
            mood: "inviting, delicious, vibrant",
        };
    }
    if (ind.includes("dental") || ind.includes("dentist")) {
        return {
            elements: "modern dental office, high-tech dental chair, digital x-ray displays, pristine white clinical environment, bright smiles",
            colors: "clean white, electric blue, medical teal",
            mood: "trusted, professional, cutting-edge healthcare",
        };
    }
    if (ind.includes("real estate") || ind.includes("realtor")) {
        return {
            elements: "luxury home exterior, modern architecture, city skyline, sold signs, open house setting, holographic property listings",
            colors: "gold, deep navy, white marble",
            mood: "aspirational, successful, wealth",
        };
    }
    if (ind.includes("med spa") || ind.includes("spa") || ind.includes("aesthetic")) {
        return {
            elements: "luxury spa treatment room, soft lighting, premium skincare products, glowing skin, serene environment",
            colors: "rose gold, champagne, soft lavender",
            mood: "luxurious, rejuvenating, exclusive",
        };
    }
    if (ind.includes("hvac") || ind.includes("plumb") || ind.includes("home service")) {
        return {
            elements: "professional service van with branding, technician uniform, tools of the trade, modern home exterior, digital dispatch tablet",
            colors: "deep navy, orange, silver",
            mood: "reliable, professional, responsive",
        };
    }
    if (ind.includes("medical") || ind.includes("clinic") || ind.includes("health")) {
        return {
            elements: "advanced medical facility, diagnostic equipment, doctor with digital tablet, patient care vignettes",
            colors: "clean white, healing green, medical blue",
            mood: "trustworthy, caring, cutting-edge",
        };
    }

    return {
        elements: "modern professional office, digital growth charts, AI-powered business tools, glass-walled boardroom",
        colors: "deep navy, electric blue, gold accents",
        mood: "innovative, successful, forward-thinking",
    };
}

// ─────────────────────────────────────────────────────────────────────────────
// CONVERSATION PHASE DETECTOR
// Maps topic keywords → brain layer when explicit phase isn't provided
// ─────────────────────────────────────────────────────────────────────────────

function derivePhaseFromTopic(topic: string): "reptilian" | "limbic" | "neocortex" | "close" {
    const t = topic.toLowerCase();
    if (t.includes("welcome") || t.includes("greeting") || t.includes("intro") || t.includes("missed") || t.includes("losing")) return "reptilian";
    if (t.includes("understand") || t.includes("feel") || t.includes("challenges") || t.includes("imagine") || t.includes("vision")) return "limbic";
    if (t.includes("roi") || t.includes("math") || t.includes("revenue") || t.includes("audit") || t.includes("data") || t.includes("number")) return "neocortex";
    if (t.includes("close") || t.includes("start") || t.includes("checkout") || t.includes("ready") || t.includes("pricing")) return "close";
    return "reptilian"; // Default — always start with the wound
}

// ─────────────────────────────────────────────────────────────────────────────
// NEURO-PROMPT BUILDER
// The core engine — builds scientifically-mapped image prompts
// ─────────────────────────────────────────────────────────────────────────────

interface NeuroPromptParams {
    prospectName?: string;
    businessName?: string;
    industry: string;
    topic: string;
    conversationPhase: "reptilian" | "limbic" | "neocortex" | "close";
    painPoint?: string;
    auditData?: Record<string, unknown>;
    style: string;
    industryStats: IndustryStats;
    industryVisuals: IndustryVisual;
}

interface NeuroPromptResult {
    imagePrompt: string;
    neuroReason: string;
    brainLayer: string;
}

function buildNeuroPrompt(p: NeuroPromptParams): NeuroPromptResult {
    const name = p.prospectName || "a business owner";
    const biz = p.businessName || "their business";
    const ind = p.industry;
    const stats = p.industryStats;
    const visuals = p.industryVisuals;

    let sceneDescription = "";
    let neuroReason = "";
    let brainLayer = "";

    // ═══════════════════════════════════════════════════════════════
    // REPTILIAN BRAIN — Phase 1: Open the wound with REAL statistics
    // Goal: Trigger cortisol (attention) + survival instinct (threat)
    // Technique: Show industry-specific data about what they're LOSING
    // ═══════════════════════════════════════════════════════════════
    if (p.conversationPhase === "reptilian") {
        brainLayer = "REPTILIAN";
        neuroReason = `Reptilian activation: ${stats.biggestFear}`;

        sceneDescription = `
Scene concept: INDUSTRY STATISTICS DASHBOARD — The Bleeding Revenue Visualization

Show a dramatic, cinematic data visualization specific to the ${ind} industry.
The visual should feel like a private intelligence briefing — powerful, authoritative, slightly alarming.

PRIMARY DATA DISPLAYED (visually prominent, large text):
"${stats.headline}"

SECONDARY STATISTICS (smaller but visible):
• "${stats.stat1}"
• "${stats.stat2}"  
• "Average ${ind} monthly revenue leak: ${stats.avgMissedRevenue}"

SCENE COMPOSITION:
- Dark, premium background — deep navy to black gradient
- The statistics appear as glowing data panels or holographic displays
- Include subtle ${ind} industry imagery in the background: ${visuals.elements}
- A visual metaphor for money leaving: glowing golden coins flowing out of frame, or a 
  downward-draining hourglass made of dollar signs
- One area subtly shows a competitor flourishing while the main business struggles
- Cinematic red/amber accent lighting for urgency — this is a threat, not an opportunity

NEURO-ENGINEERING: This image activates the reptilian brain's threat-detection system.
The prospect's brain sees real statistics about THEIR industry and thinks "that's me."
Cortisol spikes attention. The brain is now receptive to the solution.
${p.painPoint ? `\nSPECIFIC PAIN CONTEXT: ${p.painPoint}` : ""}`;
    }

    // ═══════════════════════════════════════════════════════════════
    // LIMBIC BRAIN — Phase 2: Build the emotional bridge
    // Goal: Trigger oxytocin (trust) + dopamine (hope/anticipation)
    // Technique: Show the transformation — from their struggle to the future win
    // ═══════════════════════════════════════════════════════════════
    else if (p.conversationPhase === "limbic") {
        brainLayer = "LIMBIC";
        neuroReason = `Limbic activation: Before/after transformation for ${biz} in ${ind}`;

        sceneDescription = `
Scene concept: THE TRANSFORMATION MOMENT — Before & After Split Scene

Show a dramatic split-screen or transition image for "${biz}":

LEFT SIDE — THE CURRENT REALITY (dim, stressed, losing):
- A ${ind} business owner looking overwhelmed at a phone with missed calls
- Phone screen showing "8 missed calls" — golden coins fading away into darkness
- The office feels quiet, understaffed, struggling
- Color palette: desaturated, blue-grey tones — feels cold and heavy
- Caption (if any): "Before BioDynamX"

RIGHT SIDE — THE TRANSFORMED FUTURE (vibrant, thriving, winning):
- The same business owner — now relaxed, confident, smiling
- Industry-specific success imagery: ${visuals.elements}
- AI agents visible in background (glowing interface, calls being handled automatically)
- Business is clearly thriving — customers, activity, energy
- Color palette: ${visuals.colors} — warm, electric, alive
- A subtle upward revenue graph glowing in the corner
- Caption (if any): "After BioDynamX"

DIVIDING LINE: A glowing electric blue line separates the two realities — representing the moment of decision.

NEURO-ENGINEERING: The limbic brain processes emotion before logic. This split-scene activates mirror neurons — the prospect FEELS both realities simultaneously. Oxytocin builds toward the solution vision. Dopamine anticipates the right-side outcome.
${p.painPoint ? `\nSPECIFIC PAIN CONTEXT: ${p.painPoint}` : ""}`;
    }

    // ═══════════════════════════════════════════════════════════════
    // NEOCORTEX BRAIN — Phase 3: Give the logical brain its permission
    // Goal: Trigger certainty via data — ROI math, proof, specifics
    // Technique: Show the NUMBERS in a premium analytical display
    // ═══════════════════════════════════════════════════════════════
    else if (p.conversationPhase === "neocortex") {
        brainLayer = "NEOCORTEX";
        neuroReason = `Neocortex activation: ROI visualization and data proof for ${ind}`;

        // Pull live audit numbers if available
        const auditRevenue = p.auditData?.revenueEstimate as Record<string, unknown> | undefined;
        const monthlyLeak = auditRevenue?.leakingRevenue || stats.avgMissedRevenue;
        const grade = p.auditData?.grade || "C";

        sceneDescription = `
Scene concept: THE ROI INTELLIGENCE DASHBOARD — Data-Driven Decision Visualization

Show a stunning, premium business intelligence dashboard for "${biz}":

MAIN PANEL — THE MATH (large, centered, glowing):
"Monthly Revenue Leak: ${monthlyLeak}"
"BioDynamX Investment: $497/month"  
"ROI: 5x Guaranteed or Full Refund"
"Break-even: Day 1"

SUPPORTING DATA PANELS:
• Current site/business grade: "${grade}" → Target: "A+"
• "${stats.stat3}"
• Industry benchmark: "${stats.competitorAdvantage}"
• Timeline: "Go live in 24 hours"

VISUAL DESIGN:
- Premium dark dashboard aesthetic — think Bloomberg Terminal meets Apple AI
- Glowing blue/cyan data streams flowing upward (growth)
- Revenue recovery bar: shows monthly leak → recovery → profit
- Small animated-looking chart showing exponential ROI curve
- BioDynamX logo subtly integrated into dashboard UI
- The data should feel like it was pulled SPECIFICALLY for this business — personalized, real

${p.auditData ? `AUDIT-SPECIFIC DATA TO INTEGRATE: SEO score, site speed, competitor gap — make these visible as real metrics` : ""}

NEURO-ENGINEERING: The neocortex needs data to rationalize the emotional decision already made. This dashboard gives the logical brain the numbers it needs to say YES. The math is undeniable. The visual eliminates doubt.`;
    }

    // ═══════════════════════════════════════════════════════════════
    // CLOSE PHASE — The Moment of Transformation / Decision Point
    // Goal: Create adrenaline + make the "yes" feel inevitable
    // Technique: The dramatic before/after completion — WIN state
    // ═══════════════════════════════════════════════════════════════
    else if (p.conversationPhase === "close") {
        brainLayer = "CLOSE";
        neuroReason = `Close activation: Decision visualization — the win state for ${biz}`;

        sceneDescription = `
Scene concept: THE DECISION MOMENT — The Transformation is Available RIGHT NOW

Show a dramatic, premium closing visualization:

PRIMARY IMAGE:
- A massive, glowing door opening — revealing a thriving ${ind} business on the other side
- Through the door: ${visuals.elements}, everything working perfectly, AI agents active, revenue flowing
- The door frame glows ${visuals.colors} — warm, inviting, immediately available
- This side of the door: the old, struggling reality fading into darkness behind the viewer

SECONDARY ELEMENTS:
- A glowing button or seal in the corner: "GO LIVE IN 24 HOURS"
- Revenue trajectory: upward arrow made of light, labeled "5x ROI Guaranteed"
- The subtle text: "One Decision Away"

EMOTIONAL TONE: 
- Awe-inspiring, cinematic, premium
- The viewer should feel: "This is available RIGHT NOW — I just have to decide"
- Not pressure — POSSIBILITY. The door is OPEN.

NEURO-ENGINEERING: Adrenaline activates at the moment of decision. This image amplifies that feeling of momentum and makes the "YES" feel like the natural next step — not a risk, but a release. The glowing door is a classic limbic escape signal: safety, progress, relief.`;
    }

    // Full prompt assembly
    const imagePrompt = `Create a stunning, premium cinematic marketing image for a ${ind} business called "${biz}" owned by ${name}.

${sceneDescription}

UNIVERSAL VISUAL REQUIREMENTS:
- Style: ${p.style} — this must look absolutely premium and cinematic
- Resolution quality: 8K photorealistic detail
- Text rule: MINIMAL TEXT — maximum 5-6 words, only the most critical statistic or phrase
- Aspect ratio: 16:9 widescreen cinematic
- Industry visual language: ${visuals.elements}
- Color palette: ${visuals.colors}
- Mood: ${visuals.mood}
- No watermarks, no UI chrome, no icons — pure cinematic impact
- This image should trigger a physiological response: awe, relief, urgency, or hope
- Dark, premium aesthetic with ${visuals.colors} accent lighting
- Photorealistic, not illustrated — this is NOT an infographic, it's a SCENE`;

    return { imagePrompt, neuroReason, brainLayer };
}
