import { forwardRef } from 'react';
import { manYen, yen } from '../../lib/format';

export interface ShareCardData {
  headlineLabel: string;
  headlineValue: string;
  headlineManYen: string | null;
  principal: number;
  gain: number;
  taxSaved: number;
  shareUrl: string;
}

/**
 * 画像化（PNG）専用の固定サイズノード（1080×1080）。
 * 主要な数字はすべてHTML要素（SVGテキスト非依存）。画面表示とは分離してオフスクリーンに置く。
 */
export const ResultShareCard = forwardRef<HTMLDivElement, { data: ShareCardData }>(
  function ResultShareCard({ data }, ref) {
    const positiveGain = Math.max(data.gain, 0);
    const total = data.principal + positiveGain;
    const principalPct = total > 0 ? (data.principal / total) * 100 : 100;

    return (
      <div
        ref={ref}
        style={{ width: 1080, height: 1080 }}
        className="flex flex-col bg-gradient-to-br from-coral-500 to-amber-400 p-14 font-rounded"
      >
        <div className="flex flex-1 flex-col rounded-[48px] bg-white p-16 shadow-xl">
          {/* ヘッダー */}
          <div className="flex items-center gap-3">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-coral-500/15 text-3xl">
              🌱
            </span>
            <span className="text-2xl font-extrabold text-ink">
              つみたて<span className="text-primary">みらい</span>シミュレーター
            </span>
          </div>

          {/* ヘッドライン */}
          <div className="mt-12">
            <p className="text-3xl font-bold text-ink-soft">{data.headlineLabel}</p>
            <p className="mt-3 text-[110px] font-extrabold leading-none tabular-nums text-ink">
              {data.headlineValue}
            </p>
            {data.headlineManYen && (
              <p className="mt-3 text-4xl font-bold text-ink-soft">{data.headlineManYen}</p>
            )}
          </div>

          {/* 内訳バー */}
          <div className="mt-12">
            <div className="flex h-8 w-full overflow-hidden rounded-full bg-line">
              <div className="h-full bg-sand" style={{ width: `${principalPct}%` }} />
              <div className="h-full bg-gain" style={{ width: `${100 - principalPct}%` }} />
            </div>
            <div className="mt-4 flex justify-between text-2xl font-bold">
              <span className="text-ink">
                投資元本 <span className="text-ink-soft">{yen(data.principal)}</span>
              </span>
              <span className="text-ink">
                運用益 <span className="text-gain-text">+{yen(positiveGain)}</span>
              </span>
            </div>
          </div>

          {/* NISA比較 */}
          <div className="mt-10 rounded-[32px] bg-gradient-to-br from-coral-500 to-primary px-10 py-8 text-white">
            <p className="text-2xl font-bold text-white/90">NISA（非課税）を使うと…</p>
            <p className="mt-2 text-5xl font-extrabold">
              課税口座より +{yen(data.taxSaved)} 多く残せる！
            </p>
          </div>

          {/* フッター（出所＋短縮免責） */}
          <div className="mt-auto flex items-end justify-between pt-10">
            <p className="text-xl text-ink-soft">
              将来の成果を保証するものではありません／簡易計算による概算
              <br />
              投資勧誘を目的としたものではありません
            </p>
          </div>
        </div>
      </div>
    );
  },
);

/** 共有カードの「主要な数字」を ComputedResult から作る補助。 */
export function buildShareHeadline(
  finalValue: number,
): Pick<ShareCardData, 'headlineLabel' | 'headlineValue' | 'headlineManYen'> {
  return {
    headlineLabel: '将来の資産額（NISA・非課税）',
    headlineValue: yen(finalValue),
    headlineManYen: manYen(finalValue),
  };
}
