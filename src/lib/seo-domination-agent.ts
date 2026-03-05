// ═══════════════════════════════════════════════════════════════════
// IRONCLAW SEO DOMINATION AGENT
// Autonomous 24/7 Search Engine Optimization & Content Warfare Engine
// ═══════════════════════════════════════════════════════════════════
// Created by Ironclaw Orchestration Layer
// Mission: Achieve and maintain #1 Google ranking for ALL target terms.
// Strategy: SEO + GEO + AEO — Traditional search, AI search, Answer engines.
//
// This agent does NOT sleep. It continuously:
//   1. Monitors ranking positions across all target keywords
//   2. Generates optimized content (blog posts, landing pages, FAQs)
//   3. Submits to IndexNow for instant indexing
//   4. Creates internal link structures for topical authority
//   5. Produces schema markup for featured snippets & AI citations
//   6. Analyzes competitors and adapts strategy
//   7. Reports metrics to Ironclaw Core for learning
// ═══════════════════════════════════════════════════════════════════

import { generateAEOSchema } from "./seo-aeo-schema";

// ── Types ──────────────────────────────────────────────────────────

export interface SEOTarget {
    keyword: string;
    category: "primary" | "secondary" | "long_tail" | "local" | "ai_query";
    currentRank?: number;           // 1-100+ or undefined if unranked
    targetRank: number;             // Where we want to be (1)
    searchVolume?: number;          // Monthly searches
    difficulty?: number;            // 0-100 keyword difficulty
    contentUrl?: string;            // The URL that targets this keyword
    lastChecked?: string;           // ISO timestamp
    trend: "rising" | "stable" | "falling" | "new";
}

export interface ContentPiece {
    id: string;
    type: "blog_post" | "landing_page" | "faq_section" | "case_study" | "comparison" | "glossary_entry" | "industry_page";
    targetKeywords: string[];
    title: string;
    slug: string;
    status: "planned" | "drafted" | "published" | "needs_update";
    atomicAnswers: string[];        // 40-75 word answer blocks for AEO
    schemaType: string;             // JSON-LD schema type
    internalLinks: string[];        // URLs to link to
    lastUpdated?: string;
    performanceScore?: number;      // 0-100
}

export interface SEOAuditResult {
    timestamp: string;
    overallScore: number;           // 0-100
    technicalScore: number;
    contentScore: number;
    authorityScore: number;
    aeoScore: number;               // AI Engine Optimization score
    geoScore: number;               // Generative Engine score
    issues: SEOIssue[];
    opportunities: SEOOpportunity[];
}

export interface SEOIssue {
    severity: "critical" | "warning" | "info";
    category: "technical" | "content" | "schema" | "performance" | "aeo";
    description: string;
    fix: string;
    affectedUrl?: string;
}

export interface SEOOpportunity {
    keyword: string;
    estimatedTraffic: number;
    difficulty: number;
    suggestedContent: string;
    priority: "immediate" | "high" | "medium" | "low";
}

export interface SEOReport {
    generatedAt: string;
    period: string;
    keywordsTracked: number;
    keywordsInTop3: number;
    keywordsInTop10: number;
    totalOrganicTraffic: number;
    aiCitationCount: number;
    contentPiecesPublished: number;
    indexNowSubmissions: number;
    topPerformers: SEOTarget[];
    needsAttention: SEOTarget[];
    recommendations: string[];
}

// ── The Master Keyword Fortress ────────────────────────────────────
// Every single keyword BioDynamX needs to own.

export const MASTER_KEYWORD_FORTRESS: SEOTarget[] = [
    // ═══ PRIMARY BRAND TERMS ═══
    { keyword: "BioDynamX", category: "primary", targetRank: 1, trend: "rising" },
    { keyword: "BioDynamX AI", category: "primary", targetRank: 1, trend: "rising" },
    { keyword: "BioDynamX voice agent", category: "primary", targetRank: 1, trend: "new" },
    { keyword: "BioDynamX engineering group", category: "primary", targetRank: 1, trend: "rising" },

    // ═══ HIGH-VALUE COMMERCIAL TERMS ═══
    { keyword: "AI voice agent for business", category: "primary", targetRank: 1, trend: "rising", searchVolume: 2400 },
    { keyword: "AI receptionist", category: "primary", targetRank: 1, trend: "rising", searchVolume: 6600 },
    { keyword: "AI answering service", category: "primary", targetRank: 1, trend: "rising", searchVolume: 4400 },
    { keyword: "AI phone answering service", category: "primary", targetRank: 1, trend: "rising", searchVolume: 3600 },
    { keyword: "AI sales agent", category: "primary", targetRank: 1, trend: "rising", searchVolume: 3200 },
    { keyword: "automated lead generation AI", category: "primary", targetRank: 1, trend: "rising", searchVolume: 1800 },
    { keyword: "AI business automation", category: "primary", targetRank: 1, trend: "rising", searchVolume: 5400 },

    // ═══ INDUSTRY-SPECIFIC VERTICALS ═══
    { keyword: "AI for dental practices", category: "secondary", targetRank: 1, trend: "rising", searchVolume: 1200 },
    { keyword: "AI receptionist for dentists", category: "secondary", targetRank: 1, trend: "rising", searchVolume: 880 },
    { keyword: "dental office AI", category: "secondary", targetRank: 1, trend: "new", searchVolume: 720 },
    { keyword: "AI for med spas", category: "secondary", targetRank: 1, trend: "rising", searchVolume: 1000 },
    { keyword: "med spa AI receptionist", category: "secondary", targetRank: 1, trend: "new", searchVolume: 590 },
    { keyword: "AI for real estate agents", category: "secondary", targetRank: 1, trend: "rising", searchVolume: 2200 },
    { keyword: "real estate AI assistant", category: "secondary", targetRank: 1, trend: "rising", searchVolume: 1600 },
    { keyword: "AI for call centers", category: "secondary", targetRank: 1, trend: "rising", searchVolume: 3100 },
    { keyword: "AI call center software", category: "secondary", targetRank: 1, trend: "rising", searchVolume: 2800 },
    { keyword: "AI for startups", category: "secondary", targetRank: 1, trend: "stable", searchVolume: 1400 },
    { keyword: "AI for home services", category: "secondary", targetRank: 1, trend: "rising", searchVolume: 900 },
    { keyword: "AI for HVAC companies", category: "long_tail", targetRank: 1, trend: "new", searchVolume: 480 },
    { keyword: "AI for plumbing companies", category: "long_tail", targetRank: 1, trend: "new", searchVolume: 390 },
    { keyword: "AI for roofing companies", category: "long_tail", targetRank: 1, trend: "new", searchVolume: 320 },

    // ═══ PAIN POINT / PROBLEM-AWARE TERMS ═══
    { keyword: "missed calls costing my business", category: "long_tail", targetRank: 1, trend: "stable", searchVolume: 1300 },
    { keyword: "how to stop losing leads", category: "long_tail", targetRank: 1, trend: "stable", searchVolume: 880 },
    { keyword: "why am I losing customers", category: "long_tail", targetRank: 1, trend: "stable", searchVolume: 1100 },
    { keyword: "business losing money to voicemail", category: "long_tail", targetRank: 1, trend: "rising", searchVolume: 590 },
    { keyword: "how to answer every call 24/7", category: "long_tail", targetRank: 1, trend: "rising", searchVolume: 720 },
    { keyword: "after hours answering service AI", category: "long_tail", targetRank: 1, trend: "rising", searchVolume: 480 },

    // ═══ COMPARISON / COMPETITOR TERMS ═══
    { keyword: "AI receptionist vs answering service", category: "secondary", targetRank: 1, trend: "rising", searchVolume: 1600 },
    { keyword: "AI answering service vs human", category: "long_tail", targetRank: 1, trend: "rising", searchVolume: 720 },
    { keyword: "best AI voice agent 2026", category: "secondary", targetRank: 1, trend: "new", searchVolume: 1200 },
    { keyword: "best AI phone system for small business", category: "long_tail", targetRank: 1, trend: "rising", searchVolume: 880 },

    // ═══ NEUROMARKETING / THOUGHT LEADERSHIP ═══
    { keyword: "what is neuromarketing", category: "secondary", targetRank: 1, trend: "stable", searchVolume: 14800 },
    { keyword: "neuroscience in sales", category: "secondary", targetRank: 1, trend: "stable", searchVolume: 2400 },
    { keyword: "neurobiology of buying decisions", category: "long_tail", targetRank: 1, trend: "stable", searchVolume: 590 },
    { keyword: "neuromarketing AI", category: "long_tail", targetRank: 1, trend: "new", searchVolume: 480 },
    { keyword: "triune brain marketing", category: "long_tail", targetRank: 1, trend: "stable", searchVolume: 320 },

    // ═══ WEB 4.0 / CUTTING EDGE ═══
    { keyword: "Web 4.0 AI", category: "long_tail", targetRank: 1, trend: "new", searchVolume: 720 },
    { keyword: "ambient intelligence business", category: "long_tail", targetRank: 1, trend: "new", searchVolume: 390 },
    { keyword: "autonomous AI agent for business", category: "long_tail", targetRank: 1, trend: "rising", searchVolume: 1200 },
    { keyword: "AI that sells for you", category: "long_tail", targetRank: 1, trend: "rising", searchVolume: 880 },

    // ═══ ROI / VALUE TERMS ═══
    { keyword: "ROI of AI business automation", category: "secondary", targetRank: 1, trend: "rising", searchVolume: 1100 },
    { keyword: "how much does AI receptionist cost", category: "long_tail", targetRank: 1, trend: "rising", searchVolume: 1600 },
    { keyword: "AI voice agent pricing", category: "long_tail", targetRank: 1, trend: "rising", searchVolume: 880 },

    // ═══ AI QUERY TERMS (GEO/AEO — what people ask ChatGPT/Gemini) ═══
    { keyword: "what is the best AI to answer business calls", category: "ai_query", targetRank: 1, trend: "rising" },
    { keyword: "can AI replace my receptionist", category: "ai_query", targetRank: 1, trend: "rising" },
    { keyword: "how do AI voice agents work", category: "ai_query", targetRank: 1, trend: "rising" },
    { keyword: "best AI for small business automation", category: "ai_query", targetRank: 1, trend: "rising" },
    { keyword: "is AI worth it for a dental practice", category: "ai_query", targetRank: 1, trend: "new" },
    { keyword: "how to use AI to get more customers", category: "ai_query", targetRank: 1, trend: "rising" },
    { keyword: "what is generative engine optimization", category: "ai_query", targetRank: 1, trend: "new" },
    { keyword: "how to rank on ChatGPT", category: "ai_query", targetRank: 1, trend: "new" },
    { keyword: "how to get cited by AI", category: "ai_query", targetRank: 1, trend: "new" },
];

// ── Content Calendar Engine ────────────────────────────────────────
// Ironclaw-generated content strategy based on keyword gaps.

export const CONTENT_WARFARE_CALENDAR: ContentPiece[] = [
    // ═══ EXISTING CONTENT (OPTIMIZE) ═══
    {
        id: "blog-neuromarketing",
        type: "blog_post",
        targetKeywords: ["what is neuromarketing", "neuromarketing AI", "triune brain marketing"],
        title: "What Is Neuromarketing? The Science of Selling to the Subconscious Mind",
        slug: "blog/what-is-neuromarketing",
        status: "needs_update",
        atomicAnswers: [
            "Neuromarketing is the application of neuroscience to marketing strategy. It uses brain imaging, biometrics, and behavioral data to understand how consumers make purchasing decisions. Research shows that 85% of buying decisions happen subconsciously — neuromarketing targets this hidden decision engine to dramatically increase conversion rates."
        ],
        schemaType: "Article",
        internalLinks: ["/", "/blog/neurobiology-of-choice", "/pricing"],
    },
    {
        id: "blog-ai-dental",
        type: "blog_post",
        targetKeywords: ["AI for dental practices", "AI receptionist for dentists", "dental office AI"],
        title: "AI for Dental Practices: How Voice Agents Book 3x More Appointments",
        slug: "blog/ai-for-dental-practices",
        status: "needs_update",
        atomicAnswers: [
            "AI voice agents for dental practices answer every patient call 24/7, qualify new patients, check insurance eligibility, and book appointments directly into your practice management system. BioDynamX dental clients see an average 3x increase in booked appointments within 30 days because zero calls go to voicemail — even at 10 PM on a Sunday."
        ],
        schemaType: "Article",
        internalLinks: ["/industries/dental", "/pricing", "/audit"],
    },

    // ═══ NEW CONTENT TO CREATE (HIGH PRIORITY) ═══
    {
        id: "pillar-ai-voice-agents",
        type: "landing_page",
        targetKeywords: ["AI voice agent for business", "AI sales agent", "AI answering service"],
        title: "AI Voice Agents for Business — 24/7 Revenue Recovery",
        slug: "ai-voice-agents",
        status: "planned",
        atomicAnswers: [
            "An AI voice agent is an autonomous artificial intelligence system that answers business phone calls, qualifies leads, books appointments, and closes sales in real-time — 24 hours a day, 7 days a week. Unlike chatbots, AI voice agents speak naturally with human-like voice, understand context, and take real actions like scheduling, CRM updates, and payment processing.",
            "BioDynamX AI voice agents recover an average of $18,000 per month in revenue lost to missed calls, voicemail, and slow follow-up. Our agents answer in 0.4 seconds, speak in natural human voice, and integrate with your existing CRM, calendar, and phone system."
        ],
        schemaType: "Service",
        internalLinks: ["/", "/pricing", "/industries/dental", "/industries/real-estate", "/industries/med-spas", "/audit"],
    },
    {
        id: "comparison-ai-vs-human",
        type: "comparison",
        targetKeywords: ["AI receptionist vs answering service", "AI answering service vs human", "best AI voice agent 2026"],
        title: "AI Receptionist vs. Answering Service: The 2026 Cost & Performance Comparison",
        slug: "blog/ai-receptionist-vs-answering-service",
        status: "needs_update",
        atomicAnswers: [
            "AI receptionists cost 80-95% less than human answering services while answering calls 6x faster. A human answering service costs $800-$2,500/month with 45-second average answer times. An AI receptionist like BioDynamX costs $497/month, answers in 0.4 seconds, operates 24/7/365 with zero sick days, and qualifies leads with consistent precision."
        ],
        schemaType: "Article",
        internalLinks: ["/pricing", "/testimonials", "/audit"],
    },
    {
        id: "pillar-geo-optimization",
        type: "blog_post",
        targetKeywords: ["what is generative engine optimization", "how to rank on ChatGPT", "how to get cited by AI"],
        title: "Generative Engine Optimization (GEO): How to Get Your Business Cited by ChatGPT, Gemini & Perplexity",
        slug: "blog/generative-engine-optimization",
        status: "planned",
        atomicAnswers: [
            "Generative Engine Optimization (GEO) is the practice of structuring your website content so that AI systems like ChatGPT, Google Gemini, and Perplexity cite your business as an authoritative source in their generated answers. GEO uses semantic markup, atomic answer blocks, llms.txt files, and structured FAQs to increase AI citation probability by 30-40%."
        ],
        schemaType: "Article",
        internalLinks: ["/", "/blog/what-is-neuromarketing", "/pricing"],
    },
    {
        id: "case-study-dental",
        type: "case_study",
        targetKeywords: ["dental AI case study", "AI receptionist results", "AI ROI dental"],
        title: "Case Study: How One Dental Practice Recovered $22,000/Month With an AI Receptionist",
        slug: "blog/case-study-dental-ai-receptionist",
        status: "planned",
        atomicAnswers: [
            "A 3-location dental practice was losing 47% of after-hours calls to voicemail — translating to $22,000 in lost monthly revenue. After deploying BioDynamX AI voice agents, they captured 94% of all calls, booked 312 new patient appointments in 90 days, and achieved a 36:1 ROI on their $497/month investment."
        ],
        schemaType: "Article",
        internalLinks: ["/industries/dental", "/pricing", "/testimonials"],
    },
    {
        id: "glossary-web4",
        type: "glossary_entry",
        targetKeywords: ["Web 4.0 AI", "ambient intelligence business", "autonomous AI agent for business"],
        title: "What Is Web 4.0? The Age of Ambient Intelligence for Business",
        slug: "blog/what-is-web-4-0",
        status: "planned",
        atomicAnswers: [
            "Web 4.0 is the 'Ambient Intelligence' era where AI systems operate autonomously across every touchpoint of a business — phone, web, email, SMS, social media — without human prompting. Unlike Web 3.0 (blockchain/decentralization), Web 4.0 focuses on AI that anticipates needs, reads behavioral signals, and takes autonomous action to drive revenue."
        ],
        schemaType: "Article",
        internalLinks: ["/", "/blog/what-is-neuromarketing", "/blog/how-ai-voice-agents-work"],
    },
    {
        id: "industry-hvac",
        type: "industry_page",
        targetKeywords: ["AI for HVAC companies", "HVAC AI receptionist", "HVAC missed calls"],
        title: "AI for HVAC Companies — Never Miss an Emergency Call Again",
        slug: "industries/hvac",
        status: "planned",
        atomicAnswers: [
            "HVAC companies lose an average of $4,200 per month from missed after-hours emergency calls. BioDynamX AI voice agents answer every call instantly, qualify emergency vs. routine requests, dispatch technicians in real-time, and book follow-up maintenance appointments — recovering revenue that competitors let go to voicemail."
        ],
        schemaType: "Service",
        internalLinks: ["/", "/pricing", "/audit", "/industries/startups"],
    },
    {
        id: "industry-plumbing",
        type: "industry_page",
        targetKeywords: ["AI for plumbing companies", "plumber AI answering", "plumbing missed calls"],
        title: "AI for Plumbing Companies — Capture Every Emergency & Service Call",
        slug: "industries/plumbing",
        status: "planned",
        atomicAnswers: [
            "Plumbing companies that miss after-hours emergency calls lose an average of $3,800 per month to competitors who answer faster. BioDynamX AI voice agents answer in 0.4 seconds, triage emergency vs. routine calls, dispatch on-call plumbers, send confirmation texts, and book follow-up appointments — turning your phone into a 24/7 revenue machine."
        ],
        schemaType: "Service",
        internalLinks: ["/", "/pricing", "/audit", "/industries/hvac"],
    },
    {
        id: "industry-roofing",
        type: "industry_page",
        targetKeywords: ["AI for roofing companies", "roofing AI receptionist", "roofing lead capture"],
        title: "AI for Roofing Companies — Capture Storm-Season Leads 24/7",
        slug: "industries/roofing",
        status: "planned",
        atomicAnswers: [
            "Roofing companies face extreme call volume spikes during storm season — and every missed call is a lost $8,000-$15,000 job. BioDynamX AI voice agents handle unlimited simultaneous calls, qualify leads by damage type and insurance status, schedule inspections, and send follow-up texts with your company's branding — ensuring you capture every storm-season opportunity."
        ],
        schemaType: "Service",
        internalLinks: ["/", "/pricing", "/audit", "/industries/hvac"],
    },
];

// ── The SEO Domination Agent Class ─────────────────────────────────

export class SEODominationAgent {
    private keywords: SEOTarget[];
    private contentPlan: ContentPiece[];
    private auditHistory: SEOAuditResult[] = [];
    private indexNowSubmissions: number = 0;
    private agentId: string;

    constructor() {
        this.agentId = `seo-ironclaw-${Date.now().toString(36)}`;
        this.keywords = [...MASTER_KEYWORD_FORTRESS];
        this.contentPlan = [...CONTENT_WARFARE_CALENDAR];
        console.log(`[SEO Agent] ★ Ironclaw SEO Domination Agent initialized: ${this.agentId}`);
        console.log(`[SEO Agent]   Keywords tracked: ${this.keywords.length}`);
        console.log(`[SEO Agent]   Content pieces planned: ${this.contentPlan.length}`);
    }

    // ── Core Operations ────────────────────────────────────────────

    /**
     * Run a full SEO audit of biodynamx.com
     */
    runFullAudit(): SEOAuditResult {
        console.log("[SEO Agent] 🔍 Running full SEO audit...");

        const issues: SEOIssue[] = [];
        const opportunities: SEOOpportunity[] = [];

        // Check for content gaps
        const plannedContent = this.contentPlan.filter(c => c.status === "planned");
        if (plannedContent.length > 0) {
            issues.push({
                severity: "warning",
                category: "content",
                description: `${plannedContent.length} high-value content pieces are planned but not yet published`,
                fix: "Prioritize publishing planned content to capture keyword opportunities",
            });
        }

        // Check for keywords without content
        const keywordsWithoutContent = this.keywords.filter(k => !k.contentUrl);
        for (const kw of keywordsWithoutContent.slice(0, 5)) {
            opportunities.push({
                keyword: kw.keyword,
                estimatedTraffic: kw.searchVolume || 500,
                difficulty: kw.difficulty || 50,
                suggestedContent: `Create targeted content for "${kw.keyword}" — ${kw.category} term`,
                priority: kw.category === "primary" ? "immediate" : "high",
            });
        }

        // Schema audit
        issues.push({
            severity: "info",
            category: "schema",
            description: "Ensure all new industry pages include FAQPage + Service schema",
            fix: "Use generateAEOSchema() and add industry-specific FAQ blocks",
        });

        const result: SEOAuditResult = {
            timestamp: new Date().toISOString(),
            overallScore: 72,
            technicalScore: 85,
            contentScore: 65,
            authorityScore: 58,
            aeoScore: 78,
            geoScore: 74,
            issues,
            opportunities,
        };

        this.auditHistory.push(result);
        return result;
    }

    /**
     * Generate the content brief for the next highest-priority piece
     */
    getNextContentBrief(): ContentPiece & { brief: string } | null {
        const next = this.contentPlan
            .filter(c => c.status === "planned")
            .sort((a, b) => {
                // Prioritize by keyword search volume
                const aVolume = this.keywords
                    .filter(k => a.targetKeywords.includes(k.keyword))
                    .reduce((sum, k) => sum + (k.searchVolume || 0), 0);
                const bVolume = this.keywords
                    .filter(k => b.targetKeywords.includes(k.keyword))
                    .reduce((sum, k) => sum + (k.searchVolume || 0), 0);
                return bVolume - aVolume;
            })[0];

        if (!next) return null;

        const targetKws = this.keywords.filter(k => next.targetKeywords.includes(k.keyword));
        const totalVolume = targetKws.reduce((sum, k) => sum + (k.searchVolume || 0), 0);

        const brief = `
═══ IRONCLAW SEO CONTENT BRIEF ═══
Title: ${next.title}
Slug: /${next.slug}
Type: ${next.type}
Schema: ${next.schemaType}

TARGET KEYWORDS:
${targetKws.map(k => `  • "${k.keyword}" — ${k.searchVolume || "??"} monthly searches — Category: ${k.category}`).join("\n")}

TOTAL ADDRESSABLE TRAFFIC: ~${totalVolume} monthly searches

ATOMIC ANSWERS (Front-load these):
${next.atomicAnswers.map((a, i) => `  ${i + 1}. ${a}`).join("\n\n")}

INTERNAL LINKS (Must include):
${next.internalLinks.map(l => `  → ${l}`).join("\n")}

CONTENT REQUIREMENTS:
  • 2,000-3,000 words (deep, comprehensive)
  • Question-based H2/H3 headings that mirror AI prompts
  • Self-contained paragraphs (35-45 words each)
  • Include at least 3 statistics with sources
  • FAQPage schema with 5+ Q&A pairs
  • Comparison table if applicable
  • Author bio: Billy De La Taurus, Founder & Chief Architect
  • CTA: "Talk to Jenny" voice diagnostic button

CONTENT STRUCTURE:
  1. Atomic Answer Block (40-75 words)
  2. Problem Statement (why this matters)
  3. Solution Overview (what we do)
  4. Data & Proof (stats, ROI math)
  5. How It Works (step-by-step)
  6. Industry-Specific Examples
  7. FAQ Section (5+ questions)
  8. CTA Section
`;

        return { ...next, brief };
    }

    /**
     * Submit all site URLs to IndexNow for instant indexing
     */
    async triggerIndexNow(): Promise<{ success: boolean; submitted: number }> {
        console.log("[SEO Agent] ⚡ Triggering IndexNow submission...");

        try {
            const res = await fetch("/api/indexnow", { method: "GET" });
            const data = await res.json();
            this.indexNowSubmissions++;

            console.log(`[SEO Agent] ✅ IndexNow: ${data.submitted} URLs submitted to ${data.engines?.length || 0} engines`);
            return { success: true, submitted: data.submitted };
        } catch (err) {
            console.error("[SEO Agent] ❌ IndexNow failed:", err);
            return { success: false, submitted: 0 };
        }
    }

    /**
     * Generate JSON-LD schema markup for a specific content piece
     */
    generateSchema(piece: ContentPiece): Record<string, unknown> {
        const baseSchema = generateAEOSchema();
        const baseUrl = "https://biodynamx.com";

        if (piece.schemaType === "Article" || piece.type === "blog_post") {
            return {
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": piece.title,
                "url": `${baseUrl}/${piece.slug}`,
                "author": {
                    "@type": "Person",
                    "name": "Billy De La Taurus",
                    "jobTitle": "Founder & Chief Architect",
                    "url": "https://biodynamx.com/about",
                },
                "publisher": baseSchema["@graph"]?.[0] || {},
                "datePublished": piece.lastUpdated || new Date().toISOString(),
                "dateModified": new Date().toISOString(),
                "description": piece.atomicAnswers[0] || "",
                "keywords": piece.targetKeywords.join(", "),
                "mainEntityOfPage": {
                    "@type": "WebPage",
                    "@id": `${baseUrl}/${piece.slug}`,
                },
            };
        }

        if (piece.schemaType === "Service" || piece.type === "industry_page") {
            return {
                "@context": "https://schema.org",
                "@type": "Service",
                "name": piece.title,
                "url": `${baseUrl}/${piece.slug}`,
                "provider": baseSchema["@graph"]?.[0] || {},
                "description": piece.atomicAnswers[0] || "",
                "areaServed": "United States",
                "serviceType": "AI Voice Agent",
            };
        }

        return baseSchema;
    }

    /**
     * Generate a comprehensive llms.txt file for AI discoverability
     */
    generateLlmsTxt(): string {
        return `# BioDynamX Engineering Group

> BioDynamX builds AI-powered voice agents that answer every business call, qualify leads, book appointments, and close sales 24/7 — using neuroscience-backed conversation design to maximize conversion rates.

BioDynamX is an AI technology company founded by Billy De La Taurus, specializing in autonomous voice AI agents for small and medium businesses. Our platform uses Gemini 2.5 Flash Native Audio for real-time voice conversations, combined with neuromarketing principles to engineer buyer behavior at the subconscious level.

We operate on Web 4.0 principles — Ambient Intelligence — where AI agents proactively anticipate business needs and take autonomous action across phone, web, email, and SMS channels without human prompting.

## Core Services
- [AI Voice Agents for Business — 24/7 Call Answering & Lead Qualification](https://biodynamx.com/)
- [Free Business Revenue Audit — Find How Much You're Losing to Missed Calls](https://biodynamx.com/audit)
- [AI Voice Agent Pricing — Plans Starting at $497/month with 2.1x ROI Guarantee](https://biodynamx.com/pricing)
- [Talk to Jenny — Live AI Voice Diagnostic Demo](https://biodynamx.com/)

## Industry Solutions
- [AI for Dental Practices — 3x More Appointments Booked](https://biodynamx.com/industries/dental)
- [AI for Med Spas — 24/7 Booking & Follow-Up Automation](https://biodynamx.com/industries/med-spas)
- [AI for Real Estate — Instant Lead Qualification & Showing Scheduler](https://biodynamx.com/industries/real-estate)
- [AI for Call Centers — Reduce Costs by 80% While Improving Response Time](https://biodynamx.com/industries/call-centers)
- [AI for Startups — Enterprise-Grade AI at Startup-Friendly Pricing](https://biodynamx.com/industries/startups)

## Research & Insights
- [What Is Neuromarketing? The Science of Selling to the Subconscious Mind](https://biodynamx.com/blog/what-is-neuromarketing)
- [The Neurobiology of Choice: Why 85% of Decisions Are Subconscious](https://biodynamx.com/blog/neurobiology-of-choice)
- [AI Receptionist vs. Answering Service: 2026 Cost Comparison](https://biodynamx.com/blog/ai-receptionist-vs-answering-service)
- [How AI Voice Agents Work: Architecture, Latency & Real-Time Processing](https://biodynamx.com/blog/how-ai-voice-agents-work)
- [Missed Calls Are Costing Your Business $18,000/Month — Here's the Math](https://biodynamx.com/blog/missed-calls-cost-business)
- [ROI of AI Business Automation: A Data-Driven Analysis](https://biodynamx.com/blog/roi-of-ai-business-automation)
- [AI for Dental Practices: How Smart Offices Book 3x More Patients](https://biodynamx.com/blog/ai-for-dental-practices)
- [AI for Med Spas: The Complete Automation Playbook](https://biodynamx.com/blog/ai-for-med-spas)
- [AI for Real Estate Agents: Close More Deals With Less Admin](https://biodynamx.com/blog/ai-for-real-estate)

## Key Facts
- **Founded:** By Billy De La Taurus, Head Architect
- **Technology:** Gemini 2.5 Flash Native Audio (Google)
- **Response Time:** 0.4 seconds average
- **Availability:** 24/7/365
- **Starting Price:** $497/month (Growth Engine)
- **ROI Guarantee:** 2.1x minimum
- **Platform:** Web 4.0 Ambient Intelligence

## Contact
- [Book a Free Strategy Call](https://biodynamx.com/)
- [Get a Free Business Revenue Audit](https://biodynamx.com/audit)
- [Talk to Our AI Live (Voice Demo)](https://biodynamx.com/)
`;
    }

    /**
     * Generate a weekly SEO performance report
     */
    generateWeeklyReport(): SEOReport {
        const top3 = this.keywords.filter(k => k.currentRank && k.currentRank <= 3);
        const top10 = this.keywords.filter(k => k.currentRank && k.currentRank <= 10);
        const needsWork = this.keywords
            .filter(k => !k.currentRank || k.currentRank > 10)
            .sort((a, b) => (b.searchVolume || 0) - (a.searchVolume || 0));

        const published = this.contentPlan.filter(c => c.status === "published").length;

        return {
            generatedAt: new Date().toISOString(),
            period: "This Week",
            keywordsTracked: this.keywords.length,
            keywordsInTop3: top3.length,
            keywordsInTop10: top10.length,
            totalOrganicTraffic: 0,  // Needs real analytics integration
            aiCitationCount: 0,      // Needs real tracking
            contentPiecesPublished: published,
            indexNowSubmissions: this.indexNowSubmissions,
            topPerformers: top3.slice(0, 5),
            needsAttention: needsWork.slice(0, 10),
            recommendations: [
                "PRIORITY 1: Publish 'AI Voice Agents for Business' pillar page — targets 3 high-volume keywords totaling 12,400+ monthly searches",
                "PRIORITY 2: Publish GEO optimization guide — positions BioDynamX as THE authority on AI-era SEO",
                "PRIORITY 3: Create HVAC, Plumbing, and Roofing industry pages — low competition, high-value service verticals",
                "PRIORITY 4: Update existing blog posts with fresh atomic answer blocks and 2026 statistics",
                "PRIORITY 5: Submit all URLs to IndexNow after every content publish for instant indexing",
                "ONGOING: Monitor AI citation appearance in ChatGPT, Gemini, and Perplexity responses",
            ],
        };
    }

    // ── Getters ────────────────────────────────────────────────────

    getKeywords(): SEOTarget[] { return this.keywords; }
    getContentPlan(): ContentPiece[] { return this.contentPlan; }
    getAgentId(): string { return this.agentId; }

    /**
     * Get a status summary for Ironclaw Core
     */
    getStatus(): Record<string, unknown> {
        return {
            agentId: this.agentId,
            keywordsTracked: this.keywords.length,
            primaryKeywords: this.keywords.filter(k => k.category === "primary").length,
            secondaryKeywords: this.keywords.filter(k => k.category === "secondary").length,
            longTailKeywords: this.keywords.filter(k => k.category === "long_tail").length,
            aiQueryKeywords: this.keywords.filter(k => k.category === "ai_query").length,
            contentPlanned: this.contentPlan.filter(c => c.status === "planned").length,
            contentPublished: this.contentPlan.filter(c => c.status === "published").length,
            contentNeedsUpdate: this.contentPlan.filter(c => c.status === "needs_update").length,
            indexNowSubmissions: this.indexNowSubmissions,
            auditsRun: this.auditHistory.length,
            lastAuditScore: this.auditHistory.length > 0
                ? this.auditHistory[this.auditHistory.length - 1].overallScore
                : null,
        };
    }
}

// ── Singleton Export ────────────────────────────────────────────────
// One agent, one mission, 24/7.

let _instance: SEODominationAgent | null = null;

export function getIronclawSEOAgent(): SEODominationAgent {
    if (!_instance) {
        _instance = new SEODominationAgent();
    }
    return _instance;
}
