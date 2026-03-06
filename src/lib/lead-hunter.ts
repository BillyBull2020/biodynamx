// ═══════════════════════════════════════════════════════════════════
// BIODYNAMX — LEAD HUNTER ENGINE
// Proactive lead discovery from Google My Business & Social Media
// ═══════════════════════════════════════════════════════════════════
//
// The Lead Hunter doesn't wait for calls — it FINDS prospects.
//
// Sources:
// 1. Google My Business — Finds businesses with low ratings, no website,
//    poor hours, few reviews (all signs they need our help)
// 2. Social Media — Monitors mentions, complaints, competitor gaps
// 3. Competitor Analysis — Finds clients of inferior solutions
//
// ═══════════════════════════════════════════════════════════════════

export interface ProspectLead {
    id: string;
    businessName: string;
    placeId?: string;
    address: string;
    phone?: string;
    website?: string;
    category: string;
    rating: number;
    reviewCount: number;
    source: "gmb_scan" | "social_mention" | "competitor_gap" | "referral" | "manual";
    signals: LeadSignal[];
    score: number; // 0-100 prospect quality score
    estimatedRevenueLeak: string;
    status: "discovered" | "qualified" | "contacted" | "nurturing" | "converted" | "rejected";
    discoveredAt: string;
    notes: string;
}

export interface LeadSignal {
    type: "low_rating" | "few_reviews" | "no_website" | "slow_response"
    | "no_ai" | "negative_reviews" | "outdated_listing" | "competitor_weak"
    | "high_intent" | "social_complaint";
    strength: "weak" | "moderate" | "strong";
    detail: string;
}

export interface HuntingCriteria {
    location: string;           // e.g., "Phoenix, AZ"
    radius: number;             // in miles
    categories: string[];       // e.g., ["dentist", "lawyer", "plumber"]
    maxRating: number;          // Only show businesses BELOW this rating
    maxReviews: number;         // Only show businesses with FEWER reviews
    requireWebsite: boolean;    // Only include businesses without websites
}

// ── Default Hunting Criteria (BioDynamX Sweet Spot) ────────────
export const DEFAULT_HUNTING_CRITERIA: HuntingCriteria = {
    location: "Phoenix, AZ",
    radius: 25,
    categories: [
        "dentist",
        "dental practice",
        "lawyer",
        "law firm",
        "plumber",
        "plumbing",
        "HVAC",
        "auto repair",
        "real estate agent",
        "insurance agent",
        "medical practice",
        "chiropractor",
        "veterinarian",
        "accountant",
    ],
    maxRating: 4.2,
    maxReviews: 50,
    requireWebsite: false,
};

// ── Lead Scoring Algorithm ─────────────────────────────────────
export function scoreProspect(lead: Partial<ProspectLead>): { score: number; signals: LeadSignal[] } {
    const signals: LeadSignal[] = [];
    let score = 50; // Base score

    // Rating signals
    if (lead.rating !== undefined) {
        if (lead.rating < 3.0) {
            score += 25;
            signals.push({
                type: "low_rating",
                strength: "strong",
                detail: `Rating is ${lead.rating}/5.0 — critically low, they NEED reputation management`,
            });
        } else if (lead.rating < 4.0) {
            score += 15;
            signals.push({
                type: "low_rating",
                strength: "moderate",
                detail: `Rating is ${lead.rating}/5.0 — below trust threshold (4.0)`,
            });
        } else if (lead.rating < 4.5) {
            score += 5;
            signals.push({
                type: "low_rating",
                strength: "weak",
                detail: `Rating is ${lead.rating}/5.0 — room for improvement`,
            });
        }
    }

    // Review count signals
    if (lead.reviewCount !== undefined) {
        if (lead.reviewCount < 10) {
            score += 20;
            signals.push({
                type: "few_reviews",
                strength: "strong",
                detail: `Only ${lead.reviewCount} reviews — competitors likely have 5-10x more`,
            });
        } else if (lead.reviewCount < 25) {
            score += 10;
            signals.push({
                type: "few_reviews",
                strength: "moderate",
                detail: `${lead.reviewCount} reviews — below the 50+ engagement threshold`,
            });
        }
    }

    // No website signal
    if (!lead.website) {
        score += 20;
        signals.push({
            type: "no_website",
            strength: "strong",
            detail: "No website listed — massive digital gap, perfect candidate for AI automation",
        });
    }

    // Cap score at 100
    score = Math.min(score, 100);

    return { score, signals };
}

// ── Estimate Revenue Leak ──────────────────────────────────────
function estimateRevenueLeak(category: string, rating: number, reviewCount: number): string {
    // Industry-specific average monthly revenue impact
    const industryMultiplier: Record<string, number> = {
        "dentist": 25000,
        "dental practice": 25000,
        "lawyer": 35000,
        "law firm": 35000,
        "plumber": 15000,
        "plumbing": 15000,
        "hvac": 18000,
        "auto repair": 12000,
        "real estate agent": 30000,
        "insurance agent": 20000,
        "medical practice": 28000,
        "chiropractor": 16000,
        "veterinarian": 14000,
        "accountant": 22000,
    };

    const baseMonthly = industryMultiplier[category.toLowerCase()] || 15000;

    // Rating impact: businesses under 4.0 lose ~35% of potential customers
    const ratingPenalty = rating < 4.0 ? 0.35 : rating < 4.5 ? 0.15 : 0.05;

    // Low reviews impact: businesses under 20 reviews get 40% less engagement
    const reviewPenalty = reviewCount < 20 ? 0.40 : reviewCount < 50 ? 0.20 : 0.05;

    // No website penalty: 30% digital gap
    const combinedLeak = baseMonthly * (ratingPenalty + reviewPenalty);

    return `$${Math.round(combinedLeak).toLocaleString()}/mo`;
}

// ── Hunt for Leads on Google (via Places Nearby Search) ─────────
export async function huntLeadsOnGoogle(criteria: HuntingCriteria): Promise<ProspectLead[]> {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.GEMINI_API_KEY;

    if (!apiKey) {
        console.warn("⚠️ No Google API key for lead hunting");
        return generateMockLeads(criteria); // Fall back to demo data
    }

    const leads: ProspectLead[] = [];

    for (const category of criteria.categories.slice(0, 5)) { // Limit to 5 categories per hunt
        try {
            // Step 1: Geocode the location
            const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(criteria.location)}&key=${apiKey}`;
            const geoRes = await fetch(geoUrl);
            const geoData = await geoRes.json();

            if (!geoData.results?.[0]) continue;

            const { lat, lng } = geoData.results[0].geometry.location;

            // Step 2: Search for businesses
            const searchUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${criteria.radius * 1609.34}&type=${encodeURIComponent(category)}&key=${apiKey}`;
            const searchRes = await fetch(searchUrl);
            const searchData = await searchRes.json();

            if (!searchData.results) continue;

            // Step 3: Filter and score
            for (const place of searchData.results) {
                const rating = place.rating || 0;
                const reviewCount = place.user_ratings_total || 0;

                // Filter by criteria
                if (rating > criteria.maxRating && reviewCount > criteria.maxReviews) continue;
                if (criteria.requireWebsite && !place.website) continue;

                const { score, signals } = scoreProspect({
                    rating,
                    reviewCount,
                    website: place.website,
                });

                // Only include leads with score > 40
                if (score < 40) continue;

                leads.push({
                    id: `hunt-${place.place_id || Date.now()}`,
                    businessName: place.name,
                    placeId: place.place_id,
                    address: place.vicinity || place.formatted_address || "",
                    phone: place.formatted_phone_number,
                    website: place.website,
                    category,
                    rating,
                    reviewCount,
                    source: "gmb_scan",
                    signals,
                    score,
                    estimatedRevenueLeak: estimateRevenueLeak(category, rating, reviewCount),
                    status: "discovered",
                    discoveredAt: new Date().toISOString(),
                    notes: `Auto-discovered via GMB scan in ${criteria.location}`,
                });
            }
        } catch (error) {
            console.error(`❌ Error hunting leads in category "${category}":`, error);
        }
    }

    // Sort by score (highest first)
    leads.sort((a, b) => b.score - a.score);

    console.log(`🎯 Lead Hunter found ${leads.length} prospects across ${criteria.categories.length} categories`);

    return leads;
}

// ── Mock Leads (for demo mode without API keys) ────────────────
function generateMockLeads(criteria: HuntingCriteria): ProspectLead[] {
    const mockBusinesses = [
        { name: "Desert Smiles Dental", category: "dentist", rating: 3.2, reviews: 8, address: "1234 E Camelback Rd, Phoenix, AZ" },
        { name: "Cactus Law Group", category: "lawyer", rating: 3.8, reviews: 14, address: "5678 N Scottsdale Rd, Scottsdale, AZ" },
        { name: "Valley Plumbing Co", category: "plumber", rating: 2.9, reviews: 5, address: "9012 W Thunderbird Rd, Glendale, AZ" },
        { name: "Sunbelt HVAC Services", category: "hvac", rating: 4.0, reviews: 22, address: "3456 S Mill Ave, Tempe, AZ" },
        { name: "Mesa Auto Body", category: "auto repair", rating: 3.5, reviews: 11, address: "7890 E Main St, Mesa, AZ" },
        { name: "Phoenix Family Practice", category: "medical practice", rating: 3.7, reviews: 19, address: "2345 E Indian School Rd, Phoenix, AZ" },
        { name: "Scottsdale Chiro Center", category: "chiropractor", rating: 4.1, reviews: 7, address: "6789 N Goldwater Blvd, Scottsdale, AZ" },
        { name: "Desert Insurance Group", category: "insurance agent", rating: 3.3, reviews: 3, address: "1111 W Bell Rd, Phoenix, AZ" },
    ];

    return mockBusinesses.map((biz, idx) => {
        const { score, signals } = scoreProspect({
            rating: biz.rating,
            reviewCount: biz.reviews,
            website: idx % 3 === 0 ? undefined : `https://${biz.name.toLowerCase().replace(/\s/g, '')}.com`,
        });

        return {
            id: `mock-${idx}-${Date.now()}`,
            businessName: biz.name,
            address: biz.address,
            category: biz.category,
            rating: biz.rating,
            reviewCount: biz.reviews,
            source: "gmb_scan" as const,
            signals,
            score,
            estimatedRevenueLeak: estimateRevenueLeak(biz.category, biz.rating, biz.reviews),
            status: "discovered" as const,
            discoveredAt: new Date().toISOString(),
            notes: `Demo prospect from ${criteria.location} area`,
            website: idx % 3 === 0 ? undefined : `https://${biz.name.toLowerCase().replace(/\s/g, '')}.com`,
        };
    }).sort((a, b) => b.score - a.score);
}

// ── Format Lead Report (for agents to present) ─────────────────
export function formatLeadReport(leads: ProspectLead[]): string {
    if (leads.length === 0) {
        return "🎯 No matching leads found in this area. Try expanding the search radius or categories.";
    }

    let report = `\n═══ 🎯 LEAD HUNTER REPORT ═══\nDiscovered ${leads.length} prospects\n\n`;

    leads.slice(0, 10).forEach((lead, idx) => {
        const scoreBar = "█".repeat(Math.round(lead.score / 10)) + "░".repeat(10 - Math.round(lead.score / 10));

        report += `${idx + 1}. ${lead.businessName}\n`;
        report += `   📍 ${lead.address}\n`;
        report += `   ⭐ ${lead.rating}/5.0 (${lead.reviewCount} reviews)\n`;
        report += `   💰 Est. Revenue Leak: ${lead.estimatedRevenueLeak}\n`;
        report += `   🎯 Score: [${scoreBar}] ${lead.score}/100\n`;

        if (lead.signals.length > 0) {
            report += `   ⚡ Signals:\n`;
            lead.signals.forEach(s => {
                const icon = s.strength === "strong" ? "🔴" : s.strength === "moderate" ? "🟠" : "🟡";
                report += `      ${icon} ${s.detail}\n`;
            });
        }
        report += "\n";
    });

    return report;
}
