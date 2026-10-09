// 第 9 章后端：沿用第 8 章；写操作统一延迟 800ms，并支持 X-Simulate-Failure 请求头模拟故障（演示乐观更新回滚）
// 运行：pnpm api（等价于 node --watch server/server.ts），默认 3000 端口
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { z } from 'zod'
import { CreateNoteInputSchema, NoteStatusSchema, UpdateNoteInputSchema, type Note } from './schema.ts'

const now = () => new Date().toISOString()
const db: Note[] = [
  { id: 1, title: '学会 TypeScript 类型系统', content: '', status: 'published', tags: [], createdAt: now() },
  { id: 2, title: '理解 React 的 UI = f(state)', content: '', status: 'draft', tags: [], createdAt: now() },
  { id: 3, title: '搞懂什么时候重渲染', content: '', status: 'draft', tags: [], createdAt: now() },
  { id: 4, title: '副作用该放在哪', content: '', status: 'draft', tags: [], createdAt: now() },
  { id: 5, title: '一条旧笔记', content: '', status: 'archived', tags: [], createdAt: now() },
]
let nextId = 6

// 人为延迟：不带筛选的全量查询更慢（1200ms），带筛选的快（300ms）——用来复现竞态（积木 7-5）
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(body))
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  return JSON.parse(Buffer.concat(chunks).toString('utf-8'))
}

async function handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = new URL(req.url ?? '/', 'http://localhost')
  const idMatch = url.pathname.match(/^\/api\/notes\/(\d+)$/)
  console.log(`${req.method} ${url.pathname}${url.search}`)

  if (req.method !== 'GET') {
    await sleep(800) // 写操作慢一点，才看得出乐观更新「先变后确认」
    if (req.headers['x-simulate-failure']) return sendJson(res, 503, { error: '模拟服务端故障' })
  }

  if (req.method === 'GET' && url.pathname === '/api/notes') {
    const raw = url.searchParams.get('status')
    const status = raw === null ? null : NoteStatusSchema.safeParse(raw)
    if (status && !status.success) return sendJson(res, 422, { error: `非法的 status：${raw}` })
    await sleep(status ? 300 : 1200)
    const records = status ? db.filter((n) => n.status === status.data) : db
    return sendJson(res, 200, { records, total: records.length })
  }

  if (req.method === 'POST' && url.pathname === '/api/notes') {
    const parsed = CreateNoteInputSchema.safeParse(await readJson(req))
    if (!parsed.success) return sendJson(res, 422, { error: z.flattenError(parsed.error).fieldErrors })
    // 需要查数据库才能判断的规则，前端校验不了：返回同样的 fieldErrors 结构，前端显示在对应输入框下
    if (db.some((n) => n.title === parsed.data.title)) {
      return sendJson(res, 422, { error: { title: ['已有同名笔记'] } })
    }
    const note: Note = { ...parsed.data, id: nextId++, tags: [], createdAt: now() }
    db.push(note)
    return sendJson(res, 201, note)
  }

  if (idMatch) {
    const index = db.findIndex((n) => n.id === Number(idMatch[1]))
    if (index === -1) return sendJson(res, 404, { error: 'NOT_FOUND' })

    if (req.method === 'PATCH') {
      const parsed = UpdateNoteInputSchema.safeParse(await readJson(req))
      if (!parsed.success) return sendJson(res, 422, { error: z.flattenError(parsed.error).formErrors.join('；') })
      const updated = { ...db[index]!, ...parsed.data }
      db[index] = updated
      return sendJson(res, 200, updated)
    }
    if (req.method === 'DELETE') {
      db.splice(index, 1)
      res.writeHead(204)
      return void res.end()
    }
  }

  sendJson(res, 404, { error: `没有这个路由：${req.method} ${url.pathname}` })
}

const PORT = Number(process.env.API_PORT ?? 3000)
createServer((req, res) => {
  handle(req, res).catch((e: unknown) => {
    sendJson(res, e instanceof SyntaxError ? 400 : 500, { error: e instanceof Error ? e.message : '未知错误' })
  })
}).listen(PORT, () => console.log(`CloudNote API 已启动：http://localhost:${PORT}`))
