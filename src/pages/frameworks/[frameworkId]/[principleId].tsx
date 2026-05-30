import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, ChevronDown, ChevronRight, HelpCircle, Star } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { useFramework, useIndicators, usePrinciple, useQuestions } from '@/lib/hooks/useFrameworks'
import type { Database } from '@/lib/types/database'

type IndicatorRow = Database['public']['Tables']['indicators']['Row']
type QuestionRow  = Database['public']['Tables']['questions']['Row']

const CATEGORY_BADGE: Record<string, { label: string; className: string }> = {
  essential:      { label: 'Essential',      className: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
  leadership:     { label: 'Leadership',     className: 'bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300' },
  core:           { label: 'Core',           className: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' },
  comprehensive:  { label: 'Comprehensive',  className: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300' },
}

const RESPONSE_TYPE_ICONS: Record<string, string> = {
  text:        '📝',
  number:      '🔢',
  percentage:  '%',
  yes_no:      '✓',
  select:      '▾',
  multi_select:'☑',
  table:       '⊞',
  file_upload: '📎',
  date:        '📅',
  rich_text:   '✏️',
}

function QuestionRow({ q }: { q: QuestionRow }) {
  return (
    <div className="flex items-start gap-3 py-2 px-3 rounded-md hover:bg-muted/50 transition-colors group">
      <span className="text-xs font-mono text-muted-foreground mt-0.5 w-24 shrink-0 truncate">{q.code}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground/90 leading-snug">{q.text}</p>
        {q.help_text && (
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
            <HelpCircle className="h-3 w-3 shrink-0" />
            {q.help_text}
          </p>
        )}
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-[11px] text-muted-foreground" title={q.response_type ?? ''}>
          {RESPONSE_TYPE_ICONS[q.response_type ?? 'text'] ?? '?'}
        </span>
        {q.is_assurable && (
          <Star className="h-3 w-3 text-amber-500 fill-amber-500" title="Assurable KPI" />
        )}
        {q.default_dept && (
          <Badge variant="outline" className="text-[9px] px-1 py-0">{q.default_dept}</Badge>
        )}
      </div>
    </div>
  )
}

function IndicatorAccordion({ indicator }: { indicator: IndicatorRow }) {
  const [open, setOpen] = useState(false)
  const { data: questions = [], isLoading } = useQuestions(open ? indicator.id : undefined)

  const cat = CATEGORY_BADGE[indicator.category ?? 'essential']

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-muted/30 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-xs font-mono text-muted-foreground">{indicator.code}</span>
            {cat && (
              <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${cat.className}`}>
                {cat.label}
              </span>
            )}
            {indicator.unit && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0">{indicator.unit}</Badge>
            )}
          </div>
          <p className="text-sm font-medium">{indicator.name}</p>
        </div>
        {open
          ? <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
          : <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
        }
      </button>

      {open && (
        <div className="border-t bg-muted/10">
          {isLoading ? (
            <div className="p-3 space-y-2">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-8 w-full" />)}
            </div>
          ) : questions.length === 0 ? (
            <p className="text-xs text-muted-foreground p-3">No questions defined.</p>
          ) : (
            <div className="divide-y divide-border/50">
              {questions.map(q => <QuestionRow key={q.id} q={q} />)}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export function PrincipleDetailPage() {
  const { frameworkId, principleId } = useParams<{ frameworkId: string; principleId: string }>()
  const { data: framework } = useFramework(frameworkId)
  const { data: principle, isLoading: pLoading } = usePrinciple(principleId)
  const { data: indicators = [], isLoading: iLoading } = useIndicators(principleId)

  return (
    <div className="p-6 max-w-4xl">
      {/* Breadcrumb */}
      <div className="flex items-center gap-1 text-sm text-muted-foreground mb-4">
        <Link to="/frameworks" className="hover:text-foreground transition-colors">Frameworks</Link>
        <ChevronRight className="h-3 w-3" />
        <Link to={`/frameworks/${frameworkId}`} className="hover:text-foreground transition-colors">
          {framework?.code ?? '…'}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{principle?.code ?? '…'}</span>
      </div>

      <Link to={`/frameworks/${frameworkId}`}>
        <Button variant="ghost" size="sm" className="gap-1 mb-4 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          {framework?.code ?? 'Framework'}
        </Button>
      </Link>

      {/* Principle header */}
      {pLoading ? (
        <div className="mb-6 space-y-2">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-4 w-full" />
        </div>
      ) : principle && (
        <div className="mb-6">
          <h1 className="text-xl font-semibold mb-1">{principle.code}</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">{principle.name}</p>
          {principle.description && (
            <p className="text-xs text-muted-foreground mt-2 max-w-2xl">{principle.description}</p>
          )}
        </div>
      )}

      {/* Indicators */}
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
          Indicators
        </h2>
        <span className="text-xs text-muted-foreground">{indicators.length} total · click to expand questions</span>
      </div>

      {iLoading ? (
        <div className="space-y-2">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
        </div>
      ) : indicators.length === 0 ? (
        <p className="text-muted-foreground text-sm">No indicators found.</p>
      ) : (
        <div className="space-y-2">
          {indicators.map(ind => (
            <IndicatorAccordion key={ind.id} indicator={ind} />
          ))}
        </div>
      )}
    </div>
  )
}
