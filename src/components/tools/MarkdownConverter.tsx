import { useState, useMemo, useCallback } from 'react';
import { marked } from 'marked';

marked.setOptions({ breaks: true, gfm: true });

const SAMPLE = `# Markdown 示例

支持 **加粗**、*斜体*、\`行内代码\`、[链接](https://hypergrad.cn)。

## 列表

- 无序项 1
- 无序项 2
  - 嵌套项

1. 有序项 1
2. 有序项 2

## 代码块

\`\`\`javascript
function hello(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

## 表格

| 工具 | 类型 |
| --- | --- |
| AI 写作 | BYOK |
| Token 计数 | 纯前端 |

> 引用块：这是一段引用文本。

---

更多信息见 [HyperGrad](https://hypergrad.cn)。
`;

/** 简易 HTML → Markdown 转换器（基于 DOMParser，处理常见标签） */
function nodeToMd(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) return node.textContent || '';
  if (node.nodeType !== Node.ELEMENT_NODE) return '';
  const el = node as HTMLElement;
  const tag = el.tagName.toLowerCase();
  const inner = () => Array.from(el.childNodes).map(nodeToMd).join('');
  switch (tag) {
    case 'h1': return `\n# ${inner().trim()}\n\n`;
    case 'h2': return `\n## ${inner().trim()}\n\n`;
    case 'h3': return `\n### ${inner().trim()}\n\n`;
    case 'h4': return `\n#### ${inner().trim()}\n\n`;
    case 'h5': return `\n##### ${inner().trim()}\n\n`;
    case 'h6': return `\n###### ${inner().trim()}\n\n`;
    case 'p': return `\n${inner().trim()}\n\n`;
    case 'br': return `\n`;
    case 'hr': return `\n---\n\n`;
    case 'strong': case 'b': return `**${inner()}**`;
    case 'em': case 'i': return `*${inner()}*`;
    case 'code': return `\`${el.textContent || ''}\``;
    case 'pre': return `\n\`\`\`\n${el.textContent || ''}\n\`\`\`\n\n`;
    case 'blockquote': {
      const content = inner().trim().split('\n').map(l => '> ' + l).join('\n');
      return `\n${content}\n\n`;
    }
    case 'ul': return '\n' + Array.from(el.children).map(li => '- ' + nodeToMd(li).trim()).join('\n') + '\n\n';
    case 'ol': return '\n' + Array.from(el.children).map((li, i) => `${i + 1}. ` + nodeToMd(li).trim()).join('\n') + '\n\n';
    case 'li': return inner();
    case 'a': return `[${inner()}](${el.getAttribute('href') || ''})`;
    case 'img': return `![${el.getAttribute('alt') || ''}](${el.getAttribute('src') || ''})`;
    case 'input': return el.hasAttribute('checked') ? '[x] ' : '[ ] ';
    case 'div': case 'section': case 'article': case 'span': return inner();
    default: return inner();
  }
}

function htmlToMd(html: string): string {
  try {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return nodeToMd(doc.body).replace(/\n{3,}/g, '\n\n').trim();
  } catch {
    return '';
  }
}

type Mode = 'md2html' | 'html2md';
type OutTab = 'preview' | 'source';

export default function MarkdownConverter() {
  const [mode, setMode] = useState<Mode>('md2html');
  const [input, setInput] = useState(SAMPLE);
  const [outTab, setOutTab] = useState<OutTab>('preview');
  const [copied, setCopied] = useState(false);

  const htmlOutput = useMemo(() => {
    if (mode === 'md2html') {
      try { return marked.parse(input) as string; } catch { return ''; }
    }
    return input; // 反向模式下"源"就是 HTML
  }, [input, mode]);

  const mdOutput = useMemo(() => {
    if (mode === 'html2md') return htmlToMd(input);
    return htmlToMd(htmlOutput); // 正向时把渲染后 HTML 再转回 MD（round-trip 演示）
  }, [input, mode, htmlOutput]);

  const copyResult = useCallback(() => {
    const text = mode === 'md2html' ? htmlOutput : mdOutput;
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [mode, htmlOutput, mdOutput]);

  return (
    <div>
      {/* 模式切换 */}
      <div class="tool-card">
        <div style={{ display: 'flex', gap: '6px' }}>
          <button
            onClick={() => setMode('md2html')}
            style={{
              flex: 1, padding: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', borderRadius: 'var(--radius-sm)',
              border: mode === 'md2html' ? '1px solid var(--blue)' : '1px solid var(--border)',
              background: mode === 'md2html' ? 'var(--blue)' : '#fff',
              color: mode === 'md2html' ? '#fff' : 'var(--text)',
            }}
          >Markdown → HTML</button>
          <button
            onClick={() => setMode('html2md')}
            style={{
              flex: 1, padding: '10px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', borderRadius: 'var(--radius-sm)',
              border: mode === 'html2md' ? '1px solid var(--blue)' : '1px solid var(--border)',
              background: mode === 'html2md' ? 'var(--blue)' : '#fff',
              color: mode === 'html2md' ? '#fff' : 'var(--text)',
            }}
          >HTML → Markdown</button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }} class="md-grid">
        {/* 输入 */}
        <div class="tool-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span class="text-sm font-bold">{mode === 'md2html' ? 'Markdown 输入' : 'HTML 输入'}</span>
            <span class="text-xs text-muted">{input.length} 字符</span>
          </div>
          <textarea
            class="text-area"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder={mode === 'md2html' ? '粘贴 Markdown 文本' : '粘贴 HTML 代码'}
            style={{ minHeight: '320px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}
          />
        </div>

        {/* 输出 */}
        <div class="tool-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <div style={{ display: 'flex', gap: '6px' }}>
              {mode === 'md2html' ? (
                <>
                  <button class={`btn btn-sm ${outTab === 'preview' ? '' : 'btn-ghost'}`} onClick={() => setOutTab('preview')}>渲染预览</button>
                  <button class={`btn btn-sm ${outTab === 'source' ? '' : 'btn-ghost'}`} onClick={() => setOutTab('source')}>HTML 源码</button>
                </>
              ) : (
                <span class="text-sm font-bold">Markdown 输出</span>
              )}
            </div>
            <button class="btn btn-ghost btn-sm" onClick={copyResult}>{copied ? '✓' : '复制'}</button>
          </div>

          {mode === 'md2html' && outTab === 'preview' && (
            <div
              class="md-preview"
              style={{ minHeight: '320px', padding: '14px', background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', overflow: 'auto', lineHeight: 1.8, fontSize: '14px' }}
              dangerouslySetInnerHTML={{ __html: htmlOutput || '<span style="color:#999">预览这里</span>' }}
            />
          )}

          {mode === 'md2html' && outTab === 'source' && (
            <pre style={{
              minHeight: '320px', margin: 0, padding: '14px', background: 'var(--bg-soft)',
              border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-mono)', fontSize: '12px', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              overflow: 'auto',
            }}>{htmlOutput}</pre>
          )}

          {mode === 'html2md' && (
            <pre style={{
              minHeight: '320px', margin: 0, padding: '14px', background: 'var(--bg-soft)',
              border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)',
              fontFamily: 'var(--font-mono)', fontSize: '12px', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              overflow: 'auto',
            }}>{mdOutput || '转换后的 Markdown 会显示在这里'}</pre>
          )}
        </div>
      </div>

      <div class="text-xs text-muted" style={{ marginTop: '10px', lineHeight: 1.6 }}>
        支持 CommonMark + GFM（GitHub Flavored Markdown）：标题、列表、表格、代码块、引用、链接、图片、任务列表、删除线。
        HTML → Markdown 处理常见语义标签，复杂样式（颜色、布局）会丢失。100% 浏览器本地转换。
      </div>
    </div>
  );
}
