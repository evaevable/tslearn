'use client'
import { useNotes } from '@/hooks/useNotes'

export function CsrNoteCount() {
  const { notes, loading } = useNotes('all')
  return <p data-testid="count">{loading ? '加载中...（数据在浏览器里请求）' : `浏览器拉到 ${notes.length} 条笔记`}</p>
}
