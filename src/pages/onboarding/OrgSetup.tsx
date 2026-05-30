import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { CheckCircle2, ChevronRight, Building2, BarChart3, Users, Rocket } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/hooks/useAuth'
import { useAllFrameworks } from '@/lib/hooks/useFrameworks'

// ─── Types ──────────────────────────────────────────────────────────────────

type OrgData = {
  name: string
  industry: string
  sector: string
  listed_on: string
  market_cap: string
}

type Department = { code: string; name: string; head_email: string }

const defaultDepts: Department[] = [
  { code: 'HR',    name: 'Human Resources',    head_email: '' },
  { code: 'OPS',   name: 'Operations',         head_email: '' },
  { code: 'FIN',   name: 'Finance',            head_email: '' },
  { code: 'PROC',  name: 'Procurement',        head_email: '' },
  { code: 'IT',    name: 'IT & Security',      head_email: '' },
]

// ─── Step 1 schema ───────────────────────────────────────────────────────────

const step1Schema = z.object({
  name:       z.string().min(2, 'Company name must be at least 2 characters'),
  industry:   z.string().min(1, 'Select an industry'),
  sector:     z.string().min(1, 'Select a sector'),
  listed_on:  z.string().min(1, 'Select a listing status'),
  market_cap: z.string().min(1, 'Select a market cap tier'),
})
type Step1Values = z.infer<typeof step1Schema>

// ─── Step indicator ──────────────────────────────────────────────────────────

const STEPS = [
  { label: 'Company',    icon: Building2 },
  { label: 'Frameworks', icon: BarChart3 },
  { label: 'Teams',      icon: Users },
  { label: 'Launch',     icon: Rocket },
]

function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {STEPS.map((s, i) => {
        const done    = i < current
        const active  = i === current
        const Icon    = s.icon
        return (
          <div key={s.label} className="flex items-center gap-2">
            <div className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors',
              done   ? 'bg-primary text-primary-foreground' :
              active ? 'bg-primary/15 text-primary ring-1 ring-primary' :
                       'bg-muted text-muted-foreground',
            )}>
              {done ? <CheckCircle2 className="h-3 w-3" /> : <Icon className="h-3 w-3" />}
              {s.label}
            </div>
            {i < STEPS.length - 1 && (
              <ChevronRight className="h-3 w-3 text-muted-foreground" />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ─── Step 1: Company info ────────────────────────────────────────────────────

function Step1({ onNext }: { onNext: (data: OrgData) => void }) {
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
  })

  return (
    <form onSubmit={handleSubmit(onNext)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Company name *</Label>
        <Input id="name" placeholder="Acme Industries Ltd" {...register('name')} />
        {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Industry *</Label>
          <Select onValueChange={v => setValue('industry', v)}>
            <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
            <SelectContent>
              {['Manufacturing','IT Services','Pharma','FMCG','Energy','Financial Services','Mining','Construction','Telecom','Other'].map(i => (
                <SelectItem key={i} value={i}>{i}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.industry && <p className="text-xs text-destructive">{errors.industry.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Sector *</Label>
          <Select onValueChange={v => setValue('sector', v)}>
            <SelectTrigger><SelectValue placeholder="Select sector" /></SelectTrigger>
            <SelectContent>
              {['Private','PSU','MNC'].map(s => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.sector && <p className="text-xs text-destructive">{errors.sector.message}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Listed on *</Label>
          <Select onValueChange={v => setValue('listed_on', v)}>
            <SelectTrigger><SelectValue placeholder="Exchange" /></SelectTrigger>
            <SelectContent>
              {['NSE','BSE','Both','Unlisted'].map(e => (
                <SelectItem key={e} value={e}>{e}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.listed_on && <p className="text-xs text-destructive">{errors.listed_on.message}</p>}
        </div>

        <div className="space-y-2">
          <Label>Market cap *</Label>
          <Select onValueChange={v => setValue('market_cap', v)}>
            <SelectTrigger><SelectValue placeholder="Tier" /></SelectTrigger>
            <SelectContent>
              {['Top 150','Top 500','Top 1000','Below 1000','NA'].map(t => (
                <SelectItem key={t} value={t}>{t}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.market_cap && <p className="text-xs text-destructive">{errors.market_cap.message}</p>}
        </div>
      </div>

      {/* Keep unused watch call out of render so TS doesn't complain */}
      <input type="hidden" value={watch('name') ?? ''} />

      <Button type="submit" className="w-full">Continue →</Button>
    </form>
  )
}

// ─── Step 2: Framework selection ─────────────────────────────────────────────

const FRAMEWORK_DESCRIPTIONS: Record<string, string> = {
  BRSR:  'Mandatory for top 1000 listed companies (SEBI)',
  GRI:   'Global standard for sustainability reporting',
  TCFD:  'Climate-related financial risk disclosures',
  CSR:   'CSR reporting under Companies Act 2013',
  SASB:  'Industry-specific sustainability standards',
  CDP:   'Climate, water & forest impact disclosure',
}

function Step2({
  selectedIds,
  onChange,
  onBack,
  onNext,
}: {
  selectedIds: string[]
  onChange: (ids: string[]) => void
  onBack: () => void
  onNext: () => void
}) {
  const { data: frameworks = [], isLoading } = useAllFrameworks()

  function toggle(id: string) {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(x => x !== id))
    } else {
      onChange([...selectedIds, id])
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Select the frameworks your company needs to report against. You can change this later.</p>

      {isLoading ? (
        <div className="grid grid-cols-2 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-24 rounded-lg bg-muted animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {frameworks.map(f => {
            const selected = selectedIds.includes(f.id)
            return (
              <button
                key={f.id}
                type="button"
                onClick={() => toggle(f.id)}
                className={cn(
                  'rounded-lg border p-3 text-left transition-all hover:border-primary/50',
                  selected ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-border bg-card',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm">{f.code}</span>
                      {f.code === 'BRSR' && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Recommended</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground leading-tight">
                      {FRAMEWORK_DESCRIPTIONS[f.code] ?? f.description ?? ''}
                    </p>
                  </div>
                  <div className={cn(
                    'mt-0.5 h-4 w-4 rounded-full border-2 shrink-0',
                    selected ? 'border-primary bg-primary' : 'border-muted-foreground',
                  )} />
                </div>
              </button>
            )
          })}
        </div>
      )}

      {selectedIds.length === 0 && (
        <p className="text-xs text-destructive text-center">Select at least one framework to continue.</p>
      )}

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onBack} className="flex-1">← Back</Button>
        <Button onClick={onNext} disabled={selectedIds.length === 0} className="flex-1">Continue →</Button>
      </div>
    </div>
  )
}

// ─── Step 3: Departments ─────────────────────────────────────────────────────

function Step3({
  departments,
  onChange,
  onBack,
  onNext,
}: {
  departments: Department[]
  onChange: (depts: Department[]) => void
  onBack: () => void
  onNext: () => void
}) {
  function update(index: number, field: keyof Department, value: string) {
    const updated = departments.map((d, i) => i === index ? { ...d, [field]: value } : d)
    onChange(updated)
  }

  function remove(index: number) {
    onChange(departments.filter((_, i) => i !== index))
  }

  function add() {
    const code = `DEPT${departments.length + 1}`
    onChange([...departments, { code, name: '', head_email: '' }])
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Set up the departments that will enter ESG data. Department codes are used to auto-assign questions.</p>

      <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
        {departments.map((dept, i) => (
          <div key={i} className="flex items-center gap-2 rounded-md border bg-card p-2">
            <Input
              className="w-20 shrink-0 text-xs font-mono"
              placeholder="Code"
              value={dept.code}
              onChange={e => update(i, 'code', e.target.value.toUpperCase().slice(0, 8))}
            />
            <Input
              className="flex-1 text-xs"
              placeholder="Department name"
              value={dept.name}
              onChange={e => update(i, 'name', e.target.value)}
            />
            <Input
              className="flex-1 text-xs"
              placeholder="Head email (optional)"
              type="email"
              value={dept.head_email}
              onChange={e => update(i, 'head_email', e.target.value)}
            />
            <Button
              variant="ghost"
              size="sm"
              className="shrink-0 h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
              onClick={() => remove(i)}
              disabled={departments.length <= 1}
            >
              ×
            </Button>
          </div>
        ))}
      </div>

      <Button variant="outline" size="sm" onClick={add} className="w-full text-xs">
        + Add department
      </Button>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onBack} className="flex-1">← Back</Button>
        <Button
          onClick={onNext}
          disabled={departments.some(d => !d.name || !d.code)}
          className="flex-1"
        >
          Continue →
        </Button>
      </div>
    </div>
  )
}

// ─── Step 4: Review & Launch ─────────────────────────────────────────────────

function Step4({
  orgData,
  selectedFrameworkIds,
  departments,
  frameworks,
  onBack,
  onSubmit,
  isSubmitting,
}: {
  orgData: OrgData
  selectedFrameworkIds: string[]
  departments: Department[]
  frameworks: { id: string; code: string; name: string }[]
  onBack: () => void
  onSubmit: () => void
  isSubmitting: boolean
}) {
  const selectedFrameworks = frameworks.filter(f => selectedFrameworkIds.includes(f.id))

  return (
    <div className="space-y-4">
      <div className="rounded-lg border bg-muted/30 p-4 space-y-3">
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Organisation</p>
          <p className="font-medium">{orgData.name}</p>
          <p className="text-sm text-muted-foreground">{orgData.industry} · {orgData.sector} · {orgData.listed_on}</p>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Frameworks ({selectedFrameworks.length})</p>
          <div className="flex flex-wrap gap-1.5">
            {selectedFrameworks.map(f => (
              <Badge key={f.id} variant="secondary">{f.code}</Badge>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1">Departments ({departments.length})</p>
          <p className="text-sm text-muted-foreground">{departments.map(d => d.name).join(' · ')}</p>
        </div>
      </div>

      <p className="text-xs text-muted-foreground text-center">
        A default report period for the current fiscal year will be created automatically.
      </p>

      <div className="flex gap-3 pt-2">
        <Button variant="outline" onClick={onBack} className="flex-1" disabled={isSubmitting}>
          ← Back
        </Button>
        <Button onClick={onSubmit} className="flex-1" disabled={isSubmitting}>
          {isSubmitting ? 'Setting up…' : '🚀 Launch'}
        </Button>
      </div>
    </div>
  )
}

// ─── Main wizard ─────────────────────────────────────────────────────────────

export function OrgSetupPage() {
  const { refreshSession, profile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [orgData, setOrgData] = useState<OrgData | null>(null)
  const [selectedFrameworkIds, setSelectedFrameworkIds] = useState<string[]>([])
  const [departments, setDepartments] = useState<Department[]>(defaultDepts)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const { data: allFrameworks = [] } = useAllFrameworks()

  async function handleLaunch() {
    if (!orgData) return
    setIsSubmitting(true)
    try {
      // Already onboarded: the org exists in the DB but the JWT lacked the
      // org_id claim, so the router sent us here by mistake. Re-creating would
      // trip the RPC's guard, so refresh the token (to pick up org_id) and go
      // straight to the dashboard.
      if (profile?.org_id) {
        await refreshSession()
        toast.message('Your organisation is already set up.')
        navigate('/dashboard', { replace: true })
        return
      }

      const { error } = await supabase.rpc('create_org_for_user', {
        p_org_name:      orgData.name,
        p_industry:      orgData.industry,
        p_sector:        orgData.sector,
        p_listed_on:     orgData.listed_on,
        p_market_cap:    orgData.market_cap,
        p_fiscal_start:  4,
        p_framework_ids: selectedFrameworkIds,
        p_departments:   departments,
      })

      if (error) throw error

      // Refresh JWT so org_id + user_role claims are injected
      await refreshSession()

      toast.success(`Welcome aboard! ${orgData.name} is ready.`)
      navigate('/dashboard', { replace: true })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Setup failed'
      // Belt-and-suspenders: the RPC guard fired because an org already exists.
      // Recover gracefully instead of showing a raw P0001 error.
      if (message.includes('already has an organisation')) {
        await refreshSession()
        toast.message('Your organisation is already set up.')
        navigate('/dashboard', { replace: true })
        return
      }
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const titles = [
    'Tell us about your company',
    'Select ESG frameworks',
    'Set up departments',
    'Review & launch',
  ]

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <div className="w-full max-w-2xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary">
              <span className="text-sm font-bold text-primary-foreground">VT</span>
            </div>
            <span className="text-lg font-semibold">VasudhaTech ESG</span>
          </div>
          <h1 className="text-2xl font-bold">{titles[step]}</h1>
        </div>

        <StepIndicator current={step} />

        <Card>
          <CardHeader>
            <CardDescription>Step {step + 1} of 4</CardDescription>
          </CardHeader>
          <CardContent>
            {step === 0 && (
              <Step1 onNext={(data) => { setOrgData(data); setStep(1) }} />
            )}
            {step === 1 && (
              <Step2
                selectedIds={selectedFrameworkIds}
                onChange={setSelectedFrameworkIds}
                onBack={() => setStep(0)}
                onNext={() => setStep(2)}
              />
            )}
            {step === 2 && (
              <Step3
                departments={departments}
                onChange={setDepartments}
                onBack={() => setStep(1)}
                onNext={() => setStep(3)}
              />
            )}
            {step === 3 && orgData && (
              <Step4
                orgData={orgData}
                selectedFrameworkIds={selectedFrameworkIds}
                departments={departments}
                frameworks={allFrameworks}
                onBack={() => setStep(2)}
                onSubmit={handleLaunch}
                isSubmitting={isSubmitting}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
