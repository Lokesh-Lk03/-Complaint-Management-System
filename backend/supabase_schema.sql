-- Copy and paste this into the Supabase SQL Editor
-- This script sets up the database schema for the University ERP & Grievance Management System

-- 1. Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY, -- STU12345 or ADM123
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL, -- Stored as bcrypt hash from backend
    role TEXT NOT NULL CHECK (role IN ('student', 'admin', 'faculty', 'staff')),
    course TEXT, -- Only for students
    contact TEXT,
    dept TEXT, -- Department for staff/faculty or School for students
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'blocked')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create Complaints Table
CREATE TABLE IF NOT EXISTS public.complaints (
    id TEXT PRIMARY KEY, -- CMP+RandomNumber
    "studentId" TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- Academic, Infrastructure, Transport, Hostel, Discipline, Other
    subject TEXT NOT NULL,
    description TEXT,
    status TEXT DEFAULT 'New' CHECK (status IN ('New', 'In Progress', 'Resolved', 'Reopened')),
    referral TEXT DEFAULT '',
    remarks TEXT DEFAULT '',
    course TEXT DEFAULT '',
    school TEXT DEFAULT '',
    attachment_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- If the table already exists, safely add any missing columns
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS course TEXT DEFAULT '';
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS school TEXT DEFAULT '';
ALTER TABLE public.complaints ADD COLUMN IF NOT EXISTS attachment_url TEXT;

-- Update constraint to support Reopened status
ALTER TABLE public.complaints DROP CONSTRAINT IF EXISTS complaints_status_check;
ALTER TABLE public.complaints ADD CONSTRAINT complaints_status_check CHECK (status IN ('New', 'In Progress', 'Resolved', 'Reopened'));

-- 3. Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" TEXT REFERENCES public.users(id) ON DELETE CASCADE, -- Specific user (student)
    role TEXT, -- Or role-based notification (e.g. 'admin')
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    icon TEXT DEFAULT 'fa-bell',
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow All operations for Service/Anon" ON public.users;
CREATE POLICY "Allow All operations for Service/Anon" ON public.users FOR ALL USING (true);

ALTER TABLE public.complaints ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow All operations for Service/Anon" ON public.complaints;
CREATE POLICY "Allow All operations for Service/Anon" ON public.complaints FOR ALL USING (true);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow All operations for Service/Anon" ON public.notifications;
CREATE POLICY "Allow All operations for Service/Anon" ON public.notifications FOR ALL USING (true);

-- 5. Storage Bucket Configuration
-- Creates the complaint-attachments bucket if not already present
INSERT INTO storage.buckets (id, name, public) 
VALUES ('complaint-attachments', 'complaint-attachments', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage RLS policy allowing anon uploads and reads
DROP POLICY IF EXISTS "Allow Public Access to Attachments" ON storage.objects;
DROP POLICY IF EXISTS "Allow Uploads to Attachments" ON storage.objects;

CREATE POLICY "Allow Public Access to Attachments" ON storage.objects 
FOR SELECT USING (bucket_id = 'complaint-attachments');

CREATE POLICY "Allow Uploads to Attachments" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'complaint-attachments');

-- 6. Insert Default Seed Accounts
-- Passwords:
-- admin: 'admin123'
-- student: 'student123'
-- department admins: 'password123'
INSERT INTO public.users (id, name, email, password, role, dept)
VALUES 
    ('admin', 'System Admin', 'admin@university.edu', '$2a$10$eE0mEDD8d/y4jItJOS1i8e8s.zT8S2sZ/YFz8X5n/Z3h9Qc8o9q/S', 'admin', 'Central Administration'),
    ('student', 'Demo Student', 'student@university.edu', '$2a$10$w0B/5I0f5/j.RLE8r8o4zuaJ4xO4.Ry2X2r7rGqG0K.4J4Qk4/h0O', 'student', 'School of Computer Science'),
    ('dept_academic', 'Academic Admin', 'academic@university.edu', '$2a$10$eE0mEDD8d/y4jItJOS1i8e8s.zT8S2sZ/YFz8X5n/Z3h9Qc8o9q/S', 'staff', 'Academic'),
    ('dept_infra', 'Infrastructure Officer', 'infra@university.edu', '$2a$10$eE0mEDD8d/y4jItJOS1i8e8s.zT8S2sZ/YFz8X5n/Z3h9Qc8o9q/S', 'staff', 'Infrastructure'),
    ('dept_transport', 'Transport Manager', 'transport@university.edu', '$2a$10$eE0mEDD8d/y4jItJOS1i8e8s.zT8S2sZ/YFz8X5n/Z3h9Qc8o9q/S', 'staff', 'Transport'),
    ('dept_hostel', 'Hostel Warden', 'hostel@university.edu', '$2a$10$eE0mEDD8d/y4jItJOS1i8e8s.zT8S2sZ/YFz8X5n/Z3h9Qc8o9q/S', 'staff', 'Hostel'),
    ('dept_discipline', 'Discipline Head', 'discipline@university.edu', '$2a$10$eE0mEDD8d/y4jItJOS1i8e8s.zT8S2sZ/YFz8X5n/Z3h9Qc8o9q/S', 'staff', 'Discipline')
ON CONFLICT (id) DO UPDATE SET 
    dept = EXCLUDED.dept,
    role = EXCLUDED.role;
