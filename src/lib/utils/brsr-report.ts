import pdfMake from 'pdfmake/build/pdfmake'
import pdfFonts from 'pdfmake/build/vfs_fonts'
import type { TDocumentDefinitions, Content, TableCell } from 'pdfmake/interfaces'
import type { Database } from '@/lib/types/database'

pdfMake.addVirtualFileSystem(pdfFonts)

type OrgRow      = Database['public']['Tables']['organizations']['Row']
type PeriodRow   = Database['public']['Tables']['report_periods']['Row']
type ResponseRow = Database['public']['Tables']['responses']['Row']
type QuestionRow = Database['public']['Tables']['questions']['Row']
type IndicatorRow = Database['public']['Tables']['indicators']['Row']
type PrincipleRow = Database['public']['Tables']['principles']['Row']

export type ReportResponse = ResponseRow & {
  question: QuestionRow & {
    indicator: IndicatorRow & {
      principle: PrincipleRow
    }
  }
}

function cell(text: string, bold = false, fillColor?: string): TableCell {
  return { text, bold, fillColor, fontSize: 9, margin: [4, 3, 4, 3] as [number, number, number, number] }
}

function headerCell(text: string): TableCell {
  return cell(text, true, '#f1f5f9')
}

function principleTable(responses: ReportResponse[]): Content {
  const essential  = responses.filter(r => r.question.indicator.category === 'essential')
  const leadership = responses.filter(r => r.question.indicator.category === 'leadership')

  const rows: TableCell[][] = [
    [headerCell('Indicator'), headerCell('Question'), headerCell('Response'), headerCell('Unit'), headerCell('Status')],
  ]

  function addRows(group: ReportResponse[], label: string) {
    if (group.length === 0) return
    rows.push([{ text: label, bold: true, colSpan: 5, fillColor: '#e2e8f0', fontSize: 9, margin: [4, 3, 4, 3] as [number, number, number, number] }, '', '', '', ''])
    for (const r of group) {
      rows.push([
        cell(r.question.indicator.code),
        { text: r.question.text, fontSize: 8, margin: [4, 3, 4, 3] as [number, number, number, number] },
        { text: r.value ?? '—', fontSize: 8, margin: [4, 3, 4, 3] as [number, number, number, number], italics: !r.value },
        cell(r.question.indicator.unit ?? '—'),
        { text: r.status, fontSize: 8, margin: [4, 3, 4, 3] as [number, number, number, number] },
      ])
    }
  }

  addRows(essential, 'Essential Indicators')
  addRows(leadership, 'Leadership Indicators')

  if (rows.length === 1) return { text: '' }

  return {
    table: {
      headerRows: 1,
      widths: [70, '*', 120, 50, 55],
      body: rows,
    },
    layout: 'lightHorizontalLines',
    margin: [0, 0, 0, 12] as [number, number, number, number],
  }
}

export function generateBRSRReport(
  org:       OrgRow,
  period:    PeriodRow,
  responses: ReportResponse[],
) {
  // Sort responses by principle sort_order, then question sort_order
  const sorted = [...responses].sort((a, b) => {
    const pa = a.question.indicator.principle.sort_order ?? 0
    const pb = b.question.indicator.principle.sort_order ?? 0
    if (pa !== pb) return pa - pb
    return (a.question.sort_order ?? 0) - (b.question.sort_order ?? 0)
  })

  // Group by principle
  const byPrinciple = new Map<string, ReportResponse[]>()
  const principles  = new Map<string, PrincipleRow>()

  for (const r of sorted) {
    const p = r.question.indicator.principle
    if (!byPrinciple.has(p.id)) {
      byPrinciple.set(p.id, [])
      principles.set(p.id, p)
    }
    byPrinciple.get(p.id)!.push(r)
  }

  const sections: Content[] = []

  // Separate by section
  const sectionOrder = ['A', 'B', 'C']
  const grouped: Record<string, { principle: PrincipleRow; responses: ReportResponse[] }[]> = { A: [], B: [], C: [] }

  for (const [pid, ress] of byPrinciple.entries()) {
    const p   = principles.get(pid)!
    const sec = p.section ?? 'C'
    if (!grouped[sec]) grouped[sec] = []
    grouped[sec].push({ principle: p, responses: ress })
  }

  const sectionTitles: Record<string, string> = {
    A: 'Section A: General Disclosures',
    B: 'Section B: Management and Process Disclosures',
    C: 'Section C: Principle-wise Performance Disclosures',
  }

  for (const sec of sectionOrder) {
    const items = grouped[sec]
    if (!items || items.length === 0) continue

    sections.push({ text: sectionTitles[sec], style: 'sectionHeader', margin: [0, 12, 0, 6] as [number, number, number, number] })

    for (const { principle, responses: ress } of items) {
      sections.push({ text: `${principle.code}: ${principle.name}`, style: 'principleHeader', margin: [0, 8, 0, 4] as [number, number, number, number] })
      sections.push(principleTable(ress))
    }
  }

  const totalQ    = responses.length
  const approved  = responses.filter(r => r.status === 'approved').length
  const submitted = responses.filter(r => r.status === 'submitted').length
  const pct       = totalQ > 0 ? Math.round((approved / totalQ) * 100) : 0

  const docDefinition: TDocumentDefinitions = {
    pageMargins: [40, 70, 40, 50],
    header: (_currentPage: number, _pageCount: number) => ({
      columns: [
        { text: org.name, fontSize: 9, color: '#64748b', margin: [40, 20, 0, 0] as [number, number, number, number] },
        { text: `BRSR Report — ${period.name}`, fontSize: 9, color: '#64748b', alignment: 'right', margin: [0, 20, 40, 0] as [number, number, number, number] },
      ],
    }),
    footer: (currentPage: number, pageCount: number) => ({
      text: `Page ${currentPage} of ${pageCount}`,
      alignment: 'center',
      fontSize: 8,
      color: '#94a3b8',
      margin: [0, 10, 0, 0] as [number, number, number, number],
    }),
    content: [
      // Cover
      { text: 'Business Responsibility and\nSustainability Report', style: 'coverTitle' },
      { text: org.name, style: 'coverCompany' },
      { text: period.name, style: 'coverPeriod' },
      {
        columns: [
          { text: `${org.industry ?? '—'} · ${org.sector ?? '—'}`, fontSize: 10, color: '#64748b' },
          { text: `${approved}/${totalQ} responses approved (${pct}%)`, fontSize: 10, color: '#64748b', alignment: 'right' },
        ],
        margin: [0, 4, 0, 24] as [number, number, number, number],
      },
      { canvas: [{ type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#e2e8f0' }] },
      { text: '', margin: [0, 12, 0, 0] as [number, number, number, number] },

      // Summary box
      {
        table: {
          widths: ['*', '*', '*', '*'],
          body: [[
            { text: `${totalQ}\nTotal questions`, alignment: 'center', fontSize: 10 },
            { text: `${approved}\nApproved`, alignment: 'center', fontSize: 10, color: '#059669' },
            { text: `${submitted}\nSubmitted`, alignment: 'center', fontSize: 10, color: '#d97706' },
            { text: `${pct}%\nCompletion`, alignment: 'center', fontSize: 10, bold: true },
          ]],
        },
        layout: 'lightHorizontalLines',
        margin: [0, 0, 0, 24] as [number, number, number, number],
      },

      ...sections,
    ],
    styles: {
      coverTitle:     { fontSize: 26, bold: true, margin: [0, 24, 0, 8] as [number, number, number, number] },
      coverCompany:   { fontSize: 18, color: '#1e293b', margin: [0, 0, 0, 4] as [number, number, number, number] },
      coverPeriod:    { fontSize: 13, color: '#64748b', margin: [0, 0, 0, 16] as [number, number, number, number] },
      sectionHeader:  { fontSize: 14, bold: true, color: '#0f172a' },
      principleHeader:{ fontSize: 11, bold: true, color: '#334155' },
    },
    defaultStyle: { fontSize: 9, color: '#1e293b' },
  }

  const filename = `BRSR-${org.name.replace(/\s+/g, '-')}-${period.code}.pdf`
  pdfMake.createPdf(docDefinition).download(filename)
}
