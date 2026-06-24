import { useMemo } from 'react';
import type { ReactNode } from 'react';

/** Outer frame: centers the play area and renders the floating sparkle layer. */
export function AppShell({ children }: { children: ReactNode }) {
  const sparkles = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        left: `${(i * 37) % 100}%`,
        delay: `${(i * 1.7) % 9}s`,
        dur: `${7 + (i % 5) * 2}s`,
        char: ['✨', '⭐', '🌟', '💫', '🩷', '💠'][i % 6],
      })),
    [],
  );

  return (
    <div className="app-shell">
      <div className="app-frame">
        <div className="sparkles" aria-hidden>
          {sparkles.map((s, i) => (
            <span
              key={i}
              style={{ left: s.left, bottom: '-20px', animationDelay: s.delay, animationDuration: s.dur }}
            >
              {s.char}
            </span>
          ))}
        </div>
        {children}
      </div>
    </div>
  );
}
