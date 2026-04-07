/*
  # Add Category to Listings Table

  Add category column to listings table for better organization
*/

ALTER TABLE listings ADD COLUMN category text CHECK (category IN ('electronics', 'cars', 'clothes', 'home', 'sports', 'books', 'other'));