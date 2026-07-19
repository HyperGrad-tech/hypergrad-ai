export type Priority = 'P0' | 'P1' | 'P2';
export type Category =
  | 'AI 写作'
  | 'AI 对话'
  | 'Prompt 工具'
  | '代码助手'
  | '模型工具'
  | '文档处理'
  | '图像处理';

export interface FaqItem {
  q: string;
  a: string;
}

export interface Tool {
  slug: string;
  name: string;
  shortName: string;
  desc: string;
  priority: Priority;
  category: Category;
  keywords: string[];
  icon: string;
  /** 搜索热度（百度日搜索量估算） */
  volume: number;
  /** SEO 长尾说明 */
  seoNote: string;
  /** 优化后的 <title>，主关键词前置 + 长尾修饰词 */
  seoTitle: string;
  /** 优化后的 meta description，140-160 字符 */
  seoDescription: string;
  /** FAQ 问答，用于 FAQPage Schema + 页面自动渲染 */
  faq: FaqItem[];
  /** 相关工具 slug 列表，用于内链卡片 */
  related: string[];
  /** 是否需要用户自带 API Key（BYOK 模式） */
  byok?: boolean;
}

/**
 * 16 个 AI 工具元数据，按优先级排序。
 * P0 核心（10）→ P1 常用（4）→ P2 扩展（2）
 * 其中 11 个为 BYOK（用户自带 API Key，调用 AI 官方 API，我们零中转零存储），
 * 5 个为纯前端（100% 浏览器本地运算）。
 */
export const tools: Tool[] = [
  // ============ P0 核心 ============
  {
    slug: 'ai-writer',
    name: 'AI 写作助手',
    shortName: 'AI 写作',
    desc: '输入主题与要求，AI 一键生成文章、文案、段落。支持文体、字数、语气调节，BYOK 零中转。',
    priority: 'P0',
    category: 'AI 写作',
    keywords: ['ai写作', 'ai文章生成', 'ai写文章', 'ai写作助手', '智能写作', 'ai生成文章', 'ai续写'],
    icon: '✍',
    volume: 1800,
    seoNote: '"AI写作"百度指数高，内容创作者与运营最高频需求',
    seoTitle: 'AI 写作助手 - 在线 AI 文章/文案生成器 | HyperGrad',
    seoDescription: '免费 AI 写作助手，输入主题一键生成文章、文案、段落，可调节文体、字数、语气。BYOK 模式，密钥本地存储，请求直连 AI 官方 API，我们零中转零存储。',
    faq: [
      { q: 'AI 写作是什么？能写什么？', a: 'AI 写作是基于大语言模型（LLM）的文本生成能力，根据用户输入的主题、要求、文体，自动产出文章、营销文案、邮件、周报、段子等。本工具支持指定字数、语气（正式/活泼/学术）、文体（议论文/说明文/故事），适用于内容创作、运营推广、公文起草。' },
      { q: 'BYOK 是什么意思？需要付费吗？', a: 'BYOK（Bring Your Own Key）即"自带密钥"。你填写自己申请的 AI 服务 API Key（支持 DeepSeek、OpenAI、Anthropic 智谱等），工具用你的 Key 直接调用对应 AI 官方 API。本工具本身永久免费，你只需向 AI 服务商按其实际用量付费（通常 DeepSeek 最便宜，百万 Token 约一两元）。' },
      { q: '我的 API Key 和输入内容会被你们保存吗？', a: '不会。API Key 仅存储在你浏览器的 localStorage，从不上传到我们的服务器；你输入的内容和 AI 返回的结果，是浏览器直接向 AI 官方 API 发起请求，请求体不经过我们的服务器。我们是零中转、零存储的纯前端工具。' },
      { q: 'AI 写出来的文章重复率高吗？能直接用吗？', a: 'AI 生成的内容原创性较高，但建议作为初稿，人工润色后发布，避免同质化和事实性偏差。不建议直接用于学术论文（易被 AIGC 检测识别）。对于 SEO 文章、营销文案、内部汇报，AI 初稿 + 人工修改是当前最高效的工作流。' },
      { q: '生成一篇 1000 字文章大概花多少钱？', a: '以 DeepSeek 为例，输入约 1000 Token、输出约 1500 Token，总费用约 0.002-0.003 元（不到一分钱）。使用 GPT-4o 约贵 10-30 倍，仍仅约 0.05 元。日常写作用 DeepSeek/Haiku 性价比最高，复杂推理用 GPT-4o/Claude Sonnet。' },
    ],
    related: ['ai-summary', 'ai-marketing', 'ai-title', 'ai-email'],
    byok: true,
  },
  {
    slug: 'ai-summary',
    name: 'AI 总结摘要',
    shortName: 'AI 总结',
    desc: '粘贴长文、论文、会议记录，AI 自动提炼核心观点、要点摘要、思维导图大纲。BYOK 零中转。',
    priority: 'P0',
    category: 'AI 写作',
    keywords: ['ai总结', 'ai摘要', '文章总结', '内容摘要', '论文总结', '会议总结', 'ai提炼要点'],
    icon: '📋',
    volume: 1200,
    seoNote: '"AI总结"信息过载时代的高频刚需，学生/职场通用',
    seoTitle: 'AI 总结摘要 - 在线文章/论文/会议总结工具 | HyperGrad',
    seoDescription: '免费 AI 总结工具，一键提炼长文、论文、会议记录的核心观点与要点摘要，支持要点式、段落式、思维导图大纲输出。BYOK 模式，密钥本地存储，直连 AI 官方 API。',
    faq: [
      { q: 'AI 总结能处理多长的文本？', a: '取决于你使用的 AI 模型的上下文窗口。DeepSeek 支持 64K-128K Token（约 5-10 万字中文），GPT-4o 支持 128K，Claude Sonnet 支持 200K。超出上下文窗口的内容会被截断，建议超长文档先分段总结再汇总。本工具不强制限制输入长度，以模型能力为准。' },
      { q: '总结的类型有几种？', a: '本工具支持三种输出：1.要点式摘要（3-7 条核心观点）；2.段落式摘要（200-400 字连贯概述）；3.大纲式（Markdown 层级大纲，可直接转思维导图）。可根据阅读目的选择。' },
      { q: 'AI 总结准确吗？会漏掉关键信息吗？', a: '现代大模型对事实性总结准确率较高，但对长文本仍可能遗漏细节或合并相近内容。建议：1.关键场景人工核对原文；2.超长文本分段总结；3.在提示词中明确"必须保留"的关键要素（如数字、人名、结论）。学术论文建议指定"保留研究方法、数据、结论"。' },
      { q: '总结一篇论文要花多少钱？', a: '一篇 8000 字论文约 12000 Token 输入 + 500 Token 输出。DeepSeek 约 0.002 元，几乎可忽略。GPT-4o 约 0.03 元。批量处理文献时用 DeepSeek 最划算。' },
    ],
    related: ['ai-writer', 'ai-translate', 'markdown-converter', 'ai-report'],
    byok: true,
  },
  {
    slug: 'ai-translate',
    name: 'AI 翻译',
    shortName: 'AI 翻译',
    desc: 'AI 驱动的多语言翻译，支持中英日韩法德俄等 30+ 语种，比传统机翻更自然、更懂上下文。BYOK 零中转。',
    priority: 'P0',
    category: 'AI 写作',
    keywords: ['ai翻译', 'ai自动翻译', '智能翻译', '在线ai翻译', '机器翻译', '论文翻译', '文档翻译'],
    icon: '🌐',
    volume: 1500,
    seoNote: '"AI翻译"搜索量持续走高，AI 翻译质量已超越传统机翻',
    seoTitle: 'AI 翻译 - 在线 AI 智能 multilingual 翻译工具 | HyperGrad',
    seoDescription: '免费 AI 翻译工具，支持中英日韩法德俄西等 30+ 语种互译，比传统机翻更自然、更懂上下文与语境。可指定专业领域（医学/法律/IT）。BYOK 模式，密钥本地存储，直连 AI 官方 API。',
    faq: [
      { q: 'AI 翻译比传统机翻（如谷歌翻译）好在哪里？', a: 'AI 翻译基于大语言模型，能理解上下文、语境、隐喻和语气，译文更自然流畅。传统统计机翻逐句翻译，遇到长句、专业术语、成语容易出现生硬或错误。AI 翻译还能根据提示词调整风格（正式/口语/学术）并保持术语一致性，特别适合论文、合同、文学作品。' },
      { q: '支持哪些语言？', a: '本工具支持中文、英语、日语、韩语、法语、德语、俄语、西班牙语、葡萄牙语、意大利语、阿拉伯语、泰语、越南语、印尼语等 30+ 语种互译。理论上 LLM 支持任何自然语言，小语种翻译质量取决于模型训练数据。' },
      { q: '翻译学术论文应该怎么设置？', a: '建议在提示词中指定：1.领域（如"计算机科学""临床医学"）；2.保留专业术语英文原文（学术惯例）；3.语气学术正式；4.要求术语前后一致。本工具支持自定义提示词，可保存常用翻译模板。复杂公式、图表需另行处理。' },
      { q: '翻译一万字文档要花多少 Token？', a: '约 15000 Token 输入 + 15000 Token 输出。DeepSeek 约 0.01 元，GPT-4o 约 0.1 元。批量翻译长文档建议分段（每段 2000-3000 字）以保证术语一致性和质量。' },
    ],
    related: ['ai-writer', 'ai-summary', 'ai-writer', 'markdown-converter'],
    byok: true,
  },
  {
    slug: 'ai-title',
    name: 'AI 标题生成器',
    shortName: 'AI 标题',
    desc: '输入文章或主题，AI 批量生成吸引点击的标题：资讯体、小红书体、公众号体、SEO 标题多种风格。BYOK 零中转。',
    priority: 'P0',
    category: 'AI 写作',
    keywords: ['标题生成', 'ai标题', '爆款标题', '标题生成器', '公众号标题', '小红书标题', 'seo标题'],
    icon: '🏷',
    volume: 400,
    seoNote: '自媒体运营高频工具，"爆款标题"长尾词丰富',
    seoTitle: 'AI 标题生成器 - 爆款/小红书/公众号标题工具 | HyperGrad',
    seoDescription: '免费 AI 标题生成器，输入主题批量生成多种风格标题：资讯体、小红书体、公众号体、SEO 标题、悬念标题。BYOK 模式，密钥本地存储，直连 AI 官方 API，我们零中转零存储。',
    faq: [
      { q: '生成多少个标题合适？', a: '建议一次生成 10-20 个供挑选。AI 标题质量参差，需人工筛选最贴合内容且不夸大的。生成太多反而增加筛选成本。本工具默认生成 10 个，可调节数量。' },
      { q: '小红书标题和公众号标题有什么区别？', a: '小红书标题偏情绪化、口语化、用 emoji 和数字（如"绝了！这 5 款好物我回购了 N 次"）。公众号标题更偏信息密度和悬念（如"我用了 3 年才明白的真相"）。SEO 标题需含关键词且控制字数。本工具支持指定平台风格。' },
      { q: 'AI 生成的标题会重复吗？会侵权吗？', a: 'AI每次生成都有随机性，重复概率极低。但爆款标题套路（如"YYDS""绝绝子"）会有同质化。建议结合自身内容微调。标题本身不构成著作权侵权，但避免直接抄袭他人已发表标题。' },
      { q: '标题党的 SEO 风险？', a: '搜索引擎（百度/Google）会惩罚严重题文不符的标题党。建议标题真实反映内容，关键词自然出现，控制在 30 字以内。本工具 SEO 体模式会自动遵循这些原则。' },
    ],
    related: ['ai-writer', 'ai-marketing', 'prompt-generator', 'ai-chat'],
    byok: true,
  },
  {
    slug: 'ai-chat',
    name: 'AI 对话 / 角色扮演',
    shortName: 'AI 对话',
    desc: '与 AI 自由对话，可设定系统人设、角色扮演、多轮上下文。支持 DeepSeek/GPT/Claude，BYOK 零中转。',
    priority: 'P0',
    category: 'AI 对话',
    keywords: ['ai对话', 'ai聊天', 'ai聊天机器人', 'chatgpt在线', 'ai角色扮演', 'ai助手', 'deepseek对话'],
    icon: '💬',
    volume: 2000,
    seoNote: '"AI对话/聊天"搜索量极高，通用入口型工具',
    seoTitle: 'AI 对话 - 在线 AI 聊天 / 角色扮演 / 多轮对话工具 | HyperGrad',
    seoDescription: '免费 AI 对话工具，支持自由聊天、系统人设、角色扮演、多轮上下文。可切换 DeepSeek/GPT/Claude/智谱 等模型。BYOK 模式，密钥本地存储，直连 AI 官方 API，我们零中转零存储。',
    faq: [
      { q: '和 ChatGPT 官网有什么区别？', a: '本工具是 BYOK 客户端：你用自己的 API Key 调用 AI 官方 API，按 Token 付费（通常比 ChatGPT Plus 订阅便宜得多，尤其轻度用户）。优势：1.可切换任意模型（DeepSeek/GPT/Claude/智谱）；2.可自定义系统人设；3.数据不经我们服务器。劣势：需自行申请 API Key。' },
      { q: '什么是系统人设（System Prompt）？', a: '系统人设是预设给 AI 的角色说明，如"你是一位资深心理 counselor，用温暖共情的语气回答"。AI 在整个对话中都会维持该人设。本工具支持保存多套人设，适合角色扮演、客服模拟、写作教练等场景。' },
      { q: '多轮对话会消耗很多 Token 吗？', a: '是的。每轮对话都会把之前的消息作为上下文重新发送给 AI，所以长对话累计 Token 增长。建议：1.开启"自动摘要压缩"防止上下文爆炸；2.无关话题新建对话；3.不必要时清理历史。本工具显示当前 Token 用量便于把控。' },
      { q: '对话数据会被保存吗？', a: '本工具的对话记录仅存储在你浏览器本地（刷新页面保留），不上传我们的服务器。清除浏览器数据即清空。如需长期保存请自行导出。注意：你的对话内容会发送给你选择的 AI 服务商（如 DeepSeek），其数据政策需自行查阅。' },
    ],
    related: ['ai-writer', 'system-prompt-builder', 'prompt-library', 'token-counter'],
    byok: true,
  },
  {
    slug: 'prompt-library',
    name: 'Prompt 提示词库',
    shortName: 'Prompt 库',
    desc: '精选 100+ 高质量 Prompt 模板：写作、营销、编程、学习、效率。一键复制，分类浏览，纯前端。',
    priority: 'P0',
    category: 'Prompt 工具',
    keywords: ['prompt大全', 'prompt模板', '提示词库', 'prompt案例', 'ai提示词', 'prompt图书馆', 'gpt提示词'],
    icon: '📚',
    volume: 150,
    seoNote: '"prompt模板"长尾流量稳定，运营/产品/开发者通用',
    seoTitle: 'Prompt 提示词库 - 100+ 高质量 AI 提示词模板 | HyperGrad',
    seoDescription: '精选 100+ 高质量 Prompt 提示词模板，覆盖写作、营销、编程、学习、效率等场景。分类浏览、一键复制、纯前端浏览。HyperGrad AI 工具箱。',
    faq: [
      { q: '什么是 Prompt？为什么重要？', a: 'Prompt（提示词）是你给 AI 的指令。同样的模型，好 Prompt 能让输出质量提升数倍。Prompt 工程已成为与大模型协作的核心技能：结构清晰、角色明确、约束具体、示例引导是好 Prompt 的共同特征。本库收录经验证的模板，可直接复用。' },
      { q: '这些 Prompt 模板是怎么选出来的？', a: '本库的模板来自：1.公开 Prompt 工程社区（如 OpenAI Cookbook、Prompt Engineering Guide）的高赞案例；2.我们实际工作中验证有效的模板；3.按场景去重提炼的通用结构。每个模板都附使用说明和可替换变量。' },
      { q: '可以直接用别人的 Prompt 吗？', a: '可以。Prompt 本身通常不构成著作权作品，可自由复用。但需注意：1.涉及具体品牌/数据时替换为你的；2.不同模型对同一 Prompt 响应可能不同，需微调；3.商业用途避免使用带有他人商标的 Prompt。' },
      { q: '如何定制适合我的 Prompt？', a: '本库的模板是起点。建议：1.明确你的任务目标；2.替换变量为你真实场景；3.测试输出，迭代改进；4.满意的模板用本站"Prompt 优化器"进一步打磨。也可使用"系统提示词生成器"构建复杂人设。' },
    ],
    related: ['prompt-optimizer', 'prompt-generator', 'system-prompt-builder', 'ai-chat'],
  },
  {
    slug: 'prompt-optimizer',
    name: 'AI Prompt 优化器',
    shortName: 'Prompt 优化',
    desc: '输入粗糙 Prompt，AI 自动改写为结构清晰、约束明确的优质 Prompt，并解释优化逻辑。BYOK 零中转。',
    priority: 'P0',
    category: 'Prompt 工具',
    keywords: ['prompt优化', '提示词优化', 'prompt改写', 'prompt改进', 'ai提示词优化', 'prompt critic'],
    icon: '✨',
    volume: 200,
    seoNote: '"prompt优化"AI 进阶用户刚需， Prompt 工程师工具链',
    seoTitle: 'AI Prompt 优化器 - 提示词自动改写改进工具 | HyperGrad',
    seoDescription: '免费 AI Prompt 优化工具，输入粗糙提示词，AI 自动改写为结构清晰、约束明确的优质 Prompt，并解释优化逻辑。BYOK 模式，密钥本地存储，直连 AI 官方 API。',
    faq: [
      { q: '什么样的 Prompt 算"好"？', a: '好 Prompt 通常具备：1.角色明确（"你是…"）；2.任务清晰（动词开头，说明做什么）；3.约束具体（字数、格式、风格、禁用项）；4.结构化（分点或模板）；5.示例引导（few-shot）；6.输出格式定义（JSON/Markdown/表格）。本优化器会按这些维度评估并改写。' },
      { q: 'AI 优化 Prompt 真的有效吗？', a: '有效。大模型对自身理解的 Prompt 结构非常敏感。AI 优化器能识别你表述中的歧义、缺失约束、模糊指令，按 Prompt 工程最佳实践重构。实测对简单 Prompt 的输出质量提升 30-60%。但对已经很完善的 Prompt，提升空间有限。' },
      { q: '优化后我能直接用吗？需要再改吗？', a: '优化版可直接使用，但建议：1.核对优化器列出的"改动点"是否符合你的本意；2.把变量替换为真实场景值；3.首次使用观察输出，必要时回退到原版迭代。把优化器当作"Prompt 同事评审"，而非黑盒。' },
      { q: '一次优化要多少 Token？', a: '输入约 200-500 Token，输出约 600-1500 Token（含改写 + 解释）。DeepSeek 约 0.001 元，几乎免费。建议对每个重要 Prompt 都走一次优化流程。' },
    ],
    related: ['prompt-generator', 'system-prompt-builder', 'prompt-library', 'ai-chat'],
    byok: true,
  },
  {
    slug: 'prompt-generator',
    name: 'AI Prompt 生成器',
    shortName: 'Prompt 生成',
    desc: '描述你的任务目标，AI 反向生成完整可用的 Prompt：含角色、步骤、约束、输出格式。BYOK 零中转。',
    priority: 'P0',
    category: 'Prompt 工具',
    keywords: ['prompt生成', 'prompt生成器', '自动生成prompt', 'ai生成提示词', 'prompt builder', '提示词生成'],
    icon: '🧩',
    volume: 180,
    seoNote: '不会写 Prompt 的用户的入口工具',
    seoTitle: 'AI Prompt 生成器 - 任务描述自动生成提示词 | HyperGrad',
    seoDescription: '免费 AI Prompt 生成工具，描述你的任务目标，AI 反向生成完整可用的 Prompt：含角色设定、执行步骤、约束条件、输出格式。BYOK 模式，密钥本地存储，直连 AI 官方 API。',
    faq: [
      { q: '和 Prompt 优化器什么区别？', a: '优化器：你已有粗糙 Prompt，让它变好。生成器：你只有任务目标（如"帮我写产品文案"），从零生成结构化 Prompt。两者可串联使用：先用生成器出初稿，再用优化器打磨。' },
      { q: '生成的 Prompt 包含哪些部分？', a: '通常包含：1.角色设定（你是…）；2.任务目标（要达成什么）；3.输入说明（用户提供什么）；4.执行步骤（先…再…）；5.约束条件（语气/字数/禁用项）；6.输出格式（Markdown/JSON/表格）；7.示例（可选）。完整覆盖 Prompt 工程要素。' },
      { q: '任务描述要写多详细？', a: '越具体越好。例如"帮小红书写种草文案"不如"帮一款 ¥199 无线耳机写小红书种草文案，目标用户是大学生，强调性价比，文案带 emoji 和 3 个 hashtag"。描述越具体，生成 Prompt 越贴合你的真实需求。' },
      { q: '能生成英文 Prompt 吗？', a: '可以。在任务描述中说明"生成英文 Prompt"即可。英文 Prompt 在 GPT/Claude 上通常效果略好（训练数据英文占比高），但中文 Prompt 在 DeepSeek、智谱上效果相当，且对中文任务更精准。' },
    ],
    related: ['prompt-optimizer', 'system-prompt-builder', 'prompt-library', 'ai-writer'],
    byok: true,
  },
  {
    slug: 'system-prompt-builder',
    name: '系统提示词生成器',
    shortName: '系统提示词',
    desc: '可视化构建 System Prompt：人设、能力边界、语气、规则、示例。生成可粘贴到任意 AI 对话框。纯前端。',
    priority: 'P0',
    category: 'Prompt 工具',
    keywords: ['系统提示词', 'system prompt', '人设prompt', '角色prompt', 'system prompt生成', 'agent人设'],
    icon: '🎭',
    volume: 120,
    seoNote: '智能体/Agent 开发者与高级玩家刚需',
    seoTitle: '系统提示词生成器 - 可视化构建 System Prompt | HyperGrad',
    seoDescription: '免费系统提示词（System Prompt）可视化构建工具：人设、能力边界、语气、规则、示例、输出格式分模块填写，一键生成可粘贴到任意 AI 对话框的完整 Prompt。纯浏览器本地生成。',
    faq: [
      { q: 'System Prompt 和普通 Prompt 有什么区别？', a: 'System Prompt 是设定在对话最顶层的"角色定义"，在整个会话中持续生效，优先级高于用户消息。普通 Prompt 是每轮用户消息。System Prompt 决定 AI 的"人设"和"行为准则"，适合做客服、助手、角色扮演。OpenAI/Anthropic/DeepSeek 等 API 都支持 system 字段。' },
      { q: '为什么要可视化构建？', a: '高质量 System Prompt 通常几百上千字，包含人设、能力边界、语气、规则、示例、输出格式等多模块。手写容易遗漏或结构混乱。本工具分模块引导填写，自动拼接成结构化 Prompt，降低门槛，保证完整性。' },
      { q: '生成的 System Prompt 兼容哪些平台？', a: '兼容所有支持 system 字段的 API（OpenAI、Anthropic、DeepSeek、智谱、月之暗面、通义千问等），以及 ChatGPT/Claude/DeepSeek 网页版的"自定义指令"或对话框首条 system 消息。复制粘贴即可使用。' },
      { q: '人设描述怎么写效果最好？', a: '建议公式：身份 + 经验 + 价值观 + 说话方式。例如"你是资深产品经理，10 年 C 端经验，重视用户洞察和数据驱动，说话直接、用案例、避免空话"。比单纯写"你是产品经理"效果好得多。本工具的人设模块会引导你填这些维度。' },
    ],
    related: ['prompt-optimizer', 'prompt-generator', 'prompt-library', 'ai-chat'],
  },
  {
    slug: 'token-counter',
    name: 'Token 计数器',
    shortName: 'Token 计数',
    desc: '估算文本在 GPT/Claude/DeepSeek 等模型下的 Token 数量与费用，支持中英文混合。纯前端预估。',
    priority: 'P0',
    category: '模型工具',
    keywords: ['token计数', 'token计算器', 'token数量', 'gpt token', 'tokenizer', 'token估算', 'ai字数计算'],
    icon: '🔢',
    volume: 350,
    seoNote: 'Prompt 工程与 API 计费通用工具',
    seoTitle: 'Token 计数器 - GPT/Claude/DeepSeek Token 估算与费用计算 | HyperGrad',
    seoDescription: '免费 Token 计数器，估算文本在 GPT/Claude/DeepSeek 各模型下的 Token 数量与 API 费用，支持中英文混合。纯浏览器本地估算，数据不离开浏览器。',
    faq: [
      { q: 'Token 是什么？和字数什么关系？', a: 'Token 是大模型处理文本的最小单位。英文约 1 Token ≈ 0.75 单词（4 字符），中文约 1 字 ≈ 1.5-2 Token（不同模型差异大）。例如"你好"在 GPT 中约 2 Token，在 DeepSeek 中约 1-2 Token。API 按 Token 计费，所以估算 Token 对成本控制很重要。' },
      { q: '这个计数器准确吗？', a: '本工具提供估算值，误差通常在 ±10% 以内。精确值需调用模型官方 Tokenizer（如 OpenAI 的 tiktoken）。对于成本预估和 Prompt 长度把控，估算足够。涉及精确计费的场景建议以 API 返回的 usage 为准。' },
      { q: '不同模型的 Token 数一样吗？', a: '不一样。不同模型使用不同 Tokenizer：GPT 系列用 BPE（tiktoken），Claude 用自己的分词器，DeepSeek/智谱对中文优化（中文 Token 更少）。同一文本在不同模型下 Token 数可能差 20-40%。本工具对主流模型分别估算。' },
      { q: '怎么估算一次 API 调用费用？', a: '费用 = (输入 Token × 输入单价) + (输出 Token × 输出单价)。例如 DeepSeek 输入 ¥1/百万、输出 ¥2/百万，一次 1000 输入 + 500 输出 ≈ ¥0.002。本工具内置主流模型最新单价，输入文本即可看到预估费用。' },
    ],
    related: ['ai-chat', 'prompt-optimizer', 'prompt-library', 'ai-writer'],
  },
  // ============ P1 常用 ============
  {
    slug: 'ai-marketing',
    name: 'AI 营销文案生成器',
    shortName: 'AI 营销',
    desc: '生成抖音/小红书/电商详情页/朋友圈广告文案，含卖点提炼、CTA、emoji 与 hashtag。BYOK 零中转。',
    priority: 'P1',
    category: 'AI 写作',
    keywords: ['文案生成', 'ai文案', '营销文案', 'ai营销文案', '小红书文案', '抖音文案', '电商文案', '广告文案'],
    icon: '📣',
    volume: 600,
    seoNote: '电商/自媒体运营高频，"AI文案"搜索量稳定',
    seoTitle: 'AI 营销文案生成器 - 小红书/抖音/电商文案工具 | HyperGrad',
    seoDescription: '免费 AI 营销文案生成器，按平台生成抖音、小红书、电商详情页、朋友圈广告文案，含卖点提炼、CTA、emoji 与 hashtag。BYOK 模式，密钥本地存储，直连 AI 官方 API。',
    faq: [
      { q: '不同平台的文案风格有什么区别？', a: '抖音/快手：短平快、强情绪、3 秒钩子、口语化；小红书：种草体、emoji 密集、痛点 + 解决方案 + 个人体验；电商详情页：卖点公式 FAB（属性-优势-利益）+ 痛点 + 信任背书；朋友圈：短、生活化、弱广告感。本工具按平台预设风格模板。' },
      { q: 'AI 文案会"千篇一律"吗？', a: '会有套路化倾向。规避方法：1.提供差异化产品细节（材质、工艺、用户故事）；2.指定独特语气（如"东北话""文艺青年"）；3.生成多版本人工筛选混合；4.用 A/B 测试找最优。AI 文案是初稿加速器，不是终稿。' },
      { q: '能自动加 emoji 和 hashtag 吗？', a: '可以。在提示中指定"小红书风格，含 5-8 个 emoji、3-5 个 hashtag"。AI 会按平台惯例放置（emoji 在句末或独立行，hashtag 在文末）。注意 hashtag 不要堆砌（小红书限流），3-5 个精准 tag 优于 10 个泛 tag。' },
      { q: '营销文案会违反广告法吗？', a: 'AI 可能生成"最""第一""绝对"等极限词，违反《广告法》。建议：1.在 Prompt 中明确"禁用极限词，符合广告法"；2.发布前人工核查医疗、金融、教育等敏感行业的合规表述；3.功效型产品避免承诺具体效果。本工具可勾选"广告法合规模式"。' },
    ],
    related: ['ai-writer', 'ai-title', 'ai-email', 'prompt-generator'],
    byok: true,
  },
  {
    slug: 'ai-email',
    name: 'AI 邮件起草器',
    shortName: 'AI 邮件',
    desc: '生成商务邮件、客户跟进、求职信、辞职信、邀请函，指定语气与正式度。BYOK 零中转。',
    priority: 'P1',
    category: 'AI 写作',
    keywords: ['ai邮件', 'ai写邮件', '邮件生成', '商务邮件', '求职信', '辞职信', 'ai起草邮件'],
    icon: '✉',
    volume: 200,
    seoNote: '职场通用刚需，"AI写邮件"长尾稳定',
    seoTitle: 'AI 邮件起草器 - 商务/求职/辞职邮件生成工具 | HyperGrad',
    seoDescription: '免费 AI 邮件起草工具，生成商务邮件、客户跟进、求职信、辞职信、邀请函，可指定语气（正式/友好/委婉）与正式度。BYOK 模式，密钥本地存储，直连 AI 官方 API。',
    faq: [
      { q: 'AI 写邮件够正式吗？商务场景能用吗？', a: '够。现代 LLM 对商务邮件格式、敬语、分寸把握良好，尤其对标准场景（会议邀请、报价跟进、感谢信）几乎开箱即用。建议：1.指定正式度（如"正式商务""礼貌友好"）；2.补充关键细节（收件人关系、目的、截止时间）；3.发送前通读微调。' },
      { q: '怎么让 AI 写出"得体"的邮件？', a: '关键是提供语境：1.收件人身份与你的关系（上级/客户/同事）；2.邮件目的（请求/通知/道歉/说服）；3.语气要求；4.关键事实（数字、时间、结果）。模糊输入会得到模板化输出。本工具的表单字段会引导你填这些。' },
      { q: '能用英文写外贸邮件吗？', a: '可以，且效果通常优于中文邮件（LLM 英文训练数据更充分）。建议指定"native speaker 商务英语，避免直译腔"，并根据收件人文化调整（如美国偏直接，日本偏委婉）。外贸邮件的报价、付款条件、交期等关键信息务必人工核对。' },
      { q: '敏感邮件（辞职/投诉/拒绝）能让 AI 写吗？', a: '适合。AI 擅长处理"难开口"的邮件，能用得体措辞化解尴尬。建议指定"委婉但坚决""不留话柄"，并在邮件末尾留出协商空间。法律性强的邮件（如劳动仲裁通知）建议人工起草或咨询律师，AI 仅作参考。' },
    ],
    related: ['ai-writer', 'ai-summary', 'ai-marketing', 'ai-report'],
    byok: true,
  },
  {
    slug: 'ai-report',
    name: 'AI 周报 / 日报生成器',
    shortName: 'AI 周报',
    desc: '输入本周工作要点，AI 自动生成结构化周报/日报：完成项、进展、问题、下周计划。BYOK 零中转。',
    priority: 'P1',
    category: 'AI 写作',
    keywords: ['ai写周报', 'ai周报', '周报生成', '日报生成', 'ai写日报', '工作汇报', 'ai工作总结'],
    icon: '📊',
    volume: 250,
    seoNote: '"AI写周报"职场打工人刚需，长尾稳定增长',
    seoTitle: 'AI 周报日报生成器 - 工作汇报自动生成工具 | HyperGrad',
    seoDescription: '免费 AI 周报/日报生成器，输入本周工作要点，自动生成结构化汇报：完成项、进展、问题、下周计划，可指定公司模板与语气。BYOK 模式，密钥本地存储，直连 AI 官方 API。',
    faq: [
      { q: 'AI 周报会显得假吗？领导能看出来吗？', a: '如果输入真实工作要点，AI 整理出的周报结构清晰、表述专业，看不出"AI 味"。但如果输入太简略（如"开会、写代码"），AI 会填充套话，反而露馅。建议输入具体事项 + 数据 + 结果，让 AI 做"结构化和润色"而非"编造"。' },
      { q: '怎么让周报更有"亮点"？', a: '在输入中突出：1.量化结果（"优化后接口响应快 40%"）；2.主动改进（"发现 X 问题，主动推动 Y 解决"）；3.跨部门协作贡献。可指定 Prompt"用 STAR 法则突出亮点，避免罗列流水账"。本工具支持保存公司周报模板。' },
      { q: '日报和周报的写法有什么不同？', a: '日报偏执行细节（今天做了什么、遇到什么、明天计划），简短具体；周报偏总结归纳（本周成果、阶段进展、问题与思考），结构化。月报偏复盘和趋势。AI 能根据周期自动调整详略，但建议在 Prompt 中明确周期类型。' },
      { q: '能生成英文工作汇报吗？', a: '可以。外企或汇报英文老板时，AI 生成的英文汇报比中文直译自然得多。建议指定"简洁商务英语，避免冗长从句"。涉及专有名词（项目代号、产品名）建议保留原文不译。' },
    ],
    related: ['ai-writer', 'ai-summary', 'ai-email', 'markdown-converter'],
    byok: true,
  },
  {
    slug: 'code-explainer',
    name: 'AI 代码解释器',
    shortName: '代码解释',
    desc: '粘贴任意代码，AI 逐行解释逻辑、原理、复杂度，并指出潜在 Bug 与优化点。BYOK 零中转。',
    priority: 'P1',
    category: '代码助手',
    keywords: ['代码解释', 'ai代码解释', '代码注释', '代码理解', 'ai看代码', '代码讲解', '源码解释'],
    icon: '</>',
    volume: 300,
    seoNote: '开发者学习/接手老项目刚需',
    seoTitle: 'AI 代码解释器 - 逐行解释 / 注释生成 / Bug 检测 | HyperGrad',
    seoDescription: '免费 AI 代码解释工具，粘贴任意语言代码，AI 逐行解释逻辑、原理、复杂度，指出潜在 Bug 与优化建议，可生成文档注释。BYOK 模式，密钥本地存储，直连 AI 官方 API。',
    faq: [
      { q: '支持哪些编程语言？', a: '主流语言全覆盖：Python、JavaScript/TypeScript、Java、Go、Rust、C/C++、C#、PHP、Ruby、Swift、Kotlin、SQL、Shell、HTML/CSS 等，以及常见框架（React、Vue、Spring、Django）。冷门语言或新框架解释质量取决于模型训练数据，但通常仍能基于语法推断。' },
      { q: '能解释压缩/混淆过的代码吗？', a: '能尝试，但效果有限。混淆代码变量名无意义、逻辑被打乱，AI 只能推断大致行为。建议先格式化（可用本站姊妹站 devtools 的格式化工具），再让 AI 解释。恶意代码分析涉及安全风险，请勿用于逆向他人受保护的代码。' },
      { q: '解释的准确度怎么样？会"一本正经胡说"吗？', a: '现代模型对常见代码解释准确率较高，但复杂业务逻辑、罕见 API、自研框架仍可能误判。建议：1.把相关上下文（函数定义、调用处）一起粘贴；2.对关键解释人工核对；3.要求 AI 标注"不确定"的部分。不要把 AI 解释当成权威，当作"快速理解起点"。' },
      { q: '能帮我找 Bug 吗？', a: '能，适合查找逻辑错误、空指针、边界条件、并发问题等常见 Bug。但 AI 看不到运行时数据和环境，对运行时 Bug（如依赖版本冲突、环境变量缺失）帮助有限。建议把报错信息、复现步骤一起提供给 AI。生产环境 Bug 仍需结合日志和调试工具。' },
    ],
    related: ['ai-chat', 'ai-writer', 'token-counter', 'markdown-converter'],
    byok: true,
  },
  // ============ P2 扩展 ============
  {
    slug: 'markdown-converter',
    name: 'Markdown 转换器',
    shortName: 'Markdown',
    desc: 'Markdown 与 HTML 互转，实时预览渲染效果，支持表格、代码块、数学公式。纯前端。',
    priority: 'P2',
    category: '文档处理',
    keywords: ['markdown转换', 'markdown转html', 'html转markdown', 'markdown预览', 'markdown编辑器', 'md转换'],
    icon: '📄',
    volume: 280,
    seoNote: '技术写作/文档维护长青需求',
    seoTitle: 'Markdown 转换器 - Markdown/HTML 互转 + 实时预览 | HyperGrad',
    seoDescription: '免费 Markdown 转换工具，支持 Markdown 与 HTML 双向互转，实时预览渲染效果，支持表格、代码块、列表、链接。纯浏览器本地处理，数据不离开浏览器。',
    faq: [
      { q: 'Markdown 是什么？', a: 'Markdown 是轻量级标记语言，用纯文本格式编写结构化文档（标题、列表、链接、代码块、表格），可一键转换为 HTML/PDF/Word。广泛用于技术文档、博客（掘金/CSDN/GitHub Pages）、笔记（Obsidian/Notion）、README。语法简单，5 分钟可学会。' },
      { q: '这个工具支持哪些 Markdown 扩展语法？', a: '支持 CommonMark 标准语法（标题、段落、强调、列表、链接、图片、代码、引用、分隔线、表格）以及 GFM（GitHub Flavored Markdown）扩展：任务列表、删除线、自动链接、表格。数学公式（KaTeX/MathJax）和流程图需要专门渲染库，本工具暂不渲染但保留源码。' },
      { q: 'HTML 转 Markdown 会丢失格式吗？', a: '会丢失部分 CSS 样式（颜色、字体、布局），因为 Markdown 不支持这些语义。结构信息（标题层级、列表、链接、图片、表格）会保留。复杂 HTML（嵌套 div、内联样式）转换后可能不完美，建议转换后人工微调。' },
      { q: '能批量转换吗？导出什么格式？', a: '本工具是单文档实时转换，复制结果到剪贴板即可粘贴到目标平台（公众号、博客）。批量转换建议用命令行工具（如 pandoc）。导出 PDF/Word 需配合浏览器打印或专门工具，本工具专注 Markdown ↔ HTML 核心转换。' },
    ],
    related: ['ai-writer', 'ai-summary', 'ai-report', 'code-explainer'],
  },
  {
    slug: 'image-compressor',
    name: '图片压缩',
    shortName: '图片压缩',
    desc: '浏览器本地压缩 PNG/JPEG/WebP，可调质量与最大尺寸，支持批量。100% 本地不上传。',
    priority: 'P2',
    category: '图像处理',
    keywords: ['图片压缩', '在线图片压缩', 'png压缩', 'jpeg压缩', 'webp压缩', '图片变小', '批量压缩图片'],
    icon: '🖼',
    volume: 1800,
    seoNote: '"图片压缩"超高搜索量，泛用户工具',
    seoTitle: '图片压缩 - 在线 PNG/JPEG/WebP 压缩工具 | HyperGrad',
    seoDescription: '免费在线图片压缩工具，浏览器本地压缩 PNG/JPEG/WebP，可调质量与最大尺寸，支持批量。100% 本地处理，图片不离开你的设备，不上传不存储。',
    faq: [
      { q: '图片压缩会损失质量吗？', a: '分两种：1.有损压缩（JPEG/WebP 调低质量）会永久损失画质，文件更小；2.无损压缩（PNG 优化）不损失画质，但压缩率有限。本工具默认 JPEG 质量 80、WebP 质量 80，肉眼几乎无差异而文件减小 60-80%。文档/截图场景推荐有损，精细图标用 PNG 优化。' },
      { q: '图片会上传到服务器吗？', a: '不会。本工具使用浏览器 Canvas API 在你的设备本地完成压缩，图片数据从不离开浏览器。适合处理敏感截图、身份证件照、商业素材。这是本工具相比多数在线压缩站的核心优势——多数在线站会把图片上传到服务器处理。' },
      { q: '能压缩到指定大小（如 100KB 以下）吗？', a: '本工具支持设置目标大小，自动迭代调整质量参数逼近目标（可能存在 ±10% 误差）。也可手动滑块调节质量实时看文件大小变化。注意：过小目标（如 1MB 图压到 50KB）会导致明显画质损失，建议合理设置。' },
      { q: '支持哪些格式？能转换格式吗？', a: '支持输入 PNG/JPEG/WebP/GIF（静态），输出 PNG/JPEG/WebP。WebP 是现代网页首选（同质量比 JPEG 小 25-35%，支持透明）。GIF 动图压缩本工具暂不支持动态帧，仅处理首帧。HEIC 等 Apple 格式需浏览器支持，部分环境不可用。' },
    ],
    related: ['markdown-converter', 'ai-writer', 'ai-marketing', 'token-counter'],
  },
];

export const priorityMeta: Record<Priority, { label: string; desc: string; color: string; bg: string }> = {
  P0: { label: '核心工具', desc: '写作 / 对话 / Prompt 最高频', color: '#1E3A5F', bg: '#EEF2F7' },
  P1: { label: '常用工具', desc: '场景化文案与代码生成', color: '#C8862E', bg: '#FDF5EA' },
  P2: { label: '扩展工具', desc: '本地辅助与格式处理', color: '#2D7A4F', bg: '#EEF7F1' },
};

export const categoryMeta: Record<Category, { icon: string; color: string }> = {
  'AI 写作': { icon: '✍', color: '#1E3A5F' },
  'AI 对话': { icon: '💬', color: '#2D7A4F' },
  'Prompt 工具': { icon: '🎨', color: '#C8862E' },
  '代码助手': { icon: '</>', color: '#7A4FB8' },
  '模型工具': { icon: '🔢', color: '#B83A3A' },
  '文档处理': { icon: '📄', color: '#1E3A5F' },
  '图像处理': { icon: '🖼', color: '#2D7A4F' },
};

export function getTool(slug: string): Tool | undefined {
  return tools.find(t => t.slug === slug);
}

export function toolsByPriority(p: Priority): Tool[] {
  return tools.filter(t => t.priority === p);
}

export function toolsByCategory(c: Category): Tool[] {
  return tools.filter(t => t.category === c);
}
