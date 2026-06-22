import { lazy, Suspense } from 'react';
import { Link as LinkIcon } from 'lucide-react';
import type { ComputedResult, Pattern } from '../../types';
import { manYen, yearsMonths, yen } from '../../lib/format';
import { useCountUp } from '../../hooks/useCountUp';
import { BreakdownBar } from './BreakdownBar';
import { NisaComparisonCard } from './NisaComparisonCard';
import { LimitBanner } from './LimitBanner';
import { EdgeStateCard } from './EdgeStateCard';
import { ShareButtons } from './ShareButtons';
import { buildShareHeadline } from './ResultShareCard';

// Recharts は重いので遅延ロード（初期JSを軽くする）。高さ予約済みでCLSなし。
const GrowthChart = lazy(() => import('./GrowthChart').then((m) => ({ default: m.GrowthChart })));

interface ResultPanelProps {
  pattern: Pattern;
  result: ComputedResult;
  shareUrl: string;
  shared: boolean;
  animateKey: number;
}

const OK_LABEL: Record<Pattern, string> = {
  1: '将来の資産額（NISA・非課税）',
  2: '目標達成に必要な毎月の積立額',
  3: '目標達成までの期間',
  4: '目標達成に必要な初期投資額',
};

export function ResultPanel({ pattern, result, shareUrl, shared, animateKey }: ResultPanelProps) {
  const { answer, detail } = result;

  // 数字のカウントアップ対象（円の答え or 将来資産）。hooksは無条件で呼ぶ。
  const numericTarget =
    answer.kind === 'ok' && (pattern === 1 || pattern === 2 || pattern === 4)
      ? answer.value
      : (detail?.finalValue ?? 0);
  const animated = useCountUp(numericTarget, animateKey);

  return (
    <div key={animateKey} className="animate-fade-up space-y-4">
      {shared && (
        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-300/50 px-3 py-1 text-xs font-bold text-ink">
          <LinkIcon size={13} aria-hidden />
          シェアされた結果を表示しています
        </div>
      )}

      {/* 答え（ヘッドライン） */}
      <div className="rounded-card bg-white p-5 shadow-card sm:p-6">
        {answer.kind === 'unreachable' ? (
          <EdgeStateCard variant="unreachable" title="今の条件では届きにくいかも" message={answer.reason} />
        ) : answer.kind === 'already' ? (
          <EdgeStateCard
            variant="already"
            title={pattern === 2 ? '初期投資だけで達成できそう！' : '積立だけで達成できそう！'}
            message={
              pattern === 2
                ? '毎月の積立をしなくても、目標金額に届く見込みです。'
                : '初期投資がなくても、毎月の積立だけで目標に届く見込みです。'
            }
          />
        ) : (
          <div aria-live="polite">
            <p className="text-base font-bold text-ink-soft sm:text-lg">{OK_LABEL[pattern]}</p>
            {pattern === 3 ? (
              <p className="mt-1 font-rounded text-[clamp(2.2rem,9vw,3.75rem)] font-extrabold leading-none text-ink">
                {yearsMonths(answer.value)}
              </p>
            ) : (
              <>
                <p className="mt-1 font-rounded text-[clamp(2.4rem,10vw,4.25rem)] font-extrabold leading-none tabular-nums text-ink">
                  {manYen(animated)}
                  {pattern === 2 && <span className="ml-1 text-2xl text-ink-soft">/月</span>}
                </p>
                <p className="mt-2 text-base font-bold text-ink-soft">{yen(numericTarget)}</p>
              </>
            )}
          </div>
        )}
      </div>

      {/* 詳細（detail があるとき＝ok / already） */}
      {detail && (
        <>
          <div className="rounded-card bg-white p-5 shadow-card sm:p-6">
            <h3 className="text-lg font-extrabold text-ink">
              {detail.years > 0 ? `${Math.round(detail.years)}年後の内訳` : '内訳'}
            </h3>
            <div className="mt-3">
              <BreakdownBar principal={detail.principal} gain={detail.gain} />
            </div>
            <h3 className="mt-6 text-lg font-extrabold text-ink">資産の育ち方（NISA と 課税口座）</h3>
            <p className="mt-1 text-sm text-ink-soft">
              暖色の線が NISA（非課税）、破線が課税口座、点線が投資元本。NISAと課税口座の差が
              「非課税で得られるメリット」です。
            </p>
            <div className="mt-2">
              <Suspense
                fallback={<div className="h-[260px] w-full animate-pulse rounded-control bg-surface-soft" />}
              >
                <GrowthChart data={detail.series} />
              </Suspense>
            </div>
          </div>

          <NisaComparisonCard compare={detail.compare} />
          <LimitBanner limits={detail.limits} />

          <ShareButtons
            data={{
              ...buildShareHeadline(detail.finalValue),
              principal: detail.principal,
              gain: detail.gain,
              taxSaved: detail.compare.taxSaved,
              shareUrl,
            }}
          />
        </>
      )}
    </div>
  );
}
