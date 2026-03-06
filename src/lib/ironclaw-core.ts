// ═══════════════════════════════════════════════════════════════════
// IRONCLAW CORE — The Central Nervous System
// Master Orchestrator for the BioDynamX Autonomous Engine
// ═══════════════════════════════════════════════════════════════════
// Ironclaw is the secure heartbeat of the entire BioDynamX platform.
// Every tool call, lead capture, visual transition, and learning event
// flows through this singleton. It ensures:
//   1. Zero-latency async operations (never blocks the voice stream)
//   2. Cross-session memory persistence (Firebase + Supabase)
//   3. Real-time lead scoring and enrichment
//   4. Autonomous nurture sequence triggers
//   5. Self-improving learning loops
// ═══════════════════════════════════════════════════════════════════

import { scoreLeadFromData, type LeadData, type LeadScore } from "./lead-scoring";
// NOTE: sendLeadAlert uses Twilio (Node-only). We dynamic-import it to prevent
// crashing the client bundle. Type-only import is safe.
import type { LeadAlertData } from "./lead-alerts";
import type { VisitorProfile } from "./behavior-intel";
import { generateProposal, sendProposalSMSToBilly, persistProposal } from "./ironclaw-proposal";

// ── Types ──────────────────────────────────────────────────────────

export interface IronclawSession {
    sessionId: string;
    startedAt: number;
    endedAt?: number;

    // Prospect Intelligence (accumulated mid-call)
    prospect: {
        name?: string;
        email?: string;
        phone?: string;
        businessUrl?: string;
        businessName?: string;
        industry?: string;
        businessSize?: string;
        painPoints: string[];
        objections: string[];
        commitmentLevel: number;
    };

    // Behavioral Pre-Intelligence (from website visit)
    preCallIntel?: {
        referrerSource?: string;
        inferredIndustry?: string;
        scrollDepth: number;
        interestScore: number;
        pricingViewed: boolean;
        returnVisitor: boolean;
        visitCount: number;
        sessionDuration: number;
    };

    // Audit & Data
    auditResult?: Record<string, unknown>;
    competitorIntelResult?: Record<string, unknown>;
    roiCalculation?: Record<string, unknown>;

    // Agent State
    activeAgent: string;
    agentsUsed: string[];
    handoffCount: number;
    toolsCalled: string[];
    visualsShown: string[];

    // Conversation Progress
    conversationPhase: "greeting" | "discovery" | "rapport" | "audit_reveal" | "solution" | "pricing" | "objection_handling" | "close_attempt" | "won" | "nurture" | "lost";
    turnCount: number;

    // Outcome
    outcome?: "converted" | "nurture" | "lost" | "escalated" | "abandoned" | "won" | "closed";
    revenue?: number;

    // Lead Score
    leadScore?: LeadScore;
}

export interface IronclawLearning {
    id: string;
    timestamp: string;
    type: "objection_pattern" | "winning_phrase" | "pain_point" | "industry_insight" | "failure_analysis";
    industry?: string;
    content: string;
    confidence: number;
    appliedCount: number;
}

export interface IronclawEvent {
    type: "lead_captured" | "audit_complete" | "handoff" | "scene_change" | "tool_call" | "commitment_change" | "session_end" | "nurture_triggered" | "learning_recorded";
    sessionId: string;
    timestamp: number;
    data: Record<string, unknown>;
}

type EventCallback = (event: IronclawEvent) => void;

// ── The Ironclaw Core Class ────────────────────────────────────────

export class IronclawCore {
    private sessions: Map<string, IronclawSession> = new Map();
    private learnings: IronclawLearning[] = [];
    private eventQueue: IronclawEvent[] = [];
    private eventListeners: Map<string, EventCallback[]> = new Map();
    private pendingOps: Promise<void>[] = [];
    private isProcessing = false;

    // Performance metrics
    private metrics = {
        totalSessions: 0,
        conversions: 0,
        totalRevenue: 0,
        avgCommitmentDelta: 0,
        topIndustries: new Map<string, number>(),
        topPainPoints: new Map<string, number>(),
        topObjections: new Map<string, number>(),
    };

    // ── Session Lifecycle ──────────────────────────────────────────

    /**
     * Initialize a new Ironclaw session.
     * Called when a visitor connects or the voice engine boots.
     */
    initSession(sessionId: string, activeAgent: string = "Jenny", preCallProfile?: VisitorProfile): IronclawSession {
        const session: IronclawSession = {
            sessionId,
            startedAt: Date.now(),
            prospect: {
                painPoints: [],
                objections: [],
                commitmentLevel: 0,
            },
            preCallIntel: preCallProfile ? {
                referrerSource: preCallProfile.referrerSource,
                inferredIndustry: preCallProfile.industry,
                scrollDepth: preCallProfile.scrollDepth,
                interestScore: preCallProfile.interestScore,
                pricingViewed: preCallProfile.pricingViewed,
                returnVisitor: preCallProfile.isReturnVisitor,
                visitCount: preCallProfile.visitCount,
                sessionDuration: preCallProfile.sessionDuration,
            } : undefined,
            activeAgent,
            agentsUsed: [activeAgent],
            handoffCount: 0,
            toolsCalled: [],
            visualsShown: [],
            conversationPhase: "greeting",
            turnCount: 0,
        };

        // If we have pre-call intel, set inferred industry
        if (preCallProfile?.industry) {
            session.prospect.industry = preCallProfile.industry;
        }

        this.sessions.set(sessionId, session);
        this.metrics.totalSessions++;

        console.log(`[Ironclaw] ★ Session initialized: ${sessionId}`);
        if (preCallProfile) {
            console.log(`[Ironclaw]   Pre-call intel: industry=${preCallProfile.industry || "unknown"}, interest=${preCallProfile.interestScore}, returnVisitor=${preCallProfile.isReturnVisitor}`);
        }

        return session;
    }

    /**
     * Get the current session.
     */
    getSession(sessionId: string): IronclawSession | undefined {
        return this.sessions.get(sessionId);
    }

    /**
     * Get the outcome of a finished (or nearly finished) session.
     */
    getSessionOutcome(sessionId: string): IronclawSession["outcome"] {
        const session = this.sessions.get(sessionId);
        if (!session) return "nurture";
        return session.outcome || "nurture";
    }

    /**
     * Get the revenue associated with a session.
     */
    getSessionRevenue(sessionId: string): number {
        const session = this.sessions.get(sessionId);
        return session?.revenue || 0;
    }

    /**
     * Generate a session briefing for injection into Jenny's context.
     * This is the "ambient intelligence" — Jenny knows about the visitor
     * BEFORE they even speak.
     */
    generateSessionBriefing(sessionId: string): string {
        const session = this.sessions.get(sessionId);
        if (!session || !session.preCallIntel) return "";

        const intel = session.preCallIntel;
        const parts: string[] = [];

        parts.push("═══ IRONCLAW PRE-CALL INTELLIGENCE ═══");

        if (intel.returnVisitor) {
            parts.push(`⚡ RETURN VISITOR (visit #${intel.visitCount}) — They've been here before. They're interested. Move faster.`);
        }

        if (intel.inferredIndustry) {
            parts.push(`🏢 Inferred Industry: ${intel.inferredIndustry} — Prepare industry-specific talking points.`);
        }

        if (intel.pricingViewed) {
            parts.push(`💰 PRICING VIEWED — They already looked at pricing. They are evaluating. Skip the fluff, get to value.`);
        }

        if (intel.interestScore > 60) {
            parts.push(`🔥 HIGH INTEREST (${intel.interestScore}/100) — This visitor is engaged. They scrolled ${intel.scrollDepth}% of the page.`);
        } else if (intel.interestScore > 30) {
            parts.push(`🌡️ MODERATE INTEREST (${intel.interestScore}/100) — Build rapport first, then pivot to value.`);
        }

        if (intel.referrerSource && intel.referrerSource !== "direct") {
            parts.push(`📍 Came from: ${intel.referrerSource}`);
        }

        if (intel.sessionDuration > 120000) {
            parts.push(`⏱️ Been on site for ${Math.round(intel.sessionDuration / 60000)} minutes — serious browsing behavior.`);
        }

        parts.push("Use this intelligence subtly. Do NOT announce it. Let it guide your approach.");

        return parts.join("\n");
    }

    // ── Mid-Call Intelligence ──────────────────────────────────────

    /**
     * Update prospect information as it's discovered during the call.
     * Called by tool handlers when new data surfaces.
     */
    updateProspect(sessionId: string, updates: Partial<IronclawSession["prospect"]>): void {
        const session = this.sessions.get(sessionId);
        if (!session) return;

        Object.assign(session.prospect, updates);

        // Track industry stats
        if (updates.industry) {
            const count = this.metrics.topIndustries.get(updates.industry) || 0;
            this.metrics.topIndustries.set(updates.industry, count + 1);
        }

        // Track pain points
        if (updates.painPoints) {
            for (const pp of updates.painPoints) {
                const count = this.metrics.topPainPoints.get(pp) || 0;
                this.metrics.topPainPoints.set(pp, count + 1);
            }
        }

        console.log(`[Ironclaw] 📊 Prospect updated: ${JSON.stringify(updates).substring(0, 200)}`);

        // ★ AGENTIC BRIDGE: Sync to mid-call memory API (non-blocking)
        if (typeof window !== "undefined") {
            fetch("/api/agent-memory", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ sessionId, updates }),
            }).catch(() => { /* silent fail mid-call */ });
        }
    }

    /**
     * Record a tool call for the session.
     */
    recordToolCall(sessionId: string, toolName: string, args: Record<string, unknown>): void {
        const session = this.sessions.get(sessionId);
        if (!session) return;

        if (!session.toolsCalled.includes(toolName)) {
            session.toolsCalled.push(toolName);
        }

        this.emit({
            type: "tool_call",
            sessionId,
            timestamp: Date.now(),
            data: { toolName, args },
        });
    }

    /**
     * Record a visual scene change.
     */
    recordVisualChange(sessionId: string, sceneId: string): void {
        const session = this.sessions.get(sessionId);
        if (!session) return;

        if (!session.visualsShown.includes(sceneId)) {
            session.visualsShown.push(sceneId);
        }
    }

    /**
    * Update the conversation phase.
    */
    updatePhase(sessionId: string, phase: IronclawSession["conversationPhase"]): void {
        const session = this.sessions.get(sessionId);
        if (!session) return;

        const previousPhase = session.conversationPhase;
        session.conversationPhase = phase;

        console.log(`[Ironclaw] 🔄 Phase transition: ${previousPhase} → ${phase}`);

        this.emit({
            type: "scene_change",
            sessionId,
            timestamp: Date.now(),
            data: { previousPhase, newPhase: phase },
        });
    }

    /**
     * Update commitment level (buying signals).
     */
    updateCommitment(sessionId: string, newLevel: number, reason?: string): void {
        const session = this.sessions.get(sessionId);
        if (!session) return;

        const previous = session.prospect.commitmentLevel;
        session.prospect.commitmentLevel = Math.max(0, Math.min(100, newLevel));

        if (Math.abs(newLevel - previous) > 5) {
            console.log(`[Ironclaw] 📈 Commitment: ${previous} → ${newLevel} ${reason ? `(${reason})` : ""}`);

            this.emit({
                type: "commitment_change",
                sessionId,
                timestamp: Date.now(),
                data: { previous, current: newLevel, reason },
            });
        }
    }

    /**
     * Store audit results on the session.
     */
    storeAuditResult(sessionId: string, result: Record<string, unknown>): void {
        const session = this.sessions.get(sessionId);
        if (!session) return;

        session.auditResult = result;
        console.log(`[Ironclaw] 🔍 Audit result stored for session ${sessionId}`);

        this.emit({
            type: "audit_complete",
            sessionId,
            timestamp: Date.now(),
            data: { auditKeys: Object.keys(result) },
        });
    }

    /**
     * Record an agent handoff.
     */
    recordHandoff(sessionId: string, fromAgent: string, toAgent: string): void {
        const session = this.sessions.get(sessionId);
        if (!session) return;

        session.activeAgent = toAgent;
        session.handoffCount++;

        if (!session.agentsUsed.includes(toAgent)) {
            session.agentsUsed.push(toAgent);
        }

        console.log(`[Ironclaw] ⚡ Handoff: ${fromAgent} → ${toAgent} (total: ${session.handoffCount})`);

        this.emit({
            type: "handoff",
            sessionId,
            timestamp: Date.now(),
            data: { fromAgent, toAgent, handoffCount: session.handoffCount },
        });
    }

    // ── Lead Capture & Scoring ─────────────────────────────────────

    /**
     * Capture and score a lead — the moment of truth.
     * Runs async: scores → persists → alerts → queues nurture.
     * NEVER blocks the voice stream.
     */
    captureAndScoreLead(sessionId: string): void {
        const session = this.sessions.get(sessionId);
        if (!session) return;

        // Fire and forget — async background operation
        this.backgroundOp(async () => {
            const leadData: LeadData = {
                email: session.prospect.email,
                phone: session.prospect.phone,
                name: session.prospect.name,
                businessType: session.prospect.industry,
                auditCompleted: !!session.auditResult,
                auditGrade: session.auditResult?.grade as string | undefined,
                auditScore: session.auditResult?.overallScore as number | undefined,
                monthlyLeak: session.auditResult?.revenueEstimate
                    ? String((session.auditResult.revenueEstimate as Record<string, unknown>)?.leakingRevenue || "")
                    : undefined,
                voiceDiagnosticUsed: true,
                pagesViewed: session.preCallIntel?.scrollDepth ? Math.ceil(session.preCallIntel.scrollDepth / 25) : 1,
                returnVisits: session.preCallIntel?.visitCount || 1,
                timeOnSite: session.preCallIntel?.sessionDuration
                    ? Math.round(session.preCallIntel.sessionDuration / 1000)
                    : 0,
                source: "voice_diagnostic",
                createdAt: new Date().toISOString(),
                lastActivityAt: new Date().toISOString(),
            };

            // Score the lead
            const score = scoreLeadFromData(leadData);
            session.leadScore = score;

            console.log(`[Ironclaw] 🎯 Lead scored: ${score.total}/100 (${score.grade}) — Priority: ${score.priority}`);

            // Alert the owner
            const alertData: LeadAlertData = {
                name: session.prospect.name,
                phone: session.prospect.phone,
                email: session.prospect.email,
                source: "voice_diagnostic",
                businessType: session.prospect.industry,
                auditGrade: leadData.auditGrade,
                monthlyLeak: leadData.monthlyLeak,
                urgency: score.priority === "hot" ? "hot" : score.priority === "warm" ? "warm" : "cold",
            };

            try {
                // Dynamic import: Twilio is Node-only, so we only load it server-side
                if (typeof window === "undefined") {
                    const { sendLeadAlert } = await import("./lead-alerts");
                    await sendLeadAlert(alertData);
                } else {
                    // Client-side: fire via API route instead
                    fetch("/api/leads/alert", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify(alertData),
                    }).catch(err => console.warn(`[Ironclaw] Lead alert API call failed:`, err));
                }
            } catch (err) {
                console.error(`[Ironclaw] ⚠️ Lead alert failed:`, err);
            }

            this.emit({
                type: "lead_captured",
                sessionId,
                timestamp: Date.now(),
                data: {
                    name: session.prospect.name,
                    score: score.total,
                    grade: score.grade,
                    priority: score.priority,
                },
            });
        });
    }

    // ── Session End & Post-Call Automation ──────────────────────────

    /**
     * End a session and trigger post-call automation.
     * This is where the "autonet" magic happens.
     */
    endSession(sessionId: string, outcome: IronclawSession["outcome"] = "nurture"): void {
        const session = this.sessions.get(sessionId);
        if (!session) return;

        session.endedAt = Date.now();
        session.outcome = outcome;

        // Calculate final lead score if not already done
        if (!session.leadScore && session.prospect.name) {
            this.captureAndScoreLead(sessionId);
        }

        // Update metrics
        if (outcome === "converted") {
            this.metrics.conversions++;
            this.metrics.totalRevenue += session.revenue || 0;
        }

        // Record objections for learning
        for (const objection of session.prospect.objections) {
            const count = this.metrics.topObjections.get(objection) || 0;
            this.metrics.topObjections.set(objection, count + 1);
        }

        // Trigger post-call automation
        this.backgroundOp(async () => {
            // ★ PERSIST SESSION TO SUPABASE
            try {
                const domain = typeof window !== "undefined" ? window.location.hostname : "unknown";
                await fetch("/api/agent-memory", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        sessionId: session.sessionId,
                        agentName: "Jenny",
                        prospectName: session.prospect.name,
                        domain: session.prospect.businessUrl || domain,
                        industry: session.prospect.industry,
                        painPoints: session.prospect.painPoints,
                        objections: session.prospect.objections,
                        outcome: outcome === "won" ? "closed" : outcome,
                        notes: `Final commitment: ${session.prospect.commitmentLevel}%. Turns: ${session.turnCount}. Outcome: ${outcome}.`,
                        auditData: session.auditResult
                    }),
                });
                console.log(`[Ironclaw] ✅ Session persisted to Supabase: ${session.sessionId}`);
            } catch (err) {
                console.error(`[Ironclaw] Failed to persist session:`, err);
            }

            await this.triggerPostCallAutomation(session);
        });

        console.log(`[Ironclaw] ★ Session ended: ${sessionId} — Outcome: ${outcome}`);

        this.emit({
            type: "session_end",
            sessionId,
            timestamp: Date.now(),
            data: {
                outcome,
                duration: (session.endedAt - session.startedAt) / 1000,
                turnCount: session.turnCount,
                agentsUsed: session.agentsUsed,
                toolsCalled: session.toolsCalled,
                commitmentLevel: session.prospect.commitmentLevel,
            },
        });
    }

    private async triggerPostCallAutomation(session: IronclawSession): Promise<void> {
        const priority = session.leadScore?.priority || "nurture";

        console.log(`[Ironclaw] 🤖 Post-call automation triggered — Priority: ${priority}`);

        // ★ AGENTIC 4.0: Email transcript to Billy for EVERY conversation
        try {
            const durationSec = session.endedAt
                ? Math.round((session.endedAt - session.startedAt) / 1000)
                : Math.round((Date.now() - session.startedAt) / 1000);

            // Build a formatted transcript from IronClaw session data
            const transcriptLines: string[] = [
                `═══ BIODYNAMX CONVERSATION TRANSCRIPT ═══`,
                `Session: ${session.sessionId}`,
                `Date: ${new Date(session.startedAt).toLocaleString("en-US", { timeZone: "America/Denver" })}`,
                `Duration: ${Math.floor(durationSec / 60)}m ${durationSec % 60}s`,
                `Agents: ${session.agentsUsed.join(" → ")}`,
                `Phase: ${session.conversationPhase}`,
                `Commitment: ${session.prospect.commitmentLevel}%`,
                `Outcome: ${session.outcome || "unknown"}`,
                `═══════════════════════════════════════════`,
            ];

            if (session.auditResult) {
                transcriptLines.push(`\nAudit Result: ${JSON.stringify(session.auditResult, null, 2).substring(0, 800)}`);
            }

            const emailPayload = {
                sessionId: session.sessionId,
                prospectName: session.prospect.name,
                prospectEmail: session.prospect.email,
                prospectPhone: session.prospect.phone,
                businessUrl: session.prospect.businessUrl,
                industry: session.prospect.industry,
                leadScore: session.leadScore?.total,
                leadGrade: session.leadScore?.grade,
                leadPriority: priority as "hot" | "warm" | "nurture" | "cold",
                agentsUsed: session.agentsUsed,
                durationSeconds: durationSec,
                turnCount: session.turnCount,
                commitmentLevel: session.prospect.commitmentLevel,
                outcome: session.outcome,
                painPoints: session.prospect.painPoints,
                objections: session.prospect.objections,
                toolsCalled: session.toolsCalled,
                auditGrade: session.auditResult?.grade as string | undefined,
                auditScore: session.auditResult?.overallScore as number | undefined,
                monthlyLeak: session.auditResult?.revenueEstimate
                    ? String((session.auditResult.revenueEstimate as Record<string, unknown>)?.leakingRevenue || "")
                    : undefined,
                formattedTranscript: transcriptLines.join("\n"),
                summary: `${durationSec}s conversation with ${session.agentsUsed.join(" and ")}. ${session.prospect.name ? `Prospect: ${session.prospect.name}.` : ""} ${session.toolsCalled.length > 0 ? `Tools: ${session.toolsCalled.join(", ")}.` : ""} Outcome: ${session.outcome || "unknown"}.`,
            };

            // Fire email via API route (works from both client and server)
            if (typeof window !== "undefined") {
                fetch("/api/transcript/send", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(emailPayload),
                }).catch(err => console.warn(`[Ironclaw] Email API call failed:`, err));
            } else {
                // Server-side: direct import
                try {
                    const { sendTranscriptEmail } = await import("./email-transcript");
                    await sendTranscriptEmail(emailPayload);
                } catch (emailErr) {
                    console.warn(`[Ironclaw] Direct email failed:`, emailErr);
                }
            }

            console.log(`[Ironclaw] 📧 Transcript email queued for billy@biodynamx.com`);
        } catch (emailError) {
            console.warn(`[Ironclaw] ⚠️ Email delivery failed (non-fatal):`, emailError);
        }

        // Record learnings from this session
        if (session.prospect.painPoints.length > 0 && session.prospect.industry) {
            this.recordLearning({
                type: "pain_point",
                industry: session.prospect.industry,
                content: `Industry: ${session.prospect.industry}. Pain points mentioned: ${session.prospect.painPoints.join(", ")}`,
                confidence: 0.8,
            });
        }

        if (session.prospect.objections.length > 0) {
            for (const objection of session.prospect.objections) {
                this.recordLearning({
                    type: "objection_pattern",
                    industry: session.prospect.industry,
                    content: `Objection: "${objection}" — Outcome: ${session.outcome}`,
                    confidence: session.outcome === "converted" ? 0.9 : 0.6,
                });
            }
        }

        // ★ WEB 4.0 AUTONOMOUS ACTION ENGINE ★
        // IronClaw now does real work post-call — no more console.log stubs.
        // Everything is async and never blocks the voice stream.

        switch (priority) {

            case "hot": {
                // 🔥 HOT LEAD — Generate proposal + SMS Billy within 60 seconds
                console.log(`[Ironclaw] 🔥 HOT LEAD — Generating proposal & alerting Billy...`);
                try {
                    const proposal = await generateProposal(session);
                    await persistProposal(session, proposal);
                    await sendProposalSMSToBilly(session, proposal);
                    console.log(`[Ironclaw] ✅ HOT: Proposal delivered to Billy for ${session.prospect.name}`);
                } catch (err) {
                    console.error(`[Ironclaw] ⚠️ HOT lead proposal failed:`, err);
                    // Fallback: at least send the raw lead alert
                    try {
                        if (typeof window === "undefined") {
                            const { sendLeadAlert } = await import("./lead-alerts");
                            await sendLeadAlert({
                                name: session.prospect.name,
                                phone: session.prospect.phone,
                                email: session.prospect.email,
                                source: "ironclaw_hot_lead",
                                businessType: session.prospect.industry,
                                auditGrade: session.leadScore?.grade,
                                urgency: "hot",
                            });
                        }
                    } catch { /* silent */ }
                }
                break;
            }

            case "warm": {
                // 🌡️ WARM LEAD — Generate proposal + SMS Billy with 24hr follow-up flag
                console.log(`[Ironclaw] 🌡️ WARM LEAD — Generating proposal & scheduling 24hr follow-up...`);
                try {
                    const proposal = await generateProposal(session);
                    await persistProposal(session, proposal);
                    await sendProposalSMSToBilly(session, proposal);
                    console.log(`[Ironclaw] ✅ WARM: Proposal delivered for ${session.prospect.name}`);
                } catch (err) {
                    console.error(`[Ironclaw] ⚠️ WARM lead proposal failed:`, err);
                }
                break;
            }

            case "nurture": {
                // 📋 NURTURE — Only alert Billy if they gave contact info worth following up
                const hasContact = !!(session.prospect.phone || session.prospect.email);
                if (hasContact) {
                    console.log(`[Ironclaw] 📋 NURTURE with contact — notifying Billy (low priority)`);
                    try {
                        if (typeof window === "undefined") {
                            const { sendLeadAlert } = await import("./lead-alerts");
                            await sendLeadAlert({
                                name: session.prospect.name,
                                phone: session.prospect.phone,
                                email: session.prospect.email,
                                source: "ironclaw_nurture",
                                businessType: session.prospect.industry,
                                urgency: "cold",
                            } as LeadAlertData);
                        } else {
                            fetch("/api/leads/alert", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ name: session.prospect.name, phone: session.prospect.phone, email: session.prospect.email, source: "ironclaw_nurture", urgency: "cold" }),
                            }).catch(() => { });
                        }
                    } catch { /* silent */ }
                } else {
                    console.log(`[Ironclaw] 📋 NURTURE — No contact captured. Archiving session.`);
                }
                break;
            }

            case "cold":
                // ❄️ COLD — Archive silently, no alert (don't spam Billy)
                console.log(`[Ironclaw] ❄️ COLD — Archived. No alert sent.`);
                break;
        }

        this.emit({
            type: "nurture_triggered",
            sessionId: session.sessionId,
            timestamp: Date.now(),
            data: { priority, outcome: session.outcome },
        });
    }

    // ── Learning Engine ────────────────────────────────────────────

    /**
     * Record a learning insight for future calls.
     */
    recordLearning(learning: Omit<IronclawLearning, "id" | "timestamp" | "appliedCount">): void {
        const entry: IronclawLearning = {
            ...learning,
            id: `learn-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            timestamp: new Date().toISOString(),
            appliedCount: 0,
        };

        this.learnings.push(entry);

        // Keep last 500 learnings
        if (this.learnings.length > 500) {
            this.learnings = this.learnings.slice(-500);
        }

        console.log(`[Ironclaw] 🧠 Learning recorded: [${entry.type}] ${entry.content.substring(0, 100)}`);

        // ★ WEB 4.0: Persist learning to Supabase immediately (non-blocking)
        if (typeof window !== "undefined") {
            fetch("/api/agent-memory/learning", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(entry),
            }).catch(err => console.warn(`[Ironclaw] Learning persistence failed:`, err));
        }

        this.emit({
            type: "learning_recorded",
            sessionId: "system",
            timestamp: Date.now(),
            data: { type: entry.type, industry: entry.industry },
        });
    }

    /**
     * Get industry-specific learnings to inject into agent context.
     */
    getIndustryInsights(industry: string): string {
        const relevant = this.learnings
            .filter(l => l.industry?.toLowerCase() === industry.toLowerCase())
            .sort((a, b) => b.confidence - a.confidence)
            .slice(0, 10);

        if (relevant.length === 0) return "";

        const parts = ["═══ IRONCLAW INDUSTRY INTELLIGENCE ═══"];
        parts.push(`Insights from ${relevant.length} previous interactions with ${industry} businesses:\n`);

        const painPoints = relevant.filter(l => l.type === "pain_point");
        const objections = relevant.filter(l => l.type === "objection_pattern");
        const wins = relevant.filter(l => l.type === "winning_phrase");

        if (painPoints.length > 0) {
            parts.push("Common pain points:");
            painPoints.forEach(p => parts.push(`  • ${p.content}`));
        }

        if (objections.length > 0) {
            parts.push("\nObjections you may encounter:");
            objections.forEach(o => parts.push(`  • ${o.content}`));
        }

        if (wins.length > 0) {
            parts.push("\nPhrases that have worked before:");
            wins.forEach(w => parts.push(`  • ${w.content}`));
        }

        return parts.join("\n");
    }

    // ── Proactive Visual Decisions ─────────────────────────────────

    /**
     * Based on the current session state, determine what visual
     * should be displayed NEXT. This is proactive — not reactive.
     */
    getRecommendedVisual(sessionId: string): { sceneId: string; reason: string } | null {
        const session = this.sessions.get(sessionId);
        if (!session) return null;

        switch (session.conversationPhase) {
            case "greeting":
                return { sceneId: "welcome", reason: "Session just started" };
            case "discovery":
                if (session.prospect.industry) {
                    return { sceneId: "industry_showcase", reason: `Industry detected: ${session.prospect.industry}` };
                }
                return null;
            case "audit_reveal":
                return { sceneId: "seo_dashboard", reason: "Audit results ready" };
            case "solution":
                return { sceneId: "roi_visualization", reason: "Moving to solution presentation" };
            case "pricing":
                return { sceneId: "pricing_showcase", reason: "Pricing discussion" };
            case "close_attempt":
                return { sceneId: "checkout", reason: "Close attempt detected" };
            default:
                return null;
        }
    }

    // ── Event System ───────────────────────────────────────────────

    on(eventType: string, callback: EventCallback): void {
        const listeners = this.eventListeners.get(eventType) || [];
        listeners.push(callback);
        this.eventListeners.set(eventType, listeners);
    }

    private emit(event: IronclawEvent): void {
        this.eventQueue.push(event);

        // Notify listeners
        const listeners = this.eventListeners.get(event.type) || [];
        const allListeners = this.eventListeners.get("*") || [];

        for (const listener of [...listeners, ...allListeners]) {
            try {
                listener(event);
            } catch (err) {
                console.error(`[Ironclaw] Event listener error:`, err);
            }
        }
    }

    // ── Background Operation Queue ─────────────────────────────────

    /**
     * Run an operation in the background without blocking the voice stream.
     * Failed operations are logged but never crash the system.
     */
    private backgroundOp(fn: () => Promise<void>): void {
        const op = fn().catch(err => {
            console.error(`[Ironclaw] ⚠️ Background operation failed:`, err);
        });

        this.pendingOps.push(op);

        // Clean up completed ops periodically
        if (this.pendingOps.length > 100) {
            this.pendingOps = this.pendingOps.filter(p => {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const state = (p as any)._state;
                return state === undefined; // Only keep pending promises
            });
        }
    }

    /**
     * Wait for all pending operations to complete (used during shutdown).
     */
    async flush(): Promise<void> {
        if (this.pendingOps.length > 0) {
            console.log(`[Ironclaw] ⏳ Flushing ${this.pendingOps.length} pending operations...`);
            await Promise.allSettled(this.pendingOps);
            this.pendingOps = [];
            console.log(`[Ironclaw] ✅ All operations flushed.`);
        }
    }

    // ── Status & Metrics ───────────────────────────────────────────

    getStatus(): Record<string, unknown> {
        return {
            activeSessions: this.sessions.size,
            totalSessions: this.metrics.totalSessions,
            conversions: this.metrics.conversions,
            totalRevenue: this.metrics.totalRevenue,
            totalLearnings: this.learnings.length,
            pendingOps: this.pendingOps.length,
            topIndustries: Object.fromEntries(this.metrics.topIndustries),
            topPainPoints: Object.fromEntries(
                [...this.metrics.topPainPoints.entries()]
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10)
            ),
            topObjections: Object.fromEntries(
                [...this.metrics.topObjections.entries()]
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 10)
            ),
        };
    }

    /**
     * Generate a full context dump for an agent (used during handoffs).
     */
    generateHandoffContext(sessionId: string): string {
        const session = this.sessions.get(sessionId);
        if (!session) return "";

        const parts = [
            "═══ IRONCLAW HANDOFF INTELLIGENCE ═══",
            `Session Duration: ${Math.round((Date.now() - session.startedAt) / 1000)}s`,
            `Conversation Phase: ${session.conversationPhase}`,
            `Commitment Level: ${session.prospect.commitmentLevel}/100`,
            `Turn Count: ${session.turnCount}`,
            `Agents Used: ${session.agentsUsed.join(", ")}`,
            `Tools Called: ${session.toolsCalled.join(", ") || "none"}`,
            `Visuals Shown: ${session.visualsShown.join(", ") || "none"}`,
        ];

        if (session.prospect.name) parts.push(`\nProspect: ${session.prospect.name}`);
        if (session.prospect.industry) parts.push(`Industry: ${session.prospect.industry}`);
        if (session.prospect.businessUrl) parts.push(`Website: ${session.prospect.businessUrl}`);
        if (session.prospect.painPoints.length > 0) {
            parts.push(`Pain Points: ${session.prospect.painPoints.join(", ")}`);
        }
        if (session.prospect.objections.length > 0) {
            parts.push(`Objections Raised: ${session.prospect.objections.join(", ")}`);
        }

        if (session.auditResult) {
            parts.push("\n── AUDIT DATA ──");
            parts.push(JSON.stringify(session.auditResult, null, 2).substring(0, 1000));
        }

        if (session.leadScore) {
            parts.push(`\nLead Score: ${session.leadScore.total}/100 (${session.leadScore.grade}) — ${session.leadScore.priority.toUpperCase()}`);
        }

        return parts.join("\n");
    }
}

// ── Singleton ──────────────────────────────────────────────────────

let instance: IronclawCore | null = null;

export function getIronclaw(): IronclawCore {
    if (!instance) {
        instance = new IronclawCore();
        console.log("[Ironclaw] ★ Core initialized — The Steel Heart is beating.");
    }
    return instance;
}

export function resetIronclaw(): void {
    instance = null;
}
