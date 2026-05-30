import { formatDistanceToNow } from 'date-fns'
import { Bell, CheckCheck, CheckCircle2, AlertCircle, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import {
  useMarkAllRead,
  useMarkRead,
  useNotifications,
  useUnreadCount,
} from '@/lib/hooks/useNotifications'
import type { Database } from '@/lib/types/database'

type NotificationRow = Database['public']['Tables']['notifications']['Row']

const TYPE_ICON: Record<string, { icon: React.ElementType; color: string }> = {
  approved: { icon: CheckCircle2, color: 'text-emerald-500' },
  rejected: { icon: AlertCircle,  color: 'text-red-500' },
  assigned: { icon: Clock,        color: 'text-blue-500' },
}

function NotifItem({ n }: { n: NotificationRow }) {
  const markRead = useMarkRead()
  const cfg      = TYPE_ICON[n.type ?? ''] ?? { icon: Bell, color: 'text-muted-foreground' }
  const Icon     = cfg.icon

  function handleClick() {
    if (!n.is_read) markRead.mutate(n.id)
    if (n.link) window.location.href = n.link
  }

  return (
    <button
      onClick={handleClick}
      className={cn(
        'w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-muted/50 transition-colors',
        !n.is_read && 'bg-primary/5',
      )}
    >
      <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${cfg.color}`} />
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm leading-snug', !n.is_read && 'font-medium')}>{n.title}</p>
        {n.message && (
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
        )}
        <p className="text-xs text-muted-foreground mt-1">
          {n.created_at
            ? formatDistanceToNow(new Date(n.created_at), { addSuffix: true })
            : ''}
        </p>
      </div>
      {!n.is_read && (
        <div className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1.5" />
      )}
    </button>
  )
}

export function NotificationBell() {
  const { data: notifications = [], isLoading } = useNotifications()
  const { data: unreadCount = 0 }               = useUnreadCount()
  const markAll                                  = useMarkAllRead()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 flex items-center justify-center text-[10px] leading-none">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </PopoverTrigger>

      <PopoverContent align="end" className="w-80 p-0">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <p className="text-sm font-semibold">Notifications</p>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="gap-1 h-7 text-xs text-muted-foreground"
              onClick={() => markAll.mutate()}
              disabled={markAll.isPending}
            >
              <CheckCheck className="h-3 w-3" />
              Mark all read
            </Button>
          )}
        </div>

        {/* List */}
        <ScrollArea className="max-h-80">
          {isLoading ? (
            <div className="p-4 space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-4 w-4 rounded-full mt-0.5" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center px-4">
              <Bell className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map(n => <NotifItem key={n.id} n={n} />)}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
