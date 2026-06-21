// @vitest-environment jsdom
import { beforeAll, describe, expect, it } from 'vitest';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';

// jsdom には matchMedia が無いので最小ポリフィル（usePrefersReducedMotion 用）
beforeAll(() => {
  if (!window.matchMedia) {
    window.matchMedia = ((query: string) =>
      ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false,
      }) as unknown as MediaQueryList);
  }
});

describe('App スモークテスト（実マウント相当・SSR）', () => {
  it('既定状態で主要セクションを例外なく描画する', () => {
    const html = renderToString(createElement(App));
    expect(html).toContain('つみたてシミュレーション');
    expect(html).toContain('NISAって、なに？');
    expect(html).toContain('免責事項');
    // 既定値で結果（将来の資産額）が出ている
    expect(html).toContain('将来の資産額');
  });

  it('共有パラメータ付きURLでもクラッシュせず描画する', () => {
    window.history.replaceState({}, '', '/?p=3&G=10000000&P=1000000&C=30000&r=5');
    const html = renderToString(createElement(App));
    expect(html).toContain('シェアされた結果');
    expect(html).toContain('達成までの期間');
  });

  it('到達不可能な共有URLでもエラー表示で耐える', () => {
    window.history.replaceState({}, '', '/?p=3&G=100000000&P=0&C=1000&r=0.1');
    const html = renderToString(createElement(App));
    expect(html).toContain('届きにくいかも');
  });
});
