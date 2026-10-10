// 全站 404：访问任何不存在的路径（比如 /abc）时显示
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="grid place-items-center gap-3 py-16 text-center">
      <p className="text-5xl font-semibold tabular-nums">404</p>
      <p className="text-muted-foreground">这个页面不存在</p>
      <Button asChild>
        <Link href="/">回到首页</Link>
      </Button>
    </div>
  )
}
