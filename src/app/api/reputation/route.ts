// ═══════════════════════════════════════════════════════════════════
// /api/reputation/route.ts — Reputation Management API
// ═══════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { buildReputationSnapshot, formatReputationReport } from "@/lib/reputation-manager";

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const businessName = searchParams.get("business") || searchParams.get("q");
    const placeId = searchParams.get("placeId");

    if (!businessName && !placeId) {
        return NextResponse.json({
            service: "BioDynamX Reputation Guard",
            status: "active",
            description: "Monitor, analyze, and improve business reputation across platforms",
            usage: "GET /api/reputation?business=YourBusinessName or ?placeId=ChIJ...",
            features: [
                "Google My Business review monitoring",
                "Sentiment analysis and trends",
                "AI-generated response suggestions",
                "Competitive reputation benchmarking",
                "Automated negative review alerts",
            ],
        });
    }

    try {
        const snapshot = await buildReputationSnapshot(
            businessName || "Unknown",
            placeId || undefined
        );

        return NextResponse.json({
            snapshot,
            report: formatReputationReport(snapshot),
            generatedAt: new Date().toISOString(),
        });
    } catch (error) {
        console.error("Reputation API error:", error);
        return NextResponse.json(
            { error: "Failed to build reputation snapshot" },
            { status: 500 }
        );
    }
}
