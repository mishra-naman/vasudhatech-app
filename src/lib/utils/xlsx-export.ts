import * as XLSX from 'xlsx'
import { saveAs } from 'file-saver'
import type { Database } from '@/lib/types/database'

type OrgRow      = Database['public']['Tables']['organizations']['Row']
type PeriodRow   = Database['public']['Tables']['report_periods']['Row']
type ResponseRow = Database['public']['Tables']['responses']['Row']
type QuestionRow = Database['public']['Tables']['questions']['Row']
type IndicatorRow = Database['public']['Tables']['indicators']['Row']
type PrincipleRow = Database['public']['Tables']['principles']['Row']
type ProfileRow  = Database['public']['Tables']['profiles']['Row']

export type ExportResponse = ResponseRow & {
  question: QuestionRow & {
    indicator: IndicatorRow & {
      principle: PrincipleRow
    }
  }
  submitter?: ProfileRow | null
}

type SheetRow = {
  'Principle Code':  string
  'Principle Name':  string
  'Indicator Code':  string
  'Indicator Name':  string
  'Question Code':   string
  'Question':        string
  'Category':        string
  'Unit':            string
  'Response':        string
  'Status':          string
  'Assurable':       string
  'Submitted By':    string
  'Submitted At':    string
  'Notes':           string
}

function autoWidths(ws: XLSX.WorkSheet, rows: SheetRow[]) {
  if (rows.length === 0) return
  const keys = Object.keys(rows[0]) as (keyof SheetRow)[]
  ws['!cols'] = keys.map(k => {
    const maxLen = Math.max(
      k.length,
      ...rows.map(r => String(r[k] ?? '').length),
    )
    return { wch: Math.min(maxLen + 2, 60) }
  })
}

export function exportFrameworkExcel(
  org:           OrgRow,
  period:        PeriodRow,
  responses:     ExportResponse[],
  frameworkCode: string,
) {
  // Group responses by principle
  const byPrinciple = new Map<string, ExportResponse[]>()
  const principles  = new Map<string, PrincipleRow>()

  for (const r of responses) {
    const p = r.question.indicator.principle
    if (!byPrinciple.has(p.id)) {
      byPrinciple.set(p.id, [])
      principles.set(p.id, p)
    }
    byPrinciple.get(p.id)!.push(r)
  }

  // Sort principles by sort_order
  const sorted = [...principles.values()].sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0))

  const wb = XLSX.utils.book_new()

  // One sheet per principle
  for (const principle of sorted) {
    const ress = (byPrinciple.get(principle.id) ?? []).sort((a, b) =>
      (a.question.indicator.sort_order ?? 0) - (b.question.indicator.sort_order ?? 0) ||
      (a.question.sort_order ?? 0) - (b.question.sort_order ?? 0),
    )

    const rows: SheetRow[] = ress.map(r => ({
      'Principle Code':  principle.code,
      'Principle Name':  principle.name,
      'Indicator Code':  r.question.indicator.code,
      'Indicator Name':  r.question.indicator.name,
      'Question Code':   r.question.code,
      'Question':        r.question.text,
      'Category':        r.question.indicator.category ?? '',
      'Unit':            r.question.indicator.unit ?? '',
      'Response':        r.value ?? '',
      'Status':          r.status,
      'Assurable':       r.question.is_assurable ? '★' : '',
      'Submitted By':    r.submitter?.full_name ?? r.submitter?.email ?? '',
      'Submitted At':    r.submitted_at
        ? new Date(r.submitted_at).toLocaleDateString('en-IN')
        : '',
      'Notes':           r.notes ?? '',
    }))

    const ws = XLSX.utils.json_to_sheet(rows)
    autoWidths(ws, rows)

    // Freeze header row
    ws['!freeze'] = { xSplit: 0, ySplit: 1 }

    // Sheet name: principle code (max 31 chars, Excel limit)
    const sheetName = principle.code.slice(0, 31)
    XLSX.utils.book_append_sheet(wb, ws, sheetName)
  }

  // Summary sheet
  const summaryRows = responses.map(r => ({
    'Principle':  r.question.indicator.principle.code,
    'Indicator':  r.question.indicator.code,
    'Question':   r.question.code,
    'Status':     r.status,
    'Value':      r.value ?? '',
  }))
  const summaryWs = XLSX.utils.json_to_sheet(summaryRows)
  XLSX.utils.book_append_sheet(wb, summaryWs, 'All Responses')

  // Generate file
  const wbBytes  = XLSX.write(wb, { bookType: 'xlsx', type: 'array' })
  const blob     = new Blob([wbBytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })
  const filename = `${frameworkCode}-${org.name.replace(/\s+/g, '-')}-${period.code}.xlsx`
  saveAs(blob, filename)
}
