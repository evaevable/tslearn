// 演示：类型只活在编译期。node 运行 .ts 时只是把类型注解擦掉，不做任何检查。
// 运行：node src/erasure-demo.ts
// 下面每个 @ts-expect-error 都标着一个"tsc 会报错"的位置；删掉注释再跑 pnpm typecheck 就能看到报错

function add(a: number, b: number): number {
  return a + b
}

// ---------- 1. 类型错误不会阻止运行 ----------
// @ts-expect-error 第二个参数是 string，不是 number
const r = add(1, '2')
console.log('1. add(1, "2") 的结果：', r, '| 运行时类型：', typeof r)

// ---------- 2. any：直接关掉检查 ----------
const anyData: any = JSON.parse('{"note":{"title":"hi"}}')
try {
  console.log(anyData.user.name) // tsc 不吭声
} catch (e) {
  console.log('2. any 放行了 anyData.user.name，运行时炸了：', (e as Error).message)
}

// ---------- 3. unknown：逼你先检查再使用 ----------
const unknownData: unknown = JSON.parse('{"note":{"title":"hi"}}')
// @ts-expect-error unknown 类型不允许直接访问属性
void unknownData.user
if (typeof unknownData === 'object' && unknownData !== null && 'user' in unknownData) {
  console.log('3. 有 user 字段')
} else {
  console.log('3. unknown 逼你先检查：没有 user 字段，安全跳过')
}

// ---------- 4. 类型在运行时不存在 ----------
type Point = { x: number; y: number }
const p: Point = { x: 1, y: 2 }
// 运行时只剩一个普通对象，typeof 只认识 JS 自己的几种类型
console.log('4. 运行时 typeof p =', typeof p, '| 没有任何办法在运行时问"p 是不是 Point"')
