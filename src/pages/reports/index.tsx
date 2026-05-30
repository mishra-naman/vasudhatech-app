import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { toast } from 'sonner'
import { FileText, Download, Sheet, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/hooks/useAuth'
import { useEnabledFrameworks } from '@/lib/hooks/useFrameworks'
import { useReportPeriods } from '@/lib/hooks/useReportPeriods'
import { useCurrentOrg } from '@/lib/hooks/useOrg'
import { generateBRSRReport, type ReportResponse } from '@/lib/utils/brsr-report'
import { exportFrameworkExcel, type ExportResponse } from '@/lib/utils/xlsx-export'
import type { Database } from '@/lib/types/database'

type OrgRow = Database['public']['Tables']['organizations']['Row']

// Fetch all responses for a framework + period with full context
async function fetchReportResponses(
  orgId: string,
  periodId: string,
  frameworkCode: string,
) {
  const { data, error } = await supabase
    .from('responses')
    .select(`
      *,
      question:questions!inner(
        *,
        indicator:indicators!inner(
          *,
          principle:principles!inner(
            *,
            framework:frameworks!inner(code)
          )
        )
      ),
      submitter:profiles!user_id(*)
    `)
    .eq('org_id', orgId)
    .eq('report_period_id', periodId)

  if (error) throw error

  // Filter by framework code in JS (can't filter on nested joins directly)
  const filtered = (data ?? []).filter(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (r: any) => r.question?.indicator?.principle?.framework?.code === frameworkCode,
  )

  return filtered as unknown as ReportResponse[]
}

function ReportStats({ responses }: { responses: ReportResponse[] }) {
  const total     = responses.length
  const approved  = responses.filter(r => r.status === 'approved').length
  const submitted = responses.filter(r => r.status === 'submitted').length
  const draft     = responses.filter(r => r.status === 'draft').length

  return (
    <div className="grid grid-cols-4 gap-3 mt-4">
      {[
        { label: 'Total responses', value: total },
        { label: 'Approved',        value: approved,  color: 'text-emerald-600' },
        { label: 'Submitted',       value: submitted, color: 'text-amber-600' },
        { label: 'Draft',           value: draft,     color: 'text-blue-600' },
      ].map(s => (
        <div key={s.label} className="rounded-lg border bg-muted/30 p-3 text-center">
          <p className={`text-xl font-bold ${s.color ?? ''}`}>{s.value}</p>
          <p className="text-xs text-muted-foreground">{s.label}</p>
        </div>
      ))}
    </div>
  )
}

export function ReportsPage() {
  const { orgId } = useAuth()
  const { data: org }              = useCurrentOrg()
  const { data: periods = [] }     = useReportPeriods()
  const { data: orgFrameworks = [] } = useEnabledFrameworks()

  const [frameworkId, setFrameworkId] = useState('')
  const [periodId,    setPeriodId]    = useState('')
  const [generating,  setGenerating]  = useState<'pdf' | 'xlsx' | null>(null)

  const selectedFramework = orgFrameworks.find(of => of.framework_id === frameworkId)?.framework
  const selectedPeriod    = periods.find(p => p.id === periodId)

  const canFetch = !!orgId && !!frameworkId && !!periodId

  const { data: responses = [], isLoading: rLoading } = useQuery<ReportResponse[]>({
    queryKey: ['report-responses', orgId, periodId, selectedFramework?.code],
    queryFn: () => fetchReportResponses(orgId!, periodId, selectedFramework!.code),
    enabled: canFetch && !!selectedFramework,
  })

  const approvedOnly  = responses.filter(r => r.status === 'approved')
  const isBRSR        = selectedFramework?.code === 'BRSR'

  async function handlePDF() {
    if (!org || !selectedPeriod || approvedOnly.length === 0) return
    setGenerating('pdf')
    try {
      generateBRSRReport(org as OrgRow, selectedPeriod, approvedOnly as ReportResponse[])
      toast.success('BRSR PDF downloaded')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'PDF generation failed')
    } finally {
      setGenerating(null)
    }
  }

  async function handleExcel() {
    if (!org || !selectedPeriod || !selectedFramework || responses.length === 0) return
    setGenerating('xlsx')
    try {
      exportFrameworkExcel(
        org as OrgRow,
        selectedPeriod,
        responses as ExportResponse[],
        selectedFramework.code,
      )
      toast.success('Excel file downloaded')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Excel export failed')
    } finally {
      setGenerating(null)
    }
  }

  return (
    <div className="p-6 max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Reports</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Generate and download PDF and Excel reports for any framework and reporting period
        </p>
      </div>

      {/* Selectors */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-base">Select report</CardTitle>
          <CardDescription>Choose a framework and period, then download.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Framework</label>
              <Select value={frameworkId} onValueChange={setFrameworkId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select framework" />
                </SelectTrigger>
                <SelectContent>
                  {orgFrameworks.map(of => (
                    <SelectItem key={of.framework_id} value={of.framework_id}>
                      {of.framework.code} — {of.framework.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Report period</label>
              <Select value={periodId} onValueChange={setPeriodId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select period" />
                </SelectTrigger>
                <SelectContent>
                  {periods.map(p => (
                    <SelectItem key={p.id} value={p.id}>
                      {p.name}
                      <Badge variant="outline" className="ml-2 text-[9px]">{p.status}</Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Response stats */}
          {rLoading && canFetch && (
            <div className="grid grid-cols-4 gap-3 mt-4">
              {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
            </div>
          )}
          {!rLoading && canFetch && responses.length > 0 && (
            <ReportStats responses={responses} />
          )}
          {!rLoading && canFetch && responses.length === 0 && (
            <Alert className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No responses found for this framework and period. Start data collection first.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Download buttons */}
      {canFetch && responses.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* PDF — BRSR only */}
          <Card className={!isBRSR ? 'opacity-50' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-red-100 dark:bg-red-950">
                  <FileText className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">PDF Report</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {isBRSR
                      ? `${approvedOnly.length} approved responses · all 3 sections`
                      : 'PDF export is only available for BRSR'}
                  </p>
                  <Button
                    className="mt-3 gap-2"
                    size="sm"
                    disabled={!isBRSR || approvedOnly.length === 0 || generating === 'pdf'}
                    onClick={handlePDF}
                  >
                    <Download className="h-4 w-4" />
                    {generating === 'pdf' ? 'Generating…' : 'Download PDF'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Excel — all frameworks */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-950">
                  <Sheet className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Excel Export</p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {responses.length} responses · one sheet per principle
                  </p>
                  <Button
                    className="mt-3 gap-2"
                    size="sm"
                    variant="outline"
                    disabled={generating === 'xlsx'}
                    onClick={handleExcel}
                  >
                    <Download className="h-4 w-4" />
                    {generating === 'xlsx' ? 'Generating…' : 'Download Excel'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
