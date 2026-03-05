// ═══════════════════════════════════════════════════════════════════
// /api/lead-hunter/route.ts — Lead Discovery API
// ═══════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { huntLeadsOnGoogle, formatLeadReport, DEFAULT_HUNTING_CRITERIA, type HuntingCriteria } from "@/lib/lead-hunter";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const location = searchParams.get("location");
    const category = searchParams.get("category");

    if (!location && !category) {
        return NextResponse.json({
            service: "BioDynamX Lead Hunter",
            status: "active",
            description: "Proactive lead discovery via Google My Business scanning",
            usage: "GET /api/lead-hunter?location=Phoenix,AZ&category=dentist",
            defaultCriteria: DEFAULT_HUNTING_CRITERIA,
            features: [
                "GMB profile scanning for low-rated businesses",
                "Revenue leak estimation by industry",
                "Prospect scoring algorithm (0-100)",
                "Competitive gap analysis",
                "Social media mention monitoring",
            ],
        });
    }

    try {
        const criteria: HuntingCriteria = {
            ...DEFAULT_HUNTING_CRITERIA,
            location: location || DEFAULT_HUNTING_CRITERIA.location,
            categories: category
                ? [category]
                : DEFAULT_HUNTING_CRITERIA.categories,
        };

        const leads = await huntLeadsOnGoogle(criteria);

        return NextResponse.json({
            leads,
            report: formatLeadReport(leads),
            criteria,
            totalFound: leads.length,
            generatedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Lead Hunter API error:", error);
        return NextResponse.json(
            { error: "Failed to hunt for leads" },
            { status: 500 }
        );
    }
}

// POST: Run a custom hunt with full criteria
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const criteria: HuntingCriteria = {
            location: body.location || DEFAULT_HUNTING_CRITERIA.location,
            radius: body.radius || DEFAULT_HUNTING_CRITERIA.radius,
            categories: body.categories || DEFAULT_HUNTING_CRITERIA.categories,
            maxRating: body.maxRating || DEFAULT_HUNTING_CRITERIA.maxRating,
            maxReviews: body.maxReviews || DEFAULT_HUNTING_CRITERIA.maxReviews,
            requireWebsite: body.requireWebsite ?? DEFAULT_HUNTING_CRITERIA.requireWebsite,
        };

        const leads = await huntLeadsOnGoogle(criteria);

        return NextResponse.json({
            leads,
            report: formatLeadReport(leads),
            criteria,
            totalFound: leads.length,
            generatedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Lead Hunter POST error:", error);
        return NextResponse.json(
            { error: "Failed to execute custom hunt" },
            { status: 500 }
        );
    }
}
