import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/types/database'
import { useAuth } from './useAuth'

type NotificationRow = Database['public']['Tables']['notifications']['Row']

export function useNotifications(limit = 20) {
  const { user, isAuthenticated } = useAuth()

  return useQuery<NotificationRow[]>({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(limit)
      if (error) throw error
      return data ?? []
    },
    enabled: isAuthenticated && !!user?.id,
    refetchInterval: 30_000,
  })
}

export function useUnreadCount() {
  const { user, isAuthenticated } = useAuth()

  return useQuery<number>({
    queryKey: ['notifications', 'unread-count', user?.id],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user!.id)
        .eq('is_read', false)
      if (error) throw error
      return count ?? 0
    },
    enabled: isAuthenticated && !!user?.id,
    refetchInterval: 30_000,
  })
}

export function useMarkRead() {
  const { user } = useAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id)
        .eq('user_id', user!.id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications', user?.id] })
      qc.invalidateQueries({ queryKey: ['notifications', 'unread-count', user?.id] })
    },
  })
}

export function useMarkAllRead() {
  const { user } = useAuth()
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user!.id)
        .eq('is_read', false)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['notifications', user?.id] })
      qc.invalidateQueries({ queryKey: ['notifications', 'unread-count', user?.id] })
    },
  })
}
