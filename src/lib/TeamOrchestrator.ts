// ═══════════════════════════════════════════════════════════════════
// BIODYNAMX TEAM ORCHESTRATOR
// The Master Relay — manages multi-agent voice sessions,
// visual state transitions, and cinematic asset coordination.
// Vertex AI Edition — five agents selectable from home page.
// ═══════════════════════════════════════════════════════════════════

import { VoiceOrchestrator, ConnectionStatus, IntentSignal } from "./gemini-live";
import { AgentClone, JENNY_LISTENER, MARK_ARCHITECT, AGENT_TEMPLATES, cloneAgent } from "@/clones/agent-factory";
import { VisualJenny } from "./visual-jenny";
import { VisualBridge } from "./visual-bridge";
import { A2AContext } from "./a2a-context";

// ─── Types ─────────────────────────────────────────────────────────

export type TeamPhase =
    | "standby"        // Vault idle, waiting for Initialize
    | "glia_active"          // Jenny
    | "nova_active"          // Nova
    | "isabel_active"        // Isabel
    | "maya_active"          // Maya
    | "vicki_active"         // Vicki
    | "alex_active"          // Alex
    | "zara_active"          // Zara
    | "abby_active"          // Abby
    | "titan_active"         // Titan
    | "jules_active"         // Jules
    | "ben_active"           // Ben
    | "handoff"              // Handoff state
    | "stitching"            // Generating UI
    | "checkout"             // Transaction mode
    | "complete";            // End session

export type VaultVisualState = {
    phase: TeamPhase;
    borderColor: string;
    bgOpacity: number;
    pulseActive: boolean;
    activeAgentName: string | null;
    activeAgentVoice: string | null;
    waveformMode: "idle" | "soft" | "sharp";
};

export interface TeamOrchestratorCallbacks {
    onPhaseChange: (phase: TeamPhase, visual: VaultVisualState) => void;
    onStatusChange: (status: ConnectionStatus, detail?: string) => void;
    onSpeakerChange: (speaker: "alpha" | "beta" | "idle") => void;
    onAuditRequested: (url: string) => void;
    onStitchRequested: (prompt: string) => void;
    onIntentDetected: (intent: IntentSignal) => void;
    onTranscript: (agent: string, text: string) => void;
    onError: (error: string) => void;
    onAnalyserReady: (analyser: AnalyserNode) => void;
    // ★ IronClaw Visual Callbacks — wired to VisualJenny
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

// ─── Visual State Presets ──────────────────────────────────────────

const VISUAL_STATES: Record<TeamPhase, VaultVisualState> = {
    standby: {
        phase: "standby",
        borderColor: "#1a1a1a",
        bgOpacity: 0,
        pulseActive: false,
        activeAgentName: null,
        activeAgentVoice: null,
        waveformMode: "idle",
    },
    glia_active: {
        phase: "glia_active",
        borderColor: "#00ff41",
        bgOpacity: 0.05,
        pulseActive: true,
        activeAgentName: "Jenny",
        activeAgentVoice: "Leda",
        waveformMode: "soft",
    },
    nova_active: {
        phase: "nova_active",
        borderColor: "#c026d3",
        bgOpacity: 0.05,
        pulseActive: true,
        activeAgentName: "Nova",
        activeAgentVoice: "Aoede",
        waveformMode: "soft",
    },
    isabel_active: {
        phase: "isabel_active",
        borderColor: "#8b5cf6",
        bgOpacity: 0.05,
        pulseActive: true,
        activeAgentName: "Isabel",
        activeAgentVoice: "Despina",
        waveformMode: "soft",
    },
    maya_active: {
        phase: "maya_active",
        borderColor: "#a78bfa",
        bgOpacity: 0.04,
        pulseActive: true,
        activeAgentName: "Maya",
        activeAgentVoice: "Charon",
        waveformMode: "soft",
    },
    vicki_active: {
        phase: "vicki_active",
        borderColor: "#34d399",
        bgOpacity: 0.04,
        pulseActive: true,
        activeAgentName: "Vicki",
        activeAgentVoice: "Kore",
        waveformMode: "soft",
    },
    alex_active: {
        phase: "alex_active",
        borderColor: "#06b6d4",
        bgOpacity: 0.04,
        pulseActive: true,
        activeAgentName: "Alex",
        activeAgentVoice: "Puck",
        waveformMode: "soft",
    },
    zara_active: {
        phase: "zara_active",
        borderColor: "#f97316",
        bgOpacity: 0.06,
        pulseActive: true,
        activeAgentName: "Zara",
        activeAgentVoice: "Autonoe",
        waveformMode: "sharp",
    },
    abby_active: {
        phase: "abby_active",
        borderColor: "#f59e0b",
        bgOpacity: 0.05,
        pulseActive: true,
        activeAgentName: "Abby",
        activeAgentVoice: "Zephyr",
        waveformMode: "soft",
    },
    titan_active: {
        phase: "titan_active",
        borderColor: "#1e40af",
        bgOpacity: 0.08,
        pulseActive: true,
        activeAgentName: "Titan",
        activeAgentVoice: "Orion",
        waveformMode: "sharp",
    },
    jules_active: {
        phase: "jules_active",
        borderColor: "#06b6d4",
        bgOpacity: 0.05,
        pulseActive: true,
        activeAgentName: "Jules",
        activeAgentVoice: "Puck",
        waveformMode: "sharp",
    },
    ben_active: {
        phase: "ben_active",
        borderColor: "#fbbf24",
        bgOpacity: 0.05,
        pulseActive: true,
        activeAgentName: "Ben",
        activeAgentVoice: "Puck",
        waveformMode: "sharp",
    },
    handoff: {
        phase: "handoff",
        borderColor: "#00ff41",
        bgOpacity: 0.02,
        pulseActive: true,
        activeAgentName: null,
        activeAgentVoice: null,
        waveformMode: "idle",
    },
    stitching: {
        phase: "stitching",
        borderColor: "#8b5cf6",
        bgOpacity: 0.1,
        pulseActive: true,
        activeAgentName: null,
        activeAgentVoice: null,
        waveformMode: "soft",
    },
    checkout: {
        phase: "checkout",
        borderColor: "#00ff41",
        bgOpacity: 0.08,
        pulseActive: true,
        activeAgentName: "Titan",
        activeAgentVoice: "Orion",
        waveformMode: "sharp",
    },
    complete: {
        phase: "complete",
        borderColor: "#00ff41",
        bgOpacity: 0.03,
        pulseActive: false,
        activeAgentName: null,
        activeAgentVoice: null,
        waveformMode: "idle",
    },
};

// ─── Team Orchestrator Class ───────────────────────────────────────

export class TeamOrchestrator {
    private currentPhase: TeamPhase = "standby";
    private orchestrator: VoiceOrchestrator | null = null;
    private apiKey: string;
    private callbacks: TeamOrchestratorCallbacks;
    private language: "en" | "es" = "en";
    private cartesiaKey?: string;
    private cartesiaVoiceId?: string;
    private handoffInProgress = false;
    private visualJenny: VisualJenny | null = null;

    constructor(
        apiKey: string,
        callbacks: TeamOrchestratorCallbacks,
        language: "en" | "es" = "en",
        cartesiaKey?: string,
        cartesiaVoiceId?: string
    ) {
        this.apiKey = apiKey;
        this.language = language;
        this.callbacks = callbacks;
        this.cartesiaKey = cartesiaKey;
        this.cartesiaVoiceId = cartesiaVoiceId;
    }

    // ─── Public API ────────────────────────────────────────────

    /** Initialize the full session — boots Jenny immediately */
    async initialize() {
        if (this.currentPhase !== "standby") return;
        this.setPhase("glia_active");
        await this.bootAgent(JENNY_LISTENER);
    }

    /** Initialize and boot any specific Vertex AI agent by template key */
    async initializeWithAgent(templateKey: string) {
        // ★ FIX: If a session is already active, tear it down completely
        // and boot the newly selected agent fresh.
        // Previous behavior was to barge-in, which meant clicking any agent
        // card when a session was running did NOTHING useful — agent never booted.
        if (this.currentPhase !== "standby") {
            console.log(`[TeamOrchestrator] Session active — tearing down to boot: ${templateKey}`);
            this.killCurrentAgent();
            this.handoffInProgress = false;
            // Brief pause so mic/audio resources release before re-acquiring
            await new Promise(r => setTimeout(r, 300));
        }

        // ★ Map Frontend IDs (AgentCarousel) -> Template Keys (agent-factory)
        const idMap: Record<string, { template: string, phase: TeamPhase }> = {
            jenny_lead: { template: "glia_jenny", phase: "glia_active" },
            nova_strategy: { template: "nova_strategy", phase: "nova_active" },
            iris_visibility: { template: "nova_visibility", phase: "isabel_active" },
            megan_soother: { template: "meghan_receptionist", phase: "maya_active" },
            vicki_empathy: { template: "vicki_empathy", phase: "vicki_active" },
            alex_retention: { template: "alex_support", phase: "alex_active" },
            zara_hunter: { template: "zara_hunter", phase: "zara_active" },
            ava_growth: { template: "ava_growth", phase: "abby_active" },
            titan_closer: { template: "titan_closer", phase: "titan_active" },
            jules_architect: { template: "jules_architect", phase: "jules_active" },
            ben_analyst: { template: "ben_analyst", phase: "ben_active" },
        };

        const config = idMap[templateKey] || { template: "glia_jenny", phase: "glia_active" };
        const agent = cloneAgent(config.template);
        this.setPhase(config.phase);
        await this.bootAgent(agent);
    }

    /** Initialize and boot Mark directly (skipping Jenny) */
    async initializeWithMark() {
        if (this.currentPhase !== "standby") {
            console.log("[TeamOrchestrator] Active session detected. Forcing handoff to Titan.");
            this.executeHandoff(cloneAgent("titan_closer"));
            return;
        }
        this.setPhase("titan_active");
        await this.bootAgent(MARK_ARCHITECT);
    }

    /** Barge-in / interrupt current speaker */
    bargeIn() {
        if (this.orchestrator) {
            this.orchestrator.bargeIn();
            this.callbacks.onSpeakerChange("idle");
        }
    }

    /** Get current phase */
    getPhase(): TeamPhase {
        return this.currentPhase;
    }

    /** Get current visual state */
    getVisualState(): VaultVisualState {
        return VISUAL_STATES[this.currentPhase];
    }

    /** Force disconnect everything */
    shutdown() {
        this.killCurrentAgent();
        // ★ Stop Visual Jenny and reset bridge
        if (this.visualJenny) {
            this.visualJenny.stop();
            this.visualJenny = null;
        }
        VisualBridge.reset();
        this.setPhase("standby");
    }

    // ─── Internal Agent Lifecycle ──────────────────────────────

    private async bootAgent(agent: AgentClone, retryCount = 0): Promise<void> {
        console.log(`[TeamOrchestrator] ★ Booting ${agent.name} (${agent.voice})... (Try ${retryCount + 1})`);

        // ★ A2A: Record this agent as active in shared context
        A2AContext.recordAgentActive(agent.name);

        // ★ A2A: Inject shared briefing into the agent's system instruction
        // This is what gives Mark knowledge of what Jenny already discovered.
        const sharedBriefing = A2AContext.toAgentBriefing();
        const enrichedAgent: AgentClone = {
            ...agent,
            instruction: `${agent.instruction}\n\n${sharedBriefing}`,
        };

        const sharedCtx = this.orchestrator?.audioContext || null;
        const sharedStream = this.orchestrator?.sharedStream || (this.orchestrator as unknown as Record<string, MediaStream>)?.stream || null;

        if (this.orchestrator) {
            this.orchestrator.disconnect(this.handoffInProgress);
            this.orchestrator = null;
        }

        const orchestrator = new VoiceOrchestrator(
            this.apiKey,
            [enrichedAgent],  // ✅ ENRICHED with A2A context
            this.language,
            sharedCtx,
            sharedStream,
            this.cartesiaKey,
            this.cartesiaVoiceId
        );

        // Wire callbacks
        orchestrator.onSpeakerChange = (speaker) => {
            this.callbacks.onSpeakerChange(speaker);
        };

        orchestrator.onStatusChange = (status, detail) => {
            this.callbacks.onStatusChange(status, detail);
            if (status === "error") {
                this.callbacks.onError(detail || "Unknown error");
            }
        };

        orchestrator.onAuditRequested = (url) => {
            this.callbacks.onAuditRequested(url);
            // ★ A2A: Capture audited URL
            A2AContext.update({ auditUrl: url });
        };

        orchestrator.onStitchRequested = (prompt) => {
            this.callbacks.onStitchRequested(prompt);
            this.setPhase("stitching");
        };

        orchestrator.onIntentDetected = (intent) => {
            this.callbacks.onIntentDetected(intent);
            if (intent === "purchase") {
                this.setPhase("checkout");
                // ★ A2A: Upgrade buying signal on purchase intent
                A2AContext.update({ buyingSignal: "hot", currentPhase: "close" });
            }
        };

        // ★ A2A: Record transcript for cross-agent memory
        orchestrator.onTranscriptUpdate = (entry) => {
            const agentName = entry.agentName ?? entry.speaker ?? "agent";
            const text = entry.content;
            this.callbacks.onTranscript(agentName, text);
            A2AContext.recordTranscript(agentName, text);
        };


        // Handoff detection
        orchestrator.onHandoff = (from, to) => {
            console.log(`[TeamOrchestrator] ⚡ HANDOFF TRIGGERED: ${from} → ${to}`);

            const targetTemplate = AGENT_TEMPLATES[to.toLowerCase()] ||
                Object.values(AGENT_TEMPLATES).find(t => t.name === to);

            if (targetTemplate && !this.handoffInProgress) {
                this.executeHandoff(cloneAgent(to.toLowerCase()));
            } else if (to === "Mark" && !this.handoffInProgress) {
                this.executeHandoff(MARK_ARCHITECT);
            }
        };

        try {
            await orchestrator.connect();
            this.orchestrator = orchestrator;

            if (orchestrator.analyser) {
                this.callbacks.onAnalyserReady(orchestrator.analyser);
            }

            // ★ IRONCLAW VISUAL INTELLIGENCE — Boot Visual Jenny
            // This was the missing link: VisualJenny was built but never started.
            // We create one instance per session. On handoff we keep the same instance
            // so conversation context accumulates correctly.
            if (!this.visualJenny) {
                this.visualJenny = new VisualJenny({
                    apiKey: this.apiKey,
                    onVisualReady: (visual) => {
                        this.callbacks.onVisualReady?.(visual);
                    },
                    onNavigate: (sectionId) => {
                        this.callbacks.onNavigate?.(sectionId);
                    },
                    onStatsCard: (stats, title) => {
                        this.callbacks.onStatsCard?.(stats, title);
                    },
                });
                this.visualJenny.start();
                console.log("[TeamOrchestrator] ★ IronClaw Visual Intelligence ONLINE — VisualJenny started");
            }

            // Emit session start event to kick off the visual engine
            VisualBridge.emitConversationEvent({
                type: "session_start",
                data: { agentName: agent.name },
                timestamp: Date.now(),
                sessionId: A2AContext.get().sessionId,  // ★ Use A2A sessionId
                agentName: agent.name,
            });

        } catch (err) {
            console.error(`[TeamOrchestrator] Failed to boot ${agent.name}:`, err);
            if (retryCount < 2) {
                console.log(`[TeamOrchestrator] Retrying boot...`);
                await this.delay(1000);
                return this.bootAgent(agent, retryCount + 1);
            }
            this.callbacks.onError(`Failed to boot ${agent.name}: ${String(err)}`);
        }
    }

    private killCurrentAgent(isHandoff = false) {
        if (this.orchestrator) {
            console.log(`[TeamOrchestrator] ✕ Disconnecting agent (Handoff: ${isHandoff})...`);
            this.orchestrator.disconnect(isHandoff);
            this.orchestrator = null;
        }
    }

    private async executeHandoff(targetAgent: AgentClone = MARK_ARCHITECT) {
        if (this.handoffInProgress) return;
        this.handoffInProgress = true;

        console.log(`[TeamOrchestrator] ━━━ EXECUTING HANDOFF TO ${targetAgent.name} ━━━`);

        const outgoingAuditData = this.orchestrator?.lastAuditResult || null;
        const outgoingConversationNotes = this.orchestrator?.getConversationNotes() || "";

        // ★ A2A: Update shared context with latest audit + conversation notes
        if (outgoingAuditData) {
            A2AContext.update({ auditResults: outgoingAuditData });
        }
        if (outgoingConversationNotes) {
            A2AContext.update({ conversationSummary: outgoingConversationNotes });
        }

        this.killCurrentAgent(true);
        this.setPhase("handoff");
        this.callbacks.onSpeakerChange("idle");

        await this.delay(800);

        if (targetAgent.name === "Titan" || targetAgent.name === "Mark") {
            this.setPhase("titan_active");
        } else if (targetAgent.name === "Jenny") {
            this.setPhase("glia_active");
        } else {
            this.setPhase("glia_active");
        }

        // ★ A2A: Use the unified briefing as the handoff context
        // This is the core of Web 4.0 A2A coordination:
        // The incoming agent already knows everything the outgoing agent discovered.
        const a2aBriefing = A2AContext.toAgentBriefing();

        const agentWithContext: AgentClone = {
            ...targetAgent,
            instruction: targetAgent.instruction + `
═══ A2A HANDOFF BRIEF ═══
${a2aBriefing}
Audit raw: ${outgoingAuditData ? JSON.stringify(outgoingAuditData).slice(0, 400) : "None."}`,
        };

        await this.bootAgent(agentWithContext);

        if (this.orchestrator && outgoingAuditData) {
            this.orchestrator.lastAuditResult = outgoingAuditData;
        }

        this.handoffInProgress = false;
        console.log("[TeamOrchestrator] ━━━ HANDOFF COMPLETE ━━━");
    }

    private setPhase(phase: TeamPhase) {
        this.currentPhase = phase;
        const visual = VISUAL_STATES[phase];
        console.log(`[TeamOrchestrator] Phase → ${phase}`);
        this.callbacks.onPhaseChange(phase, visual);
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}
