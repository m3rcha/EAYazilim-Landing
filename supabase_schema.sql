-- =========================================================================================
-- EA Yazılım - Supabase Schema Setup (Phase 1 & 2 & 3)
-- 
-- Instructions: 
-- 1. Create a new Supabase project.
-- 2. Open the SQL Editor in your Supabase dashboard.
-- 3. Paste and run this entire file.
-- =========================================================================================

-- 1. Create Contacts Table
CREATE TABLE public.contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    full_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    business_name TEXT NOT NULL,
    interested_package TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Contacts
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Allow anonymous users (the frontend website) to INSERT into contacts
CREATE POLICY "Allow anonymous insert to contacts"
    ON public.contacts
    FOR INSERT
    TO anon
    WITH CHECK (true);

-- Allow authenticated users (admins) to SELECT and UPDATE contacts
CREATE POLICY "Allow authenticated full access to contacts"
    ON public.contacts
    FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);


-- 2. Create Admin Roles Table (For RBAC)
CREATE TABLE public.admin_roles (
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    role TEXT NOT NULL CHECK (role IN ('super_admin', 'admin')),
    force_password_reset BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Admin Roles
ALTER TABLE public.admin_roles ENABLE ROW LEVEL SECURITY;

-- Only authenticated admins can read the roles table
CREATE POLICY "Allow authenticated read admin_roles"
    ON public.admin_roles
    FOR SELECT
    TO authenticated
    USING (true);

-- Only super_admin can insert admin_roles
CREATE POLICY "Allow super_admin insert admin_roles"
    ON public.admin_roles
    FOR INSERT
    TO authenticated
    WITH CHECK ( (SELECT role FROM public.admin_roles WHERE user_id = auth.uid()) = 'super_admin' );

-- Only super_admin can update admin_roles
CREATE POLICY "Allow super_admin update admin_roles"
    ON public.admin_roles
    FOR UPDATE
    TO authenticated
    USING ( (SELECT role FROM public.admin_roles WHERE user_id = auth.uid()) = 'super_admin' )
    WITH CHECK ( (SELECT role FROM public.admin_roles WHERE user_id = auth.uid()) = 'super_admin' );

-- Only super_admin can delete admin_roles
CREATE POLICY "Allow super_admin delete admin_roles"
    ON public.admin_roles
    FOR DELETE
    TO authenticated
    USING ( (SELECT role FROM public.admin_roles WHERE user_id = auth.uid()) = 'super_admin' );

-- Note: The ege.ozten user will need to be created via the Supabase Auth UI or Admin Panel,
-- and then manually inserted into the admin_roles table as 'super_admin' via the SQL editor 
-- for the very first setup. We will cover this in Phase 2.
