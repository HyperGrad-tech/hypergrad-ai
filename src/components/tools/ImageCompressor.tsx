import { useState, useCallback, useRef } from 'react';

type Format = 'keep' | 'image/jpeg' | 'image/webp' | 'image/png';

interface Result {
  id: string;
  name: string;
  origSize: number;
  newSize: number;
  url: string;
  width: number;
  height: number;
  type: string;
}

function fmtSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

function getOutputType(file: File, format: Format): string {
  if (format !== 'keep') return format;
  // 保持原格式，但 gif/bmp 等无 Canvas 编码器的退回 jpeg
  if (file.type === 'image/png') return 'image/png';
  if (file.type === 'image/webp') return 'image/webp';
  return 'image/jpeg';
}

async function compressOne(file: File, quality: number, maxDim: number, format: Format): Promise<Result> {
  const dataUrl = await new Promise<string>((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result as string);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
  const img = await new Promise<HTMLImageElement>((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = dataUrl;
  });

  let { naturalWidth: w, naturalHeight: h } = img;
  if (maxDim > 0 && (w > maxDim || h > maxDim)) {
    const ratio = Math.min(maxDim / w, maxDim / h);
    w = Math.round(w * ratio);
    h = Math.round(h * ratio);
  }

  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;
  // jpeg 无透明通道，填充白底
  const outType = getOutputType(file, format);
  if (outType === 'image/jpeg') {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, w, h);
  }
  ctx.drawImage(img, 0, 0, w, h);

  const blob: Blob = await new Promise((res) => {
    // PNG 无质量参数，强制 1
    const q = outType === 'image/png' ? undefined : Math.max(0.01, Math.min(1, quality / 100));
    canvas.toBlob(b => res(b!), outType, q);
  });

  const url = URL.createObjectURL(blob);
  return {
    id: file.name + Date.now() + Math.random(),
    name: file.name,
    origSize: file.size,
    newSize: blob.size,
    url,
    width: w,
    height: h,
    type: outType,
  };
}

export default function ImageCompressor() {
  const [quality, setQuality] = useState(80);
  const [maxDim, setMaxDim] = useState(1920);
  const [unlimited, setUnlimited] = useState(false);
  const [format, setFormat] = useState<Format>('keep');
  const [results, setResults] = useState<Result[]>([]);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    try {
      const arr = Array.from(files).filter(f => f.type.startsWith('image/'));
      const out: Result[] = [];
      for (const f of arr) {
        try {
          out.push(await compressOne(f, quality, unlimited ? 0 : maxDim, format));
        } catch (e) {
          // 跳过无法处理的图片
        }
      }
      setResults(prev => [...out, ...prev]);
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }, [quality, maxDim, unlimited, format]);

  const download = (r: Result) => {
    const a = document.createElement('a');
    a.href = r.url;
    const ext = r.type.split('/')[1];
    const base = r.name.replace(/\.[^.]+$/, '');
    a.download = `${base}_compressed.${ext}`;
    a.click();
  };

  const downloadAll = () => results.forEach((r, i) => setTimeout(() => download(r), i * 200));

  const clearAll = () => {
    results.forEach(r => URL.revokeObjectURL(r.url));
    setResults([]);
  };

  const totalOrig = results.reduce((s, r) => s + r.origSize, 0);
  const totalNew = results.reduce((s, r) => s + r.newSize, 0);
  const savings = totalOrig > 0 ? Math.round((1 - totalNew / totalOrig) * 100) : 0;

  return (
    <div>
      <div class="tool-card">
        <div class="text-sm font-bold" style={{ marginBottom: '4px' }}>🖼 图片压缩</div>
        <div class="text-xs text-muted" style={{ marginBottom: '10px', lineHeight: 1.6 }}>
          浏览器本地压缩，<strong>图片不离开你的设备</strong>，适合处理敏感截图、证件照、商业素材。支持 PNG / JPEG / WebP 批量处理。
        </div>

        {/* 上传区 */}
        <label
          style={{
            display: 'block', border: '2px dashed var(--border)', borderRadius: 'var(--radius)',
            padding: '28px', textAlign: 'center', cursor: 'pointer', background: 'var(--bg-soft)',
            transition: 'border-color 0.15s',
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            style={{ display: 'none' }}
            onChange={e => handleFiles(e.target.files)}
          />
          <div style={{ fontSize: '28px', marginBottom: '6px' }}>📁</div>
          <div class="text-sm font-bold">{busy ? '处理中…' : '点击选择图片（可多选）'}</div>
          <div class="text-xs text-muted" style={{ marginTop: '4px' }}>PNG / JPEG / WebP · 支持批量</div>
        </label>

        {/* 压缩设置 */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '14px' }}>
          <div>
            <label class="text-xs text-muted">输出格式</label>
            <select class="input mt-md" value={format} onChange={e => setFormat(e.target.value as Format)}>
              <option value="keep">保持原格式</option>
              <option value="image/jpeg">JPEG（有损，最小）</option>
              <option value="image/webp">WebP（推荐，现代网页）</option>
              <option value="image/png">PNG（无损）</option>
            </select>
          </div>
          <div>
            <label class="text-xs text-muted">最大尺寸（长边）</label>
            <div style={{ display: 'flex', gap: '6px', marginTop: '6px', alignItems: 'center' }}>
              <input
                class="input"
                type="number"
                min={0}
                value={maxDim}
                disabled={unlimited}
                onChange={e => setMaxDim(Math.max(0, Number(e.target.value) || 0))}
                style={{ flex: 1 }}
              />
              <label style={{ fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
                <input type="checkbox" checked={unlimited} onChange={e => setUnlimited(e.target.checked)} /> 不限制
              </label>
            </div>
          </div>
        </div>

        <div style={{ marginTop: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <label class="text-xs text-muted">质量（仅 JPEG / WebP）</label>
            <span class="text-xs" style={{ fontFamily: 'var(--font-mono)', color: 'var(--blue-dark)', fontWeight: 600 }}>{quality}</span>
          </div>
          <input
            type="range"
            min={10}
            max={100}
            value={quality}
            onChange={e => setQuality(Number(e.target.value))}
            style={{ width: '100%', marginTop: '6px', accentColor: 'var(--blue)' }}
          />
        </div>
      </div>

      {/* 结果列表 */}
      {results.length > 0 && (
        <div class="tool-card" style={{ marginTop: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px', marginBottom: '10px' }}>
            <div>
              <span class="text-sm font-bold">压缩结果</span>
              <span class="text-xs text-muted" style={{ marginLeft: '8px' }}>
                共 {results.length} 张 · {fmtSize(totalOrig)} → {fmtSize(totalNew)}
                {savings > 0 && <span style={{ color: '#16a34a', fontWeight: 600 }}> ↓{savings}%</span>}
                {savings < 0 && <span style={{ color: '#B83A3A' }}> ↑{-savings}%</span>}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button class="btn btn-ghost btn-sm" onClick={downloadAll}>全部下载</button>
              <button class="btn btn-ghost btn-sm" onClick={clearAll} style={{ color: '#B83A3A' }}>清空</button>
            </div>
          </div>

          {results.map(r => {
            const s = r.origSize > 0 ? Math.round((1 - r.newSize / r.origSize) * 100) : 0;
            return (
              <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <img src={r.url} alt={r.name} style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border)' }} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</div>
                  <div class="text-xs text-muted">
                    {r.width}×{r.height} · {fmtSize(r.origSize)} → <span style={{ color: s >= 0 ? '#16a34a' : '#B83A3A', fontWeight: 600 }}>{fmtSize(r.newSize)}</span>
                    {s !== 0 && (s > 0 ? ` · ↓${s}%` : ` · ↑${-s}%`)}
                  </div>
                </div>
                <button class="btn btn-ghost btn-sm" onClick={() => download(r)}>下载</button>
              </div>
            );
          })}
        </div>
      )}

      <div class="text-xs text-muted" style={{ marginTop: '10px', lineHeight: 1.6 }}>
        JPEG/WebP 调低质量会损失画质；PNG 为无损压缩，质量参数不生效。WebP 同质量比 JPEG 小 25-35%，是现代网页首选。
        若压缩后反而变大（如小尺寸 PNG 转 JPEG），属正常现象。
      </div>
    </div>
  );
}
