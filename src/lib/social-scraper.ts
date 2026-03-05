// ═══════════════════════════════════════════════════════════════════════════
// BioDynamX — Social Intelligence Scraper (Apify SDK + Google Business Profile API)
// ═══════════════════════════════════════════════════════════════════════════
// Uses the official Apify Client SDK (apify-client) for all social scraping,
// and the Google Places API for Google My Business data.
//
// Platform strategy:
//   ╔═══════════════════╦══════════════════════════════════════════════╗
//   ║ Platform          ║ Method                                       ║
//   ╠═══════════════════╬══════════════════════════════════════════════╣
//   ║ Google My Business║ Official Google Places API (free, reliable) ║
//   ║ Facebook Pages    ║ Apify: apify/facebook-pages-scraper          ║
//   ║ Twitter / X       ║ Apify: apidojo/twitter-user-scraper          ║
//   ║ LinkedIn          ║ Apify: crawlerbros/linkedin-profile-scraper  ║
//   ║ Yelp              ║ Apify: yin/yelp-scraper                      ║
//   ║ Instagram         ║ Apify: apify/instagram-scraper               ║
//   ╚═══════════════════╩══════════════════════════════════════════════╝
//
// Agent tool integration:
//   The `scrapeForAgentTool` function is the Gemini function-calling handler.
//   BioDynamX agents call this via the `social_scrape` tool definition.
// ═══════════════════════════════════════════════════════════════════════════

import { ApifyClient } from "apify-client";

const APIFY_TOKEN = process.env.APIFY_API_TOKEN || "";
const GOOGLE_PLACES_KEY = process.env.GOOGLE_PLACES_API_KEY || "";

// Apify client (official SDK)
function getApify(): ApifyClient {
    return new ApifyClient({ token: APIFY_TOKEN });
}

// ── In-memory cache (4-hour TTL) ─────────────────────────────────────────────
const cache = new Map<string, { data: unknown; expiresAt: number }>();

function getCached<T>(key: string): T | null {
    const entry = cache.get(key);
    if (!entry || Date.now() > entry.expiresAt) return null;
    return entry.data as T;
}

function setCache(key: string, data: unknown, ttlMinutes = 240): void {
    cache.set(key, { data, expiresAt: Date.now() + ttlMinutes * 60_000 });
}

// ── Types ─────────────────────────────────────────────────────────────────────

export interface SocialProfile {
    platform: "google" | "facebook" | "twitter" | "linkedin" | "yelp" | "instagram";
    found: boolean;
    url?: string;
    name?: string;
    followers?: number;
    rating?: number;
    reviewCount?: number;
    recentReviews?: Review[];
    lastPostDate?: string;
    postingFrequency?: "daily" | "weekly" | "monthly" | "inactive";
    bio?: string;
    verified?: boolean;
    engagementRate?: number;
    sentiment?: "positive" | "mixed" | "negative";
    redFlags?: string[];
    opportunities?: string[];
    rawData?: unknown;
}

export interface Review {
    author: string;
    rating: number;
    text: string;
    date: string;
    platform: string;
    sentiment?: "positive" | "neutral" | "negative";
    replied?: boolean;
}

export interface GmbData {
    placeId: string;
    name: string;
    address: string;
    phone?: string;
    website?: string;
    rating: number;
    reviewCount: number;
    hours?: Record<string, string>;
    photos?: number;
    categories?: string[];
    recentReviews?: Review[];
}

export interface BusinessIntelligence {
    businessName: string;
    website?: string;
    overallScore: number;
    profiles: SocialProfile[];
    gmb?: GmbData;
    reputationSummary: {
        avgRating: number;
        totalReviews: number;
        unrepliedReviews: number;
        sentimentBreakdown: { positive: number; neutral: number; negative: number };
    };
    socialPresence: {
        score: number;
        activePlatforms: string[];
        dormantPlatforms: string[];
        totalFollowers: number;
    };
    competitorGaps: string[];
    aiInsights: string[];
    scrapedAt: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// AGENT TOOL HANDLER — Called by Gemini function calling
// This is what Jenny, Aria, and Reputation Guard call during audits.
// ═══════════════════════════════════════════════════════════════════════════

export interface AgentScrapeParams {
    action: "full_audit" | "gmb" | "facebook" | "twitter" | "linkedin" | "instagram" | "lead_enrich" | "reputation_check";
    businessName?: string;
    website?: string;
    location?: string;
    facebookUrl?: string;
    twitterHandle?: string;
    linkedinUrl?: string;
    instagramHandle?: string;
    placeId?: string;
    leadName?: string;
    leadCompany?: string;
    forceRefresh?: boolean;
}

export async function scrapeForAgentTool(params: AgentScrapeParams): Promise<Record<string, unknown>> {
    try {
        switch (params.action) {
            case "gmb": {
                const data = await scrapeGMB({ businessName: params.businessName || "", location: params.location, placeId: params.placeId });
                return { success: true, platform: "google_my_business", data };
            }
            case "facebook": {
                if (!params.facebookUrl) return { success: false, error: "facebookUrl required" };
                const data = await scrapeFacebook(params.facebookUrl);
                return { success: true, platform: "facebook", data };
            }
            case "twitter": {
                if (!params.twitterHandle) return { success: false, error: "twitterHandle required" };
                const data = await scrapeTwitter(params.twitterHandle);
                return { success: true, platform: "twitter", data };
            }
            case "linkedin": {
                if (!params.linkedinUrl) return { success: false, error: "linkedinUrl required" };
                const data = await scrapeLinkedIn(params.linkedinUrl);
                return { success: true, platform: "linkedin", data };
            }
            case "instagram": {
                if (!params.instagramHandle) return { success: false, error: "instagramHandle required" };
                const data = await scrapeInstagram(params.instagramHandle);
                return { success: true, platform: "instagram", data };
            }
            case "lead_enrich": {
                const data = await scrapeLeadIntelligence({
                    name: params.leadName,
                    company: params.leadCompany,
                    linkedinUrl: params.linkedinUrl,
                    twitterHandle: params.twitterHandle,
                    website: params.website,
                });
                return { success: true, action: "lead_enrichment", data };
            }
            case "reputation_check":
            case "full_audit": {
                if (!params.businessName) return { success: false, error: "businessName required" };
                const data = await scrapeBusinessIntelligence({
                    businessName: params.businessName,
                    website: params.website,
                    location: params.location,
                    facebookUrl: params.facebookUrl,
                    twitterHandle: params.twitterHandle,
                    linkedinUrl: params.linkedinUrl,
                    forceRefresh: params.forceRefresh,
                });
                return { success: true, action: params.action, data };
            }
            default:
                return { success: false, error: "Unknown action" };
        }
    } catch (err) {
        console.error("[Social Scraper] Agent tool error:", err);
        return { success: false, error: String(err) };
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// GEMINI TOOL DEFINITION — Add this to agent tool declarations
// ═══════════════════════════════════════════════════════════════════════════

export const SOCIAL_SCRAPE_TOOL = {
    name: "social_scrape",
    description: "Scrape social media profiles, Google My Business, Yelp, Facebook, Twitter/X, LinkedIn, and Instagram for a business or lead. Use this during audits to get real reputation data, review scores, follower counts, and posting frequency.",
    parameters: {
        type: "object" as const,
        properties: {
            action: {
                type: "string",
                enum: ["full_audit", "gmb", "facebook", "twitter", "linkedin", "instagram", "lead_enrich", "reputation_check"],
                description: "What to scrape. Use 'full_audit' for a complete business profile. Use 'lead_enrich' before outreach calls."
            },
            businessName: { type: "string", description: "Business name to search for (required for gmb, full_audit, reputation_check)" },
            location: { type: "string", description: "City and state, e.g. 'Denver, CO' — improves GMB search accuracy" },
            website: { type: "string", description: "Business website URL" },
            facebookUrl: { type: "string", description: "Full Facebook page URL" },
            twitterHandle: { type: "string", description: "Twitter/X handle (without @)" },
            linkedinUrl: { type: "string", description: "Full LinkedIn company or profile URL" },
            instagramHandle: { type: "string", description: "Instagram handle (without @)" },
            placeId: { type: "string", description: "Google Place ID for exact GMB lookup" },
            leadName: { type: "string", description: "Lead's full name (for lead_enrich)" },
            leadCompany: { type: "string", description: "Lead's company (for lead_enrich)" },
            forceRefresh: { type: "boolean", description: "Skip cache and force fresh scrape" },
        },
        required: ["action"],
    },
};

// ═══════════════════════════════════════════════════════════════════════════
// FULL BUSINESS INTELLIGENCE — Orchestrates all scrapers in parallel
// ═══════════════════════════════════════════════════════════════════════════

export async function scrapeBusinessIntelligence(params: {
    businessName: string;
    website?: string;
    location?: string;
    facebookUrl?: string;
    twitterHandle?: string;
    linkedinUrl?: string;
    instagramHandle?: string;
    placeId?: string;
    forceRefresh?: boolean;
}): Promise<BusinessIntelligence> {

    const cacheKey = `biz:${params.businessName}:${params.location || ""}`;
    if (!params.forceRefresh) {
        const cached = getCached<BusinessIntelligence>(cacheKey);
        if (cached) return cached;
    }

    // Run all scrapers in parallel
    const [gmb, facebook, twitter, linkedin, instagram] = await Promise.allSettled([
        scrapeGMB({ businessName: params.businessName, location: params.location, placeId: params.placeId }),
        params.facebookUrl ? scrapeFacebook(params.facebookUrl) : Promise.resolve(null),
        params.twitterHandle ? scrapeTwitter(params.twitterHandle) : Promise.resolve(null),
        params.linkedinUrl ? scrapeLinkedIn(params.linkedinUrl) : Promise.resolve(null),
        params.instagramHandle ? scrapeInstagram(params.instagramHandle) : Promise.resolve(null),
    ]);

    const profiles: SocialProfile[] = [];
    const gmbData = gmb.status === "fulfilled" ? gmb.value : null;
    if (facebook.status === "fulfilled" && facebook.value) profiles.push(facebook.value);
    if (twitter.status === "fulfilled" && twitter.value) profiles.push(twitter.value);
    if (linkedin.status === "fulfilled" && linkedin.value) profiles.push(linkedin.value);
    if (instagram.status === "fulfilled" && instagram.value) profiles.push(instagram.value);

    const allReviews: Review[] = [
        ...(gmbData?.recentReviews || []),
        ...profiles.flatMap(p => p.recentReviews || []),
    ];

    const avgRating = allReviews.length > 0
        ? allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length
        : (gmbData?.rating || 0);

    const totalReviews = (gmbData?.reviewCount || 0) + profiles.reduce((s, p) => s + (p.reviewCount || 0), 0);
    const sentimentBreakdown = classifySentiments(allReviews);
    const unrepliedReviews = allReviews.filter(r => !r.replied).length;

    const activePlatforms = profiles.filter(p => p.postingFrequency !== "inactive" && p.found).map(p => p.platform);
    const dormantPlatforms = profiles.filter(p => p.postingFrequency === "inactive" && p.found).map(p => p.platform);
    const totalFollowers = profiles.reduce((s, p) => s + (p.followers || 0), 0);

    const overallScore = computeReputationScore(avgRating, totalReviews, activePlatforms.length, sentimentBreakdown);
    const socialScore = computeSocialScore(profiles, activePlatforms.length);

    const result: BusinessIntelligence = {
        businessName: params.businessName,
        website: params.website,
        overallScore,
        profiles,
        gmb: gmbData || undefined,
        reputationSummary: {
            avgRating: Math.round(avgRating * 10) / 10,
            totalReviews,
            unrepliedReviews,
            sentimentBreakdown,
        },
        socialPresence: {
            score: socialScore,
            activePlatforms,
            dormantPlatforms,
            totalFollowers,
        },
        competitorGaps: identifyGaps({ profiles, gmbData }),
        aiInsights: generateInsights({ gmbData, profiles, avgRating, totalReviews, unrepliedReviews, activePlatforms }),
        scrapedAt: new Date().toISOString(),
    };

    setCache(cacheKey, result);
    return result;
}

// ═══════════════════════════════════════════════════════════════════════════
// GOOGLE MY BUSINESS — Official Google Places API
// ═══════════════════════════════════════════════════════════════════════════

export async function scrapeGMB(params: {
    businessName: string;
    location?: string;
    placeId?: string;
}): Promise<GmbData | null> {
    const cacheKey = `gmb:${params.placeId || `${params.businessName}:${params.location}`}`;
    const cached = getCached<GmbData>(cacheKey);
    if (cached) return cached;

    if (!GOOGLE_PLACES_KEY) {
        console.warn("[GMB] No GOOGLE_PLACES_API_KEY — returning null");
        return null;
    }

    try {
        let placeId = params.placeId;
        if (!placeId) {
            const query = `${params.businessName} ${params.location || ""}`.trim();
            const findRes = await fetch(
                `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(query)}&inputtype=textquery&fields=place_id&key=${GOOGLE_PLACES_KEY}`
            );
            const findData = await findRes.json();
            placeId = findData.candidates?.[0]?.place_id;
        }

        if (!placeId) return null;

        const detailsRes = await fetch(
            `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,rating,user_ratings_total,formatted_phone_number,website,formatted_address,opening_hours,photos,types,reviews&key=${GOOGLE_PLACES_KEY}`
        );
        const detailsData = await detailsRes.json();
        const place = detailsData.result;
        if (!place) return null;

        const reviews: Review[] = (place.reviews || []).map((r: Record<string, unknown>) => ({
            author: r.author_name as string,
            rating: r.rating as number,
            text: ((r.text as string) || "").slice(0, 500),
            date: new Date((r.time as number) * 1000).toISOString(),
            platform: "google",
            sentiment: classifySingleSentiment(r.text as string, r.rating as number),
            replied: false,
        }));

        const gmbData: GmbData = {
            placeId,
            name: place.name,
            address: place.formatted_address,
            phone: place.formatted_phone_number,
            website: place.website,
            rating: place.rating || 0,
            reviewCount: place.user_ratings_total || 0,
            hours: parseHours(place.opening_hours),
            photos: place.photos?.length || 0,
            categories: place.types || [],
            recentReviews: reviews,
        };

        setCache(cacheKey, gmbData);
        return gmbData;
    } catch (err) {
        console.error("[GMB] Error:", err);
        return null;
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// APIFY ACTOR RUNNER — Uses official apify-client SDK
// ═══════════════════════════════════════════════════════════════════════════

async function runApifyActor<T = Record<string, unknown>>(
    actorId: string,
    input: Record<string, unknown>,
    options?: { timeoutSecs?: number; memoryMbytes?: number }
): Promise<T[]> {
    if (!APIFY_TOKEN) {
        console.warn(`[Apify] No APIFY_API_TOKEN — skipping ${actorId}`);
        return [];
    }

    try {
        const client = getApify();

        // Run actor and wait for finish
        const run = await client.actor(actorId).call(input, {
            timeout: options?.timeoutSecs ?? 30,
            memory: options?.memoryMbytes ?? 256,
        });

        // Fetch results from dataset
        const { items } = await client.dataset(run.defaultDatasetId).listItems({ limit: 50 });
        return items as T[];
    } catch (err) {
        console.error(`[Apify] Actor ${actorId} error:`, err);
        return [];
    }
}

// ═══════════════════════════════════════════════════════════════════════════
// FACEBOOK — apify/facebook-pages-scraper
// ═══════════════════════════════════════════════════════════════════════════

export async function scrapeFacebook(pageUrl: string): Promise<SocialProfile> {
    const cacheKey = `fb:${pageUrl}`;
    const cached = getCached<SocialProfile>(cacheKey);
    if (cached) return cached;

    const items = await runApifyActor("apify/facebook-pages-scraper", {
        startUrls: [{ url: pageUrl }],
        maxPostCount: 10,
        maxReviewCount: 20,
    });

    if (!items.length) return { platform: "facebook", found: false, url: pageUrl };

    const page = items[0] as Record<string, unknown>;
    const reviews = parseFbReviews(page);

    const profile: SocialProfile = {
        platform: "facebook",
        found: true,
        url: pageUrl,
        name: (page.title || page.name) as string,
        followers: ((page.fans || page.followers) as number) || 0,
        rating: (page.rating as number) || 0,
        reviewCount: (page.reviewCount as number) || 0,
        recentReviews: reviews,
        lastPostDate: getLastDate(page.posts as unknown[]),
        postingFrequency: calcFrequency(page.posts as unknown[]),
        bio: page.about as string,
        verified: (page.isVerified as boolean) || false,
        sentiment: classifyProfileSentiment(reviews),
        rawData: page,
    };

    setCache(cacheKey, profile);
    return profile;
}

// ═══════════════════════════════════════════════════════════════════════════
// TWITTER / X — apidojo/twitter-user-scraper
// ═══════════════════════════════════════════════════════════════════════════

export async function scrapeTwitter(handle: string): Promise<SocialProfile> {
    const cleanHandle = handle.replace(/^@/, "");
    const cacheKey = `tw:${cleanHandle}`;
    const cached = getCached<SocialProfile>(cacheKey);
    if (cached) return cached;

    const items = await runApifyActor("apidojo/twitter-user-scraper", {
        usernames: [cleanHandle],
        tweetsDesired: 20,
    });

    if (!items.length) return { platform: "twitter", found: false };

    const user = items[0] as Record<string, unknown>;
    const tweets = ((user.tweets || user.data || []) as Array<Record<string, unknown>>);
    const followerCount = (user.followersCount || user.followers_count) as number || 0;

    const profile: SocialProfile = {
        platform: "twitter",
        found: true,
        url: `https://twitter.com/${cleanHandle}`,
        name: user.name as string,
        followers: followerCount,
        lastPostDate: tweets[0]?.created_at as string || tweets[0]?.createdAt as string,
        postingFrequency: calcTweetFrequency(tweets),
        bio: user.description as string,
        verified: (user.isVerified || user.verified) as boolean || false,
        engagementRate: calcEngagementRate(tweets, followerCount),
        rawData: user,
    };

    setCache(cacheKey, profile);
    return profile;
}

// ═══════════════════════════════════════════════════════════════════════════
// LINKEDIN — crawlerbros/linkedin-profile-scraper (no login required)
// ═══════════════════════════════════════════════════════════════════════════

export async function scrapeLinkedIn(profileUrl: string): Promise<SocialProfile> {
    const cacheKey = `li:${profileUrl}`;
    const cached = getCached<SocialProfile>(cacheKey);
    if (cached) return cached;

    const items = await runApifyActor("crawlerbros/linkedin-profile-scraper", {
        profileUrls: [profileUrl],
    });

    if (!items.length) return { platform: "linkedin", found: false, url: profileUrl };

    const p = items[0] as Record<string, unknown>;
    const profile: SocialProfile = {
        platform: "linkedin",
        found: true,
        url: profileUrl,
        name: (p.name || p.fullName) as string,
        followers: (p.followers || p.connectionCount) as number || 0,
        bio: (p.headline || p.summary) as string,
        rawData: p,
    };

    setCache(cacheKey, profile);
    return profile;
}

// ═══════════════════════════════════════════════════════════════════════════
// INSTAGRAM — apify/instagram-scraper
// ═══════════════════════════════════════════════════════════════════════════

export async function scrapeInstagram(handle: string): Promise<SocialProfile> {
    const cleanHandle = handle.replace(/^@/, "");
    const cacheKey = `ig:${cleanHandle}`;
    const cached = getCached<SocialProfile>(cacheKey);
    if (cached) return cached;

    const items = await runApifyActor("apify/instagram-scraper", {
        usernames: [cleanHandle],
        resultsType: "details",
        resultsLimit: 20,
    });

    if (!items.length) return { platform: "instagram", found: false };

    const p = items[0] as Record<string, unknown>;
    const posts = (p.latestPosts || p.posts || []) as Array<Record<string, unknown>>;
    const followerCount = (p.followersCount || p.followedByCount) as number || 0;

    const profile: SocialProfile = {
        platform: "instagram",
        found: true,
        url: `https://instagram.com/${cleanHandle}`,
        name: p.fullName as string || p.username as string,
        followers: followerCount,
        lastPostDate: posts[0]?.timestamp as string,
        postingFrequency: calcFrequency(posts),
        bio: p.biography as string,
        verified: (p.verified || p.isVerified) as boolean || false,
        engagementRate: calcEngagementRate(posts, followerCount),
        rawData: p,
    };

    setCache(cacheKey, profile);
    return profile;
}

// ═══════════════════════════════════════════════════════════════════════════
// LEAD INTELLIGENCE — Enrich a prospect before Aria/Jenny calls them
// ═══════════════════════════════════════════════════════════════════════════

export async function scrapeLeadIntelligence(params: {
    name?: string;
    company?: string;
    linkedinUrl?: string;
    twitterHandle?: string;
    website?: string;
}) {
    const [li, tw] = await Promise.allSettled([
        params.linkedinUrl ? scrapeLinkedIn(params.linkedinUrl) : Promise.resolve(null),
        params.twitterHandle ? scrapeTwitter(params.twitterHandle) : Promise.resolve(null),
    ]);

    const liData = li.status === "fulfilled" ? li.value : null;
    const twData = tw.status === "fulfilled" ? tw.value : null;

    return {
        enriched: !!(liData?.found || twData?.found),
        name: liData?.name || twData?.name || params.name,
        company: params.company,
        linkedinProfile: liData,
        twitterProfile: twData,
        outreachAngle: buildOutreachAngle(liData, twData, params),
    };
}

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

function computeReputationScore(
    avgRating: number,
    totalReviews: number,
    activePlatforms: number,
    sentiment: { positive: number }
): number {
    let score = 0;
    score += Math.min(40, (avgRating / 5) * 40);
    score += Math.min(20, (totalReviews / 50) * 20);
    score += Math.min(20, activePlatforms * 5);
    score += (sentiment.positive / 100) * 20;
    return Math.round(score);
}

function computeSocialScore(profiles: SocialProfile[], activePlatforms: number): number {
    let score = activePlatforms * 20;
    for (const p of profiles) {
        if (p.postingFrequency === "daily") score += 10;
        else if (p.postingFrequency === "weekly") score += 6;
        else if (p.postingFrequency === "monthly") score += 2;
        if (p.verified) score += 5;
    }
    return Math.min(100, score);
}

function classifySentiments(reviews: Review[]): { positive: number; neutral: number; negative: number } {
    if (!reviews.length) return { positive: 0, neutral: 0, negative: 0 };
    const pos = reviews.filter(r => r.rating >= 4).length;
    const neg = reviews.filter(r => r.rating <= 2).length;
    const neu = reviews.length - pos - neg;
    return {
        positive: Math.round((pos / reviews.length) * 100),
        neutral: Math.round((neu / reviews.length) * 100),
        negative: Math.round((neg / reviews.length) * 100),
    };
}

function classifySingleSentiment(text: string, rating: number): "positive" | "neutral" | "negative" {
    if (rating >= 4) return "positive";
    if (rating <= 2) return "negative";
    return "neutral";
}

function classifyProfileSentiment(reviews: Review[]): "positive" | "mixed" | "negative" {
    const { positive, negative } = classifySentiments(reviews);
    if (positive >= 70) return "positive";
    if (negative >= 40) return "negative";
    return "mixed";
}

function parseHours(openingHours: Record<string, unknown> | null): Record<string, string> | undefined {
    if (!openingHours?.weekday_text) return undefined;
    const result: Record<string, string> = {};
    for (const line of openingHours.weekday_text as string[]) {
        const [day, ...rest] = line.split(": ");
        result[day] = rest.join(": ");
    }
    return result;
}

function getLastDate(posts: unknown[]): string | undefined {
    if (!posts?.length) return undefined;
    const d = (posts[0] as Record<string, unknown>);
    return (d.date || d.timestamp || d.created_at) as string;
}

function calcFrequency(posts: unknown[]): "daily" | "weekly" | "monthly" | "inactive" {
    if (!posts?.length) return "inactive";
    const last = new Date((getLastDate(posts)) || 0);
    const daysSince = (Date.now() - last.getTime()) / 86400000;
    if (daysSince > 90) return "inactive";
    if (daysSince > 30) return "monthly";
    if (posts.length >= 4 && daysSince <= 7) return "daily";
    return "weekly";
}

function calcTweetFrequency(tweets: Array<Record<string, unknown>>): "daily" | "weekly" | "monthly" | "inactive" {
    if (!tweets?.length) return "inactive";
    const last = new Date((tweets[0]?.created_at || tweets[0]?.createdAt) as string || 0);
    const daysSince = (Date.now() - last.getTime()) / 86400000;
    if (daysSince > 60) return "inactive";
    if (daysSince > 30) return "monthly";
    if (tweets.length >= 7) return "daily";
    return "weekly";
}

function calcEngagementRate(posts: Array<Record<string, unknown>>, followers: number): number {
    if (!posts?.length || !followers) return 0;
    const avg = posts.reduce((s, p) => {
        const likes = (p.likes || p.likesCount || p.favorite_count || 0) as number;
        const shares = (p.shares || p.retweets || p.retweet_count || 0) as number;
        const comments = (p.comments || p.commentsCount || 0) as number;
        return s + likes + shares + comments;
    }, 0) / posts.length;
    return Math.round((avg / followers) * 1000) / 10;
}

function parseFbReviews(page: Record<string, unknown>): Review[] {
    const reviews = (page.reviews || page.latestReviews || []) as Array<Record<string, unknown>>;
    return reviews.slice(0, 10).map(r => ({
        author: (r.author || r.name || "Anonymous") as string,
        rating: (r.rating || r.stars || 5) as number,
        text: ((r.text || r.message || "") as string).slice(0, 500),
        date: (r.date || r.time || new Date().toISOString()) as string,
        platform: "facebook",
        sentiment: classifySingleSentiment(r.text as string || "", r.rating as number || 5),
        replied: !!(r.reply || r.response),
    }));
}

function generateInsights(params: {
    gmbData: GmbData | null;
    profiles: SocialProfile[];
    avgRating: number;
    totalReviews: number;
    unrepliedReviews: number;
    activePlatforms: string[];
}): string[] {
    const { gmbData, avgRating, totalReviews, unrepliedReviews, activePlatforms } = params;
    const insights: string[] = [];

    if (avgRating < 4.0 && totalReviews > 5) insights.push(`⚠️ ${avgRating.toFixed(1)}★ avg — below the 4.0 threshold that drives 37% more clicks`);
    if (avgRating >= 4.5) insights.push(`✅ Excellent ${avgRating.toFixed(1)}★ — prioritize showcasing this in ads`);
    if (unrepliedReviews > 3) insights.push(`🚨 ${unrepliedReviews} unanswered reviews — each costs an avg 1.3 lost customers`);
    if (totalReviews < 20) insights.push(`📈 Only ${totalReviews} reviews — 50+ reviews increase conversions 2.7x`);
    if (activePlatforms.length < 2) insights.push(`📱 Active on ${activePlatforms.length} platform(s) — competitors average 3.4`);
    if (gmbData && (gmbData.photos || 0) < 10) insights.push(`📷 Only ${gmbData.photos || 0} GMB photos — 100+ gets 42% more direction requests`);
    if (!gmbData?.hours) insights.push(`🕐 No business hours on Google — missing hours reduces calls by 25%`);

    return insights;
}

function identifyGaps(params: { profiles: SocialProfile[]; gmbData: GmbData | null }): string[] {
    const gaps: string[] = [];
    const platforms = new Set(params.profiles.map(p => p.platform));

    if (!platforms.has("facebook")) gaps.push("No Facebook presence — 2.9B potential reach");
    if (!platforms.has("instagram")) gaps.push("No Instagram — highest ROI platform for local businesses");
    if (!platforms.has("twitter")) gaps.push("No Twitter/X — B2B thought leadership opportunity");
    if (!platforms.has("linkedin")) gaps.push("No LinkedIn — professional referral channel missing");
    if (!params.gmbData) gaps.push("GMB not optimized — #1 local discovery signal");
    if (params.profiles.some(p => p.postingFrequency === "inactive")) gaps.push("Dormant social accounts — prospects who check will bounce");

    return gaps;
}

function buildOutreachAngle(
    li: SocialProfile | null,
    tw: SocialProfile | null,
    params: { name?: string; company?: string }
): string {
    if (li?.bio) return `Lead focus: "${li.bio.slice(0, 80)}" — pitch AI that serves their niche`;
    if (tw?.bio) return `Twitter bio: "${tw.bio.slice(0, 80)}" — align pitch to this identity`;
    return `Research ${params.name || "prospect"} at ${params.company || "their company"} before call`;
}
