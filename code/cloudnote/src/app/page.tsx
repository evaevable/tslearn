// 首页 /：没有任何交互，是一个纯 Server Component（没有 'use client'），不往浏览器发组件 JS
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function HomePage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">欢迎来到 CloudNote</CardTitle>
        <CardDescription>从第 11 章起，CloudNote 是一个 Next.js 项目：页面、接口、样式都在同一个仓库里。</CardDescription>
      </CardHeader>
      <CardContent className="flex gap-2">
        <Button asChild>
          <Link href="/notes">查看全部笔记</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/notes?status=draft">只看草稿</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
