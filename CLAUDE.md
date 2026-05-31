# VasudhaTech — ESG Governance Platform

## What this is
Multi-tenant SaaS for Indian companies to manage ESG compliance. 6 frameworks (BRSR, GRI, TCFD, CSR, SASB, CDP). Dept POCs enter data → CS admins review/approve → reports generated client-side.

## Stack
| Layer | Tech |
|-------|------|
| Frontend | Vite 6 + React 19 + TypeScript strict |
| UI | shadcn/ui (New York) + Tailwind CSS 4 |
| Backend | Supabase free tier (PostgreSQL 15 + Auth + Realtime + Storage) |
| State | TanStack React Query v5 |
| Forms | React Hook Form 7 + Zod 3 |
| Routing | React Router v7 (createBrowserRouter) |
| PDF export | pdfmake (client-side, JSON-driven) |
| XLSX export | SheetJS/xlsx (client-side) |
| File download | file-saver |
| Charts | Recharts 2 |
| Deploy | Vercel free tier |

## Architecture rules (do NOT violate)
1. **Multi-tenancy**: RLS with `org_id` in JWT claims via Custom Access Token Hook
2. **Framework tables are GLOBAL** — no org_id, no RLS. `frameworks`, `principles`, `indicators`, `questions`, `datapoint_mappings` are shared read-only reference data
3. **Tenant tables have org_id** on every row + RLS policies using `requesting_org_id()`
4. **Supabase queries ONLY through hooks** — every query lives in `src/lib/hooks/`. NEVER call `supabase.from()` in components
5. **Dynamic forms**: `question.response_type` field → React component mapping in `QuestionRenderer`
6. **Client-side reports**: pdfmake for PDF, SheetJS for XLSX. No Edge Functions for reports
7. **Soft deletes**: set `is_active = false`. Never DELETE rows
8. **After every migration**: run `npx supabase db reset && npx supabase gen types typescript --local > src/lib/types/database.ts`
9. **Use Context7 MCP** before writing code for any library. Do not guess APIs

## Directory layout
```
src/
├── main.tsx
├── App.tsx                           # RouterProvider + QueryClient + AuthProvider
├── lib/
│   ├── supabase.ts                   # createClient(url, anonKey)
│   ├── types/
│   │   ├── database.ts               # AUTO-GENERATED — never hand-edit
│   │   └── enums.ts                  # UserRole, ResponseStatus, ResponseType, etc.
│   ├── hooks/
│   │   ├── useAuth.ts                # AuthContext, login, signup, logout, session
│   │   ├── useOrg.ts                 # Current org from JWT claims
│   │   ├── useFrameworks.ts          # Framework/principle/indicator/question queries
│   │   ├── useResponses.ts           # Response CRUD + optimistic updates
│   │   ├── useAssignments.ts         # Question assignments CRUD
│   │   ├── useReview.ts              # Approval queue queries
│   │   ├── useReportPeriods.ts       # Report period CRUD
│   │   ├── useDashboard.ts           # Progress calculations
│   │   ├── useNotifications.ts       # Notification queries
│   │   ├── useRealtime.ts            # Supabase realtime subscriptions
│   │   └── useCrossMapping.ts        # Cross-framework auto-population
│   └── utils/
│       ├── progress.ts               # Completion % calculations
│       ├── unit-converter.ts         # TJ↔GJ↔MWh, KL↔ML conversions
│       ├── brsr-report.ts            # pdfmake BRSR PDF generator
│       └── xlsx-export.ts            # SheetJS Excel exporter
├── components/
│   ├── ui/                           # shadcn/ui — install with: npx shadcn@latest add <name>
│   ├── layout/
│   │   ├── AppShell.tsx              # Sidebar + TopBar + Outlet
│   │   ├── Sidebar.tsx               # Role-based nav links
│   │   ├── TopBar.tsx                # Org name + period selector + notifications + avatar
│   │   └── NotificationBell.tsx      # Bell icon + dropdown
│   ├── framework/
│   │   ├── FrameworkCard.tsx          # Toggle card for enabling/disabling a framework
│   │   ├── PrincipleAccordion.tsx     # Expandable principle with indicators inside
│   │   ├── IndicatorCard.tsx          # Indicator name + progress + question count
│   │   └── QuestionRenderer.tsx      # Dynamic form field from response_type
│   ├── collection/
│   │   ├── ResponseForm.tsx          # Full form for one question: input + evidence + notes
│   │   ├── TableResponseEditor.tsx   # Dynamic table with add/remove rows
│   │   ├── FileUploader.tsx          # Upload to Supabase Storage
│   │   └── BulkImporter.tsx          # CSV upload → batch responses
│   ├── approval/
│   │   ├── ReviewQueue.tsx           # Table of pending responses
│   │   ├── ResponseReview.tsx        # Side panel: current vs previous year
│   │   └── CommentThread.tsx         # Rejection reason + replies
│   ├── dashboard/
│   │   ├── StatCard.tsx              # KPI metric card
│   │   ├── FrameworkProgress.tsx     # Donut chart per framework
│   │   ├── DeptProgress.tsx          # Horizontal bars per department
│   │   └── DeadlineTracker.tsx       # Upcoming/overdue items
│   └── reports/
│       ├── ReportBuilder.tsx         # Framework + period selector → generate
│       └── ExportButtons.tsx         # PDF + XLSX download buttons
└── pages/
    ├── auth/Login.tsx, Signup.tsx, InviteAccept.tsx
    ├── onboarding/OrgSetup.tsx, FrameworkPicker.tsx, DeptSetup.tsx
    ├── dashboard/index.tsx
    ├── frameworks/index.tsx, [frameworkId]/index.tsx, [frameworkId]/[principleId].tsx
    ├── collection/my-tasks.tsx, [questionId].tsx
    ├── review/index.tsx
    ├── reports/index.tsx
    └── settings/org.tsx, users.tsx, departments.tsx, report-periods.tsx
```

## Database schema summary

### Global tables (no RLS)
- `frameworks` — code, name, version, country, regulator
- `principles` — framework_id FK, code, name, section, sort_order
- `indicators` — principle_id FK, code, name, category (essential/leadership/core), data_type, unit
- `questions` — indicator_id FK, code, text, help_text, response_type, options (JSONB), validation_rules (JSONB), is_required, is_assurable, default_dept
- `datapoint_mappings` — datapoint_key, question_id FK, framework_code, conversion_factor, conversion_from_unit

### Tenant tables (RLS enabled, org_id on every row)
- `organizations` — name, slug, industry, sector, listed_on, market_cap, fiscal_start
- `profiles` — id=auth.users.id, org_id, email, full_name, role, department_id
- `org_departments` — org_id, code, name, head_name, head_email
- `org_frameworks` — org_id, framework_id, is_active, config (JSONB)
- `report_periods` — org_id, name, code, start_date, end_date, status
- `question_assignments` — question_id, department_id, assigned_to, report_period_id, due_date, status, org_id
- `responses` — question_id, report_period_id, org_id, user_id, value, numeric_value, file_url, notes, status, version, rejection_reason
- `audit_logs` — org_id, user_id, entity_type, entity_id, action, changes (JSONB)
- `notifications` — user_id, org_id, type, title, message, is_read, link

### RLS helpers (read from JWT, zero DB queries)
- `requesting_org_id()` → UUID from JWT claim
- `requesting_user_role()` → text from JWT claim

### Auth flow
- Custom Access Token Hook: injects org_id, user_role, dept_id into JWT from profiles table
- DB trigger on auth.users INSERT: auto-creates profile row
- New signup: profile created with org_id=NULL → onboarding sets org_id → force token refresh
- Invited user: org_id/role/dept_id passed in user_metadata → profile created with all fields

## User roles
| Role | Manage org | Enable frameworks | Invite users | Enter data | Approve | View all | Reports |
|------|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| super_admin | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ |
| cs_admin | ✓ | ✓ | ✓ | — | ✓ | ✓ | ✓ |
| dept_poc | — | — | — | own dept | — | own dept | — |
| auditor | — | — | — | — | — | ✓ | ✓ |
| viewer | — | — | — | — | — | ✓ | — |

## Question response_type → component mapping
| response_type | Component | Notes |
|--------------|-----------|-------|
| text | `<Input />` | |
| number | `<Input type="number" />` | Show unit badge from indicator.unit |
| percentage | `<Input type="number" />` | Show % suffix |
| yes_no | `<Switch />` | |
| select | `<Select />` | Options from question.options JSONB |
| multi_select | `<Checkbox group />` | Options from question.options JSONB |
| table | `<TableResponseEditor />` | Schema from question.table_schema JSONB |
| file_upload | `<FileUploader />` | Upload to Supabase Storage: evidence/{org_id}/{period}/{question_code}/ |
| date | `<Input type="date" />` | |
| rich_text | `<Textarea />` | |

## Cross-framework mapping (key datapoints)
One response auto-populates linked questions across frameworks:
- scope_1_ghg: BRSR P6E10 → GRI 305-1a → TCFD MT-A2 → CDP C6.1 → SASB GHG-1
- scope_2_ghg: BRSR P6E11 → GRI 305-2a → CDP C6.3
- total_energy: BRSR P6E5 (TJ) → GRI 302-1g (GJ, ×1000) → CDP C8.2a (MWh, ×277.778)
- water_withdrawal: BRSR P6E16-18 (KL) → GRI 303-3a (ML, ÷1000) → CDP W1.2a (ML)
- total_waste: BRSR P6E22 → GRI 306-3a
- fatalities: BRSR P3E21-22 → GRI 403-9a

---

## Implementation progress tracker

> **INSTRUCTION**: After completing each phase, update this section. Claude Code reads this at session start to know exactly where to resume.

### Current status: PHASE 2 — NEXT

### Phase 1: Foundation — COMPLETE
- [x] Project scaffolded (Vite + React + TS)
- [x] All npm deps installed
- [x] shadcn/ui initialized + core components added
- [x] Supabase remote project configured (bivnkbxrygvthupnrvun)
- [x] Migration 001: framework engine tables
- [x] Migration 002: tenant tables
- [x] Migration 003: data collection tables
- [x] Migration 004: audit + notifications tables
- [x] Migration 005: auth hook function
- [x] Migration 006: signup trigger
- [x] Migration 007: RLS policies
- [x] Migration 008: seed all 6 frameworks (BRSR complete, GRI/TCFD/CSR/SASB/CDP partial)
- [x] Types generated from schema (database.ts, 889 lines)
- [x] supabase.ts client created
- [x] useAuth hook + AuthProvider (in useAuth.tsx)
- [x] useOrg hook (useCurrentOrg TanStack Query)
- [x] AppShell layout (sidebar + topbar + outlet)
- [x] Login page
- [x] Signup page
- [x] Routing setup (React Router v7 with ProtectedRoute + OnboardingRoute)
**Checkpoint commit**: pending

**Notes**:
- Using remote Supabase (not local Docker). Use `npx supabase db push` for migrations, `npx supabase gen types typescript --linked` for types.
- Custom Access Token Hook MUST be manually enabled in Supabase Dashboard → Authentication → Hooks after each project setup.
- All stub pages created for Phase 2+ routes.

### Phase 2: Onboarding + Framework browser — COMPLETE
- [x] Onboarding wizard (4 steps: org → frameworks → depts → review/launch) — calls create_org_for_user RPC
- [x] Token refresh after onboarding (refreshSession() in useAuth)
- [x] useFrameworks, usePrinciples, useIndicators, useQuestions hooks in src/lib/hooks/useFrameworks.ts
- [x] Framework list page (grid of enabled frameworks with colors/badges)
- [x] Framework detail page (principles list with section badges)
- [x] Principle detail page with indicators accordion (lazy-loads questions on expand)
- [x] QuestionRenderer (all 10 response types: text, number, percentage, yes_no, select, multi_select, table, file_upload, date, rich_text)
- [x] User invitation flow (magic-link OTP via Supabase)
- [x] InviteAccept page (stub — user gets email link → /login)
**Checkpoint commit**: pending

**Notes**:
- Onboarding uses create_org_for_user RPC (migration 010) — SECURITY DEFINER bypasses RLS for new users
- File upload in QuestionRenderer is a stub (filename only); full Supabase Storage upload is Phase 3
- Table response type uses free-form JSON textarea for now
**Checkpoint commit**: _not yet_

### Phase 3: Data collection + Approval — NOT STARTED
- [ ] useAssignments hook
- [ ] Auto-assign questions to depts (by default_dept)
- [ ] useResponses hook (CRUD + optimistic updates)
- [ ] My Tasks page (dept POC view)
- [ ] Question response form page
- [ ] File upload to Supabase Storage
- [x] Previous year carry-forward (usePreviousResponse hook, shown in question form)
- [x] useReview hook (useApprove, useReject, useBulkApprove in useReview.ts)
- [x] Approval queue page (CS admin) with shadcn Sheet slide-over
- [x] Approve/reject with rejection reason form
- [x] Report periods management page with Create + Start Data Collection
- [x] Audit logging (DB trigger on responses INSERT/UPDATE in migration 011)
- [x] Notification trigger (approved/rejected → notify submitter)
- [x] FileUploader (Supabase Storage 'evidence' bucket, drag-drop)
- [x] Departments settings page (CRUD)
- [x] Org settings page (edit company profile)
**Checkpoint commit**: pending

**Notes**:
- auto_assign_questions RPC (migration 011) creates question_assignments when period starts data collection
- evidence storage bucket created in migration 011 with 50 MB limit
- QuestionPage Textarea uses watch/setValue instead of register (Controller pattern via QuestionRenderer)

### Phase 4: Dashboards + Reports — NOT STARTED
- [ ] Progress calculation utils
- [ ] useDashboard hook
- [ ] Executive dashboard (donut charts, dept bars, activity feed)
- [ ] Dept POC dashboard (own dept only)
- [ ] BRSR PDF report (pdfmake — all 3 sections)
- [x] Excel export (SheetJS — one sheet per principle, summary sheet, auto-column widths, freeze header)
- [x] Reports page (framework + period selector, response stats, PDF + Excel download buttons)
**Checkpoint commit**: pending

**Notes**:
- pdfmake v0.3.9: uses `pdfMake.addVirtualFileSystem(pdfFonts)` — NOT `.vfs = ...`
- Dashboard uses get_dashboard_stats RPC (migration 012) for single-query aggregation
- PDF export includes only 'approved' responses; Excel includes all statuses
- Reports page fetches responses and filters by framework code in JS (Supabase nested join filter limitation)

### Phase 5: Cross-mapping + Polish — COMPLETE
- [x] Seed datapoint_mappings (done in migration 009)
- [x] Unit converter utils (src/lib/utils/unit-converter.ts — TJ↔GJ↔MWh, KL↔ML, MT)
- [x] useCrossMapping.ts (useLinkedQuestions + useAutoPopulate → calls auto_populate_linked_responses RPC)
- [x] Notification system (useNotifications.ts + full NotificationBell with unread badge + popover)
- [x] Realtime subscriptions (useRealtime.ts — responses channel + notifications channel)
- [x] ErrorBoundary component (src/components/ErrorBoundary.tsx)
- [x] Mobile responsive sidebar (hamburger in TopBar, Sheet overlay for mobile, desktop keeps fixed sidebar)
- [x] Question form: shows "Cross-mapped · N frameworks" badge + auto-fill notification after save
- [ ] Demo seed data — DEFERRED (requires real auth users; do via onboarding after signing up)
**Checkpoint commit**: pending

**Notes**:
- Cross-mapping: after saving a draft, auto_populate_linked_responses RPC auto-fills linked questions with unit conversion applied
- Realtime: Supabase postgres_changes subscriptions wired in AppShell via useRealtime()
- Mobile sidebar: `md:` breakpoint — below 768px shows hamburger + Sheet overlay
- Demo data: user must sign up + complete onboarding, then manually enter sample responses

---

## Known decisions & tradeoffs
- Using RLS single-DB (not schema-per-tenant) — fine for <500 orgs
- 1 user = 1 org for now — multi-org membership deferred
- Framework versioning deferred — manually update seed data for now
- No AI features in MVP — architecture is AI-ready for later
- Table response type uses free-form JSON in value field — formalize table_schema later
- XBRL export deferred to post-MVP

# Add this section to your existing CLAUDE.md under the progress tracker:

---

## Feature: Assignment + Data Entry + Progress Dashboard

### Current status: NOT STARTED

### Step 1: Assignment system — COMPLETE
- [x] question_assignments table + RLS verified (table from migration 003; RLS resilient via migration 014)
- [x] useAssignments hook — useAllAssignments, useMyAssignments, useDepartments, useAutoAssign (auto_assign_questions RPC), useUpdateAssignment (status/assignee/due_date/reassign-dept; partial-patch), useBulkReassign
- [x] Assignments page (src/pages/assignments/index.tsx — period selector, auto-assign button, status stats, framework/dept/status filters, per-row reassign + due date, bulk reassign)
- [ ] Assignment badges in framework browser — DEFERRED (nice-to-have)
- [x] Sidebar link for cs_admin/super_admin (ListChecks icon)

### Step 2: Dept POC data entry — NOT STARTED
- [ ] useResponses hook (save draft, submit, previous year carry-forward)
- [ ] My Tasks page (grouped by principle, status tabs, bulk submit)
- [ ] Response form page (QuestionRenderer + evidence upload + notes)
- [ ] Rejection handling (show reason, allow re-edit + resubmit)
- [ ] File upload to Supabase Storage
- [ ] Sidebar link for dept_poc

### Step 3: Approval workflow — NOT STARTED
- [ ] useReview hook (queue, approve, reject, bulk approve)
- [ ] Review queue page (table + slide-over panel + bulk actions)
- [ ] Approve/reject with comments
- [ ] Audit logging on status changes
- [ ] Sidebar link with pending count badge

### Step 4: Progress dashboard — NOT STARTED
- [ ] useDashboard hook (org progress, by framework, by dept, recent activity)
- [ ] Executive dashboard (stat cards + donut charts + dept bars + activity feed)
- [ ] Dept POC dashboard (own dept only)
- [ ] Progress bars in framework browser (framework/principle/indicator levels)
- [ ] Overdue items tracker
- [ ] Realtime updates (or 30s polling fallback)

**Checkpoint commit**: _not yet_

### Known issues / decisions from this feature:
- _none yet_