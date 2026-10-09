// ES 模块：一个文件就是一个模块，只有 export 出去的东西外面才看得见
// 本课程约定：只用具名导出（named export），不用 export default —— 原因见积木 4-3
import type { Note, NoteStatus } from '../schema.ts' // 只用到类型，必须写 import type

const STATUS_TEXT: Record<NoteStatus, string> = {
  draft: '草稿',
  published: '已发布',
  archived: '已归档',
}

export function formatNote(note: Pick<Note, 'id' | 'title' | 'status'>): string {
  return `[${STATUS_TEXT[note.status]}] #${note.id} ${note.title}`
}

// 没有 export，模块外部访问不到（相当于 Go 里小写开头的标识符）
function internalHelper(): void {}
internalHelper()
