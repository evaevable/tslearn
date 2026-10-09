// 根组件：持有全部 state，把数据通过 props 往下传，把「改数据的函数」也往下传
// 对照第 1 章 index.html：那里改完 state 要手动调 render()，这里只调 setXxx，React 负责重画
import { useState } from 'react'
import { NoteForm } from './components/NoteForm'
import { NoteList } from './components/NoteList'
import { StatusFilterBar } from './components/StatusFilterBar'
import type { Note, StatusFilter } from './types'

const initialNotes: Note[] = [
  { id: 1, title: '学会 TypeScript 类型系统', status: 'published' },
  { id: 2, title: '理解 React 的 UI = f(state)', status: 'draft' },
  { id: 3, title: '<b>这不是粗体</b>', status: 'archived' },
]

export function App() {
  // state：会变、且变了要重画界面的数据
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [filter, setFilter] = useState<StatusFilter>('all')

  // 派生数据：能从 state 算出来的，就不要再存一份 state（积木 5-6）
  const visibleNotes = filter === 'all' ? notes : notes.filter((n) => n.status === filter)

  // 修改 state 必须产生「新数组 / 新对象」，不能原地改（积木 5-5）
  function handleAdd(title: string) {
    setNotes((prev) => [...prev, { id: Math.max(0, ...prev.map((n) => n.id)) + 1, title, status: 'draft' }])
  }

  function handleToggle(id: number) {
    setNotes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, status: n.status === 'published' ? 'draft' : 'published' } : n)),
    )
  }

  function handleDelete(id: number) {
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <main className="app">
      <h1>CloudNote</h1>
      <p className="muted">第 5 章：同一个页面，用 React 组件重写</p>
      <NoteForm onAdd={handleAdd} />
      <StatusFilterBar value={filter} onChange={setFilter} />
      <NoteList notes={visibleNotes} onToggle={handleToggle} onDelete={handleDelete} />
      <p className="muted" data-testid="summary">
        共 {notes.length} 条，当前显示 {visibleNotes.length} 条
      </p>
    </main>
  )
}
