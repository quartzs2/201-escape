BEGIN;

-- Move sensitive per-user payload out of shared jobs table
CREATE TABLE job_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  raw_data JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT job_snapshots_user_id_job_id_key UNIQUE (user_id, job_id)
);

CREATE INDEX idx_job_snapshots_user_id ON job_snapshots(user_id);
CREATE INDEX idx_job_snapshots_job_id ON job_snapshots(job_id);

DROP TRIGGER IF EXISTS update_job_snapshots_updated_at ON job_snapshots;
CREATE TRIGGER update_job_snapshots_updated_at
  BEFORE UPDATE ON job_snapshots
  FOR EACH ROW
  EXECUTE PROCEDURE update_updated_at_column();

INSERT INTO job_snapshots (user_id, job_id, raw_data, created_at, updated_at)
SELECT
  a.user_id,
  a.job_id,
  j.raw_data,
  NOW(),
  NOW()
FROM applications a
JOIN jobs j ON j.id = a.job_id
WHERE j.raw_data IS NOT NULL
ON CONFLICT (user_id, job_id) DO NOTHING;

ALTER TABLE jobs DROP COLUMN raw_data;

ALTER TABLE job_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own job snapshots"
  ON job_snapshots
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can insert jobs" ON jobs;
DROP POLICY IF EXISTS "Service role can insert jobs" ON jobs;

CREATE POLICY "Service role can insert jobs"
  ON jobs
  FOR INSERT
  TO service_role
  WITH CHECK (TRUE);

COMMIT;
