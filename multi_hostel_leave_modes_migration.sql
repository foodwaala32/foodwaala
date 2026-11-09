-- =============================================================
-- Migration: Multi-Hostel Leave Modes (Full-Day vs Per-Meal)
-- Run this in Supabase SQL Editor
-- =============================================================

-- 1. Add leave_mode and per-meal rates to hostels table
ALTER TABLE public.hostels
  ADD COLUMN IF NOT EXISTS leave_mode TEXT NOT NULL DEFAULT 'full_day',
  ADD COLUMN IF NOT EXISTS breakfast_rate INTEGER NOT NULL DEFAULT 40,
  ADD COLUMN IF NOT EXISTS lunch_rate INTEGER NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS dinner_rate INTEGER NOT NULL DEFAULT 50;

-- Add check constraint for leave_mode values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'hostels_leave_mode_check'
  ) THEN
    ALTER TABLE public.hostels
      ADD CONSTRAINT hostels_leave_mode_check
      CHECK (leave_mode IN ('full_day', 'per_meal'));
  END IF;
END $$;

-- 2. Add per-meal boolean flags to leaves table
ALTER TABLE public.leaves
  ADD COLUMN IF NOT EXISTS breakfast BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS lunch BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS dinner BOOLEAN NOT NULL DEFAULT true;

-- 3. Backfill: ensure all existing leave records have all meals set to true
-- (This is a no-op if DEFAULT was applied, but ensures safety for any NULLs)
UPDATE public.leaves
SET breakfast = true, lunch = true, dinner = true
WHERE breakfast IS NULL OR lunch IS NULL OR dinner IS NULL;

-- Verify migration
SELECT 'Hostels columns:' AS info;
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'hostels' AND table_schema = 'public'
ORDER BY ordinal_position;

SELECT 'Leaves columns:' AS info;
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'leaves' AND table_schema = 'public'
ORDER BY ordinal_position;
