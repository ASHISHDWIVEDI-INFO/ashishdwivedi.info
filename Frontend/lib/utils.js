import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow } from 'date-fns';

// ========================
// Tailwind class merger
// ========================
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// ========================
// Date Formatters
// ========================
export function formatDate(date, pattern = 'MMM dd, yyyy') {
  if (!date) return '';
  return format(new Date(date), pattern);
}

export function timeAgo(date) {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
}

export function formatYear(date) {
  if (!date) return '';
  return format(new Date(date), 'yyyy');
}

// ========================
// Text Utilities
// ========================
export function truncate(str, length = 100) {
  if (!str) return '';
  return str.length > length ? `${str.substring(0, length)}...` : str;
}

export function capitalize(str) {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function slugify(str) {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function stripHtml(html) {
  return html ? html.replace(/<[^>]*>/g, '') : '';
}

// ========================
// Number Formatters
// ========================
export function formatNumber(num) {
  if (!num) return '0';
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toString();
}

export function formatPercentage(value, total) {
  if (!total || total === 0) return '0%';
  return `${Math.round((value / total) * 100)}%`;
}

// ========================
// Validation Utilities
// ========================
export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function isValidUrl(url) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// ========================
// Performance Utilities
// ========================
export function debounce(fn, delay = 300) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delay);
  };
}

export function throttle(fn, delay = 100) {
  let lastCall = 0;
  return (...args) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  };
}

// ========================
// Storage Utilities (safe)
// ========================
export function getStorage(key) {
  try {
    if (typeof window === 'undefined') return null;
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : null;
  } catch {
    return null;
  }
}

export function setStorage(key, value) {
  try {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error('localStorage error:', err);
  }
}

export function removeStorage(key) {
  try {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(key);
  } catch {}
}

// ========================
// Image URL Helper
// ========================
export function getImageUrl(fileId) {
  if (!fileId) return '/placeholder.png';
  if (fileId.startsWith('http')) return fileId;
  return `${process.env.NEXT_PUBLIC_API_URL}/media/${fileId}`;
}

// ========================
// Scroll Utilities
// ========================
export function scrollToSection(id) {
  const el = document.getElementById(id);
  if (el) {
    const offset = 80;
    const top = el.getBoundingClientRect().top + window.pageYOffset - offset;
    window.scrollTo({ top, behavior: 'smooth' });
  }
}

// ========================
// Error Message Extractor
// ========================
export function getErrorMessage(error) {
  return (
    error?.response?.data?.message ||
    error?.message ||
    'Something went wrong. Please try again.'
  );
}

// ========================
// Generate Initials
// ========================
export function getInitials(name = '') {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
