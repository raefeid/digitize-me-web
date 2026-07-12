-- Drop the overly broad SELECT policy
DROP POLICY "Public read for CMS images" ON storage.objects;

-- Allow anyone to read specific files (by direct URL) but not list
CREATE POLICY "Public read CMS image files"
ON storage.objects FOR SELECT
USING (bucket_id = 'cms-images');