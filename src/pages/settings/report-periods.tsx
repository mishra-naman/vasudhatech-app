import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import { CalendarPlus, PlayCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useCreatePeriod,
  useReportPeriods,
  useStartDataCollection,
} from '@/lib/hooks/useReportPeriods'
import type { Database } from '@/lib/types/database'

type PeriodRow = Database['public']['Tables']['report_periods']['Row']

const STATUS_COLORS: Record<string, string> = {
  open:             'bg-muted text-muted-foreground',
  data_collection:  'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  review:           'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300',
  assurance:        'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  filed:            'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
  closed:           'bg-muted text-muted-foreground',
}

const STATUS_LABELS: Record<string, string> = {
  open:            'Open',
  data_collection: 'Data Collection',
  review:          'Review',
  assurance:       'Assurance',
  filed:           'Filed',
  closed:          'Closed',
}

const createSchema = z.object({
  name:       z.string().min(2, 'Enter period name (e.g. FY 2025-26)'),
  code:       z.string().min(2, 'Enter a short code (e.g. FY2025-26)'),
  start_date: z.string().min(1, 'Select start date'),
  end_date:   z.string().min(1, 'Select end date'),
})
type CreateValues = z.infer<typeof createSchema>

function CreatePeriodDialog({ onSuccess }: { onSuccess: () => void }) {
  const [open, setOpen] = useState(false)
  const createPeriod = useCreatePeriod()
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateValues>({
    resolver: zodResolver(createSchema),
  })

  async function onSubmit(values: CreateValues) {
    await createPeriod.mutateAsync(values)
    reset()
    setOpen(false)
    onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <CalendarPlus className="h-4 w-4" />
          New period
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create report period</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Period name</Label>
            <Input placeholder="FY 2025-26" {...register('name')} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="space-y-2">
            <Label>Short code</Label>
            <Input placeholder="FY2025-26" {...register('code')} />
            {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>Start date</Label>
              <Input type="date" {...register('start_date')} />
              {errors.start_date && <p className="text-xs text-destructive">{errors.start_date.message}</p>}
            </div>
            <div className="space-y-2">
              <Label>End date</Label>
              <Input type="date" {...register('end_date')} />
              {errors.end_date && <p className="text-xs text-destructive">{errors.end_date.message}</p>}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={createPeriod.isPending}>
              {createPeriod.isPending ? 'Creating…' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function PeriodRow({ period }: { period: PeriodRow }) {
  const startDC = useStartDataCollection()

  return (
    <tr className="hover:bg-muted/20 transition-colors">
      <td className="px-4 py-3 font-medium">{period.name}</td>
      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{period.code}</td>
      <td className="px-4 py-3 text-sm text-muted-foreground">
        {period.start_date ? format(new Date(period.start_date), 'dd MMM yyyy') : '—'}
        {' → '}
        {period.end_date ? format(new Date(period.end_date), 'dd MMM yyyy') : '—'}
      </td>
      <td className="px-4 py-3">
        <span className={`text-xs px-2 py-0.5 rounded font-medium ${STATUS_COLORS[period.status] ?? ''}`}>
          {STATUS_LABELS[period.status] ?? period.status}
        </span>
      </td>
      <td className="px-4 py-3">
        {period.status === 'open' && (
          <Button
            size="sm"
            variant="outline"
            className="gap-1.5 h-7 text-xs"
            disabled={startDC.isPending}
            onClick={() => startDC.mutate(period.id)}
          >
            <PlayCircle className="h-3.5 w-3.5" />
            Start data collection
          </Button>
        )}
      </td>
    </tr>
  )
}

export function PeriodsPage() {
  const { data: periods = [], isLoading, refetch } = useReportPeriods()

  return (
    <div className="p-6 max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Report Periods</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage fiscal year reporting periods and data collection cycles
          </p>
        </div>
        <CreatePeriodDialog onSuccess={refetch} />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
        </div>
      ) : periods.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <p className="text-muted-foreground text-sm">No report periods yet. Create one to begin data collection.</p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Code</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Dates</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {periods.map(p => <PeriodRow key={p.id} period={p} />)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
