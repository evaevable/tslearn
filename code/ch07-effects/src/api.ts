// API 层：组件不直接写 fetch，统一走这里
// 响应同样是「外部数据」，用第 4 章的 Zod schema 校验后再交给组件
import { z } from 'zod'
import { NoteSchema, type CreateNoteInput, type UpdateNoteInput } from '../server/schema.ts'
import type { Note, StatusFilter } from './types'

const NoteListSchema = z.object({ records: z.array(NoteSchema), total: z.number() })

export class ApiError extends Error {
  status: number
  constructor(status: number, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

async function request(url: string, init?: RequestInit): Promise<unknown> {
  const res = await fetch(url, {
    ...init,
    headers: init?.body ? { 'Content-Type': 'application/json' } : undefined,
  })
  if (res.status === 204) return null
  const body: unknown = await res.json()
  if (!res.ok) {
    const error = typeof body === 'object' && body !== null && 'error' in body ? body.error : body
    throw new ApiError(res.status, typeof error === 'string' ? error : JSON.stringify(error))
  }
  return body
}

export async function fetchNotes(status: StatusFilter, signal?: AbortSignal): Promise<Note[]> {
  const query = status === 'all' ? '' : `?status=${status}`
  const data = await request(`/api/notes${query}`, { signal })
  return NoteListSchema.parse(data).records
}

export async function createNote(input: CreateNoteInput): Promise<Note> {
  return NoteSchema.parse(await request('/api/notes', { method: 'POST', body: JSON.stringify(input) }))
}

export async function updateNote(id: number, patch: UpdateNoteInput): Promise<Note> {
  return NoteSchema.parse(await request(`/api/notes/${id}`, { method: 'PATCH', body: JSON.stringify(patch) }))
}

export async function deleteNote(id: number): Promise<void> {
  await request(`/api/notes/${id}`, { method: 'DELETE' })
}
