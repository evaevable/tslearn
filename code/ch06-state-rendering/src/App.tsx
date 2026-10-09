// 第 6 章：第 5 章的 App 改用 useReducer —— 三个 handle 函数收拢成一个 reducer
import { useReducer, useState } from 'react'
import { NoteForm } from './components/NoteForm'
import { NoteList } from './components/NoteList'
import { StatusFilterBar } from './components/StatusFilterBar'
import { RenderLab } from './components/RenderLab'
import { initialNotes, notesReducer } from './notesReducer'
import type { StatusFilter } from './types'

export function App() {
  // useReducer(reducer, 初始值) => [当前 state, dispatch]
  // 组件只负责「发出动作」，怎么改 state 全在 notesReducer 里
  const [notes, dispatch] = useReducer(notesReducer, initialNotes)
  const [filter, setFilter] = useState<StatusFilter>('all')
  const visibleNotes = filter === 'all' ? notes : notes.filter((n) => n.status === filter)

  return (
    <main className="app">
      <h1>CloudNote</h1>
      <p className="muted">第 6 章：useReducer + 渲染实验室</p>
      <NoteForm onAdd={(title) => dispatch({ type: 'added', title })} />
      <StatusFilterBar value={filter} onChange={setFilter} />
      <NoteList
        notes={visibleNotes}
        onToggle={(id) => dispatch({ type: 'toggled', id })}
        onDelete={(id) => dispatch({ type: 'deleted', id })}
      />
      <div className="row">
        <p className="muted" data-testid="summary">
          共 {notes.length} 条，当前显示 {visibleNotes.length} 条
        </p>
        <button type="button" onClick={() => dispatch({ type: 'archivedAll' })}>
          全部归档
        </button>
      </div>
      <RenderLab />
    </main>
  )
}
