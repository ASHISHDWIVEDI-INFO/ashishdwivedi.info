import { cn } from '@/lib/utils';

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'accent' | 'outline';
}

export default function Badge({ children, className, variant = 'default' }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-block text-xs font-mono px-2 py-0.5 rounded',
        {
          'bg-surface border border-surface-border text-ink-500': variant === 'default',
          'border border-accent/25 bg-accent/8 text-accent': variant === 'accent',
          'border border-surface-border text-ink-400': variant === 'outline',
        },
        className
      )}
    >
      {children}
    </span>
  );
}
