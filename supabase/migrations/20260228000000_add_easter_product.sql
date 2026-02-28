-- Migration: Add is_easter_product field to products table
-- Date: 2026-02-28
-- Run this in Supabase SQL Editor

-- 1. Add the is_easter_product column
ALTER TABLE products ADD COLUMN IF NOT EXISTS is_easter_product BOOLEAN DEFAULT FALSE;

COMMENT ON COLUMN products.is_easter_product IS 'Indica se o produto é exclusivo de Páscoa (não aparece no catálogo principal)';

-- 2. Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_products_is_easter_product ON products(is_easter_product) WHERE is_easter_product = true;

-- 3. Update existing policies if needed (products should still be readable)
-- The column is automatically readable with existing policies
