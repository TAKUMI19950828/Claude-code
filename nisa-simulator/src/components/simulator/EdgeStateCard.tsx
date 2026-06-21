import { Mascot } from '../Mascot';

interface EdgeStateCardProps {
  variant: 'already' | 'unreachable';
  title: string;
  message: string;
}

export function EdgeStateCard({ variant, title, message }: EdgeStateCardProps) {
  const positive = variant === 'already';
  return (
    <div
      className={`animate-fade-up flex items-center gap-4 rounded-card border px-5 py-5 ${
        positive ? 'border-gain/30 bg-gain-tint' : 'border-danger-text/20 bg-danger-bg'
      }`}
    >
      <Mascot pose={positive ? 'cheer' : 'think'} className="h-16 w-16 shrink-0" />
      <div>
        <p
          className={`font-rounded text-lg font-extrabold ${
            positive ? 'text-gain-text' : 'text-danger-text'
          }`}
        >
          {positive ? '🎉 ' : ''}
          {title}
        </p>
        <p className="mt-1 text-sm leading-relaxed text-ink-soft">{message}</p>
      </div>
    </div>
  );
}
