import { Sprout } from 'lucide-react';

const NAV = [
  { href: '#simulator', label: 'シミュレーション' },
  { href: '#about', label: 'NISAとは' },
  { href: '#disclaimer', label: '免責' },
];

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-cream/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-sim items-center justify-between gap-3 px-4 py-2.5 sm:px-6">
        <a href="#top" className="flex items-center gap-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-coral-500/15 text-primary">
            <Sprout size={20} aria-hidden />
          </span>
          <span className="font-rounded text-base font-extrabold leading-tight text-ink sm:text-lg">
            つみたて<span className="text-primary">みらい</span>シミュレーター
          </span>
        </a>
        <nav className="hidden items-center gap-1 sm:flex">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-1.5 text-sm font-bold text-ink-soft transition-colors hover:bg-surface-soft hover:text-primary"
            >
              {item.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
