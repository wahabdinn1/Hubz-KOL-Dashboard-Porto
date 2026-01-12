-- Hubz Porto KOL - Consolidated Database Schema

-- 1. Categories Table
create table if not exists categories (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  sort_order serial,
  created_at timestamptz default now() not null
);

-- Seed Categories
insert into categories (name) values
  ('Beauty'),
  ('Tech'),
  ('Food'),
  ('Fashion'),
  ('Lifestyle'),
  ('Gaming'),
  ('Travel')
on conflict (name) do nothing;

-- 2. KOLs Table (Combined with expansion fields)
create table if not exists kols (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  type text default 'Mid-Tier',
  category text,
  followers bigint, -- Total / Primary
  avg_views bigint,
  
  -- Social Media & Rates
  tiktok_username text,
  tiktok_profile_link text,
  tiktok_followers bigint default 0,
  
  instagram_username text,
  instagram_profile_link text,
  instagram_followers bigint default 0,
  
  rate_card_video numeric default 0, -- Legacy / General
  rate_card_tiktok numeric default 0,
  rate_card_reels numeric default 0,
  rate_card_pdf_link text,
  
  created_at timestamptz default now()
);

-- 3. Campaigns Table (Combined with updates)
create table if not exists campaigns (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  budget numeric,
  start_date date,
  end_date date,
  platform text default 'TikTok', -- 'TikTok' | 'Instagram'
  objective text default 'AWARENESS', -- 'AWARENESS' | 'CONVERSION'
  status text default 'Active', -- 'Active' | 'Completed' | 'Draft'
  created_at timestamptz default now()
);

-- 4. Campaign Deliverables Table
create table if not exists campaign_deliverables (
  id uuid default gen_random_uuid() primary key,
  kol_id uuid references kols(id) on delete cascade,
  campaign_id uuid references campaigns(id) on delete cascade,
  videos_count int default 0,
  total_views bigint default 0,
  total_engagements bigint default 0,
  sales_generated numeric default 0,
  created_at timestamptz default now()
);

-- 5. Seed Initial Data

-- Insert Dummy Campaign (Ramadan Sale)
-- Using a specific UUID to make linking easier
insert into campaigns (id, name, budget, platform, objective, status)
values ('11111111-1111-1111-1111-111111111111', 'Ramadan Sale 2025', 250000000, 'TikTok', 'CONVERSION', 'Active')
on conflict (id) do nothing;

-- Insert Initial KOLs
insert into kols (name, type, category, followers, avg_views, rate_card_tiktok, rate_card_reels, tiktok_username, instagram_username) values 
('Aurelia S.', 'Macro', 'Beauty', 1200000, 350000, 15000000, 12000000, '@aureliabeauty', '@aurelia_s'),
('GadgetIndo', 'Mid-Tier', 'Tech', 850000, 120000, 8500000, 0, '@gadgetindo', ''),
('JajananViral', 'Micro', 'Food', 95000, 45000, 3500000, 0, '@jajanan_viral', '')
on conflict do nothing; -- Note: 'name' is not unique constraint by default in schema above, so this might duplicate if run repeatedly without cleanup.

-- Link KOLs to Campaign
-- Using subqueries to find IDs by name
insert into campaign_deliverables (kol_id, campaign_id, videos_count, total_views, total_engagements, sales_generated)
select id, '11111111-1111-1111-1111-111111111111', 2, 800000, 50000, 45000000 from kols where name = 'Aurelia S.' limit 1;

insert into campaign_deliverables (kol_id, campaign_id, videos_count, total_views, total_engagements, sales_generated)
select id, '11111111-1111-1111-1111-111111111111', 1, 150000, 12000, 12000000 from kols where name = 'GadgetIndo' limit 1;

insert into campaign_deliverables (kol_id, campaign_id, videos_count, total_views, total_engagements, sales_generated)
select id, '11111111-1111-1111-1111-111111111111', 3, 120000, 8500, 8500000 from kols where name = 'JajananViral' limit 1;
