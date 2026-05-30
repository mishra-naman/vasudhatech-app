export function calcProgress(total: number, completed: number) {
  return {
    percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
    completed,
    total,
    remaining: Math.max(0, total - completed),
  }
}

export function statusColor(pct: number): string {
  if (pct >= 80) return 'text-emerald-600'
  if (pct >= 50) return 'text-amber-600'
  return 'text-red-600'
}

export function statusBg(pct: number): string {
  if (pct >= 80) return 'bg-emerald-500'
  if (pct >= 50) return 'bg-amber-500'
  return 'bg-red-500'
}
