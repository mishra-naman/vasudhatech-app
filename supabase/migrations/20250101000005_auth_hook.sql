-- Migration 005: Custom Access Token Hook
-- Injects org_id, user_role, dept_id into JWT claims from profiles table.
-- After pushing this migration, MANUALLY enable the hook in Supabase Dashboard:
--   Authentication → Hooks → Custom Access Token → select public.custom_access_token_hook

CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE
  claims        jsonb;
  user_org_id   uuid;
  user_role     text;
  user_dept_id  uuid;
BEGIN
  claims := event->'claims';

  SELECT p.org_id, p.role, p.department_id
  INTO user_org_id, user_role, user_dept_id
  FROM public.profiles p
  WHERE p.id = (event->>'user_id')::uuid;

  IF user_org_id IS NOT NULL THEN
    claims := jsonb_set(claims, '{org_id}',    to_jsonb(user_org_id::text));
    claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
    IF user_dept_id IS NOT NULL THEN
      claims := jsonb_set(claims, '{dept_id}', to_jsonb(user_dept_id::text));
    END IF;
  END IF;

  RETURN jsonb_build_object('claims', claims);
END;
$$;

GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;
GRANT SELECT ON public.profiles TO supabase_auth_admin;
