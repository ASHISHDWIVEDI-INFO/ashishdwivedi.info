'use client';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';

const stats = [
  { value: '50+', label: 'Projects Shipped' },
  { value: '8', label: 'Research Papers' },
  { value: '3', label: 'Startups Built' },
  { value: '12K+', label: 'GitHub Stars' },
];

export default function StatsSection() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.2 });

  return (
    <section ref={ref} className="py-16 border-y border-surface-border">
      <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map(({ value, label }, i) => (
          <motion.div
            key={label}
            initial={{ opacity: 0, y: 20 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            className="text-center"
          >
            <p className="font-display text-4xl text-accent font-light">{value}</p>
            <p className="text-ink-400 text-sm mt-1 tracking-wide">{label}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
