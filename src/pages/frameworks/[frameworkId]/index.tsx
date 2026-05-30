import { Link, useParams } from 'react-router-dom'
import { ChevronRight, ArrowLeft, Layers, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useFramework, usePrinciples } from '@/lib/hooks/useFrameworks'

const SECTION_COLORS: Record<string, string> = {
  A: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
  B: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
  C: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300',
}

export function FrameworkDetailPage() {
  const { frameworkId } = useParams<{ frameworkId: string }>()
  const { data: framework, isLoading: fwLoading } = useFramework(frameworkId)
  const { data: principles = [], isLoading: pLoading, error: pError } = usePrinciples(frameworkId)

  const isLoading = fwLoading || pLoading

  return (
    <div className="p-6 max-w-4xl">
      {/* Back */}
      <Link to="/frameworks">
        <Button variant="ghost" size="sm" className="gap-1 mb-4 -ml-2">
          <ArrowLeft className="h-4 w-4" />
          Frameworks
        </Button>
      </Link>

      {/* Header */}
      {fwLoading ? (
        <div className="mb-6 space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-80" />
        </div>
      ) : framework ? (
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-2xl font-semibold">{framework.code}</h1>
            <Badge variant="outline">{framework.regulator}</Badge>
            <Badge variant="secondary">v{framework.version}</Badge>
          </div>
          <p className="text-muted-foreground text-sm">{framework.name}</p>
        </div>
      ) : null}

      {/* Principles list */}
      {isLoading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
        </div>
      ) : pError ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Couldn't load principles</AlertTitle>
          <AlertDescription>{pError instanceof Error ? pError.message : 'Please try again.'}</AlertDescription>
        </Alert>
      ) : principles.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <Layers className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No principles found for this framework.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {principles.map((p, idx) => (
            <Link key={p.id} to={`/frameworks/${frameworkId}/${p.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                <CardHeader className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-muted-foreground/30 w-8 shrink-0 text-right">
                      {String(idx + 1).padStart(2, '0')}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <CardTitle className="text-sm font-semibold truncate">{p.code}</CardTitle>
                        {p.section && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${SECTION_COLORS[p.section] ?? 'bg-muted text-muted-foreground'}`}>
                            Section {p.section}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-1">{p.name}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary shrink-0 transition-colors" />
                  </div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
