import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'

export type FrameworkStat = {
  code:      string
  name:      string
  total:     number
  approved:  number
  submitted: number
  draft:     number
}

export type DeptStat = {
  code:     string
  name:     string
  total:    number
  approved: number
}

export type ActivityItem = {
  id:            string
  status:        string
  submitted_at:  string | null
  updated_at:    string
  question_code: string
  question_text: string
  user_name:     string | null
}

export type DashboardStats = {
  totals: {
    total_assigned: number
    approved:  number
    submitted: number
    draft:     number
    rejected:  number
  }
  by_framework:    FrameworkStat[]
  by_dept:         DeptStat[]
  recent_activity: ActivityItem[]
}

export function useDashboardStats(periodId: string | undefined) {
  const { isAuthenticated } = useAuth()

  return useQuery<DashboardStats | null>({
    queryKey: ['dashboard', 'stats', periodId],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_dashboard_stats', {
        p_period_id: periodId!,
      })
      if (error) throw error
      return data as DashboardStats | null
    },
    enabled: isAuthenticated && !!periodId,
    refetchInterval: 60_000,
  })
}
