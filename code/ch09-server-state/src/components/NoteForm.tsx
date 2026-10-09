// 受控表单：每个输入框显示什么完全由 values 决定；提交时先用 Zod 在前端校验，再接住服务端的字段错误
import { useState, type FormEvent } from 'react'
import { z } from 'zod'
import { CreateNoteInputSchema, type CreateNoteData, type CreateNoteInput } from '../../server/schema.ts'
import { ApiError, type FieldErrors } from '../api'
import { NOTE_STATUSES, STATUS_TEXT } from '../types'

// z.input 里 content、status 是可选的（有 default）；表单里每个字段都必须有值，所以套一层 Required
type FormValues = Required<CreateNoteInput>
const EMPTY: FormValues = { title: '', content: '', status: 'draft' }

type NoteFormProps = {
  onCreate: (data: CreateNoteData) => Promise<void>
}

export function NoteForm({ onCreate }: NoteFormProps) {
  const [values, setValues] = useState<FormValues>(EMPTY)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)

  // 第 3 章的 keyof 泛型：key 只能是 FormValues 的字段名，value 的类型跟着 key 走
  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined })) // 用户一改，这个字段的旧错误就消失
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    // 第 1 道：前端校验（体验）——同一份 schema，不发请求就能提示
    const parsed = CreateNoteInputSchema.safeParse(values)
    if (!parsed.success) {
      setErrors(z.flattenError(parsed.error).fieldErrors)
      return
    }
    setSubmitting(true)
    try {
      await onCreate(parsed.data)
      setValues(EMPTY)
      setErrors({})
    } catch (err) {
      // 第 2 道：服务端校验（安全 + 只有服务端知道的规则，比如标题重复）
      if (err instanceof ApiError && err.fieldErrors) setErrors(err.fieldErrors)
      else setErrors({ title: [err instanceof Error ? err.message : String(err)] })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="note-title">标题</label>
        <input
          id="note-title"
          value={values.title}
          onChange={(e) => update('title', e.target.value)}
          aria-invalid={Boolean(errors.title)}
        />
        <FieldError messages={errors.title} />
      </div>
      <div className="field">
        <label htmlFor="note-content">正文</label>
        <textarea
          id="note-content"
          rows={3}
          value={values.content}
          onChange={(e) => update('content', e.target.value)}
          aria-invalid={Boolean(errors.content)}
        />
        <FieldError messages={errors.content} />
      </div>
      <div className="field">
        <label htmlFor="note-status">状态</label>
        <select
          id="note-status"
          value={values.status}
          // select 的 value 是 string，需要收窄回 NoteStatus：在选项只来自 NOTE_STATUSES 的前提下用 as
          onChange={(e) => update('status', e.target.value as FormValues['status'])}
        >
          {NOTE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {STATUS_TEXT[s]}
            </option>
          ))}
        </select>
      </div>
      <button type="submit" disabled={submitting}>
        {submitting ? '提交中...' : '添加'}
      </button>
    </form>
  )
}

function FieldError({ messages }: { messages: string[] | undefined }) {
  if (!messages?.length) return null
  return (
    <p className="field-error" role="alert">
      {messages[0]}
    </p>
  )
}
