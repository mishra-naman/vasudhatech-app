import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/types/database'
import { useAuth } from './useAuth'

type OrgRow = Database['public']['Tables']['organizations']['Row']

export function useCurrentOrg() {
  const { orgId, isAuthenticated } = useAuth()

  return useQuery<OrgRow | null>({
    queryKey: ['organization', orgId],
    queryFn: async () => {
      if (!orgId) return null
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', orgId)
        .single()
      if (error) throw error
      return data
    },
    enabled: isAuthenticated && !!orgId,
    staleTime: 5 * 60 * 1000,
  })
}
