CREATE POLICY "Public can read CMS images"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'cms-images');