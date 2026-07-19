import { useState } from 'react';
import { useByok, ApiKeyPanel, useGenerate, callChatOnce, ResultBlock } from './_byok';

const PERIODS = [
  { v: '日报', label: '日报' },
  { v: '周报', label: '周报' },
  { v: '月报', label: '月报' },
  { v: '季度汇报', label: '季度汇报' },
];
const TEMPLATES = [
  { v: 'standard', label: '标准型（完成/进展/问题/计划）' },
  { v: 'star', label: '亮点型（STAR 法则突出成果）' },
  { v: 'okr', label: 'OKR 型（对齐目标与关键结果）' },
  { v: 'simple', label: '简略型（要点列表）' },
];

export default function AiReport() {
  const byok = useByok();
  const gen = useGenerate();
  const [period, setPeriod] = useState('周报');
  const [template, setTemplate] = useState('standard');
  const [items, setItems] = useState('');
  const [role, setRole] = useState('');
  const [extra, setExtra] = useState('');

  const build = () => {
    const tmplDesc = {
      standard: '按"本期完成 / 进行中 / 问题与风险 / 下期计划"四部分结构化呈现',
      star: '用 STAR 法则（情境-任务-行动-结果）突出亮点与成果，量化数据优先',
      okr: '按 OKR 结构：目标(O) + 关键结果(KR) + 进度 + 阻塞',
      simple: '用简洁要点列表，流水账式呈现',
    }[template];
    const sys = `你是资深职场写手，擅长把零散工作要点整理成结构清晰、亮点突出的${period}。要求：
1. ${tmplDesc}
2. 用专业、得体的商务语言，避免空话
3. 量化结果优先（XX% / X 倍 / X 天），无数据则用定性描述
4. 适度润色但不编造事实，忠于用户输入
5. 直接输出汇报正文${extra ? `\n6. ${extra}` : ''}`;
    const user = `汇报周期：${period}${role ? `\n我的角色：${role}` : ''}

本周工作要点（请整理为正式${period}）：
${items}`;
    return [
      { role: 'system' as const, content: sys },
      { role: 'user' as const, content: user },
    ];
  };

  const onGen = () => {
    if (!items.trim()) return;
    gen.generate(sig => callChatOnce({ ...byok, messages: build(), signal: sig, temperature: 0.5, maxTokens: 2048 }));
  };

  return (
    <div>
      <ApiKeyPanel state={byok} />

      <div class="tool-card" style={{ marginTop: '12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label class="text-xs text-muted">汇报周期</label>
            <select class="input mt-md" value={period} onChange={e => setPeriod(e.target.value)}>
              {PERIODS.map(p => <option value={p.v}>{p.label}</option>)}
            </select>
          </div>
          <div>
            <label class="text-xs text-muted">模板</label>
            <select class="input mt-md" value={template} onChange={e => setTemplate(e.target.value)}>
              {TEMPLATES.map(t => <option value={t.v}>{t.label}</option>)}
            </select>
          </div>
        </div>

        <div style={{ marginTop: '12px' }}>
          <label class="text-xs text-muted">我的角色（可选）</label>
          <input class="input mt-md" value={role} onChange={e => setRole(e.target.value)} placeholder="如：前端开发 / 产品经理 / 运营专员" />
        </div>

        <div style={{ marginTop: '12px' }}>
          <label class="text-sm font-bold">工作要点（每行一条，越具体越好）</label>
          <textarea
            class="text-area mt-md"
            value={items}
            onChange={e => setItems(e.target.value)}
            placeholder={'如：\n完成首页改版上线，转化率 +12%\n修复支付流程 3 个 P1 bug\n推动跨部门设计评审，约定下周交付'}
            style={{ minHeight: '120px' }}
          />
        </div>

        <div style={{ marginTop: '12px' }}>
          <label class="text-xs text-muted">补充（可选）</label>
          <input class="input mt-md" value={extra} onChange={e => setExtra(e.target.value)} placeholder="如：突出主动改进、口语化一些" />
        </div>

        <button
          class="btn"
          style={{ marginTop: '14px', width: '100%' }}
          disabled={!byok.isReady || !items.trim() || gen.loading}
          onClick={onGen}
        >
          {gen.loading ? '生成中…' : !byok.isReady ? '请先配置 API Key' : '📊 生成汇报'}
        </button>
      </div>

      <ResultBlock result={gen.result} loading={gen.loading} error={gen.error} onRetry={onGen} placeholder="汇报文本会显示在这里" />
    </div>
  );
}
