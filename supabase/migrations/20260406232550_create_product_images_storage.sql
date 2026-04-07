/*
  # Storage Configuration for Product Images

  1. Storage Setup
    - Create a public bucket called 'product-images' for storing listing images
    - Allow public access for reading images
    - Allow anyone to upload images (open marketplace)

  2. Security
    - Public bucket for easy image access
    - File size limit and type restrictions handled at application level
*/

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Anyone can view product images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Anyone can upload product images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Anyone can update product images"
  ON storage.objects
  FOR UPDATE
  USING (bucket_id = 'product-images')
  WITH CHECK (bucket_id = 'product-images');

CREATE POLICY "Anyone can delete product images"
  ON storage.objects
  FOR DELETE
  USING (bucket_id = 'product-images');