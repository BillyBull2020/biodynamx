// ═══════════════════════════════════════════════════════════════════
// SUPABASE SCHEMA SETUP — Creates all required tables
// ═══════════════════════════════════════════════════════════════════
// Run this once: npx tsx src/lib/supabase-setup.ts
// Or call setupSupabaseTables() from any server-side code.
// ═══════════════════════════════════════════════════════════════════

import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.SUPABASE_URL || "https://uhpwrllgwkuxbqageqkz.supabase.co";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const SQL_SCHEMA = `
-- ═══════════════════════════════════════════════════════════════════
-- BioDynamX COMPLETE Database Schema
-- Includes: Leads, Nurture, Sessions, Learnings, Reputation, 
--           Hunted Leads, Audits, and AI Memory (pgvector)
-- ═══════════════════════════════════════════════════════════════════

-- 0. Enable pgvector for AI Memory
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. EXPERT KNOWLEDGE TABLE — AI Memory with vector embeddings
CREATE TABLE IF NOT EXISTS expert_knowledge (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    content TEXT NOT NULL,
    embedding vector(1536),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on expert_knowledge
ALTER TABLE expert_knowledge ENABLE ROW LEVEL SECURITY;

-- Allow service_role full access
DO $$ BEGIN
    CREATE POLICY "Service role has full access" 
    ON expert_knowledge 
    FOR ALL 
    USING (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Allow anon to read (for client-side retrieval)
DO $$ BEGIN
    CREATE POLICY "Anon can read knowledge" 
    ON expert_knowledge 
    FOR SELECT 
    USING (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Allow anon to insert (for storing learnings)
DO $$ BEGIN
    CREATE POLICY "Anon can insert knowledge" 
    ON expert_knowledge 
    FOR INSERT 
    WITH CHECK (true);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 2. LEADS TABLE — Every prospect we discover or capture
CREATE TABLE IF NOT EXISTS leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL DEFAULT '',
    phone TEXT,
    name TEXT,
    business_url TEXT,
    business_type TEXT,
    source TEXT NOT NULL DEFAULT 'direct',
    audit_grade TEXT,
    audit_score NUMERIC,
    monthly_leak TEXT,
    annual_leak TEXT,
    nurture_stage TEXT NOT NULL DEFAULT 'captured',
    nurture_sequence_step INTEGER NOT NULL DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. NURTURE EVENTS TABLE — Every touchpoint (email, SMS, call)
CREATE TABLE IF NOT EXISTS nurture_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    lead_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    content TEXT,
    scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    sent_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. AGENT SESSIONS TABLE — Every AI conversation
CREATE TABLE IF NOT EXISTS agent_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_name TEXT NOT NULL,
    agent_role TEXT NOT NULL,
    lead_id TEXT,
    outcome TEXT DEFAULT 'in_progress',
    duration_seconds INTEGER DEFAULT 0,
    turns INTEGER DEFAULT 0,
    commitment_start NUMERIC DEFAULT 0,
    commitment_end NUMERIC DEFAULT 0,
    objections JSONB DEFAULT '[]',
    pain_points JSONB DEFAULT '[]',
    industry TEXT,
    revenue NUMERIC DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- 5. AGENT LEARNINGS TABLE — Knowledge extracted from sessions
CREATE TABLE IF NOT EXISTS agent_learnings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    learning_type TEXT NOT NULL,
    content TEXT NOT NULL,
    confidence NUMERIC DEFAULT 0.5,
    source_agent TEXT,
    source_session TEXT,
    applied_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. REPUTATION SNAPSHOTS TABLE — Review monitoring history
CREATE TABLE IF NOT EXISTS reputation_snapshots (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_name TEXT NOT NULL,
    place_id TEXT,
    average_rating NUMERIC DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    rating_breakdown JSONB DEFAULT '{}',
    sentiment_score INTEGER DEFAULT 0,
    trend TEXT DEFAULT 'stable',
    alerts JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. HUNTED LEADS TABLE — Prospects discovered by Lead Hunter
CREATE TABLE IF NOT EXISTS hunted_leads (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_name TEXT NOT NULL,
    place_id TEXT,
    address TEXT,
    phone TEXT,
    website TEXT,
    category TEXT,
    rating NUMERIC DEFAULT 0,
    review_count INTEGER DEFAULT 0,
    score INTEGER DEFAULT 0,
    signals JSONB DEFAULT '[]',
    estimated_revenue_leak TEXT,
    status TEXT DEFAULT 'discovered',
    source TEXT DEFAULT 'gmb_scan',
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    contacted_at TIMESTAMPTZ
);

-- 8. AUDIT RESULTS TABLE — Website audit cache
CREATE TABLE IF NOT EXISTS audit_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    url TEXT NOT NULL,
    grade TEXT,
    score NUMERIC,
    monthly_leak TEXT,
    annual_leak TEXT,
    findings JSONB DEFAULT '{}',
    seo_data JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ═══ VECTOR SIMILARITY SEARCH FUNCTION ═══
-- Used by AI Memory engine for semantic retrieval
CREATE OR REPLACE FUNCTION match_expert_knowledge(
    query_embedding vector(1536),
    match_threshold float DEFAULT 0.5,
    match_count int DEFAULT 5
)
RETURNS TABLE(
    id uuid,
    content text,
    metadata jsonb,
    created_at timestamptz,
    similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        ek.id,
        ek.content,
        ek.metadata,
        ek.created_at,
        1 - (ek.embedding <=> query_embedding) AS similarity
    FROM expert_knowledge ek
    WHERE 1 - (ek.embedding <=> query_embedding) > match_threshold
    ORDER BY ek.embedding <=> query_embedding
    LIMIT match_count;
END;
$$;

-- ═══ INDEXES ═══
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_phone ON leads(phone);
CREATE INDEX IF NOT EXISTS idx_leads_stage ON leads(nurture_stage);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);
CREATE INDEX IF NOT EXISTS idx_nurture_lead ON nurture_events(lead_id);
CREATE INDEX IF NOT EXISTS idx_sessions_agent ON agent_sessions(agent_name);
CREATE INDEX IF NOT EXISTS idx_sessions_outcome ON agent_sessions(outcome);
CREATE INDEX IF NOT EXISTS idx_hunted_status ON hunted_leads(status);
CREATE INDEX IF NOT EXISTS idx_hunted_score ON hunted_leads(score DESC);
CREATE INDEX IF NOT EXISTS idx_learnings_agent ON agent_learnings(source_agent);
CREATE INDEX IF NOT EXISTS idx_learnings_type ON agent_learnings(learning_type);

-- ═══ VECTOR INDEX (for fast similarity search) ═══
-- Uses IVFFlat for approximate nearest neighbor search
-- CREATE INDEX IF NOT EXISTS idx_knowledge_embedding 
--   ON expert_knowledge USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
-- Note: Uncomment above after you have 100+ knowledge entries for optimal performance
`;

export async function setupSupabaseTables(): Promise<{ success: boolean; message: string }> {
    if (!SUPABASE_URL || !SUPABASE_KEY) {
        return { success: false, message: "Supabase credentials not configured" };
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
        auth: { persistSession: false },
    });

    try {
        // Execute the SQL schema
        const { error } = await supabase.rpc("exec_sql", { sql: SQL_SCHEMA });

        if (error) {
            // If rpc doesn't exist, try the REST approach — create tables individually
            console.log("⚠️ exec_sql RPC not available, trying table-by-table approach...");

            // Test connection by trying to query leads
            const { error: queryError } = await supabase.from("leads").select("id").limit(1);

            if (queryError && queryError.code === "42P01") {
                // Table doesn't exist — need to create via SQL editor
                console.log("\n" + "=".repeat(60));
                console.log("📋 MANUAL SETUP REQUIRED");
                console.log("=".repeat(60));
                console.log("\nGo to your Supabase Dashboard:");
                console.log(`  ${SUPABASE_URL.replace('.supabase.co', '')}`);
                console.log("\n1. Click 'SQL Editor' in the left sidebar");
                console.log("2. Click 'New Query'");
                console.log("3. Paste the SQL below and click 'Run'");
                console.log("\n" + "=".repeat(60));
                console.log(SQL_SCHEMA);
                console.log("=".repeat(60) + "\n");

                return {
                    success: false,
                    message: "Tables don't exist yet. Run the SQL schema in Supabase SQL Editor."
                };
            } else if (queryError) {
                return { success: false, message: `Connection error: ${queryError.message}` };
            } else {
                console.log("✅ Tables already exist! Database is ready.");
                return { success: true, message: "Tables already exist" };
            }
        }

        console.log("✅ All tables created successfully!");
        return { success: true, message: "Schema created" };
    } catch (err) {
        console.error("❌ Setup error:", err);
        return { success: false, message: String(err) };
    }
}

// ── CLI Entry Point ────────────────────────────────────────────
if (require.main === module) {
    console.log("🗄️ BioDynamX Database Setup");
    console.log("  URL:", SUPABASE_URL);
    console.log("  Key:", SUPABASE_KEY ? `${SUPABASE_KEY.substring(0, 12)}...` : "NOT SET");
    console.log("");

    setupSupabaseTables().then(result => {
        console.log(result.success ? "✅" : "❌", result.message);
    });
}

// Export the SQL for manual use
export { SQL_SCHEMA };
