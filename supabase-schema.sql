-- ═══════════════════════════════════════════════════════════════════════════
-- BioDynamX — PRODUCTION SUPABASE SCHEMA
-- Run this in Supabase Dashboard → SQL Editor
-- ═══════════════════════════════════════════════════════════════════════════

-- 1. CLIENTS TABLE — One row per paying client
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS clients (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email           TEXT UNIQUE NOT NULL,
    name            TEXT,
    phone           TEXT,
    stripe_customer_id  TEXT,
    stripe_subscription_id TEXT,
    plan            TEXT DEFAULT 'BioDynamX Growth Engine',   -- e.g. "Enterprise Suite"
    status          TEXT DEFAULT 'active',                     -- active | paused | churned
    twilio_number   TEXT,      -- The Twilio phone number assigned to this client
    onboarding_day  INTEGER DEFAULT 0,  -- Tracks day in 90-day onboarding sequence
    settings        JSONB DEFAULT '{}', -- { avg_deal_value, industry, business_name, ... }
    latest_audit    JSONB DEFAULT '{}', -- Most recent BioDynamX audit scores
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 2. LEADS TABLE — Every captured lead, with attribution
-- ───────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS leads (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id       UUID REFERENCES clients(id) ON DELETE CASCADE,
    name            TEXT,
    email           TEXT,
    phone           TEXT,
    company         TEXT,
    industry        TEXT,
    source          TEXT DEFAULT 'voice',   -- voice | web | sms | email | manual
    status          TEXT DEFAULT 'new',     -- new | contacted | qualified | converted | lost
    score           INTEGER DEFAULT 0,      -- 0-100 lead score
    deal_value      NUMERIC DEFAULT 0,
    agent           TEXT,                   -- Which BioDynamX agent captured this
    notes           TEXT,
    priority        TEXT DEFAULT 'normal',  -- urgent | high | normal | low
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 3. ROI_EVENTS TABLE — Every dollar of value generated (audit trail for 6x guarantee)
-- ──────────────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS roi_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id       UUID REFERENCES clients(id) ON DELETE CASCADE,
    event_type      TEXT NOT NULL,  -- lead_converted | revenue_recovered | deal_closed | seo_win | call_answered | missed_call
    amount          NUMERIC DEFAULT 0,
    description     TEXT,
    agent_name      TEXT,           -- Aria | Jenny | Mark | Sarah | Billy
    lead_id         UUID REFERENCES leads(id) ON DELETE SET NULL,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 4. SESSIONS TABLE — Every AI call session
-- ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id       UUID REFERENCES clients(id) ON DELETE CASCADE,
    session_id      TEXT UNIQUE,        -- Internal BioDynamX session ID
    agent_name      TEXT,
    source          TEXT DEFAULT 'web', -- web | phone | sms
    caller_phone    TEXT,
    duration_sec    INTEGER DEFAULT 0,
    turns           INTEGER DEFAULT 0,
    outcome         TEXT,               -- closed | lost | nurture | escalated | information_given
    commitment_delta INTEGER DEFAULT 0,
    revenue         NUMERIC DEFAULT 0,
    transcript      TEXT,
    safety_flags    INTEGER DEFAULT 0,
    recording_url   TEXT,
    twilio_call_sid TEXT,
    metadata        JSONB DEFAULT '{}',
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ONBOARDING_EVENTS TABLE — Track which touchpoints have been sent
-- ────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS onboarding_events (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id       UUID REFERENCES clients(id) ON DELETE CASCADE,
    event_type      TEXT NOT NULL,      -- welcome_email | day3_sms | day7_report | day14_roi | day30_report | day60_roi | day89_guarantee_check
    channel         TEXT,               -- email | sms
    sent_at         TIMESTAMPTZ DEFAULT NOW(),
    metadata        JSONB DEFAULT '{}'
);

-- ═══════════════════════════════════════════════════════════════════════════
-- INDEXES (for query performance)
-- ═══════════════════════════════════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_leads_client_id ON leads(client_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads(status);
CREATE INDEX IF NOT EXISTS idx_leads_created_at ON leads(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_roi_events_client_id ON roi_events(client_id);
CREATE INDEX IF NOT EXISTS idx_roi_events_created_at ON roi_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_client_id ON sessions(client_id);
CREATE INDEX IF NOT EXISTS idx_sessions_created_at ON sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_twilio_number ON clients(twilio_number);
CREATE INDEX IF NOT EXISTS idx_clients_stripe_customer ON clients(stripe_customer_id);

-- ═══════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY (clients can only see their own data)
-- ═══════════════════════════════════════════════════════════════════════════
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE roi_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE onboarding_events ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS (for server-side API calls)
-- Anon/authenticated users can only see their own data
CREATE POLICY "clients_service_only" ON clients USING (true) WITH CHECK (true);
CREATE POLICY "leads_service_only" ON leads USING (true) WITH CHECK (true);
CREATE POLICY "roi_events_service_only" ON roi_events USING (true) WITH CHECK (true);
CREATE POLICY "sessions_service_only" ON sessions USING (true) WITH CHECK (true);
CREATE POLICY "onboarding_events_service_only" ON onboarding_events USING (true) WITH CHECK (true);

-- ═══════════════════════════════════════════════════════════════════════════
-- TRIGGER: Auto-update updated_at on clients
-- ═══════════════════════════════════════════════════════════════════════════
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ═══════════════════════════════════════════════════════════════════════════
-- DONE. Run this entire block in Supabase SQL Editor.
-- After running, set SUPABASE_SERVICE_KEY in .env.local for full access.
-- ═══════════════════════════════════════════════════════════════════════════
