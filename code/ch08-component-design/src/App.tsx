// 第 8 章：第 7 章那个「胖 App」拆完之后的样子
// - 拉列表的逻辑 -> useNotes 自定义 Hook
// - 外框样式 -> Card 组合组件
// - 当前用户 -> UserContext，App 自己完全不碰
import { useState } from 'react'
import { createNote, deleteNote, updateNote } from './api'
import type { CreateNoteData } from '../server/schema.ts'
import { Card } from './components/Card'
import { NoteEditor } from './components/NoteEditor'
import { NoteForm } from './components/NoteForm'
import { NoteList } from './components/NoteList'
import { StatusFilterBar } from './components/StatusFilterBar'
import { UserBadge } from './components/UserBadge'
import { useDocumentTitle } from './hooks/useDocumentTitle'
import { useNotes } from './hooks/useNotes'
import type { StatusFilter } from './types'

export function App() {
  console.log('[render] App')
  const [filter, setFilter] = useState<StatusFilter>('all')
  const { notes, loading, error, refresh } = useNotes(filter)
  const [actionError, setActionError] = useState('')
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const selected = notes.find((n) => n.id === selectedId)

  useDocumentTitle(loading ? 'CloudNote（加载中）' : `CloudNote（${notes.length}）`)

  async function mutate(action: () => Promise<unknown>) {
    setActionError('')
    try {
      await action()
      refresh()
    } catch (e) {
      setActionError(e instanceof Error ? e.message : String(e))
    }
  }

  // 新增的错误不在这里吞掉：抛回给 NoteForm，由它显示成字段级错误
  async function handleCreate(data: CreateNoteData) {
    await createNote(data)
    refresh()
  }

  const shownError = error || actionError

  return (
    <main className="app">
      <header className="topbar">
        <h1>CloudNote</h1>
        <UserBadge />
      </header>

      <Card title="新建笔记">
        <NoteForm onCreate={handleCreate} />
      </Card>

      <Card title="笔记列表" actions={<StatusFilterBar value={filter} onChange={setFilter} />}>
        {shownError && (
          <p className="error" role="alert">
            出错了：{shownError}
          </p>
        )}
        <p className="muted" data-testid="status">
          {loading ? '加载中...' : `当前筛选 ${filter}，共 ${notes.length} 条`}
        </p>
        <NoteList
          notes={notes}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onToggle={(n) => mutate(() => updateNote(n.id, { status: n.status === 'published' ? 'draft' : 'published' }))}
          onDelete={(id) => mutate(() => deleteNote(id))}
        />
      </Card>

      {selected && (
        <Card title={`编辑 #${selected.id}`}>
          <NoteEditor
            key={selected.id}
            note={selected}
            onSave={(title) => mutate(() => updateNote(selected.id, { title }))}
            onClose={() => setSelectedId(null)}
          />
        </Card>
      )}
    </main>
  )
}
