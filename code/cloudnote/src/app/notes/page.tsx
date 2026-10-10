// /notes?status=draft —— 第 13 章起改成「服务端渲染 + Server Actions」：
// 页面外壳先发出去，读 searchParams 的列表部分放进 <Suspense>（Cache Components 的硬要求）
import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { NoteFormAction } from '@/components/NoteFormAction'
import { StatusBadge } from '@/components/StatusBadge'
import { StatusFilterBar } from '@/components/StatusFilterBar'
import { Button } from '@/components/ui/button'
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { listNotes } from '@/lib/db'
import { NoteStatusSchema } from '@/lib/schema'
import type { StatusFilter } from '@/types'
import { deleteNoteAction, toggleNoteAction } from './actions'

export const metadata: Metadata = { title: '笔记列表' }

export default function NotesPage(props: PageProps<'/notes'>) {
  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>新建笔记（Server Action）</CardTitle>
          <CardDescription>提交时不发 fetch：浏览器把表单直接交给服务端函数执行。</CardDescription>
        </CardHeader>
        <CardContent>
          <NoteFormAction />
        </CardContent>
      </Card>

      <Suspense fallback={<ListSkeleton />}>
        <NotesList searchParams={props.searchParams} />
      </Suspense>
    </>
  )
}

function ListSkeleton() {
  return (
    <Card data-testid="list-skeleton">
      <CardHeader>
        <div className="h-5 w-40 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent className="grid gap-2">
        <div className="h-9 animate-pulse rounded bg-muted" />
        <div className="h-9 animate-pulse rounded bg-muted" />
      </CardContent>
    </Card>
  )
}

async function NotesList({ searchParams }: { searchParams: Promise<{ status?: string | string[] }> }) {
  const { status } = await searchParams
  const parsed = NoteStatusSchema.safeParse(status)
  const filter: StatusFilter = parsed.success ? parsed.data : 'all'
  const notes = await listNotes(filter === 'all' ? undefined : filter)

  return (
    <Card>
      <CardHeader>
        <CardTitle>笔记列表</CardTitle>
        <CardDescription data-testid="status">
          当前筛选 {filter}，共 {notes.length} 条（这一行是服务端渲染的）
        </CardDescription>
        <CardAction>
          <StatusFilterBar value={filter} />
        </CardAction>
      </CardHeader>
      <CardContent>
        {notes.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">没有符合条件的笔记</p>
        ) : (
          <ul className="divide-y" data-testid="list">
            {notes.map((note) => (
              <li key={note.id} className="flex items-center gap-3 px-2 py-2.5 hover:bg-muted/50">
                <StatusBadge status={note.status} />
                <Link href={`/notes/${note.id}`} className="flex-1 truncate text-sm hover:underline" data-testid="title">
                  {note.title}
                </Link>
                {/* 每个按钮就是一个迷你表单：action 指向 Server Action，提交时不刷新整页 */}
                <form action={toggleNoteAction}>
                  <input type="hidden" name="id" value={note.id} />
                  <input type="hidden" name="nextStatus" value={note.status} />
                  <Button type="submit" variant="outline" size="sm" disabled={note.status === 'archived'} data-testid="toggle">
                    {note.status === 'published' ? '撤回' : '发布'}
                  </Button>
                </form>
                <form action={deleteNoteAction}>
                  <input type="hidden" name="id" value={note.id} />
                  <Button type="submit" variant="destructive" size="sm" aria-label="删除">
                    删除
                  </Button>
                </form>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
