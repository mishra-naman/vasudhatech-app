# VasudhaTech — Full Implementation Prompt for Claude Code

> **How to use**: Paste the SETUP section once at the very start. Then paste one PHASE at a time into Claude Code. After each phase, run the CHECKPOINT block. Update CLAUDE.md progress tracker before starting the next phase.

---

## SETUP (paste this once at the very beginning)

```
Read CLAUDE.md carefully — it is the single source of truth for this project.

RULES FOR EVERY SESSION:
1. Before using any library API (Supabase JS, React Query, React Hook Form, shadcn/ui, React Router, pdfmake, SheetJS, Zod, Recharts), FIRST use Context7 MCP to fetch the latest docs. Do not rely on memory — APIs change between versions.
2. After creating or modifying any Supabase migration, ALWAYS run:
   npx supabase db reset && npx supabase gen types typescript --local > src/lib/types/database.ts
3. Install shadcn components on demand: npx shadcn@latest add <component-name>
4. All Supabase data access goes through TanStack Query hooks in src/lib/hooks/ — never call supabase.from() directly in page or component files.
5. TypeScript strict mode — zero `any` types. If you need a type, define it or import from database.ts.
6. Use Tailwind classes exclusively — no inline styles, no CSS modules, no styled-components.
7. Every component gets its own file. Named exports only (no default exports).
8. When a phase is done, I will ask you to run the checkpoint procedure.

Confirm you've read CLAUDE.md and understand the architecture, then wait for me to tell you which phase to start.
```

---

## PHASE 1: Foundation + Database + Auth Shell

> **Goal**: Working app skeleton with all DB tables, auth flow, and basic navigation. No business logic yet.
> **Estimated effort**: 1-2 Claude Code sessions

```
## Phase 1: Foundation

Do these steps IN ORDER. Do not skip ahead. After each step, verify it works before moving to the next.

### STEP 1.1 — Scaffold project

Run these commands:
npm create vite@latest vasudhatech-app -- --template react-ts
cd vasudhatech-app

Install all dependencies in ONE command:
npm install @supabase/supabase-js @tanstack/react-query react-router-dom react-hook-form @hookform/resolvers zod lucide-react recharts pdfmake xlsx file-saver date-fns sonner class-variance-authority clsx tailwind-merge

npm install -D @types/file-saver @types/pdfmake supabase

Initialize Tailwind CSS:
- Use Context7 to check the latest Tailwind CSS 4 + Vite setup (it changed from v3)
- Configure tailwind properly for the project

Initialize shadcn/ui:
npx shadcn@latest init
- Style: New York
- Base color: Zinc
- CSS variables: Yes

Add essential shadcn components (run as one batch):
npx shadcn@latest add button input label select switch tabs card dialog sheet table badge separator avatar dropdown-menu accordion checkbox radio-group textarea toast progress skeleton alert scroll-area popover command tooltip

### STEP 1.2 — Supabase local setup

npx supabase init
npx supabase start

After supabase start, note the output values. Create .env.local:
VITE_SUPABASE_URL=http://127.0.0.1:54321
VITE_SUPABASE_ANON_KEY=<anon key from output>

Create src/lib/supabase.ts:
- Import createClient from @supabase/supabase-js
- Use Context7 to verify the correct createClient signature for supabase-js v2
- Export the typed supabase client

Create src/lib/types/enums.ts with these TypeScript enums:
- UserRole: super_admin, cs_admin, dept_poc, auditor, viewer
- ResponseStatus: draft, submitted, approved, rejected, needs_revision
- ResponseType: text, number, percentage, yes_no, select, multi_select, table, file_upload, date, rich_text
- ReportPeriodStatus: open, data_collection, review, assurance, filed, closed
- IndicatorCategory: essential, leadership, core, comprehensive
- AssignmentStatus: pending, in_progress, submitted, approved, rejected

### STEP 1.3 — Database migrations

Create these migrations using `npx supabase migration new <name>` for each one. Write the full SQL.

MIGRATION 001_framework_engine:
Create tables: frameworks, principles, indicators, questions, datapoint_mappings
- Use exact column definitions from the "Database schema summary" in CLAUDE.md
- Add all UNIQUE constraints and foreign keys with ON DELETE CASCADE
- CREATE INDEX on principle(framework_id), indicator(principle_id), question(indicator_id)
- GRANT SELECT ON all these tables TO authenticated, anon
- Do NOT enable RLS on these tables

MIGRATION 002_tenant_tables:
Create tables: organizations, profiles, org_departments, org_frameworks, report_periods
- profiles.id references auth.users(id) ON DELETE CASCADE
- profiles has: org_id (nullable initially for new signups), email, full_name, role (default 'viewer'), department_id (nullable), avatar_url, is_active
- org_departments UNIQUE(org_id, code)
- org_frameworks UNIQUE(org_id, framework_id)
- report_periods UNIQUE(org_id, code)
- ALTER TABLE profiles ADD CONSTRAINT fk_dept FOREIGN KEY (department_id) REFERENCES org_departments(id)
- ENABLE ROW LEVEL SECURITY on all 5 tables

MIGRATION 003_data_collection:
Create tables: question_assignments, responses
- question_assignments: question_id, department_id, assigned_to (nullable), report_period_id, due_date, status (default 'pending'), org_id
  UNIQUE(question_id, department_id, report_period_id)
- responses: question_id, report_period_id, org_id, user_id, value (TEXT), numeric_value (DECIMAL), file_url, notes, status (default 'draft'), version (default 1), rejection_reason, submitted_at, approved_at, approved_by
  CREATE INDEX idx_responses_org_period ON responses(org_id, report_period_id)
  CREATE INDEX idx_responses_status ON responses(status)
  CREATE INDEX idx_responses_question ON responses(question_id, report_period_id, org_id)
- ENABLE ROW LEVEL SECURITY on both

MIGRATION 004_audit_notifications:
Create tables: audit_logs, notifications
- audit_logs: org_id, user_id, entity_type, entity_id, action, changes (JSONB), created_at
  CREATE INDEX idx_audit_org ON audit_logs(org_id, created_at DESC)
- notifications: user_id, org_id, type, title, message, is_read (default false), link, created_at
  CREATE INDEX idx_notif_user ON notifications(user_id, is_read)
- ENABLE ROW LEVEL SECURITY on both

MIGRATION 005_auth_hook:
Create the Custom Access Token Hook function:
```sql
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb LANGUAGE plpgsql STABLE AS $$
DECLARE
  claims jsonb;
  user_org_id uuid;
  user_role text;
  user_dept_id uuid;
BEGIN
  claims := event->'claims';
  SELECT p.org_id, p.role, p.department_id
  INTO user_org_id, user_role, user_dept_id
  FROM public.profiles p WHERE p.id = (event->>'user_id')::uuid;
  IF user_org_id IS NOT NULL THEN
    claims := jsonb_set(claims, '{org_id}', to_jsonb(user_org_id::text));
    claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role));
    IF user_dept_id IS NOT NULL THEN
      claims := jsonb_set(claims, '{dept_id}', to_jsonb(user_dept_id::text));
    END IF;
  END IF;
  RETURN jsonb_build_object('claims', claims);
END; $$;
GRANT EXECUTE ON FUNCTION public.custom_access_token_hook TO supabase_auth_admin;
REVOKE EXECUTE ON FUNCTION public.custom_access_token_hook FROM authenticated, anon, public;
GRANT SELECT ON public.profiles TO supabase_auth_admin;
```

MIGRATION 006_signup_trigger:
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, org_id, email, full_name, role, department_id)
  VALUES (
    NEW.id,
    (NEW.raw_user_meta_data->>'org_id')::uuid,
    COALESCE(NEW.email, ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email, 'User'),
    COALESCE(NEW.raw_user_meta_data->>'role', 'cs_admin'),
    (NEW.raw_user_meta_data->>'department_id')::uuid
  );
  RETURN NEW;
END; $$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

MIGRATION 007_rls_policies:
Create helper functions:
```sql
CREATE OR REPLACE FUNCTION public.requesting_org_id() RETURNS uuid LANGUAGE sql STABLE AS $$
  SELECT COALESCE((current_setting('request.jwt.claims', true)::jsonb->>'org_id')::uuid, '00000000-0000-0000-0000-000000000000'::uuid)
$$;
CREATE OR REPLACE FUNCTION public.requesting_user_role() RETURNS text LANGUAGE sql STABLE AS $$
  SELECT COALESCE(current_setting('request.jwt.claims', true)::jsonb->>'user_role', 'viewer')
$$;
```
Then create SELECT/INSERT/UPDATE policies for EVERY tenant table:
- organizations: users see orgs they belong to
- profiles: users see own org's profiles
- org_departments: users see own org's depts
- org_frameworks: users see own org's frameworks; admins can insert/update
- report_periods: users see own org's periods; admins can insert/update
- question_assignments: users see own org's assignments; admins can insert/update
- responses: users see own org; POCs insert/update own drafts; admins update any
- audit_logs: admins and auditors see own org's logs
- notifications: users see own notifications only (user_id = auth.uid())

MIGRATION 008_seed_frameworks:
This is the LARGEST migration. Seed ALL 6 frameworks with their complete question banks.

BRSR (most important — seed ALL of it):
- Framework: code='BRSR', name='Business Responsibility and Sustainability Reporting', version='2.0', country='IN', regulator='SEBI'
- Section A (General Disclosures): principles SEC-A with sub-indicators for company info, products, operations, employees, CSR details. ~30 questions.
- Section B (Management): principle SEC-B with policy and governance indicators. ~12 questions.
- Section C Principles P1 through P9:
  - P1 Ethics: training %, fines, anti-corruption, conflict of interest. Essential + Leadership indicators.
  - P2 Products: R&D %, sustainable sourcing, recycling, EPR.
  - P3 Employees: benefits coverage, grievances, unions, H&S training, LTIFR, fatalities.
  - P4 Stakeholders: identification, engagement, vulnerable groups.
  - P5 Human Rights: training, minimum wages, POSH complaints, discrimination, child labor.
  - P6 Environment: energy (MWh/TJ), GHG Scope 1/2/3 (tCO2e), water (KL), waste (MT) by category, biodiversity, EIA. THIS IS THE LARGEST PRINCIPLE.
  - P7 Policy Advocacy: trade associations, anti-competitive conduct.
  - P8 Inclusive Growth: CSR spend, SIA, local/MSME sourcing %.
  - P9 Consumer: complaints by type, data privacy, product recalls.
- For EVERY question set: code, text, response_type, default_dept, is_required, is_assurable (true for BRSR Core KPIs), sort_order

GRI: Seed the most-used topic standards
- GRI 2 (General Disclosures): 2-1 through 2-30 (key ones)
- GRI 201 (Economic Performance), 205 (Anti-corruption)
- GRI 302 (Energy), 303 (Water), 305 (Emissions), 306 (Waste)
- GRI 401 (Employment), 403 (OHS), 405 (Diversity)
- ~50-60 questions total

TCFD: All 4 pillars
- Governance (board oversight, management role)
- Strategy (risks/opportunities, impact, scenario analysis)
- Risk Management (identification, management, integration)
- Metrics & Targets (Scope 1/2/3, targets, internal carbon price)
- ~25 questions

CSR (India):
- Committee composition, financial details (2% calculation), project details, impact assessment, SDG mapping
- ~20 questions

SASB (cross-industry):
- GHG emissions, energy management, waste, data privacy, product quality, labor practices, H&S, diversity, business ethics
- ~25 questions

CDP:
- Governance (C1), Risks & Opportunities (C2), Emissions (C6-C7), Energy (C8), Water (W1), Targets (C4)
- ~35 questions

After writing the seed migration, RUN: npx supabase db reset
Then RUN: npx supabase gen types typescript --local > src/lib/types/database.ts
Verify: tables exist, seed data is populated, types are generated.

### STEP 1.4 — App shell + Auth UI

Create the app foundation:

src/lib/hooks/useAuth.ts:
- AuthContext with: user, session, profile, orgId, userRole, isLoading, isAuthenticated
- login(email, password), signup(email, password, fullName), logout()
- On session change: fetch profile from profiles table
- AuthProvider wraps the entire app

src/lib/hooks/useOrg.ts:
- Read org_id, user_role, dept_id from session JWT claims
- Provide current org details query

src/App.tsx:
- QueryClientProvider (TanStack Query)
- AuthProvider
- RouterProvider with routes:
  /login → Login page
  /signup → Signup page
  /onboarding/* → Onboarding wizard (protected, shown when profile.org_id is null)
  / → AppShell layout with nested routes:
    /dashboard → Dashboard
    /frameworks → Framework list
    /frameworks/:id → Principles
    /frameworks/:id/:principleId → Questions
    /collection/tasks → My Tasks
    /collection/:questionId → Response form
    /review → Approval queue
    /reports → Reports
    /settings/org → Org settings
    /settings/users → User management
    /settings/departments → Departments
    /settings/periods → Report periods
  All routes under / are protected (redirect to /login if not authenticated)
  If authenticated but profile.org_id is null → redirect to /onboarding

src/components/layout/AppShell.tsx:
- Sidebar (collapsible) + TopBar + <Outlet />
- Sidebar shows nav links filtered by user role

src/components/layout/Sidebar.tsx:
- Role-based menu:
  All roles: Dashboard
  cs_admin/super_admin: Frameworks, Review, Reports, Settings (org, users, depts, periods)
  dept_poc: My Tasks
  auditor: Frameworks (read-only), Reports
  viewer: Dashboard only
- Use lucide-react icons for each menu item
- Active route highlighted

src/pages/auth/Login.tsx:
- shadcn Card with email + password inputs (React Hook Form + Zod)
- Login button → supabase.auth.signInWithPassword
- Link to signup
- Error toast on failure (sonner)

src/pages/auth/Signup.tsx:
- Email + password + full name
- Signup → supabase.auth.signUp with user_metadata: { full_name }
- Redirect to /onboarding after signup

VERIFY EVERYTHING WORKS:
1. npx supabase db reset — migrations apply cleanly
2. npm run dev — app loads without errors
3. Signup creates a user + profile row (check in Supabase dashboard)
4. Login works and redirects to /onboarding (since org_id is null)
5. Sidebar renders correctly
6. Protected routes redirect to /login when not authenticated

This completes Phase 1.
```

---

## CHECKPOINT PROCEDURE (run after each phase)

```
CHECKPOINT — Do these steps now:

1. Run TypeScript check: npx tsc --noEmit
   Fix any errors before proceeding.

2. Run dev server: npm run dev
   Verify no runtime crashes. Navigate through all created pages.

3. Run migrations: npx supabase db reset
   Verify all migrations apply without errors.

4. Git commit:
   git add -A
   git commit -m "checkpoint: phase [N] complete — [brief summary]"

5. Update CLAUDE.md:
   - In the "Implementation progress tracker" section, change the current phase's status from "NOT STARTED" to "COMPLETE"
   - Check off all completed items with [x]
   - Update "Current status" to the next phase
   - Note any issues or decisions in "Known decisions & tradeoffs"

6. Report what was completed and what comes next.
```

---

## PHASE 2: Onboarding + Framework Browser

> **Goal**: New user can create an org, select frameworks, set up departments. Framework browser shows all questions.
> **Estimated effort**: 1-2 sessions

```
## Phase 2: Onboarding + Framework Browser

Read CLAUDE.md — check the progress tracker to confirm Phase 1 is complete.
Use Context7 to verify Supabase JS, React Query, and React Hook Form APIs before writing code.

### STEP 2.1 — Onboarding wizard

Create src/pages/onboarding/OrgSetup.tsx as a multi-step wizard:

Step 1 — Company info:
- Company name (required), industry (select from: Manufacturing, IT Services, Pharma, FMCG, Energy, Financial Services, Mining, Construction, Telecom, Other), sector (Private/PSU/MNC), listed_on (NSE/BSE/Both/Unlisted), market_cap (Top 150/Top 500/Top 1000/Below 1000/NA)
- Use React Hook Form + Zod for validation

Step 2 — Select frameworks:
- Grid of 6 framework cards (BRSR, GRI, TCFD, CSR, SASB, CDP)
- Each card shows: framework name, description snippet, country badge (IN for BRSR/CSR, Global for others), regulator name
- Toggle on/off with checkbox. BRSR is pre-selected and recommended.
- Show count of questions per framework

Step 3 — Set up departments:
- Pre-filled with defaults: HR, Operations, Finance, Procurement, IT & Security
- User can add/remove departments
- Each department: code (auto-generated) + name (editable) + head email (optional)

Step 4 — Review & confirm:
- Summary of: org name, selected frameworks, departments
- "Launch" button

On submission:
1. Create organization row (use supabase service client or handle via a Supabase function)
2. Update the user's profile with org_id
3. Create org_departments rows
4. Create org_frameworks rows for selected frameworks
5. Create a default report period (current FY based on fiscal_start)
6. Force session refresh: await supabase.auth.refreshSession()
7. Redirect to /dashboard

### STEP 2.2 — Framework hooks

Create src/lib/hooks/useFrameworks.ts with TanStack Query:

useFrameworks():
- Query: frameworks joined with org_frameworks where org_id = current org
- Returns: enabled frameworks with metadata
- Cache key: ['frameworks', orgId]

usePrinciples(frameworkId):
- Query: principles where framework_id, ordered by sort_order
- Include: count of indicators, count of questions, count of approved responses (for progress)
- Cache key: ['principles', frameworkId, periodId]

useIndicators(principleId):
- Query: indicators where principle_id, ordered by sort_order
- Include: questions with response status for current period
- Cache key: ['indicators', principleId, periodId]

useQuestions(indicatorId):
- Query: questions where indicator_id, ordered by sort_order
- Include: current response (if exists) for active period
- Cache key: ['questions', indicatorId, periodId]

### STEP 2.3 — Framework browser pages

src/pages/frameworks/index.tsx:
- Grid of enabled framework cards
- Each card: framework name, version, question count, completion % (donut), status badge
- Click → navigate to /frameworks/:frameworkId

src/pages/frameworks/[frameworkId]/index.tsx:
- Framework header: name, description, regulator badge
- List of principles (use shadcn Accordion or cards):
  Each principle shows: code, name, section badge (A/B/C for BRSR), indicator count, progress bar
- Click principle → navigate to /frameworks/:frameworkId/:principleId

src/pages/frameworks/[frameworkId]/[principleId].tsx:
- Principle header with description
- Indicators as expandable accordion items:
  Each indicator: code, name, category badge (essential/leadership), data_type badge
  When expanded: shows all questions with their response status
  Each question row: code, text (truncated), response_type icon, status badge (not started/draft/submitted/approved), default_dept badge
  Click question → navigate to /collection/:questionId (for POCs) or show read-only response (for others)

### STEP 2.4 — QuestionRenderer component

Create src/components/framework/QuestionRenderer.tsx:
- Props: question object, value, onChange, disabled
- Switch on question.response_type to render the correct shadcn component
- Include: label (question.text), help text tooltip (question.help_text), required asterisk, assurance badge (if is_assurable), unit badge (from indicator.unit)
- For 'select': parse question.options (JSONB) into Select options
- For 'multi_select': render Checkbox group from question.options
- For 'table': render a basic TableResponseEditor (headers + dynamic rows) — can be simple for now
- For 'file_upload': render FileUploader component (implement Supabase Storage upload)
- Zod validation based on question.validation_rules and response_type

### STEP 2.5 — User invitation

src/pages/settings/users.tsx:
- Table of current users: name, email, role, department, status
- "Invite user" dialog: email, full name, role (select), department (select), send invite button
- Uses supabase.auth.admin.inviteUserByEmail (needs service role — implement via Edge Function or use Supabase dashboard for prototype)

src/pages/auth/InviteAccept.tsx:
- Handle the invite magic link
- User sets password
- Profile already exists (created by trigger) — redirect to /dashboard

VERIFY:
1. Full onboarding flow works: signup → wizard → org created → frameworks enabled → depts created → dashboard
2. Framework browser shows all seeded data correctly
3. Question renderer handles all 10 response types
4. Navigation between frameworks/principles/questions works
5. Role-based sidebar shows correct items

Run CHECKPOINT procedure.
```

---

## PHASE 3: Data Collection + Approval

> **Goal**: POCs can enter data against assigned questions. CS admins can review and approve/reject.
> **Estimated effort**: 2 sessions

```
## Phase 3: Data Collection + Approval

Read CLAUDE.md — confirm Phase 2 is COMPLETE in progress tracker.
Use Context7 for Supabase RLS and React Query mutation APIs.

### STEP 3.1 — Report periods + question assignment

src/lib/hooks/useReportPeriods.ts:
- useReportPeriods(): list all periods for current org
- useActivePeriod(): get the current active period
- useCreatePeriod(): create new period
- useUpdatePeriodStatus(): advance status (open → data_collection → review → filed)

src/pages/settings/report-periods.tsx:
- List of report periods with status badges
- Create new period: name, start date, end date
- "Start data collection" button → changes status + auto-assigns questions

src/lib/hooks/useAssignments.ts:
- useAutoAssign(periodId): for each question in enabled frameworks, create a question_assignment linked to the department matching question.default_dept. If dept doesn't exist in the org, skip.
- useMyAssignments(periodId): list assignments for current user's department, joined with question + indicator + principle data
- useAllAssignments(periodId): admin view — all assignments with department and assignee info
- useUpdateAssignment(id): update status, assignee, due date

### STEP 3.2 — POC data entry

src/lib/hooks/useResponses.ts:
- useResponse(questionId, periodId): get the latest response for this question/period/org
- usePreviousResponse(questionId, prevPeriodId): for carry-forward reference
- useSaveDraft(): upsert a response with status='draft'. Use optimistic updates.
- useSubmitResponse(id): update status to 'submitted', set submitted_at
- useBulkSubmit(ids): submit multiple drafts at once

src/pages/collection/my-tasks.tsx:
- Header: "My tasks — [Department Name]" with period selector dropdown
- Stats bar: X assigned, Y drafts, Z submitted, W approved
- Filter tabs: All | Pending | In Progress | Submitted | Approved | Rejected
- Table/list of assignments grouped by principle:
  Columns: indicator code, question text (truncated), response type icon, status badge, due date
- Click row → navigate to /collection/:questionId
- Bulk select + "Submit selected" button

src/pages/collection/[questionId].tsx:
- Full question detail:
  - Breadcrumb: Framework > Principle > Indicator > Question
  - Question text (full), help text, category badge, assurable badge
  - QuestionRenderer for the input field
  - Previous year value (if exists) shown as reference in a muted box
  - Evidence upload section (FileUploader)
  - Notes textarea
  - Action buttons: Save Draft | Submit for Review
  - If status='rejected': show rejection reason in a red alert, allow re-edit and re-submit

src/components/collection/FileUploader.tsx:
- Drag-and-drop or click to upload
- Upload to Supabase Storage bucket 'evidence' at path: {org_id}/{period_code}/{question_code}/{filename}
- Show upload progress
- After upload: save the public URL to response.file_url
- Display uploaded file with download link

### STEP 3.3 — CS admin approval

src/lib/hooks/useReview.ts:
- usePendingReviews(periodId): list responses with status='submitted' for current org, joined with question + user + department
- useApprove(responseId): update status='approved', set approved_at, approved_by
- useReject(responseId, reason): update status='rejected', set rejection_reason
- useBulkApprove(ids): approve multiple at once

src/pages/review/index.tsx:
- Header: "Review queue" with period selector
- Stats bar: X pending review, Y approved, Z rejected
- Table of submitted responses:
  Columns: department, indicator, question (truncated), submitted by, submitted at, value (preview), actions
- Click row → slide-over panel (shadcn Sheet) with:
  - Full question text + help text
  - Submitted value displayed with QuestionRenderer (read-only mode)
  - Previous year comparison (side by side)
  - Evidence file download link
  - POC notes
  - Approve button (green) | Reject button (red) with reason textarea
- Bulk approve checkbox + button

### STEP 3.4 — Audit logging

Create a PostgreSQL trigger function that auto-logs to audit_logs whenever responses table is updated:
```sql
CREATE OR REPLACE FUNCTION log_response_change() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO audit_logs (org_id, user_id, entity_type, entity_id, action, changes)
  VALUES (
    NEW.org_id,
    NEW.user_id,
    'response',
    NEW.id,
    CASE
      WHEN TG_OP = 'INSERT' THEN 'create'
      WHEN NEW.status = 'submitted' AND OLD.status = 'draft' THEN 'submit'
      WHEN NEW.status = 'approved' THEN 'approve'
      WHEN NEW.status = 'rejected' THEN 'reject'
      ELSE 'update'
    END,
    jsonb_build_object('old_status', OLD.status, 'new_status', NEW.status, 'old_value', OLD.value, 'new_value', NEW.value)
  );
  RETURN NEW;
END; $$;
CREATE TRIGGER response_audit_trigger AFTER INSERT OR UPDATE ON responses
FOR EACH ROW EXECUTE FUNCTION log_response_change();
```
Add this as migration 009.

### STEP 3.5 — Departments + settings pages

src/pages/settings/departments.tsx:
- List of departments: code, name, head, user count
- Add/edit department dialog
- Cannot delete departments with active assignments

src/pages/settings/org.tsx:
- Edit org name, industry, sector, logo
- View org details

VERIFY:
1. Auto-assign creates assignments for all questions in enabled frameworks
2. POC sees only their department's assigned questions
3. POC can save draft, upload evidence, submit
4. CS admin sees submitted responses in review queue
5. Approve/reject updates status correctly
6. Rejected response shows reason to POC, allows re-submission
7. Audit logs are created on every response change
8. RLS properly restricts data access by org

Run CHECKPOINT procedure.
```

---

## PHASE 4: Dashboards + Reports

> **Goal**: Executive dashboard with charts. BRSR PDF and Excel exports.
> **Estimated effort**: 1-2 sessions

```
## Phase 4: Dashboards + Reports

Read CLAUDE.md — confirm Phase 3 is COMPLETE.
Use Context7 for Recharts and pdfmake APIs.

### STEP 4.1 — Progress calculations

src/lib/utils/progress.ts:
Export pure functions (not hooks — these are utility functions used by hooks):
- calcProgress(total: number, completed: number): { percentage: number, completed: number, total: number }
- These are called by the dashboard hook after fetching response counts

src/lib/hooks/useDashboard.ts:
- useOrgProgress(periodId): aggregate completion across all enabled frameworks
  Query: count total questions in enabled frameworks, count responses with status='approved'
  Return: { overall_pct, by_framework: [{code, name, total, approved, pct}], by_dept: [{code, name, total, approved, pct}] }
- useRecentActivity(periodId, limit=10): latest responses ordered by updated_at DESC
- useOverdueItems(periodId): assignments past due_date with status != 'approved'

### STEP 4.2 — Executive dashboard

src/pages/dashboard/index.tsx:
- Route based on role:
  cs_admin/super_admin → full executive dashboard
  dept_poc → department dashboard
  auditor/viewer → read-only executive dashboard

src/components/dashboard/StatCard.tsx:
- Props: label, value, subtitle, icon, trend (up/down/neutral)
- Compact card with muted label + large number

Executive dashboard layout:
- Top row: 4 stat cards (Total questions, Responses submitted, Approved, Completion %)
- Second row: Framework progress — one donut chart (Recharts PieChart) per enabled framework, showing approved/pending/not-started
- Third row: Department progress — horizontal bar chart (Recharts BarChart) showing completion % per department
- Fourth row: two columns:
  Left: Recent activity feed (latest 10 submissions/approvals with timestamp)
  Right: Deadline tracker (overdue items in red, upcoming in amber)

Department POC dashboard (simpler):
- Their department's stats only
- Their pending tasks list
- Their submission history

### STEP 4.3 — BRSR PDF report

src/lib/utils/brsr-report.ts:
Use Context7 to verify pdfmake API (createPdf, document definition structure).

generateBRSRReport(org, period, responses, frameworks):
- Fetch all approved responses for BRSR framework for the given period
- Build pdfmake document definition:

  Cover page:
  - "Business Responsibility and Sustainability Report"
  - Company name (large)
  - Period name
  - Date generated

  Section A — General Disclosures:
  - Table format: 2 columns (question text | response value)
  - Sub-grouped by indicator (company info, products, operations, employees, CSR)

  Section B — Management & Process Disclosures:
  - Table format: policy disclosures, governance

  Section C — Principle-wise Performance:
  - One section per principle (P1 through P9)
  - Within each: Essential Indicators table, then Leadership Indicators table
  - Each row: indicator code | question text | response value | unit
  - Assurable KPIs marked with ★
  - Previous year column if data exists

  Styles: title (20px bold), sectionHeader (16px), principleHeader (14px bold), tableHeader (10px bold), cell (10px)
  Headers/footers: company name on top, page N of M on bottom

- Call pdfMake.createPdf(docDefinition).download(filename)

### STEP 4.4 — Excel export

src/lib/utils/xlsx-export.ts:
Use Context7 to verify SheetJS API (utils.json_to_sheet, utils.book_new, etc.)

exportFrameworkExcel(org, period, responses, frameworkCode):
- Create workbook with one sheet per principle
- Each sheet: columns = [Indicator Code, Indicator Name, Question, Response, Unit, Status, Department, Submitted By]
- Auto-width columns
- Frozen header row
- Sheet names = principle codes (P1, P2, ... or GRI-200, GRI-300, etc.)
- Trigger download via file-saver

### STEP 4.5 — Reports page

src/pages/reports/index.tsx:
- Framework selector (dropdown)
- Period selector (dropdown)
- Preview section: formatted HTML preview of the report (optional, can be simple)
- Two buttons: "Download PDF" | "Download Excel"
- PDF only available for BRSR (other frameworks: Excel only for now)
- Generation happens client-side — show loading spinner during generation

VERIFY:
1. Dashboard loads with live data from seeded responses
2. Donut charts and bar charts render correctly
3. BRSR PDF generates with all sections, correct data, proper formatting
4. Excel export has proper sheets, columns, data
5. Download triggers work in browser

Run CHECKPOINT procedure.
```

---

## PHASE 5: Cross-Framework Mapping + Polish

> **Goal**: Auto-populate shared datapoints. Notifications. Real-time. Demo-ready polish.
> **Estimated effort**: 1-2 sessions

```
## Phase 5: Cross-Framework Mapping + Polish

Read CLAUDE.md — confirm Phase 4 is COMPLETE.

### STEP 5.1 — Datapoint mappings seed

Create migration 010_seed_datapoint_mappings.sql:
Insert ~25 key cross-framework mappings:
- scope_1_ghg (tCO2e): BRSR P6E10, GRI 305-1a, TCFD MT-A2, CDP C6.1, SASB GHG-1
- scope_2_ghg (tCO2e): BRSR P6E11, GRI 305-2a, CDP C6.3
- total_scope_1_2 (tCO2e): BRSR P6E12
- ghg_intensity (tCO2e/Cr): BRSR P6E13
- total_energy (GJ canonical): BRSR P6E5 (conv 0.001 from GJ to TJ), GRI 302-1g (direct), CDP C8.2a (conv 0.27778 from GJ to MWh)
- electricity_consumption: BRSR P6E1, GRI 302-1c
- total_water_withdrawal (KL canonical): BRSR P6E19, GRI 303-3a (conv 0.001 KL to ML), CDP W1.2a (conv 0.001)
- total_waste (MT): BRSR P6E22, GRI 306-3a
- work_fatalities_employees: BRSR P3E21, GRI 403-9a
- work_fatalities_workers: BRSR P3E22
- ltifr_employees: BRSR P3E17
- gender_diversity_board: BRSR A24
- anti_corruption_training: BRSR P1E1
- data_breach_count: BRSR P9E1, SASB DP-1
- csr_spend: BRSR P8E6

Lookup each question by framework_code + question_code to get the question_id.

### STEP 5.2 — Cross-mapping engine

src/lib/utils/unit-converter.ts:
- convertUnit(value, fromUnit, toUnit): handles TJ↔GJ↔MWh, KL↔ML, MT↔tonnes
- Conversion table: { 'TJ_to_GJ': 1000, 'GJ_to_TJ': 0.001, 'GJ_to_MWh': 277.778, 'MWh_to_GJ': 0.0036, 'KL_to_ML': 0.001, 'ML_to_KL': 1000 }

src/lib/hooks/useCrossMapping.ts:
- useLinkedQuestions(questionId): query datapoint_mappings to find all questions sharing the same datapoint_key
- useAutoPopulate(): mutation that, when a response is saved:
  1. Check if the question has a datapoint_mapping
  2. If yes, find all other questions with the same datapoint_key
  3. For each linked question: create/update a response with the converted value
  4. Set a metadata flag: auto_populated = true (store in response.notes as "[Auto-populated from BRSR P6E10]")
  5. User can override — if they manually edit an auto-populated response, the flag is removed

Show in the UI: if a response was auto-populated, show a blue badge "Auto-filled from [framework]" with the source question reference.

### STEP 5.3 — Notifications

src/lib/hooks/useNotifications.ts:
- useNotifications(): list notifications for current user, unread first
- useUnreadCount(): count of unread notifications
- useMarkRead(id): mark a notification as read
- useMarkAllRead(): mark all as read

Create a PostgreSQL function or trigger that creates notifications on:
- New assignment created → notify the assigned user
- Response approved → notify the submitter
- Response rejected → notify the submitter
- Assignment approaching due date (< 3 days) → this would need a cron, skip for prototype

src/components/layout/NotificationBell.tsx:
- Bell icon in TopBar with unread count badge
- Click → dropdown panel with notification list
- Each notification: icon by type, title, message, time ago, link
- "Mark all read" button

### STEP 5.4 — Realtime subscriptions

src/lib/hooks/useRealtime.ts:
- Use Supabase Realtime (use Context7 to verify API)
- Subscribe to responses table: on INSERT/UPDATE where org_id = current org
  → Invalidate TanStack Query cache for ['responses', ...] and ['dashboard', ...]
  → This makes dashboards update live when POCs submit
- Subscribe to notifications table: on INSERT where user_id = current user
  → Show toast notification (sonner)
  → Increment notification count

### STEP 5.5 — Polish

Empty states:
- Dashboard with no data: "No data collection started yet" + "Start by assigning questions" CTA
- Framework browser with no frameworks enabled: "Enable frameworks in Settings" CTA
- My Tasks with no assignments: "No questions assigned to your department yet"
- Review queue empty: "All caught up! No pending reviews."

Loading states:
- Use shadcn Skeleton component for every data-loading state
- Wrap all pages in Suspense boundaries

Error handling:
- Create a generic ErrorBoundary component
- Show friendly error messages with "Try again" button
- Toast notifications for all mutations (success + error)

Mobile responsiveness:
- Sidebar collapses to hamburger menu on screens < 768px
- Tables become card-based lists on mobile
- Forms stack vertically

### STEP 5.6 — Demo seed data

Create migration 011_demo_seed.sql:
- Organization: "Acme Industries Ltd" (Manufacturing, Private, Both exchanges, Top 500)
- 5 departments: HR, Operations, Finance, Procurement, IT
- Report period: FY 2025-26 (status: data_collection)
- 5 users: 1 cs_admin, 3 dept_pocs (HR, Operations, Finance), 1 auditor
- ~80 sample responses across BRSR P1-P9:
  Mix of statuses: 30 approved, 25 submitted, 15 draft, 10 rejected
  Include realistic values: Scope 1 = 4,500 tCO2e, energy = 850 TJ, water = 120,000 KL, waste = 2,400 MT, etc.
- Some cross-mapped datapoints populated (Scope 1 appears in BRSR + GRI + CDP)

VERIFY:
1. Cross-framework auto-population works (enter Scope 1 in BRSR → appears in GRI, CDP)
2. Unit conversion works (enter energy in TJ for BRSR → shows as GJ in GRI)
3. Notifications appear when responses are submitted/approved/rejected
4. Realtime updates fire on dashboard
5. Empty states show correctly for new org
6. Loading skeletons display during data fetch
7. Mobile responsive — sidebar collapses
8. Demo data populates and dashboard shows meaningful charts

Run CHECKPOINT procedure — this is the MVP.
```

---

## FINAL VERIFICATION CHECKLIST

After all 5 phases are complete, verify end-to-end:

```
## Final MVP verification

Run through these user flows manually:

FLOW 1 — New org signup:
1. Sign up with email/password
2. Complete onboarding wizard (org + frameworks + depts)
3. Verify JWT contains org_id after token refresh
4. Dashboard shows empty state

FLOW 2 — Data collection:
1. As cs_admin: create report period, auto-assign questions
2. As dept_poc (login as HR POC): see My Tasks with HR questions
3. Fill 5 questions with realistic data, upload 1 evidence file
4. Submit responses

FLOW 3 — Approval:
1. As cs_admin: see submitted responses in review queue
2. Approve 3, reject 2 with reasons
3. As dept_poc: see rejections, fix and resubmit

FLOW 4 — Cross-framework:
1. Fill Scope 1 GHG in BRSR
2. Check GRI 305-1 — should be auto-populated
3. Check CDP C6.1 — should be auto-populated

FLOW 5 — Reports:
1. Generate BRSR PDF — verify all 3 sections present
2. Generate Excel export — verify sheets and data
3. Dashboard shows correct progress charts

FLOW 6 — Multi-tenant isolation:
1. Create a second org (different browser/incognito)
2. Verify first org's data is invisible to second org
3. Verify RLS blocks cross-org access
```
