import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, Clock, ArrowLeft, Tag } from 'lucide-react';
import { formatDate } from '@/lib/utils';

// ── Fetch single post ─────────────────────────
async function getPost(slug) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/blog/${slug}`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.data || null;
  } catch { return null; }
}

// ── Fetch related posts ───────────────────────
async function getRelated(category, currentId) {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/blog?published=true&limit=3`,
      { next: { revalidate: 60 } }
    );
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data || []).filter(p => p._id !== currentId).slice(0, 3);
  } catch { return []; }
}

// ── SEO metadata ──────────────────────────────
export async function generateMetadata({ params }) {
  const post = await getPost(params.slug);
  if (!post) return { title: 'Post not found' };
  return {
    title:       post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || '',
    openGraph: {
      title:       post.title,
      description: post.excerpt || '',
      type:        'article',
      publishedTime: post.publishedAt,
      images: post.coverUrl ? [{ url: post.coverUrl }] : [],
    },
  };
}

// ========================
// Blog Detail Page
// ========================
export default async function BlogDetailPage({ params }) {
  const post = await getPost(params.slug);
  if (!post) notFound();

  const related = await getRelated(post.category, post._id);
  const cover   = post.coverUrl || null;

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg-primary, #07071a)' }}>

      {/* ── Hero / Cover ── */}
      {cover && (
        <div className="relative h-64 sm:h-80 lg:h-96 overflow-hidden">
          <img src={cover} alt={post.title}
            className="w-full h-full object-cover" />
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, rgba(7,7,26,.3) 0%, rgba(7,7,26,.95) 100%)' }} />
        </div>
      )}

      {/* ── Article ── */}
      <div className="container-custom py-12 lg:py-16 max-w-4xl">

        {/* Back link */}
        <Link href="/#blog"
          className="inline-flex items-center gap-2 text-sm text-purple-400/70
                     hover:text-purple-300 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" />Back to blog
        </Link>

        {/* Header */}
        <header className="mb-10">
          {post.category && (
            <span className="inline-block text-xs font-bold uppercase tracking-widest
                             text-purple-400 bg-purple-400/10 border border-purple-400/20
                             px-3 py-1.5 rounded-full mb-4">
              {post.category}
            </span>
          )}

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white font-heading
                         leading-tight mb-5">
            {post.title}
          </h1>

          {post.excerpt && (
            <p className="text-lg text-purple-200/70 leading-relaxed mb-6">{post.excerpt}</p>
          )}

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-4 text-sm text-purple-300/60
                          pb-6 border-b border-purple-500/15">
            <span className="flex items-center gap-1.5">
              <div className="w-7 h-7 rounded-full bg-purple-600/30 border border-purple-500/30
                              flex items-center justify-center text-xs font-bold text-purple-300">
                {post.author?.charAt(0) || 'A'}
              </div>
              {post.author || 'Ashish Dwivedi'}
            </span>
            {post.publishedAt && (
              <span className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4" />
                {formatDate(post.publishedAt, 'dd MMMM yyyy')}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {post.readingTime || 1} min read
            </span>
            {post.views > 0 && (
              <span className="text-purple-300/40">{post.views} views</span>
            )}
          </div>
        </header>

        {/* Article content */}
        <article
          className="prose prose-invert prose-purple max-w-none
                     prose-headings:font-heading prose-headings:text-white
                     prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
                     prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
                     prose-p:text-purple-100/75 prose-p:leading-relaxed prose-p:my-4
                     prose-a:text-purple-400 prose-a:no-underline hover:prose-a:text-purple-300
                     prose-strong:text-white prose-strong:font-semibold
                     prose-code:text-purple-300 prose-code:bg-purple-500/15
                     prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
                     prose-pre:bg-white/5 prose-pre:border prose-pre:border-purple-500/20
                     prose-pre:rounded-2xl prose-pre:p-5
                     prose-blockquote:border-l-purple-500 prose-blockquote:text-purple-200/70
                     prose-ul:text-purple-100/75 prose-ol:text-purple-100/75
                     prose-li:my-1 prose-img:rounded-2xl"
          dangerouslySetInnerHTML={{ __html: post.content || '<p>No content yet.</p>' }}
        />

        {/* Tags */}
        {post.tags?.length > 0 && (
          <div className="mt-10 pt-8 border-t border-purple-500/10">
            <div className="flex items-center gap-2 flex-wrap">
              <Tag className="w-4 h-4 text-purple-400/50" />
              {post.tags.map(t => (
                <span key={t}
                  className="text-xs px-3 py-1 rounded-full bg-purple-500/10
                             text-purple-300/70 border border-purple-500/15">
                  #{t}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Author card */}
        <div className="mt-10 p-6 rounded-2xl border border-purple-500/15 bg-white/3">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-600/30 border border-purple-500/30
                            flex items-center justify-center text-xl font-bold text-purple-300 shrink-0">
              {post.author?.charAt(0) || 'A'}
            </div>
            <div>
              <p className="text-base font-bold text-white">{post.author || 'Ashish Dwivedi'}</p>
              <p className="text-sm text-purple-300/60">
                Founder · Software Engineer · Entrepreneur
              </p>
            </div>
          </div>
        </div>

        {/* Related posts */}
        {related.length > 0 && (
          <div className="mt-14">
            <h2 className="text-xl font-bold text-white font-heading mb-6">More Articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {related.map(p => {
                const rcover = p.coverUrl || null;
                return (
                  <Link key={p._id} href={`/blog/${p.slug}`}
                    className="group flex flex-col rounded-2xl border border-purple-500/15
                               bg-white/3 overflow-hidden hover:border-purple-500/30
                               transition-all duration-200">
                    <div className="aspect-video overflow-hidden bg-purple-900/20">
                      {rcover
                        ? <img src={rcover} alt={p.title}
                            className="w-full h-full object-cover group-hover:scale-105
                                       transition-transform duration-500" />
                        : <div className="w-full h-full flex items-center justify-center">
                            <BookOpen className="w-8 h-8 text-purple-500/20" />
                          </div>
                      }
                    </div>
                    <div className="p-4">
                      <p className="text-xs text-purple-300/50 mb-1.5 flex items-center gap-1">
                        <Clock className="w-3 h-3" />{p.readingTime || 1} min
                      </p>
                      <h3 className="text-sm font-semibold text-white line-clamp-2
                                     group-hover:text-purple-200 transition-colors">
                        {p.title}
                      </h3>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* Back CTA */}
        <div className="mt-12 text-center">
          <Link href="/#blog"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm
                       font-semibold border border-purple-500/30 text-purple-300
                       hover:bg-purple-500/15 transition-all">
            <ArrowLeft className="w-4 h-4" />All articles
          </Link>
        </div>
      </div>
    </main>
  );
}
