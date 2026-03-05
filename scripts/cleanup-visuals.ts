#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════
// SUPABASE VISUAL CACHE CLEANUP
// Removes first-round education images (text-heavy, not NLP metaphors)
// Keeps: contrast_* (12) + industry_reptilian (8) = 20 images
// Removes: seo_*, aeo_*, geo_*, gmb_*, missed_call_*, winback_* = 16 images
// ═══════════════════════════════════════════════════════════════════

import * as https from "https";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error("❌ Supabase credentials required");
    process.exit(1);
}

// Cache keys to DELETE — these were text-heavy info dumps, not NLP metaphors
const KEYS_TO_DELETE = [
    // SEO education — replaced by pure metaphor versions
    "seo_reptilian", "seo_limbic", "seo_neocortex",
    // AEO education — replaced by pure metaphor versions
    "aeo_reptilian", "aeo_limbic", "aeo_neocortex",
    // GEO education — replaced by pure metaphor versions
    "geo_reptilian", "geo_limbic", "geo_neocortex",
    // GMB education — replaced by metaphor versions
    "gmb_reptilian", "gmb_limbic", "gmb_neocortex",
    // Missed call + winback — replaced by metaphor + live-generated personalized versions
    "missed_call_reptilian", "missed_call_limbic",
    "winback_reptilian", "winback_limbic",
];

// Keys to KEEP (DO NOT DELETE)
// contrast_web4_walkthrough, contrast_we_are_product, contrast_separation_principle,
// contrast_conversations, contrast_night_shift, contrast_tools_partners,
// contrast_night_vision, contrast_ai_ownership, contrast_reviews_asking,
// contrast_speed_gap, contrast_custom_vs_template, contrast_guarantee
// dental_reptilian, attorney_reptilian, restaurant_reptilian, real_estate_reptilian,
// med_spa_reptilian, home_services_reptilian, bookkeeping_reptilian, medical_reptilian

function deleteFromSupabase(cacheKey: string): Promise<boolean> {
    return new Promise((resolve) => {
        const path = `/rest/v1/visual_asset_cache?cache_key=eq.${encodeURIComponent(cacheKey)}`;
        const parsedUrl = new URL(SUPABASE_URL);

        const options: https.RequestOptions = {
            hostname: parsedUrl.hostname,
            path,
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${SUPABASE_KEY}`,
                "apikey": SUPABASE_KEY,
                "Content-Type": "application/json",
            } as Record<string, string>,
        };

        const req = https.request(options, (res) => {
            res.resume();
            res.on("end", () => {
                const ok = (res.statusCode ?? 0) < 300;
                if (ok) {
                    console.log(`[Cleanup] 🗑️  Deleted: ${cacheKey}`);
                } else {
                    console.warn(`[Cleanup] ⚠️  HTTP ${res.statusCode} for: ${cacheKey}`);
                }
                resolve(ok);
            });
        });

        req.on("error", (err) => {
            console.error(`[Cleanup] ❌ ${cacheKey}:`, err.message);
            resolve(false);
        });

        req.end();
    });
}

async function cleanup() {
    console.log(`[Cleanup] 🧹 Removing ${KEYS_TO_DELETE.length} first-round education images from Supabase...`);
    console.log(`[Cleanup] ✅ KEEPING: 12 contrast_* images + 8 industry images (20 total)\n`);

    let removed = 0;
    for (const key of KEYS_TO_DELETE) {
        const ok = await deleteFromSupabase(key);
        if (ok) removed++;
        await new Promise(r => setTimeout(r, 200)); // small delay
    }

    console.log(`\n[Cleanup] 🏁 DONE — Removed ${removed}/${KEYS_TO_DELETE.length} records`);
    console.log(`[Cleanup] 💡 Supabase now contains only sharp, NLP-metaphor images`);
    console.log(`[Cleanup] 💡 Run: npm run seed-visuals to add the new metaphor replacements`);
}

cleanup().catch(console.error);
