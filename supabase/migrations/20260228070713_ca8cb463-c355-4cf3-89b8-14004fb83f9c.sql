
-- Drop the authenticated-only policy and replace with a public one
DROP POLICY IF EXISTS "Authenticated users can view approved hospitals" ON hospitals;

CREATE POLICY "Anyone can view approved hospitals"
  ON hospitals
  FOR SELECT
  USING (status = 'approved');
