import { useState } from 'react';
import { useByok, ApiKeyPanel, useGenerate, callChatOnce, ResultBlock } from './_byok';

const STYLES = [
  { v: '文章', label: '文章' },
  { v: '段落', label: '段落' },
  { v: '文案', label: '文案' },
  { v: '故事', label: '故事' },
  { v: '演讲稿', label: '演讲稿' },
];
const LENGTHS = [
  { v: '300', label: '短（约 300 字）' },
  { v: '800', label: '中（约 800 字）' },
  { v: '1500', label: '长（约 1500 字）' },
  { v: '3000', label: '超长（约 3000 字）' },
];
const TONES = ['正式', '活泼', '学术', '口语化', '专业严谨', '幽默'];

export default function AiWriter() {
  const byok = useByok();
  const gen = useGenerate();
  const [topic, setTopic] = useState('');
  const [style, setStyle] = useState('文章');
  const [length, setLength] = useState('800');
  const [tone, setTone] = useState('正式');
  const [extra, setExtra] = useState('');

  const build = () => {
    const sys = `你是资深中文写作助手。根据用户的主题与要求，生成高质量、结构清晰、内容充实的${style}。要求：
1. 严格遵循指定语气（${tone}）与大致字数（${length} 字左右）
2. 内容有逻辑、有信息密度，避免空话套话和同质化表达
3. 自然分段，必要时使用小标题
4. 直接输出正文，不要加"以下是…"之类的开场白`;
    const user = `主题：${topic}\n文体：${style}\n语气：${tone}\n字数：约 ${length} 字${extra ? `\n补充要求：${extra}` : ''}`;
    const messages = [
      { role: 'system' as const, content: sys },
      { role: 'user' as const, content: user },
    ];
    const maxTokens = Math.min(8192, Math.ceil(Number(length) * 2 + 500));
    return { messages, maxTokens };
  };

  const onGen = () => {
    if (!topic.trim()) return;
    const { messages, maxTokens } = build();
    gen.generate(sig => callChatOnce({
      ...byok, messages, signal: sig, maxTokens, temperature: 0.8,
    }));
  };

  return (
    <div>
      <ApiKeyPanel state={byok} />

      <div class="tool-card" style={{ marginTop: '12px' }}>
        <label class="text-sm font-bold">主题 / 关键词</label>
        <textarea
          class="text-area mt-md"
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder="例如：大学生如何用 AI 工具提升学习效率"
          style={{ minHeight: '60px' }}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
          <div>
            <label class="text-xs text-muted">文体</label>
            <select class="input mt-md" value={style} onChange={e => setStyle(e.target.value)}>
              {STYLES.map(s => <option value={s.v}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label class="text-xs text-muted">字数</label>
            <select class="input mt-md" value={length} onChange={e => setLength(e.target.value)}>
              {LENGTHS.map(l => <option value={l.v}>{l.label}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginTop: '12px' }}>
          <label class="text-xs text-muted">语气</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
            {TONES.map(t => (
              <button
                onClick={() => setTone(t)}
                style={{
                  padding: '4px 12px', fontSize: '13px', borderRadius: '14px', cursor: 'pointer',
                  border: tone === t ? '1px solid var(--blue)' : '1px solid var(--border)',
                  background: tone === t ? 'rgba(30,58,95,0.06)' : '#fff',
                  color: tone === t ? 'var(--blue)' : 'var(--text)',
                }}
              >{t}</button>
            ))}
          </div>
        </div>

        <div style={{ marginTop: '12px' }}>
          <label class="text-xs text-muted">补充要求（可选）</label>
          <input class="input mt-md" value={extra} onChange={e => setExtra(e.target.value)} placeholder="如：面向 985 高校学生、举例要具体" />
        </div>

        <button
          class="btn"
          style={{ marginTop: '14px', width: '100%' }}
          disabled={!byok.isReady || !topic.trim() || gen.loading}
          onClick={onGen}
        >
          {gen.loading ? '生成中…' : !byok.isReady ? '请先配置 API Key' : '✍ 生成文章'}
        </button>
        {!byok.isReady && (
          <div class="text-xs text-muted" style={{ marginTop: '6px', textAlign: 'center' }}>
            BYOK 模式：在上方填入 DeepSeek / OpenAI / Claude / 智谱 任一 API Key 即可使用
          </div>
        )}
      </div>

      <ResultBlock result={gen.result} loading={gen.loading} error={gen.error} onRetry={onGen} placeholder="生成结果会显示在这里" />
    </div>
  );
}
