-- Migration 002: Tenant tables (all with RLS enabled, org_id on every row)

-- Organizations
CREATE TABLE IF NOT EXISTS public.organizations (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text NOT NULL,
  slug         text UNIQUE,
  industry     text,
  sector       text,
  listed_on    text,
  market_cap   text,
  fiscal_start integer NOT NULL DEFAULT 4,
  logo_url     text,
  is_active    boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Departments (created before profiles so profile FK can reference it)
CREATE TABLE IF NOT EXISTS public.org_departments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  code       text NOT NULL,
  name       text NOT NULL,
  head_name  text,
  head_email text,
  is_active  boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(org_id, code)
);
ALTER TABLE public.org_departments ENABLE ROW LEVEL SECURITY;

-- Profiles (references auth.users; department_id FK added below)
CREATE TABLE IF NOT EXISTS public.profiles (
  id            uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id        uuid REFERENCES public.organizations(id) ON DELETE SET NULL,
  email         text NOT NULL,
  full_name     text,
  role          text NOT NULL DEFAULT 'viewer'
    CHECK(role IN ('super_admin', 'cs_admin', 'dept_poc', 'auditor', 'viewer')),
  department_id uuid,
  avatar_url    text,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Add department FK after both tables exist (avoids forward reference)
ALTER TABLE public.profiles
  ADD CONSTRAINT fk_profile_dept
  FOREIGN KEY (department_id) REFERENCES public.org_departments(id) ON DELETE SET NULL;

-- Org-framework join table (which frameworks each org has enabled)
CREATE TABLE IF NOT EXISTS public.org_frameworks (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id       uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  framework_id uuid NOT NULL REFERENCES public.frameworks(id) ON DELETE CASCADE,
  is_active    boolean NOT NULL DEFAULT true,
  config       jsonb,
  enabled_at   timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE(org_id, framework_id)
);
ALTER TABLE public.org_frameworks ENABLE ROW LEVEL SECURITY;

-- Report periods
CREATE TABLE IF NOT EXISTS public.report_periods (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id     uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name       text NOT NULL,
  code       text NOT NULL,
  start_date date,
  end_date   date,
  status     text NOT NULL DEFAULT 'open'
    CHECK(status IN ('open', 'data_collection', 'review', 'assurance', 'filed', 'closed')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(org_id, code)
);
ALTER TABLE public.report_periods ENABLE ROW LEVEL SECURITY;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_profiles_org_id         ON public.profiles(org_id);
CREATE INDEX IF NOT EXISTS idx_org_departments_org_id  ON public.org_departments(org_id);
CREATE INDEX IF NOT EXISTS idx_org_frameworks_org_id   ON public.org_frameworks(org_id);
CREATE INDEX IF NOT EXISTS idx_report_periods_org_id   ON public.report_periods(org_id);
