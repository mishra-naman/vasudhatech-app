-- Migration 010: RPC function for onboarding flow
-- Runs as SECURITY DEFINER so new users (no org_id in JWT yet) can create their org

CREATE OR REPLACE FUNCTION public.create_org_for_user(
  p_org_name       text,
  p_industry       text,
  p_sector         text,
  p_listed_on      text,
  p_market_cap     text,
  p_fiscal_start   integer,
  p_framework_ids  uuid[],
  p_departments    jsonb
)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_org_id         uuid;
  v_period_id      uuid;
  v_dept           jsonb;
  v_slug           text;
  v_cur_month      integer;
  v_cur_year       integer;
  v_fy_start_year  integer;
  v_fy_end_year    integer;
  v_fy_end_month   integer;
  v_fy_end_day     integer;
BEGIN
  -- Guard: caller must exist with no org yet
  IF NOT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND org_id IS NULL
  ) THEN
    RAISE EXCEPTION 'User already has an organisation or profile not found';
  END IF;

  -- Build a URL-safe slug: lowercase, non-alphanum → dash, append 6-char UUID fragment
  v_slug := lower(regexp_replace(p_org_name, '[^a-zA-Z0-9]+', '-', 'g'))
             || '-' || substring(gen_random_uuid()::text, 1, 6);

  -- 1. Create organisation
  INSERT INTO public.organizations (name, slug, industry, sector, listed_on, market_cap, fiscal_start)
  VALUES (p_org_name, v_slug, p_industry, p_sector, p_listed_on, p_market_cap, p_fiscal_start)
  RETURNING id INTO v_org_id;

  -- 2. Set profile to cs_admin + link org
  UPDATE public.profiles SET org_id = v_org_id, role = 'cs_admin' WHERE id = auth.uid();

  -- 3. Create departments
  FOR v_dept IN SELECT * FROM jsonb_array_elements(p_departments) LOOP
    INSERT INTO public.org_departments (org_id, code, name, head_email)
    VALUES (
      v_org_id,
      v_dept->>'code',
      v_dept->>'name',
      NULLIF(trim(v_dept->>'head_email'), '')
    );
  END LOOP;

  -- 4. Enable selected frameworks
  IF p_framework_ids IS NOT NULL AND array_length(p_framework_ids, 1) > 0 THEN
    INSERT INTO public.org_frameworks (org_id, framework_id, is_active, enabled_at)
    SELECT v_org_id, fid, true, now()
    FROM unnest(p_framework_ids) AS fid;
  END IF;

  -- 5. Create default report period for current fiscal year
  v_cur_month := EXTRACT(MONTH FROM now())::integer;
  v_cur_year  := EXTRACT(YEAR FROM now())::integer;

  IF v_cur_month >= p_fiscal_start THEN
    v_fy_start_year := v_cur_year;
    v_fy_end_year   := v_cur_year + 1;
  ELSE
    v_fy_start_year := v_cur_year - 1;
    v_fy_end_year   := v_cur_year;
  END IF;

  -- FY ends the month before fiscal_start
  v_fy_end_month := CASE WHEN p_fiscal_start = 1 THEN 12 ELSE p_fiscal_start - 1 END;
  -- Last day of that month
  v_fy_end_day := EXTRACT(DAY FROM
    (make_date(v_fy_end_year, v_fy_end_month, 1) + interval '1 month - 1 day')
  )::integer;

  INSERT INTO public.report_periods (org_id, name, code, start_date, end_date, status)
  VALUES (
    v_org_id,
    'FY ' || v_fy_start_year || '-' || lpad((v_fy_end_year % 100)::text, 2, '0'),
    'FY' || v_fy_start_year || '-' || lpad((v_fy_end_year % 100)::text, 2, '0'),
    make_date(v_fy_start_year, p_fiscal_start, 1),
    make_date(v_fy_end_year, v_fy_end_month, v_fy_end_day),
    'open'
  )
  RETURNING id INTO v_period_id;

  RETURN jsonb_build_object(
    'org_id',    v_org_id::text,
    'period_id', v_period_id::text
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.create_org_for_user TO authenticated;
