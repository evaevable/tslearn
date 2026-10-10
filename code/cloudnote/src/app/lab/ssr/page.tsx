// SSR（服务端渲染）：每个请求都在服务端重新渲染一次
// connection() 告诉 Next：这里要等真正的请求到来才能继续（读 cookies / headers / searchParams 也有同样效果）
import { connection } from 'next/server'
import { RenderInfo, formatTime } from '@/components/lab/RenderInfo'
import { listNotes } from '@/lib/db'

export const metadata = { title: 'SSR' }

export default async function SsrPage() {
  await connection()
  const notes = listNotes()
  return (
    <RenderInfo
      mode="SSR：每次请求时生成"
      description="服务端为每个请求现做一份 HTML，总是最新数据。适合个性化页面、频繁变化的数据。"
      renderedAt={formatTime(new Date())}
    >
      <p data-testid="count">此刻共有 {notes.length} 条笔记</p>
    </RenderInfo>
  )
}
