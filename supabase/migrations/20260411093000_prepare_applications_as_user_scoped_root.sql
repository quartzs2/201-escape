BEGIN;

-- applications 중심 전환의 1단계 마이그레이션.
-- 현재 shared jobs 구조를 유지한 채, 공고 관련 필드를 applications로 미러링합니다.
-- 이후 앱이 applications만 읽도록 전환할 수 있게 준비하는 단계입니다.

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS platform public.job_platform,
  ADD COLUMN IF NOT EXISTS company_name text,
  ADD COLUMN IF NOT EXISTS position_title text,
  ADD COLUMN IF NOT EXISTS origin_url text,
  ADD COLUMN IF NOT EXISTS description text,
  ADD COLUMN IF NOT EXISTS raw_data jsonb;

UPDATE public.applications AS a
SET
  platform = j.platform,
  company_name = j.company_name,
  position_title = j.position_title,
  origin_url = j.origin_url,
  description = j.description,
  raw_data = COALESCE(
    (
      SELECT js.raw_data
      FROM public.job_snapshots AS js
      WHERE js.job_id = a.job_id
        AND js.user_id = a.user_id
      LIMIT 1
    ),
    a.raw_data
  )
FROM public.jobs AS j
WHERE a.job_id = j.id;

ALTER TABLE public.applications
  ALTER COLUMN platform SET NOT NULL,
  ALTER COLUMN company_name SET NOT NULL,
  ALTER COLUMN position_title SET NOT NULL,
  ALTER COLUMN origin_url SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'applications_user_platform_origin_url_key'
  ) THEN
    ALTER TABLE public.applications
      ADD CONSTRAINT applications_user_platform_origin_url_key
      UNIQUE (user_id, platform, origin_url);
  END IF;
END
$$;

CREATE INDEX IF NOT EXISTS idx_applications_user_applied_at_desc
  ON public.applications (user_id, applied_at DESC);

CREATE OR REPLACE FUNCTION public.sync_application_job_fields()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  UPDATE public.applications
  SET
    platform = NEW.platform,
    company_name = NEW.company_name,
    position_title = NEW.position_title,
    origin_url = NEW.origin_url,
    description = NEW.description
  WHERE job_id = NEW.id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS sync_applications_from_jobs ON public.jobs;

CREATE TRIGGER sync_applications_from_jobs
  AFTER UPDATE OF platform, company_name, position_title, origin_url, description
  ON public.jobs
  FOR EACH ROW
  EXECUTE PROCEDURE public.sync_application_job_fields();

CREATE OR REPLACE FUNCTION public.save_job_application(
  p_platform public.job_platform,
  p_origin_url text,
  p_company_name text,
  p_position_title text,
  p_description text DEFAULT NULL,
  p_status public.job_status DEFAULT 'SAVED',
  p_applied_at timestamptz DEFAULT NULL,
  p_notes text DEFAULT NULL,
  p_raw_data jsonb DEFAULT NULL
)
RETURNS TABLE ("jobId" uuid, "applicationId" uuid, "snapshotId" uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_user_id uuid;
  v_job public.jobs%ROWTYPE;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Authentication required'
      USING
        ERRCODE = '28000',
        DETAIL = 'save_job_application requires an authenticated user.',
        HINT = 'Sign in and retry.';
  END IF;

  INSERT INTO public.jobs AS j (
    platform,
    origin_url,
    company_name,
    position_title,
    description
  )
  VALUES (
    p_platform,
    p_origin_url,
    p_company_name,
    p_position_title,
    p_description
  )
  ON CONFLICT (platform, origin_url) DO UPDATE
  SET
    company_name = COALESCE(j.company_name, EXCLUDED.company_name),
    position_title = COALESCE(j.position_title, EXCLUDED.position_title),
    description = COALESCE(j.description, EXCLUDED.description)
  RETURNING j.*
  INTO v_job;

  "jobId" := v_job.id;

  INSERT INTO public.applications AS a (
    user_id,
    job_id,
    status,
    applied_at,
    notes,
    platform,
    company_name,
    position_title,
    origin_url,
    description,
    raw_data
  )
  VALUES (
    v_user_id,
    "jobId",
    COALESCE(p_status, 'SAVED'::public.job_status),
    COALESCE(p_applied_at, NOW()),
    p_notes,
    v_job.platform,
    v_job.company_name,
    v_job.position_title,
    v_job.origin_url,
    v_job.description,
    p_raw_data
  )
  ON CONFLICT (user_id, job_id) DO UPDATE
  SET
    status = EXCLUDED.status,
    applied_at = COALESCE(p_applied_at, a.applied_at),
    notes = EXCLUDED.notes,
    platform = EXCLUDED.platform,
    company_name = EXCLUDED.company_name,
    position_title = EXCLUDED.position_title,
    origin_url = EXCLUDED.origin_url,
    description = EXCLUDED.description,
    raw_data = COALESCE(EXCLUDED.raw_data, a.raw_data)
  RETURNING a.id
  INTO "applicationId";

  "snapshotId" := NULL;

  IF p_raw_data IS NOT NULL THEN
    INSERT INTO public.job_snapshots AS js (
      user_id,
      job_id,
      raw_data
    )
    VALUES (
      v_user_id,
      "jobId",
      p_raw_data
    )
    ON CONFLICT (user_id, job_id) DO UPDATE
    SET
      raw_data = EXCLUDED.raw_data
    RETURNING js.id
    INTO "snapshotId";
  END IF;

  RETURN NEXT;
END;
$$;

COMMENT ON FUNCTION public.save_job_application(
  public.job_platform,
  text,
  text,
  text,
  text,
  public.job_status,
  timestamptz,
  text,
  jsonb
) IS 'Phase-1 compatibility RPC. Keeps shared jobs upsert while mirroring job fields and optional raw_data into applications.';

COMMIT;
