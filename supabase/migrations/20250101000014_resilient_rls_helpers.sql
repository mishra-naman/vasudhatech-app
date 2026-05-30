-- Migration 014: Make the RLS helper functions resilient to a missing JWT claim.
--
-- The Custom Access Token Hook injects org_id/user_role into the JWT, but if it
-- isn't enabled (or the token predates onboarding), those claims are absent and
-- every tenant query silently returns nothing. These helpers now fall back to
-- the caller's profile row (looked up via auth.uid(), which is always present)
-- when the claim is missing.
--
-- SECURITY DEFINER is required so the profile lookup bypasses RLS on `profiles`
-- (whose own policy calls requesting_org_id()), avoiding infinite recursion.
-- When the JWT claim IS present, COALESCE short-circuits and no lookup happens,
-- so there is no performance cost once the access-token hook is active.

CREATE OR REPLACE FUNCTION public.requesting_org_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    NULLIF(current_setting('request.jwt.claims', true)::jsonb->>'org_id', '')::uuid,
    (SELECT org_id FROM public.profiles WHERE id = auth.uid()),
    '00000000-0000-0000-0000-000000000000'::uuid
  )
$$;

CREATE OR REPLACE FUNCTION public.requesting_user_role()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    NULLIF(current_setting('request.jwt.claims', true)::jsonb->>'user_role', ''),
    (SELECT role FROM public.profiles WHERE id = auth.uid()),
    'viewer'
  )
$$;

GRANT EXECUTE ON FUNCTION public.requesting_org_id()     TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.requesting_user_role()  TO authenticated, anon;
