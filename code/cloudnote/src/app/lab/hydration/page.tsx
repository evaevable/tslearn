// Hydration 实验：?bug=1 时渲染「服务端和浏览器结果不一样」的组件，制造 hydration 错误
// 注意：读 searchParams 属于「请求时数据」，在 Cache Components 下必须放进 <Suspense>，
// 否则这个路由无法预渲染（next build 会直接报错，见积木 13-4）
import { Suspense } from 'react'
import { RenderInfo } from '@/components/lab/RenderInfo'
import { BuggyEnv, FixedEnv } from '@/components/lab/EnvBadge'

export const metadata = { title: 'Hydration' }

export default function HydrationPage(props: PageProps<'/lab/hydration'>) {
  return (
    <RenderInfo
      mode="Hydration"
      description="同一个客户端组件，先在服务端渲染成 HTML，再在浏览器里重新执行并「接管」那份 HTML。两次结果必须一致。"
    >
      <Suspense fallback={<p className="text-muted-foreground">加载中...</p>}>
        {/* 把 searchParams 这个 Promise 直接传下去，让子组件去 await —— 这样它落在 Suspense 里 */}
        <Demo searchParams={props.searchParams} />
      </Suspense>
    </RenderInfo>
  )
}

async function Demo({ searchParams }: { searchParams: Promise<{ bug?: string | string[] }> }) {
  const { bug } = await searchParams
  return (
    <>
      <p className="text-xs text-muted-foreground">当前是：{bug ? '错误示范（?bug=1）' : '正确写法'}</p>
      {bug ? <BuggyEnv /> : <FixedEnv />}
    </>
  )
}
