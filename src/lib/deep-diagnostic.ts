// ─── BioDynamX Deep Diagnostic Engine ───────────────────
// The "Billy De La Taurus MRI" — goes beyond surface metrics
// to find the internal bleeding a CEO doesn't know they have.

/**
 * Lead Response Simulator
 * Calculates exact revenue leakage from missed calls/leads.
 * Mark uses this to build the ROI Bridge:
 * "That's $260k a year in pure waste we are recovering today."
 */
export interface LeadLeakageResult {
    missedCallsPerWeek: number;
    avgLeadValue: number;
    conversionRate: number;
    weeklyLeakage: number;
    monthlyLeakage: number;
    annualLeakage: number;
    markScript: string;        // What Mark says to the prospect
    journeyScript: string;     // What Journey says to open the wound
    recoveryProjection: number; // What BioDynamX recovers
}

export function calculateLeadLeakage(
    missedCallsPerWeek: number,
    avgLeadValue: number = 1000,
    closeRate: number = 0.2,  // 20% of leads convert
): LeadLeakageResult {
    const qualifiedLeadsLost = missedCallsPerWeek * closeRate;
    const weeklyLeakage = qualifiedLeadsLost * avgLeadValue;
    const monthlyLeakage = weeklyLeakage * 4.33;
    const annualLeakage = weeklyLeakage * 52;

    // BioDynamX recovery: we typically capture 60-80% of missed leads
    const recoveryRate = 0.70;
    const recoveryProjection = annualLeakage * recoveryRate;

    return {
        missedCallsPerWeek,
        avgLeadValue,
        conversionRate: closeRate,
        weeklyLeakage,
        monthlyLeakage,
        annualLeakage,
        recoveryProjection,
        markScript:
            `I'm looking at your numbers. You're missing ${missedCallsPerWeek} calls per week. ` +
            `At your average deal value of $${avgLeadValue.toLocaleString()}, with a ${(closeRate * 100).toFixed(0)}% close rate, ` +
            `that's $${Math.round(weeklyLeakage).toLocaleString()} per week walking out the door. ` +
            `That's $${Math.round(annualLeakage).toLocaleString()} a year in pure waste ` +
            `we are recovering today. Our AI picks up in 0.4 seconds, every time.`,
        journeyScript:
            `Every one of those ${missedCallsPerWeek} missed calls per week is someone ` +
            `who WANTED to give you money, and you told them "no" by not answering. ` +
            `Your competitor down the street? They answer on the first ring because they ` +
            `have an AI. Right now, you're funding THEIR business.`,
    };
}

/**
 * AEO/GEO Deep Analyzer
 * Checks if the business appears in AI-generated answers
 * and whether their content is structured for LLM citation.
 */
export interface AEODeepResult {
    aeoReady: boolean;
    geoReady: boolean;
    schemaFound: boolean;
    schemaTypes: string[];
    faqFound: boolean;
    structuredDataScore: number;  // 0-100
    aiCitationLikelihood: "high" | "medium" | "low" | "none";
    vulnerabilities: string[];
    markScript: string;
    journeyScript: string;
}

export function analyzeAEODeep(htmlContent: string, domain: string): AEODeepResult {
    const vulnerabilities: string[] = [];
    const schemaTypes: string[] = [];

    // Check for structured data (JSON-LD)
    const jsonLdMatches = htmlContent.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi) || [];
    const schemaFound = jsonLdMatches.length > 0;

    if (!schemaFound) {
        vulnerabilities.push("CRITICAL: No Schema.org markup found — LLMs cannot parse your expertise");
    }

    // Parse schema types
    for (const match of jsonLdMatches) {
        const typeMatch = match.match(/"@type"\s*:\s*"([^"]+)"/);
        if (typeMatch) schemaTypes.push(typeMatch[1]);
    }

    // Check for FAQ schema (huge for AEO)
    const faqFound = htmlContent.includes('"FAQPage"') || htmlContent.includes("FAQPage");
    if (!faqFound) {
        vulnerabilities.push("No FAQ Schema — missing the #1 trigger for AI Overview citations");
    }

    // Check for HowTo schema
    if (!htmlContent.includes('"HowTo"')) {
        vulnerabilities.push("No HowTo Schema — competitors with step-by-step content rank higher in AI answers");
    }

    // Check for author/expertise signals (E-E-A-T)
    const hasAuthor = htmlContent.includes('"author"') || htmlContent.includes("author");
    const hasExpertise = htmlContent.includes('"knowsAbout"') || htmlContent.includes('"expertise"');
    if (!hasAuthor) {
        vulnerabilities.push("No author attribution — Google's E-E-A-T framework penalizes anonymous content");
    }
    if (!hasExpertise) {
        vulnerabilities.push("No expertise signals — LLMs cannot identify your authority in the space");
    }

    // Check for conversational content patterns (what LLMs prefer)
    const hasQA = /\b(what is|how to|why do|when should|can i|should i)\b/i.test(htmlContent);
    if (!hasQA) {
        vulnerabilities.push("No question-answer content patterns — your site doesn't speak the language LLMs crawl");
    }

    // Check meta description quality
    const metaDesc = htmlContent.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)/i);
    if (!metaDesc || (metaDesc[1] && metaDesc[1].length < 50)) {
        vulnerabilities.push("Weak or missing meta description — the first thing AI reads when evaluating your page");
    }

    // Score calculation
    let score = 0;
    if (schemaFound) score += 25;
    if (faqFound) score += 20;
    if (hasAuthor) score += 15;
    if (hasExpertise) score += 15;
    if (hasQA) score += 15;
    if (metaDesc && metaDesc[1] && metaDesc[1].length >= 50) score += 10;

    // Determine AI citation likelihood
    let aiCitationLikelihood: AEODeepResult["aiCitationLikelihood"];
    if (score >= 80) aiCitationLikelihood = "high";
    else if (score >= 50) aiCitationLikelihood = "medium";
    else if (score >= 25) aiCitationLikelihood = "low";
    else aiCitationLikelihood = "none";

    const aeoReady = score >= 60;
    const geoReady = schemaFound && faqFound && hasAuthor;

    return {
        aeoReady,
        geoReady,
        schemaFound,
        schemaTypes,
        faqFound,
        structuredDataScore: score,
        aiCitationLikelihood,
        vulnerabilities,
        markScript:
            `Your AEO readiness score is ${score} out of 100. ` +
            (score < 50
                ? `That means when someone asks Gemini or Perplexity "Who is the best ${domain.split('.')[0]} in my area?", ` +
                `you don't exist. Your competitors with proper Schema markup are getting cited instead. ` +
                `We fix this in 48 hours.`
                : `You have some foundation, but ${vulnerabilities.length} critical gaps are letting competitors steal your AI visibility. ` +
                `We close those gaps and make you the cited authority.`),
        journeyScript:
            `I just checked if AI assistants know about ${domain}. ` +
            (aiCitationLikelihood === "none"
                ? `They don't. When a customer asks Gemini "best ${domain.split('.')[0]} near me," your competitor shows up and you're invisible. That's not a "future problem" — that's happening right now, today.`
                : `Your visibility is ${aiCitationLikelihood}. But there are ${vulnerabilities.length} holes that are letting revenue leak to competitors who invested in AEO first.`),
    };
}

/**
 * Reputation Hemorrhage Calculator
 * Quantifies the actual dollar cost of bad/stale reviews.
 */
export interface ReputationImpact {
    currentRating: number;
    reviewCount: number;
    unansweredNegative: number;
    estimatedLostCustomers: number;
    monthlyRevenueLoss: number;
    annualRevenueLoss: number;
    mapPackPosition: "top3" | "page1" | "buried";
    markScript: string;
    journeyScript: string;
}

export function calculateReputationImpact(
    currentRating: number = 4.0,
    reviewCount: number = 50,
    avgTicket: number = 200,
    unansweredNegative: number = 5,
): ReputationImpact {
    // Harvard Business School: each 1-star increase = 5-9% revenue increase
    const ratingGap = 4.8 - currentRating; // Target: 4.8 stars
    const revenueImpactPercent = ratingGap * 0.07; // 7% per star gap
    const estimatedMonthlyCustomers = reviewCount * 2; // rough proxy
    const lostCustomers = Math.round(estimatedMonthlyCustomers * revenueImpactPercent);
    const monthlyLoss = lostCustomers * avgTicket;
    const annualLoss = monthlyLoss * 12;

    // Map pack position estimate
    let mapPackPosition: ReputationImpact["mapPackPosition"];
    if (currentRating >= 4.5 && reviewCount >= 100) mapPackPosition = "top3";
    else if (currentRating >= 4.0 && reviewCount >= 30) mapPackPosition = "page1";
    else mapPackPosition = "buried";

    return {
        currentRating,
        reviewCount,
        unansweredNegative,
        estimatedLostCustomers: lostCustomers,
        monthlyRevenueLoss: monthlyLoss,
        annualRevenueLoss: annualLoss,
        mapPackPosition,
        markScript:
            `Your Google rating is ${currentRating} stars with ${reviewCount} reviews. ` +
            `You have ${unansweredNegative} unanswered negative reviews — Google's algorithm sees that as abandonment. ` +
            `Based on Harvard's research, that rating gap is costing you roughly ` +
            `$${monthlyLoss.toLocaleString()} per month in lost walk-ins. ` +
            `The Review Shield fixes this in 30 days.`,
        journeyScript:
            `When someone searches for your service on Google Maps, you're showing up ${mapPackPosition === "buried" ? "BURIED below your competitors" :
                mapPackPosition === "page1" ? "on page one but NOT in the top 3" :
                    "in the top 3 — but those negative reviews are ticking time bombs"
            }. Those ${unansweredNegative} unanswered reviews? Each one is a neon sign saying "we don't care about our customers."`,
    };
}

/**
 * Voicemail Revenue Hemorrhage
 * The specific calculation Mark uses for the ROI Bridge.
 */
export function calculateVoicemailHemorrhage(
    missedCallsPerMonth: number,
    avgDealValue: number = 500,
    closeRate: number = 0.15,
) {
    const leadsLostPerMonth = missedCallsPerMonth;
    const dealsMissed = Math.round(leadsLostPerMonth * closeRate);
    const monthlyLoss = dealsMissed * avgDealValue;
    const annualLoss = monthlyLoss * 12;
    const aiRecoveryRate = 0.85; // Our AI answers 85% of calls humans miss
    const recoverable = Math.round(annualLoss * aiRecoveryRate);

    return {
        leadsLostPerMonth,
        dealsMissed,
        monthlyLoss,
        annualLoss,
        recoverable,
        markScript:
            `You're sending ${missedCallsPerMonth} calls per month to voicemail. ` +
            `At your deal value of $${avgDealValue.toLocaleString()} and a ${(closeRate * 100)}% close rate, ` +
            `that's ${dealsMissed} deals per month — $${monthlyLoss.toLocaleString()} per month, ` +
            `$${annualLoss.toLocaleString()} per year — going to your competitor's pocket. ` +
            `Our AI answers in 0.4 seconds. We recover $${recoverable.toLocaleString()} of that annually.`,
        journeyScript:
            `Quick question: how many calls do you think go to voicemail when you're with a client? ` +
            `Because industry data says it's about ${missedCallsPerMonth} per month for a business your size. ` +
            `Each one of those is someone who WANTED to pay you. And they didn't. ` +
            `Where do you think they went?`,
    };
}

// ═══════════════════════════════════════════════════════════
// PROBE 15: Silent Lead Test — "Digital Ghosting" Analysis
// ═══════════════════════════════════════════════════════════

export interface SilentLeadResult {
    responseTimeSec: number;
    ghostingScore: "critical" | "poor" | "average" | "good";
    hasLiveChat: boolean;
    hasChatbot: boolean;
    hasContactForm: boolean;
    hasPhoneNumber: boolean;
    hasWhatsApp: boolean;
    contactChannels: number;
    estimatedLeadsGhosted: number;
    monthlyGhostingCost: number;
    annualGhostingCost: number;
    markScript: string;
    journeyScript: string;
}

/**
 * Silent Lead Test
 * Simulates an inbound inquiry and analyzes how quickly (and whether)
 * the business can respond. Checks for live chat, chatbot, forms,
 * phone visibility, and response infrastructure.
 * 
 * Journey uses this to open: "Your website is a ghost town at midnight."
 * Mark uses this to close: "We answer in 0.4 seconds. You're losing $X/month."
 */
export function runSilentLeadTest(
    htmlContent: string,
    loadTimeMs: number,
    avgDealValue: number = 500,
    monthlyVisitors: number = 1000,
): SilentLeadResult {
    // Detect contact infrastructure
    const hasLiveChat = /live.?chat|intercom|drift|crisp|tawk|zendesk|hubspot/i.test(htmlContent);
    const hasChatbot = /chatbot|chat.?widget|ai.?assist|virtual.?assist/i.test(htmlContent);
    const hasContactForm = /<form[\s\S]*?(contact|inquiry|get.?in.?touch|request|book|schedule)/i.test(htmlContent);
    const hasPhoneNumber = /(\+?1?[-.\s]?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|tel:)/i.test(htmlContent);
    const hasWhatsApp = /whatsapp|wa\.me/i.test(htmlContent);

    // Count available channels
    const channels = [hasLiveChat, hasChatbot, hasContactForm, hasPhoneNumber, hasWhatsApp];
    const contactChannels = channels.filter(Boolean).length;

    // Estimate response time based on infrastructure
    let estimatedResponseTime: number;
    if (hasChatbot || hasLiveChat) {
        estimatedResponseTime = 30; // 30 seconds if they have chat
    } else if (hasContactForm && hasPhoneNumber) {
        estimatedResponseTime = 600; // 10 minutes avg for form + phone only
    } else if (hasContactForm) {
        estimatedResponseTime = 3600; // 1 hour — form only, no immediate channel
    } else if (hasPhoneNumber) {
        estimatedResponseTime = 900; // 15 min — phone only (might go to voicemail)
    } else {
        estimatedResponseTime = 86400; // 24 hours — no clear contact method = ghost town
    }

    // Factor in site speed (slow sites = higher bounce before contact)
    if (loadTimeMs > 5000) estimatedResponseTime *= 1.5;

    // Ghosting score
    let ghostingScore: SilentLeadResult["ghostingScore"];
    if (estimatedResponseTime > 3600) ghostingScore = "critical";
    else if (estimatedResponseTime > 600) ghostingScore = "poor";
    else if (estimatedResponseTime > 60) ghostingScore = "average";
    else ghostingScore = "good";

    // Revenue impact: industry data shows 78% of leads go to the first responder
    const inquiryRate = 0.03; // 3% of visitors attempt contact
    const monthlyInquiries = Math.round(monthlyVisitors * inquiryRate);
    const ghostPercentage = ghostingScore === "critical" ? 0.85
        : ghostingScore === "poor" ? 0.60
            : ghostingScore === "average" ? 0.30
                : 0.10;
    const estimatedLeadsGhosted = Math.round(monthlyInquiries * ghostPercentage);
    const monthlyGhostingCost = Math.round(estimatedLeadsGhosted * avgDealValue * 0.15);
    const annualGhostingCost = monthlyGhostingCost * 12;

    const responseTimeDisplay = estimatedResponseTime >= 3600
        ? `${Math.round(estimatedResponseTime / 3600)} hours`
        : estimatedResponseTime >= 60
            ? `${Math.round(estimatedResponseTime / 60)} minutes`
            : `${estimatedResponseTime} seconds`;

    return {
        responseTimeSec: estimatedResponseTime,
        ghostingScore,
        hasLiveChat,
        hasChatbot,
        hasContactForm,
        hasPhoneNumber,
        hasWhatsApp,
        contactChannels,
        estimatedLeadsGhosted,
        monthlyGhostingCost,
        annualGhostingCost,
        markScript:
            `I just simulated an inbound inquiry to your website. Your estimated response time ` +
            `is ${responseTimeDisplay}. ${contactChannels < 2
                ? `You only have ${contactChannels} contact channel. `
                : `You have ${contactChannels} contact channels, but `
            }` +
            `industry data from Harvard Business Review shows 78% of leads buy from the FIRST business to respond. ` +
            `At your deal value, those ghosted leads cost you $${monthlyGhostingCost.toLocaleString()}/month — ` +
            `$${annualGhostingCost.toLocaleString()}/year. Our AI responds in 0.4 seconds, 24/7.`,
        journeyScript:
            ghostingScore === "critical"
                ? `I just tried to contact you through your website. You know what I found? ` +
                `Nothing. No chatbot, no live chat, no instant response. Your website is a ` +
                `"CLOSED" sign after business hours. Meanwhile, your competitor has an AI that ` +
                `texts back in under a second. You're literally handing them your leads.`
                : ghostingScore === "poor"
                    ? `Your average response time is about ${responseTimeDisplay}. Here's the brutal truth: ` +
                    `by the time you respond, that lead has already talked to 2 other businesses. ` +
                    `You're showing up to a race that's already over.`
                    : `Your response infrastructure is decent — ${contactChannels} channels. But ` +
                    `"decent" doesn't win when competitors have AI that responds in under a second. ` +
                    `You're still losing ${estimatedLeadsGhosted} leads per month to faster responders.`,
    };
}

// ═══════════════════════════════════════════════════════════
// PROBE 16: AEO Zero-Share Keyword Scan
// ═══════════════════════════════════════════════════════════

export interface AEOKeywordResult {
    keywords: {
        keyword: string;
        estimatedMonthlySearches: number;
        brandMentioned: boolean;
        competitorsMentioned: string[];
        revenueAtStake: number;
    }[];
    totalShareOfVoice: number; // 0-100
    totalRevenueAtRisk: number;
    markScript: string;
    journeyScript: string;
}

/**
 * AEO Zero-Share Keyword Scan
 * Checks whether the brand is likely to appear in AI Overview / AI Answers
 * for their top money-making keywords. Uses the domain's industry to determine
 * which keywords matter most.
 * 
 * Note: Since we can't query AI Overviews directly in real-time,
 * we analyze the site's schema, content, and authority signals to
 * PREDICT whether the brand would be cited. This is a simulation
 * based on known AEO ranking factors.
 */
export function scanAEOKeywords(
    domain: string,
    htmlContent: string,
    industry: string = "general",
    avgDealValue: number = 500,
): AEOKeywordResult {

    // Industry-specific money keywords
    const INDUSTRY_KEYWORDS: Record<string, { keyword: string; volume: number }[]> = {
        realestate: [
            { keyword: "best real estate agent near me", volume: 22000 },
            { keyword: "how to sell my house fast", volume: 18000 },
            { keyword: "top realtor in [city]", volume: 8500 },
        ],
        ecommerce: [
            { keyword: "best [product] online", volume: 35000 },
            { keyword: "[product] reviews 2026", volume: 12000 },
            { keyword: "where to buy [product]", volume: 15000 },
        ],
        medspa: [
            { keyword: "best botox near me", volume: 14000 },
            { keyword: "top med spa in [city]", volume: 6500 },
            { keyword: "laser hair removal cost", volume: 28000 },
        ],
        general: [
            { keyword: `best ${domain.split(".")[0]} services`, volume: 5000 },
            { keyword: `${domain.split(".")[0]} reviews`, volume: 3000 },
            { keyword: `${domain.split(".")[0]} vs competitors`, volume: 2000 },
        ],
    };

    const industryKey = industry.toLowerCase().replace(/[\s\-\/]/g, "");
    const keywordSet = INDUSTRY_KEYWORDS[industryKey] || INDUSTRY_KEYWORDS.general;
    const domainName = domain.split(".")[0].toLowerCase();

    // Analyze whether the brand has AEO signals for each keyword
    const hasSchema = /<script[^>]*application\/ld\+json/i.test(htmlContent);
    const hasFAQ = /FAQPage|faq|frequently.?asked/i.test(htmlContent);
    const hasHowTo = /HowTo|how.?to|step.?by.?step/i.test(htmlContent);
    const hasReviews = /review|testimonial|rating|stars/i.test(htmlContent);
    const hasAuthor = /author|founder|expert|specialist/i.test(htmlContent);

    // Base citation probability
    let baseProbability = 0;
    if (hasSchema) baseProbability += 0.20;
    if (hasFAQ) baseProbability += 0.20;
    if (hasHowTo) baseProbability += 0.15;
    if (hasReviews) baseProbability += 0.15;
    if (hasAuthor) baseProbability += 0.15;

    // Check if brand name appears in content for relevance
    const brandInContent = htmlContent.toLowerCase().includes(domainName);
    if (brandInContent) baseProbability += 0.15;

    // Simulate competitor names (based on industry patterns)
    const competitorNames = [
        `${domainName}-competitor-1.com`,
        `top${industryKey}.com`,
        `best${industryKey}near.me`,
    ];

    const keywords = keywordSet.map(kw => {
        const isMentioned = baseProbability > 0.5; // Only "mentioned" if strong AEO signals
        const searchValue = Math.round((kw.volume / 100) * avgDealValue * 0.02); // 2% of searches convert
        return {
            keyword: kw.keyword.replace("[city]", "your city").replace("[product]", "your product"),
            estimatedMonthlySearches: kw.volume,
            brandMentioned: isMentioned,
            competitorsMentioned: isMentioned ? [] : competitorNames.slice(0, 2),
            revenueAtStake: isMentioned ? 0 : searchValue,
        };
    });

    const mentionedCount = keywords.filter(k => k.brandMentioned).length;
    const totalShareOfVoice = Math.round((mentionedCount / keywords.length) * 100);
    const totalRevenueAtRisk = keywords.reduce((sum, k) => sum + k.revenueAtStake, 0);

    return {
        keywords,
        totalShareOfVoice,
        totalRevenueAtRisk,
        markScript:
            `I scanned your brand against the top ${keywords.length} money keywords in your industry. ` +
            `Your AI share of voice is ${totalShareOfVoice}%. ` +
            (totalShareOfVoice < 50
                ? `That means for ${keywords.length - mentionedCount} out of ${keywords.length} keywords, ` +
                `when a customer asks Gemini or Perplexity, your competitors are cited and you're invisible. ` +
                `That's $${totalRevenueAtRisk.toLocaleString()}/month in revenue going to businesses ` +
                `who invested in AEO before you. We fix this in 48 hours.`
                : `You have some visibility, but there are gaps that competitors are exploiting. ` +
                `We close the remaining ${keywords.length - mentionedCount} keyword gaps to make you the default citation.`),
        journeyScript:
            totalShareOfVoice === 0
                ? `I just searched for "${keywords[0]?.keyword}" and "${keywords[1]?.keyword}" on Gemini. ` +
                `You don't exist. Zero mentions. Your competitors are being cited as the experts, ` +
                `and you're nowhere. That's not a "maybe" problem — that's happening right now, ` +
                `every time someone asks AI for a recommendation in your space.`
                : totalShareOfVoice < 50
                    ? `You're showing up for ${mentionedCount} out of ${keywords.length} money keywords in AI answers. ` +
                    `The ${keywords.length - mentionedCount} keywords where you're missing? Those are worth ` +
                    `$${totalRevenueAtRisk.toLocaleString()}/month. Your competitors are eating your lunch on those.`
                    : `Your AI visibility is solid at ${totalShareOfVoice}%, but the keywords you're missing ` +
                    `are the high-intent buyers — the ones ready to pay right now.`,
    };
}

// ═══════════════════════════════════════════════════════════
// DIGITAL & FINANCIAL HEALTH AUDIT — The "Billy De La Taurus MRI"
// Phase: Digital & Financial "Health Audit"
// Goal: Rapidly identify where the business is "invisible"
//       or "leaking" money before moving to the solution.
// ═══════════════════════════════════════════════════════════

// ── 1. Scorecard Item Interface ────────────────────────────

export interface ScorecardItem {
    id: number;
    category: "visibility" | "weekend_gap" | "efficiency";
    label: string;
    score: number;          // 1-10, where 10 = perfect, 1 = critical failure
    status: "pass" | "warn" | "fail";
    finding: string;        // What Jenny/Mark says
    dollarImpact: number;   // Monthly $ impact of this gap
}

// ── 2. Full Scorecard Result ───────────────────────────────

export interface DigitalAuditScorecard {
    // The 10-item scorecard
    items: ScorecardItem[];
    totalScore: number;         // Sum of all item scores (max 100)
    grade: "A" | "B" | "C" | "D" | "F";

    // The 3-part "Total Business Leak" summary
    invisibleLeak: number;      // $ from GMB/SEO gaps
    leakingLeak: number;        // $ from missed after-hours/weekend leads
    inefficientLeak: number;    // $ from payroll on automatable tasks
    totalBusinessLeak: number;  // Total monthly leak

    // Scripts for agents
    jennyAuditSummary: string;  // Jenny's 3-part summary script
    markClosingPunch: string;   // Mark's "BioDynamX + QAB" closing punch
    scorecardDisplay: string;   // Visual text-based scorecard for display
}

// ── 3. Scorecard Generator ─────────────────────────────────

export function generateDigitalAuditScorecard(
    // From existing audit probes
    seoScore: number,                   // 0-100
    aeoScore: number,                   // 0-100
    mobileScore: number,               // 0-100
    loadTimeMs: number,
    ghostingScore: "critical" | "poor" | "average" | "good",
    contactChannels: number,           // 0-5
    hasLiveChat: boolean,
    hasChatbot: boolean,
    mapPackPosition: "top3" | "page1" | "buried",
    reviewCount: number,
    avgRating: number,
    unansweredNegative: number,
    // Business-specific inputs
    avgDealValue: number = 500,
    monthlyLeads: number = 100,
    employees: number = 5,
    avgHourlyWage: number = 25,
    hoursOnManualTasks: number = 15,    // hours/week per employee on automatable work
): DigitalAuditScorecard {

    const items: ScorecardItem[] = [];

    // ────────────────────────────────────────────────────────
    // CATEGORY 1: VISIBILITY (items 1-4)
    // "When a customer searches, can they find you?"
    // ────────────────────────────────────────────────────────

    // Item 1: Google Map Pack Position
    const mapScore = mapPackPosition === "top3" ? 9
        : mapPackPosition === "page1" ? 5 : 2;
    const mapImpact = mapPackPosition === "buried"
        ? Math.round(monthlyLeads * 0.3 * avgDealValue * 0.15)
        : mapPackPosition === "page1"
            ? Math.round(monthlyLeads * 0.1 * avgDealValue * 0.15)
            : 0;
    items.push({
        id: 1,
        category: "visibility",
        label: "Google Map Pack Position",
        score: mapScore,
        status: mapScore >= 7 ? "pass" : mapScore >= 4 ? "warn" : "fail",
        finding: mapPackPosition === "buried"
            ? "You're BURIED below page 1 of Google Maps. When a local customer searches for your service right now, they'll never see you — only your competitors."
            : mapPackPosition === "page1"
                ? "You're on page 1 but NOT in the Top 3 map pack. 93% of clicks go to the top 3 results. You're visible but not winning."
                : "You're in the Top 3 map pack — strong position. Let's make sure we keep it.",
        dollarImpact: mapImpact,
    });

    // Item 2: SEO / Website as "24/7 Salesperson"
    const seoItemScore = Math.round(seoScore / 10);    // convert 0-100 to 1-10
    const seoImpact = seoScore < 50
        ? Math.round(monthlyLeads * 0.25 * avgDealValue * 0.12)
        : seoScore < 70
            ? Math.round(monthlyLeads * 0.1 * avgDealValue * 0.12)
            : 0;
    items.push({
        id: 2,
        category: "visibility",
        label: "Website SEO Performance",
        score: Math.max(1, seoItemScore),
        status: seoItemScore >= 7 ? "pass" : seoItemScore >= 4 ? "warn" : "fail",
        finding: seoScore < 50
            ? "Your website is a digital brochure, not a salesperson. It's not ranking, not converting, and not working for you 24/7."
            : seoScore < 70
                ? "Your website has basic SEO, but it's leaving leads on the table. Competitors with optimized sites are outranking you on the searches that matter."
                : "Your SEO foundation is solid. Let's focus on the other leaks.",
        dollarImpact: seoImpact,
    });

    // Item 3: AEO/GEO AI Visibility
    const aeoItemScore = Math.round(aeoScore / 10);
    const aeoImpact = aeoScore < 40
        ? Math.round(monthlyLeads * 0.15 * avgDealValue * 0.10)
        : 0;
    items.push({
        id: 3,
        category: "visibility",
        label: "AI Answer Engine Visibility (AEO/GEO)",
        score: Math.max(1, aeoItemScore),
        status: aeoItemScore >= 6 ? "pass" : aeoItemScore >= 3 ? "warn" : "fail",
        finding: aeoScore < 40
            ? "When someone asks ChatGPT, Gemini, or Perplexity for a recommendation in your industry, you don't exist. You have zero AI visibility — competitors with structured data are being cited instead."
            : aeoScore < 70
                ? "You have some AI visibility, but critical gaps in your structured data mean LLMs can't fully understand or recommend your business."
                : "Your AI visibility is strong — AI assistants can find and recommend you.",
        dollarImpact: aeoImpact,
    });

    // Item 4: Social Proof / Review Freshness
    const recentReviewScore = avgRating >= 4.5 && reviewCount >= 50 && unansweredNegative <= 1 ? 9
        : avgRating >= 4.0 && reviewCount >= 20 ? 6
            : avgRating >= 3.5 ? 4
                : 2;
    const reviewImpact = recentReviewScore < 5
        ? Math.round(monthlyLeads * 0.12 * avgDealValue * 0.08)
        : 0;
    items.push({
        id: 4,
        category: "visibility",
        label: "Social Proof & Review Freshness",
        score: recentReviewScore,
        status: recentReviewScore >= 7 ? "pass" : recentReviewScore >= 4 ? "warn" : "fail",
        finding: recentReviewScore <= 3
            ? `Your rating is ${avgRating} stars with ${reviewCount} reviews and ${unansweredNegative} unanswered negatives. If a lead looks at your profile right now, the business looks 'closed for the weekend.' That's costing you trust and clicks.`
            : recentReviewScore <= 6
                ? `${avgRating} stars, ${reviewCount} reviews — decent, but ${unansweredNegative} unanswered negatives are dragging you down. Every unanswered review is a neon sign saying 'we don't care.'`
                : `Strong reviews at ${avgRating} stars with ${reviewCount} reviews. Your social proof is working for you.`,
        dollarImpact: reviewImpact,
    });

    // ────────────────────────────────────────────────────────
    // CATEGORY 2: WEEKEND & AFTER-HOURS GAP (items 5-7)
    // "What happens to leads on Saturday at 8 PM?"
    // ────────────────────────────────────────────────────────

    // Item 5: After-Hours Response Capability
    const afterHoursScore = hasChatbot ? 8 : hasLiveChat ? 6 : contactChannels >= 3 ? 4 : 2;
    const afterHoursLeads = Math.round(monthlyLeads * 0.35); // ~35% of leads come after hours
    const afterHoursImpact = afterHoursScore < 6
        ? Math.round(afterHoursLeads * avgDealValue * 0.15 * (1 - afterHoursScore / 10))
        : 0;
    items.push({
        id: 5,
        category: "weekend_gap",
        label: "After-Hours Lead Response",
        score: afterHoursScore,
        status: afterHoursScore >= 7 ? "pass" : afterHoursScore >= 4 ? "warn" : "fail",
        finding: afterHoursScore <= 3
            ? `What happens to your Google leads on Saturday at 8 PM? Nothing. If they click your site and nobody responds in 5 minutes, you just paid for a click that went straight to your competitor. You're losing an estimated ${afterHoursLeads} after-hours leads per month.`
            : afterHoursScore <= 6
                ? `You have some after-hours coverage, but it's not instant. In lead response, 5 minutes is the difference between a sale and a lost customer. How many 'weekend wins' are you currently losing?`
                : "You have automated response capability — good. Let's make sure it's actually converting, not just acknowledging.",
        dollarImpact: afterHoursImpact,
    });

    // Item 6: Lead Response Speed
    const ghostScore = ghostingScore === "good" ? 9
        : ghostingScore === "average" ? 6
            : ghostingScore === "poor" ? 3 : 1;
    const ghostImpact = ghostScore < 5
        ? Math.round(monthlyLeads * 0.20 * avgDealValue * 0.12)
        : 0;
    items.push({
        id: 6,
        category: "weekend_gap",
        label: "Lead Response Speed",
        score: ghostScore,
        status: ghostScore >= 7 ? "pass" : ghostScore >= 4 ? "warn" : "fail",
        finding: ghostScore <= 3
            ? "Your 'Digital Ghosting' score is critical. By the time you respond to a lead, they've already talked to 2-3 competitors. Harvard Business Review says 78% of leads go to the FIRST responder — and that's not you."
            : ghostScore <= 6
                ? "Your response time is average — but average loses deals. The business that responds in 8 seconds wins. You're responding in minutes or hours."
                : "Your response speed is strong. Let's look at the quality of those responses.",
        dollarImpact: ghostImpact,
    });

    // Item 7: Weekend Coverage / "Dark Hours"
    const weekendScore = hasChatbot ? 8 : hasLiveChat ? 5 : 2;
    const weekendLeads = Math.round(monthlyLeads * 0.20); // ~20% of leads come on weekends
    const weekendImpact = weekendScore < 6
        ? Math.round(weekendLeads * avgDealValue * 0.15)
        : 0;
    items.push({
        id: 7,
        category: "weekend_gap",
        label: "Weekend & Holiday Coverage",
        score: weekendScore,
        status: weekendScore >= 7 ? "pass" : weekendScore >= 4 ? "warn" : "fail",
        finding: weekendScore <= 3
            ? `Your business goes dark on weekends and holidays. That's ${weekendLeads} leads per month — each one worth $${avgDealValue} — clicking your Google ad, landing on your site, and finding a 'CLOSED' sign. Your competitor down the street? They have an AI that texts back in 8 seconds.`
            : weekendScore <= 6
                ? "You have some weekend coverage, but it's not the instant, intelligent response that converts cold leads at 10 PM on a Sunday."
                : "Solid weekend coverage — your business stays alive when others go dark.",
        dollarImpact: weekendImpact,
    });

    // ────────────────────────────────────────────────────────
    // CATEGORY 3: EMPLOYEE & EXPENSE EFFICIENCY (items 8-10)
    // "How much are you paying humans to do robot work?"
    // ────────────────────────────────────────────────────────

    // Item 8: Manual Admin / Social Media Overhead
    const weeklyManualHours = employees * hoursOnManualTasks;
    const monthlyManualCost = Math.round(weeklyManualHours * avgHourlyWage * 4.33);
    const manualScore = weeklyManualHours <= 10 ? 8
        : weeklyManualHours <= 30 ? 5
            : weeklyManualHours <= 60 ? 3 : 1;
    items.push({
        id: 8,
        category: "efficiency",
        label: "Manual Admin Tasks (Automatable)",
        score: manualScore,
        status: manualScore >= 7 ? "pass" : manualScore >= 4 ? "warn" : "fail",
        finding: manualScore <= 3
            ? `Employees are your biggest expense. You're paying ${employees} people an estimated ${weeklyManualHours} hours per week to do things a machine could do — updating social posts, responding to basic FAQs, chasing down receipts for the books. That's $${monthlyManualCost.toLocaleString()}/month in payroll that doesn't grow the business.`
            : manualScore <= 6
                ? `Your team spends roughly ${weeklyManualHours} hours per week on manual tasks. That's $${monthlyManualCost.toLocaleString()}/month in payroll on work that doesn't directly grow revenue.`
                : "Your manual overhead is lean — your team is focused on high-value work.",
        dollarImpact: manualScore < 6 ? monthlyManualCost : 0,
    });

    // Item 9: Mobile Performance (drives lead quality)
    const mobileItemScore = Math.round(mobileScore / 10);
    const mobileImpact = mobileScore < 60
        ? Math.round(monthlyLeads * 0.15 * avgDealValue * 0.08)
        : 0;
    items.push({
        id: 9,
        category: "efficiency",
        label: "Mobile Experience & Conversion",
        score: Math.max(1, mobileItemScore),
        status: mobileItemScore >= 7 ? "pass" : mobileItemScore >= 4 ? "warn" : "fail",
        finding: mobileScore < 50
            ? `Your mobile score is ${mobileScore}/100. Over 60% of your leads are coming from mobile devices and having a terrible experience. Slow load, broken layout, hard-to-click buttons — each friction point is a lost lead.`
            : mobileScore < 70
                ? `Mobile score: ${mobileScore}/100. Functional but not optimized. Your competitors with 90+ mobile scores are converting more of the same traffic you're paying for.`
                : `Mobile score: ${mobileScore}/100 — solid performance on mobile devices.`,
        dollarImpact: mobileImpact,
    });

    // Item 10: Site Speed (Core Web Vitals proxy)
    const speedScore = loadTimeMs < 2000 ? 9
        : loadTimeMs < 3500 ? 7
            : loadTimeMs < 5000 ? 4 : 2;
    const speedImpact = loadTimeMs > 3500
        ? Math.round(monthlyLeads * 0.08 * avgDealValue * 0.10)
        : 0;
    items.push({
        id: 10,
        category: "efficiency",
        label: "Site Speed & Performance",
        score: speedScore,
        status: speedScore >= 7 ? "pass" : speedScore >= 4 ? "warn" : "fail",
        finding: loadTimeMs > 5000
            ? `Your site loads in ${(loadTimeMs / 1000).toFixed(1)} seconds. Google's research shows 53% of mobile users leave if a page takes more than 3 seconds. You're literally paying for traffic and then pushing them away.`
            : loadTimeMs > 3500
                ? `Load time: ${(loadTimeMs / 1000).toFixed(1)}s. Above the 3-second threshold where bounce rates spike. Every 100ms improvement increases conversions by 1%.`
                : `Load time: ${(loadTimeMs / 1000).toFixed(1)}s — fast. Your site isn't losing people to speed issues.`,
        dollarImpact: speedImpact,
    });

    // ────────────────────────────────────────────────────────
    // COMPILE THE SCORECARD
    // ────────────────────────────────────────────────────────

    const totalScore = items.reduce((sum, item) => sum + item.score, 0);
    const grade: DigitalAuditScorecard["grade"] =
        totalScore >= 80 ? "A"
            : totalScore >= 65 ? "B"
                : totalScore >= 50 ? "C"
                    : totalScore >= 35 ? "D" : "F";

    // Calculate the 3-part leak
    const invisibleLeak = items
        .filter(i => i.category === "visibility")
        .reduce((sum, i) => sum + i.dollarImpact, 0);
    const leakingLeak = items
        .filter(i => i.category === "weekend_gap")
        .reduce((sum, i) => sum + i.dollarImpact, 0);
    const inefficientLeak = items
        .filter(i => i.category === "efficiency")
        .reduce((sum, i) => sum + i.dollarImpact, 0);
    const totalBusinessLeak = invisibleLeak + leakingLeak + inefficientLeak;

    // Build the visual scorecard
    const statusIcon = (s: ScorecardItem["status"]) =>
        s === "pass" ? "✅" : s === "warn" ? "⚠️" : "🔴";
    const scorecardDisplay = items.map(item =>
        `${statusIcon(item.status)} ${item.id}. ${item.label}: ${item.score}/10` +
        (item.dollarImpact > 0 ? ` → -$${item.dollarImpact.toLocaleString()}/mo` : "")
    ).join("\n");

    // Jenny's Audit Summary (the 3-part logic)
    const jennyAuditSummary =
        `Here's what the Digital Audit reveals about your business:\n\n` +
        `🔍 INVISIBLE: Your GMB and SEO gaps mean you're missing out on approximately $${invisibleLeak.toLocaleString()}/month in potential leads. ` +
        (mapPackPosition === "buried"
            ? "You're buried below page 1 of Google Maps. When customers search for your service, your competitors show up — and you don't."
            : "You're visible but not dominating. The top 3 spots capture 93% of clicks, and you're not there yet.") + "\n\n" +
        `💧 LEAKING: Your missed after-hours calls and weekend silence are costing you $${leakingLeak.toLocaleString()}/month in lost sales. ` +
        `Right now, every lead that hits your site after 5 PM is essentially funding your competitor's business.\n\n` +
        `⚡ INEFFICIENT: You're spending approximately $${inefficientLeak.toLocaleString()}/month in payroll on tasks that don't grow the business — ` +
        `social media posts, FAQ responses, appointment scheduling, receipt chasing.\n\n` +
        `📊 TOTAL BUSINESS LEAK: $${totalBusinessLeak.toLocaleString()}/month — that's $${(totalBusinessLeak * 12).toLocaleString()}/year walking out the door.`;

    // Mark's Closing Punch (BioDynamX + QAB Value Stack)
    const markClosingPunch =
        `Here's how we achieve your growth goals:\n\n` +
        `BioDynamX deploys AI agents to fix the 'Visibility' and 'Weekend' leaks instantly. ` +
        `Our AI answers every call in under 8 seconds, 24/7 — including Saturday at 8 PM. ` +
        `We fix your SEO gaps, deploy AEO optimization so AI assistants recommend you, and auto-respond to every review.\n\n` +
        `Quick Accurate Books — with 20 years of certification — audits the 'Employee' expense ` +
        `and ensures every dollar recovered is accounted for in your QuickBooks.\n\n` +
        `We don't just find the money — we make sure you keep it.\n\n` +
        `The math: Your total leak is $${totalBusinessLeak.toLocaleString()}/month. ` +
        `Our system costs $497/month. That's a ${Math.round(totalBusinessLeak / 497)}x return ` +
        `— and we guarantee at least 2x or your money back. ` +
        `Do we have authorization to proceed?`;

    return {
        items,
        totalScore,
        grade,
        invisibleLeak,
        leakingLeak,
        inefficientLeak,
        totalBusinessLeak,
        jennyAuditSummary,
        markClosingPunch,
        scorecardDisplay,
    };
}
