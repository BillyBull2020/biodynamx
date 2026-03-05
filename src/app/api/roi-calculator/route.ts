import { NextRequest, NextResponse } from "next/server";

// ═══════════════════════════════════════════════════════════════════════════════
// ROI CALCULATOR — Personalized Financial Projection
// ═══════════════════════════════════════════════════════════════════════════════
// Takes REAL audit data and builds a granular, personalized ROI model.
// Mark uses this to make the close feel mathematical, not emotional.

interface ROIInput {
    domain: string;
    industry?: string;
    // From the audit
    monthlyTraffic?: number;
    currentConversionRate?: number;
    leakingRevenueMonthly?: number;
    missedCallsPerMonth?: number;
    avgDealValue?: number;
    siteSpeedScore?: number;
    seoScore?: number;
    aeoScore?: number;
    contentScore?: number;
    ghostingScore?: string;
    reputationStatus?: string;
    socialStatus?: string;
    // Optional overrides from conversation
    monthlyRevenue?: number;
    teamSize?: number;
}

interface ROIBreakdown {
    category: string;
    currentLoss: number;
    recoverable: number;
    timeToRecover: string;
    howWeFixIt: string;
}

interface ROIResult {
    domain: string;
    totalMonthlyLoss: number;
    totalRecoverableMonthly: number;
    totalRecoverableAnnually: number;
    roiMultiplier: number;
    paybackPeriodDays: number;
    breakdown: ROIBreakdown[];
    biodynamxInvestment: number;
    netGainMonthly: number;
    netGainAnnually: number;
    confidenceLevel: "high" | "medium" | "conservative";
    agentScript: string;
    closingStatement: string;
    timestamp: string;
}

export async function POST(req: NextRequest) {
    try {
        const input: ROIInput = await req.json();

        if (!input.domain) {
            return NextResponse.json({ error: "Domain is required" }, { status: 400 });
        }

        const breakdown: ROIBreakdown[] = [];
        let totalMonthlyLoss = 0;
        let totalRecoverable = 0;
        const biodynamxInvestment = 497; // $497/mo

        // ── Category 1: Speed & Conversion Recovery ──
        if (input.siteSpeedScore !== undefined && input.siteSpeedScore < 70) {
            const trafficLoss = Math.floor((input.monthlyTraffic || 5000) * ((70 - input.siteSpeedScore) / 100) * 0.4);
            const revenueLoss = trafficLoss * (input.avgDealValue || 200) * 0.03;
            const recoverable = Math.floor(revenueLoss * 0.6);
            breakdown.push({
                category: "Site Speed → Visitor Drop-Off",
                currentLoss: Math.floor(revenueLoss),
                recoverable,
                timeToRecover: "2-4 weeks",
                howWeFixIt: "AI-optimized CDN + image compression + lazy loading deployment",
            });
            totalMonthlyLoss += revenueLoss;
            totalRecoverable += recoverable;
        }

        // ── Category 2: Missed Call Revenue ──
        const missedCalls = input.missedCallsPerMonth || 0;
        if (missedCalls > 0) {
            const dealValue = input.avgDealValue || 200;
            const closeRate = 0.15;
            const callLoss = missedCalls * dealValue * closeRate;
            const recoverable = Math.floor(callLoss * 0.85); // AI answers 85% successfully
            breakdown.push({
                category: "Missed Calls → Voicemail Black Hole",
                currentLoss: Math.floor(callLoss),
                recoverable,
                timeToRecover: "48 hours",
                howWeFixIt: "24/7 AI voice agent answers every call in <1 second, qualifies leads, books appointments",
            });
            totalMonthlyLoss += callLoss;
            totalRecoverable += recoverable;
        }

        // ── Category 3: SEO Invisibility ──
        if (input.seoScore !== undefined && input.seoScore < 70) {
            const organicTrafficLost = Math.floor((input.monthlyTraffic || 5000) * 0.3);
            const seoLoss = organicTrafficLost * (input.avgDealValue || 200) * 0.02;
            const recoverable = Math.floor(seoLoss * 0.5);
            breakdown.push({
                category: "SEO Gaps → Organic Traffic Leak",
                currentLoss: Math.floor(seoLoss),
                recoverable,
                timeToRecover: "30-90 days",
                howWeFixIt: "Technical SEO audit + schema markup + title/meta optimization + content strategy",
            });
            totalMonthlyLoss += seoLoss;
            totalRecoverable += recoverable;
        }

        // ── Category 4: AEO/GEO Invisibility ──
        if (input.aeoScore !== undefined && input.aeoScore < 50) {
            const aiTrafficMissed = Math.floor((input.monthlyTraffic || 5000) * 0.15);
            const aeoLoss = aiTrafficMissed * (input.avgDealValue || 200) * 0.025;
            const recoverable = Math.floor(aeoLoss * 0.4);
            breakdown.push({
                category: "AI Invisibility → Zero Share of Voice",
                currentLoss: Math.floor(aeoLoss),
                recoverable,
                timeToRecover: "60-120 days",
                howWeFixIt: "Schema optimization for LLMs + FAQ structure + authority signals for AI citation",
            });
            totalMonthlyLoss += aeoLoss;
            totalRecoverable += recoverable;
        }

        // ── Category 5: Digital Ghosting ──
        if (input.ghostingScore === "critical" || input.ghostingScore === "poor") {
            const ghostedLeads = Math.floor((input.monthlyTraffic || 5000) * 0.05);
            const ghostLoss = ghostedLeads * (input.avgDealValue || 200) * 0.1;
            const recoverable = Math.floor(ghostLoss * 0.7);
            breakdown.push({
                category: "Slow Response → Leads Going to Competitors",
                currentLoss: Math.floor(ghostLoss),
                recoverable,
                timeToRecover: "24 hours",
                howWeFixIt: "AI instant response on web, SMS, and voice — engages leads within 8 seconds",
            });
            totalMonthlyLoss += ghostLoss;
            totalRecoverable += recoverable;
        }

        // ── Category 6: Reputation Erosion ──
        if (input.reputationStatus === "stale" || input.reputationStatus === "critical") {
            const reputationLoss = (input.avgDealValue || 200) * 15; // ~15 lost customers
            const recoverable = Math.floor(reputationLoss * 0.5);
            breakdown.push({
                category: "Unanswered Reviews → Trust Erosion",
                currentLoss: Math.floor(reputationLoss),
                recoverable,
                timeToRecover: "1-2 weeks",
                howWeFixIt: "AI reputation engine auto-responds to reviews + generates new review requests post-service",
            });
            totalMonthlyLoss += reputationLoss;
            totalRecoverable += recoverable;
        }

        // ── Category 7: Content & CTA Gaps ──
        if (input.contentScore !== undefined && input.contentScore < 40) {
            const contentLoss = Math.floor((input.monthlyTraffic || 5000) * 0.08 * (input.avgDealValue || 200) * 0.015);
            const recoverable = Math.floor(contentLoss * 0.45);
            breakdown.push({
                category: "Weak Content → Visitors Bounce Without Converting",
                currentLoss: Math.floor(contentLoss),
                recoverable,
                timeToRecover: "2-4 weeks",
                howWeFixIt: "AI content engine creates conversion-optimized copy + CTAs + testimonial integration",
            });
            totalMonthlyLoss += contentLoss;
            totalRecoverable += recoverable;
        }

        // ── Category 8: Social Media Ghost Town ──
        if (input.socialStatus === "ghost_town") {
            const socialLoss = (input.avgDealValue || 200) * 5;
            const recoverable = Math.floor(socialLoss * 0.4);
            breakdown.push({
                category: "Dead Social Media → Zero Brand Awareness",
                currentLoss: Math.floor(socialLoss),
                recoverable,
                timeToRecover: "1-2 weeks",
                howWeFixIt: "AI social media manager — automated content calendar, posting, and engagement",
            });
            totalMonthlyLoss += socialLoss;
            totalRecoverable += recoverable;
        }

        // ── Final calculations ──
        totalMonthlyLoss = Math.floor(totalMonthlyLoss);
        totalRecoverable = Math.floor(totalRecoverable);
        const netGainMonthly = totalRecoverable - biodynamxInvestment;
        const roiMultiplier = totalRecoverable > 0 ? Math.round((totalRecoverable / biodynamxInvestment) * 10) / 10 : 0;
        const paybackPeriodDays = totalRecoverable > 0 ? Math.max(1, Math.ceil(biodynamxInvestment / (totalRecoverable / 30))) : 999;

        // Confidence level
        let confidenceLevel: "high" | "medium" | "conservative";
        if (breakdown.length >= 5) confidenceLevel = "high";
        else if (breakdown.length >= 3) confidenceLevel = "medium";
        else confidenceLevel = "conservative";

        // Agent scripts
        const topCategories = breakdown
            .sort((a, b) => b.recoverable - a.recoverable)
            .slice(0, 3)
            .map(b => b.category);

        const agentScript = `Based on the diagnostic, I've identified ${breakdown.length} active revenue leaks totaling $${totalMonthlyLoss.toLocaleString()} per month. ` +
            `The biggest ones are: ${topCategories.join(", ")}. ` +
            `With BioDynamX deployed, we can recover approximately $${totalRecoverable.toLocaleString()} per month — that's a ${roiMultiplier}x return on a $${biodynamxInvestment}/month investment. ` +
            `You'd break even in ${paybackPeriodDays} days.`;

        const closingStatement = `So here's the math: you're losing $${totalMonthlyLoss.toLocaleString()} every single month you wait. ` +
            `BioDynamX costs $${biodynamxInvestment}/month and recovers $${totalRecoverable.toLocaleString()}/month. ` +
            `That's $${netGainMonthly.toLocaleString()} in net profit — every month. ` +
            `The question isn't whether you can afford BioDynamX. It's how many more months of $${totalMonthlyLoss.toLocaleString()} losses can you absorb?`;

        const result: ROIResult = {
            domain: input.domain,
            totalMonthlyLoss,
            totalRecoverableMonthly: totalRecoverable,
            totalRecoverableAnnually: totalRecoverable * 12,
            roiMultiplier,
            paybackPeriodDays,
            breakdown: breakdown.sort((a, b) => b.recoverable - a.recoverable),
            biodynamxInvestment,
            netGainMonthly,
            netGainAnnually: netGainMonthly * 12,
            confidenceLevel,
            agentScript,
            closingStatement,
            timestamp: new Date().toISOString(),
        };

        return NextResponse.json(result);
    } catch (err) {
        console.error("[ROI Calculator] Error:", err);
        return NextResponse.json({ error: "ROI calculation failed: " + String(err) }, { status: 500 });
    }
}
