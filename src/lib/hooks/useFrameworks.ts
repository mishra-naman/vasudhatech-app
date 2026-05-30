import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/types/database'
import { useAuth } from './useAuth'

type FrameworkRow    = Database['public']['Tables']['frameworks']['Row']
type PrincipleRow    = Database['public']['Tables']['principles']['Row']
type IndicatorRow    = Database['public']['Tables']['indicators']['Row']
type QuestionRow     = Database['public']['Tables']['questions']['Row']
type OrgFrameworkRow = Database['public']['Tables']['org_frameworks']['Row']

export type FrameworkWithEnabled = FrameworkRow & { enabled: boolean; org_framework_id: string | null }

// All 6 global frameworks (for onboarding step 2)
export function useAllFrameworks() {
  return useQuery<FrameworkRow[]>({
    queryKey: ['frameworks', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('frameworks')
        .select('*')
        .eq('is_active', true)
        .order('code')
      if (error) throw error
      return data ?? []
    },
    staleTime: 10 * 60 * 1000,
  })
}

// Frameworks enabled for the current org (for framework browser)
export function useEnabledFrameworks() {
  const { orgId, isAuthenticated } = useAuth()

  return useQuery<(OrgFrameworkRow & { framework: FrameworkRow })[]>({
    queryKey: ['frameworks', 'enabled', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('org_frameworks')
        .select('*, framework:frameworks(*)')
        .eq('org_id', orgId!)
        .eq('is_active', true)
      if (error) throw error
      return (data ?? []) as (OrgFrameworkRow & { framework: FrameworkRow })[]
    },
    enabled: isAuthenticated && !!orgId,
    staleTime: 5 * 60 * 1000,
  })
}

// All frameworks merged with org's enabled state (for onboarding and settings)
export function useFrameworksWithEnabled() {
  const { orgId, isAuthenticated } = useAuth()
  const allQ  = useAllFrameworks()
  const orgQ  = useEnabledFrameworks()

  const frameworks: FrameworkWithEnabled[] = (allQ.data ?? []).map(f => {
    const orgFw = (orgQ.data ?? []).find(o => o.framework_id === f.id)
    return { ...f, enabled: !!orgFw, org_framework_id: orgFw?.id ?? null }
  })

  return {
    data: frameworks,
    isLoading: allQ.isLoading || (isAuthenticated && !!orgId && orgQ.isLoading),
    error: allQ.error ?? orgQ.error,
  }
}

// Toggle a framework on/off for the org
export function useToggleFramework() {
  const { orgId } = useAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ frameworkId, enable }: { frameworkId: string; enable: boolean }) => {
      if (!orgId) throw new Error('No org')
      if (enable) {
        const { error } = await supabase
          .from('org_frameworks')
          .upsert({ org_id: orgId, framework_id: frameworkId, is_active: true, enabled_at: new Date().toISOString() },
                   { onConflict: 'org_id,framework_id' })
        if (error) throw error
      } else {
        const { error } = await supabase
          .from('org_frameworks')
          .update({ is_active: false })
          .eq('org_id', orgId)
          .eq('framework_id', frameworkId)
        if (error) throw error
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['frameworks', 'enabled', orgId] })
    },
    onError: () => toast.error('Failed to update framework'),
  })
}

// Principles for a framework, ordered by sort_order
export function usePrinciples(frameworkId: string | undefined) {
  return useQuery<PrincipleRow[]>({
    queryKey: ['principles', frameworkId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('principles')
        .select('*')
        .eq('framework_id', frameworkId!)
        .order('sort_order')
      if (error) throw error
      return data ?? []
    },
    enabled: !!frameworkId,
    staleTime: 10 * 60 * 1000,
  })
}

// Indicators for a principle
export function useIndicators(principleId: string | undefined) {
  return useQuery<IndicatorRow[]>({
    queryKey: ['indicators', principleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('indicators')
        .select('*')
        .eq('principle_id', principleId!)
        .order('sort_order')
      if (error) throw error
      return data ?? []
    },
    enabled: !!principleId,
    staleTime: 10 * 60 * 1000,
  })
}

// Questions for an indicator
export function useQuestions(indicatorId: string | undefined) {
  return useQuery<QuestionRow[]>({
    queryKey: ['questions', indicatorId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questions')
        .select('*')
        .eq('indicator_id', indicatorId!)
        .order('sort_order')
      if (error) throw error
      return data ?? []
    },
    enabled: !!indicatorId,
    staleTime: 10 * 60 * 1000,
  })
}

// Single framework by id
export function useFramework(frameworkId: string | undefined) {
  return useQuery<FrameworkRow | null>({
    queryKey: ['framework', frameworkId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('frameworks')
        .select('*')
        .eq('id', frameworkId!)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!frameworkId,
    staleTime: 10 * 60 * 1000,
  })
}

// Single principle by id
export function usePrinciple(principleId: string | undefined) {
  return useQuery<PrincipleRow | null>({
    queryKey: ['principle', principleId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('principles')
        .select('*')
        .eq('id', principleId!)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!principleId,
    staleTime: 10 * 60 * 1000,
  })
}
