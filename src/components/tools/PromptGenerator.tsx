import { useState } from 'react';
import { useByok, ApiKeyPanel, useGenerate, callChatOnce, ResultBlock } from './_byok';

export default function PromptGenerator() {
  const byok = useByok();
  const gen = useGenerate();
  const [task, setTask] = useState('');
  const [lang, setLang] = useState('中文');
  const [detail, setDetail] = useState('标准');

  const build = () => {
    const detailDesc = {
      minimal: '精简版：只含角色 + 任务 + 输出格式，控制在 150 字内',
      standard: '标准版：含角色、任务、输入说明、执行步骤、约束、输出格式',
      detailed: '详尽版：标准版 + few-shot 示例 + 边界情况处理 + 失败回退策略',
    }[detail];
    const sys = `你是 Prompt 工程专家。用户描述任务目标，你反向生成完整可用的 Prompt。要求：
1. ${detailDesc}
2. 用 ${lang} 撰写
3. 用占位符 {{变量名}} 标记用户需替换的变量
4. 结构清晰，每部分用 Markdown 标题或粗体分隔
5. 直接输出 Prompt 内容（用代码块包裹便于复制），不加额外解释`;
    const user = `我的任务目标：\n${task}`;
    return [
      { role: 'system' as const, content: sys },
      { role: 'user' as const, content: user },
    ];
  };

  const onGen = () => {
    if (!task.trim()) return;
    gen.generate(sig => callChatOnce({ ...byok, messages: build(), signal: sig, temperature: 0.5, maxTokens: 2000 }));
  };

  return (
    <div>
      <ApiKeyPanel state={byok} />

      <div class="tool-card" style={{ marginTop: '12px' }}>
        <label class="text-sm font-bold">任务目标描述（越具体越好）</label>
        <textarea
          class="text-area mt-md"
          value={task}
          onChange={e => setTask(e.target.value)}
          placeholder={'如：帮一款 ¥199 无线耳机写小红书种草文案，目标用户是大学生，强调性价比'}
          style={{ minHeight: '100px' }}
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
          <div>
            <label class="text-xs text-muted">Prompt 语言</label>
            <select class="input mt-md" value={lang} onChange={e => setLang(e.target.value)}>
              <option value="中文">中文</option>
              <option value="英文">英文</option>
            </select>
          </div>
          <div>
            <label class="text-xs text-muted">详细程度</label>
            <select class="input mt-md" value={detail} onChange={e => setDetail(e.target.value)}>
              <option value="minimal">精简版</option>
              <option value="standard">标准版</option>
              <option value="detailed">详尽版（含示例）</option>
            </select>
          </div>
        </div>

        <button
          class="btn"
          style={{ marginTop: '14px', width: '100%' }}
          disabled={!byok.isReady || !task.trim() || gen.loading}
          onClick={onGen}
        >
          {gen.loading ? '生成中…' : !byok.isReady ? '请先配置 API Key' : '🧩 生成 Prompt'}
        </button>
      </div>

      <ResultBlock result={gen.result} loading={gen.loading} error={gen.error} onRetry={onGen} placeholder="生成的完整 Prompt 会显示在这里" />
    </div>
  );
}
