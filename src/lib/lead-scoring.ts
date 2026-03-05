// ============================================================================
// Lead Scoring Engine — BioDynamX
// ============================================================================
// Scores leads based on multiple signals to prioritize the best opportunities.
// Used by the nurture engine to determine outreach priority and by the sales
// team to focus on the highest-value prospects.
//
// Scoring Dimensions:
//   - Audit engagement (ran audit, completed, grade)
//   - Business profile (type, size, industry)
//   - Behavioral signals (page views, voice diagnostic, return visits)
//   - Contact completeness (email, phone, name)
//   - Timing signals (speed of engagement, recency)
// ============================================================================

export interface LeadScore {
    total: number;          // 0-100
    grade: "A" | "B" | "C" | "D" | "F";
    signals: ScoreSignal[];
    recommendation: string;
    priority: "hot" | "warm" | "nurture" | "cold";
}

interface ScoreSignal {
    category: string;
    signal: string;
    points: number;
    maxPoints: number;
}

export interface LeadData {
    // Contact info
    email?: string;
    phone?: string;
    name?: string;
    businessType?: string;

    // Audit data
    auditCompleted?: boolean;
    auditGrade?: string;
    auditScore?: number;
    monthlyLeak?: string;

    // Behavioral
    voiceDiagnosticUsed?: boolean;
    pagesViewed?: number;
    returnVisits?: number;
    timeOnSite?: number; // seconds
    source?: string;

    // Timing
    createdAt?: string;
    lastActivityAt?: string;
}

/**
 * Calculate a lead score from 0-100 based on multiple signals
 */
export function scoreLeadFromData(data: LeadData): LeadScore {
    const signals: ScoreSignal[] = [];

    // ── Contact Completeness (max 20 points) ──────────────────
    if (data.email) {
        const isBusinessEmail = !data.email.match(/@(gmail|yahoo|hotmail|outlook|aol)\./i);
        signals.push({
            category: "Contact",
            signal: isBusinessEmail ? "Business email provided" : "Personal email provided",
            points: isBusinessEmail ? 10 : 5,
            maxPoints: 10,
        });
    }

    if (data.phone) {
        signals.push({
            category: "Contact",
            signal: "Phone number provided",
            points: 8,
            maxPoints: 8,
        });
    }

    if (data.name) {
        signals.push({
            category: "Contact",
            signal: "Name provided",
            points: 2,
            maxPoints: 2,
        });
    }

    // ── Business Profile (max 15 points) ──────────────────────
    const highValueIndustries = ["call_center", "dental", "real_estate", "med_spa", "home_services"];
    const mediumValueIndustries = ["small_business", "agency", "ecommerce"];

    if (data.businessType) {
        const isHighValue = highValueIndustries.includes(data.businessType);
        const isMediumValue = mediumValueIndustries.includes(data.businessType);
        signals.push({
            category: "Profile",
            signal: `Business type: ${data.businessType}`,
            points: isHighValue ? 15 : isMediumValue ? 10 : 5,
            maxPoints: 15,
        });
    }

    // ── Audit Engagement (max 30 points) ──────────────────────
    if (data.auditCompleted) {
        signals.push({
            category: "Engagement",
            signal: "Completed full audit",
            points: 15,
            maxPoints: 15,
        });

        // Audit grade scoring
        if (data.auditGrade) {
            const gradeScores: Record<string, number> = { F: 15, D: 12, C: 8, B: 5, A: 2 };
            const gradePoints = gradeScores[data.auditGrade.toUpperCase()] || 5;
            signals.push({
                category: "Engagement",
                signal: `Audit grade: ${data.auditGrade} (lower grade = higher need = higher score)`,
                points: gradePoints,
                maxPoints: 15,
            });
        }
    }

    // Monthly leak (higher leak = higher need)
    if (data.monthlyLeak) {
        const leakAmount = parseInt(data.monthlyLeak.replace(/[^0-9]/g, "")) || 0;
        const leakPoints = leakAmount >= 10000 ? 10 : leakAmount >= 5000 ? 7 : leakAmount >= 2000 ? 4 : 2;
        signals.push({
            category: "Engagement",
            signal: `Monthly revenue leak: ${data.monthlyLeak}`,
            points: leakPoints,
            maxPoints: 10,
        });
    }

    // ── Behavioral Signals (max 20 points) ────────────────────
    if (data.voiceDiagnosticUsed) {
        signals.push({
            category: "Behavior",
            signal: "Used voice diagnostic (talked to Jenny/Mark)",
            points: 12,
            maxPoints: 12,
        });
    }

    if (data.returnVisits && data.returnVisits > 1) {
        signals.push({
            category: "Behavior",
            signal: `Return visits: ${data.returnVisits}`,
            points: Math.min(data.returnVisits * 2, 8),
            maxPoints: 8,
        });
    }

    // ── Source Quality (max 15 points) ────────────────────────
    const sourceScores: Record<string, number> = {
        voice_diagnostic: 15,
        audit: 12,
        direct: 10,
        homepage: 5,
    };

    if (data.source) {
        signals.push({
            category: "Source",
            signal: `Lead source: ${data.source}`,
            points: sourceScores[data.source] || 5,
            maxPoints: 15,
        });
    }

    // ── Calculate Total ──────────────────────────────────────
    const total = Math.min(100, signals.reduce((sum, s) => sum + s.points, 0));

    // ── Determine Grade & Priority ────────────────────────────
    let grade: LeadScore["grade"];
    let priority: LeadScore["priority"];
    let recommendation: string;

    if (total >= 80) {
        grade = "A";
        priority = "hot";
        recommendation = "🔥 HOT LEAD — Call immediately. High engagement, strong signals. This prospect is ready to buy.";
    } else if (total >= 60) {
        grade = "B";
        priority = "warm";
        recommendation = "📞 WARM LEAD — Follow up within 24 hours. Multiple positive signals. Send case study + schedule demo.";
    } else if (total >= 40) {
        grade = "C";
        priority = "nurture";
        recommendation = "📧 NURTURE — Add to automated sequence. Good potential but needs more engagement. Send value content.";
    } else if (total >= 20) {
        grade = "D";
        priority = "nurture";
        recommendation = "📋 LOW PRIORITY — Keep in nurture sequence but don't prioritize. Monitor for re-engagement.";
    } else {
        grade = "F";
        priority = "cold";
        recommendation = "❄️ COLD — Minimal engagement. Add to long-term drip campaign. May re-engage later.";
    }

    return { total, grade, signals, recommendation, priority };
}

/**
 * Quick score from just the basic lead capture data
 * (used immediately when lead is captured via API)
 */
export function quickScore(
    source: string,
    hasPhone: boolean,
    hasAudit: boolean,
    auditGrade?: string
): { score: number; priority: LeadScore["priority"] } {
    let score = 10; // Base score for any lead

    // Source bonus
    if (source === "voice_diagnostic") score += 25;
    else if (source === "audit") score += 20;
    else if (source === "direct") score += 15;
    else score += 5;

    // Contact completeness
    if (hasPhone) score += 15;

    // Audit engagement
    if (hasAudit) score += 20;

    // Audit grade (worse grade = higher need = higher score)
    if (auditGrade) {
        const bonus: Record<string, number> = { F: 20, D: 15, C: 10, B: 5, A: 2 };
        score += bonus[auditGrade.toUpperCase()] || 5;
    }

    score = Math.min(100, score);

    let priority: LeadScore["priority"];
    if (score >= 70) priority = "hot";
    else if (score >= 50) priority = "warm";
    else if (score >= 30) priority = "nurture";
    else priority = "cold";

    return { score, priority };
}
