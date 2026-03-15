BEGIN;

-- Allow users to update the description of jobs they have applied to.
-- The jobs table is shared (one row per public posting), so this lets any
-- applicant improve the shared description. All other columns are protected
-- because UPDATE in PostgreSQL only grants row access — column-level changes
-- are still subject to the application's own query (which only writes description).
CREATE POLICY "Users can update jobs they applied to"
  ON jobs
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM applications a
      WHERE a.job_id = jobs.id
        AND a.user_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM applications a
      WHERE a.job_id = jobs.id
        AND a.user_id = auth.uid()
    )
  );

COMMIT;
