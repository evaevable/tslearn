// loading.tsx：这个路由段在等数据时显示的界面。Next 自动用 <Suspense> 把 page 包起来（第 12 章细讲 Suspense）
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export default function Loading() {
  return (
    <Card data-testid="detail-loading">
      <CardHeader>
        <div className="h-6 w-1/2 animate-pulse rounded bg-muted" />
        <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
      </CardHeader>
      <CardContent>
        <div className="h-16 animate-pulse rounded bg-muted" />
      </CardContent>
    </Card>
  )
}
