// ════════════════════════════════════════════════════════════════
// daily-voice.ts — Daily.co Voice Orchestrator
// ════════════════════════════════════════════════════════════════
// Drop-in replacement for gemini-live.ts.
// Connects the browser to a Daily room where the Pipecat bot
// (Jenny or Mark) is already running and waiting.
//
// The API surface mirrors VoiceOrchestrator so VaultUI.tsx
// needs minimal changes.
// ════════════════════════════════════════════════════════════════

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DailyCall = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DailyEventObjectParticipant = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let DailyIframe: any;

export type ConnectionStatus = "idle" | "connecting" | "setup_sent" | "ready" | "error";
export type IntentSignal = "schedule" | "purchase" | "captureLead" | "scheduleAppointment" | "escalate" | null;

export interface DailyVoiceOrchestratorOptions {
    agent?: "Jenny" | "Mark";
    language?: "en" | "es";
    industry?: string;
    onStatusChange?: (status: ConnectionStatus, detail?: string) => void;
    onIntentDetected?: (intent: IntentSignal, context?: string) => void;
    onVisualEvent?: (args: Record<string, unknown>) => void;
    onAuditResult?: (result: Record<string, unknown>) => void;
    onCheckoutTriggered?: (url: string) => void;
    onTranscriptUpdate?: (entry: { speaker: string; agentName?: string; content: string; timestamp: string }) => void;
    onDataPoint?: (text: string) => void;
    onHandoff?: (from: string, to: string) => void;
}

export class DailyVoiceOrchestrator {
    private call: DailyCall | null = null;
    private sessionId: string | null = null;
    private eventSource: EventSource | null = null;
    private agentName: string;
    private currentStatus: ConnectionStatus = "idle";

    // Mirrors VoiceOrchestrator public API
    public onStatusChange?: (status: ConnectionStatus, detail?: string) => void;
    public onIntentDetected?: (intent: IntentSignal, context?: string) => void;
    public onVisualEvent?: (args: Record<string, unknown>) => void;
    public onAuditResult?: (result: Record<string, unknown>) => void;
    public onCheckoutTriggered?: (url: string) => void;
    public onTranscriptUpdate?: (entry: { speaker: string; agentName?: string; content: string; timestamp: string }) => void;
    public onDataPoint?: (text: string) => void;
    public onHandoff?: (from: string, to: string) => void;

    // Compat shims (VaultUI reads these)
    public audioContext: AudioContext | null = null;
    public analyser: AnalyserNode | null = null;
    public lastAuditResult: Record<string, unknown> | null = null;

    constructor(options: DailyVoiceOrchestratorOptions = {}) {
        this.agentName = options.agent || "Jenny";
        this.onStatusChange = options.onStatusChange;
        this.onIntentDetected = options.onIntentDetected;
        this.onVisualEvent = options.onVisualEvent;
        this.onAuditResult = options.onAuditResult;
        this.onCheckoutTriggered = options.onCheckoutTriggered;
        this.onTranscriptUpdate = options.onTranscriptUpdate;
        this.onDataPoint = options.onDataPoint;
        this.onHandoff = options.onHandoff;
    }

    private setStatus(status: ConnectionStatus, detail?: string) {
        this.currentStatus = status;
        console.log(`[DailyVoice] Status: ${status}${detail ? " — " + detail : ""}`);
        this.onStatusChange?.(status, detail);
    }

    // ── Connect ────────────────────────────────────────────────────

    async connect() {
        this.setStatus("connecting", "Starting voice session...");

        try {
            // 1. Request a Daily room + Pipecat bot from our API
            const resp = await fetch("/api/voice-session", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    agent: this.agentName,
                    industry: this.getIndustryHint(),
                }),
            });

            if (!resp.ok) {
                throw new Error(`Session API returned ${resp.status}`);
            }

            const { roomUrl, token, sessionId } = await resp.json();
            this.sessionId = sessionId;
            console.log(`[DailyVoice] Room created: ${roomUrl} | session: ${sessionId}`);

            // 2. Subscribe to visual events (SSE)
            this.subscribeToVisualEvents(sessionId);

            // 3. Create Daily call object
            this.call = DailyIframe.createCallObject({
                audioSource: true,
                videoSource: false,
            });

            // 4. Wire up Daily events
            this.call
                .on("joined-meeting", () => {
                    this.setStatus("ready", `${this.agentName} is ready`);
                    console.log(`[DailyVoice] Joined room as user`);
                })
                .on("left-meeting", () => {
                    this.setStatus("idle", "Call ended");
                })
                .on("error", (event: { errorMsg?: string }) => {
                    const msg = event?.errorMsg || "Unknown Daily error";
                    console.error("[DailyVoice] Error:", msg);
                    this.setStatus("error", msg);
                })
                .on("participant-updated", (event: DailyEventObjectParticipant) => {
                    // Detect when the bot starts speaking
                    const p = event?.participant;
                    if (p && !p.local && p.audio) {
                        this.onTranscriptUpdate?.({
                            speaker: "agent",
                            agentName: this.agentName,
                            content: "(speaking)",
                            timestamp: new Date().toISOString(),
                        });
                    }
                });

            // 5. Join the room
            this.setStatus("setup_sent", "Joining room...");
            await this.call.join({ url: roomUrl, token });

            // 6. Set up AudioContext analyser for visualizer compat
            this.audioContext = new AudioContext({ sampleRate: 16000 });
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            this.analyser.smoothingTimeConstant = 0.7;

        } catch (err) {
            console.error("[DailyVoice] Connection failed:", err);
            this.setStatus("error", String(err));
            throw err;
        }
    }

    // ── Visual Events (SSE from Pipecat server) ────────────────────

    private subscribeToVisualEvents(sessionId: string) {
        const pipecatUrl = process.env.NEXT_PUBLIC_PIPECAT_SERVER_URL || "http://localhost:8080";
        const url = `${pipecatUrl}/visual-events/${sessionId}`;

        this.eventSource = new EventSource(url);

        this.eventSource.onmessage = (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.type === "show_visual") {
                    const { type: _type, ...args } = data;
                    this.onVisualEvent?.(args);

                    // Audit result compat
                    if (args.visual === "audit" && args.result) {
                        this.lastAuditResult = args.result as Record<string, unknown>;
                        this.onAuditResult?.(args.result as Record<string, unknown>);
                    }

                    // Checkout compat
                    if (args.visual === "checkout" && args.url) {
                        this.onCheckoutTriggered?.(args.url as string);
                    }
                }
            } catch (e) {
                console.warn("[DailyVoice] SSE parse error:", e);
            }
        };

        this.eventSource.onerror = (e) => {
            console.warn("[DailyVoice] SSE connection error:", e);
        };
    }

    // ── Industry hint from URL ─────────────────────────────────────

    private getIndustryHint(): string {
        if (typeof window === "undefined") return "";
        const path = window.location.pathname;
        const matches = path.match(/\/industries\/([^/]+)/);
        return matches ? matches[1] : "";
    }

    // ── Disconnect ─────────────────────────────────────────────────

    async disconnect() {
        try {
            this.eventSource?.close();
            this.eventSource = null;

            if (this.call) {
                await this.call.leave();
                await this.call.destroy();
                this.call = null;
            }

            this.audioContext?.close();
            this.audioContext = null;
            this.analyser = null;

            this.setStatus("idle", "Disconnected");
            console.log("[DailyVoice] Disconnected cleanly");
        } catch (err) {
            console.error("[DailyVoice] Disconnect error:", err);
        }
    }

    // ── Compat methods (VaultUI calls these) ──────────────────────

    getConversationNotes(): string {
        return "";
    }

    isConnected(): boolean {
        return this.currentStatus === "ready";
    }

    getStatus(): ConnectionStatus {
        return this.currentStatus;
    }
}
