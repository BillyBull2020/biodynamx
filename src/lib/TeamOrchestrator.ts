// ═══════════════════════════════════════════════════════════════════
// BIODYNAMX TEAM ORCHESTRATOR
// The Master Relay — manages multi-agent voice sessions,
// visual state transitions, and cinematic asset coordination.
// Vertex AI Edition — five agents selectable from home page.
// ═══════════════════════════════════════════════════════════════════

import { VoiceOrchestrator, ConnectionStatus, IntentSignal } from "./gemini-live";
import { AgentClone, JENNY_LISTENER, MARK_ARCHITECT, AGENT_TEMPLATES, cloneAgent } from "@/clones/agent-factory";

// ─── Types ─────────────────────────────────────────────────────────

export type TeamPhase =
    | "standby"        // Vault idle, waiting for Initialize
    | "jenny_active"   // Jenny is diagnosing
    | "handoff"        // Jenny triggered handoff, killing her stream
    | "mark_active"    // Mark is closing
    | "aria_active"    // Aria is receiving/routing
    | "jules_active"   // Jules is doing technical deep-dive
    | "support_active" // Support is handling care/troubleshooting
    | "stitching"      // Google Stitch is generating UI
    | "checkout"       // Mark triggered checkout
    | "complete";      // Session complete

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
    jenny_active: {
        phase: "jenny_active",
        borderColor: "#1a1a1a",
        bgOpacity: 0,
        pulseActive: true,
        activeAgentName: "Jenny",
        activeAgentVoice: "Sulafat",
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
    mark_active: {
        phase: "mark_active",
        borderColor: "#00ff41",
        bgOpacity: 0.05,
        pulseActive: true,
        activeAgentName: "Mark",
        activeAgentVoice: "Charon",
        waveformMode: "sharp",
    },
    stitching: {
        phase: "stitching",
        borderColor: "#8b5cf6", // Purple for Stitch
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
        activeAgentVoice: "Charon",
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
    aria_active: {
        phase: "aria_active",
        borderColor: "#a78bfa",
        bgOpacity: 0.04,
        pulseActive: true,
        activeAgentName: "Aria",
        activeAgentVoice: "Sadaltager",
        waveformMode: "soft",
    },
    jules_active: {
        phase: "jules_active",
        borderColor: "#f59e0b",
        bgOpacity: 0.04,
        pulseActive: true,
        activeAgentName: "Jules",
        activeAgentVoice: "Algenib",
        waveformMode: "sharp",
    },
    support_active: {
        phase: "support_active",
        borderColor: "#34d399",
        bgOpacity: 0.04,
        pulseActive: true,
        activeAgentName: "Support",
        activeAgentVoice: "Achernar",
        waveformMode: "soft",
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

    constructor(apiKey: string, callbacks: TeamOrchestratorCallbacks, language: "en" | "es" = "en") {
        this.apiKey = apiKey;
        this.language = language;
        this.callbacks = callbacks;
    }

    // ─── Public API ────────────────────────────────────────────

    /** Initialize the full session — boots Jenny immediately */
    async initialize() {
        if (this.currentPhase !== "standby") return;
        this.setPhase("jenny_active");
        await this.bootAgent(JENNY_LISTENER);
    }

    /** Initialize and boot any specific Vertex AI agent by template key */
    async initializeWithAgent(templateKey: string) {
        if (this.currentPhase !== "standby") {
            // Active session — barge-in instead
            this.bargeIn();
            return;
        }
        const agent = cloneAgent(templateKey);
        // Map template key to the correct TeamPhase
        const phaseMap: Record<string, TeamPhase> = {
            aria_receptionist: "aria_active",
            jenny_discovery: "jenny_active",
            mark_closer: "mark_active",
            jules_architect: "jules_active",
            support_specialist: "support_active",
            ironclaw_super_agent: "jenny_active",
        };
        this.setPhase(phaseMap[templateKey] ?? "jenny_active");
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
        this.setPhase("standby");
    }

    // ─── Internal Agent Lifecycle ──────────────────────────────

    private async bootAgent(agent: AgentClone, retryCount = 0): Promise<void> {
        console.log(`[TeamOrchestrator] ★ Booting ${agent.name} (${agent.voice})... (Try ${retryCount + 1})`);

        const sharedCtx = this.orchestrator?.audioContext || null;
        const sharedStream = this.orchestrator?.sharedStream || (this.orchestrator as unknown as Record<string, MediaStream>)?.stream || null;

        if (this.orchestrator) {
            this.orchestrator.disconnect(this.handoffInProgress);
            this.orchestrator = null;
        }

        const orchestrator = new VoiceOrchestrator(
            this.apiKey,
            [agent],
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
        };

        orchestrator.onStitchRequested = (prompt) => {
            this.callbacks.onStitchRequested(prompt);
            this.setPhase("stitching");
        };

        orchestrator.onIntentDetected = (intent) => {
            this.callbacks.onIntentDetected(intent);
            if (intent === "purchase") {
                this.setPhase("checkout");
            }
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

        this.killCurrentAgent(true);
        this.setPhase("handoff");
        this.callbacks.onSpeakerChange("idle");

        await this.delay(800);

        if (targetAgent.name === "Mark") {
            this.setPhase("mark_active");
        } else {
            this.setPhase("jenny_active");
        }

        const agentWithContext: AgentClone = {
            ...targetAgent,
            instruction: targetAgent.instruction + `
═══ HANDOFF CONTEXT ═══
A colleague just completed a session.
Conversation: ${outgoingConversationNotes || "Not captured."}
Audit: ${outgoingAuditData ? JSON.stringify(outgoingAuditData) : "No audit."}
Continuing same session. Do not re-introduce yourself.`
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
