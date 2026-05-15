-- Run in Supabase SQL Editor if orders still fail (anon key / RLS)

-- Ensure order_items supports catalogue line items
alter table public.order_items
  alter column uniform_size_id drop not null;

alter table public.order_items
  add column if not exists item_name text not null default '',
  add column if not exists size_name text;

-- Policies (safe to re-run)
drop policy if exists "Public read companies" on public.companies;
drop policy if exists "Public read uniform_sizes" on public.uniform_sizes;
drop policy if exists "Public insert orders" on public.orders;
drop policy if exists "Public insert order_items" on public.order_items;
drop policy if exists "Service read orders" on public.orders;
drop policy if exists "Service read order_items" on public.order_items;

create policy "Public read companies" on public.companies for select using (true);
create policy "Public read uniform_sizes" on public.uniform_sizes for select using (true);
create policy "Public insert orders" on public.orders for insert with check (true);
create policy "Public insert order_items" on public.order_items for insert with check (true);
create policy "Service read orders" on public.orders for select using (true);
create policy "Service read order_items" on public.order_items for select using (true);

-- Admin login (anon fallback when service role not set on Vercel)
drop policy if exists "Admin read admin_users" on public.admin_users;
create policy "Admin read admin_users" on public.admin_users for select using (true);
