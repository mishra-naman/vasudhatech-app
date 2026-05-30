import { useNavigate } from 'react-router-dom'
import { AlertCircle, BarChart3, ChevronRight } from 'lucide-react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useFrameworksWithEnabled, useToggleFramework } from '@/lib/hooks/useFrameworks'

const FRAMEWORK_COLORS: Record<string, string> = {
  BRSR: 'bg-orange-500',
  GRI:  'bg-emerald-500',
  TCFD: 'bg-blue-500',
  CSR:  'bg-purple-500',
  SASB: 'bg-yellow-500',
  CDP:  'bg-cyan-500',
}

const FRAMEWORK_DESCRIPTIONS: Record<string, string> = {
  BRSR: 'Business Responsibility and Sustainability Reporting — mandatory for top 1000 listed companies',
  GRI:  'Global Reporting Initiative — widely adopted international sustainability standard',
  TCFD: 'Climate-related financial risk disclosures for investors',
  CSR:  'Corporate Social Responsibility under Companies Act 2013',
  SASB: 'Industry-specific sustainability accounting standards',
  CDP:  'Climate, water and forest impact reporting',
}

export function FrameworksPage() {
  const { data: frameworks, isLoading, error } = useFrameworksWithEnabled()
  const toggle = useToggleFramework()
  const navigate = useNavigate()

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Frameworks</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Browse every framework's principles, indicators and questions. Toggle the ones your
          organisation reports against.
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-44 rounded-xl" />)}
        </div>
      ) : error ? (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Couldn't load frameworks</AlertTitle>
          <AlertDescription>{error instanceof Error ? error.message : 'Please try again.'}</AlertDescription>
        </Alert>
      ) : frameworks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-1">No frameworks available</p>
          <p className="text-sm text-muted-foreground max-w-xs">
            Reference data hasn't been seeded yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {frameworks.map(f => (
            <Card
              key={f.id}
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/frameworks/${f.id}`)}
              onKeyDown={e => { if (e.key === 'Enter') navigate(`/frameworks/${f.id}`) }}
              className="h-full flex flex-col hover:shadow-md transition-shadow cursor-pointer group focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`h-10 w-10 rounded-lg ${FRAMEWORK_COLORS[f.code] ?? 'bg-muted'} flex items-center justify-center mb-3`}>
                    <span className="text-white text-xs font-bold">{f.code.slice(0, 2)}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors mt-1" />
                </div>
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base">{f.code}</CardTitle>
                  {f.enabled && <Badge className="text-[10px] px-1.5">Enabled</Badge>}
                </div>
                <CardDescription className="text-xs">{f.name}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {FRAMEWORK_DESCRIPTIONS[f.code] ?? f.description ?? ''}
                </p>
                <div className="flex items-center justify-between mt-4">
                  <div className="flex items-center gap-2">
                    {f.country && <Badge variant="outline" className="text-[10px] px-1.5">{f.country}</Badge>}
                    <Badge variant="secondary" className="text-[10px] px-1.5">v{f.version}</Badge>
                  </div>
                  {/* Stop click bubbling so toggling doesn't navigate into the framework */}
                  <div
                    className="flex items-center gap-2"
                    onClick={e => e.stopPropagation()}
                    onKeyDown={e => e.stopPropagation()}
                  >
                    <span className="text-[11px] text-muted-foreground">{f.enabled ? 'On' : 'Off'}</span>
                    <Switch
                      checked={f.enabled}
                      disabled={toggle.isPending}
                      onCheckedChange={(checked) => {
                        toggle.mutate(
                          { frameworkId: f.id, enable: checked },
                          { onSuccess: () => toast.success(`${f.code} ${checked ? 'enabled' : 'disabled'}`) },
                        )
                      }}
                      aria-label={`Toggle ${f.code}`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
