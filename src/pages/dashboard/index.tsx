import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import {
  CheckCircle2, Clock, AlertCircle, BarChart3,
  Activity, AlertTriangle,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { useAuth } from '@/lib/hooks/useAuth'
import { useDashboardStats } from '@/lib/hooks/useDashboard'
import { useReportPeriods } from '@/lib/hooks/useReportPeriods'
import { calcProgress } from '@/lib/utils/progress'
import type { DashboardStats, FrameworkStat, DeptStat } from '@/lib/hooks/useDashboard'

// ─── StatCard ────────────────────────────────────────────────────────────────

type StatCardProps = {
  label:    string
  value:    number | string
  subtitle?: string
  icon:     React.ElementType
  trend?:   'up' | 'down' | 'neutral'
  color?:   string
}

function StatCard({ label, value, subtitle, icon: Icon, color = 'text-foreground' }: StatCardProps) {
  return (
    <Card>
      <CardContent className="pt-5">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">{label}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className="p-2 rounded-lg bg-muted">
            <Icon className="h-5 w-5 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Framework donut charts ───────────────────────────────────────────────────

const CHART_COLORS = {
  approved:  '#10b981',
  submitted: '#f59e0b',
  draft:     '#3b82f6',
  empty:     '#e5e7eb',
}

function FrameworkDonut({ fw }: { fw: FrameworkStat }) {
  const { percentage } = calcProgress(fw.total, fw.approved)
  const notStarted     = Math.max(0, fw.total - fw.approved - fw.submitted - fw.draft)

  const data = [
    { name: 'Approved',    value: fw.approved,  color: CHART_COLORS.approved },
    { name: 'Submitted',   value: fw.submitted,  color: CHART_COLORS.submitted },
    { name: 'Draft',       value: fw.draft,      color: CHART_COLORS.draft },
    { name: 'Not started', value: notStarted,    color: CHART_COLORS.empty },
  ].filter(d => d.value > 0)

  if (data.length === 0) data.push({ name: 'None', value: 1, color: CHART_COLORS.empty })

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-28 h-28">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={35}
              outerRadius={50}
              dataKey="value"
              strokeWidth={0}
            >
              {data.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-lg font-bold">{percentage}%</span>
        </div>
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold">{fw.code}</p>
        <p className="text-xs text-muted-foreground">{fw.approved}/{fw.total} approved</p>
      </div>
    </div>
  )
}

// ─── Department bar chart ─────────────────────────────────────────────────────

function DeptProgressChart({ depts }: { depts: DeptStat[] }) {
  const data = depts.map(d => ({
    name: d.name.length > 12 ? d.name.slice(0, 12) + '…' : d.name,
    pct:  d.total > 0 ? Math.round((d.approved / d.total) * 100) : 0,
    approved: d.approved,
    total:    d.total,
  }))

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="3 3" horizontal={false} />
        <XAxis type="number" domain={[0, 100]} tickFormatter={v => `${v}%`} tick={{ fontSize: 11 }} />
        <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={90} />
        <Tooltip formatter={(v: number) => [`${v}%`, 'Completion']} />
        <Bar dataKey="pct" fill="#10b981" radius={[0, 4, 4, 0]} maxBarSize={24} />
      </BarChart>
    </ResponsiveContainer>
  )
}

// ─── Activity feed ────────────────────────────────────────────────────────────

const STATUS_ICON = {
  approved:  { icon: CheckCircle2, color: 'text-emerald-500' },
  submitted: { icon: Clock,        color: 'text-amber-500' },
  rejected:  { icon: AlertCircle,  color: 'text-red-500' },
  draft:     { icon: Clock,        color: 'text-blue-500' },
}

function ActivityFeed({ stats }: { stats: DashboardStats }) {
  const activities = stats.recent_activity

  if (activities.length === 0) {
    return <p className="text-sm text-muted-foreground text-center py-8">No recent activity.</p>
  }

  return (
    <div className="space-y-3">
      {activities.map(a => {
        const cfg = STATUS_ICON[a.status as keyof typeof STATUS_ICON] ?? STATUS_ICON.draft
        const Icon = cfg.icon
        return (
          <div key={a.id} className="flex items-start gap-3">
            <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${cfg.color}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium line-clamp-1">{a.question_text}</p>
              <p className="text-xs text-muted-foreground">
                <span className="font-mono">{a.question_code}</span>
                {a.user_name && ` · ${a.user_name}`}
                {' · '}
                {a.updated_at
                  ? formatDistanceToNow(new Date(a.updated_at), { addSuffix: true })
                  : ''}
              </p>
            </div>
            <Badge variant="outline" className="text-[10px] shrink-0">{a.status}</Badge>
          </div>
        )
      })}
    </div>
  )
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyDashboard() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <BarChart3 className="h-14 w-14 text-muted-foreground mb-4" />
      <h2 className="text-xl font-semibold mb-2">No data collection started</h2>
      <p className="text-sm text-muted-foreground max-w-xs">
        Go to <strong>Settings → Report Periods</strong>, create a period, and click{' '}
        <strong>Start data collection</strong> to assign questions to departments.
      </p>
    </div>
  )
}

// ─── Main dashboard ───────────────────────────────────────────────────────────

export function DashboardPage() {
  const { userRole, profile } = useAuth()
  const { data: periods = [], isLoading: periodsLoading } = useReportPeriods()
  const [periodId, setPeriodId] = useState<string>('')

  const activePeriodId = periodId || periods[0]?.id
  const { data: stats, isLoading: statsLoading } = useDashboardStats(activePeriodId)

  const isLoading     = periodsLoading || (!!activePeriodId && statsLoading)
  const isDeptPoc     = userRole === 'dept_poc'
  const hasData       = !!(stats?.totals?.total_assigned && stats.totals.total_assigned > 0)
  const period        = periods.find(p => p.id === activePeriodId)

  const pct = stats
    ? calcProgress(stats.totals.total_assigned, stats.totals.approved).percentage
    : 0

  return (
    <div className="p-6 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">
            {isDeptPoc ? `${profile?.full_name?.split(' ')[0] ?? 'Your'}'s Dashboard` : 'Executive Dashboard'}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {period ? `${period.name} · ${period.status.replace('_', ' ')}` : 'Select a report period'}
          </p>
        </div>

        {periods.length > 1 && (
          <Select value={activePeriodId} onValueChange={setPeriodId}>
            <SelectTrigger className="w-44">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              {periods.map(p => (
                <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {periods.length === 0 ? (
        <EmptyDashboard />
      ) : isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
          </div>
          <div className="grid grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48 rounded-xl" />)}
          </div>
        </div>
      ) : !hasData ? (
        <EmptyDashboard />
      ) : (
        <div className="space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              label="Total questions"
              value={stats!.totals.total_assigned}
              icon={BarChart3}
            />
            <StatCard
              label="Submitted"
              value={stats!.totals.submitted}
              subtitle="Awaiting review"
              icon={Clock}
              color="text-amber-600"
            />
            <StatCard
              label="Approved"
              value={stats!.totals.approved}
              icon={CheckCircle2}
              color="text-emerald-600"
            />
            <StatCard
              label="Overall completion"
              value={`${pct}%`}
              subtitle={`${stats!.totals.approved} of ${stats!.totals.total_assigned}`}
              icon={Activity}
              color={pct >= 80 ? 'text-emerald-600' : pct >= 50 ? 'text-amber-600' : 'text-red-600'}
            />
          </div>

          {/* Framework donuts */}
          {!isDeptPoc && stats!.by_framework.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Framework progress</CardTitle>
                <CardDescription>Approved responses per enabled framework</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-8 justify-center py-2">
                  {stats!.by_framework.map(fw => (
                    <FrameworkDonut key={fw.code} fw={fw} />
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Dept progress + Activity feed */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {!isDeptPoc && stats!.by_dept.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Department completion</CardTitle>
                  <CardDescription>% of questions approved per team</CardDescription>
                </CardHeader>
                <CardContent>
                  <DeptProgressChart depts={stats!.by_dept} />
                </CardContent>
              </Card>
            )}

            <Card className={isDeptPoc || stats!.by_dept.length === 0 ? 'lg:col-span-2' : ''}>
              <CardHeader>
                <CardTitle className="text-base">Recent activity</CardTitle>
                <CardDescription>Latest submissions and approvals</CardDescription>
              </CardHeader>
              <CardContent>
                <ActivityFeed stats={stats!} />
              </CardContent>
            </Card>
          </div>

          {/* Rejected alert */}
          {stats!.totals.rejected > 0 && (
            <div className="flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 dark:bg-red-950/20 p-4">
              <AlertTriangle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-700 dark:text-red-400">
                  {stats!.totals.rejected} response{stats!.totals.rejected !== 1 ? 's' : ''} need revision
                </p>
                <p className="text-xs text-red-600/80 dark:text-red-400/80 mt-0.5">
                  Dept POCs have been notified to re-submit.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
