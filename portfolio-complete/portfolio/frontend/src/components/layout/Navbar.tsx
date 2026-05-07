'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const links = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/projects', label: 'Projects' },
  { href: '/research', label: 'Research' },
  { href: '/blog', label: 'Blog' },
  { href: '/contact', label: 'Contact' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={clsx(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled ? 'bg-surface/90 backdrop-blur-md border-b border-surface-border' : 'bg-transparent'
    )}>
      <nav className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="font-display text-xl text-accent tracking-wide">
          YN<span className="text-ink-400">.</span>
        </Link>

        <ul className="hidden md:flex items-center gap-8">
          {links.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={clsx(
                  'text-sm tracking-wide transition-colors duration-200',
                  pathname === href ? 'text-accent' : 'text-ink-200 hover:text-accent'
                )}
              >
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="hidden md:flex items-center gap-4">
          <a
            href="/resume.pdf"
            download
            className="text-sm px-4 py-1.5 border border-accent/40 text-accent hover:bg-accent/10 rounded transition-colors"
          >
            Resume
          </a>
        </div>

        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-ink-200 hover:text-accent transition-colors"
          aria-label="Toggle menu"
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden bg-surface-card border-b border-surface-border"
          >
            <ul className="px-6 py-4 flex flex-col gap-4">
              {links.map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className={clsx(
                      'text-sm tracking-wide',
                      pathname === href ? 'text-accent' : 'text-ink-200'
                    )}
                  >
                    {label}
                  </Link>
                </li>
              ))}
              <li>
                <a href="/resume.pdf" download className="text-sm text-accent">Resume ↓</a>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
