// ═══════════════════════════════════════════════════════════════════
// BIODYNAMX — Supabase Persistence for Agent Sessions
// ═══════════════════════════════════════════════════════════════════
// Writes agent memory, session data, and audit logs to Supabase
// for persistent storage beyond in-memory session lifetime.
// ═══════════════════════════════════════════════════════════════════

import { getSupabaseAdmin } from "./supabase";
import type { ConversationMemory } from "./agent-memory";

// ── Session Persistence ─────────────────────────────────────────

export interface PersistedSession {
    id?: string;
    session_id: string;
    start_time: string;
    end_time?: string;
    agents: string[];
    turn_count: number;
    outcome: "won" | "lost" | "nurture" | "escalated" | "abandoned" | "active";
    revenue?: number;
    commitment_start: number;
    commitment_end: number;
    safety_flags: number;
    prospect_name?: string;
    prospect_company?: string;
    prospect_industry?: string;
    prospect_website?: string;
    pain_points: string[];
    objections_raised: number;
    objections_resolved: number;
    handoff_count: number;
    conversation_phase: string;
    metadata?: Record<string, unknown>;
    created_at?: string;
}

/**
 * Persists a completed session to Supabase
 */
export async function persistSession(
    sessionId: string,
    memory: ConversationMemory,
    outcome: PersistedSession["outcome"],
    agents: string[],
    revenue?: number
): Promise<{ success: boolean; id?: string }> {
    const supabase = getSupabaseAdmin();

    const session: Omit<PersistedSession, "id" | "created_at"> = {
        session_id: sessionId,
        start_time: new Date(memory.startTime).toISOString(),
        end_time: new Date().toISOString(),
        agents,
        turn_count: memory.turnCount,
        outcome,
        revenue,
        commitment_start: memory.commitmentHistory[0]?.level ?? 10,
        commitment_end: memory.commitmentLevel,
        safety_flags: 0, // Will be updated from observability
        prospect_name: memory.prospect.name,
        prospect_company: memory.prospect.company,
        prospect_industry: memory.prospect.industry,
        prospect_website: memory.prospect.websiteUrl,
        pain_points: memory.painPoints.map((pp) => `[${pp.category}] ${pp.description}`),
        objections_raised: memory.objections.length,
        objections_resolved: memory.objections.filter((o) => o.addressed).length,
        handoff_count: memory.handoffs.length,
        conversation_phase: memory.phase,
        metadata: {
            keyQuotes: memory.keyQuotes,
            phaseHistory: memory.phaseHistory,
            toolCalls: memory.toolCalls.map((tc) => ({
                tool: tc.tool,
                agent: tc.agent,
                turn: tc.turnNumber,
                duration: tc.durationMs,
            })),
        },
    };

    if (!supabase) {
        console.log(`📋 Session persisted (Supabase offline): ${sessionId}`, session);
        return { success: true, id: `local_${Date.now()}` };
    }

    try {
        const { data, error } = await supabase
            .from("agent_sessions")
            .insert(session)
            .select("id")
            .single();

        if (error) {
            console.error("❌ Failed to persist session:", error.message);
            return { success: false };
        }

        console.log(`✅ Session persisted to Supabase: ${data.id}`);
        return { success: true, id: data.id };
    } catch (err) {
        console.error("❌ Session persistence error:", err);
        return { success: false };
    }
}

// ── Audit Log Persistence ───────────────────────────────────────

export interface PersistedAuditEntry {
    id?: string;
    session_id: string;
    agent_name: string;
    event_type: string;
    content: string;
    severity?: "low" | "medium" | "high" | "critical";
    metadata?: Record<string, unknown>;
    created_at?: string;
}

/**
 * Persists an audit log entry to Supabase
 */
export async function persistAuditEntry(
    entry: Omit<PersistedAuditEntry, "id" | "created_at">
): Promise<void> {
    const supabase = getSupabaseAdmin();

    if (!supabase) {
        console.log(`📋 Audit entry logged (Supabase offline): [${entry.event_type}] ${entry.content}`);
        return;
    }

    try {
        const { error } = await supabase.from("agent_audit_log").insert(entry);
        if (error) {
            console.error("❌ Failed to persist audit entry:", error.message);
        }
    } catch (err) {
        console.error("❌ Audit persistence error:", err);
    }
}

// ── Analytics Queries ───────────────────────────────────────────

/**
 * Get conversion analytics for a time window
 */
export async function getConversionAnalytics(
    daysBack = 30
): Promise<{
    totalSessions: number;
    closedDeals: number;
    totalRevenue: number;
    avgCommitmentDelta: number;
    topPainPoints: string[];
    topObjections: string[];
    avgTurns: number;
} | null> {
    const supabase = getSupabaseAdmin();
    if (!supabase) return null;

    const cutoff = new Date(Date.now() - daysBack * 24 * 60 * 60_000).toISOString();

    try {
        const { data: sessions, error } = await supabase
            .from("agent_sessions")
            .select("*")
            .gte("start_time", cutoff);

        if (error || !sessions) return null;

        const closed = sessions.filter((s: PersistedSession) => s.outcome === "won");
        const totalRevenue = closed.reduce((sum: number, s: PersistedSession) => sum + (s.revenue || 0), 0);
        const avgDelta =
            sessions.length > 0
                ? sessions.reduce((sum: number, s: PersistedSession) => sum + (s.commitment_end - s.commitment_start), 0) / sessions.length
                : 0;
        const avgTurns =
            sessions.length > 0
                ? sessions.reduce((sum: number, s: PersistedSession) => sum + s.turn_count, 0) / sessions.length
                : 0;

        // Count pain points
        const painPointCounts = new Map<string, number>();
        for (const s of sessions) {
            if (s.pain_points) {
                for (const pp of s.pain_points as string[]) {
                    painPointCounts.set(pp, (painPointCounts.get(pp) || 0) + 1);
                }
            }
        }
        const topPainPoints = [...painPointCounts.entries()]
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([pp]) => pp);

        return {
            totalSessions: sessions.length,
            closedDeals: closed.length,
            totalRevenue,
            avgCommitmentDelta: avgDelta,
            topPainPoints,
            topObjections: [], // TODO: parse from metadata
            avgTurns,
        };
    } catch (err) {
        console.error("❌ Analytics query error:", err);
        return null;
    }
}

// ── Supabase Table DDL (run once in Supabase SQL editor) ────────
/**
 * Run this SQL in your Supabase SQL Editor to create the required tables:
 *
 * CREATE TABLE agent_sessions (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   session_id TEXT NOT NULL UNIQUE,
 *   start_time TIMESTAMPTZ NOT NULL,
 *   end_time TIMESTAMPTZ,
 *   agents TEXT[] DEFAULT '{}',
 *   turn_count INTEGER DEFAULT 0,
 *   outcome TEXT DEFAULT 'active',
 *   revenue DECIMAL(10,2),
 *   commitment_start INTEGER DEFAULT 10,
 *   commitment_end INTEGER DEFAULT 10,
 *   safety_flags INTEGER DEFAULT 0,
 *   prospect_name TEXT,
 *   prospect_company TEXT,
 *   prospect_industry TEXT,
 *   prospect_website TEXT,
 *   pain_points TEXT[] DEFAULT '{}',
 *   objections_raised INTEGER DEFAULT 0,
 *   objections_resolved INTEGER DEFAULT 0,
 *   handoff_count INTEGER DEFAULT 0,
 *   conversation_phase TEXT DEFAULT 'greeting',
 *   metadata JSONB,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 *
 * CREATE TABLE agent_audit_log (
 *   id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
 *   session_id TEXT NOT NULL,
 *   agent_name TEXT NOT NULL,
 *   event_type TEXT NOT NULL,
 *   content TEXT,
 *   severity TEXT DEFAULT 'low',
 *   metadata JSONB,
 *   created_at TIMESTAMPTZ DEFAULT NOW()
 * );
 *
 * CREATE INDEX idx_sessions_outcome ON agent_sessions(outcome);
 * CREATE INDEX idx_sessions_start ON agent_sessions(start_time);
 * CREATE INDEX idx_audit_session ON agent_audit_log(session_id);
 * CREATE INDEX idx_audit_type ON agent_audit_log(event_type);
 */
