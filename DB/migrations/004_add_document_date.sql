-- Migration 004: Add document_date to documents
-- Allows admins to set a custom date on documents (for backdating, future dating etc.)

alter table documents
  add column if not exists document_date date not null default current_date;
