// ═══════════════════════════════════════════════════════════════════
// BIODYNAMX — VISITOR INTELLIGENCE API (Web 4.0 Personalization)
// Converts an anonymous IP into a rich visitor profile.
// Used to personalize Jenny's opening before the visitor speaks.
// ═══════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";

const INDUSTRY_FROM_REFERRER: Record<string, string> = {
    dental: "dental",
    dentist: "dental",
    medspa: "med spa",
    "med-spa": "med spa",
    aesthetic: "med spa",
    hvac: "home services",
    plumbing: "home services",
    roofing: "home services",
    realt: "real estate",
    realtor: "real estate",
    attorney: "law firm",
    lawyer: "law firm",
    restaurant: "restaurant",
    salon: "salon",
    startup: "startup",
    "call-center": "call center",
    "call center": "call center",
};

function inferIndustry(referrer: string, utmContent: string): string | null {
    const text = (referrer + " " + utmContent).toLowerCase();
    for (const [keyword, industry] of Object.entries(INDUSTRY_FROM_REFERRER)) {
        if (text.includes(keyword)) return industry;
    }
    return null;
}

function getReferrerSource(referrer: string): string {
    if (!referrer || referrer === "direct") return "direct";
    if (referrer.includes("google")) return "Google";
    if (referrer.includes("facebook") || referrer.includes("fb")) return "Facebook";
    if (referrer.includes("instagram")) return "Instagram";
    if (referrer.includes("linkedin")) return "LinkedIn";
    if (referrer.includes("youtube")) return "YouTube";
    if (referrer.includes("twitter") || referrer.includes("x.com")) return "Twitter/X";
    return "referral";
}

export async function POST(req: NextRequest) {
    try {
        const { referrer, utmSource, utmContent, utmCampaign } = await req.json();

        // Get IP from Cloudflare/Vercel headers (Firebase passes these)
        const ip =
            req.headers.get("cf-connecting-ip") ||
            req.headers.get("x-forwarded-for")?.split(",")[0].trim() ||
            req.headers.get("x-real-ip") ||
            "unknown";

        // Geo lookup (non-blocking, 3s timeout)
        let geo: Record<string, string> = {};
        if (ip && ip !== "unknown" && ip !== "127.0.0.1") {
            try {
                const geoRes = await fetch(`https://ipapi.co/${ip}/json/`, {
                    signal: AbortSignal.timeout(3000),
                });
                if (geoRes.ok) {
                    const data = await geoRes.json();
                    geo = {
                        city: data.city || "",
                        region: data.region || "",
                        country: data.country_name || "",
                        org: data.org || "",
                    };
                }
            } catch {
                // geo failed — non-critical, continue
            }
        }

        const industry = inferIndustry(referrer || "", utmContent || "");
        const referrerSource = getReferrerSource(referrer || utmSource || "");

        // Build a personalization context for Jenny
        let jennyContext = "";
        if (geo.city) {
            jennyContext += `The visitor is located in ${geo.city}${geo.region ? ", " + geo.region : ""}. `;
        }
        if (industry) {
            jennyContext += `They appear to be in the ${industry} industry based on their referrer. `;
        }
        if (referrerSource !== "direct") {
            jennyContext += `They found BioDynamX via ${referrerSource}. `;
        }
        if (utmCampaign) {
            jennyContext += `Campaign: ${utmCampaign}. `;
        }

        return NextResponse.json({
            success: true,
            geo,
            industry,
            referrerSource,
            jennyContext: jennyContext.trim(),
        });
    } catch (err) {
        console.error("[visitor-intel] Error:", err);
        return NextResponse.json({ success: false, jennyContext: "" }, { status: 500 });
    }
}
