// ════════════════════════════════════════════════════════════════
// /api/session-briefing
// ════════════════════════════════════════════════════════════════
// POST: Jenny writes prospect intel here the moment capture_lead fires.
//       Data goes into agent_sessions table in Supabase.
//       Mark reads this when his session starts — briefed before opening.
//
// GET:  Mark fetches his briefing by sessionId at session start.
//       Returns a formatted "pre-briefing block" injected into his
//       knowledge turn (before his greeting) so he enters with context.
// ════════════════════════════════════════════════════════════════

import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.SUPABASE_URL || "",
    process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    { auth: { persistSession: false } }
);

// ── POST: Save Jenny's prospect intel before handoff to Mark ────
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const {
            sessionId,
            agentName = "Jenny",
            prospectName,
            prospectCompany,
            prospectWebsite,
            prospectPhone,
            prospectEmail,
            industry,
            capturedAt,
        } = body;

        if (!sessionId) {
            return NextResponse.json({ error: "sessionId required" }, { status: 400 });
        }

        // Upsert into agent_sessions — create or update this session record
        const { error } = await supabase
            .from("agent_sessions")
            .upsert({
                session_id: sessionId,
                agent_name: agentName,
                agent_role: "sales",
                prospect_name: prospectName || null,
                prospect_company: prospectCompany || null,
                prospect_website: prospectWebsite || null,
                prospect_industry: industry || null,
                metadata: {
                    phone: prospectPhone || null,
                    email: prospectEmail || null,
                    capturedAt: capturedAt || new Date().toISOString(),
                },
                outcome: "in_progress",
                created_at: new Date().toISOString(),
            }, { onConflict: "session_id" });

        if (error) {
            // Table may not exist yet — fail silently with a warning
            console.warn("[session-briefing] Supabase write failed (table may not exist):", error.message);
            return NextResponse.json({ success: false, warning: error.message });
        }

        console.log(`[session-briefing] ✅ Prospect intel saved for session ${sessionId}: ${prospectName}`);
        return NextResponse.json({ success: true, sessionId });

    } catch (err) {
        console.error("[session-briefing] POST error:", err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// ── GET: Mark fetches his briefing before opening his mouth ─────
export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const sessionId = searchParams.get("sessionId");

    if (!sessionId) {
        return NextResponse.json({ briefing: null, block: "" });
    }

    try {
        const { data, error } = await supabase
            .from("agent_sessions")
            .select("*")
            .eq("session_id", sessionId)
            .single();

        if (error || !data) {
            return NextResponse.json({ briefing: null, block: "" });
        }

        // Format a neuroscience-aware briefing block for Mark's knowledge injection
        const painList = data.pain_points && Array.isArray(data.pain_points) && data.pain_points.length > 0
            ? data.pain_points : [];
        const objectionList = data.objections && Array.isArray(data.objections) && data.objections.length > 0
            ? data.objections : [];

        // Map objections to the brain layer they represent
        const objectionContext = objectionList.map((obj: string) => {
            const lower = obj.toLowerCase();
            if (lower.includes("price") || lower.includes("expensive") || lower.includes("afford"))
                return `"${obj}" → INSULA PAIN (price resistance). Counter: re-anchor to cost of inaction, then switch to GAIN framing.`;
            if (lower.includes("think") || lower.includes("later") || lower.includes("time"))
                return `"${obj}" → NEOCORTEX DELAY tactic. Counter: "What's the one thing you still need to feel confident?" Then address the REAL objection.`;
            if (lower.includes("chatgpt") || lower.includes("ghl") || lower.includes("already have"))
                return `"${obj}" → LIMBIC COMFORT ZONE (existing tool identity). Counter: "GHL can't build a custom app or get you cited by ChatGPT." Lead with differentiation, not conflict.`;
            return `"${obj}" → Address with Pacing & Leading: validate first, then redirect.`;
        });

        const block = [
            "═══ JENNY'S NEUROSCIENCE BRIEFING — READ BEFORE OPENING MOUTH ═══",
            data.prospect_name ? `Prospect: ${data.prospect_name}` : "",
            data.prospect_company ? `Company: ${data.prospect_company}` : "",
            data.prospect_website ? `Website: ${data.prospect_website}` : "",
            data.prospect_industry ? `Industry: ${data.prospect_industry}` : "",
            data.metadata?.phone ? `Phone: ${data.metadata.phone}` : "",
            data.metadata?.email ? `Email: ${data.metadata.email}` : "",
            "",
            painList.length > 0
                ? `PAIN POINTS UNCOVERED (limbic anchors — reference these by name):\n${painList.map((p: string) => `  • ${p}`).join("\n")}` : "",
            "",
            objectionContext.length > 0
                ? `OBJECTIONS RAISED + NEUROLOGICAL CONTEXT:\n${objectionContext.map((o: string) => `  • ${o}`).join("\n")}` : "",
            "",
            "═══ NEUROLOGICAL ENTRY INSTRUCTIONS ═══",
            `You are entering at CLOSING STAGE. The prospect has already passed through States 1-3.`,
            `SWITCH IMMEDIATELY to GAIN FRAMING (nucleus accumbens/dopamine) — NOT loss aversion.`,
            `Loss aversion at close = decision paralysis. Use GAIN language: 'Imagine next month...' / 'Starting tomorrow...'`,
            `Open with: "So based on what Jenny found — [their specific pain] — here's exactly what fixes that."`,
            `Use PRESUPPOSITION: "Before we finalize which plan makes the most sense for you..." (assumes they're buying)`,
            `After YES: fire STATE 5 immediately — show_visual(visual: 'generate', topic: 'business success and growth for [industry]') + validate the decision.`,
            "Do NOT restart from zero. Pick up the neurological thread Jenny left.",
        ].filter(Boolean).join("\n");

        return NextResponse.json({ briefing: data, block });

    } catch (err) {
        console.error("[session-briefing] GET error:", err);
        return NextResponse.json({ briefing: null, block: "" });
    }
}
