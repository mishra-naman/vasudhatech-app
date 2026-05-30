-- Migration 011: Phase 3 — audit trigger, evidence storage bucket, auto-assign RPC

-- ============================================================
-- 1. Supabase Storage: evidence bucket
-- ============================================================
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'evidence',
  'evidence',
  false,
  52428800, -- 50 MB
  ARRAY['application/pdf','image/jpeg','image/png','image/webp',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/csv']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: users can upload/download within their org's folder
CREATE POLICY "evidence_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id = 'evidence' AND (storage.foldername(name))[1] = public.requesting_org_id()::text);

CREATE POLICY "evidence_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'evidence' AND (storage.foldername(name))[1] = public.requesting_org_id()::text);

CREATE POLICY "evidence_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'evidence' AND (storage.foldername(name))[1] = public.requesting_org_id()::text);

-- ============================================================
-- 2. RPC: auto-assign questions to departments for a period
-- ============================================================
CREATE OR REPLACE FUNCTION public.auto_assign_questions(p_period_id uuid)
RETURNS integer LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_org_id    uuid;
  v_assigned  integer := 0;
  v_role      text;
BEGIN
  SELECT org_id INTO v_org_id FROM public.report_periods WHERE id = p_period_id;
  IF v_org_id IS NULL THEN
    RAISE EXCEPTION 'Report period not found';
  END IF;

  v_role := public.requesting_user_role();
  IF v_role NOT IN ('cs_admin', 'super_admin') THEN
    RAISE EXCEPTION 'Only admins can auto-assign questions';
  END IF;

  -- Create assignments: one per (question, dept) pair in enabled frameworks
  INSERT INTO public.question_assignments
         (question_id, department_id, report_period_id, org_id, status)
  SELECT  q.id,
          d.id,
          p_period_id,
          v_org_id,
          'pending'
  FROM    public.questions q
  JOIN    public.indicators  i  ON i.id  = q.indicator_id
  JOIN    public.principles  p  ON p.id  = i.principle_id
  JOIN    public.frameworks  f  ON f.id  = p.framework_id
  JOIN    public.org_frameworks of
            ON of.framework_id = f.id
           AND of.org_id       = v_org_id
           AND of.is_active    = true
  JOIN    public.org_departments d
            ON d.org_id  = v_org_id
           AND d.code    = q.default_dept
           AND d.is_active = true
  ON CONFLICT (question_id, department_id, report_period_id) DO NOTHING;

  GET DIAGNOSTICS v_assigned = ROW_COUNT;

  -- Advance period status to data_collection
  UPDATE public.report_periods
  SET    status = 'data_collection'
  WHERE  id = p_period_id;

  RETURN v_assigned;
END;
$$;

GRANT EXECUTE ON FUNCTION public.auto_assign_questions TO authenticated;

-- ============================================================
-- 3. Audit trigger on responses
-- ============================================================
CREATE OR REPLACE FUNCTION public.log_response_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO public.audit_logs
         (org_id, user_id, entity_type, entity_id, action, changes)
  VALUES (
    NEW.org_id,
    NEW.user_id,
    'response',
    NEW.id,
    CASE
      WHEN TG_OP = 'INSERT'                          THEN 'create'
      WHEN NEW.status = 'submitted'
       AND OLD.status = 'draft'                       THEN 'submit'
      WHEN NEW.status = 'approved'                   THEN 'approve'
      WHEN NEW.status = 'rejected'                   THEN 'reject'
      ELSE 'update'
    END,
    jsonb_build_object(
      'old_status', CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE OLD.status END,
      'new_status', NEW.status,
      'old_value',  CASE WHEN TG_OP = 'INSERT' THEN NULL ELSE OLD.value END,
      'new_value',  NEW.value
    )
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER response_audit_trigger
  AFTER INSERT OR UPDATE ON public.responses
  FOR EACH ROW EXECUTE FUNCTION public.log_response_change();

-- ============================================================
-- 4. Notifications on response status changes
-- ============================================================
CREATE OR REPLACE FUNCTION public.notify_on_response_change()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
  v_submitter_id   uuid;
  v_question_text  text;
BEGIN
  SELECT user_id INTO v_submitter_id FROM public.responses WHERE id = NEW.id;
  SELECT text    INTO v_question_text FROM public.questions  WHERE id = NEW.question_id LIMIT 1;

  IF TG_OP = 'UPDATE' AND NEW.status = 'approved' AND OLD.status = 'submitted' THEN
    INSERT INTO public.notifications (user_id, org_id, type, title, message, link)
    VALUES (
      v_submitter_id,
      NEW.org_id,
      'approved',
      'Response approved',
      'Your response to "' || left(v_question_text, 60) || '…" was approved.',
      '/collection/' || NEW.question_id::text
    );
  ELSIF TG_OP = 'UPDATE' AND NEW.status = 'rejected' AND OLD.status = 'submitted' THEN
    INSERT INTO public.notifications (user_id, org_id, type, title, message, link)
    VALUES (
      v_submitter_id,
      NEW.org_id,
      'rejected',
      'Response needs revision',
      'Your response to "' || left(v_question_text, 60) || '…" was returned for revision.',
      '/collection/' || NEW.question_id::text
    );
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER response_notify_trigger
  AFTER UPDATE ON public.responses
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_response_change();
