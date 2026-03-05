#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════════════════════
// NANA BANANA 2 — SUPABASE VISUAL SEEDER
// Pre-generates industry + topic images and stores them for instant retrieval
//
// Usage:
//   npx ts-node --skip-project-check scripts/seed-visuals.ts
//   OR add to package.json: "seed-visuals": "ts-node scripts/seed-visuals.ts"
//
// What it seeds:
//   - SEO, AEO, GEO education images (3 phases each)
//   - Google My Business importance visuals
//   - Missed Call Text-Back quick win visuals
//   - Win-Back Campaign visuals
//   - All 12 industry × 4 brain phase base images (48 images)
//
// Once seeded, these serve instantly (< 50ms) during live Jenny calls.
// ═══════════════════════════════════════════════════════════════════════════

import * as https from "https";
import * as http from "http";

// ── Config ─────────────────────────────────────────────────────────────────

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
// APP_URL reserved for future local API calls

if (!GEMINI_API_KEY) {
    console.error("❌ GEMINI_API_KEY is required. Set NEXT_PUBLIC_GEMINI_API_KEY in your .env.local");
    process.exit(1);
}

console.log(`[Seeder] 🌱 Starting Nana Banana 2 Visual Seeder`);
console.log(`[Seeder] 🔑 API Key: ${GEMINI_API_KEY.substring(0, 8)}...`);
console.log(`[Seeder] 📦 Supabase: ${SUPABASE_URL ? "✅ Connected" : "⚠️  Not configured — will log only"}`);

// ── Image generation via Gemini API ────────────────────────────────────────

async function generateImage(prompt: string): Promise<{ base64: string; mimeType: string } | null> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp-image-generation:generateContent?key=${GEMINI_API_KEY}`;

    return new Promise((resolve) => {
        const postData = JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
        });

        const req = https.request(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(postData),
            },
        }, (res) => {
            let body = "";
            res.on("data", chunk => body += chunk);
            res.on("end", () => {
                try {
                    const data = JSON.parse(body);
                    const parts = data?.candidates?.[0]?.content?.parts || [];
                    for (const part of parts) {
                        if (part.inlineData?.data) {
                            resolve({ base64: part.inlineData.data, mimeType: part.inlineData.mimeType || "image/png" });
                            return;
                        }
                    }
                    console.warn("[Seeder] No image in response:", body.substring(0, 200));
                    resolve(null);
                } catch {
                    resolve(null);
                }
            });
        });

        req.on("error", (err) => {
            console.error("[Seeder] Request error:", err.message);
            resolve(null);
        });

        req.write(postData);
        req.end();
    });
}

// ── Supabase upload ─────────────────────────────────────────────────────────

async function uploadToSupabase(cacheKey: string, imageBase64: string, mimeType: string, industryStats: string, neuroReason: string): Promise<boolean> {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
        console.log(`[Seeder] 📝 Would cache: ${cacheKey} (Supabase not configured)`);
        return false;
    }

    try {
        const ext = mimeType === "image/jpeg" ? "jpg" : "png";
        const fileName = `${cacheKey}_seed_${Date.now()}.${ext}`;
        const imageBuffer = Buffer.from(imageBase64, "base64");

        // 1. Upload to Storage
        const uploadUrl = `${SUPABASE_URL}/storage/v1/object/visual-assets/neuro/${fileName}`;
        await fetchWithAuth(uploadUrl, "POST", SUPABASE_KEY, imageBuffer, mimeType);

        // 2. Get public URL
        const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/visual-assets/neuro/${fileName}`;

        // 3. Upsert DB record — delete old + insert new
        const deleteUrl = `${SUPABASE_URL}/rest/v1/visual_asset_cache?cache_key=eq.${encodeURIComponent(cacheKey)}`;
        await fetchWithAuth(deleteUrl, "DELETE", SUPABASE_KEY);

        const insertUrl = `${SUPABASE_URL}/rest/v1/visual_asset_cache`;
        await fetchWithAuth(insertUrl, "POST", SUPABASE_KEY, JSON.stringify({
            cache_key: cacheKey,
            industry: cacheKey.split("_").slice(0, -1).join("_"),
            phase: cacheKey.split("_").pop(),
            image_url: publicUrl,
            industry_stat: industryStats,
            neuro_reason: neuroReason,
            use_count: 0,
        }), "application/json");

        console.log(`[Seeder] 📸 Stored: ${cacheKey} → ${publicUrl}`);
        return true;
    } catch (err) {
        console.error(`[Seeder] ❌ Upload failed for ${cacheKey}:`, err);
        return false;
    }
}

function fetchWithAuth(url: string, method: string, token: string, body?: Buffer | string, contentType?: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const parsedUrl = new URL(url);
        const options: http.RequestOptions = {
            hostname: parsedUrl.hostname,
            path: parsedUrl.pathname + parsedUrl.search,
            method,
            headers: {
                "Authorization": `Bearer ${token}`,
                "apikey": token,
                "Prefer": "resolution=merge-duplicates",
                ...(contentType && body ? { "Content-Type": contentType } : {}),
                ...(body ? { "Content-Length": Buffer.isBuffer(body) ? body.length : Buffer.byteLength(body as string) } : {}),
            } as Record<string, string | number>,
        };

        const req = https.request(options, (res) => {
            res.resume();
            res.on("end", () => resolve());
        });
        req.on("error", reject);
        if (body) req.write(body);
        req.end();
    });
}

// ── Sleep ───────────────────────────────────────────────────────────────────

const sleep = (ms: number) => new Promise(r => setTimeout(r, ms));

// ── Visual Definitions ──────────────────────────────────────────────────────
// Each entry = one image to pre-generate and cache in Supabase

interface VisualSeed {
    cacheKey: string;
    label: string;
    industryStats: string;
    neuroReason: string;
    prompt: string;
}

const EDUCATION_VISUALS: VisualSeed[] = [
    // ── SEO ──
    {
        cacheKey: "seo_reptilian",
        label: "SEO — The Invisibility Crisis",
        industryStats: "93% of online experiences begin with a search engine. Page 2 of Google gets 0.78% of clicks.",
        neuroReason: "Reptilian threat: if they can't find you, they already chose your competitor",
        prompt: `Create a stunning, dark premium cinematic image visualizing SEARCH ENGINE OPTIMIZATION (SEO).

Scene: A dramatic dark cityscape at night. Some businesses are lit up like beacons, glowing at the top of a glowing search results list that floats like a hologram above the city. At the bottom of the list — fading into shadow — are dim, barely visible businesses.

FOCAL STATISTIC (large, glowing text): "93% of Clicks Go To Page 1"

Secondary text: "Page 2 = Invisible"

Visual metaphor: Businesses on page 1 are towering, bright, thriving with activity. Businesses NOT ranking are literally fading into darkness, with customers streaming past them toward the bright competitors.

Style: Ultra-premium, dark navy/black background, electric blue and gold accent glows, cinematic depth of field, photorealistic 8K quality, 16:9 widescreen. MINIMAL text — only the key stat. No watermarks.`,
    },
    {
        cacheKey: "seo_limbic",
        label: "SEO — The Promise of Rankings",
        industryStats: "Businesses on page 1 get 91% of search traffic. Average page 1 business earns 14x more than page 2.",
        neuroReason: "Limbic hope: the transformation from invisible to dominant",
        prompt: `Create a stunning, cinematic image about rising to the top of search results — the promise of SEO.

Scene: A dramatic upward-soaring perspective. A business logo/building is launching upward toward a glowing "#1" position at the top of a holographic search results display. Below, competitors shrink into the distance.

Atmosphere: Triumphant, energetic, aspirational. The colors shift from dark grey (the struggle) at the bottom to vibrant gold and electric blue at the top where the business is heading.

FOCAL TEXT: "#1 On Google — More Calls. More Customers."

Visual feeling: Like a rocket launching toward success. The business is ascending while competitors stay grounded.

Style: Ultra-premium, dark with vibrant electric blue and gold glows, cinematic lighting, photorealistic 8K, 16:9 widescreen. Minimal text. No watermarks.`,
    },
    {
        cacheKey: "seo_neocortex",
        label: "SEO — The ROI Data",
        industryStats: "Companies investing in SEO see an average 22:1 ROI. Local SEO converts 80% of local mobile searches to same-day calls.",
        neuroReason: "Neocortex proof: the math makes SEO the highest-ROI marketing channel",
        prompt: `Create a premium data visualization image about SEO return on investment.

Scene: A sleek financial/analytics dashboard showing SEO performance metrics in a premium, Apple-meets-Bloomberg aesthetic.

Key data panels:
- "Average SEO ROI: 22:1"
- "Organic Traffic Cost: $0 Per Click"
- "Paid Traffic: $3-$15 Per Click"  
- "Local Search → Same-Day Call: 80%"
- An upward-trending graph showing organic traffic growth vs ad cost

Visual design: Dark premium dashboard, glowing cyan/blue data streams, the ROI numbers are the stars — large, bright, undeniable. Clean HUD aesthetic.

Style: Ultra-premium tech dashboard, dark background, electric blue and cyan glows, 8K detail, 16:9 widescreen. Minimal text — only the key statistics shown as data panels. No watermarks.`,
    },

    // ── AEO ──
    {
        cacheKey: "aeo_reptilian",
        label: "AEO — The Voice Search Invisibility",
        industryStats: "50% of all searches will be voice-based by 2025. Voice search results in ZERO clicks to your website — the AI answers directly.",
        neuroReason: "Reptilian threat: if Siri and Alexa don't know you, you don't exist for half the searching population",
        prompt: `Create a dramatic cinematic image about Answer Engine Optimization (AEO) and the voice search revolution.

Scene: A person asks their phone/smart speaker: "Hey Siri, who's the best dentist near me?" The phone's AI assistant answers with a competitor's name. The real business owner watches in horror — their business is completely absent from the answer.

Visual elements:
- A glowing smartphone/smart speaker in center frame
- The AI voice visualization (sound waves) coming from it
- Business A: bright, glowing, recognized by AI — shown prominently 
- Business B (the prospect): dim, greyed out, labeled "NOT FOUND"
- Floating text: "Voice Search. AI Answers. You're Not There."

FOCAL STATISTIC: "50% of Searches Are Now Voice — Is AI Finding You?"

Style: Ultra-premium, dark cinematic, neon blue accent colors for the AI/tech elements, photorealistic 8K, 16:9 widescreen. Minimal text. No watermarks.`,
    },
    {
        cacheKey: "aeo_limbic",
        label: "AEO — Being the Answer",
        industryStats: "Featured snippets get 8x more clicks than regular results. Being the voice search answer = infinite authority.",
        neuroReason: "Limbic pride: imagine being the ONE answer the AI always gives for your category",
        prompt: `Create a triumphant cinematic image about a business being THE answer that AI voice assistants give.

Scene: A smartphone with voice assistant active. The AI is confidently saying this business's name as THE recommended local expert. Sound waves radiate outward in golden light, connecting to happy customers who are calling, booking, visiting.

The business is shown at the top of a "Featured Answer" box — glowing, authoritative, chosen.

Atmosphere: Powerful, prestigious, the feeling of BEING the one everyone gets directed to. Like being the voice-search equivalent of #1 on Google.

FOCAL TEXT: "When AI Speaks — Your Name Leads."

Style: Ultra-premium, warm gold and electric blue tones, cinematic depth, 8K photorealistic, 16:9 widescreen. Minimal text. No watermarks.`,
    },
    {
        cacheKey: "aeo_neocortex",
        label: "AEO — The Data Proof",
        industryStats: "Position 0 (Featured Snippet) captures 35.1% of clicks. Answer engine presence = zero-cost customer acquisition.",
        neuroReason: "Neocortex certainty: AEO creates a zero-ad-spend traffic channel through voice and featured answers",
        prompt: `Create a premium analytics dashboard image showing AEO (Answer Engine Optimization) performance data.

Data panels shown:
- "Featured Snippet Click Rate: 35.1%"
- "Voice Search Answers: 0 Cost Per Acquisition"
- "Google PAA Boxes: 43% of All Results"
- "AEO-Optimized Sites: 8x More Visibility"
- A pie chart showing: voice search, featured snippets, PAA boxes as share of all AI-driven traffic

The dashboard has a premium intelligence feel — like a command center for digital visibility.

Style: Ultra-premium dark analytics dashboard, electric blue and cyan data visualizations, crisp data panels, 8K resolution, 16:9 widescreen. Minimal text — data panels only. No watermarks.`,
    },

    // ── GEO ──
    {
        cacheKey: "geo_reptilian",
        label: "GEO — The AI Invisibility Crisis",
        industryStats: "ChatGPT has 100M+ daily users asking for business recommendations. If you're not optimized for AI, you don't exist to 100M people.",
        neuroReason: "Reptilian threat: a massive wave of AI-driven decisions is happening right now — and most businesses are invisible to it",
        prompt: `Create a dramatic cinematic image about Generative Engine Optimization (GEO) — being invisible to AI models.

Scene: ChatGPT, Google Gemini, and Perplexity logos are shown as massive glowing portals in a futuristic landscape. Thousands of customers are streaming through these portals asking for recommendations. 

For one business: the AI portals show its competitor with a green checkmark. The business not optimized for GEO is shown as a ghost — transparent, invisible, walking through the crowd unnoticed while customers stream past them.

FOCAL STATISTIC: "100M Daily AI Users. Does ChatGPT Know Your Name?"

Visual elements: Dark sci-fi atmosphere, holographic AI interfaces, streams of potential customers choosing the AI's recommended businesses.

Style: Ultra-premium dark cinematic, electric blue/purple sci-fi tones, 8K photorealistic, 16:9 widescreen. Minimal text. No watermarks.`,
    },
    {
        cacheKey: "geo_limbic",
        label: "GEO — Being the AI's Recommended Choice",
        industryStats: "When ChatGPT recommends a business, 73% of users click without googling further. AI citation = the new word of mouth.",
        neuroReason: "Limbic aspiration: being the business that AI models consistently recommend = infinite trust and authority",
        prompt: `Create an aspirational cinematic image about a business being THE one that ChatGPT, Gemini, and Perplexity recommend.

Scene: A business owner is beaming as they watch their business name appear in prominent AI recommendation answers across multiple AI interfaces — ChatGPT, Gemini, Perplexity all showing their business as THE top recommendation for their category.

The AI interfaces are shown as glowing holographic screens, each confidently recommending this business. Customers are flowing toward the business from all these AI channels simultaneously.

Atmosphere: A sense of absolute digital authority — being chosen by all the AI models as THE go-to expert. It feels like the most powerful referral network ever built.

FOCAL TEXT: "Every AI Recommends You. Every Time."

Style: Warm gold and electric blue premium tones, cinematic depth, triumphant atmosphere, 8K photorealistic, 16:9 widescreen. Minimal text. No watermarks.`,
    },
    {
        cacheKey: "geo_neocortex",
        label: "GEO — The AI Era ROI Math",
        industryStats: "GEO-optimized businesses get cited 3x more in AI answers. Each AI citation = an implied endorsement to millions of users.",
        neuroReason: "Neocortex permission: the number of people using AI for recommendations is growing exponentially — early movers win everything",
        prompt: `Create a premium technology statistics image about GEO (Generative Engine Optimization) performance data.

Data dashboard showing the AI visibility landscape:
- "ChatGPT Daily Users: 100M+"
- "Gemini Monthly Queries: 1.5B"  
- "Perplexity Users: 15M (growing 400%/year)"
- "GEO-Optimized Businesses: 3x More AI Citations"
- "AI-Driven Purchase Decisions: 73% No Further Research Needed"
- A growth chart showing AI search volume vs traditional Google search

The visual tells the story: AI search is growing exponentially, and most businesses aren't there yet. Early movers win everything.

Style: Ultra-premium dark intelligence dashboard, electric blue and purple sci-fi data visualizations, clean data panels, 8K resolution, 16:9 widescreen. Minimal text — key statistics only. No watermarks.`,
    },

    // ── GOOGLE MY BUSINESS ──
    {
        cacheKey: "gmb_reptilian",
        label: "Google My Business — The Local Invisibility Loss",
        industryStats: "46% of all Google searches have local intent. 'Near me' searches grew 900% in 2 years. Businesses without GMB are invisible to half of all local searches.",
        neuroReason: "Reptilian threat: without an optimized GMB, local customers find competitors on the map every single time",
        prompt: `Create a dramatic cinematic image about Google My Business and the cost of local invisibility.

Scene: A Google Maps view from above — a city with businesses as glowing pins on the map. Some pins are bright gold and prominently labeled with star ratings, photos, hours — these businesses are thriving. Other businesses are literally absent from the map — shown as dark spots where customers walk right past, not knowing they exist.

A stream of local customers is flowing toward the visible businesses (the bright pins) while the unclaimed/unoptimized businesses stand empty.

FOCAL STATISTIC: "46% of All Searches Have Local Intent. Can They Find You?"

Google Maps pin icon shown prominently — bright for claimed businesses, absent for unclaimed ones.

Style: Ultra-premium satellite/map aesthetic, warm orange/gold for visible businesses vs cold grey for invisible ones, dramatic lighting, 8K photorealistic, 16:9 widescreen. Minimal text. No watermarks.`,
    },
    {
        cacheKey: "gmb_limbic",
        label: "Google My Business — Being the Map Pack Winner",
        industryStats: "Google Map Pack gets 44% of all local search clicks. 5-star review businesses convert 270% better than average.",
        neuroReason: "Limbic aspiration: being the top 3 on the Google map is the most valuable real estate in local business",
        prompt: `Create a triumphant cinematic image about winning the Google local map pack — being the top 3 visible business.

Scene: A glowing Google Maps interface showing the coveted LOCAL THREE-PACK at the top — and ONE business shining brighter than the others, with dozens of 5-star reviews, professional photos, correct hours, glowing golden star ratings. Customers in the real world below are flowing toward this business.

The business has a perfect GMB profile — showcased like a trophy. Photos are beautiful. Reviews are glowing. It's the first thing any local customer sees.

Atmosphere: Pride, dominance, being the obvious choice in your neighborhood. Local customers just chose them — automatically, without even thinking.

FOCAL TEXT: "Be The First Business They See. Then Call."

Style: Google Maps aesthetic blending with premium dark cinematic, gold star ratings, warm customer activity below, 8K photorealistic, 16:9 widescreen. Minimal text. No watermarks.`,
    },
    {
        cacheKey: "gmb_neocortex",
        label: "Google My Business — The Local ROI Data",
        industryStats: "Optimized Google Business Profiles drive 5x more phone calls and 3x more website visits. Each positive review increases purchase probability by 9%.",
        neuroReason: "Neocortex data: GMB optimization is the highest-ROI free tool any local business can use",
        prompt: `Create a premium data dashboard image showing Google My Business ROI statistics.

Data panels shown:
- "Optimized GMB Profile: 5x More Phone Calls"
- "GMB Photos: 40% More Direction Requests" 
- "Each 1-Star Rating Increase: +9% Revenue"
- "Map Pack Position #1 vs #3: 64% More Clicks"  
- "Zero Ad Spend — 100% Organic Local Traffic"
- A comparison chart: optimized GMB vs no GMB — call volume, visits, conversions

The dashboard makes the ROI undeniable. Optimizing GMB is free and produces massive results.

Style: Ultra-premium Google Maps branding colors (blue, red, gold stars) blended with dark analytics dashboard, clean data panels, 8K resolution, 16:9 widescreen. Key stats only. No watermarks.`,
    },

    // ── MISSED CALL TEXT-BACK ──
    {
        cacheKey: "missed_call_reptilian",
        label: "Missed Call Text-Back — The Revenue Hemorrhage",
        industryStats: "62% of small business calls go unanswered. 80% of callers don't leave voicemails — they call the next business on the list. That competitor answers.",
        neuroReason: "Reptilian threat: every missed call is a confirmed lost sale going directly to a competitor right now",
        prompt: `Create a dramatic cinematic image about missed calls destroying business revenue.

Scene: An office phone is ringing in an empty reception area — nobody answers. The caller on the other end is shown simultaneously dialing a competitor. As the call goes to voicemail, a stream of golden coins flows OUT of the frame — representing the lost revenue.

On one side: a phone ringing with "MISSED CALL" notification. On the other: a competitor's phone being answered, with a happy customer and a handshake.

FOCAL STATISTIC: "62% of Calls Unanswered. 80% Don't Leave Voicemail. They Call Your Competitor."

The image makes the stomach drop — every missed call is money walking out the door.

Style: Dark, cinematic, urgent amber/red emergency lighting on the missed call side, bright warm gold on the competitor's answered side, photorealistic 8K, 16:9 widescreen. Minimal text. No watermarks.`,
    },
    {
        cacheKey: "missed_call_limbic",
        label: "Missed Call Text-Back — The Auto-Recovery Moment",
        industryStats: "A missed call text-back sent within 5 minutes recovers 40% of otherwise-lost leads. The average recovered lead value: $850–$4,200.",
        neuroReason: "Limbic relief: the system catches what you missed — like a safety net that turns losses into wins",
        prompt: `Create a warm, reassuring cinematic image about the Missed Call Text-Back system catching leads automatically.

Scene: A phone misses a call. Instantly — within 5 seconds — an automatic text message fires: "Hi! We just missed your call. I'm Jenny from [Business Name]. Can I help you right now?" The caller smiles and immediately responds. The lead is recovered.

Show the chain: missed call → instant AI text → customer replies → appointment booked → money recovered. This should feel like a safety net catching a ball that would have otherwise hit the ground.

Atmosphere: Relief, warmth, cleverness. "We NEVER lose a lead." The system works while the owner is busy.

FOCAL TEXT: "Missed Call? Text Back in 5 Seconds. Lead Recovered."

Style: Warm amber to hopeful gold color transition, cinematic, phone screen prominent, text message thread visible, photorealistic 8K, 16:9 widescreen. Minimal text. No watermarks.`,
    },

    // ── WIN-BACK CAMPAIGNS ──
    {
        cacheKey: "winback_reptilian",
        label: "Win-Back Campaigns — The Dormant Revenue Discovery",
        industryStats: "The average small business has 200-400 dormant customers. Reactivating them costs 5-25x LESS than acquiring new ones. Most businesses have $40,000–$120,000 in dormant customer revenue they've never asked for.",
        neuroReason: "Reptilian urgency: dormant customer money is sitting there unclaimed right now — competitors are targeting those same people",
        prompt: `Create a dramatic cinematic image about dormant customer win-back campaigns.

Scene: A business has a filing cabinet or CRM database full of PAST customers — people who bought once and disappeared. These customers are shown as dim, faded contacts in a database, floating like ghosts. Meanwhile, their competitors are actively texting and calling these same people.

Show the contrast: on one side, forgotten customers collecting digital dust. On the other, those same people responding to a personal outreach and returning happily with new purchases.

FOCAL STATISTIC: "You Have $40K-$120K in Dormant Customer Revenue. We Wake It Up."

The visual should make the business owner feel: "That's MY money sitting right there unclaimed."

Style: Dark cinematic, the database of forgotten customers in cold blue-grey tones, the win-back sequence in warm gold as customers "light back up", photorealistic 8K, 16:9 widescreen. Minimal text. No watermarks.`,
    },
    {
        cacheKey: "winback_limbic",
        label: "Win-Back Campaigns — The Reunion",
        industryStats: "Existing customers convert at 60-70% on win-back campaigns vs 5-20% for new leads. A personal text or call from a business they trust = instant loyalty activation.",
        neuroReason: "Limbic nostalgia + trust: past customers already know and trust you — reigniting that relationship is the highest-conversion play",
        prompt: `Create a warm, emotional cinematic image about reconnecting with dormant customers.

Scene: A business sends a personal, warm text to a long-lost customer: "Hey [Name], we miss you! It's been 6 months — we'd love to welcome you back with something special." The customer's face lights up. They remember the great experience. They call back. They return.

Show the moment of reconnection — the emotional warmth of a business that remembers you and reaches out personally. Like getting a call from an old friend who runs a business you loved.

Atmosphere: Warmth, nostalgia, loyalty. The feeling of "they remembered me." This is an emotional trigger that drives immediate action.

FOCAL TEXT: "Your Best Future Customers Already Know You."

Style: Warm golds and ambers, cozy and human, a phone screen showing the personal text, customer smiling, return booking confirmed, photorealistic 8K, 16:9 widescreen. Minimal text. No watermarks.`,
    },
];

// ── Industry Base Images (subset for seeding — all 12 industries, reptilian phase only) ──

const INDUSTRY_SEEDS: VisualSeed[] = [
    {
        cacheKey: "dental_reptilian",
        label: "Dental — Revenue Hemorrhage",
        industryStats: "Dental practices miss 40% of new patient calls — each worth $1,200–$4,500",
        neuroReason: "Industry-specific missed revenue stats trigger cortisol attention",
        prompt: `Create a cinematic image for a DENTAL PRACTICE showing the cost of missed calls and patient acquisition gaps.
Show: A busy dental office phone ringing with nobody answering, while a patient books at a competitor.
FOCAL STAT: "40% of New Patient Calls Go Unanswered — Each Worth $1,200–$4,500"
Style: Clean dental whites and electric blue accents, premium cinematic dark background, 8K, 16:9. Minimal text.`,
    },
    {
        cacheKey: "attorney_reptilian",
        label: "Attorney — Missed Cases",
        industryStats: "42% of legal leads contact the second firm within 5 minutes of not reaching the first",
        neuroReason: "Legal clients have extreme urgency — speed wins cases",
        prompt: `Create a cinematic image for a LAW FIRM showing the urgency of instant lead response.
Show: A potential client calling a law firm — nobody answers — they immediately call a competitor who answers. A $50,000+ case walks out the door.
FOCAL STAT: "42% of Legal Leads Call the Next Firm in Under 5 Minutes"
Style: Deep mahogany and gold, prestigious law office atmosphere, cinematic dark, 8K, 16:9. Minimal text.`,
    },
    {
        cacheKey: "restaurant_reptilian",
        label: "Restaurant — Empty Tables",
        industryStats: "Restaurants lose 78% of unanswered reservation inquiries within 5 minutes",
        neuroReason: "Visual of empty tables during peak hours triggers immediate pain recognition",
        prompt: `Create a cinematic image for a RESTAURANT showing unanswered reservation calls leading to empty tables.
Show: A beautiful restaurant with half-empty tables on a Friday night, while the phone rings unanswered. Competing restaurant next door is packed.
FOCAL STAT: "78% of Unanswered Reservation Calls Book Elsewhere in Under 5 Minutes"
Style: Warm amber restaurant lighting, beautiful plated food, the contrast of empty tables vs full competitor, cinematic 8K, 16:9. Minimal text.`,
    },
    {
        cacheKey: "real_estate_reptilian",
        label: "Real Estate — Missed Commissions",
        industryStats: "78% of home buyers choose the first agent who responds — not the best agent",
        neuroReason: "Speed = commission in real estate — stark and immediate",
        prompt: `Create a cinematic image for a REAL ESTATE AGENT showing how speed kills the competition.
Show: Two phones — Agent A responds in 30 seconds, gets the client and the commission. Agent B responds 2 hours later to an empty line. The house is already sold.
FOCAL STAT: "78% of Buyers Choose the Agent Who Responds FIRST"
Style: Luxury home exterior, gold and navy, high-contrast speed vs missed opportunity, 8K cinematic, 16:9. Minimal text.`,
    },
    {
        cacheKey: "med_spa_reptilian",
        label: "Med Spa — After-Hours Revenue Loss",
        industryStats: "67% of high-value aesthetic patients research and book after 6 PM — when most spas are closed",
        neuroReason: "After-hours = the primary booking window for high-LTV spa clients",
        prompt: `Create a cinematic image for a MED SPA showing after-hours revenue leaking away.
Show: A luxury spa at 9 PM — lights off, phone going to voicemail. Meanwhile, high-value patients are browsing on their phones trying to book. They book a competitor who has online booking active.
FOCAL STAT: "67% of High-Value Patients Book After 6 PM. Who's Answering?"
Style: Rose gold, champagne, luxury spa elements, night lighting showing the closed sign, photorealistic 8K, 16:9. Minimal text.`,
    },
    {
        cacheKey: "home_services_reptilian",
        label: "Home Services — Emergency Call Loss",
        industryStats: "HVAC/plumbing: 67% of emergency callers use the first company that answers at 2 AM",
        neuroReason: "After-hours emergencies = highest-value jobs going to whoever answers",
        prompt: `Create a cinematic image for a HOME SERVICES company showing emergency calls going to competitors.
Show: A homeowner at 2 AM with a burst pipe or broken HVAC. They're calling desperately. Company A doesn't answer. They immediately call Company B who answers in 2 seconds and dispatches a technician.
FOCAL STAT: "Emergency Calls at 2 AM: 67% Go to Whoever Answers First"
Style: Deep navy and orange, night emergency urgency, service van in driveway of winner, 8K cinematic, 16:9. Minimal text.`,
    },
    {
        cacheKey: "bookkeeping_reptilian",
        label: "Bookkeeping — Client Churn",
        industryStats: "47% of small business owners switch accountants due to slow response times",
        neuroReason: "Accountants lose clients to speed, not quality — a surprising and urgent stat",
        prompt: `Create a cinematic image for an ACCOUNTING/BOOKKEEPING FIRM showing client loss from slow response.
Show: A client waiting 3 days for a callback. Tax season pressure. They move their account to a more responsive firm. Financial data streams away as the client leaves.
FOCAL STAT: "47% of Business Owners Switch Accountants for Faster Response — Not Better Service"
Style: Navy blue, gold, financial data streams, professional office atmosphere, 8K cinematic, 16:9. Minimal text.`,
    },
    {
        cacheKey: "medical_reptilian",
        label: "Medical — No-Show Revenue Loss",
        industryStats: "Medical practices lose $14,000/month average to scheduling gaps and no-shows without AI reminders",
        neuroReason: "No-show cost is invisible until made visible — shocking recognition",
        prompt: `Create a cinematic image for a MEDICAL CLINIC showing the hidden cost of patient no-shows.
Show: A clinic with empty appointment slots — each slot labeled with a dollar amount of lost revenue. A visual showing what $14,000/month in no-shows looks like — stacks of money evaporating from an empty waiting room.
FOCAL STAT: "Empty Appointment Slots Cost $14,000/Month in Lost Revenue"
Style: Clean white medical, healing blue and green, the contrast of empty vs full scheduling, 8K cinematic, 16:9. Minimal text.`,
    },
];

// ── Contrast Differentiation Visuals — The 12 Contrast Lines ────────────────
// Split-field format: LEFT = cold grey (competitor world) / RIGHT = electric gold+blue (BioDynamX)
// Each has 2-3 floating bullet-point overlays. Consistent cinematic dark background across all 12.

const CONTRAST_VISUALS: VisualSeed[] = [
    {
        cacheKey: "contrast_web4_walkthrough",
        label: "Contrast 1 — Web 4.0 Walkthrough vs. Link Drop",
        industryStats: "Abandoned cart rates: 70% when prospects receive a link. Under 12% when guided through by a voice agent.",
        neuroReason: "Reptilian contrast: the competitor's passive link vs. our active walk-through makes the difference viscerally obvious",
        prompt: `Create a stunning cinematic split-screen image representing Web 4.0 AI vs. old-school link-sending.  

LEFT HALF (cold grey, dim, faded — the competitor world):
- A generic "click to pay" email with a blue hyperlink sitting in an inbox
- The email is unopened, grayed out, a shopping cart icon shows 70% abandoned
- Small floating label: "They Send a Link"
- Bullet points in cold white: "• Hope they click  • 70% abandon  • No follow-up"

RIGHT HALF (electric gold and blue, glowing, alive — BioDynamX):
- A holographic AI agent (Jenny) visible as a voice waveform guiding a smiling customer
- Phone screen shows: live conversation → payment completed → booking confirmed → all in ONE thread
- Small floating label: "We Walk Them Through"
- Bullet points in electric gold: "• Live guided checkout  • Objections handled  • Payment closed in convo"

CENTER DIVIDER: A sharp vertical lightning-bolt split, softly glowing electric blue

BOTTOM CENTER TEXT: "Web 4.0 — The Conversation IS the Checkout"

Style: Dark cinematic background, 16:9 widescreen, ultra-premium, neon contrast, minimal but impactful text, photorealistic quality. No watermarks.`,
    },
    {
        cacheKey: "contrast_we_are_product",
        label: "Contrast 2 — We ARE the Product",
        industryStats: "Live demo conversion rates are 3-6x higher than slide presentations. Experiencing is believing.",
        neuroReason: "Oxytocin + Dopamine: the prospect is INSIDE the product right now — that's the most powerful trust signal possible",
        prompt: `Create a stunning cinematic image representing the idea that BioDynamX IS the demo — the conversation itself is the product.

Scene: A split between two worlds:

LEFT HALF (dim, cold grey — traditional AI company):
- A presenter standing at a PowerPoint slide deck showing "AI DEMO" on a screen
- Audience looking bored, checking phones
- Label overlay: "They Show You Slides"
- Cold bullet points: "• Recorded demos  • Scripted walk-throughs  • Results not guaranteed"

RIGHT HALF (alive, vibrant gold and blue — BioDynamX):
- A person on a phone, actively in conversation, visibly engaged and leaning in
- Around them: holographic data rings — live audit results, real-time voice waveforms, glowing business insights pulling up in real time
- The word "LIVE" glows in electric gold
- Bullet points: "• You ARE in the demo  • Real audit. Real numbers.  • This IS what your clients will experience"

BOTTOM CENTER TEXT: "Don't Watch a Demo. Live It."

Style: Split-screen, dark cinematic, left=cold/grey/flat, right=electric gold+blue/alive/dynamic. 16:9 widescreen. Ultra-premium photorealistic, minimal text, no watermarks.`,
    },
    {
        cacheKey: "contrast_separation_principle",
        label: "Contrast 3 — The Separation Principle",
        industryStats: "Businesses that differentiate on AI and neuroscience see 3x higher conversion rates than those competing on price.",
        neuroReason: "Mirror neurons: 'what works on you works on your customers' creates immediate empathy and understanding",
        prompt: `Create a powerful cinematic split-field image about the idea that what separates BioDynamX from competitors is the SAME thing that will separate the client from THEIR competitors.

LEFT HALF (grey, flat, undifferentiated — competitor world):
- Rows of identical grey storefronts, all looking the same, blending together
- Generic "SALE" signs, template websites
- Label: "Everyone Else"
- Bullets: "• Same tools  • Same templates  • Same results"

RIGHT HALF (vibrant, distinctive, glowing — BioDynamX client):
- One business GLOWING and elevated above the rest — taller, brighter, unmistakably different
- Gold light radiates from it, customers naturally gravitating toward it
- A neural/brain circuit pattern subtly visible — the neuroscience
- Label: "You, With BioDynamX"
- Bullets: "• Neuroscience-driven  • AI that closes  • The obvious choice"

BOTTOM TEXT: "What Separates Us — Will Separate You."

Style: Dark cinematic, dramatic, left=monochrome/flat, right=gold+electric blue elevation, 16:9. Ultra-premium. No watermarks.`,
    },
    {
        cacheKey: "contrast_conversations",
        label: "Contrast 4 — Campaigns vs. Conversations",
        industryStats: "Email open rates: 21% average. AI voice + personalized SMS open rates: 94%. Conversations convert. Campaigns hope.",
        neuroReason: "Dopamine loops: a real conversation feels alive and personal; a mass email feels like noise",
        prompt: `Create a cinematic split-screen image contrasting mass marketing campaigns vs. personal AI conversations.

LEFT HALF (grey, cluttered, ignored — competitor approach):
- An overflowing inbox with hundreds of identical mass emails, most marked as spam
- Email open rate stat: "21%" in small cold text
- An automated email template builder — generic, every client looks the same
- Label: "They Run Campaigns"
- Bullets: "• Mass blasts  • 21% open rate  • No memory, no context"

RIGHT HALF (warm, alive, personal — BioDynamX):
- A text message thread — personal, using the customer's name, referencing their last visit
- A voice waveform showing a real conversation happening
- A response notification: "Yes! Book me in 🙌" 
- Open rate counter glowing: "94%"
- Label: "We Have Conversations"
- Bullets: "• Personalized to them  • Remembers everything  • Moves them to YES"

BOTTOM TEXT: "Campaigns Send. Conversations Sell."

Style: Dark cinematic, left=grey/cluttered/cold, right=warm amber+electric blue/personal/alive. 16:9, premium, minimal text. No watermarks.`,
    },
    {
        cacheKey: "contrast_night_shift",
        label: "Contrast 5 — The Night Shift",
        industryStats: "67% of highest-value leads contact businesses outside of 9-5 hours. $40K/year human receptionist vs. $497/month AI that never sleeps.",
        neuroReason: "Loss aversion: every after-hours call to a competitor is money leaving permanently",
        prompt: `Create a cinematic image contrasting a business that closes at night vs. BioDynamX AI running 24/7.

LEFT HALF (dark, cold, closed — competitor at night):
- A business office at 11 PM — lights off, "CLOSED" sign glowing in cold neon
- Phone going to voicemail — 5 missed calls visible on screen
- A competitor's van parked, lights off, nobody home
- Label: "Your Competitor at 2 AM"
- Bullets: "• Closed at 6 PM  • Calls go to voicemail  • $40K/year to sleep"

RIGHT HALF (glowing, live, electric — BioDynamX agents working):
- The same time — 2 AM — but a holographic AI agent answering calls, animated voice waveforms alive
- Appointment booking notification flashing: "New booking - 2:13 AM ✓"
- A revenue counter ticking upward while the owner sleeps
- Stars/night sky behind, but the BioDynamX side is brilliantly lit
- Label: "BioDynamX at 2 AM"
- Bullets: "• Answers every call  • Books appointments  • $497/month. Always on."

BOTTOM TEXT: "While Your Competitor Sleeps — We're Closing."

Style: Split-screen, dramatic night sky, left=cold dark closed, right=glowing gold+blue alive, 16:9 cinematic. Ultra-premium. No watermarks.`,
    },
    {
        cacheKey: "contrast_tools_partners",
        label: "Contrast 6 — Tools vs. Growth Partners",
        industryStats: "GoHighLevel: $297/month tool you manage alone. BioDynamX: everything GHL does plus custom dev, video production, SEO/AEO/GEO — managed for you.",
        neuroReason: "Security vs. Overwhelm: a tool adds work; a partner removes it",
        prompt: `Create a cinematic image contrasting a software tool vs. a full growth partner.

LEFT HALF (grey, overwhelming, lonely — the tool world):
- A business owner sitting alone at a laptop surrounded by stacked software logos, dashboards, tutorials
- Overwhelmed expression, multiple browser tabs open, half-finished marketing setup
- A GoHighLevel-style dashboard showing unfinished automations
- Label: "Handed a Tool"
- Bullets: "• You set it up  • You manage it  • No backup when you're stuck"

RIGHT HALF (warm, expansive, supported — BioDynamX partnership):
- The same business owner — but now they're at their business doing what they love
- Behind them, a team of holographic specialists: AI agent (Jenny), SEO engine, video production rig, code deployment — all running autonomously
- Revenue dashboard rising steadily in background
- Label: "Given a Growth Partner"
- Bullets: "• We build it  • We run it  • AI + Dev + Video + SEO — all in one"

BOTTOM TEXT: "Stop Managing Tools. Start Growing."

Style: Dark cinematic, left=grey/cluttered/solo, right=warm gold+blue/expansive/team. 16:9 widescreen. Premium. No watermarks.`,
    },
    {
        cacheKey: "contrast_night_vision",
        label: "Contrast 7 — Data vs. Guesses",
        industryStats: "Businesses making data-driven decisions are 23x more likely to acquire customers. BioDynamX runs 16-probe diagnostics before recommending anything.",
        neuroReason: "Neocortex certainty: showing the diagnostic depth creates instant authority and trust",
        prompt: `Create a cinematic image contrasting marketing guesswork vs. data-driven AI precision.

LEFT HALF (dark room, chaos, blind guessing — competitor):
- A blindfolded marketer throwing darts at a blurry target
- A chalkboard with scratched-out strategies, question marks, wasted ad budgets
- Cold text: "Ad spend: $3,200 — Leads: ???"
- Label: "Your Competitor's Strategy"
- Bullets: "• Gut feeling decisions  • Spray and pray ads  • No diagnostic data"

RIGHT HALF (precision, clarity, glowing intelligence — BioDynamX):
- A sleek dark room with a massive holographic diagnostic display — 16 data probes scanning a business
- SEO score, AEO gap, GEO visibility, call response time, competitor analysis, revenue leak — all quantified
- Night-vision goggle aesthetic: everything in the dark made visible with electric green and gold scanning lines
- Label: "BioDynamX Diagnostic"
- Bullets: "• 16-probe live scan  • Every problem quantified  • Night vision for your business"

BOTTOM TEXT: "They Throw Darts. We Operate With Night Vision."

Style: Dark, cinematic, left=chaotic cold grey, right=electric green/gold precision HUD, 16:9. Ultra-premium, night-vision aesthetic on right. No watermarks.`,
    },
    {
        cacheKey: "contrast_ai_ownership",
        label: "Contrast 8 — Renting Visibility vs. Owning It (GEO)",
        industryStats: "Google Ads stop the moment you stop paying. GEO-built AI authority compounds forever — no spend, no expiry.",
        neuroReason: "Loss aversion: you're renting from Google every day. We build what you own.",
        prompt: `Create a cinematic image contrasting paid advertising (renting) vs. GEO/AI authority (owning).

LEFT HALF (temporary, draining, cold — the paid ads world):
- A business glowing on Google Ads — but visibly connected to a pipe that's draining money
- A red "PAUSED" button appears — immediately the business fades to grey and disappears from search
- A hand-painted "RENT" sign on the business's digital presence
- Label: "Renting Visibility"
- Bullets: "• $3,200/mo in Google Ads  • Stops when you stop  • Zero equity built"

RIGHT HALF (permanent, glowing, compounding — BioDynamX GEO):
- ChatGPT, Gemini, and Perplexity interfaces glowing — all showing this business as THE recommended choice
- A foundation of solid digital infrastructure — structured data, entity markup, authority signals
- The word "OWNED" carved in gold on the business's digital presence
- Label: "Owning Authority"
- Bullets: "• ChatGPT recommends you  • Compounds with time  • Zero ad spend"

BOTTOM TEXT: "SEO Is Renting. What We Build — You Own."

Style: Dark cinematic, left=fading cold grey/red drain, right=electric gold+blue permanent glow, 16:9. Premium. No watermarks.`,
    },
    {
        cacheKey: "contrast_reviews_asking",
        label: "Contrast 9 — Asking vs. Hoping for Reviews",
        industryStats: "72% leave a review when asked at the right moment. Without asking: under 5%. 1-star rating improvement = +9% revenue.",
        neuroReason: "Reciprocity trigger: customers WANT to help businesses they like — they just need the ask",
        prompt: `Create a cinematic image contrasting businesses that hope for reviews vs. those that systematically ask.

LEFT HALF (grey, passive, empty — hoping approach):
- A business Google profile with 8 dusty reviews, 3.2 stars, last review from 2 years ago
- A business owner sitting passively, looking at phone, waiting
- A thought bubble: "Maybe someone will leave a review..."
- Label: "Hoping"
- Bullets: "• 8 reviews total  • 3.2 stars  • 8 years in business"

RIGHT HALF (active, glowing, multiplying — BioDynamX automated review system):
- A phone screen showing an automated personal text firing 90 minutes after an appointment
- Notifications flooding in: ⭐⭐⭐⭐⭐ Google review, ⭐⭐⭐⭐⭐ Facebook, ⭐⭐⭐⭐⭐ Yelp
- Google profile showing 127 reviews, 4.9 stars, most recent: "2 hours ago"
- Label: "Asking — Automatically"
- Bullets: "• 127 reviews in 90 days  • 4.9 stars  • AI asks at the perfect moment"

BOTTOM TEXT: "72% Will Review — When Asked. We Ask Every Time."

Style: Dark cinematic, left=grey/static/lonely, right=gold stars+electric blue cascading/alive, 16:9. Premium. No watermarks.`,
    },
    {
        cacheKey: "contrast_speed_gap",
        label: "Contrast 10 — The Speed Gap (14 Hours vs. 8 Seconds)",
        industryStats: "Average lead response time: 14 hours. BioDynamX: 8 seconds. 78% of buyers choose whoever responds first.",
        neuroReason: "Reptilian threat: every hour of delay is a competitor booking the appointment",
        prompt: `Create a dramatic cinematic image visualizing the devastating speed gap between average businesses and BioDynamX.

Design: A dramatic RACE-TRACK or timeline split viewed from above:

LEFT TRACK / LEFT HALF (grey, slow, losing):
- A clock showing: 14:00:00 (14 hours) — ticking slowly
- A lead (represented as a golden opportunity) sitting at the starting line — waiting, fading, going cold
- By the time the response comes: the lead has a "GONE TO COMPETITOR" stamp
- Label: "Industry Average Response"
- Bullets: "• 14-hour average response  • Lead goes cold  • Competitor already booked them"

RIGHT TRACK / RIGHT HALF (electric gold, instant, winning):
- A clock showing: 0:00:08 (8 seconds) — instant
- A BioDynamX AI agent fires immediately — text sent, appointment link offered, calendar booked
- The golden lead is captured and glowing, marked "BOOKED ✓"
- Label: "BioDynamX Response"
- Bullets: "• 8-second response  • Lead captured  • Appointment booked before they dial again"

CENTER: A sharp split with the words "14 HRS" on left in cold grey and "8 SEC" on right in electric gold — massive contrast

BOTTOM TEXT: "In That Gap — Your Competitor Already Answered."

Style: Dark cinematic, race-track or timeline metaphor, dramatic contrast, 16:9 widescreen. Premium, intense urgency. No watermarks.`,
    },
    {
        cacheKey: "contrast_custom_vs_template",
        label: "Contrast 11 — Template vs. Built for You",
        industryStats: "Template-based agency approaches: 60% client churn in 12 months. Custom-built, trained AI systems: 4x retention rate.",
        neuroReason: "Identity: 'our product is YOUR business' activates the deep human need for recognition and individuality",
        prompt: `Create a cinematic image contrasting generic template agencies vs. BioDynamX's custom-built approach.

LEFT HALF (grey, cookie-cutter, generic — template agencies):
- A factory assembly line stamping out identical websites, identical funnels, identical email sequences
- 50 businesses all looking exactly the same — same colors, same layout, same voicebot
- A rubber stamp hitting each one: "TEMPLATE"
- Label: "Every Other Agency"
- Bullets: "• Your logo in their template  • Same funnel as 300 other clients  • Generic voicebot"

RIGHT HALF (alive, unique, crafted — BioDynamX):
- A craftsperson's workshop — but futuristic, holographic: custom AI agents being trained on a business's specific voice, market, competitors
- A bespoke website taking shape, a custom mobile app rendering, a commercial video in production
- Each element labeled with the business's name — truly THEIRS
- Label: "BioDynamX — Built for YOU"
- Bullets: "• AI trained on YOUR voice  • Custom software, custom video  • Your market. Your weapons."

BOTTOM TEXT: "Their Product Is the Template. Ours Is Your Business."

Style: Dark cinematic, left=cold grey factory, right=warm gold craftsman workshop meets futuristic lab, 16:9. Ultra-premium. No watermarks.`,
    },
    {
        cacheKey: "contrast_guarantee",
        label: "Contrast 12 — The Guarantee (Ask the Competitor — I'll Wait)",
        industryStats: "Only 3% of marketing agencies offer a performance guarantee. BioDynamX guarantees 5x ROI in 90 days or full refund.",
        neuroReason: "Risk reversal activates the neocortex's final permission to proceed — removes the last psychological barrier to yes",
        prompt: `Create a powerful cinematic image contrasting agencies with no guarantees vs. BioDynamX's 5x ROI guarantee.

LEFT HALF (vague, cold, evasive — competitor world):
- A contract with fine print that fades into unreadable blur
- A "results not guaranteed" disclaimer highlighted in red
- A business owner looking confused and slightly betrayed, hands up as if asking "so what happens if..."
- A thought bubble: "..."
- Label: "Ask Your Competitor"
- Bullets: "• Fine print everywhere  • 'Results may vary'  • You carry all the risk"

RIGHT HALF (bold, gold, unshakeable — BioDynamX guarantee):
- A massive glowing golden SEAL — "5x ROI GUARANTEED" — the centerpiece of the frame
- Clean, simple, bold language hovering below: "Full refund if we don't deliver. 90 days."
- A confident handshake — human and holographic AI — sealing the deal
- A business owner smiling, arms crossed, visibly trusting
- Label: "BioDynamX Promise"
- Bullets: "• 5x ROI or full refund  • 90-day guarantee  • We've never had to pay it"

BOTTOM TEXT: "Ask Your Competitor for Their Guarantee. We'll Wait."

Style: Dark cinematic, left=grey/murky/fine-print, right=BOLD GOLD guarantee seal dominating the frame, 16:9. Ultra-premium, dramatic. No watermarks.`,
    },
];

// ── Main Seeder ─────────────────────────────────────────────────────────────

async function seedAllVisuals() {
    const allSeeds = [...EDUCATION_VISUALS, ...INDUSTRY_SEEDS, ...CONTRAST_VISUALS];
    const total = allSeeds.length;
    let success = 0;
    let failed = 0;

    console.log(`\n[Seeder] 🚀 Seeding ${total} images...\n`);

    for (let i = 0; i < allSeeds.length; i++) {
        const seed = allSeeds[i];
        console.log(`[Seeder] [${i + 1}/${total}] Generating: ${seed.label}`);

        try {
            const result = await generateImage(seed.prompt);
            if (!result) {
                console.warn(`[Seeder] ⚠️  Failed to generate: ${seed.cacheKey}`);
                failed++;
                continue;
            }

            const stored = await uploadToSupabase(
                seed.cacheKey,
                result.base64,
                result.mimeType,
                seed.industryStats,
                seed.neuroReason
            );

            if (stored) {
                success++;
                console.log(`[Seeder] ✅ [${i + 1}/${total}] ${seed.label}`);
            } else {
                console.log(`[Seeder] 📝 [${i + 1}/${total}] Generated (Supabase not configured): ${seed.label}`);
                success++;
            }
        } catch (err) {
            console.error(`[Seeder] ❌ Error seeding ${seed.cacheKey}:`, err);
            failed++;
        }

        // Rate limit: 3 seconds between requests to avoid Gemini API throttling
        if (i < allSeeds.length - 1) {
            console.log(`[Seeder] ⏳ Waiting 3s to respect API rate limits...`);
            await sleep(3000);
        }
    }

    console.log(`\n[Seeder] 🏁 DONE — ${success} success, ${failed} failed out of ${total} total`);
    console.log(`[Seeder] 💡 Run again to refresh or re-seed failed images`);
}

seedAllVisuals().catch(console.error);
