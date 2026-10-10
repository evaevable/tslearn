'use client'

// 列表：每一行用 Tailwind 工具类排版（flex、gap、padding、分隔线），按钮换成 shadcn Button + lucide 图标
import { Pencil, Send, Trash2, Undo2 } from 'lucide-react'
import Link from 'next/link'
import { cn } from 'cn'
import { useUser } from '@/auth/UserContext'
import { Button } from '@/components/ui/button'
import type { Note } from '@/types'
import { StatusBadge } from './StatusBadge'

type NoteListProps = {
  notes: Note[]
  selectedId: number | null
  onSelect: (id: number) => void
  onToggle: (note: Note) => void
  onDelete: (id: number) => void
}

export function NoteList({ notes, selectedId, onSelect, onToggle, onDelete }: NoteListProps) {
  const { user } = useUser()
  const canEdit = user.role === 'admin'

  if (notes.length === 0) {
    return <p className="py-8 text-center text-sm text-muted-foreground">没有符合条件的笔记</p>
  }

  return (
    <ul className="divide-y" data-testid="list">
      {notes.map((note) => (
        <li
          key={note.id}
          className={cn(
            'flex items-center gap-3 px-2 py-2.5 transition-colors hover:bg-muted/50',
            note.id === selectedId && 'bg-muted', // cn：条件为 false 时这个类名被丢掉
          )}
        >
          <StatusBadge status={note.status} />
          {/* 标题变成指向详情页的链接：/notes/2 */}
          <Link href={`/notes/${note.id}`} className="flex-1 truncate text-sm hover:underline" data-testid="title">
            {note.title}
          </Link>
          <Button variant="ghost" size="icon-sm" aria-label="编辑" onClick={() => onSelect(note.id)} disabled={!canEdit}>
            <Pencil />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggle(note)}
            disabled={!canEdit || note.status === 'archived'}
            data-testid="toggle"
          >
            {note.status === 'published' ? <Undo2 /> : <Send />}
            {note.status === 'published' ? '撤回' : '发布'}
          </Button>
          <Button
            variant="destructive"
            size="icon-sm"
            aria-label="删除"
            onClick={() => onDelete(note.id)}
            disabled={!canEdit}
          >
            <Trash2 />
          </Button>
        </li>
      ))}
    </ul>
  )
}
