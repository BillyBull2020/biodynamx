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
    | "milton_active"   // Milton (Hypnotist)
    | "meghan_active"   // Maya (Receptionist)
    | "brock_active"    // Brock (Security/ROI)
    | "vicki_active"    // Vicki (Empathy/Care)
    | "mark_active"     // Mark (Closer)
    | "jenny_closer_active" // Jenny (Consultative Closer)
    | "ben_analyst_active" // Ben (Macro-Analyst)
    | "iris_active"     // Isabel (AI Visibility)
    | "chase_active"    // Chase (Lead Hunter)
    | "jules_active"    // Jules (Technical Architect)
    | "alex_active"     // Alex (Support)
    | "glia_active"     // Glia-Jenny (Discovery)
    | "handoff"         // Handoff state
    | "stitching"       // Generating UI
    | "checkout"        // Transaction mode
    | "complete";       // End session

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
    milton_active: {
        phase: "milton_active",
        borderColor: "#4c1d95",
        bgOpacity: 0.04,
        pulseActive: true,
        activeAgentName: "Milton",
        activeAgentVoice: "Charon",
        waveformMode: "soft",
    },
    meghan_active: {
        phase: "meghan_active",
        borderColor: "#a78bfa",
        bgOpacity: 0.04,
        pulseActive: true,
        activeAgentName: "Maya",
        activeAgentVoice: "Lyra",
        waveformMode: "soft",
    },
    brock_active: {
        phase: "brock_active",
        borderColor: "#dc2626",
        bgOpacity: 0.05,
        pulseActive: true,
        activeAgentName: "Brock",
        activeAgentVoice: "Fenrir",
        waveformMode: "sharp",
    },
    vicki_active: {
        phase: "vicki_active",
        borderColor: "#34d399",
        bgOpacity: 0.04,
        pulseActive: true,
        activeAgentName: "Vicki",
        activeAgentVoice: "Aoede",
        waveformMode: "soft",
    },
    mark_active: {
        phase: "mark_active",
        borderColor: "#3b82f6",
        bgOpacity: 0.06,
        pulseActive: true,
        activeAgentName: "Mark",
        activeAgentVoice: "Orion",
        waveformMode: "sharp",
    },
    jenny_closer_active: {
        phase: "jenny_closer_active",
        borderColor: "#00ff41",
        bgOpacity: 0.05,
        pulseActive: true,
        activeAgentName: "Jenny",
        activeAgentVoice: "Kore",
        waveformMode: "soft",
    },
    ben_analyst_active: {
        phase: "ben_analyst_active",
        borderColor: "#fbbf24",
        bgOpacity: 0.05,
        pulseActive: true,
        activeAgentName: "Ben",
        activeAgentVoice: "Charon",
        waveformMode: "sharp",
    },
    iris_active: {
        phase: "iris_active",
        borderColor: "#8b5cf6",
        bgOpacity: 0.05,
        pulseActive: true,
        activeAgentName: "Isabel",
        activeAgentVoice: "Leda",
        waveformMode: "soft",
    },
    chase_active: {
        phase: "chase_active",
        borderColor: "#f97316",
        bgOpacity: 0.06,
        pulseActive: true,
        activeAgentName: "Chase",
        activeAgentVoice: "Enceladus",
        waveformMode: "sharp",
    },
    jules_active: {
        phase: "jules_active",
        borderColor: "#60a5fa",
        bgOpacity: 0.05,
        pulseActive: true,
        activeAgentName: "Jules",
        activeAgentVoice: "Puck",
        waveformMode: "sharp",
    },
    alex_active: {
        phase: "alex_active",
        borderColor: "#06b6d4",
        bgOpacity: 0.04,
        pulseActive: true,
        activeAgentName: "Alex",
        activeAgentVoice: "Aoede",
        waveformMode: "soft",
    },
    glia_active: {
        phase: "glia_active",
        borderColor: "#6366f1",
        bgOpacity: 0.05,
        pulseActive: true,
        activeAgentName: "Jenny",
        activeAgentVoice: "Kore",
        waveformMode: "soft",
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
        activeAgentName: "Mark",
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
    private handoffInProgress = false;
    // ★ IronClaw Visual Intelligence — the missing link
    private visualJenny: VisualJenny | null = null;

    constructor(apiKey: string, callbacks: TeamOrchestratorCallbacks, language: "en" | "es" = "en") {
        this.apiKey = apiKey;
        this.language = language;
        this.callbacks = callbacks;
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

        const agent = cloneAgent(templateKey);
        const phaseMap: Record<string, TeamPhase> = {
            milton_hypnotist: "milton_active",
            meghan_receptionist: "meghan_active",
            brock_security: "brock_active",
            vicki_empathy: "vicki_active",
            mark_closer: "mark_active",
            jenny_closer: "jenny_closer_active",
            ben_analyst: "ben_analyst_active",
            nova_visibility: "iris_active",
            hunter_prospector: "chase_active",
            jules_architect: "jules_active",
            alex_support: "alex_active",
            glia_jenny: "glia_active",
            ironclaw_super_agent: "glia_active",
        };
        this.setPhase(phaseMap[templateKey] ?? "glia_active");
        await this.bootAgent(agent);
    }

    /** Initialize and boot Mark directly (skipping Jenny) */
    async initializeWithMark() {
        if (this.currentPhase !== "standby") {
            console.log("[TeamOrchestrator] Active session detected. Forcing handoff to Mark.");
            this.executeHandoff();
            return;
        }
        this.setPhase("mark_active");
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
            sharedStream
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

        if (targetAgent.name === "Mark") {
            this.setPhase("mark_active");
        } else if (targetAgent.name === "Jenny") {
            this.setPhase(targetAgent.voice === "Kore" ? "jenny_closer_active" : "glia_active");
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
