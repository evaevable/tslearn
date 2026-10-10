'use client'
// error.tsx：这一段及以下抛出未捕获的异常时显示，相当于给路由段套了一个错误边界
// 必须是客户端组件：它要提供「重试」按钮
import { Button } from '@/components/ui/button'

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="grid place-items-center gap-3 py-16 text-center">
      <p className="text-lg font-medium">页面出错了</p>
      {/* 生产环境下 message 会被替换成通用文字，避免泄露服务端细节；digest 用来在服务端日志里对应这次错误 */}
      <p className="text-sm text-muted-foreground">{error.digest ? `错误编号 ${error.digest}` : error.message}</p>
      <Button onClick={reset}>重试</Button>
    </div>
  )
}
