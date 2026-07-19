import { useState, useCallback, useEffect, useRef } from 'react';

/**
 * BYOK 共享基础设施
 * - 4 个 AI 服务商配置（DeepSeek / OpenAI / Anthropic / 智谱）
 * - ApiKeyPanel：密钥输入 + 服务商/模型选择 + localStorage 持久化 + 隐私提示
 * - useByok：封装 provider/apiKey/model 状态，多工具复用
 * - callChatOnce：非流式调用（一次性生成，适合写作/翻译/总结等）
 * - streamChat：流式调用（逐 Token 输出，适合 AI 对话）
 *
 * 设计原则：密钥仅存浏览器 localStorage，请求由浏览器直连 AI 官方 API，
 * 不经我们服务器，零中转零存储。
 */

// ============ 类型 ============
export type Provider = 'deepseek' | 'openai' | 'anthropic' | 'zhipu';

export interface ProviderModel {
  id: string;
  label: string;
  note?: string;
}

export interface ProviderConfig {
  id: Provider;
  label: string;
  keyUrl: string;
  models: ProviderModel[];
  defaultModel: string;
  /** 余额约 ¥X / 百万输入 Token，用于排序与成本提示 */
  cheapNote: string;
}

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface CallChatOpts {
  provider: Provider;
  apiKey: string;
  model: string;
  messages: ChatMessage[];
  signal?: AbortSignal;
  temperature?: number;
  maxTokens?: number;
}

export interface StreamChatOpts extends CallChatOpts {
  onToken: (chunk: string) => void;
  onDone: (full: string) => void;
  onError: (err: Error) => void;
}

// ============ 服务商配置 ============
export const PROVIDERS: ProviderConfig[] = [
  {
    id: 'deepseek',
    label: 'DeepSeek（深度求索）',
    keyUrl: 'https://platform.deepseek.com/api_keys',
    defaultModel: 'deepseek-chat',
    cheapNote: '最便宜·百万 Token 输入 ¥1 / 输出 ¥2',
    models: [
      { id: 'deepseek-chat', label: 'DeepSeek-V3', note: '通用对话，性价比之王' },
      { id: 'deepseek-reasoner', label: 'DeepSeek-R1', note: '深度推理，慢但更聪明' },
    ],
  },
  {
    id: 'openai',
    label: 'OpenAI',
    keyUrl: 'https://platform.openai.com/api-keys',
    defaultModel: 'gpt-4o-mini',
    cheapNote: 'GPT-4o-mini 百万 Token 输入 $0.15 / 输出 $0.60',
    models: [
      { id: 'gpt-4o-mini', label: 'GPT-4o mini', note: '便宜快速，日常够用' },
      { id: 'gpt-4o', label: 'GPT-4o', note: '旗舰模型，质量最佳' },
    ],
  },
  {
    id: 'anthropic',
    label: 'Anthropic Claude',
    keyUrl: 'https://console.anthropic.com/settings/keys',
    defaultModel: 'claude-3-5-haiku-20241022',
    cheapNote: 'Haiku 百万 Token 输入 $0.80 / 输出 $4',
    models: [
      { id: 'claude-3-5-haiku-20241022', label: 'Claude 3.5 Haiku', note: '快速便宜' },
      { id: 'claude-3-5-sonnet-20241022', label: 'Claude 3.5 Sonnet', note: '写作质量最佳' },
    ],
  },
  {
    id: 'zhipu',
    label: '智谱 GLM',
    keyUrl: 'https://open.bigmodel.cn/usercenter/proj-mgmt/apikeys',
    defaultModel: 'glm-4-flash',
    cheapNote: 'GLM-4-Flash 完全免费',
    models: [
      { id: 'glm-4-flash', label: 'GLM-4-Flash', note: '免费，速度快' },
      { id: 'glm-4-plus', label: 'GLM-4-Plus', note: '旗舰，质量更好' },
      { id: 'glm-4-air', label: 'GLM-4-Air', note: '轻量低价' },
    ],
  },
];

export function getProvider(id: Provider): ProviderConfig {
  return PROVIDERS.find(p => p.id === id) || PROVIDERS[0];
}

// ============ localStorage ============
const LS_PROVIDER = 'hgai_provider';
const LS_KEY_PREFIX = 'hgai_key_';
const LS_MODEL_PREFIX = 'hgai_model_';

function safeGet(key: string): string {
  try { return localStorage.getItem(key) || ''; } catch { return ''; }
}
function safeSet(key: string, val: string) {
  try { localStorage.setItem(key, val); } catch { /* 隐私模式忽略 */ }
}
function keySlot(id: Provider) { return LS_KEY_PREFIX + id; }
function modelSlot(id: Provider) { return LS_MODEL_PREFIX + id; }

// ============ useByok Hook ============
export interface ByokState {
  provider: Provider;
  setProvider: (p: Provider) => void;
  apiKey: string;
  setApiKey: (k: string) => void;
  model: string;
  setModel: (m: string) => void;
  isReady: boolean; // provider + apiKey 都已就绪
  /** 切换 provider 时自动恢复该 provider 的 key 与 model */
}

export function useByok(): ByokState {
  const [provider, setProviderState] = useState<Provider>(() => {
    const v = safeGet(LS_PROVIDER) as Provider;
    return (PROVIDERS.some(p => p.id === v) ? v : 'deepseek') as Provider;
  });
  const [apiKey, setKeyState] = useState<string>(() => safeGet(keySlot(provider)));
  const [model, setModelState] = useState<string>(() => {
    const saved = safeGet(modelSlot(provider));
    return saved || getProvider(provider).defaultModel;
  });

  // 切换 provider 时恢复其 key 与 model
  const setProvider = useCallback((p: Provider) => {
    setProviderState(p);
    safeSet(LS_PROVIDER, p);
    setKeyState(safeGet(keySlot(p)));
    const savedModel = safeGet(modelSlot(p));
    setModelState(savedModel || getProvider(p).defaultModel);
  }, []);

  const setApiKey = useCallback((k: string) => {
    setKeyState(k);
    safeSet(keySlot(provider), k);
  }, [provider]);

  const setModel = useCallback((m: string) => {
    setModelState(m);
    safeSet(modelSlot(provider), m);
  }, [provider]);

  return { provider, setProvider, apiKey, setApiKey, model, setModel, isReady: Boolean(apiKey) };
}

// ============ HTTP 调用 ============
function formatApiError(status: number, body: string, provider: Provider): Error {
  let detail = '';
  try {
    const j = JSON.parse(body);
    detail = j?.error?.message || j?.error?.code || j?.msg || j?.message || JSON.stringify(j).slice(0, 200);
  } catch {
    detail = body.slice(0, 200);
  }
  if (status === 401) return new Error(`API Key 无效或已过期（${provider}）。请检查密钥是否正确、是否已激活。`);
  if (status === 402 || status === 429) return new Error(`余额不足或请求过于频繁（${provider}）。请充值或稍后重试。${detail ? ' · ' + detail : ''}`);
  if (status === 400) return new Error(`请求参数错误（${provider}）。${detail ? ' · ' + detail : ''}`);
  if (status >= 500) return new Error(`AI 服务暂时不可用（${provider}，${status}）。请稍后重试。`);
  return new Error(`请求失败（${provider}，${status}）${detail ? '：' + detail : ''}`);
}

/**
 * DeepSeek / OpenAI / 智谱 均为 OpenAI 兼容协议
 */
function oaBaseUrl(id: Provider): string {
  if (id === 'deepseek') return 'https://api.deepseek.com/chat/completions';
  if (id === 'openai') return 'https://api.openai.com/v1/chat/completions';
  if (id === 'zhipu') return 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
  return '';
}

function oaHeaders(apiKey: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  };
}

function oaBody(model: string, messages: ChatMessage[], stream: boolean, temperature?: number, maxTokens?: number) {
  const b: Record<string, unknown> = { model, messages, stream };
  if (temperature !== undefined) b.temperature = temperature;
  if (maxTokens !== undefined) b.max_tokens = maxTokens;
  return JSON.stringify(b);
}

/** 从 OpenAI 兼容流的一行 data: 中提取 token */
function parseOaChunk(line: string): string | null | 'done' {
  if (!line.startsWith('data:')) return null;
  const data = line.slice(5).trim();
  if (data === '[DONE]') return 'done';
  try {
    const j = JSON.parse(data);
    const delta = j?.choices?.[0]?.delta?.content;
    if (typeof delta === 'string') return delta;
    return null;
  } catch {
    return null;
  }
}

/**
 * Anthropic Messages API（协议不同）
 */
function anthropicHeaders(apiKey: string): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    'x-api-key': apiKey,
    'anthropic-version': '2023-06-01',
    'anthropic-dangerous-direct-browser-access': 'true',
  };
}

function anthropicBody(model: string, messages: ChatMessage[], stream: boolean, temperature?: number, maxTokens?: number) {
  // Anthropic: system 单独字段，messages 中不含 system
  const system = messages.filter(m => m.role === 'system').map(m => m.content).join('\n\n');
  const chatMsgs = messages.filter(m => m.role !== 'system').map(m => ({
    role: m.role,
    content: m.content,
  }));
  const b: Record<string, unknown> = {
    model,
    messages: chatMsgs,
    max_tokens: maxTokens || 4096,
    stream,
  };
  if (system) b.system = system;
  if (temperature !== undefined) b.temperature = temperature;
  return JSON.stringify(b);
}

/** 从 Anthropic 流的 data: 行提取 token（content_block_delta 事件） */
function parseAnthropicChunk(line: string): string | null {
  if (!line.startsWith('data:')) return null;
  const data = line.slice(5).trim();
  try {
    const j = JSON.parse(data);
    if (j?.type === 'content_block_delta' && j?.delta?.text) return j.delta.text;
    return null;
  } catch {
    return null;
  }
}

function anthropicFull(body: string): string {
  try {
    const j = JSON.parse(body);
    return (j?.content || []).map((c: { text?: string }) => c.text || '').join('');
  } catch {
    return '';
  }
}

// ============ 一次性调用（非流式）============
export async function callChatOnce(opts: CallChatOpts): Promise<string> {
  const { provider, apiKey, model, messages, signal, temperature, maxTokens } = opts;
  if (!apiKey) throw new Error('未设置 API Key，请在上方填写。');

  const isAnthropic = provider === 'anthropic';
  const url = isAnthropic ? 'https://api.anthropic.com/v1/messages' : oaBaseUrl(provider);
  const headers = isAnthropic ? anthropicHeaders(apiKey) : oaHeaders(apiKey);
  const body = isAnthropic
    ? anthropicBody(model, messages, false, temperature, maxTokens)
    : oaBody(model, messages, false, temperature, maxTokens);

  let resp: Response;
  try {
    resp = await fetch(url, { method: 'POST', headers, body, signal });
  } catch (e) {
    const msg = (e instanceof Error ? e.message : String(e)).toLowerCase();
    if (msg.includes('failed to fetch') || msg.includes('network')) {
      throw new Error(`网络请求失败（${provider}）。可能原因：1) 浏览器拦截跨域；2) 你的网络无法访问该服务商；3) 该服务商不支持浏览器直连。建议优先尝试 DeepSeek。`);
    }
    throw new Error(`网络请求失败：${e instanceof Error ? e.message : String(e)}`);
  }

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    throw formatApiError(resp.status, text, provider);
  }

  const text = await resp.text();
  if (isAnthropic) return anthropicFull(text);
  try {
    const j = JSON.parse(text);
    return j?.choices?.[0]?.message?.content || '';
  } catch {
    throw new Error(`解析 AI 响应失败（${provider}）。请重试或更换模型。`);
  }
}

// ============ 流式调用 ============
export async function streamChat(opts: StreamChatOpts): Promise<void> {
  const { provider, apiKey, model, messages, signal, temperature, maxTokens, onToken, onDone, onError } = opts;
  if (!apiKey) { onError(new Error('未设置 API Key，请在上方填写。')); return; }

  const isAnthropic = provider === 'anthropic';
  const url = isAnthropic ? 'https://api.anthropic.com/v1/messages' : oaBaseUrl(provider);
  const headers = isAnthropic ? anthropicHeaders(apiKey) : oaHeaders(apiKey);
  const body = isAnthropic
    ? anthropicBody(model, messages, true, temperature, maxTokens)
    : oaBody(model, messages, true, temperature, maxTokens);

  let resp: Response;
  try {
    resp = await fetch(url, { method: 'POST', headers, body, signal });
  } catch (e) {
    const msg = (e instanceof Error ? e.message : String(e)).toLowerCase();
    if (msg.includes('abort')) { onError(new Error('已停止生成。')); return; }
    if (msg.includes('failed to fetch') || msg.includes('network')) {
      onError(new Error(`网络请求失败（${provider}）。可能跨域被拦截或无法访问该服务商，建议尝试 DeepSeek。`));
    } else {
      onError(new Error(`网络请求失败：${e instanceof Error ? e.message : String(e)}`));
    }
    return;
  }

  if (!resp.ok) {
    const text = await resp.text().catch(() => '');
    onError(formatApiError(resp.status, text, provider));
    return;
  }

  const reader = resp.body?.getReader();
  if (!reader) { onError(new Error('浏览器不支持流式读取。')); return; }

  const decoder = new TextDecoder('utf-8');
  let buffer = '';
  let full = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const raw of lines) {
        const line = raw.trim();
        if (!line) continue;
        if (line.startsWith('data:')) {
          let chunk: string | null | 'done' = null;
          if (isAnthropic) {
            chunk = parseAnthropicChunk(line);
          } else {
            chunk = parseOaChunk(line);
          }
          if (chunk === 'done') { onDone(full); return; }
          if (chunk) { full += chunk; onToken(chunk); }
        }
      }
    }
    // flush
    if (buffer.trim().startsWith('data:')) {
      const chunk = isAnthropic ? parseAnthropicChunk(buffer.trim()) : parseOaChunk(buffer.trim());
      if (chunk && chunk !== 'done') { full += chunk; onToken(chunk); }
    }
    onDone(full);
  } catch (e) {
    if (e instanceof Error && e.name === 'AbortError') { onError(new Error('已停止生成。')); return; }
    onError(new Error(`流式读取失败：${e instanceof Error ? e.message : String(e)}`));
  }
}

// ============ ApiKeyPanel 组件 ============
interface ApiKeyPanelProps {
  state: ByokState;
  /** 折叠为单行紧凑模式（适合侧边） */
  compact?: boolean;
}

export function ApiKeyPanel({ state, compact }: ApiKeyPanelProps) {
  const { provider, setProvider, apiKey, setApiKey, model, setModel } = state;
  const cfg = getProvider(provider);
  const [showKey, setShowKey] = useState(false);
  const [expanded, setExpanded] = useState(() => !apiKey);

  // 已保存密钥的服务商列表（用于显示"已配置"标记）
  const configuredProviders = PROVIDERS.filter(p => Boolean(safeGet(keySlot(p.id))));

  return (
    <div class="tool-card" style={{ background: 'var(--bg-soft)', borderColor: 'var(--blue)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }} class="mb-md">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span class="text-sm font-bold">⚙ API 设置</span>
          {apiKey ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#16a34a', background: 'rgba(22,163,74,0.1)', padding: '2px 9px', borderRadius: '10px', fontWeight: 500 }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#16a34a', display: 'inline-block' }}></span>
              已就绪 · {cfg.label}
            </span>
          ) : (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#C8862E', background: 'rgba(200,134,46,0.1)', padding: '2px 9px', borderRadius: '10px', fontWeight: 500 }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#C8862E', display: 'inline-block' }}></span>
              未配置
            </span>
          )}
        </div>
        {apiKey && !expanded && (
          <button class="btn btn-ghost btn-sm" onClick={() => setExpanded(true)}>展开修改</button>
        )}
        {apiKey && expanded && (
          <button class="btn btn-ghost btn-sm" onClick={() => setExpanded(false)}>收起</button>
        )}
      </div>

      {(!apiKey || expanded) && (
        <>
          {/* 隐私提示 */}
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', padding: '8px 10px', marginBottom: '12px', lineHeight: 1.6 }}>
            🔒 <strong>密钥本地存储</strong>：API Key 仅保存在你浏览器的 localStorage，<strong>从不</strong>上传到我们的服务器。
            你的请求由浏览器<strong>直接</strong>发送至 {cfg.label} 官方 API，<strong>不经我们中转</strong>，输入内容与生成结果我们同样不存储。清除浏览器数据即可擦除密钥。
          </div>

          {/* 服务商选择 */}
          <label class="text-xs text-muted">AI 服务商</label>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '6px', margin: '6px 0 12px' }}>
            {PROVIDERS.map(p => (
              <button
                onClick={() => setProvider(p.id)}
                style={{
                  padding: '8px 10px',
                  fontSize: '13px',
                  textAlign: 'left',
                  borderRadius: 'var(--radius-sm)',
                  border: provider === p.id ? '1px solid var(--blue)' : '1px solid var(--border)',
                  background: provider === p.id ? 'rgba(30,58,95,0.06)' : '#fff',
                  cursor: 'pointer',
                  color: 'var(--text)',
                  fontWeight: provider === p.id ? 600 : 400,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span>{p.label}</span>
                  {safeGet(keySlot(p.id)) && provider !== p.id && (
                    <span style={{ fontSize: '10px', color: '#16a34a' }}>●</span>
                  )}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{p.cheapNote}</div>
              </button>
            ))}
          </div>

          {/* API Key 输入 */}
          <label class="text-xs text-muted">
            API Key
            <a href={cfg.keyUrl} target="_blank" rel="noopener" style={{ marginLeft: '6px', color: 'var(--blue)', fontSize: '11px' }}>
              → 获取 {cfg.label} Key
            </a>
          </label>
          <div style={{ display: 'flex', gap: '6px', margin: '6px 0 12px' }}>
            <input
              class="input"
              type={showKey ? 'text' : 'password'}
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              placeholder={`粘贴你的 ${cfg.label} API Key`}
              style={{ fontFamily: 'var(--font-mono)', fontSize: '12px' }}
              autocomplete="off"
            />
            <button class="btn btn-ghost btn-sm" onClick={() => setShowKey(!showKey)} style={{ flexShrink: 0 }}>
              {showKey ? '隐藏' : '显示'}
            </button>
            {apiKey && (
              <button
                class="btn btn-ghost btn-sm"
                onClick={() => { setApiKey(''); }}
                style={{ flexShrink: 0, color: '#B83A3A' }}
              >清除</button>
            )}
          </div>

          {/* 模型选择 */}
          <label class="text-xs text-muted">模型</label>
          <select
            class="input"
            value={model}
            onChange={e => setModel(e.target.value)}
            style={{ margin: '6px 0 0', cursor: 'pointer' }}
          >
            {cfg.models.map(m => (
              <option value={m.id}>{m.label}{m.note ? ` · ${m.note}` : ''}</option>
            ))}
          </select>

          {configuredProviders.length > 1 && (
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '10px' }}>
              已配置密钥的服务商：{configuredProviders.map(p => p.label).join('、')}。切换服务商会自动加载对应密钥。
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ============ 通用 UI 小部件 ============

/** 生成结果展示区 + 复制按钮 */
export function ResultBlock({ result, loading, error, onRetry, placeholder }: {
  result: string;
  loading: boolean;
  error: string;
  onRetry?: () => void;
  placeholder?: string;
}) {
  const [copied, setCopied] = useState(false);
  const copy = useCallback(() => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [result]);

  return (
    <div>
      {(loading || result || error) && (
        <div class="tool-card" style={{ marginTop: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span class="text-sm font-bold">生成结果</span>
            {result && !loading && (
              <div style={{ display: 'flex', gap: '6px' }}>
                {onRetry && <button class="btn btn-ghost btn-sm" onClick={onRetry}>重新生成</button>}
                <button class="btn btn-ghost btn-sm" onClick={copy}>{copied ? '✓' : '复制'}</button>
              </div>
            )}
          </div>
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '13px', padding: '8px 0' }}>
              <span class="loading-dot" style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--blue)', display: 'inline-block' }}></span>
              AI 生成中，请稍候…
            </div>
          )}
          {error && !loading && (
            <div style={{ color: '#B83A3A', fontSize: '13px', lineHeight: 1.6, padding: '8px 10px', background: 'rgba(184,58,58,0.06)', borderRadius: 'var(--radius-sm)' }}>
              ⚠ {error}
            </div>
          )}
          {result && !loading && !error && (
            <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8, fontSize: '14px', color: 'var(--text)' }}>
              {result}
            </div>
          )}
          {!result && !loading && !error && placeholder && (
            <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>{placeholder}</div>
          )}
        </div>
      )}
    </div>
  );
}

/** 一键生成 Hook：封装 loading/error/result + abort */
export function useGenerate() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const abortRef = useRef<AbortController | null>(null);

  const generate = useCallback(async (fn: (signal: AbortSignal) => Promise<string>) => {
    abortRef.current?.abort();
    const ctrl = new AbortController();
    abortRef.current = ctrl;
    setLoading(true);
    setError('');
    setResult('');
    try {
      const text = await fn(ctrl.signal);
      setResult(text);
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError') return;
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const stop = useCallback(() => { abortRef.current?.abort(); setLoading(false); }, []);

  useEffect(() => () => abortRef.current?.abort(), []);

  return { result, loading, error, generate, stop, setResult, setError };
}
