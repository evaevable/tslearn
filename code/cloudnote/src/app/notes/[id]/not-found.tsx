// 当 page 里调用 notFound() 时渲染。仍然在 notes/layout.tsx 里面，所以统计卡片还在
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function NoteNotFound() {
  return (
    <Card>
      <CardHeader>
        <CardTitle data-testid="not-found">笔记不存在</CardTitle>
        <CardDescription>它可能已经被删除，或者链接写错了。</CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild size="sm">
          <Link href="/notes">返回列表</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
