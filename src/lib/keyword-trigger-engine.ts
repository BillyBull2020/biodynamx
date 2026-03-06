// ═══════════════════════════════════════════════════════════════════════════
// KEYWORD TRIGGER ENGINE — Voice-Forward Visual Sync
// Listens to AI speech output and maps keywords to visual scene transitions.
// Implements Miller's Law (max 7 items), cognitive ease, and bi-lateral
// integration between voice (logical) and visuals (emotional).
// ═══════════════════════════════════════════════════════════════════════════

export type SceneId =
    | "welcome"
    | "neural_pathway"
    | "ai_flowchart"
    | "performance_compare"
    | "seo_dashboard"
    | "revenue_impact"
    | "competitor_map"
    | "team_intro"
    | "path_to_order"
    | "financial_summary"
    | "calendar_widget"
    | "audit_progress"
    | "checkout"
    | "website_hero"
    | "pricing_showcase"
    | "testimonials_showcase"
    | "industry_showcase"
    | "guarantee_showcase"
    | "personalized_welcome"
    | "personalized_audit"
    | "personalized_proposal"
    | "website_embed"
    | "generated_image"
    | "freedom_visualization"
    | "idle";

export type TransitionType = "fade" | "slide" | "morph" | "neural";
export type SpatialAnchor = "left" | "right" | "center" | "full";
export type ColorTheme = "red" | "amber" | "blue" | "green" | "neutral";

export interface VisualScene {
    id: SceneId;
    keywords: string[];
    transition: TransitionType;
    duration: number; // transition ms
    priority: number; // higher overrides lower
    clearPrevious: boolean; // Miller's Law — clear UI before showing
    // Dual-Coding Spatial Anchoring (Challenger Sale Science)
    spatialAnchor: SpatialAnchor; // where on screen visuals appear
    colorTheme: ColorTheme;       // color palette to signal brain state
}

// ─── Bio DynamX Scenes ────────────────────────────────────────────────────

const BIODYNAMX_SCENES: VisualScene[] = [
    {
        id: "neural_pathway",
        keywords: [
            "biological", "neural", "compatibility", "brain", "neuroscience",
            "nervous system", "reptilian", "limbic", "neocortex", "neurons",
            "mirror neurons", "subconscious", "instinct", "biology",
        ],
        transition: "neural",
        duration: 800,
        priority: 8,
        clearPrevious: true,
        spatialAnchor: "right",  // Science = trust = right
        colorTheme: "blue",
    },
    {
        id: "ai_flowchart",
        keywords: [
            "AI", "agent", "software", "integration", "automate", "automation",
            "workflow", "system", "platform", "technology", "custom software",
            "dashboard", "app", "API", "CRM", "funnel",
        ],
        transition: "morph",
        duration: 600,
        priority: 7,
        clearPrevious: true,
        spatialAnchor: "right",  // Solution = right
        colorTheme: "green",
    },
    {
        id: "performance_compare",
        keywords: [
            "optimization", "high-level", "performance", "speed", "fast",
            "loading", "slow", "before", "after", "improvement", "better",
            "upgrade", "transform",
        ],
        transition: "slide",
        duration: 500,
        priority: 6,
        clearPrevious: true,
        spatialAnchor: "full",   // Before/after spans full width
        colorTheme: "neutral",
    },
    {
        id: "seo_dashboard",
        keywords: [
            "SEO", "visibility", "Google", "search", "ranking", "organic",
            "AEO", "GEO", "answer engine", "generative engine", "ChatGPT",
            "Perplexity", "voice search", "structured data", "schema",
            "invisible", "found online",
        ],
        transition: "fade",
        duration: 500,
        priority: 7,
        clearPrevious: true,
        spatialAnchor: "right",  // Results/opportunity = right
        colorTheme: "green",
    },
    {
        id: "revenue_impact",
        keywords: [
            "revenue", "money", "losing", "leak", "ROI", "return",
            "investment", "cost", "dollar", "thousand", "profit", "loss",
            "hemorrhaging", "waste", "table", "leaving money", "missed",
            "opportunity gap", "drain", "bleeding", "uncollected", "unbooked",
            "draining", "silent killer", "bottleneck", "compound", "compounding",
        ],
        transition: "morph",
        duration: 600,
        priority: 9,
        clearPrevious: true,
        spatialAnchor: "left",   // PAIN = LEFT (Challenger Phase 3 — Rational Drowning)
        colorTheme: "red",       // Red = amygdala threat / loss aversion spike
    },
    {
        id: "competitor_map",
        keywords: [
            "competitor", "ahead", "behind", "market", "competition",
            "industry", "rival", "edge", "advantage", "versus", "they", "them",
            "other platforms", "other companies", "everyone else",
        ],
        transition: "slide",
        duration: 500,
        priority: 6,
        clearPrevious: true,
        spatialAnchor: "left",   // Competition = problem = left
        colorTheme: "amber",
    },
    {
        id: "team_intro",
        keywords: [
            "team", "Jenny", "Mark", "Aria", "Billy", "Sarah",
            "receptionist", "architect", "consultant", "specialist",
        ],
        transition: "fade",
        duration: 400,
        priority: 5,
        clearPrevious: true,
        spatialAnchor: "right",  // Our team = solution = right
        colorTheme: "blue",
    },
    {
        id: "audit_progress",
        keywords: [
            "audit", "diagnostic", "scanning", "analyzing", "pulling up",
            "let me check", "running", "results", "report", "findings",
        ],
        transition: "morph",
        duration: 500,
        priority: 8,
        clearPrevious: true,
        spatialAnchor: "center", // Audit is neutral — discovery phase
        colorTheme: "neutral",
    },
    {
        id: "checkout",
        keywords: [
            "checkout", "payment", "subscribe", "sign up", "get started",
            "purchase", "buy", "plan", "pricing", "today", "tier 1",
            "full platform", "audit or", "deployment",
        ],
        transition: "fade",
        duration: 400,
        priority: 10,  // Highest — conversion moment
        clearPrevious: true,
        spatialAnchor: "full",   // Double-bind: both options side-by-side = full width
        colorTheme: "green",
    },
    {
        id: "website_hero",
        keywords: [
            "website", "our site", "biodynamx", "take a look", "let me show",
            "show you", "platform", "check out", "look at this", "built for",
            "experience", "custom built", "walk you through",
        ],
        transition: "neural",
        duration: 700,
        priority: 6,
        clearPrevious: true,
        spatialAnchor: "right",  // Our platform = right
        colorTheme: "green",
    },
    {
        id: "pricing_showcase",
        keywords: [
            "pricing", "affordable", "investment", "monthly", "$497",
            "four ninety seven", "plan", "package", "value", "what it costs",
            "how much", "budget",
        ],
        transition: "fade",
        duration: 500,
        priority: 8,
        clearPrevious: true,
        spatialAnchor: "right",  // Value/investment = solution = right
        colorTheme: "blue",
    },
    {
        id: "testimonials_showcase",
        keywords: [
            "testimonial", "success story", "client", "case study",
            "other businesses", "customers", "happy", "satisfied", "helped",
            "transformed", "review", "feedback", "what people say",
        ],
        transition: "slide",
        duration: 500,
        priority: 7,
        clearPrevious: true,
        spatialAnchor: "right",  // Social proof = reward = right
        colorTheme: "green",
    },
    {
        id: "industry_showcase",
        keywords: [
            "dental", "dentist", "med spa", "medspa", "real estate", "realtor",
            "call center", "startup", "healthcare", "medical", "practice",
            "office", "clinic", "agency", "therapist", "mental health",
            "psychologist", "attorney", "lawyer", "law firm", "legal",
            "hvac", "painter", "painting", "roofing", "roofer", "plumber",
            "dispensary", "cannabis", "bookkeeping", "accounting",
        ],
        transition: "slide",
        duration: 600,
        priority: 6,
        clearPrevious: true,
        spatialAnchor: "right",  // Industry relevance = we know you = right (trust)
        colorTheme: "blue",
    },
    {
        id: "guarantee_showcase",
        keywords: [
            "guarantee", "5x", "five times", "money back", "risk free",
            "no risk", "ROI guarantee", "return on investment", "protected",
            "promise", "confident", "guaranteed",
        ],
        transition: "morph",
        duration: 600,
        priority: 9,
        clearPrevious: true,
        spatialAnchor: "right",  // Guarantee = trust = right
        colorTheme: "green",
    },
    {
        id: "freedom_visualization",
        keywords: [
            "imagine", "freedom", "revenue", "money", "dream", "vacating", "vacation",
            "liberating", "running", "business", "perfect reality", "absolute freedom",
            "imagine the freedom", "extra revenue", "selling a dream",
        ],
        transition: "fade",
        duration: 2000,
        priority: 10,
        clearPrevious: true,
        spatialAnchor: "center",
        colorTheme: "blue",
    },

    // ═══ CHALLENGER SALE PHASE SCENES ═══
    // These map to Jenny's 7-phase Dual-Agent choreography.
    // Triggered by specific Challenger phraseology in the transcript.
    {
        id: "performance_compare",  // Phase 1: THE WARMER — Pattern interrupt
        keywords: [
            "businesses that are winning", "slow and steady loses", "what most people overlook",
            "before we dig in", "i want to show you something", "orienting",
        ],
        transition: "neural",
        duration: 900,
        priority: 7,
        clearPrevious: true,
        spatialAnchor: "left",   // Status quo = problem = left
        colorTheme: "amber",
    },
    {
        id: "competitor_map",  // Phase 2: THE REFRAME — New diagnosis
        keywords: [
            "most businesses think", "real silent killer", "new frame", "data across",
            "their biggest challenge", "actually the problem is", "what they overlook",
        ],
        transition: "slide",
        duration: 600,
        priority: 7,
        clearPrevious: true,
        spatialAnchor: "left",   // Problem reframe = left
        colorTheme: "amber",
    },
    {
        id: "revenue_impact",  // Phase 3: RATIONAL DROWNING — Math + loss aversion
        keywords: [
            "compounds into", "Q4", "peak season", "if nothing changes",
            "real number", "financial cost", "what that costs you", "compounding",
            "5 percent becomes", "silent killer", "micro-frictions",
        ],
        transition: "morph",
        duration: 500,
        priority: 10,  // Highest in problem state
        clearPrevious: true,
        spatialAnchor: "left",   // Pain peak = far left
        colorTheme: "red",
    },
    {
        id: "testimonials_showcase",  // Phase 4: EMOTIONAL IMPACT — Mirror neuron story
        keywords: [
            "i had a client", "they described it", "you could hear", "crushing weight",
            "the call they had to make", "never have to", "felt like", "looked like",
        ],
        transition: "fade",
        duration: 800,
        priority: 8,
        clearPrevious: true,
        spatialAnchor: "left",   // Vicarious pain = left (before pivot)
        colorTheme: "amber",
    },
    {
        id: "ai_flowchart",  // Phase 5: A NEW WAY — Dopamine, solution pivot
        keywords: [
            "what if it just", "self-regulating", "self-corrected", "what would that mean",
            "begin to see", "imagine this working", "never had to manage", "opens up",
        ],
        transition: "morph",
        duration: 700,
        priority: 9,
        clearPrevious: true,
        spatialAnchor: "right",  // DOPAMINE PIVOT — screen shifts from left to right
        colorTheme: "blue",
    },
    {
        id: "website_hero",  // Phase 6: YOUR SOLUTION — BioDynamX framework
        keywords: [
            "this is the framework", "biodynamx framework", "by deploying",
            "pays for itself", "adaptive ecosystem", "bio-mimicry", "integration pays",
        ],
        transition: "neural",
        duration: 800,
        priority: 9,
        clearPrevious: true,
        spatialAnchor: "right",  // Solution = right = reward
        colorTheme: "green",
    },
];


// ─── Quick Accurate Books Scenes ──────────────────────────────────────────

const QAB_SCENES: VisualScene[] = [
    {
        id: "path_to_order",
        keywords: [
            "behind", "taxes", "clean up", "catch up", "messy", "organize",
            "bookkeeping", "records", "filing", "IRS", "compliance",
        ],
        transition: "slide",
        duration: 600,
        priority: 7,
        clearPrevious: true,
        spatialAnchor: "left",   // Mess = problem = left
        colorTheme: "amber",
    },
    {
        id: "financial_summary",
        keywords: [
            "profit", "loss", "dashboard", "P&L", "balance sheet",
            "income", "expenses", "cash flow", "financial", "numbers",
        ],
        transition: "morph",
        duration: 500,
        priority: 7,
        clearPrevious: true,
        spatialAnchor: "right",  // Financial clarity = solution = right
        colorTheme: "green",
    },
    {
        id: "calendar_widget",
        keywords: [
            "appointment", "schedule", "talk", "book", "calendar",
            "meeting", "call", "consult", "follow up", "fifteen minutes",
        ],
        transition: "fade",
        duration: 400,
        priority: 9,
        clearPrevious: true,
        spatialAnchor: "right",  // Booking = action = right
        colorTheme: "blue",
    },
];

// ─── Combined Scene Registry ──────────────────────────────────────────────

const ALL_SCENES: VisualScene[] = [...BIODYNAMX_SCENES, ...QAB_SCENES];

// ─── Engine State ─────────────────────────────────────────────────────────

export interface EngineState {
    activeScene: SceneId;
    previousScene: SceneId;
    transition: TransitionType;
    isTransitioning: boolean;
    confidence: number;       // 0-1, how confident the match is
    matchedKeywords: string[];
    // Dual-Coding Spatial Anchoring — tells VaultUI WHERE to place visuals
    spatialAnchor: SpatialAnchor;
    colorTheme: ColorTheme;
}

export type SceneChangeCallback = (
    newScene: SceneId,
    previousScene: SceneId,
    transition: TransitionType,
    matchedKeywords: string[],
    confidence: number
) => void;

// ─── Keyword Trigger Engine Class ─────────────────────────────────────────

export class KeywordTriggerEngine {
    private state: EngineState = {
        activeScene: "welcome",
        previousScene: "idle",
        transition: "fade",
        isTransitioning: false,
        confidence: 0,
        matchedKeywords: [],
        spatialAnchor: "center",
        colorTheme: "neutral",
    };

    private wordBuffer: string[] = []; // Sliding window — last 25 words (smaller = more responsive to recent speech)
    private readonly BUFFER_SIZE = 25;
    private debounceTimer: ReturnType<typeof setTimeout> | null = null;
    private readonly DEBOUNCE_MS = 400; // Faster response to keyword changes
    private readonly MIN_CONFIDENCE = 0.10; // Lower threshold = more scene changes
    private lockUntil = 0; // Prevent rapid scene changes
    private readonly LOCK_MS = 4000; // 4s between scene changes — stable but responsive
    private listeners: SceneChangeCallback[] = [];

    // ── Public API ────────────────────────────────────────────────────

    /**
     * Feed text from the AI agent's transcript into the engine.
     * Call this every time new text comes in from the voice stream.
     */
    processText(text: string): void {
        // Tokenize and add to sliding window
        const words = text
            .toLowerCase()
            .replace(/[^\w\s]/g, "")
            .split(/\s+/)
            .filter(Boolean);

        this.wordBuffer.push(...words);

        // Keep buffer at max size (sliding window)
        if (this.wordBuffer.length > this.BUFFER_SIZE) {
            this.wordBuffer = this.wordBuffer.slice(-this.BUFFER_SIZE);
        }

        // Debounce scene evaluation
        if (this.debounceTimer) clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => this.evaluateScene(), this.DEBOUNCE_MS);
    }

    /**
     * Force a specific scene (e.g., when a tool is called).
     */
    forceScene(sceneId: SceneId, transition: TransitionType = "morph"): void {
        this.transitionTo(sceneId, transition, ["forced"], 1.0);
    }

    /**
     * Reset to welcome/idle state.
     */
    reset(): void {
        this.wordBuffer = [];
        this.state = {
            activeScene: "welcome",
            previousScene: "idle",
            transition: "fade",
            isTransitioning: false,
            confidence: 0,
            matchedKeywords: [],
            spatialAnchor: "center",
            colorTheme: "neutral",
        };
        this.lockUntil = 0;
    }

    /**
     * Subscribe to scene changes.
     */
    onSceneChange(callback: SceneChangeCallback): () => void {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter((l) => l !== callback);
        };
    }

    /**
     * Get current state.
     */
    getState(): Readonly<EngineState> {
        return { ...this.state };
    }

    // ── Internal Logic ────────────────────────────────────────────────

    private evaluateScene(): void {
        // Respect lock period
        if (Date.now() < this.lockUntil) return;

        const bufferText = this.wordBuffer.join(" ");
        let bestMatch: { scene: VisualScene; score: number; matched: string[] } | null = null;

        for (const scene of ALL_SCENES) {
            const matched: string[] = [];
            let score = 0;

            for (const keyword of scene.keywords) {
                const kw = keyword.toLowerCase();
                // Check for multi-word keywords
                if (kw.includes(" ")) {
                    if (bufferText.includes(kw)) {
                        matched.push(keyword);
                        score += 2; // Multi-word matches are stronger signals
                    }
                } else {
                    if (this.wordBuffer.includes(kw)) {
                        matched.push(keyword);
                        score += 1;
                    }
                }
            }

            // Normalize score to be trigger-friendly. 
            // If we hit 1 keyword in a large list, we still want it to feel significant.
            const confidence = score / Math.min(scene.keywords.length, 2);

            if (
                confidence >= this.MIN_CONFIDENCE &&
                (!bestMatch || confidence * scene.priority > bestMatch.score * (bestMatch.scene.priority))
            ) {
                bestMatch = { scene, score: confidence, matched };
            }
        }

        if (bestMatch) {
            console.log(`[KeywordEngine] 🎯 Best match: ${bestMatch.scene.id} (conf: ${bestMatch.score.toFixed(2)}) keywords: ${bestMatch.matched.join(", ")}`);
        }

        // Only transition if we found a strong enough match AND it's a new scene
        if (bestMatch && bestMatch.scene.id !== this.state.activeScene) {
            this.transitionTo(
                bestMatch.scene.id,
                bestMatch.scene.transition,
                bestMatch.matched,
                bestMatch.score,
                bestMatch.scene  // Pass full scene for spatial anchoring
            );
        }
    }

    private transitionTo(
        sceneId: SceneId,
        transition: TransitionType,
        matchedKeywords: string[],
        confidence: number,
        scene?: VisualScene
    ): void {
        const previousScene = this.state.activeScene;

        this.state = {
            activeScene: sceneId,
            previousScene,
            transition,
            isTransitioning: true,
            confidence,
            matchedKeywords,
            // Carry spatial anchoring from the matched scene
            spatialAnchor: scene?.spatialAnchor ?? "center",
            colorTheme: scene?.colorTheme ?? "neutral",
        };

        // Lock to prevent thrashing
        this.lockUntil = Date.now() + this.LOCK_MS;

        // Notify listeners
        for (const listener of this.listeners) {
            listener(sceneId, previousScene, transition, matchedKeywords, confidence);
        }

        // Clear transitioning flag after animation completes
        const duration = scene?.duration ?? 500;

        setTimeout(() => {
            this.state = { ...this.state, isTransitioning: false };
        }, duration);
    }
}

// ── Singleton for app-wide use ────────────────────────────────────────────

let engineInstance: KeywordTriggerEngine | null = null;

export function getKeywordEngine(): KeywordTriggerEngine {
    if (!engineInstance) {
        engineInstance = new KeywordTriggerEngine();
    }
    return engineInstance;
}
