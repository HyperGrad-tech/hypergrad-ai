// HyperGrad 生态 5 个姊妹站信息（5 站共享同一份，渲染时根据 currentSite 过滤自身）
// 修改时请同步 5 个站的 src/data/sisterSites.ts

export interface SisterSiteTool {
  slug: string;
  name: string;
}

export interface SisterSite {
  key: 'devtools' | 'crypto' | 'text' | 'image' | 'ai';
  name: string;       // 完整站名
  shortName: string;  // 短名（Header / 卡片用）
  slogan: string;     // 一句话定位
  href: string;       // 主域名
  icon: string;       // emoji
  hot: SisterSiteTool[];  // 推荐的 4-5 个热门工具（卡片里直接点）
}

export const sisterSites: SisterSite[] = [
  {
    key: 'devtools',
    name: 'HyperGrad DevTools',
    shortName: '开发者工具',
    slogan: 'JSON / 正则 / 时间戳 / 二维码',
    href: 'https://devtools.hypergrad.cn',
    icon: '🛠',
    hot: [
      { slug: 'json-formatter', name: 'JSON 格式化' },
      { slug: 'regex-tester',   name: '正则测试' },
      { slug: 'timestamp',      name: '时间戳转换' },
      { slug: 'qrcode',         name: '二维码生成' },
    ],
  },
  {
    key: 'crypto',
    name: 'HyperGrad Crypto',
    shortName: '加密工具',
    slogan: 'AES / RSA / Hash / 国密',
    href: 'https://crypto.hypergrad.cn',
    icon: '🔐',
    hot: [
      { slug: 'aes',                name: 'AES 加解密' },
      { slug: 'rsa',                name: 'RSA 加解密' },
      { slug: 'hash',               name: 'MD5/SHA Hash' },
      { slug: 'sm4',                name: 'SM4 国密' },
      { slug: 'password-generator', name: '密码生成' },
    ],
  },
  {
    key: 'text',
    name: 'HyperGrad Text',
    shortName: '文本工具',
    slogan: '字数 / Markdown / Diff / 去重',
    href: 'https://text.hypergrad.cn',
    icon: '📝',
    hot: [
      { slug: 'word-count',      name: '字数统计' },
      { slug: 'markdown-editor', name: 'Markdown 编辑器' },
      { slug: 'text-diff',       name: '文本对比' },
      { slug: 'text-dedup',      name: '文本去重' },
    ],
  },
  {
    key: 'image',
    name: 'HyperGrad Image',
    shortName: '图片工具',
    slogan: 'SVG / WebP / EXIF · 原图不外传',
    href: 'https://image.hypergrad.cn',
    icon: '🖼',
    hot: [
      { slug: 'svg-optimize', name: 'SVG 优化' },
      { slug: 'webp-convert', name: 'WebP 转换' },
      { slug: 'exif-viewer',  name: 'EXIF 查看' },
      { slug: 'exif-remover', name: 'EXIF 清理' },
      { slug: 'placeholder',  name: '占位图生成' },
    ],
  },
  {
    key: 'ai',
    name: 'HyperGrad AI',
    shortName: 'AI 工具',
    slogan: '写作 / 翻译 / 总结 / Prompt · BYOK',
    href: 'https://ai.hypergrad.cn',
    icon: '🤖',
    hot: [
      { slug: 'ai-writer',        name: 'AI 写作' },
      { slug: 'ai-summary',       name: 'AI 总结' },
      { slug: 'ai-translate',     name: 'AI 翻译' },
      { slug: 'prompt-optimizer', name: 'Prompt 优化' },
      { slug: 'token-counter',    name: 'Token 计数' },
    ],
  },
];

// 根据当前站 key 获取其他 4 站
export function getSisterSites(currentSite: SisterSite['key']): SisterSite[] {
  return sisterSites.filter(s => s.key !== currentSite);
}

// 获取本站信息（用于首页自我介绍等场景）
export function getCurrentSite(currentSite: SisterSite['key']): SisterSite {
  return sisterSites.find(s => s.key === currentSite)!;
}
