import { STATUS_TEXT, type Note } from '../types'

type NoteListProps = {
  notes: Note[]
  selectedId: number | null
  onSelect: (id: number) => void
  onToggle: (note: Note) => void
  onDelete: (id: number) => void
}

export function NoteList({ notes, selectedId, onSelect, onToggle, onDelete }: NoteListProps) {
  if (notes.length === 0) return <p className="empty">没有符合条件的笔记</p>

  return (
    <ul className="list">
      {notes.map((note) => (
        <li key={note.id} className={note.id === selectedId ? 'item selected' : 'item'}>
          <span className={`badge ${note.status}`}>{STATUS_TEXT[note.status]}</span>
          <span className="title">{note.title}</span>
          <button type="button" onClick={() => onSelect(note.id)}>
            编辑
          </button>
          <button type="button" onClick={() => onToggle(note)} disabled={note.status === 'archived'}>
            {note.status === 'published' ? '撤回' : '发布'}
          </button>
          <button type="button" className="danger" onClick={() => onDelete(note.id)}>
            删除
          </button>
        </li>
      ))}
    </ul>
  )
}
