import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Plus, GitBranch } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Skeleton } from '@/components/ui/skeleton'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/hooks/useAuth'
import type { Database } from '@/lib/types/database'

type DeptRow = Database['public']['Tables']['org_departments']['Row']

const deptSchema = z.object({
  code:       z.string().min(1).max(8).toUpperCase(),
  name:       z.string().min(2, 'Enter department name'),
  head_name:  z.string().optional(),
  head_email: z.string().email('Enter valid email').optional().or(z.literal('')),
})
type DeptValues = z.infer<typeof deptSchema>

function DeptDialog({
  existing,
  trigger,
  onSuccess,
}: {
  existing?: DeptRow
  trigger: React.ReactNode
  onSuccess: () => void
}) {
  const [open, setOpen] = useState(false)
  const { orgId } = useAuth()
  const qc = useQueryClient()

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<DeptValues>({
    resolver: zodResolver(deptSchema),
    defaultValues: existing
      ? { code: existing.code, name: existing.name, head_name: existing.head_name ?? '', head_email: existing.head_email ?? '' }
      : {},
  })

  async function onSubmit(values: DeptValues) {
    const payload = {
      code:       values.code.toUpperCase(),
      name:       values.name,
      head_name:  values.head_name || null,
      head_email: values.head_email || null,
    }
    if (existing) {
      const { error } = await supabase.from('org_departments').update(payload).eq('id', existing.id)
      if (error) { toast.error(error.message); return }
    } else {
      const { error } = await supabase.from('org_departments').insert({ ...payload, org_id: orgId! })
      if (error) { toast.error(error.message); return }
    }
    qc.invalidateQueries({ queryKey: ['departments', orgId] })
    toast.success(existing ? 'Department updated' : 'Department created')
    reset()
    setOpen(false)
    onSuccess()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{existing ? 'Edit department' : 'Add department'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2">
              <Label>Code *</Label>
              <Input placeholder="HR" className="font-mono uppercase" {...register('code')} />
              {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
            </div>
            <div className="col-span-2 space-y-2">
              <Label>Name *</Label>
              <Input placeholder="Human Resources" {...register('name')} />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
          </div>
          <div className="space-y-2">
            <Label>Head name</Label>
            <Input placeholder="Priya Sharma" {...register('head_name')} />
          </div>
          <div className="space-y-2">
            <Label>Head email</Label>
            <Input type="email" placeholder="priya@company.com" {...register('head_email')} />
            {errors.head_email && <p className="text-xs text-destructive">{errors.head_email.message}</p>}
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancel</Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : existing ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function DepartmentsPage() {
  const { orgId } = useAuth()
  const qc = useQueryClient()

  const { data: depts = [], isLoading, refetch } = useQuery<DeptRow[]>({
    queryKey: ['departments', orgId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('org_departments')
        .select('*')
        .eq('org_id', orgId!)
        .order('code')
      if (error) throw error
      return data ?? []
    },
    enabled: !!orgId,
  })

  const deactivate = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('org_departments').update({ is_active: false }).eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['departments', orgId] })
      toast.success('Department deactivated')
    },
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Departments</h1>
          <p className="text-sm text-muted-foreground mt-1">{depts.filter(d => d.is_active).length} active departments</p>
        </div>
        <DeptDialog
          trigger={
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              Add department
            </Button>
          }
          onSuccess={refetch}
        />
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-14 rounded-lg" />)}
        </div>
      ) : depts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <GitBranch className="h-10 w-10 text-muted-foreground mb-3" />
          <p className="text-muted-foreground text-sm">No departments yet.</p>
        </div>
      ) : (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-24">Code</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Head</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider w-20">Status</th>
                <th className="px-4 py-3 w-24" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {depts.map(d => (
                <tr key={d.id} className={`hover:bg-muted/20 transition-colors ${!d.is_active ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3 font-mono font-medium">{d.code}</td>
                  <td className="px-4 py-3">{d.name}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {d.head_name && <p>{d.head_name}</p>}
                    {d.head_email && <p>{d.head_email}</p>}
                    {!d.head_name && !d.head_email && '—'}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={d.is_active ? 'secondary' : 'outline'} className="text-[10px]">
                      {d.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      <DeptDialog
                        existing={d}
                        trigger={<Button variant="ghost" size="sm" className="h-7 text-xs">Edit</Button>}
                        onSuccess={refetch}
                      />
                      {d.is_active && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs text-muted-foreground"
                          onClick={() => deactivate.mutate(d.id)}
                        >
                          Deactivate
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
