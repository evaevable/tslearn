// CSR（客户端渲染）：页面本身是静态壳，数据由浏览器里的 useQuery 去拉 —— 第 5~10 章的 Vite 应用就是这样
import { RenderInfo } from '@/components/lab/RenderInfo'
import { CsrNoteCount } from '@/components/lab/CsrNoteCount'

export const metadata = { title: 'CSR' }

export default function CsrPage() {
  return (
    <RenderInfo mode="CSR：浏览器里拉数据" description="HTML 里只有「加载中」，等 JS 下载执行、请求返回后才有内容。">
      <CsrNoteCount />
    </RenderInfo>
  )
}
