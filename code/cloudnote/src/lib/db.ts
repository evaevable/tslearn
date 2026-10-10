// 内存「数据库」：第 4~10 章 server/server.ts 里的 db 数组搬到这里。第 13 章换成 PostgreSQL
// 只能在服务端代码里 import（Route Handler、Server Component），浏览器拿不到它
import 'server-only'
import type { Note, NoteStatus } from '@/lib/schema'

const now = () => new Date().toISOString()
const seed = (): Note[] => [
  { id: 1, title: '学会 TypeScript 类型系统', content: '类型只活在编译期。', status: 'published', tags: [], createdAt: now() },
  { id: 2, title: '理解 React 的 UI = f(state)', content: '组件是纯函数。', status: 'draft', tags: [], createdAt: now() },
  { id: 3, title: '搞懂什么时候重渲染', content: '父组件渲染，子组件默认跟着渲染。', status: 'draft', tags: [], createdAt: now() },
  { id: 4, title: '副作用该放在哪', content: '事件处理函数，或者 Effect。', status: 'draft', tags: [], createdAt: now() },
  { id: 5, title: '一条旧笔记', content: '', status: 'archived', tags: [], createdAt: now() },
]

// 开发模式下改代码会重新执行模块；挂在 globalThis 上，热更新时数据不丢
const store = globalThis as unknown as { __cloudnote?: { notes: Note[]; nextId: number } }
store.__cloudnote ??= { notes: seed(), nextId: 6 }
const state = store.__cloudnote

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

export function listNotes(status?: NoteStatus): Note[] {
  return status ? state.notes.filter((n) => n.status === status) : state.notes
}

export async function getNote(id: number): Promise<Note | undefined> {
  await sleep(400) // 让详情页的 loading.tsx 看得见（积木 11-5）
  return state.notes.find((n) => n.id === id)
}

export function createNote(data: Pick<Note, 'title' | 'content' | 'status'>): Note {
  const note: Note = { ...data, id: state.nextId++, tags: [], createdAt: now() }
  state.notes.push(note)
  return note
}

export function updateNote(id: number, patch: Partial<Pick<Note, 'title' | 'content' | 'status'>>): Note | undefined {
  const index = state.notes.findIndex((n) => n.id === id)
  if (index === -1) return undefined
  const updated = { ...state.notes[index]!, ...patch }
  state.notes[index] = updated
  return updated
}

export function deleteNote(id: number): boolean {
  const before = state.notes.length
  state.notes = state.notes.filter((n) => n.id !== id)
  return state.notes.length < before
}

export function titleExists(title: string): boolean {
  return state.notes.some((n) => n.title === title)
}
