import { useState } from 'react';
import { useByok, ApiKeyPanel, useGenerate, callChatOnce, ResultBlock } from './_byok';

export default function PromptOptimizer() {
  const byok = useByok();
  const gen = useGenerate();
  const [input, setInput] = useState('');
  const [goal, setGoal] = useState('通用');
  const [explain, setExplain] = useState(true);

  const build = () => {
    const sys = `你是 Prompt 工程专家，精通大语言模型的指令优化。用户给你一个粗糙的 Prompt，你要：
1. 按 Prompt 工程最佳实践重写为结构清晰、约束明确的优质版本，包含：角色设定、任务目标、输入说明、执行步骤、约束条件、输出格式（必要时加示例）
2. 保留用户原始意图，不引入新需求
3. 优化目标场景：${goal}

${explain ? '输出格式：\n## 优化后的 Prompt\n（完整可用的 Prompt，可直接复制）\n\n## 优化说明\n- 改动 1：...\n- 改动 2：...\n（简述每处改动的理由）' : '只输出优化后的 Prompt，不加说明。'}`;
    const user = `原 Prompt：\n${input}`;
    return [
      { role: 'system' as const, content: sys },
      { role: 'user' as const, content: user },
    ];
  };

  const onGen = () => {
    if (!input.trim()) return;
    gen.generate(sig => callChatOnce({ ...byok, messages: build(), signal: sig, temperature: 0.4, maxTokens: 2000 }));
  };

  return (
    <div>
      <ApiKeyPanel state={byok} />

      <div class="tool-card" style={{ marginTop: '12px' }}>
        <label class="text-sm font-bold">原 Prompt（粗糙版）</label>
        <textarea
          class="text-area mt-md"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder={'如：帮我写个产品文案'}
          style={{ minHeight: '120px' }}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', marginTop: '12px' }}>
          <div>
            <label class="text-xs text-muted">优化目标场景</label>
            <select class="input mt-md" value={goal} onChange={e => setGoal(e.target.value)}>
              <option value="通用">通用</option>
              <option value="写作生成">写作生成</option>
              <option value="代码生成">代码生成</option>
              <option value="数据分析">数据分析</option>
              <option value="Agent / 工具调用">Agent / 工具调用</option>
              <option value="角色扮演对话">角色扮演对话</option>
              <option value="结构化输出（JSON）">结构化输出（JSON）</option>
            </select>
          </div>
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '12px', cursor: 'pointer', fontSize: '13px' }}>
          <input type="checkbox" checked={explain} onChange={e => setExplain(e.target.checked)} />
          附优化说明（每处改动理由）
        </label>

        <button
          class="btn"
          style={{ marginTop: '14px', width: '100%' }}
          disabled={!byok.isReady || !input.trim() || gen.loading}
          onClick={onGen}
        >
          {gen.loading ? '优化中…' : !byok.isReady ? '请先配置 API Key' : '✨ 优化 Prompt'}
        </button>
      </div>

      <ResultBlock result={gen.result} loading={gen.loading} error={gen.error} onRetry={onGen} placeholder="优化后的 Prompt 与说明会显示在这里" />
    </div>
  );
}
