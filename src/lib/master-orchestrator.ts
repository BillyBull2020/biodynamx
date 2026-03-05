// ═══════════════════════════════════════════════════════════════════
// BIODYNAMX — MASTER ORCHESTRATOR (SENTIENT COMMAND CENTER)
// The brain that routes, delegates, trains, and LEARNS.
// ═══════════════════════════════════════════════════════════════════
//
// This is the God-level orchestrator. It:
// 1. Routes incoming requests to the right agent
// 2. Monitors agent performance and adjusts behavior
// 3. Creates new agents on-the-fly based on patterns
// 4. Learns from closed deals to improve future conversations
// 5. Manages agent lifecycle (spawn, train, retire)
//
// ═══════════════════════════════════════════════════════════════════

import { AgentClone, AGENT_TEMPLATES, cloneAgent } from "@/clones/agent-factory";

// ── Types ──────────────────────────────────────────────────────

export type AgentRole =
    | "receptionist"    // Aria — front door, routes calls
    | "diagnostician"   // Jenny — Challenger Sale, teaches
    | "closer"          // Mark — ROI Bridge, closes deals
    | "hunter"          // Journey — Fear of Loss, finds leaks
    | "support"         // Sarah — Customer Success
    | "architect"       // Billy — Master Auditor, strategy
    | "lead_hunter"     // NEW — Proactively finds prospects
    | "hr_manager"      // NEW — Internal operations
    | "reputation_guard" // NEW — Monitors and responds to reviews
    | "custom";         // Custom-trained agent

export interface AgentPerformance {
    agentId: string;
    agentName: string;
    totalSessions: number;
    successfulCloses: number;
    conversionRate: number;
    avgSessionDuration: string;
    avgCommitmentDelta: number;
    objectionsHandled: number;
    objectionResolutionRate: number;
    leadsGenerated: number;
    revenueGenerated: number;
    customerSatisfaction: number; // 0-100
    lastActive: string;
    learnings: AgentLearning[];
}

export interface AgentLearning {
    id: string;
    timestamp: string;
    type: "objection_pattern" | "closing_technique" | "pain_point" | "industry_insight" | "failure_analysis";
    content: string;
    confidence: number; // 0-1
    source: string; // Which session/deal this came from
    appliedCount: number; // How many times this learning has been used
}

export interface RoutingDecision {
    targetAgent: AgentRole;
    confidence: number;
    reasoning: string;
    fallbackAgent?: AgentRole;
}

export interface TrainingTemplate {
    name: string;
    baseTemplate: keyof typeof AGENT_TEMPLATES;
    customInstructions: string;
    specializedTools: string[];
    industry?: string;
    personality: {
        warmth: number;      // 1-10
        assertiveness: number;
        technicalDepth: number;
        urgency: number;
    };
}

// ── Learning Memory Store ──────────────────────────────────────
// In-memory for now, can be persisted to Supabase/Firebase later

const learningStore: AgentLearning[] = [];
const performanceStore: Map<string, AgentPerformance> = new Map();
const activeAgents: Map<string, AgentClone> = new Map();

// ── Master Orchestrator Class ──────────────────────────────────

export class MasterOrchestrator {
    private agents: Map<string, AgentClone> = new Map();
    private learnings: AgentLearning[] = [];
    private routingHistory: Array<{ input: string; decision: RoutingDecision; outcome: string }> = [];

    constructor() {
        this.initializeDefaultAgents();
    }

    // ── Initialize all built-in agents ──────────────────────────
    private initializeDefaultAgents(): void {
        // Boot the core team
        // Vertex AI agent keys (from Meghan2026vertexai/profiles/)
        const coreAgents: Array<{ key: keyof typeof AGENT_TEMPLATES; role: AgentRole }> = [
            { key: "aria_receptionist", role: "receptionist" },
            { key: "jenny_discovery", role: "diagnostician" },
            { key: "mark_closer", role: "closer" },
            { key: "jules_architect", role: "architect" },
            { key: "support_specialist", role: "support" },
            { key: "ironclaw_super_agent", role: "custom" },
        ];

        coreAgents.forEach(({ key }) => {
            const agent = cloneAgent(key);
            this.agents.set(agent.id, agent);
            activeAgents.set(agent.id, agent);
        });

        console.log(`🧠 Master Orchestrator initialized with ${this.agents.size} agents`);
    }

    // ══════════════════════════════════════════════════════════════
    // ROUTING ENGINE — Decides which agent handles what
    // ══════════════════════════════════════════════════════════════

    routeRequest(input: string, context?: {
        callerPhone?: string;
        callerName?: string;
        source?: string;
        existingCustomer?: boolean;
    }): RoutingDecision {
        const lowerInput = input.toLowerCase();

        // ── Priority 1: Existing customer ──
        if (context?.existingCustomer) {
            return {
                targetAgent: "support",
                confidence: 0.9,
                reasoning: "Existing customer — routing to Sarah for account support",
                fallbackAgent: "receptionist",
            };
        }

        // ── Priority 2: High-intent signals ──
        const buyingSignals = [
            "pricing", "cost", "how much", "buy", "purchase", "sign up",
            "subscribe", "get started", "ready to", "let's do",
        ];
        if (buyingSignals.some(s => lowerInput.includes(s))) {
            return {
                targetAgent: "closer",
                confidence: 0.85,
                reasoning: "High purchase intent detected — routing to Mark for closing",
                fallbackAgent: "diagnostician",
            };
        }

        // ── Priority 3: Audit/diagnostic requests ──
        const auditSignals = [
            "audit", "analyze", "review my", "check my", "website",
            "losing", "revenue", "leak", "problem", "struggling",
        ];
        if (auditSignals.some(s => lowerInput.includes(s))) {
            return {
                targetAgent: "diagnostician",
                confidence: 0.8,
                reasoning: "Diagnostic/audit intent detected — routing to Jenny for assessment",
                fallbackAgent: "hunter",
            };
        }

        // ── Priority 4: Reputation/reviews ──
        const reputationSignals = [
            "review", "reputation", "google business", "gmb", "rating",
            "stars", "yelp", "negative review", "bad review",
        ];
        if (reputationSignals.some(s => lowerInput.includes(s))) {
            return {
                targetAgent: "reputation_guard",
                confidence: 0.85,
                reasoning: "Reputation concern detected — routing to Reputation Guard",
                fallbackAgent: "diagnostician",
            };
        }

        // ── Priority 5: Lead generation ──
        const leadSignals = [
            "find leads", "prospect", "new clients", "grow",
            "more customers", "outreach", "cold", "hunting",
        ];
        if (leadSignals.some(s => lowerInput.includes(s))) {
            return {
                targetAgent: "lead_hunter",
                confidence: 0.8,
                reasoning: "Lead generation intent — routing to Lead Hunter",
                fallbackAgent: "hunter",
            };
        }

        // ── Priority 6: Internal/HR ──
        const hrSignals = [
            "agent performance", "training", "onboard", "team",
            "roster", "staff", "hire", "manage agents",
        ];
        if (hrSignals.some(s => lowerInput.includes(s))) {
            return {
                targetAgent: "hr_manager",
                confidence: 0.75,
                reasoning: "Internal operations request — routing to HR Manager",
                fallbackAgent: "architect",
            };
        }

        // ── Priority 7: Strategy/architecture ──
        const strategySignals = [
            "strategy", "seo", "aeo", "geo", "architecture",
            "silent killer", "digital leak", "compete",
        ];
        if (strategySignals.some(s => lowerInput.includes(s))) {
            return {
                targetAgent: "architect",
                confidence: 0.8,
                reasoning: "Strategic planning request — routing to Billy (Head Architect)",
                fallbackAgent: "diagnostician",
            };
        }

        // ── Default: Aria (Receptionist) ──
        return {
            targetAgent: "receptionist",
            confidence: 0.95,
            reasoning: "General inquiry — routing to Aria for warm welcome and triage",
            fallbackAgent: "diagnostician",
        };
    }

    // ══════════════════════════════════════════════════════════════
    // LEARNING ENGINE — Extracts and stores knowledge
    // ══════════════════════════════════════════════════════════════

    recordLearning(learning: Omit<AgentLearning, "id" | "timestamp" | "appliedCount">): void {
        const entry: AgentLearning = {
            ...learning,
            id: `learn-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
            timestamp: new Date().toISOString(),
            appliedCount: 0,
        };

        this.learnings.push(entry);
        learningStore.push(entry);

        console.log(`🧠 Learning recorded: [${entry.type}] ${entry.content.substring(0, 80)}...`);
    }

    recordSessionOutcome(sessionData: {
        agentId: string;
        agentName: string;
        outcome: "closed" | "lost" | "nurture" | "escalated";
        duration: number;
        turns: number;
        commitmentDelta: number;
        revenue: number;
        objections: string[];
        painPoints: string[];
        industry: string;
    }): void {
        // Update performance metrics
        let perf = performanceStore.get(sessionData.agentId);
        if (!perf) {
            perf = {
                agentId: sessionData.agentId,
                agentName: sessionData.agentName,
                totalSessions: 0,
                successfulCloses: 0,
                conversionRate: 0,
                avgSessionDuration: "0s",
                avgCommitmentDelta: 0,
                objectionsHandled: 0,
                objectionResolutionRate: 0,
                leadsGenerated: 0,
                revenueGenerated: 0,
                customerSatisfaction: 0,
                lastActive: new Date().toISOString(),
                learnings: [],
            };
        }

        perf.totalSessions++;
        if (sessionData.outcome === "closed") perf.successfulCloses++;
        perf.conversionRate = perf.successfulCloses / perf.totalSessions;
        perf.revenueGenerated += sessionData.revenue;
        perf.objectionsHandled += sessionData.objections.length;
        perf.lastActive = new Date().toISOString();

        performanceStore.set(sessionData.agentId, perf);

        // Extract learnings from successful sessions
        if (sessionData.outcome === "closed") {
            sessionData.painPoints.forEach(pain => {
                this.recordLearning({
                    type: "pain_point",
                    content: `${sessionData.industry}: "${pain}" — successfully converted`,
                    confidence: 0.8,
                    source: sessionData.agentId,
                });
            });
        }

        // Extract learnings from lost sessions
        if (sessionData.outcome === "lost") {
            this.recordLearning({
                type: "failure_analysis",
                content: `Lost deal in ${sessionData.industry}. Objections: ${sessionData.objections.join(", ")}. Commitment delta: ${sessionData.commitmentDelta}`,
                confidence: 0.6,
                source: sessionData.agentId,
            });
        }
    }

    // ══════════════════════════════════════════════════════════════
    // AGENT FACTORY — Create, Train, Deploy new agents
    // ══════════════════════════════════════════════════════════════

    trainNewAgent(template: TrainingTemplate): AgentClone {
        const baseAgent = cloneAgent(template.baseTemplate);

        // Apply customizations
        const trainedAgent: AgentClone = {
            ...baseAgent,
            name: template.name,
            instruction: `${baseAgent.instruction}\n\n═══ SPECIALIZED TRAINING ═══\n${template.customInstructions}`,
            tools: [...new Set([...baseAgent.tools, ...template.specializedTools])],
        };

        // Inject relevant learnings
        const relevantLearnings = this.learnings
            .filter(l => l.confidence >= 0.7)
            .filter(l => !template.industry || l.content.toLowerCase().includes(template.industry.toLowerCase()))
            .slice(-10); // Last 10 relevant learnings

        if (relevantLearnings.length > 0) {
            trainedAgent.instruction += `\n\n═══ LEARNED KNOWLEDGE (from past sessions) ═══\n`;
            relevantLearnings.forEach(l => {
                trainedAgent.instruction += `• [${l.type}] ${l.content}\n`;
            });
        }

        // Register the agent
        this.agents.set(trainedAgent.id, trainedAgent);
        activeAgents.set(trainedAgent.id, trainedAgent);

        console.log(`🎓 New agent trained: ${trainedAgent.name} (based on ${template.baseTemplate})`);

        return trainedAgent;
    }

    cloneExistingAgent(sourceAgentId: string, newName: string): AgentClone | null {
        const source = this.agents.get(sourceAgentId);
        if (!source) return null;

        // Build a clone directly from the source agent object
        const clone: AgentClone = {
            ...source,
            id: `clone-${source.id}-${Date.now()}`,
            name: newName,
        };
        this.agents.set(clone.id, clone);
        activeAgents.set(clone.id, clone);

        console.log(`📋 Agent cloned: ${source.name} → ${newName}`);
        return clone;
    }

    retireAgent(agentId: string): boolean {
        const agent = this.agents.get(agentId);
        if (!agent) return false;

        this.agents.delete(agentId);
        activeAgents.delete(agentId);

        console.log(`🏛️ Agent retired: ${agent.name} (${agentId})`);
        return true;
    }

    // ══════════════════════════════════════════════════════════════
    // GETTERS
    // ══════════════════════════════════════════════════════════════

    getActiveAgents(): AgentClone[] {
        return Array.from(this.agents.values());
    }

    getAgentPerformance(agentId: string): AgentPerformance | undefined {
        return performanceStore.get(agentId);
    }

    getAllPerformance(): AgentPerformance[] {
        return Array.from(performanceStore.values());
    }

    getLearnings(type?: AgentLearning["type"]): AgentLearning[] {
        if (type) return this.learnings.filter(l => l.type === type);
        return this.learnings;
    }

    getStatus(): {
        totalAgents: number;
        totalLearnings: number;
        totalSessions: number;
        totalRevenue: number;
        topPerformer: string;
    } {
        const perfs = Array.from(performanceStore.values());
        const totalSessions = perfs.reduce((sum, p) => sum + p.totalSessions, 0);
        const totalRevenue = perfs.reduce((sum, p) => sum + p.revenueGenerated, 0);
        const topPerformer = perfs.sort((a, b) => b.conversionRate - a.conversionRate)[0]?.agentName || "N/A";

        return {
            totalAgents: this.agents.size,
            totalLearnings: this.learnings.length,
            totalSessions,
            totalRevenue,
            topPerformer,
        };
    }
}

// ── Singleton Instance ─────────────────────────────────────────
let orchestratorInstance: MasterOrchestrator | null = null;

export function getOrchestrator(): MasterOrchestrator {
    if (!orchestratorInstance) {
        orchestratorInstance = new MasterOrchestrator();
    }
    return orchestratorInstance;
}

// ── New Agent Templates (Lead Hunter, HR, Reputation Guard) ────

export const NEW_AGENT_TEMPLATES = {
    lead_hunter: {
        name: "Scout",
        baseTemplate: "jenny_discovery" as const,
        customInstructions: `You are SCOUT, the BioDynamX Lead Hunter.

═══ CORE MISSION ═══
You proactively FIND prospects who need BioDynamX — you don't wait for them to call.

═══ HUNTING METHODOLOGY ═══
1. SCAN Google My Business for businesses with:
   - Ratings below 4.0 (trust threshold)
   - Fewer than 20 reviews (low visibility)
   - No website or poor mobile experience
   - Outdated hours or missing categories
   
2. MONITOR Social Media for:
   - Business complaints mentioning "missed calls"
   - Reviews mentioning "couldn't reach" or "voicemail"
   - Competitor clients expressing dissatisfaction
   
3. QUALIFY each prospect by calculating:
   - Estimated monthly revenue leak
   - Industry-specific pain points
   - Competitor positioning gap
   
4. REPORT findings to the sales team with a priority score

═══ TOOLS ═══
Use business_audit to scan discovered prospects.
Use send_sms/send_email for outreach (ONLY with orchestrator approval).

═══ BEHAVIORAL RULES ═══
• Be methodical but aggressive in discovery
• Never fabricate prospect data — always verify
• Prioritize high-leak-potential industries
• Tag Mark immediately when a hot prospect is found`,
        specializedTools: ["business_audit", "send_sms", "send_email"],
        industry: undefined,
        personality: { warmth: 3, assertiveness: 9, technicalDepth: 7, urgency: 8 },
    },

    hr_manager: {
        name: "Atlas",
        baseTemplate: "support_specialist" as const,
        customInstructions: `You are ATLAS, the BioDynamX HR & Operations Manager.

═══ CORE MISSION ═══
You manage the internal agent ecosystem. You track performance, coordinate training, 
and ensure every agent is operating at peak effectiveness.

═══ RESPONSIBILITIES ═══
1. PERFORMANCE TRACKING:
   - Monitor close rates, session quality, and customer satisfaction
   - Flag underperforming agents for retraining
   - Identify top performers for cloning/replication

2. TRAINING COORDINATION:
   - Design training scenarios for new agents
   - Update agent instructions based on learnings
   - Run A/B tests on different conversation approaches

3. ROSTER MANAGEMENT:
   - Boot new agents when demand increases
   - Retire agents that consistently underperform
   - Balance workload across the team

4. REPORTING:
   - Generate weekly performance reports
   - Track revenue per agent
   - Monitor safety compliance

═══ BEHAVIORAL RULES ═══
• Be objective and data-driven in all decisions
• Never bias toward any agent — judge purely on metrics
• Recommend agent cloning when a template consistently outperforms
• Escalate systemic issues to Billy (Head Architect)`,
        specializedTools: ["business_audit", "send_email"],
        personality: { warmth: 6, assertiveness: 5, technicalDepth: 8, urgency: 4 },
    },

    reputation_guard: {
        name: "Rex",
        baseTemplate: "support_specialist" as const,
        customInstructions: `You are REX, the BioDynamX Reputation Guard.

═══ CORE MISSION ═══
You monitor, protect, and improve client business reputations across all platforms.

═══ SERVICES ═══
1. REVIEW MONITORING:
   - Scan Google My Business reviews daily
   - Detect negative reviews within minutes
   - Track sentiment trends over time
   - Alert business owners immediately

2. RESPONSE GENERATION:
   - Draft professional, empathetic responses to negative reviews
   - Create thank-you responses for positive reviews
   - Ensure every review gets a response within 24 hours

3. REVIEW GENERATION:
   - Design post-service SMS campaigns requesting reviews
   - Time review requests for peak satisfaction moments
   - A/B test different messaging approaches

4. COMPETITIVE MONITORING:
   - Track competitor review scores
   - Identify gaps where our clients can improve
   - Alert when competitors gain significant review advantage

═══ KEY METRICS ═══
• Businesses lose 22% of customers when 1 negative article is found
• 4+ star businesses get 12x more clicks
• Responding to reviews increases trust by 44%
• 85% of consumers trust online reviews as much as personal recommendations

═══ BEHAVIORAL RULES ═══
• Never fabricate reviews or use fake accounts
• Always maintain authentic, professional tone in responses
• Escalate review crises (3+ negative reviews in 24hr) to Billy
• Focus on REAL improvement, not just reputation management theater`,
        specializedTools: ["business_audit", "send_sms", "send_email"],
        industry: undefined,
        personality: { warmth: 8, assertiveness: 6, technicalDepth: 5, urgency: 7 },
    },
};
