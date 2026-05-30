import { useState } from 'react'
import { format } from 'date-fns'
import { CheckCircle2, XCircle, ClipboardList } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { useReportPeriods } from '@/lib/hooks/useReportPeriods'
import { usePendingReviews } from '@/lib/hooks/useResponses'
import { useApprove, useBulkApprove, useReject } from '@/lib/hooks/useReview'
import type { ResponseWithContext } from '@/lib/hooks/useResponses'

const RESPONSE_TYPE_ICON: Record<string, string> = {
  text: '📝', number: '🔢', percentage: '%', yes_no: '✓',
  select: '▾', multi_select: '☑', table: '⊞', file_upload: '📎',
  date: '📅', rich_text: '✏️',
}

function ResponsePreview({ response }: { response: ResponseWithContext }) {
  const q  = response.question
  const rt = q.response_type ?? 'text'

  if (rt === 'yes_no') return <span>{response.value === 'true' ? '✓ Yes' : '✗ No'}</span>
  if (rt === 'file_upload') {
    return response.file_url
      ? <a href={response.file_url} target="_blank" rel="noreferrer" className="text-primary hover:underline text-xs">View file ↗</a>
      : <span className="text-muted-foreground">—</span>
  }
  return (
    <span className="text-sm">
      {response.value
        ? (response.value.length > 120 ? response.value.slice(0, 120) + '…' : response.value)
        : <span className="text-muted-foreground">—</span>
      }
    </span>
  )
}

function ReviewSheet({
  response,
  open,
  onClose,
}: {
  response: ResponseWithContext | null
  open: boolean
  onClose: () => void
}) {
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)
  const approve = useApprove()
  const reject  = useReject()

  if (!response) return null

  const q         = response.question
  const indicator = q.indicator
  const principle = indicator.principle
  const framework = principle.framework

  async function handleApprove() {
    await approve.mutateAsync(response.id)
    onClose()
  }

  async function handleReject() {
    if (!rejectReason.trim()) return
    await reject.mutateAsync({ responseId: response.id, reason: rejectReason.trim() })
    setShowRejectForm(false)
    setRejectReason('')
    onClose()
  }

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="text-left pr-8">Review Response</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Breadcrumb */}
          <div className="text-xs text-muted-foreground">
            {framework.code} → {principle.code} → {indicator.code}
          </div>

          {/* Question */}
          <div>
            <p className="text-xs font-mono text-muted-foreground mb-1">{q.code}</p>
            <p className="font-medium leading-snug">{q.text}</p>
            {q.help_text && (
              <p className="text-xs text-muted-foreground mt-1">{q.help_text}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="outline" className="text-[10px]">
                {RESPONSE_TYPE_ICON[q.response_type ?? 'text']} {q.response_type}
              </Badge>
              {q.is_assurable && <Badge variant="secondary" className="text-[10px]">★ Assurable</Badge>}
            </div>
          </div>

          {/* Submitted value */}
          <div className="rounded-lg border p-4">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Submitted response
            </p>
            <div className="text-sm whitespace-pre-wrap break-words">
              <ResponsePreview response={response} />
            </div>
            {response.notes && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs text-muted-foreground mb-1">Notes from submitter:</p>
                <p className="text-sm text-muted-foreground">{response.notes}</p>
              </div>
            )}
            {response.file_url && (
              <div className="mt-3 pt-3 border-t">
                <a href={response.file_url} target="_blank" rel="noreferrer"
                   className="text-sm text-primary hover:underline">
                  📎 View evidence file ↗
                </a>
              </div>
            )}
          </div>

          {/* Metadata */}
          <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
            <div>
              <p className="font-medium">Submitted by</p>
              <p>{response.submitter?.full_name ?? response.submitter?.email ?? '—'}</p>
            </div>
            <div>
              <p className="font-medium">Submitted at</p>
              <p>{response.submitted_at ? format(new Date(response.submitted_at), 'dd MMM yyyy HH:mm') : '—'}</p>
            </div>
          </div>

          {/* Rejection form */}
          {showRejectForm && (
            <div className="space-y-3">
              <Label>Reason for returning (required)</Label>
              <Textarea
                value={rejectReason}
                onChange={e => setRejectReason(e.target.value)}
                placeholder="Explain what needs to be corrected…"
                rows={3}
                autoFocus
              />
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowRejectForm(false)}>
                  Cancel
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 gap-2"
                  disabled={!rejectReason.trim() || reject.isPending}
                  onClick={handleReject}
                >
                  <XCircle className="h-4 w-4" />
                  {reject.isPending ? 'Sending…' : 'Return for revision'}
                </Button>
              </div>
            </div>
          )}

          {/* Action buttons */}
          {!showRejectForm && (
            <div className="flex gap-3 pt-2">
              <Button
                variant="outline"
                className="flex-1 gap-2 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                onClick={() => setShowRejectForm(true)}
              >
                <XCircle className="h-4 w-4" />
                Return for revision
              </Button>
              <Button
                className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700"
                disabled={approve.isPending}
                onClick={handleApprove}
              >
                <CheckCircle2 className="h-4 w-4" />
                {approve.isPending ? 'Approving…' : 'Approve'}
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

export function ReviewPage() {
  const { data: periods = [], isLoading: periodsLoading } = useReportPeriods()
  const [activePeriodId, setActivePeriodId] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [reviewingId, setReviewingId] = useState<string | null>(null)
  const bulkApprove = useBulkApprove()

  const periodId = activePeriodId || periods[0]?.id
  const { data: reviews = [], isLoading: reviewsLoading } = usePendingReviews(periodId)

  const reviewing = reviews.find(r => r.id === reviewingId) ?? null
  const isLoading = periodsLoading || reviewsLoading

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function toggleAll() {
    if (selected.size === reviews.length) {
      setSelected(new Set())
    } else {
      setSelected(new Set(reviews.map(r => r.id)))
    }
  }

  async function handleBulkApprove() {
    await bulkApprove.mutateAsync([...selected])
    setSelected(new Set())
  }

  return (
    <div className="p-6 max-w-6xl">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Review Queue</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {reviews.length} response{reviews.length !== 1 ? 's' : ''} pending review
          </p>
        </div>
        <div className="flex items-center gap-3">
          {selected.size > 0 && (
            <Button
              size="sm"
              className="gap-2 bg-emerald-600 hover:bg-emerald-700"
              disabled={bulkApprove.isPending}
              onClick={handleBulkApprove}
            >
              <CheckCircle2 className="h-4 w-4" />
              Approve {selected.size} selected
            </Button>
          )}
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
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
        </div>
      ) : reviews.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium">All caught up!</p>
          <p className="text-sm text-muted-foreground mt-1">No responses pending review.</p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-4 py-3 w-10">
                  <Checkbox
                    checked={selected.size === reviews.length && reviews.length > 0}
                    onCheckedChange={toggleAll}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Question</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">Framework</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Response preview</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-32">Submitted</th>
                <th className="px-4 py-3 w-24" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {reviews.map(r => (
                <tr
                  key={r.id}
                  className="hover:bg-muted/20 transition-colors cursor-pointer"
                  onClick={() => setReviewingId(r.id)}
                >
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <Checkbox
                      checked={selected.has(r.id)}
                      onCheckedChange={() => toggleSelect(r.id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium line-clamp-2 text-sm">{r.question.text}</p>
                    <p className="text-xs text-muted-foreground mt-0.5 font-mono">{r.question.code}</p>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-[10px]">
                      {r.question.indicator.principle.framework.code}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground line-clamp-2">
                    <ResponsePreview response={r} />
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {r.submitted_at ? format(new Date(r.submitted_at), 'dd MMM HH:mm') : '—'}
                    <br />
                    <span className="text-[10px]">{r.submitter?.full_name ?? '—'}</span>
                  </td>
                  <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 gap-1"
                        onClick={() => useApprove().mutate(r.id)}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ReviewSheet
        response={reviewing}
        open={!!reviewingId}
        onClose={() => setReviewingId(null)}
      />
    </div>
  )
}
