'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import {
  Github, ExternalLink, Star, ArrowRight,
  FolderKanban, Filter,
} from 'lucide-react';
import { projectsAPI } from '@/lib/api';
import { getImageUrl, truncate } from '@/lib/utils';

// ── Category filter tabs ──────────────────────
const CATEGORIES = [
  { key: 'all',         label: 'All'         },
  { key: 'web',         label: 'Web'         },
  { key: 'ai-ml',       label: 'AI / ML'     },
  { key: 'mobile',      label: 'Mobile'      },
  { key: 'devops',      label: 'DevOps'      },
  { key: 'open-source', label: 'Open Source' },
  { key: 'startup',     label: 'Startup'     },
];

const STATUS_STYLE = {
  completed:    'text-green-400  bg-green-400/10  border-green-400/20',
  'in-progress':'text-blue-400   bg-blue-400/10   border-blue-400/20',
  archived:     'text-gray-400   bg-gray-400/10   border-gray-400/20',
  'on-hold':    'text-amber-400  bg-amber-400/10  border-amber-400/20',
};

// ── 3D tilt card ──────────────────────────────
function ProjectCard({ project, index }) {
  const cardRef = useRef(null);
  const ref     = useRef(null);
  const inView  = useInView(ref, { once: true, margin: '-60px' });
  const [hovered, setHovered] = useState(false);

  // 3D tilt on mouse move
  const handleMouseMove = (e) => {
    const el   = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x    = ((e.clientX - rect.left) / rect.width  - 0.5) * 16;
    const y    = ((e.clientY - rect.top)  / rect.height - 0.5) * -16;
    el.style.transform = `perspective(700px) rotateX(${y}deg) rotateY(${x}deg) scale3d(1.02,1.02,1.02)`;
  };

  const handleMouseLeave = () => {
    if (cardRef.current) {
      cardRef.current.style.transform =
        'perspective(700px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
    }
    setHovered(false);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.55, delay: index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      layout
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={handleMouseLeave}
        className="group flex flex-col h-full rounded-2xl border border-purple-500/15
                   bg-white/3 overflow-hidden cursor-default
                   hover:border-purple-500/40 transition-colors duration-300"
        style={{ transformStyle: 'preserve-3d', transition: 'transform 0.15s ease' }}
      >
        {/* ── Thumbnail ── */}
        <div className="relative aspect-video overflow-hidden bg-purple-900/20 shrink-0">
          {project.imageFileId || project.imageUrl ? (
            <img
              src={project.imageFileId
                ? getImageUrl(project.imageFileId)
                : project.imageUrl}
              alt={project.title}
              className={`w-full h-full object-cover transition-transform duration-500
                ${hovered ? 'scale-110' : 'scale-100'}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FolderKanban className="w-12 h-12 text-purple-500/20" />
            </div>
          )}

          {/* Overlay on hover */}
          <div className={`absolute inset-0 transition-opacity duration-300 flex items-center
                            justify-center gap-3
            ${hovered ? 'opacity-100' : 'opacity-0'}`}
            style={{ background: 'rgba(7,7,26,0.72)', backdropFilter: 'blur(2px)' }}>
            {project.liveUrl && (
              <motion.a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                onClick={e => e.stopPropagation()}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold
                           text-white border border-white/20 hover:bg-white/15 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />Live Demo
              </motion.a>
            )}
            {project.githubUrl && (
              <motion.a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                onClick={e => e.stopPropagation()}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold
                           text-white border border-white/20 hover:bg-white/15 transition-colors"
              >
                <Github className="w-3.5 h-3.5" />GitHub
              </motion.a>
            )}
          </div>

          {/* Featured badge */}
          {project.featured && (
            <div className="absolute top-3 left-3 flex items-center gap-1 px-2 py-1 rounded-full
                            text-[10px] font-bold bg-amber-400/20 text-amber-400
                            border border-amber-400/30 backdrop-blur-sm">
              <Star className="w-3 h-3 fill-amber-400/50" />Featured
            </div>
          )}

          {/* Status badge */}
          <div className={`absolute top-3 right-3 px-2 py-0.5 rounded-full text-[10px]
                            font-medium border capitalize backdrop-blur-sm
            ${STATUS_STYLE[project.status] || STATUS_STYLE.completed}`}>
            {project.status}
          </div>
        </div>

        {/* ── Card body ── */}
        <div className="flex flex-col flex-1 p-5">
          <h3 className="text-base font-bold text-white mb-1.5 leading-snug group-hover:text-purple-200
                         transition-colors">
            {project.title}
          </h3>

          <p className="text-sm text-purple-200/60 leading-relaxed mb-4 flex-1">
            {truncate(project.shortDescription || '', 110)}
          </p>

          {/* Tech tags */}
          {project.technologies?.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {project.technologies.slice(0, 5).map(t => (
                <span key={t}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10
                             text-purple-300/60 border border-purple-500/15">
                  {t}
                </span>
              ))}
              {project.technologies.length > 5 && (
                <span className="text-[10px] text-purple-300/35">
                  +{project.technologies.length - 5}
                </span>
              )}
            </div>
          )}

          {/* Footer links */}
          <div className="flex items-center gap-2 mt-auto pt-3 border-t border-purple-500/10">
            {project.liveUrl && (
              <a href={project.liveUrl} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-purple-300/60
                           hover:text-purple-300 transition-colors">
                <ExternalLink className="w-3.5 h-3.5" />Live
              </a>
            )}
            {project.githubUrl && (
              <a href={project.githubUrl} target="_blank" rel="noreferrer"
                className="flex items-center gap-1.5 text-xs text-purple-300/60
                           hover:text-purple-300 transition-colors">
                <Github className="w-3.5 h-3.5" />Source
              </a>
            )}
            {project.stats?.views > 0 && (
              <span className="ml-auto text-[10px] text-purple-300/30">
                {project.stats.views} views
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ── Featured large card ───────────────────────
function FeaturedCard({ project }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
      className="col-span-full"
    >
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="group grid grid-cols-1 lg:grid-cols-2 rounded-3xl border
                   border-purple-500/20 bg-white/3 hover:border-purple-500/40
                   overflow-hidden transition-all duration-300"
      >
        {/* Image side */}
        <div className="relative aspect-video lg:aspect-auto overflow-hidden bg-purple-900/20 min-h-[220px]">
          {project.imageFileId || project.imageUrl ? (
            <img
              src={project.imageFileId ? getImageUrl(project.imageFileId) : project.imageUrl}
              alt={project.title}
              className={`w-full h-full object-cover transition-transform duration-700
                ${hovered ? 'scale-108' : 'scale-100'}`}
              style={{ transform: hovered ? 'scale(1.08)' : 'scale(1)' }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FolderKanban className="w-16 h-16 text-purple-500/20" />
            </div>
          )}
          <div className="absolute inset-0 pointer-events-none"
            style={{ background: 'linear-gradient(to right, transparent 60%, rgba(13,13,40,0.9))' }} />
          <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full
                          text-xs font-bold bg-amber-400/20 text-amber-400
                          border border-amber-400/30 backdrop-blur-sm">
            <Star className="w-3.5 h-3.5 fill-amber-400/50" />Featured Project
          </div>
        </div>

        {/* Content side */}
        <div className="flex flex-col justify-center p-7 lg:p-10">
          <div className={`inline-flex w-fit mb-3 px-2 py-0.5 rounded-full text-[10px]
                           font-medium border capitalize
            ${STATUS_STYLE[project.status] || STATUS_STYLE.completed}`}>
            {project.status}
          </div>

          <h3 className="text-2xl font-bold text-white font-heading mb-3 leading-snug">
            {project.title}
          </h3>
          <p className="text-sm text-purple-200/65 leading-relaxed mb-5">
            {truncate(project.shortDescription || project.fullDescription || '', 200)}
          </p>

          {/* Tech tags */}
          {project.technologies?.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-6">
              {project.technologies.slice(0, 8).map(t => (
                <span key={t}
                  className="text-xs px-2.5 py-0.5 rounded-full bg-purple-500/15
                             text-purple-300/70 border border-purple-500/20">
                  {t}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3">
            {project.liveUrl && (
              <motion.a
                href={project.liveUrl}
                target="_blank"
                rel="noreferrer"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                           text-white transition-all"
                style={{ background: 'linear-gradient(135deg,#7C3AED,#6d28d9)' }}
              >
                <ExternalLink className="w-4 h-4" />Live Demo
              </motion.a>
            )}
            {project.githubUrl && (
              <motion.a
                href={project.githubUrl}
                target="_blank"
                rel="noreferrer"
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                           border border-purple-500/30 text-purple-300 hover:bg-purple-500/15
                           transition-all"
              >
                <Github className="w-4 h-4" />View Code
              </motion.a>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ========================
// Projects Section
// ========================
export default function ProjectsSection() {
  const [projects,    setProjects]    = useState([]);
  const [activeTab,   setActiveTab]   = useState('all');
  const [loading,     setLoading]     = useState(true);
  const [showAll,     setShowAll]     = useState(false);
  const VISIBLE_COUNT = 6;

  useEffect(() => {
    (async () => {
      try {
        const res = await projectsAPI.getAll({ published: 'true' });
        setProjects(res.data.data || []);
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  // Filter by category
  const filtered = activeTab === 'all'
    ? projects
    : projects.filter(p => p.category === activeTab);

  // Featured = first featured project (only in "all" tab)
  const featuredProject = activeTab === 'all'
    ? filtered.find(p => p.featured)
    : null;

  // Regular grid = all non-featured (or all if no featured)
  const gridProjects = featuredProject
    ? filtered.filter(p => p._id !== featuredProject._id)
    : filtered;

  // Show limited unless expanded
  const visibleGrid = showAll ? gridProjects : gridProjects.slice(0, VISIBLE_COUNT);

  // Visible category tabs
  const usedCategories = [...new Set(projects.map(p => p.category))];
  const visibleTabs    = CATEGORIES.filter(c => c.key === 'all' || usedCategories.includes(c.key));

  return (
    <section id="projects" className="section-padding relative overflow-hidden">

      {/* bg accent */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/3 right-0 w-[450px] h-[450px] opacity-[0.04] rounded-full"
          style={{ background: 'radial-gradient(circle, #F97316 0%, transparent 65%)' }} />
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
            Projects
          </span>
          <h2 className="section-title">Things I've Built</h2>
          <p className="section-subtitle">
            A selection of projects across web, AI, DevOps, and startups —
            from side experiments to production systems.
          </p>
        </motion.div>

        {/* Filter tabs */}
        {!loading && visibleTabs.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="flex flex-wrap justify-center gap-2 mb-10"
          >
            {visibleTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setShowAll(false); }}
                className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all
                  ${activeTab === tab.key
                    ? 'text-white'
                    : 'text-purple-300/60 hover:text-purple-200 hover:bg-white/5'
                  }`}
              >
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="projTab"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: 'linear-gradient(135deg,rgba(124,58,237,.35),rgba(124,58,237,.15))' }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
                <span className="relative z-10 ml-1.5 text-[10px] text-purple-400/40">
                  ({(tab.key === 'all' ? projects : projects.filter(p => p.category === tab.key)).length})
                </span>
              </button>
            ))}
          </motion.div>
        )}

        {loading ? (
          /* Skeleton */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className="rounded-2xl bg-white/3 border border-purple-500/10
                                      animate-pulse h-72" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-purple-300/40">
            <FolderKanban className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No projects in this category yet.</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-5"
            >
              {/* Featured full-width card */}
              {featuredProject && <FeaturedCard project={featuredProject} />}

              {/* Regular grid */}
              {visibleGrid.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {visibleGrid.map((project, i) => (
                    <ProjectCard key={project._id} project={project} index={i} />
                  ))}
                </div>
              )}

              {/* Show more / less */}
              {gridProjects.length > VISIBLE_COUNT && (
                <div className="flex justify-center pt-4">
                  <motion.button
                    onClick={() => setShowAll(s => !s)}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="flex items-center gap-2 px-7 py-3 rounded-xl text-sm font-semibold
                               border border-purple-500/30 text-purple-300 hover:bg-purple-500/15
                               transition-all"
                  >
                    {showAll ? (
                      <>Show less</>
                    ) : (
                      <>View all {gridProjects.length} projects <ArrowRight className="w-4 h-4" /></>
                    )}
                  </motion.button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Stats footer */}
        {!loading && projects.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-14 pt-8 border-t border-purple-500/10 flex flex-wrap
                       justify-center gap-8"
          >
            {[
              { label: 'Total Projects',  value: projects.length },
              { label: 'Featured',        value: projects.filter(p => p.featured).length },
              { label: 'Live Projects',   value: projects.filter(p => p.liveUrl).length },
              { label: 'Open Source',     value: projects.filter(p => p.githubUrl).length },
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