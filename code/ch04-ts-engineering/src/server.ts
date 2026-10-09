// 第 1 章的 server.ts，用 Zod 重写校验部分
// 运行：node src/server.ts      换端口：PORT=4000 node src/server.ts
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http'
import { z } from 'zod'
import { env } from './env.ts'
import { CreateNoteInputSchema, UpdateNoteInputSchema, type Note } from './schema.ts'

const db: Note[] = []
let nextId = 1

function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(body))
}

async function readJson(req: IncomingMessage): Promise<unknown> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  return JSON.parse(Buffer.concat(chunks).toString('utf-8')) // 返回 unknown，交给 schema 判断
}

async function handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = new URL(req.url ?? '/', 'http://localhost')
  const idMatch = url.pathname.match(/^\/api\/notes\/(\d+)$/)

  if (req.method === 'GET' && url.pathname === '/api/notes') {
    return sendJson(res, 200, { records: db, total: db.length })
  }

  if (req.method === 'POST' && url.pathname === '/api/notes') {
    const parsed = CreateNoteInputSchema.safeParse(await readJson(req))
    if (!parsed.success) return sendJson(res, 422, { error: z.flattenError(parsed.error).fieldErrors })
    const note: Note = { ...parsed.data, id: nextId++, tags: [], createdAt: new Date().toISOString() }
    db.push(note)
    return sendJson(res, 201, note)
  }

  if (req.method === 'PATCH' && idMatch) {
    const note = db.find((n) => n.id === Number(idMatch[1]))
    if (!note) return sendJson(res, 404, { error: 'NOT_FOUND' })
    const parsed = UpdateNoteInputSchema.safeParse(await readJson(req))
    if (!parsed.success) return sendJson(res, 422, { error: z.flattenError(parsed.error) })
    Object.assign(note, parsed.data)
    return sendJson(res, 200, note)
  }

  sendJson(res, 404, { error: `没有这个路由：${req.method} ${url.pathname}` })
}

createServer((req, res) => {
  handle(req, res).catch((e: unknown) => {
    // JSON.parse 失败会走到这里
    sendJson(res, e instanceof SyntaxError ? 400 : 500, { error: e instanceof Error ? e.message : '未知错误' })
  })
}).listen(env.PORT, () => console.log(`CloudNote ch04 已启动：http://localhost:${env.PORT}（${env.NODE_ENV}）`))
