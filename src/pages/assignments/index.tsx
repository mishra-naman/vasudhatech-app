import { useMemo, useState } from 'react'
import { AlertCircle, ClipboardList, Wand2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { useReportPeriods } from '@/lib/hooks/useReportPeriods'
import {
  useAllAssignments,
  useDepartments,
  useAutoAssign,
  useUpdateAssignment,
  useBulkReassign,
  type AssignmentWithContext,
} from '@/lib/hooks/useAssignments'

const STATUS_STYLES: Record<string, string> = {
  pending:     'bg-muted text-muted-foreground',
  in_progress: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  submitted:   'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  approved:    'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  rejected:    'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
}

const STATUS_FILTERS = ['all', 'pending', 'in_progress', 'submitted', 'approved', 'rejected'] as const

function StatusBadge({ status }: { status: string }) {
  return (
    <span className={cn('text-[11px] px-2 py-0.5 rounded-full font-medium capitalize', STATUS_STYLES[status] ?? STATUS_STYLES.pending)}>
      {status.replace('_', ' ')}
    </span>
  )
}

export function AssignmentsPage() {
  const { data: periods = [], isLoading: periodsLoading } = useReportPeriods()
  const [periodId, setPeriodId] = useState<string>('')
  const activePeriodId = periodId || periods[0]?.id

  const { data: assignments = [], isLoading, error } = useAllAssignments(activePeriodId)
  const { data: departments = [] } = useDepartments()
  const autoAssign = useAutoAssign()
  const updateAssignment = useUpdateAssignment()
  const bulkReassign = useBulkReassign()

  const [fwFilter, setFwFilter] = useState('all')
  const [deptFilter, setDeptFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [bulkDept, setBulkDept] = useState('')

  // Distinct frameworks present in the assignments (for the filter dropdown)
  const frameworks = useMemo(() => {
    const map = new Map<string, string>()
    for (const a of assignments) {
      const f = a.question.indicator.principle.framework
      map.set(f.code, f.name)
    }
    return [...map.entries()].map(([code, name]) => ({ code, name }))
  }, [assignments])

  const filtered = useMemo(() => assignments.filter(a => {
    if (fwFilter !== 'all' && a.question.indicator.principle.framework.code !== fwFilter) return false
    if (deptFilter !== 'all' && a.department_id !== deptFilter) return false
    if (statusFilter !== 'all' && (a.status ?? 'pending') !== statusFilter) return false
    return true
  }), [assignments, fwFilter, deptFilter, statusFilter])

  const stats = useMemo(() => {
    const s = { total: assignments.length, pending: 0, in_progress: 0, submitted: 0, approved: 0, rejected: 0 }
    for (const a of assignments) {
      const st = (a.status ?? 'pending') as keyof typeof s
      if (st in s && st !== 'total') s[st]++
    }
    return s
  }, [assignments])

  function toggleRow(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }
  function toggleAll() {
    setSelected(prev => prev.size === filtered.length ? new Set() : new Set(filtered.map(a => a.id)))
  }

  function applyBulkReassign() {
    if (!bulkDept || selected.size === 0) return
    bulkReassign.mutate(
      { ids: [...selected], departmentId: bulkDept },
      { onSuccess: () => { setSelected(new Set()); setBulkDept('') } },
    )
  }

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <ClipboardList className="h-6 w-6 text-muted-foreground" />
          <div>
            <h1 className="text-2xl font-semibold">Question Assignments</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Assign questions to departments for data collection.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Select value={activePeriodId ?? ''} onValueChange={setPeriodId} disabled={periodsLoading}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Select period" /></SelectTrigger>
            <SelectContent>
              {periods.map(p => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button
            onClick={() => activePeriodId && autoAssign.mutate(activePeriodId)}
            disabled={!activePeriodId || autoAssign.isPending}
            className="gap-2"
          >
            <Wand2 className="h-4 w-4" />
            {autoAssign.isPending ? 'Assigning…' : 'Auto-assign all'}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {([
          { label: 'Total', value: stats.total, color: '' },
          { label: 'Pending', value: stats.pending, color: 'text-muted-foreground' },
          { label: 'In progress', value: stats.in_progress, color: 'text-blue-600' },
          { label: 'Submitted', value: stats.submitted, color: 'text-amber-600' },
          { label: 'Approved', value: stats.approved, color: 'text-emerald-600' },
          { label: 'Rejected', value: stats.rejected, color: 'text-red-600' },
        ]).map(s => (
          <div key={s.label} className="rounded-lg border bg-card p-3">
            <p className={cn('text-2xl font-bold', s.color)}>{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <Select value={fwFilter} onValueChange={setFwFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Framework" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All frameworks</SelectItem>
            {frameworks.map(f => <SelectItem key={f.code} value={f.code}>{f.code}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-44"><SelectValue placeholder="Department" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All departments</SelectItem>
            {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            {STATUS_FILTERS.map(s => (
              <SelectItem key={s} value={s} className="capitalize">{s === 'all' ? 'All statuses' : s.replace('_', ' ')}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-3 rounded-lg border bg-muted/40 px-3 py-2">
          <span className="text-sm font-medium">{selected.size} selected</span>
          <span className="text-muted-foreground text-sm">→ reassign to</span>
          <Select value={bulkDept} onValueChange={setBulkDept}>
            <SelectTrigger className="w-44 h-8"><SelectValue placeholder="Department" /></SelectTrigger>
            <SelectContent>
              {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
            </SelectContent>
          </Select>
          <Button size="sm" onClick={applyBulkReassign} disabled={!bulkDept || bulkReassign.isPending}>
            Apply
          </Button>
          <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>Clear</Button>
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="space-y-2">
          {[...Array(8)].map((_, i) => <Skeleton key={i} className="h-12 w-full rounded-md" />)}
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Couldn't load assignments</AlertTitle>
          <AlertDescription>{error instanceof Error ? error.message : 'Please try again.'}</AlertDescription>
        </Alert>
      ) : assignments.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-1">No assignments yet</p>
          <p className="text-sm text-muted-foreground max-w-sm">
            Click <span className="font-medium">Auto-assign all</span> to assign every question in your enabled
            frameworks to departments by their default owner.
          </p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox
                    checked={filtered.length > 0 && selected.size === filtered.length}
                    onCheckedChange={toggleAll}
                    aria-label="Select all"
                  />
                </TableHead>
                <TableHead>Framework</TableHead>
                <TableHead>Principle</TableHead>
                <TableHead>Question</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((a: AssignmentWithContext) => {
                const f = a.question.indicator.principle.framework
                const p = a.question.indicator.principle
                return (
                  <TableRow key={a.id} data-state={selected.has(a.id) ? 'selected' : undefined}>
                    <TableCell>
                      <Checkbox
                        checked={selected.has(a.id)}
                        onCheckedChange={() => toggleRow(a.id)}
                        aria-label="Select row"
                      />
                    </TableCell>
                    <TableCell><Badge variant="outline" className="text-[10px]">{f.code}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[140px] truncate" title={p.name}>{p.code}</TableCell>
                    <TableCell className="max-w-[280px]">
                      <span className="text-xs font-mono text-muted-foreground mr-1">{a.question.code}</span>
                      <span className="text-sm line-clamp-2">{a.question.text}</span>
                    </TableCell>
                    <TableCell>
                      <Select
                        value={a.department_id}
                        onValueChange={(deptId) => updateAssignment.mutate({ id: a.id, department_id: deptId })}
                      >
                        <SelectTrigger className="h-8 w-40 text-xs"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {departments.map(d => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell><StatusBadge status={a.status ?? 'pending'} /></TableCell>
                    <TableCell>
                      <Input
                        type="date"
                        className="h-8 w-36 text-xs"
                        defaultValue={a.due_date ?? ''}
                        onChange={(e) => updateAssignment.mutate({ id: a.id, due_date: e.target.value || null })}
                      />
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
