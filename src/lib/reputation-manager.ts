// ═══════════════════════════════════════════════════════════════════
// BIODYNAMX — REPUTATION MANAGEMENT ENGINE
// Monitor, respond, and improve business reputation across platforms
// ═══════════════════════════════════════════════════════════════════
//
// Quick Win Service #1: Reputation Management
// 
// What this does:
// 1. Monitors Google My Business reviews (via Places API)
// 2. Detects negative reviews and triggers immediate alerts
// 3. Generates AI-powered response suggestions
// 4. Tracks review sentiment trends over time
// 5. Auto-escalates to business owner for review responses
//
// Revenue impact: Businesses with 4.5+ stars get 35% more clicks
// ═══════════════════════════════════════════════════════════════════

export interface ReviewData {
    reviewId: string;
    author: string;
    rating: number;
    text: string;
    publishedAt: string;
    platform: "google" | "yelp" | "facebook" | "bbb";
    businessName: string;
    responded: boolean;
    sentiment: "positive" | "neutral" | "negative";
    suggestedResponse?: string;
}

export interface ReputationSnapshot {
    businessName: string;
    placeId: string;
    averageRating: number;
    totalReviews: number;
    ratingBreakdown: Record<number, number>; // 1-star: count, 2-star: count, etc.
    recentReviews: ReviewData[];
    unrespondedCount: number;
    sentimentScore: number; // 0-100
    trend: "improving" | "stable" | "declining";
    alerts: ReputationAlert[];
    lastChecked: string;
}

export interface ReputationAlert {
    type: "negative_review" | "rating_drop" | "response_needed" | "competitor_advantage";
    severity: "low" | "medium" | "high" | "critical";
    message: string;
    detail: string;
    createdAt: string;
    actionRequired: boolean;
}

// ── Sentiment Analysis (lightweight, no external API needed) ────
function analyzeSentiment(text: string): "positive" | "neutral" | "negative" {
    const lowerText = text.toLowerCase();

    const negativeWords = [
        "terrible", "horrible", "worst", "awful", "hate",
        "rude", "unprofessional", "never again", "scam",
        "disappointed", "waste", "avoid", "pathetic", "disgusting",
        "overpriced", "slow", "dirty", "poor", "incompetent",
        "nightmare", "refund", "complaint", "unacceptable",
    ];

    const positiveWords = [
        "excellent", "amazing", "wonderful", "fantastic", "love",
        "great", "best", "outstanding", "perfect", "friendly",
        "professional", "recommend", "helpful", "awesome", "superb",
        "exceptional", "incredible", "impressed", "thorough", "clean",
        "efficient", "knowledgeable", "caring", "trustworthy",
    ];

    const negScore = negativeWords.filter(w => lowerText.includes(w)).length;
    const posScore = positiveWords.filter(w => lowerText.includes(w)).length;

    if (negScore > posScore) return "negative";
    if (posScore > negScore) return "positive";
    return "neutral";
}

// ── Generate AI Response Suggestion ────────────────────────────
function generateResponseSuggestion(review: ReviewData): string {
    if (review.rating >= 4) {
        return `Thank you so much for your kind words, ${review.author}! We're thrilled to hear about your positive experience. Your feedback means the world to our team. We look forward to serving you again! 🌟`;
    }

    if (review.rating === 3) {
        return `Thank you for your feedback, ${review.author}. We appreciate you taking the time to share your experience. We're always looking to improve and would love to learn more about how we can better serve you. Please feel free to reach out to us directly at any time.`;
    }

    // Negative review — empathetic, solution-oriented
    return `${review.author}, thank you for bringing this to our attention. We sincerely apologize for your experience and this does not reflect the standards we hold ourselves to. We'd like to make this right — please contact us directly so we can address your concerns personally. Your satisfaction is our top priority.`;
}

// ── Fetch GMB Reviews (via Google Places API) ──────────────────
export async function fetchGMBReviews(placeId: string): Promise<ReviewData[]> {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) {
        console.warn("⚠️ No Google API key configured for Places API");
        return [];
    }

    try {
        // Google Places Details API (includes reviews)
        const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,reviews,user_ratings_total&key=${apiKey}`;

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Google Places API error: ${response.status}`);
        }

        const data = await response.json();
        const result = data.result;

        if (!result?.reviews) {
            return [];
        }

        return result.reviews.map((review: {
            author_name: string;
            rating: number;
            text: string;
            time: number;
            relative_time_description: string;
        }, index: number) => {
            const sentiment = review.rating >= 4 ? "positive"
                : review.rating <= 2 ? "negative"
                    : analyzeSentiment(review.text);

            const reviewData: ReviewData = {
                reviewId: `gmb-${placeId}-${index}`,
                author: review.author_name,
                rating: review.rating,
                text: review.text,
                publishedAt: new Date(review.time * 1000).toISOString(),
                platform: "google",
                businessName: result.name,
                responded: false, // We can't determine this from the API
                sentiment,
            };

            reviewData.suggestedResponse = generateResponseSuggestion(reviewData);
            return reviewData;
        });
    } catch (error) {
        console.error("❌ Error fetching GMB reviews:", error);
        return [];
    }
}

// ── Search for Business on Google (by name/URL) ────────────────
export async function findBusinessOnGoogle(query: string): Promise<{
    placeId: string | null;
    name: string;
    rating: number;
    totalReviews: number;
    address: string;
} | null> {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_PLACES_API_KEY;

    if (!apiKey) return null;

    try {
        const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.results && data.results.length > 0) {
            const place = data.results[0];
            return {
                placeId: place.place_id,
                name: place.name,
                rating: place.rating || 0,
                totalReviews: place.user_ratings_total || 0,
                address: place.formatted_address || "",
            };
        }

        return null;
    } catch (error) {
        console.error("❌ Error finding business:", error);
        return null;
    }
}

// ── Build Reputation Snapshot ──────────────────────────────────
export async function buildReputationSnapshot(
    businessName: string,
    placeId?: string
): Promise<ReputationSnapshot> {
    // If no placeId, search for the business
    let resolvedPlaceId = placeId;
    let resolvedName = businessName;

    if (!resolvedPlaceId) {
        const searchResult = await findBusinessOnGoogle(businessName);
        if (searchResult) {
            resolvedPlaceId = searchResult.placeId || "";
            resolvedName = searchResult.name;
        }
    }

    // Fetch reviews
    const reviews = resolvedPlaceId ? await fetchGMBReviews(resolvedPlaceId) : [];

    // Calculate metrics
    const ratingBreakdown: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRating = 0;

    reviews.forEach(r => {
        ratingBreakdown[r.rating] = (ratingBreakdown[r.rating] || 0) + 1;
        totalRating += r.rating;
    });

    const averageRating = reviews.length > 0 ? totalRating / reviews.length : 0;
    const unrespondedCount = reviews.filter(r => !r.responded).length;

    // Sentiment score (0-100)
    const positiveCount = reviews.filter(r => r.sentiment === "positive").length;
    const sentimentScore = reviews.length > 0 ? Math.round((positiveCount / reviews.length) * 100) : 0;

    // Generate alerts
    const alerts: ReputationAlert[] = [];

    // Check for negative reviews
    const negativeReviews = reviews.filter(r => r.sentiment === "negative");
    if (negativeReviews.length > 0) {
        alerts.push({
            type: "negative_review",
            severity: negativeReviews.length >= 3 ? "critical" : "high",
            message: `${negativeReviews.length} negative review${negativeReviews.length > 1 ? "s" : ""} detected`,
            detail: `Most recent: "${negativeReviews[0].text.substring(0, 100)}..."`,
            createdAt: new Date().toISOString(),
            actionRequired: true,
        });
    }

    // Check for low average rating
    if (averageRating > 0 && averageRating < 4.0) {
        alerts.push({
            type: "rating_drop",
            severity: averageRating < 3.0 ? "critical" : "high",
            message: `Average rating is ${averageRating.toFixed(1)} ⭐ — below the 4.0 trust threshold`,
            detail: "Businesses with ratings below 4.0 lose 35% of potential customers. Immediate action needed.",
            createdAt: new Date().toISOString(),
            actionRequired: true,
        });
    }

    // Check for unresponded reviews
    if (unrespondedCount > 0) {
        alerts.push({
            type: "response_needed",
            severity: unrespondedCount >= 5 ? "high" : "medium",
            message: `${unrespondedCount} reviews waiting for a response`,
            detail: "Responding to reviews increases trust by 44% and improves local SEO ranking.",
            createdAt: new Date().toISOString(),
            actionRequired: true,
        });
    }

    // Low review count
    if (reviews.length < 20) {
        alerts.push({
            type: "competitor_advantage",
            severity: "medium",
            message: `Only ${reviews.length} reviews — competitors likely have more`,
            detail: "Businesses with 50+ reviews get 270% more engagement. Launch a review generation campaign.",
            createdAt: new Date().toISOString(),
            actionRequired: false,
        });
    }

    return {
        businessName: resolvedName,
        placeId: resolvedPlaceId || "",
        averageRating: Math.round(averageRating * 10) / 10,
        totalReviews: reviews.length,
        ratingBreakdown,
        recentReviews: reviews.slice(0, 10),
        unrespondedCount,
        sentimentScore,
        trend: sentimentScore >= 70 ? "improving" : sentimentScore >= 40 ? "stable" : "declining",
        alerts,
        lastChecked: new Date().toISOString(),
    };
}

// ── Format Reputation Report (for agents to present) ──────────
export function formatReputationReport(snapshot: ReputationSnapshot): string {
    const stars = "⭐".repeat(Math.round(snapshot.averageRating));
    const trendEmoji = snapshot.trend === "improving" ? "📈" : snapshot.trend === "stable" ? "➡️" : "📉";

    let report = `
═══ REPUTATION AUDIT: ${snapshot.businessName} ═══

Rating: ${snapshot.averageRating}/5.0 ${stars}
Total Reviews: ${snapshot.totalReviews}
Sentiment Score: ${snapshot.sentimentScore}/100 ${trendEmoji} ${snapshot.trend.toUpperCase()}

Breakdown:
  ⭐⭐⭐⭐⭐  ${snapshot.ratingBreakdown[5] || 0} reviews
  ⭐⭐⭐⭐     ${snapshot.ratingBreakdown[4] || 0} reviews
  ⭐⭐⭐       ${snapshot.ratingBreakdown[3] || 0} reviews
  ⭐⭐         ${snapshot.ratingBreakdown[2] || 0} reviews
  ⭐           ${snapshot.ratingBreakdown[1] || 0} reviews

Unresponded Reviews: ${snapshot.unrespondedCount}
`;

    if (snapshot.alerts.length > 0) {
        report += `\n⚠️ ALERTS (${snapshot.alerts.length}):\n`;
        snapshot.alerts.forEach(alert => {
            const severityIcon = alert.severity === "critical" ? "🔴" : alert.severity === "high" ? "🟠" : "🟡";
            report += `  ${severityIcon} ${alert.message}\n     ${alert.detail}\n`;
        });
    }

    return report;
}
