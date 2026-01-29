-- Upgrading contract_status enum
-- Note: ALTER TYPE ... ADD VALUE cannot be run inside a transaction block in some Postgres versions/setups.
-- If this fails, we might need to recreate the type. But usually generic 'ADD VALUE' works in newer PG.
-- However, Supabase migration runner might wrap in transaction.
-- Let's try standard approach. If it fails, I'll advise user or try manual fix.

ALTER TYPE contract_status ADD VALUE IF NOT EXISTS 'DRAFT' AFTER 'UNSENT';

-- Adding new columns to campaign_deliverables
ALTER TABLE campaign_deliverables
ADD COLUMN IF NOT EXISTS contract_content JSONB,
ADD COLUMN IF NOT EXISTS contract_number TEXT,
ADD COLUMN IF NOT EXISTS signed_url TEXT;

-- Index for fast lookup by contract number
CREATE INDEX IF NOT EXISTS idx_campaign_deliverables_contract_number ON campaign_deliverables(contract_number);
