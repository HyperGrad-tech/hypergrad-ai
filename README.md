---
AIGC:
  ContentProducer: '001191110102MAD55U9H0F10002'
  ContentPropagator: '001191110102MAD55U9H0F10002'
  Label: '1'
  ProduceID: 'f03cb18e-9f4e-4ed0-af8a-f6bcdc04c8c3'
  PropagateID: 'f03cb18e-9f4e-4ed0-af8a-f6bcdc04c8c3'
  ReservedCode1: '5b47a243-b730-4f18-aa1c-04ca9d7b81f8'
  ReservedCode2: '5b47a243-b730-4f18-aa1c-04ca9d7b81f8'
---

# hypergrad-ai

HyperGrad AI 工具箱（`ai.hypergrad.cn`）—— 16 个 AI 工具的纯前端站点，第 5 个 HyperGrad 子站。

## 设计理念

**BYOK（Bring Your Own Key）+ 纯前端**。11 个 AI 工具由用户自带 API Key 浏览器直连 AI 官方 API，5 个工具 100% 本地运算。我们的服务器**零中转、零存储**——不存 Key、不存输入、不存输出。

- 无后端、无 API 成本（站点所有者不付一分钱 LLM 费用）
- 用户数据不离开浏览器 / 直连 AI 官方
- 用户按 Token 向 AI 服务商付费（DeepSeek 最便宜，百万 Token 约一两元）

## 16 个工具

### P0 核心（10）
| 工具 | 类型 | 说明 |
|------|------|------|
| AI 写作助手 | BYOK | 文章/文案/段落生成，文体+字数+语气可调 |
| AI 总结摘要 | BYOK | 长文/论文/会议纪要提炼要点 |
| AI 翻译 | BYOK | 30+ 语种互译，可指定专业领域 |
| AI 标题生成器 | BYOK | 多平台风格批量标题 |
| AI 对话 | BYOK | 流式多轮，系统人设，角色扮演 |
| Prompt 提示词库 | 纯前端 | 35+ 精选模板，分类浏览一键复制 |
| AI Prompt 优化器 | BYOK | 粗糙 Prompt 自动改写+解释 |
| AI Prompt 生成器 | BYOK | 任务目标反向生成完整 Prompt |
| 系统提示词生成器 | 纯前端 | 可视化构建 Agent 人设 |
| Token 计数器 | 纯前端 | 8 模型 Token 估算与费用 |

### P1 常用（4）
| 工具 | 类型 | 说明 |
|------|------|------|
| AI 营销文案生成器 | BYOK | 小红书/抖音/电商/朋友圈，广告法合规 |
| AI 邮件起草器 | BYOK | 商务/求职/辞职/邀请，可英汉双语 |
| AI 周报日报生成器 | BYOK | 标准/STAR/OKR/简略四种模板 |
| AI 代码解释器 | BYOK | 逐行解释+Bug检测+注释生成 |

### P2 扩展（2）
| 工具 | 类型 | 说明 |
|------|------|------|
| Markdown 转换器 | 纯前端 | MD↔HTML 双向互转 + 实时预览 |
| 图片压缩 | 纯前端 | Canvas 本地压缩 PNG/JPEG/WebP，批量 |

## 技术栈

- **Astro** ^7.1.1 + `@astrojs/react` ^6.0.1 + `@astrojs/sitemap`
- **React** 19（工具交互组件，`client:load`）
- **marked** ^15（Markdown 转换器）
- 纯静态输出（SSG），部署到 GitHub Pages → Cloudflare

## 环境要求

- **Node.js ≥ 22.12.0**（Astro 7 强制要求）
- **pnpm** 10+

> macOS 上若系统自带 Node 版本过低，用 Homebrew 的 Node：
> ```
> PATH="/opt/homebrew/bin:$PATH" pnpm install
> PATH="/opt/homebrew/bin:$PATH" pnpm build
> ```

## 命令

| 命令 | 说明 |
|------|------|
| `pnpm install` | 安装依赖 |
| `pnpm dev` | 本地开发服务器 `localhost:4321` |
| `pnpm build` | 生产构建到 `./dist/`（17 个静态页面） |
| `pnpm preview` | 本地预览构建产物 |

## 项目结构

```
src/
├── components/
│   ├── Header.astro / Footer.astro / Sidebar.astro
│   └── tools/
│       ├── _byok.tsx          # BYOK 共享基础设施（4 服务商配置 + hook + 流式调用 + UI 组件）
│       ├── AiWriter.tsx ... ImageCompressor.tsx   # 16 个工具组件
├── data/
│   └── tools.ts               # 16 工具元数据（SEO/FAQ/分类/优先级/byok 标记）
├── layouts/
│   └── ToolLayout.astro       # 工具页布局（自动生成 Schema.org + 面包屑 + 相关工具）
├── pages/
│   ├── index.astro            # 首页
│   └── ai-writer.astro ... image-compressor.astro  # 16 工具页
└── styles/
    └── global.css             # 设计系统（深蓝主色 + Georgia 衬线 + 1px 边框）
```

## BYOK 支持的 AI 服务商

| 服务商 | 协议 | 备注 |
|--------|------|------|
| DeepSeek | OpenAI 兼容 | 默认推荐，性价比最高 |
| OpenAI（GPT-4o 等） | OpenAI | 复杂推理、多语言 |
| Anthropic Claude | Messages API | `anthropic-dangerous-direct-browser-access` 直连 |
| 智谱 GLM | OpenAI 兼容 | 国产之选 |

Key 存浏览器 localStorage，按服务商独立保存，从不上传。

## 关联站点

HyperGrad 工具站矩阵（同一套 Astro 脚手架）：
- `hypergrad.cn` 主站（DeepSeal 加密笔记应用）
- `crypto.hypergrad.cn` 加密工具箱
- `devtools.hypergrad.cn` 开发者工具
- `text.hypergrad.cn` 文本工具
- `image.hypergrad.cn` 图像工具
- **`ai.hypergrad.cn` 本站**

## 部署

GitHub Actions（`.github/workflows/deploy.yml`）：Node 22 + pnpm 10 → build → GitHub Pages。`public/CNAME` 指向 `ai.hypergrad.cn`。