BEGIN;

CREATE OR REPLACE FUNCTION public.save_job_application(
  p_platform public.job_platform,
  p_origin_url text,
  p_company_name text,
  p_position_title text,
  p_description text DEFAULT NULL,
  p_status public.job_status DEFAULT 'APPLIED',
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
  RETURNING j.id
  INTO "jobId";

  INSERT INTO public.applications AS a (
    user_id,
    job_id,
    status,
    applied_at,
    notes
  )
  VALUES (
    v_user_id,
    "jobId",
    COALESCE(p_status, 'APPLIED'::public.job_status),
    COALESCE(p_applied_at, NOW()),
    p_notes
  )
  ON CONFLICT (user_id, job_id) DO UPDATE
  SET
    status = EXCLUDED.status,
    applied_at = COALESCE(p_applied_at, a.applied_at),
    notes = EXCLUDED.notes
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
) IS 'Idempotently upserts jobs/applications and optional user-specific snapshots. Shared jobs are only backfilled when existing values are NULL.';

COMMIT;
