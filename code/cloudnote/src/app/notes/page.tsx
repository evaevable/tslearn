// /notes?status=draft —— 筛选条件从组件 state 搬进了 URL（第 6 章决策图的「URL 状态」）
// 这是 Server Component：在服务端读 searchParams、做校验，再把干净的 filter 交给客户端组件
import type { Metadata } from 'next'
import { NoteStatusSchema } from '@/lib/schema'
import type { StatusFilter } from '@/types'
import { NotesView } from './NotesView'

export const metadata: Metadata = { title: '笔记列表' }

export default async function NotesPage(props: PageProps<'/notes'>) {
  const { status } = await props.searchParams
  // URL 是外部输入（第 4 章）：?status=xxx 或 ?status=a&status=b 都可能出现，非法值回退为 all
  const parsed = NoteStatusSchema.safeParse(status)
  const filter: StatusFilter = parsed.success ? parsed.data : 'all'
  return <NotesView filter={filter} />
}
