// ============================================================================
// /api/oauth/google — Google OAuth Flow (GMB, YouTube, etc.)
// ============================================================================
// GET  /api/oauth/google           → Redirects to Google consent screen
// GET  /api/oauth/google?code=...  → Callback from Google with auth code
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { storeTokens } from "@/lib/oauth-store";

const GOOGLE_CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID || "";
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET || "";
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/api/oauth/google`;

const SCOPES = [
    "https://www.googleapis.com/auth/business.manage",  // Google Business Profile (reviews)
    "https://www.googleapis.com/auth/userinfo.profile",  // Basic profile info
    "https://www.googleapis.com/auth/userinfo.email",    // Email
].join(" ");

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    // Handle errors from Google
    if (error) {
        console.error("[Google OAuth] Error:", error);
        return NextResponse.redirect(
            new URL(`/dashboard/connect?error=${encodeURIComponent(error)}`, req.url)
        );
    }

    // ── Step 1: No code = initiate OAuth flow ─────────────────────
    if (!code) {
        if (!GOOGLE_CLIENT_ID) {
            return NextResponse.json({
                error: "Google OAuth not configured",
                setup: {
                    step1: "Go to https://console.cloud.google.com/apis/credentials",
                    step2: "Create an OAuth 2.0 Client ID (Web application)",
                    step3: `Set authorized redirect URI to: ${REDIRECT_URI}`,
                    step4: "Enable 'Google My Business API' at https://console.cloud.google.com/apis/library",
                    step5: "Add GOOGLE_OAUTH_CLIENT_ID and GOOGLE_OAUTH_CLIENT_SECRET to .env.local",
                },
            }, { status: 400 });
        }

        const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
        authUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID);
        authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
        authUrl.searchParams.set("response_type", "code");
        authUrl.searchParams.set("scope", SCOPES);
        authUrl.searchParams.set("access_type", "offline");   // Get refresh token
        authUrl.searchParams.set("prompt", "consent");         // Always show consent

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
            console.error("[Google OAuth] Token error:", tokens);
            return NextResponse.redirect(
                new URL(`/dashboard/connect?error=${encodeURIComponent(tokens.error_description || tokens.error)}`, req.url)
            );
        }

        // Get user info for display
        const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
            headers: { Authorization: `Bearer ${tokens.access_token}` },
        });
        const user = await userRes.json();

        // Store the tokens
        storeTokens("google", {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token,
            expiresAt: Math.floor(Date.now() / 1000) + (tokens.expires_in || 3600),
            scope: tokens.scope,
            tokenType: tokens.token_type,
            platform: "google",
            accountName: user.name || user.email,
            accountId: user.id,
        });

        console.log(`[Google OAuth] ✅ Connected: ${user.email}`);

        return NextResponse.redirect(
            new URL(`/dashboard/connect?success=google&name=${encodeURIComponent(user.name || user.email)}`, req.url)
        );
    } catch (err) {
        console.error("[Google OAuth] Exchange error:", err);
        return NextResponse.redirect(
            new URL(`/dashboard/connect?error=token_exchange_failed`, req.url)
        );
    }
}
