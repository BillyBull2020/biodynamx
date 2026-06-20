-- ProStorm Patrol — Supabase Schema
-- Run this in Supabase SQL Editor to create the tables

-- Contractors table
CREATE TABLE IF NOT EXISTS prostorm_contractors (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_name TEXT NOT NULL,
  contact_name TEXT,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  license_number TEXT,
  plan TEXT NOT NULL DEFAULT 'standard', -- 'standard' or 'pro'
  status TEXT NOT NULL DEFAULT 'trial', -- 'trial', 'active', 'cancelled', 'past_due'
  trial_start TIMESTAMPTZ DEFAULT NOW(),
  trial_end TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Territories table (one ZIP per contractor)
CREATE TABLE IF NOT EXISTS prostorm_territories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  zip TEXT NOT NULL,
  state TEXT NOT NULL,
  hail_risk_score FLOAT,
  contractor_id UUID REFERENCES prostorm_contractors(id),
  contractor_company TEXT,
  plan TEXT NOT NULL DEFAULT 'standard',
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'released', 'transferred'
  claimed_at TIMESTAMPTZ DEFAULT NOW(),
  released_at TIMESTAMPTZ,
  UNIQUE(zip, status)
);

-- Homeowners table (CRM data per contractor)
CREATE TABLE IF NOT EXISTS prostorm_homeowners (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contractor_id UUID REFERENCES prostorm_contractors(id),
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  address TEXT,
  zip TEXT,
  status TEXT DEFAULT 'lead', -- 'lead', 'contacted', 'inspection', 'inspected', 'claim', 'closed', 'lost'
  sms_optin BOOLEAN DEFAULT FALSE,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Claims table (insurance claims pipeline)
CREATE TABLE IF NOT EXISTS prostorm_claims (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  contractor_id UUID REFERENCES prostorm_contractors(id),
  address TEXT NOT NULL,
  homeowner_name TEXT,
  insurance_company TEXT,
  estimated_value INTEGER DEFAULT 0,
  storm_date DATE,
  hail_size TEXT,
  stage TEXT DEFAULT 'new', -- 'new', 'adjuster', 'approved', 'production', 'completed'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_prostorm_contractors_email ON prostorm_contractors(email);
CREATE INDEX IF NOT EXISTS idx_prostorm_territories_zip ON prostorm_territories(zip);
CREATE INDEX IF NOT EXISTS idx_prostorm_territories_status ON prostorm_territories(status);
CREATE INDEX IF NOT EXISTS idx_prostorm_homeowners_contractor ON prostorm_homeowners(contractor_id);
CREATE INDEX IF NOT EXISTS idx_prostorm_claims_contractor ON prostorm_claims(contractor_id);

-- Enable RLS (Row Level Security)
ALTER TABLE prostorm_contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE prostorm_territories ENABLE ROW LEVEL SECURITY;
ALTER TABLE prostorm_homeowners ENABLE ROW LEVEL SECURITY;
ALTER TABLE prostorm_claims ENABLE ROW LEVEL SECURITY;

-- Allow service role to bypass RLS (server-side only)
-- The service role key is used in the API route, so data is secure

-- Create a policy that allows anonymous reads of territory availability
-- (so the signup page can check if a ZIP is available)
CREATE POLICY "Public can check territory availability"
  ON prostorm_territories FOR SELECT
  USING (true);

-- All writes go through the API route using service role key