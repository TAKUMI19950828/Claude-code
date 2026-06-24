interface Props {
  value: number;
  max: number;
  height?: number;
}

export function HpBar({ value, max, height = 10 }: Props) {
  const ratio = Math.max(0, Math.min(1, max > 0 ? value / max : 0));
  const pct = ratio * 100;
  const tone = ratio <= 0.3 ? 'low' : ratio <= 0.6 ? 'mid' : '';
  return (
    <div className="hpbar" style={{ height }}>
      <div className={`hpbar__fill ${tone}`} style={{ width: `${pct}%` }} />
    </div>
  );
}
