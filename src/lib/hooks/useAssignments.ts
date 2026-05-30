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

// POC view: assignments for the current user's department
export function useMyAssignments(periodId: string | undefined) {
  const { orgId, deptId, isAuthenticated } = useAuth()

  return useQuery<AssignmentWithContext[]>({
    queryKey: ['assignments', 'mine', orgId, periodId, deptId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('question_assignments')
        .select(`
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
          department:org_departments!inner(*),
          response:responses(*)
        `)
        .eq('org_id', orgId!)
        .eq('report_period_id', periodId!)
        .eq('department_id', deptId!)
        .order('created_at')
      if (error) throw error
      // responses returns an array; pick first (most recent)
      return ((data ?? []) as unknown[]).map((row: unknown) => {
        const r = row as AssignmentWithContext & { response: ResponseRow[] }
        return { ...r, response: Array.isArray(r.response) ? (r.response[0] ?? null) : r.response }
      }) as AssignmentWithContext[]
    },
    enabled: isAuthenticated && !!orgId && !!periodId && !!deptId,
  })
}

// Admin view: all assignments for a period
export function useAllAssignments(periodId: string | undefined) {
  const { orgId, isAuthenticated } = useAuth()

  return useQuery<AssignmentWithContext[]>({
    queryKey: ['assignments', 'all', orgId, periodId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('question_assignments')
        .select(`
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
          department:org_departments!inner(*),
          response:responses(*)
        `)
        .eq('org_id', orgId!)
        .eq('report_period_id', periodId!)
        .order('created_at')
      if (error) throw error
      return ((data ?? []) as unknown[]).map((row: unknown) => {
        const r = row as AssignmentWithContext & { response: ResponseRow[] }
        return { ...r, response: Array.isArray(r.response) ? (r.response[0] ?? null) : r.response }
      }) as AssignmentWithContext[]
    },
    enabled: isAuthenticated && !!orgId && !!periodId,
  })
}

export function useUpdateAssignment() {
  const { orgId } = useAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status, assigned_to, due_date }: {
      id: string
      status?: AssignmentRow['status']
      assigned_to?: string
      due_date?: string
    }) => {
      const { error } = await supabase
        .from('question_assignments')
        .update({ status, assigned_to, due_date })
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
