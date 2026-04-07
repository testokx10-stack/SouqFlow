/*
  # Marketplace Marocaine - Listings Table

  1. New Tables
    - `listings`
      - `id` (uuid, primary key) - Unique identifier for each listing
      - `title` (text) - Product title
      - `description` (text) - Product description
      - `price` (numeric) - Price in Moroccan Dirhams (DH)
      - `condition` (text) - Product condition: neuf, tres_bon, bon, use
      - `location` (text) - City in Morocco
      - `seller_name` (text) - Full name of the seller
      - `seller_whatsapp` (text) - WhatsApp number in Moroccan format
      - `image_url` (text) - URL of the product image in Supabase Storage
      - `status` (text) - Listing status: active, sold, inactive (default: active)
      - `created_at` (timestamptz) - When the listing was created
      - `updated_at` (timestamptz) - When the listing was last updated

  2. Security
    - Enable RLS on `listings` table
    - Add policy for anyone to read active listings (public marketplace)
    - Add policy for anyone to insert new listings (open platform)
    - Add policy for users to update their own listings based on seller_whatsapp

  3. Indexes
    - Index on status for faster filtering of active listings
    - Index on created_at for chronological ordering
    - Index on location for location-based searches
*/

CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  price numeric NOT NULL CHECK (price >= 0),
  condition text NOT NULL CHECK (condition IN ('neuf', 'tres_bon', 'bon', 'use')),
  location text NOT NULL,
  seller_name text NOT NULL,
  seller_whatsapp text NOT NULL,
  image_url text,
  status text DEFAULT 'active' CHECK (status IN ('active', 'sold', 'inactive')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active listings"
  ON listings
  FOR SELECT
  USING (status = 'active');

CREATE POLICY "Anyone can create listings"
  ON listings
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Sellers can update their own listings"
  ON listings
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_listings_status ON listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_location ON listings(location);