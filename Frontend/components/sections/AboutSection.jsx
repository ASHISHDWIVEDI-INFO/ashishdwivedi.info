'use client';

import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import {
  Download, MapPin, Mail, Calendar, Sparkles,
  Target, Eye, ArrowRight, CheckCircle,
} from 'lucide-react';
import { getImageUrl } from '@/lib/utils';

// ── Fade-up wrapper ───────────────────────────
function FadeUp({ children, delay = 0, className = '' }) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.15 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 32 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.65, delay, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// ── Animated stat card ────────────────────────
function StatCard({ value, suffix = '+', label, color, delay = 0 }) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.4 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay, type: 'spring', stiffness: 150 }}
      className="relative flex flex-col items-center justify-center p-5 rounded-2xl
                 border border-purple-500/15 bg-white/3 overflow-hidden text-center
                 hover:border-purple-500/30 transition-all duration-300 group"
    >
      {/* Glow bg on hover */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle at 50% 50%, ${color}15 0%, transparent 65%)` }}
      />

      <div className="relative text-3xl font-bold font-heading text-white mb-1">
        {inView ? (
          <CountUp end={value} duration={2.2} delay={delay} suffix={suffix} />
        ) : (
          <span>0{suffix}</span>
        )}
      </div>
      <div className="text-xs text-purple-300/60 font-medium">{label}</div>

      {/* Bottom accent line */}
      <div
        className="absolute bottom-0 left-0 right-0 h-0.5 opacity-0
                   group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, transparent, ${color}, transparent)` }}
      />
    </motion.div>
  );
}

// ── Highlight point ───────────────────────────
function HighlightPoint({ text, delay }) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.5 });
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, x: -16 }}
      animate={inView ? { opacity: 1, x: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className="flex items-start gap-2.5"
    >
      <CheckCircle className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
      <span className="text-sm text-purple-200/75 leading-relaxed">{text}</span>
    </motion.div>
  );
}

// ========================
// About Section
// ========================
export default function AboutSection({ profile }) {
  const sectionRef = useRef(null);

  // Subtle parallax on the photo
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  });
  const photoY = useTransform(scrollYProgress, [0, 1], [-20, 20]);

  const p        = profile || {};
  const stats    = p.stats || {};
  const socials  = p.socialLinks || {};

  const highlights = [
    p.about?.split('.')[0] || 'Passionate entrepreneur with expertise in software development',
    `${stats.yearsExperience || 5}+ years building scalable products from 0 to 1`,
    `Founded ${stats.startupsFounded || 3} startups with multiple successful exits`,
    `Worked with ${stats.happyClients || 30}+ enterprise clients across India and globally`,
  ];

  return (
    <section id="about" ref={sectionRef} className="section-padding relative overflow-hidden">

      {/* Background accent */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] opacity-[0.04] rounded-full"
          style={{ background: 'radial-gradient(circle, #7C3AED 0%, transparent 65%)' }} />
      </div>

      <div className="container-custom">

        {/* ── Section header ── */}
        <FadeUp className="text-center mb-16">
          <span className="inline-block text-xs font-bold uppercase tracking-widest
                           text-purple-400 bg-purple-400/10 border border-purple-400/20
                           px-3 py-1.5 rounded-full mb-4">
            About Me
          </span>
          <h2 className="section-title">The Person Behind the Code</h2>
          <p className="section-subtitle">
            Entrepreneur, engineer, and builder. I turn ideas into
            products that scale.
          </p>
        </FadeUp>

        {/* ── Main grid ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center mb-16">

          {/* Left — Photo + quick facts */}
          <FadeUp delay={0.1}>
            <div className="relative flex justify-center lg:justify-end">

              {/* Decorative ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-4 rounded-3xl border border-dashed border-purple-500/15 pointer-events-none"
              />

              {/* Main photo card */}
              <motion.div
                style={{ y: photoY }}
                whileHover={{ scale: 1.02 }}
                transition={{ type: 'spring', stiffness: 200, damping: 25 }}
                className="relative w-full max-w-sm"
              >
                {/* Photo */}
                <div className="relative rounded-3xl overflow-hidden border border-purple-500/20
                                shadow-[0_20px_60px_rgba(124,58,237,0.2)]"
                  style={{ aspectRatio: '4/5' }}>
                  {p.photoFileId ? (
                    <img
                      src={getImageUrl(p.photoFileId)}
                      alt={p.name || 'Profile photo'}
                      className="w-full h-full object-cover transition-transform duration-700
                                 hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"
                      style={{ background: 'linear-gradient(135deg, #141435, #2a1a4e)' }}>
                      <span className="text-8xl font-bold text-purple-500/20 font-heading">
                        {(p.name || 'AD').split(' ').map(n => n[0]).join('').slice(0,2)}
                      </span>
                    </div>
                  )}

                  {/* Gradient overlay at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
                    style={{ background: 'linear-gradient(to top, rgba(7,7,26,.8) 0%, transparent 100%)' }} />

                  {/* Location badge inside photo */}
                  {p.location && (
                    <div className="absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1.5
                                    rounded-full bg-[#07071a]/90 border border-purple-500/20 text-xs
                                    font-medium text-purple-200/80 backdrop-blur-sm">
                      <MapPin className="w-3 h-3 text-purple-400" />
                      {p.location}
                    </div>
                  )}
                </div>

                {/* Experience badge (top right) */}
                <motion.div
                  initial={{ opacity: 0, scale: 0, x: 20 }}
                  whileInView={{ opacity: 1, scale: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
                  className="absolute -top-4 -right-4 flex flex-col items-center justify-center
                             w-20 h-20 rounded-2xl border border-purple-500/25 shadow-xl"
                  style={{ background: 'rgba(13,13,40,0.95)' }}
                >
                  <span className="text-2xl font-bold text-white font-heading leading-none">
                    {stats.yearsExperience || 5}+
                  </span>
                  <span className="text-[10px] text-purple-400/70 text-center leading-tight mt-0.5">
                    Years<br/>Exp
                  </span>
                </motion.div>

                {/* Projects badge (bottom left) */}
                <motion.div
                  initial={{ opacity: 0, scale: 0, x: -20 }}
                  whileInView={{ opacity: 1, scale: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
                  className="absolute -bottom-4 -left-4 flex items-center gap-2.5 px-4 py-3
                             rounded-2xl border border-purple-500/25 shadow-xl"
                  style={{ background: 'rgba(13,13,40,0.95)' }}
                >
                  <div className="w-9 h-9 rounded-xl bg-purple-500/20 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-white leading-none">
                      {stats.projectsCompleted || 50}+
                    </p>
                    <p className="text-[10px] text-purple-400/60 mt-0.5">Projects done</p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </FadeUp>

          {/* Right — Text content */}
          <div className="space-y-6">
            <FadeUp delay={0.15}>
              <h3 className="text-2xl sm:text-3xl font-bold text-white font-heading leading-snug">
                Hi, I'm{' '}
                <span className="text-transparent bg-clip-text"
                  style={{ backgroundImage: 'linear-gradient(135deg, #7C3AED, #06b6d4)' }}>
                  {p.name?.split(' ')[0] || 'Ashish'}
                </span>
                {' '}—{' '}
                {p.title || 'Founder & Software Engineer'}
              </h3>
            </FadeUp>

            <FadeUp delay={0.2}>
              <p className="text-base text-purple-200/70 leading-relaxed">
                {p.bio || p.about?.slice(0, 400) ||
                  `Passionate entrepreneur with deep expertise in software development, cloud 
                   infrastructure, and startup growth. I specialize in building scalable systems 
                   that solve real-world problems and create lasting impact.`}
              </p>
            </FadeUp>

            {/* Highlight points */}
            <div className="space-y-3">
              {highlights.map((item, i) => (
                <HighlightPoint key={i} text={item} delay={0.25 + i * 0.07} />
              ))}
            </div>

            <FadeUp delay={0.5}>
              <div className="flex flex-wrap gap-3 pt-2">
                <motion.a
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  href={`${process.env.NEXT_PUBLIC_API_URL}/profile/resume/download`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                             text-white transition-all"
                  style={{ background: 'linear-gradient(135deg, #7C3AED, #6d28d9)' }}
                >
                  <Download className="w-4 h-4" />Download Resume
                </motion.a>

                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => document.getElementById('contact')
                    ?.scrollIntoView({ behavior: 'smooth' })}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold
                             border border-purple-500/35 text-purple-300 hover:bg-purple-500/15
                             transition-all"
                >
                  Get in touch <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </FadeUp>
          </div>
        </div>

        {/* ── Stats row ── */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
          {[
            { value: stats.yearsExperience   || 5,  suffix: '+', label: 'Years Experience',   color: '#7C3AED', delay: 0    },
            { value: stats.projectsCompleted || 50, suffix: '+', label: 'Projects Completed', color: '#06b6d4', delay: 0.1  },
            { value: stats.happyClients      || 30, suffix: '+', label: 'Happy Clients',      color: '#F97316', delay: 0.2  },
            { value: stats.startupsFounded   || 3,  suffix: '',  label: 'Startups Founded',   color: '#10b981', delay: 0.3  },
          ].map((s) => (
            <StatCard key={s.label} {...s} />
          ))}
        </div>

        {/* ── Mission & Vision cards ── */}
        {(p.mission || p.vision) && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-16">
            {p.mission && (
              <FadeUp delay={0.1}>
                <div className="h-full p-6 rounded-2xl border border-purple-500/20 bg-white/3
                                hover:border-purple-500/35 transition-all duration-300 group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/20
                                    flex items-center justify-center group-hover:bg-purple-500/30
                                    transition-colors">
                      <Target className="w-5 h-5 text-purple-400" />
                    </div>
                    <h4 className="text-base font-bold text-white">Mission</h4>
                  </div>
                  <p className="text-sm text-purple-200/65 leading-relaxed">{p.mission}</p>
                </div>
              </FadeUp>
            )}
            {p.vision && (
              <FadeUp delay={0.2}>
                <div className="h-full p-6 rounded-2xl border border-cyan-500/20 bg-white/3
                                hover:border-cyan-500/35 transition-all duration-300 group">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/20
                                    flex items-center justify-center group-hover:bg-cyan-500/25
                                    transition-colors">
                      <Eye className="w-5 h-5 text-cyan-400" />
                    </div>
                    <h4 className="text-base font-bold text-white">Vision</h4>
                  </div>
                  <p className="text-sm text-purple-200/65 leading-relaxed">{p.vision}</p>
                </div>
              </FadeUp>
            )}
          </div>
        )}

        {/* ── Quick facts row ── */}
        <FadeUp delay={0.1}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                icon: Mail,
                label: 'Email',
                value: p.email || 'ashish@ashishdwivedi.info',
                href:  `mailto:${p.email || 'ashish@ashishdwivedi.info'}`,
                color: '#7C3AED',
              },
              {
                icon: MapPin,
                label: 'Location',
                value: p.location || 'New Delhi, India',
                color: '#F97316',
              },
              {
                icon: Calendar,
                label: 'Available',
                value: p.availability === 'available'
                  ? 'Open to new projects'
                  : p.availability === 'busy'
                  ? 'Limited availability'
                  : 'Currently unavailable',
                color: '#10b981',
              },
            ].map(({ icon: Icon, label, value, href, color }) => (
              <motion.div
                key={label}
                whileHover={{ y: -3 }}
                className="flex items-center gap-3.5 p-4 rounded-xl border border-purple-500/15
                           bg-white/3 hover:border-purple-500/30 transition-all duration-200"
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-purple-400/50 uppercase tracking-widest font-semibold mb-0.5">
                    {label}
                  </p>
                  {href ? (
                    <a href={href}
                      className="text-sm font-medium text-purple-100/80 hover:text-white
                                 transition-colors truncate block">
                      {value}
                    </a>
                  ) : (
                    <p className="text-sm font-medium text-purple-100/80 truncate">{value}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </FadeUp>
      </div>
    </section>
  );
}
