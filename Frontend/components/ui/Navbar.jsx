'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, Moon, Menu, X, Download } from 'lucide-react';
import { scrollToSection } from '@/lib/utils';

const NAV_LINKS = [
  { label: 'Home',         id: 'hero'         },
  { label: 'About',        id: 'about'        },
  { label: 'Startup',      id: 'startup'      },
  { label: 'Skills',       id: 'skills'       },
  { label: 'Experience',   id: 'experience'   },
  { label: 'Projects',     id: 'projects'     },
  { label: 'Achievements', id: 'achievements' },
  { label: 'Blog',         id: 'blog'         },
  { label: 'Contact',      id: 'contact'      },
];

export default function Navbar({ resumeUrl }) {
  const { theme, setTheme } = useTheme();
  const [mounted,    setMounted]    = useState(false);
  const [scrolled,   setScrolled]   = useState(false);
  const [activeId,   setActiveId]   = useState('hero');
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // ── Scroll shrink effect ──────────────────
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Active section highlight via IntersectionObserver ──
  useEffect(() => {
    const observers = [];
    NAV_LINKS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveId(id); },
        { rootMargin: '-40% 0px -55% 0px' }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach(o => o.disconnect());
  }, []);

  const handleNav = (id) => {
    scrollToSection(id);
    setMobileOpen(false);
  };

  return (
    <>
      <motion.header
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300
          ${scrolled ? 'py-2' : 'py-3'}`}
      >
        <div
          className={`mx-auto max-w-6xl px-4 sm:px-6 flex items-center justify-between
                      rounded-2xl transition-all duration-300
            ${scrolled
              ? 'backdrop-blur-xl border border-purple-500/15 shadow-lg shadow-black/20'
              : 'bg-transparent'
            }`}
          style={scrolled ? {
            background: 'rgba(7, 7, 26, 0.85)',
          } : {}}
        >
          {/* Logo */}
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => handleNav('hero')}
            className="flex items-center gap-2.5 py-2.5"
          >
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white
                         font-bold text-sm font-heading"
              style={{ background: 'linear-gradient(135deg, #7C3AED, #06b6d4)' }}
            >
              AD
            </div>
            <span className="hidden sm:block text-sm font-bold text-white font-heading">
              Ashish<span className="text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(135deg,#7C3AED,#06b6d4)' }}
              > Dwivedi</span>
            </span>
          </motion.button>

          {/* Desktop nav links */}
          <nav className="hidden lg:flex items-center gap-0.5" aria-label="Main navigation">
            {NAV_LINKS.map(({ label, id }) => (
              <button
                key={id}
                onClick={() => handleNav(id)}
                className={`relative px-3 py-1.5 text-sm font-medium rounded-lg
                             transition-colors duration-200
                  ${activeId === id
                    ? 'text-white'
                    : 'text-purple-300/60 hover:text-white'
                  }`}
              >
                {activeId === id && (
                  <motion.span
                    layoutId="navPill"
                    className="absolute inset-0 rounded-lg"
                    style={{ background: 'rgba(124,58,237,0.2)' }}
                    transition={{ type: 'spring', bounce: 0.25, duration: 0.4 }}
                  />
                )}
                <span className="relative z-10">{label}</span>
              </button>
            ))}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2 py-2">
            {/* Theme toggle */}
            {mounted && (
              <motion.button
                whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-lg hover:bg-white/8 text-purple-300/60
                           hover:text-purple-300 transition-colors"
                aria-label="Toggle theme"
              >
                {theme === 'dark'
                  ? <Sun className="w-4 h-4" />
                  : <Moon className="w-4 h-4" />
                }
              </motion.button>
            )}

            {/* Resume CTA */}
            {resumeUrl && (
              <motion.a
                whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                href={resumeUrl}
                target="_blank"
                rel="noreferrer"
                className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl
                           text-xs font-semibold border border-purple-500/30 text-purple-300
                           hover:bg-purple-500/15 transition-all"
              >
                <Download className="w-3.5 h-3.5" />Resume
              </motion.a>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              className="lg:hidden p-2 rounded-lg hover:bg-white/8 text-purple-300/60
                         hover:text-purple-300 transition-colors"
              aria-label="Open menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.nav
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-64 z-50 flex flex-col
                         border-l border-purple-500/15 lg:hidden"
              style={{ background: 'rgba(7,7,26,0.98)', backdropFilter: 'blur(20px)' }}
            >
              <div className="flex items-center justify-between p-4 border-b border-purple-500/10">
                <span className="text-sm font-bold text-white">Menu</span>
                <button onClick={() => setMobileOpen(false)}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-purple-400/60
                             hover:text-purple-300 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
                {NAV_LINKS.map(({ label, id }) => (
                  <button key={id} onClick={() => handleNav(id)}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-medium
                                transition-all
                      ${activeId === id
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/20'
                        : 'text-purple-300/60 hover:text-white hover:bg-white/5'
                      }`}>
                    {label}
                  </button>
                ))}
              </div>
              {resumeUrl && (
                <div className="p-4 border-t border-purple-500/10">
                  <a href={resumeUrl} target="_blank" rel="noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl
                               text-sm font-semibold border border-purple-500/30 text-purple-300
                               hover:bg-purple-500/15 transition-all">
                    <Download className="w-4 h-4" />Download Resume
                  </a>
                </div>
              )}
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
