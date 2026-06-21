import { signedYen, yen } from '../../lib/format';

interface BreakdownBarProps {
  principal: number;
  gain: number;
}

export function BreakdownBar({ principal, gain }: BreakdownBarProps) {
  const positiveGain = Math.max(gain, 0);
  const total = principal + positiveGain;
  const principalPct = total > 0 ? (principal / total) * 100 : 100;
  const gainPct = 100 - principalPct;

  return (
    <div>
      <div className="flex h-5 w-full overflow-hidden rounded-full bg-line" role="img" aria-label={`内訳：投資元本 ${yen(principal)}、運用益 ${signedYen(gain)}`}>
        <div className="h-full bg-sand" style={{ width: `${principalPct}%` }} />
        <div className="h-full bg-gain" style={{ width: `${gainPct}%` }} />
      </div>
      <div className="mt-2 flex flex-wrap justify-between gap-x-6 gap-y-1 text-sm">
        <span className="flex items-center gap-1.5 font-bold text-ink">
          <span className="h-2.5 w-2.5 rounded-full bg-sand" aria-hidden />
          投資元本
          <span className="tabular-nums text-ink-soft">{yen(principal)}</span>
        </span>
        <span className="flex items-center gap-1.5 font-bold text-ink">
          <span className="h-2.5 w-2.5 rounded-full bg-gain" aria-hidden />
          運用益
          <span className="tabular-nums text-gain-text">{signedYen(gain)}</span>
        </span>
      </div>
    </div>
  );
}
