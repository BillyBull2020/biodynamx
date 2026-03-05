// ============================================================================
// Supabase Client — BioDynamX Lead Management
// ============================================================================
// Connects to Supabase for storing leads, audit results, and nurture sequences.
// Uses server-side client for API routes (never exposes service key to browser).
// ============================================================================

import { createClient } from "@supabase/supabase-js";

// ── Types ───────────────────────────────────────────────────────────────────
export interface Lead {
    id?: string;
    email: string;
    phone?: string;
    name?: string;
    business_url?: string;
    business_type?: string;
    source: "audit" | "voice_diagnostic" | "homepage" | "direct";
    audit_grade?: string;
    audit_score?: number;
    monthly_leak?: string;
    annual_leak?: string;
    nurture_stage: "captured" | "contacted" | "engaged" | "qualified" | "converted";
    nurture_sequence_step: number;
    created_at?: string;
    updated_at?: string;
    metadata?: Record<string, unknown>;
}

export interface NurtureEvent {
    id?: string;
    lead_id: string;
    event_type: "email" | "sms" | "call" | "voice_diagnostic";
    status: "pending" | "sent" | "delivered" | "failed" | "answered" | "voicemail";
    content?: string;
    scheduled_at: string;
    sent_at?: string;
    metadata?: Record<string, unknown>;
}

// ── Server-side Supabase Client ─────────────────────────────────────────────
// IMPORTANT: Only use this in API routes (server-side), never in client components
export function getSupabaseAdmin() {
    const url = process.env.SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!url || !key) {
        console.warn(
            "⚠️ Supabase not configured. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local"
        );
        return null;
    }

    return createClient(url, key, {
        auth: { persistSession: false },
    });
}

// ── Lead Management Functions ───────────────────────────────────────────────

/**
 * Creates a new lead in Supabase
 */
export async function createLead(lead: Omit<Lead, "id" | "created_at" | "updated_at">) {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
        console.log("📋 Lead captured (Supabase offline):", lead.email);
        return { data: { id: `local_${Date.now()}`, ...lead }, error: null };
    }

    const { data, error } = await supabase
        .from("leads")
        .insert({
            ...lead,
            nurture_stage: lead.nurture_stage || "captured",
            nurture_sequence_step: lead.nurture_sequence_step || 0,
        })
        .select()
        .single();

    if (error) {
        console.error("❌ Failed to create lead:", error.message);
    } else {
        console.log("✅ Lead captured:", data.email, data.id);
    }

    return { data, error };
}

/**
 * Updates lead nurture stage
 */
export async function updateLeadStage(
    leadId: string,
    stage: Lead["nurture_stage"],
    step?: number
) {
    const supabase = getSupabaseAdmin();
    if (!supabase) return { data: null, error: "Supabase not configured" };

    const updates: Record<string, unknown> = {
        nurture_stage: stage,
        updated_at: new Date().toISOString(),
    };
    if (step !== undefined) updates.nurture_sequence_step = step;

    const { data, error } = await supabase
        .from("leads")
        .update(updates)
        .eq("id", leadId)
        .select()
        .single();

    return { data, error };
}

/**
 * Logs a nurture event (email sent, SMS sent, call made, etc.)
 */
export async function logNurtureEvent(event: Omit<NurtureEvent, "id">) {
    const supabase = getSupabaseAdmin();
    if (!supabase) {
        console.log("📋 Nurture event logged (Supabase offline):", event.event_type);
        return { data: { id: `local_${Date.now()}`, ...event }, error: null };
    }

    const { data, error } = await supabase
        .from("nurture_events")
        .insert(event)
        .select()
        .single();

    return { data, error };
}

/**
 * Gets leads ready for next nurture step
 */
export async function getLeadsForNurture() {
    const supabase = getSupabaseAdmin();
    if (!supabase) return { data: [], error: "Supabase not configured" };

    const { data, error } = await supabase
        .from("leads")
        .select("*")
        .in("nurture_stage", ["captured", "contacted", "engaged"])
        .order("created_at", { ascending: true });

    return { data: data || [], error };
}

/**
 * Gets a lead by their phone number
 */
export async function getLeadByPhone(phone: string): Promise<Lead | null> {
    const supabase = getSupabaseAdmin();
    if (!supabase) return null;

    // Twilio sends phone numbers in E.164 format (+1XXXXXXXXXX).
    // Ensure we are matching accurately.
    const { data, error } = await supabase
        .from("leads")
        .select("*")
        .eq("phone", phone)
        .single();

    if (error) {
        console.error("❌ Failed to get lead by phone:", error.message);
        return null;
    }

    return data as Lead;
}

