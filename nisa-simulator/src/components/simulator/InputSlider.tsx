import { useState } from 'react';
import type { ReactNode } from 'react';
import { manYen, percent, yen } from '../../lib/format';

export type FieldKind = 'yen' | 'year' | 'percent';

export interface Tick {
  value: number;
  label: string;
}

interface InputSliderProps {
  label: string;
  icon?: ReactNode;
  kind: FieldKind;
  value: number;
  min: number;
  max: number;
  step: number;
  ticks?: Tick[];
  onChange: (value: number) => void;
}

function fmtBound(kind: FieldKind, v: number): string {
  if (kind === 'yen') return yen(v);
  if (kind === 'year') return `${v}年`;
  return percent(v);
}

function ariaText(kind: FieldKind, v: number): string {
  if (kind === 'yen') return `${manYen(v)}`;
  if (kind === 'year') return `${v}年`;
  return `年率${percent(v)}`;
}

export function InputSlider({
  label,
  icon,
  kind,
  value,
  min,
  max,
  step,
  ticks,
  onChange,
}: InputSliderProps) {
  const [hint, setHint] = useState('');
  const showHint = (msg: string) => {
    setHint(msg);
    window.setTimeout(() => setHint(''), 2800);
  };

  const handleNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const n = Number(e.target.value);
    if (!Number.isFinite(n)) return;
    if (n > max) {
      onChange(max);
      showHint(`上限の ${fmtBound(kind, max)} に合わせました`);
    } else {
      onChange(n);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const n = Number(e.target.value);
    if (!Number.isFinite(n) || n < min) {
      onChange(min);
      showHint(`下限の ${fmtBound(kind, min)} に合わせました`);
    }
  };

  const clamped = Math.min(max, Math.max(min, value));
  const pct = ((clamped - min) / (max - min)) * 100;

  return (
    <div className="rounded-control bg-surface-soft p-4">
      {/* ラベル（大きめ） */}
      <div className="flex items-center gap-1.5 text-base font-extrabold text-ink">
        {icon}
        {label}
      </div>

      {/* 数値入力（左・大きめ）＋ スライダー（右）＋ 目盛り */}
      <div className="mt-3 flex items-start gap-3">
        <div className="w-[8.75rem] shrink-0">
          <div className="flex items-baseline gap-1 rounded-xl border border-line bg-white px-3 py-2 focus-within:border-primary">
            <input
              type="number"
              inputMode="numeric"
              aria-label={`${label}（数値入力）`}
              className="w-full bg-transparent text-right text-lg font-extrabold tabular-nums text-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              value={kind === 'percent' ? value : Math.round(value)}
              min={min}
              max={max}
              step={step}
              onChange={handleNumber}
              onBlur={handleBlur}
            />
            <span className="text-sm font-bold text-ink-soft">
              {kind === 'yen' ? '円' : kind === 'year' ? '年' : '%'}
            </span>
          </div>
          {kind === 'yen' && (
            <p className="mt-1 text-right text-xs font-bold text-ink-soft">{manYen(value)}</p>
          )}
        </div>

        <div className="flex-1 pt-2.5">
          <input
            type="range"
            aria-label={label}
            aria-valuetext={ariaText(kind, value)}
            className="nisa-range w-full"
            style={{
              background: `linear-gradient(to right, #FF8A66 0%, #FF6B3D ${pct}%, #F1E4D8 ${pct}%, #F1E4D8 100%)`,
            }}
            min={min}
            max={max}
            step={step}
            value={clamped}
            onChange={(e) => onChange(Number(e.target.value))}
          />

          {ticks && ticks.length > 0 && (
            <div className="relative mt-1.5 h-5 w-full">
              {ticks.map((t) => {
                const p = ((t.value - min) / (max - min)) * 100;
                const shift = p <= 1 ? '0' : p >= 99 ? '-100%' : '-50%';
                return (
                  <span
                    key={t.value}
                    className="absolute top-0 flex flex-col items-center"
                    style={{ left: `${p}%`, transform: `translateX(${shift})` }}
                  >
                    <span className="h-1.5 w-px bg-line" aria-hidden />
                    <span className="mt-0.5 whitespace-nowrap text-[10px] font-bold text-ink-soft">
                      {t.label}
                    </span>
                  </span>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {hint && (
        <p aria-live="polite" className="mt-2 text-xs font-bold text-caution-text">
          {hint}
        </p>
      )}
    </div>
  );
}
