// 实验室公用的信息卡（Server Component）：显示渲染模式、HTML 生成时间、笔记数量
import type { ReactNode } from 'react'
import { cacheLife } from 'next/cache'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

type RenderInfoProps = {
  mode: string
  description: string
  renderedAt?: string
  children?: ReactNode
}

export function RenderInfo({ mode, description, renderedAt, children }: RenderInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle data-testid="mode">{mode}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-2 text-sm">
        {renderedAt && (
          <p>
            HTML 生成于 <code className="rounded bg-muted px-1" data-testid="rendered-at">{renderedAt}</code>
          </p>
        )}
        {children}
      </CardContent>
    </Card>
  )
}

// 预渲染时不能直接用 new Date()（值不稳定，第 13 章积木 13-4 实测会报错），
// 用 'use cache' 包一层：这个时间变成「缓存被创建的时刻」，可以安全地进静态外壳
export async function nowCached(): Promise<string> {
  'use cache'
  cacheLife('max') // max = 一直没有过期时间，直到被显式失效
  return formatTime(new Date())
}

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false }) + '.' + String(date.getMilliseconds()).padStart(3, '0')
}
