import { useRef, useState } from 'react'
import { Paperclip, X, Upload, FileText } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/hooks/useAuth'

type Props = {
  value: string | null
  onChange: (url: string | null) => void
  questionCode: string
  periodCode: string
  disabled?: boolean
}

export function FileUploader({ value, onChange, questionCode, periodCode, disabled = false }: Props) {
  const { orgId } = useAuth()
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  async function handleFile(file: File) {
    if (!orgId) return
    setUploading(true)
    try {
      const ext  = file.name.split('.').pop() ?? 'bin'
      const path = `${orgId}/${periodCode}/${questionCode}/${Date.now()}.${ext}`

      const { data, error } = await supabase.storage
        .from('evidence')
        .upload(path, file, { upsert: true })

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage.from('evidence').getPublicUrl(data.path)
      onChange(publicUrl)
      toast.success('File uploaded')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  if (value) {
    const filename = decodeURIComponent(value.split('/').pop() ?? value)
    return (
      <div className="flex items-center gap-2 rounded-md border bg-muted/30 px-3 py-2">
        <FileText className="h-4 w-4 text-muted-foreground shrink-0" />
        <a
          href={value}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-primary hover:underline flex-1 truncate"
        >
          {filename}
        </a>
        {!disabled && (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 shrink-0"
            onClick={() => onChange(null)}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        )}
      </div>
    )
  }

  return (
    <div
      className={`rounded-lg border-2 border-dashed p-6 text-center transition-colors ${
        disabled ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary/40 cursor-pointer'
      }`}
      onDrop={disabled ? undefined : handleDrop}
      onDragOver={e => e.preventDefault()}
      onClick={disabled ? undefined : () => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        disabled={disabled}
        onChange={handleInputChange}
        accept=".pdf,.jpg,.jpeg,.png,.webp,.xls,.xlsx,.doc,.docx,.csv"
      />
      {uploading ? (
        <div className="flex flex-col items-center gap-2">
          <div className="h-5 w-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Uploading…</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">Drop file here or click to browse</p>
            <p className="text-xs text-muted-foreground mt-0.5">PDF, images, Excel, Word, CSV — max 50 MB</p>
          </div>
          <Button variant="outline" size="sm" className="gap-1.5 mt-1" disabled={disabled}>
            <Paperclip className="h-3.5 w-3.5" />
            Attach evidence
          </Button>
        </div>
      )}
    </div>
  )
}
