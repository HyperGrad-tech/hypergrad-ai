import { useState } from 'react';
import { useByok, ApiKeyPanel, useGenerate, callChatOnce, ResultBlock } from './_byok';

const TYPES = [
  { v: 'points', label: '要点式（3-7 条核心观点）' },
  { v: 'paragraph', label: '段落式（200-400 字摘要）' },
  { v: 'outline', label: '大纲式（Markdown 层级大纲）' },
];

export default function AiSummary() {
  const byok = useByok();
  const gen = useGenerate();
  const [text, setText] = useState('');
  const [type, setType] = useState('points');
  const [extra, setExtra] = useState('');

  const build = () => {
    const typeDesc = {
      points: '用 3-7 条要点提炼核心观点，每条以「·」开头，简洁独立',
      paragraph: '用 200-400 字的连贯段落概述核心内容',
      outline: '用 Markdown 层级大纲呈现（含二级/三级标题），可作思维导图骨架',
    }[type];
    const sys = `你是专业内容分析师，擅长从长文中精准提炼核心信息。要求：
1. ${typeDesc}
2. 保留关键事实、数据、结论，不补充原文没有的信息
3. 不评价、不延伸，忠实于原文${extra ? `\n4. ${extra}` : ''}`;
    const user = `请总结以下内容：\n\n${text}`;
    return [
      { role: 'system' as const, content: sys },
      { role: 'user' as const, content: user },
    ];
  };

  const onGen = () => {
    if (!text.trim()) return;
    gen.generate(sig => callChatOnce({ ...byok, messages: build(), signal: sig, temperature: 0.3, maxTokens: 2048 }));
  };

  const charCount = text.length;

  return (
    <div>
      <ApiKeyPanel state={byok} />

      <div class="tool-card" style={{ marginTop: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <label class="text-sm font-bold">原文</label>
          <span class="text-xs text-muted">{charCount} 字 {charCount > 30000 && '（建议分段总结以保证质量）'}</span>
        </div>
        <textarea
          class="text-area mt-md"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="粘贴长文、论文、会议记录、新闻…"
          style={{ minHeight: '200px' }}
        />

        <div style={{ marginTop: '12px' }}>
          <label class="text-xs text-muted">总结类型</label>
          <select class="input mt-md" value={type} onChange={e => setType(e.target.value)}>
            {TYPES.map(t => <option value={t.v}>{t.label}</option>)}
          </select>
        </div>

        <div style={{ marginTop: '12px' }}>
          <label class="text-xs text-muted">额外要求（可选）</label>
          <input class="input mt-md" value={extra} onChange={e => setExtra(e.target.value)} placeholder="如：必须保留所有数字、聚焦研究方法" />
        </div>

        <button
          class="btn"
          style={{ marginTop: '14px', width: '100%' }}
          disabled={!byok.isReady || !text.trim() || gen.loading}
          onClick={onGen}
        >
          {gen.loading ? '生成中…' : !byok.isReady ? '请先配置 API Key' : '📋 生成总结'}
        </button>
      </div>

      <ResultBlock result={gen.result} loading={gen.loading} error={gen.error} onRetry={onGen} placeholder="AI 总结结果会显示在这里" />
    </div>
  );
}
