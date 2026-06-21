import { Calculator, Sparkles } from 'lucide-react';
import { PatternTabs } from './PatternTabs';
import { InputsPanel } from './InputsPanel';
import { ResultPanel } from './ResultPanel';
import { useSimulator } from '../../hooks/useSimulator';
import { buildShareUrl } from '../../lib/params';

export function SimulatorSection() {
  const { state, dispatch, currentInputs, result, calcId, showResult, stale } = useSimulator();
  const shareUrl = buildShareUrl(state.pattern, state.inputs);
  const values = currentInputs as unknown as Record<string, number>;

  return (
    <section id="simulator" className="mx-auto max-w-sim scroll-mt-16 px-4 py-8 sm:px-6">
      <div className="text-center">
        <h2 className="font-rounded text-2xl font-extrabold text-ink sm:text-3xl">
          つみたてシミュレーション
        </h2>
        <p className="mt-2 text-sm text-ink-soft">
          知りたいことのタブを選んで、条件を入力したら「計算する」を押してね。
        </p>
      </div>

      <div className="mt-6">
        <PatternTabs pattern={state.pattern} onChange={(p) => dispatch({ type: 'setPattern', pattern: p })} />
      </div>

      {/* 入力 → 計算する → 結果 の順で縦積み（各カードは横幅いっぱい） */}
      <div className="mt-4 space-y-6">
        <InputsPanel
          pattern={state.pattern}
          values={values}
          onField={(field, value) => dispatch({ type: 'setField', field, value })}
          onPreset={(rPercent) => dispatch({ type: 'applyPreset', rPercent })}
        />

        {/* 計算するボタン */}
        <div>
          <button
            type="button"
            onClick={() => dispatch({ type: 'calculate' })}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-primary px-6 py-4 text-lg font-extrabold text-white shadow-cta transition-transform hover:bg-primary-hover active:translate-y-1 active:shadow-ctaactive"
          >
            <Calculator size={22} aria-hidden />
            {showResult ? 'もう一度計算する' : '計算する'}
          </button>
          {showResult && stale && (
            <p aria-live="polite" className="mt-2 text-center text-sm font-bold text-caution-text">
              条件が変わりました。もう一度「計算する」を押してね。
            </p>
          )}
        </div>

        {/* 結果（計算後のみ表示） */}
        {showResult && result ? (
          <ResultPanel
            pattern={state.pattern}
            result={result}
            shareUrl={shareUrl}
            shared={state.shared}
            animateKey={calcId}
          />
        ) : (
          <div className="rounded-card border border-dashed border-line bg-white/60 px-6 py-12 text-center">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-coral-500/15 text-primary">
              <Sparkles size={26} aria-hidden />
            </span>
            <p className="mt-3 font-rounded text-lg font-extrabold text-ink">
              条件を入力して「計算する」を押してね
            </p>
            <p className="mt-1 text-sm text-ink-soft">
              将来の資産額やグラフが、ここに表示されます。
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
