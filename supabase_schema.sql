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
    email TEXT,
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


-- =========================================================================================
-- POS Dashboard API - Schema (Phase 4)
-- Tables: businesses, transactions
-- =========================================================================================

-- 3. Create Businesses Table (Restaurant Registry)
CREATE TABLE public.businesses (
    business_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Businesses
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;

-- Service role has full access (used by the API server)
-- No public/anon access needed - all access goes through the API
CREATE POLICY "Allow service_role full access to businesses"
    ON public.businesses
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);


-- 4. Create Transactions Table (POS Transaction Log)
CREATE TABLE public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    business_id TEXT NOT NULL REFERENCES public.businesses(business_id) ON DELETE CASCADE,
    device_id TEXT NOT NULL,
    amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'refunded', 'cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on Transactions
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Service role has full access (used by the API server)
CREATE POLICY "Allow service_role full access to transactions"
    ON public.transactions
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Allow authenticated admins to read transactions (for PDF reports)
CREATE POLICY "Allow authenticated read transactions"
    ON public.transactions
    FOR SELECT
    TO authenticated
    USING (true);

-- Performance Indexes
CREATE INDEX idx_transactions_business_id ON public.transactions(business_id);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX idx_transactions_business_created ON public.transactions(business_id, created_at DESC);

-- Composite index for duplicate detection (business_id + device_id + amount + created_at)
CREATE INDEX idx_transactions_duplicate_check 
    ON public.transactions(business_id, device_id, amount, created_at DESC);

-- =========================================================================================
-- Seed Example Business (Optional - for testing)
-- =========================================================================================
-- INSERT INTO public.businesses (business_id, name)
-- VALUES ('KAFE-XK7R9M', 'Test Kafe');


-- =========================================================================================
-- Centralized Logging - Schema (Phase 5)
-- Table: system_logs
-- =========================================================================================

-- 5. Create System Logs Table (Centralized Error Logging)
CREATE TABLE public.system_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    level TEXT NOT NULL CHECK (level IN ('error', 'warn', 'info')),
    message TEXT NOT NULL,
    meta JSONB DEFAULT '{}',
    source TEXT DEFAULT 'pos-api',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS on System Logs
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Service role: full access (API server writes logs)
CREATE POLICY "Allow service_role full access to system_logs"
    ON public.system_logs FOR ALL TO service_role
    USING (true) WITH CHECK (true);

-- Authenticated admins: read-only (for future admin log viewer)
CREATE POLICY "Allow authenticated read system_logs"
    ON public.system_logs FOR SELECT TO authenticated
    USING (true);

-- Performance Indexes
CREATE INDEX idx_system_logs_created_at ON public.system_logs(created_at DESC);
CREATE INDEX idx_system_logs_level ON public.system_logs(level);


-- =========================================================================================
-- Tiered Licensing System - Schema (Phase 6)
-- Adds licensing columns to businesses table
-- =========================================================================================

-- 6. Add Licensing Columns to Businesses Table
ALTER TABLE public.businesses
  ADD COLUMN is_licensed BOOLEAN DEFAULT true,
  ADD COLUMN license_tier TEXT DEFAULT 'basic'
    CHECK (license_tier IN ('basic', 'pro', 'enterprise')),
  ADD COLUMN license_expires_at TIMESTAMP WITH TIME ZONE
    DEFAULT (now() + INTERVAL '1 year');

-- Allow super_admin to update businesses (license management)
CREATE POLICY "Allow super_admin update businesses"
    ON public.businesses FOR UPDATE TO authenticated
    USING (true)
    WITH CHECK (
        (SELECT role FROM public.admin_roles WHERE user_id = auth.uid()) = 'super_admin'
    );
