# 第 13 章　数据层：Server Actions、Route Handlers 与 PostgreSQL

> **本章导读**
>
> - 建议用时：180 分钟（阅读 70 分钟 + 实战 110 分钟）
> - 前置知识：第 4 章（Zod）、第 7~9 章（API 层、TanStack Query）、第 11-12 章（App Router、缓存与渲染模式）
> - 读完你能回答：
>   1. 数据库和 ORM 在项目里怎么组织？迁移、种子数据怎么做？
>   2. Server Action 是什么？它和 Route Handler 各自适合什么场景？
>   3. 写入数据之后，怎么让缓存失效，用户马上看到自己的修改？
>   4. 开了 Cache Components 之后，代码要满足哪些新约束？

---

## 【积木 13-1】内存数组的尽头

第 4~12 章的数据一直存在一个模块级数组里：

```ts
const store = globalThis as unknown as { __cloudnote?: { notes: Note[]; nextId: number } }
```

它能撑过十几章的练习，是因为我们一直在讲「前端怎么拿数据」。但真实项目里数组不够用了：**重启就丢、多进程不共享、没法用 SQL 查询、没有事务**。后端同学最熟悉的那套东西要上场了。

| 层 | 第 12 章 | 第 13 章 |
|---|---|---|
| 存储 | 进程内数组 | **PostgreSQL**（表、约束、事务） |
| 访问方式 | `array.find/filter/push` | **Drizzle ORM**（类型安全的 SQL） |
| 表结构 | 代码里手写类型 | `src/db/schema.ts` + **迁移文件** |
| 初始化数据 | 硬编码在 db.ts | `pnpm db:seed` |
| 写操作入口 | Route Handler（fetch） | **Server Action**（表单直调） |

---

## 【积木 13-2】起一个 PostgreSQL，写第一张表

生产环境用云数据库，本地开发用一个容器就够了。本章提供 `docker-compose.yml`：

```yaml
services:
  db:
    image: postgres:17-alpine
    environment:
      POSTGRES_USER: cloudnote
      POSTGRES_PASSWORD: cloudnote
      POSTGRES_DB: cloudnote
    ports: ['5432:5432']
    volumes: [db-data:/var/lib/postgresql/data]
```

```bash
docker compose up -d          # 一条命令起库
psql "postgres://cloudnote:cloudnote@127.0.0.1:5432/cloudnote" -c 'select 1'
```

> 本机没装 Docker 也能做本章：用 Homebrew 的 Postgres 同样跑得通——
> `brew services start postgresql@14`，再执行
> `psql -d postgres -c "create role cloudnote login password 'cloudnote'"` 和
> `createdb -O cloudnote cloudnote`。本章的实测就是用这条路线做的（Docker 守护进程没起）。
> 换句话说：**数据库在哪不重要，连接串一致就行**——这正是 `DATABASE_URL` 存在的意义。

### 用 TS 定义表

```ts
// src/db/schema.ts
export const noteStatusEnum = pgEnum('note_status', ['draft', 'published', 'archived'])

export const notes = pgTable('notes', {
  id: serial('id').primaryKey(),
  title: varchar('title', { length: 100 }).notNull(),
  content: text('content').notNull().default(''),
  status: noteStatusEnum('status').notNull().default('draft'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
})

export type NoteRow = typeof notes.$inferSelect   // 查询出来的行
export type NoteInsert = typeof notes.$inferInsert // 插入时需要提供的字段
```

几个对照点：

| SQL / Go | Drizzle |
|---|---|
| `CREATE TYPE ... AS ENUM` | `pgEnum('note_status', [...])` |
| `bigserial PRIMARY KEY` | `serial('id').primaryKey()` |
| `NOT NULL DEFAULT now()` | `.notNull().defaultNow()` |
| `sqlc` 由 SQL 生成 Go struct | Drizzle 由 TS 定义**推导**类型（`$inferSelect`） |
| `database/sql` + 手写 SQL | `db.select().from(notes).where(...)`，编译期检查列名 |

**`pgEnum` 不是摆设**：它把「状态只能是三个值之一」这条规则压到了数据库层。第 4 章说过「服务端校验才是安全边界」，而数据库约束是最后一道——就算有人绕过应用直接用 SQL 写入非法值，数据库也会拒绝。

### 迁移：把表结构的变化记录下来

不要手写 `CREATE TABLE`，也不要指望 ORM 自动猜。用**迁移**（migration）：每次改 schema 生成一个 SQL 文件，按顺序执行，执行记录写进数据库。

```bash
pnpm db:generate   # 对比 schema 与上一次的迁移，生成 drizzle/0000_xxx.sql
pnpm db:migrate    # 执行未跑过的迁移（脚本：node --env-file=.env scripts/migrate.ts）
pnpm db:seed       # 写入种子数据
```

生成的 SQL 长这样（可以、也应该打开看一眼）：

```sql
CREATE TYPE "public"."note_status" AS ENUM('draft', 'published', 'archived');
CREATE TABLE "notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(100) NOT NULL,
	"content" text DEFAULT '' NOT NULL,
	"status" "note_status" DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
```

**迁移文件要提交到 git**，它和 Go 项目里的 `migrations/*.sql` 是完全一样的东西。团队协作时，同事 `git pull` 之后跑一次 `pnpm db:migrate` 就同步了。生产上线时这一步放进发布流程（第 17 章）。

`drizzle-kit studio` 会起一个网页版的数据浏览器，改数据、看表结构比 psql 直观，第 18 章会用来核对数据。

---

## 【积木 13-3】数据访问层：把数据库关在一个文件里

```ts
// src/db/index.ts —— 连接池只建一次（和 Go 的 sql.DB 一样，别每次查询都 New）
const client = postgres(connectionString, { max: 5 })
export const db = globalForDb.__cloudnoteDb ?? drizzle(client, { schema })

// src/lib/db.ts —— 应用层看到的数据接口，签名与第 4~12 章完全一样
export async function listNotes(status?: NoteStatus): Promise<Note[]>
export async function getNote(id: number): Promise<Note | undefined>
export async function createNote(...): Promise<Note>
export async function updateNote(...): Promise<Note | undefined>
export async function deleteNote(id: number): Promise<boolean>
```

上层一行没改：页面、Route Handler、Server Action 都还是调用 `listNotes` / `getNote`。**这就是第 8 章「抽 Hook」、第 9 章「只改内部」的同一种思路在服务端的版本**——数据源换了，接口不变。

两个细节：

- **`import 'server-only'` 放在 `src/lib/db.ts`，不能放在 `src/db/index.ts`。** 后者要被种子脚本（一个普通 Node 进程）导入，而 `server-only` 在非 Next 环境里会直接抛错。实测踩过这个坑，注释里留了记录。
- **查询函数里有一行 `logQuery`**，每次真查库就打一行日志。它不是调试残留，而是本章验证缓存是否生效的手段（积木 13-5）。

```ts
export async function titleExists(title: string, exceptId?: number): Promise<boolean> {
  const where = exceptId ? and(eq(notes.title, title), sql`${notes.id} <> ${exceptId}`) : eq(notes.title, title)
  const rows = await db.select({ id: notes.id }).from(notes).where(where).limit(1)
  return rows.length > 0
}
```

`and` / `eq` / `sql` 这些构造出来的条件是**参数化**的：`sql\`${notes.id} <> ${exceptId}\`` 会被转成 `$1` 占位符，不是字符串拼接。SQL 注入在这里和 `database/sql` 一样无从下手——但前提是你别自己拼字符串。

---

## 【积木 13-4】开启 Cache Components：代码要满足的新约束

第 12 章末尾预告过它。本章在 `next.config.ts` 里打开：

```ts
const nextConfig: NextConfig = {
  cacheComponents: true,
  partialPrefetching: true,
}
```

打开它之后，构建输出多了一种符号：

```
Route (app)          Revalidate  Expire
├ ○ /lab/csr
├ ◐ /lab/hydration
├ ○ /lab/ssg                 1m      1h
├ ƒ /lab/ssr
├ ◐ /lab/streaming          30d      1y
└ ◐ /notes

○  (Static)             prerendered as static content
◐  (Partial Prerender)  prerendered as static HTML with dynamic server-streamed content
ƒ  (Dynamic)            server-rendered on demand
```

`◐` 就是第 12 章积木 12-8 说的 **PPR**：页面有一份静态外壳（能直接放 CDN），动态部分在请求时流式补上。

**但打开它是有代价的：Next 不再允许你在预渲染阶段悄悄使用「请求时数据」。** 报错信息本身就是最好的教材，本章实测遇到了四次，每一次的修法都是它建议的那几招：

| 报错 | 代码里的原因 | 修法 |
|---|---|---|
| `Route "/lab/hydration": encountered uncached or runtime data` | 页面顶层 `await props.searchParams` | **[stream]** 把读参数的子组件放进 `<Suspense>` |
| `Route "/lab/ssg/[id]": encountered the unstable value new Date()` | 预渲染时 `new Date()` 的值不稳定 | **[cache]** 用 `'use cache'` 包一层（`nowCached()`） |
| `Route "/lab/ssg/[id]": ...` 同类 | 未缓存的数据库读 | 缓存它，或放进 `<Suspense>` |
| `Route "/notes/[id]": encountered URL data usePathname() in a Client Component outside of <Suspense>` | 根布局里的导航用 `usePathname()` 高亮当前页 | 包一层 `<Suspense fallback={<MainNavFallback/>}>`：**读 URL 的组件要准备一个不读 URL 的替身** |
| `Route "/lab/ssr": ... connection()` | 明确要每次请求渲染 | **[block]** `export const instant = false`，声明「这个路由就是要等数据」 |

**这份清单值得抄进笔记**：以后只要看到 `encountered ... during prerendering`，先问自己「这份数据该缓存、该流式、还是该阻塞」，三选一。

---

## 【积木 13-5】用 `'use cache'` 让详情页只查一次库

第 11 章留过一个尾巴：笔记详情页里，`generateMetadata` 和页面组件都调用了 `getNote`，是不是查了两次数据库？

先看结论（本章实测，服务端日志）：

| 请求 | 数据库查询 |
|---|---|
| 第一次 `GET /notes/2` | `[db] select note id=2` × 1 |
| 第二次 `GET /notes/2` | **0 次**（缓存命中） |

秘密就是 `'use cache'`：

```ts
export async function getNote(id: number): Promise<Note | undefined> {
  'use cache'
  cacheLife('minutes')            // 缓存活多久：这里一分钟；还有 seconds/hours/days/max
  cacheTag('notes', `note-${id}`) // 打标签，写操作后可以按标签失效
  logQuery(`select note id=${id}`)
  const [row] = await db.select().from(notes).where(eq(notes.id, id))
  return row ? toNote(row) : undefined
}
```

三个概念：

| 指令 / 函数 | 作用 | 类比（后端） |
|---|---|---|
| `'use cache'` | 这个函数的返回值进缓存，**参数自动成为缓存键的一部分** | 给函数加一层 Redis 缓存，key 由参数拼 |
| `cacheLife('minutes')` | 缓存的有效期 | Redis 的 TTL |
| `cacheTag('notes')` | 给缓存打标签，可按标签批量失效 | Redis 里给 key 打业务标签，写库后按标签清 |

`listNotes` 也加了同样的三行。于是 `/notes?status=draft` 这一页的笔记列表，第一次请求查一次库，之后一分钟内直接复用；而这个列表**是服务端渲染进 HTML 的**——用 curl 就能看到内容：

```bash
curl -s 'http://localhost:3000/notes?status=draft' | grep -c 'data-testid="title"'
# 3      ← 不需要 JavaScript，列表就已经在 HTML 里了
```

第 12 章练习 8 里「禁用 JS 后 /notes 显示加载中」的问题，在这一章解决了：数据在服务端查好再发出去。

---

## 【积木 13-6】Server Action：表单直接调用服务端函数

到这里，写操作还是走第 9 章那套：浏览器 `fetch` → Route Handler → 数据库，再让 TanStack Query 失效重拉。Next.js 提供了另一种方式：

```ts
// src/app/notes/actions.ts
'use server'      // ← 文件顶部的指令：下面导出的函数都能被客户端调用，但只在服务端执行

export async function toggleNoteAction(formData: FormData): Promise<void> {
  const id = z.coerce.number().int().positive().parse(formData.get('id'))
  const nextStatus = formData.get('nextStatus') === 'published' ? 'draft' : 'published'
  await updateNote(id, { status: nextStatus })
  updateTag('notes')          // 让缓存失效
  revalidatePath('/notes')    // 让这一页重新渲染
}
```

```tsx
// 服务端组件里直接用
<form action={toggleNoteAction}>
  <input type="hidden" name="id" value={note.id} />
  <input type="hidden" name="nextStatus" value={note.status} />
  <Button type="submit">发布</Button>
</form>
```

**没有 URL、没有 fetch、没有 JSON 序列化、没有手写 loading 状态。** 浏览器把表单数据交给服务端函数执行，执行完把最新页面流回来——注意，这是 React 19 的表单机制，不是「整页刷新」。

需要「提交中」和字段级错误时用 `useActionState`（`src/components/NoteFormAction.tsx`）：

```tsx
const [state, formAction, pending] = useActionState(createNoteAction, { ok: false })

<form ref={formRef} action={formAction} className="grid gap-4">
  <Input name="title" aria-invalid={Boolean(state.fieldErrors?.title)} />
  {state.fieldErrors?.title?.[0] && <p role="alert">{state.fieldErrors.title[0]}</p>}
  <Button type="submit" disabled={pending}>{pending ? '提交中...' : '添加'}</Button>
</form>
```

和第 8 章那份手写表单相比，少了：`fetch` 调用、try/catch、手工维护 `submitting`、手工把 `fieldErrors` 塞回 state。**校验代码完全没变**——仍然是第 4 章的 `CreateNoteInputSchema`。

实测（生产构建 + 浏览器自动化）：

| 操作 | 结果 | 数据库 |
|---|---|---|
| 打开 `/notes` | 「当前筛选 all，共 5 条」 | — |
| 在 Action 表单里填标题并提交 | 列表立刻变成「共 6 条」，末行是新笔记 | `insert note` → 新行 `id=6, status=draft` |
| 点新行的「发布」 | 徽标变成「已发布」 | `update note id=6` → `status=published` |
| 点 `/lab/csr`（TanStack 版本） | 「浏览器拉到 6 条笔记」 | 说明两套方式并存，都正常 |

![第 13 章的笔记页（服务端渲染 + Server Action）](assets/ch13-notes.png)

### Server Action vs Route Handler

| | Server Action | Route Handler（`route.ts`） |
|---|---|---|
| 调用方式 | 组件里 `action={fn}` 或直接调用函数 | HTTP 请求（fetch / curl / 手机 App） |
| 适合 | **自己页面上的写操作**：表单、按钮 | 给外部用的接口、webhook、需要自定义响应头/状态码 |
| 类型安全 | 端到端 TS：参数和返回值都有类型 | 手写 Zod 校验请求体，返回 `Response.json` |
| 能不能被第三方调用 | 不能（协议是 React 私有的） | 能 |
| 本章哪里用了 | `/notes` 的增删改 | `/api/notes/*`（第 7 章起的接口，保留） |

判断标准很直接：**给浏览器里的自己用 → Server Action；给外面的世界用 → Route Handler。** CloudNote 两套都留着，正好对照。

### 写完之后：缓存怎么失效

| 函数 | 语义 | 用在哪 |
|---|---|---|
| `updateTag('notes')` | **立即失效**，用户马上看到自己的修改 | Server Action（read-your-own-writes） |
| `revalidateTag('notes')` | stale-while-revalidate：先给旧内容，后台再更新 | 可以容忍短暂延迟的场景（如商品列表） |
| `revalidatePath('/notes')` | 让某条路径的页面重新渲染 | 和上面配合使用 |
| `refresh()` | 只刷新客户端路由缓存，不动数据缓存 | 轻量场景 |

本章实测的完整链路：点「发布」→ `update note`（写库）→ `updateTag`（清缓存）→ 页面重新渲染时 `select notes` 再查一次（日志里紧跟着一条）→ 浏览器看到新状态。

---

## 【积木 13-7】两套写法的取舍

现在 CloudNote 里有两条完整的数据链路，值得对比清楚，因为**这是 AI 生成的代码最容易混用的地方**：

| | 服务端渲染 + Server Action（`/notes`） | 客户端渲染 + TanStack Query（`/lab/csr`、第 9 章） |
|---|---|---|
| 数据在哪查 | 服务端（页面里 `await listNotes()`） | 浏览器（`useQuery` → `/api/notes`） |
| 首屏 | HTML 里就有内容，禁用 JS 也能看 | 先「加载中」，等 JS + 请求 |
| 写操作 | Server Action，之后按标签失效 | mutation + `invalidateQueries` |
| 缓存 | 服务端缓存（`'use cache'`），多用户共享 | 浏览器内存缓存，每个用户各一份 |
| 交互体验 | 提交后整段重渲染（可配乐观更新，做法不同） | 天然支持乐观更新、无限滚动、后台刷新 |
| 适合 | 以内容为主、需要 SEO 和首屏速度的页面 | 高度交互、频繁局部更新、数据只给自己看 |
| 包体积 | 小（组件在服务端） | 大（Query、组件都要下发） |

不是「谁淘汰谁」，而是分工。CloudNote 现在的选择是：**列表和详情走服务端（内容型），交互密集的页面保留 TanStack（第 9 章那套代码原样还在 `/lab/csr` 与 `hooks/` 里）**。

给 AI 的指令也要写清楚，否则它会两套混着用——既写 `useQuery` 又写 Server Action，导致「提交成功但列表不刷新」。第 18 章的规则文件里会把这条写进去。

---

## 【积木 13-8】实战：CloudNote 换数据库

代码在 [`code/cloudnote/`](../code/cloudnote/)，本章改动：

```
cloudnote/
├── docker-compose.yml           # 新增：本地 PostgreSQL
├── .env.example                 # 新增：DATABASE_URL 模板（.env 已加入 .gitignore）
├── drizzle.config.ts            # 新增：Drizzle Kit 配置
├── drizzle/0000_*.sql           # 新增：迁移文件（提交到 git）
├── scripts/migrate.ts           # 新增：执行迁移
└── src/
    ├── db/
    │   ├── schema.ts            # 新增：notes 表 + pgEnum + $inferSelect 类型
    │   ├── index.ts             # 新增：连接池 + drizzle 实例
    │   └── seed.ts              # 新增：种子数据
    ├── lib/db.ts                # 重写：内存数组 → PostgreSQL，签名不变 + 'use cache'
    ├── app/notes/actions.ts     # 新增：Server Actions（create / toggle / delete）
    ├── app/notes/page.tsx       # 重写：服务端渲染 + Suspense + Server Action 表单
    └── components/NoteFormAction.tsx  # 新增：useActionState 表单
```

依赖（2026-10 实测版本）：`drizzle-orm@0.45.4`、`postgres@3.4.9`（postgres-js 驱动）、`drizzle-kit@0.31.11`。

```bash
cd code/cloudnote
pnpm install
docker compose up -d        # 或用本机 Postgres，见积木 13-2
cp .env.example .env
pnpm db:migrate             # 建表
pnpm db:seed                # 5 条种子数据
pnpm build && pnpm start    # 或 pnpm dev
```

本章全部实测结果：

| 实验 | 结果 |
|---|---|
| `pnpm db:generate` | 生成 `drizzle/0000_*.sql`（含 `CREATE TYPE note_status`） |
| `pnpm db:migrate` / `db:seed` | 建表成功；`select count(*) from notes` = 5 |
| 第一次 `GET /notes/2` | 服务端日志 `[db] select note id=2` × **1**（`generateMetadata` 与页面共用缓存） |
| 第二次 `GET /notes/2` | **0 次查询** |
| `curl '/notes?status=draft'` | HTML 里 3 个列表项，禁 JS 也有内容 |
| `/lab/ssg` 两次请求 | 时间戳相同（缓存 + 静态外壳） |
| `/lab/streaming` 分块计时 | 166ms 外壳 → 1170ms 快区块 → 2669ms 慢区块 |
| Server Action 新增 + 发布 | UI 自动更新为 6 条 / 已发布；psql 里 `id=6, status=published` |
| `/lab/csr`（TanStack） | 仍正常：「浏览器拉到 6 条笔记」 |
| `next build` | 路由符号：`○` / `◐` / `ƒ` 三种都有 |

### 动手练习

| 练习 | 操作 | 预期结果 |
|---|---|---|
| 1 | 给 `notes` 表加一个 `pinned boolean not null default false` 字段，跑 `db:generate` + `db:migrate` | 生成第二个迁移文件；数据库里出现新列 |
| 2 | 直接 `psql` 执行 `insert into notes (title, status) values ('x', 'deleted')` | 数据库报错：`invalid input value for enum note_status`（积木 13-2 的最后一道防线） |
| 3 | 注释掉 `getNote` 里的 `'use cache'`，请求两次 `/notes/2` | 每次请求都出现 `[db] select note id=2`，可能两次（`generateMetadata` + 页面） |
| 4 | 把 `createNoteAction` 里的 `updateTag('notes')` 删掉 | 提交成功但列表还是旧的——数据写进去了，界面看不到 |
| 5 | 把 `revalidatePath('/notes')` 换成 `revalidateTag('notes')` | 仍然能更新；对比两者的语义（积木 13-6 的表） |
| 6 | 在 `/notes` 页面顶层直接 `await props.searchParams`（不加 Suspense），`pnpm build` | 报 `encountered uncached or runtime data during prerendering` |
| 7 | 用 `pnpm db:studio` 打开数据浏览器，改一条笔记的标题，再刷新页面 | 一分钟内可能还是旧标题（缓存未过期），`updateTag` 或等 1 分钟后才更新 |
| 8 | 新增一个 Server Action：把全部草稿发布，并在页面上加一个按钮 | 注意：Action 里要 `z` 校验、要 `updateTag('notes')`、要 `revalidatePath('/notes')` |
| 9 | （AI）让 AI「给笔记加一个删除按钮」 | 审查：它是用 Server Action + 表单，还是又写了一套 `useMutation` + fetch？有没有忘记失效缓存？ |
| 10 | 在 `docker-compose.yml` 里把镜像换成 `postgres:14`，删掉 volume 重建 | 迁移文件仍然能跑：SQL 是标准的 |

---

## 【本章小结】

三句话：

1. **数据层要有明确的边界**：表结构写在 `schema.ts`，变化用**迁移文件**记录，数据库连接只有一份，`lib/db.ts` 暴露稳定接口——上层（页面 / Handler / Action）不需要知道底下是数组还是 PostgreSQL。
2. **Server Action 是「自己页面写数据」的首选**：`'use server'` + 表单，省掉 URL、fetch 和手写状态；写完用 `updateTag` / `revalidatePath` 让缓存失效。要给外部用就写 Route Handler，两者按场景分工，别混用。
3. **Cache Components 把「能缓存什么」变成编译期规则**：`'use cache'` + `cacheLife` + `cacheTag` 缓存数据，动态数据必须进 `<Suspense>`、`instant = false` 或 `connection()`；构建输出里的 `○ / ◐ / ƒ` 是最便宜的回归检查。

```mermaid
flowchart TB
    subgraph Browser["浏览器"]
        FORM["表单 / 按钮：Server Component 里的 form"]
        TQ["TanStack Query（交互密集页）"]
    end
    subgraph Server["Next.js 服务端"]
        SA["Server Action：updateTag + revalidatePath"]
        RH["Route Handler：/api/notes"]
        PG["页面 await listNotes：use cache + cacheTag"]
    end
    DB[("PostgreSQL：notes 表 + note_status 枚举")]
    FORM -- "表单提交" --> SA
    TQ -- "fetch" --> RH
    SA --> DB
    RH --> DB
    PG --> DB
    SA -. "失效缓存后重新渲染" .-> PG
```

**自测题：**

1. 为什么内存数组撑不住真实项目？换成 PostgreSQL 之后，上层代码为什么一行没改？（积木 13-1、13-3）
2. `pgEnum` 把什么规则压到了数据库层？它和第 4 章的 Zod 校验是什么关系？（积木 13-2）
3. 迁移文件要不要提交到 git？同事拉取代码后要做什么？（积木 13-2）
4. `'use cache'` 的缓存键由什么组成？`cacheLife` 和 `cacheTag` 分别对应 Redis 的什么？（积木 13-5）
5. 为什么 `generateMetadata` 和页面都调用 `getNote`，却只查了一次库？（积木 13-5）
6. Server Action 和 Route Handler 的判断标准是什么？各举一个本章的例子。（积木 13-6）
7. `updateTag` 和 `revalidateTag` 的语义差别是什么？（积木 13-6）
8. 打开 Cache Components 后，遇到 `encountered ... during prerendering` 有哪三种修法？（积木 13-4）
9. `◐` 这个符号代表什么？（积木 13-4）
10. 什么情况下你会给页面选 TanStack Query 而不是服务端渲染？（积木 13-7）

---

## 【下一章预告】

第 14 章《鉴权与安全：登录态、权限、XSS / CSRF / CORS》。CloudNote 现在谁都能改——第 8 章那个「切换用户」只是假的。下一章做真的：密码怎么存（bcrypt / argon2）、会话放在 cookie 还是 JWT、Server Action 怎么做权限检查（**前端禁用按钮不等于权限控制**，第 8 章埋的伏笔要兑现）、CSRF 在 Server Action 里为什么天然免疫一部分、以及 `cookies()` 读会话时怎么不让整页变成动态。

*学完本章，回到对话里说一句「继续」，我就开讲第 14 章。*
