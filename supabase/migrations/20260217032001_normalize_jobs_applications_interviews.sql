BEGIN;

-- 1) Enum for interview metadata
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'interview_type'
      AND n.nspname = 'public'
  ) THEN
    CREATE TYPE interview_type AS ENUM ('TECH', 'HR', 'CULTURE', 'FINAL', 'OTHER');
  END IF;
END
$$;

-- 2) Preserve legacy jobs while rebuilding normalized structure
ALTER TABLE IF EXISTS jobs RENAME TO jobs_legacy;

-- Drop old jobs RLS policies if they exist on renamed legacy table
DROP POLICY IF EXISTS "Users can manage their own jobs" ON jobs_legacy;

-- 3) New shared jobs table
CREATE TABLE jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  platform job_platform NOT NULL,
  company_name TEXT NOT NULL,
  position_title TEXT NOT NULL,
  origin_url TEXT NOT NULL,
  description TEXT,
  raw_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT jobs_platform_origin_url_key UNIQUE (platform, origin_url)
);

CREATE INDEX idx_jobs_platform_created_at ON jobs(platform, created_at DESC);

-- 4) applications table
CREATE TABLE applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  status job_status NOT NULL DEFAULT 'APPLIED',
  applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT applications_user_id_job_id_key UNIQUE (user_id, job_id)
);

CREATE INDEX idx_applications_user_status ON applications(user_id, status);
CREATE INDEX idx_applications_job_id ON applications(job_id);

-- 5) interviews table
CREATE TABLE interviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
  round INTEGER NOT NULL CHECK (round > 0),
  interview_type interview_type NOT NULL,
  scheduled_at TIMESTAMPTZ NOT NULL,
  location TEXT,
  scratchpad TEXT,
  is_draft BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT interviews_application_id_round_key UNIQUE (application_id, round)
);

CREATE INDEX idx_interviews_application_id ON interviews(application_id);
CREATE INDEX idx_interviews_scheduled_at ON interviews(scheduled_at);

-- 6) updated_at trigger function reuse
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

DROP TRIGGER IF EXISTS update_applications_updated_at ON applications;
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON applications
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

DROP TRIGGER IF EXISTS update_interviews_updated_at ON interviews;
CREATE TRIGGER update_interviews_updated_at
  BEFORE UPDATE ON interviews
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

-- 7) Backfill jobs/applications from legacy jobs
INSERT INTO jobs (platform, company_name, position_title, origin_url, description, raw_data, created_at)
SELECT DISTINCT ON (jl.platform, COALESCE(jl.origin_url, 'legacy://' || jl.id::text))
  jl.platform,
  jl.company_name,
  jl.position_title,
  COALESCE(jl.origin_url, 'legacy://' || jl.id::text) AS origin_url,
  NULL::TEXT AS description,
  jl.raw_data,
  COALESCE(jl.created_at, NOW())
FROM jobs_legacy jl
ORDER BY jl.platform, COALESCE(jl.origin_url, 'legacy://' || jl.id::text), jl.created_at NULLS LAST;

INSERT INTO applications (user_id, job_id, status, applied_at, notes, created_at, updated_at)
SELECT
  jl.user_id,
  j.id,
  jl.status,
  COALESCE(jl.applied_at, jl.created_at, NOW()) AS applied_at,
  NULL::TEXT AS notes,
  COALESCE(jl.created_at, NOW()) AS created_at,
  NOW() AS updated_at
FROM jobs_legacy jl
JOIN jobs j
  ON j.platform = jl.platform
 AND j.origin_url = COALESCE(jl.origin_url, 'legacy://' || jl.id::text)
WHERE jl.user_id IS NOT NULL
ON CONFLICT (user_id, job_id) DO NOTHING;

-- 8) Remove memos (legacy table depended on jobs.user_id RLS model)
DROP POLICY IF EXISTS "Users can manage memos of their own jobs" ON memos;
DROP TRIGGER IF EXISTS update_memos_updated_at ON memos;
DROP TABLE IF EXISTS memos;

-- 9) Remove legacy jobs table after successful backfill
DROP TABLE jobs_legacy;

-- 10) RLS policies
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE interviews ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read jobs"
  ON jobs
  FOR SELECT
  TO authenticated
  USING (TRUE);

CREATE POLICY "Authenticated users can insert jobs"
  ON jobs
  FOR INSERT
  TO authenticated
  WITH CHECK (TRUE);

CREATE POLICY "Users can manage their own applications"
  ON applications
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can manage interviews for their own applications"
  ON interviews
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM applications a
      WHERE a.id = interviews.application_id
        AND a.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM applications a
      WHERE a.id = interviews.application_id
        AND a.user_id = auth.uid()
    )
  );

COMMIT;
