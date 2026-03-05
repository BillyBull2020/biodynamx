-- ============================================================================
-- BioDynamX Client Portal — Supabase Schema
-- ============================================================================
-- Run this in your Supabase SQL Editor: https://supabase.com/dashboard
-- Project: uhpwrllgwkuxbqageqkz
-- ============================================================================

-- ── Clients Table (created from Stripe purchases) ──────────────────────────
CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    name TEXT,
    plan TEXT NOT NULL DEFAULT 'BioDynamX Growth Engine',
    status TEXT NOT NULL DEFAULT 'active',  -- active, paused, cancelled
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    onboarding_step INTEGER NOT NULL DEFAULT 0,
    onboarding_complete BOOLEAN NOT NULL DEFAULT FALSE,
    settings JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Auto-update `updated_at` ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clients_updated_at
    BEFORE UPDATE ON clients
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ── Row Level Security ─────────────────────────────────────────────────────
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

-- Clients can only read/update their own profile
CREATE POLICY "Clients can view own profile"
    ON clients FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Clients can update own profile"
    ON clients FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

-- Service role can do everything (for webhook/admin operations)
CREATE POLICY "Service role has full access"
    ON clients FOR ALL
    USING (auth.role() = 'service_role');

-- ── Indexes ──────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_stripe_customer ON clients(stripe_customer_id);

-- ── Client Activity Log ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS client_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,  -- 'lead_captured', 'call_answered', 'sms_sent', 'review_requested', etc.
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE client_activity ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view own activity"
    ON client_activity FOR SELECT
    USING (auth.uid() = client_id);

CREATE POLICY "Service role can manage activity"
    ON client_activity FOR ALL
    USING (auth.role() = 'service_role');

CREATE INDEX IF NOT EXISTS idx_client_activity_client ON client_activity(client_id);
CREATE INDEX IF NOT EXISTS idx_client_activity_type ON client_activity(event_type);
