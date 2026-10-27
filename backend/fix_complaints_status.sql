-- Fix for 'Reopened' Server Error on Complaints Update
-- Copy and paste this script into your Supabase SQL Editor to run it.

-- This drops the old constraint that only allowed New, In Progress, and Resolved
ALTER TABLE public.complaints DROP CONSTRAINT IF EXISTS complaints_status_check;

-- This adds the new constraint that also allows "Reopened" which the frontend UI requires
ALTER TABLE public.complaints ADD CONSTRAINT complaints_status_check CHECK (status IN ('New', 'In Progress', 'Resolved', 'Reopened'));
