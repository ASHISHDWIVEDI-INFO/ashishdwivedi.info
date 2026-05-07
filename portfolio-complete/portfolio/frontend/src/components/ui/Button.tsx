import { cn } from '@/lib/utils';
import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export default function Button({
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-medium transition-colors rounded disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'bg-accent text-surface hover:bg-accent-light': variant === 'primary',
          'border border-surface-border text-ink-300 hover:border-accent hover:text-accent': variant === 'outline',
          'text-ink-400 hover:text-accent': variant === 'ghost',
        },
        {
          'text-xs px-3 py-1.5': size === 'sm',
          'text-sm px-5 py-2.5': size === 'md',
          'text-base px-7 py-3': size === 'lg',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
