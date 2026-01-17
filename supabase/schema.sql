-- ==========================================
-- Hubz KOL Platform - Complete Database Schema
-- ==========================================
-- Run this entire file in Supabase SQL Editor
-- This file consolidates all previous migrations into a single source of truth.
-- Last Updated: 2026-01-18
-- ==========================================

-- ==========================================
-- SECTION A: USER PROFILES & RBAC
-- ==========================================

-- A1. Create Enum for Roles
do $$ 
begin
    if not exists (select 1 from pg_type where typname = 'user_role') then
        create type user_role as enum ('super_admin', 'admin', 'member');
    end if;
end $$;

-- A2. Create Profiles Table (Public Profile Data)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  role user_role default 'member',
  full_name text,
  email text,
  tiktok_session_cookie text, -- Added for API access
  created_at timestamptz default now()
);

-- Documentation
comment on column public.profiles.tiktok_session_cookie is 'User TikTok session cookie for trending API access';

-- A3. Enable RLS on Profiles
alter table public.profiles enable row level security;

-- A4. Profiles Policies
drop policy if exists "Enable read access for all users" on public.profiles;
drop policy if exists "Enable update for users based on id" on public.profiles;
drop policy if exists "Enable insert for authenticated users only" on public.profiles;

create policy "Read access for all users"
on public.profiles for select
using (true);

create policy "Update own profile"
on public.profiles for update
using (auth.uid() = id);

create policy "Admins can update all profiles"
on public.profiles for update
using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'super_admin'
  )
);

-- A5. Auto-Create Profile Trigger
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, role, full_name, email)
  values (
    new.id, 
    'member', 
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', 'New User'),
    new.email
  );
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==========================================
-- SECTION B: APP DATA TABLES
-- ==========================================

-- B1. Categories
create table if not exists public.categories (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    sort_order integer default 0,
    created_at timestamptz default now()
);

-- B2. KOLs (Influencers)
create table if not exists public.kols (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    type text check (type in ('Nano', 'Micro', 'Macro', 'Mega')),
    category text,
    avatar text, -- Added 2026-01-18
    rating integer default 0 check (rating >= 0 and rating <= 5), -- Added 2026-01-17
    followers bigint,
    avg_views bigint,
    tiktok_username text,
    tiktok_profile_link text,
    tiktok_followers bigint,
    instagram_username text,
    instagram_profile_link text,
    instagram_followers bigint,
    rate_card_tiktok bigint,
    rate_card_reels bigint,
    rate_card_pdf_link text,
    created_at timestamptz default now()
);

-- B3. Campaigns
create table if not exists public.campaigns (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    budget bigint,
    start_date date,
    end_date date,
    platform text default 'TikTok',
    objective text default 'AWARENESS',
    status text default 'Active',
    created_at timestamptz default now()
);

-- B4. Campaign Deliverables (KOL assignments to campaigns)
create table if not exists public.campaign_deliverables (
    id uuid default gen_random_uuid() primary key,
    campaign_id uuid references public.campaigns(id) on delete cascade,
    kol_id uuid references public.kols(id) on delete cascade,
    videos_count integer default 0,
    total_views bigint default 0,
    total_engagements bigint default 0,
    clicks bigint default 0,
    orders bigint default 0,
    sales_generated bigint default 0,
    status text default 'to_contact',
    content_link text,
    due_date date,
    notes text,
    created_at timestamptz default now(),
    unique(campaign_id, kol_id)
);

-- B4a. Kanban Status Constraint
ALTER TABLE campaign_deliverables 
DROP CONSTRAINT IF EXISTS valid_status;

ALTER TABLE campaign_deliverables 
ADD CONSTRAINT valid_status 
CHECK (status IN ('to_contact', 'negotiating', 'content_creation', 'posted', 'completed'));

-- B5. Campaign Templates
CREATE TABLE IF NOT EXISTS public.campaign_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    platform TEXT CHECK (platform IN ('TikTok', 'Instagram')),
    default_budget BIGINT DEFAULT 50000000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- B6. KOL Notes (Activity Log)
CREATE TABLE IF NOT EXISTS public.kol_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    kol_id UUID REFERENCES public.kols(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- B7. Invoices (Added 2026-01-17)
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_number TEXT NOT NULL UNIQUE,
  recipient_name TEXT NOT NULL,
  recipient_address TEXT,
  issued_date TIMESTAMP WITH TIME ZONE DEFAULT now(),
  due_date TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'DRAFT', -- 'DRAFT', 'PENDING', 'PAID', 'OVERDUE'
  total_amount NUMERIC DEFAULT 0,
  
  -- Relations
  kol_id UUID REFERENCES public.kols(id) ON DELETE SET NULL,
  campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
  
  -- Bank Details Snapshot
  bank_name TEXT,
  bank_account_no TEXT,
  bank_account_name TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoices_kol_id ON public.invoices(kol_id);
CREATE INDEX IF NOT EXISTS idx_invoices_campaign_id ON public.invoices(campaign_id);

-- B8. Invoice Items (Added 2026-01-17)
CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC DEFAULT 1,
  price NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);

-- B9. Content Library (Added 2026-01-17)
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

-- B10. Payments (Added 2026-01-17)
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

-- B11. Deliverable Attachments (Added 2026-01-17)
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

-- ==========================================
-- SECTION C: ROW LEVEL SECURITY
-- ==========================================

-- C1. Enable RLS on all tables
alter table public.categories enable row level security;
alter table public.kols enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_deliverables enable row level security;
alter table public.campaign_templates enable row level security;
alter table public.kol_notes enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;
alter table public.content_library enable row level security;
alter table public.payments enable row level security;
alter table public.deliverable_attachments enable row level security;

-- C2. Drop old policies (cleanup)
drop policy if exists "Enable read access for all users" on campaigns;
drop policy if exists "Enable read access for all users" on kols;
drop policy if exists "Enable read access for all users" on categories;
drop policy if exists "Enable read access for all users" on campaign_deliverables;
-- (and others if needed)

-- C3. Read Policies (Public - For prototype ease, usually stricter)
create policy "Public Read Campaigns" on campaigns for select using (true);
create policy "Public Read KOLs" on kols for select using (true);
create policy "Public Read Categories" on categories for select using (true);
create policy "Public Read Deliverables" on campaign_deliverables for select using (true);
create policy "Public Read Templates" on campaign_templates for select using (true);
create policy "Public Read Notes" on kol_notes for select using (true);
create policy "Public Read Invoices" on invoices for select using (true);
create policy "Public Read Invoice Items" on invoice_items for select using (true);
create policy "Public Read Content Library" on content_library for select using (true);
create policy "Public Read Payments" on payments for select using (true);
create policy "Public Read Attachments" on deliverable_attachments for select using (true);

-- C4. Write Policies (Authenticated)
create policy "Auth Write Campaigns" on campaigns for all using (auth.role() = 'authenticated');
create policy "Auth Write KOLs" on kols for all using (auth.role() = 'authenticated');
create policy "Auth Write Categories" on categories for all using (auth.role() = 'authenticated');
create policy "Auth Write Deliverables" on campaign_deliverables for all using (auth.role() = 'authenticated');
create policy "Auth Write Templates" on campaign_templates for all using (auth.role() = 'authenticated');
create policy "Auth Write Notes" on kol_notes for all using (auth.role() = 'authenticated');
create policy "Auth Write Invoices" on invoices for all using (auth.role() = 'authenticated');
create policy "Auth Write Invoice Items" on invoice_items for all using (auth.role() = 'authenticated');
create policy "Auth Write Content Library" on content_library for all using (auth.role() = 'authenticated');
create policy "Auth Write Payments" on payments for all using (auth.role() = 'authenticated');
create policy "Auth Write Attachments" on deliverable_attachments for all using (auth.role() = 'authenticated');

-- ==========================================
-- SECTION D: DEFAULT DATA
-- ==========================================

-- D1. Default Campaign Templates
INSERT INTO public.campaign_templates (name, description, platform, default_budget) VALUES
    ('Product Launch', 'Perfect for new product announcements with high-impact influencers', 'TikTok', 50000000),
    ('Brand Awareness', 'Long-term campaign to build brand recognition across platforms', 'Instagram', 100000000),
    ('Event Promotion', 'Short-term intensive campaign for events and launches', 'TikTok', 25000000),
    ('Seasonal Sale', 'Drive traffic during major shopping seasons (Ramadan, 12.12, etc.)', 'TikTok', 75000000)
ON CONFLICT DO NOTHING;

-- ==========================================
-- SECTION E: MAINTENANCE HELPERS
-- ==========================================

-- E1. Backfill existing users (run if needed)
update public.profiles p
set 
  email = u.email,
  full_name = coalesce(p.full_name, u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', 'System Admin')
from auth.users u
where p.id = u.id;

-- ==========================================
-- END OF SCHEMA
-- ==========================================
