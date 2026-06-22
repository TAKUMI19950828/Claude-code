import type { ReactNode } from 'react';
import { futureValue } from '../../lib/calc';
import { NISA } from '../../lib/nisaRules';
import { manYen, yen } from '../../lib/format';

function Card({
  emoji,
  title,
  className = '',
  children,
}: {
  emoji: string;
  title: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`rounded-card bg-white p-5 shadow-card sm:p-6 ${className}`}>
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

/** お金が育つイメージ（コイン＋双葉）。 */
function GrowSprout() {
  return (
    <svg viewBox="0 0 160 120" className="h-28 w-40" role="img" aria-label="お金が育つイメージ">
      <ellipse cx="80" cy="108" rx="48" ry="9" fill="#F1E4D8" />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <ellipse cx="80" cy={100 - i * 13} rx="36" ry="10" fill="#F5A623" />
          <ellipse cx="80" cy={97 - i * 13} rx="36" ry="10" fill="#FFD27A" />
        </g>
      ))}
      <text x="80" y="69" textAnchor="middle" fontSize="15" fontWeight="800" fill="#9A6314">
        ¥
      </text>
      <rect x="77" y="34" width="6" height="30" rx="3" fill="#36A35B" />
      <path d="M80 44 C62 32 46 38 44 54 C62 60 76 55 80 44 Z" fill="#43BE72" />
      <path d="M80 40 C98 28 114 34 116 50 C98 56 84 51 80 40 Z" fill="#4FCB7E" />
    </svg>
  );
}

/** コイン（課税は20.315%のスライスが赤＝失われる分）。 */
function CoinPie({ taxed = false }: { taxed?: boolean }) {
  return (
    <svg viewBox="0 0 80 80" className="h-16 w-16 shrink-0" aria-hidden>
      <circle cx="40" cy="40" r="34" fill={taxed ? '#E2E8F0' : '#FFD27A'} />
      <circle cx="40" cy="40" r="34" fill="none" stroke={taxed ? '#94A3B8' : '#F5A623'} strokeWidth="3" />
      {taxed && (
        <path d="M40 40 L40 6 A34 34 0 0 1 72.5 30 Z" fill="#FBD2D2" stroke="#E5484D" strokeWidth="1.5" />
      )}
      <text x="40" y="47" textAnchor="middle" fontSize="22" fontWeight="800" fill={taxed ? '#64748B' : '#9A6314'}>
        ¥
      </text>
    </svg>
  );
}

function TaxCoins() {
  const gain = 1_000_000;
  const tax = Math.round(gain * NISA.taxRate);
  const afterTax = gain - tax;
  return (
    <div className="mt-4 grid gap-3 sm:grid-cols-2">
      <div className="flex items-center gap-3 rounded-control bg-surface-soft p-3">
        <CoinPie taxed />
        <div>
          <p className="text-xs font-bold text-ink-soft">ふつうの口座（課税）</p>
          <p className="text-lg font-extrabold text-ink">手取り {yen(afterTax)}</p>
          <p className="text-xs font-bold text-danger-text">−{yen(tax)}（税金 20.315%）</p>
        </div>
      </div>
      <div className="flex items-center gap-3 rounded-control bg-gain-tint p-3">
        <CoinPie />
        <div>
          <p className="text-xs font-bold text-gain-text">NISA（非課税）</p>
          <p className="text-lg font-extrabold text-ink">まるまる {yen(gain)}</p>
          <p className="text-xs font-bold text-gain-text">税金は0円！</p>
        </div>
      </div>
    </div>
  );
}

/** 年間の枠：つみたて120万＋成長240万＝360万の比例ブロック図。 */
function AnnualFrames() {
  return (
    <div className="mt-4">
      <div className="flex h-14 w-full overflow-hidden rounded-xl border border-line">
        <div
          className="flex flex-col items-center justify-center bg-coral-400 text-ink"
          style={{ width: '33.3333%' }}
        >
          <span className="text-[11px] font-bold">つみたて枠</span>
          <span className="text-sm font-extrabold">120万</span>
        </div>
        <div className="flex flex-1 flex-col items-center justify-center bg-amber-300 text-ink">
          <span className="text-[11px] font-bold">成長投資枠</span>
          <span className="text-sm font-extrabold">240万</span>
        </div>
      </div>
      <p className="mt-1.5 text-right text-xs font-bold text-ink">＝ あわせて 年360万円まで</p>
    </div>
  );
}

function AllowanceMeter() {
  const total = NISA.lifetimeCap; // 1800万
  const growth = NISA.display.lifetimeGrowthCap; // 1200万
  const growthPct = (growth / total) * 100;
  return (
    <div className="mt-4">
      <div className="flex h-9 w-full overflow-hidden rounded-full border border-line">
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

/** 複利の成長カーブ（早いほど大きい）。 */
function CompoundCurves() {
  return (
    <svg viewBox="0 0 220 100" className="h-28 w-full" role="img" aria-label="複利の成長カーブ（早く始めるほど大きい）">
      <line x1="16" y1="86" x2="210" y2="86" stroke="#F1E4D8" strokeWidth="2" />
      <line x1="16" y1="8" x2="16" y2="86" stroke="#F1E4D8" strokeWidth="2" />
      <path d="M78 86 C130 82 160 66 210 44" fill="none" stroke="#94A3B8" strokeWidth="3" strokeDasharray="5 4" />
      <path d="M16 86 C96 80 138 42 210 12" fill="none" stroke="#D2441A" strokeWidth="3.5" />
      <circle cx="210" cy="12" r="4" fill="#D2441A" />
      <circle cx="210" cy="44" r="4" fill="#94A3B8" />
      <text x="150" y="26" fontSize="10" fontWeight="800" fill="#D2441A">早く開始</text>
      <text x="150" y="62" fontSize="10" fontWeight="800" fill="#64748B">遅く開始</text>
    </svg>
  );
}

function CompoundStart() {
  const C = 30_000;
  const r = 0.05;
  const early = futureValue({ P: 0, C, years: 40, rAnnual: r }); // 25歳→65歳
  const late = futureValue({ P: 0, C, years: 30, rAnnual: r }); // 35歳→65歳
  const diff = early - late;
  return (
    <div>
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
    <section
      id="about"
      className="relative scroll-mt-16 bg-gradient-to-b from-[#FFF1E6] to-[#FFF7F0]"
    >
      {/* 上端の波形ディバイダー（cream）でシミュレーターと明確に区切る */}
      <div aria-hidden className="absolute inset-x-0 top-0 leading-none">
        <svg viewBox="0 0 1440 70" preserveAspectRatio="none" className="block h-8 w-full sm:h-12">
          <path
            d="M0,0 L1440,0 L1440,30 C1200,62 960,10 720,34 C480,58 240,8 0,30 Z"
            fill="#FFFAF6"
          />
        </svg>
      </div>

      <div className="relative mx-auto max-w-sim px-4 pb-14 pt-16 sm:px-6 sm:pt-24">
        <div className="flex items-center gap-3">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-coral-500/15 text-2xl">
            🌱
          </span>
          <div>
            <h2 className="font-rounded text-2xl font-extrabold text-ink sm:text-3xl">NISAって、なに？</h2>
            <p className="text-sm text-ink-soft">むずかしい言葉はなし。図で見る、やさしいキホン。</p>
          </div>
        </div>

        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Card emoji="🌱" title="NISAは「投資の利益が非課税」になる制度" className="md:col-span-2">
            <div className="grid items-center gap-4 sm:grid-cols-[1fr_auto]">
              <p>
                NISA（ニーサ）は<strong className="text-ink">少額投資非課税制度</strong>のこと。本来かかる
                「運用益への税金」がかからなくなる、国が用意したおトクな制度です。少しずつ・長く続けるほど
                力を発揮します。
              </p>
              <div className="mx-auto">
                <GrowSprout />
              </div>
            </div>
          </Card>

          <Card emoji="💰" title="なぜ非課税がうれしいの？" className="md:col-span-2">
            ふつうの口座では、増えた利益に <strong className="text-ink">20.315%</strong> の税金がかかります。
            たとえば運用益が100万円なら、約20万円が税金に。NISAならこれが
            <strong className="text-gain-text">まるごと非課税</strong>です。
            <TaxCoins />
          </Card>

          <Card emoji="🧩" title="2つの枠：つみたて投資枠と成長投資枠">
            1年に投資できる金額には「枠」があります。
            <AnnualFrames />
            <p className="mt-2 text-xs">このツールは「毎月コツコツ積み立てる」つみたて投資が中心の計算です。</p>
          </Card>

          <Card emoji="🏦" title="一生で投資できる上限（生涯投資枠）">
            生涯で投資できる元本の合計は <strong className="text-ink">1,800万円</strong>。そのうち成長投資枠は
            1,200万円までと決まっています。
            <AllowanceMeter />
          </Card>

          <Card emoji="⏳" title="早く始めるほど、複利が大きく育つ" className="md:col-span-2">
            複利は「利益が利益を生む」しくみ。時間が長いほど雪だるま式に増えるので、
            <strong className="text-ink">始める時期が早い</strong>ほど有利です。
            <div className="mt-4 grid items-center gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
              <CompoundCurves />
              <CompoundStart />
            </div>
          </Card>
        </div>
      </div>
    </section>
  );
}
