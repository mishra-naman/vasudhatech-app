import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/types/database'
import { useAuth } from './useAuth'

type AssignmentRow  = Database['public']['Tables']['question_assignments']['Row']
type QuestionRow    = Database['public']['Tables']['questions']['Row']
type IndicatorRow   = Database['public']['Tables']['indicators']['Row']
type PrincipleRow   = Database['public']['Tables']['principles']['Row']
type FrameworkRow   = Database['public']['Tables']['frameworks']['Row']
type DeptRow        = Database['public']['Tables']['org_departments']['Row']
type ResponseRow    = Database['public']['Tables']['responses']['Row']

export type AssignmentWithContext = AssignmentRow & {
  question:  QuestionRow & {
    indicator: IndicatorRow & {
      principle: PrincipleRow & {
        framework: FrameworkRow
      }
    }
  }
  department: DeptRow
  response: ResponseRow | null
}

// Assignment + nested framework context. Responses are NOT embedded: there is
// no FK between question_assignments and responses (they relate by question_id
// + report_period_id), so PostgREST cannot auto-join them. We fetch the period's
// responses separately and merge by question_id (one response per question/period/org).
const ASSIGNMENT_SELECT = `
  *,
  question:questions!inner(
    *,
    indicator:indicators!inner(
      *,
      principle:principles!inner(
        *,
        framework:frameworks!inner(*)
      )
    )
  ),
  department:org_departments!inner(*)
`

async function fetchAssignments(orgId: string, periodId: string, deptId?: string): Promise<AssignmentWithContext[]> {
  let query = supabase
    .from('question_assignments')
    .select(ASSIGNMENT_SELECT)
    .eq('org_id', orgId)
    .eq('report_period_id', periodId)
  if (deptId) query = query.eq('department_id', deptId)

  const { data, error } = await query.order('created_at')
  if (error) throw error

  const { data: responses, error: rErr } = await supabase
    .from('responses')
    .select('*')
    .eq('org_id', orgId)
    .eq('report_period_id', periodId)
  if (rErr) throw rErr

  const byQuestion = new Map<string, ResponseRow>()
  for (const r of (responses ?? []) as ResponseRow[]) byQuestion.set(r.question_id, r)

  return ((data ?? []) as unknown[]).map((row) => {
    const a = row as AssignmentWithContext
    return { ...a, response: byQuestion.get(a.question_id) ?? null }
  })
}

// POC view: assignments for the current user's department
export function useMyAssignments(periodId: string | undefined) {
  const { orgId, deptId, isAuthenticated } = useAuth()

  return useQuery<AssignmentWithContext[]>({
    queryKey: ['assignments', 'mine', orgId, periodId, deptId],
    queryFn: () => fetchAssignments(orgId!, periodId!, deptId!),
    enabled: isAuthenticated && !!orgId && !!periodId && !!deptId,
  })
}

// Admin view: all assignments for a period
export function useAllAssignments(periodId: string | undefined) {
  const { orgId, isAuthenticated } = useAuth()

  return useQuery<AssignmentWithContext[]>({
    queryKey: ['assignments', 'all', orgId, periodId],
    queryFn: () => fetchAssignments(orgId!, periodId!),
    enabled: isAuthenticated && !!orgId && !!periodId,
  })
}

export function useUpdateAssignment() {
  const { orgId } = useAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status, assigned_to, due_date, department_id }: {
      id: string
      status?: AssignmentRow['status']
      assigned_to?: string | null
      due_date?: string | null
      department_id?: string
    }) => {
      // Only patch the fields explicitly provided — passing the whole object
      // would null out unspecified columns.
      const patch: Database['public']['Tables']['question_assignments']['Update'] = {}
      if (status !== undefined)        patch.status = status
      if (assigned_to !== undefined)   patch.assigned_to = assigned_to
      if (due_date !== undefined)      patch.due_date = due_date
      if (department_id !== undefined) patch.department_id = department_id
      if (Object.keys(patch).length === 0) return

      const { error } = await supabase
        .from('question_assignments')
        .update(patch)
        .eq('id', id)
        .eq('org_id', orgId!)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assignments'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

// Active departments for the current org (assignment dropdowns)
export function useDepartments() {
  const { orgId, isAuthenticated } = useAuth()

  return useQuery<DeptRow[]>({
    queryKey: ['departments', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('org_departments')
        .select('*')
        .eq('org_id', orgId!)
        .eq('is_active', true)
        .order('code')
      if (error) throw error
      return data ?? []
    },
    enabled: isAuthenticated && !!orgId,
    staleTime: 5 * 60 * 1000,
  })
}

// Auto-assign every question in the org's enabled frameworks to a department,
// matching question.default_dept against department codes (skips existing).
export function useAutoAssign() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (periodId: string) => {
      const { data, error } = await supabase.rpc('auto_assign_questions', { p_period_id: periodId })
      if (error) throw error
      return (data as number) ?? 0
    },
    onSuccess: (count) => {
      qc.invalidateQueries({ queryKey: ['assignments'] })
      toast.success(`Auto-assigned ${count} question${count === 1 ? '' : 's'}`)
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

// Reassign many assignments to one department at once
export function useBulkReassign() {
  const { orgId } = useAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ ids, departmentId }: { ids: string[]; departmentId: string }) => {
      const { error } = await supabase
        .from('question_assignments')
        .update({ department_id: departmentId })
        .in('id', ids)
        .eq('org_id', orgId!)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['assignments'] })
    },
    onError: (e: Error) => toast.error(e.message),
  })
}
