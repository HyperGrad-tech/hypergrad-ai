import { useState, useMemo, useCallback } from 'react';

interface Field {
  id: string;
  label: string;
  hint: string;
  placeholder: string;
  required?: boolean;
}

const PRESETS: { name: string; values: Record<string, string> }[] = [
  {
    name: '清空',
    values: { identity: '', background: '', tone: '', skills: '', bounds: '', format: '', examples: '', fallback: '' },
  },
  {
    name: '客服助手',
    values: {
      identity: '你是 Acme 公司的资深客服',
      background: '熟悉 Acme 全线产品（SaaS 协作工具），3 年一线客服经验',
      tone: '耐心、礼貌、专业，用第二人称"您"',
      skills: '解答产品功能、排查常见问题、引导自助操作、识别升级场景',
      bounds: '只回答 Acme 产品相关问题；不承诺退款/补偿（需升级主管）；不给投资建议',
      format: '回复结构：1) 复述确认用户问题 2) 给出方案（分步骤）3) 询问是否解决',
      examples: '',
      fallback: '无法解决时：道歉 + 记录工单 + 告知预计回复时间',
    },
  },
  {
    name: '写作教练',
    values: {
      identity: '你是资深写作教练',
      background: '15 年写作教学经验，擅长公众号、商务文档、非虚构写作',
      tone: '直接、具体、用案例，不空夸',
      skills: '诊断文稿结构/逻辑/语言/感染力问题，给出可执行修改建议',
      bounds: '不替用户重写全文，只教方法；不评价用户人格，只论文稿',
      format: '反馈按"结构-逻辑-语言-感染力"4维度，每处给修改前后对比 + 理由',
      examples: '示例反馈格式："【原】...【改】...【因】..."',
      fallback: '若文稿过短难以诊断，先请用户补充背景与目标读者',
    },
  },
  {
    name: '翻译专家',
    values: {
      identity: '你是专业译者',
      background: '精通中英双语，熟悉 IT/商业/医学多领域术语',
      tone: '译文自然流畅，符合目标语言母语习惯',
      skills: '中英互译、术语一致性、风格适配、本地化建议',
      bounds: '不评价原文质量；不擅自删改信息；术语不确定时标注',
      format: '直接输出译文；术语表单列；必要时附译注',
      examples: '',
      fallback: '原文有歧义时，列出可能理解并各给一版译文',
    },
  },
  {
    name: '程序员 Buddy',
    values: {
      identity: '你是资深全栈工程师',
      background: '10 年经验，精通 TS/Python/Go/React/Node',
      tone: '简洁、技术准确、给可运行代码',
      skills: '代码 review、架构设计、Bug 排查、性能优化、技术选型',
      bounds: '不臆测运行时行为；不推荐未经验证的库；不确定时明说',
      format: '回答含：1) 直接结论 2) 代码示例 3) 关键取舍说明',
      examples: '',
      fallback: '问题信息不足时，先列出需要的最小信息清单',
    },
  },
];

const FIELDS: Field[] = [
  { id: 'identity', label: '身份 / 角色', hint: '一句话定义 AI 是谁', placeholder: '你是资深产品经理', required: true },
  { id: 'background', label: '经验背景', hint: '专业领域、年限、专长', placeholder: '10年 C 端产品经验，擅长用户增长' },
  { id: 'tone', label: '说话语气', hint: '语气、人称、风格', placeholder: '直接、用案例、避免空话' },
  { id: 'skills', label: '能力（能做什么）', hint: '核心能力范围', placeholder: '需求分析、原型设计、数据分析、竞品调研' },
  { id: 'bounds', label: '边界（不能做什么）', hint: '禁止项与红线', placeholder: '不评价用户人格；不替用户做最终决策' },
  { id: 'format', label: '输出格式', hint: '回复结构与格式', placeholder: '回复分3部分：1) 直接结论 2) 论证 3) 行动建议' },
  { id: 'examples', label: '示例（可选）', hint: 'few-shot 引导', placeholder: '示例问答或输出样例' },
  { id: 'fallback', label: '兜底规则', hint: '信息不足或异常时的处理', placeholder: '信息不足时，先列出需要的最小信息再继续' },
];

export default function SystemPromptBuilder() {
  const [v, setV] = useState<Record<string, string>>(() => ({ ...PRESETS[0].values }));
  const [copied, setCopied] = useState(false);

  const set = (id: string, val: string) => setV(prev => ({ ...prev, [id]: val }));
  const applyPreset = (vals: Record<string, string>) => setV({ ...vals });

  const assembled = useMemo(() => {
    const parts: string[] = [];
    const has = (k: string) => Boolean(v[k] && v[k].trim());
    if (has('identity')) parts.push(`# 角色设定\n${v.identity!.trim()}`);
    if (has('background')) parts.push(`# 经验背景\n${v.background!.trim()}`);
    if (has('tone')) parts.push(`# 说话语气\n${v.tone!.trim()}`);
    if (has('skills')) parts.push(`# 核心能力\n${v.skills!.trim()}`);
    if (has('bounds')) parts.push(`# 能力边界（禁止项）\n${v.bounds!.trim()}`);
    if (has('format')) parts.push(`# 输出格式\n${v.format!.trim()}`);
    if (has('examples')) parts.push(`# 示例\n${v.examples!.trim()}`);
    if (has('fallback')) parts.push(`# 兜底规则\n${v.fallback!.trim()}`);
    return parts.join('\n\n');
  }, [v]);

  const copy = useCallback(() => {
    if (!assembled) return;
    navigator.clipboard.writeText(assembled);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [assembled]);

  return (
    <div>
      {/* 预设模板 */}
      <div class="tool-card" style={{ background: 'var(--bg-soft)' }}>
        <label class="text-sm font-bold">快速模板</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
          {PRESETS.map(p => (
            <button
              key={p.name}
              onClick={() => applyPreset(p.values)}
              class="btn btn-ghost btn-sm"
            >{p.name === '清空' ? '↺ 清空' : p.name}</button>
          ))}
        </div>
        <div class="text-xs text-muted" style={{ marginTop: '6px' }}>选择模板后仍可在下方逐项编辑。</div>
      </div>

      {/* 表单 */}
      <div class="tool-card" style={{ marginTop: '12px' }}>
        {FIELDS.map(f => (
          <div key={f.id} style={{ marginBottom: '12px' }}>
            <label class="text-sm font-bold">
              {f.label}
              {f.required && <span style={{ color: '#B83A3A', marginLeft: '4px' }}>*</span>}
            </label>
            <div class="text-xs text-muted" style={{ marginTop: '2px' }}>{f.hint}</div>
            <textarea
              class="text-area"
              value={v[f.id] || ''}
              onChange={e => set(f.id, e.target.value)}
              placeholder={f.placeholder}
              style={{ marginTop: '6px', minHeight: f.id === 'examples' ? '80px' : '52px', fontSize: '13px' }}
            />
          </div>
        ))}
      </div>

      {/* 生成结果 */}
      <div class="tool-card" style={{ marginTop: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span class="text-sm font-bold">生成的 System Prompt</span>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <span class="text-xs text-muted">{assembled.length} 字</span>
            <button class="btn btn-ghost btn-sm" onClick={copy} disabled={!assembled}>
              {copied ? '✓ 已复制' : '复制'}
            </button>
          </div>
        </div>
        <pre style={{
          background: 'var(--bg-soft)', padding: '14px', borderRadius: 'var(--radius-sm)',
          fontFamily: 'var(--font-mono)', fontSize: '12px', lineHeight: 1.7,
          whiteSpace: 'pre-wrap', wordBreak: 'break-word', color: 'var(--text)',
          margin: 0, border: '1px solid var(--border)', minHeight: '60px',
        }}>{assembled || '填写左侧表单后，此处自动生成结构化 System Prompt…'}</pre>
        <div class="text-xs text-muted" style={{ marginTop: '8px', lineHeight: 1.6 }}>
          复制后粘贴到：ChatGPT「自定义指令」、Claude「System」、或 API 调用的 system 字段。也可配合本站「AI 对话」工具填入系统人设框使用。
        </div>
      </div>
    </div>
  );
}
