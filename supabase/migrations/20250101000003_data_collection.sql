-- Migration 003: Data collection tables (question assignments + responses)

CREATE TABLE IF NOT EXISTS public.question_assignments (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id      uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  department_id    uuid NOT NULL REFERENCES public.org_departments(id) ON DELETE CASCADE,
  assigned_to      uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  report_period_id uuid NOT NULL REFERENCES public.report_periods(id) ON DELETE CASCADE,
  due_date         date,
  status           text NOT NULL DEFAULT 'pending'
    CHECK(status IN ('pending', 'in_progress', 'submitted', 'approved', 'rejected')),
  org_id           uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE(question_id, department_id, report_period_id)
);
ALTER TABLE public.question_assignments ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.responses (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id      uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  report_period_id uuid NOT NULL REFERENCES public.report_periods(id) ON DELETE CASCADE,
  org_id           uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id          uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  value            text,
  numeric_value    decimal(20, 6),
  file_url         text,
  notes            text,
  status           text NOT NULL DEFAULT 'draft'
    CHECK(status IN ('draft', 'submitted', 'approved', 'rejected')),
  version          integer NOT NULL DEFAULT 1,
  rejection_reason text,
  submitted_at     timestamptz,
  approved_at      timestamptz,
  approved_by      uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.responses ENABLE ROW LEVEL SECURITY;

-- Indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_responses_org_period ON public.responses(org_id, report_period_id);
CREATE INDEX IF NOT EXISTS idx_responses_status     ON public.responses(status);
CREATE INDEX IF NOT EXISTS idx_responses_question   ON public.responses(question_id, report_period_id, org_id);
CREATE INDEX IF NOT EXISTS idx_assignments_org      ON public.question_assignments(org_id, report_period_id);
CREATE INDEX IF NOT EXISTS idx_assignments_dept     ON public.question_assignments(department_id, report_period_id);

-- Auto-update updated_at on responses
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER responses_set_updated_at
  BEFORE UPDATE ON public.responses
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
