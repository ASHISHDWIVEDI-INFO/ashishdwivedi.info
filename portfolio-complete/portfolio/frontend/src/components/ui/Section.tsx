import { cn } from '@/lib/utils';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
  narrow?: boolean;
}

export default function Section({ children, className, id, narrow }: SectionProps) {
  return (
    <section id={id} className={cn('py-24', className)}>
      <div className={cn('mx-auto px-6', narrow ? 'max-w-3xl' : 'max-w-7xl')}>
        {children}
      </div>
    </section>
  );
}

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  className?: string;
}

export function SectionHeader({ eyebrow, title, subtitle, className }: SectionHeaderProps) {
  return (
    <div className={cn('mb-12', className)}>
      {eyebrow && (
        <p className="text-accent font-mono text-sm tracking-widest mb-2">{eyebrow}</p>
      )}
      <h2 className="font-display text-4xl md:text-5xl text-ink-50 font-light">{title}</h2>
      {subtitle && (
        <p className="text-ink-400 text-lg mt-3 max-w-xl">{subtitle}</p>
      )}
    </div>
  );
}
