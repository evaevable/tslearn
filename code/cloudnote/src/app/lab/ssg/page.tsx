// SSG（静态生成）：没有用到任何「请求时才知道」的东西，Next 在 next build 时就把它渲染成 HTML 文件
// 之后每次访问都直接返回那份文件 —— 刷新多少次，时间都不变
import { RenderInfo, nowCached } from '@/components/lab/RenderInfo'
import { listNotes } from '@/lib/db'

export const metadata = { title: 'SSG' }

export default async function SsgPage() {
  const notes = await listNotes()
  const renderedAt = await nowCached()
  console.log('[server-only-marker] 渲染 /lab/ssg') // 只会在构建日志里出现，浏览器的 JS 里没有这行（积木 12-4）
  return (
    <RenderInfo
      mode="SSG：构建时生成"
      description="页面在 next build 时渲染一次，结果是静态 HTML。适合文档、博客、营销页。"
      renderedAt={renderedAt}
    >
      <p data-testid="count">构建时共有 {notes.length} 条笔记（之后新增的笔记这里看不到）</p>
    </RenderInfo>
  )
}
