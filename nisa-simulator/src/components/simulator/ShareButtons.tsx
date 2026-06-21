import { useRef, useState } from 'react';
import { toPng } from 'html-to-image';
import { Download, Link2, Share2 } from 'lucide-react';
import { ResultShareCard } from './ResultShareCard';
import type { ShareCardData } from './ResultShareCard';
import { ensureFontsReady, getEmbeddedFontCss } from '../../lib/fontEmbed';
import { useToast } from '../Toast';

function triggerDownload(dataUrl: string, filename: string) {
  const a = document.createElement('a');
  a.href = dataUrl;
  a.download = filename;
  a.click();
}

export function ShareButtons({ data }: { data: ShareCardData }) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const handleSaveImage = async () => {
    if (!cardRef.current || busy) return;
    setBusy(true);
    try {
      await ensureFontsReady();
      const fontEmbedCSS = await getEmbeddedFontCss(cardRef.current);
      const dataUrl = await toPng(cardRef.current, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: '#FFFAF6',
        fontEmbedCSS,
      });
      triggerDownload(dataUrl, 'nisa-simulation.png');
      toast('画像を保存しました');
    } catch {
      toast('画像の保存に失敗しました。リンクのコピーをお試しください');
    } finally {
      setBusy(false);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(data.shareUrl);
      toast('リンクをコピーしました');
    } catch {
      // セキュアコンテキスト外などのフォールバック
      window.prompt('このリンクをコピーしてください', data.shareUrl);
    }
  };

  const handleShareX = () => {
    const text = '【NISAつみたてシミュレーション】未来のつみたて、いくらになる？';
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
      text,
    )}&url=${encodeURIComponent(data.shareUrl)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        type="button"
        onClick={handleSaveImage}
        disabled={busy}
        className="flex flex-1 items-center justify-center gap-2 rounded-full border border-line bg-white px-4 py-3 text-sm font-bold text-ink transition-colors hover:border-coral-300 hover:bg-surface-soft disabled:opacity-60"
      >
        <Download size={17} aria-hidden />
        {busy ? '作成中…' : '画像を保存'}
      </button>
      <button
        type="button"
        onClick={handleCopyLink}
        className="flex flex-1 items-center justify-center gap-2 rounded-full border border-line bg-white px-4 py-3 text-sm font-bold text-ink transition-colors hover:border-coral-300 hover:bg-surface-soft"
      >
        <Link2 size={17} aria-hidden />
        リンクをコピー
      </button>
      <button
        type="button"
        onClick={handleShareX}
        className="flex items-center justify-center gap-2 rounded-full border border-line bg-white px-4 py-3 text-sm font-bold text-ink transition-colors hover:border-coral-300 hover:bg-surface-soft"
        aria-label="Xで共有"
      >
        <Share2 size={17} aria-hidden />
        <span className="hidden sm:inline">Xで共有</span>
      </button>

      {/* 画像化専用ノード（画面外に固定配置） */}
      <div
        aria-hidden
        style={{ position: 'fixed', left: -99999, top: 0, pointerEvents: 'none' }}
      >
        <ResultShareCard ref={cardRef} data={data} />
      </div>
    </div>
  );
}
