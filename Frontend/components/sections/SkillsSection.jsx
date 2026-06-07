'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useInView } from 'framer-motion';
import { skillsAPI } from '@/lib/api';

// ── Category config ───────────────────────────
const CATEGORIES = [
  { key: 'all',        label: 'All Skills'    },
  { key: 'frontend',   label: 'Frontend'      },
  { key: 'backend',    label: 'Backend'       },
  { key: 'database',   label: 'Database'      },
  { key: 'cloud-devops',label: 'Cloud & DevOps'},
  { key: 'ai-ml',      label: 'AI / ML'       },
  { key: 'tools',      label: 'Tools'         },
];

const LEVEL_LABEL = {
  beginner:    'Beginner',
  intermediate:'Intermediate',
  advanced:    'Advanced',
  expert:      'Expert',
};

// ── Animated progress bar ─────────────────────
function ProgressBar({ value, color, inView }) {
  return (
    <div className="relative h-1.5 rounded-full bg-white/8 overflow-hidden">
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: inView ? `${value}%` : 0 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.15 }}
        className="absolute top-0 left-0 h-full rounded-full"
        style={{
          background: `linear-gradient(90deg, ${color}99, ${color})`,
          boxShadow:  `0 0 8px ${color}60`,
        }}
      />
    </div>
  );
}

// ── Individual skill card ─────────────────────
function SkillCard({ skill, index }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const tiltRef = useRef(null);

  // 3D tilt on mouse move
  const handleMouseMove = (e) => {
    const el   = tiltRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x    = ((e.clientX - rect.left) / rect.width  - 0.5) * 14;
    const y    = ((e.clientY - rect.top)  / rect.height - 0.5) * -14;
    el.style.transform = `perspective(600px) rotateX(${y}deg) rotateY(${x}deg) scale3d(1.03,1.03,1.03)`;
  };

  const handleMouseLeave = () => {
    if (tiltRef.current) {
      tiltRef.current.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)';
    }
  };

  const color = skill.color || '#7C3AED';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
    >
      <div
        ref={tiltRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="group relative p-4 rounded-2xl border border-purple-500/15 bg-white/3
                   hover:border-purple-500/40 transition-all duration-200 cursor-default"
        style={{ transformStyle: 'preserve-3d', transition: 'transform 0.15s ease' }}
      >
        {/* Color glow on hover */}
        <div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
          style={{ background: `radial-gradient(circle at 50% 0%, ${color}18 0%, transparent 70%)` }}
        />

        {/* Top row: dot + name + level */}
        <div className="flex items-start gap-2.5 mb-3">
          {/* Color dot */}
          <div
            className="w-2.5 h-2.5 rounded-full mt-1 shrink-0"
            style={{ background: color, boxShadow: `0 0 6px ${color}80` }}
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1 mb-0.5">
              <h4 className="text-sm font-semibold text-white truncate">{skill.name}</h4>
              <span className="text-[10px] font-medium text-purple-300/50 shrink-0">
                {skill.proficiency}%
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-medium px-1.5 py-0.5 rounded-full border"
                style={{
                  color:            color,
                  background:       `${color}18`,
                  borderColor:      `${color}30`,
                }}
              >
                {LEVEL_LABEL[skill.level] || skill.level}
              </span>
              {skill.yearsOfExperience > 0 && (
                <span className="text-[10px] text-purple-300/40">
                  {skill.yearsOfExperience}y
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <ProgressBar value={skill.proficiency} color={color} inView={inView} />
      </div>
    </motion.div>
  );
}

// ── Floating background icons ─────────────────
const BG_TECH = [
  { label: '⚛️',  x: '5%',  y: '15%', size: 28, delay: 0   },
  { label: '🟢',  x: '90%', y: '10%', size: 24, delay: 0.5 },
  { label: '☁️',  x: '3%',  y: '75%', size: 30, delay: 1   },
  { label: '🐳',  x: '92%', y: '70%', size: 26, delay: 0.3 },
  { label: '🔷',  x: '50%', y: '5%',  size: 22, delay: 0.7 },
  { label: '🍃',  x: '80%', y: '85%', size: 24, delay: 0.9 },
  { label: '🐍',  x: '15%', y: '90%', size: 26, delay: 1.2 },
  { label: '▲',   x: '70%', y: '3%',  size: 20, delay: 0.4 },
];

// ========================
// Skills Section
// ========================
export default function SkillsSection() {
  const [skills,      setSkills]      = useState([]);
  const [activeTab,   setActiveTab]   = useState('all');
  const [loading,     setLoading]     = useState(true);
  const [visibleCats, setVisibleCats] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await skillsAPI.getAll({ published: 'true' });
        const data = res.data.data || [];
        setSkills(data);

        // Determine which categories actually have skills
        const cats = [...new Set(data.map(s => s.category))];
        setVisibleCats(cats);
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  // Filter skills based on active tab
  const filtered = activeTab === 'all'
    ? skills
    : skills.filter(s => s.category === activeTab);

  // Group filtered skills by category for the "all" view
  const grouped = CATEGORIES
    .filter(c => c.key !== 'all' && (activeTab === 'all' ? visibleCats.includes(c.key) : c.key === activeTab))
    .map(c => ({
      ...c,
      skills: filtered.filter(s => s.category === c.key),
    }))
    .filter(c => c.skills.length > 0);

  // Visible tabs = All + only categories that have skills
  const visibleTabs = CATEGORIES.filter(
    c => c.key === 'all' || visibleCats.includes(c.key)
  );

  return (
    <section id="skills" className="section-padding relative overflow-hidden">

      {/* Floating bg tech icons */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {BG_TECH.map((t, i) => (
          <motion.span
            key={i}
            className="absolute select-none opacity-[0.07]"
            style={{ left: t.x, top: t.y, fontSize: t.size }}
            animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
            transition={{ duration: 4 + t.delay, repeat: Infinity, ease: 'easeInOut', delay: t.delay }}
          >
            {t.label}
          </motion.span>
        ))}
        {/* Subtle radial glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-[600px] h-[600px] rounded-full opacity-[0.05] pointer-events-none"
          style={{ background: 'radial-gradient(circle, #7C3AED 0%, transparent 65%)' }} />
      </div>

      <div className="container-custom relative">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block text-xs font-bold uppercase tracking-widest
                           text-purple-400 bg-purple-400/10 border border-purple-400/20
                           px-3 py-1.5 rounded-full mb-4">
            Skills & Expertise
          </span>
          <h2 className="section-title">What I Work With</h2>
          <p className="section-subtitle">
            A curated stack of technologies I use to build scalable
            products — from idea to production.
          </p>
        </motion.div>

        {/* Category filter tabs */}
        {!loading && visibleTabs.length > 1 && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex flex-wrap justify-center gap-2 mb-10"
          >
            {visibleTabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`relative px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                  ${activeTab === tab.key
                    ? 'text-white'
                    : 'text-purple-300/60 hover:text-purple-200 hover:bg-white/5'
                  }`}
              >
                {activeTab === tab.key && (
                  <motion.div
                    layoutId="skillTab"
                    className="absolute inset-0 rounded-xl"
                    style={{ background: 'linear-gradient(135deg, rgba(124,58,237,.35), rgba(124,58,237,.15))' }}
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
                {tab.key !== 'all' && (
                  <span className="relative z-10 ml-1.5 text-[10px] text-purple-400/50">
                    ({skills.filter(s => s.category === tab.key).length})
                  </span>
                )}
              </button>
            ))}
          </motion.div>
        )}

        {/* Skills display */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-20 rounded-2xl bg-white/3 border border-purple-500/10 animate-pulse" />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >
              {activeTab === 'all' ? (
                /* ── Grouped view (all categories) ── */
                <div className="space-y-10">
                  {grouped.map((cat, gi) => (
                    <div key={cat.key}>
                      {/* Category label */}
                      <motion.div
                        initial={{ opacity: 0, x: -16 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: gi * 0.05 }}
                        className="flex items-center gap-3 mb-5"
                      >
                        <div className="h-px flex-1 bg-gradient-to-r from-purple-500/30 to-transparent" />
                        <span className="text-xs font-bold uppercase tracking-widest text-purple-400/60 px-3">
                          {cat.label}
                        </span>
                        <div className="h-px flex-1 bg-gradient-to-l from-purple-500/30 to-transparent" />
                      </motion.div>

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                        {cat.skills.map((skill, i) => (
                          <SkillCard key={skill._id} skill={skill} index={i} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                /* ── Single category grid ── */
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                  {filtered.map((skill, i) => (
                    <SkillCard key={skill._id} skill={skill} index={i} />
                  ))}
                </div>
              )}

              {filtered.length === 0 && !loading && (
                <div className="text-center py-16 text-purple-300/40 text-sm">
                  No skills in this category yet.
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Bottom summary bar */}
        {!loading && skills.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-12 pt-8 border-t border-purple-500/10 flex flex-wrap
                       justify-center gap-x-8 gap-y-3"
          >
            {[
              { label: 'Total technologies', value: skills.length },
              { label: 'Categories',         value: visibleCats.length },
              { label: 'Expert level',       value: skills.filter(s => s.level === 'expert').length },
              {
                label: 'Avg proficiency',
                value: `${Math.round(skills.reduce((a, s) => a + s.proficiency, 0) / skills.length)}%`,
              },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-xl font-bold text-white font-heading">{s.value}</p>
                <p className="text-xs text-purple-300/50 mt-0.5">{s.label}</p>
              </div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
}
