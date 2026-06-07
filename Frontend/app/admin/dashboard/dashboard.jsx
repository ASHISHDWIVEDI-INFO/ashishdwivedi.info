'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  FolderKanban, Wrench, BookOpen, Mail, Eye,
  TrendingUp, ArrowRight, User, Award, FileDown,
  Building2, Briefcase, MessageSquareQuote, Loader2,
} from 'lucide-react';
import { getStorage } from '@/lib/utils';
import API from '@/lib/api';

const STAT_CARDS = [
  { label: 'Projects',      icon: FolderKanban, href: '/admin/projects',     color: '#7C3AED', api: '/projects'      },
  { label: 'Blog Posts',    icon: BookOpen,     href: '/admin/blog',         color: '#06b6d4', api: '/blog'          },
  { label: 'Skills',        icon: Wrench,       href: '/admin/skills',       color: '#F97316', api: '/skills'        },
  { label: 'Messages',      icon: Mail,         href: '/admin/contact',      color: '#10b981', api: '/contact'       },
  { label: 'Experience',    icon: Briefcase,    href: '/admin/experience',   color: '#f59e0b', api: '/experience'    },
  { label: 'Certifications',icon: Award,        href: '/admin/certifications',color: '#ec4899',api: '/certifications'},
  { label: 'Testimonials',  icon: MessageSquareQuote, href: '/admin/testimonials', color: '#8b5cf6', api: '/testimonials'},
  { label: 'Startups',      icon: Building2,    href: '/admin/startup',      color: '#14b8a6', api: '/startup'       },
];

const QUICK_ACTIONS = [
  { label: 'Add Project',       href: '/admin/projects/new',       icon: FolderKanban },
  { label: 'Write Blog Post',   href: '/admin/blog/new',           icon: BookOpen     },
  { label: 'Update Profile',    href: '/admin/profile',            icon: User         },
  { label: 'Upload Resume',     href: '/admin/resume',             icon: FileDown     },
];

export default function AdminDashboardPage() {
  const [user,   setUser]   = useState(null);
  const [counts, setCounts] = useState({});
  const [loading,setLoading]= useState(true);

  useEffect(() => {
    setUser(getStorage('admin_user'));

    // Fetch counts in parallel
    Promise.allSettled(
      STAT_CARDS.map(card =>
        API.get(card.api)
          .then(res => ({
            key: card.api,
            count: Array.isArray(res.data.data)
              ? res.data.data.length
              : res.data.total || 0,
          }))
      )
    ).then(results => {
      const c = {};
      results.forEach(r => {
        if (r.status === 'fulfilled') c[r.value.key] = r.value.count;
      });
      setCounts(c);
      setLoading(false);
    });
  }, []);

  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">

      {/* ── Welcome ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-6 border border-purple-500/20 overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(6,182,212,0.08) 100%)' }}
      >
        {/* bg orb */}
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full opacity-20 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #7C3AED, transparent)' }} />

        <p className="text-sm text-purple-300/70 mb-1">{greeting} 👋</p>
        <h1 className="text-2xl font-bold text-white font-heading">
          Welcome back, {user?.name?.split(' ')[0] || 'Admin'}!
        </h1>
        <p className="text-sm text-purple-300/60 mt-1">
          Manage your portfolio content from here. Everything is up to date.
        </p>
      </motion.div>

      {/* ── Stats grid ── */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest text-purple-400/50 mb-3">
          Content Overview
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {STAT_CARDS.map((card, i) => {
            const Icon  = card.icon;
            const count = counts[card.api];
            return (
              <motion.div
                key={card.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
              >
                <Link
                  href={card.href}
                  className="flex flex-col gap-3 p-4 rounded-2xl border border-purple-500/10
                             bg-white/3 hover:bg-white/6 hover:border-purple-500/25
                             transition-all duration-200 group"
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center"
                    style={{ background: `${card.color}22` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: card.color }} />
                  </div>
                  <div>
                    {loading ? (
                      <Loader2 className="w-4 h-4 text-purple-400/40 animate-spin mb-1" />
                    ) : (
                      <p className="text-2xl font-bold text-white">{count ?? '—'}</p>
                    )}
                    <p className="text-xs text-purple-300/50 group-hover:text-purple-300/80
                                  transition-colors">{card.label}</p>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* ── Quick actions ── */}
      <div>
        <h2 className="text-xs font-bold uppercase tracking-widest text-purple-400/50 mb-3">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {QUICK_ACTIONS.map((action, i) => {
            const Icon = action.icon;
            return (
              <motion.div
                key={action.label}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
              >
                <Link
                  href={action.href}
                  className="flex items-center gap-3 p-4 rounded-2xl border border-purple-500/10
                             bg-white/3 hover:bg-purple-600/10 hover:border-purple-500/30
                             transition-all duration-200 group"
                >
                  <div className="w-9 h-9 rounded-xl bg-purple-600/20 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-purple-400" />
                  </div>
                  <span className="text-sm font-medium text-purple-200/80
                                   group-hover:text-white transition-colors flex-1">
                    {action.label}
                  </span>
                  <ArrowRight className="w-4 h-4 text-purple-400/30
                                         group-hover:text-purple-400 group-hover:translate-x-0.5
                                         transition-all" />
                </Link>
              </motion.div>
            );
          })}
        </div>
      </div>

    </div>
  );
}