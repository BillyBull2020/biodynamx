-- ============================================================================
-- BioDynamX — Lead Management & Nurture Engine Database Schema
-- ============================================================================
-- Run this in your Supabase SQL Editor to create the tables needed
-- for lead capture, nurture sequences, and conversion tracking.
-- ============================================================================

-- ── Leads Table ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL,
    phone TEXT,
    name TEXT,
    business_url TEXT,
    business_type TEXT,
    source TEXT NOT NULL DEFAULT 'homepage',
    audit_grade TEXT,
    audit_score NUMERIC,
    monthly_leak TEXT,
    annual_leak TEXT,
    nurture_stage TEXT NOT NULL DEFAULT 'captured',
    nurture_sequence_step INTEGER NOT NULL DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_leads_email ON leads(email);
CREATE INDEX IF NOT EXISTS idx_leads_nurture_stage ON leads(nurture_stage);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at);
CREATE INDEX IF NOT EXISTS idx_leads_source ON leads(source);

-- ── Nurture Events Table ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS nurture_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL, -- 'email', 'sms', 'call', 'voice_diagnostic'
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'sent', 'delivered', 'failed', 'answered', 'voicemail'
    content TEXT,
    scheduled_at TIMESTAMPTZ NOT NULL,
    sent_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_nurture_events_lead_id ON nurture_events(lead_id);
CREATE INDEX IF NOT EXISTS idx_nurture_events_status ON nurture_events(status);
CREATE INDEX IF NOT EXISTS idx_nurture_events_scheduled_at ON nurture_events(scheduled_at);

-- ── Audit Results Table (Optional: Full audit storage) ──────────────────────
CREATE TABLE IF NOT EXISTS audit_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id UUID REFERENCES leads(id) ON DELETE SET NULL,
    business_url TEXT NOT NULL,
    grade TEXT,
    overall_score NUMERIC,
    seo_score NUMERIC,
    aeo_score NUMERIC,
    geo_score NUMERIC,
    monthly_leak TEXT,
    annual_leak TEXT,
    critical_findings JSONB DEFAULT '[]',
    full_summary JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_results_lead_id ON audit_results(lead_id);
CREATE INDEX IF NOT EXISTS idx_audit_results_business_url ON audit_results(business_url);

-- ── Row Level Security ──────────────────────────────────────────────────────
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE nurture_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_results ENABLE ROW LEVEL SECURITY;

-- Service role can do everything (used by API routes)
CREATE POLICY "Service role full access on leads" ON leads
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on nurture_events" ON nurture_events
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Service role full access on audit_results" ON audit_results
    FOR ALL USING (auth.role() = 'service_role');

-- ── Helper Functions ────────────────────────────────────────────────────────

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER leads_updated_at
    BEFORE UPDATE ON leads
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- ── Views for Quick Dashboarding ────────────────────────────────────────────

-- Pipeline overview
CREATE OR REPLACE VIEW lead_pipeline AS
SELECT
    nurture_stage,
    source,
    COUNT(*) as count,
    COUNT(CASE WHEN phone IS NOT NULL THEN 1 END) as with_phone,
    AVG(audit_score) as avg_audit_score,
    MIN(created_at) as earliest,
    MAX(created_at) as latest
FROM leads
GROUP BY nurture_stage, source
ORDER BY
    CASE nurture_stage
        WHEN 'captured' THEN 1
        WHEN 'contacted' THEN 2
        WHEN 'engaged' THEN 3
        WHEN 'qualified' THEN 4
        WHEN 'converted' THEN 5
    END;

-- Recent nurture activity
CREATE OR REPLACE VIEW recent_nurture AS
SELECT
    ne.event_type,
    ne.status,
    ne.sent_at,
    l.email,
    l.name,
    l.nurture_stage,
    ne.content
FROM nurture_events ne
JOIN leads l ON ne.lead_id = l.id
ORDER BY ne.created_at DESC
LIMIT 100;

-- ── Conversation Transcripts Table (Legal + QA) ─────────────────────────────
-- Full transcript of every AI agent conversation for legal protection,
-- QA review, and agent training. Every word said by both agent and prospect
-- is recorded with timestamps.
CREATE TABLE IF NOT EXISTS conversation_transcripts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id TEXT NOT NULL UNIQUE,
    started_at TIMESTAMPTZ NOT NULL,
    ended_at TIMESTAMPTZ,
    duration_ms INTEGER DEFAULT 0,
    prospect_name TEXT,
    prospect_email TEXT,
    prospect_phone TEXT,
    business_url TEXT,
    agents TEXT[] DEFAULT '{}',
    tools_called TEXT[] DEFAULT '{}',
    outcome TEXT DEFAULT 'unknown', -- 'converted', 'nurture', 'lost', 'escalated', 'unknown'
    summary TEXT,
    entry_count INTEGER DEFAULT 0,
    entries JSONB DEFAULT '[]', -- Full transcript entries with timestamps
    formatted_text TEXT DEFAULT '', -- Human-readable formatted transcript
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_transcripts_session_id ON conversation_transcripts(session_id);
CREATE INDEX IF NOT EXISTS idx_transcripts_prospect_name ON conversation_transcripts(prospect_name);
CREATE INDEX IF NOT EXISTS idx_transcripts_prospect_email ON conversation_transcripts(prospect_email);
CREATE INDEX IF NOT EXISTS idx_transcripts_started_at ON conversation_transcripts(started_at);
CREATE INDEX IF NOT EXISTS idx_transcripts_outcome ON conversation_transcripts(outcome);

-- RLS
ALTER TABLE conversation_transcripts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on transcripts" ON conversation_transcripts
    FOR ALL USING (auth.role() = 'service_role');


-- ═══════════════════════════════════════════════════════════════════════════
-- CLIENT ACCOUNTS — Paying customers
-- Created automatically by the Stripe webhook on checkout.session.completed
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    plan TEXT NOT NULL DEFAULT 'BioDynamX Growth Engine',
    status TEXT NOT NULL DEFAULT 'active',         -- 'active', 'paused', 'cancelled'
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    onboarding_step INTEGER NOT NULL DEFAULT 0,
    onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE,
    latest_audit JSONB DEFAULT '{}',               -- Most recent audit scores (seo, aeo, geo, etc.)
    settings JSONB DEFAULT '{}',                   -- business_name, business_url, hours, greeting, etc.
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_stripe ON clients(stripe_customer_id);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);

ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Service role can read/write all
CREATE POLICY "Service role full access on clients" ON clients
    FOR ALL USING (auth.role() = 'service_role');

-- Clients can read/update their OWN record only (using Supabase Auth user id)
CREATE POLICY "Clients read own record" ON clients
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Clients update own record" ON clients
    FOR UPDATE USING (auth.uid() = id);

CREATE TRIGGER clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();


-- ═══════════════════════════════════════════════════════════════════════════
-- ROI EVENTS — Every revenue win tracked for the 6x guarantee
-- Populated by agent tools (record_roi_event) and the Stripe webhook
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS roi_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,          -- 'lead_qualified', 'lead_converted', 'deal_closed',
                                       -- 'revenue_recovered', 'seo_win', 'aeo_citation',
                                       -- 'review_generated', 'onboarding'
    amount NUMERIC NOT NULL DEFAULT 0, -- Dollar value of the event
    description TEXT NOT NULL DEFAULT '',
    agent_name TEXT NOT NULL DEFAULT 'system',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_roi_events_client_id ON roi_events(client_id);
CREATE INDEX IF NOT EXISTS idx_roi_events_event_type ON roi_events(event_type);
CREATE INDEX IF NOT EXISTS idx_roi_events_created_at ON roi_events(created_at);

ALTER TABLE roi_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on roi_events" ON roi_events
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Clients read own roi_events" ON roi_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clients
            WHERE clients.id = roi_events.client_id
            AND clients.id = auth.uid()
        )
    );

-- ── Computed view: ROI summary per client ───────────────────────────────────
CREATE OR REPLACE VIEW client_roi_summary AS
SELECT
    c.id as client_id,
    c.email,
    c.name,
    c.plan,
    c.created_at as joined_at,
    COUNT(re.id) as total_events,
    SUM(re.amount) as total_returned,
    MAX(re.created_at) as last_win_at
FROM clients c
LEFT JOIN roi_events re ON re.client_id = c.id
GROUP BY c.id, c.email, c.name, c.plan, c.created_at;


-- ═══════════════════════════════════════════════════════════════════════════
-- SESSIONS — Every AI agent interaction (calls, chats, emails handled)
-- Populated by the voice/chat agent infrastructure
-- ═══════════════════════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID REFERENCES clients(id) ON DELETE SET NULL,
    session_id TEXT UNIQUE,              -- External session reference
    agent_name TEXT NOT NULL,            -- 'Aria', 'Jenny', 'Mark', 'Sarah', 'Billy'
    source TEXT NOT NULL DEFAULT 'web',  -- 'phone', 'web', 'sms', 'email'
    status TEXT NOT NULL DEFAULT 'completed',
    outcome TEXT,                        -- 'lead_captured', 'appointment_booked', 'deal_closed', 'escalated'
    duration_seconds INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sessions_client_id ON sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_sessions_agent_name ON sessions(agent_name);
CREATE INDEX IF NOT EXISTS idx_sessions_source ON sessions(source);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at);

ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access on sessions" ON sessions
    FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Clients read own sessions" ON sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM clients
            WHERE clients.id = sessions.client_id
            AND clients.id = auth.uid()
        )
    );
