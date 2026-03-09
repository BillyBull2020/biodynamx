// ══════════════════════════════════════════════════════════════════════
// IRONCLAW PROPOSAL ENGINE
// Autonomously generates a Billy-ready proposal after every Jenny call.
// Uses Gemini to craft a neuroscience-backed, industry-specific proposal
// from the IronClaw session data — zero manual writing required.
// ══════════════════════════════════════════════════════════════════════

import type { IronclawSession } from "./ironclaw-core";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY || "";
const BILLY_PHONE = process.env.OWNER_ALERT_PHONE || "+17205732344";

// ── Package Recommendation Logic ──────────────────────────────────────

function recommendPackage(session: IronclawSession): {
    name: string;
    price: string;
    keyFeatures: string[];
    rationale: string;
} {
    const commitment = session.prospect.commitmentLevel;
    const hasAudit = !!session.auditResult;
    const grade = (session.auditResult?.grade as string) || "C";

    // High commitment + bad audit = Enterprise (they feel the pain acutely)
    if (commitment >= 60 || grade === "D" || grade === "F") {
        return {
            name: "Enterprise AI OS",
            price: "$2,497/mo",
            keyFeatures: [
                "All 8 AI agents deployed & customized for their industry",
                "IronClaw autonomous operations 24/7",
                "Free GMB setup & optimization",
                "Weekly competitor intelligence reports",
                "Multi-channel follow-up (SMS, email, voice)",
                "Monthly performance dashboard",
            ],
            rationale: `High commitment signal (${commitment}%) + audit grade ${grade} → they are ready and need maximum coverage.`,
        };
    }

    // Mid commitment or decent audit = Growth package
    if (commitment >= 30 || (hasAudit && grade !== "A")) {
        return {
            name: "Growth AI Agent Suite",
            price: "$997/mo",
            keyFeatures: [
                "Jenny (sales) + Maya (receptionist) + Nova (content)",
                "GMB setup & first month optimization",
                "Lead capture + follow-up automation",
                "Weekly social media posts",
                "Monthly report card",
            ],
            rationale: `Moderate commitment (${commitment}%) → start with the highest-ROI agents, expand later.`,
        };
    }

    // Low commitment = Starter (get them in the door)
    return {
        name: "Starter AI Agent",
        price: "$397/mo",
        keyFeatures: [
            "Jenny AI Sales Agent (answers every call, qualifies leads)",
            "Free Google My Business setup",
            "Lead alert SMS to owner on every captured lead",
            "30-day performance report",
        ],
        rationale: `Lower commitment (${commitment}%) → low-risk entry point that builds trust fast.`,
    };
}

// ── ROI Calculator ────────────────────────────────────────────────────

function calculateROI(session: IronclawSession): string {
    const revenue = session.auditResult?.revenueEstimate as Record<string, unknown> | undefined;
    if (revenue?.leakingRevenue) {
        return `Based on Jenny's live audit, this business is currently losing an estimated $${revenue.leakingRevenue}/month in recoverable revenue.`;
    }

    // Industry-based estimate if no audit data
    const industry = (session.prospect.industry || "").toLowerCase();
    const estimates: Record<string, string> = {
        dental: "$8,000–$15,000/month in missed new patient revenue",
        flooring: "$5,000–$12,000/month in unbooked jobs",
        "real estate": "$10,000–$25,000/month in dead leads",
        roofing: "$6,000–$18,000/month in missed storm-damage calls",
        hvac: "$4,000–$10,000/month in after-hours lost calls",
        plumbing: "$3,000–$8,000/month in unanswered emergency calls",
        law: "$15,000–$40,000/month in unqualified or lost consultations",
        medical: "$12,000–$20,000/month in new patient acquisition gaps",
    };

    for (const [key, est] of Object.entries(estimates)) {
        if (industry.includes(key)) {
            return `Industry data suggests this ${industry} business is likely losing ${est}.`;
        }
    }

    return "Without AI agent coverage, most small-to-mid-size businesses lose 20–40% of potential revenue to missed calls and slow follow-up.";
}

// ── AI Proposal Generator (Gemini) ────────────────────────────────────

async function generateProposalText(session: IronclawSession, pkg: ReturnType<typeof recommendPackage>): Promise<string> {
    const prospect = session.prospect;
    const painPoints = prospect.painPoints.length > 0
        ? prospect.painPoints.join(", ")
        : "operational efficiency and customer response times";

    const prompt = `You are Billy De La Taurus, founder of BioDynamX Engineering Group.
Write a short, high-impact business proposal (under 300 words) for:

Client: ${prospect.name || "a business owner"}
Business: ${prospect.businessName || "their business"} ${prospect.businessUrl ? `(${prospect.businessUrl})` : ""}
Industry: ${prospect.industry || "not specified"}
Pain points discovered in call: ${painPoints}
Objections raised: ${prospect.objections.join(", ") || "none"}
Recommended package: ${pkg.name} at ${pkg.price}

Write in Billy's voice: direct, warm, confident, neuroscience-informed.
Structure:
1. One opening line that speaks directly to their #1 pain point (make it sting slightly)
2. 2-3 sentences on what BioDynamX will do specifically for THEM
3. The recommended package + price (bold it)
4. One closing line about them getting back to what they love
5. Sign off as Billy

Do NOT use generic language. Make it feel personal to their industry and situation.
Keep it under 280 words.`;

    try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [{ parts: [{ text: prompt }] }],
                generationConfig: { temperature: 0.7, maxOutputTokens: 500 },
            }),
        });

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        return text || buildFallbackProposal(session, pkg);
    } catch {
        return buildFallbackProposal(session, pkg);
    }
}

function buildFallbackProposal(session: IronclawSession, pkg: ReturnType<typeof recommendPackage>): string {
    const p = session.prospect;
    return `Hi ${p.name || "there"},

Great talking today. Based on what you shared about ${p.businessName || "your business"}, 
here's what I'd recommend:

**${pkg.name} — ${pkg.price}**

What's included:
${pkg.keyFeatures.map(f => `• ${f}`).join("\n")}

${calculateROI(session)}

This is designed so you can keep doing what you love — while the AI handles 
the rest 24/7. Let's get you set up.

— Billy De La Taurus
BioDynamX Engineering Group
biodynamx.com`;
}

// ── Main Export: Generate & Store Proposal ────────────────────────────

export interface ProposalResult {
    proposalText: string;
    packageName: string;
    packagePrice: string;
    roiStatement: string;
    recommendedPackage: ReturnType<typeof recommendPackage>;
    generatedAt: string;
}

export async function generateProposal(session: IronclawSession): Promise<ProposalResult> {
    const pkg = recommendPackage(session);
    const roi = calculateROI(session);
    const proposalText = await generateProposalText(session, pkg);

    return {
        proposalText,
        packageName: pkg.name,
        packagePrice: pkg.price,
        roiStatement: roi,
        recommendedPackage: pkg,
        generatedAt: new Date().toISOString(),
    };
}

// ── SMS Delivery: Send proposal summary to Billy ──────────────────────

export async function sendProposalSMSToBilly(session: IronclawSession, proposal: ProposalResult): Promise<void> {
    const p = session.prospect;
    const score = session.leadScore;

    const priorityEmoji = score?.priority === "hot" ? "🔥🔥🔥" :
        score?.priority === "warm" ? "🔥" : "📋";

    const smsLines = [
        `${priorityEmoji} IRONCLAW PROPOSAL READY`,
        `Lead: ${p.name || "Unknown"} — ${p.businessName || "Unknown business"}`,
        score ? `Score: ${score.total}/100 (${score.grade}) · ${score.priority?.toUpperCase()}` : "",
        p.phone ? `📞 ${p.phone}` : "",
        p.email ? `📧 ${p.email}` : "",
        p.businessUrl ? `🌐 ${p.businessUrl}` : "",
        ``,
        `💼 Recommended: ${proposal.packageName} @ ${proposal.packagePrice}`,
        ``,
        `Pain points: ${p.painPoints.slice(0, 2).join(" | ") || "none captured"}`,
        ``,
        `📝 Full proposal auto-drafted. Check dashboard.`,
        `biodynamx.com/dashboard`,
    ].filter(Boolean).join("\n");

    try {
        // Use the existing Twilio route
        const result = await fetch("/api/leads/alert", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: p.name,
                phone: p.phone,
                email: p.email,
                source: "ironclaw_auto_proposal",
                businessType: p.industry,
                auditGrade: session.leadScore?.grade,
                urgency: session.leadScore?.priority as "hot" | "warm" | "cold",
                customMessage: smsLines,
            }),
        });

        if (!result.ok) throw new Error(`Alert API ${result.status}`);
        console.log(`[IronClaw Proposal] ✅ SMS sent to Billy for ${p.name}`);
    } catch (err) {
        console.error("[IronClaw Proposal] SMS failed:", err);

        // Hard fallback: direct Twilio if API route fails (server-side only)
        if (typeof window === "undefined") {
            try {
                const { sendSMS } = await import("./twilio");
                await sendSMS(BILLY_PHONE, smsLines);
                console.log("[IronClaw Proposal] ✅ Direct Twilio fallback succeeded");
            } catch (twilioErr) {
                console.error("[IronClaw Proposal] Both SMS methods failed:", twilioErr);
            }
        }
    }
}

// ── Save Proposal to Supabase via agent-memory API ───────────────────

export async function persistProposal(session: IronclawSession, proposal: ProposalResult): Promise<void> {
    try {
        await fetch("/api/agent-memory", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                sessionId: session.sessionId,
                updates: {
                    proposal: {
                        text: proposal.proposalText,
                        package: proposal.packageName,
                        price: proposal.packagePrice,
                        roi: proposal.roiStatement,
                        generatedAt: proposal.generatedAt,
                    },
                },
            }),
        });
        console.log(`[IronClaw Proposal] ✅ Persisted to memory: ${session.sessionId}`);
    } catch (err) {
        console.warn("[IronClaw Proposal] Persist failed:", err);
    }
}
