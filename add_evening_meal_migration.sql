-- =============================================================
-- Migration: Add Evening Meal to Per-Meal Mode
-- Run this in Supabase SQL Editor
-- =============================================================

-- 1. Add evening_rate to hostels table (default ₹20)
ALTER TABLE public.hostels
  ADD COLUMN IF NOT EXISTS evening_rate INTEGER NOT NULL DEFAULT 20;

-- 2. Add evening boolean flag to leaves table (default true)
ALTER TABLE public.leaves
  ADD COLUMN IF NOT EXISTS evening BOOLEAN NOT NULL DEFAULT true;

-- 3. Backfill: ensure all existing leave records have evening set to true
UPDATE public.leaves
SET evening = true
WHERE evening IS NULL;

-- Verify migration
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'hostels' AND table_schema = 'public' AND column_name LIKE '%rate%'
ORDER BY ordinal_position;

SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'leaves' AND table_schema = 'public'
ORDER BY ordinal_position;
