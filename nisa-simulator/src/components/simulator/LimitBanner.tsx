import { AlertTriangle } from 'lucide-react';
import type { LimitResult } from '../../types';

export function LimitBanner({ limits }: { limits: LimitResult }) {
  if (!limits.monthlyOver && !limits.lifetimeOver) return null;

  return (
    <div className="animate-fade-up flex gap-3 rounded-card border border-caution-border bg-caution-bg px-4 py-3.5">
      <AlertTriangle size={20} className="mt-0.5 shrink-0 text-caution-border" aria-hidden />
      <div>
        <p className="text-sm font-extrabold text-caution-text">NISAの枠を超えているかも</p>
        <ul className="mt-1 space-y-1">
          {limits.messages.map((msg) => (
            <li key={msg} className="text-[13px] leading-relaxed text-caution-text">
              {msg}
            </li>
          ))}
        </ul>
        <p className="mt-1.5 text-xs text-caution-text/80">
          ※ 枠を超える分はNISAの非課税対象外です。金額を調整するか、制度をご確認ください。
        </p>
      </div>
    </div>
  );
}
