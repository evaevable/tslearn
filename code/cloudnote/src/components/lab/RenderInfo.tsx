// 实验室公用的信息卡（Server Component）：显示渲染模式、HTML 生成时间、笔记数量
import type { ReactNode } from 'react'
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

export function formatTime(date: Date): string {
  return date.toLocaleTimeString('zh-CN', { timeZone: 'Asia/Shanghai', hour12: false }) + '.' + String(date.getMilliseconds()).padStart(3, '0')
}
