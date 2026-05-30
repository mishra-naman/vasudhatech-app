import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/types/database'
import { useAuth } from './useAuth'

type PeriodRow = Database['public']['Tables']['report_periods']['Row']
type PeriodInsert = Database['public']['Tables']['report_periods']['Insert']

export function useReportPeriods() {
  const { orgId, isAuthenticated } = useAuth()

  return useQuery<PeriodRow[]>({
    queryKey: ['report_periods', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('report_periods')
        .select('*')
        .eq('org_id', orgId!)
        .order('created_at', { ascending: false })
      if (error) throw error
      return data ?? []
    },
    enabled: isAuthenticated && !!orgId,
  })
}

// The most recent period in data_collection or open status
export function useActivePeriod() {
  const { orgId, isAuthenticated } = useAuth()

  return useQuery<PeriodRow | null>({
    queryKey: ['report_periods', 'active', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('report_periods')
        .select('*')
        .eq('org_id', orgId!)
        .in('status', ['data_collection', 'open'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      if (error && error.code !== 'PGRST116') throw error // PGRST116 = no rows
      return data ?? null
    },
    enabled: isAuthenticated && !!orgId,
    staleTime: 2 * 60 * 1000,
  })
}

export function useCreatePeriod() {
  const { orgId } = useAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (input: Pick<PeriodInsert, 'name' | 'code' | 'start_date' | 'end_date'>) => {
      const { data, error } = await supabase
        .from('report_periods')
        .insert({ ...input, org_id: orgId!, status: 'open' })
        .select()
        .single()
      if (error) throw error
      return data
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['report_periods', orgId] })
      toast.success('Report period created')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useUpdatePeriodStatus() {
  const { orgId } = useAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: PeriodRow['status'] }) => {
      const { error } = await supabase
        .from('report_periods')
        .update({ status })
        .eq('id', id)
        .eq('org_id', orgId!)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['report_periods'] })
      toast.success('Period status updated')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useStartDataCollection() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (periodId: string) => {
      const { data, error } = await supabase.rpc('auto_assign_questions', { p_period_id: periodId })
      if (error) throw error
      return data as number
    },
    onSuccess: (count) => {
      qc.invalidateQueries({ queryKey: ['report_periods'] })
      qc.invalidateQueries({ queryKey: ['assignments'] })
      toast.success(`Data collection started — ${count} questions assigned`)
    },
    onError: (e: Error) => toast.error(e.message),
  })
}
