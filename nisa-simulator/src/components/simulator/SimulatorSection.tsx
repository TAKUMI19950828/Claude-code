import { PatternTabs } from './PatternTabs';
import { InputsPanel } from './InputsPanel';
import { ResultPanel } from './ResultPanel';
import { useSimulator } from '../../hooks/useSimulator';
import { buildShareUrl } from '../../lib/params';
import { manYen, yearsMonths, yen } from '../../lib/format';
import type { ComputedResult, Pattern } from '../../types';

function summary(pattern: Pattern, result: ComputedResult): { label: string; value: string } {
  const { answer } = result;
  if (answer.kind === 'unreachable') return { label: '結果', value: '届きにくいかも' };
  if (answer.kind === 'already')
    return { label: '結果', value: pattern === 2 ? '初期投資だけでOK' : '積立だけでOK' };
  switch (pattern) {
    case 1:
      return { label: '将来の資産額', value: `${yen(answer.value)}（${manYen(answer.value)}）` };
    case 2:
      return { label: '毎月の積立額', value: `${yen(answer.value)}／月` };
    case 3:
      return { label: '達成までの期間', value: yearsMonths(answer.value) };
    case 4:
      return { label: '必要な初期投資額', value: `${yen(answer.value)}（${manYen(answer.value)}）` };
  }
}

export function SimulatorSection() {
  const { state, dispatch, currentInputs, result } = useSimulator();
  const shareUrl = buildShareUrl(state.pattern, state.inputs);
  const sum = summary(state.pattern, result);
  const values = currentInputs as unknown as Record<string, number>;

  return (
    <section id="simulator" className="mx-auto max-w-sim scroll-mt-16 px-4 py-8 sm:px-6">
      <div className="text-center">
        <h2 className="font-rounded text-2xl font-extrabold text-ink sm:text-3xl">
          つみたてシミュレーション
        </h2>
        <p className="mt-2 text-sm text-ink-soft">
          知りたいことのタブを選んで、数字を動かすだけ。結果はその場ですぐ反映されます。
        </p>
      </div>

      <div className="mt-6">
        <PatternTabs pattern={state.pattern} onChange={(p) => dispatch({ type: 'setPattern', pattern: p })} />
      </div>

      {/* 入力中も常に見えるライブ結果サマリ（全画面幅） */}
      <div className="sticky top-14 z-30 mt-4">
        <div className="flex items-center justify-between gap-3 rounded-full border border-line bg-white/90 px-4 py-2.5 shadow-card backdrop-blur">
          <span className="text-xs font-bold text-ink-soft">{sum.label}</span>
          <span className="truncate font-rounded text-base font-extrabold tabular-nums text-primary">
            {sum.value}
          </span>
        </div>
      </div>

      {/* 入力 → 結果 の順で縦積み（各カードは横幅いっぱい） */}
      <div className="mt-4 space-y-6">
        <InputsPanel
          pattern={state.pattern}
          values={values}
          onField={(field, value) => dispatch({ type: 'setField', field, value })}
          onPreset={(rPercent) => dispatch({ type: 'applyPreset', rPercent })}
        />
        <ResultPanel pattern={state.pattern} result={result} shareUrl={shareUrl} shared={state.shared} />
      </div>
    </section>
  );
}
