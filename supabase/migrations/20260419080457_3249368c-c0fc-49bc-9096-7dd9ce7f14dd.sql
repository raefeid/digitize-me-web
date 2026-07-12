UPDATE storage.buckets
SET file_size_limit = 52428800
WHERE id = 'cms-images';

-- Ensure the bucket has authenticated upload policy (admins only)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can upload to cms-images'
  ) THEN
    CREATE POLICY "Admins can upload to cms-images"
      ON storage.objects FOR INSERT
      TO authenticated
      WITH CHECK (bucket_id = 'cms-images' AND public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Anyone can read cms-images'
  ) THEN
    CREATE POLICY "Anyone can read cms-images"
      ON storage.objects FOR SELECT
      USING (bucket_id = 'cms-images');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can update cms-images'
  ) THEN
    CREATE POLICY "Admins can update cms-images"
      ON storage.objects FOR UPDATE
      TO authenticated
      USING (bucket_id = 'cms-images' AND public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'Admins can delete cms-images'
  ) THEN
    CREATE POLICY "Admins can delete cms-images"
      ON storage.objects FOR DELETE
      TO authenticated
      USING (bucket_id = 'cms-images' AND public.has_role(auth.uid(), 'admin'::public.app_role));
  END IF;
END $$;