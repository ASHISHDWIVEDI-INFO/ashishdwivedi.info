'use client';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';

interface FadeUpProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
  once?: boolean;
}

export default function FadeUp({ children, delay = 0, className = '', once = true }: FadeUpProps) {
  const { ref, inView } = useInView({ triggerOnce: once, threshold: 0.1 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
