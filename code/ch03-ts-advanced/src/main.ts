// 第 3 章实战：泛型 + 工具类型 + 类型收窄
// 运行：node src/main.ts        类型检查：pnpm typecheck
import type { CreateNoteInput, Note, NoteEvent, NoteListItem, UpdateNoteInput } from './model.ts'
import { MemoryRepo } from './repo.ts'

// ---------- 1. 泛型函数 + keyof 约束 ----------
// K 必须是 T 的某个键；返回值类型 T[K] 会自动算出来
function pluck<T, K extends keyof T>(items: T[], key: K): T[K][] {
  return items.map((item) => item[key])
}

// ---------- 2. 类型守卫与断言函数 ----------
function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim() !== ''
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) throw new Error(message)
}

// ---------- 3. 可辨识联合：按 type 字段分支 ----------
const repo = new MemoryRepo<Note>()

function createNote(input: CreateNoteInput): Note {
  assert(isNonEmptyString(input.title), 'title 不能为空')
  return repo.create({ ...input, status: input.status ?? 'draft', tags: [], createdAt: new Date().toISOString() })
}

function apply(event: NoteEvent): string {
  switch (event.type) {
    case 'created': {
      const note = createNote(event.input) // 这里 TS 知道 event 一定有 input
      return `新增 #${note.id} ${note.title}`
    }
    case 'updated': {
      const result = repo.update(event.id, event.patch) // 这里 TS 知道 event 一定有 id 和 patch
      // 不先判断 ok，就拿不到 value —— 比 Go 的 if err != nil 更强制
      if (!result.ok) return `更新 #${event.id} 失败：${result.error}`
      return `更新 #${event.id} -> ${result.value.title} [${result.value.status}]`
    }
    case 'deleted':
      return repo.delete(event.id) ? `删除 #${event.id}` : `删除 #${event.id} 失败：NOT_FOUND`
    default: {
      const unreachable: never = event
      return unreachable
    }
  }
}

// ---------- 4. 工具类型把关接口参数 ----------
function toListItem({ content: _content, ...rest }: Note): NoteListItem {
  return rest // 解构去掉 content，剩下的正好是 Omit<Note, 'content'>
}

// ================= 运行演示 =================
console.log('== 1. 事件流（可辨识联合 + Result） ==')
const events: NoteEvent[] = [
  { type: 'created', input: { title: '学泛型', content: 'Go 1.18 才有，TS 一直都有' } },
  { type: 'created', input: { title: '学工具类型', content: 'Pick / Omit / Partial', status: 'published' } },
  { type: 'updated', id: 1, patch: { status: 'published' } },
  { type: 'updated', id: 99, patch: { title: '不存在' } },
  { type: 'deleted', id: 2 },
]
for (const e of events) console.log(apply(e))

console.log('\n== 2. 断言函数拦截非法输入 ==')
try {
  apply({ type: 'created', input: { title: '   ', content: '' } })
} catch (e) {
  // catch 到的 e 类型是 unknown：JS 里 throw 什么都可以，不一定是 Error
  console.log('拦截：', e instanceof Error ? e.message : String(e))
}

console.log('\n== 3. 泛型分页 + 列表项去掉正文 ==')
createNote({ title: '第三条', content: '很长很长的正文……' })
const page = repo.list(1, 10)
console.log(`共 ${page.total} 条：`, page.records.map(toListItem))

console.log('\n== 4. pluck：返回类型自动推导 ==')
const titles = pluck(page.records, 'title') // string[]
const ids = pluck(page.records, 'id') // number[]
console.log(titles, ids)
// @ts-expect-error 'titel' 不是 Note 的键
pluck(page.records, 'titel')

console.log('\n== 5. 工具类型拒绝不合法的参数 ==')
// @ts-expect-error UpdateNoteInput 里没有 id，不允许改主键
const badPatch: UpdateNoteInput = { id: 3 }
// @ts-expect-error CreateNoteInput 要求 content 必填
const badCreate: CreateNoteInput = { title: '缺正文' }
console.log('这两行在 tsc 下都会报错，运行时只是普通对象：', badPatch, badCreate)
