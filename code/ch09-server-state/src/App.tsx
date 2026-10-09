// 第 9 章：读用 useNotes（内部是 useQuery），写用 useMutation
// 和第 8 章相比：mutate + refresh 换成了各自的 mutation Hook；新增统计栏、后台刷新提示、故障实验室
import { useState } from 'react'
import { chaos } from './api'
import { Card } from './components/Card'
import { NoteEditor } from './components/NoteEditor'
import { NoteForm } from './components/NoteForm'
import { NoteList } from './components/NoteList'
import { NoteStats } from './components/NoteStats'
import { StatusFilterBar } from './components/StatusFilterBar'
import { UserBadge } from './components/UserBadge'
import { useDocumentTitle } from './hooks/useDocumentTitle'
import { useCreateNote, useDeleteNote, useRenameNote, useToggleNote } from './hooks/useNoteMutations'
import { useNotes } from './hooks/useNotes'
import type { StatusFilter } from './types'

export function App() {
  const [filter, setFilter] = useState<StatusFilter>('all')
  const { notes, loading, fetching, error } = useNotes(filter)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [simulateFailure, setSimulateFailure] = useState(chaos.fail)
  const selected = notes.find((n) => n.id === selectedId)

  const createMutation = useCreateNote()
  const toggleMutation = useToggleNote()
  const deleteMutation = useDeleteNote()
  const renameMutation = useRenameNote()

  useDocumentTitle(loading ? 'CloudNote（加载中）' : `CloudNote（${notes.length}）`)

  // 每个 mutation 自带 error 状态，不再需要自己维护 actionError
  const actionError = toggleMutation.error ?? deleteMutation.error ?? renameMutation.error
  const shownError = error || actionError?.message

  return (
    <main className="app">
      <header className="topbar">
        <h1>CloudNote</h1>
        <UserBadge />
      </header>
      <NoteStats />

      <Card title="新建笔记">
        {/* mutateAsync 返回 Promise：失败会抛给 NoteForm，由它显示字段级错误（第 8 章） */}
        <NoteForm onCreate={async (data) => void (await createMutation.mutateAsync(data))} />
      </Card>

      <Card title="笔记列表" actions={<StatusFilterBar value={filter} onChange={setFilter} />}>
        {shownError && (
          <p className="error" role="alert">
            出错了：{shownError}
          </p>
        )}
        <p className="muted" data-testid="status">
          {loading ? '加载中...' : `当前筛选 ${filter}，共 ${notes.length} 条`}
          {fetching && !loading && <span className="fetching">后台刷新中</span>}
        </p>
        <NoteList
          notes={notes}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onToggle={(note) => toggleMutation.mutate(note)}
          onDelete={(id) => deleteMutation.mutate(id)}
        />
      </Card>

      {selected && (
        <Card title={`编辑 #${selected.id}`}>
          <NoteEditor
            key={selected.id}
            note={selected}
            onSave={async (title) => void (await renameMutation.mutateAsync({ id: selected.id, title }))}
            onClose={() => setSelectedId(null)}
          />
        </Card>
      )}

      <section className="lab">
        <h2>故障实验室</h2>
        <label>
          <input
            type="checkbox"
            checked={simulateFailure}
            onChange={(e) => {
              chaos.fail = e.target.checked
              setSimulateFailure(e.target.checked)
            }}
          />{' '}
          模拟服务端故障（写请求返回 503）
        </label>
        <p className="muted">勾选后点「发布」：徽标会立刻变化，约 1 秒后请求失败，自动回滚。</p>
      </section>
    </main>
  )
}
