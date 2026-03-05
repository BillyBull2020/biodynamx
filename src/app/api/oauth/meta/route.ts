// ============================================================================
// /api/oauth/meta — Meta (Facebook + Instagram) OAuth Flow
// ============================================================================
// GET  /api/oauth/meta           → Redirects to Facebook Login
// GET  /api/oauth/meta?code=...  → Callback from Meta with auth code
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { storeTokens } from "@/lib/oauth-store";

const META_APP_ID = process.env.META_APP_ID || "";
const META_APP_SECRET = process.env.META_APP_SECRET || "";
const REDIRECT_URI = `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001"}/api/oauth/meta`;

// Permissions for posting to Facebook Pages and Instagram
const SCOPES = [
    "pages_manage_posts",         // Post to Facebook Pages
    "pages_read_engagement",      // Read page engagement
    "pages_show_list",            // List managed pages
    "instagram_basic",            // Basic Instagram info
    "instagram_content_publish",  // Post to Instagram
    "instagram_manage_comments",  // Manage Instagram comments
    "public_profile",             // Basic profile
].join(",");

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
        console.error("[Meta OAuth] Error:", error);
        return NextResponse.redirect(
            new URL(`/dashboard/connect?error=${encodeURIComponent(error)}`, req.url)
        );
    }

    // ── Step 1: Initiate OAuth flow ───────────────────────────────
    if (!code) {
        if (!META_APP_ID) {
            return NextResponse.json({
                error: "Meta OAuth not configured",
                setup: {
                    step1: "Go to https://developers.facebook.com/apps/",
                    step2: "Create a new app (Business type)",
                    step3: "Add 'Facebook Login' product",
                    step4: `Set Valid OAuth Redirect URI to: ${REDIRECT_URI}`,
                    step5: "Copy App ID and App Secret",
                    step6: "Add META_APP_ID and META_APP_SECRET to .env.local",
                },
            }, { status: 400 });
        }

        const authUrl = new URL("https://www.facebook.com/v21.0/dialog/oauth");
        authUrl.searchParams.set("client_id", META_APP_ID);
        authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
        authUrl.searchParams.set("scope", SCOPES);
        authUrl.searchParams.set("response_type", "code");

        return NextResponse.redirect(authUrl.toString());
    }

    // ── Step 2: Exchange code for tokens ───────────────────────────
    try {
        // Get short-lived token
        const tokenRes = await fetch(
            `https://graph.facebook.com/v21.0/oauth/access_token?` +
            `client_id=${META_APP_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
            `&client_secret=${META_APP_SECRET}&code=${code}`
        );
        const tokenData = await tokenRes.json();

        if (tokenData.error) {
            console.error("[Meta OAuth] Token error:", tokenData.error);
            return NextResponse.redirect(
                new URL(`/dashboard/connect?error=${encodeURIComponent(tokenData.error.message)}`, req.url)
            );
        }

        // Exchange for long-lived token (60 days)
        const longLivedRes = await fetch(
            `https://graph.facebook.com/v21.0/oauth/access_token?` +
            `grant_type=fb_exchange_token&client_id=${META_APP_ID}` +
            `&client_secret=${META_APP_SECRET}&fb_exchange_token=${tokenData.access_token}`
        );
        const longLivedData = await longLivedRes.json();

        const accessToken = longLivedData.access_token || tokenData.access_token;

        // Get user info
        const userRes = await fetch(
            `https://graph.facebook.com/v21.0/me?fields=id,name&access_token=${accessToken}`
        );
        const user = await userRes.json();

        // Get managed pages
        const pagesRes = await fetch(
            `https://graph.facebook.com/v21.0/me/accounts?access_token=${accessToken}`
        );
        const pagesData = await pagesRes.json();

        // Store the tokens
        storeTokens("meta", {
            accessToken,
            expiresAt: Math.floor(Date.now() / 1000) + (longLivedData.expires_in || 5184000), // 60 days
            platform: "meta",
            accountName: user.name,
            accountId: user.id,
        });

        // Store page tokens if available
        if (pagesData.data && pagesData.data.length > 0) {
            const primaryPage = pagesData.data[0];
            storeTokens("meta_page", {
                accessToken: primaryPage.access_token,
                platform: "meta",
                accountName: primaryPage.name,
                accountId: primaryPage.id,
            });
            console.log(`[Meta OAuth] ✅ Connected page: ${primaryPage.name}`);
        }

        console.log(`[Meta OAuth] ✅ Connected: ${user.name}`);

        return NextResponse.redirect(
            new URL(`/dashboard/connect?success=meta&name=${encodeURIComponent(user.name)}`, req.url)
        );
    } catch (err) {
        console.error("[Meta OAuth] Exchange error:", err);
        return NextResponse.redirect(
            new URL(`/dashboard/connect?error=meta_token_exchange_failed`, req.url)
        );
    }
}
