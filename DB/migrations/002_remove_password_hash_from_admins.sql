-- ============================================================
-- Migration 002 — Remove password_hash from admins
-- Supabase Auth handles authentication, no password stored in DB
-- Run this in Supabase SQL Editor
-- ============================================================

-- Drop password_hash column if it exists
alter table admins drop column if exists password_hash;

-- Insert admin profile (Supabase Auth user must exist first)
insert into admins (email, name, role)
values ('admin@adqs.co.za', 'Bright Ngwenyama Gunde', 'administrator')
on conflict (email) do nothing;
