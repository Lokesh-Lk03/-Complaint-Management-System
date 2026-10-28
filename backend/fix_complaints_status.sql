-- Fix for 'Reopened' and 'Reopen Requested' Status on Complaints Update
-- Copy and paste this script into your Supabase SQL Editor if needed.

-- Drop any existing check constraint on complaint status
ALTER TABLE public.complaints DROP CONSTRAINT IF EXISTS complaints_status_check;

-- Add updated constraint allowing all active statuses including 'Reopen Requested'
ALTER TABLE public.complaints ADD CONSTRAINT complaints_status_check CHECK (status IN ('New', 'In Progress', 'Resolved', 'Reopened', 'Reopen Requested'));

