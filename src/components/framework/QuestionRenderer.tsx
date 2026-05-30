import type { Control, FieldValues, Path } from 'react-hook-form'
import { Controller } from 'react-hook-form'
import { HelpCircle, Star, Paperclip } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import type { Database } from '@/lib/types/database'

type QuestionRow    = Database['public']['Tables']['questions']['Row']
type IndicatorRow   = Database['public']['Tables']['indicators']['Row']

type Props<T extends FieldValues> = {
  question: QuestionRow
  indicator?: IndicatorRow | null
  name: Path<T>
  control: Control<T>
  disabled?: boolean
  showMeta?: boolean
}

function FieldWrapper({
  label,
  helpText,
  unit,
  required,
  assurable,
  children,
}: {
  label: string
  helpText?: string | null
  unit?: string | null
  required?: boolean
  assurable?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        <Label className="flex-1 leading-snug text-sm">
          {label}
          {required && <span className="text-destructive ml-0.5">*</span>}
        </Label>
        <div className="flex items-center gap-1 shrink-0">
          {unit && <Badge variant="outline" className="text-[10px] px-1.5">{unit}</Badge>}
          {assurable && <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" title="Assurable KPI" />}
          {helpText && (
            <span title={helpText}>
              <HelpCircle className="h-3.5 w-3.5 text-muted-foreground cursor-help" />
            </span>
          )}
        </div>
      </div>
      {children}
    </div>
  )
}

export function QuestionRenderer<T extends FieldValues>({
  question: q,
  indicator,
  name,
  control,
  disabled = false,
  showMeta = true,
}: Props<T>) {
  const unit = indicator?.unit ?? null

  const wrapperProps = {
    label: q.text,
    helpText: q.help_text,
    unit,
    required: q.is_required ?? false,
    assurable: q.is_assurable ?? false,
  }

  const responseType = q.response_type ?? 'text'

  // Parse options from JSONB (stored as JSON string array)
  function getOptions(): string[] {
    if (!q.options) return []
    if (Array.isArray(q.options)) return q.options as string[]
    if (typeof q.options === 'string') {
      try { return JSON.parse(q.options) as string[] } catch { return [] }
    }
    return []
  }

  if (responseType === 'yes_no') {
    return (
      <FieldWrapper {...wrapperProps}>
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <div className="flex items-center gap-3">
              <Switch
                checked={field.value === 'true' || field.value === true}
                onCheckedChange={v => field.onChange(v ? 'true' : 'false')}
                disabled={disabled}
              />
              <span className="text-sm text-muted-foreground">
                {field.value === 'true' || field.value === true ? 'Yes' : 'No'}
              </span>
            </div>
          )}
        />
      </FieldWrapper>
    )
  }

  if (responseType === 'select') {
    const options = getOptions()
    return (
      <FieldWrapper {...wrapperProps}>
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Select value={field.value ?? ''} onValueChange={field.onChange} disabled={disabled}>
              <SelectTrigger>
                <SelectValue placeholder="Select…" />
              </SelectTrigger>
              <SelectContent>
                {options.map(opt => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
      </FieldWrapper>
    )
  }

  if (responseType === 'multi_select') {
    const options = getOptions()
    return (
      <FieldWrapper {...wrapperProps}>
        <Controller
          name={name}
          control={control}
          render={({ field }) => {
            const selected: string[] = Array.isArray(field.value)
              ? field.value
              : field.value ? [field.value] : []

            function toggle(opt: string) {
              if (selected.includes(opt)) {
                field.onChange(selected.filter(x => x !== opt))
              } else {
                field.onChange([...selected, opt])
              }
            }

            return (
              <div className="space-y-2">
                {options.map(opt => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={selected.includes(opt)}
                      onCheckedChange={() => toggle(opt)}
                      disabled={disabled}
                    />
                    <span className="text-sm">{opt}</span>
                  </label>
                ))}
              </div>
            )
          }}
        />
      </FieldWrapper>
    )
  }

  if (responseType === 'number') {
    return (
      <FieldWrapper {...wrapperProps}>
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <div className="relative">
              <Input
                type="number"
                step="any"
                value={field.value ?? ''}
                onChange={e => field.onChange(e.target.value)}
                disabled={disabled}
                className={unit ? 'pr-16' : ''}
              />
              {unit && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                  {unit}
                </span>
              )}
            </div>
          )}
        />
      </FieldWrapper>
    )
  }

  if (responseType === 'percentage') {
    return (
      <FieldWrapper {...wrapperProps}>
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <div className="relative">
              <Input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={field.value ?? ''}
                onChange={e => field.onChange(e.target.value)}
                disabled={disabled}
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
            </div>
          )}
        />
      </FieldWrapper>
    )
  }

  if (responseType === 'date') {
    return (
      <FieldWrapper {...wrapperProps}>
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Input
              type="date"
              value={field.value ?? ''}
              onChange={e => field.onChange(e.target.value)}
              disabled={disabled}
            />
          )}
        />
      </FieldWrapper>
    )
  }

  if (responseType === 'rich_text') {
    return (
      <FieldWrapper {...wrapperProps}>
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Textarea
              value={field.value ?? ''}
              onChange={e => field.onChange(e.target.value)}
              disabled={disabled}
              rows={5}
              placeholder="Enter your response…"
            />
          )}
        />
      </FieldWrapper>
    )
  }

  if (responseType === 'file_upload') {
    return (
      <FieldWrapper {...wrapperProps}>
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <div className="flex items-center gap-3">
              {field.value ? (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Paperclip className="h-4 w-4" />
                  <span className="truncate max-w-xs">{String(field.value)}</span>
                </div>
              ) : (
                <label className="flex items-center gap-2 cursor-pointer border rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-muted/50 transition-colors">
                  <Paperclip className="h-4 w-4" />
                  Attach file
                  <input
                    type="file"
                    className="hidden"
                    disabled={disabled}
                    onChange={e => {
                      const file = e.target.files?.[0]
                      if (file) field.onChange(file.name)
                    }}
                  />
                </label>
              )}
            </div>
          )}
        />
      </FieldWrapper>
    )
  }

  if (responseType === 'table') {
    return (
      <FieldWrapper {...wrapperProps}>
        <Controller
          name={name}
          control={control}
          render={({ field }) => (
            <Textarea
              value={typeof field.value === 'object' ? JSON.stringify(field.value, null, 2) : (field.value ?? '')}
              onChange={e => field.onChange(e.target.value)}
              disabled={disabled}
              rows={6}
              placeholder='[{"column1": "value1", "column2": "value2"}]'
              className="font-mono text-xs"
            />
          )}
        />
      </FieldWrapper>
    )
  }

  // Default: text
  return (
    <FieldWrapper {...wrapperProps}>
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <Input
            type="text"
            value={field.value ?? ''}
            onChange={e => field.onChange(e.target.value)}
            disabled={disabled}
            placeholder="Enter response…"
          />
        )}
      />
    </FieldWrapper>
  )
}
