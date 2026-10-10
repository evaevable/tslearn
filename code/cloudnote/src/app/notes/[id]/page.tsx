// 动态路由 /notes/[id]：文件夹名里的方括号就是路径参数，相当于 Gin 的 /notes/:id
// Server Component 可以直接 await 数据库函数——不用写 API、不用 useQuery（第 12、13 章展开）
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { z } from 'zod'
import { StatusBadge } from '@/components/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getNote } from '@/lib/db'

// params.id 永远是字符串；用 Zod 转成正整数，/notes/abc 直接 404
const IdSchema = z.coerce.number().int().positive()

async function loadNote(rawId: string) {
  const id = IdSchema.safeParse(rawId)
  const note = id.success ? await getNote(id.data) : undefined
  if (!note) notFound() // 抛出一个特殊错误，Next 渲染最近的 not-found.tsx，并返回 HTTP 404
  return note
}

// 动态标题：浏览器标签页显示「笔记标题 · CloudNote」
export async function generateMetadata(props: PageProps<'/notes/[id]'>): Promise<Metadata> {
  const { id } = await props.params
  const note = await loadNote(id)
  return { title: note.title }
}

export default async function NoteDetailPage(props: PageProps<'/notes/[id]'>) {
  const { id } = await props.params
  const note = await loadNote(id)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <StatusBadge status={note.status} />
          <CardTitle className="text-xl" data-testid="detail-title">
            {note.title}
          </CardTitle>
        </div>
        <CardDescription>
          #{note.id} · 创建于 {new Date(note.createdAt).toLocaleString('zh-CN', { timeZone: 'Asia/Shanghai' })}
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <p className="whitespace-pre-wrap text-sm leading-relaxed">{note.content || '（没有正文）'}</p>
        <div>
          <Button asChild variant="outline" size="sm">
            <Link href="/notes">
              <ArrowLeft />
              返回列表
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
