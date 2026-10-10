'use client'

import { Moon, Sun, UserRound } from 'lucide-react'
import { useState } from 'react'
import { useUser } from '@/auth/UserContext'
import { Button } from '@/components/ui/button'

export function UserBadge() {
  const { user, switchUser } = useUser()
  // 暗色模式：给 <html> 加 .dark 类，index.css 里的 .dark 变量组就生效了（积木 10-5）
  // 不能在渲染时读 document：客户端组件在服务端也会渲染一次，那里没有 document（第 12 章）
  const [dark, setDark] = useState(false)

  function toggleTheme() {
    document.documentElement.classList.toggle('dark', !dark)
    setDark(!dark)
  }

  return (
    <div className="flex items-center gap-2 text-sm" data-testid="user">
      <UserRound className="size-4 text-muted-foreground" />
      <span>
        {user.name}
        <span className="text-muted-foreground">（{user.role === 'admin' ? '管理员' : '只读'}）</span>
      </span>
      <Button variant="outline" size="sm" onClick={switchUser}>
        切换用户
      </Button>
      <Button variant="ghost" size="icon-sm" aria-label="切换主题" onClick={toggleTheme} data-testid="theme">
        {dark ? <Sun /> : <Moon />}
      </Button>
    </div>
  )
}
