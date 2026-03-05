// ============================================================================
// OAuth Token Storage & Management
// ============================================================================
// Stores and retrieves OAuth tokens for connected platforms.
// Uses Supabase for persistence, with .env.local fallback.
// ============================================================================

export interface OAuthTokens {
    accessToken: string;
    refreshToken?: string;
    expiresAt?: number;      // Unix timestamp
    scope?: string;
    tokenType?: string;
    platform: "google" | "google_ads" | "meta" | "linkedin" | "tiktok" | "stitch" | "resend" | "twilio";
    accountName?: string;    // Display name of connected account
    accountId?: string;      // Platform-specific account/page ID
    clientId?: string;       // BioDynamX client ID (to associate OAuth with specific client)
}

// In-memory cache (persisted to env vars or Supabase)
const tokenStore: Map<string, OAuthTokens> = new Map();

export function storeTokens(platform: string, tokens: OAuthTokens) {
    tokenStore.set(platform, tokens);
    console.log(`[OAuth] ✅ Stored tokens for ${platform} (account: ${tokens.accountName || "unknown"})`);
}

export function getTokens(platform: string): OAuthTokens | null {
    // Check memory first
    const cached = tokenStore.get(platform);
    if (cached) {
        // Check expiry
        if (cached.expiresAt && Date.now() > cached.expiresAt * 1000) {
            console.warn(`[OAuth] ⚠️ Token expired for ${platform}`);
            return null; // Caller should refresh
        }
        return cached;
    }

    // Check env vars as fallback
    const envKey = `${platform.toUpperCase()}_ACCESS_TOKEN`;
    const envToken = process.env[envKey];
    if (envToken) {
        return {
            accessToken: envToken,
            platform: platform as OAuthTokens["platform"],
        };
    }

    return null;
}

export function removeTokens(platform: string) {
    tokenStore.delete(platform);
    console.log(`[OAuth] 🗑️ Removed tokens for ${platform}`);
}

export function getConnectedPlatforms(): { platform: string; accountName?: string; connected: boolean }[] {
    const platforms = ["google", "google_ads", "meta", "linkedin", "tiktok", "stitch", "resend"];
    return platforms.map(p => ({
        platform: p,
        accountName: tokenStore.get(p)?.accountName,
        connected: tokenStore.has(p) || !!process.env[`${p.toUpperCase()}_ACCESS_TOKEN`],
    }));
}
