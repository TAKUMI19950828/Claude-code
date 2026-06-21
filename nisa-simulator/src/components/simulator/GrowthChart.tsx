import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { ChartPoint } from '../../types';
import { signedYen, yen } from '../../lib/format';
import { usePrefersReducedMotion } from '../../hooks/useCountUp';

const PRINCIPAL_COLOR = '#A9876E';

const yTick = (v: number): string => {
  if (v >= 1e8) return `${(v / 1e8).toFixed(1)}億`;
  if (v >= 1e4) return `${Math.round(v / 1e4).toLocaleString('ja-JP')}万`;
  return String(v);
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload || payload.length === 0) return null;
  const point = payload[0].payload as ChartPoint;
  const diff = point.nisa - point.taxable;
  return (
    <div className="rounded-xl border border-line bg-white/95 px-3 py-2 text-xs shadow-card">
      <p className="font-extrabold text-ink">{point.year}年目</p>
      <p className="mt-1 flex items-center justify-between gap-4 font-bold text-primary">
        <span>NISA（非課税）</span>
        <span className="tabular-nums">{yen(point.nisa)}</span>
      </p>
      <p className="flex items-center justify-between gap-4 font-bold text-taxable">
        <span>課税口座</span>
        <span className="tabular-nums">{yen(point.taxable)}</span>
      </p>
      <p
        className="flex items-center justify-between gap-4 font-bold"
        style={{ color: PRINCIPAL_COLOR }}
      >
        <span>投資元本</span>
        <span className="tabular-nums">{yen(point.principal)}</span>
      </p>
      <p className="mt-1 flex items-center justify-between gap-4 border-t border-line pt-1 font-bold text-gain-text">
        <span>差</span>
        <span className="tabular-nums">{signedYen(diff)}</span>
      </p>
      {/* label is unused but provided by recharts */}
      <span className="sr-only">{label}</span>
    </div>
  );
}

function makeEndLabel(lastIndex: number, text: string, color: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (props: any) => {
    if (props.index !== lastIndex) return <g />;
    return (
      <text
        x={props.x}
        y={props.y}
        dx={8}
        dy={4}
        fill={color}
        fontSize={12}
        fontWeight={800}
        textAnchor="start"
      >
        {text}
      </text>
    );
  };
}

export function GrowthChart({ data }: { data: ChartPoint[] }) {
  const prefersReduced = usePrefersReducedMotion();
  const lastIndex = data.length - 1;

  return (
    <div className="h-[260px] w-full" aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 10, right: 64, left: 4, bottom: 0 }}>
          <defs>
            <linearGradient id="nisaFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#FF8A66" stopOpacity={0.34} />
              <stop offset="100%" stopColor="#FFD27A" stopOpacity={0.06} />
            </linearGradient>
            <pattern
              id="taxHatch"
              width="6"
              height="6"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <rect width="6" height="6" fill="#475569" fillOpacity="0.05" />
              <line x1="0" y1="0" x2="0" y2="6" stroke="#475569" strokeWidth="1.1" strokeOpacity="0.45" />
            </pattern>
          </defs>

          <CartesianGrid strokeDasharray="2 4" stroke="#F1E4D8" vertical={false} />
          <XAxis
            dataKey="year"
            tickFormatter={(v) => `${v}`}
            tick={{ fill: '#6B5A50', fontSize: 11 }}
            tickLine={false}
            axisLine={{ stroke: '#F1E4D8' }}
            interval="preserveStartEnd"
          />
          <YAxis
            tickFormatter={yTick}
            tick={{ fill: '#6B5A50', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip content={<ChartTooltip />} cursor={{ stroke: '#FFB89E', strokeWidth: 1 }} />

          {/* NISA（主役・暖色・濃端実線） */}
          <Area
            type="monotone"
            dataKey="nisa"
            stroke="#D2441A"
            strokeWidth={3}
            fill="url(#nisaFill)"
            isAnimationActive={!prefersReduced}
            label={makeEndLabel(lastIndex, 'NISA', '#D2441A')}
            dot={false}
          />
          {/* 課税口座（脇役・slate-600・破線＋ハッチ） */}
          <Area
            type="monotone"
            dataKey="taxable"
            stroke="#475569"
            strokeWidth={2}
            strokeDasharray="5 4"
            fill="url(#taxHatch)"
            isAnimationActive={!prefersReduced}
            label={makeEndLabel(lastIndex, '課税', '#475569')}
            dot={false}
          />
          {/* 投資元本（ブラウンの点線・運用益の土台） */}
          <Line
            type="monotone"
            dataKey="principal"
            stroke={PRINCIPAL_COLOR}
            strokeWidth={2}
            strokeDasharray="2 3"
            isAnimationActive={!prefersReduced}
            label={makeEndLabel(lastIndex, '元本', PRINCIPAL_COLOR)}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
