// ════════════════════════════════════════════════════════════════
// /api/agent-memory — Real-Time Agent Memory Bridge
// ════════════════════════════════════════════════════════════════
// Called by Jenny/Mark during live sessions.
//
// GET  ?domain=...&phone=...  → Pull prospect history + agent learnings
// POST { session }            → Store session learnings after call ends
// ════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
    storeMemory,
    recallMemories,
    buildAgentContext,
} from "@/lib/ai-memory";

// ── GET: Pull memory for a new session ─────────────────────────

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get("domain") || "";
    const phone = searchParams.get("phone") || "";
    const email = searchParams.get("email") || "";

    const supabase = getSupabaseAdmin();
    const memory: {
        returningVisitor: boolean;
        prospectName?: string;
        lastVisit?: string;
        painPoints: string[];
        auditHistory: unknown[];
        agentLearnings: string[];
        contextBlock: string;
    } = {
        returningVisitor: false,
        painPoints: [],
        auditHistory: [],
        agentLearnings: [],
        contextBlock: "",
    };

    if (!supabase) {
        return NextResponse.json(memory);
    }

    try {
        // 1. Check if this is a returning lead (by phone or email or domain)
        if (phone || email || domain) {
            const query = supabase
                .from("leads")
                .select("*")
                .limit(1)
                .order("created_at", { ascending: false });

            if (phone) query.ilike("phone", `%${phone.replace(/\D/g, "")}%`);
            else if (email) query.eq("email", email);
            else if (domain) query.ilike("business_url", `%${domain}%`);

            const { data: leads } = await query;

            if (leads && leads.length > 0) {
                const lead = leads[0];
                memory.returningVisitor = true;
                memory.prospectName = lead.name;
                memory.lastVisit = lead.created_at;

                // Pull their past audit scores if stored
                if (lead.audit_grade || lead.monthly_leak) {
                    memory.auditHistory.push({
                        grade: lead.audit_grade,
                        monthlyLeak: lead.monthly_leak,
                        annualLeak: lead.annual_leak,
                        auditScore: lead.audit_score,
                        date: lead.created_at,
                    });
                }
            }
        }

        // 2. Pull past audit results for this domain from audit_results table if it exists
        if (domain && supabase) {
            const { data: audits } = await supabase
                .from("audit_results")
                .select("domain, score, summary, created_at")
                .ilike("domain", `%${domain}%`)
                .order("created_at", { ascending: false })
                .limit(3);

            if (audits && audits.length > 0) {
                memory.auditHistory.push(...audits);
            }
        }

        // 3. Pull agent learnings (what worked, what caused objections)
        const [jennyLearnings, markLearnings] = await Promise.all([
            recallMemories("Jenny", domain || "sales call", 5),
            recallMemories("Mark", domain || "sales call", 5),
        ]);

        const allLearnings = [...jennyLearnings, ...markLearnings];
        memory.agentLearnings = allLearnings.map(l => l.content);

        // 4. Build the context injection block
        const context = await buildAgentContext("Jenny", `prospect from ${domain || "unknown domain"}`);
        memory.contextBlock = context;

        // 5. Assemble the returning visitor contextBlock — neurologically framed for whatever agent picks up
        if (memory.returningVisitor && memory.prospectName) {
            memory.contextBlock = [
                `⚡ RETURNING VISITOR — ${memory.prospectName} has been here before (${new Date(memory.lastVisit!).toLocaleDateString()}).`,
                `NEUROLOGICAL ENTRY: Open in LIMBIC LAYER — recognition triggers warmth and familiarity bias. Do NOT re-trigger amygdala/threat.`,
                `Say: "${memory.prospectName}! We've spoken before — looks like you came back. Let's pick up where we left off."`,
                `RECIPROCITY EFFECT: They returned = prior positive experience = they already lean toward yes. Reduce friction, NOT increase pressure.`,
                `ENDOWMENT EFFECT: They already invested time in a previous session. Remind them: "You already know how this works" — this activates ownership feelings.`,
                memory.auditHistory.length > 0
                    ? `AUDIT MEMORY: Previous grade was ${(memory.auditHistory[0] as { grade?: string }).grade || "unknown"} · Monthly leak estimated ${(memory.auditHistory[0] as { monthlyLeak?: string }).monthlyLeak || "unknown"}. Lead with: "Last time we identified [X]. Has that changed?"` : "",
                memory.agentLearnings.length > 0
                    ? `AGENT INTEL FROM LAST SESSION: ${memory.agentLearnings.slice(0, 3).join(" | ")}` : "",
                `Skip orientation. Go directly to: "Where did you land on [main issue from last time]?"`,
            ].filter(Boolean).join("\n");
        }

        return NextResponse.json(memory);
    } catch (err) {
        console.error("[AgentMemory GET]", err);
        return NextResponse.json(memory); // Graceful degradation — never block the call
    }
}

// ── POST: Store session learnings after call ────────────────────

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            sessionId,
            agentName,
            prospectName,
            domain,
            industry,
            painPoints,
            objections,
            outcome,      // "closed" | "nurture" | "lost" | "escalated"
            notes,
            auditData,
        } = body;

        const supabase = getSupabaseAdmin();

        // 1. Store audit result to persistent table for future recall
        if (domain && auditData && supabase) {
            await supabase.from("audit_results").upsert({
                domain,
                score: auditData.siteSpeed?.score,
                summary: JSON.stringify({
                    seoScore: auditData.seo?.score,
                    mobileScore: auditData.mobile?.score,
                    reputation: auditData.reputation?.status,
                    monthlyLeak: auditData.revenueEstimate?.leakingRevenue,
                }),
                prospect_name: prospectName,
                industry,
                created_at: new Date().toISOString(),
            }, { onConflict: "domain" });
        }

        // 2. Store agent learnings from this call
        const learnings: Promise<boolean>[] = [];

        if (painPoints?.length > 0) {
            learnings.push(storeMemory({
                agent_name: agentName || "Jenny",
                session_id: sessionId || `session_${Date.now()}`,
                memory_type: "pain_point",
                content: `${industry || "business"} prospect: Pain points — ${painPoints.join(", ")}`,
                importance: 0.8,
                metadata: { domain, industry, outcome },
            }));
        }

        if (objections?.length > 0) {
            learnings.push(storeMemory({
                agent_name: agentName || "Jenny",
                session_id: sessionId || `session_${Date.now()}`,
                memory_type: "objection",
                content: `${industry || "business"} objections raised: ${objections.join(", ")}`,
                importance: 0.85,
                metadata: { domain, industry, outcome },
            }));
        }

        if (outcome && notes) {
            // Detect what NLP pattern sealed the deal for future agents to replicate
            const noteStr = (notes as string).toLowerCase();
            let nlpPattern = "";
            if (noteStr.includes("presupposition") || noteStr.includes("before you") || noteStr.includes("when you"))
                nlpPattern = " | NLP: PRESUPPOSITION worked";
            else if (noteStr.includes("quote") || noteStr.includes("told me") || noteStr.includes("said"))
                nlpPattern = " | NLP: QUOTE PATTERN worked";
            else if (noteStr.includes("gain") || noteStr.includes("imagine") || noteStr.includes("picture"))
                nlpPattern = " | NLP: GAIN FRAMING closed it";
            else if (noteStr.includes("loss") || noteStr.includes("leaking") || noteStr.includes("missing"))
                nlpPattern = " | NLP: LOSS AVERSION was the trigger";

            learnings.push(storeMemory({
                agent_name: agentName || "Jenny",
                session_id: sessionId || `session_${Date.now()}`,
                memory_type: outcome === "closed" ? "success_pattern" : "learning",
                content: `[${outcome.toUpperCase()}] ${notes}${nlpPattern}`,
                importance: outcome === "closed" ? 0.95 : 0.7,
                metadata: { domain, industry },
            }));
        }

        await Promise.allSettled(learnings);

        return NextResponse.json({ success: true, stored: learnings.length });
    } catch (err) {
        console.error("[AgentMemory POST]", err);
        return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
    }
}
