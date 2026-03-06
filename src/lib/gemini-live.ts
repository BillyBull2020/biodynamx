import { createDefaultTeam, generateSystemInstruction } from "@/clones/agent-factory";
import { createMemory, getMemory } from "./agent-memory";
import { processOutgoingMessage } from "./agent-toolkit";
import { startSession, recordTurn, recordToolCall, recordHandoff, endSession } from "./agent-observability";
import { logAuditEntry } from "./agent-safety";
import {
    createTranscript,
    recordAgentSpeech,
    recordProspectSpeech,
    recordToolCallInTranscript,
    recordHandoffInTranscript,
    endTranscript,
    getTranscript,
    getFormattedTranscript,
    getTranscriptJSON,
    updateProspectInfo,
} from "./conversation-transcript";
import { VisualBridge } from "./visual-bridge";


export type ConnectionStatus = "idle" | "connecting" | "setup_sent" | "ready" | "error";
export type VoiceName = "Aoede" | "Charon" | "Enceladus" | "Kore" | "Leda" | "Orion" | "Puck";
export type IntentSignal = "schedule" | "purchase" | "capture_lead" | "schedule_appointment" | "escalate" | null;

// Keyword sets
const SCHEDULE_KEYWORDS = ["schedule", "call", "meeting", "book", "calendar", "talk to someone", "deep dive", "appointment", "demo", "consult"];
const PURCHASE_KEYWORDS = ["ready to start", "sign up", "buy", "purchase", "subscribe", "get started", "let's do it", "i'm in", "take my money", "start now", "checkout", "generating your"];
const HANDOFF_KEYWORDS = ["execute the roi bridge", "roi bridge", "mark,", "mark ", "over to mark", "hand it to mark", "bring in mark", "let me bring", "verify the loss", "take the lead", "mark take over", "mark take it from here"];
const DATA_POINT_PATTERNS = [/\d+%/, /\$[\d,]+/, /\d+x/, /\d+ hours?/, /\d+ days?/, /save[ds]? /, /increase[ds]? /, /reduce[ds]? /, /ROI/i, /revenue/i, /conversion/i, /benchmark/i, /throughput/i, /leaking/i];

// Generate grounded system instructions from the cloning factory
const DEFAULT_TEAM = createDefaultTeam();

// Import AgentClone type
import { AgentClone } from "@/clones/agent-factory";

export class VoiceOrchestrator {
    private ws: WebSocket | null = null;
    public audioContext: AudioContext | null = null;   // 24kHz — Gemini OUTPUT playback
    private micContext: AudioContext | null = null;    // 16kHz — Gemini INPUT capture
    public analyser: AnalyserNode | null = null;
    private stream: MediaStream | null = null;
    private videoInterval: NodeJS.Timeout | null = null;
    private heartbeatInterval: NodeJS.Timeout | null = null;
    private microphone: MediaStreamAudioSourceNode | null = null;
    private workletNode: AudioWorkletNode | null = null;

    // Playback
    private nextPlayTime: number = 0;
    private playbackQueue: AudioBufferSourceNode[] = [];

    // Conversation
    private conversationNotes: string[] = [];
    private modelTurnCount: number = 0;

    // ── Agentic Engine ──
    private sessionId: string;
    private sessionStartTime: number = Date.now();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public lastAuditResult: any = null; // Stores the most recent audit for Mark's handoff context
    private reconnectCount = 0;
    private maxReconnectAttempts = 3;
    private isReconnecting = false;
    private currentStatus: ConnectionStatus = "idle";
    public useVision: boolean = false; // Project Astro — OFF by default, camera requests block mic on mobile
    private videoElement: HTMLVideoElement | null = null;

    // Callbacks
    public onSpeakerChange?: (speaker: "alpha" | "beta") => void;
    public onStatusChange?: (status: ConnectionStatus, detail?: string) => void;
    public onIntentDetected?: (intent: IntentSignal, context?: string) => void;
    public onHandoff?: (from: string, to: string) => void;
    public onDataPoint?: (text: string) => void;
    public onAuditRequested?: (url: string) => void;
    public onStitchRequested?: (prompt: string) => void;
    public onAuditResult?: (result: Record<string, unknown>) => void;
    public onCheckoutTriggered?: (url: string) => void;
    public onTranscriptUpdate?: (entry: { speaker: string; agentName?: string; content: string; timestamp: string }) => void;
    // ★ NANA BANANA 2: Fires whenever IronClaw or an agent triggers a neuro-visual
    public onVisualReady?: (payload: {
        imageDataUrl: string;
        brainLayer: string;
        neuroReason: string;
        topic: string;
        businessName?: string;
        industryStats?: string;
    }) => void;

    constructor(
        private apiKey: string,
        private customAgents?: AgentClone[],
        private language: "en" | "es" = "en",
        public sharedAudioContext: AudioContext | null = null,
        public sharedStream: MediaStream | null = null
    ) {
        // Generate unique session ID
        this.sessionId = `session-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 7)}`;

        // Inherit shared resources if provided
        if (sharedAudioContext) {
            this.audioContext = sharedAudioContext;
            this.analyser = this.audioContext.createAnalyser();
            this.analyser.fftSize = 256;
            this.analyser.smoothingTimeConstant = 0.7;
            this.analyser.connect(this.audioContext.destination);
        }
        if (sharedStream) {
            this.stream = sharedStream;
        }
    }

    private setStatus(status: ConnectionStatus, detail?: string) {
        this.currentStatus = status;
        console.log(`[VoiceOrchestrator] Status: ${status}${detail ? ' — ' + detail : ''}`);
        this.onStatusChange?.(status, detail);
    }

    getConversationNotes(): string {
        return this.conversationNotes.slice(-20).join(" | ");
    }

    async connect() {
        if (!this.apiKey) {
            this.setStatus("error", "API key is missing");
            return;
        }

        // ── AGENTIC: Initialize memory, observability, and TRANSCRIPT for this session ──
        const agentName = this.customAgents?.[0]?.name || "Jenny";
        createMemory(this.sessionId, agentName);
        startSession(this.sessionId, agentName);
        createTranscript(this.sessionId, agentName);
        logAuditEntry({
            sessionId: this.sessionId,
            agentName,
            eventType: "session_start",
            content: `Voice session started with ${agentName} (Enabled: Gemini Live + Project Astro + Project Genie)`,
        });
        console.log(`[VoiceOrchestrator] 🧠 Agentic session initialized: ${this.sessionId}`);
        console.log(`[VoiceOrchestrator] 📝 Transcript recording started for session: ${this.sessionId}`);

        // ★ VISUAL JENNY: Notify session start
        VisualBridge.emitConversationEvent({
            type: "session_start",
            data: { agentName },
            timestamp: Date.now(),
            sessionId: this.sessionId,
            agentName,
        });

        if (this.audioContext) {
            console.log("[VoiceOrchestrator] Using shared AudioContext.");
            await this.audioContext.resume();
        } else {
            console.log("[VoiceOrchestrator] Creating fresh AudioContext...");
            try {
                // ★ PLAYBACK context: 24kHz to match Gemini Live native audio output
                this.audioContext = new AudioContext({ sampleRate: 24000 });
                this.analyser = this.audioContext.createAnalyser();
                this.analyser.fftSize = 256;
                this.analyser.smoothingTimeConstant = 0.7;
                this.analyser.connect(this.audioContext.destination);
                await this.audioContext.resume();

                // ★ MIC context: 16kHz to match what Gemini Live expects for input audio
                this.micContext = new AudioContext({ sampleRate: 16000 });
                await this.micContext.resume();

                console.log("[VoiceOrchestrator] ✅ Dual AudioContext ready: 24kHz playback + 16kHz mic");
            } catch (err) {
                this.setStatus("error", "AudioContext failed: " + String(err));
                return;
            }
        }

        this.setStatus("connecting", "Opening WebSocket to Gemini...");

        // ★ STABILITY LOCK: v1beta — canonical endpoint for raw WebSocket BidiGenerateContent
        // Note: enableAffectiveDialog is an SDK-only abstraction, NOT a raw WebSocket field.
        // For emotional expressiveness, use system instructions + native-audio model.
        const url = `wss://generativelanguage.googleapis.com/ws/google.ai.generativelanguage.v1beta.GenerativeService.BidiGenerateContent?key=${this.apiKey}`;

        const activeAgents = this.customAgents || DEFAULT_TEAM;
        const activeSystemInstruction = generateSystemInstruction(activeAgents, this.language);

        return new Promise<void>((resolve, reject) => {
            this.ws = new WebSocket(url);

            this.ws.onopen = () => {
                this.setStatus("connecting", "WebSocket open, sending setup...");

                // ★ CRITICAL FIX: Setup message MUST use camelCase.
                // The Gemini Live v1alpha/v1beta BidiGenerateContent endpoint
                // requires camelCase for the setup envelope. Using snake_case
                // causes Code 1007 (Invalid JSON payload) and kills the session.
                //
                // Streaming messages (realtime_input, client_content, tool_response)
                // MUST use snake_case — the opposite rule.
                const setupMessage = {
                    setup: {
                        model: "models/gemini-2.5-flash-native-audio-preview-12-2025",
                        generationConfig: {
                            responseModalities: ["AUDIO"],
                            speechConfig: {
                                voiceConfig: {
                                    prebuiltVoiceConfig: {
                                        voiceName: activeAgents[0].voice
                                    }
                                }
                            },
                            temperature: 1.0,
                        },
                        realtimeInputConfig: {
                            automaticActivityDetection: {
                                startOfSpeechSensitivity: "START_SENSITIVITY_HIGH",
                                endOfSpeechSensitivity: "END_SENSITIVITY_HIGH",
                                prefixPaddingMs: 100,
                                silenceDurationMs: 250
                            },
                        },
                        systemInstruction: {
                            parts: [{
                                text: `${activeSystemInstruction}

━━━ NAME GROUNDING ━━━
NEVER invent, assume, or use a placeholder name (Alex, John, Jane, etc.).
Only use a name the person explicitly told you during this call.
If they provide their name, ALWAYS repeat it back to confirm: "Nice to meet you, [NAME]. I've got that down."
If you didn't clearly hear it, ask naturally in one beat: "Sorry — was that [NAME]?"
If they correct you, use the corrected name and keep moving immediately.

━━━ AUDIT GROUNDING — ABSOLUTE RULES ━━━
You CANNOT see the user's website. You do NOT have vision.
You ONLY know what the business_audit tool tells you. Nothing more.

When reporting audit findings:
1. ONLY mention things the tool explicitly returned with a real value.
2. If contentHasTestimonials is false → say "I'm not seeing testimonials on your site."
3. If a score is 0 or a field is empty/false → report it as a gap, not a feature.
4. NEVER invent or assume positive attributes. If you didn't get it from the tool, don't say it.
5. Be specific: quote the actual load time, actual score, actual issues the tool returned.
6. If the audit hasn't completed yet, say "Still pulling up your site..." — do NOT guess.

BAD (hallucination): "I can see you have a great testimonials section!"
GOOD (grounded): "I'm not seeing any testimonials or reviews on your site — that's a trust gap."

BAD (hallucination): "Your site looks great overall!"
GOOD (grounded): "Your site speed score came back at [X] — that's in the [slow/fast] range."

PROJECT GENIE ENABLED: You are an autonomous proactive architect.
- If audit data shows a revenue leak, call it out with REAL numbers from the tool.
- You have the 'BioDynamX Engineering Suite' at your disposal:
    1. 📊 ROI CALC: Quantifies exactly how much revenue is leaking.
    2. 💬 REVENUE RECOVERY ENGINE: Multi-channel CRM/SMS/Email automation.
- Your mission is to sell the 'Growth Engine' ($497/mo) or 'Enterprise Suite' ($2,497/mo).

━━━ TOOL FAILURE PROTOCOL ━━━
If a tool returns an error, an empty result, or doesn't return fast enough:
1. DO NOT manufacture or guess the results.
2. Tell the user: "I'm still pulling those specific numbers up — give me one more second."
3. Ask for the information directly if it seems the tool isn't getting it (e.g., "What was that website URL one more time?").
Specificity and accuracy are more important than speed. Hallucinations destroy trust and are forbidden.`
                                    // ★ Strip ALL bracketed stage directions so the model can NEVER read them aloud.
                                    // Keeps [Name] [X] [Y] [Z] placeholder tokens intact.
                                    .replace(/\[(Pause|2s Pause|WAIT|Wait|Soft giggle|soft giggle|Knowing giggle|knowing giggle|warm giggle|giggle|Build anticipation|Running audit|watching|laughs warmly|warm laugh|Warm, knowing giggle)\]/gi, "")
                                    .replace(/[ \t]*\n[ \t]*\n[ \t]*\n/g, "\n\n")
                            }]
                        },
                        tools: [
                            {
                                functionDeclarations: [
                                    {
                                        name: "business_audit",
                                        description: "Runs a comprehensive business audit on a website URL. Analyzes site speed, mobile responsiveness, identifies competitors, calculates tech debt, and estimates leaking revenue with ROI projections. Call this when a visitor provides their website URL or company name.",
                                        parameters: {
                                            type: "OBJECT",
                                            properties: {
                                                url: {
                                                    type: "STRING",
                                                    description: "The website URL or domain to audit (e.g., 'example.com' or 'https://example.com')"
                                                }
                                            },
                                            required: ["url"]
                                        }
                                    },
                                    {
                                        name: "stitch_design",
                                        description: "Generates a high-fidelity UI design mockup using Google Stitch. Use this to show the prospect what their legacy site could look like after our neuro-optimization. Say 'I'm stitching together a vision for your new platform...' before calling this.",
                                        parameters: {
                                            type: "OBJECT",
                                            properties: {
                                                prompt: { type: "STRING", description: "The design description (e.g., 'Modern medical landing page with high trust signals')" }
                                            },
                                            required: ["prompt"]
                                        }
                                    },
                                    {
                                        name: "create_checkout",
                                        description: "Creates a Stripe checkout session for the BioDynamX Engineering Suite. Growth Engine is $497/month, Enterprise is $2,497/month. Call this when the prospect is ready to purchase. Mark should say 'I'm generating your secure checkout link now' before calling this tool.",
                                        parameters: {
                                            type: "OBJECT",
                                            properties: {
                                                product: {
                                                    type: "STRING",
                                                    description: "Product name, defaults to 'BioDynamX ROI Acceleration'"
                                                }
                                            }
                                        }
                                    },
                                    {
                                        name: "capture_lead",
                                        description: "Capture prospect contact information when they share their name, email, phone, or company. Call this proactively whenever the prospect mentions any identifying details.",
                                        parameters: {
                                            type: "OBJECT",
                                            properties: {
                                                name: { type: "STRING", description: "Prospect's full name" },
                                                email: { type: "STRING", description: "Prospect's email address" },
                                                phone: { type: "STRING", description: "Prospect's phone number" },
                                                company: { type: "STRING", description: "Prospect's company name" },
                                                industry: { type: "STRING", description: "Prospect's industry" }
                                            },
                                            required: ["name"]
                                        }
                                    },
                                    {
                                        name: "schedule_appointment",
                                        description: "Schedule a follow-up appointment or demo call via Calendly. Call this when the prospect wants to book a deeper consultation or talk to the human team. Always offer this as an option.",
                                        parameters: {
                                            type: "OBJECT",
                                            properties: {
                                                prospectName: { type: "STRING", description: "Who to schedule for" },
                                                purpose: { type: "STRING", description: "Purpose: demo, consultation, onboarding, or technical_review" }
                                            },
                                            required: ["purpose"]
                                        }
                                    },
                                    {
                                        name: "escalate_to_human",
                                        description: "Escalate the conversation to a human team member. Use when the prospect explicitly asks to speak with a human, when dealing with legal/medical questions, enterprise deals over $5,000, or when you cannot resolve their concern after 2 attempts.",
                                        parameters: {
                                            type: "OBJECT",
                                            properties: {
                                                reason: { type: "STRING", description: "Why: prospect_request, complex_question, legal_matter, enterprise_deal, complaint, technical_issue" },
                                                summary: { type: "STRING", description: "Brief summary for the human agent" }
                                            },
                                            required: ["reason", "summary"]
                                        }
                                    },
                                    {
                                        name: "draft_social_media_post",
                                        description: "Drafts and posts social media text, emails, or SMS for the 'Nana Banna' brand. Use this whenever the user wants to send a promotional message or update.",
                                        parameters: {
                                            type: "OBJECT",
                                            properties: {
                                                type: { type: "STRING", description: "Type of content: 'post', 'email', or 'sms'" },
                                                topic: { type: "STRING", description: "The core message or topic to discuss" },
                                                platform: { type: "STRING", description: "Which platform to post to (instagram, facebook, twitter, linkedin) or 'all' if posting" }
                                            },
                                            required: ["type", "topic"]
                                        }
                                    },
                                    {
                                        name: "auto_respond_social_message",
                                        description: "Automatically generates a response to a customer message sent to the 'Nana Banna' social media pages.",
                                        parameters: {
                                            type: "OBJECT",
                                            properties: {
                                                message: { type: "STRING", description: "The message sent by the customer" },
                                                platform: { type: "STRING", description: "Platform where the message was received (instagram, facebook, twitter, linkedin)" }
                                            },
                                            required: ["message", "platform"]
                                        }
                                    },
                                    {
                                        name: "competitor_intel",
                                        description: "Runs real-time competitive analysis using Google Search. Finds the prospect's top 3 competitors, their Google ratings, review counts, strengths, and estimates how much revenue competitors are stealing. Call this AFTER the business_audit to create urgency. Jenny should say 'Let me check who's competing for your customers right now...'",
                                        parameters: {
                                            type: "OBJECT",
                                            properties: {
                                                domain: { type: "STRING", description: "The prospect's domain (e.g., 'smilesbymike.com')" },
                                                industry: { type: "STRING", description: "The prospect's industry (e.g., 'dental', 'plumbing', 'law firm')" }
                                            },
                                            required: ["domain"]
                                        }
                                    },
                                    {
                                        name: "roi_calculator",
                                        description: "Generates a personalized ROI projection using real audit data. Breaks down revenue losses by category (missed calls, SEO gaps, slow site, digital ghosting, reputation) and shows exactly how much BioDynamX recovers, the ROI multiplier, and payback period in days. Mark should use this for the ROI Bridge close. Call AFTER the business_audit completes.",
                                        parameters: {
                                            type: "OBJECT",
                                            properties: {
                                                domain: { type: "STRING", description: "The prospect's domain" },
                                                industry: { type: "STRING", description: "Industry for context" },
                                                monthlyRevenue: { type: "NUMBER", description: "Prospect's stated monthly revenue if shared" },
                                                avgDealValue: { type: "NUMBER", description: "Average transaction value if known" }
                                            },
                                            required: ["domain"]
                                        }
                                    },
                                    {
                                        name: "generate_visual",
                                        description: "🧠 NANA BANANA 2 — Generates a neuroscience-engineered image in real-time that matches the current conversation phase. Call this at key moments: (1) After learning their industry to show industry-specific statistics [conversationPhase: 'reptilian'], (2) After building rapport to show the transformation vision [conversationPhase: 'limbic'], (3) After the audit reveal to show the ROI dashboard [conversationPhase: 'neocortex'], (4) During close to show the decision moment [conversationPhase: 'close']. Every image has a specific scientific purpose — never call this for decoration.",
                                        parameters: {
                                            type: "OBJECT",
                                            properties: {
                                                conversationPhase: {
                                                    type: "STRING",
                                                    description: "The Triune Brain phase this image targets: 'reptilian' (show threat/loss statistics), 'limbic' (show hope/transformation), 'neocortex' (show ROI data/proof), 'close' (show the decision moment)"
                                                },
                                                topic: {
                                                    type: "STRING",
                                                    description: "What you're currently discussing (e.g. 'missed calls', 'roi calculation', 'industry challenges', 'transformation vision')"
                                                },
                                                industry: {
                                                    type: "STRING",
                                                    description: "The prospect's industry (e.g. 'bookkeeping', 'dental', 'law firm', 'restaurant', 'real estate')"
                                                },
                                                businessName: {
                                                    type: "STRING",
                                                    description: "The prospect's business name for personalization"
                                                },
                                                prospectName: {
                                                    type: "STRING",
                                                    description: "The prospect's first name"
                                                }
                                            },
                                            required: ["conversationPhase", "topic"]
                                        }
                                    },
                                    {
                                        name: "generate_revenue_visual",
                                        description: "🧠 REVENUE CALCULATOR — The NLP gut-punch moment. Call this IMMEDIATELY after Jenny collects: (1) missed calls per week AND (2) average sale value. Generates an image with THEIR EXACT DOLLARS on screen. Specificity IS the weapon. Types: 'loss' = their money bleeding (use first, reptilian brain), 'roi' = $497 tiny vs their recovery enormous (use at close, neocortex), 'winback' = dormant revenue lighting up (use for win-back campaign).",
                                        parameters: {
                                            type: "OBJECT",
                                            properties: {
                                                missedCallsPerWeek: { type: "NUMBER", description: "How many calls they miss per week — collected from prospect" },
                                                avgSaleValue: { type: "NUMBER", description: "Average value of a new customer/patient/sale" },
                                                industry: { type: "STRING", description: "The prospect's industry (e.g. 'dental', 'law firm', 'restaurant')" },
                                                businessName: { type: "STRING", description: "The prospect's business name for personalization" },
                                                type: { type: "STRING", description: "loss | roi | winback" }
                                            },
                                            required: ["missedCallsPerWeek", "avgSaleValue", "type"]
                                        }
                                    },
                                    {
                                        name: "send_audit_report",
                                        description: "Sends the full diagnostic report to the prospect via SMS or email. Includes all scores, pain points, and recommended solutions. Call this when the prospect says they want a copy of the results, or proactively offer to send it. Say: 'I can text you a copy of this diagnostic right now — what's your number?'",
                                        parameters: {
                                            type: "OBJECT",
                                            properties: {
                                                phone: { type: "STRING", description: "Prospect's phone number to SMS the report to" },
                                                email: { type: "STRING", description: "Prospect's email to send the report to" },
                                                name: { type: "STRING", description: "Prospect's name for personalization" }
                                            }
                                        }
                                    }

                                ]
                            },
                            {
                                googleSearch: {}
                            }
                        ]
                    }
                };

                try {
                    this.ws?.send(JSON.stringify(setupMessage));
                    this.setStatus("setup_sent", "Waiting for server acknowledgment...");
                } catch (err) {
                    this.setStatus("error", "Failed to send setup: " + String(err));
                    reject(err);
                }
            };

            this.ws.onmessage = async (event) => {
                try {
                    let data: Record<string, unknown>;
                    if (typeof event.data === "string") {
                        data = JSON.parse(event.data);
                    } else if (event.data instanceof Blob) {
                        const text = await event.data.text();
                        data = JSON.parse(text);
                    } else {
                        data = JSON.parse(event.data);
                    }

                    if (data.setup_complete || data.setupComplete) {
                        this.setStatus("ready", "BioDynamX Live Online. Sensors active.");
                        this.startMedia();

                        // ★ HEARTBEAT: Prevent idle connection timeout
                        if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
                        this.heartbeatInterval = setInterval(() => {
                            if (this.ws?.readyState === WebSocket.OPEN) {
                                // Send empty media chunk as heartbeat
                                // Using snake_case for strict Vertex API compliance
                                this.ws.send(JSON.stringify({
                                    realtime_input: { media_chunks: [] }
                                }));
                            }
                        }, 3000); // Every 3 seconds — tight keepalive to prevent 1011

                        // ★ IRONCLAW: Initialize master session brain for ANY agent
                        const activeAgent = this.customAgents?.[0];
                        const agentName = activeAgent?.name || "Jenny";

                        try {
                            const { getIronclaw } = await import("./ironclaw-core");
                            const ironclaw = getIronclaw();
                            ironclaw.initSession(this.sessionId, agentName);
                            console.log(`[VoiceOrchestrator] 🧠 Ironclaw Intelligence Online for ${agentName}.`);

                            // ★ NANA BANANA 2 AUTONOMOUS HOOK:
                            // When IronClaw detects a phase transition, auto-fire the
                            // correct neuro-visual WITHOUT the agent needing to ask.
                            // This is the "agentic" part — the visual system watches the
                            // conversation and acts independently.
                            ironclaw.on("scene_change", (event) => {
                                const { newPhase, previousPhase } = event.data as { newPhase: string; previousPhase: string };
                                const session = ironclaw.getSession(this.sessionId);
                                if (!session) return;

                                // Map conversation phase → Triune Brain layer
                                const phaseToNeuroMap: Record<string, "reptilian" | "limbic" | "neocortex" | "close"> = {
                                    "greeting": "reptilian",   // Open the wound immediately
                                    "discovery": "reptilian",   // Show industry statistics = threat
                                    "rapport": "limbic",      // Build emotional connection
                                    "audit_reveal": "neocortex",   // Show the data/proof
                                    "solution": "limbic",      // Vision of the future
                                    "pricing": "neocortex",   // ROI math = permission to decide
                                    "objection_handling": "neocortex",   // More data to dissolve doubt
                                    "close_attempt": "close",       // The transformation moment
                                    "won": "close",       // Celebrate the decision
                                };

                                const conversationPhase = phaseToNeuroMap[newPhase] || "reptilian";

                                // ★ BRIDGE: Emit to VisualBridge so Visual Jenny can react too
                                VisualBridge.emitConversationEvent({
                                    type: "phase_change",
                                    sessionId: this.sessionId,
                                    data: {
                                        phase: newPhase,
                                        previousPhase,
                                        brainLayer: conversationPhase,
                                        industry: session.prospect.industry,
                                    },
                                    timestamp: Date.now(),
                                });

                                // Fire async — never blocks the voice stream
                                this.dispatchNeuroVisual({
                                    conversationPhase,
                                    industry: session.prospect.industry,
                                    businessName: session.prospect.businessName,
                                    prospectName: session.prospect.name,
                                    topic: newPhase,
                                    auditData: session.auditResult,
                                    reason: `IronClaw phase transition: ${newPhase} → ${conversationPhase} brain layer`,
                                });
                            });

                        } catch (err) {
                            console.warn("[VoiceOrchestrator] Ironclaw core init fail", err);
                        }

                        // ★ GREETING TRIGGER — Send the minimal cue that makes Jenny speak first.
                        // CRITICAL: The old approach put Jenny's own script as role="user" which
                        // caused role confusion: model spoke once then waited (thought it was the human).
                        // The correct approach: send a minimal user turn "(call connected)" so Gemini
                        // knows the conversation has started. Jenny's system instruction governs exactly
                        // what she says — we don't need to script it here.
                        this.ws?.send(JSON.stringify({
                            client_content: {
                                turns: [{
                                    role: "user",
                                    parts: [{ text: "(call connected)" }],
                                }],
                                turn_complete: true
                            }
                        }));

                        resolve();
                        return;
                    }

                    this.handleMessage(data);
                } catch (err) {
                    console.error("[VoiceOrchestrator] Failed to parse message:", err);
                }
            };

            this.ws.onerror = (event) => {
                console.error("[VoiceOrchestrator] WebSocket error:", event);
                this.setStatus("error", "WebSocket error — check API key and network");
                reject(new Error("WebSocket connection error"));
            };

            this.ws.onclose = (event) => {
                console.log(`[VoiceOrchestrator] WebSocket closed: code=${event.code} reason="${event.reason}"`);
                if (this.videoInterval) clearInterval(this.videoInterval);
                if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);

                // ★ MONITORING: Fire-and-forget beacon on any error close
                if (event.code !== 1000 && typeof navigator !== "undefined" && navigator.sendBeacon) {
                    const payload = JSON.stringify({
                        agentId: activeAgents[0]?.id ?? "unknown",
                        agentName: activeAgents[0]?.name ?? "unknown",
                        closeCode: event.code,
                        closeReason: event.reason,
                        sessionDurationMs: this.sessionStartTime ? Date.now() - this.sessionStartTime : 0,
                    });
                    navigator.sendBeacon("/api/monitor/agent-event", new Blob([payload], { type: "application/json" }));
                }

                // Recoverable server-side errors — auto-reconnect
                const recoverableCodes = [1006, 1011, 1013]; // Abnormal, Server Error, Try Again
                if (recoverableCodes.includes(event.code) && this.reconnectCount < this.maxReconnectAttempts && !this.isReconnecting) {
                    console.warn(`[VoiceOrchestrator] ⚡ Recoverable close (${event.code}). Auto-reconnecting...`);
                    this.setStatus("connecting", `Reconnecting... (attempt ${this.reconnectCount + 1}/${this.maxReconnectAttempts})`);
                    this.handleReconnect();
                } else if (event.code !== 1000) {
                    this.setStatus("error", `Connection closed (code ${event.code}): ${event.reason || "Unknown reason."}`);
                }
            };


            setTimeout(() => {
                if (this.ws?.readyState === WebSocket.CONNECTING) {
                    this.setStatus("error", "Connection timed out after 10 seconds");
                    this.ws.close();
                    reject(new Error("Connection timeout"));
                }
            }, 10000);
        });
    }

    private async startMedia() {
        if (!this.audioContext) return;

        // ★ Resume AudioContext again after user gesture
        if (this.audioContext.state === "suspended") {
            await this.audioContext.resume();
        }

        if (this.stream) {
            console.log("[VoiceOrchestrator] Using shared MediaStream.");
        } else {
            console.log("[VoiceOrchestrator] Requesting mic (audio-only)...");
            try {
                // AUDIO ONLY — camera causes getUserMedia to block/fail on mobile & many desktops.
                // Vision can be re-enabled per-session once mic is confirmed working.
                this.stream = await navigator.mediaDevices.getUserMedia({
                    audio: {
                        channelCount: 1,
                        echoCancellation: true,
                        noiseSuppression: true,
                        // ★ VERTEX BEST PRACTICE: Enable AGC.
                        // With HIGH VAD sensitivity, we want a well-gained signal.
                        // The model's internal VAD is now smart enough to filter noise.
                        autoGainControl: true,
                        sampleRate: 16000,
                    },
                    video: false,   // NEVER request camera here — breaks mic on iOS/mobile
                });
                console.log("[VoiceOrchestrator] ✅ Mic stream acquired.");
            } catch (err: unknown) {
                console.error("[VoiceOrchestrator] getUserMedia failed:", err);
                this.setStatus("error", "Microphone access failed. Please allow microphone and retry.");
                throw err;
            }
        }

        try {
            // --- AUDIO PIPELINE ---
            // Strategy: Try AudioWorklet first (modern, efficient). Fall back to
            // ScriptProcessorNode if worklet fails (iOS, older Chrome, some Android).
            if (!this.micContext) {
                this.micContext = new AudioContext({ sampleRate: 16000 });
                await this.micContext.resume();
            } else if (this.micContext.state === "suspended") {
                await this.micContext.resume();
            }

            this.microphone = this.micContext.createMediaStreamSource(this.stream);

            let workletLoaded = false;
            try {
                await this.micContext.audioWorklet.addModule('/audio-processor.js');
                this.workletNode = new AudioWorkletNode(this.micContext, 'audio-processor');
                this.workletNode.port.onmessage = (event) => {
                    const float32Array: Float32Array = event.data;
                    if (this.ws?.readyState === WebSocket.OPEN) {
                        const base64 = this.float32ToPCM16Base64(float32Array);
                        this.ws.send(JSON.stringify({
                            realtime_input: { media_chunks: [{ mime_type: "audio/pcm;rate=16000", data: base64 }] }
                        }));
                    }
                };
                this.microphone.connect(this.workletNode);
                workletLoaded = true;
                console.log("[VoiceOrchestrator] ✅ AudioWorklet pipeline active.");
            } catch (workletErr) {
                console.warn("[VoiceOrchestrator] AudioWorklet failed, using ScriptProcessor fallback:", workletErr);
            }

            if (!workletLoaded) {
                // ScriptProcessorNode — deprecated but universally supported (iOS Safari, older Android)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const scriptProcessor = (this.micContext as unknown as any).createScriptProcessor(4096, 1, 1) as ScriptProcessorNode;
                scriptProcessor.onaudioprocess = (e: AudioProcessingEvent) => {
                    if (this.ws?.readyState !== WebSocket.OPEN) return;
                    const float32Array = e.inputBuffer.getChannelData(0);
                    const base64 = this.float32ToPCM16Base64(float32Array);
                    this.ws.send(JSON.stringify({
                        realtime_input: { media_chunks: [{ mime_type: "audio/pcm;rate=16000", data: base64 }] }
                    }));
                };
                this.microphone.connect(scriptProcessor);
                scriptProcessor.connect(this.micContext.destination);
                console.log("[VoiceOrchestrator] ✅ ScriptProcessor fallback active.");
            }

            this.setStatus("ready", "BioDynamX Live Online. Speak now.");
        } catch (err: unknown) {
            const errName = (err as Error)?.name || "";
            if (errName === 'NotAllowedError' || String(err).includes('NotAllowedError')) {
                this.setStatus("error", "Microphone permission denied. Click the lock icon in your browser and allow microphone access.");
            } else {
                this.setStatus("error", "Media failed: " + String(err));
            }
        }
    }

    private currentSpeaker: "alpha" | "beta" = "alpha";

    private handleMessage(data: Record<string, unknown>) {
        if (!this.audioContext) return;

        // ★ Ensure AudioContext is running before playing audio
        if (this.audioContext.state === "suspended") {
            this.audioContext.resume();
        }

        // --- Handle Tool Calls (Function Calling) ---
        const toolCall = (data.tool_call || data.toolCall) as Record<string, unknown> | undefined;
        if (toolCall) {
            const functionCalls = (toolCall.function_calls || toolCall.functionCalls) as Array<Record<string, unknown>> | undefined;
            if (functionCalls) {
                for (const fc of functionCalls) {
                    const callId = fc.id as string;
                    const toolStartTime = Date.now();

                    if (fc.name === "business_audit") {
                        const args = fc.args as Record<string, string>;
                        console.log(`[VoiceOrchestrator] 🔍 Agent requested audit for: ${args.url}`);
                        this.onAuditRequested?.(args.url);
                        this.executeAudit(args.url, callId);
                    } else if (fc.name === "create_checkout") {
                        console.log("[VoiceOrchestrator] 💳 Agent triggered checkout!");
                        this.executeCheckout(callId);
                    } else if (fc.name === "capture_lead") {
                        const args = fc.args as Record<string, string>;
                        console.log(`[VoiceOrchestrator] 📋 Capturing lead: ${args.name}`);
                        this.executeCaptureLead(args, callId);
                    } else if (fc.name === "schedule_appointment") {
                        const args = fc.args as Record<string, string>;
                        console.log(`[VoiceOrchestrator] 📅 Scheduling appointment: ${args.purpose}`);
                        this.executeScheduleAppointment(args, callId);
                    } else if (fc.name === "escalate_to_human") {
                        const args = fc.args as Record<string, string>;
                        console.log(`[VoiceOrchestrator] 🚨 Escalating to human: ${args.reason}`);
                        this.executeEscalation(args, callId);
                    } else if (fc.name === "draft_social_media_post") {
                        const args = fc.args as Record<string, string>;
                        console.log(`[VoiceOrchestrator] 📱 Drafting social media/email update: ${args.type}`);
                        this.executeDraftSocialMediaPost(args, callId);
                    } else if (fc.name === "auto_respond_social_message") {
                        const args = fc.args as Record<string, string>;
                        console.log(`[VoiceOrchestrator] 💬 Auto-responding to message on: ${args.platform}`);
                        this.executeAutoRespondSocialMessage(args, callId);
                    } else if (fc.name === "competitor_intel") {
                        const args = fc.args as Record<string, string>;
                        console.log(`[VoiceOrchestrator] 🎯 Running competitor intel for: ${args.domain}`);
                        this.executeCompetitorIntel(args, callId);
                    } else if (fc.name === "roi_calculator") {
                        const args = fc.args as Record<string, unknown>;
                        console.log(`[VoiceOrchestrator] 📊 Calculating ROI for: ${args.domain}`);
                        this.executeROICalculator(args, callId);
                    } else if (fc.name === "send_audit_report") {
                        const args = fc.args as Record<string, string>;
                        console.log(`[VoiceOrchestrator] 📨 Sending audit report to: ${args.phone || args.email}`);
                        this.executeSendReport(args, callId);
                    } else if (fc.name === "stitch_design") {
                        const args = fc.args as Record<string, string>;
                        console.log(`[VoiceOrchestrator] 🎨 Agent requested Stitch design: ${args.prompt}`);
                        this.executeStitchDesign(args, callId);
                    } else if (fc.name === "generate_visual") {
                        // ★ NANA BANANA 2 — Neuroscience visual triggered by agent
                        const args = fc.args as Record<string, string>;
                        console.log(`[VoiceOrchestrator] 🧠 Nana Banana 2 triggered: phase=${args.conversationPhase} | industry=${args.industry} | topic=${args.topic}`);
                        // Wrap in async IIFE so we can await the dynamic import without blocking
                        void (async () => {
                            try {
                                const { getIronclaw } = await import("./ironclaw-core");
                                const ironclaw = getIronclaw();
                                const session = ironclaw.getSession(this.sessionId);
                                this.dispatchNeuroVisual({
                                    conversationPhase: (args.conversationPhase as "reptilian" | "limbic" | "neocortex" | "close") || "reptilian",
                                    topic: args.topic || "discovery",
                                    industry: args.industry || session?.prospect?.industry,
                                    businessName: args.businessName || session?.prospect?.businessName,
                                    prospectName: args.prospectName || session?.prospect?.name,
                                    auditData: session?.auditResult,
                                    reason: `Agent-triggered: ${args.topic}`,
                                });
                                ironclaw.recordVisualChange(this.sessionId, `${args.conversationPhase}_${args.topic}`);
                            } catch {
                                this.dispatchNeuroVisual({
                                    conversationPhase: (args.conversationPhase as "reptilian" | "limbic" | "neocortex" | "close") || "reptilian",
                                    topic: args.topic,
                                    industry: args.industry,
                                    businessName: args.businessName,
                                    prospectName: args.prospectName,
                                    reason: `Agent-triggered (no IronClaw): ${args.topic}`,
                                });
                            }
                        })();
                        // Respond immediately so agent doesn’t hang waiting on image
                        this.ws?.send(JSON.stringify({
                            tool_response: {
                                function_responses: [{
                                    id: callId,
                                    name: "generate_visual",
                                    response: { output: `Visual generating — brain layer: ${args.conversationPhase}. Industry: ${args.industry || "detected"}. Will appear on screen momentarily.` }
                                }]
                            }
                        }));
                    } else if (fc.name === "generate_revenue_visual") {
                        // ★ REVENUE CALCULATOR VISUAL — Personalized NLP gut-punch
                        const args = fc.args as Record<string, unknown>;
                        const missedCallsPerWeek = Number(args.missedCallsPerWeek) || 15;
                        const avgSaleValue = Number(args.avgSaleValue) || 500;
                        const industry = String(args.industry || "general");
                        const businessName = args.businessName ? String(args.businessName) : undefined;
                        const visualType = String(args.type || "loss") as "loss" | "roi" | "winback";

                        console.log(`[VoiceOrchestrator] 💰 Revenue visual: ${missedCallsPerWeek} calls/wk × $${avgSaleValue} = ${visualType}`);

                        void (async () => {
                            try {
                                const baseUrl = typeof window !== "undefined" ? window.location.origin : (process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000");
                                const res = await fetch(`${baseUrl}/api/generate-revenue-visual`, {
                                    method: "POST",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ missedCallsPerWeek, avgSaleValue, industry, businessName, type: visualType }),
                                });
                                const data = await res.json() as {
                                    success: boolean;
                                    imageBase64?: string;
                                    calc?: { formattedLoss: string; formattedRecovery: string; formattedROI: string; daysToBeProfitable: number };
                                    jennyLine?: string;
                                };

                                if (data.success && data.imageBase64) {
                                    // Push the personalized image to the visual panel
                                    window.dispatchEvent(new CustomEvent("nana-banana-visual", {
                                        detail: {
                                            imageUrl: data.imageBase64,
                                            caption: visualType === "roi"
                                                ? `Your ${data.calc?.formattedROI ?? ""} ROI — Month 1`
                                                : `${data.calc?.formattedLoss ?? ""} leaving every month`,
                                            phase: visualType === "roi" ? "neocortex" : "reptilian",
                                            source: "revenue_calculator",
                                        }
                                    }));
                                    console.log(`[RevenueVisual] ✅ Personalized ${visualType} image dispatched`);
                                }
                            } catch (err) {
                                console.error("[RevenueVisual] Failed:", err);
                            }
                        })();

                        // Respond immediately — don't block the voice conversation
                        this.ws?.send(JSON.stringify({
                            tool_response: {
                                function_responses: [{
                                    id: callId,
                                    name: "generate_revenue_visual",
                                    response: { output: `Revenue visual generating — calculating their specific numbers. Image will appear on screen. Their monthly loss is computing now.` }
                                }]
                            }
                        }));
                    }

                    // Record tool call for observability
                    recordToolCall(this.sessionId, fc.name as string, Date.now() - toolStartTime, true);
                    // 📝 Record tool call in transcript
                    recordToolCallInTranscript(
                        this.sessionId,
                        this.customAgents?.[0]?.name || "Jenny",
                        fc.name as string,
                        (fc.args as Record<string, unknown>) || {}
                    );
                }
            }
            return;
        }

        // --- Handle Content ---
        const serverContent = (data.server_content || data.serverContent) as Record<string, unknown> | undefined;
        if (serverContent) {
            const modelTurn = (serverContent.model_turn || serverContent.modelTurn) as Record<string, unknown> | undefined;
            if (modelTurn) {
                const parts = modelTurn.parts as Array<Record<string, unknown>> | undefined;
                if (!parts) return;

                for (const part of parts) {
                    if (part.text) {
                        const text = part.text as string;

                        // ── AGENTIC: Process outgoing agent message through safety pipeline ──
                        const agentName = this.customAgents?.[0]?.name || "Jenny";
                        const processed = processOutgoingMessage(text, this.sessionId, agentName);
                        if (!processed.safetyResult.safe && processed.safetyResult.action === "block") {
                            console.warn(`[VoiceOrchestrator] ⛔ Agent output BLOCKED by safety layer`);
                            continue; // Skip this message
                        }

                        // ── AGENTIC: Update memory with agent response ──
                        const memory = getMemory(this.sessionId);
                        if (memory) {
                            recordTurn(this.sessionId, memory.commitmentLevel);
                        }

                        // Speaker detection — Journey maps to "alpha", Mark maps to "beta"
                        if (text.includes("[Journey]") || text.includes("[journey]") || text.includes("[Jenny]") || text.includes("[jenny]")) {
                            this.currentSpeaker = "alpha";
                            this.onSpeakerChange?.("alpha");
                        } else if (text.includes("[Mark]") || text.includes("[mark]")) {
                            this.currentSpeaker = "beta";
                            this.onSpeakerChange?.("beta");
                        }

                        this.conversationNotes.push(text);

                        // ── 📝 TRANSCRIPT: Record agent speech ──
                        recordAgentSpeech(this.sessionId, agentName, text);
                        this.onTranscriptUpdate?.({
                            speaker: "agent",
                            agentName,
                            content: text,
                            timestamp: new Date().toISOString(),
                        });

                        // ★ VISUAL JENNY: Agent speech event
                        VisualBridge.emitConversationEvent({
                            type: "agent_speech",
                            data: { text, agentName },
                            timestamp: Date.now(),
                            sessionId: this.sessionId,
                            agentName,
                        });

                        const lowerText = text.toLowerCase();

                        // Handoff detection
                        for (const kw of HANDOFF_KEYWORDS) {
                            if (lowerText.includes(kw)) {
                                console.log("[VoiceOrchestrator] HANDOFF KEYWORD DETECTED. Emitting handoff.")
                                const from = this.customAgents?.[0]?.name || "Jenny";
                                const to = from === "Jenny" ? "Mark" : "Jenny";
                                this.onHandoff?.(from, to);
                                recordHandoff(this.sessionId, to);
                                recordHandoffInTranscript(this.sessionId, from, to);

                                // ★ VISUAL JENNY: Handoff event
                                VisualBridge.emitConversationEvent({
                                    type: "handoff",
                                    data: { from, to },
                                    timestamp: Date.now(),
                                    sessionId: this.sessionId,
                                    agentName: from,
                                });
                                break;
                            }
                        }

                        // Data point detection
                        for (const pattern of DATA_POINT_PATTERNS) {
                            if (pattern.test(text)) {
                                const sentences = text.split(/[.!?]+/).filter(s => pattern.test(s));
                                if (sentences.length > 0) {
                                    const dp = sentences[0].trim().replace(/^\[(Journey|Mark|Jenny)\]\s*/i, "");
                                    this.onDataPoint?.(dp);

                                    // ★ VISUAL JENNY: Data point event
                                    VisualBridge.emitConversationEvent({
                                        type: "data_point",
                                        data: { text: dp },
                                        timestamp: Date.now(),
                                        sessionId: this.sessionId,
                                    });
                                }
                                break;
                            }
                        }

                        // Intent detection
                        for (const kw of SCHEDULE_KEYWORDS) {
                            if (lowerText.includes(kw)) {
                                this.onIntentDetected?.("schedule", text);
                                break;
                            }
                        }
                        for (const kw of PURCHASE_KEYWORDS) {
                            if (lowerText.includes(kw)) {
                                this.onIntentDetected?.("purchase", text);
                                break;
                            }
                        }
                    }

                    const inlineData = (part.inline_data || part.inlineData) as any;
                    if (inlineData?.data) {
                        if (this.modelTurnCount === 0) {
                            console.log(`[VoiceOrchestrator] 🔊 First audio chunk received (${(inlineData.data as string).length} chars). Playing...`);
                        }
                        this.playAudioChunk(inlineData.data as string);
                    }
                }
            }

            if (serverContent.interrupted) {
                this.clearPlaybackQueue();
            }

            // ── 📝 TRANSCRIPT: Capture user speech transcription from Gemini ──
            const inputTranscription = (serverContent.input_transcription || serverContent.inputTranscription) as Record<string, unknown> | undefined;
            if (inputTranscription?.text) {
                const userText = inputTranscription.text as string;
                if (userText.trim()) {
                    recordProspectSpeech(this.sessionId, userText.trim());
                    this.onTranscriptUpdate?.({
                        speaker: "prospect",
                        content: userText.trim(),
                        timestamp: new Date().toISOString(),
                    });
                    console.log(`[VoiceOrchestrator] 📝 Prospect said: "${userText.trim().slice(0, 100)}..."`);

                    // ★ VISUAL JENNY: Prospect speech event
                    VisualBridge.emitConversationEvent({
                        type: "prospect_speech",
                        data: { text: userText.trim() },
                        timestamp: Date.now(),
                        sessionId: this.sessionId,
                    });
                }
            }

            // Turn-complete detection
            if (serverContent.turn_complete || serverContent.turnComplete) {
                this.modelTurnCount++;
                console.log(`[VoiceOrchestrator] Model turn #${this.modelTurnCount} complete.`);
            }
        }
    }

    private async executeAudit(url: string, callId: string) {
        // ★ Keep-alive: Send silent audio chunks to prevent WebSocket inactivity timeout
        // The audit can take 15-30+ seconds (19 probes), during which no audio flows.
        // Without this, Gemini's WebSocket drops the connection.
        const keepAliveInterval = setInterval(() => {
            if (this.ws?.readyState === WebSocket.OPEN) {
                // Send a tiny silent PCM16 audio chunk (160 samples of silence = 10ms at 16kHz)
                const silence = new Float32Array(160); // all zeros = silence
                const base64 = this.float32ToPCM16Base64(silence);
                this.ws.send(JSON.stringify({
                    realtime_input: {
                        media_chunks: [{ mime_type: "audio/pcm;rate=16000", data: base64 }]
                    }
                }));
            }
        }, 2000); // Every 2 seconds (was 3s — tighter to prevent Gemini timeout)

        try {
            console.log(`[VoiceOrchestrator] 🚀 Executing audit for ${url}...`);

            // ★ VISUAL JENNY: Audit started
            VisualBridge.emitConversationEvent({
                type: "audit_started",
                data: { url },
                timestamp: Date.now(),
                sessionId: this.sessionId,
                agentName: this.customAgents?.[0]?.name || "Jenny",
            });
            // Also emit domain_captured
            VisualBridge.emitConversationEvent({
                type: "domain_captured",
                data: { domain: url, businessName: this.lastAuditResult?.businessName },
                timestamp: Date.now(),
                sessionId: this.sessionId,
            });

            // ★ CRITICAL: 45-second hard timeout so the audit NEVER hangs forever
            const controller = new AbortController();
            const auditTimeout = setTimeout(() => {
                console.warn("[VoiceOrchestrator] ⏱️ Audit timeout — aborting after 45s");
                controller.abort();
            }, 45000);

            let result: Record<string, unknown>;

            try {
                const response = await fetch("/api/audit", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ url }),
                    signal: controller.signal,
                });

                clearTimeout(auditTimeout);

                // ★ Check HTTP status BEFORE parsing JSON
                if (!response.ok) {
                    const errorText = await response.text().catch(() => "Unknown server error");
                    console.error(`[VoiceOrchestrator] ❌ Audit API returned ${response.status}: ${errorText.slice(0, 200)}`);
                    throw new Error(`Audit API returned ${response.status}`);
                }

                result = await response.json();
            } catch (fetchErr) {
                clearTimeout(auditTimeout);
                throw fetchErr;
            }

            console.log("[VoiceOrchestrator] ✅ Audit complete:", Object.keys(result));

            // Store audit result for Mark's handoff context
            this.lastAuditResult = result;

            // Emit audit result to UI
            this.onAuditResult?.(result);

            // ★ VISUAL JENNY: Audit complete
            VisualBridge.emitConversationEvent({
                type: "audit_complete",
                data: {
                    result,
                    url,
                    industry: (result as Record<string, unknown>).detectedIndustry || "business",
                },
                timestamp: Date.now(),
                sessionId: this.sessionId,
                agentName: this.customAgents?.[0]?.name || "Jenny",
            });

            // Send FULL tool response back to Gemini — all 16 probes
            if (this.ws?.readyState === WebSocket.OPEN) {
                const deep = (result.deepDiagnostic || {}) as Record<string, Record<string, unknown>>;
                const toolResponse = {
                    tool_response: {
                        function_responses: [{
                            id: callId,
                            name: "business_audit",
                            response: {
                                result: {
                                    // ── Core Metrics ──
                                    siteSpeedScore: (result.siteSpeed as Record<string, unknown>)?.score || 0,
                                    loadTime: (result.siteSpeed as Record<string, unknown>)?.loadTime || "unknown",
                                    ttfb: (result.siteSpeed as Record<string, unknown>)?.ttfb || "unknown",
                                    technicalIssues: (result.siteSpeed as Record<string, unknown>)?.issues || [],
                                    mobileScore: (result.mobile as Record<string, unknown>)?.score || 0,
                                    mobileResponsive: (result.mobile as Record<string, unknown>)?.isResponsive || false,
                                    mobileIssues: (result.mobile as Record<string, unknown>)?.issues || [],
                                    techDebtMarkers: (result.techDebt as Record<string, unknown>)?.markers || [],
                                    techDebtSeverity: (result.techDebt as Record<string, unknown>)?.severity || "medium",
                                    competitors: result.competitors || [],
                                    // ── Revenue Data ──
                                    monthlyTraffic: (result.revenueEstimate as Record<string, unknown>)?.monthlyTraffic || 0,
                                    currentConversionRate: (result.revenueEstimate as Record<string, unknown>)?.conversionRate || 0,
                                    industryAvgConversion: (result.revenueEstimate as Record<string, unknown>)?.industryAvg || 3.2,
                                    leakingRevenuePerMonth: (result.revenueEstimate as Record<string, unknown>)?.leakingRevenue || "$0",
                                    potentialROI: (result.revenueEstimate as Record<string, unknown>)?.potentialROI || "$0",
                                    // ── ROI Engine ──
                                    roiAnnualSavings: (result.roi as Record<string, unknown>)?.annualSavings || 0,
                                    roiMonthlySavings: (result.roi as Record<string, unknown>)?.monthlySavings || 0,
                                    roiMultiplier: (result.roi as Record<string, unknown>)?.roiMultiplier || 0,
                                    roiHoursRecovered: (result.roi as Record<string, unknown>)?.hoursRecovered || 0,
                                    roiBreakdown: (result.roi as Record<string, unknown>)?.breakdownText || "",
                                    roiGuaranteeMet: !(result.roi as Record<string, unknown>)?.optimizationLoopNeeded,
                                    // ── Reputation ──
                                    reputationStatus: (result.reputation as Record<string, unknown>)?.status || "unknown",
                                    unansweredReviews: (result.reputation as Record<string, unknown>)?.unansweredReviews || 0,
                                    // ── Social ──
                                    socialStatus: (result.social as Record<string, unknown>)?.status || "unknown",
                                    lastSocialPostDaysAgo: (result.social as Record<string, unknown>)?.lastPostDaysAgo || 0,
                                    // ── AEO/GEO ──
                                    aeoReady: (result.seo_aeo as Record<string, unknown>)?.aeoReady || false,
                                    schemaFound: (result.seo_aeo as Record<string, unknown>)?.schemaFound || false,
                                    // ── Missed Calls ──
                                    callLeakStatus: (result.callToVoicemail as Record<string, unknown>)?.status || "unknown",
                                    missedCallsPerMonth: (result.callToVoicemail as Record<string, unknown>)?.missedCallsPerMonth || 0,
                                    // ── Deep Diagnostic (16-Probe MRI) ──
                                    deepAEO_structuredDataScore: deep.aeoDeep?.structuredDataScore || 0,
                                    deepAEO_aiCitationLikelihood: deep.aeoDeep?.aiCitationLikelihood || "low",
                                    deepAEO_vulnerabilities: deep.aeoDeep?.vulnerabilities || [],
                                    leadLeakage_annualLeakage: deep.leadLeakage?.annualLeakage || 0,
                                    leadLeakage_recoveryProjection: deep.leadLeakage?.recoveryProjection || 0,
                                    reputationImpact_annualRevenueLoss: deep.reputationImpact?.annualRevenueLoss || 0,
                                    reputationImpact_mapPackPosition: deep.reputationImpact?.mapPackPosition || "unknown",
                                    voicemailHemorrhage_annualLoss: deep.voicemailHemorrhage?.annualLoss || 0,
                                    voicemailHemorrhage_recoverable: deep.voicemailHemorrhage?.recoverable || 0,
                                    silentLeadTest_ghostingScore: deep.silentLeadTest?.ghostingScore || "unknown",
                                    silentLeadTest_responseTimeSec: deep.silentLeadTest?.responseTimeSec || 0,
                                    silentLeadTest_monthlyGhostingCost: deep.silentLeadTest?.monthlyGhostingCost || 0,
                                    aeoKeywords_totalShareOfVoice: deep.aeoKeywords?.totalShareOfVoice || 0,
                                    aeoKeywords_totalRevenueAtRisk: deep.aeoKeywords?.totalRevenueAtRisk || 0,
                                    // ── SEO Analysis (Probe 17) ──
                                    seoScore: (result.seo as Record<string, unknown>)?.score || 0,
                                    seoTitleTag: (result.seo as Record<string, unknown>)?.titleTag || "missing",
                                    seoMetaDescription: (result.seo as Record<string, unknown>)?.metaDescription ? "present" : "missing",
                                    seoH1Count: (result.seo as Record<string, unknown>)?.h1Count || 0,
                                    seoImagesMissingAlt: (result.seo as Record<string, unknown>)?.imagesMissingAlt || 0,
                                    seoHasOpenGraph: (result.seo as Record<string, unknown>)?.hasOpenGraph || false,
                                    seoHasCanonical: !!(result.seo as Record<string, unknown>)?.canonicalUrl,
                                    seoIssues: (result.seo as Record<string, unknown>)?.issues || [],
                                    // ── GEO Readiness ──
                                    geoReady: (result.seo_aeo as Record<string, unknown>)?.geoReady || false,
                                    // ── Content Quality (Probe 18) ──
                                    contentScore: (result.contentQuality as Record<string, unknown>)?.contentScore || 0,
                                    contentWordCount: (result.contentQuality as Record<string, unknown>)?.wordCount || 0,
                                    contentHasCTA: (result.contentQuality as Record<string, unknown>)?.hasCTA || false,
                                    contentCTACount: (result.contentQuality as Record<string, unknown>)?.ctaCount || 0,
                                    contentCTATypes: (result.contentQuality as Record<string, unknown>)?.ctaTypes || [],
                                    contentHasPricing: (result.contentQuality as Record<string, unknown>)?.hasPricing || false,
                                    contentHasTestimonials: (result.contentQuality as Record<string, unknown>)?.hasTestimonials || false,
                                    contentHasVideo: (result.contentQuality as Record<string, unknown>)?.hasVideo || false,
                                    contentIssues: (result.contentQuality as Record<string, unknown>)?.issues || [],
                                    // ── Needs Assessment (Auto-Generated) ──
                                    identifiedPainPoints: (result.needsAssessment as Record<string, unknown>)?.identifiedPainPoints || [],
                                    recommendedSolutions: (result.needsAssessment as Record<string, unknown>)?.recommendedSolutions || [],
                                    urgencyLevel: (result.needsAssessment as Record<string, unknown>)?.urgencyLevel || "medium",
                                    estimatedMonthlyImpact: (result.needsAssessment as Record<string, unknown>)?.estimatedMonthlyImpact || 0,
                                    primaryNeed: (result.needsAssessment as Record<string, unknown>)?.primaryNeed || "General optimization",
                                    // ── Deep Crawl (Probe 19) ──
                                    deepCrawlMarkdown: ((deep.deepCrawl?.markdown as string) || "").slice(0, 15000), // Cap for context window safety
                                    // ── Instructions for the Agent ──
                                    agentInstructions: "CRITICAL: These are REAL audit results from a live 20-probe diagnostic. You now have 'High-Resolution MRI' context via 'deepCrawlMarkdown'—use specific text fragments or service names found in that markdown to prove you've analyzed their site deeply. Key areas to cover: 1) SEO gaps (seoScore, seoIssues), 2) AEO/GEO readiness (aeoReady, geoReady, deepAEO_aiCitationLikelihood), 3) Content quality (contentScore, contentHasCTA, contentHasTestimonials), 4) Revenue hemorrhage (leakingRevenuePerMonth, voicemailHemorrhage_annualLoss, silentLeadTest_monthlyGhostingCost), 5) Pre-identified pain points (identifiedPainPoints) and solutions (recommendedSolutions). Lead with the PRIMARY NEED and urgencyLevel. After presenting 2-3 key findings, ask how they currently handle these. When ready, say: 'Mark, execute the ROI bridge.' Call capture_lead whenever they share contact info."
                                }
                            }
                        }]
                    }
                };

                this.ws.send(JSON.stringify(toolResponse));
                console.log("[VoiceOrchestrator] 📤 Sent FULL 20-probe audit results back to Gemini");
            } else {
                console.error("[VoiceOrchestrator] ❌ WebSocket closed during audit — cannot send results");
            }
        } catch (err) {
            console.error("[VoiceOrchestrator] Audit failed:", err);

            // ★ CRITICAL FIX: Send a proper { result: {} } response — NOT { error: "" }
            // Gemini expects a result object. If we send { error }, it silently stops responding.
            // Instead, give it a graceful fallback so the agent can continue the conversation.
            if (this.ws?.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({
                    tool_response: {
                        function_responses: [{
                            id: callId,
                            name: "business_audit",
                            response: {
                                result: {
                                    auditStatus: "partial",
                                    errorMessage: String(err),
                                    siteSpeedScore: 0,
                                    mobileScore: 0,
                                    seoScore: 0,
                                    contentScore: 0,
                                    leakingRevenuePerMonth: "Unable to calculate — site may be blocking our scanner",
                                    agentInstructions: "The full technical audit could not complete — this sometimes happens with sites that block automated scanners, or if the site is very slow. DO NOT go silent. Instead, tell the prospect: 'I wasn't able to pull the full technical scan on your site — that actually tells me something in itself. Sites that block scanners or take too long to respond are usually losing visitors the same way. Tell me more about your business and I can still identify the big opportunities for you.' Then continue the conversation naturally by asking about their business, challenges, and goals. You can still provide value from your industry knowledge."
                                }
                            }
                        }]
                    }
                }));
                console.log("[VoiceOrchestrator] 📤 Sent graceful audit fallback to Gemini — agent will continue talking");
            }
        } finally {
            // ★ Always clear keep-alive when done
            clearInterval(keepAliveInterval);
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // COMPETITOR INTEL — Real competitor data via Google Search grounding
    // ═══════════════════════════════════════════════════════════════════════════
    private async executeCompetitorIntel(args: Record<string, string>, callId: string) {
        try {
            console.log(`[VoiceOrchestrator] 🎯 Running competitor intel for ${args.domain}...`);

            const response = await fetch("/api/competitor-intel", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    domain: args.domain,
                    industry: args.industry || undefined,
                    auditData: this.lastAuditResult || undefined,
                }),
            });

            const result = await response.json();
            console.log("[VoiceOrchestrator] ✅ Competitor intel complete:", result);

            if (this.ws?.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({
                    tool_response: {
                        function_responses: [{
                            id: callId,
                            name: "competitor_intel",
                            response: {
                                result: {
                                    competitors: result.competitors || [],
                                    marketPosition: result.marketPosition || "unknown",
                                    totalRevenueAtRisk: result.totalRevenueAtRisk || "$0",
                                    keyInsight: result.keyInsight || "No data available",
                                    agentScript: result.agentScript || "",
                                    instructions: "CRITICAL: Present these competitor findings to create urgency. Name SPECIFIC competitors and what they do better. Use phrases like 'While you're here talking to me, [Competitor] is capturing those leads.' This data is FROM GOOGLE SEARCH — it's real.",
                                }
                            }
                        }]
                    }
                }));
                console.log("[VoiceOrchestrator] 📤 Sent competitor intel back to Gemini");
            }
        } catch (err) {
            console.error("[VoiceOrchestrator] Competitor intel failed:", err);
            if (this.ws?.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({
                    tool_response: {
                        function_responses: [{
                            id: callId,
                            name: "competitor_intel",
                            response: { result: { error: "Competitor analysis unavailable right now, but based on the audit data we already have, there are clear areas where competitors are outperforming you." } }
                        }]
                    }
                }));
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // ROI CALCULATOR — Personalized financial model from real audit data
    // ═══════════════════════════════════════════════════════════════════════════
    private async executeROICalculator(args: Record<string, unknown>, callId: string) {
        try {
            console.log(`[VoiceOrchestrator] 📊 Calculating ROI for ${args.domain}...`);

            // Build input from audit data + any info from conversation
            const audit = this.lastAuditResult || {};
            const payload = {
                domain: args.domain,
                industry: args.industry || undefined,
                monthlyRevenue: args.monthlyRevenue || undefined,
                avgDealValue: args.avgDealValue || undefined,
                // Pull real data from the last audit
                monthlyTraffic: audit.revenueEstimate?.monthlyTraffic || undefined,
                currentConversionRate: audit.revenueEstimate?.conversionRate || undefined,
                leakingRevenueMonthly: audit.revenueEstimate?.leakingRevenue || undefined,
                missedCallsPerMonth: audit.callToVoicemail?.missedCallsPerMonth || undefined,
                siteSpeedScore: audit.siteSpeed?.score || undefined,
                seoScore: audit.seo?.score || undefined,
                aeoScore: audit.deepDiagnostic?.aeoDeep?.structuredDataScore || undefined,
                contentScore: audit.contentQuality?.contentScore || undefined,
                ghostingScore: audit.deepDiagnostic?.silentLeadTest?.ghostingScore || undefined,
                reputationStatus: audit.reputation?.status || undefined,
                socialStatus: audit.social?.status || undefined,
            };

            const response = await fetch("/api/roi-calculator", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await response.json();
            console.log("[VoiceOrchestrator] ✅ ROI calculation complete:", result);

            if (this.ws?.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({
                    tool_response: {
                        function_responses: [{
                            id: callId,
                            name: "roi_calculator",
                            response: {
                                result: {
                                    totalMonthlyLoss: result.totalMonthlyLoss || 0,
                                    totalRecoverableMonthly: result.totalRecoverableMonthly || 0,
                                    totalRecoverableAnnually: result.totalRecoverableAnnually || 0,
                                    roiMultiplier: result.roiMultiplier || 0,
                                    paybackPeriodDays: result.paybackPeriodDays || 0,
                                    biodynamxInvestment: result.biodynamxInvestment || 497,
                                    netGainMonthly: result.netGainMonthly || 0,
                                    netGainAnnually: result.netGainAnnually || 0,
                                    breakdown: result.breakdown || [],
                                    confidenceLevel: result.confidenceLevel || "conservative",
                                    agentScript: result.agentScript || "",
                                    closingStatement: result.closingStatement || "",
                                    instructions: "CRITICAL: Use the agentScript and closingStatement VERBATIM — they contain the exact numbers. Walk through the top 3 breakdown items with the prospect. End with the closing statement to make the math undeniable. This is the ROI Bridge — the transition from diagnosis to prescription.",
                                }
                            }
                        }]
                    }
                }));
                console.log("[VoiceOrchestrator] 📤 Sent ROI calculation back to Gemini");
            }
        } catch (err) {
            console.error("[VoiceOrchestrator] ROI calculation failed:", err);
            if (this.ws?.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({
                    tool_response: {
                        function_responses: [{
                            id: callId,
                            name: "roi_calculator",
                            response: { result: { error: "ROI calculation unavailable. Use the audit data already provided to estimate impact manually." } }
                        }]
                    }
                }));
            }
        }
    }

    // ═══════════════════════════════════════════════════════════════════════════
    // SEND AUDIT REPORT — SMS/Email the diagnostic to the prospect
    // ═══════════════════════════════════════════════════════════════════════════
    private async executeSendReport(args: Record<string, string>, callId: string) {
        try {
            console.log(`[VoiceOrchestrator] 📨 Sending report to ${args.phone || args.email}...`);

            const response = await fetch("/api/send-report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    phone: args.phone || undefined,
                    email: args.email || undefined,
                    name: args.name || undefined,
                    domain: this.lastAuditResult?.url || undefined,
                    auditData: this.lastAuditResult || undefined,
                }),
            });

            const result = await response.json();
            console.log("[VoiceOrchestrator] ✅ Report sent:", result);

            if (this.ws?.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({
                    tool_response: {
                        function_responses: [{
                            id: callId,
                            name: "send_audit_report",
                            response: {
                                result: {
                                    success: result.success,
                                    deliveredVia: result.deliveredVia || [],
                                    message: result.message || "Report sent",
                                    instructions: "Confirm to the prospect that you've sent them a copy. Say something like: 'Done! I just texted you a full copy of the diagnostic. You can share it with your team or partner.' Then transition to the next step — either the ROI calculator or the handoff to Mark.",
                                }
                            }
                        }]
                    }
                }));
                console.log("[VoiceOrchestrator] 📤 Sent report confirmation back to Gemini");
            }
        } catch (err) {
            console.error("[VoiceOrchestrator] Send report failed:", err);
            if (this.ws?.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({
                    tool_response: {
                        function_responses: [{
                            id: callId,
                            name: "send_audit_report",
                            response: { result: { success: false, message: "I wasn't able to send the report right now, but you can find all the details at biodynamx.com." } }
                        }]
                    }
                }));
            }
        }
    }

    private async executeCheckout(callId: string) {
        // ── AGENTIC: Check commitment level before allowing checkout ──
        const memory = getMemory(this.sessionId);
        if (memory && memory.commitmentLevel < 50) {
            console.warn(`[VoiceOrchestrator] ⛔ Checkout BLOCKED — commitment ${memory.commitmentLevel}/100 (need 50+)`);
            if (this.ws?.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({
                    tool_response: {
                        function_responses: [{
                            id: callId,
                            name: "create_checkout",
                            response: {
                                result: {
                                    success: false,
                                    message: "The prospect doesn't seem ready to purchase yet. Continue building value and addressing their concerns before attempting to close.",
                                    commitmentLevel: memory.commitmentLevel,
                                }
                            }
                        }]
                    }
                }));
            }
            return;
        }

        try {
            console.log("[VoiceOrchestrator] 💳 Creating Stripe checkout session...");

            const response = await fetch("/api/create-checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
            });

            const result = await response.json();

            if (result.url) {
                console.log("[VoiceOrchestrator] ✅ Checkout URL:", result.url);
                this.onCheckoutTriggered?.(result.url);

                // Open checkout in new tab
                window.open(result.url, "_blank");
            }

            // Send response back to Gemini
            if (this.ws?.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({
                    tool_response: {
                        function_responses: [{
                            id: callId,
                            name: "create_checkout",
                            response: {
                                result: {
                                    success: !!result.url,
                                    message: result.url
                                        ? "Checkout link generated and opened for the visitor."
                                        : "Stripe checkout is being configured. The visitor can use the Start Now button.",
                                }
                            }
                        }]
                    }
                }));
            }
        } catch (err) {
            console.error("[VoiceOrchestrator] Checkout failed:", err);
            if (this.ws?.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({
                    tool_response: {
                        function_responses: [{
                            id: callId,
                            name: "create_checkout",
                            response: { error: "Checkout failed: " + String(err) }
                        }]
                    }
                }));
            }
        }
    }

    // ── NEW TOOL: Capture Lead ───────────────────────────────────────
    private executeCaptureLead(args: Record<string, string>, callId: string) {
        // ★ CRITICAL FIX: Respond to Gemini IMMEDIATELY — fire-and-forget the DB save.
        // The old version awaited the /api/leads fetch BEFORE sending toolResponse.
        // If /api/leads was slow, returned 400 (no email = voice-only capture), or threw,
        // Gemini would hang indefinitely waiting for a tool response that never came.
        // Jenny would go silent after asking for a name — exactly what was reported.
        //
        // Fix: send the toolResponse NOW, then save to DB asynchronously.
        // ★ CRITICAL FIX: Streaming messages MUST use snake_case.
        // Using camelCase (toolResponse/functionResponses) caused Gemini
        // to silently ignore the response → agent hangs after capturing a name.
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                tool_response: {
                    function_responses: [{
                        id: callId,
                        name: "capture_lead",
                        response: {
                            result: {
                                success: true,
                                message: `Got it — ${args.name ? args.name + "'s" : ""} info noted. Continue the conversation naturally.`,
                            }
                        }
                    }]
                }
            }));
        }

        // ★ VISUAL JENNY: Name captured event
        VisualBridge.emitConversationEvent({
            type: "name_captured",
            data: { name: args.name, email: args.email, phone: args.phone, company: args.company },
            timestamp: Date.now(),
            sessionId: this.sessionId,
            agentName: this.customAgents?.[0]?.name || "Jenny",
        });

        // Update in-memory session with prospect info immediately
        const memory = getMemory(this.sessionId);
        if (memory) {
            if (args.name) memory.prospect.name = args.name;
            if (args.company) memory.prospect.company = args.company;
            if (args.industry) memory.prospect.industry = args.industry;
        }

        // Update transcript with prospect info (only fields supported by the type)
        updateProspectInfo(this.sessionId, {
            name: args.name || undefined,
            email: args.email || undefined,
            phone: args.phone || undefined,
        });

        // Async DB save — does NOT block the voice conversation
        void (async () => {
            try {
                await fetch("/api/leads", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        ...args,
                        // Provide a placeholder email so the API doesn't 400
                        // on voice-only captures that only have a name
                        email: args.email || `voice_${this.sessionId}@capture.biodynamx.com`,
                        sessionId: this.sessionId,
                        source: "voice_diagnostic",
                        capturedAt: new Date().toISOString(),
                    }),
                });
            } catch (err) {
                // Log but never throw — the conversation already continued
                console.warn("[VoiceOrchestrator] Lead DB save failed (non-blocking):", err);
            }
        })();

        logAuditEntry({
            sessionId: this.sessionId,
            agentName: this.customAgents?.[0]?.name || "Jenny",
            eventType: "tool_call",
            content: `Lead captured: ${args.name || "unknown"}`,
        });
    }

    // ── NEW TOOL: Schedule Appointment (Calendly Integration) ────────
    private async executeScheduleAppointment(args: Record<string, string>, callId: string) {
        const CALENDLY_LINK = "https://calendly.com/biodynamx";

        logAuditEntry({
            sessionId: this.sessionId,
            agentName: this.customAgents?.[0]?.name || "Jenny",
            eventType: "tool_call",
            content: `Appointment scheduled: ${args.purpose} for ${args.prospectName || "prospect"}`,
        });

        // Open Calendly in a new tab
        if (typeof window !== "undefined") {
            window.open(CALENDLY_LINK, "_blank");
        }

        // ★ FIX: snake_case for streaming messages
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                tool_response: {
                    function_responses: [{
                        id: callId,
                        name: "schedule_appointment",
                        response: {
                            result: {
                                success: true,
                                calendlyLink: CALENDLY_LINK,
                                message: `I've opened our scheduling page. The prospect can book a ${args.purpose} directly at ${CALENDLY_LINK}. Tell them: 'I just opened our calendar — you can pick any time that works for you.'`,
                            }
                        }
                    }]
                }
            }));
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // NANA BANANA 2 — dispatchNeuroVisual
    // The core bridge between IronClaw / agent tool calls and the visual panel.
    // Calls /api/generate-scene with full neuroscience context.
    // NEVER blocks the voice stream — fully async, fire-and-forget.
    // ─────────────────────────────────────────────────────────────────────────
    private dispatchNeuroVisual(params: {
        conversationPhase: "reptilian" | "limbic" | "neocortex" | "close";
        topic?: string;
        industry?: string;
        businessName?: string;
        prospectName?: string;
        auditData?: Record<string, unknown>;
        reason?: string;
    }): void {
        console.log(`[NanaBanana2] 🧠 Dispatching visual — ${params.conversationPhase} layer | ${params.industry || "unknown"} industry | reason: ${params.reason || "phase trigger"}`);

        // Fire async — NEVER await this from the voice message loop
        fetch("/api/generate-scene", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                conversationPhase: params.conversationPhase,
                topic: params.topic || params.conversationPhase,
                industry: params.industry || "business",
                businessName: params.businessName,
                prospectName: params.prospectName,
                auditData: params.auditData || null,
            }),
        })
            .then(r => r.json())
            .then((result: { imageDataUrl?: string; brainLayer?: string; neuroReason?: string; topic?: string; businessName?: string; industryStats?: string; error?: string }) => {
                if (result.error || !result.imageDataUrl) {
                    console.warn(`[NanaBanana2] Visual generation failed: ${result.error}`);
                    return;
                }
                console.log(`[NanaBanana2] ✅ Visual ready — ${result.brainLayer} | ${result.neuroReason}`);

                // Emit to any UI listener (VaultUI, custom panel, etc.)
                this.onVisualReady?.({
                    imageDataUrl: result.imageDataUrl,
                    brainLayer: result.brainLayer || params.conversationPhase,
                    neuroReason: result.neuroReason || params.reason || "",
                    topic: result.topic || params.topic || "",
                    businessName: result.businessName || params.businessName,
                    industryStats: result.industryStats,
                });
            })
            .catch(err => {
                // Silent fail — never crash the voice session over a visual
                console.warn(`[NanaBanana2] Visual dispatch error (non-fatal): ${err}`);
            });
    }

    // ── NEW TOOL: Escalate to Human ──────────────────────────────────
    private async executeEscalation(args: Record<string, string>, callId: string) {
        logAuditEntry({
            sessionId: this.sessionId,
            agentName: this.customAgents?.[0]?.name || "Jenny",
            eventType: "escalation",
            content: `Escalation: ${args.reason} — ${args.summary}`,
            metadata: { reason: args.reason, summary: args.summary },
        });

        endSession(this.sessionId, "escalated");

        // ★ FIX: snake_case for streaming messages
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                tool_response: {
                    function_responses: [{
                        id: callId,
                        name: "escalate_to_human",
                        response: {
                            result: {
                                success: true,
                                message: `Escalation recorded. Reason: ${args.reason}. A team member will follow up within 2 hours. Tell the prospect: 'I've flagged this for our specialist team. Someone will reach out to you directly within the next couple of hours.'`,
                                calendlyLink: "https://calendly.com/biodynamx",
                            }
                        }
                    }]
                }
            }));
        }
    }

    // ── NEW TOOL: Draft Social Media Post ────────────────────────────
    private async executeDraftSocialMediaPost(args: Record<string, string>, callId: string) {
        try {
            const response = await fetch("/api/social-media", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "draft",
                    payload: { type: args.type, topic: args.topic }
                }),
            });
            const result = await response.json();

            if (this.ws?.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({
                    tool_response: {
                        function_responses: [{
                            id: callId,
                            name: "draft_social_media_post",
                            response: {
                                result: {
                                    success: true,
                                    message: `Successfully drafted the ${args.type}. The draft content is ready for review.`,
                                    draftContent: result.text || "Draft generated."
                                }
                            }
                        }]
                    }
                }));
            }
        } catch (err) {
            console.error("[VoiceOrchestrator] Draft generation failed:", err);
            if (this.ws?.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({
                    tool_response: {
                        function_responses: [{
                            id: callId,
                            name: "draft_social_media_post",
                            response: { result: { success: false, message: "Failed to generate draft." } }
                        }]
                    }
                }));
            }
        }
    }

    // ── NEW TOOL: Auto-Respond Social Message ────────────────────────
    private async executeAutoRespondSocialMessage(args: Record<string, string>, callId: string) {
        try {
            const response = await fetch("/api/social-media", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "respond",
                    payload: { message: args.message, platform: args.platform }
                }),
            });
            const result = await response.json();

            if (this.ws?.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({
                    tool_response: {
                        function_responses: [{
                            id: callId,
                            name: "auto_respond_social_message",
                            response: {
                                result: {
                                    success: true,
                                    message: `Generated a response to the customer on ${args.platform}.`,
                                    suggestedResponse: result.text || "Response generated."
                                }
                            }
                        }]
                    }
                }));
            }
        } catch (err) {
            console.error("[VoiceOrchestrator] Auto-response failed:", err);
            if (this.ws?.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({
                    tool_response: {
                        function_responses: [{
                            id: callId,
                            name: "auto_respond_social_message",
                            response: { result: { success: false, message: "Failed to general response." } }
                        }]
                    }
                }));
            }
        }
    }

    // ── TOOL: Jules AI Architecture Engine (previously "Stitch") ───────
    private async executeStitchDesign(args: Record<string, string>, callId: string) {
        try {
            console.log(`[VoiceOrchestrator] 🎨 Jules Architecture Engine: ${args.prompt}`);
            this.onStitchRequested?.(args.prompt);

            // Build rich payload with audit context for Jules
            const payload: Record<string, unknown> = {
                prompt: args.prompt,
                sessionId: this.sessionId,
                taskType: "design_implement",
            };

            // Attach audit data if available — gives Jules real diagnostic context
            if (this.lastAuditResult) {
                payload.auditData = {
                    siteSpeed: this.lastAuditResult.siteSpeed,
                    seo: this.lastAuditResult.seo,
                    contentQuality: this.lastAuditResult.contentQuality,
                    needsAssessment: this.lastAuditResult.needsAssessment,
                    callToVoicemail: this.lastAuditResult.callToVoicemail,
                    reputation: this.lastAuditResult.reputation,
                };
                payload.clientDomain = this.lastAuditResult.url;
            }

            const response = await fetch("/api/stitch", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            const result = await response.json();

            if (this.ws?.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({
                    tool_response: {
                        function_responses: [{
                            id: callId,
                            name: "stitch_design",
                            response: {
                                result: {
                                    success: result.success,
                                    previewUrl: result.previewUrl || "https://jules.google.com",
                                    sessionId: result.sessionId || null,
                                    sessionState: result.state || "ACTIVE",
                                    title: result.title || "Design Session",
                                    message: result.message || "Jules is now building your implementation plan.",
                                    instructions: result.success
                                        ? "Tell the prospect: 'Jules, our AI Architect, is now actively building your implementation plan. This is a real engineering session — you can follow the progress live. Let me walk you through what he's building...'"
                                        : "Tell the prospect: 'I'm designing the architecture for your new system. Let me walk you through the structural improvements...'",
                                }
                            }
                        }]
                    }
                }));
            }
        } catch (err) {
            console.error("[VoiceOrchestrator] Jules architecture failed:", err);
            if (this.ws?.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({
                    tool_response: {
                        function_responses: [{
                            id: callId,
                            name: "stitch_design",
                            response: { result: { success: false, message: "Jules is currently at capacity. I can still walk you through the structural improvements manually and schedule a follow-up implementation session." } }
                        }]
                    }
                }));
            }
        }
    }

    private playAudioChunk(base64: string) {
        if (!this.audioContext || !this.analyser) return;

        // ★ Ensure context is running before playback
        if (this.audioContext.state === "suspended") {
            this.audioContext.resume();
        }

        const float32Data = this.base64PCM16ToFloat32(base64);
        // ★ CRITICAL: Gemini Live native audio outputs at 24kHz PCM
        // Buffer MUST declare the correct rate or WebAudio will resample and distort
        const buffer = this.audioContext.createBuffer(1, float32Data.length, 24000);
        buffer.getChannelData(0).set(float32Data);

        const source = this.audioContext.createBufferSource();
        source.buffer = buffer;
        source.connect(this.analyser);

        const currentTime = this.audioContext.currentTime;
        if (this.nextPlayTime < currentTime) {
            this.nextPlayTime = currentTime;
        }

        source.start(this.nextPlayTime);
        this.nextPlayTime += buffer.duration;
        this.playbackQueue.push(source);
    }

    private clearPlaybackQueue() {
        this.playbackQueue.forEach(source => {
            try { source.stop(); source.disconnect(); } catch { /* expected */ }
        });
        this.playbackQueue = [];
        this.nextPlayTime = 0;
    }

    bargeIn() {
        this.clearPlaybackQueue();
        // ★ FIX: Streaming messages must use snake_case
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                client_content: {
                    turns: [{ role: "user", parts: [{ text: "" }] }],
                    turn_complete: true
                }
            }));
        }
    }

    // --- Format Converters ---

    disconnect(isHandoff = false) {
        this.clearPlaybackQueue();

        // 📝 TRANSCRIPT: Finalize and save transcript before disconnecting
        // Only end transcript if this is NOT a handoff (handoffs continue the transcript logic elsewhere)
        if (!isHandoff) {
            const transcript = endTranscript(this.sessionId);
            if (transcript) {
                console.log(`[VoiceOrchestrator] 📝 Transcript finalized: ${transcript.entries.length} entries`);
                const transcriptData = getTranscriptJSON(this.sessionId);
                if (transcriptData) {
                    fetch("/api/transcripts", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(transcriptData),
                    }).catch(err => console.error("[VoiceOrchestrator] Failed to save transcript:", err));
                }
            }
        }

        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }

        // If this is a handoff, we KEEP the mic and context alive for the next agent
        if (!isHandoff) {
            if (this.microphone) {
                this.microphone.disconnect();
                this.microphone = null;
            }
            if (this.stream) {
                this.stream.getTracks().forEach(track => track.stop());
                this.stream = null;
            }
            if (this.audioContext && this.audioContext.state !== "closed") {
                this.audioContext.close();
            }
        } else {
            console.log("[VoiceOrchestrator] Handoff mode: Preserving AudioContext and Stream.");
            if (this.microphone && this.workletNode) {
                this.microphone.disconnect(this.workletNode);
            }
            if (this.workletNode) {
                this.workletNode.disconnect();
                this.workletNode = null;
            }
        }

        const prevStatus = this.currentStatus;
        this.setStatus("idle", isHandoff ? "Passing baton..." : "Disconnected");

        // If we disconnected unexpectedly and haven't exceeded retries, try to reconnect
        if (!this.isReconnecting && this.reconnectCount < this.maxReconnectAttempts && prevStatus === "error") {
            this.handleReconnect();
        }
    }

    // ── Public Transcript Accessors ──────────────────────────────

    /** Get the live transcript object for this session */
    getSessionTranscript() {
        return getTranscript(this.sessionId);
    }

    /** Get a formatted text version of the transcript (for display/download) */
    getSessionTranscriptFormatted(): string {
        return getFormattedTranscript(this.sessionId);
    }

    /** Update prospect info in the transcript */
    updateTranscriptProspect(info: { name?: string; email?: string; phone?: string; businessUrl?: string }) {
        updateProspectInfo(this.sessionId, info);
    }

    private async handleReconnect() {
        this.isReconnecting = true;
        this.reconnectCount++;
        console.warn(`[VoiceOrchestrator] 🔄 Reconnecting... Attempt ${this.reconnectCount}/${this.maxReconnectAttempts}`);

        // Wait before reconnecting — exponential backoff
        await new Promise(r => setTimeout(r, 1500 * this.reconnectCount));

        try {
            await this.connect();
            // Reset count if successful
            this.reconnectCount = 0;
        } catch (err) {
            console.error("[VoiceOrchestrator] Reconnection attempt failed:", err);
        } finally {
            this.isReconnecting = false;
        }
    }

    private float32ToPCM16Base64(float32Array: Float32Array): string {
        const int16Array = new Int16Array(float32Array.length);
        for (let i = 0; i < float32Array.length; i++) {
            const s = Math.max(-1, Math.min(1, float32Array[i]));
            int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
        }
        const bytes = new Uint8Array(int16Array.buffer);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        return btoa(binary);
    }

    private base64PCM16ToFloat32(base64: string): Float32Array {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
            bytes[i] = binary.charCodeAt(i);
        }
        const int16Array = new Int16Array(bytes.buffer);
        const float32Array = new Float32Array(int16Array.length);
        for (let i = 0; i < int16Array.length; i++) {
            float32Array[i] = int16Array[i] / (int16Array[i] < 0 ? 0x8000 : 0x7FFF);
        }
        return float32Array;
    }
}
