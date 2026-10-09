// 第 7 章：数据来自后端。Effect 只做一件事——让组件和「服务端数据」保持同步
import { useEffect, useState } from 'react'
import { createNote, deleteNote, fetchNotes, updateNote } from './api'
import { NoteEditor } from './components/NoteEditor'
import { NoteForm } from './components/NoteForm'
import { NoteList } from './components/NoteList'
import { StatusFilterBar } from './components/StatusFilterBar'
import type { Note, StatusFilter } from './types'

export function App() {
  const [filter, setFilter] = useState<StatusFilter>('all')
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [version, setVersion] = useState(0) // 写操作成功后 +1，触发重新拉取
  const [selectedId, setSelectedId] = useState<number | null>(null) // 存 id，不存对象（积木 7-7）
  const [raceBug, setRaceBug] = useState(false) // 实验开关：关闭清理函数，复现竞态

  // ---------- Effect 1：按筛选条件拉取列表 ----------
  useEffect(() => {
    const controller = new AbortController()
    console.log(`[effect] 开始请求 status=${filter}`)
    setLoading(true)
    setError('')

    fetchNotes(filter, controller.signal)
      .then((data) => {
        if (controller.signal.aborted) return // 已被取消：结果作废
        console.log(`[effect] 请求完成 status=${filter}，${data.length} 条`)
        setNotes(data)
        setLoading(false)
      })
      .catch((e: unknown) => {
        if (controller.signal.aborted) return // 取消导致的 AbortError 不算错误
        setError(e instanceof Error ? e.message : String(e))
        setLoading(false)
      })

    // 清理函数：下一次 effect 运行前、或组件卸载时调用
    return () => {
      if (raceBug) return // 故意不取消，演示竞态 bug
      console.log(`[cleanup] 取消 status=${filter} 的请求`)
      controller.abort()
    }
  }, [filter, version, raceBug])

  // ---------- Effect 2：同步浏览器标签页标题（外部系统） ----------
  useEffect(() => {
    document.title = loading ? 'CloudNote（加载中）' : `CloudNote（${notes.length}）`
  }, [loading, notes.length])

  // 派生：选中的笔记从 notes 里找，不另存一份
  const selected = notes.find((n) => n.id === selectedId)

  // ---------- 写操作：在事件处理函数里直接做，不经过 Effect ----------
  async function mutate(action: () => Promise<unknown>) {
    try {
      await action()
      setVersion((v) => v + 1)
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  return (
    <main className="app">
      <h1>CloudNote</h1>
      <p className="muted">第 7 章：数据来自后端 API</p>
      <NoteForm onAdd={(title) => mutate(() => createNote({ title }))} />
      <StatusFilterBar value={filter} onChange={setFilter} />

      {error && (
        <p className="error" role="alert">
          出错了：{error}
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

      {selected && (
        // key：换一条笔记就是「另一个编辑器」，内部草稿 state 自动重置（积木 7-7）
        <NoteEditor
          key={selected.id}
          note={selected}
          onSave={(title) => mutate(() => updateNote(selected.id, { title }))}
          onClose={() => setSelectedId(null)}
        />
      )}

      <section className="lab">
        <h2>竞态实验室</h2>
        <label>
          <input type="checkbox" checked={raceBug} onChange={(e) => setRaceBug(e.target.checked)} />{' '}
          关闭清理函数（复现竞态 bug）
        </label>
        <p className="muted">勾选后，先点「全部」再立刻点「草稿」：慢请求后返回，会把草稿列表覆盖掉。</p>
      </section>
    </main>
  )
}
