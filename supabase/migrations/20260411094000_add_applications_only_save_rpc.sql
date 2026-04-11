BEGIN;

-- applications 중심 전환의 2단계 마이그레이션.
-- applications만 대상으로 저장하는 최종 RPC 경로를 추가합니다.
-- 정리용 마이그레이션을 적용하기 전에 앱 코드가 이 RPC를 사용하도록 전환되어야 합니다.

CREATE OR REPLACE FUNCTION public.save_application(
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
RETURNS TABLE ("applicationId" uuid)
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
        DETAIL = 'save_application requires an authenticated user.',
        HINT = 'Sign in and retry.';
  END IF;

  INSERT INTO public.applications AS a (
    user_id,
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
    COALESCE(p_status, 'SAVED'::public.job_status),
    COALESCE(p_applied_at, NOW()),
    p_notes,
    p_platform,
    p_company_name,
    p_position_title,
    p_origin_url,
    p_description,
    p_raw_data
  )
  ON CONFLICT (user_id, platform, origin_url) DO UPDATE
  SET
    status = EXCLUDED.status,
    applied_at = COALESCE(p_applied_at, a.applied_at),
    notes = EXCLUDED.notes,
    company_name = EXCLUDED.company_name,
    position_title = EXCLUDED.position_title,
    description = COALESCE(EXCLUDED.description, a.description),
    raw_data = COALESCE(EXCLUDED.raw_data, a.raw_data)
  RETURNING a.id
  INTO "applicationId";

  RETURN NEXT;
END;
$$;

REVOKE ALL
  ON FUNCTION public.save_application(
    public.job_platform,
    text,
    text,
    text,
    text,
    public.job_status,
    timestamptz,
    text,
    jsonb
  )
  FROM PUBLIC;

GRANT EXECUTE
  ON FUNCTION public.save_application(
    public.job_platform,
    text,
    text,
    text,
    text,
    public.job_status,
    timestamptz,
    text,
    jsonb
  )
  TO authenticated;

GRANT EXECUTE
  ON FUNCTION public.save_application(
    public.job_platform,
    text,
    text,
    text,
    text,
    public.job_status,
    timestamptz,
    text,
    jsonb
  )
  TO service_role;

COMMENT ON FUNCTION public.save_application(
  public.job_platform,
  text,
  text,
  text,
  text,
  public.job_status,
  timestamptz,
  text,
  jsonb
) IS 'Applications-only save path. Upserts a user-scoped application row by (user_id, platform, origin_url).';

COMMIT;
