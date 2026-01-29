-- Create integrations table for TikTok Shop and future platforms
create table if not exists integrations (
    id uuid default gen_random_uuid() primary key,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
    platform text not null, -- 'tiktok_shop', 'shopee', etc.
    shop_id text not null,
    seller_name text,
    access_token text not null,
    refresh_token text not null,
    access_token_expire_in int, -- seconds
    refresh_token_expire_in int, -- seconds
    metadata jsonb default '{}'::jsonb,
    
    unique(platform, shop_id)
);

-- RLS Policies
alter table integrations enable row level security;

-- Only authenticated users can view/add integrations (for now, simplistic)
create policy "Enable read access for authenticated users"
on integrations for select
to authenticated
using (true);

create policy "Enable insert/update for service role and authenticated users"
on integrations for all
to authenticated
using (true)
with check (true);
