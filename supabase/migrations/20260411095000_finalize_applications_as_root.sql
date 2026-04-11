BEGIN;

-- applications 중심 전환의 3단계 마이그레이션.
-- 아래 조건이 모두 충족된 뒤에만 적용합니다.
--   1) 앱 코드가 공고 메타데이터를 applications에서 직접 조회할 것
--   2) 저장 경로가 public.save_application 으로 전환되어 있을 것

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

DROP TRIGGER IF EXISTS sync_applications_from_jobs ON public.jobs;
DROP FUNCTION IF EXISTS public.sync_application_job_fields();

DROP FUNCTION IF EXISTS public.save_job_application(
  public.job_platform,
  text,
  text,
  text,
  text,
  public.job_status,
  timestamptz,
  text,
  jsonb
);

DROP TABLE IF EXISTS public.job_snapshots;

DROP POLICY IF EXISTS "Users can only read jobs they applied to" ON public.jobs;
DROP POLICY IF EXISTS "Users can update jobs they applied to" ON public.jobs;
DROP POLICY IF EXISTS "Service role can insert jobs" ON public.jobs;

DROP INDEX IF EXISTS public.idx_applications_job_id;

ALTER TABLE public.applications
  DROP CONSTRAINT IF EXISTS applications_job_id_fkey;

ALTER TABLE public.applications
  DROP CONSTRAINT IF EXISTS applications_user_id_job_id_key;

ALTER TABLE public.applications
  DROP COLUMN IF EXISTS job_id;

DROP TABLE IF EXISTS public.jobs;

COMMIT;
