// 表单逻辑与第 8 章一字不差（两道校验、fieldErrors），只换了外观：Label / Input / Textarea / NativeSelect
import { useState, type FormEvent } from 'react'
import { z } from 'zod'
import { CreateNoteInputSchema, type CreateNoteData, type CreateNoteInput } from '../../server/schema.ts'
import { ApiError, type FieldErrors } from '@/api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select'
import { Textarea } from '@/components/ui/textarea'
import { NOTE_STATUSES, STATUS_TEXT } from '@/types'

type FormValues = Required<CreateNoteInput>
const EMPTY: FormValues = { title: '', content: '', status: 'draft' }

type NoteFormProps = {
  onCreate: (data: CreateNoteData) => Promise<void>
}

export function NoteForm({ onCreate }: NoteFormProps) {
  const [values, setValues] = useState<FormValues>(EMPTY)
  const [errors, setErrors] = useState<FieldErrors>({})
  const [submitting, setSubmitting] = useState(false)

  function update<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((v) => ({ ...v, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
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
      if (err instanceof ApiError && err.fieldErrors) setErrors(err.fieldErrors)
      else setErrors({ title: [err instanceof Error ? err.message : String(err)] })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    // grid + gap：用间距工具类代替一个个 margin（积木 10-3）
    <form onSubmit={handleSubmit} noValidate className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="note-title">标题</Label>
        <Input
          id="note-title"
          placeholder="写一条笔记标题"
          value={values.title}
          onChange={(e) => update('title', e.target.value)}
          aria-invalid={Boolean(errors.title)}
        />
        <FieldError messages={errors.title} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="note-content">正文</Label>
        <Textarea
          id="note-content"
          rows={3}
          value={values.content}
          onChange={(e) => update('content', e.target.value)}
          aria-invalid={Boolean(errors.content)}
        />
        <FieldError messages={errors.content} />
      </div>
      {/* 小屏竖排，sm（≥640px）起横排：响应式前缀（积木 10-4） */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="grid gap-2">
          <Label htmlFor="note-status">状态</Label>
          <NativeSelect
            id="note-status"
            value={values.status}
            onChange={(e) => update('status', e.target.value as FormValues['status'])}
          >
            {NOTE_STATUSES.map((s) => (
              <NativeSelectOption key={s} value={s}>
                {STATUS_TEXT[s]}
              </NativeSelectOption>
            ))}
          </NativeSelect>
        </div>
        <Button type="submit" disabled={submitting} className="sm:w-28">
          {submitting ? '提交中...' : '添加'}
        </Button>
      </div>
    </form>
  )
}

function FieldError({ messages }: { messages: string[] | undefined }) {
  if (!messages?.length) return null
  return (
    <p className="text-sm text-destructive" role="alert" data-testid="field-error">
      {messages[0]}
    </p>
  )
}
