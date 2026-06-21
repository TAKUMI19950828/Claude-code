import { CalendarDays, Hourglass, PiggyBank, Wallet } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { Pattern } from '../../types';

const TABS: { pattern: Pattern; label: string; sub: string; Icon: LucideIcon }[] = [
  { pattern: 1, label: '将来いくら？', sub: '資産額を予想', Icon: Wallet },
  { pattern: 2, label: '毎月いくら？', sub: '必要な積立額', Icon: CalendarDays },
  { pattern: 3, label: '何年かかる？', sub: '目標までの期間', Icon: Hourglass },
  { pattern: 4, label: '最初にいくら？', sub: '必要な初期額', Icon: PiggyBank },
];

interface PatternTabsProps {
  pattern: Pattern;
  onChange: (p: Pattern) => void;
}

export function PatternTabs({ pattern, onChange }: PatternTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="シミュレーションの種類"
      className="grid grid-cols-2 gap-2 sm:grid-cols-4"
    >
      {TABS.map(({ pattern: p, label, sub, Icon }) => {
        const active = p === pattern;
        return (
          <button
            key={p}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(p)}
            className={`flex flex-col items-center gap-1 rounded-control border px-2 py-3 text-center transition-all ${
              active
                ? 'border-primary bg-primary text-white shadow-cta'
                : 'border-line bg-white text-ink hover:border-coral-300 hover:bg-surface-soft'
            }`}
          >
            <Icon size={20} aria-hidden className={active ? 'text-white' : 'text-primary'} />
            <span className="text-sm font-extrabold leading-tight underline-offset-4 [text-decoration:inherit]">
              {label}
            </span>
            <span className={`text-[11px] font-bold ${active ? 'text-white/85' : 'text-ink-soft'}`}>
              {sub}
            </span>
          </button>
        );
      })}
    </div>
  );
}
