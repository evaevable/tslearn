// 组合：Card 只负责「外框长什么样」，里面放什么由调用方决定
// children 是默认插槽；title、actions 是具名插槽——它们的类型都是 ReactNode，可以传任何 JSX
import type { ReactNode } from 'react'

type CardProps = {
  title: ReactNode
  actions?: ReactNode
  children: ReactNode
}

export function Card({ title, actions, children }: CardProps) {
  return (
    <section className="card">
      <header className="card-header">
        <h2>{title}</h2>
        {actions}
      </header>
      {children}
    </section>
  )
}
