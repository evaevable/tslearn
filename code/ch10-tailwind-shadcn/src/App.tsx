// 第 10 章：数据层（useNotes、mutation Hook）与第 9 章完全相同，只重写了「长什么样」
// 第 8 章手写的 Card 换成 shadcn Card：同样是 children 组合，只是拆得更细（Header / Title / Action / Content）
import { useState } from 'react'
import { chaos } from '@/api'
import { NoteEditorDialog } from '@/components/NoteEditorDialog'
import { NoteForm } from '@/components/NoteForm'
import { NoteList } from '@/components/NoteList'
import { NoteStats } from '@/components/NoteStats'
import { StatusFilterBar } from '@/components/StatusFilterBar'
import { UserBadge } from '@/components/UserBadge'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useDocumentTitle } from '@/hooks/useDocumentTitle'
import { useCreateNote, useDeleteNote, useRenameNote, useToggleNote } from '@/hooks/useNoteMutations'
import { useNotes } from '@/hooks/useNotes'
import type { StatusFilter } from '@/types'

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
  const shownError = error || (toggleMutation.error ?? deleteMutation.error ?? renameMutation.error)?.message

  return (
    <div className="min-h-svh bg-muted/40">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-semibold tracking-tight">CloudNote</h1>
          <UserBadge />
        </div>
      </header>

      <main className="mx-auto grid max-w-3xl gap-6 px-4 py-6">
        <NoteStats />

        <Card>
          <CardHeader>
            <CardTitle>新建笔记</CardTitle>
            <CardDescription>标题必填，最多 100 字；标题不能与已有笔记重复。</CardDescription>
          </CardHeader>
          <CardContent>
            <NoteForm onCreate={async (data) => void (await createMutation.mutateAsync(data))} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>笔记列表</CardTitle>
            <CardDescription data-testid="status">
              {loading ? '加载中...' : `当前筛选 ${filter}，共 ${notes.length} 条`}
              {fetching && !loading && <span className="ml-2 text-primary">后台刷新中</span>}
            </CardDescription>
            {/* CardAction：标题栏右侧的插槽，对应第 8 章 Card 的 actions prop */}
            <CardAction>
              <StatusFilterBar value={filter} onChange={setFilter} />
            </CardAction>
          </CardHeader>
          <CardContent className="grid gap-3">
            {shownError && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive" role="alert">
                出错了：{shownError}
              </p>
            )}
            <NoteList
              notes={notes}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onToggle={(note) => toggleMutation.mutate(note)}
              onDelete={(id) => deleteMutation.mutate(id)}
            />
          </CardContent>
        </Card>

        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            className="size-4 accent-primary"
            checked={simulateFailure}
            onChange={(e) => {
              chaos.fail = e.target.checked
              setSimulateFailure(e.target.checked)
            }}
          />
          故障实验室：模拟服务端故障（写请求返回 503，观察乐观更新回滚）
        </label>
      </main>

      <NoteEditorDialog
        note={selected}
        onSave={async (id, title) => void (await renameMutation.mutateAsync({ id, title }))}
        onClose={() => setSelectedId(null)}
      />
    </div>
  )
}
