// 动态段也能静态生成：generateStaticParams 告诉 Next「构建时先把哪些 id 生成好」
// 构建输出里这个路由会显示为 ●（SSG）
import { notFound } from 'next/navigation'
import { RenderInfo, formatTime } from '@/components/lab/RenderInfo'
import { getNote } from '@/lib/db'

export function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }]
}

export default async function SsgNotePage(props: PageProps<'/lab/ssg/[id]'>) {
  const { id } = await props.params
  const note = await getNote(Number(id))
  if (!note) notFound()
  return (
    <RenderInfo
      mode={`SSG 动态段：/lab/ssg/${id}`}
      description="1、2 在构建时生成；访问 /lab/ssg/3 时首次按需渲染，之后缓存起来（ISR）。"
      renderedAt={formatTime(new Date())}
    >
      <p data-testid="title">{note.title}</p>
    </RenderInfo>
  )
}
