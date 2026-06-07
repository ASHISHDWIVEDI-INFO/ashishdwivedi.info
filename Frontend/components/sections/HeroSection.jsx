'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import {
  Download, ArrowRight, Github, Linkedin, Twitter,
  Instagram, Youtube, Globe, Sparkles, MapPin,
  ExternalLink,
} from 'lucide-react';
import { getImageUrl } from '@/lib/utils';

// ── Floating tech icon pill ───────────────────
const TECH_ICONS = [
  { label: 'React',      color: '#61DAFB', emoji: '⚛️',  x: '8%',   y: '18%', delay: 0    },
  { label: 'Node.js',    color: '#68D391', emoji: '🟢',  x: '85%',  y: '22%', delay: 0.3  },
  { label: 'AWS',        color: '#FF9900', emoji: '☁️',  x: '6%',   y: '72%', delay: 0.6  },
  { label: 'TypeScript', color: '#3178C6', emoji: '🔷',  x: '88%',  y: '68%', delay: 0.9  },
  { label: 'MongoDB',    color: '#47A248', emoji: '🍃',  x: '15%',  y: '88%', delay: 1.2  },
  { label: 'Docker',     color: '#2496ED', emoji: '🐳',  x: '80%',  y: '88%', delay: 0.4  },
  { label: 'Next.js',    color: '#ffffff', emoji: '▲',   x: '3%',   y: '45%', delay: 0.8  },
  { label: 'Python',     color: '#3776AB', emoji: '🐍',  x: '92%',  y: '45%', delay: 1.1  },
];

// ── Social icon map ───────────────────────────
const SOCIAL_ICONS = {
  linkedin:  { icon: Linkedin,  color: '#0A66C2', label: 'LinkedIn'  },
  github:    { icon: Github,    color: '#ffffff', label: 'GitHub'    },
  twitter:   { icon: Twitter,   color: '#1DA1F2', label: 'X/Twitter' },
  instagram: { icon: Instagram, color: '#E4405F', label: 'Instagram' },
  youtube:   { icon: Youtube,   color: '#FF0000', label: 'YouTube'   },
  website:   { icon: Globe,     color: '#7C3AED', label: 'Website'   },
};

// ── Floating particle ─────────────────────────
function FloatingIcon({ tech }) {
  return (
    <motion.div
      className="absolute hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-full
                 border border-white/10 backdrop-blur-sm select-none pointer-events-none"
      style={{
        left: tech.x, top: tech.y,
        background: 'rgba(13,13,40,0.75)',
      }}
      animate={{
        y:       [0, -10, 0],
        opacity: [0.7, 1, 0.7],
      }}
      transition={{
        duration:   3 + tech.delay,
        repeat:     Infinity,
        ease:       'easeInOut',
        delay:      tech.delay,
      }}
    >
      <span className="text-sm">{tech.emoji}</span>
      <span className="text-xs font-medium" style={{ color: tech.color }}>{tech.label}</span>
    </motion.div>
  );
}

// ── Stats counter ─────────────────────────────
function StatCounter({ value, suffix = '+', label, delay = 0 }) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.3 });
  const isString = typeof value === 'string';

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ delay, duration: 0.5 }}
      className="text-center"
    >
      <div className="text-2xl sm:text-3xl font-bold font-heading text-white">
        {inView && !isString ? (
          <CountUp end={value} duration={2} delay={delay} suffix={suffix} />
        ) : (
          <span>{value}{suffix}</span>
        )}
      </div>
      <div className="text-xs text-purple-300/60 mt-0.5">{label}</div>
    </motion.div>
  );
}

// ========================
// Hero Section
// ========================
export default function HeroSection({ profile }) {
  const containerRef = useRef(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // ── Parallax on scroll ────────────────────
  const { scrollY } = useScroll();
  const yParallax   = useTransform(scrollY, [0, 600], [0, -80]);
  const opacityHero = useTransform(scrollY, [0, 400], [1, 0]);

  // ── Mouse-following gradient glow ─────────
  useEffect(() => {
    const onMove = (e) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setMousePos({
        x: ((e.clientX - rect.left) / rect.width)  * 100,
        y: ((e.clientY - rect.top)  / rect.height) * 100,
      });
    };
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  const p = profile || {};
  const socials = p.socialLinks || {};
  const stats   = p.stats || {};

  // ── Typing strings from profile title ─────
  const typingSequence = [
    p.title || 'Founder & CEO',           2000,
    'Software Engineer',                   2000,
    'Full Stack Developer',                2000,
    'Cloud Architect',                     2000,
    'Startup Entrepreneur',                2000,
  ];

  // Availability badge color
  const availColor = {
    available:      { dot: 'bg-green-400', text: 'text-green-400', label: 'Available for work' },
    busy:           { dot: 'bg-amber-400', text: 'text-amber-400', label: 'Limited availability' },
    'not-available':{ dot: 'bg-red-400',   text: 'text-red-400',   label: 'Not available'        },
  }[p.availability || 'available'];

  return (
    <section
      id="hero"
      ref={containerRef}
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: 'var(--bg-primary, #07071a)' }}
    >
      {/* ── Animated mesh background ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        {/* Static gradient orbs */}
        <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full opacity-25"
          style={{ background: 'radial-gradient(circle, #7C3AED 0%, transparent 65%)' }} />
        <div className="absolute bottom-[-15%] right-[-10%] w-[500px] h-[500px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(circle, #F97316 0%, transparent 65%)' }} />
        <div className="absolute top-[40%] right-[15%] w-[300px] h-[300px] rounded-full opacity-15"
          style={{ background: 'radial-gradient(circle, #06b6d4 0%, transparent 65%)' }} />

        {/* Mouse-follow glow */}
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-[0.08] transition-all
                     duration-700 ease-out pointer-events-none"
          style={{
            background: 'radial-gradient(circle, #7C3AED 0%, transparent 60%)',
            left:   `calc(${mousePos.x}% - 300px)`,
            top:    `calc(${mousePos.y}% - 300px)`,
          }}
        />

        {/* Subtle grid */}
        <div className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(124,58,237,.8) 1px, transparent 1px),
              linear-gradient(90deg, rgba(124,58,237,.8) 1px, transparent 1px)`,
            backgroundSize: '60px 60px',
          }}
        />

        {/* Animated gradient sweep */}
        <motion.div
          animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 opacity-[0.04]"
          style={{
            background: 'linear-gradient(270deg, #7C3AED, #06b6d4, #F97316, #7C3AED)',
            backgroundSize: '400% 400%',
          }}
        />
      </div>

      {/* ── Floating tech icons ── */}
      {TECH_ICONS.map((tech) => (
        <FloatingIcon key={tech.label} tech={tech} />
      ))}

      {/* ── Main content ── */}
      <motion.div
        style={{ y: yParallax, opacity: opacityHero }}
        className="relative z-10 container-custom pt-28 pb-16 sm:pt-32"
      >
        <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">

          {/* Left — Text content */}
          <div className="flex-1 text-center lg:text-left">

            {/* Availability badge */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs
                         font-medium border border-white/10 bg-white/5 backdrop-blur-sm mb-6"
            >
              <span className={`w-2 h-2 rounded-full ${availColor.dot} animate-pulse`} />
              <span className={availColor.text}>{availColor.label}</span>
              {p.location && (
                <>
                  <span className="text-purple-400/30">·</span>
                  <MapPin className="w-3 h-3 text-purple-400/50" />
                  <span className="text-purple-300/60">{p.location}</span>
                </>
              )}
            </motion.div>

            {/* Name */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold font-heading
                         text-white leading-[1.05] mb-4"
            >
              {p.name || 'Ashish Dwivedi'}
            </motion.h1>

            {/* Typing title */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
              className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-5 h-10"
            >
              <span className="text-transparent bg-clip-text"
                style={{ backgroundImage: 'linear-gradient(135deg, #7C3AED, #06b6d4)' }}>
                <TypeAnimation
                  sequence={typingSequence}
                  wrapper="span"
                  speed={50}
                  repeat={Infinity}
                  cursor={true}
                />
              </span>
            </motion.div>

            {/* Tagline / Bio */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45 }}
              className="text-base sm:text-lg text-purple-200/70 max-w-xl leading-relaxed
                         mb-8 mx-auto lg:mx-0"
            >
              {p.tagline || 'Building scalable digital products and startups.'}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55 }}
              className="flex flex-wrap items-center gap-3 justify-center lg:justify-start mb-8"
            >
              {/* Primary CTA */}
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: '0 0 30px rgba(124,58,237,0.5)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold
                           text-white transition-all"
                style={{ background: 'linear-gradient(135deg, #7C3AED, #6d28d9)' }}
              >
                View Portfolio <ArrowRight className="w-4 h-4" />
              </motion.button>

              {/* Secondary CTA */}
              <motion.button
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
                className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold
                           border border-purple-500/40 text-purple-300 hover:bg-purple-500/15
                           transition-all backdrop-blur-sm"
              >
                Contact Me
              </motion.button>

              {/* Resume download */}
              {p.resumeFileId && (
                <motion.a
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  href={`${process.env.NEXT_PUBLIC_API_URL}/profile/resume/download`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-medium
                             text-purple-300/70 hover:text-purple-300 transition-all
                             border border-purple-500/20 hover:border-purple-500/40"
                >
                  <Download className="w-4 h-4" />Resume
                </motion.a>
              )}
            </motion.div>

            {/* Social links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
              className="flex items-center gap-3 justify-center lg:justify-start"
            >
              {Object.entries(SOCIAL_ICONS).map(([key, { icon: Icon, color, label }]) => {
                const url = socials[key];
                if (!url) return null;
                return (
                  <motion.a
                    key={key}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={label}
                    whileHover={{ scale: 1.2, y: -3 }}
                    whileTap={{ scale: 0.9 }}
                    className="w-9 h-9 rounded-xl flex items-center justify-center
                               border border-purple-500/20 bg-white/5 backdrop-blur-sm
                               transition-all hover:border-purple-500/50"
                    style={{ '--hover-color': color }}
                  >
                    <Icon className="w-4 h-4 text-purple-300/70" />
                  </motion.a>
                );
              })}
            </motion.div>
          </div>

          {/* Right — Profile photo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.85, x: 40 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="shrink-0"
          >
            <div className="relative">
              {/* Spinning ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-3 rounded-full border border-dashed border-purple-500/20"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                className="absolute -inset-6 rounded-full border border-dashed border-cyan-500/10"
              />

              {/* Glow backdrop */}
              <div className="absolute inset-0 rounded-full opacity-60 blur-3xl"
                style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.5) 0%, transparent 70%)' }} />

              {/* Photo */}
              <div className="relative w-56 h-56 sm:w-64 sm:h-64 lg:w-72 lg:h-72 rounded-full
                              overflow-hidden border-2 border-purple-500/30
                              shadow-[0_0_60px_rgba(124,58,237,0.3)]">
                {p.photoFileId ? (
                  <img
                    src={getImageUrl(p.photoFileId)}
                    alt={p.name || 'Profile photo'}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  /* Placeholder gradient */
                  <div className="w-full h-full flex items-center justify-center"
                    style={{ background: 'linear-gradient(135deg, #141435, #2a1a4e)' }}>
                    <span className="text-6xl font-bold text-purple-500/30 font-heading">
                      {(p.name || 'AD').split(' ').map(n => n[0]).join('').toUpperCase().slice(0,2)}
                    </span>
                  </div>
                )}
              </div>

              {/* Floating badge — open to work */}
              {p.availability === 'available' && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1, type: 'spring', stiffness: 200 }}
                  className="absolute -bottom-2 -right-2 flex items-center gap-1.5 px-3 py-1.5
                             rounded-full text-xs font-semibold border border-green-500/30
                             bg-[#07071a] shadow-lg"
                >
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="text-green-400">Open to work</span>
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        {/* ── Stats row ── */}
        {(stats.yearsExperience || stats.projectsCompleted || stats.happyClients || stats.startupsFounded) && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            className="mt-14 pt-8 border-t border-purple-500/10"
          >
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 sm:gap-8">
              {[
                { value: stats.yearsExperience  || 5,  suffix: '+', label: 'Years Experience'   },
                { value: stats.projectsCompleted|| 50, suffix: '+', label: 'Projects Completed'  },
                { value: stats.happyClients     || 30, suffix: '+', label: 'Happy Clients'       },
                { value: stats.startupsFounded  || 3,  suffix: '',  label: 'Startups Founded'    },
              ].map((s, i) => (
                <StatCounter key={s.label} {...s} delay={0.1 * i} />
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Scroll hint ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex justify-center mt-14"
        >
          <motion.button
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
            className="flex flex-col items-center gap-1.5 text-purple-400/40
                       hover:text-purple-400/70 transition-colors"
            aria-label="Scroll to next section"
          >
            <span className="text-[10px] uppercase tracking-widest">Scroll</span>
            <div className="w-px h-8 bg-gradient-to-b from-purple-500/50 to-transparent" />
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
}
