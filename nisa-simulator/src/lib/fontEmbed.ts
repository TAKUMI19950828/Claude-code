import { getFontEmbedCSS } from 'html-to-image';

// 画像化（toPng）でWebフォントを確実に埋め込むためのCSSを一度だけ生成・キャッシュ。
let cached: string | null = null;

export async function getEmbeddedFontCss(node: HTMLElement): Promise<string> {
  if (cached != null) return cached;
  try {
    cached = await getFontEmbedCSS(node);
  } catch {
    cached = '';
  }
  return cached;
}

/** 画像化前にフォントのロード完了を待つ（初回キャプチャのフォント欠け対策）。 */
export async function ensureFontsReady(): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) return;
  try {
    await document.fonts.ready;
    await document.fonts.load('800 48px "M PLUS Rounded 1c"');
    await document.fonts.load('700 16px "M PLUS Rounded 1c"');
  } catch {
    /* フォントAPI非対応でも続行 */
  }
}
