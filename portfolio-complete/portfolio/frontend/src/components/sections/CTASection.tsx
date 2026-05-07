'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

export default function CTASection() {
  const { ref, inView } = useInView({ triggerOnce: true });

  return (
    <section ref={ref} className="py-24 border-t border-surface-border">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
        >
          <h2 className="font-display text-5xl md:text-6xl text-ink-50 font-light mb-4">
            Let&apos;s build something{' '}
            <span className="text-accent italic">remarkable</span>
          </h2>
          <p className="text-ink-400 text-lg mb-8">
            Open to consulting, research collaboration, and full-time opportunities.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/contact" className="px-8 py-3 bg-accent text-surface font-medium text-sm rounded hover:bg-accent-light transition-colors">
              Start a Conversation
            </Link>
            <a href="mailto:you@yourdomain.com" className="text-ink-400 hover:text-accent text-sm transition-colors">
              or email directly →
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
