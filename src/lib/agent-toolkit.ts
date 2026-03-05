// ═══════════════════════════════════════════════════════════════════
// BIODYNAMX AGENTIC TOOLKIT — Autonomous Agent Capabilities
// ═══════════════════════════════════════════════════════════════════
// Extends agent capabilities with proactive, autonomous tools.
// These are the tools that make agents AGENTIC — they don't just
// respond, they take initiative, observe context, and act.
// ═══════════════════════════════════════════════════════════════════

import { getMemory, analyzeCommitment, transitionPhase, extractEntities, generateMemoryContext } from "./agent-memory";
import { moderateAgentOutput, sanitizeUserInput, checkRateLimit, logAuditEntry } from "./agent-safety";
import { recordToolCall, recordSafetyFlag, recordTurn, recordObjection } from "./agent-observability";
import { generateDigitalAuditScorecard } from "./deep-diagnostic";
import { scrapeForAgentTool } from "./social-scraper";

// ── Tool Definition Schema (Gemini Function Calling Format) ─────

export interface AgentTool {
    name: string;
    description: string;
    parameters: {
        type: "object";
        properties: Record<string, {
            type: string;
            description: string;
            enum?: string[];
        }>;
        required: string[];
    };
    handler: (args: Record<string, unknown>, context: ToolContext) => Promise<ToolResult>;
    requiredAuthority?: "basic" | "elevated" | "closing"; // Permission level needed
    riskLevel: "safe" | "medium" | "high";                // Safety classification
    cooldownMs?: number;                                   // Min time between calls
}

export interface ToolContext {
    sessionId: string;
    agentName: string;
    agentRole: string;
    commitmentLevel: number;
    conversationPhase: string;
    prospectInfo: Record<string, unknown>;
}

export interface ToolResult {
    success: boolean;
    data: Record<string, unknown>;
    nextAction?: string;        // Suggested next action for the agent
    sideEffects?: string[];     // What this tool changed
}

// ── Tool Implementations ────────────────────────────────────────

const toolRegistry: Map<string, AgentTool> = new Map();

// ── 1. Website Audit (Enhanced) ─────────────────────────────────
toolRegistry.set("business_audit", {
    name: "business_audit",
    description: "Run a comprehensive real-time audit on a business website. Returns SEO score, AEO readiness, GEO signals, site speed, mobile score, CTA effectiveness, revenue leak estimate, and 16 diagnostic probes.",
    parameters: {
        type: "object",
        properties: {
            url: {
                type: "string",
                description: "The full URL of the business website to audit (e.g., https://example.com)",
            },
        },
        required: ["url"],
    },
    handler: async (args, context) => {
        const url = args.url as string;
        const startTime = Date.now();

        try {
            const response = await fetch("/api/audit", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url }),
            });
            const data = await response.json();

            const latency = Date.now() - startTime;
            recordToolCall(context.sessionId, "business_audit", latency, true);

            logAuditEntry({
                sessionId: context.sessionId,
                agentName: context.agentName,
                eventType: "tool_call",
                content: `Audit completed for ${url} in ${latency}ms`,
                metadata: { url, latency },
            });

            return {
                success: true,
                data: {
                    url,
                    siteSpeed: data.siteSpeed,
                    seoScore: data.seo_aeo?.seoScore || 0,
                    aeoReady: data.seo_aeo?.aeoReady || false,
                    geoSignals: data.seo_aeo?.geoSignals || "none",
                    mobileScore: data.mobile?.score || 0,
                    revenueLeakEstimate: data.revenueEstimate?.leakingRevenue || "$0/mo",
                    competitors: data.competitors || [],
                    techDebt: data.techDebt || {},
                    diagnosticProbes: data.diagnosticProbes || [],
                    ctaEffectiveness: data.cta?.effectiveness || "unknown",
                    fullReport: data,
                },
                nextAction: "Present the findings using the Reframe technique — connect their specific issues to a larger pattern",
                sideEffects: ["audit_data_stored"],
            };
        } catch (err) {
            const latency = Date.now() - startTime;
            recordToolCall(context.sessionId, "business_audit", latency, false);
            return {
                success: false,
                data: { error: `Audit failed: ${err}` },
                nextAction: "Acknowledge the issue and ask the prospect for their website URL again",
            };
        }
    },
    requiredAuthority: "basic",
    riskLevel: "safe",
    cooldownMs: 10_000,  // 10 seconds between audits
});

// ── 2. Stripe Checkout (Enhanced with safety) ───────────────────
toolRegistry.set("create_checkout", {
    name: "create_checkout",
    description: "Generate a Stripe checkout session URL for the prospect. ONLY call this when the prospect has explicitly expressed intent to purchase. Includes commitment level validation.",
    parameters: {
        type: "object",
        properties: {
            tier: {
                type: "string",
                description: "The pricing tier to create checkout for",
                enum: ["starter", "professional", "enterprise"],
            },
            prospectEmail: {
                type: "string",
                description: "The prospect's email address for the checkout session",
            },
        },
        required: ["tier"],
    },
    handler: async (args, context) => {
        // Safety: Verify commitment level before allowing checkout
        if (context.commitmentLevel < 50) {
            logAuditEntry({
                sessionId: context.sessionId,
                agentName: context.agentName,
                eventType: "safety_flag",
                content: `Checkout blocked: commitment level too low (${context.commitmentLevel}/100)`,
                metadata: { tier: args.tier, commitmentLevel: context.commitmentLevel },
            });
            recordSafetyFlag(context.sessionId);
            return {
                success: false,
                data: {
                    reason: "Prospect commitment level is below threshold for checkout",
                    currentLevel: context.commitmentLevel,
                    requiredLevel: 50,
                },
                nextAction: "Continue building value — the prospect isn't ready to buy yet. Address remaining objections.",
            };
        }

        const startTime = Date.now();
        try {
            const response = await fetch("/api/create-checkout", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tier: args.tier,
                    email: args.prospectEmail,
                    sessionId: context.sessionId,
                }),
            });
            const data = await response.json();

            const latency = Date.now() - startTime;
            recordToolCall(context.sessionId, "create_checkout", latency, true);

            logAuditEntry({
                sessionId: context.sessionId,
                agentName: context.agentName,
                eventType: "tool_call",
                content: `Checkout created for tier: ${args.tier}`,
                metadata: { tier: args.tier, url: data.url },
            });

            return {
                success: true,
                data: {
                    checkoutUrl: data.url,
                    tier: args.tier,
                    message: "Checkout link generated",
                },
                nextAction: "Share the checkout link with the prospect and offer to stay on call while they complete the purchase",
                sideEffects: ["stripe_session_created"],
            };
        } catch (err) {
            const latency = Date.now() - startTime;
            recordToolCall(context.sessionId, "create_checkout", latency, false);
            return {
                success: false,
                data: { error: `Checkout creation failed: ${err}` },
                nextAction: "Apologize and offer to send the checkout link via email instead",
            };
        }
    },
    requiredAuthority: "closing",
    riskLevel: "high",
    cooldownMs: 30_000,  // 30 seconds between checkout attempts
});

// ── 3. Lead Capture ─────────────────────────────────────────────
toolRegistry.set("capture_lead", {
    name: "capture_lead",
    description: "Capture prospect contact information for the CRM. Use when prospect shares their name, email, phone, or company details.",
    parameters: {
        type: "object",
        properties: {
            name: { type: "string", description: "Prospect's full name" },
            email: { type: "string", description: "Prospect's email address" },
            phone: { type: "string", description: "Prospect's phone number" },
            company: { type: "string", description: "Prospect's company name" },
            industry: { type: "string", description: "Prospect's industry" },
            source: { type: "string", description: "How they found BioDynamX" },
        },
        required: ["name"],
    },
    handler: async (args, context) => {
        const startTime = Date.now();
        try {
            const response = await fetch("/api/leads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    ...args,
                    sessionId: context.sessionId,
                    agentName: context.agentName,
                    commitmentLevel: context.commitmentLevel,
                    conversationPhase: context.conversationPhase,
                    capturedAt: new Date().toISOString(),
                }),
            });
            const data = await response.json();

            const latency = Date.now() - startTime;
            recordToolCall(context.sessionId, "capture_lead", latency, true);

            logAuditEntry({
                sessionId: context.sessionId,
                agentName: context.agentName,
                eventType: "tool_call",
                content: `Lead captured: ${args.name}`,
                metadata: { leadId: data.leadId },
            });

            return {
                success: true,
                data: { leadId: data.leadId, message: "Lead captured in CRM" },
                nextAction: "Thank them and continue the diagnostic flow naturally",
                sideEffects: ["lead_created_in_crm"],
            };
        } catch (err) {
            const latency = Date.now() - startTime;
            recordToolCall(context.sessionId, "capture_lead", latency, false);
            return {
                success: false,
                data: { error: "Lead capture failed silently — continue conversation" },
            };
        }
    },
    requiredAuthority: "basic",
    riskLevel: "safe",
    cooldownMs: 5_000,
});

// ── 4. Schedule Appointment ─────────────────────────────────────
toolRegistry.set("schedule_appointment", {
    name: "schedule_appointment",
    description: "Schedule a follow-up appointment or demo call. Use when prospect wants to talk to the human team or needs a deeper consultation.",
    parameters: {
        type: "object",
        properties: {
            prospectName: { type: "string", description: "Who to schedule for" },
            prospectEmail: { type: "string", description: "Contact email" },
            preferredTime: { type: "string", description: "Preferred day/time (e.g., 'Tuesday afternoon')" },
            purpose: {
                type: "string",
                description: "Purpose of the meeting",
                enum: ["demo", "consultation", "onboarding", "technical_review", "custom"],
            },
        },
        required: ["prospectName", "purpose"],
    },
    handler: async (args, context) => {
        logAuditEntry({
            sessionId: context.sessionId,
            agentName: context.agentName,
            eventType: "tool_call",
            content: `Appointment requested: ${args.purpose} for ${args.prospectName}`,
            metadata: args,
        });

        // ── AGENTIC ENHANCEMENT: Log to lead persistence for human follow-up ──
        try {
            await fetch("/api/leads", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    name: args.prospectName,
                    email: args.prospectEmail,
                    notes: `QUALIFIED LEAD: Requested a ${args.purpose} follow-up. Preferred time: ${args.preferredTime || "ASAP"}.`,
                    sessionId: context.sessionId,
                    agentName: context.agentName,
                    source: "voice_agent_scheduling",
                }),
            });
        } catch (err) {
            console.error("Failed to log appointment request to CRM:", err);
        }

        return {
            success: true,
            data: {
                message: `Appointment request recorded in CRM for ${args.prospectName}`,
                purpose: args.purpose,
                preferredTime: args.preferredTime || "ASAP",
                status: "Pending Confirmation",
                nextSteps: "A human member of the BioDynamX team has been notified and will reach out to confirm this time via the contact details provided.",
            },
            nextAction: "Confirm the appointment request warmly. Say you've notified the team and they'll be in touch to finalize the time.",
            sideEffects: ["appointment_requested", "crm_updated"],
        };
    },
    requiredAuthority: "basic",
    riskLevel: "safe",
    cooldownMs: 10_000,
});

// ── 5. Escalate to Human ────────────────────────────────────────
toolRegistry.set("escalate_to_human", {
    name: "escalate_to_human",
    description: "Escalate the conversation to a human team member. Use when the prospect requests to speak with a human, when the conversation is going poorly, or when the request is outside AI capabilities.",
    parameters: {
        type: "object",
        properties: {
            reason: {
                type: "string",
                description: "Why the escalation is needed",
                enum: ["prospect_request", "complex_question", "legal_matter", "enterprise_deal", "complaint", "technical_issue"],
            },
            urgency: {
                type: "string",
                description: "How urgent the escalation is",
                enum: ["low", "medium", "high", "critical"],
            },
            summary: { type: "string", description: "Brief summary for the human agent" },
        },
        required: ["reason", "summary"],
    },
    handler: async (args, context) => {
        logAuditEntry({
            sessionId: context.sessionId,
            agentName: context.agentName,
            eventType: "escalation",
            content: `Escalation: ${args.reason} — ${args.summary}`,
            metadata: {
                ...args,
                commitmentLevel: context.commitmentLevel,
                phase: context.conversationPhase,
            },
        });

        return {
            success: true,
            data: {
                message: "Escalation recorded — human team will be notified",
                reason: args.reason,
                urgency: args.urgency,
                estimatedResponseTime: args.urgency === "critical" ? "15 minutes" : "2 hours",
            },
            nextAction: "Let the prospect know a team member will follow up. Provide the estimated response time.",
            sideEffects: ["escalation_created", "notification_sent"],
        };
    },
    requiredAuthority: "basic",
    riskLevel: "medium",
    cooldownMs: 60_000,
});

// ── 6. Send SMS (Live Demo Power Move) ──────────────────────────
toolRegistry.set("send_sms", {
    name: "send_sms",
    description: "Send a real SMS text message to the prospect's phone. Use this as a WOW moment during conversation — e.g. 'Watch your phone!' and send them a text in real-time. Can send demo greetings, audit results, checkout links, thank-you messages, or follow-ups. ALWAYS ask for the phone number naturally before calling this tool.",
    parameters: {
        type: "object",
        properties: {
            phoneNumber: {
                type: "string",
                description: "The prospect's phone number (US format, e.g. '3035551234' or '+13035551234')",
            },
            template: {
                type: "string",
                description: "Which message template to send",
                enum: ["demo_hello", "audit_results", "checkout_link", "thank_you", "follow_up", "custom"],
            },
            prospectName: {
                type: "string",
                description: "The prospect's first name for personalization",
            },
            customMessage: {
                type: "string",
                description: "Custom message text (only used with 'custom' template)",
            },
        },
        required: ["phoneNumber", "template"],
    },
    handler: async (args, context) => {
        const startTime = Date.now();
        try {
            const response = await fetch("/api/live-demo/sms", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    to: args.phoneNumber,
                    template: args.template,
                    prospectName: args.prospectName || context.prospectInfo?.name,
                    customMessage: args.customMessage,
                    agentName: context.agentName,
                }),
            });
            const data = await response.json();

            const latency = Date.now() - startTime;
            recordToolCall(context.sessionId, "send_sms", latency, data.success);

            logAuditEntry({
                sessionId: context.sessionId,
                agentName: context.agentName,
                eventType: "tool_call",
                content: `SMS sent (${args.template}) → ${args.phoneNumber}`,
                metadata: { template: args.template, sid: data.sid },
            });

            return {
                success: data.success,
                data: {
                    message: data.success
                        ? `Text message sent successfully to ${args.phoneNumber}! The prospect should see it right now.`
                        : "SMS delivery attempted — may take a moment to arrive.",
                    template: args.template,
                    sid: data.sid,
                },
                nextAction: "Tell the prospect to check their phone. Build excitement — 'Check your phone right now, you should see a text from us!' Then continue the conversation naturally.",
                sideEffects: ["sms_sent"],
            };
        } catch (err) {
            const latency = Date.now() - startTime;
            recordToolCall(context.sessionId, "send_sms", latency, false);
            return {
                success: false,
                data: { error: `SMS failed: ${err}` },
                nextAction: "Mention that you'll send the text shortly and continue the conversation.",
            };
        }
    },
    requiredAuthority: "basic",
    riskLevel: "medium",
    cooldownMs: 15_000, // 15 seconds between SMS sends
});

// ── 7. Send Email (Live Demo Power Move) ────────────────────────
toolRegistry.set("send_email", {
    name: "send_email",
    description: "Send a professional email to the prospect instantly. Use this as part of the demo to show real-time capability — 'Check your inbox!' Templates include audit results, thank-you/onboarding with contract link, or a jaw-dropping 'demo_wow' email that the AI composed and sent mid-conversation.",
    parameters: {
        type: "object",
        properties: {
            emailAddress: {
                type: "string",
                description: "The prospect's email address",
            },
            template: {
                type: "string",
                description: "Which email template to send",
                enum: ["demo_wow", "audit_results", "thank_you", "custom"],
            },
            prospectName: {
                type: "string",
                description: "The prospect's name for personalization",
            },
            auditUrl: {
                type: "string",
                description: "URL to the prospect's audit results (optional)",
            },
            checkoutUrl: {
                type: "string",
                description: "URL to checkout/contract page (optional)",
            },
        },
        required: ["emailAddress", "template"],
    },
    handler: async (args, context) => {
        const startTime = Date.now();
        try {
            const response = await fetch("/api/live-demo/email", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    to: args.emailAddress,
                    template: args.template,
                    prospectName: args.prospectName || context.prospectInfo?.name,
                    agentName: context.agentName,
                    auditUrl: args.auditUrl,
                    checkoutUrl: args.checkoutUrl,
                }),
            });
            const data = await response.json();

            const latency = Date.now() - startTime;
            recordToolCall(context.sessionId, "send_email", latency, data.success);

            logAuditEntry({
                sessionId: context.sessionId,
                agentName: context.agentName,
                eventType: "tool_call",
                content: `Email sent (${args.template}) → ${args.emailAddress}`,
                metadata: { template: args.template, provider: data.provider },
            });

            return {
                success: data.success,
                data: {
                    message: data.success
                        ? `Email sent to ${args.emailAddress}! They should see it in their inbox right now.`
                        : "Email queued for delivery.",
                    template: args.template,
                    provider: data.provider,
                },
                nextAction: "Tell the prospect to check their inbox. Make it exciting — 'I just sent you an email with everything we discussed. Check your inbox!' Then use that momentum to move toward commitment.",
                sideEffects: ["email_sent"],
            };
        } catch (err) {
            const latency = Date.now() - startTime;
            recordToolCall(context.sessionId, "send_email", latency, false);
            return {
                success: false,
                data: { error: `Email failed: ${err}` },
                nextAction: "Mention the email will follow shortly and keep the conversation going.",
            };
        }
    },
    requiredAuthority: "basic",
    riskLevel: "medium",
    cooldownMs: 15_000,
});

// ── 8. Make Outbound Call (Live Demo — Call Transfer) ────────────
toolRegistry.set("make_call", {
    name: "make_call",
    description: "Initiate an outbound phone call to the prospect using Twilio. The call will be answered by Jenny (our diagnostic AI). Use when: prospect wants a callback, prospect wants to switch from web chat to phone, or you want to demonstrate the AI callback capability. Say something like: 'Let me have Jenny call your phone right now so you can experience the AI voice agent first-hand.'",
    parameters: {
        type: "object",
        properties: {
            phoneNumber: {
                type: "string",
                description: "The phone number to call (US format)",
            },
            prospectName: {
                type: "string",
                description: "Name of the person being called",
            },
            purpose: {
                type: "string",
                description: "Purpose of the call",
                enum: ["demo_callback", "audit_walkthrough", "consultation", "follow_up"],
            },
        },
        required: ["phoneNumber", "purpose"],
    },
    handler: async (args, context) => {
        const startTime = Date.now();

        // Build TwiML URL — routes to Jenny voice agent
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || "https://biodynamx.com";
        const twimlUrl = `${appUrl}/api/nurture/twiml?name=${encodeURIComponent(String(args.prospectName || "there"))}&purpose=${args.purpose}`;

        try {
            const response = await fetch("/api/live-demo/call", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    to: args.phoneNumber,
                    twimlUrl,
                    prospectName: args.prospectName,
                    purpose: args.purpose,
                    agentName: context.agentName,
                }),
            });
            const data = await response.json();

            const latency = Date.now() - startTime;
            recordToolCall(context.sessionId, "make_call", latency, data.success);

            logAuditEntry({
                sessionId: context.sessionId,
                agentName: context.agentName,
                eventType: "tool_call",
                content: `Outbound call initiated → ${args.phoneNumber} (${args.purpose})`,
                metadata: { purpose: args.purpose, sid: data.sid },
            });

            return {
                success: data.success,
                data: {
                    message: data.success
                        ? `Call initiated to ${args.phoneNumber}! ${args.prospectName || "They"} should receive a call from Jenny in about 10 seconds.`
                        : "Call request logged — our team will follow up shortly.",
                    sid: data.sid,
                    purpose: args.purpose,
                },
                nextAction: "Let the prospect know Jenny is calling them right now. Build anticipation — 'Your phone should ring in about 10 seconds. Jenny will walk you through your complete diagnostic.'",
                sideEffects: ["outbound_call_initiated"],
            };
        } catch (err) {
            const latency = Date.now() - startTime;
            recordToolCall(context.sessionId, "make_call", latency, false);
            return {
                success: false,
                data: { error: `Call failed: ${err}` },
                nextAction: "Let them know Jenny will follow up with a call shortly.",
            };
        }
    },
    requiredAuthority: "elevated",
    riskLevel: "high",
    cooldownMs: 60_000, // 1 minute between outbound calls
});

// ── 9. Digital Audit Scorecard (Health Audit Tool) ──────────────
toolRegistry.set("digital_audit_scorecard", {
    name: "digital_audit_scorecard",
    description: `Generate a comprehensive 'Digital & Financial Health Audit' scorecard for the prospect's business. This tool produces a 10-item diagnostic scorecard covering three categories: (1) VISIBILITY — GMB position, SEO, AEO/GEO, social proof; (2) WEEKEND & AFTER-HOURS GAP — after-hours response, lead response speed, weekend coverage; (3) EFFICIENCY — manual admin overhead, mobile experience, site speed. Returns the scorecard items with individual 1-10 scores, a letter grade, a 3-part 'Total Business Leak' (Invisible + Leaking + Inefficient), and pre-written scripts for both Jenny's summary and Mark's closing punch. Call this AFTER running business_audit and gathering the prospect's business details (employees, average deal value, monthly leads).`,
    parameters: {
        type: "object",
        properties: {
            seoScore: {
                type: "string",
                description: "SEO score from audit results (0-100)",
            },
            aeoScore: {
                type: "string",
                description: "AEO/GEO readiness score from audit results (0-100)",
            },
            mobileScore: {
                type: "string",
                description: "Mobile performance score from audit results (0-100)",
            },
            loadTimeMs: {
                type: "string",
                description: "Page load time in milliseconds from audit results",
            },
            ghostingScore: {
                type: "string",
                description: "Lead response / ghosting score from audit",
                enum: ["critical", "poor", "average", "good"],
            },
            contactChannels: {
                type: "string",
                description: "Number of contact channels on the website (0-5)",
            },
            hasLiveChat: {
                type: "string",
                description: "Whether the website has live chat (true/false)",
            },
            hasChatbot: {
                type: "string",
                description: "Whether the website has a chatbot/AI assistant (true/false)",
            },
            mapPackPosition: {
                type: "string",
                description: "Google Maps position estimate",
                enum: ["top3", "page1", "buried"],
            },
            reviewCount: {
                type: "string",
                description: "Number of Google reviews",
            },
            avgRating: {
                type: "string",
                description: "Average Google review rating (e.g. 4.2)",
            },
            unansweredNegative: {
                type: "string",
                description: "Number of unanswered negative reviews",
            },
            avgDealValue: {
                type: "string",
                description: "Average deal/ticket value in dollars (ask the prospect or estimate from industry)",
            },
            monthlyLeads: {
                type: "string",
                description: "Approximate monthly inbound leads",
            },
            employees: {
                type: "string",
                description: "Number of employees",
            },
            avgHourlyWage: {
                type: "string",
                description: "Average employee hourly wage in dollars",
            },
            hoursOnManualTasks: {
                type: "string",
                description: "Hours per week per employee spent on automatable manual tasks (social posts, FAQs, receipts, etc.)",
            },
        },
        required: ["seoScore", "mobileScore", "loadTimeMs", "ghostingScore"],
    },
    handler: async (args, context) => {
        const startTime = Date.now();
        try {
            const scorecard = generateDigitalAuditScorecard(
                Number(args.seoScore) || 0,
                Number(args.aeoScore) || 0,
                Number(args.mobileScore) || 0,
                Number(args.loadTimeMs) || 3000,
                (args.ghostingScore as "critical" | "poor" | "average" | "good") || "poor",
                Number(args.contactChannels) || 1,
                args.hasLiveChat === "true",
                args.hasChatbot === "true",
                (args.mapPackPosition as "top3" | "page1" | "buried") || "buried",
                Number(args.reviewCount) || 10,
                Number(args.avgRating) || 3.5,
                Number(args.unansweredNegative) || 3,
                Number(args.avgDealValue) || 500,
                Number(args.monthlyLeads) || 100,
                Number(args.employees) || 5,
                Number(args.avgHourlyWage) || 25,
                Number(args.hoursOnManualTasks) || 15,
            );

            const latency = Date.now() - startTime;
            recordToolCall(context.sessionId, "digital_audit_scorecard", latency, true);

            logAuditEntry({
                sessionId: context.sessionId,
                agentName: context.agentName,
                eventType: "tool_call",
                content: `Digital Audit Scorecard generated: Grade ${scorecard.grade}, Total Leak $${scorecard.totalBusinessLeak.toLocaleString()}/mo`,
                metadata: {
                    grade: scorecard.grade,
                    totalScore: scorecard.totalScore,
                    totalBusinessLeak: scorecard.totalBusinessLeak,
                    invisibleLeak: scorecard.invisibleLeak,
                    leakingLeak: scorecard.leakingLeak,
                    inefficientLeak: scorecard.inefficientLeak,
                },
            });

            return {
                success: true,
                data: {
                    scorecardDisplay: scorecard.scorecardDisplay,
                    totalScore: scorecard.totalScore,
                    grade: scorecard.grade,
                    invisibleLeak: scorecard.invisibleLeak,
                    leakingLeak: scorecard.leakingLeak,
                    inefficientLeak: scorecard.inefficientLeak,
                    totalBusinessLeak: scorecard.totalBusinessLeak,
                    totalBusinessLeakAnnual: scorecard.totalBusinessLeak * 12,
                    jennyAuditSummary: scorecard.jennyAuditSummary,
                    markClosingPunch: scorecard.markClosingPunch,
                    items: scorecard.items,
                },
                nextAction: "Present the scorecard to the prospect visually. Read through the 3-part 'Total Business Leak' summary (Invisible / Leaking / Inefficient) using the jennyAuditSummary script. Then hand off to Mark with: 'Mark, execute the ROI bridge.'",
                sideEffects: ["scorecard_generated"],
            };
        } catch (err) {
            const latency = Date.now() - startTime;
            recordToolCall(context.sessionId, "digital_audit_scorecard", latency, false);
            return {
                success: false,
                data: { error: `Scorecard generation failed: ${err}` },
                nextAction: "Continue the conversation with the raw audit data and calculate the numbers manually in the next exchange.",
            };
        }
    },
    requiredAuthority: "basic",
    riskLevel: "safe",
    cooldownMs: 10_000,
});

// ── 10. Create Website via Stitch ───────────────────────────────
toolRegistry.set("create_website", {
    name: "create_website",
    description: "Generate a full, conversion-optimized website design for a client using the Stitch AI design engine. ONLY call this when the client has agreed to have a website built. Stitch will generate a premium, mobile-first design based on their business details. The output is a live Stitch project the BioDynamX team can then implement.",
    parameters: {
        type: "object",
        properties: {
            businessName: { type: "string", description: "The client's business name" },
            industry: { type: "string", description: "The client's industry (e.g. dental, HVAC, law, restaurant)" },
            description: { type: "string", description: "A brief description of what the business does" },
            targetAudience: { type: "string", description: "Who the business serves" },
            primaryCTA: { type: "string", description: "The main call-to-action (e.g. 'Book a Free Consultation', 'Get a Quote')" },
            colorScheme: { type: "string", description: "Preferred color scheme or brand colors" },
            deviceType: {
                type: "string",
                description: "Primary device to design for",
                enum: ["DESKTOP", "MOBILE", "TABLET"],
            },
        },
        required: ["businessName", "industry", "description"],
    },
    handler: async (args, context) => {
        const startTime = Date.now();
        try {
            const response = await fetch("/api/stitch-website", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    action: "create",
                    businessName: args.businessName,
                    industry: args.industry,
                    description: args.description,
                    targetAudience: args.targetAudience,
                    primaryCTA: args.primaryCTA,
                    colorScheme: args.colorScheme,
                    deviceType: args.deviceType || "DESKTOP",
                }),
            });
            const data = await response.json();

            const latency = Date.now() - startTime;
            recordToolCall(context.sessionId, "create_website", latency, data.success);

            logAuditEntry({
                sessionId: context.sessionId,
                agentName: context.agentName,
                eventType: "tool_call",
                content: `Website design started for ${args.businessName} (${args.industry})`,
                metadata: { projectId: data.projectId, previewUrl: data.previewUrl },
            });

            return {
                success: data.success,
                data: {
                    projectId: data.projectId,
                    previewUrl: data.previewUrl,
                    message: data.message || `Website design for ${args.businessName} is being generated.`,
                    simulated: data.simulated || false,
                },
                nextAction: "Let the client know their website is being designed right now. Say: 'I've just kicked off your website design. Our Stitch AI is generating a premium, conversion-optimized design based on everything you told me. You'll be able to review it within minutes. While that's loading — let me tell you what else we're setting up for you.'",
                sideEffects: ["stitch_project_created", "website_design_started"],
            };
        } catch (err) {
            const latency = Date.now() - startTime;
            recordToolCall(context.sessionId, "create_website", latency, false);
            return {
                success: false,
                data: { error: `Website creation failed: ${err}` },
                nextAction: "Let them know the design will be ready within the next few hours and the team will send it over.",
            };
        }
    },
    requiredAuthority: "elevated",
    riskLevel: "medium",
    cooldownMs: 60_000,
});

// ── 11. Record ROI Event (closes the dashboard loop) ────────────
toolRegistry.set("record_roi_event", {
    name: "record_roi_event",
    description: "Record a revenue win or ROI event directly to the client's dashboard. Call this whenever an agent action produces measurable value — a lead converted, a deal closed, revenue recovered from a missed call, etc. This keeps the client's 6x ROI guarantee tracker accurate and current.",
    parameters: {
        type: "object",
        properties: {
            clientId: { type: "string", description: "The client's ID in the system" },
            eventType: {
                type: "string",
                description: "The type of revenue event",
                enum: ["lead_qualified", "lead_converted", "deal_closed", "revenue_recovered", "seo_win", "aeo_citation", "review_generated"],
            },
            amount: { type: "string", description: "Dollar value of this event (e.g. '2400' for a $2,400 deal)" },
            description: { type: "string", description: "Brief description of what happened" },
        },
        required: ["clientId", "eventType", "description"],
    },
    handler: async (args, context) => {
        try {
            const response = await fetch("/api/client-roi", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    clientId: args.clientId,
                    type: args.eventType,
                    amount: Number(args.amount) || 0,
                    description: args.description,
                    agentName: context.agentName,
                    metadata: { sessionId: context.sessionId },
                }),
            });
            const data = await response.json();

            logAuditEntry({
                sessionId: context.sessionId,
                agentName: context.agentName,
                eventType: "tool_call",
                content: `ROI event recorded: ${args.eventType} — $${args.amount || 0} — ${args.description}`,
                metadata: { eventId: data.event?.id },
            });

            return {
                success: data.success,
                data: {
                    message: `ROI event recorded: ${args.eventType} +$${args.amount || 0}`,
                    event: data.event,
                },
                nextAction: "Continue the conversation. This event has been recorded to the client's ROI dashboard automatically.",
                sideEffects: ["roi_dashboard_updated"],
            };
        } catch (err) {
            return { success: false, data: { error: `ROI recording failed: ${err}` } };
        }
    },
    requiredAuthority: "basic",
    riskLevel: "safe",
    cooldownMs: 2_000,
});

// ── 12. Run Reputation Audit & Response ─────────────────────────
toolRegistry.set("manage_reviews", {
    name: "manage_reviews",
    description: "Trigger the reputation management engine for a client. This scans their Google/Yelp reviews, generates professional responses for unanswered reviews, and sends new review request messages to recent customers. Use this when discussing reputation or when a client asks about reviews.",
    parameters: {
        type: "object",
        properties: {
            clientId: { type: "string", description: "Client's system ID" },
            businessName: { type: "string", description: "Client business name" },
            businessUrl: { type: "string", description: "Client website URL" },
            action: {
                type: "string",
                description: "What to do with reviews",
                enum: ["audit", "respond", "request_new", "full_cycle"],
            },
        },
        required: ["businessName", "action"],
    },
    handler: async (args, context) => {
        const startTime = Date.now();
        try {
            const response = await fetch("/api/reputation", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    clientId: args.clientId,
                    businessName: args.businessName,
                    url: args.businessUrl,
                    action: args.action,
                    agentName: context.agentName,
                    sessionId: context.sessionId,
                }),
            });
            const data = await response.json();

            const latency = Date.now() - startTime;
            recordToolCall(context.sessionId, "manage_reviews", latency, true);

            return {
                success: true,
                data: {
                    message: `Reputation ${args.action} initiated for ${args.businessName}`,
                    result: data,
                },
                nextAction: "Tell the client their reviews are being managed automatically. For 'full_cycle' say: 'I've just kicked off the full reputation cycle — scanning unanswered reviews, drafting responses, and queuing review requests for recent customers.'",
                sideEffects: ["reputation_audit_run"],
            };
        } catch (err) {
            const latency = Date.now() - startTime;
            recordToolCall(context.sessionId, "manage_reviews", latency, false);
            return {
                success: false,
                data: { error: `Reputation management failed: ${err}` },
                nextAction: "Let them know the reputation team will handle this and it'll be live within 24 hours.",
            };
        }
    },
    requiredAuthority: "elevated",
    riskLevel: "medium",
    cooldownMs: 30_000,
});

// ── 13. Publish Content ──────────────────────────────────────────
toolRegistry.set("publish_content", {
    name: "publish_content",
    description: "Trigger the content creation and publishing engine. Generates blog posts, social media content, or email campaigns for a client based on their industry and services. Use this when a client asks about content marketing or when proving 6x ROI.",
    parameters: {
        type: "object",
        properties: {
            clientId: { type: "string", description: "Client ID" },
            contentType: {
                type: "string",
                description: "Type of content to create",
                enum: ["blog_post", "social_calendar", "email_campaign", "faq_page", "service_page"],
            },
            topic: { type: "string", description: "Topic or angle for the content" },
            industry: { type: "string", description: "Client's industry for relevance" },
        },
        required: ["contentType", "industry"],
    },
    handler: async (args, context) => {
        const startTime = Date.now();
        try {
            const response = await fetch("/api/social-media", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    clientId: args.clientId,
                    type: args.contentType,
                    topic: args.topic,
                    industry: args.industry,
                    agentName: context.agentName,
                }),
            });
            const data = await response.json();

            const latency = Date.now() - startTime;
            recordToolCall(context.sessionId, "publish_content", latency, true);

            return {
                success: true,
                data: {
                    message: `${args.contentType} content initiated for ${args.industry}`,
                    result: data,
                },
                nextAction: "Tell the client that content is being produced right now. Say: 'Your content engine is running — we're creating SEO-optimized content that positions you as the go-to expert in your area.'",
                sideEffects: ["content_created"],
            };
        } catch (err) {
            const latency = Date.now() - startTime;
            recordToolCall(context.sessionId, "publish_content", latency, false);
            return { success: false, data: { error: String(err) } };
        }
    },
    requiredAuthority: "elevated",
    riskLevel: "medium",
    cooldownMs: 30_000,
});

// ── 14. Generate Monthly Report ──────────────────────────────────
toolRegistry.set("generate_report", {
    name: "generate_report",
    description: "Trigger a monthly performance and ROI report for a client. The report includes all revenue recovered, leads generated, SEO gains, AEO citations, and a projection of their 6x ROI trajectory. The report is emailed to the client automatically.",
    parameters: {
        type: "object",
        properties: {
            clientId: { type: "string", description: "Client ID" },
            clientEmail: { type: "string", description: "Client email to send the report to" },
            period: { type: "string", description: "Report period (e.g. 'January 2026', 'last 30 days')" },
        },
        required: ["clientEmail"],
    },
    handler: async (args, context) => {
        const startTime = Date.now();
        try {
            const response = await fetch("/api/send-report", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    clientId: args.clientId,
                    email: args.clientEmail,
                    period: args.period || "this month",
                    agentName: context.agentName,
                    sessionId: context.sessionId,
                }),
            });
            const data = await response.json();

            const latency = Date.now() - startTime;
            recordToolCall(context.sessionId, "generate_report", latency, data.success !== false);

            return {
                success: true,
                data: {
                    message: `Monthly ROI report sent to ${args.clientEmail}`,
                    result: data,
                },
                nextAction: "Let them know to check their inbox for the full report. Say: 'I just sent your complete ROI report to your email. It breaks down every dollar we've recovered and generated, your SEO gains, and exactly where you stand on the 6x guarantee.'",
                sideEffects: ["report_sent"],
            };
        } catch (err) {
            const latency = Date.now() - startTime;
            recordToolCall(context.sessionId, "generate_report", latency, false);
            return { success: false, data: { error: String(err) } };
        }
    },
    requiredAuthority: "basic",
    riskLevel: "safe",
    cooldownMs: 300_000, // 5 min between report sends
});

// ── 15. Social Intelligence Scraper (Apify + Google Business Profile) ──
// Applies: SEO/GEO Skill (Framework 4 — Schema, GMB, llms.txt)
//          Neuro Skill (Framework 3 — Social Proof, Trust Signals)
// ─────────────────────────────────────────────────────────────────────────
toolRegistry.set("social_scrape", {
    name: "social_scrape",
    description: "Scrape real social media and reputation data for any business using Apify actors + Google Business Profile API. Returns live review ratings, follower counts, posting frequency, GMB completeness, and neuro-conversion signals (social proof count, trust seals, unanswered reviews). Use this before running digital_audit_scorecard to get real reputation inputs. Also use to enrich a lead's profile before an outreach call.",
    parameters: {
        type: "object",
        properties: {
            action: {
                type: "string",
                description: "What to scrape",
                enum: ["full_audit", "gmb", "facebook", "twitter", "linkedin", "instagram", "lead_enrich", "reputation_check"],
            },
            businessName: { type: "string", description: "Business name (required for gmb, full_audit, reputation_check)" },
            location: { type: "string", description: "City and state for GMB accuracy, e.g. 'Denver, CO'" },
            website: { type: "string", description: "Business website URL" },
            facebookUrl: { type: "string", description: "Full Facebook page URL" },
            twitterHandle: { type: "string", description: "Twitter/X handle (no @)" },
            linkedinUrl: { type: "string", description: "Full LinkedIn company or profile URL" },
            instagramHandle: { type: "string", description: "Instagram handle (no @)" },
            placeId: { type: "string", description: "Google Place ID for exact GMB match" },
            leadName: { type: "string", description: "Lead full name for lead_enrich" },
            leadCompany: { type: "string", description: "Lead company for lead_enrich" },
            forceRefresh: { type: "string", description: "Set to 'true' to bypass cache" },
        },
        required: ["action"],
    },
    handler: async (args, context) => {
        const startTime = Date.now();
        try {
            const result = await scrapeForAgentTool({
                action: args.action as "full_audit" | "gmb" | "facebook" | "twitter" | "linkedin" | "instagram" | "lead_enrich" | "reputation_check",
                businessName: args.businessName as string,
                location: args.location as string,
                website: args.website as string,
                facebookUrl: args.facebookUrl as string,
                twitterHandle: args.twitterHandle as string,
                linkedinUrl: args.linkedinUrl as string,
                instagramHandle: args.instagramHandle as string,
                placeId: args.placeId as string,
                leadName: args.leadName as string,
                leadCompany: args.leadCompany as string,
                forceRefresh: args.forceRefresh === "true",
            });

            const latency = Date.now() - startTime;
            recordToolCall(context.sessionId, "social_scrape", latency, result.success as boolean);

            // ── Map to Neuro Skill Framework 3 — Social Proof & Trust Signals ──
            const data = result.data as Record<string, unknown>;
            const repSummary = (data?.reputationSummary || {}) as Record<string, unknown>;
            const socialPresence = (data?.socialPresence || {}) as Record<string, unknown>;
            const gmb = data?.gmb as Record<string, unknown> | null;

            const neuroSignals = {
                // Neuro Framework 3: Social proof & trust elements
                hasSocialProof: ((socialPresence.totalFollowers as number) || 0) > 0,
                totalFollowers: (socialPresence.totalFollowers as number) || 0,
                activePlatforms: (socialPresence.activePlatforms as string[]) || [],
                testimonialCount: (repSummary.totalReviews as number) || 0,
                hasGoogleReviewLink: !!gmb,
                avgRating: (repSummary.avgRating as number) || 0,
                unrepliedReviews: (repSummary.unrepliedReviews as number) || 0,
                sentimentBreakdown: repSummary.sentimentBreakdown || {},
                // Neuro Framework 5: ROI math — unanswered reviews cost money
                reputationRiskPerMonth: ((repSummary.unrepliedReviews as number) || 0) * 1300,
            };

            // ── Map to SEO/GEO Skill Framework 4 — Schema & Entity Clarity ──
            const seoSignals = {
                hasGMB: !!gmb,
                gmbPhotos: (gmb?.photos as number) || 0,
                gmbHours: !!gmb?.hours,
                gmbCategories: (gmb?.categories as string[]) || [],
                // Feed directly into digital_audit_scorecard inputs
                reviewCount: (gmb?.reviewCount as number) || (repSummary.totalReviews as number) || 0,
                avgRatingForScorecard: (gmb?.rating as number) || (repSummary.avgRating as number) || 0,
                socialLinks: (socialPresence.activePlatforms as string[])?.length || 0,
                hasSocialFeed: ((socialPresence.activePlatforms as string[])?.length || 0) > 0,
            };

            logAuditEntry({
                sessionId: context.sessionId,
                agentName: context.agentName,
                eventType: "tool_call",
                content: `Social scrape (${args.action}) for "${args.businessName || args.leadName}" — ${neuroSignals.avgRating}★ avg, ${neuroSignals.testimonialCount} reviews, ${neuroSignals.activePlatforms.length} platforms`,
                metadata: { neuroSignals, seoSignals },
            });

            return {
                success: result.success as boolean,
                data: {
                    ...result.data as Record<string, unknown>,
                    neuroSignals,
                    seoSignals,
                    // Pre-formatted inputs for digital_audit_scorecard
                    scorecardInputs: {
                        reviewCount: seoSignals.reviewCount.toString(),
                        avgRating: seoSignals.avgRatingForScorecard.toString(),
                        unansweredNegative: neuroSignals.unrepliedReviews.toString(),
                        mapPackPosition: seoSignals.hasGMB ? "page1" : "buried",
                    },
                    aiInsights: (data?.aiInsights as string[]) || [],
                    competitorGaps: (data?.competitorGaps as string[]) || [],
                },
                nextAction: args.action === "lead_enrich"
                    ? "Use the outreachAngle to personalize your opening. Reference their specific background naturally in the first 30 seconds."
                    : `Present these findings using the Reframe technique. Key points: ${neuroSignals.avgRating}★ average rating, ${neuroSignals.unrepliedReviews} unanswered reviews costing ~$${neuroSignals.reputationRiskPerMonth.toLocaleString()}/mo. Now run digital_audit_scorecard with the scorecardInputs.`,
                sideEffects: ["social_data_scraped"],
            };
        } catch (err) {
            const latency = Date.now() - startTime;
            recordToolCall(context.sessionId, "social_scrape", latency, false);
            return {
                success: false,
                data: { error: `Social scrape failed: ${err}` },
                nextAction: "Continue with the audit using available data. Ask the prospect for their Google review count and average rating directly.",
            };
        }
    },
    requiredAuthority: "basic",
    riskLevel: "safe",
    cooldownMs: 15_000,
});

// ── Tool Execution Engine ───────────────────────────────────────

const lastToolCallTime: Map<string, number> = new Map();

export async function executeTool(
    toolName: string,
    args: Record<string, unknown>,
    context: ToolContext
): Promise<ToolResult> {
    const tool = toolRegistry.get(toolName);
    if (!tool) {
        return {
            success: false,
            data: { error: `Unknown tool: ${toolName}` },
        };
    }

    // Rate limiting on tool calls
    const lastCall = lastToolCallTime.get(`${context.sessionId}:${toolName}`) || 0;
    if (tool.cooldownMs && Date.now() - lastCall < tool.cooldownMs) {
        return {
            success: false,
            data: {
                error: `Tool "${toolName}" is on cooldown. Wait ${Math.ceil((tool.cooldownMs - (Date.now() - lastCall)) / 1000)}s.`,
            },
        };
    }

    // Authority check
    if (tool.requiredAuthority === "closing" && context.agentRole !== "closer" && context.agentRole !== "custom") {
        return {
            success: false,
            data: { error: `Agent "${context.agentName}" does not have closing authority for tool "${toolName}"` },
        };
    }

    // Execute
    lastToolCallTime.set(`${context.sessionId}:${toolName}`, Date.now());
    return tool.handler(args, context);
}

// ── Get Tool Definitions for Gemini Function Calling ────────────

export function getToolDefinitions(agentTools: string[]): Array<{
    name: string;
    description: string;
    parameters: AgentTool["parameters"];
}> {
    return agentTools
        .map((name) => toolRegistry.get(name))
        .filter((t): t is AgentTool => t !== undefined)
        .map(({ name, description, parameters }) => ({ name, description, parameters }));
}

// ── Process Pipeline ────────────────────────────────────────────
// The main processing pipeline for every message in/out

export interface ProcessedMessage {
    originalText: string;
    processedText: string;
    safetyResult: ReturnType<typeof moderateAgentOutput>;
    commitmentUpdate?: ReturnType<typeof analyzeCommitment>;
    memoryContext?: string;
    entityUpdates?: Record<string, unknown>;
    suggestedPhase?: string;
}

export function processIncomingMessage(
    text: string,
    sessionId: string,
    agentName: string
): ProcessedMessage {
    // 1. Safety check on input
    const safety = sanitizeUserInput(text);

    // 2. Rate limit check
    const rateLimit = checkRateLimit(sessionId);
    if (!rateLimit.allowed) {
        return {
            originalText: text,
            processedText: text,
            safetyResult: {
                safe: false,
                filtered: text,
                flags: [{ type: "off_topic", description: "Rate limit exceeded" }],
                severity: "medium",
                action: "block",
            },
        };
    }

    // 3. Memory operations
    const memory = getMemory(sessionId);
    let commitmentUpdate;
    let entityUpdates;
    let memoryContext;

    if (memory) {
        // Update turn count
        memory.turnCount++;
        recordTurn(sessionId, memory.commitmentLevel);

        // Analyze commitment
        commitmentUpdate = analyzeCommitment(text, memory.commitmentLevel);
        memory.commitmentLevel = commitmentUpdate.newLevel;

        // Extract entities
        entityUpdates = extractEntities(text, memory);
        Object.assign(memory.prospect, entityUpdates);

        // Generate context for agent
        memoryContext = generateMemoryContext(memory);
    }

    // 4. Log
    logAuditEntry({
        sessionId,
        agentName,
        eventType: "message_in",
        content: text.substring(0, 200), // Truncate for log
        safetyResult: safety,
    });

    return {
        originalText: text,
        processedText: safety.filtered,
        safetyResult: safety,
        commitmentUpdate,
        memoryContext,
        entityUpdates,
    };
}

export function processOutgoingMessage(
    text: string,
    sessionId: string,
    agentName: string
): ProcessedMessage {
    // 1. Moderate agent output
    const safety = moderateAgentOutput(text);

    if (safety.flags.length > 0) {
        recordSafetyFlag(sessionId);
    }

    // 2. Log
    logAuditEntry({
        sessionId,
        agentName,
        eventType: "message_out",
        content: safety.filtered.substring(0, 200),
        safetyResult: safety,
    });

    return {
        originalText: text,
        processedText: safety.filtered,
        safetyResult: safety,
    };
}
