-- Colour Land Clothing LLP – Supabase schema
-- Run this in Supabase Dashboard → SQL Editor → New query → Run

-- Extensions
create extension if not exists "pgcrypto";

-- Companies
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  created_at timestamptz not null default now()
);

-- Uniform sizes / catalog items per company
create table if not exists public.uniform_sizes (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  size_name text not null,
  price numeric(10, 2) not null default 0,
  description text,
  created_at timestamptz not null default now()
);

-- Orders
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique,
  company_id uuid not null references public.companies(id),
  customer_name text not null,
  customer_phone text not null,
  customer_company text not null,
  delivery_address text not null,
  order_date timestamptz not null default now(),
  status text not null default 'pending',
  total_amount numeric(10, 2) not null default 0,
  notes text,
  created_at timestamptz not null default now()
);

-- Order line items
create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references public.orders(id) on delete cascade,
  uniform_size_id uuid not null references public.uniform_sizes(id),
  quantity integer not null check (quantity > 0),
  unit_price numeric(10, 2) not null,
  created_at timestamptz not null default now()
);

-- Admin users (custom auth via Next.js API)
create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_uniform_sizes_company on public.uniform_sizes(company_id);
create index if not exists idx_orders_company on public.orders(company_id);
create index if not exists idx_orders_created on public.orders(created_at desc);
create index if not exists idx_order_items_order on public.order_items(order_id);

-- Row Level Security (API uses service role key on Vercel, which bypasses RLS)
alter table public.companies enable row level security;
alter table public.uniform_sizes enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.admin_users enable row level security;

-- Public read for catalog (anon key fallback)
create policy "Public read companies" on public.companies for select using (true);
create policy "Public read uniform_sizes" on public.uniform_sizes for select using (true);

-- Public order placement
create policy "Public insert orders" on public.orders for insert with check (true);
create policy "Public insert order_items" on public.order_items for insert with check (true);

-- Seed companies (matches the storefront brands)
insert into public.companies (name) values
  ('Honda'),
  ('Tata'),
  ('Maruti'),
  ('Hyundai'),
  ('Mahindra')
on conflict (name) do nothing;

-- Sample uniform sizes (add more in Supabase Table Editor as needed)
insert into public.uniform_sizes (company_id, size_name, price, description)
select c.id, v.size_name, v.price, v.description
from public.companies c
cross join (values
  ('Shirt – M', 450.00, 'Standard uniform shirt'),
  ('Shirt – L', 450.00, 'Standard uniform shirt'),
  ('Shirt – XL', 480.00, 'Standard uniform shirt'),
  ('Trouser – 32', 520.00, 'Standard uniform trouser'),
  ('Trouser – 34', 520.00, 'Standard uniform trouser'),
  ('Trouser – 36', 540.00, 'Standard uniform trouser')
) as v(size_name, price, description)
where c.name = 'Honda'
  and not exists (
    select 1 from public.uniform_sizes u
    where u.company_id = c.id and u.size_name = v.size_name
  );
