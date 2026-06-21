import type { ReactNode } from 'react';
import { futureValue } from '../../lib/calc';
import { NISA } from '../../lib/nisaRules';
import { manYen, yen } from '../../lib/format';
import { Mascot } from '../Mascot';

function Card({ emoji, title, children }: { emoji: string; title: string; children: ReactNode }) {
  return (
    <div className="rounded-card bg-white p-5 shadow-card sm:p-6">
      <h3 className="flex items-center gap-2 font-rounded text-lg font-extrabold text-ink">
        <span aria-hidden className="text-2xl">
          {emoji}
        </span>
        {title}
      </h3>
      <div className="mt-3 text-sm leading-relaxed text-ink-soft">{children}</div>
    </div>
  );
}

function TaxBeforeAfter() {
  const gain = 1_000_000;
  const tax = Math.round(gain * NISA.taxRate);
  const afterTax = gain - tax;
  return (
    <div className="mt-4 grid grid-cols-2 gap-3">
      <div className="rounded-control bg-surface-soft p-3">
        <p className="text-xs font-bold text-ink-soft">ふつうの口座（課税）</p>
        <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-line">
          <div className="h-full bg-taxable" style={{ width: `${(afterTax / gain) * 100}%` }} />
        </div>
        <p className="mt-2 text-base font-extrabold text-ink">手取り {yen(afterTax)}</p>
        <p className="text-xs text-danger-text">−{yen(tax)}（税金 20.315%）</p>
      </div>
      <div className="rounded-control bg-gain-tint p-3">
        <p className="text-xs font-bold text-gain-text">NISA（非課税）</p>
        <div className="mt-2 h-3 w-full overflow-hidden rounded-full bg-gain/20">
          <div className="h-full bg-gain" style={{ width: '100%' }} />
        </div>
        <p className="mt-2 text-base font-extrabold text-ink">まるまる {yen(gain)}</p>
        <p className="text-xs text-gain-text">税金は0円！</p>
      </div>
    </div>
  );
}

function AllowanceMeter() {
  const total = NISA.lifetimeCap; // 1800万
  const growth = NISA.display.lifetimeGrowthCap; // 1200万
  const growthPct = (growth / total) * 100;
  return (
    <div className="mt-4">
      <div className="flex h-7 w-full overflow-hidden rounded-full bg-line">
        <div
          className="flex items-center justify-center bg-coral-400 text-[11px] font-bold text-ink"
          style={{ width: `${growthPct}%` }}
        >
          成長 1,200万
        </div>
        <div className="flex flex-1 items-center justify-center bg-amber-300 text-[11px] font-bold text-ink">
          つみたて含む
        </div>
      </div>
      <p className="mt-2 text-xs text-ink-soft">
        生涯で投資できる元本は合計{' '}
        <span className="font-bold text-ink">{manYen(total)}</span>。うち成長投資枠は{' '}
        <span className="font-bold text-ink">{manYen(growth)}</span> まで使えます。
      </p>
    </div>
  );
}

function CompoundStart() {
  const C = 30_000;
  const r = 0.05;
  const early = futureValue({ P: 0, C, years: 40, rAnnual: r }); // 25歳→65歳
  const late = futureValue({ P: 0, C, years: 30, rAnnual: r }); // 35歳→65歳
  const diff = early - late;
  return (
    <div className="mt-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-control bg-coral-500/10 p-3 text-center">
          <p className="text-xs font-bold text-ink-soft">25歳スタート（40年）</p>
          <p className="mt-1 font-rounded text-xl font-extrabold text-primary">{manYen(early)}</p>
        </div>
        <div className="rounded-control bg-surface-soft p-3 text-center">
          <p className="text-xs font-bold text-ink-soft">35歳スタート（30年）</p>
          <p className="mt-1 font-rounded text-xl font-extrabold text-ink">{manYen(late)}</p>
        </div>
      </div>
      <p className="mt-3 rounded-xl bg-amber-300/30 px-3 py-2 text-xs text-ink">
        同じ毎月3万円・年率5%でも、10年早く始めるだけで将来差は約{' '}
        <span className="font-extrabold text-primary">{manYen(diff)}</span>。これが「複利の力」です。
      </p>
    </div>
  );
}

export function NisaExplainerSection() {
  return (
    <section id="about" className="mx-auto max-w-prose scroll-mt-16 px-4 py-10 sm:px-6">
      <div className="flex items-center gap-3">
        <Mascot pose="point" className="h-14 w-14 shrink-0" />
        <div>
          <h2 className="font-rounded text-2xl font-extrabold text-ink sm:text-3xl">NISAって、なに？</h2>
          <p className="text-sm text-ink-soft">むずかしい言葉はなし。3分でわかる、やさしいキホン。</p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        <Card emoji="🌱" title="NISAは「投資の利益が非課税」になる制度">
          NISA（ニーサ）は<strong className="text-ink">少額投資非課税制度</strong>のこと。本来かかる
          「運用益への税金」がかからなくなる、国が用意したおトクな制度です。少しずつ・長く続けるほど力を
          発揮します。
        </Card>

        <Card emoji="💰" title="なぜ非課税がうれしいの？">
          ふつうの口座では、増えた利益に <strong className="text-ink">20.315%</strong>{' '}
          の税金がかかります。たとえば運用益が100万円なら、約20万円が税金に。NISAならこれが
          <strong className="text-gain-text">まるごと非課税</strong>です。
          <TaxBeforeAfter />
        </Card>

        <Card emoji="🧩" title="2つの枠：つみたて投資枠と成長投資枠">
          1年に投資できる金額には枠があります。
          <ul className="mt-2 space-y-1">
            <li>
              ・<strong className="text-ink">つみたて投資枠</strong>：年{manYen(NISA.annualTsumitateCap)}（月10万円）まで
            </li>
            <li>
              ・<strong className="text-ink">成長投資枠</strong>：年{manYen(NISA.display.growthAnnualCap)}まで
            </li>
            <li>
              ・あわせて最大 <strong className="text-ink">年{manYen(NISA.display.totalAnnualCap)}</strong> まで
            </li>
          </ul>
          <p className="mt-2 text-xs">このツールは「毎月コツコツ積み立てる」つみたて投資が中心の計算です。</p>
        </Card>

        <Card emoji="🏦" title="一生で投資できる上限（生涯投資枠）">
          生涯で投資できる元本の合計は <strong className="text-ink">1,800万円</strong>。そのうち成長投資枠は
          1,200万円までと決まっています。
          <AllowanceMeter />
        </Card>

        <Card emoji="⏳" title="早く始めるほど、複利が大きく育つ">
          複利は「利益が利益を生む」しくみ。時間が長いほど雪だるま式に増えるので、
          <strong className="text-ink">始める時期が早い</strong>ほど有利です。
          <CompoundStart />
        </Card>
      </div>
    </section>
  );
}
