import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClientProvider } from '@tanstack/react-query'
import { App } from './App'
import { UserProvider } from './auth/UserContext'
import { queryClient } from './lib/queryClient'
import './index.css'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('找不到 #root 节点')

createRoot(rootElement).render(
  <StrictMode>
    {/* QueryClientProvider 和第 8 章的 UserProvider 一样，用 Context 把 queryClient 传给所有组件 */}
    <QueryClientProvider client={queryClient}>
      <UserProvider>
        <App />
      </UserProvider>
    </QueryClientProvider>
  </StrictMode>,
)
