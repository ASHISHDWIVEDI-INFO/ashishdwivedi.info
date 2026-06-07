'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, Lock, Mail, Loader2, AlertCircle, ShieldCheck } from 'lucide-react';
import { authAPI } from '@/lib/api';
import { setStorage } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminLoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (token) router.push('/admin/dashboard');
  }, [router]);

  const onSubmit = async (data) => {
    setIsLoading(true);
    setError('');
    try {
      const res = await authAPI.login(data);
      const { accessToken, refreshToken, user } = res.data;

      setStorage('admin_token', accessToken);
      setStorage('admin_refresh', refreshToken);
      setStorage('admin_user', user);

      toast.success(`Welcome back, ${user.name}! 👋`);
      router.push('/admin/dashboard');
    } catch (err) {
      const msg =
        err?.response?.data?.message || 'Login failed. Please try again.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#07071a]">

      {/* ── Animated background blobs ── */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
        <motion.div
          animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.5, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[-10%] left-[-5%] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.35) 0%, transparent 70%)' }}
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut', delay: 2 }}
          className="absolute bottom-[-10%] right-[-5%] w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(249,115,22,0.25) 0%, transparent 70%)' }}
        />
        <motion.div
          animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut', delay: 4 }}
          className="absolute top-[40%] right-[20%] w-[300px] h-[300px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.2) 0%, transparent 70%)' }}
        />
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(124,58,237,1) 1px, transparent 1px),
                              linear-gradient(90deg, rgba(124,58,237,1) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* ── Login Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div
          className="rounded-3xl p-8 border border-purple-500/20 shadow-2xl"
          style={{
            background: 'rgba(13, 13, 40, 0.85)',
            backdropFilter: 'blur(20px)',
            WebkitBackdropFilter: 'blur(20px)',
            boxShadow: '0 0 60px rgba(124,58,237,0.15), 0 25px 50px rgba(0,0,0,0.5)',
          }}
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4"
              style={{
                background: 'linear-gradient(135deg, #7C3AED, #06b6d4)',
                boxShadow: '0 0 30px rgba(124,58,237,0.4)',
              }}
            >
              <ShieldCheck className="w-8 h-8 text-white" />
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-2xl font-bold text-white font-heading mb-1"
            >
              Admin Portal
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-sm text-purple-300/70"
            >
              Ashish Dwivedi — Portfolio CMS
            </motion.p>
          </div>

          {/* Error Alert */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, height: 'auto', marginBottom: 16 }}
                exit={{ opacity: 0, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.25 }}
                className="flex items-start gap-3 p-4 rounded-xl border border-red-500/30 bg-red-500/10"
              >
                <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                <p className="text-sm text-red-300 leading-relaxed">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-purple-200/80 mb-1.5">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/60 pointer-events-none" />
                <input
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /^\S+@\S+\.\S+$/,
                      message: 'Enter a valid email address',
                    },
                  })}
                  type="email"
                  autoComplete="email"
                  placeholder="admin@ashishdwivedi.info"
                  disabled={isLoading}
                  className={`
                    w-full pl-10 pr-4 py-3 rounded-xl text-sm text-white
                    border transition-all duration-200 outline-none
                    bg-white/5 placeholder-white/25
                    focus:ring-2 focus:ring-purple-500/50
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${errors.email
                      ? 'border-red-500/60 bg-red-500/5'
                      : 'border-purple-500/20 hover:border-purple-500/40 focus:border-purple-500/60'
                    }
                  `}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-purple-200/80 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/60 pointer-events-none" />
                <input
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  disabled={isLoading}
                  className={`
                    w-full pl-10 pr-11 py-3 rounded-xl text-sm text-white
                    border transition-all duration-200 outline-none
                    bg-white/5 placeholder-white/25
                    focus:ring-2 focus:ring-purple-500/50
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${errors.password
                      ? 'border-red-500/60 bg-red-500/5'
                      : 'border-purple-500/20 hover:border-purple-500/40 focus:border-purple-500/60'
                    }
                  `}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-purple-400/60 hover:text-purple-300 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword
                    ? <EyeOff className="w-4 h-4" />
                    : <Eye className="w-4 h-4" />
                  }
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
              className="w-full py-3 px-6 rounded-xl text-sm font-semibold text-white
                         transition-all duration-200 mt-2 relative overflow-hidden
                         disabled:opacity-70 disabled:cursor-not-allowed
                         focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2
                         focus:ring-offset-transparent"
              style={{
                background: 'linear-gradient(135deg, #7C3AED 0%, #6d28d9 100%)',
                boxShadow: isLoading ? 'none' : '0 0 20px rgba(124,58,237,0.4)',
              }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in…
                </span>
              ) : (
                'Sign in to Admin Panel'
              )}
            </motion.button>
          </form>

          {/* Footer note */}
          <p className="mt-6 text-center text-xs text-purple-400/40">
            Protected area • Authorized access only
          </p>
        </div>

        {/* Back to site link */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-4"
        >
          <a
            href="/"
            className="text-xs text-purple-400/50 hover:text-purple-300 transition-colors"
          >
            ← Back to portfolio
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
}
