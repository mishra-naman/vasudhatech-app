import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/types/database'
import { useAuth } from './useAuth'

type ResponseRow    = Database['public']['Tables']['responses']['Row']
type ResponseInsert = Database['public']['Tables']['responses']['Insert']
type QuestionRow    = Database['public']['Tables']['questions']['Row']
type IndicatorRow   = Database['public']['Tables']['indicators']['Row']
type PrincipleRow   = Database['public']['Tables']['principles']['Row']
type FrameworkRow   = Database['public']['Tables']['frameworks']['Row']
type ProfileRow     = Database['public']['Tables']['profiles']['Row']

export type ResponseWithContext = ResponseRow & {
  question: QuestionRow & {
    indicator: IndicatorRow & {
      principle: PrincipleRow & { framework: FrameworkRow }
    }
  }
  submitter: ProfileRow | null
  approver:  ProfileRow | null
}

// Current response for a question in a period
export function useResponse(questionId: string | undefined, periodId: string | undefined) {
  const { orgId, isAuthenticated } = useAuth()

  return useQuery<ResponseRow | null>({
    queryKey: ['response', questionId, periodId, orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('responses')
        .select('*')
        .eq('question_id', questionId!)
        .eq('report_period_id', periodId!)
        .eq('org_id', orgId!)
        .order('version', { ascending: false })
        .limit(1)
        .single()
      if (error && error.code !== 'PGRST116') throw error
      return data ?? null
    },
    enabled: isAuthenticated && !!questionId && !!periodId && !!orgId,
  })
}

// Previous year response for carry-forward reference
export function usePreviousResponse(questionId: string | undefined, prevPeriodId: string | undefined) {
  const { orgId } = useAuth()

  return useQuery<ResponseRow | null>({
    queryKey: ['response', 'prev', questionId, prevPeriodId, orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('responses')
        .select('*')
        .eq('question_id', questionId!)
        .eq('report_period_id', prevPeriodId!)
        .eq('org_id', orgId!)
        .eq('status', 'approved')
        .order('version', { ascending: false })
        .limit(1)
        .single()
      if (error && error.code !== 'PGRST116') throw error
      return data ?? null
    },
    enabled: !!questionId && !!prevPeriodId && !!orgId,
    staleTime: 10 * 60 * 1000,
  })
}

// Save or update a draft response (optimistic)
export function useSaveDraft() {
  const { orgId, user } = useAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: {
      question_id: string
      report_period_id: string
      value: string
      numeric_value?: number | null
      notes?: string | null
      file_url?: string | null
    }) => {
      const payload: ResponseInsert = {
        ...input,
        org_id: orgId!,
        user_id: user?.id,
        status: 'draft',
      }
      const { data, error } = await supabase
        .from('responses')
        .upsert(payload, { onConflict: 'question_id,report_period_id,org_id' })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onMutate: async (input) => {
      const key = ['response', input.question_id, input.report_period_id, orgId]
      await qc.cancelQueries({ queryKey: key })
      const prev = qc.getQueryData<ResponseRow | null>(key)
      qc.setQueryData<ResponseRow | null>(key, old => ({
        ...(old ?? {} as ResponseRow),
        ...input,
        status: 'draft',
        org_id: orgId!,
        user_id: user?.id ?? null,
        updated_at: new Date().toISOString(),
      }))
      return { prev, key }
    },
    onError: (_e, _input, ctx) => {
      if (ctx) qc.setQueryData(ctx.key, ctx.prev)
      toast.error('Failed to save draft')
    },
    onSettled: (_data, _err, input) => {
      qc.invalidateQueries({ queryKey: ['response', input.question_id, input.report_period_id, orgId] })
      qc.invalidateQueries({ queryKey: ['assignments'] })
    },
  })
}

// Submit a response (draft → submitted)
export function useSubmitResponse() {
  const { orgId } = useAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (responseId: string) => {
      const { error } = await supabase
        .from('responses')
        .update({ status: 'submitted', submitted_at: new Date().toISOString() })
        .eq('id', responseId)
        .eq('org_id', orgId!)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['response'] })
      qc.invalidateQueries({ queryKey: ['assignments'] })
      qc.invalidateQueries({ queryKey: ['reviews'] })
      toast.success('Response submitted for review')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

// Pending responses for admin review
export function usePendingReviews(periodId: string | undefined) {
  const { orgId, isAuthenticated } = useAuth()

  return useQuery<ResponseWithContext[]>({
    queryKey: ['reviews', 'pending', orgId, periodId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('responses')
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
          submitter:profiles!user_id(*),
          approver:profiles!approved_by(*)
        `)
        .eq('org_id', orgId!)
        .eq('report_period_id', periodId!)
        .in('status', ['submitted'])
        .order('submitted_at', { ascending: true })
      if (error) throw error
      return (data ?? []) as unknown as ResponseWithContext[]
    },
    enabled: isAuthenticated && !!orgId && !!periodId,
    refetchInterval: 30_000, // poll every 30s for new submissions
  })
}

// All responses for a period (admin view)
export function useAllResponses(periodId: string | undefined) {
  const { orgId, isAuthenticated } = useAuth()

  return useQuery<ResponseWithContext[]>({
    queryKey: ['responses', 'all', orgId, periodId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('responses')
        .select(`
          *,
          question:questions!inner(
            *,
            indicator:indicators!inner(
              *,
              principle:principles!inner(*,
                framework:frameworks!inner(*)
              )
            )
          ),
          submitter:profiles!user_id(*),
          approver:profiles!approved_by(*)
        `)
        .eq('org_id', orgId!)
        .eq('report_period_id', periodId!)
        .order('submitted_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as unknown as ResponseWithContext[]
    },
    enabled: isAuthenticated && !!orgId && !!periodId,
  })
}
