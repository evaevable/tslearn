import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import { UserProvider } from './auth/UserContext'
import './index.css'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('找不到 #root 节点')

createRoot(rootElement).render(
  <StrictMode>
    {/* <App /> 这个元素在这里创建，作为 children 交给 UserProvider */}
    <UserProvider>
      <App />
    </UserProvider>
  </StrictMode>,
)
