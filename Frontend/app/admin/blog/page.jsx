'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Eye, EyeOff, Star, StarOff,
  Trash2, Pencil, Loader2, BookOpen, RefreshCw,
  Clock, BarChart2,
} from 'lucide-react';
import { blogAPI } from '@/lib/api';
import { formatDate, timeAgo, truncate, getErrorMessage, getImageUrl } from '@/lib/utils';
import toast from 'react-hot-toast';

// ── Delete confirm modal ──────────────────────
function DeleteModal({ post, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <motion.div initial={{ scale:.9, opacity:0 }} animate={{ scale:1, opacity:1 }}
        className="bg-[#0d0d28] border border-red-500/25 rounded-2xl p-6 max-w-sm w-full">
        <div className="w-12 h-12 rounded-xl bg-red-500/15 flex items-center justify-center mb-4">
          <Trash2 className="w-6 h-6 text-red-400" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">Delete post?</h3>
        <p className="text-sm text-purple-300/60 mb-6">
          "<span className="text-white font-medium">{post.title}</span>" will be permanently deleted.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-purple-500/20
                       text-purple-300 hover:bg-purple-500/10 transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-red-500/20
                       border border-red-500/30 text-red-400 hover:bg-red-500/30
                       transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminBlogPage() {
  const [posts,    setPosts]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [category, setCategory] = useState('all');
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toggling, setToggling] = useState({});
  const [categories, setCategories] = useState([]);

  const fetchPosts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await blogAPI.getAll({ limit: 100 });
      setPosts(res.data.data || []);
      setCategories(res.data.categories || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  const filtered = posts.filter(p => {
    const matchSearch   = !search || p.title.toLowerCase().includes(search.toLowerCase());
    const matchCategory = category === 'all' || p.category === category;
    return matchSearch && matchCategory;
  });

  // ── Toggle publish ────────────────────────
  const handlePublish = async (post) => {
    setToggling(t => ({ ...t, [post._id + 'p']: true }));
    try {
      await blogAPI.publish(post._id);
      setPosts(ps => ps.map(p =>
        p._id === post._id ? { ...p, published: !p.published } : p
      ));
      toast.success(post.published ? 'Post unpublished' : 'Post published ✓');
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setToggling(t => ({ ...t, [post._id + 'p']: false })); }
  };

  // ── Toggle featured ───────────────────────
  const handleFeatured = async (post) => {
    setToggling(t => ({ ...t, [post._id + 'f']: true }));
    try {
      await blogAPI.update(post._id, { featured: !post.featured });
      setPosts(ps => ps.map(p =>
        p._id === post._id ? { ...p, featured: !p.featured } : p
      ));
      toast.success(post.featured ? 'Removed from featured' : 'Marked featured ⭐');
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setToggling(t => ({ ...t, [post._id + 'f']: false })); }
  };

  // ── Delete ────────────────────────────────
  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await blogAPI.delete(toDelete._id);
      setPosts(ps => ps.filter(p => p._id !== toDelete._id));
      toast.success('Post deleted.');
      setToDelete(null);
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setDeleting(false); }
  };

  const publishedCount = posts.filter(p => p.published).length;

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-12">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white font-heading">Blog Posts</h1>
          <p className="text-sm text-purple-300/60 mt-0.5">
            {posts.length} posts · {publishedCount} published
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchPosts}
            className="p-2.5 rounded-xl border border-purple-500/20 text-purple-400/60
                       hover:text-purple-300 hover:bg-purple-500/10 transition-all">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link href="/admin/blog/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                       text-white" style={{ background: 'linear-gradient(135deg,#7C3AED,#6d28d9)' }}>
            <Plus className="w-4 h-4" />New Post
          </Link>
        </div>
      </div>

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/50" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search posts…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white/5 border
                       border-purple-500/20 text-white placeholder-white/25 focus:outline-none
                       focus:ring-2 focus:ring-purple-500/50 transition-all" />
        </div>
        <select value={category} onChange={e => setCategory(e.target.value)}
          className="px-3 py-2.5 rounded-xl text-sm bg-white/5 border border-purple-500/20
                     text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50">
          <option value="all" className="bg-gray-900">All categories</option>
          {categories.map(c => (
            <option key={c} value={c} className="bg-gray-900">{c}</option>
          ))}
        </select>
      </div>

      {/* Posts list */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 rounded-2xl
                        border border-dashed border-purple-500/20">
          <BookOpen className="w-10 h-10 text-purple-500/30 mb-3" />
          <p className="text-sm text-purple-300/50">
            {search ? 'No posts match your search' : 'No blog posts yet'}
          </p>
          {!search && (
            <Link href="/admin/blog/new"
              className="mt-3 text-xs text-purple-400 hover:text-purple-300 underline">
              Write your first post →
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <AnimatePresence>
            {filtered.map((post, i) => (
              <motion.div key={post._id}
                initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
                exit={{ opacity:0, scale:.97 }} transition={{ delay: i * 0.03 }}
                className={`flex items-start gap-4 p-4 rounded-2xl border transition-all
                  ${post.published
                    ? 'border-purple-500/15 bg-white/3 hover:border-purple-500/25'
                    : 'border-dashed border-purple-500/10 bg-white/1 opacity-70'
                  }`}
              >
                {/* Cover thumbnail */}
                <div className="w-16 h-14 rounded-xl overflow-hidden bg-purple-900/20
                                border border-purple-500/10 shrink-0 flex items-center justify-center">
                  {post.coverImageFileId ? (
                    <img src={getImageUrl(post.coverImageFileId)} alt=""
                      className="w-full h-full object-cover" />
                  ) : post.coverImageUrl ? (
                    <img src={post.coverImageUrl} alt=""
                      className="w-full h-full object-cover" />
                  ) : (
                    <BookOpen className="w-6 h-6 text-purple-500/30" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <h3 className="text-sm font-semibold text-white truncate">{post.title}</h3>
                    {post.featured && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400/15
                                       text-amber-400 border border-amber-400/20">⭐ Featured</span>
                    )}
                    {!post.published && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-500/15
                                       text-gray-400 border border-gray-400/20">Draft</span>
                    )}
                  </div>

                  <p className="text-xs text-purple-300/50 mb-1.5 line-clamp-1">
                    {truncate(post.excerpt, 100)}
                  </p>

                  <div className="flex items-center gap-3 flex-wrap text-[11px] text-purple-300/40">
                    {post.category && (
                      <span className="px-2 py-0.5 rounded-full bg-purple-500/10
                                       text-purple-300/60 border border-purple-500/15">
                        {post.category}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />{post.readTime || 1} min read
                    </span>
                    <span className="flex items-center gap-1">
                      <BarChart2 className="w-3 h-3" />{post.views || 0} views
                    </span>
                    <span>{post.publishedAt ? formatDate(post.publishedAt, 'dd MMM yyyy') : timeAgo(post.createdAt)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1 shrink-0">
                  <Link href={`/admin/blog/${post._id}`}
                    className="p-2 rounded-lg hover:bg-purple-500/15 text-purple-400/60
                               hover:text-purple-300 transition-all" title="Edit">
                    <Pencil className="w-4 h-4" />
                  </Link>

                  <button onClick={() => handleFeatured(post)}
                    disabled={toggling[post._id + 'f']}
                    className={`p-2 rounded-lg transition-all disabled:opacity-50
                      ${post.featured
                        ? 'bg-amber-400/15 text-amber-400'
                        : 'text-purple-400/40 hover:text-amber-400 hover:bg-amber-400/10'
                      }`}>
                    {toggling[post._id + 'f']
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : post.featured ? <Star className="w-4 h-4" /> : <StarOff className="w-4 h-4" />
                    }
                  </button>

                  <button onClick={() => handlePublish(post)}
                    disabled={toggling[post._id + 'p']}
                    className={`p-2 rounded-lg transition-all disabled:opacity-50
                      ${post.published
                        ? 'text-green-400 bg-green-400/10'
                        : 'text-purple-400/40 hover:text-green-400 hover:bg-green-400/10'
                      }`}>
                    {toggling[post._id + 'p']
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : post.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />
                    }
                  </button>

                  <button onClick={() => setToDelete(post)}
                    className="p-2 rounded-lg hover:bg-red-500/15 text-purple-400/40
                               hover:text-red-400 transition-all">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      <AnimatePresence>
        {toDelete && (
          <DeleteModal post={toDelete} onConfirm={handleDelete}
            onCancel={() => setToDelete(null)} loading={deleting} />
        )}
      </AnimatePresence>
    </div>
  );
}
