import { CalendarDays, Coins, Hourglass, Target } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { InputSlider } from './InputSlider';
import type { FieldKind, Tick } from './InputSlider';
import { ReturnRateField } from './ReturnRateField';
import { RANGE, STEP } from '../../lib/params';
import type { Pattern } from '../../types';

type FieldName = 'goal' | 'P' | 'C' | 'years';

const META: Record<
  FieldName,
  { label: string; kind: FieldKind; Icon: LucideIcon; min: number; max: number; step: number; ticks: Tick[] }
> = {
  goal: {
    label: '目標金額',
    kind: 'yen',
    Icon: Target,
    min: RANGE.goal[0],
    max: RANGE.goal[1],
    step: STEP.goal,
    ticks: [
      { value: 100_000, label: '10万' },
      { value: 25_000_000, label: '2500万' },
      { value: 50_000_000, label: '5000万' },
      { value: 100_000_000, label: '1億' },
    ],
  },
  P: {
    label: '初期投資額',
    kind: 'yen',
    Icon: Coins,
    min: RANGE.P[0],
    max: RANGE.P[1],
    step: STEP.P,
    ticks: [
      { value: 0, label: '0' },
      { value: 5_000_000, label: '500万' },
      { value: 10_000_000, label: '1000万' },
    ],
  },
  C: {
    label: '毎月の積立額',
    kind: 'yen',
    Icon: CalendarDays,
    min: RANGE.C[0],
    max: RANGE.C[1],
    step: STEP.C,
    ticks: [
      { value: 0, label: '0' },
      { value: 100_000, label: '10万' },
      { value: 200_000, label: '20万' },
      { value: 300_000, label: '30万' },
    ],
  },
  years: {
    label: '積立期間',
    kind: 'year',
    Icon: Hourglass,
    min: RANGE.years[0],
    max: RANGE.years[1],
    step: STEP.years,
    ticks: [
      { value: 10, label: '10年' },
      { value: 20, label: '20年' },
      { value: 30, label: '30年' },
      { value: 40, label: '40年' },
    ],
  },
};

const PATTERN_FIELDS: Record<Pattern, FieldName[]> = {
  1: ['P', 'C', 'years'],
  2: ['goal', 'P', 'years'],
  3: ['goal', 'P', 'C'],
  4: ['goal', 'C', 'years'],
};

interface InputsPanelProps {
  pattern: Pattern;
  values: Record<string, number>;
  onField: (field: string, value: number) => void;
  onPreset: (rPercent: number) => void;
}

export function InputsPanel({ pattern, values, onField, onPreset }: InputsPanelProps) {
  return (
    <div className="space-y-3">
      {PATTERN_FIELDS[pattern].map((name) => {
        const meta = META[name];
        const Icon = meta.Icon;
        return (
          <InputSlider
            key={name}
            label={meta.label}
            icon={<Icon size={18} className="text-primary" aria-hidden />}
            kind={meta.kind}
            value={values[name]}
            min={meta.min}
            max={meta.max}
            step={meta.step}
            ticks={meta.ticks}
            onChange={(v) => onField(name, v)}
          />
        );
      })}
      <ReturnRateField
        value={values.rPercent}
        onChange={(v) => onField('rPercent', v)}
        onPreset={onPreset}
      />
    </div>
  );
}
