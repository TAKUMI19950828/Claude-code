import type { ButtonHTMLAttributes } from 'react';

type Variant = 'primary' | 'sub' | 'accent' | 'danger' | 'ghost';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
  block?: boolean;
}

/** Shiny, tactile button used across the app. */
export function PrimaryButton({
  variant = 'primary',
  size = 'md',
  block,
  className = '',
  children,
  ...rest
}: Props) {
  const cls = [
    'btn',
    `btn--${variant}`,
    size === 'lg' ? 'btn--lg' : size === 'sm' ? 'btn--sm' : '',
    block ? 'btn--block' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <button className={cls} {...rest}>
      {children}
    </button>
  );
}
