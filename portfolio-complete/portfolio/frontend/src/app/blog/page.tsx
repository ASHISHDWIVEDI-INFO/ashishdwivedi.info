import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Blog',
  description: 'Writing on AI, business, engineering, and the future of technology.',
};

const posts = [
  { slug: 'ai-in-business', title: 'How AI is reshaping the SaaS business model in 2025', excerpt: 'The SaaS landscape is undergoing a fundamental transformation. AI capabilities have moved from feature to foundation...', date: 'Apr 28, 2025', readTime: '7 min', category: 'Business' },
  { slug: 'nextjs-django', title: 'Production Next.js + Django architecture patterns', excerpt: 'After shipping 10+ Next.js+Django stacks to production, these are the patterns that actually hold under load...', date: 'Apr 12, 2025', readTime: '12 min', category: 'Engineering' },
  { slug: 'research-to-product', title: 'From research paper to shipped product: my workflow', excerpt: 'Bridging the academia-industry gap is harder than it looks. Here is the workflow I have refined over three papers...', date: 'Mar 30, 2025', readTime: '9 min', category: 'Research' },
  { slug: 'indie-saas-india', title: 'Building and selling indie SaaS from India', excerpt: 'The global SaaS market is increasingly accessible from India. What changed, what still needs work, and how I navigated it...', date: 'Mar 10, 2025', readTime: '11 min', category: 'Business' },
  { slug: 'mongodb-vs-postgres', title: 'MongoDB vs PostgreSQL for portfolio sites: a measured take', excerpt: 'Both are excellent databases. The real answer depends on your data shape, team, and future plans...', date: 'Feb 22, 2025', readTime: '8 min', category: 'Engineering' },
];

const categoryColors: Record<string, string> = {
  Business: 'text-amber-400 border-amber-400/30 bg-amber-400/5',
  Engineering: 'text-blue-400 border-blue-400/30 bg-blue-400/5',
  Research: 'text-purple-400 border-purple-400/30 bg-purple-400/5',
};

export default function BlogPage() {
  return (
    <div className="pt-28 pb-24 max-w-3xl mx-auto px-6">
      <div className="mb-12">
        <p className="text-accent font-mono text-sm tracking-widest mb-2">WRITING</p>
        <h1 className="font-display text-5xl md:text-6xl text-ink-50 font-light mb-4">Blog</h1>
        <p className="text-ink-400 text-lg">
          Thinking out loud on AI, business, engineering, and research.
        </p>
      </div>

      <div className="space-y-0 divide-y divide-surface-border">
        {posts.map(({ slug, title, excerpt, date, readTime, category }) => (
          <article key={slug} className="py-8 group">
            <div className="flex items-center gap-3 mb-3">
              <span className={`text-xs border px-2 py-0.5 rounded-full font-mono ${categoryColors[category] || 'text-ink-400 border-surface-border'}`}>
                {category}
              </span>
              <span className="text-ink-500 text-xs">{date} · {readTime} read</span>
            </div>
            <Link href={`/blog/${slug}`}>
              <h2 className="font-display text-2xl text-ink-100 group-hover:text-accent transition-colors mb-2 leading-snug">{title}</h2>
            </Link>
            <p className="text-ink-400 text-sm leading-relaxed mb-4">{excerpt}</p>
            <Link href={`/blog/${slug}`} className="text-xs text-ink-500 hover:text-accent transition-colors">
              Read more →
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
