// ═══════════════════════════════════════════════════════════════════════════
// VISUAL ASSET CACHE — Supabase-backed Nana Banana 2 Pre-Cache
// ═══════════════════════════════════════════════════════════════════════════
//
// PURPOSE: Pre-generated neuroscience images stored in Supabase Storage.
// When Jenny detects an industry, the matching image is already waiting
// in the cache — served in <50ms instead of 2-5 second Gemini generation.
//
// EFFECT: Looks like mind reading. The image that matches their exact
// industry and pain point appears almost before they've finished saying
// what they do for work.
//
// ARCHITECTURE:
//   Tier 1: Supabase cache check (< 50ms) — pre-generated images
//   Tier 2: Live Gemini generation (2-5 sec) — for personalized scenes
//            after audit data is available
//
// CACHE KEY FORMAT: {industry_slug}_{brain_phase}
// Examples: dental_reptilian | attorney_neocortex | restaurant_limbic
//
// SEEDING: Run `npm run seed-visuals` to pre-generate the full library
// ═══════════════════════════════════════════════════════════════════════════

import { createClient } from "@supabase/supabase-js";

// ── Types ──────────────────────────────────────────────────────────────────

export type BrainPhase = "reptilian" | "limbic" | "neocortex" | "close";

export interface CachedVisual {
    id: string;
    cache_key: string;           // "{industry_slug}_{phase}"
    industry: string;
    phase: BrainPhase;
    image_url: string;           // Supabase Storage public URL
    industry_stat: string;       // The headline stat shown in the image
    neuro_reason: string;        // Why this image fires for this phase
    created_at: string;
    use_count: number;           // How many times it's been served
}

// ── Industry Slugs ─────────────────────────────────────────────────────────
// These must exactly match what's in your Supabase table

export const INDUSTRY_SLUGS: Record<string, string> = {
    "bookkeeping": "bookkeeping",
    "accounting": "bookkeeping",
    "cpa": "bookkeeping",
    "tax": "bookkeeping",
    "attorney": "attorney",
    "law": "attorney",
    "legal": "attorney",
    "restaurant": "restaurant",
    "food": "restaurant",
    "cafe": "restaurant",
    "bar": "restaurant",
    "dental": "dental",
    "dentist": "dental",
    "real estate": "real_estate",
    "realtor": "real_estate",
    "realty": "real_estate",
    "med spa": "med_spa",
    "spa": "med_spa",
    "aesthetic": "med_spa",
    "beauty": "med_spa",
    "hvac": "home_services",
    "plumbing": "home_services",
    "electrical": "home_services",
    "roofing": "home_services",
    "home service": "home_services",
    "medical": "medical",
    "clinic": "medical",
    "doctor": "medical",
    "health": "medical",
    "retail": "retail",
    "ecommerce": "retail",
    "store": "retail",
    "coaching": "agency",
    "consultant": "agency",
    "agency": "agency",
    "marketing": "agency",
    "call center": "call_center",
    "bpo": "call_center",
    "contact center": "call_center",
};

export const ALL_INDUSTRY_SLUGS = [
    "bookkeeping",
    "attorney",
    "restaurant",
    "dental",
    "real_estate",
    "med_spa",
    "home_services",
    "medical",
    "retail",
    "agency",
    "call_center",
    "default",
];

export const ALL_PHASES: BrainPhase[] = ["reptilian", "limbic", "neocortex", "close"];

// ── Cache Client ───────────────────────────────────────────────────────────

function getSupabase() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!url || !key) return null;
    return createClient(url, key);
}

// ── In-memory L1 cache ─────────────────────────────────────────────────────
// Keeps the most-recently-served images in RAM so repeat lookups are instant

const memCache = new Map<string, CachedVisual>();
const MEM_CACHE_TTL = 1000 * 60 * 30; // 30 minutes
const memCacheTimestamps = new Map<string, number>();

function getFromMemCache(key: string): CachedVisual | null {
    const ts = memCacheTimestamps.get(key);
    if (!ts || Date.now() - ts > MEM_CACHE_TTL) return null;
    return memCache.get(key) || null;
}

function setInMemCache(key: string, visual: CachedVisual): void {
    memCache.set(key, visual);
    memCacheTimestamps.set(key, Date.now());
}

// ── Industry Normalizer ────────────────────────────────────────────────────

export function normalizeIndustry(rawIndustry: string): string {
    if (!rawIndustry) return "default";
    const lower = rawIndustry.toLowerCase().trim();

    for (const [keyword, slug] of Object.entries(INDUSTRY_SLUGS)) {
        if (lower.includes(keyword)) return slug;
    }
    return "default";
}

// ── Core Cache Lookup ──────────────────────────────────────────────────────

/**
 * Fast path: returns a pre-generated Supabase image instantly.
 * Returns null if not in cache — caller falls back to live generation.
 *
 * Speed target: < 50ms (L1 RAM hit: < 1ms, L2 Supabase hit: < 50ms)
 */
export async function getCachedVisual(
    industry: string,
    phase: BrainPhase
): Promise<CachedVisual | null> {
    const slug = normalizeIndustry(industry);
    const cacheKey = `${slug}_${phase}`;

    // L1: RAM cache
    const memHit = getFromMemCache(cacheKey);
    if (memHit) {
        console.log(`[VisualCache] ⚡ L1 RAM hit: ${cacheKey}`);
        return memHit;
    }

    // L2: Supabase cache
    try {
        const supabase = getSupabase();
        if (!supabase) return null;

        const { data, error } = await supabase
            .from("visual_asset_cache")
            .select("*")
            .eq("cache_key", cacheKey)
            .order("use_count", { ascending: false })
            .limit(1)
            .single();

        if (error || !data) {
            console.log(`[VisualCache] Miss: ${cacheKey} — will live-generate`);
            return null;
        }

        const visual = data as CachedVisual;
        setInMemCache(cacheKey, visual);

        // Increment use_count non-blocking — void wrapper handles PromiseLike
        void Promise.resolve(
            supabase
                .from("visual_asset_cache")
                .update({ use_count: (visual.use_count || 0) + 1 })
                .eq("id", visual.id)
        ).catch(() => { /* non-fatal */ });


        console.log(`[VisualCache] ✅ L2 Supabase hit: ${cacheKey} (used ${visual.use_count}x)`);
        return visual;

    } catch (err) {
        console.warn(`[VisualCache] Lookup error for ${cacheKey}:`, err);
        return null;
    }
}

/**
 * Store a newly-generated image in Supabase for future instant retrieval.
 * Called AFTER live Gemini generation succeeds.
 * Non-blocking — never delays the visual delivery.
 */
export async function cacheGeneratedVisual(params: {
    industry: string;
    phase: BrainPhase;
    imageBase64: string;
    mimeType: string;
    industryStats: string;
    neuroReason: string;
}): Promise<void> {
    try {
        const supabase = getSupabase();
        if (!supabase) return;

        const slug = normalizeIndustry(params.industry);
        const cacheKey = `${slug}_${params.phase}`;
        const fileName = `${cacheKey}_${Date.now()}.${params.mimeType === "image/jpeg" ? "jpg" : "png"}`;

        // 1. Upload image to Supabase Storage
        const imageBuffer = Buffer.from(params.imageBase64, "base64");
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from("visual-assets")
            .upload(`neuro/${fileName}`, imageBuffer, {
                contentType: params.mimeType,
                upsert: false,
            });

        if (uploadError || !uploadData) {
            console.warn(`[VisualCache] Storage upload failed for ${cacheKey}:`, uploadError?.message);
            return;
        }

        // 2. Get the public URL
        const { data: urlData } = supabase.storage
            .from("visual-assets")
            .getPublicUrl(`neuro/${fileName}`);

        const publicUrl = urlData?.publicUrl;
        if (!publicUrl) return;

        // 3. Insert metadata record
        await supabase.from("visual_asset_cache").insert({
            cache_key: cacheKey,
            industry: slug,
            phase: params.phase,
            image_url: publicUrl,
            industry_stat: params.industryStats,
            neuro_reason: params.neuroReason,
            use_count: 0,
        });

        // 4. Also populate L1 RAM cache
        setInMemCache(cacheKey, {
            id: uploadData.id || cacheKey,
            cache_key: cacheKey,
            industry: slug,
            phase: params.phase,
            image_url: publicUrl,
            industry_stat: params.industryStats,
            neuro_reason: params.neuroReason,
            created_at: new Date().toISOString(),
            use_count: 0,
        });

        console.log(`[VisualCache] 📸 Cached new visual: ${cacheKey} → ${publicUrl}`);

    } catch (err) {
        // Never crash the visual pipeline over a caching failure
        console.warn(`[VisualCache] Cache write failed (non-fatal):`, err);
    }
}

// ── Supabase Schema SQL ────────────────────────────────────────────────────
// Run this once in Supabase SQL Editor to create the table:
//
// CREATE TABLE IF NOT EXISTS visual_asset_cache (
//   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
//   cache_key TEXT NOT NULL,
//   industry TEXT NOT NULL,
//   phase TEXT NOT NULL CHECK (phase IN ('reptilian','limbic','neocortex','close')),
//   image_url TEXT NOT NULL,
//   industry_stat TEXT,
//   neuro_reason TEXT,
//   use_count INTEGER DEFAULT 0,
//   created_at TIMESTAMPTZ DEFAULT NOW()
// );
// CREATE INDEX idx_visual_cache_key ON visual_asset_cache(cache_key);
//
// CREATE POLICY "Public visual assets readable" ON visual_asset_cache
//   FOR SELECT USING (true);
// ALTER TABLE visual_asset_cache ENABLE ROW LEVEL SECURITY;
