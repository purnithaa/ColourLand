-- Run in Supabase SQL Editor if you already applied schema.sql

alter table public.order_items
  alter column uniform_size_id drop not null;

alter table public.order_items
  add column if not exists item_name text not null default '',
  add column if not exists size_name text;
