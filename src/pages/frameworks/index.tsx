import { Link } from 'react-router-dom'
import { BarChart3, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useEnabledFrameworks } from '@/lib/hooks/useFrameworks'

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
  const { data: orgFrameworks = [], isLoading } = useEnabledFrameworks()

  if (isLoading) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-6">Frameworks</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
      </div>
    )
  }

  if (orgFrameworks.length === 0) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-semibold mb-6">Frameworks</h1>
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BarChart3 className="h-12 w-12 text-muted-foreground mb-4" />
          <p className="text-lg font-medium mb-1">No frameworks enabled</p>
          <p className="text-sm text-muted-foreground max-w-xs">
            Enable frameworks in Settings to start collecting ESG data.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold">Frameworks</h1>
        <p className="text-muted-foreground text-sm mt-1">
          {orgFrameworks.length} framework{orgFrameworks.length !== 1 ? 's' : ''} enabled for your organisation
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {orgFrameworks.map(({ framework: f }) => (
          <Link key={f.id} to={`/frameworks/${f.id}`}>
            <Card className="h-full hover:shadow-md transition-shadow cursor-pointer group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className={`h-10 w-10 rounded-lg ${FRAMEWORK_COLORS[f.code] ?? 'bg-muted'} flex items-center justify-center mb-3`}>
                    <span className="text-white text-xs font-bold">{f.code.slice(0, 2)}</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors mt-1" />
                </div>
                <CardTitle className="text-base">{f.code}</CardTitle>
                <CardDescription className="text-xs">{f.name}</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {FRAMEWORK_DESCRIPTIONS[f.code] ?? f.description ?? ''}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  {f.country && (
                    <Badge variant="outline" className="text-[10px] px-1.5">{f.country}</Badge>
                  )}
                  {f.regulator && (
                    <Badge variant="outline" className="text-[10px] px-1.5">{f.regulator}</Badge>
                  )}
                  <Badge variant="secondary" className="text-[10px] px-1.5">v{f.version}</Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
