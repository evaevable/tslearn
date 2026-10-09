// 编辑器：内部 title 是「草稿」，只用 note.title 做初始值
// 不需要 useEffect(() => setTitle(note.title), [note])——父组件用 key 让它在换笔记时整体重建
import { useState, type FormEvent } from 'react'
import type { Note } from '../types'

type NoteEditorProps = {
  note: Note
  onSave: (title: string) => Promise<void>
  onClose: () => void
}

export function NoteEditor({ note, onSave, onClose }: NoteEditorProps) {
  const [title, setTitle] = useState(note.title)
  const [saving, setSaving] = useState(false)
  const dirty = title.trim() !== note.title // 派生：有没有改动，不存 state

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    await onSave(title.trim()) // 保存是「用户点了按钮」引起的 => 放在事件处理函数里
    setSaving(false)
  }

  return (
    <form className="editor" onSubmit={handleSubmit}>
      <h2>编辑 #{note.id}</h2>
      <input aria-label="编辑标题" value={title} onChange={(e) => setTitle(e.target.value)} />
      <div className="row">
        <button type="submit" disabled={!dirty || saving}>
          {saving ? '保存中...' : '保存'}
        </button>
        <button type="button" className="ghost" onClick={onClose}>
          关闭
        </button>
      </div>
    </form>
  )
}
