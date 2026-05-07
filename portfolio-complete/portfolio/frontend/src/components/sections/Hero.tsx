'use client';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowDown, Github, Linkedin } from 'lucide-react';

const roles = ['Full-Stack Developer', 'AI Researcher', 'Business Builder', 'Open-Source Contributor'];

export default function Hero() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (!cursorRef.current) return;
      cursorRef.current.style.left = e.clientX + 'px';
      cursorRef.current.style.top = e.clientY + 'px';
    };
    window.addEventListener('mousemove', move);
    return () => window.removeEventListener('mousemove', move);
  }, []);

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Spotlight cursor glow */}
      <div
        ref={cursorRef}
        className="pointer-events-none fixed z-10 w-96 h-96 -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          background: 'radial-gradient(circle, rgba(200,169,110,0.08) 0%, transparent 70%)',
          transition: 'left 0.1s ease, top 0.1s ease',
        }}
      />

      {/* Ambient background elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-accent/5 blur-3xl animate-glow" />
        <div className="absolute bottom-1/3 right-1/4 w-48 h-48 rounded-full bg-accent/3 blur-3xl animate-glow" style={{ animationDelay: '1.5s' }} />
        {/* Decorative grid */}
        <div className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'linear-gradient(rgba(200,169,110,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(200,169,110,0.3) 1px, transparent 1px)',
            backgroundSize: '60px 60px',
          }}
        />
      </div>

      <div className="relative z-20 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-4"
        >
          <span className="inline-block text-accent font-mono text-sm tracking-widest border border-accent/20 px-4 py-1 rounded-full">
            Available for opportunities
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="font-display text-6xl md:text-8xl font-light text-ink-50 mb-4 leading-none tracking-tight"
        >
          Hi, I'm{' '}
          <span className="text-accent italic">Your Name</span>
        </motion.h1>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex items-center justify-center gap-3 mb-8 flex-wrap"
        >
          {roles.map((role, i) => (
            <span key={role} className="flex items-center gap-3">
              <span className="text-ink-300 text-lg">{role}</span>
              {i < roles.length - 1 && <span className="text-accent/40">·</span>}
            </span>
          ))}
        </motion.div>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="text-ink-300 text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          I build production-grade web applications, publish AI research, and write about the business of technology. 
          Based in <span className="text-accent">Delhi, India</span>.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="flex items-center justify-center gap-4 flex-wrap"
        >
          <Link
            href="/projects"
            className="px-8 py-3 bg-accent text-surface font-medium text-sm tracking-wide rounded hover:bg-accent-light transition-colors"
          >
            View Projects
          </Link>
          <Link
            href="/contact"
            className="px-8 py-3 border border-ink-600 text-ink-200 hover:border-accent hover:text-accent text-sm tracking-wide rounded transition-colors"
          >
            Get in Touch
          </Link>
          <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer"
            className="p-3 border border-ink-700 text-ink-400 hover:text-accent hover:border-accent rounded transition-colors">
            <Github size={18} />
          </a>
          <a href="https://linkedin.com/in/yourusername" target="_blank" rel="noopener noreferrer"
            className="p-3 border border-ink-700 text-ink-400 hover:text-accent hover:border-accent rounded transition-colors">
            <Linkedin size={18} />
          </a>
        </motion.div>
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
        <motion.div
          animate={{ y: [0, 6, 0] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        >
          <ArrowDown size={18} className="text-ink-500" />
        </motion.div>
      </div>

      <div className="glow-line" />
    </section>
  );
}
