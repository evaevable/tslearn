// 第 2 章实战：用类型给 CloudNote 建模
// 运行：node src/main.ts        类型检查：pnpm typecheck
import { NOTE_STATUSES, type Note, type NoteStatus } from './model.ts'

// ---------- 1. 联合类型 + never：穷尽检查 ----------
export function describeStatus(status: NoteStatus): string {
  switch (status) {
    case 'draft':
      return '草稿'
    case 'published':
      return '已发布'
    case 'archived':
      return '已归档'
    default: {
      // 三个分支都处理完了，这里的 status 被收窄成 never。
      // 如果以后有人往 NOTE_STATUSES 里加了新状态却忘了处理，这一行会编译报错。
      const unreachable: never = status
      return unreachable
    }
  }
}

// ---------- 2. 可选属性 + ?? ----------
export function formatNote(note: Note): string {
  const tagText = note.tags.length > 0 ? note.tags.map((t) => '#' + t.name).join(' ') : '无标签'
  // summary 的类型是 string | undefined，必须处理 undefined 的情况
  const summary = note.summary ?? '（尚未生成）'
  return `[${describeStatus(note.status)}] #${note.id} ${note.title}  ${tagText}\n    摘要：${summary}`
}

// ---------- 3. unknown + 一步步收窄：处理外部数据 ----------
// 类型守卫（type predicate），第 3 章细讲；这里先会用
function isNoteStatus(value: string): value is NoteStatus {
  return (NOTE_STATUSES as readonly string[]).includes(value)
}

export function parseNote(input: unknown): Note | null {
  // 第 1 步：unknown -> object
  if (typeof input !== 'object' || input === null) return null
  // 第 2 步：用 in 确认字段存在，再用 typeof 确认字段类型
  if (!('id' in input) || typeof input.id !== 'number') return null
  if (!('title' in input) || typeof input.title !== 'string') return null
  if (!('status' in input) || typeof input.status !== 'string') return null
  // 第 3 步：string -> NoteStatus
  if (!isNoteStatus(input.status)) return null
  // 走到这里，TS 已经知道 input.id 是 number、input.status 是 NoteStatus
  const content = 'content' in input && typeof input.content === 'string' ? input.content : ''
  return { id: input.id, title: input.title, content, status: input.status, tags: [], createdAt: new Date().toISOString() }
}

// ---------- 4. 结构化类型：长得像就算 ----------
type HasTitle = { title: string }
function shout(x: HasTitle): string {
  return x.title.toUpperCase()
}

// ================= 运行演示 =================
const notes: Note[] = [
  {
    id: 1,
    title: 'Learn TypeScript',
    content: '类型只活在编译期',
    status: 'published',
    tags: [{ id: 1, name: 'ts' }, { id: 2, name: '基础' }],
    createdAt: '2026-10-09T08:00:00.000Z',
    summary: '讲清楚类型擦除与结构化类型',
  },
  { id: 2, title: 'React 心智模型', content: '', status: 'draft', tags: [], createdAt: '2026-10-09T09:00:00.000Z' },
]

console.log('== 1. 格式化笔记 ==')
for (const n of notes) console.log(formatNote(n))

console.log('\n== 2. 解析外部 JSON（unknown 收窄） ==')
const inputs = [
  '{"id":3,"title":"来自接口","status":"archived"}',
  '{"id":"4","title":"id 是字符串","status":"draft"}',
  '{"id":5,"title":"状态非法","status":"deleted"}',
  '[1,2,3]',
]
for (const raw of inputs) {
  const note = parseNote(JSON.parse(raw))
  console.log(note ? `通过  -> ${formatNote(note).split('\n')[0]}` : `拒绝  <- ${raw}`)
}

console.log('\n== 3. 结构化类型 ==')
const book = { title: 'go in action', isbn: '978-1617291784' }
console.log(shout(notes[0]!)) // Note 有 title，可以传
console.log(shout(book)) // 任何有 title: string 的对象都可以传，不需要声明"实现了 HasTitle"
// @ts-expect-error 对象字面量直接传入时会做"多余属性检查"，isbn 不在 HasTitle 里
console.log(shout({ title: 'literal', isbn: '123' }))

console.log('\n== 4. 字面量类型推断 ==')
let s1 = 'draft' // 推断为 string：let 以后还可能被改成别的字符串
const s2 = 'draft' // 推断为 'draft'：const 永远不会变
const ok: NoteStatus = s2
// @ts-expect-error string 不能赋给 'draft' | 'published' | 'archived'
const bad: NoteStatus = s1
console.log('const 推断出的字面量可以当 NoteStatus 用：', ok, '| let 版本运行时也是：', bad)
s1 = 'anything'
