// 第 1 章实战：零依赖跑通「浏览器 -> 服务端 -> 数据 -> 浏览器」的完整旅程
// 运行：node server.ts   （Node >= 22.18 默认支持直接运行 .ts，会自动擦除类型注解）
import { createServer } from 'node:http'
import type { IncomingMessage, ServerResponse } from 'node:http'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

// ---------- 1. 数据模型：前后端共用的"契约" ----------
type Note = {
  id: number
  title: string
  createdAt: string
}

// 用内存数组假装数据库（第 13 章会换成 PostgreSQL）
const db: Note[] = [
  { id: 1, title: '学会 TypeScript 类型系统', createdAt: new Date().toISOString() },
  { id: 2, title: '理解 React 的 UI = f(state)', createdAt: new Date().toISOString() },
]
let nextId = 3

// ---------- 2. 小工具：统一返回 JSON ----------
function sendJson(res: ServerResponse, status: number, body: unknown): void {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
  res.end(JSON.stringify(body))
}

// 读取请求体（Node 原生 API 是流式的，要自己拼起来）
async function readBody(req: IncomingMessage): Promise<string> {
  const chunks: Buffer[] = []
  for await (const chunk of req) chunks.push(chunk as Buffer)
  return Buffer.concat(chunks).toString('utf-8')
}

// ---------- 3. 路由：按 method + path 分发 ----------
async function handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
  const url = new URL(req.url ?? '/', 'http://localhost')
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${url.pathname}`)

  // GET /api/notes -> 列表
  if (req.method === 'GET' && url.pathname === '/api/notes') {
    // 故意延迟 600ms，方便你在 DevTools 里观察 loading 状态
    await new Promise((r) => setTimeout(r, 600))
    return sendJson(res, 200, { records: db, total: db.length })
  }

  // POST /api/notes -> 新增
  if (req.method === 'POST' && url.pathname === '/api/notes') {
    let payload: unknown
    try {
      payload = JSON.parse(await readBody(req))
    } catch {
      return sendJson(res, 400, { error: '请求体不是合法 JSON' })
    }
    // 后端必须自己校验：永远不要相信浏览器发来的数据（第 4 章用 Zod 改写）
    const title =
      typeof payload === 'object' && payload !== null && 'title' in payload
        ? (payload as { title: unknown }).title
        : undefined
    if (typeof title !== 'string' || title.trim() === '') {
      return sendJson(res, 422, { error: 'title 必须是非空字符串' })
    }
    const note: Note = { id: nextId++, title: title.trim(), createdAt: new Date().toISOString() }
    db.push(note)
    return sendJson(res, 201, note)
  }

  // GET / -> 返回页面（这一步就是"服务端把 HTML 发给浏览器"）
  if (req.method === 'GET' && (url.pathname === '/' || url.pathname === '/index.html')) {
    const html = await readFile(join(import.meta.dirname, 'public', 'index.html'), 'utf-8')
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    return void res.end(html)
  }

  sendJson(res, 404, { error: `没有这个路由：${req.method} ${url.pathname}` })
}

const PORT = Number(process.env.PORT ?? 3000)
createServer((req, res) => {
  handle(req, res).catch((err: unknown) => {
    console.error(err)
    sendJson(res, 500, { error: '服务器内部错误' })
  })
}).listen(PORT, () => {
  console.log(`CloudNote ch01 已启动：http://localhost:${PORT}`)
})
