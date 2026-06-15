'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Search, Star, StarOff, Eye, EyeOff, Trash2,
  Pencil, ExternalLink, Github, Loader2, FolderKanban,
  Filter, RefreshCw,
} from 'lucide-react';
import { projectsAPI } from '@/lib/api';
import { getImageUrl, truncate, getErrorMessage } from '@/lib/utils';
import toast from 'react-hot-toast';

const CATEGORIES = ['all','web','mobile','ai-ml','devops','open-source','startup','other'];
const STATUS_COLORS = {
  completed:   'text-green-400  bg-green-400/10  border-green-400/20',
  'in-progress':'text-blue-400   bg-blue-400/10   border-blue-400/20',
  archived:    'text-gray-400   bg-gray-400/10   border-gray-400/20',
  'on-hold':   'text-amber-400  bg-amber-400/10  border-amber-400/20',
};

// ── Confirm delete modal ──────────────────────
function DeleteModal({ project, onConfirm, onCancel, loading }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
         style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)' }}>
      <motion.div initial={{ scale:.9, opacity:0 }} animate={{ scale:1, opacity:1 }}
        className="bg-[#0d0d28] border border-red-500/25 rounded-2xl p-6 max-w-sm w-full shadow-2xl">
        <div className="w-12 h-12 rounded-xl bg-red-500/15 flex items-center justify-center mb-4">
          <Trash2 className="w-6 h-6 text-red-400" />
        </div>
        <h3 className="text-lg font-bold text-white mb-1">Delete project?</h3>
        <p className="text-sm text-purple-300/60 mb-6">
          <span className="text-white font-medium">"{project.title}"</span> will be permanently
          removed including its image. This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium border border-purple-500/20
                       text-purple-300 hover:bg-purple-500/10 transition-colors disabled:opacity-50">
            Cancel
          </button>
          <button onClick={onConfirm} disabled={loading}
            className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-red-500/20 border
                       border-red-500/30 text-red-400 hover:bg-red-500/30 transition-colors
                       disabled:opacity-50 flex items-center justify-center gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminProjectsPage() {
  const [projects,    setProjects]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [search,      setSearch]      = useState('');
  const [category,    setCategory]    = useState('all');
  const [toDelete,    setToDelete]    = useState(null);
  const [deleting,    setDeleting]    = useState(false);
  const [toggling,    setToggling]    = useState({});

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (category !== 'all') params.category = category;
      const res = await projectsAPI.getAll(params);
      setProjects(res.data.data || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  // ── Client-side search filter ─────────────
  const filtered = projects.filter(p =>
    !search ||
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.technologies?.some(t => t.toLowerCase().includes(search.toLowerCase()))
  );

  // ── Toggle featured ───────────────────────
  const handleFeatured = async (project) => {
    setToggling(t => ({ ...t, [project._id + 'f']: true }));
    try {
      await projectsAPI.update(project._id, { featured: !project.featured });
      setProjects(ps => ps.map(p =>
        p._id === project._id ? { ...p, featured: !p.featured } : p
      ));
      toast.success(project.featured ? 'Removed from featured' : 'Marked as featured ⭐');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setToggling(t => ({ ...t, [project._id + 'f']: false }));
    }
  };

  // ── Toggle published ──────────────────────
  const handlePublish = async (project) => {
    setToggling(t => ({ ...t, [project._id + 'p']: true }));
    try {
      await projectsAPI.update(project._id, { published: !project.published });
      setProjects(ps => ps.map(p =>
        p._id === project._id ? { ...p, published: !p.published } : p
      ));
      toast.success(project.published ? 'Project unpublished' : 'Project published ✓');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setToggling(t => ({ ...t, [project._id + 'p']: false }));
    }
  };

  // ── Delete ────────────────────────────────
  const handleDelete = async () => {
    if (!toDelete) return;
    setDeleting(true);
    try {
      await projectsAPI.delete(toDelete._id);
      setProjects(ps => ps.filter(p => p._id !== toDelete._id));
      toast.success('Project deleted.');
      setToDelete(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-12">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white font-heading">Projects</h1>
          <p className="text-sm text-purple-300/60 mt-0.5">
            {projects.length} project{projects.length !== 1 ? 's' : ''} total
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchProjects}
            className="p-2.5 rounded-xl border border-purple-500/20 text-purple-400/60
                       hover:text-purple-300 hover:bg-purple-500/10 transition-all">
            <RefreshCw className="w-4 h-4" />
          </button>
          <Link href="/admin/projects/new"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                       text-white transition-all"
            style={{ background: 'linear-gradient(135deg,#7C3AED,#6d28d9)' }}>
            <Plus className="w-4 h-4" />New Project
          </Link>
        </div>
      </div>

      {/* ── Search + Filter ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/50" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search projects or technologies…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white/5 border border-purple-500/20
                       text-white placeholder-white/25 focus:outline-none focus:ring-2
                       focus:ring-purple-500/50 transition-all" />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-purple-400/50 shrink-0" />
          <select value={category} onChange={e => setCategory(e.target.value)}
            className="px-3 py-2.5 rounded-xl text-sm bg-white/5 border border-purple-500/20
                       text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all">
            {CATEGORIES.map(c => (
              <option key={c} value={c} className="bg-gray-900 capitalize">{c === 'all' ? 'All categories' : c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Projects grid / empty ── */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 rounded-2xl
                        border border-dashed border-purple-500/20 text-center">
          <FolderKanban className="w-10 h-10 text-purple-500/30 mb-3" />
          <p className="text-sm text-purple-300/50">
            {search ? 'No projects match your search' : 'No projects yet'}
          </p>
          {!search && (
            <Link href="/admin/projects/new"
              className="mt-3 text-xs text-purple-400 hover:text-purple-300 underline transition-colors">
              Add your first project →
            </Link>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-3">
          <AnimatePresence>
            {filtered.map((project, i) => (
              <motion.div key={project._id}
                initial={{ opacity:0, y:8 }} animate={{ opacity:1, y:0 }}
                exit={{ opacity:0, scale:.97 }} transition={{ delay: i * 0.03 }}
                className={`flex gap-4 p-4 rounded-2xl border transition-all duration-200
                  ${project.published
                    ? 'border-purple-500/15 bg-white/3 hover:border-purple-500/30'
                    : 'border-dashed border-purple-500/10 bg-white/1 opacity-70'
                  }`}
              >
                {/* Thumbnail */}
                <div className="w-20 h-16 rounded-xl overflow-hidden bg-purple-900/20
                                border border-purple-500/15 shrink-0 flex items-center justify-center">
                  {project.imageFileId ? (
                    <img
                      src={getImageUrl(project.imageFileId)}
                      alt={project.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <FolderKanban className="w-7 h-7 text-purple-500/30" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-2 flex-wrap mb-1">
                    <h3 className="text-sm font-semibold text-white truncate">{project.title}</h3>
                    {project.featured && (
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full
                                       bg-amber-400/15 text-amber-400 border border-amber-400/20">
                        ⭐ Featured
                      </span>
                    )}
                    <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded-full border ${STATUS_COLORS[project.status] || ''}`}>
                      {project.status}
                    </span>
                    {!project.published && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full
                                       bg-gray-500/15 text-gray-400 border border-gray-500/20">
                        Draft
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-purple-300/50 mb-2 leading-relaxed">
                    {truncate(project.shortDescription, 100)}
                  </p>

                  {/* Tech tags */}
                  <div className="flex flex-wrap gap-1">
                    {project.technologies?.slice(0, 6).map(tech => (
                      <span key={tech}
                        className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10
                                   text-purple-300/70 border border-purple-500/15">
                        {tech}
                      </span>
                    ))}
                    {(project.technologies?.length || 0) > 6 && (
                      <span className="text-[10px] text-purple-300/40">
                        +{project.technologies.length - 6}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-1.5 shrink-0">
                  {/* Edit */}
                  <Link href={`/admin/projects/${project._id}`}
                    className="p-2 rounded-lg hover:bg-purple-500/15 text-purple-400/60
                               hover:text-purple-300 transition-all" title="Edit">
                    <Pencil className="w-4 h-4" />
                  </Link>

                  {/* Featured toggle */}
                  <button onClick={() => handleFeatured(project)}
                    disabled={toggling[project._id + 'f']}
                    className={`p-2 rounded-lg transition-all disabled:opacity-50
                      ${project.featured
                        ? 'bg-amber-400/15 text-amber-400 hover:bg-amber-400/25'
                        : 'hover:bg-white/5 text-purple-400/40 hover:text-amber-400'
                      }`} title={project.featured ? 'Remove featured' : 'Mark featured'}>
                    {toggling[project._id + 'f']
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : project.featured ? <Star className="w-4 h-4" /> : <StarOff className="w-4 h-4" />
                    }
                  </button>

                  {/* Publish toggle */}
                  <button onClick={() => handlePublish(project)}
                    disabled={toggling[project._id + 'p']}
                    className={`p-2 rounded-lg transition-all disabled:opacity-50
                      ${project.published
                        ? 'text-green-400 bg-green-400/10 hover:bg-green-400/20'
                        : 'text-purple-400/40 hover:bg-white/5 hover:text-purple-300'
                      }`} title={project.published ? 'Unpublish' : 'Publish'}>
                    {toggling[project._id + 'p']
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : project.published ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />
                    }
                  </button>

                  {/* External links */}
                  {project.liveUrl && (
                    <a href={project.liveUrl} target="_blank" rel="noreferrer"
                      className="p-2 rounded-lg hover:bg-white/5 text-purple-400/40
                                 hover:text-purple-300 transition-all" title="Live demo">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  )}
                  {project.githubUrl && (
                    <a href={project.githubUrl} target="_blank" rel="noreferrer"
                      className="p-2 rounded-lg hover:bg-white/5 text-purple-400/40
                                 hover:text-purple-300 transition-all" title="GitHub">
                      <Github className="w-4 h-4" />
                    </a>
                  )}

                  {/* Delete */}
                  <button onClick={() => setToDelete(project)}
                    className="p-2 rounded-lg hover:bg-red-500/15 text-purple-400/40
                               hover:text-red-400 transition-all" title="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* ── Delete modal ── */}
      <AnimatePresence>
        {toDelete && (
          <DeleteModal
            project={toDelete}
            onConfirm={handleDelete}
            onCancel={() => setToDelete(null)}
            loading={deleting}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
