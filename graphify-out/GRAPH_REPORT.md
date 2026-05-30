# Graph Report - .  (2026-05-30)

## Corpus Check
- Corpus is ~14,314 words - fits in a single context window. You may not need a graph.

## Summary
- 368 nodes · 453 edges · 50 communities (29 shown, 21 thin omitted)
- Extraction: 80% EXTRACTED · 20% INFERRED · 0% AMBIGUOUS · INFERRED: 92 edges (avg confidence: 0.81)
- Token cost: 0 input · 0 output

## Community Hubs (Navigation)
- [[_COMMUNITY_ESG Platform Core|ESG Platform Core]]
- [[_COMMUNITY_Dev Dependencies|Dev Dependencies]]
- [[_COMMUNITY_Runtime Dependencies|Runtime Dependencies]]
- [[_COMMUNITY_TS App Config|TS App Config]]
- [[_COMMUNITY_shadcnui Config|shadcn/ui Config]]
- [[_COMMUNITY_TS Node Config|TS Node Config]]
- [[_COMMUNITY_DropdownMenu Component|DropdownMenu Component]]
- [[_COMMUNITY_Auth & Multi-Tenancy|Auth & Multi-Tenancy]]
- [[_COMMUNITY_ESG Framework Data Layer|ESG Framework Data Layer]]
- [[_COMMUNITY_Command UI & Utilities|Command UI & Utilities]]
- [[_COMMUNITY_Sheet Component|Sheet Component]]
- [[_COMMUNITY_Dialog Component|Dialog Component]]
- [[_COMMUNITY_Select Component|Select Component]]
- [[_COMMUNITY_Table Component|Table Component]]
- [[_COMMUNITY_Card Component|Card Component]]
- [[_COMMUNITY_Popover Component|Popover Component]]
- [[_COMMUNITY_Icon Assets|Icon Assets]]
- [[_COMMUNITY_Avatar Component|Avatar Component]]
- [[_COMMUNITY_Tabs Component|Tabs Component]]
- [[_COMMUNITY_Type Enums|Type Enums]]
- [[_COMMUNITY_Radio Group Component|Radio Group Component]]
- [[_COMMUNITY_Accordion Component|Accordion Component]]
- [[_COMMUNITY_Badge & Separator|Badge & Separator]]
- [[_COMMUNITY_Checkbox Component|Checkbox Component]]
- [[_COMMUNITY_Progress Component|Progress Component]]
- [[_COMMUNITY_Input & Textarea|Input & Textarea]]
- [[_COMMUNITY_Label Component|Label Component]]
- [[_COMMUNITY_Hero Visual Asset|Hero Visual Asset]]
- [[_COMMUNITY_Vite Build Config|Vite Build Config]]
- [[_COMMUNITY_React Entry Point|React Entry Point]]
- [[_COMMUNITY_Supabase Client|Supabase Client]]
- [[_COMMUNITY_useAuth Hook|useAuth Hook]]
- [[_COMMUNITY_useOrg Hook|useOrg Hook]]
- [[_COMMUNITY_TypeScript Types|TypeScript Types]]
- [[_COMMUNITY_Brand Assets|Brand Assets]]
- [[_COMMUNITY_Index HTML|Index HTML]]
- [[_COMMUNITY_Client-Side PDF|Client-Side PDF]]
- [[_COMMUNITY_RLS JWT Pattern|RLS JWT Pattern]]
- [[_COMMUNITY_Hooks-Only Pattern|Hooks-Only Pattern]]
- [[_COMMUNITY_Phase 2 Implementation|Phase 2 Implementation]]
- [[_COMMUNITY_Phase 3 Implementation|Phase 3 Implementation]]
- [[_COMMUNITY_Phase 4 Implementation|Phase 4 Implementation]]
- [[_COMMUNITY_Phase 5 Implementation|Phase 5 Implementation]]
- [[_COMMUNITY_Claude Commands|Claude Commands]]
- [[_COMMUNITY_ESG Cross-Framework|ESG Cross-Framework]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 81 edges
2. `VasudhaTech ESG Governance Platform` - 47 edges
3. `compilerOptions` - 19 edges
4. `compilerOptions` - 16 edges
5. `Implementation Prompt: Phase 1 Instructions` - 9 edges
6. `Migration 008: Seed All 6 Frameworks (BRSR, GRI, TCFD, CSR, SASB, CDP)` - 7 edges
7. `tailwind` - 6 edges
8. `aliases` - 6 edges
9. `Global Framework Tables (no RLS, shared read-only)` - 6 edges
10. `Supabase (PostgreSQL 15 + Auth + Realtime + Storage)` - 6 edges

## Surprising Connections (you probably didn't know these)
- `cn()` --calls--> `clsx`  [INFERRED]
  src/lib/utils.ts → package.json
- `Vite Logo (Lightning Bolt + Parentheses)` --semantically_similar_to--> `VasudhaTech Favicon (Lightning Bolt Logo)`  [INFERRED] [semantically similar]
  src/assets/vite.svg → public/favicon.svg
- `AccordionItem()` --calls--> `cn()`  [INFERRED]
  src/components/ui/accordion.tsx → src/lib/utils.ts
- `AccordionTrigger()` --calls--> `cn()`  [INFERRED]
  src/components/ui/accordion.tsx → src/lib/utils.ts
- `AccordionContent()` --calls--> `cn()`  [INFERRED]
  src/components/ui/accordion.tsx → src/lib/utils.ts

## Hyperedges (group relationships)
- **RLS + JWT Claims + org_id: Multi-Tenant Data Isolation Pattern** — claude_md_multi_tenancy_rls, claude_md_custom_access_token_hook, claude_md_requesting_org_id_fn, claude_md_db_table_profiles [EXTRACTED 0.95]
- **ESG Framework Data Pipeline: Global Tables -> Assignments -> Responses -> Reports** — claude_md_global_framework_tables, claude_md_db_table_question_assignments, claude_md_db_table_responses, claude_md_client_side_reports [INFERRED 0.85]
- **Cross-Framework Datapoint Synchronization: Mappings + Unit Converter + Auto-Population Hook** — claude_md_db_table_datapoint_mappings, claude_md_util_unit_converter, claude_md_hook_use_cross_mapping [EXTRACTED 0.95]

## Communities (50 total, 21 thin omitted)

### Community 0 - "ESG Platform Core"
Cohesion: 0.05
Nodes (59): Claude Command: checkpoint (save phase progress), Client-Side Report Generation (pdfmake + SheetJS), Component: FileUploader (Supabase Storage), Component: QuestionRenderer (dynamic form field from response_type), DB Table: audit_logs (tenant, RLS), DB Table: notifications (tenant, RLS), DB Table: responses (tenant, RLS), Dynamic Forms via response_type to Component Mapping (+51 more)

### Community 1 - "Dev Dependencies"
Cohesion: 0.08
Nodes (24): devDependencies, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, @types/file-saver, @types/node (+16 more)

### Community 2 - "Runtime Dependencies"
Cohesion: 0.09
Nodes (23): dependencies, class-variance-authority, clsx, cmdk, date-fns, file-saver, @hookform/resolvers, lucide-react (+15 more)

### Community 3 - "TS App Config"
Cohesion: 0.09
Nodes (21): compilerOptions, allowImportingTsExtensions, baseUrl, erasableSyntaxOnly, jsx, lib, module, moduleDetection (+13 more)

### Community 4 - "shadcn/ui Config"
Cohesion: 0.11
Nodes (17): aliases, components, hooks, lib, ui, utils, iconLibrary, rsc (+9 more)

### Community 5 - "TS Node Config"
Cohesion: 0.11
Nodes (17): compilerOptions, allowImportingTsExtensions, erasableSyntaxOnly, lib, module, moduleDetection, moduleResolution, noEmit (+9 more)

### Community 6 - "DropdownMenu Component"
Cohesion: 0.12
Nodes (9): DropdownMenuCheckboxItem(), DropdownMenuContent(), DropdownMenuItem(), DropdownMenuLabel(), DropdownMenuRadioItem(), DropdownMenuSeparator(), DropdownMenuShortcut(), DropdownMenuSubContent() (+1 more)

### Community 7 - "Auth & Multi-Tenancy"
Cohesion: 0.15
Nodes (15): Custom Access Token Hook (injects org_id, user_role, dept_id into JWT), DB Table: organizations (tenant, RLS), DB Table: profiles (tenant, RLS, id=auth.users.id), DB Table: question_assignments (tenant, RLS), DB Trigger: handle_new_user (auto-create profile on auth.users INSERT), Hook: useAssignments, Implementation Phase 1: Foundation + Database + Auth Shell, requesting_org_id() RLS Helper Function (+7 more)

### Community 8 - "ESG Framework Data Layer"
Cohesion: 0.19
Nodes (14): Cross-Framework Auto-Population via datapoint_mappings, DB Table: datapoint_mappings (global, no RLS), DB Table: frameworks (global, no RLS), DB Table: indicators (global, no RLS), DB Table: principles (global, no RLS), DB Table: questions (global, no RLS), Global Framework Tables (no RLS, shared read-only), Hook: useCrossMapping (cross-framework auto-population) (+6 more)

### Community 9 - "Command UI & Utilities"
Cohesion: 0.27
Nodes (9): cn(), Command(), CommandDialog(), CommandGroup(), CommandInput(), CommandItem(), CommandList(), CommandSeparator() (+1 more)

### Community 10 - "Sheet Component"
Cohesion: 0.18
Nodes (6): SheetContent(), SheetDescription(), SheetFooter(), SheetHeader(), SheetOverlay(), SheetTitle()

### Community 11 - "Dialog Component"
Cohesion: 0.18
Nodes (6): DialogContent(), DialogDescription(), DialogFooter(), DialogHeader(), DialogOverlay(), DialogTitle()

### Community 12 - "Select Component"
Cohesion: 0.18
Nodes (7): SelectContent(), SelectItem(), SelectLabel(), SelectScrollDownButton(), SelectScrollUpButton(), SelectSeparator(), SelectTrigger()

### Community 13 - "Table Component"
Cohesion: 0.22
Nodes (8): Table(), TableBody(), TableCaption(), TableCell(), TableFooter(), TableHead(), TableHeader(), TableRow()

### Community 14 - "Card Component"
Cohesion: 0.25
Nodes (7): Card(), CardAction(), CardContent(), CardDescription(), CardFooter(), CardHeader(), CardTitle()

### Community 15 - "Popover Component"
Cohesion: 0.25
Nodes (4): PopoverContent(), PopoverDescription(), PopoverHeader(), PopoverTitle()

### Community 16 - "Icon Assets"
Cohesion: 0.29
Nodes (7): Bluesky Social Icon, Discord Social Icon, Documentation Icon (Code/File), GitHub Social Icon, Social/User Profile Icon, Social & UI Icon Sprite Sheet, X (Twitter) Social Icon

### Community 17 - "Avatar Component"
Cohesion: 0.29
Nodes (6): Avatar(), AvatarBadge(), AvatarFallback(), AvatarGroup(), AvatarGroupCount(), AvatarImage()

### Community 18 - "Tabs Component"
Cohesion: 0.40
Nodes (5): Tabs(), TabsContent(), TabsList(), tabsListVariants, TabsTrigger()

### Community 19 - "Type Enums"
Cohesion: 0.33
Nodes (5): FrameworkCode, ReportPeriodStatus, ResponseStatus, ResponseType, UserRole

### Community 20 - "Radio Group Component"
Cohesion: 0.50
Nodes (5): Isometric Layered Platform Design, Minimal / Abstract UI Illustration Style, Purple Brand Accent Color, Hero Image (Isometric Stack Illustration), Landing Page Hero Visual

### Community 21 - "Accordion Component"
Cohesion: 0.40
Nodes (3): AccordionContent(), AccordionItem(), AccordionTrigger()

### Community 22 - "Badge & Separator"
Cohesion: 0.50
Nodes (3): supabase, supabaseAnonKey, supabaseUrl

### Community 23 - "Checkbox Component"
Cohesion: 0.67
Nodes (3): React Logo (Atom/Orbital Mark), Vite Logo (Lightning Bolt + Parentheses), VasudhaTech Favicon (Lightning Bolt Logo)

## Knowledge Gaps
- **116 isolated node(s):** `$schema`, `style`, `rsc`, `tsx`, `config` (+111 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **21 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Command UI & Utilities` to `Runtime Dependencies`, `DropdownMenu Component`, `Sheet Component`, `Dialog Component`, `Select Component`, `Table Component`, `Card Component`, `Popover Component`, `Avatar Component`, `Tabs Component`, `Accordion Component`, `Progress Component`, `Input & Textarea`, `Vite Build Config`, `React Entry Point`, `Supabase Client`, `useAuth Hook`, `useOrg Hook`, `TypeScript Types`, `Brand Assets`, `Index HTML`?**
  _High betweenness centrality (0.202) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Runtime Dependencies` to `Dev Dependencies`?**
  _High betweenness centrality (0.099) - this node is a cross-community bridge._
- **Why does `clsx` connect `Runtime Dependencies` to `Command UI & Utilities`?**
  _High betweenness centrality (0.089) - this node is a cross-community bridge._
- **Are the 80 inferred relationships involving `cn()` (e.g. with `AccordionItem()` and `AccordionTrigger()`) actually correct?**
  _`cn()` has 80 INFERRED edges - model-reasoned connections that need verification._
- **What connects `$schema`, `style`, `rsc` to the rest of the system?**
  _136 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `ESG Platform Core` be split into smaller, more focused modules?**
  _Cohesion score 0.053185271770894216 - nodes in this community are weakly interconnected._
- **Should `Dev Dependencies` be split into smaller, more focused modules?**
  _Cohesion score 0.08 - nodes in this community are weakly interconnected._