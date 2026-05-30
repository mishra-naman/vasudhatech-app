import { useEffect } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { useAuth } from './useAuth'

// Subscribe to response changes (invalidates dashboard + response caches)
// Subscribe to new notifications (shows toast + invalidates notification cache)
export function useRealtime() {
  const { orgId, user, isAuthenticated } = useAuth()
  const qc = useQueryClient()

  useEffect(() => {
    if (!isAuthenticated || !orgId || !user?.id) return

    const responseChannel = supabase
      .channel(`responses:${orgId}`)
      .on(
        'postgres_changes',
        {
          event:  '*',
          schema: 'public',
          table:  'responses',
          filter: `org_id=eq.${orgId}`,
        },
        () => {
          qc.invalidateQueries({ queryKey: ['response'] })
          qc.invalidateQueries({ queryKey: ['responses'] })
          qc.invalidateQueries({ queryKey: ['reviews'] })
          qc.invalidateQueries({ queryKey: ['assignments'] })
          qc.invalidateQueries({ queryKey: ['dashboard'] })
        },
      )
      .subscribe()

    const notifChannel = supabase
      .channel(`notifications:${user.id}`)
      .on(
        'postgres_changes',
        {
          event:  'INSERT',
          schema: 'public',
          table:  'notifications',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const n = payload.new as { title: string; message: string | null; link: string | null }
          toast(n.title, {
            description: n.message ?? undefined,
            action: n.link
              ? { label: 'View', onClick: () => window.location.href = n.link! }
              : undefined,
          })
          qc.invalidateQueries({ queryKey: ['notifications', user.id] })
          qc.invalidateQueries({ queryKey: ['notifications', 'unread-count', user.id] })
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(responseChannel)
      supabase.removeChannel(notifChannel)
    }
  }, [isAuthenticated, orgId, user?.id, qc])
}
