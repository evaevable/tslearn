// Context：把「当前用户」传给任意深度的组件，不用一层层 props 往下递
// 本章用写死的两个用户模拟登录；第 14 章换成真实的登录态
import { createContext, use, useState, type ReactNode } from 'react'

export type User = { id: number; name: string; role: 'admin' | 'viewer' }

type UserContextValue = {
  user: User
  switchUser: () => void
}

// 默认值给 null：没有包 Provider 就使用，useUser 会直接报错，而不是静默拿到假数据
const UserContext = createContext<UserContextValue | null>(null)

const USERS: User[] = [
  { id: 1, name: 'lance', role: 'admin' },
  { id: 2, name: 'guest', role: 'viewer' },
]

// Provider 组件自己持有 state，业务组件通过 children 传进来（积木 8-6：这样切换用户时 App 不会重渲染）
export function UserProvider({ children }: { children: ReactNode }) {
  const [index, setIndex] = useState(0)
  console.log('[render] UserProvider')
  const value: UserContextValue = {
    user: USERS[index]!,
    switchUser: () => setIndex((i) => (i + 1) % USERS.length),
  }
  // React 19：直接用 <UserContext value={...}>，不再需要 <UserContext.Provider>
  return <UserContext value={value}>{children}</UserContext>
}

export function useUser(): UserContextValue {
  // React 19 的 use() 可以读 Context；和 useContext 不同，它允许写在 if 里
  const ctx = use(UserContext)
  if (!ctx) throw new Error('useUser 必须在 <UserProvider> 内部使用')
  return ctx
}
