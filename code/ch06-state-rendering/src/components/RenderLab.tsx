// 渲染实验室：打开浏览器控制台，边点按钮边看 [render] 日志
// 生产构建（pnpm build && pnpm preview）里没有 StrictMode 的双调用，日志最干净
import { memo, useState } from 'react'

export function RenderLab() {
  const [count, setCount] = useState(0)
  console.log(`[render] RenderLab count=${count}`)

  // 错误写法：三次读到的都是「这次渲染」的快照 count，等于 set 了三次同一个值
  function addThreeWrong() {
    setCount(count + 1)
    setCount(count + 1)
    setCount(count + 1)
  }

  // 正确写法：更新函数排队执行，每次拿到上一步的结果
  function addThreeRight() {
    setCount((c) => c + 1)
    setCount((c) => c + 1)
    setCount((c) => c + 1)
  }

  // state 不是立刻变的：set 之后在同一个函数里读，仍然是旧值
  function setThenRead() {
    setCount(count + 1)
    console.log(`[click] setCount 之后立刻读 count=${count}`)
  }

  return (
    <section className="lab">
      <h2>渲染实验室</h2>
      <p data-testid="count">count = {count}</p>
      <div className="row">
        <button type="button" onClick={addThreeWrong}>
          +3（错误写法）
        </button>
        <button type="button" onClick={addThreeRight}>
          +3（更新函数）
        </button>
        <button type="button" onClick={setThenRead}>
          +1 并立刻读取
        </button>
        <button type="button" onClick={() => setCount(0)}>
          归零
        </button>
      </div>
      <PlainChild />
      <MemoChild label="我用 memo 包过" />
    </section>
  )
}

// 不接收任何 props，也不依赖 count —— 但默认情况下，父组件每次渲染它都会跟着渲染
function PlainChild() {
  console.log('[render] PlainChild')
  return <p className="muted">PlainChild：没有 props</p>
}

// memo：props 浅比较没变，就跳过这次渲染
const MemoChild = memo(function MemoChild({ label }: { label: string }) {
  console.log('[render] MemoChild')
  return <p className="muted">MemoChild：{label}</p>
})
