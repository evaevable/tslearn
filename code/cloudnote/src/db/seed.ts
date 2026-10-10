// 种子数据：node --env-file=.env src/db/seed.ts
// 幂等：先清空再插入，反复执行结果一致
import { sql } from 'drizzle-orm'
import { db } from './index.ts'
import { notes } from './schema.ts'

const seed = [
  { title: '学会 TypeScript 类型系统', content: '类型只活在编译期。', status: 'published' as const },
  { title: '理解 React 的 UI = f(state)', content: '组件是纯函数。', status: 'draft' as const },
  { title: '搞懂什么时候重渲染', content: '父组件渲染，子组件默认跟着渲染。', status: 'draft' as const },
  { title: '副作用该放在哪', content: '事件处理函数，或者 Effect。', status: 'draft' as const },
  { title: '一条旧笔记', content: '', status: 'archived' as const },
]

// TRUNCATE ... RESTART IDENTITY：清空并把自增 id 重置回 1
await db.execute(sql`truncate table ${notes} restart identity`)
const inserted = await db.insert(notes).values(seed).returning({ id: notes.id, title: notes.title })
for (const row of inserted) console.log(`#${row.id} ${row.title}`)
console.log(`已写入 ${inserted.length} 条笔记`)
process.exit(0)
