// ═══════════════════════════════════════════════════════════════════
// BIODYNAMX CONVERSATION MEMORY — Agentic Context Engine
// ═══════════════════════════════════════════════════════════════════
// Gives agents persistent memory across conversation turns.
// Tracks: entities mentioned, objections raised, commitment level,
// pain points discovered, and conversation trajectory.
// ═══════════════════════════════════════════════════════════════════

export interface ConversationMemory {
    sessionId: string;
    startTime: number;
    turnCount: number;
    activeAgent: string;

    // ── Prospect Intelligence ──
    prospect: {
        name?: string;
        company?: string;
        industry?: string;
        role?: string;
        businessSize?: "solo" | "small" | "medium" | "enterprise";
        websiteUrl?: string;
        estimatedRevenue?: string;
    };

    // ── Pain Points Discovered ──
    painPoints: Array<{
        category: "response_time" | "lead_follow_up" | "conversion" | "tech_stack" | "cost" | "staffing" | "scaling" | "other";
        description: string;
        quantified: boolean;       // Has a dollar amount been attached?
        dollarImpact?: string;
        discoveredBy: string;      // Which agent found this
        turnNumber: number;
    }>;

    // ── Objections Raised ──
    objections: Array<{
        type: "price" | "timing" | "trust" | "competition" | "internal" | "technical" | "authority" | "other";
        text: string;
        addressed: boolean;
        addressedBy?: string;
        turnNumber: number;
    }>;

    // ── Commitment Signals ──
    commitmentLevel: number;       // 0-100 scale
    commitmentHistory: Array<{
        level: number;
        reason: string;
        turnNumber: number;
    }>;

    // ── Handoff Records ──
    handoffs: Array<{
        from: string;
        to: string;
        reason: string;
        turnNumber: number;
    }>;

    // ── Tools Used ──
    toolCalls: Array<{
        tool: string;
        input: Record<string, unknown>;
        result: string;
        agent: string;
        turnNumber: number;
        durationMs: number;
    }>;

    // ── Key Quotes (Prospect) ──
    keyQuotes: string[];

    // ── Conversation Phase ──
    phase: ConversationPhase;
    phaseHistory: Array<{
        phase: ConversationPhase;
        enteredAt: number;
        turnNumber: number;
    }>;
}

export type ConversationPhase =
    | "greeting"           // Initial contact
    | "discovery"          // Finding pain points
    | "diagnostic"         // Running audit/tools
    | "reframe"            // Challenger Sale: reframing their worldview
    | "rational_drowning"  // Showing the math on their losses
    | "emotional_impact"   // Humanizing the cost
    | "solution_present"   // Presenting BioDynamX
    | "roi_bridge"         // Mark's ROI calculation
    | "objection_handling" // Addressing concerns
    | "close_attempt"      // Going for the sale
    | "negotiation"        // Working out terms
    | "won"                // Deal closed
    | "nurture"            // Not ready now, enter nurture sequence
    | "lost"               // Declined, reason captured
    | "escalated";         // Passed to human team

// ── Memory Store ────────────────────────────────────────────────

const memoryStore = new Map<string, ConversationMemory>();

export function createMemory(sessionId: string, agentName: string): ConversationMemory {
    const memory: ConversationMemory = {
        sessionId,
        startTime: Date.now(),
        turnCount: 0,
        activeAgent: agentName,
        prospect: {},
        painPoints: [],
        objections: [],
        commitmentLevel: 10, // Start at 10 — they showed up
        commitmentHistory: [{ level: 10, reason: "Initial engagement", turnNumber: 0 }],
        handoffs: [],
        toolCalls: [],
        keyQuotes: [],
        phase: "greeting",
        phaseHistory: [{ phase: "greeting", enteredAt: Date.now(), turnNumber: 0 }],
    };

    memoryStore.set(sessionId, memory);
    return memory;
}

export function getMemory(sessionId: string): ConversationMemory | undefined {
    return memoryStore.get(sessionId);
}

export function updateMemory(
    sessionId: string,
    updates: Partial<ConversationMemory>
): ConversationMemory | undefined {
    const memory = memoryStore.get(sessionId);
    if (!memory) return undefined;

    Object.assign(memory, updates);
    return memory;
}

// ── Smart Entity Extraction ─────────────────────────────────────
// Extracts prospect info from natural conversation

const INDUSTRY_KEYWORDS: Record<string, string> = {
    "call center": "Call Center",
    "contact center": "Call Center",
    "med spa": "Med Spa",
    "medspa": "Med Spa",
    "medical spa": "Med Spa",
    "dental": "Dental Practice",
    "dentist": "Dental Practice",
    "real estate": "Real Estate",
    "realtor": "Real Estate",
    "hvac": "Home Services",
    "plumbing": "Home Services",
    "roofing": "Home Services",
    "landscaping": "Home Services",
    "home service": "Home Services",
    "law firm": "Legal",
    "attorney": "Legal",
    "lawyer": "Legal",
    "ecommerce": "E-Commerce",
    "e-commerce": "E-Commerce",
    "online store": "E-Commerce",
    "marketing agency": "Marketing Agency",
    "digital agency": "Marketing Agency",
    "startup": "Startup",
    "saas": "SaaS",
    "restaurant": "Restaurant/Hospitality",
    "hotel": "Restaurant/Hospitality",
    "gym": "Fitness",
    "fitness": "Fitness",
    "clinic": "Healthcare",
    "healthcare": "Healthcare",
    "insurance": "Insurance",
};

const SIZE_KEYWORDS: Record<string, ConversationMemory["prospect"]["businessSize"]> = {
    "just me": "solo",
    "solo": "solo",
    "one man": "solo",
    "bootstrapped": "solo",
    "small team": "small",
    "few employees": "small",
    "5 to 10": "small",
    "10 to 20": "small",
    "under 20": "small",
    "small business": "small",
    "20 to 50": "medium",
    "50 employees": "medium",
    "growing team": "medium",
    "mid-size": "medium",
    "enterprise": "enterprise",
    "hundreds": "enterprise",
    "multi-location": "enterprise",
    "multiple offices": "enterprise",
    "national": "enterprise",
    "Fortune": "enterprise",
};

export function extractEntities(
    text: string,
    memory: ConversationMemory
): Partial<ConversationMemory["prospect"]> {
    const lower = text.toLowerCase();
    const updates: Partial<ConversationMemory["prospect"]> = {};

    // Industry detection
    for (const [keyword, industry] of Object.entries(INDUSTRY_KEYWORDS)) {
        if (lower.includes(keyword)) {
            updates.industry = industry;
            break;
        }
    }

    // Business size detection
    for (const [keyword, size] of Object.entries(SIZE_KEYWORDS)) {
        if (lower.includes(keyword)) {
            updates.businessSize = size;
            break;
        }
    }

    // URL detection
    const urlMatch = text.match(/(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+\.[a-zA-Z]{2,}(?:\.[a-zA-Z]{2,})?)/);
    if (urlMatch && !memory.prospect.websiteUrl) {
        updates.websiteUrl = urlMatch[0].startsWith("http") ? urlMatch[0] : `https://${urlMatch[0]}`;
    }

    // Role detection
    const rolePatterns: Record<string, string> = {
        "i'm the owner": "Owner",
        "i own": "Owner",
        "my company": "Owner",
        "i'm the ceo": "CEO",
        "cfo": "CFO",
        "cro": "CRO",
        "marketing director": "Marketing Director",
        "vp of": "VP",
        "manager": "Manager",
        "director": "Director",
    };
    for (const [pattern, role] of Object.entries(rolePatterns)) {
        if (lower.includes(pattern)) {
            updates.role = role;
            break;
        }
    }

    return updates;
}

// ── Commitment Score Calculator ─────────────────────────────────
// Real-time buying signal analysis

const POSITIVE_SIGNALS: Array<{ pattern: RegExp; boost: number; reason: string }> = [
    { pattern: /how much|price|cost|pricing/i, boost: 15, reason: "Asked about pricing" },
    { pattern: /how (?:does|do) (?:i|we) (?:get started|start|sign up|begin)/i, boost: 25, reason: "Asked how to start" },
    { pattern: /sounds? (?:great|good|interesting|amazing|perfect)/i, boost: 10, reason: "Positive reaction" },
    { pattern: /can (?:you|we) (?:do|set up|implement|integrate)/i, boost: 12, reason: "Implementation question" },
    { pattern: /what (?:results|roi|return)/i, boost: 10, reason: "Asking about results" },
    { pattern: /(?:let's|let us) (?:do|try|go|start|get)/i, boost: 30, reason: "Ready to commit" },
    { pattern: /i(?:'m| am) (?:ready|interested|sold|convinced|in)/i, boost: 35, reason: "Explicit buying signal" },
    { pattern: /when can (?:you|we) start/i, boost: 28, reason: "Timeline urgency" },
    { pattern: /(?:send|give|share) (?:me|us) (?:the|a) (?:link|proposal|quote|contract)/i, boost: 40, reason: "Requesting buy link" },
];

const NEGATIVE_SIGNALS: Array<{ pattern: RegExp; penalty: number; reason: string }> = [
    { pattern: /not (?:interested|looking|ready|now)/i, penalty: -20, reason: "Explicit disinterest" },
    { pattern: /too (?:expensive|much|costly)/i, penalty: -15, reason: "Price objection" },
    { pattern: /(?:i|we) (?:need|have) to think/i, penalty: -10, reason: "Stalling" },
    { pattern: /(?:talk to|check with|ask) (?:my|our) (?:partner|team|boss|wife|husband)/i, penalty: -8, reason: "Not sole decision maker" },
    { pattern: /already (?:have|use|using) (?:a|an|something)/i, penalty: -12, reason: "Existing solution" },
    { pattern: /(?:no|not) (?:right now|at this time|today)/i, penalty: -15, reason: "Timing objection" },
    { pattern: /(?:hang up|stop calling|leave me alone|not interested)/i, penalty: -50, reason: "Strong rejection" },
];

export function analyzeCommitment(
    text: string,
    currentLevel: number
): { newLevel: number; signals: Array<{ type: "positive" | "negative"; reason: string; change: number }> } {
    const signals: Array<{ type: "positive" | "negative"; reason: string; change: number }> = [];
    let adjustment = 0;

    for (const { pattern, boost, reason } of POSITIVE_SIGNALS) {
        if (pattern.test(text)) {
            signals.push({ type: "positive", reason, change: boost });
            adjustment += boost;
        }
    }

    for (const { pattern, penalty, reason } of NEGATIVE_SIGNALS) {
        if (pattern.test(text)) {
            signals.push({ type: "negative", reason, change: penalty });
            adjustment += penalty;
        }
    }

    const newLevel = Math.max(0, Math.min(100, currentLevel + adjustment));

    return { newLevel, signals };
}

// ── Memory Summary for Agent Context ────────────────────────────
// Generates a concise summary for injection into agent prompts

export function generateMemoryContext(memory: ConversationMemory): string {
    const lines: string[] = [];

    lines.push(`═══ CONVERSATION MEMORY (Turn ${memory.turnCount}) ═══`);

    // Prospect info
    const p = memory.prospect;
    if (p.name || p.company || p.industry) {
        lines.push(`PROSPECT: ${[p.name, p.company, p.industry, p.role, p.businessSize].filter(Boolean).join(" | ")}`);
    }
    if (p.websiteUrl) lines.push(`WEBSITE: ${p.websiteUrl}`);

    // Pain points
    if (memory.painPoints.length > 0) {
        lines.push(`PAIN POINTS DISCOVERED (${memory.painPoints.length}):`);
        for (const pp of memory.painPoints) {
            const impact = pp.quantified ? ` — ${pp.dollarImpact}` : "";
            lines.push(`  • [${pp.category}] ${pp.description}${impact}`);
        }
    }

    // Objections
    const openObjections = memory.objections.filter((o) => !o.addressed);
    if (openObjections.length > 0) {
        lines.push(`OPEN OBJECTIONS (${openObjections.length}):`);
        for (const obj of openObjections) {
            lines.push(`  ⚠️ [${obj.type}] "${obj.text}"`);
        }
    }

    // Commitment
    lines.push(`COMMITMENT: ${memory.commitmentLevel}/100`);
    if (memory.commitmentLevel >= 70) {
        lines.push(`  → HIGH INTENT — Consider moving to close`);
    } else if (memory.commitmentLevel >= 40) {
        lines.push(`  → WARMING — Continue building value`);
    } else if (memory.commitmentLevel <= 20) {
        lines.push(`  → LOW INTENT — Consider nurture sequence or escalation`);
    }

    // Phase
    lines.push(`PHASE: ${memory.phase}`);

    // Key quotes
    if (memory.keyQuotes.length > 0) {
        lines.push(`KEY QUOTES: "${memory.keyQuotes[memory.keyQuotes.length - 1]}"`);
    }

    return lines.join("\n");
}

// ── Phase Transition Logic ──────────────────────────────────────

const VALID_TRANSITIONS: Record<ConversationPhase, ConversationPhase[]> = {
    greeting: ["discovery"],
    discovery: ["diagnostic", "reframe"],
    diagnostic: ["reframe", "rational_drowning"],
    reframe: ["rational_drowning"],
    rational_drowning: ["emotional_impact"],
    emotional_impact: ["solution_present"],
    solution_present: ["roi_bridge"],
    roi_bridge: ["close_attempt", "objection_handling"],
    objection_handling: ["close_attempt", "negotiation", "nurture", "escalated"],
    close_attempt: ["won", "negotiation", "objection_handling", "nurture"],
    negotiation: ["won", "nurture", "lost"],
    won: [],
    nurture: [],
    lost: [],
    escalated: [],
};

export function canTransition(from: ConversationPhase, to: ConversationPhase): boolean {
    return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export function transitionPhase(
    memory: ConversationMemory,
    newPhase: ConversationPhase
): boolean {
    if (!canTransition(memory.phase, newPhase)) {
        return false;
    }

    memory.phase = newPhase;
    memory.phaseHistory.push({
        phase: newPhase,
        enteredAt: Date.now(),
        turnNumber: memory.turnCount,
    });
    return true;
}

// ── Cleanup ─────────────────────────────────────────────────────

export function deleteMemory(sessionId: string): boolean {
    return memoryStore.delete(sessionId);
}

export function getActiveSessionCount(): number {
    return memoryStore.size;
}
