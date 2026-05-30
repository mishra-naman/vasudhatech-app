-- Migration 013: Cross-framework auto-population RPC

CREATE OR REPLACE FUNCTION public.auto_populate_linked_responses(
  p_source_question_id uuid,
  p_period_id          uuid,
  p_value              text,
  p_numeric_value      decimal
)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_org_id          uuid    := public.requesting_org_id();
  v_user_id         uuid    := auth.uid();
  v_datapoint_key   text;
  v_source_code     text;
  v_source_fw_code  text;
  v_populated       integer := 0;
BEGIN
  -- Find this question's datapoint key + its code and framework
  SELECT dm.datapoint_key, q.code, f.code
  INTO   v_datapoint_key, v_source_code, v_source_fw_code
  FROM   public.datapoint_mappings dm
  JOIN   public.questions   q  ON q.id  = dm.question_id
  JOIN   public.indicators  i  ON i.id  = q.indicator_id
  JOIN   public.principles  p  ON p.id  = i.principle_id
  JOIN   public.frameworks  f  ON f.id  = p.framework_id
  WHERE  dm.question_id = p_source_question_id
  LIMIT  1;

  -- Nothing to do if this question has no cross-mapping
  IF v_datapoint_key IS NULL THEN
    RETURN 0;
  END IF;

  -- Upsert a draft response for every OTHER question that shares the same datapoint_key
  -- Skip questions whose existing responses are already approved or submitted
  INSERT INTO public.responses (
    question_id, report_period_id, org_id, user_id,
    value, numeric_value, notes, status
  )
  SELECT
    dm.question_id,
    p_period_id,
    v_org_id,
    v_user_id,
    CASE
      WHEN p_numeric_value IS NOT NULL
       THEN round((p_numeric_value * dm.conversion_factor)::numeric, 4)::text
      ELSE p_value
    END,
    CASE
      WHEN p_numeric_value IS NOT NULL
       THEN round((p_numeric_value * dm.conversion_factor)::numeric, 6)
      ELSE NULL
    END,
    '[Auto-populated from ' || v_source_fw_code || ' ' || v_source_code || ']',
    'draft'
  FROM public.datapoint_mappings dm
  WHERE dm.datapoint_key = v_datapoint_key
    AND dm.question_id  <> p_source_question_id
  ON CONFLICT (question_id, report_period_id, org_id)
  DO UPDATE SET
    value         = EXCLUDED.value,
    numeric_value = EXCLUDED.numeric_value,
    notes         = EXCLUDED.notes,
    updated_at    = now()
  WHERE responses.status NOT IN ('approved', 'submitted');

  GET DIAGNOSTICS v_populated = ROW_COUNT;
  RETURN v_populated;
END;
$$;

GRANT EXECUTE ON FUNCTION public.auto_populate_linked_responses TO authenticated;
