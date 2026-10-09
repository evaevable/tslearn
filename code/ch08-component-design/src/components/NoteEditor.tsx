// 编辑器（沿用第 7 章）：外框交给 Card，自己只管表单内容
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
  const dirty = title.trim() !== note.title

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSaving(true)
    await onSave(title.trim())
    setSaving(false)
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="field">
        <input aria-label="编辑标题" value={title} onChange={(e) => setTitle(e.target.value)} />
      </div>
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
