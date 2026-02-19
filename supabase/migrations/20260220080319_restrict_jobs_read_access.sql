BEGIN;

-- Drop the existing public read policy
DROP POLICY IF EXISTS "Authenticated users can read jobs" ON jobs;

-- Create a new policy that only allows reading jobs the user has applied to
CREATE POLICY "Users can only read jobs they applied to"
  ON jobs
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM applications a
      WHERE a.job_id = jobs.id
        AND a.user_id = auth.uid()
    )
  );

COMMIT;
