/**
 * /api/voice/session
 *
 * Server-side API key gate for Gemini Live voice agents.
 *
 * SECURITY MODEL:
 *  - GEMINI_API_KEY lives ONLY in server environment (no NEXT_PUBLIC prefix)
 *  - This endpoint validates origin, rate-limits by IP, then returns the key
 *  - Key is NOT bundled in any JS file — it's fetched at runtime per session
 *  - Cache-Control: no-store ensures CDNs never cache the response
 *
 * Rate limit: 15 session starts per IP per 5 minutes
 * (Generous for real users, blocks scrapers)
 */

import { NextRequest, NextResponse } from "next/server";

// In-memory rate limit store — persists across requests on same instance
// Cloud Run / Firebase Gen2 keeps instances warm for ~15 min
const rateMap = new Map<string, { count: number; resetAt: number }>();

const LIMIT = 15;       // max session starts per window
const WINDOW_MS = 5 * 60 * 1000; // 5 minutes
const CLEANUP_SIZE = 5000;     // prune old entries when store gets large

const ALLOWED_ORIGINS = [
    "https://biodynamx.com",
    "https://www.biodynamx.com",
    "https://bio-dynamx.web.app",
    "http://localhost:3000",
    "http://localhost:3001",
];

export async function GET(req: NextRequest) {
    // ── Origin validation ──────────────────────────────────────────
    const origin = req.headers.get("origin");
    if (origin && !ALLOWED_ORIGINS.includes(origin)) {
        return NextResponse.json(
            { error: "Unauthorized origin" },
            { status: 403 }
        );
    }

    // ── Rate limiting by IP ────────────────────────────────────────
    const ip =
        req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        req.headers.get("x-real-ip") ||
        "unknown";

    const now = Date.now();
    const slot = rateMap.get(ip);

    if (slot && slot.resetAt > now) {
        if (slot.count >= LIMIT) {
            return NextResponse.json(
                { error: "Too many session requests. Please wait a moment." },
                {
                    status: 429,
                    headers: {
                        "Retry-After": String(Math.ceil((slot.resetAt - now) / 1000)),
                    },
                }
            );
        }
        slot.count++;
    } else {
        rateMap.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    }

    // Prune stale entries
    if (rateMap.size > CLEANUP_SIZE) {
        for (const [k, v] of rateMap) {
            if (v.resetAt < now) rateMap.delete(k);
        }
    }

    // ── Key lookup ─────────────────────────────────────────────────
    const key = process.env.GEMINI_API_KEY;
    const cartesiaKey = process.env.CARTESIA_API_KEY;
    const cartesiaVoiceId = process.env.CARTESIA_VOICE_ID;

    if (!key) {
        console.error("[voice/session] GEMINI_API_KEY is not set in environment.");
        return NextResponse.json(
            { error: "Voice service temporarily unavailable." },
            { status: 503 }
        );
    }

    // ── Return ─────────────────────────────────────────────────────
    return NextResponse.json(
        {
            token: key,
            cartesiaKey,
            cartesiaVoiceId
        },
        {
            status: 200,
            headers: {
                // Never cache — a CDN or browser caching this defeats the purpose
                "Cache-Control": "no-store, no-cache, must-revalidate, private",
                "Pragma": "no-cache",
                "X-Content-Type-Options": "nosniff",
            },
        }
    );
}
