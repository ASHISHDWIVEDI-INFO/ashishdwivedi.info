import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: string, fmt = 'MMM d, yyyy'): string {
  try {
    return format(parseISO(dateStr), fmt);
  } catch {
    return dateStr;
  }
}

export function estimateReadTime(content: string): number {
  const wpm = 200;
  const words = content.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / wpm));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export const categoryLabel: Record<string, string> = {
  web: 'Web',
  ai_ml: 'AI / ML',
  research: 'Research',
  open_source: 'Open Source',
  business: 'Business',
  engineering: 'Engineering',
  personal: 'Personal',
};

export const categoryColor: Record<string, string> = {
  business: 'text-amber-400 border-amber-400/25 bg-amber-400/5',
  engineering: 'text-sky-400 border-sky-400/25 bg-sky-400/5',
  research: 'text-violet-400 border-violet-400/25 bg-violet-400/5',
  personal: 'text-emerald-400 border-emerald-400/25 bg-emerald-400/5',
  web: 'text-sky-400 border-sky-400/25 bg-sky-400/5',
  ai_ml: 'text-violet-400 border-violet-400/25 bg-violet-400/5',
  open_source: 'text-emerald-400 border-emerald-400/25 bg-emerald-400/5',
};
