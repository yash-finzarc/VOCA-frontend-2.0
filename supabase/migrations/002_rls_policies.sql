-- RLS (Row Level Security) Policies for VOCA Application
-- 
-- Run this in your Supabase SQL Editor:
-- https://app.supabase.com/project/_/sql/new
--
-- These policies allow users to:
-- 1. Read and write their own user record
-- 2. Read and write organizations they're members of
-- 3. Read and write projects in their organizations
-- 4. Read and write calls, campaigns, etc. in their projects

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.calling_campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_prompts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.excel_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- USERS TABLE POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;

-- Users can read their own record
CREATE POLICY "Users can read own profile"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own record
CREATE POLICY "Users can update own profile"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own record (for signup)
CREATE POLICY "Users can insert own profile"
  ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================
-- ORGANIZATIONS TABLE POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read own organizations" ON public.organizations;
DROP POLICY IF EXISTS "Users can create organizations" ON public.organizations;
DROP POLICY IF EXISTS "Users can update own organizations" ON public.organizations;

-- Users can read organizations they're members of
CREATE POLICY "Users can read own organizations"
  ON public.organizations
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = organizations.id
      AND organization_members.user_id = auth.uid()
      AND organization_members.status = 'active'
    )
  );

-- Users can create organizations (for signup)
CREATE POLICY "Users can create organizations"
  ON public.organizations
  FOR INSERT
  WITH CHECK (true);

-- Users can update organizations they're owners/admins of
CREATE POLICY "Users can update own organizations"
  ON public.organizations
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = organizations.id
      AND organization_members.user_id = auth.uid()
      AND organization_members.role IN ('owner', 'admin')
      AND organization_members.status = 'active'
    )
  );

-- ============================================
-- ORGANIZATION_MEMBERS TABLE POLICIES
-- ============================================

-- Helper function to check membership (bypasses RLS to avoid recursion)
CREATE OR REPLACE FUNCTION public.user_is_org_member(org_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.organization_members 
    WHERE organization_id = org_id 
    AND user_id = auth.uid() 
    AND status = 'active'
  );
$$;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read organization members" ON public.organization_members;
DROP POLICY IF EXISTS "Users can insert own membership" ON public.organization_members;

-- Users can read organization members of organizations they belong to
-- FIXED: Use a SECURITY DEFINER function to avoid infinite recursion
CREATE POLICY "Users can read organization members"
  ON public.organization_members
  FOR SELECT
  USING (public.user_is_org_member(organization_id));

-- Users can insert themselves as members (for signup)
CREATE POLICY "Users can insert own membership"
  ON public.organization_members
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- PROJECTS TABLE POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read organization projects" ON public.projects;
DROP POLICY IF EXISTS "Users can create projects" ON public.projects;
DROP POLICY IF EXISTS "Users can update projects" ON public.projects;

-- Users can read projects in organizations they belong to
CREATE POLICY "Users can read organization projects"
  ON public.projects
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = projects.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.status = 'active'
    )
  );

-- Users can create projects in organizations they belong to
CREATE POLICY "Users can create projects"
  ON public.projects
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = projects.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.status = 'active'
    )
  );

-- Users can update projects in organizations they belong to
CREATE POLICY "Users can update projects"
  ON public.projects
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = projects.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.status = 'active'
    )
  );

-- ============================================
-- CALLS TABLE POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read organization calls" ON public.calls;
DROP POLICY IF EXISTS "Users can create calls" ON public.calls;

-- Users can read calls in their organization
CREATE POLICY "Users can read organization calls"
  ON public.calls
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = calls.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.status = 'active'
    )
  );

-- Users can create calls in their organization
CREATE POLICY "Users can create calls"
  ON public.calls
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = calls.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.status = 'active'
    )
  );

-- ============================================
-- CALLING_CAMPAIGNS TABLE POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read organization campaigns" ON public.calling_campaigns;
DROP POLICY IF EXISTS "Users can create campaigns" ON public.calling_campaigns;

-- Users can read campaigns in their organization
CREATE POLICY "Users can read organization campaigns"
  ON public.calling_campaigns
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = calling_campaigns.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.status = 'active'
    )
  );

-- Users can create campaigns in their organization
CREATE POLICY "Users can create campaigns"
  ON public.calling_campaigns
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = calling_campaigns.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.status = 'active'
    )
  );

-- ============================================
-- SYSTEM_PROMPTS TABLE POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read organization prompts" ON public.system_prompts;
DROP POLICY IF EXISTS "Users can create prompts" ON public.system_prompts;
DROP POLICY IF EXISTS "Users can update prompts" ON public.system_prompts;

-- Users can read prompts in their organization
CREATE POLICY "Users can read organization prompts"
  ON public.system_prompts
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = system_prompts.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.status = 'active'
    )
  );

-- Users can create prompts in their organization
CREATE POLICY "Users can create prompts"
  ON public.system_prompts
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = system_prompts.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.status = 'active'
    )
  );

-- Users can update prompts in their organization
CREATE POLICY "Users can update prompts"
  ON public.system_prompts
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = system_prompts.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.status = 'active'
    )
  );

-- ============================================
-- ACTIVITY_LOGS TABLE POLICIES
-- ============================================

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can read organization logs" ON public.activity_logs;
DROP POLICY IF EXISTS "Users can create logs" ON public.activity_logs;

-- Users can read logs in their organization
CREATE POLICY "Users can read organization logs"
  ON public.activity_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = activity_logs.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.status = 'active'
    )
  );

-- Users can create logs in their organization
CREATE POLICY "Users can create logs"
  ON public.activity_logs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_members
      WHERE organization_members.organization_id = activity_logs.organization_id
      AND organization_members.user_id = auth.uid()
      AND organization_members.status = 'active'
    )
  );
