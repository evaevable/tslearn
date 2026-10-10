// 流式渲染：页面先把「能马上给的」发出去，慢的部分用 <Suspense> 包起来，准备好后再追加到同一个响应里
import { Suspense } from 'react'
import { connection } from 'next/server'
import { RenderInfo, formatTime } from '@/components/lab/RenderInfo'
import { listNotes, sleep } from '@/lib/db'

export const metadata = { title: '流式' }

async function SlowSection({ label, delay }: { label: string; delay: number }) {
  await sleep(delay) // 模拟一次慢查询
  return (
    <p data-testid={`section-${delay}`}>
      {label}：{listNotes().length} 条笔记，完成于 {formatTime(new Date())}
    </p>
  )
}

export default async function StreamingPage() {
  await connection()
  return (
    <RenderInfo
      mode="流式：先发外壳，再分段补齐"
      description="两个区块分别等 1 秒和 2.5 秒。HTTP 响应只有一个，但内容分三批到达浏览器。"
      renderedAt={formatTime(new Date())}
    >
      <Suspense fallback={<p className="text-muted-foreground" data-testid="fallback-1000">统计加载中...</p>}>
        <SlowSection label="快区块" delay={1000} />
      </Suspense>
      <Suspense fallback={<p className="text-muted-foreground" data-testid="fallback-2500">推荐加载中...</p>}>
        <SlowSection label="慢区块" delay={2500} />
      </Suspense>
    </RenderInfo>
  )
}
