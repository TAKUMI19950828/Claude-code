import { useState } from 'react';
import type { ReactNode } from 'react';
import { Minus, Plus } from 'lucide-react';
import { manYen, percent } from '../../lib/format';

export type FieldKind = 'yen' | 'year' | 'percent';

export interface Tick {
  value: number; // 内部単位（円/年/%）
  label?: string; // 省略時はラベル無しの短いマーク（minor）
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
  footer?: ReactNode;
  onChange: (value: number) => void;
}

function fmtBound(kind: FieldKind, v: number): string {
  if (kind === 'yen') return manYen(v);
  if (kind === 'year') return `${v}年`;
  return percent(v);
}

function ariaText(kind: FieldKind, v: number): string {
  if (kind === 'yen') return manYen(v);
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
  footer,
  onChange,
}: InputSliderProps) {
  const [hint, setHint] = useState('');
  const showHint = (msg: string) => {
    setHint(msg);
    window.setTimeout(() => setHint(''), 2800);
  };

  // 金額（yen）は「万円」単位で表示・編集する（内部値は円のまま）。
  const factor = kind === 'yen' ? 10_000 : 1;
  const unit = kind === 'yen' ? '万円' : kind === 'year' ? '年' : '%';
  const displayVal =
    kind === 'yen'
      ? Math.round(value / 1000) / 10
      : kind === 'percent'
        ? Math.round(value * 10) / 10
        : Math.round(value);
  const displayMin = min / factor;
  const displayMax = max / factor;
  const displayStep = step / factor;

  const handleNumber = (e: React.ChangeEvent<HTMLInputElement>) => {
    const d = Number(e.target.value);
    if (!Number.isFinite(d)) return;
    const n = d * factor;
    if (n > max) {
      onChange(max);
      showHint(`上限の ${fmtBound(kind, max)} に合わせました`);
    } else {
      onChange(n);
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const d = Number(e.target.value);
    const n = d * factor;
    if (!Number.isFinite(n) || n < min) {
      onChange(min);
      showHint(`下限の ${fmtBound(kind, min)} に合わせました`);
    }
  };

  const dec = () => onChange(Math.max(min, value - step));
  const inc = () => onChange(Math.min(max, value + step));

  const clamped = Math.min(max, Math.max(min, value));
  const pct = ((clamped - min) / (max - min)) * 100;

  const btn =
    'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-white text-ink transition-colors hover:border-coral-300 hover:text-primary active:bg-surface-soft';

  return (
    <div className="rounded-control bg-surface-soft p-4">
      {/* ラベル */}
      <div className="flex items-center gap-1.5 text-base font-extrabold text-ink">
        {icon}
        {label}
      </div>

      <div className="mt-3 flex items-center gap-2">
        {/* 数値入力（万円表記・左） */}
        <div className="w-[6.5rem] shrink-0">
          <div className="flex items-baseline gap-1 rounded-xl border border-line bg-white px-2.5 py-2 focus-within:border-primary">
            <input
              type="number"
              inputMode="decimal"
              aria-label={`${label}（数値入力）`}
              className="w-full bg-transparent text-right text-lg font-extrabold tabular-nums text-ink outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
              value={displayVal}
              min={displayMin}
              max={displayMax}
              step={displayStep}
              onChange={handleNumber}
              onBlur={handleBlur}
            />
            <span className="whitespace-nowrap text-sm font-bold text-ink-soft">{unit}</span>
          </div>
        </div>

        {/* − ／ スライダー＋目盛り ／ ＋ */}
        <div className="flex flex-1 flex-col">
          <div className="flex items-center gap-1.5">
            <button type="button" className={btn} onClick={dec} aria-label={`${label}を1段階減らす`}>
              <Minus size={16} aria-hidden />
            </button>
            <input
              type="range"
              aria-label={label}
              aria-valuetext={ariaText(kind, value)}
              className="nisa-range flex-1"
              style={{
                background: `linear-gradient(to right, #FF8A66 0%, #FF6B3D ${pct}%, #F1E4D8 ${pct}%, #F1E4D8 100%)`,
              }}
              min={min}
              max={max}
              step={step}
              value={clamped}
              onChange={(e) => onChange(Number(e.target.value))}
            />
            <button type="button" className={btn} onClick={inc} aria-label={`${label}を1段階増やす`}>
              <Plus size={16} aria-hidden />
            </button>
          </div>

          {ticks && ticks.length > 0 && (
            <div className="flex gap-1.5">
              <span className="w-9 shrink-0" aria-hidden />
              <div className="relative mt-1 h-5 flex-1">
                {ticks.map((t) => {
                  const p = ((t.value - min) / (max - min)) * 100;
                  const shift = p <= 1 ? '0' : p >= 99 ? '-100%' : '-50%';
                  return (
                    <span
                      key={t.value}
                      className="absolute top-0 flex flex-col items-center"
                      style={{ left: `${p}%`, transform: `translateX(${shift})` }}
                    >
                      <span
                        className={`w-px bg-line ${t.label ? 'h-2' : 'h-1'}`}
                        aria-hidden
                      />
                      {t.label && (
                        <span className="mt-0.5 whitespace-nowrap text-[10px] font-bold text-ink-soft">
                          {t.label}
                        </span>
                      )}
                    </span>
                  );
                })}
              </div>
              <span className="w-9 shrink-0" aria-hidden />
            </div>
          )}
        </div>
      </div>

      {footer && <div className="mt-3">{footer}</div>}

      {hint && (
        <p aria-live="polite" className="mt-2 text-xs font-bold text-caution-text">
          {hint}
        </p>
      )}
    </div>
  );
}
