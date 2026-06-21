import { useState } from 'react';
import { Info } from 'lucide-react';
import type { CompareResult } from '../../types';
import { manYen, yen } from '../../lib/format';

export function NisaComparisonCard({ compare }: { compare: CompareResult }) {
  const [showNote, setShowNote] = useState(false);

  return (
    <div className="rounded-card bg-gradient-to-br from-coral-500 to-primary p-5 text-white shadow-card">
      <p className="text-sm font-bold text-white/90">NISA（非課税）を使うと…</p>
      <p className="mt-1 font-rounded text-2xl font-extrabold leading-tight sm:text-3xl">
        課税口座より{' '}
        <span className="tabular-nums [text-shadow:0_1px_2px_rgba(0,0,0,.18)]">
          +{manYen(compare.taxSaved)}
        </span>
        <br className="sm:hidden" /> 多く残せる！
      </p>
      <p className="mt-1 text-xs font-bold text-white/70 tabular-nums">（{yen(compare.taxSaved)}）</p>

      <div className="mt-4 grid grid-cols-2 gap-2">
        <div className="rounded-control bg-white/15 px-3 py-2.5 backdrop-blur-sm">
          <p className="text-xs font-bold text-white/80">NISA（非課税）</p>
          <p className="mt-0.5 text-lg font-extrabold tabular-nums">{manYen(compare.nisaFinal)}</p>
          <p className="text-[11px] font-bold tabular-nums text-white/70">{yen(compare.nisaFinal)}</p>
        </div>
        <div className="rounded-control bg-black/10 px-3 py-2.5">
          <p className="text-xs font-bold text-white/80">課税口座</p>
          <p className="mt-0.5 text-lg font-extrabold tabular-nums text-white/90">
            {manYen(compare.taxableFinal)}
          </p>
          <p className="text-[11px] font-bold tabular-nums text-white/60">{yen(compare.taxableFinal)}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setShowNote((s) => !s)}
        aria-expanded={showNote}
        className="mt-3 flex items-center gap-1 text-xs font-bold text-white/85 underline-offset-2 hover:underline"
      >
        <Info size={13} aria-hidden />
        簡易計算について
      </button>
      {showNote && (
        <p className="mt-2 rounded-xl bg-white/15 px-3 py-2 text-xs leading-relaxed text-white">
          運用益に対して一律20.315%が課税される前提（最終時点で含み益にまとめて課税・手数料は無視）の
          簡易計算です。実際の税制とは異なります。
        </p>
      )}
    </div>
  );
}
