// ═══════════════════════════════════════════════════════════════════════════
// /api/social-intel — Social Intelligence API
// ═══════════════════════════════════════════════════════════════════════════
// The single entry point for all social/reputation scraping.
//
// POST /api/social-intel
//   { businessName, website, location, facebookUrl, twitterHandle, linkedinUrl }
//   → Returns full BusinessIntelligence report
//
// GET /api/social-intel?placeId=xxx
//   → Quick GMB data only
//
// POST /api/social-intel/lead
//   { name, company, linkedinUrl, twitterHandle, website }
//   → Returns enriched lead intelligence for outreach
//
// POST /api/social-intel/reputation
//   { clientId, businessName, ... }
//   → Runs reputation audit and logs ROI events to Supabase
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import {
    scrapeBusinessIntelligence,
    scrapeGMB,
    scrapeLeadIntelligence,
} from "@/lib/social-scraper";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

// ── POST: Full business intelligence report ───────────────────────────────────

export async function POST(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const mode = searchParams.get("mode") || "full";

    const body = await req.json().catch(() => ({}));

    // ── Lead enrichment mode ─────────────────────────────────────────────────
    if (mode === "lead") {
        if (!body.linkedinUrl && !body.twitterHandle && !body.name) {
            return NextResponse.json({ error: "Provide linkedinUrl, twitterHandle, or name" }, { status: 400 });
        }
        const result = await scrapeLeadIntelligence(body);
        return NextResponse.json(result);
    }

    // ── Reputation audit mode ─────────────────────────────────────────────────
    if (mode === "reputation") {
        if (!body.businessName) {
            return NextResponse.json({ error: "businessName required" }, { status: 400 });
        }
        const intel = await scrapeBusinessIntelligence(body);

        // Record reputation event to Supabase if clientId provided
        if (body.clientId) {
            try {
                await supabase.from("roi_events").insert({
                    client_id: body.clientId,
                    event_type: "reputation_audit",
                    amount: 0,
                    description: `Reputation audit: ${intel.overallScore}/100 score, ${intel.reputationSummary.totalReviews} reviews, ${intel.reputationSummary.avgRating}★ avg rating`,
                    agent_name: "Reputation Guard",
                    metadata: {
                        overallScore: intel.overallScore,
                        avgRating: intel.reputationSummary.avgRating,
                        totalReviews: intel.reputationSummary.totalReviews,
                        activePlatforms: intel.socialPresence.activePlatforms,
                        unrepliedReviews: intel.reputationSummary.unrepliedReviews,
                    },
                });

                // Update client's latest_audit
                await supabase.from("clients")
                    .update({
                        latest_audit: {
                            seo_score: intel.overallScore,
                            avg_rating: intel.reputationSummary.avgRating,
                            reviews_managed: intel.reputationSummary.totalReviews,
                            social_score: intel.socialPresence.score,
                            audited_at: new Date().toISOString(),
                        },
                    })
                    .eq("id", body.clientId);
            } catch (err) {
                console.error("[Social Intel] Supabase write error:", err);
            }
        }

        return NextResponse.json(intel);
    }

    // ── Full intelligence mode (default) ─────────────────────────────────────
    if (!body.businessName) {
        return NextResponse.json({ error: "businessName required" }, { status: 400 });
    }

    const intel = await scrapeBusinessIntelligence(body);
    return NextResponse.json(intel);
}

// ── GET: Quick GMB lookup by name or placeId ─────────────────────────────────

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const businessName = searchParams.get("businessName") || "";
    const placeId = searchParams.get("placeId") || undefined;
    const location = searchParams.get("location") || "";

    if (!businessName && !placeId) {
        return NextResponse.json({
            endpoints: {
                "POST /api/social-intel": "Full business intelligence report",
                "POST /api/social-intel?mode=lead": "Lead enrichment",
                "POST /api/social-intel?mode=reputation": "Reputation audit + Supabase logging",
                "GET /api/social-intel?businessName=xxx&location=yyy": "Quick GMB data",
            },
            platforms: ["Google My Business (official API)", "Facebook (Apify)", "Twitter/X (Apify)", "LinkedIn (Apify)", "Yelp (Apify)"],
            requiredEnvVars: ["APIFY_API_TOKEN", "GOOGLE_PLACES_API_KEY"],
        });
    }

    const gmb = await scrapeGMB({ businessName, location, placeId });
    return NextResponse.json(gmb);
}
