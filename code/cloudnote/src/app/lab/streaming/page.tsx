// 流式渲染：页面外壳先发出去，慢的部分用 <Suspense> 包起来，准备好后再追加到同一个响应里
// Cache Components 下的标准做法：外壳（含缓存数据和 fallback）进静态外壳，未缓存的数据在 Suspense 里流式补上
import { Suspense } from 'react'
import { RenderInfo, formatTime, nowCached } from '@/components/lab/RenderInfo'
import { countNotes, sleep } from '@/lib/db'

export const metadata = { title: '流式' }

// 故意不用缓存：未缓存的数据库读必须放在 <Suspense> 里（官方文档管这叫 streaming uncached data）
async function SlowSection({ label, delay }: { label: string; delay: number }) {
  await sleep(delay) // 模拟一次慢查询
  const total = await countNotes()
  return (
    <p data-testid={`section-${delay}`}>
      {label}：{total} 条笔记，完成于 {formatTime(new Date())}
    </p>
  )
}

export default async function StreamingPage() {
  const renderedAt = await nowCached()
  return (
    <RenderInfo
      mode="流式：先发外壳，再分段补齐"
      description="外壳和两个占位立刻发出；两个区块分别等 1 秒和 2.5 秒，各自到达后替换自己的占位。"
      renderedAt={renderedAt}
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
