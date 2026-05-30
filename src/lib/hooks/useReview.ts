import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'

export function useApprove() {
  const { orgId, user } = useAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (responseId: string) => {
      const { error } = await supabase
        .from('responses')
        .update({
          status:      'approved',
          approved_at: new Date().toISOString(),
          approved_by: user?.id,
        })
        .eq('id', responseId)
        .eq('org_id', orgId!)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews'] })
      qc.invalidateQueries({ queryKey: ['responses'] })
      qc.invalidateQueries({ queryKey: ['response'] })
      qc.invalidateQueries({ queryKey: ['assignments'] })
      toast.success('Response approved')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useReject() {
  const { orgId } = useAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ responseId, reason }: { responseId: string; reason: string }) => {
      const { error } = await supabase
        .from('responses')
        .update({
          status:           'rejected',
          rejection_reason: reason,
        })
        .eq('id', responseId)
        .eq('org_id', orgId!)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['reviews'] })
      qc.invalidateQueries({ queryKey: ['responses'] })
      qc.invalidateQueries({ queryKey: ['response'] })
      qc.invalidateQueries({ queryKey: ['assignments'] })
      toast.success('Response sent back for revision')
    },
    onError: (e: Error) => toast.error(e.message),
  })
}

export function useBulkApprove() {
  const { orgId, user } = useAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (responseIds: string[]) => {
      const { error } = await supabase
        .from('responses')
        .update({
          status:      'approved',
          approved_at: new Date().toISOString(),
          approved_by: user?.id,
        })
        .in('id', responseIds)
        .eq('org_id', orgId!)
      if (error) throw error
    },
    onSuccess: (_data, ids) => {
      qc.invalidateQueries({ queryKey: ['reviews'] })
      qc.invalidateQueries({ queryKey: ['responses'] })
      toast.success(`${ids.length} responses approved`)
    },
    onError: (e: Error) => toast.error(e.message),
  })
}
