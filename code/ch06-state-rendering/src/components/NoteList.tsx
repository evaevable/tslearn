// 列表 + 列表项：演示 props 往下传、事件往上报，以及列表渲染必须的 key
import { STATUS_TEXT, type Note } from '../types'

type NoteListProps = {
  notes: Note[]
  onToggle: (id: number) => void
  onDelete: (id: number) => void
}

export function NoteList({ notes, onToggle, onDelete }: NoteListProps) {
  // 条件渲染：JSX 就是表达式，可以直接写 if / 三元
  if (notes.length === 0) return <p className="empty">没有符合条件的笔记</p>

  return (
    <ul className="list">
      {notes.map((note) => (
        // key 让 React 认出「这一行还是上次那一行」，必须稳定且唯一，用 id，不要用下标（积木 5-7）
        <NoteItem key={note.id} note={note} onToggle={onToggle} onDelete={onDelete} />
      ))}
    </ul>
  )
}

type NoteItemProps = {
  note: Note
  onToggle: (id: number) => void
  onDelete: (id: number) => void
}

function NoteItem({ note, onToggle, onDelete }: NoteItemProps) {
  return (
    <li className="item">
      <span className={`badge ${note.status}`}>{STATUS_TEXT[note.status]}</span>
      {/* 花括号里的字符串会被自动转义：<b> 显示成文字而不是粗体，不需要第 1 章的 escapeHtml */}
      <span className="title">{note.title}</span>
      <button type="button" onClick={() => onToggle(note.id)} disabled={note.status === 'archived'}>
        {note.status === 'published' ? '撤回' : '发布'}
      </button>
      <button type="button" className="danger" onClick={() => onDelete(note.id)}>
        删除
      </button>
    </li>
  )
}
