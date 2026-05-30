import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/hooks/useAuth'
import { useCurrentOrg } from '@/lib/hooks/useOrg'

const orgSchema = z.object({
  name:      z.string().min(2, 'Company name required'),
  industry:  z.string().min(1),
  sector:    z.string().min(1),
  listed_on: z.string().min(1),
})
type OrgValues = z.infer<typeof orgSchema>

export function OrgSettingsPage() {
  const { orgId } = useAuth()
  const { data: org, isLoading } = useCurrentOrg()
  const qc = useQueryClient()

  const { register, handleSubmit, setValue, reset, formState: { errors, isSubmitting, isDirty } } = useForm<OrgValues>({
    resolver: zodResolver(orgSchema),
  })

  useEffect(() => {
    if (org) {
      reset({
        name:      org.name,
        industry:  org.industry ?? '',
        sector:    org.sector ?? '',
        listed_on: org.listed_on ?? '',
      })
    }
  }, [org, reset])

  const update = useMutation({
    mutationFn: async (values: OrgValues) => {
      const { error } = await supabase
        .from('organizations')
        .update(values)
        .eq('id', orgId!)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['organization', orgId] })
      toast.success('Organisation settings saved')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  if (isLoading) {
    return (
      <div className="p-6 max-w-2xl space-y-4">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <Building2 className="h-6 w-6 text-muted-foreground" />
        <div>
          <h1 className="text-2xl font-semibold">Organisation</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Edit your company profile</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Company details</CardTitle>
          <CardDescription>This information appears on your ESG reports.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(values => update.mutateAsync(values))} className="space-y-4">
            <div className="space-y-2">
              <Label>Company name *</Label>
              <Input {...register('name')} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Industry</Label>
                <Select value={org?.industry ?? ''} onValueChange={v => setValue('industry', v, { shouldDirty: true })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Manufacturing','IT Services','Pharma','FMCG','Energy','Financial Services','Mining','Construction','Telecom','Other'].map(i => (
                      <SelectItem key={i} value={i}>{i}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sector</Label>
                <Select value={org?.sector ?? ''} onValueChange={v => setValue('sector', v, { shouldDirty: true })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {['Private','PSU','MNC'].map(s => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Listed on</Label>
              <Select value={org?.listed_on ?? ''} onValueChange={v => setValue('listed_on', v, { shouldDirty: true })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {['NSE','BSE','Both','Unlisted'].map(e => (
                    <SelectItem key={e} value={e}>{e}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="pt-2 flex justify-end">
              <Button type="submit" disabled={!isDirty || isSubmitting}>
                {isSubmitting ? 'Saving…' : 'Save changes'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Read-only info */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">Account info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Organisation ID</span>
            <span className="font-mono text-xs">{orgId?.slice(0, 8)}…</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Market cap tier</span>
            <span>{org?.market_cap ?? '—'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Fiscal year start</span>
            <span>Month {org?.fiscal_start ?? 4}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
