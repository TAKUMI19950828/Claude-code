import { Lightbulb, PartyPopper } from 'lucide-react';

interface EdgeStateCardProps {
  variant: 'already' | 'unreachable';
  title: string;
  message: string;
}

export function EdgeStateCard({ variant, title, message }: EdgeStateCardProps) {
  const positive = variant === 'already';
  const Icon = positive ? PartyPopper : Lightbulb;
  return (
    <div
      className={`animate-fade-up flex items-center gap-4 rounded-card border px-5 py-5 ${
        positive ? 'border-gain/30 bg-gain-tint' : 'border-danger-text/20 bg-danger-bg'
      }`}
    >
      <span
        className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${
          positive ? 'bg-gain/15 text-gain-text' : 'bg-danger-text/10 text-danger-text'
        }`}
      >
        <Icon size={26} aria-hidden />
      </span>
      <div>
        <p
          className={`font-rounded text-lg font-extrabold ${
            positive ? 'text-gain-text' : 'text-danger-text'
          }`}
        >
          {title}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">{message}</p>
      </div>
    </div>
  );
}
