import { ArrowDown, Sparkles } from 'lucide-react';
import { Mascot } from './Mascot';

export function Hero({ compact = false }: { compact?: boolean }) {
  return (
    <section
      id="top"
      className={`relative overflow-hidden ${compact ? 'py-8 sm:py-10' : 'py-12 sm:py-16'}`}
    >
      <div className="mx-auto grid max-w-sim items-center gap-6 px-4 sm:px-6 md:grid-cols-[1.3fr_1fr]">
        <div className={compact ? '' : 'animate-fade-up'}>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-300/50 px-3 py-1 text-xs font-bold text-ink">
            <Sparkles size={14} className="text-primary" aria-hidden />
            NISA初心者さんのための、やさしい説明ツール
          </span>
          <h1 className="mt-3 font-rounded text-3xl font-extrabold leading-[1.25] text-ink sm:text-4xl md:text-5xl">
            未来のつみたて、
            <br className="hidden sm:block" />
            <span className="text-primary">いくらになる？</span>
          </h1>
          <p className="mt-4 max-w-prose text-[15px] leading-relaxed text-ink-soft sm:text-base">
            毎月コツコツ積み立てると、将来いくらになるの？を、その場でかんたんシミュレーション。
            NISA（非課税）と、ふつうの口座（課税）の差もひと目で見られます。
          </p>
          {!compact && (
            <a
              href="#simulator"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-bold text-white shadow-cta transition-transform active:translate-y-1 active:shadow-ctaactive hover:bg-primary-hover"
            >
              さっそく試す
              <ArrowDown size={18} aria-hidden />
            </a>
          )}
        </div>

        <div className="relative hidden items-end justify-center md:flex">
          <div className="absolute right-6 top-2 max-w-[180px] rounded-card rounded-br-sm bg-white px-4 py-2.5 text-sm font-bold text-ink shadow-card">
            いっしょに計算しよ！
            <span className="absolute -bottom-2 right-6 h-4 w-4 rotate-45 bg-white" />
          </div>
          <Mascot pose="wave" className="h-44 w-44 drop-shadow-sm" title="マスコットの双葉ちゃん" />
        </div>
      </div>
    </section>
  );
}
