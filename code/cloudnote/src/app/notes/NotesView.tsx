'use client'
// 第 10 章 App.tsx 的主体，几乎原样搬来。唯一的变化：filter 不再是 useState，而是由页面从 URL 读出后传进来
import { useState } from 'react'
import { chaos } from '@/api'
import { NoteEditorDialog } from '@/components/NoteEditorDialog'
import { NoteForm } from '@/components/NoteForm'
import { NoteList } from '@/components/NoteList'
import { StatusFilterBar } from '@/components/StatusFilterBar'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useCreateNote, useDeleteNote, useRenameNote, useToggleNote } from '@/hooks/useNoteMutations'
import { useNotes } from '@/hooks/useNotes'
import type { StatusFilter } from '@/types'

export function NotesView({ filter }: { filter: StatusFilter }) {
  const { notes, loading, fetching, error } = useNotes(filter)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [simulateFailure, setSimulateFailure] = useState(chaos.fail)
  const selected = notes.find((n) => n.id === selectedId)

  const createMutation = useCreateNote()
  const toggleMutation = useToggleNote()
  const deleteMutation = useDeleteNote()
  const renameMutation = useRenameNote()
  const shownError = error || (toggleMutation.error ?? deleteMutation.error ?? renameMutation.error)?.message

  return (
    <>
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
          <CardAction>
            <StatusFilterBar value={filter} />
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
        故障实验室：模拟服务端故障（写请求返回 503）
      </label>

      <NoteEditorDialog
        note={selected}
        onSave={async (id, title) => void (await renameMutation.mutateAsync({ id, title }))}
        onClose={() => setSelectedId(null)}
      />
    </>
  )
}
