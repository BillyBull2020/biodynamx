// ═══════════════════════════════════════════════════════════════════════════
// A2A CONTEXT — Agent-to-Agent Shared Memory
// ═══════════════════════════════════════════════════════════════════════════
//
// PURPOSE: Implements the Unified Context Object that satisfies Web 4.0
// A2A (Agent-to-Agent) coordination. When Jenny captures a prospect's name,
// domain, or pain point, Mark knows before he opens his mouth.
//
// ARCHITECTURE:
//   - In-memory singleton (session-scoped, < 50KB, zero Supabase round-trip)
//   - Persisted to localStorage for page refreshes
//   - Extended to Supabase on session_end for cross-device memory
//   - All 11 agents READ from this before generating their first sentence
//
// VERIFICATION: Satisfies Web 4.0 Stress Test #3 — A2A Coordination
// ═══════════════════════════════════════════════════════════════════════════

export interface A2AContext {
    // Session metadata
    sessionId: string;
    sessionStartedAt: number;
    lastUpdatedAt: number;
    activeAgent: string | null;
    agentHistory: string[];        // Ordered list of agents that have spoken

    // Prospect identity (captured by Jenny/Meghan)
    prospectName: string | null;
    businessName: string | null;
    domain: string | null;
    industry: string | null;
    location: string | null;
    phone: string | null;
    email: string | null;

    // Conversation intelligence
    painPoints: string[];          // Accumulated from entire session
    topicsDiscussed: string[];     // Keyword matches from KeywordEngine
    competitorsMentioned: string[];
    budgetSignal: "unknown" | "low" | "medium" | "high";
    buyingSignal: "unknown" | "cold" | "warm" | "hot";
    currentPhase: string;          // Challenger phase (warmer → close)

    // Audit data (captured by tools)
    auditUrl: string | null;
    auditResults: Record<string, unknown> | null;
    roiEstimate: number | null;    // Monthly revenue at risk
    missedCalls: number | null;

    // Voice session
    conversationSummary: string;   // Running natural-language summary
    transcriptChunks: Array<{
        agent: string;
        text: string;
        timestamp: number;
    }>;
}

// ─── Singleton State ──────────────────────────────────────────────────────

const STORAGE_KEY = "bdx_a2a_context";

function makeBlankContext(): A2AContext {
    return {
        sessionId: `a2a_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
        sessionStartedAt: Date.now(),
        lastUpdatedAt: Date.now(),
        activeAgent: null,
        agentHistory: [],
        prospectName: null,
        businessName: null,
        domain: null,
        industry: null,
        location: null,
        phone: null,
        email: null,
        painPoints: [],
        topicsDiscussed: [],
        competitorsMentioned: [],
        budgetSignal: "unknown",
        buyingSignal: "unknown",
        currentPhase: "discovery",
        auditUrl: null,
        auditResults: null,
        roiEstimate: null,
        missedCalls: null,
        conversationSummary: "",
        transcriptChunks: [],
    };
}

class A2AContextManager {
    private ctx: A2AContext = makeBlankContext();
    private listeners: Array<(ctx: A2AContext) => void> = [];

    constructor() {
        // Restore from localStorage if same session is still warm (< 30 min)
        try {
            const raw = typeof window !== "undefined"
                ? window.localStorage.getItem(STORAGE_KEY)
                : null;
            if (raw) {
                const stored: A2AContext = JSON.parse(raw);
                const age = Date.now() - stored.lastUpdatedAt;
                if (age < 30 * 60 * 1000) {
                    this.ctx = stored;
                    console.log(`[A2A] ♻️ Restored context (${Math.round(age / 1000)}s old) | ${stored.sessionId}`);
                }
            }
        } catch { /* fresh start */ }
    }

    // ── Read ────────────────────────────────────────────────────────────

    /** Returns a snapshot of the current context — safe for agents to read */
    get(): Readonly<A2AContext> {
        return { ...this.ctx };
    }

    /**
     * Returns a compact context string suitable for injecting into
     * an agent's system instruction at session start.
     * Keeps it < 300 tokens.
     */
    toAgentBriefing(): string {
        const c = this.ctx;
        const parts: string[] = [
            "CONTEXT BRIEF — what your colleagues already know:",
        ];
        if (c.prospectName) parts.push(`• Prospect: ${c.prospectName}`);
        if (c.businessName) parts.push(`• Business: ${c.businessName}`);
        if (c.domain) parts.push(`• Domain: ${c.domain}`);
        if (c.industry) parts.push(`• Industry: ${c.industry}`);
        if (c.painPoints.length) parts.push(`• Pain points: ${c.painPoints.slice(0, 3).join("; ")}`);
        if (c.roiEstimate) parts.push(`• Revenue at risk: ~$${c.roiEstimate.toLocaleString()}/mo`);
        if (c.buyingSignal !== "unknown") parts.push(`• Buying signal: ${c.buyingSignal.toUpperCase()}`);
        if (c.currentPhase !== "discovery") parts.push(`• Sales phase: ${c.currentPhase}`);
        if (c.agentHistory.length) parts.push(`• Already spoke to: ${c.agentHistory.join(" → ")}`);
        if (c.auditUrl) parts.push(`• Audited site: ${c.auditUrl}`);
        if (c.conversationSummary) parts.push(`• Summary: ${c.conversationSummary.slice(0, 200)}`);
        parts.push("Do NOT retread covered ground. Build on it.");
        return parts.join("\n");
    }

    // ── Write ───────────────────────────────────────────────────────────

    update(patch: Partial<A2AContext>): void {
        this.ctx = {
            ...this.ctx,
            ...patch,
            lastUpdatedAt: Date.now(),
        };
        this.persist();
        this.notify();
    }

    /** Called when an agent starts speaking — log the handoff */
    recordAgentActive(agentName: string): void {
        if (this.ctx.activeAgent === agentName) return;
        this.update({
            activeAgent: agentName,
            agentHistory: this.ctx.agentHistory.includes(agentName)
                ? this.ctx.agentHistory
                : [...this.ctx.agentHistory, agentName],
        });
    }

    /** Feed a transcript chunk — appends and auto-extracts pain signals */
    recordTranscript(agent: string, text: string): void {
        const chunk = { agent, text, timestamp: Date.now() };
        const newChunks = [...this.ctx.transcriptChunks.slice(-49), chunk]; // keep last 50

        // Auto-extract pain signal keywords
        const painKeywords = [
            "loss", "losing", "miss", "missed", "frustrated", "overwhelmed",
            "expensive", "cost", "waste", "slow", "broken", "behind",
            "competitor", "risk", "worried", "afraid", "challenge",
        ];
        const lc = text.toLowerCase();
        const newPains = painKeywords
            .filter(kw => lc.includes(kw) && !this.ctx.painPoints.includes(kw));

        // Buying signal upgrade
        let buyingSignal = this.ctx.buyingSignal;
        if (["ready", "sounds good", "how do i", "sign up", "start"].some(w => lc.includes(w))) {
            buyingSignal = "hot";
        } else if (["interested", "tell me more", "how much", "could work"].some(w => lc.includes(w))) {
            if (buyingSignal === "unknown" || buyingSignal === "cold") buyingSignal = "warm";
        }

        this.update({
            transcriptChunks: newChunks,
            painPoints: [...this.ctx.painPoints, ...newPains].slice(0, 20),
            buyingSignal,
        });
    }

    /** Reset for a brand-new session */
    reset(): void {
        this.ctx = makeBlankContext();
        this.persist();
        this.notify();
        console.log(`[A2A] 🆕 Fresh session | ${this.ctx.sessionId}`);
    }

    // ── Subscriptions ──────────────────────────────────────────────────

    subscribe(fn: (ctx: A2AContext) => void): () => void {
        this.listeners.push(fn);
        return () => { this.listeners = this.listeners.filter(l => l !== fn); };
    }

    // ── Persistence ────────────────────────────────────────────────────

    private persist(): void {
        try {
            if (typeof window !== "undefined") {
                // Only persist the lightweight fields — not full transcript
                const persistable = {
                    ...this.ctx,
                    transcriptChunks: this.ctx.transcriptChunks.slice(-10), // last 10 only
                };
                window.localStorage.setItem(STORAGE_KEY, JSON.stringify(persistable));
            }
        } catch { /* quota exceeded — ignore */ }
    }

    private notify(): void {
        for (const fn of this.listeners) {
            try { fn({ ...this.ctx }); } catch { /* ignore listener errors */ }
        }
    }
}

// ── Singleton ──────────────────────────────────────────────────────────────

export const A2AContext = new A2AContextManager();
