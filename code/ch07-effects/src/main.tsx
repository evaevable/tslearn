// 入口：把根组件 App 挂到 index.html 的 <div id="root"> 上。整个应用只调用这一次
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { App } from './App'
import './index.css'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('找不到 #root 节点')

createRoot(rootElement).render(
  // StrictMode：仅开发环境生效，会故意把组件多调用一次，帮你发现「不纯」的组件（积木 5-4）
  <StrictMode>
    <App />
  </StrictMode>,
)
