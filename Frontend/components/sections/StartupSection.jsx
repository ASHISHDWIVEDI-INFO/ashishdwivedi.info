'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ExternalLink, Users, TrendingUp, Building2, ArrowRight, Zap } from 'lucide-react';
import API from '@/lib/api';
import { getImageUrl } from '@/lib/utils';

const STATUS_STYLE = {
  active:   'text-green-400  bg-green-400/10  border-green-400/25',
  acquired: 'text-blue-400   bg-blue-400/10   border-blue-400/25',
  closed:   'text-gray-400   bg-gray-400/10   border-gray-400/25',
  stealth:  'text-amber-400  bg-amber-400/10  border-amber-400/25',
};

function StartupCard({ startup, index }) {
  const ref    = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const logo   = startup.logoFileId ? getImageUrl(startup.logoFileId) : startup.logoUrl || null;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.12, ease: [0.22, 1, 0.36, 1] }}
      className="group relative flex flex-col rounded-3xl border border-purple-500/20
                 bg-white/3 hover:border-purple-500/40 hover:bg-white/5
                 overflow-hidden transition-all duration-300 p-7"
    >
      {/* Glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 30% 20%, rgba(124,58,237,.08) 0%, transparent 60%)' }} />

      {/* Top row */}
      <div className="flex items-start justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div className="w-12 h-12 rounded-2xl overflow-hidden bg-purple-900/30 border
                          border-purple-500/20 flex items-center justify-center shrink-0">
            {logo
              ? <img src={logo} alt={startup.name} className="w-full h-full object-cover" />
              : <Building2 className="w-6 h-6 text-purple-400/50" />
            }
          </div>
          <div>
            <h3 className="text-lg font-bold text-white font-heading leading-tight">
              {startup.name}
            </h3>
            {startup.founded && (
              <p className="text-xs text-purple-300/45">Founded {startup.founded}</p>
            )}
          </div>
        </div>

        <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full border capitalize shrink-0
          ${STATUS_STYLE[startup.status] || STATUS_STYLE.active}`}>
          {startup.status}
        </span>
      </div>

      {/* Tagline */}
      {startup.tagline && (
        <p className="text-base font-semibold text-white/90 mb-2 leading-snug">
          {startup.tagline}
        </p>
      )}

      {/* Description */}
      {startup.description && (
        <p className="text-sm text-purple-200/60 leading-relaxed mb-5">
          {startup.description}
        </p>
      )}

      {/* Metrics row */}
      {(startup.metrics?.users || startup.metrics?.revenue || startup.metrics?.growth || startup.teamSize > 1) && (
        <div className="flex flex-wrap gap-3 mb-5">
          {startup.metrics?.users && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/10
                            border border-purple-500/15 text-xs font-medium text-purple-300/80">
              <Users className="w-3.5 h-3.5 text-purple-400" />
              {startup.metrics.users} users
            </div>
          )}
          {startup.metrics?.revenue && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-500/10
                            border border-green-500/15 text-xs font-medium text-green-300/80">
              <TrendingUp className="w-3.5 h-3.5 text-green-400" />
              {startup.metrics.revenue}
            </div>
          )}
          {startup.metrics?.growth && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10
                            border border-amber-500/15 text-xs font-medium text-amber-300/80">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              {startup.metrics.growth}
            </div>
          )}
          {startup.teamSize > 1 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/10
                            border border-blue-500/15 text-xs font-medium text-blue-300/80">
              <Users className="w-3.5 h-3.5 text-blue-400" />
              {startup.teamSize} people
            </div>
          )}
        </div>
      )}

      {/* Key features */}
      {startup.keyFeatures?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-5">
          {startup.keyFeatures.slice(0, 5).map(f => (
            <span key={f} className="text-xs px-2.5 py-1 rounded-lg bg-white/5
                                     text-purple-200/60 border border-purple-500/10">
              {f}
            </span>
          ))}
        </div>
      )}

      {/* Tech stack */}
      {startup.techStack?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-5">
          {startup.techStack.slice(0, 6).map(t => (
            <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/10
                                     text-purple-300/55 border border-purple-500/15">
              {t}
            </span>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-purple-500/10 flex items-center justify-between">
        {startup.website ? (
          <motion.a
            href={startup.website}
            target="_blank"
            rel="noreferrer"
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className="flex items-center gap-2 text-sm font-semibold text-purple-400
                       hover:text-purple-300 transition-colors"
          >
            Visit site <ExternalLink className="w-3.5 h-3.5" />
          </motion.a>
        ) : <span />}

        {startup.featured && (
          <span className="text-[10px] text-amber-400/70">⭐ Featured</span>
        )}
      </div>
    </motion.div>
  );
}

export default function StartupSection() {
  const [startups, setStartups] = useState([]);
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await API.get('/startup');
        setStartups(r.data.data || []);
      } catch {}
      finally { setLoading(false); }
    })();
  }, []);

  if (!loading && startups.length === 0) return null;

  return (
    <section id="startup" className="section-padding relative overflow-hidden">

      {/* bg accent */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                        w-[600px] h-[600px] opacity-[0.04] rounded-full"
          style={{ background: 'radial-gradient(circle, #F97316 0%, transparent 65%)' }} />
      </div>

      <div className="container-custom">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-block text-xs font-bold uppercase tracking-widest
                           text-purple-400 bg-purple-400/10 border border-purple-400/20
                           px-3 py-1.5 rounded-full mb-4">
            Startups
          </span>
          <h2 className="section-title">Ventures I've Built</h2>
          <p className="section-subtitle">
            From zero to product — companies and projects I've founded,
            built, and scaled.
          </p>
        </motion.div>

        {/* Cards */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-64 rounded-3xl bg-white/3 border border-purple-500/10 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {startups.map((s, i) => (
              <StartupCard key={s._id} startup={s} index={i} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
