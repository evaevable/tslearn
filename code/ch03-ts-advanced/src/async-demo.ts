// 第 3 章实战：异步。JS 是单线程 + 事件循环，没有 goroutine
// 运行：node src/async-demo.ts

// 模拟一次网络请求：ms 毫秒后返回 data；支持失败和取消（类似 Go 的 ctx）
function fakeFetch<T>(label: string, data: T, ms: number, opts: { fail?: boolean; signal?: AbortSignal } = {}): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => (opts.fail ? reject(new Error(`${label} 失败`)) : resolve(data)), ms)
    opts.signal?.addEventListener(
      'abort',
      () => {
        clearTimeout(timer)
        reject(opts.signal?.reason)
      },
      { once: true },
    )
  })
}

// 把耗时取整到 100ms，方便对比
async function timed<T>(fn: () => Promise<T>): Promise<[T, number]> {
  const start = performance.now()
  const value = await fn()
  return [value, Math.round((performance.now() - start) / 100) * 100]
}

// ---------- 1. 事件循环的执行顺序 ----------
console.log('== 1. 事件循环顺序 ==')
setTimeout(() => console.log('  4. 宏任务：setTimeout 0'), 0)
Promise.resolve().then(() => console.log('  3. 微任务：Promise.then'))
console.log('  1. 同步代码')
console.log('  2. 同步代码')
await new Promise((r) => setTimeout(r, 10)) // 顶层 await：ES 模块里可以直接用

// ---------- 2. 顺序 await vs 并发 ----------
console.log('\n== 2. 顺序 await vs Promise.all ==')
const [, serialMs] = await timed(async () => {
  const user = await fakeFetch('user', { name: 'lance' }, 300)
  const notes = await fakeFetch('notes', [1, 2, 3], 300) // 等上一个结束才开始
  const tags = await fakeFetch('tags', ['ts'], 300)
  return { user, notes, tags }
})
console.log(`  顺序 await：约 ${serialMs}ms`)

const [all, parallelMs] = await timed(() =>
  // 三个请求同时发出；返回值是元组，每一位的类型都被保留
  Promise.all([fakeFetch('user', { name: 'lance' }, 300), fakeFetch('notes', [1, 2, 3], 300), fakeFetch('tags', ['ts'], 300)]),
)
const [user, notes] = all // user: { name: string }, notes: number[]
console.log(`  Promise.all：约 ${parallelMs}ms，user=${user.name}，notes=${notes.length} 条`)

// ---------- 3. 部分失败：all 一个失败全失败，allSettled 各自报告 ----------
console.log('\n== 3. Promise.all vs Promise.allSettled ==')
const jobs = () => [fakeFetch('笔记', 'ok', 100), fakeFetch('推荐', 'ok', 100, { fail: true }), fakeFetch('统计', 'ok', 100)]
try {
  await Promise.all(jobs())
} catch (e) {
  console.log('  all：', e instanceof Error ? e.message : e, '-> 整体失败，另外两个成功的结果拿不到')
}
const settled = await Promise.allSettled(jobs())
for (const r of settled) {
  // r 是可辨识联合：按 status 收窄后才能访问 value 或 reason
  console.log('  allSettled：', r.status === 'fulfilled' ? `成功 ${r.value}` : `失败 ${(r.reason as Error).message}`)
}

// ---------- 4. 超时取消：AbortSignal ≈ Go 的 context.WithTimeout ----------
console.log('\n== 4. AbortSignal.timeout 超时取消 ==')
try {
  await fakeFetch('慢接口', 'data', 1000, { signal: AbortSignal.timeout(200) })
} catch (e) {
  console.log('  取消原因：', e instanceof Error ? `${e.name}: ${e.message}` : e)
}
