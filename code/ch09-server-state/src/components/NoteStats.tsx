// 统计栏：和列表一样调用 useNotes('all')。查询键相同 => 共享同一份缓存，只发一次请求
import { useNotes } from '../hooks/useNotes'
import { NOTE_STATUSES, STATUS_TEXT } from '../types'

export function NoteStats() {
  const { notes, loading } = useNotes('all')
  if (loading) return <p className="muted">统计中...</p>
  return (
    <p className="muted" data-testid="stats">
      {NOTE_STATUSES.map((s) => `${STATUS_TEXT[s]} ${notes.filter((n) => n.status === s).length}`).join(' · ')}
    </p>
  )
}
