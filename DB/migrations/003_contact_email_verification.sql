-- ============================================================
-- Migration 003 — Contact form email verification
-- ============================================================

-- Add email_verified flag to existing enquiries table
alter table contact_enquiries
  add column if not exists email_verified boolean not null default false;

-- OTP verifications table
create table if not exists otp_verifications (
  id          uuid primary key default gen_random_uuid(),
  email       varchar(254) not null,
  code        varchar(6) not null,
  attempts    int not null default 0,
  expires_at  timestamptz not null,
  created_at  timestamptz not null default now()
);

create index if not exists otp_verifications_email_idx on otp_verifications (email);

alter table otp_verifications enable row level security;
