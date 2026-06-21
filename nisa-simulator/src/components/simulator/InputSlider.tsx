import { useState } from 'react';
import type { ReactNode } from 'react';
import { manYen, percent, yen } from '../../lib/format';

export type FieldKind = 'yen' | 'year' | 'percent';

interface InputSliderProps {
  label: string;
  icon?: ReactNode;
  kind: FieldKind;
  value: number;
  min: number;
  max: number;
  step: number;
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

export function InputSlider({ label, icon, kind, value, min, max, step, onChange }: InputSliderProps) {
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
  // スライダーのトラックを「左:coral / 右:line」に塗り分け
  const pct = ((clamped - min) / (max - min)) * 100;

  return (
    <div className="rounded-control bg-surface-soft p-3.5 sm:p-4">
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-1.5 text-sm font-bold text-ink">
          {icon}
          {label}
        </span>
        <div className="flex items-center gap-1 rounded-xl border border-line bg-white px-2 py-1">
          <input
            type="number"
            inputMode="numeric"
            aria-label={`${label}（数値入力）`}
            className="w-24 bg-transparent text-right text-base font-bold tabular-nums text-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
            value={kind === 'percent' ? value : Math.round(value)}
            min={min}
            max={max}
            step={step}
            onChange={handleNumber}
            onBlur={handleBlur}
          />
          <span className="text-xs font-bold text-ink-soft">
            {kind === 'yen' ? '円' : kind === 'year' ? '年' : '%'}
          </span>
        </div>
      </div>

      <div className="mt-1 text-right text-xs font-bold text-ink-soft">
        {kind === 'yen' ? `${yen(value)}（${manYen(value)}）` : kind === 'year' ? `${value}年` : `年率 ${percent(value)}`}
      </div>

      <input
        type="range"
        aria-label={label}
        aria-valuetext={ariaText(kind, value)}
        className="nisa-range mt-2 w-full"
        style={{
          background: `linear-gradient(to right, #FF8A66 0%, #FF6B3D ${pct}%, #F1E4D8 ${pct}%, #F1E4D8 100%)`,
        }}
        min={min}
        max={max}
        step={step}
        value={clamped}
        onChange={(e) => onChange(Number(e.target.value))}
      />

      {hint && (
        <p aria-live="polite" className="mt-1.5 text-xs font-bold text-caution-text">
          {hint}
        </p>
      )}
    </div>
  );
}
