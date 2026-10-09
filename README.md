# tslearn：TypeScript 全栈开发系统课

面向**有后端经验、想转全栈**的开发者，一章一章讲透 **TypeScript + React + Next.js + Tailwind/shadcn + PostgreSQL**，每章配可运行的实战代码，最终交付一个带 AI 功能、可上线的全栈应用 CloudNote。

## 课程定位

- **不是**从 HTML 标签教起的入门课：默认你会 HTML / CSS / JS 基础，会写后端接口
- **不是**框架源码课：学到「心智模型」深度——能判断 AI 写的代码对不对、能排查 AI 修不好的 bug
- **是**一条按真实开发链路组织的路线：类型 → 组件与状态 → 样式 → 全栈框架 → 数据与鉴权 → 测试 → AI 功能 → 部署

## 贯穿案例：CloudNote

一个笔记应用，和 [k8s-study](https://github.com/evaevable/k8s-study) 里部署的 CloudNote 是同一个产品——那门课教你怎么把它部署上 K8s，这门课教你怎么把它写出来。

| 功能 | 涉及章节 |
|---|---|
| 笔记增删改查、标签、搜索、分页 | 5-9、13 |
| 登录注册、只能看自己的笔记 | 14 |
| AI 一键生成摘要（流式输出） | 16 |
| Docker 打包、CI 自动部署 | 17 |

## 课程表

| 篇 | 章 | 标题 | 文件 | 状态 |
|---|---|---|---|---|
| 序 | 01 | 全栈地图：一次点击的完整旅程 | [01-fullstack-map.md](chapters/01-fullstack-map.md) | 已发布 |
| TS 篇 | 02 | TypeScript 类型系统：给 JS 装上编译期护栏 | `02-ts-basics.md` | 待发布 |
| | 03 | TS 进阶：泛型、类型收窄、工具类型与异步 | `03-ts-advanced.md` | 待发布 |
| | 04 | TS 工程化：tsconfig、模块、Zod 运行时校验 | `04-ts-engineering.md` | 待发布 |
| React 篇 | 05 | React 心智模型：UI = f(state) | `05-react-mental-model.md` | 待发布 |
| | 06 | State 与渲染：什么时候重渲染，状态该放哪 | `06-state-rendering.md` | 待发布 |
| | 07 | 副作用：你可能不需要 useEffect | `07-effects.md` | 待发布 |
| | 08 | 组件设计：组合、受控表单、自定义 Hook | `08-component-design.md` | 待发布 |
| | 09 | 服务端状态：TanStack Query 与缓存失效 | `09-server-state.md` | 待发布 |
| 样式篇 | 10 | Tailwind CSS + shadcn/ui：快速搭出像样的界面 | `10-tailwind-shadcn.md` | 待发布 |
| Next.js 篇 | 11 | Next.js App Router：路由、布局与约定 | `11-nextjs-routing.md` | 待发布 |
| | 12 | 渲染模式：CSR / SSR / SSG / RSC 与 hydration | `12-rendering-modes.md` | 待发布 |
| | 13 | 数据层：Server Actions、Route Handlers 与 PostgreSQL | `13-data-layer.md` | 待发布 |
| | 14 | 鉴权与安全：登录态、权限、XSS / CSRF / CORS | `14-auth-security.md` | 待发布 |
| 工程篇 | 15 | 测试：Vitest 单元测试 + Playwright 端到端 | `15-testing.md` | 待发布 |
| | 16 | AI 功能：流式输出、tool calling 与 AI SDK | `16-ai-features.md` | 待发布 |
| | 17 | 部署与可观测：Docker、CI/CD、错误监控 | `17-deploy.md` | 待发布 |
| | 18 | 与 agent 协作开发：规则文件、审查清单与总演习 | `18-agent-workflow.md` | 待发布 |
| 附录 | - | 速查表：TS 语法 / React Hooks / Next.js 约定 / 术语对照 | `appendix-cheatsheet.md` | 待发布 |

## 学习方式

每章固定结构：**本章导读 → 若干「积木块」（一块只讲一件事）→ 实战代码 → 本章小结 + 自测题 → 下一章预告**。

AI 协作原则：

1. 第 2-8 章尽量手写，把 AI 当家教而不是答案机
2. 第 9 章起允许 AI 生成初版，但每一行都要能解释
3. 多让 AI 审查，少让 AI 改写

## 仓库结构

```
tslearn/
├── README.md
├── chapters/                     # 每章讲义
│   └── 01-fullstack-map.md
└── code/                         # 每章实战代码，可独立运行
    └── ch01-request-journey/     # 零依赖：Node 原生 http + 原生 JS 页面
```

## 环境要求

- Node.js >= 22.18（可直接运行 `.ts` 文件）
- pnpm（`corepack enable pnpm`）
- VS Code + ESLint / Tailwind CSS IntelliSense 插件
