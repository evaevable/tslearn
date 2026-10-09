// 第 4 章实战：Zod 运行时校验 + tsconfig 严格选项
// 运行：node src/main.ts        类型检查：pnpm typecheck
import { z } from 'zod'
import { CreateNoteInputSchema, NoteSchema, UpdateNoteInputSchema, type Note } from './schema.ts'
import { formatNote } from './lib/format.ts'

// ---------- 1. 第 2 章十几行的 parseNote，现在一行 ----------
const parseNote = (input: unknown) => NoteSchema.safeParse(input)

console.log('== 1. safeParse：校验外部数据 ==')
const inputs: unknown[] = [
  { id: 1, title: '学 Zod', content: '', status: 'published', tags: [], createdAt: '2026-10-09T08:00:00.000Z' },
  { id: '2', title: '   ', content: '', status: 'deleted', tags: [], createdAt: '昨天' },
]
for (const input of inputs) {
  const result = parseNote(input)
  if (result.success) {
    // result.data 的类型就是 Note —— 这次是「验证过的」，不是「声称的」
    console.log('通过：', formatNote(result.data))
  } else {
    console.log('拒绝：\n' + z.prettifyError(result.error))
  }
}

console.log('\n== 2. 给前端用的字段级错误 ==')
const bad = CreateNoteInputSchema.safeParse({ title: '' })
if (!bad.success) console.log(JSON.stringify(z.flattenError(bad.error).fieldErrors))

console.log('\n== 3. 清洗 + 默认值：input 和 output 不一样 ==')
const created = CreateNoteInputSchema.parse({ title: '  前后有空格  ' })
console.log(created) // trim 掉了空格，补上了 content 和 status

console.log('\n== 4. PATCH 校验：空对象被拒绝，不会被默认值污染 ==')
console.log(UpdateNoteInputSchema.safeParse({ status: 'archived' }).data)
const empty = UpdateNoteInputSchema.safeParse({})
console.log(empty.success ? empty.data : z.flattenError(empty.error).formErrors)

console.log('\n== 5. noUncheckedIndexedAccess：数组下标可能越界 ==')
const notes: Note[] = []
const first = notes[0] // 类型：Note | undefined
console.log('可选链 first?.title =', first?.title)
// @ts-expect-error 开了 noUncheckedIndexedAccess，notes[0] 可能是 undefined
console.log(notes.length > 0 ? notes[0].title : '空列表，不访问')
// 非空断言 !：你向编译器保证「这里一定不是 undefined」，和 as 一样是担保不是证明
const sure = [{ id: 9, title: '一定存在', status: 'draft' as const }][0]!
console.log('非空断言', formatNote(sure))
