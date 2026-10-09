// 列表：直接从 Context 读当前用户决定按钮能不能点，不需要 App 把 user 一层层传下来
import { useUser } from '../auth/UserContext'
import { STATUS_TEXT, type Note } from '../types'

type NoteListProps = {
  notes: Note[]
  selectedId: number | null
  onSelect: (id: number) => void
  onToggle: (note: Note) => void
  onDelete: (id: number) => void
}

export function NoteList({ notes, selectedId, onSelect, onToggle, onDelete }: NoteListProps) {
  const { user } = useUser()
  console.log('[render] NoteList')
  // 前端禁用按钮只是体验，真正的权限必须在服务端检查（第 14 章）
  const canEdit = user.role === 'admin'

  if (notes.length === 0) return <p className="empty">没有符合条件的笔记</p>

  return (
    <ul className="list">
      {notes.map((note) => (
        <li key={note.id} className={note.id === selectedId ? 'item selected' : 'item'}>
          <span className={`badge ${note.status}`}>{STATUS_TEXT[note.status]}</span>
          <span className="title">{note.title}</span>
          <button type="button" onClick={() => onSelect(note.id)} disabled={!canEdit}>
            编辑
          </button>
          <button type="button" onClick={() => onToggle(note)} disabled={!canEdit || note.status === 'archived'}>
            {note.status === 'published' ? '撤回' : '发布'}
          </button>
          <button type="button" className="danger" onClick={() => onDelete(note.id)} disabled={!canEdit}>
            删除
          </button>
        </li>
      ))}
    </ul>
  )
}
