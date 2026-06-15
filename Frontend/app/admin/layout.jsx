'use client';

import { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, User, FolderKanban, Wrench, Briefcase,
  GraduationCap, Building2, BookOpen, Award, Trophy,
  MessageSquareQuote, Newspaper, Mail, FileDown, ImageIcon,
  Settings, LogOut, Menu, X, ChevronRight, Shield,
  Bell, Moon, Sun,
} from 'lucide-react';
import { getStorage, removeStorage } from '@/lib/utils';
import { authAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { useTheme } from 'next-themes';

// ========================
// Nav items definition
// ========================
const NAV_ITEMS = [
  { label: 'Dashboard',    href: '/admin/dashboard',     icon: LayoutDashboard },
  { label: 'Profile',      href: '/admin/profile',       icon: User },
  { type: 'divider', label: 'CONTENT' },
  { label: 'Projects',     href: '/admin/projects',      icon: FolderKanban },
  { label: 'Skills',       href: '/admin/skills',        icon: Wrench },
  { label: 'Experience',   href: '/admin/experience',    icon: Briefcase },
  { label: 'Education',    href: '/admin/education',     icon: GraduationCap },
  { label: 'Startup',      href: '/admin/startup',       icon: Building2 },
  { label: 'Blog',         href: '/admin/blog',          icon: BookOpen },
  { label: 'Certifications',href: '/admin/certifications',icon: Award },
  { label: 'Achievements', href: '/admin/achievements',  icon: Trophy },
  { label: 'Testimonials', href: '/admin/testimonials',  icon: MessageSquareQuote },
  { label: 'Media & Press',href: '/admin/media-press',   icon: Newspaper },
  { type: 'divider', label: 'MANAGE' },
  { label: 'Messages',     href: '/admin/contact',       icon: Mail, badge: 'new' },
  { label: 'Resume',       href: '/admin/resume',        icon: FileDown },
  { label: 'Media Library',href: '/admin/media',         icon: ImageIcon },
  { label: 'Settings',     href: '/admin/settings',      icon: Settings },
];

// ========================
// Sidebar Nav Item
// ========================
function NavItem({ item, isActive, onClick }) {
  if (item.type === 'divider') {
    return (
      <div className="px-3 pt-4 pb-1">
        <p className="text-[10px] font-bold tracking-widest text-purple-400/40 uppercase">
          {item.label}
        </p>
      </div>
    );
  }

  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={`
        relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium
        transition-all duration-150 group
        ${isActive
          ? 'bg-purple-600/20 text-purple-300 border border-purple-500/25'
          : 'text-purple-300/60 hover:text-purple-200 hover:bg-white/5'
        }
      `}
    >
      {isActive && (
        <motion.div
          layoutId="activeNav"
          className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-purple-400 rounded-full"
        />
      )}
      <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-purple-400' : 'text-purple-400/50 group-hover:text-purple-400/80'}`} />
      <span className="truncate">{item.label}</span>
      {item.badge && (
        <span className="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-500 text-white">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

// ========================
// Sidebar Component
// ========================
function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const router   = useRouter();
  const [user, setUser] = useState(null);

  useEffect(() => {
    setUser(getStorage('admin_user'));
  }, []);

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch {}
    removeStorage('admin_token');
    removeStorage('admin_refresh');
    removeStorage('admin_user');
    toast.success('Logged out successfully');
    router.push('/admin/login');
  };

  const sidebarContent = (
    <div className="flex flex-col h-full">

      {/* Logo */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-purple-500/10">
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: 'linear-gradient(135deg, #7C3AED, #06b6d4)' }}
        >
          <Shield className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-white truncate">Admin Panel</p>
          <p className="text-[11px] text-purple-400/50 truncate">ashishdwivedi.info</p>
        </div>
        {/* Close on mobile */}
        <button
          onClick={onClose}
          className="ml-auto p-1.5 rounded-lg hover:bg-white/5 text-purple-400/50
                     hover:text-purple-300 transition-colors lg:hidden"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5 scrollbar-thin
                      scrollbar-thumb-purple-800 scrollbar-track-transparent">
        {NAV_ITEMS.map((item, i) => (
          <NavItem
            key={item.href || `divider-${i}`}
            item={item}
            isActive={item.href ? pathname === item.href || pathname?.startsWith(item.href + '/') : false}
            onClick={onClose}
          />
        ))}
      </nav>

      {/* User + Logout */}
      <div className="p-3 border-t border-purple-500/10">
        {user && (
          <div className="flex items-center gap-3 px-2 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-purple-600/30 border border-purple-500/30
                            flex items-center justify-center text-xs font-bold text-purple-300 shrink-0">
              {user.name?.charAt(0)?.toUpperCase() || 'A'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-white truncate">{user.name}</p>
              <p className="text-[11px] text-purple-400/50 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm
                     font-medium text-red-400/70 hover:text-red-400 hover:bg-red-500/10
                     transition-all duration-150"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col w-60 shrink-0 h-screen sticky top-0
                   border-r border-purple-500/10"
        style={{ background: 'rgba(7, 7, 26, 0.98)', backdropFilter: 'blur(20px)' }}
      >
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={onClose}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 h-full w-64 z-50 flex flex-col lg:hidden
                         border-r border-purple-500/15"
              style={{ background: 'rgba(7, 7, 26, 0.99)' }}
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ========================
// Top Bar
// ========================
function TopBar({ onMenuClick, title }) {
  const { theme, setTheme } = useTheme();

  return (
    <header
      className="sticky top-0 z-30 flex items-center gap-4 px-4 sm:px-6 h-14
                 border-b border-purple-500/10"
      style={{ background: 'rgba(7, 7, 26, 0.92)', backdropFilter: 'blur(16px)' }}
    >
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="p-2 rounded-lg hover:bg-white/5 text-purple-400/60
                   hover:text-purple-300 transition-colors lg:hidden"
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Breadcrumb */}
      <div className="flex items-center gap-1.5 text-sm">
        <span className="text-purple-400/40">Admin</span>
        <ChevronRight className="w-3.5 h-3.5 text-purple-400/30" />
        <span className="text-white font-medium capitalize">{title}</span>
      </div>

      {/* Right actions */}
      <div className="ml-auto flex items-center gap-2">
        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2 rounded-lg hover:bg-white/5 text-purple-400/60
                     hover:text-purple-300 transition-colors"
          aria-label="Toggle theme"
        >
          {theme === 'dark'
            ? <Sun className="w-4 h-4" />
            : <Moon className="w-4 h-4" />
          }
        </button>

        {/* View site */}
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs
                     font-medium border border-purple-500/25 text-purple-300/70
                     hover:text-purple-300 hover:bg-purple-500/10 transition-all"
        >
          View Site ↗
        </a>
      </div>
    </header>
  );
}

// ========================
// Auth Guard
// ========================
function AuthGuard({ children }) {
  const router  = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);
  const [authed,  setAuthed]  = useState(false);

  useEffect(() => {
    const token = getStorage('admin_token');
    if (!token) {
      router.replace('/admin/login');
    } else {
      setAuthed(true);
    }
    setChecked(true);
  }, [pathname, router]);

  if (!checked) {
    return (
      <div className="min-h-screen bg-[#07071a] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent
                        rounded-full animate-spin" />
      </div>
    );
  }

  if (!authed) return null;

  return <>{children}</>;
}

// ========================
// Root Admin Layout
// ========================
export default function AdminLayout({ children }) {
  const pathname     = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Don't wrap login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Derive page title from URL
  const pageTitle = pathname
    ?.split('/')
    .filter(Boolean)
    .pop()
    ?.replace(/-/g, ' ') || 'dashboard';

  return (
    <AuthGuard>
      <div
        className="flex min-h-screen"
        style={{ background: 'var(--bg-primary, #07071a)' }}
      >
        <Sidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar
            onMenuClick={() => setSidebarOpen(true)}
            title={pageTitle}
          />

          <main className="flex-1 p-4 sm:p-6 overflow-auto">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {children}
            </motion.div>
          </main>
        </div>
      </div>
    </AuthGuard>
  );
}

