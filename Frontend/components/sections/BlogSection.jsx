'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  Clock, Tag, ArrowRight, BookOpen,
  Search, Calendar, ChevronRight,
} from 'lucide-react';
import { blogAPI } from '@/lib/api';
import { getImageUrl, formatDate, truncate, timeAgo } from '@/lib/utils';

// ── Featured post (large spotlight card) ──────
function FeaturedPost({ post }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const cover  = post.coverImageFileId
    ? getImageUrl(post.coverImageFileId)
    : post.coverImageUrl || null;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className="col-span-full"
    >
      <Link href={`/blog/${post.slug}`}
        className="group grid grid-cols-1 lg:grid-cols-2 rounded-3xl border
                   border-purple-500/20 bg-white/3 hover:border-purple-500/40
                   overflow-hidden transition-all duration-300 hover:bg-white/5">

        {/* Cover image */}
        <div className="relative aspect-video lg:aspect-auto overflow-hidden
                        bg-purple-900/20 min-h-[200px]">
          {cover ? (
            <img src={cover} alt={post.title}
              className="w-full h-full object-cover transition-transform duration-700
                         group-hover:scale-105" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-16 h-16 text-purple-500/20" />
            </div>
          )}
          {/* Gradient */}
          <div className="absolute inset-0 pointer-events-none lg:hidden"
            style={{ background: 'linear-gradient(to top, rgba(7,7,26,.9) 0%, transparent 60%)' }} />
          {/* Featured badge */}
          <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1
                          rounded-full text-xs font-bold bg-purple-500/25 text-purple-300
                          border border-purple-500/30 backdrop-blur-sm">
            ✦ Featured
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col justify-center p-7 lg:p-10">
          {/* Category + date */}
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            {post.category && (
              <span className="text-xs font-semibold text-purple-400 bg-purple-400/10
                               border border-purple-400/20 px-2.5 py-1 rounded-full">
                {post.category}
              </span>
            )}
            <span className="flex items-center gap-1 text-xs text-purple-300/50">
              <Calendar className="w-3 h-3" />
              {post.publishedAt ? formatDate(post.publishedAt, 'dd MMM yyyy') : timeAgo(post.createdAt)}
            </span>
            <span className="flex items-center gap-1 text-xs text-purple-300/50">
              <Clock className="w-3 h-3" />{post.readingTime || 1} min read
            </span>
          </div>

          <h3 className="text-2xl font-bold text-white font-heading mb-3 leading-snug
                         group-hover:text-purple-200 transition-colors">
            {post.title}
          </h3>

          <p className="text-sm text-purple-200/65 leading-relaxed mb-5">
            {truncate(post.excerpt || '', 180)}
          </p>

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-6">
              {post.tags.slice(0, 5).map(t => (
                <span key={t}
                  className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/10
                             text-purple-300/60 border border-purple-500/15">
                  {t}
                </span>
              ))}
            </div>
          )}

          <span className="flex items-center gap-2 text-sm font-semibold text-purple-400
                           group-hover:text-purple-300 transition-colors">
            Read article <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

// ── Regular blog card ─────────────────────────
function BlogCard({ post, index }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });
  const cover  = post.coverImageFileId
    ? getImageUrl(post.coverImageFileId)
    : post.coverImageUrl || null;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <Link href={`/blog/${post.slug}`}
        className="group flex flex-col h-full rounded-2xl border border-purple-500/15
                   bg-white/3 overflow-hidden hover:border-purple-500/35
                   hover:bg-white/5 transition-all duration-300">

        {/* Cover */}
        <div className="relative aspect-video overflow-hidden bg-purple-900/20 shrink-0">
          {cover ? (
            <img src={cover} alt={post.title}
              className="w-full h-full object-cover transition-transform duration-500
                         group-hover:scale-108"
              style={{ transform: 'scale(1)' }}
              onMouseEnter={e => e.target.style.transform = 'scale(1.08)'}
              onMouseLeave={e => e.target.style.transform = 'scale(1)'}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-10 h-10 text-purple-500/20" />
            </div>
          )}
          {post.category && (
            <div className="absolute bottom-3 left-3 px-2 py-0.5 rounded-full text-[10px]
                            font-semibold bg-[#07071a]/90 text-purple-300
                            border border-purple-500/20 backdrop-blur-sm">
              {post.category}
            </div>
          )}
        </div>

        {/* Body */}
        <div className="flex flex-col flex-1 p-5">
          {/* Meta */}
          <div className="flex items-center gap-3 mb-2.5 text-xs text-purple-300/50">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {post.publishedAt
                ? formatDate(post.publishedAt, 'dd MMM yyyy')
                : timeAgo(post.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />{post.readingTime || 1} min
            </span>
          </div>

          <h3 className="text-sm font-bold text-white mb-2 leading-snug
                         group-hover:text-purple-200 transition-colors line-clamp-2">
            {post.title}
          </h3>

          <p className="text-xs text-purple-200/55 leading-relaxed mb-4 flex-1 line-clamp-3">
            {post.excerpt || ''}
          </p>

          {/* Tags */}
          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {post.tags.slice(0, 3).map(t => (
                <span key={t}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10
                             text-purple-300/55 border border-purple-500/15">
                  {t}
                </span>
              ))}
            </div>
          )}

          <span className="flex items-center gap-1.5 text-xs font-semibold text-purple-400/70
                           group-hover:text-purple-300 transition-colors mt-auto">
            Read more <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </span>
        </div>
      </Link>
    </motion.div>
  );
}

// ========================
// Blog Section
// ========================
export default function BlogSection() {
  const [posts,     setPosts]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [activeTag, setActiveTag] = useState('all');
  const [showAll,   setShowAll]   = useState(false);
  const VISIBLE = 6;

  useEffect(() => {
    (async () => {
      try {
        const res = await blogAPI.getAll({ published: 'true' });
        setPosts(res.data.data || []);
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  // Derive all unique tags
  const allTags = ['all', ...new Set(posts.flatMap(p => p.tags || []))].slice(0, 8);

  // Filter
  const filtered = posts.filter(p => {
    const matchTag = activeTag === 'all' || p.tags?.includes(activeTag);
    const matchSearch = !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.excerpt?.toLowerCase().includes(search.toLowerCase()) ||
      p.tags?.some(t => t.toLowerCase().includes(search.toLowerCase()));
    return matchTag && matchSearch;
  });

  // Featured = first featured post (only when no filters active)
  const featuredPost = activeTag === 'all' && !search
    ? filtered.find(p => p.featured)
    : null;

  const gridPosts  = featuredPost ? filtered.filter(p => p._id !== featuredPost._id) : filtered;
  const visible    = showAll ? gridPosts : gridPosts.slice(0, VISIBLE);

  return (
    <section id="blog" className="section-padding relative overflow-hidden">

      {/* bg accent */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] opacity-[0.04] rounded-full"
          style={{ background: 'radial-gradient(circle, #7C3AED 0%, transparent 65%)' }} />
      </div>

      <div className="container-custom">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block text-xs font-bold uppercase tracking-widest
                           text-purple-400 bg-purple-400/10 border border-purple-400/20
                           px-3 py-1.5 rounded-full mb-4">
            Blog & Insights
          </span>
          <h2 className="section-title">Thoughts & Articles</h2>
          <p className="section-subtitle">
            Writing about startups, engineering, cloud architecture,
            and the lessons learned building products.
          </p>
        </motion.div>

        {/* Search + tag filters */}
        {!loading && posts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="space-y-4 mb-10"
          >
            {/* Search */}
            <div className="relative max-w-md mx-auto">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4
                                  text-purple-400/50 pointer-events-none" />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setShowAll(false); }}
                placeholder="Search articles…"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white/5 border
                           border-purple-500/20 text-white placeholder-white/25
                           focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
              />
            </div>

            {/* Tag pills */}
            {allTags.length > 1 && (
              <div className="flex flex-wrap justify-center gap-2">
                {allTags.map(tag => (
                  <button
                    key={tag}
                    onClick={() => { setActiveTag(tag); setShowAll(false); }}
                    className={`relative px-3.5 py-1.5 rounded-full text-xs font-medium
                                transition-all duration-200 capitalize
                      ${activeTag === tag
                        ? 'text-white bg-purple-600/40 border border-purple-500/50'
                        : 'text-purple-300/60 border border-purple-500/15 hover:text-purple-200 hover:border-purple-500/35'
                      }`}
                  >
                    {tag === 'all' ? 'All posts' : `#${tag}`}
                    <span className="ml-1.5 text-[10px] opacity-60">
                      ({tag === 'all' ? posts.length : posts.filter(p => p.tags?.includes(tag)).length})
                    </span>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}

        {/* Posts grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3,4,5,6].map(i => (
              <div key={i}
                className="rounded-2xl bg-white/3 border border-purple-500/10 animate-pulse h-72" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-purple-300/40">
            <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">
              {search || activeTag !== 'all'
                ? 'No posts match your search'
                : 'No posts published yet'}
            </p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTag + search}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              {/* Featured spotlight */}
              {featuredPost && (
                <div className="grid grid-cols-1">
                  <FeaturedPost post={featuredPost} />
                </div>
              )}

              {/* Regular grid */}
              {visible.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {visible.map((post, i) => (
                    <BlogCard key={post._id} post={post} index={i} />
                  ))}
                </div>
              )}

              {/* Show more */}
              {gridPosts.length > VISIBLE && (
                <div className="flex justify-center pt-4">
                  <motion.button
                    onClick={() => setShowAll(s => !s)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold
                               border border-purple-500/30 text-purple-300 hover:bg-purple-500/15
                               transition-all"
                  >
                    {showAll
                      ? 'Show less'
                      : <><BookOpen className="w-4 h-4" />View all {gridPosts.length} articles <ArrowRight className="w-4 h-4" /></>
                    }
                  </motion.button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Stats */}
        {!loading && posts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-14 pt-8 border-t border-purple-500/10 flex flex-wrap
                       justify-center gap-8"
          >
            {[
              { label: 'Total Articles',  value: posts.length },
              { label: 'Total Read Time', value: `${posts.reduce((a, p) => a + (p.readingTime || 1), 0)} min` },
              { label: 'Categories',      value: [...new Set(posts.map(p => p.category).filter(Boolean))].length },
              { label: 'Tags',            value: [...new Set(posts.flatMap(p => p.tags || []))].length },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold text-white font-heading">{s.value}</p>
                <p className="text-xs text-purple-300/50 mt-0.5">{s.label}</p>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
