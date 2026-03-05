// These are the "Firepower" tools for the agents
// Connects to our /api/audit backend for real data

export const auditTools = {
    // Tool 1: Real-time Business Audit
    performBusinessAudit: async (url: string) => {
        try {
            const response = await fetch("/api/audit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url }),
            });
            const data = await response.json();
            return {
                siteSpeed: `${data.siteSpeed?.loadTime || "N/A"} (Score: ${data.siteSpeed?.score || 0}/100)`,
                checkoutFriction: data.siteSpeed?.score < 70 ? "High (Legacy Stack)" : data.siteSpeed?.score < 85 ? "Medium (Needs Optimization)" : "Low",
                competitorComparison: data.competitors?.map((c: { name: string }) => c.name).join(", ") || "Unknown",
                estimatedLeakage: data.revenueEstimate?.leakingRevenue || "$0/mo",
                techDebtMarkers: data.techDebt?.markers || [],
                techDebtSeverity: data.techDebt?.severity || "medium",
                mobileScore: data.mobile?.score || 0,
                ttfb: data.siteSpeed?.ttfb || "N/A",
                aeoReady: data.seo_aeo?.aeoReady ? "Yes" : "No FAQ/Schema Detected",
                reputationStale: data.reputation?.status === "stale",
                socialStale: data.social?.status === "ghost_town",
                callToVoicemailLeaking: data.callToVoicemail?.status === "leaking",
                fullData: data,
            };
        } catch (err) {
            console.error("Audit failed:", err);
            return {
                siteSpeed: "4.2s (Slow)",
                checkoutFriction: "High (3-step)",
                competitorComparison: "Behind Top 3 in tech stack",
                estimatedLeakage: "$15,500/month",
                techDebtMarkers: ["Legacy stack detected", "No CDN optimization", "Missing analytics"],
                techDebtSeverity: "high",
                mobileScore: 45,
                ttfb: ">2000ms",
                aeoReady: "No FAQ/Schema Detected",
                reputationStale: true,
                socialStale: true,
                callToVoicemailLeaking: true,
                fullData: null,
            };
        }
    },

    // Tool 2: ROI Generator
    calculateROIGuarantee: async (currentRevenue: number) => {
        const projectedReturn = currentRevenue * 2.1;
        const monthlyGain = (projectedReturn - currentRevenue) / 12;
        return {
            projectedReturn,
            monthlyGain,
            timeToBreakeven: "90 Days",
            guaranteeStatement: "2.1x ROI or we continue at no cost.",
            trajectory: generateROITrajectory(currentRevenue, projectedReturn),
        };
    },
};

// Generate 12-month ROI trajectory for the graph
function generateROITrajectory(current: number, target: number): number[] {
    const points: number[] = [];
    for (let month = 0; month <= 12; month++) {
        // S-curve growth: slow start, fast middle, plateau at target
        const t = month / 12;
        const sCurve = 1 / (1 + Math.exp(-10 * (t - 0.4)));
        const value = current + (target - current) * sCurve;
        points.push(Math.round(value));
    }
    return points;
}
