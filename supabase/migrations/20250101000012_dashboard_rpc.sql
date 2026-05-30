-- Migration 012: Dashboard statistics RPC — returns all dashboard data in one call

CREATE OR REPLACE FUNCTION public.get_dashboard_stats(p_period_id uuid)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_org_id uuid := public.requesting_org_id();
BEGIN
  RETURN jsonb_build_object(

    -- Overall totals for the period
    'totals', (
      SELECT row_to_json(t) FROM (
        SELECT
          COUNT(qa.id)::int                                              AS total_assigned,
          COUNT(r.id) FILTER (WHERE r.status = 'approved')::int         AS approved,
          COUNT(r.id) FILTER (WHERE r.status = 'submitted')::int        AS submitted,
          COUNT(r.id) FILTER (WHERE r.status = 'draft')::int            AS draft,
          COUNT(r.id) FILTER (WHERE r.status = 'rejected')::int         AS rejected
        FROM public.question_assignments qa
        LEFT JOIN public.responses r
          ON  r.question_id      = qa.question_id
          AND r.report_period_id = qa.report_period_id
          AND r.org_id           = v_org_id
        WHERE qa.org_id           = v_org_id
          AND qa.report_period_id = p_period_id
      ) t
    ),

    -- Breakdown by framework
    'by_framework', (
      SELECT COALESCE(jsonb_agg(row_to_json(fw) ORDER BY fw.code), '[]')
      FROM (
        SELECT
          f.code,
          f.name,
          COUNT(qa.id)::int                                              AS total,
          COUNT(r.id) FILTER (WHERE r.status = 'approved')::int         AS approved,
          COUNT(r.id) FILTER (WHERE r.status = 'submitted')::int        AS submitted,
          COUNT(r.id) FILTER (WHERE r.status = 'draft')::int            AS draft
        FROM public.question_assignments qa
        JOIN public.questions   q  ON q.id  = qa.question_id
        JOIN public.indicators  i  ON i.id  = q.indicator_id
        JOIN public.principles  pr ON pr.id = i.principle_id
        JOIN public.frameworks  f  ON f.id  = pr.framework_id
        LEFT JOIN public.responses r
          ON  r.question_id      = qa.question_id
          AND r.report_period_id = qa.report_period_id
          AND r.org_id           = v_org_id
        WHERE qa.org_id           = v_org_id
          AND qa.report_period_id = p_period_id
        GROUP BY f.id, f.code, f.name
      ) fw
    ),

    -- Breakdown by department
    'by_dept', (
      SELECT COALESCE(jsonb_agg(row_to_json(dpt) ORDER BY dpt.name), '[]')
      FROM (
        SELECT
          d.code,
          d.name,
          COUNT(qa.id)::int                                              AS total,
          COUNT(r.id) FILTER (WHERE r.status = 'approved')::int         AS approved
        FROM public.question_assignments qa
        JOIN public.org_departments d ON d.id = qa.department_id
        LEFT JOIN public.responses r
          ON  r.question_id      = qa.question_id
          AND r.report_period_id = qa.report_period_id
          AND r.org_id           = v_org_id
        WHERE qa.org_id           = v_org_id
          AND qa.report_period_id = p_period_id
        GROUP BY d.id, d.code, d.name
      ) dpt
    ),

    -- 10 most recent response changes (for activity feed)
    'recent_activity', (
      SELECT COALESCE(jsonb_agg(row_to_json(act)), '[]')
      FROM (
        SELECT
          r.id,
          r.status,
          r.submitted_at,
          r.updated_at,
          q.code   AS question_code,
          left(q.text, 80) AS question_text,
          p2.full_name AS user_name
        FROM public.responses r
        JOIN public.questions q ON q.id = r.question_id
        LEFT JOIN public.profiles p2 ON p2.id = r.user_id
        WHERE r.org_id           = v_org_id
          AND r.report_period_id = p_period_id
        ORDER BY r.updated_at DESC
        LIMIT 10
      ) act
    )

  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_dashboard_stats TO authenticated;
