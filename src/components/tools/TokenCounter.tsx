import { useState, useMemo } from 'react';

interface ModelInfo {
  id: string;
  label: string;
  /** 每个 CJK 字符约消耗多少 Token */
  tokensPerCn: number;
  /** 输入价格（CNY / 百万 Token） */
  inputPrice: number;
  /** 输出价格（CNY / 百万 Token） */
  outputPrice: number;
  note: string;
}

// 非 CJK 文本约 4 字符 / Token（近似 BPE）
const CHARS_PER_TOKEN_NONCN = 4;

const MODELS: ModelInfo[] = [
  { id: 'glm-4-flash', label: '智谱 GLM-4-Flash', tokensPerCn: 0.7, inputPrice: 0, outputPrice: 0, note: '完全免费' },
  { id: 'deepseek-chat', label: 'DeepSeek-V3', tokensPerCn: 0.6, inputPrice: 1, outputPrice: 2, note: '最便宜通用模型' },
  { id: 'deepseek-reasoner', label: 'DeepSeek-R1', tokensPerCn: 0.6, inputPrice: 4, outputPrice: 16, note: '推理模型，慢但聪明' },
  { id: 'gpt-4o-mini', label: 'GPT-4o mini', tokensPerCn: 1.3, inputPrice: 1.08, outputPrice: 4.32, note: '便宜快速' },
  { id: 'gpt-4o', label: 'GPT-4o', tokensPerCn: 1.3, inputPrice: 18, outputPrice: 72, note: '旗舰模型' },
  { id: 'claude-3-5-haiku', label: 'Claude 3.5 Haiku', tokensPerCn: 1.4, inputPrice: 5.76, outputPrice: 28.8, note: 'Anthropic 快速版' },
  { id: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet', tokensPerCn: 1.4, inputPrice: 21.6, outputPrice: 108, note: '写作质量最佳' },
  { id: 'glm-4-plus', label: '智谱 GLM-4-Plus', tokensPerCn: 0.7, inputPrice: 50, outputPrice: 50, note: '智谱旗舰（较贵）' },
];

function countChars(text: string) {
  let cn = 0;
  let noncn = 0;
  for (const ch of text) {
    const code = ch.codePointAt(0)!;
    // CJK 统一表意 + 扩展A + 平假名 + 片假名 + 谚文
    if (
      (code >= 0x4e00 && code <= 0x9fff) ||
      (code >= 0x3400 && code <= 0x4dbf) ||
      (code >= 0x3040 && code <= 0x30ff) ||
      (code >= 0xac00 && code <= 0xd7af)
    ) {
      cn++;
    } else if (code > 0x20) {
      // 排除控制字符与空格，其余计入非 CJK
      noncn++;
    }
  }
  return { cn, noncn };
}

function estimateTokens(text: string, model: ModelInfo): number {
  if (!text) return 0;
  const { cn, noncn } = countChars(text);
  return Math.ceil(cn * model.tokensPerCn + noncn / CHARS_PER_TOKEN_NONCN);
}

function fmtMoney(yuan: number): string {
  if (yuan === 0) return '免费';
  if (yuan < 0.01) return `¥${yuan.toFixed(4)}`;
  if (yuan < 1) return `¥${yuan.toFixed(3)}`;
  return `¥${yuan.toFixed(2)}`;
}

export default function TokenCounter() {
  const [text, setText] = useState('');
  const [modelId, setModelId] = useState('deepseek-chat');
  const [expectedOutput, setExpectedOutput] = useState(500);

  const model = MODELS.find(m => m.id === modelId) || MODELS[1];

  const stats = useMemo(() => {
    const { cn, noncn } = countChars(text);
    const inputTokens = estimateTokens(text, model);
    const inputCost = (inputTokens / 1_000_000) * model.inputPrice;
    const outputCost = (expectedOutput / 1_000_000) * model.outputPrice;
    const totalCost = inputCost + outputCost;
    return { cn, noncn, inputTokens, inputCost, outputCost, totalCost };
  }, [text, model, expectedOutput]);

  return (
    <div>
      <div class="tool-card">
        <label class="text-sm font-bold">输入文本</label>
        <textarea
          class="text-area mt-md"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="粘贴你的 Prompt 或文本，估算 Token 数与 API 费用"
          style={{ minHeight: '160px' }}
        />
        <div style={{ display: 'flex', gap: '16px', marginTop: '8px' }} class="text-xs text-muted">
          <span>中文字符 {stats.cn}</span>
          <span>非中文 {stats.noncn} 字符</span>
          <span>总字符 {stats.cn + stats.noncn}</span>
        </div>
      </div>

      <div class="tool-card" style={{ marginTop: '12px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <label class="text-xs text-muted">选择模型</label>
            <select class="input mt-md" value={modelId} onChange={e => setModelId(e.target.value)}>
              {MODELS.map(m => <option value={m.id}>{m.label} · {m.note}</option>)}
            </select>
          </div>
          <div>
            <label class="text-xs text-muted">预计输出 Token</label>
            <input
              class="input mt-md"
              type="number"
              min={0}
              step={100}
              value={expectedOutput}
              onChange={e => setExpectedOutput(Math.max(0, Number(e.target.value) || 0))}
            />
          </div>
        </div>

        {/* 结果 */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '14px' }}>
          <div style={{ background: 'var(--bg-soft)', padding: '12px', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
            <div class="text-xs text-muted">输入 Token</div>
            <div style={{ fontSize: '22px', fontWeight: 700, color: 'var(--blue-dark)', fontFamily: 'var(--font-mono)', margin: '4px 0' }}>{stats.inputTokens.toLocaleString()}</div>
          </div>
          <div style={{ background: 'var(--bg-soft)', padding: '12px', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
            <div class="text-xs text-muted">输入费用</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--blue-dark)', margin: '4px 0' }}>{fmtMoney(stats.inputCost)}</div>
          </div>
          <div style={{ background: 'var(--bg-soft)', padding: '12px', borderRadius: 'var(--radius-sm)', textAlign: 'center' }}>
            <div class="text-xs text-muted">输出费用</div>
            <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--blue-dark)', margin: '4px 0' }}>{fmtMoney(stats.outputCost)}</div>
          </div>
          <div style={{ background: 'rgba(30,58,95,0.08)', padding: '12px', borderRadius: 'var(--radius-sm)', textAlign: 'center', border: '1px solid var(--blue)' }}>
            <div class="text-xs text-muted">本次调用合计</div>
            <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--blue)', margin: '4px 0' }}>{fmtMoney(stats.totalCost)}</div>
          </div>
        </div>
      </div>

      {/* 模型对比 */}
      <div class="tool-card" style={{ marginTop: '12px' }}>
        <div class="text-sm font-bold" style={{ marginBottom: '10px' }}>主流模型单价对比（每百万 Token）</div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border)' }}>
                <th style={{ textAlign: 'left', padding: '6px 4px' }}>模型</th>
                <th style={{ textAlign: 'right', padding: '6px 4px' }}>输入</th>
                <th style={{ textAlign: 'right', padding: '6px 4px' }}>输出</th>
                <th style={{ textAlign: 'right', padding: '6px 4px' }}>本文本估算</th>
              </tr>
            </thead>
            <tbody>
              {MODELS.map(m => {
                const t = estimateTokens(text, m);
                const cost = (t / 1_000_000) * m.inputPrice;
                return (
                  <tr key={m.id} style={{ borderBottom: '1px solid var(--border)' }}>
                    <td style={{ padding: '6px 4px' }}>
                      {m.label}
                      {m.id === modelId && <span style={{ color: 'var(--blue)', marginLeft: '4px' }}>●</span>}
                    </td>
                    <td style={{ textAlign: 'right', padding: '6px 4px', fontFamily: 'var(--font-mono)' }}>{fmtMoney(m.inputPrice)}</td>
                    <td style={{ textAlign: 'right', padding: '6px 4px', fontFamily: 'var(--font-mono)' }}>{fmtMoney(m.outputPrice)}</td>
                    <td style={{ textAlign: 'right', padding: '6px 4px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>{text ? `${t} · ${fmtMoney(cost)}` : '—'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div class="text-xs text-muted" style={{ marginTop: '10px', lineHeight: 1.6 }}>
          ⚠ 本工具为<strong>估算值</strong>，误差通常 ±10% 以内。精确 Token 数以各模型官方 Tokenizer（如 OpenAI tiktoken）为准。
          计费请以 API 返回的 usage 字段为准。价格基于 2026 年公开定价，可能有变动。
        </div>
      </div>
    </div>
  );
}
