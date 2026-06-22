import { useState } from 'react';
import { HelpCircle, TrendingUp } from 'lucide-react';
import { InputSlider } from './InputSlider';
import { RETURN_DISCLAIMER, RETURN_PRESETS } from '../../lib/returnPresets';
import { RANGE, STEP } from '../../lib/params';

interface ReturnRateFieldProps {
  value: number;
  onChange: (v: number) => void;
  onPreset: (rPercent: number) => void;
}

export function ReturnRateField({ value, onChange, onPreset }: ReturnRateFieldProps) {
  const [showInfo, setShowInfo] = useState(false);

  // 「目安から選ぶ」チップ群は InputSlider の footer として同一カード内に描画
  // （上の3項目と同じカード＝左揃え・同幅になる）
  const presetChips = (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-ink-soft">目安から選ぶ</span>
        <button
          type="button"
          onClick={() => setShowInfo((s) => !s)}
          aria-expanded={showInfo}
          className="flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold text-ink-soft hover:text-primary"
        >
          <HelpCircle size={14} aria-hidden />
          目安について
        </button>
      </div>

      <div className="mt-2 flex flex-wrap gap-2">
        {RETURN_PRESETS.map((preset) => {
          const active = Math.abs(value - preset.rPercent) < 1e-9;
          return (
            <button
              key={preset.label}
              type="button"
              onClick={() => onPreset(preset.rPercent)}
              aria-pressed={active}
              className={`active:animate-pop rounded-full border px-3 py-1.5 text-xs font-bold transition-colors ${
                active
                  ? 'border-primary bg-primary text-white shadow-sm'
                  : 'border-line bg-white text-ink hover:border-coral-300'
              }`}
            >
              <span aria-hidden className="mr-1">
                {preset.emoji}
              </span>
              {preset.short}
              <span className={active ? 'ml-1 text-white/90' : 'ml-1 text-ink-soft'}>
                {preset.rPercent}%
              </span>
            </button>
          );
        })}
      </div>

      {showInfo && (
        <p className="mt-2 rounded-xl bg-caution-bg px-3 py-2 text-xs leading-relaxed text-caution-text">
          {RETURN_DISCLAIMER}
        </p>
      )}
    </div>
  );

  return (
    <InputSlider
      label="想定リターン（年率）"
      icon={<TrendingUp size={18} className="text-primary" aria-hidden />}
      kind="percent"
      value={value}
      min={RANGE.rPercent[0]}
      max={RANGE.rPercent[1]}
      step={STEP.rPercent}
      ticks={[
        { value: 0, label: '0%' },
        { value: 5, label: '5%' },
        { value: 10, label: '10%' },
        { value: 15, label: '15%' },
        { value: 20, label: '20%' },
        { value: 2.5 },
        { value: 7.5 },
        { value: 12.5 },
        { value: 17.5 },
      ]}
      footer={presetChips}
      onChange={onChange}
    />
  );
}
