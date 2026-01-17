-- ==========================================
-- Feature Enhancements Migration
-- Run in Supabase SQL Editor
-- ==========================================

-- 1. Add rating column to kols
ALTER TABLE public.kols ADD COLUMN IF NOT EXISTS rating INTEGER DEFAULT 0 CHECK (rating >= 0 AND rating <= 5);

-- 2. Create Content Library table
CREATE TABLE IF NOT EXISTS public.content_library (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    kol_id UUID REFERENCES public.kols(id) ON DELETE CASCADE,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    url TEXT NOT NULL,
    platform TEXT CHECK (platform IN ('TikTok', 'Instagram', 'YouTube', 'Other')),
    title TEXT,
    thumbnail_url TEXT,
    posted_at TIMESTAMP WITH TIME ZONE,
    views BIGINT DEFAULT 0,
    engagements BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_content_library_kol_id ON public.content_library(kol_id);
CREATE INDEX IF NOT EXISTS idx_content_library_campaign_id ON public.content_library(campaign_id);

-- 3. Create Payments table for invoice tracking
CREATE TABLE IF NOT EXISTS public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    paid_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    method TEXT CHECK (method IN ('Bank Transfer', 'Cash', 'E-Wallet', 'Other')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON public.payments(invoice_id);

-- 4. Create Deliverable Attachments table
CREATE TABLE IF NOT EXISTS public.deliverable_attachments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE CASCADE,
    kol_id UUID REFERENCES public.kols(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    file_type TEXT, -- 'image', 'document', 'video'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_deliverable_attachments_campaign ON public.deliverable_attachments(campaign_id);
CREATE INDEX IF NOT EXISTS idx_deliverable_attachments_kol ON public.deliverable_attachments(kol_id);

-- 5. Enable RLS on new tables
ALTER TABLE public.content_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deliverable_attachments ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
CREATE POLICY "Public Read Content Library" ON public.content_library FOR SELECT USING (true);
CREATE POLICY "Auth Write Content Library" ON public.content_library FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public Read Payments" ON public.payments FOR SELECT USING (true);
CREATE POLICY "Auth Write Payments" ON public.payments FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public Read Attachments" ON public.deliverable_attachments FOR SELECT USING (true);
CREATE POLICY "Auth Write Attachments" ON public.deliverable_attachments FOR ALL USING (auth.role() = 'authenticated');

-- ==========================================
-- END OF MIGRATION
-- ==========================================
