import { CalendarDays, Coins, Hourglass, Target } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { InputSlider } from './InputSlider';
import type { FieldKind } from './InputSlider';
import { ReturnRateField } from './ReturnRateField';
import { RANGE, STEP } from '../../lib/params';
import type { Pattern } from '../../types';

type FieldName = 'goal' | 'P' | 'C' | 'years';

const META: Record<
  FieldName,
  { label: string; kind: FieldKind; Icon: LucideIcon; min: number; max: number; step: number }
> = {
  goal: { label: '目標金額', kind: 'yen', Icon: Target, min: RANGE.goal[0], max: RANGE.goal[1], step: STEP.goal },
  P: { label: '初期投資額', kind: 'yen', Icon: Coins, min: RANGE.P[0], max: RANGE.P[1], step: STEP.P },
  C: { label: '毎月の積立額', kind: 'yen', Icon: CalendarDays, min: RANGE.C[0], max: RANGE.C[1], step: STEP.C },
  years: { label: '積立期間', kind: 'year', Icon: Hourglass, min: RANGE.years[0], max: RANGE.years[1], step: STEP.years },
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
            icon={<Icon size={16} className="text-primary" aria-hidden />}
            kind={meta.kind}
            value={values[name]}
            min={meta.min}
            max={meta.max}
            step={meta.step}
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
