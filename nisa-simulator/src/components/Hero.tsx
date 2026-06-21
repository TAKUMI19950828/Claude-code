import { ArrowDown, Sparkles } from 'lucide-react';

// 暖色グラデ＋やわらかなドット模様（data URI・自己完結）
const DOT =
  "url(\"data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='28'%20height='28'%20viewBox='0%200%2028%2028'%3E%3Ccircle%20cx='4'%20cy='4'%20r='1.6'%20fill='%23FF8A66'%20fill-opacity='0.18'/%3E%3C/svg%3E\")";

const HERO_BG = {
  backgroundImage:
    `${DOT},` +
    'radial-gradient(circle at 16% 18%, rgba(255,138,102,.45), transparent 42%),' +
    'radial-gradient(circle at 84% 14%, rgba(255,190,77,.42), transparent 46%),' +
    'linear-gradient(180deg, #FFE7DC 0%, #FFF1E8 58%, #FFFAF6 100%)',
};

export function Hero({ compact = false }: { compact?: boolean }) {
  return (
    <section id="top" className="relative overflow-hidden">
      {/* デザイン背景 */}
      <div aria-hidden className="absolute inset-0 -z-10" style={HERO_BG} />

      <div
        className={`relative mx-auto max-w-prose px-4 text-center sm:px-6 ${
          compact ? 'py-9 sm:py-10' : 'py-14 sm:py-20'
        }`}
      >
        <span className="inline-flex items-center gap-1.5 rounded-full bg-white/70 px-3 py-1 text-xs font-bold text-ink shadow-sm backdrop-blur-sm">
          <Sparkles size={14} className="text-primary" aria-hidden />
          NISA初心者さんのための、やさしい説明ツール
        </span>
        <h1 className="mt-4 font-rounded text-3xl font-extrabold leading-[1.25] text-ink sm:text-4xl md:text-5xl">
          未来のつみたて、
          <br className="hidden sm:block" />
          <span className="text-primary">いくらになる？</span>
        </h1>
        <p className="mx-auto mt-4 max-w-prose text-[15px] leading-relaxed text-ink-soft sm:text-base">
          毎月コツコツ積み立てると、将来いくらになるの？を、その場でかんたんシミュレーション。
          NISA（非課税）と、ふつうの口座（課税）の差もひと目で見られます。
        </p>
        {!compact && (
          <a
            href="#simulator"
            className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-white shadow-cta transition-transform hover:bg-primary-hover active:translate-y-1 active:shadow-ctaactive"
          >
            さっそく試す
            <ArrowDown size={18} aria-hidden />
          </a>
        )}
      </div>

      {/* 下端の波形ディバイダー（クリームでシミュレーターへ接続＝区切りを明確化） */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0">
        <svg viewBox="0 0 1440 80" preserveAspectRatio="none" className="block h-9 w-full sm:h-14">
          <path
            d="M0,42 C240,92 480,8 720,40 C960,72 1200,8 1440,40 L1440,80 L0,80 Z"
            fill="#FFFAF6"
          />
        </svg>
      </div>
    </section>
  );
}
