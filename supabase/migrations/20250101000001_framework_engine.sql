-- Migration 001: Framework engine tables (global, no RLS, shared read-only reference data)

CREATE TABLE IF NOT EXISTS public.frameworks (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code        text NOT NULL UNIQUE,
  name        text NOT NULL,
  version     text NOT NULL,
  country     text,
  regulator   text,
  description text,
  is_active   boolean NOT NULL DEFAULT true,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.principles (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  framework_id uuid NOT NULL REFERENCES public.frameworks(id) ON DELETE CASCADE,
  code         text NOT NULL,
  name         text NOT NULL,
  section      text,
  sort_order   integer NOT NULL DEFAULT 0,
  description  text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE(framework_id, code)
);

CREATE TABLE IF NOT EXISTS public.indicators (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  principle_id uuid NOT NULL REFERENCES public.principles(id) ON DELETE CASCADE,
  code         text NOT NULL,
  name         text NOT NULL,
  category     text NOT NULL DEFAULT 'essential'
    CHECK(category IN ('essential', 'leadership', 'core', 'comprehensive')),
  data_type    text,
  unit         text,
  sort_order   integer NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE(principle_id, code)
);

CREATE TABLE IF NOT EXISTS public.questions (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  indicator_id     uuid NOT NULL REFERENCES public.indicators(id) ON DELETE CASCADE,
  code             text NOT NULL,
  text             text NOT NULL,
  help_text        text,
  response_type    text NOT NULL DEFAULT 'text',
  options          jsonb,
  validation_rules jsonb,
  is_required      boolean NOT NULL DEFAULT true,
  is_assurable     boolean NOT NULL DEFAULT false,
  default_dept     text,
  sort_order       integer NOT NULL DEFAULT 0,
  created_at       timestamptz NOT NULL DEFAULT now(),
  UNIQUE(indicator_id, code)
);

CREATE TABLE IF NOT EXISTS public.datapoint_mappings (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  datapoint_key       text NOT NULL,
  question_id         uuid NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  framework_code      text NOT NULL,
  conversion_factor   NUMERIC(20, 10) NOT NULL DEFAULT 1,
  conversion_from_unit text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  UNIQUE(datapoint_key, question_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_principles_framework_id ON public.principles(framework_id);
CREATE INDEX IF NOT EXISTS idx_indicators_principle_id ON public.indicators(principle_id);
CREATE INDEX IF NOT EXISTS idx_questions_indicator_id  ON public.questions(indicator_id);
CREATE INDEX IF NOT EXISTS idx_datapoint_mappings_key  ON public.datapoint_mappings(datapoint_key);

-- Grant read access — these are global reference tables, no RLS
GRANT SELECT ON public.frameworks         TO authenticated, anon;
GRANT SELECT ON public.principles         TO authenticated, anon;
GRANT SELECT ON public.indicators         TO authenticated, anon;
GRANT SELECT ON public.questions          TO authenticated, anon;
GRANT SELECT ON public.datapoint_mappings TO authenticated, anon;
