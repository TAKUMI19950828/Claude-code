import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { simulate } from "./calc";

function formatYen(value: number): string {
  return Math.round(value).toLocaleString("ja-JP") + "円";
}

function formatYenShort(value: number): string {
  if (value >= 10000) {
    return (value / 10000).toFixed(0) + "万円";
  }
  return Math.round(value).toLocaleString("ja-JP") + "円";
}

export default function App() {
  const [initialAmount, setInitialAmount] = useState(100000);
  const [monthlyAmount, setMonthlyAmount] = useState(30000);
  const [annualRate, setAnnualRate] = useState(5);
  const [years, setYears] = useState(20);

  const result = useMemo(
    () =>
      simulate({
        initialAmount,
        monthlyAmount,
        annualRatePercent: annualRate,
        years,
      }),
    [initialAmount, monthlyAmount, annualRate, years]
  );

  const chartData = result.yearly.map((y) => ({
    year: `${y.year}年`,
    principal: Math.round(y.principal),
    profit: Math.round(y.profit),
    balance: Math.round(y.balance),
  }));

  return (
    <div className="page">
      <header className="header">
        <h1>🌱 NISA資産形成シミュレーター</h1>
        <p>毎月の積立で、将来どれくらい資産が育つか試してみよう</p>
      </header>

      <main className="layout">
        <section className="card input-card">
          <h2>入力条件</h2>

          <div className="field">
            <label htmlFor="initial">初期資産（円）</label>
            <input
              id="initial"
              type="number"
              min={0}
              step={10000}
              value={initialAmount}
              onChange={(e) => setInitialAmount(Number(e.target.value) || 0)}
            />
          </div>

          <div className="field">
            <label htmlFor="monthly">毎月積立額（円）</label>
            <input
              id="monthly"
              type="number"
              min={0}
              step={1000}
              value={monthlyAmount}
              onChange={(e) => setMonthlyAmount(Number(e.target.value) || 0)}
            />
          </div>

          <div className="field">
            <label htmlFor="rate">想定年利（%）</label>
            <input
              id="rate"
              type="number"
              min={0}
              max={30}
              step={0.1}
              value={annualRate}
              onChange={(e) => setAnnualRate(Number(e.target.value) || 0)}
            />
            <input
              type="range"
              min={0}
              max={15}
              step={0.1}
              value={annualRate}
              onChange={(e) => setAnnualRate(Number(e.target.value))}
            />
          </div>

          <div className="field">
            <label htmlFor="years">運用年数（年）</label>
            <input
              id="years"
              type="number"
              min={1}
              max={60}
              step={1}
              value={years}
              onChange={(e) => setYears(Number(e.target.value) || 1)}
            />
            <input
              type="range"
              min={1}
              max={50}
              step={1}
              value={years}
              onChange={(e) => setYears(Number(e.target.value))}
            />
          </div>
        </section>

        <section className="results">
          <div className="card stat-card stat-principal">
            <span className="stat-label">元本</span>
            <span className="stat-value">{formatYen(result.totalPrincipal)}</span>
          </div>
          <div className="card stat-card stat-profit">
            <span className="stat-label">運用益</span>
            <span className="stat-value">{formatYen(result.totalProfit)}</span>
          </div>
          <div className="card stat-card stat-final">
            <span className="stat-label">最終資産額</span>
            <span className="stat-value">{formatYen(result.finalBalance)}</span>
          </div>
        </section>

        <section className="card chart-card">
          <h2>資産の推移</h2>
          <div className="chart-wrapper">
            <ResponsiveContainer width="100%" height={320}>
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="principalColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6c8cff" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#6c8cff" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="profitColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ff7eb6" stopOpacity={0.85} />
                    <stop offset="95%" stopColor="#ff7eb6" stopOpacity={0.15} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef0fa" />
                <XAxis dataKey="year" tick={{ fontSize: 12 }} interval={Math.max(0, Math.floor(years / 8))} />
                <YAxis tickFormatter={(v) => formatYenShort(v)} tick={{ fontSize: 12 }} width={70} />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    const label = name === "principal" ? "元本" : name === "profit" ? "運用益" : name;
                    return [formatYen(value), label];
                  }}
                  labelFormatter={(label) => label}
                />
                <Area
                  type="monotone"
                  dataKey="principal"
                  stackId="1"
                  stroke="#6c8cff"
                  fill="url(#principalColor)"
                  name="principal"
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stackId="1"
                  stroke="#ff7eb6"
                  fill="url(#profitColor)"
                  name="profit"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="legend">
            <span className="legend-item">
              <span className="legend-dot dot-principal" /> 元本
            </span>
            <span className="legend-item">
              <span className="legend-dot dot-profit" /> 運用益
            </span>
          </div>
        </section>
      </main>

      <footer className="footer">
        <p>
          ※ このシミュレーションは年利が毎年一定であると仮定した簡易計算であり、
          実際の運用成果を保証するものではありません。
        </p>
      </footer>
    </div>
  );
}
