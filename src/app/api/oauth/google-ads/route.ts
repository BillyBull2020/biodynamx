// ═══════════════════════════════════════════════════════════════════════════
// /api/oauth/google-ads — Google Ads OAuth (separate from GMB)
// ═══════════════════════════════════════════════════════════════════════════
// Google Ads requires broader scopes than GMB.
// GET /api/oauth/google-ads           → Initiates OAuth consent flow
// GET /api/oauth/google-ads?code=...  → Callback with auth code
// ═══════════════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { storeTokens } from "@/lib/oauth-store";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET || "";
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/api/oauth/google-ads`;

// Google Ads requires the AdWords scope
const SCOPES = [
    "https://www.googleapis.com/auth/adwords",
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/userinfo.email",
].join(" ");

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");
    const state = searchParams.get("state"); // clientId passed through OAuth flow

    if (error) {
        console.error("[Google Ads OAuth] Error:", error);
        return NextResponse.redirect(
            new URL(`/dashboard/connect?error=${encodeURIComponent(error)}&platform=google_ads`, req.url)
        );
    }

    // ── Step 1: No code = initiate OAuth flow ─────────────────────
    if (!code) {
        if (!GOOGLE_CLIENT_ID) {
            return NextResponse.json({
                error: "Google OAuth not configured",
                setup: {
                    step1: "Add GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET to .env.local",
                    step2: "Enable Google Ads API at https://console.cloud.google.com/apis/library",
                    step3: "Apply for developer token at https://ads.google.com/home/tools/manager-accounts/",
                    step4: `Add authorized redirect URI: ${REDIRECT_URI}`,
                },
            }, { status: 400 });
        }

        // Get clientId from query to pass through state
        const clientId = searchParams.get("clientId") || "";

        const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
        authUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID);
        authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
        authUrl.searchParams.set("response_type", "code");
        authUrl.searchParams.set("scope", SCOPES);
        authUrl.searchParams.set("access_type", "offline");
        authUrl.searchParams.set("prompt", "consent");
        if (clientId) authUrl.searchParams.set("state", clientId);

        return NextResponse.redirect(authUrl.toString());
    }

    // ── Step 2: Exchange code for tokens ───────────────────────────
    try {
        const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                code,
                client_id: GOOGLE_CLIENT_ID,
                client_secret: GOOGLE_CLIENT_SECRET,
                redirect_uri: REDIRECT_URI,
                grant_type: "authorization_code",
            }),
        });

        const tokens = await tokenRes.json();

        if (tokens.error) {
            console.error("[Google Ads OAuth] Token error:", tokens);
            return NextResponse.redirect(
                new URL(`/dashboard/connect?error=${encodeURIComponent(tokens.error_description || tokens.error)}&platform=google_ads`, req.url)
            );
        }

        // Get user info
        const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        const user = await userRes.json();

        // Store tokens keyed by platform
        storeTokens("google_ads", {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAt: Math.floor(Date.now() / 1000) + (tokens.expires_in || 3600),
            scope: tokens.scope,
            tokenType: tokens.token_type,
            platform: "google_ads",
            accountName: `Google Ads — ${user.name || user.email}`,
            accountId: user.id,
            // Also store state (clientId) so we can associate tokens with the right client
            clientId: state || undefined,
        });

        console.log(`[Google Ads OAuth] ✅ Connected Google Ads: ${user.email}`);

        return NextResponse.redirect(
            new URL(`/dashboard/connect?success=google_ads&name=${encodeURIComponent(user.name || user.email)}`, req.url)
        );
    } catch (err) {
        console.error("[Google Ads OAuth] Exchange error:", err);
        return NextResponse.redirect(
            new URL(`/dashboard/connect?error=token_exchange_failed&platform=google_ads`, req.url)
        );
    }
}
