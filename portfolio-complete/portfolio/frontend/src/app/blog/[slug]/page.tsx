import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Clock, Calendar, Tag } from 'lucide-react';
import { formatDate, categoryColor } from '@/lib/utils';

const POSTS: Record<string, {
  slug: string; title: string; excerpt: string; content: string;
  category: string; tags: string[]; read_time: number; created_at: string;
}> = {
  'ai-in-business': {
    slug: 'ai-in-business',
    title: 'How AI is reshaping the SaaS business model in 2025',
    excerpt: 'The SaaS landscape is undergoing a fundamental transformation.',
    content: `The SaaS business model that dominated the 2010s — seat-based pricing, annual contracts, feature-gated tiers — is under genuine pressure. Not from competition or market saturation, but from a structural shift in how software delivers value.

## From seats to outcomes

For most of the last decade, SaaS pricing correlated with usage in a loose way. More users meant more seats, which meant more revenue. The metric was a proxy for value, and it worked well enough.

AI changes the unit economics fundamentally. A single AI agent can do the work previously requiring multiple users. The seat model breaks down when one AI "user" can process 10,000 requests overnight.

The companies navigating this well are pivoting to **outcome-based pricing** — charging per task completed, per document processed, per prediction made. This aligns revenue with value delivered rather than access granted.

## What this means for builders

If you're building a SaaS product today, the questions you need to answer are:

- What outcome does my customer care about?
- Can I reliably measure delivery of that outcome?
- Is outcome-based pricing feasible at my margin?

For most B2B SaaS, the answer to all three is increasingly yes. Analytics tooling, HR platforms, and developer tools are all actively re-evaluating their pricing models.

## The Indian SaaS opportunity

This shift creates a particular opportunity for Indian SaaS builders. India has historically competed on cost — building comparable products at lower price points. But outcome-based pricing commoditises the cost advantage somewhat. What matters now is whether you can deliver a measurable outcome reliably.

Where Indian SaaS companies often win is in **domain specificity** — deep integrations with local regulatory frameworks, regional languages, and sector-specific workflows. That domain knowledge is hard to replicate and creates genuine moats.

## Practical takeaways

Start tracking your customers' outcomes, not just their usage, even before you change your pricing. Outcome data is the foundation for the pricing conversation. If you can show a customer that your tool saved 40 hours of work this month, you have far more pricing power than a seat count can ever give you.`,
    category: 'business',
    tags: ['SaaS', 'AI', 'Pricing', 'Business Strategy'],
    read_time: 7,
    created_at: '2025-04-28T10:00:00Z',
  },
  'nextjs-django': {
    slug: 'nextjs-django',
    title: 'Production Next.js + Django architecture patterns',
    excerpt: 'After shipping 10+ Next.js+Django stacks, these patterns hold under load.',
    content: `After shipping a dozen or so Next.js + Django applications to production — ranging from simple portfolios to multi-tenant SaaS platforms handling millions of requests — I've developed strong opinions about what works and what breaks.

## The case for the pairing

Next.js and Django are not an obvious combination. Next.js is the React meta-framework of choice; Django is a Python web framework from 2005. But they complement each other almost perfectly:

- Django's ORM, admin panel, and authentication are production-proven and boring in the best way
- Next.js handles the modern frontend concerns (SSR, ISR, streaming, image optimisation) without asking you to reinvent routing
- Python's ML ecosystem (PyTorch, Hugging Face, scikit-learn) integrates naturally with Django, so adding AI features doesn't require a separate service

## Pattern 1: Clean API boundary

The most important decision is keeping the Django REST API completely stateless. No session-based auth in the API routes. Use JWT (I prefer django-rest-framework-simplejwt) and keep tokens short-lived.

Next.js handles session storage via httpOnly cookies managed by a /api/auth route handler on the Node side. Django never sees the cookie — it only sees the Bearer token.

## Pattern 2: Server components for data fetching

With Next.js 14's app router, fetch your Django API data in Server Components directly. This gives you:

- No client-side loading spinners for initial page load
- Data fetching that happens in the same datacenter as your Django server
- Automatic caching via Next.js fetch deduplication

## Pattern 3: Background jobs with Celery

Django handles HTTP, Celery handles everything else. Email sending, PDF generation, ML inference, webhook delivery — all go into Celery tasks. This keeps response times fast and gives you retry logic for free.

Redis works well as both the Celery broker and Django's cache layer.

## What breaks at scale

The most common failure I see is over-fetching in getServerSideProps. If you're making 5 API calls to render a single page, consider whether GraphQL (with Strawberry for Django) would serve you better than REST.

The second failure mode is deploying Next.js and Django on separate servers without a shared cache. You end up with thundering herd problems on the Django side. Use Redis and be explicit about cache-control headers.`,
    category: 'engineering',
    tags: ['Next.js', 'Django', 'Architecture', 'Full-Stack'],
    read_time: 12,
    created_at: '2025-04-12T10:00:00Z',
  },
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const post = POSTS[params.slug];
  if (!post) return { title: 'Post Not Found' };
  return { title: post.title, description: post.excerpt };
}

function renderContent(content: string) {
  return content
    .replace(/^## (.+)$/gm, '<h2 class="font-display text-2xl text-ink-100 font-light mt-12 mb-4">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-ink-200 font-medium">$1</strong>')
    .replace(/`(.+?)`/g, '<code class="text-accent font-mono text-sm bg-surface-card px-1.5 py-0.5 rounded">$1</code>')
    .replace(/^- (.+)$/gm, '<li class="text-ink-300 ml-5 list-disc mb-2">$1</li>')
    .split('\n\n')
    .map(para => para.startsWith('<') ? para : `<p class="text-ink-300 leading-relaxed mb-5">${para}</p>`)
    .join('\n');
}

export default function BlogPostPage({ params }: { params: { slug: string } }) {
  const post = POSTS[params.slug];
  if (!post) notFound();

  return (
    <div className="pt-28 pb-24 max-w-2xl mx-auto px-6">
      <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-ink-500 hover:text-accent transition-colors mb-10">
        <ArrowLeft size={14} /> All Posts
      </Link>

      <article>
        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4 flex-wrap">
            <span className={`text-xs border px-2 py-0.5 rounded-full font-mono ${categoryColor[post.category] || ''}`}>
              {post.category}
            </span>
            <span className="text-ink-500 text-xs flex items-center gap-1">
              <Calendar size={11} />{formatDate(post.created_at)}
            </span>
            <span className="text-ink-500 text-xs flex items-center gap-1">
              <Clock size={11} />{post.read_time} min read
            </span>
          </div>

          <h1 className="font-display text-4xl md:text-5xl text-ink-50 font-light leading-tight mb-6">
            {post.title}
          </h1>

          <p className="text-ink-300 text-lg leading-relaxed border-l-2 border-accent/40 pl-4">
            {post.excerpt}
          </p>
        </header>

        <div
          className="article-body"
          dangerouslySetInnerHTML={{ __html: renderContent(post.content) }}
        />

        <footer className="mt-12 pt-8 border-t border-surface-border">
          <div className="flex flex-wrap gap-2">
            {post.tags.map(t => (
              <span key={t} className="flex items-center gap-1.5 text-xs text-ink-500 border border-surface-border px-3 py-1 rounded-full">
                <Tag size={10} />{t}
              </span>
            ))}
          </div>
        </footer>
      </article>
    </div>
  );
}
