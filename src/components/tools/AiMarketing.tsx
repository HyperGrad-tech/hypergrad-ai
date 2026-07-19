import { useState } from 'react';
import { useByok, ApiKeyPanel, useGenerate, callChatOnce, ResultBlock } from './_byok';

const PLATFORMS = [
  { v: '小红书', label: '小红书（种草 + emoji）' },
  { v: '抖音', label: '抖音（短平快 + 钩子）' },
  { v: '电商详情页', label: '电商详情页（FAB 卖点）' },
  { v: '朋友圈', label: '朋友圈（生活化弱广告）' },
  { v: '公众号', label: '公众号（长文案）' },
];

export default function AiMarketing() {
  const byok = useByok();
  const gen = useGenerate();
  const [product, setProduct] = useState('');
  const [platform, setPlatform] = useState('小红书');
  const [points, setPoints] = useState('');
  const [audience, setAudience] = useState('');
  const [compose, setCompose] = useState(true); // 含 emoji/hashtag

  const build = () => {
    const sys = `你是资深营销文案写手，深谙各平台算法与用户心理。要求：
1. 严格符合${platform}平台的文案风格与结构
2. 卖点提炼清晰，FAB（属性-优势-利益）逻辑完整
3. 有强 CTA（行动号召），引导转化
${compose ? '4. 含适量 emoji 与 3-5 个 hashtag（按平台惯例放置）' : '4. 不加 emoji，正式商务风格'}
5. 符合《广告法》，避免极限词（最、第一、绝对等）
6. 直接输出文案正文，不加"以下是…"开场白`;
    const user = `产品/服务：${product}
目标平台：${platform}
核心卖点：${points || '由你根据产品提炼'}
目标人群：${audience || '由你推断'}
含 emoji/hashtag：${compose ? '是' : '否'}`;
    return [
      { role: 'system' as const, content: sys },
      { role: 'user' as const, content: user },
    ];
  };

  const onGen = () => {
    if (!product.trim()) return;
    gen.generate(sig => callChatOnce({ ...byok, messages: build(), signal: sig, temperature: 0.85, maxTokens: 2048 }));
  };

  return (
    <div>
      <ApiKeyPanel state={byok} />

      <div class="tool-card" style={{ marginTop: '12px' }}>
        <label class="text-sm font-bold">产品 / 服务</label>
        <input class="input mt-md" value={product} onChange={e => setProduct(e.target.value)} placeholder="如：无线降噪耳机，售价 ¥299" />

        <div style={{ marginTop: '12px' }}>
          <label class="text-xs text-muted">投放平台</label>
          <select class="input mt-md" value={platform} onChange={e => setPlatform(e.target.value)}>
            {PLATFORMS.map(p => <option value={p.v}>{p.label}</option>)}
          </select>
        </div>

        <div style={{ marginTop: '12px' }}>
          <label class="text-xs text-muted">核心卖点（可选，留空由 AI 提炼）</label>
          <textarea class="text-area mt-md" value={points} onChange={e => setPoints(e.target.value)} placeholder="如：续航 40 小时、降噪 35dB、舒适佩戴" style={{ minHeight: '60px' }} />
        </div>

        <div style={{ marginTop: '12px' }}>
          <label class="text-xs text-muted">目标人群（可选）</label>
          <input class="input mt-md" value={audience} onChange={e => setAudience(e.target.value)} placeholder="如：大学生通勤族" />
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', cursor: 'pointer', fontSize: '13px' }}>
          <input type="checkbox" checked={compose} onChange={e => setCompose(e.target.checked)} />
          含 emoji 与 hashtag
        </label>

        <button
          class="btn"
          style={{ marginTop: '14px', width: '100%' }}
          disabled={!byok.isReady || !product.trim() || gen.loading}
          onClick={onGen}
        >
          {gen.loading ? '生成中…' : !byok.isReady ? '请先配置 API Key' : '📣 生成文案'}
        </button>
      </div>

      <ResultBlock result={gen.result} loading={gen.loading} error={gen.error} onRetry={onGen} placeholder="营销文案会显示在这里" />
    </div>
  );
}
