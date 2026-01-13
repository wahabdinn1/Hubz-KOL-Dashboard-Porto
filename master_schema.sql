-- ==========================================
-- Hubz KOL Platform - Full Schema & RBAC Setup
-- ==========================================

-- 1. Enable Row Level Security on ALL tables (Best Practice)
-- Note: auth.users usually has RLS enabled by default. 
-- Skipping explicit enable to avoid permission errors (must be owner).
-- alter table auth.users enable row level security;

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
  email text, -- Added for easier frontend display
  created_at timestamptz default now()
);

-- A3. Enable RLS on Profiles
alter table public.profiles enable row level security;

-- A4. Profiles Policies
-- Drop existing to ensure clean state
drop policy if exists "Enable read access for all users" on public.profiles;
drop policy if exists "Enable update for users based on id" on public.profiles;
drop policy if exists "Enable insert for authenticated users only" on public.profiles;

-- Allow everyone (including app logic) to READ profiles to check roles
create policy "Read access for all users"
on public.profiles for select
using (true);

-- Allow users to UPDATE only their own profile
create policy "Update own profile"
on public.profiles for update
using (auth.uid() = id);

-- Allow admins to UPDATE any profile (for role management)
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

-- Re-create trigger to be safe
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==========================================
-- SECTION B: APP DATA TABLES (KOLs, Campaigns)
-- ==========================================

-- B1. Create Tables (if not exist)
create table if not exists public.categories (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    sort_order integer default 0,
    created_at timestamptz default now()
);

create table if not exists public.kols (
    id uuid default gen_random_uuid() primary key,
    name text not null,
    type text check (type in ('Nano', 'Micro', 'Macro', 'Mega')),
    category text,
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
    created_at timestamptz default now(),
    unique(campaign_id, kol_id)
);

-- B2. Enable RLS
alter table public.categories enable row level security;
alter table public.kols enable row level security;
alter table public.campaigns enable row level security;
alter table public.campaign_deliverables enable row level security;

-- B3. Data Policies (Permissive Mode for current requirements)
-- Drop old policies
drop policy if exists "Enable read access for all users" on campaigns;
drop policy if exists "Enable read access for all users" on kols;
drop policy if exists "Enable read access for all users" on categories;
drop policy if exists "Enable read access for all users" on campaign_deliverables;

-- READ: Detect if user is authenticated (or allow public if you want)
-- For now, allow public READ so dashboard works easily
create policy "Public Read Campaigns" on campaigns for select using (true);
create policy "Public Read KOLs" on kols for select using (true);
create policy "Public Read Categories" on categories for select using (true);
create policy "Public Read Deliverables" on campaign_deliverables for select using (true);

-- WRITE: Allow authenticated users to edit
create policy "Auth Write Campaigns" on campaigns for all using (auth.role() = 'authenticated');
create policy "Auth Write KOLs" on kols for all using (auth.role() = 'authenticated');
create policy "Auth Write Categories" on categories for all using (auth.role() = 'authenticated');
create policy "Auth Write Deliverables" on campaign_deliverables for all using (auth.role() = 'authenticated');

-- ==========================================
-- SECTION C: HELPER / MAINTERNANCE
-- ==========================================

-- C1. Fix Backfill (Run only if needed)
-- Allows syncing email/name for existing users who missed the trigger
update public.profiles p
set 
  email = u.email,
  full_name = coalesce(p.full_name, u.raw_user_meta_data->>'full_name', u.raw_user_meta_data->>'name', 'System Admin')
from auth.users u
where p.id = u.id;
