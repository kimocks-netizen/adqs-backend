-- ============================================================
-- ADQS — Adequate Strategies (Pty) Ltd
-- Database: adqs-db
-- Storage Bucket: adqs-storage
-- Full Database Schema
-- Run this once on a fresh Supabase project via SQL Editor
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ============================================================
-- 1. admins
-- ============================================================
create table if not exists admins (
  id            uuid primary key default gen_random_uuid(),
  email         text unique not null,
  name          text not null,
  role          text not null default 'administrator',
  created_at    timestamptz not null default now()
);

-- ============================================================
-- 2. categories
-- ============================================================
create table if not exists categories (
  id    uuid primary key default gen_random_uuid(),
  name  text unique not null,
  slug  text unique not null
);

-- Seed default categories
insert into categories (name, slug) values
  ('Legal Updates',               'legal-updates'),
  ('News',                        'news'),
  ('Human Rights',                'human-rights'),
  ('Labour Relations',            'labour-relations'),
  ('Regulatory Compliance',       'regulatory-compliance'),
  ('Contracts & Commercial Matters', 'contracts-commercial-matters'),
  ('Policy & Governance',         'policy-governance'),
  ('Access to Justice',           'access-to-justice')
on conflict do nothing;

-- ============================================================
-- 3. articles
-- ============================================================
create table if not exists articles (
  id                  uuid primary key default gen_random_uuid(),
  title               text not null,
  slug                text unique not null,
  introduction        text,
  body                text,
  featured_image_url  text,
  category            text,
  author              text,
  status              text not null default 'draft' check (status in ('draft', 'published')),
  hidden              boolean not null default false,
  published_at        timestamptz,
  seo_title           text,
  seo_description     text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);

-- Auto-update updated_at on row change
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger articles_updated_at
  before update on articles
  for each row execute function update_updated_at();

-- ============================================================
-- 4. services
-- ============================================================
create table if not exists services (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  slug          text unique not null,
  summary       text,
  intro         text,
  areas         text[],
  icon          text,
  display_order int not null default 0,
  is_active     boolean not null default true,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create trigger services_updated_at
  before update on services
  for each row execute function update_updated_at();

-- ============================================================
-- 5. contact_enquiries
-- ============================================================
create table if not exists contact_enquiries (
  id               uuid primary key default gen_random_uuid(),
  name             text not null,
  email            text not null,
  phone            text,
  organisation     text,
  area_of_enquiry  text not null,
  message          text not null,
  status           text not null default 'New' check (status in ('New', 'Read', 'Replied')),
  created_at       timestamptz not null default now()
);

-- ============================================================
-- 6. document_folders
-- ============================================================
create table if not exists document_folders (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  parent_id  uuid references document_folders(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- Seed default folders
insert into document_folders (name, parent_id) values
  ('Letters',   null),
  ('Reports',   null),
  ('Contracts', null),
  ('Opinions',  null),
  ('Notices',   null),
  ('Memos',     null)
on conflict do nothing;

-- ============================================================
-- 7. documents
-- ============================================================
create table if not exists documents (
  id         uuid primary key default gen_random_uuid(),
  folder_id  uuid not null references document_folders(id) on delete cascade,
  title      text not null,
  type       text not null check (type in ('Letter', 'Contract', 'Opinion', 'Notice', 'Report', 'Memo')),
  body       text,
  status     text not null default 'Draft' check (status in ('Draft', 'Final')),
  watermark  boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger documents_updated_at
  before update on documents
  for each row execute function update_updated_at();

-- ============================================================
-- 8. page_views
-- ============================================================
create table if not exists page_views (
  id         uuid primary key default gen_random_uuid(),
  path       text not null,
  referrer   text,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 9. article_clicks
-- ============================================================
create table if not exists article_clicks (
  id         uuid primary key default gen_random_uuid(),
  article_id uuid references articles(id) on delete cascade,
  created_at timestamptz not null default now()
);

-- ============================================================
-- 10. service_views
-- ============================================================
create table if not exists service_views (
  id           uuid primary key default gen_random_uuid(),
  service_slug text not null,
  created_at   timestamptz not null default now()
);

-- ============================================================
-- RLS Policies
-- ============================================================

-- articles: public can read published + not hidden only
alter table articles enable row level security;
create policy "Public read published articles"
  on articles for select
  using (status = 'published' and hidden = false);

-- categories: public read
alter table categories enable row level security;
create policy "Public read categories"
  on categories for select using (true);

-- services: public read active only
alter table services enable row level security;
create policy "Public read active services"
  on services for select using (is_active = true);

-- All other tables: no public access (service key bypasses RLS)
alter table admins             enable row level security;
alter table contact_enquiries  enable row level security;
alter table document_folders   enable row level security;
alter table documents          enable row level security;
alter table page_views         enable row level security;
alter table article_clicks     enable row level security;
alter table service_views      enable row level security;

-- Set up Supabase Storage bucket manually:
-- Bucket name: adqs-storage
-- Public: true (for article images and document assets)
-- ============================================================
-- Done
-- ============================================================
