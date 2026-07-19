import { useState } from 'react';
import { useByok, ApiKeyPanel, useGenerate, callChatOnce, ResultBlock } from './_byok';

const LANGS = ['自动检测', '中文', '英语', '日语', '韩语', '法语', '德语', '俄语', '西班牙语', '葡萄牙语', '意大利语', '阿拉伯语'];
const DOMAINS = [
  { v: '通用', label: '通用' },
  { v: '计算机/IT', label: '计算机/IT' },
  { v: '医学', label: '医学' },
  { v: '法律', label: '法律' },
  { v: '金融', label: '金融' },
  { v: '文学', label: '文学' },
  { v: '学术', label: '学术' },
];

export default function AiTranslate() {
  const byok = useByok();
  const gen = useGenerate();
  const [text, setText] = useState('');
  const [from, setFrom] = useState('自动检测');
  const [to, setTo] = useState('英语');
  const [domain, setDomain] = useState('通用');
  const [extra, setExtra] = useState('');

  const build = () => {
    const sys = `你是专业${domain}译者，精通多语言互译。要求：
1. 译文自然流畅，符合目标语言母语表达习惯，避免直译腔
2. 准确传达原文语义、语气、专业术语${domain !== '通用' ? `\n3. 使用 ${domain} 领域的标准术语，保持术语前后一致` : ''}
${extra ? `4. ${extra}` : ''}
直接输出译文，不要加注释或原文对照。`;
    const user = `源语言：${from}\n目标语言：${to}\n领域：${domain}\n\n原文：\n${text}`;
    return [
      { role: 'system' as const, content: sys },
      { role: 'user' as const, content: user },
    ];
  };

  const onGen = () => {
    if (!text.trim()) return;
    gen.generate(sig => callChatOnce({ ...byok, messages: build(), signal: sig, temperature: 0.3, maxTokens: 4096 }));
  };

  return (
    <div>
      <ApiKeyPanel state={byok} />

      <div class="tool-card" style={{ marginTop: '12px' }}>
        <label class="text-sm font-bold">原文</label>
        <textarea
          class="text-area mt-md"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="粘贴要翻译的文本"
          style={{ minHeight: '150px' }}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginTop: '12px' }}>
          <div>
            <label class="text-xs text-muted">源语言</label>
            <select class="input mt-md" value={from} onChange={e => setFrom(e.target.value)}>
              {LANGS.map(l => <option value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label class="text-xs text-muted">目标语言</label>
            <select class="input mt-md" value={to} onChange={e => setTo(e.target.value)}>
              {LANGS.filter(l => l !== '自动检测').map(l => <option value={l}>{l}</option>)}
            </select>
          </div>
          <div>
            <label class="text-xs text-muted">领域</label>
            <select class="input mt-md" value={domain} onChange={e => setDomain(e.target.value)}>
              {DOMAINS.map(d => <option value={d.v}>{d.label}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginTop: '12px' }}>
          <label class="text-xs text-muted">额外要求（可选）</label>
          <input class="input mt-md" value={extra} onChange={e => setExtra(e.target.value)} placeholder="如：保留专有名词英文、学术论文风格" />
        </div>

        <button
          class="btn"
          style={{ marginTop: '14px', width: '100%' }}
          disabled={!byok.isReady || !text.trim() || gen.loading}
          onClick={onGen}
        >
          {gen.loading ? '翻译中…' : !byok.isReady ? '请先配置 API Key' : '🌐 翻译'}
        </button>
      </div>

      <ResultBlock result={gen.result} loading={gen.loading} error={gen.error} onRetry={onGen} placeholder="译文会显示在这里" />
    </div>
  );
}
