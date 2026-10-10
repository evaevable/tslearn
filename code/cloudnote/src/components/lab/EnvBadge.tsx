'use client'
import { useSyncExternalStore } from 'react'

// 错误写法：渲染时直接判断环境。服务端渲染出「服务端」，浏览器 hydration 时算出「浏览器」，两边对不上
export function BuggyEnv() {
  const where = typeof window === 'undefined' ? '服务端' : '浏览器'
  const time = Date.now() % 100000
  return (
    <p data-testid="env">
      渲染于：{where}，时间戳尾数 {time}
    </p>
  )
}

// 正确写法：useSyncExternalStore 明确给出「服务端快照」和「客户端快照」
// hydration 时 React 先用服务端快照（与 HTML 一致），接管完成后再切到客户端快照重新渲染
const subscribe = () => () => {}
export function FixedEnv() {
  const where = useSyncExternalStore(
    subscribe,
    () => '浏览器', // 客户端快照
    () => '服务端', // 服务端快照：服务端渲染和 hydration 时都用它
  )
  return <p data-testid="env">当前显示：{where}（先与服务端 HTML 一致，接管后再更新）</p>
}
