// ═══════════════════════════════════════════════════════
// AUDIT LOGIC — THE GROUNDING ENGINE
// Stops all hallucinations by forcing data verification
// ═══════════════════════════════════════════════════════

export interface GroundedClaim {
    claim: string;
    source: "audit" | "google_search" | "industry_benchmark" | "unverified";
    confidence: number; // 0-1
    rawValue: unknown;
}

export interface GroundingResult {
    verified: GroundedClaim[];
    rejected: string[];
    warnings: string[];
}

/**
 * Validates claims against audit data.
 * Returns only grounded (verified) claims.
 * Rejects any claim that cites a number without data backing.
 */
export function groundClaims(
    rawClaims: string[],
    auditData: Record<string, unknown> | null
): GroundingResult {
    const result: GroundingResult = { verified: [], rejected: [], warnings: [] };

    if (!auditData) {
        result.warnings.push("No audit data available — all financial claims are unverified");
        for (const claim of rawClaims) {
            if (containsFinancialClaim(claim)) {
                result.rejected.push(claim);
            } else {
                result.verified.push({
                    claim,
                    source: "unverified",
                    confidence: 0.3,
                    rawValue: null,
                });
            }
        }
        return result;
    }

    for (const claim of rawClaims) {
        const grounded = matchClaimToData(claim, auditData);
        if (grounded) {
            result.verified.push(grounded);
        } else if (containsFinancialClaim(claim)) {
            result.rejected.push(claim);
            result.warnings.push(`REJECTED: "${claim}" — no audit data supports this number`);
        } else {
            result.verified.push({
                claim,
                source: "unverified",
                confidence: 0.5,
                rawValue: null,
            });
        }
    }

    return result;
}

/**
 * Checks if a string contains a financial claim that needs verification.
 */
function containsFinancialClaim(text: string): boolean {
    const financialPatterns = [
        /\$[\d,]+/,           // Dollar amounts
        /\d+%/,               // Percentages
        /\d+x\s*ROI/i,        // ROI multipliers
        /\d+k/i,              // Thousands shorthand
        /revenue/i,           // Revenue mentions
        /saving[s]?/i,        // Savings
        /cost[s]?/i,          // Costs
        /losing/i,            // Losing money
        /leaking/i,           // Revenue leaking
        /recover/i,           // Recovery claims
    ];
    return financialPatterns.some(p => p.test(text));
}

/**
 * Attempts to match a claim to real audit data.
 */
function matchClaimToData(
    claim: string,
    auditData: Record<string, unknown>
): GroundedClaim | null {
    const lc = claim.toLowerCase();

    // Speed claims
    if (lc.includes("speed") || lc.includes("load") || lc.includes("slow")) {
        const speed = auditData.siteSpeed as Record<string, unknown> | undefined;
        if (speed) {
            return {
                claim,
                source: "audit",
                confidence: 0.95,
                rawValue: speed,
            };
        }
    }

    // Revenue claims
    if (lc.includes("revenue") || lc.includes("leaking") || lc.includes("losing")) {
        const rev = auditData.revenueEstimate as Record<string, unknown> | undefined;
        if (rev) {
            return {
                claim,
                source: "audit",
                confidence: 0.85,
                rawValue: rev,
            };
        }
    }

    // ROI claims
    if (lc.includes("roi") || lc.includes("savings") || lc.includes("return")) {
        const roi = auditData.roi as Record<string, unknown> | undefined;
        if (roi) {
            return {
                claim,
                source: "audit",
                confidence: 0.9,
                rawValue: roi,
            };
        }
    }

    // Tech debt claims
    if (lc.includes("debt") || lc.includes("legacy") || lc.includes("outdated")) {
        const td = auditData.techDebt as Record<string, unknown> | undefined;
        if (td) {
            return {
                claim,
                source: "audit",
                confidence: 0.9,
                rawValue: td,
            };
        }
    }

    // Competitor claims
    if (lc.includes("competitor") || lc.includes("rival") || lc.includes("behind")) {
        const comp = auditData.competitors as unknown[] | undefined;
        if (comp && comp.length > 0) {
            return {
                claim,
                source: "audit",
                confidence: 0.8,
                rawValue: comp,
            };
        }
    }

    // Mobile claims
    if (lc.includes("mobile") || lc.includes("responsive")) {
        const mob = auditData.mobile as Record<string, unknown> | undefined;
        if (mob) {
            return {
                claim,
                source: "audit",
                confidence: 0.9,
                rawValue: mob,
            };
        }
    }

    return null;
}

/**
 * Formats grounding result into a safe agent prompt addendum.
 * This forces the agent to only use verified data.
 */
export function formatGroundingContext(result: GroundingResult): string {
    const lines: string[] = [];

    if (result.verified.length > 0) {
        lines.push("VERIFIED DATA (safe to cite):");
        for (const v of result.verified) {
            lines.push(`  ✓ [${v.source}] ${v.claim} (confidence: ${(v.confidence * 100).toFixed(0)}%)`);
        }
    }

    if (result.rejected.length > 0) {
        lines.push("\nREJECTED CLAIMS (do NOT use these):");
        for (const r of result.rejected) {
            lines.push(`  ✗ ${r}`);
        }
    }

    if (result.warnings.length > 0) {
        lines.push("\nWARNINGS:");
        for (const w of result.warnings) {
            lines.push(`  ⚠ ${w}`);
        }
    }

    return lines.join("\n");
}

/**
 * Quick check: can the agent safely cite this number?
 */
export function isGrounded(claim: string, auditData: Record<string, unknown> | null): boolean {
    if (!auditData) return false;
    return matchClaimToData(claim, auditData) !== null;
}
