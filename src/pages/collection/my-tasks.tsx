import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckSquare, ChevronRight, ClipboardList } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useAuth } from '@/lib/hooks/useAuth'
import { useMyAssignments } from '@/lib/hooks/useAssignments'
import { useReportPeriods } from '@/lib/hooks/useReportPeriods'
import { useSubmitResponse } from '@/lib/hooks/useResponses'
import type { AssignmentWithContext } from '@/lib/hooks/useAssignments'
import type { Database } from '@/lib/types/database'

type AssignmentStatus = Database['public']['Tables']['question_assignments']['Row']['status']
type ResponseStatus   = Database['public']['Tables']['responses']['Row']['status']

const STATUS_COLORS: Record<string, string> = {
  pending:     'bg-muted text-muted-foreground',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  submitted:   'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  approved:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  rejected:    'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
  draft:       'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
}

function effectiveStatus(a: AssignmentWithContext): string {
  const rs = a.response?.status
  if (rs === 'approved')  return 'approved'
  if (rs === 'rejected')  return 'rejected'
  if (rs === 'submitted') return 'submitted'
  if (rs === 'draft')     return 'draft'
  return a.status ?? 'pending'
}

const FILTER_TABS = ['All', 'Pending', 'Draft', 'Submitted', 'Approved', 'Rejected'] as const
type FilterTab = typeof FILTER_TABS[number]

function matchesFilter(a: AssignmentWithContext, tab: FilterTab): boolean {
  if (tab === 'All') return true
  return effectiveStatus(a) === tab.toLowerCase()
}

const RESPONSE_TYPE_ICON: Record<string, string> = {
  text: '📝', number: '🔢', percentage: '%', yes_no: '✓',
  select: '▾', multi_select: '☑', table: '⊞', file_upload: '📎',
  date: '📅', rich_text: '✏️',
}

export function MyTasksPage() {
  const { profile } = useAuth()
  const { data: periods = [], isLoading: periodsLoading } = useReportPeriods()
  const [activePeriodId, setActivePeriodId] = useState<string>('')
  const [activeTab, setActiveTab] = useState<FilterTab>('All')

  const periodId = activePeriodId || periods[0]?.id

  const { data: assignments = [], isLoading: assignLoading } = useMyAssignments(periodId)
  const submit = useSubmitResponse()

  const filtered = assignments.filter(a => matchesFilter(a, activeTab))

  const stats = {
    total:     assignments.length,
    draft:     assignments.filter(a => effectiveStatus(a) === 'draft').length,
    submitted: assignments.filter(a => effectiveStatus(a) === 'submitted').length,
    approved:  assignments.filter(a => effectiveStatus(a) === 'approved').length,
    rejected:  assignments.filter(a => effectiveStatus(a) === 'rejected').length,
  }

  const isLoading = periodsLoading || assignLoading

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">My Tasks</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {profile?.full_name ? `${profile.full_name}'s` : 'Your'} assigned ESG questions
          </p>
        </div>

        {/* Period selector */}
        {periods.length > 0 && (
          <Select value={periodId} onValueChange={setActivePeriodId}>
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

      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Assigned', value: stats.total, color: 'text-foreground' },
          { label: 'Submitted', value: stats.submitted, color: 'text-amber-600' },
          { label: 'Approved', value: stats.approved, color: 'text-emerald-600' },
          { label: 'Need revision', value: stats.rejected, color: 'text-red-600' },
        ].map(s => (
          <div key={s.label} className="rounded-lg border bg-card p-3 text-center">
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 border-b mb-4">
        {FILTER_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors',
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground',
            )}
          >
            {tab}
            {tab !== 'All' && (
              <span className="ml-1.5 text-xs text-muted-foreground">
                {assignments.filter(a => matchesFilter(a, tab)).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
        </div>
      ) : periods.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-1">No active period</p>
          <p className="text-sm text-muted-foreground">Ask your CS Admin to start a data collection period.</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <CheckSquare className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-muted-foreground text-sm">
            {activeTab === 'All'
              ? 'No questions assigned to your department yet.'
              : `No ${activeTab.toLowerCase()} questions.`}
          </p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-28">Code</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Question</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-20">Type</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-28">Status</th>
                <th className="px-4 py-3 w-10" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(a => {
                const es     = effectiveStatus(a)
                const q      = a.question
                return (
                  <tr key={a.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{q.code}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-sm line-clamp-2">{q.text}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {q.indicator.principle.framework.code} · {q.indicator.principle.code}
                      </p>
                      {es === 'rejected' && a.response?.rejection_reason && (
                        <p className="text-xs text-red-600 mt-1 line-clamp-1">
                          ↩ {a.response.rejection_reason}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center text-base" title={q.response_type ?? ''}>
                      {RESPONSE_TYPE_ICON[q.response_type ?? 'text']}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[11px] px-2 py-0.5 rounded font-medium ${STATUS_COLORS[es] ?? ''}`}>
                        {es.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Link to={`/collection/${q.id}`}>
                        <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
