// SSR（服务端渲染）：每个请求都在服务端重新渲染一次
// connection() 告诉 Next：这里要等真正的请求到来才能继续（读 cookies / headers / searchParams 也有同样效果）
import { connection } from 'next/server'
import { RenderInfo, formatTime, nowCached } from '@/components/lab/RenderInfo'
import { listNotes } from '@/lib/db'

export const metadata = { title: 'SSR' }

// connection() 是「请求时 API」，在 Cache Components 下默认不能出现在预渲染阶段。
// 两个选择：[stream] 放进 <Suspense>；[block] 用 instant = false 明确声明「这个路由要等数据」。
// 这里选第二种，让「每次请求现做 HTML」这个对比更直观。
export const instant = false

export default async function SsrPage() {
  await connection()
  const notes = await listNotes()
  const renderedAt = formatTime(new Date()) // 路由声明了 instant = false，允许直接用当前时间
  return (
    <RenderInfo
      mode="SSR：每次请求时生成"
      description="服务端为每个请求现做一份 HTML，总是最新数据。适合个性化页面、频繁变化的数据。"
      renderedAt={renderedAt}
    >
      <p data-testid="count">此刻共有 {notes.length} 条笔记</p>
    </RenderInfo>
  )
}
