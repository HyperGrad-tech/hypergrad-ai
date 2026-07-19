import { useState } from 'react';
import { useByok, ApiKeyPanel, useGenerate, callChatOnce, ResultBlock } from './_byok';

const FOCUS = [
  { v: 'explain', label: '逐行解释逻辑' },
  { v: 'principle', label: '讲清原理与设计' },
  { v: 'bug', label: '找潜在 Bug' },
  { v: 'optimize', label: '优化建议' },
  { v: 'comment', label: '生成文档注释' },
  { v: 'all', label: '全套（解释 + Bug + 优化）' },
];

export default function CodeExplainer() {
  const byok = useByok();
  const gen = useGenerate();
  const [code, setCode] = useState('');
  const [lang, setLang] = useState('自动识别');
  const [focus, setFocus] = useState('all');

  const build = () => {
    const focusDesc = {
      explain: '逐行（或按逻辑块）解释代码在做什么',
      principle: '讲解代码背后的算法/设计模式/数据结构原理',
      bug: '指出潜在 Bug、空指针、边界、并发、安全问题',
      optimize: '给出可执行的优化建议（性能、可读性、可维护性）',
      comment: '为代码生成规范的文档注释（JSDoc/docstring 等）',
      all: '先逐行解释逻辑，再指出潜在 Bug，最后给优化建议',
    }[focus];
    const sys = `你是资深程序员与代码审查专家，精通各种编程语言与框架。要求：
1. ${focusDesc}
2. 准确、专业，不确定的地方明确标注"此处不确定"
3. 用清晰中文，必要时配代码示例
4. 不要凭空臆测运行时行为，基于代码本身分析`;
    const user = `编程语言：${lang}\n\n代码：\n\`\`\`\n${code}\n\`\`\``;
    return [
      { role: 'system' as const, content: sys },
      { role: 'user' as const, content: user },
    ];
  };

  const onGen = () => {
    if (!code.trim()) return;
    gen.generate(sig => callChatOnce({ ...byok, messages: build(), signal: sig, temperature: 0.3, maxTokens: 3000 }));
  };

  return (
    <div>
      <ApiKeyPanel state={byok} />

      <div class="tool-card" style={{ marginTop: '12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label class="text-xs text-muted">编程语言</label>
            <select class="input mt-md" value={lang} onChange={e => setLang(e.target.value)}>
              {['自动识别', 'Python', 'JavaScript', 'TypeScript', 'Java', 'Go', 'Rust', 'C/C++', 'C#', 'PHP', 'Ruby', 'SQL', 'Shell', 'HTML/CSS'].map(l => <option value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label class="text-xs text-muted">分析重点</label>
            <select class="input mt-md" value={focus} onChange={e => setFocus(e.target.value)}>
              {FOCUS.map(f => <option value={f.v}>{f.label}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginTop: '12px' }}>
          <label class="text-sm font-bold">代码</label>
          <textarea
            class="text-area mt-md"
            value={code}
            onChange={e => setCode(e.target.value)}
            placeholder="粘贴要解释的代码"
            style={{ minHeight: '200px', fontFamily: 'var(--font-mono)', fontSize: '12px' }}
          />
        </div>

        <button
          class="btn"
          style={{ marginTop: '14px', width: '100%' }}
          disabled={!byok.isReady || !code.trim() || gen.loading}
          onClick={onGen}
        >
          {gen.loading ? '分析中…' : !byok.isReady ? '请先配置 API Key' : '</> 解释代码'}
        </button>
      </div>

      <ResultBlock result={gen.result} loading={gen.loading} error={gen.error} onRetry={onGen} placeholder="代码解释会显示在这里" />
    </div>
  );
}
