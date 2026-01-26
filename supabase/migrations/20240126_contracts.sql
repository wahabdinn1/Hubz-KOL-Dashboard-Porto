-- Create contract_templates table
create table if not exists contract_templates (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  content text not null,
  is_default boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add contract_status enum to collaborations if it doesn't exist
-- Note: 'UNSENT' is default
do $$
begin
  if not exists (select 1 from pg_type where typname = 'contract_status') then
    create type contract_status as enum ('UNSENT', 'GENERATED', 'SIGNED');
  end if;
end
$$;

-- Add contract_status column to campaign_deliverables table
alter table campaign_deliverables 
add column if not exists contract_status contract_status default 'UNSENT';

-- Add RLS policies (Open for now for simplification, assuming internal tool)
alter table contract_templates enable row level security;

-- Drop policy if exists to allow re-running
drop policy if exists "Enable all access for authenticated users" on contract_templates;

create policy "Enable all access for authenticated users" 
on contract_templates for all 
to authenticated 
using (true) 
with check (true);
