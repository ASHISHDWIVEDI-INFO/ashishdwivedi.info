'use client';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { ArrowRight } from 'lucide-react';

const posts = [
  { slug: 'ai-in-business', title: 'How AI is reshaping the SaaS business model', date: 'Apr 28, 2025', readTime: '7 min', category: 'Business' },
  { slug: 'nextjs-django', title: 'Production Next.js + Django architecture patterns', date: 'Apr 12, 2025', readTime: '12 min', category: 'Engineering' },
  { slug: 'research-to-product', title: 'From research paper to shipped product: my workflow', date: 'Mar 30, 2025', readTime: '9 min', category: 'Research' },
];

export function RecentPosts() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section ref={ref} className="py-24 max-w-5xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        className="flex items-end justify-between mb-10"
      >
        <div>
          <p className="text-accent font-mono text-sm tracking-widest mb-2">WRITING</p>
          <h2 className="font-display text-4xl text-ink-50 font-light">Recent Posts</h2>
        </div>
        <Link href="/blog" className="hidden md:flex items-center gap-2 text-sm text-ink-400 hover:text-accent transition-colors">
          All Posts <ArrowRight size={14} />
        </Link>
      </motion.div>

      <div className="divide-y divide-surface-border">
        {posts.map(({ slug, title, date, readTime, category }, i) => (
          <motion.article
            key={slug}
            initial={{ opacity: 0, x: -20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: i * 0.1 }}
          >
            <Link href={`/blog/${slug}`} className="flex items-center justify-between py-5 group">
              <div className="flex items-start gap-4">
                <span className="text-xs text-accent font-mono border border-accent/20 px-2 py-0.5 rounded-full mt-1 hidden sm:block">
                  {category}
                </span>
                <div>
                  <h3 className="text-ink-100 group-hover:text-accent transition-colors">{title}</h3>
                  <p className="text-ink-500 text-sm mt-1">{date} · {readTime} read</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-ink-600 group-hover:text-accent group-hover:translate-x-1 transition-all flex-shrink-0 ml-4" />
            </Link>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

export function CTASection() {
  const { ref, inView } = useInView({ triggerOnce: true });

  return (
    <section ref={ref} className="py-24 border-t border-surface-border">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
        >
          <h2 className="font-display text-5xl md:text-6xl text-ink-50 font-light mb-4">
            Let's build something{' '}
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

export default RecentPosts;
