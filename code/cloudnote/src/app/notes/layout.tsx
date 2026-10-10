// 嵌套布局：/notes 和 /notes/[id] 共用。统计卡片放在这里，在列表和详情之间来回跳时它保持不动
import type { ReactNode } from 'react'
import { NoteStats } from '@/components/NoteStats'

export default function NotesLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid gap-6">
      <NoteStats />
      {children}
    </div>
  )
}
