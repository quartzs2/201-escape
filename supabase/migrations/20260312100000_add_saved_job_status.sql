-- Add SAVED to job_status enum (before APPLIED)
-- NOTE: ALTER TYPE ... ADD VALUE must run in its own migration (own transaction)
-- so that the new value is committed before being used in the next migration.
ALTER TYPE public.job_status ADD VALUE IF NOT EXISTS 'SAVED' BEFORE 'APPLIED';
