import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import { ArrowLeft, ChevronRight, AlertCircle, Clock, CheckCircle2, Link2 } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { Textarea } from '@/components/ui/textarea'
import { supabase } from '@/lib/supabase'
import { useActivePeriod, useReportPeriods } from '@/lib/hooks/useReportPeriods'
import { useResponse, useSaveDraft, useSubmitResponse } from '@/lib/hooks/useResponses'
import { useAutoPopulate, useLinkedQuestions } from '@/lib/hooks/useCrossMapping'
import { QuestionRenderer } from '@/components/framework/QuestionRenderer'
import { FileUploader } from '@/components/collection/FileUploader'
import type { Database } from '@/lib/types/database'

type QuestionRow   = Database['public']['Tables']['questions']['Row']
type IndicatorRow  = Database['public']['Tables']['indicators']['Row']
type PrincipleRow  = Database['public']['Tables']['principles']['Row']
type FrameworkRow  = Database['public']['Tables']['frameworks']['Row']

type QuestionWithContext = QuestionRow & {
  indicator: IndicatorRow & {
    principle: PrincipleRow & { framework: FrameworkRow }
  }
}

type FormValues = {
  value:     string
  notes:     string
  file_url:  string
}

const STATUS_CONFIG = {
  draft:     { color: 'text-blue-600',     icon: Clock,          label: 'Draft' },
  submitted: { color: 'text-amber-600',    icon: Clock,          label: 'Submitted for review' },
  approved:  { color: 'text-emerald-600',  icon: CheckCircle2,   label: 'Approved' },
  rejected:  { color: 'text-red-600',      icon: AlertCircle,    label: 'Needs revision' },
} as const

function useQuestionWithContext(questionId: string | undefined) {
  return useQuery<QuestionWithContext | null>({
    queryKey: ['question-context', questionId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('questions')
        .select(`
          *,
          indicator:indicators!inner(
            *,
            principle:principles!inner(
              *,
              framework:frameworks!inner(*)
            )
          )
        `)
        .eq('id', questionId!)
        .single()
      if (error) throw error
      return data as unknown as QuestionWithContext
    },
    enabled: !!questionId,
    staleTime: 10 * 60 * 1000,
  })
}

export function QuestionPage() {
  const { questionId } = useParams<{ questionId: string }>()

  const { data: q, isLoading: qLoading }       = useQuestionWithContext(questionId)
  const { data: period }                        = useActivePeriod()
  const { data: periods = [] }                  = useReportPeriods()
  const { data: response, isLoading: rLoading } = useResponse(questionId, period?.id)

  const saveDraft      = useSaveDraft()
  const submit         = useSubmitResponse()
  const autoPopulate   = useAutoPopulate()
  const { data: linked } = useLinkedQuestions(questionId)
  const [autoFilled, setAutoFilled] = useState(0)

  const { control, handleSubmit, reset, watch, setValue } = useForm<FormValues>({
    defaultValues: { value: '', notes: '', file_url: '' },
  })

  // Populate form when response loads
  useEffect(() => {
    if (response) {
      reset({
        value:    response.value ?? '',
        notes:    response.notes ?? '',
        file_url: response.file_url ?? '',
      })
    }
  }, [response, reset])

  const fileUrl = watch('file_url')

  const isReadOnly = response?.status === 'approved' || response?.status === 'submitted'
  const canSubmit  = !!response?.id && response.status === 'draft'
  const isLoading  = qLoading || rLoading

  async function onSaveDraft(values: FormValues) {
    if (!questionId || !period?.id) {
      toast.error('No active report period found')
      return
    }
    const numeric = parseFloat(values.value)
    const numericVal = isNaN(numeric) ? null : numeric
    await saveDraft.mutateAsync({
      question_id:      questionId,
      report_period_id: period.id,
      value:            values.value,
      numeric_value:    numericVal,
      notes:            values.notes || null,
      file_url:         values.file_url || null,
    })
    // Auto-populate linked questions (best-effort, silent on error)
    if (linked && linked.linked_question_ids.length > 0) {
      const count = await autoPopulate.mutateAsync({
        questionId,
        periodId:    period.id,
        value:       values.value,
        numericValue: numericVal,
      })
      setAutoFilled(count)
    }
    toast.success('Draft saved')
  }

  async function onSubmit() {
    if (!response?.id) return
    await submit.mutateAsync(response.id)
  }

  const indicator = q?.indicator
  const principle = indicator?.principle
  const framework = principle?.framework

  // Previous year period (second in the list)
  const prevPeriod = periods[1]

  return (
    <div className="p-6 max-w-3xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4 flex-wrap">
        <Link to="/collection/tasks" className="hover:text-foreground transition-colors">My Tasks</Link>
        {framework && (
          <>
            <ChevronRight className="h-3 w-3" />
            <Link to={`/frameworks/${framework.id}`} className="hover:text-foreground transition-colors">
              {framework.code}
            </Link>
          </>
        )}
        {principle && (
          <>
            <ChevronRight className="h-3 w-3" />
            <Link to={`/frameworks/${framework?.id}/${principle.id}`} className="hover:text-foreground transition-colors">
              {principle.code}
            </Link>
          </>
        )}
        {q && (
          <>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-mono text-xs">{q.code}</span>
          </>
        )}
      </div>

      <Link to="/collection/tasks">
        <Button variant="ghost" size="sm" className="gap-1 -ml-2 mb-4">
          <ArrowLeft className="h-4 w-4" />
          My Tasks
        </Button>
      </Link>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : !q ? (
        <p className="text-muted-foreground">Question not found.</p>
      ) : (
        <>
          {/* Question header */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="font-mono text-xs text-muted-foreground">{q.code}</span>
              {indicator && <Badge variant="outline" className="text-[10px]">{indicator.category}</Badge>}
              {q.is_assurable && <Badge variant="secondary" className="text-[10px]">★ Assurable KPI</Badge>}
              {q.is_required && <Badge variant="outline" className="text-[10px] text-red-600 border-red-200">Required</Badge>}
              {linked && linked.linked_question_ids.length > 0 && (
                <Badge variant="outline" className="text-[10px] gap-1 text-blue-600 border-blue-200">
                  <Link2 className="h-2.5 w-2.5" />
                  Cross-mapped · {linked.linked_question_ids.length} frameworks
                </Badge>
              )}
            </div>
            <h1 className="text-xl font-semibold leading-snug mb-1">{q.text}</h1>
            {q.help_text && (
              <p className="text-sm text-muted-foreground">{q.help_text}</p>
            )}
          </div>

          {/* Status / rejection reason */}
          {response?.status && response.status !== 'draft' && (
            <div className="mb-6">
              {response.status === 'rejected' && response.rejection_reason ? (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Returned for revision:</strong> {response.rejection_reason}
                  </AlertDescription>
                </Alert>
              ) : (
                <div className={`flex items-center gap-2 text-sm font-medium ${STATUS_CONFIG[response.status as keyof typeof STATUS_CONFIG]?.color ?? ''}`}>
                  {STATUS_CONFIG[response.status as keyof typeof STATUS_CONFIG]?.label ?? response.status}
                </div>
              )}
            </div>
          )}

          {/* No active period warning */}
          {!period && (
            <Alert className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No active report period. Ask your CS Admin to start data collection.
              </AlertDescription>
            </Alert>
          )}

          {/* Previous year reference */}
          {prevPeriod && (
            <Card className="mb-6 bg-muted/30">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-xs text-muted-foreground uppercase tracking-wider">
                  Previous year ({prevPeriod.name}) — for reference
                </CardTitle>
              </CardHeader>
              <CardContent className="py-2 px-4">
                <p className="text-sm">
                  {response?.value ? '—' : 'No previous response'}
                </p>
              </CardContent>
            </Card>
          )}

          {/* Response form */}
          <form onSubmit={handleSubmit(onSaveDraft)} className="space-y-6">
            <QuestionRenderer
              question={q}
              indicator={indicator}
              name="value"
              control={control}
              disabled={isReadOnly}
              showMeta
            />

            {/* Evidence */}
            <div className="space-y-2">
              <Label>Evidence file (optional)</Label>
              <FileUploader
                value={fileUrl || null}
                onChange={url => setValue('file_url', url ?? '')}
                questionCode={q.code}
                periodCode={period?.code ?? 'draft'}
                disabled={isReadOnly}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes (optional)</Label>
              <Textarea
                id="notes"
                {...(control as unknown as { register: unknown })}
                value={watch('notes')}
                onChange={e => setValue('notes', e.target.value)}
                placeholder="Add context, assumptions, or data sources…"
                rows={3}
                disabled={isReadOnly}
              />
            </div>

            {/* Auto-fill notification */}
            {autoFilled > 0 && (
              <div className="flex items-center gap-2 rounded-md border border-blue-200 bg-blue-50 dark:bg-blue-950/20 px-3 py-2 text-sm text-blue-700 dark:text-blue-300">
                <Link2 className="h-4 w-4 shrink-0" />
                Auto-filled {autoFilled} linked question{autoFilled !== 1 ? 's' : ''} in other frameworks
              </div>
            )}

            {/* Actions */}
            {!isReadOnly && period && (
              <div className="flex gap-3 pt-2">
                <Button
                  type="submit"
                  variant="outline"
                  className="flex-1"
                  disabled={saveDraft.isPending}
                >
                  {saveDraft.isPending ? 'Saving…' : 'Save draft'}
                </Button>
                <Button
                  type="button"
                  className="flex-1"
                  disabled={!canSubmit || submit.isPending}
                  onClick={onSubmit}
                >
                  {submit.isPending ? 'Submitting…' : 'Submit for review'}
                </Button>
              </div>
            )}

            {isReadOnly && response?.status === 'submitted' && (
              <p className="text-sm text-muted-foreground text-center">
                Awaiting review from your CS Admin.
              </p>
            )}
          </form>
        </>
      )}
    </div>
  )
}
