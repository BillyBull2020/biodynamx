// ═══════════════════════════════════════════════════════════════════════════
// VISUAL JENNY — Autonomous Visual Intelligence Layer
// ═══════════════════════════════════════════════════════════════════════════
//
// PURPOSE: The "second Jenny" that drives the screen experience.
// She listens to Voice Jenny's conversation events and autonomously decides:
//   1. WHAT to show (Nana Banana 2 images, Supabase cached visuals, stats)
//   2. WHEN to show it (triggered by conversation phase transitions)
//   3. WHERE to navigate (scroll to relevant website sections)
//
// ARCHITECTURE:
//   - Runs a SEPARATE Gemini text session (not voice)
//   - Receives events from Voice Jenny via VisualBridge
//   - Uses Gemini to intelligently decide visual responses
//   - Falls back to rule-based decisions when Gemini is slow
//   - Issues VisualCommands back through the bridge to VaultUI
//
// KEY PRINCIPLE: Visual Jenny NEVER blocks Voice Jenny.
// Everything is async, fire-and-forget for the voice stream.
// ═══════════════════════════════════════════════════════════════════════════

import {
    VisualBridge,
    type ConversationEvent,
    type ConversationEventType,
    type VisualCommand,
} from "./visual-bridge";
import { getKeywordEngine, type SceneId, type TransitionType } from "./keyword-trigger-engine";

// ── Types ──────────────────────────────────────────────────────────────────

interface VisualJennyConfig {
    apiKey: string;
    onVisualReady?: (visual: {
        imageDataUrl: string;
        brainLayer: string;
        neuroReason: string;
        topic: string;
        businessName?: string;
    }) => void;
    onNavigate?: (sectionId: string) => void;
    onStatsCard?: (stats: Record<string, string | number>, title: string) => void;
}

interface ConversationContext {
    prospectName: string | null;
    businessName: string | null;
    domain: string | null;
    industry: string | null;
    currentPhase: string;
    auditData: Record<string, unknown> | null;
    competitorData: Record<string, unknown> | null;
    roiData: Record<string, unknown> | null;
    missedCalls: number | null;
    avgSaleValue: number | null;
    agentSpeechHistory: string[];
    prospectSpeechHistory: string[];
    visualsShown: string[]; // Track what we've already displayed
}

type VisualDecision = {
    action: "show_image" | "navigate" | "show_stats" | "show_comparison" | "show_loading" | "wait";
    phase?: "reptilian" | "limbic" | "neocortex" | "close";
    topic?: string;
    sectionId?: string;
    reason: string;
    useCache?: boolean;
    generatePrompt?: string;
};

// ── Visual Jenny Class ─────────────────────────────────────────────────────

export class VisualJenny {
    private config: VisualJennyConfig;
    private context: ConversationContext;
    private isActive = false;
    private unsubscribe: (() => void) | null = null;
    private decisionQueue: ConversationEvent[] = [];
    private isProcessing = false;
    private debounceTimer: ReturnType<typeof setTimeout> | null = null;
    private keywordUnsubscribe: (() => void) | null = null;

    // Rate limiting — don't spam visuals
    private lastVisualTime = 0;
    private minVisualInterval = 4000; // At least 4 seconds between visuals
    private visualCount = 0;

    constructor(config: VisualJennyConfig) {
        this.config = config;
        this.context = this.createFreshContext();
    }

    private createFreshContext(): ConversationContext {
        return {
            prospectName: null,
            businessName: null,
            domain: null,
            industry: null,
            currentPhase: "standby",
            auditData: null,
            competitorData: null,
            roiData: null,
            missedCalls: null,
            avgSaleValue: null,
            agentSpeechHistory: [],
            prospectSpeechHistory: [],
            visualsShown: [],
        };
    }

    // ── Lifecycle ──────────────────────────────────────────────────────────

    /** Start listening to Voice Jenny's events */
    start(): void {
        if (this.isActive) return;
        this.isActive = true;
        this.context = this.createFreshContext();

        console.log("[VisualJenny] 🎬 Visual Jenny ONLINE — Autonomous visual intelligence active");

        // Subscribe to conversation events from Voice Jenny
        this.unsubscribe = VisualBridge.onConversationEvent((event) => {
            this.handleConversationEvent(event);
        });

        // Initialize Keyword Engine
        const engine = getKeywordEngine();
        this.keywordUnsubscribe = engine.onSceneChange((newScene, prev, transition, keywords, confidence) => {
            this.handleKeywordSceneChange(newScene, transition, keywords, confidence);
        });
    }

    /** Stop listening and clean up */
    stop(): void {
        this.isActive = false;
        if (this.unsubscribe) {
            this.unsubscribe();
            this.unsubscribe = null;
        }
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }
        if (this.keywordUnsubscribe) {
            this.keywordUnsubscribe();
            this.keywordUnsubscribe = null;
        }
        this.context = this.createFreshContext();
        console.log("[VisualJenny] 🔴 Visual Jenny offline");
    }

    // ── Event Handler ──────────────────────────────────────────────────────

    private handleConversationEvent(event: ConversationEvent): void {
        // Update context immediately
        this.updateContext(event);

        // Queue for visual decision (debounced)
        this.decisionQueue.push(event);
        this.scheduleDecision();
    }

    private updateContext(event: ConversationEvent): void {
        const { type, data } = event;

        if (type === "agent_speech") {
            const text = data.text as string;
            this.context.agentSpeechHistory.push(text);

            // Keep last 20 entries
            if (this.context.agentSpeechHistory.length > 20) {
                this.context.agentSpeechHistory.shift();
            }

            // ★ FEED KEYWORD ENGINE
            const engine = getKeywordEngine();
            engine.processText(text);
            return; // Processed, no need for switch
        } else if (type === "prospect_speech") {
            const text = (event.data.text as string || "").slice(0, 200);
            this.context.prospectSpeechHistory.push(text);
            if (this.context.prospectSpeechHistory.length > 20) {
                this.context.prospectSpeechHistory.shift();
            }
            return; // Processed, no need for switch
        }

        switch (type) {
            case "session_start":
                this.context = this.createFreshContext();
                this.context.currentPhase = "greeting";
                break;

            case "name_captured":
                this.context.prospectName = (event.data.name as string) || null;
                break;

            case "domain_captured":
                this.context.domain = (event.data.domain as string) || null;
                this.context.businessName = (event.data.businessName as string) || null;
                break;

            case "audit_started":
                this.context.domain = (event.data.url as string) || this.context.domain;
                break;

            case "audit_complete":
                this.context.auditData = event.data.result as Record<string, unknown> || null;
                if (event.data.industry) {
                    this.context.industry = event.data.industry as string;
                }
                break;

            case "phase_change":
                this.context.currentPhase = (event.data.phase as string) || this.context.currentPhase;
                break;

            case "competitor_intel":
                this.context.competitorData = event.data.result as Record<string, unknown> || null;
                break;

            case "roi_calculated":
                this.context.roiData = event.data.result as Record<string, unknown> || null;
                break;

            case "data_point": {
                const text = (event.data.text as string || "").toLowerCase();
                // Extract missed calls and avg sale value from data points
                const callMatch = text.match(/(\d+)\s*(calls?|leads?|inquir)/i);
                if (callMatch) this.context.missedCalls = parseInt(callMatch[1]);
                const saleMatch = text.match(/\$[\d,]+/);
                if (saleMatch) this.context.avgSaleValue = parseInt(saleMatch[0].replace(/[$,]/g, ""));
                break;
            }

            case "session_end":
                // Don't clear context yet — might need for recap visual
                break;
        }
    }

    // ── Decision Engine ────────────────────────────────────────────────────

    /** Handle granular scene changes from the keyword engine */
    private handleKeywordSceneChange(
        sceneId: SceneId,
        transition: TransitionType,
        keywords: string[],
        confidence: number
    ): void {
        console.log(`[VisualJenny] 🎯 Keyword Trigger: ${sceneId} (confidence: ${confidence.toFixed(2)})`);

        // If it's a freedom visualization, explicitly show an image
        if (sceneId === "freedom_visualization") {
            this.executeDecision({
                action: "show_image",
                phase: "limbic",
                topic: "freedom_visualization",
                reason: `Keyword match: ${keywords.join(", ")}`,
                useCache: true,
                generatePrompt: "Aspirational luxury lifestyle, cinematic business freedom, beautiful nature retreat, premium dark aesthetic.",
            });
            return;
        }

        // Map other scenes to specific actions
        const sceneToActionMap: Record<string, VisualDecision["action"]> = {
            "neural_pathway": "show_image",
            "ai_flowchart": "show_image",
            "revenue_impact": "show_stats",
            "competitor_map": "show_comparison",
            "audit_progress": "show_loading",
            "checkout": "navigate",
            "website_hero": "navigate",
        };

        const action = sceneToActionMap[sceneId];
        if (action) {
            this.executeDecision({
                action,
                topic: sceneId,
                reason: `Granular keyword trigger: ${keywords.join(", ")}`,
                phase: sceneId === "revenue_impact" ? "reptilian" : "neocortex",
                sectionId: sceneId === "checkout" ? "pricing" : "hero",
            });
        }
    }

    private scheduleDecision(): void {
        if (this.debounceTimer) clearTimeout(this.debounceTimer);

        // Debounce: wait 500ms after last event before deciding
        this.debounceTimer = setTimeout(() => {
            this.processDecisionQueue();
        }, 500);
    }

    private async processDecisionQueue(): Promise<void> {
        if (this.isProcessing || this.decisionQueue.length === 0) return;
        this.isProcessing = true;

        try {
            // Get the most important event from the queue
            const events = [...this.decisionQueue];
            this.decisionQueue = [];

            // Find the highest-priority event
            const priorityEvent = this.findPriorityEvent(events);
            if (!priorityEvent) {
                this.isProcessing = false;
                return;
            }

            // Rate limit check
            const now = Date.now();
            if (now - this.lastVisualTime < this.minVisualInterval) {
                console.log("[VisualJenny] ⏳ Rate limited — waiting before next visual");
                this.isProcessing = false;
                return;
            }

            // Decide what visual to show
            const decision = await this.decideVisual(priorityEvent);
            if (decision.action === "wait") {
                this.isProcessing = false;
                return;
            }

            // Execute the decision
            await this.executeDecision(decision);
            this.lastVisualTime = Date.now();
            this.visualCount++;
        } catch (err) {
            console.warn("[VisualJenny] Decision error (non-fatal):", err);
        } finally {
            this.isProcessing = false;
        }
    }

    private findPriorityEvent(events: ConversationEvent[]): ConversationEvent | null {
        // Priority order (highest first)
        const priorities: ConversationEventType[] = [
            "audit_complete",
            "roi_calculated",
            "competitor_intel",
            "close_attempt",
            "checkout_triggered",
            "audit_started",
            "domain_captured",
            "name_captured",
            "phase_change",
            "handoff",
            "data_point",
            "tool_call",
            "agent_speech",
            "prospect_speech",
        ];

        for (const priority of priorities) {
            const match = events.find(e => e.type === priority);
            if (match) return match;
        }

        return events[0] || null;
    }

    /** Rule-based visual decision engine — fast, reliable, no API call needed */
    private async decideVisual(event: ConversationEvent): Promise<VisualDecision> {
        const { type, data } = event;

        switch (type) {
            case "session_start":
                return {
                    action: "navigate",
                    sectionId: "hero",
                    reason: "Session started — showing hero section",
                };

            case "name_captured":
                // If we haven't shown a welcome visual yet, show one
                if (!this.context.visualsShown.includes("welcome")) {
                    return {
                        action: "show_image",
                        phase: "limbic",
                        topic: "welcome",
                        reason: `Welcome visual for ${this.context.prospectName}`,
                        useCache: false,
                        generatePrompt: `Warm, personalized welcome message for ${this.context.prospectName}. Professional dark theme with green accent.`,
                    };
                }
                return { action: "wait", reason: "Welcome already shown" };

            case "domain_captured":
            case "audit_started":
                return {
                    action: "show_loading",
                    reason: "Audit in progress — showing loading state with industry visual",
                    topic: "audit_loading",
                };

            case "audit_complete": {
                const auditData = data.result as Record<string, unknown>;
                const industry = (data.industry as string) || this.context.industry || "business";

                return {
                    action: "show_image",
                    phase: "reptilian",
                    topic: "audit_reveal",
                    reason: `Audit complete — showing revenue leak visualization for ${industry}`,
                    useCache: true,
                    generatePrompt: this.buildAuditVisualPrompt(auditData, industry),
                };
            }

            case "competitor_intel":
                return {
                    action: "show_comparison",
                    phase: "reptilian",
                    topic: "competitor_comparison",
                    reason: "Competitor data ready — showing competitive landscape",
                };

            case "roi_calculated":
                return {
                    action: "show_stats",
                    phase: "neocortex",
                    topic: "roi_dashboard",
                    reason: "ROI calculated — showing personalized ROI dashboard",
                };

            case "phase_change": {
                const phase = data.phase as string;
                if (phase === "close_attempt" || phase === "won") {
                    return {
                        action: "show_image",
                        phase: "close",
                        topic: "close",
                        reason: "Close phase — showing transformation moment",
                        useCache: true,
                    };
                }
                if (phase === "solution" || phase === "pricing") {
                    return {
                        action: "navigate",
                        sectionId: "pricing",
                        reason: "Solution phase — navigating to pricing section",
                    };
                }
                return { action: "wait", reason: `Phase ${phase} — no visual action` };
            }

            case "close_attempt":
                return {
                    action: "navigate",
                    sectionId: "pricing",
                    reason: "Close attempt — navigating to pricing for Stripe checkout",
                };

            case "checkout_triggered":
                return {
                    action: "navigate",
                    sectionId: "pricing",
                    reason: "Checkout triggered — showing billing",
                };

            case "handoff":
                return {
                    action: "show_image",
                    phase: "limbic",
                    topic: "handoff",
                    reason: `Handoff from ${data.from} to ${data.to}`,
                };

            case "data_point": {
                // When specific data is mentioned, show a relevant stat card
                const text = (data.text as string || "").toLowerCase();
                if (text.includes("missed") || text.includes("unanswered")) {
                    return {
                        action: "show_stats",
                        phase: "reptilian",
                        topic: "missed_calls",
                        reason: "Missed calls data point — showing impact visualization",
                    };
                }
                return { action: "wait", reason: "Data point not actionable for visual" };
            }

            default:
                return { action: "wait", reason: `No visual action for ${type}` };
        }
    }

    // ── Execution Engine ───────────────────────────────────────────────────

    private async executeDecision(decision: VisualDecision): Promise<void> {
        console.log(`[VisualJenny] 🧠 Decision: ${decision.action} | ${decision.reason}`);

        switch (decision.action) {
            case "show_image":
                await this.showImage(decision);
                break;

            case "navigate":
                this.navigateToSection(decision.sectionId || "hero");
                break;

            case "show_stats":
                this.showStatsCard(decision);
                break;

            case "show_comparison":
                this.showComparison(decision);
                break;

            case "show_loading":
                this.showLoadingState(decision);
                break;
        }

        // Track that we showed this
        if (decision.topic) {
            this.context.visualsShown.push(decision.topic);
        }
    }

    private async showImage(decision: VisualDecision): Promise<void> {
        const phase = decision.phase || "reptilian";
        const topic = decision.topic || "discovery";
        const industry = this.context.industry || "business";

        // Try Supabase cache first
        if (decision.useCache) {
            try {
                const cached = await this.fetchCachedVisual(industry, phase);
                if (cached) {
                    console.log(`[VisualJenny] ✅ Cache hit: ${industry}_${phase}`);
                    this.emitShowImage(cached, phase, decision.reason, topic);
                    return;
                }
            } catch (err) {
                console.warn("[VisualJenny] Cache check failed:", err);
            }
        }

        // Fall back to Nana Banana 2 live generation
        try {
            const result = await this.generateNeuroVisual(phase, topic, industry);
            if (result) {
                this.emitShowImage(result.imageDataUrl, phase, result.neuroReason || decision.reason, topic);
            }
        } catch (err) {
            console.warn("[VisualJenny] Visual generation failed:", err);
        }
    }

    private emitShowImage(imageUrl: string, brainLayer: string, reason: string, topic: string): void {
        // Emit to VaultUI via bridge
        const command: VisualCommand = {
            type: "show_image",
            payload: {
                imageDataUrl: imageUrl,
                brainLayer,
                neuroReason: reason,
                title: topic,
                transition: "fade",
                duration: 15000,
            },
            timestamp: Date.now(),
        };
        VisualBridge.emitVisualCommand(command);

        // Also fire the direct callback if set
        this.config.onVisualReady?.({
            imageDataUrl: imageUrl,
            brainLayer,
            neuroReason: reason,
            topic,
            businessName: this.context.businessName || undefined,
        });
    }

    private navigateToSection(sectionId: string): void {
        const command: VisualCommand = {
            type: "navigate_section",
            payload: {
                sectionId,
                transition: "slide",
            },
            timestamp: Date.now(),
        };
        VisualBridge.emitVisualCommand(command);

        // Direct callback
        this.config.onNavigate?.(sectionId);

        // Also scroll the page
        if (typeof window !== "undefined") {
            const el = document.getElementById(sectionId);
            if (el) {
                el.scrollIntoView({ behavior: "smooth", block: "start" });
            }
        }
    }

    private showStatsCard(decision: VisualDecision): void {
        let stats: Record<string, string | number> = {};
        let title = "Key Metrics";

        if (decision.topic === "roi_dashboard" && this.context.roiData) {
            const roi = this.context.roiData;
            stats = {
                "Monthly Revenue Leak": `$${(roi.monthlyLeak as number || 0).toLocaleString()}`,
                "Annual Loss": `$${(roi.annualLoss as number || 0).toLocaleString()}`,
                "Recovery with BioDynamX": `$${(roi.recovery as number || 0).toLocaleString()}`,
                "ROI Multiplier": `${roi.roiMultiplier || "5"}x`,
                "Payback Period": `${roi.paybackDays || "30"} days`,
            };
            title = `${this.context.prospectName || "Your"} ROI Projection`;
        } else if (decision.topic === "missed_calls") {
            const missed = this.context.missedCalls || 5;
            const avg = this.context.avgSaleValue || 500;
            stats = {
                "Missed Calls/Week": missed,
                "Avg Sale Value": `$${avg.toLocaleString()}`,
                "Monthly Loss": `$${(missed * avg * 4).toLocaleString()}`,
                "Annual Loss": `$${(missed * avg * 52).toLocaleString()}`,
            };
            title = "Revenue Walking Out the Door";
        }

        const command: VisualCommand = {
            type: "show_stats_card",
            payload: {
                stats,
                title,
                brainLayer: decision.phase || "neocortex",
                neuroReason: decision.reason,
                transition: "slide",
                duration: 20000,
            },
            timestamp: Date.now(),
        };
        VisualBridge.emitVisualCommand(command);
        this.config.onStatsCard?.(stats, title);
    }

    private showComparison(decision: VisualDecision): void {
        if (!this.context.competitorData) return;

        const command: VisualCommand = {
            type: "show_comparison",
            payload: {
                stats: this.context.competitorData as Record<string, string | number>,
                title: "Competitive Landscape",
                brainLayer: "reptilian",
                neuroReason: "Competitive threat visualization — activating FOMO",
                transition: "slide",
                duration: 20000,
            },
            timestamp: Date.now(),
        };
        VisualBridge.emitVisualCommand(command);
    }

    private showLoadingState(decision: VisualDecision): void {
        const command: VisualCommand = {
            type: "show_loading",
            payload: {
                title: "Analyzing Your Business...",
                subtitle: this.context.domain ? `Scanning ${this.context.domain}` : "Running 19-point diagnostic",
                brainLayer: "limbic",
                neuroReason: decision.reason,
                transition: "pulse",
            },
            timestamp: Date.now(),
        };
        VisualBridge.emitVisualCommand(command);
    }

    // ── API Integrations ───────────────────────────────────────────────────

    /** Fetch pre-cached visual from Supabase via the visual-asset-cache */
    private async fetchCachedVisual(industry: string, phase: string): Promise<string | null> {
        try {
            const response = await fetch("/api/generate-scene", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    conversationPhase: phase,
                    topic: phase,
                    industry,
                    businessName: this.context.businessName,
                    prospectName: this.context.prospectName,
                    cacheOnly: true, // Signal to only check cache, don't generate
                }),
            });

            if (!response.ok) return null;
            const result = await response.json();
            return result.imageDataUrl || null;
        } catch {
            return null;
        }
    }

    /** Generate a fresh visual via Nana Banana 2 */
    private async generateNeuroVisual(
        phase: string,
        topic: string,
        industry: string
    ): Promise<{ imageDataUrl: string; neuroReason?: string } | null> {
        try {
            const response = await fetch("/api/generate-scene", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    conversationPhase: phase,
                    topic,
                    industry,
                    businessName: this.context.businessName,
                    prospectName: this.context.prospectName,
                    auditData: this.context.auditData,
                }),
            });

            if (!response.ok) return null;
            const result = await response.json();
            if (result.error || !result.imageDataUrl) return null;

            return {
                imageDataUrl: result.imageDataUrl,
                neuroReason: result.neuroReason,
            };
        } catch {
            return null;
        }
    }

    private buildAuditVisualPrompt(auditData: Record<string, unknown>, industry: string): string {
        const speed = auditData?.loadTimeMs || "unknown";
        const mobileScore = auditData?.mobileScore || "unknown";
        return `Business audit results dashboard for ${industry} business. Load time: ${speed}ms. Mobile score: ${mobileScore}. Dark professional theme with green accents. Show pain points highlighted in red, opportunities in green.`;
    }

    // ── Public Accessors ───────────────────────────────────────────────────

    /** Get current conversation context (for debugging/display) */
    getContext(): ConversationContext {
        return { ...this.context };
    }

    /** Get visual count this session */
    getVisualCount(): number {
        return this.visualCount;
    }

    /** Check if Visual Jenny is active */
    getIsActive(): boolean {
        return this.isActive;
    }
}

// Re-export types that VaultUI will need
export type { ConversationEvent as VisualConversationEvent } from "./visual-bridge";
