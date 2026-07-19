import { useState, useRef, useEffect, useCallback } from 'react';
import { useByok, ApiKeyPanel, streamChat, type ChatMessage } from './_byok';

interface UIMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function AiChat() {
  const byok = useByok();
  const [system, setSystem] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [messages, setMessages] = useState<UIMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState('');
  const abortRef = useRef<AbortController | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // 自动滚到底
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const send = useCallback(async () => {
    const text = input.trim();
    if (!text || streaming || !byok.isReady) return;
    const newUser: UIMessage = { role: 'user', content: text };
    const newMsgs = [...messages, newUser];
    setMessages([...newMsgs, { role: 'assistant', content: '' }]);
    setInput('');
    setError('');
    setStreaming(true);

    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;

    const apiMessages: ChatMessage[] = [];
    if (system.trim()) apiMessages.push({ role: 'system', content: system.trim() });
    for (const m of newMsgs) apiMessages.push({ role: m.role, content: m.content });

    let acc = '';
    await streamChat({
      ...byok,
      messages: apiMessages,
      signal: ctrl.signal,
      temperature: 0.7,
      onToken: (chunk) => {
        acc += chunk;
        setMessages(prev => {
          const next = [...prev];
          next[next.length - 1] = { role: 'assistant', content: acc };
          return next;
        });
      },
      onDone: () => {
        setStreaming(false);
      },
      onError: (err) => {
        setStreaming(false);
        setError(err.message);
        // 移除空的 assistant 占位
        setMessages(prev => {
          const next = [...prev];
          const last = next[next.length - 1];
          if (last && last.role === 'assistant' && !last.content) next.pop();
          return next;
        });
      },
    });
  }, [input, streaming, byok, messages, system]);

  const stop = useCallback(() => {
    abortRef.current?.abort();
    setStreaming(false);
  }, []);

  const clear = useCallback(() => {
    abortRef.current?.abort();
    setMessages([]);
    setError('');
    setInput('');
    setStreaming(false);
  }, []);

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div>
      <ApiKeyPanel state={byok} />

      {/* 高级设置：System Prompt */}
      <div class="tool-card" style={{ marginTop: '12px' }}>
        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--blue-dark)', fontWeight: 600, fontSize: '13px' }}
        >
          {showAdvanced ? '▼' : '▶'} 系统人设（System Prompt，可选）
        </button>
        {showAdvanced && (
          <div style={{ marginTop: '8px' }}>
            <textarea
              class="text-area"
              value={system}
              onChange={e => setSystem(e.target.value)}
              placeholder={'设定 AI 的人设，如：\n你是资深产品经理，10 年 C 端经验，用直接、案例驱动的语气回答，避免空话。'}
              style={{ minHeight: '80px', fontSize: '13px' }}
            />
            <div class="text-xs text-muted" style={{ marginTop: '4px' }}>
              系统人设在整个对话中持续生效。可粘贴本站「系统提示词生成器」生成的 Prompt。
            </div>
          </div>
        )}
      </div>

      {/* 对话区 */}
      <div class="tool-card" style={{ marginTop: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <span class="text-sm font-bold">对话</span>
          {messages.length > 0 && (
            <button class="btn btn-ghost btn-sm" onClick={clear}>清空对话</button>
          )}
        </div>

        <div ref={scrollRef} style={{ maxHeight: '460px', overflowY: 'auto', minHeight: messages.length ? 'auto' : '120px' }}>
          {messages.length === 0 && (
            <div style={{ color: 'var(--text-muted)', fontSize: '13px', padding: '20px 0', textAlign: 'center' }}>
              开始对话吧。支持多轮上下文，Enter 发送，Shift+Enter 换行。
            </div>
          )}
          {messages.map((m, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start',
              marginBottom: '12px',
            }}>
              <div style={{
                maxWidth: '85%',
                padding: '10px 14px',
                borderRadius: '12px',
                fontSize: '14px',
                lineHeight: 1.7,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                background: m.role === 'user' ? 'var(--blue)' : 'var(--bg-soft)',
                color: m.role === 'user' ? '#fff' : 'var(--text)',
                border: m.role === 'user' ? 'none' : '1px solid var(--border)',
              }}>
                {m.content || (m.role === 'assistant' && streaming ? '…' : '')}
              </div>
            </div>
          ))}
          {streaming && (
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '8px' }}>
              ● 流式生成中
            </div>
          )}
        </div>

        {error && (
          <div style={{ color: '#B83A3A', fontSize: '13px', lineHeight: 1.6, padding: '8px 10px', background: 'rgba(184,58,58,0.06)', borderRadius: 'var(--radius-sm)', marginTop: '8px' }}>
            ⚠ {error}
          </div>
        )}

        {/* 输入区 */}
        <div style={{ marginTop: '12px', display: 'flex', gap: '8px', alignItems: 'flex-end' }}>
          <textarea
            class="text-area"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={byok.isReady ? '输入消息，Enter 发送，Shift+Enter 换行' : '请先在上方配置 API Key'}
            style={{ minHeight: '52px', flex: 1, resize: 'none' }}
            disabled={!byok.isReady}
          />
          {streaming ? (
            <button class="btn btn-ghost" onClick={stop} style={{ height: '52px' }}>停止</button>
          ) : (
            <button
              class="btn"
              onClick={send}
              disabled={!byok.isReady || !input.trim()}
              style={{ height: '52px' }}
            >发送</button>
          )}
        </div>
        <div class="text-xs text-muted" style={{ marginTop: '6px' }}>
          对话记录仅存于浏览器本地，刷新保留，清除浏览器数据即消失。请求直连 {byok.provider} 官方 API。
        </div>
      </div>
    </div>
  );
}
