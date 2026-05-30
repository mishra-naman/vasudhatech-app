# VasudhaTech — ESG Governance Platform

## Project overview
Multi-tenant SaaS for Indian companies to manage ESG compliance across 6 frameworks (BRSR, GRI, TCFD, CSR, SASB, CDP). Dept POCs enter data, CS admins review/approve, reports are generated client-side.

## Tech stack
- Frontend: Vite + React 19 + TypeScript + shadcn/ui + Tailwind CSS 4
- Backend: Supabase (PostgreSQL + Auth + Realtime + Storage)
- State: TanStack React Query v5
- Forms: React Hook Form + Zod
- Routing: React Router v7
- PDF: pdfmake (client-side, JSON-driven)
- XLSX: SheetJS/xlsx (client-side)
- Deployment: Vercel free tier

## Architecture decisions
- Multi-tenancy via RLS with org_id in JWT claims (Custom Access Token Hook)
- Framework tables (frameworks, principles, indicators, questions) are GLOBAL — no org_id, no RLS, read-only
- Tenant tables (responses, assignments, org config) have org_id on every row + RLS
- DB trigger on auth.users INSERT auto-creates profile row (handles invite + signup)
- Dynamic form rendering: question.response_type → React component mapping
- Cross-framework mapping: datapoint_mappings table links shared data across frameworks
- Report generation: entirely client-side with pdfmake + SheetJS — no Edge Functions needed
- Soft deletes everywhere: set is_active=false, never DELETE rows
- Response versioning: increment version field, keep all versions for audit

## Directory structure
```
src/lib/supabase.ts          — Supabase client
src/lib/types/database.ts    — npx supabase gen types typescript --local
src/lib/types/enums.ts       — UserRole, ResponseStatus, ResponseType
src/lib/hooks/               — ALL Supabase queries go here (useAuth, useOrg, useFrameworks, useResponses, useReview, useDashboard)
src/lib/utils/               — unit-converter.ts, progress.ts, brsr-report.ts, xlsx-export.ts
src/components/ui/           — shadcn/ui (installed via npx shadcn@latest add)
src/components/layout/       — AppShell, Sidebar, NotificationBell
src/components/framework/    — FrameworkSelector, PrincipleAccordion, QuestionRenderer
src/components/collection/   — ResponseForm, TableResponseEditor, FileUploader
src/components/dashboard/    — OrgDashboard, FrameworkProgress, DeptProgress
src/pages/                   — Route pages (auth/, onboarding/, frameworks/, collection/, review/, reports/, settings/, dashboard/)
supabase/migrations/         — Numbered SQL migrations
```

## Commands
- `npm run dev` — Vite dev server
- `npx supabase start` — local Supabase (needs Docker)
- `npx supabase db reset` — reset + re-run migrations + seed
- `npx supabase gen types typescript --local > src/lib/types/database.ts` — regen types after migration changes
- `npx supabase migration new <name>` — new migration file
- `npx shadcn@latest add <component>` — add shadcn component

## Code rules
- TypeScript strict — no `any`
- Components: PascalCase, named exports, one per file
- Supabase queries: ALWAYS through TanStack Query hooks in src/lib/hooks/ — NEVER raw supabase.from() in components
- Zod schemas for all form validation
- shadcn/ui for ALL UI — never raw HTML inputs
- Tailwind only — no inline styles, no CSS modules

## Database patterns
- `public.requesting_org_id()` — reads org_id from JWT, zero DB queries
- `public.requesting_user_role()` — reads role from JWT
- Tenant tables: id UUID, org_id UUID FK, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ
- Response types: text, number, percentage, yes_no, select, multi_select, table, file_upload, date, rich_text

## User roles
| Role | Can do |
|------|--------|
| super_admin | everything |
| cs_admin | manage org/frameworks/users, approve responses, generate reports |
| dept_poc | enter data for own dept's assigned questions only |
| auditor | read-only: all data + reports |
| viewer | read-only: dashboard only |

## IMPORTANT: Use Context7
Before writing code using Supabase JS, React Query, React Hook Form, shadcn/ui, pdfmake, or SheetJS: use Context7 MCP to fetch latest docs. Do not rely on training data for API signatures.

## After every migration
Run: `npx supabase db reset && npx supabase gen types typescript --local > src/lib/types/database.ts`

