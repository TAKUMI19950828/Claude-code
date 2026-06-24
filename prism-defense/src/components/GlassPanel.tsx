import type { HTMLAttributes } from 'react';

/** Translucent glassmorphism card. */
export function GlassPanel({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`glass ${className}`} {...rest}>
      {children}
    </div>
  );
}
