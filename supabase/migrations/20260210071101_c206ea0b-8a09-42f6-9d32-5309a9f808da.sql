
-- Create storage bucket for admin uploads
INSERT INTO storage.buckets (id, name, public)
VALUES ('admin-uploads', 'admin-uploads', true);

-- Allow authenticated users to upload files
CREATE POLICY "Authenticated users can upload files"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'admin-uploads' AND auth.role() = 'authenticated');

-- Allow public read access
CREATE POLICY "Public read access for admin uploads"
ON storage.objects FOR SELECT
USING (bucket_id = 'admin-uploads');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update files"
ON storage.objects FOR UPDATE
USING (bucket_id = 'admin-uploads' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete files
CREATE POLICY "Authenticated users can delete files"
ON storage.objects FOR DELETE
USING (bucket_id = 'admin-uploads' AND auth.role() = 'authenticated');
