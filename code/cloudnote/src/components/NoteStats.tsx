'use client'
// 与第 10 章相同。挂在 notes/layout.tsx 里：从列表点进详情再返回，它不会重新挂载
import { useNotes } from '@/hooks/useNotes'
import { NOTE_STATUSES, STATUS_TEXT } from '@/types'

export function NoteStats() {
  const { notes, loading } = useNotes('all')
  const items = [
    { label: '全部', value: notes.length },
    ...NOTE_STATUSES.map((s) => ({ label: STATUS_TEXT[s], value: notes.filter((n) => n.status === s).length })),
  ]
  return (
    <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4" data-testid="stats">
      {items.map((item) => (
        <div key={item.label} className="rounded-lg border bg-card px-4 py-3">
          <dt className="text-xs text-muted-foreground">{item.label}</dt>
          <dd className="mt-1 text-2xl font-semibold tabular-nums">{loading ? '–' : item.value}</dd>
        </div>
      ))}
    </dl>
  )
}
