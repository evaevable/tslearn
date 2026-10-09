// reducer：把「笔记列表会发生的所有变化」收拢到一个纯函数里
// 形状就是第 3 章的可辨识联合 NoteEvent + never 穷尽检查
import type { Note } from './types'

export type NoteAction =
  | { type: 'added'; title: string }
  | { type: 'toggled'; id: number }
  | { type: 'deleted'; id: number }
  | { type: 'archivedAll' }

// 纯函数：(旧 state, 动作) => 新 state。不发请求、不改入参、不读全局变量
export function notesReducer(notes: Note[], action: NoteAction): Note[] {
  switch (action.type) {
    case 'added': {
      const id = Math.max(0, ...notes.map((n) => n.id)) + 1
      return [...notes, { id, title: action.title, status: 'draft' }]
    }
    case 'toggled':
      return notes.map((n) =>
        n.id === action.id ? { ...n, status: n.status === 'published' ? 'draft' : 'published' } : n,
      )
    case 'deleted':
      return notes.filter((n) => n.id !== action.id)
    case 'archivedAll':
      return notes.map((n) => (n.status === 'archived' ? n : { ...n, status: 'archived' }))
    default: {
      const unreachable: never = action
      return unreachable
    }
  }
}

export const initialNotes: Note[] = [
  { id: 1, title: '学会 TypeScript 类型系统', status: 'published' },
  { id: 2, title: '理解 React 的 UI = f(state)', status: 'draft' },
  { id: 3, title: '搞懂什么时候重渲染', status: 'draft' },
]
