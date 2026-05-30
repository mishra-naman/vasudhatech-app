-- Migration 007: RLS helper functions + policies for all tenant tables

-- Helper: read org_id from JWT without a DB round-trip
CREATE OR REPLACE FUNCTION public.requesting_org_id()
RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::jsonb->>'org_id')::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid
  )
$$;

-- Helper: read user role from JWT
CREATE OR REPLACE FUNCTION public.requesting_user_role()
RETURNS text LANGUAGE sql STABLE AS $$
  SELECT COALESCE(
    current_setting('request.jwt.claims', true)::jsonb->>'user_role',
    'viewer'
  )
$$;

-- ============================================================
-- organizations
-- ============================================================
CREATE POLICY "org_select" ON public.organizations
  FOR SELECT TO authenticated
  USING (id = public.requesting_org_id());

CREATE POLICY "org_insert" ON public.organizations
  FOR INSERT TO authenticated
  WITH CHECK (public.requesting_user_role() IN ('super_admin'));

CREATE POLICY "org_update" ON public.organizations
  FOR UPDATE TO authenticated
  USING (id = public.requesting_org_id())
  WITH CHECK (public.requesting_user_role() IN ('cs_admin', 'super_admin'));

-- ============================================================
-- profiles
-- ============================================================
CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT TO authenticated
  USING (org_id = public.requesting_org_id() OR id = auth.uid());

CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ============================================================
-- org_departments
-- ============================================================
CREATE POLICY "depts_select" ON public.org_departments
  FOR SELECT TO authenticated
  USING (org_id = public.requesting_org_id());

CREATE POLICY "depts_insert" ON public.org_departments
  FOR INSERT TO authenticated
  WITH CHECK (
    org_id = public.requesting_org_id() AND
    public.requesting_user_role() IN ('cs_admin', 'super_admin')
  );

CREATE POLICY "depts_update" ON public.org_departments
  FOR UPDATE TO authenticated
  USING (org_id = public.requesting_org_id())
  WITH CHECK (public.requesting_user_role() IN ('cs_admin', 'super_admin'));

-- ============================================================
-- org_frameworks
-- ============================================================
CREATE POLICY "org_frameworks_select" ON public.org_frameworks
  FOR SELECT TO authenticated
  USING (org_id = public.requesting_org_id());

CREATE POLICY "org_frameworks_insert" ON public.org_frameworks
  FOR INSERT TO authenticated
  WITH CHECK (
    org_id = public.requesting_org_id() AND
    public.requesting_user_role() IN ('cs_admin', 'super_admin')
  );

CREATE POLICY "org_frameworks_update" ON public.org_frameworks
  FOR UPDATE TO authenticated
  USING (org_id = public.requesting_org_id())
  WITH CHECK (public.requesting_user_role() IN ('cs_admin', 'super_admin'));

-- ============================================================
-- report_periods
-- ============================================================
CREATE POLICY "periods_select" ON public.report_periods
  FOR SELECT TO authenticated
  USING (org_id = public.requesting_org_id());

CREATE POLICY "periods_insert" ON public.report_periods
  FOR INSERT TO authenticated
  WITH CHECK (
    org_id = public.requesting_org_id() AND
    public.requesting_user_role() IN ('cs_admin', 'super_admin')
  );

CREATE POLICY "periods_update" ON public.report_periods
  FOR UPDATE TO authenticated
  USING (org_id = public.requesting_org_id())
  WITH CHECK (public.requesting_user_role() IN ('cs_admin', 'super_admin'));

-- ============================================================
-- question_assignments
-- ============================================================
CREATE POLICY "assignments_select" ON public.question_assignments
  FOR SELECT TO authenticated
  USING (org_id = public.requesting_org_id());

CREATE POLICY "assignments_insert" ON public.question_assignments
  FOR INSERT TO authenticated
  WITH CHECK (
    org_id = public.requesting_org_id() AND
    public.requesting_user_role() IN ('cs_admin', 'super_admin')
  );

CREATE POLICY "assignments_update" ON public.question_assignments
  FOR UPDATE TO authenticated
  USING (org_id = public.requesting_org_id())
  WITH CHECK (public.requesting_user_role() IN ('cs_admin', 'super_admin'));

-- ============================================================
-- responses
-- ============================================================
CREATE POLICY "responses_select" ON public.responses
  FOR SELECT TO authenticated
  USING (org_id = public.requesting_org_id());

CREATE POLICY "responses_insert" ON public.responses
  FOR INSERT TO authenticated
  WITH CHECK (
    org_id = public.requesting_org_id() AND
    public.requesting_user_role() IN ('dept_poc', 'cs_admin', 'super_admin')
  );

-- POCs update own drafts; admins update any response in their org
CREATE POLICY "responses_update_poc" ON public.responses
  FOR UPDATE TO authenticated
  USING (
    org_id = public.requesting_org_id() AND
    public.requesting_user_role() = 'dept_poc' AND
    user_id = auth.uid() AND
    status IN ('draft', 'rejected')
  );

CREATE POLICY "responses_update_admin" ON public.responses
  FOR UPDATE TO authenticated
  USING (
    org_id = public.requesting_org_id() AND
    public.requesting_user_role() IN ('cs_admin', 'super_admin')
  );

-- ============================================================
-- audit_logs
-- ============================================================
CREATE POLICY "audit_select" ON public.audit_logs
  FOR SELECT TO authenticated
  USING (
    org_id = public.requesting_org_id() AND
    public.requesting_user_role() IN ('cs_admin', 'super_admin', 'auditor')
  );

-- audit_logs are written by service role / triggers only — no user insert policy

-- ============================================================
-- notifications
-- ============================================================
CREATE POLICY "notif_select" ON public.notifications
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "notif_update" ON public.notifications
  FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());
