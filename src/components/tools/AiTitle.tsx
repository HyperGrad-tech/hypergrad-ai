import { useState } from 'react';
import { useByok, ApiKeyPanel, useGenerate, callChatOnce, ResultBlock } from './_byok';

const PLATFORMS = [
  { v: '公众号', label: '公众号（信息密度 + 悬念）' },
  { v: '小红书', label: '小红书（种草 + emoji）' },
  { v: '抖音', label: '抖音（强情绪 + 钩子）' },
  { v: '头条', label: '头条资讯（直白 + 关键词）' },
  { v: 'SEO', label: 'SEO 标题（含关键词 ≤30 字）' },
  { v: '知乎', label: '知乎（问题式/观点式）' },
];
const STYLES = ['自然多样', '悬念式', '数字式', '对比式', '提问式', '情绪化'];

export default function AiTitle() {
  const byok = useByok();
  const gen = useGenerate();
  const [topic, setTopic] = useState('');
  const [platform, setPlatform] = useState('公众号');
  const [style, setStyle] = useState('自然多样');
  const [count, setCount] = useState('10');

  const build = () => {
    const sys = `你是爆款标题专家，深谙各平台标题规律。用户给出主题，你生成 ${count} 个${platform}平台标题。
要求：
1. 严格符合${platform}平台的标题风格与字数习惯
2. 风格倾向：${style}
3. 标题真实贴合主题，不夸大、不标题党（SEO 体的关键词自然出现）
4. 每个标题独占一行，不加序号、不加引号、不加额外说明
5. 多样化，避免套路重复`;
    const user = `主题：${topic}\n平台：${platform}\n风格：${style}\n数量：${count} 个`;
    return [
      { role: 'system' as const, content: sys },
      { role: 'user' as const, content: user },
    ];
  };

  const onGen = () => {
    if (!topic.trim()) return;
    gen.generate(sig => callChatOnce({ ...byok, messages: build(), signal: sig, temperature: 0.9, maxTokens: 1024 }));
  };

  return (
    <div>
      <ApiKeyPanel state={byok} />

      <div class="tool-card" style={{ marginTop: '12px' }}>
        <label class="text-sm font-bold">主题 / 内容关键词</label>
        <textarea
          class="text-area mt-md"
          value={topic}
          onChange={e => setTopic(e.target.value)}
          placeholder="例如：一款降噪耳机新品发布，主打通勤场景"
          style={{ minHeight: '70px' }}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
          <div>
            <label class="text-xs text-muted">平台</label>
            <select class="input mt-md" value={platform} onChange={e => setPlatform(e.target.value)}>
              {PLATFORMS.map(p => <option value={p.v}>{p.label}</option>)}
            </select>
          </div>
          <div>
            <label class="text-xs text-muted">生成数量</label>
            <select class="input mt-md" value={count} onChange={e => setCount(e.target.value)}>
              <option value="5">5 个</option>
              <option value="10">10 个</option>
              <option value="15">15 个</option>
              <option value="20">20 个</option>
            </select>
          </div>
        </div>

        <div style={{ marginTop: '12px' }}>
          <label class="text-xs text-muted">风格倾向</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
            {STYLES.map(s => (
              <button
                onClick={() => setStyle(s)}
                style={{
                  padding: '4px 12px', fontSize: '13px', borderRadius: '14px', cursor: 'pointer',
                  border: style === s ? '1px solid var(--blue)' : '1px solid var(--border)',
                  background: style === s ? 'rgba(30,58,95,0.06)' : '#fff',
                  color: style === s ? 'var(--blue)' : 'var(--text)',
                }}
              >{s}</button>
            ))}
          </div>
        </div>

        <button
          class="btn"
          style={{ marginTop: '14px', width: '100%' }}
          disabled={!byok.isReady || !topic.trim() || gen.loading}
          onClick={onGen}
        >
          {gen.loading ? '生成中…' : !byok.isReady ? '请先配置 API Key' : '🏷 生成标题'}
        </button>
      </div>

      <ResultBlock result={gen.result} loading={gen.loading} error={gen.error} onRetry={onGen} placeholder="候选标题会显示在这里，每行一个" />
    </div>
  );
}
