// ============================================================================
// /api/oauth/status — Check Connected Account Status
// ============================================================================

import { NextResponse } from "next/server";
import { getConnectedPlatforms } from "@/lib/oauth-store";

export async function GET() {
    const platforms = getConnectedPlatforms();

    // Also check for env-level configs
    const configs = {
        google: {
            clientConfigured: !!(process.env.GOOGLE_OAUTH_CLIENT_ID),
            connected: platforms.find(p => p.platform === "google")?.connected || false,
            accountName: platforms.find(p => p.platform === "google")?.accountName,
        },
        meta: {
            clientConfigured: !!(process.env.META_APP_ID),
            connected: platforms.find(p => p.platform === "meta")?.connected || false,
            accountName: platforms.find(p => p.platform === "meta")?.accountName,
        },
        twilio: {
            clientConfigured: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
            connected: !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN),
            accountName: process.env.TWILIO_PHONE_NUMBER || null,
        },
        stripe: {
            clientConfigured: !!(process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes("placeholder")),
            connected: !!(process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY.includes("placeholder")),
            accountName: "BioDynamX Stripe",
        },
        supabase: {
            clientConfigured: !!(process.env.SUPABASE_URL),
            connected: !!(process.env.SUPABASE_URL),
            accountName: process.env.SUPABASE_URL?.replace("https://", "").split(".")[0] || null,
        },
        gemini: {
            clientConfigured: !!(process.env.NEXT_PUBLIC_GEMINI_API_KEY),
            connected: !!(process.env.NEXT_PUBLIC_GEMINI_API_KEY),
            accountName: "Google AI",
        },
    };

    return NextResponse.json({
        platforms: configs,
        summary: {
            total: Object.keys(configs).length,
            connected: Object.values(configs).filter(c => c.connected).length,
            needsSetup: Object.entries(configs)
                .filter(([, c]) => !c.connected)
                .map(([name]) => name),
        },
    });
}
