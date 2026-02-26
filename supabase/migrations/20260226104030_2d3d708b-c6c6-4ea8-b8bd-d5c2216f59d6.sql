-- Allow anyone (even anonymous) to register a hospital with pending status
CREATE POLICY "Anyone can register a hospital" ON public.hospitals
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'pending');