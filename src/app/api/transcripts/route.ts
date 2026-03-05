import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { sendTranscriptNotification } from "@/lib/resend";

// ── Supabase Client (lazy — avoids build crash when env vars missing) ───
function getSupabase() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!url || !key) return null;
    return createClient(url, key);
}

/**
 * POST /api/transcripts — Save a conversation transcript
 * Called automatically by VoiceOrchestrator.disconnect()
 * Also emails the full transcript to expertaissolutions@gmail.com
 */
export async function POST(req: NextRequest) {
    try {
        const data = await req.json();

        if (!data.session_id) {
            return NextResponse.json({ error: "session_id is required" }, { status: 400 });
        }

        // Save to Supabase
        const supabase = getSupabase();
        if (!supabase) {
            console.warn("[Transcripts] Supabase not configured, skipping save");
            return NextResponse.json({ saved: false, reason: "supabase_not_configured" });
        }
        const { error } = await supabase.from("conversation_transcripts").insert({
            session_id: data.session_id,
            started_at: data.started_at,
            ended_at: data.ended_at,
            duration_ms: data.duration_ms,
            prospect_name: data.prospect_name || null,
            prospect_email: data.prospect_email || null,
            prospect_phone: data.prospect_phone || null,
            business_url: data.business_url || null,
            agents: data.agents || [],
            tools_called: data.tools_called || [],
            outcome: data.outcome || "unknown",
            summary: data.summary || null,
            entry_count: data.entry_count || 0,
            entries: data.entries || [],
            formatted_text: data.formatted_text || "",
        });

        if (error) {
            console.error("[Transcripts API] Supabase error:", error);
            // Don't fail silently — log but still return 200 so agent isn't disrupted
            return NextResponse.json({
                saved: false,
                error: error.message,
                fallback: "Transcript logged to console only",
            });
        }

        console.log(`[Transcripts API] ✅ Saved transcript ${data.session_id} (${data.entry_count} entries, ${Math.round((data.duration_ms || 0) / 1000)}s)`);

        // ── Email the full transcript to expertaissolutions@gmail.com ──
        // Fire-and-forget — don't block the response to the client
        sendTranscriptNotification(data).then(result => {
            if (result.success) {
                console.log(`[Transcripts API] 📧 Transcript emailed to owner (id: ${result.messageId})`);
            } else {
                console.error(`[Transcripts API] 📧 Email failed: ${result.error}`);
            }
        }).catch(err => {
            console.error("[Transcripts API] 📧 Email error:", err);
        });

        return NextResponse.json({
            saved: true,
            session_id: data.session_id,
            entry_count: data.entry_count,
            emailed: true,
        });
    } catch (err) {
        console.error("[Transcripts API] Error:", err);
        return NextResponse.json({ error: "Failed to save transcript" }, { status: 500 });
    }
}

/**
 * GET /api/transcripts — Retrieve transcripts (for admin/QA review)
 * Query params: ?session_id=xxx or ?limit=20
 */
export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const sessionId = searchParams.get("session_id");
        const limit = parseInt(searchParams.get("limit") || "20");

        const supabase = getSupabase();
        if (!supabase) {
            return NextResponse.json({ error: "Supabase not configured" }, { status: 503 });
        }

        if (sessionId) {
            // Get a specific transcript
            const { data, error } = await supabase
                .from("conversation_transcripts")
                .select("*")
                .eq("session_id", sessionId)
                .single();

            if (error) {
                return NextResponse.json({ error: error.message }, { status: 404 });
            }

            return NextResponse.json(data);
        }

        // List recent transcripts (without full entries for performance)
        const { data, error } = await supabase
            .from("conversation_transcripts")
            .select("id, session_id, started_at, ended_at, duration_ms, prospect_name, prospect_email, business_url, agents, tools_called, outcome, summary, entry_count")
            .order("started_at", { ascending: false })
            .limit(Math.min(limit, 100));

        if (error) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        return NextResponse.json({ transcripts: data, count: data?.length || 0 });
    } catch (err) {
        console.error("[Transcripts API] Error:", err);
        return NextResponse.json({ error: "Failed to retrieve transcripts" }, { status: 500 });
    }
}
