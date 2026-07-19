import { useState } from 'react';
import { useByok, ApiKeyPanel, useGenerate, callChatOnce, ResultBlock } from './_byok';

const SCENARIOS = [
  { v: '商务沟通', label: '商务沟通' },
  { v: '客户跟进', label: '客户跟进' },
  { v: '求职应聘', label: '求职应聘' },
  { v: '辞职', label: '辞职' },
  { v: '会议邀请', label: '会议邀请' },
  { v: '感谢信', label: '感谢信' },
  { v: '投诉/反馈', label: '投诉/反馈' },
  { v: '拒绝/婉拒', label: '拒绝/婉拒' },
];
const TONES = ['正式商务', '礼貌友好', '委婉得体', '直接简洁', '诚恳'];
const LANGS = ['中文', '英文', '中英双语'];

export default function AiEmail() {
  const byok = useByok();
  const gen = useGenerate();
  const [scenario, setScenario] = useState('商务沟通');
  const [recipient, setRecipient] = useState('');
  const [purpose, setPurpose] = useState('');
  const [tone, setTone] = useState('正式商务');
  const [lang, setLang] = useState('中文');
  const [extra, setExtra] = useState('');

  const build = () => {
    const sys = `你是资深商务文书助手，擅长撰写得体、专业的邮件。要求：
1. 场景：${scenario}
2. 语气：${tone}
3. 语言：${lang}${lang === '中英双语' ? '（先中文后英文，用分隔线隔开）' : ''}
4. 结构含：称呼、开场、正文、收尾、署名
5. 措辞得体、分寸恰当，避免歧义和话柄
6. 直接输出邮件正文（含称呼和署名），不加额外说明${extra ? `\n7. ${extra}` : ''}`;
    const user = `收件人：${recipient || '请自行假设合适称呼'}
邮件目的：${purpose}`;
    return [
      { role: 'system' as const, content: sys },
      { role: 'user' as const, content: user },
    ];
  };

  const onGen = () => {
    if (!purpose.trim()) return;
    gen.generate(sig => callChatOnce({ ...byok, messages: build(), signal: sig, temperature: 0.6, maxTokens: 1500 }));
  };

  return (
    <div>
      <ApiKeyPanel state={byok} />

      <div class="tool-card" style={{ marginTop: '12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label class="text-xs text-muted">场景</label>
            <select class="input mt-md" value={scenario} onChange={e => setScenario(e.target.value)}>
              {SCENARIOS.map(s => <option value={s.v}>{s.label}</option>)}
            </select>
          </div>
          <div>
            <label class="text-xs text-muted">语言</label>
            <select class="input mt-md" value={lang} onChange={e => setLang(e.target.value)}>
              {LANGS.map(l => <option value={l}>{l}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginTop: '12px' }}>
          <label class="text-xs text-muted">收件人（可选）</label>
          <input class="input mt-md" value={recipient} onChange={e => setRecipient(e.target.value)} placeholder="如：张总 / 阿里 HR 李女士 / 全体部门同事" />
        </div>

        <div style={{ marginTop: '12px' }}>
          <label class="text-sm font-bold">邮件目的 / 关键信息</label>
          <textarea
            class="text-area mt-md"
            value={purpose}
            onChange={e => setPurpose(e.target.value)}
            placeholder="如：申请下周一请假一天处理家事，已与同事完成工作交接"
            style={{ minHeight: '80px' }}
          />
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
          <label class="text-xs text-muted">补充（可选）</label>
          <input class="input mt-md" value={extra} onChange={e => setExtra(e.target.value)} placeholder="如：附上简历、要求 11 月 20 日前回复" />
        </div>

        <button
          class="btn"
          style={{ marginTop: '14px', width: '100%' }}
          disabled={!byok.isReady || !purpose.trim() || gen.loading}
          onClick={onGen}
        >
          {gen.loading ? '起草中…' : !byok.isReady ? '请先配置 API Key' : '✉ 起草邮件'}
        </button>
      </div>

      <ResultBlock result={gen.result} loading={gen.loading} error={gen.error} onRetry={onGen} placeholder="邮件草稿会显示在这里" />
    </div>
  );
}
