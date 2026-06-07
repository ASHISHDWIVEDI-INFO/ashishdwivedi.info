'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import {
  Briefcase, MapPin, Calendar, ExternalLink,
  Building2, ChevronDown, CheckCircle, ArrowRight,
} from 'lucide-react';
import { experienceAPI } from '@/lib/api';
import { formatDate } from '@/lib/utils';

// ── Employment type badge colors ──────────────
const TYPE_STYLE = {
  'full-time':  'text-green-400  bg-green-400/10  border-green-400/20',
  'part-time':  'text-blue-400   bg-blue-400/10   border-blue-400/20',
  'contract':   'text-orange-400 bg-orange-400/10 border-orange-400/20',
  'freelance':  'text-purple-400 bg-purple-400/10 border-purple-400/20',
  'internship': 'text-cyan-400   bg-cyan-400/10   border-cyan-400/20',
  'co-founder': 'text-amber-400  bg-amber-400/10  border-amber-400/20',
};

// ── Animated timeline line ────────────────────
function TimelineLine() {
  const ref    = useRef(null);
  const { scrollYProgress } = useScroll({
    target:     ref,
    offset:     ['start 80%', 'end 20%'],
  });
  const height = useTransform(scrollYProgress, [0, 1], ['0%', '100%']);

  return (
    <div ref={ref} className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0
                               w-px bg-purple-500/10 hidden lg:block">
      <motion.div
        style={{ height }}
        className="w-full origin-top"
        style={{
          height,
          background: 'linear-gradient(to bottom, #7C3AED, #06b6d4)',
          transformOrigin: 'top',
        }}
      />
    </div>
  );
}

// ── Duration helper ───────────────────────────
function getDuration(start, end, isCurrent) {
  if (!start) return '';
  const s      = new Date(start);
  const e      = isCurrent ? new Date() : end ? new Date(end) : new Date();
  const months = (e.getFullYear() - s.getFullYear()) * 12 + (e.getMonth() - s.getMonth());
  if (months < 1)  return '< 1 month';
  if (months < 12) return `${months}mo`;
  const y = Math.floor(months / 12);
  const m = months % 12;
  return m > 0 ? `${y}y ${m}mo` : `${y}y`;
}

// ── Individual experience card ────────────────
function ExperienceCard({ exp, index }) {
  const [expanded, setExpanded] = useState(false);
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  const isLeft  = index % 2 === 0;   // alternates left / right on desktop
  const duration = getDuration(exp.startDate, exp.endDate, exp.isCurrent);
  const startStr = exp.startDate ? formatDate(exp.startDate, 'MMM yyyy') : '';
  const endStr   = exp.isCurrent ? 'Present' : exp.endDate ? formatDate(exp.endDate, 'MMM yyyy') : '';

  const hasDetails = (exp.responsibilities?.length > 0) ||
                     (exp.achievements?.length > 0) ||
                     exp.summary;

  return (
    <div ref={ref} className="relative lg:grid lg:grid-cols-2 lg:gap-10 mb-10">

      {/* ── Desktop: left-side card ── */}
      {isLeft && (
        <motion.div
          initial={{ opacity: 0, x: -48 }}
          animate={inView ? { opacity: 1, x: 0 } : {}}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="hidden lg:block"
        >
          <Card exp={exp} startStr={startStr} endStr={endStr} duration={duration}
            expanded={expanded} setExpanded={setExpanded} hasDetails={hasDetails} />
        </motion.div>
      )}

      {/* ── Timeline dot (desktop center) ── */}
      <div className="hidden lg:flex absolute left-1/2 top-8 -translate-x-1/2
                       items-center justify-center z-10">
        <motion.div
          initial={{ scale: 0 }}
          animate={inView ? { scale: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.1, type: 'spring', stiffness: 200 }}
          className={`w-4 h-4 rounded-full border-2 border-[#07071a]
            ${exp.isCurrent
              ? 'bg-purple-400 shadow-[0_0_12px_rgba(124,58,237,0.7)]'
              : 'bg-purple-600/60'
            }`}
        />
      </div>

      {/* ── Desktop: right-side card ── */}
      {!isLeft && (
        <>
          <div className="hidden lg:block" /> {/* spacer */}
          <motion.div
            initial={{ opacity: 0, x: 48 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="hidden lg:block"
          >
            <Card exp={exp} startStr={startStr} endStr={endStr} duration={duration}
              expanded={expanded} setExpanded={setExpanded} hasDetails={hasDetails} />
          </motion.div>
        </>
      )}

      {/* ── Mobile: always full-width ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="lg:hidden col-span-2 flex gap-4"
      >
        {/* Mobile timeline dot + line */}
        <div className="flex flex-col items-center shrink-0 pt-1">
          <div className={`w-3 h-3 rounded-full border-2 border-[var(--bg-primary)]
            ${exp.isCurrent
              ? 'bg-purple-400 shadow-[0_0_8px_rgba(124,58,237,0.6)]'
              : 'bg-purple-600/50'
            }`} />
          <div className="w-px flex-1 mt-1 bg-gradient-to-b from-purple-500/30 to-transparent" />
        </div>
        <div className="flex-1 pb-2">
          <Card exp={exp} startStr={startStr} endStr={endStr} duration={duration}
            expanded={expanded} setExpanded={setExpanded} hasDetails={hasDetails} />
        </div>
      </motion.div>
    </div>
  );
}

// ── Card content (shared between desktop/mobile) ─
function Card({ exp, startStr, endStr, duration, expanded, setExpanded, hasDetails }) {
  return (
    <div className={`group rounded-2xl border p-5 transition-all duration-300
      ${exp.published
        ? 'border-purple-500/15 bg-white/3 hover:border-purple-500/30 hover:bg-white/5'
        : 'border-dashed border-purple-500/10 bg-white/1 opacity-60'
      }`}>

      {/* Top row: role + badges */}
      <div className="flex items-start justify-between gap-2 mb-1 flex-wrap">
        <h3 className="text-base font-bold text-white leading-snug">{exp.role}</h3>
        <div className="flex items-center gap-1.5 flex-wrap">
          {exp.isCurrent && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full
                             bg-purple-500/20 text-purple-300 border border-purple-500/30
                             animate-pulse">
              Current
            </span>
          )}
          <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full border capitalize
            ${TYPE_STYLE[exp.employmentType] || 'text-gray-400 bg-gray-400/10 border-gray-400/20'}`}>
            {exp.employmentType}
          </span>
        </div>
      </div>

      {/* Company row */}
      <div className="flex items-center gap-1.5 mb-2 flex-wrap">
        {exp.companyUrl ? (
          <a href={exp.companyUrl} target="_blank" rel="noreferrer"
            className="flex items-center gap-1 text-sm font-semibold text-purple-300
                       hover:text-purple-200 transition-colors">
            <Building2 className="w-3.5 h-3.5" />
            {exp.company}
            <ExternalLink className="w-3 h-3 opacity-50" />
          </a>
        ) : (
          <span className="flex items-center gap-1 text-sm font-semibold text-purple-300">
            <Building2 className="w-3.5 h-3.5" />{exp.company}
          </span>
        )}
        {exp.location && (
          <span className="flex items-center gap-1 text-xs text-purple-300/45">
            <MapPin className="w-3 h-3" />{exp.location}
          </span>
        )}
      </div>

      {/* Date row */}
      <div className="flex items-center gap-2 text-xs text-purple-300/50 mb-3">
        <Calendar className="w-3.5 h-3.5 shrink-0" />
        <span>{startStr}{endStr ? ` — ${endStr}` : ''}</span>
        {duration && (
          <span className="px-2 py-0.5 rounded-full bg-purple-500/10
                           border border-purple-500/15 text-purple-400/70">
            {duration}
          </span>
        )}
      </div>

      {/* Summary */}
      {exp.summary && (
        <p className="text-sm text-purple-200/65 leading-relaxed mb-3 line-clamp-2">
          {exp.summary}
        </p>
      )}

      {/* Tech tags */}
      {exp.technologiesUsed?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {exp.technologiesUsed.slice(0, 7).map(t => (
            <span key={t} className="text-[10px] px-2 py-0.5 rounded-full
                                      bg-purple-500/10 text-purple-300/60
                                      border border-purple-500/15">
              {t}
            </span>
          ))}
          {exp.technologiesUsed.length > 7 && (
            <span className="text-[10px] text-purple-300/35">
              +{exp.technologiesUsed.length - 7} more
            </span>
          )}
        </div>
      )}

      {/* Expand / collapse button */}
      {hasDetails && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex items-center gap-1.5 text-xs text-purple-400/60
                     hover:text-purple-300 transition-colors mt-1"
        >
          <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200
            ${expanded ? 'rotate-180' : ''}`} />
          {expanded ? 'Hide details' : 'Show details'}
        </button>
      )}

      {/* Expanded details */}
      <motion.div
        initial={false}
        animate={{ height: expanded ? 'auto' : 0, opacity: expanded ? 1 : 0 }}
        transition={{ duration: 0.25 }}
        style={{ overflow: 'hidden' }}
      >
        <div className="pt-4 space-y-4 border-t border-purple-500/10 mt-3">
          {exp.responsibilities?.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest
                             text-purple-400/40 mb-2">Responsibilities</p>
              <ul className="space-y-1.5">
                {exp.responsibilities.map((r, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs
                                         text-purple-200/65 leading-relaxed">
                    <ArrowRight className="w-3 h-3 text-purple-500/50 mt-0.5 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {exp.achievements?.length > 0 && (
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest
                             text-purple-400/40 mb-2">Key Achievements</p>
              <ul className="space-y-1.5">
                {exp.achievements.map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs
                                         text-green-300/70 leading-relaxed">
                    <CheckCircle className="w-3 h-3 text-green-400/60 mt-0.5 shrink-0" />
                    {a}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// ── Section header with fade-up ───────────────
function SectionHeader() {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6 }}
      className="text-center mb-16"
    >
      <span className="inline-block text-xs font-bold uppercase tracking-widest
                       text-purple-400 bg-purple-400/10 border border-purple-400/20
                       px-3 py-1.5 rounded-full mb-4">
        Experience
      </span>
      <h2 className="section-title">Professional Journey</h2>
      <p className="section-subtitle">
        A timeline of the roles, companies, and challenges that
        shaped my expertise.
      </p>
    </motion.div>
  );
}

// ========================
// Experience Section
// ========================
export default function ExperienceSection() {
  const [experiences, setExperiences] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const sectionRef = useRef(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await experienceAPI.getAll({ published: 'true' });
        setExperiences(res.data.data || []);
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  // Stats from data
  const current     = experiences.filter(e => e.isCurrent).length;
  const totalMonths = experiences.reduce((acc, e) => {
    if (!e.startDate) return acc;
    const s = new Date(e.startDate);
    const en = e.isCurrent ? new Date() : e.endDate ? new Date(e.endDate) : new Date();
    return acc + (en - s) / (1000 * 60 * 60 * 24 * 30.4);
  }, 0);
  const totalYears = (totalMonths / 12).toFixed(1);

  return (
    <section id="experience" ref={sectionRef} className="section-padding relative overflow-hidden">

      {/* Subtle bg accent */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] opacity-[0.04] rounded-full"
          style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 65%)' }} />
      </div>

      <div className="container-custom">
        <SectionHeader />

        {/* Stats bar */}
        {!loading && experiences.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="flex flex-wrap justify-center gap-8 mb-14
                       pb-10 border-b border-purple-500/10"
          >
            {[
              { value: experiences.length, label: 'Total Positions' },
              { value: current,            label: 'Current Roles'   },
              { value: `${totalYears}y`,   label: 'Total Experience'},
              { value: [...new Set(experiences.map(e => e.company))].length, label: 'Companies' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-2xl font-bold text-white font-heading">{s.value}</p>
                <p className="text-xs text-purple-300/50 mt-0.5">{s.label}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Timeline */}
        {loading ? (
          /* Skeleton */
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-36 rounded-2xl bg-white/3 border
                                      border-purple-500/10 animate-pulse" />
            ))}
          </div>
        ) : experiences.length === 0 ? (
          <div className="text-center py-20 text-purple-300/40">
            <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">No experience data yet.</p>
          </div>
        ) : (
          <div className="relative">
            {/* Animated center line (desktop) */}
            <TimelineLine />

            {/* Cards */}
            <div className="relative">
              {experiences.map((exp, i) => (
                <ExperienceCard key={exp._id} exp={exp} index={i} />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
