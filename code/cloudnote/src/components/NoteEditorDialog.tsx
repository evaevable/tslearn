'use client'

// 编辑器改成弹窗：Dialog 由 Radix 实现，自带焦点锁定、Esc 关闭、点遮罩关闭、读屏器语义（积木 10-6）
// 打开 / 关闭仍由父组件的 selectedId 控制：open + onOpenChange 就是「受控弹窗」
import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import type { Note } from '@/types'

type NoteEditorDialogProps = {
  note: Note | undefined
  onSave: (id: number, title: string) => Promise<void>
  onClose: () => void
}

export function NoteEditorDialog({ note, onSave, onClose }: NoteEditorDialogProps) {
  return (
    <Dialog open={Boolean(note)} onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        {/* key：换一条笔记就重建表单，草稿自动重置（第 7 章积木 7-7） */}
        {note && <EditorForm key={note.id} note={note} onSave={onSave} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  )
}

function EditorForm({ note, onSave, onClose }: { note: Note; onSave: NoteEditorDialogProps['onSave']; onClose: () => void }) {
  const [title, setTitle] = useState(note.title)
  const [saving, setSaving] = useState(false)
  const dirty = title.trim() !== note.title

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    await onSave(note.id, title.trim())
    setSaving(false)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <DialogHeader>
        <DialogTitle>编辑 #{note.id}</DialogTitle>
        <DialogDescription>修改标题后保存，列表会自动刷新。</DialogDescription>
      </DialogHeader>
      <Input aria-label="编辑标题" value={title} onChange={(e) => setTitle(e.target.value)} />
      <DialogFooter>
        <DialogClose asChild>
          <Button type="button" variant="outline">
            取消
          </Button>
        </DialogClose>
        <Button type="submit" disabled={!dirty || saving}>
          {saving ? '保存中...' : '保存'}
        </Button>
      </DialogFooter>
    </form>
  )
}
