-- ============================================================
-- Migration 001 — Add field length constraints to all tables
-- Run after 00_schema.sql
-- ============================================================

-- admins (no password_hash — Supabase Auth handles authentication)
alter table admins
  alter column email type varchar(254),
  alter column name  type varchar(100),
  alter column role  type varchar(50);

-- articles — title max 70 chars enforced
alter table articles
  alter column title              type varchar(70),
  alter column slug               type varchar(80),
  alter column introduction       type varchar(300),
  alter column featured_image_url type varchar(500),
  alter column category           type varchar(100),
  alter column author             type varchar(100),
  alter column status             type varchar(10),
  alter column seo_title          type varchar(60),
  alter column seo_description    type varchar(160);

-- categories
alter table categories
  alter column name type varchar(100),
  alter column slug type varchar(110);

-- services
alter table services
  alter column title   type varchar(100),
  alter column slug    type varchar(110),
  alter column summary type varchar(200),
  alter column intro   type varchar(1000),
  alter column icon    type varchar(50);

-- contact_enquiries
alter table contact_enquiries
  alter column name            type varchar(100),
  alter column email           type varchar(254),
  alter column phone           type varchar(20),
  alter column organisation    type varchar(150),
  alter column area_of_enquiry type varchar(100),
  alter column message         type varchar(2000),
  alter column status          type varchar(10);

-- document_folders
alter table document_folders
  alter column name type varchar(100);

-- documents
alter table documents
  alter column title  type varchar(150),
  alter column type   type varchar(20),
  alter column status type varchar(10);

-- page_views
alter table page_views
  alter column path     type varchar(300),
  alter column referrer type varchar(500);

-- service_views
alter table service_views
  alter column service_slug type varchar(110);
