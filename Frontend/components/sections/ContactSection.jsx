'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Loader2, CheckCircle2, Mail, Phone,
  MapPin, Linkedin, Github, Twitter, Instagram,
  Globe, Youtube, ArrowRight,
} from 'lucide-react';
import { contactAPI } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';

// ── Floating label input ──────────────────────
function FloatingInput({ label, id, error, type = 'text', ...props }) {
  const [focused, setFocused] = useState(false);
  const hasValue = !!props.value;

  return (
    <div className="relative">
      <input
        id={id}
        type={type}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`
          peer w-full px-4 pt-6 pb-2 rounded-xl text-sm bg-white/5 border
          text-white placeholder-transparent focus:outline-none focus:ring-2
          focus:ring-purple-500/50 transition-all
          ${error
            ? 'border-red-500/50 bg-red-500/5'
            : focused
              ? 'border-purple-500/60'
              : 'border-purple-500/20 hover:border-purple-500/35'
          }
        `}
        placeholder={label}
        {...props}
      />
      <label
        htmlFor={id}
        className={`
          absolute left-4 transition-all duration-200 pointer-events-none
          ${focused || hasValue
            ? 'top-2 text-[10px] font-semibold tracking-widest uppercase'
            : 'top-1/2 -translate-y-1/2 text-sm'
          }
          ${error ? 'text-red-400' : focused ? 'text-purple-400' : 'text-purple-300/50'}
        `}
      >
        {label}
      </label>
      {error && (
        <p className="mt-1 text-xs text-red-400 pl-1">{error}</p>
      )}
    </div>
  );
}

// ── Floating label textarea ───────────────────
function FloatingTextarea({ label, id, error, rows = 5, ...props }) {
  const [focused, setFocused] = useState(false);
  const hasValue = !!props.value;

  return (
    <div className="relative">
      <textarea
        id={id}
        rows={rows}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className={`
          w-full px-4 pt-6 pb-2 rounded-xl text-sm bg-white/5 border
          text-white placeholder-transparent focus:outline-none focus:ring-2
          focus:ring-purple-500/50 transition-all resize-none
          ${error
            ? 'border-red-500/50 bg-red-500/5'
            : focused
              ? 'border-purple-500/60'
              : 'border-purple-500/20 hover:border-purple-500/35'
          }
        `}
        placeholder={label}
        {...props}
      />
      <label
        htmlFor={id}
        className={`
          absolute left-4 transition-all duration-200 pointer-events-none
          ${focused || hasValue
            ? 'top-2 text-[10px] font-semibold tracking-widest uppercase'
            : 'top-4 text-sm'
          }
          ${error ? 'text-red-400' : focused ? 'text-purple-400' : 'text-purple-300/50'}
        `}
      >
        {label}
      </label>
      {error && (
        <p className="mt-1 text-xs text-red-400 pl-1">{error}</p>
      )}
    </div>
  );
}

// ── Social icon map ───────────────────────────
const SOCIALS = {
  linkedin:  { icon: Linkedin,  color: '#0A66C2' },
  github:    { icon: Github,    color: '#ffffff' },
  twitter:   { icon: Twitter,   color: '#1DA1F2' },
  instagram: { icon: Instagram, color: '#E4405F' },
  youtube:   { icon: Youtube,   color: '#FF0000' },
  website:   { icon: Globe,     color: '#7C3AED' },
};

// ========================
// Contact Section
// ========================
export default function ContactSection({ profile }) {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState('');

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  const onSubmit = async (data) => {
    setSubmitting(true);
    setServerError('');
    try {
      await contactAPI.submit(data);
      setSubmitted(true);
      reset();
    } catch (err) {
      setServerError(getErrorMessage(err));
    } finally {
      setSubmitting(false);
    }
  };

  const p = profile || {};
  const socials = p.socialLinks || {};

  return (
    <section id="contact" className="section-padding">
      <div className="container-custom">

        {/* Section header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <span className="inline-block text-xs font-bold uppercase tracking-widest
                           text-purple-400 bg-purple-400/10 border border-purple-400/20
                           px-3 py-1.5 rounded-full mb-4">
            Get in Touch
          </span>
          <h2 className="section-title">Let's Work Together</h2>
          <p className="section-subtitle">
            Have a project in mind, a startup idea, or just want to say hello?
            I'd love to hear from you.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-10 lg:gap-16">

          {/* ── Left: Info + Socials ── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-2 space-y-8"
          >
            <div>
              <h3 className="text-xl font-bold text-white font-heading mb-4">
                Contact Info
              </h3>
              <div className="space-y-4">
                {p.email && (
                  <a href={`mailto:${p.email}`}
                    className="flex items-center gap-3 text-purple-200/70 hover:text-white
                               transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/20
                                    flex items-center justify-center group-hover:bg-purple-500/25
                                    transition-colors shrink-0">
                      <Mail className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-[11px] text-purple-400/60 uppercase tracking-widest mb-0.5">Email</p>
                      <p className="text-sm font-medium">{p.email}</p>
                    </div>
                  </a>
                )}
                {p.phone && (
                  <a href={`tel:${p.phone}`}
                    className="flex items-center gap-3 text-purple-200/70 hover:text-white
                               transition-colors group">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/20
                                    flex items-center justify-center group-hover:bg-purple-500/25
                                    transition-colors shrink-0">
                      <Phone className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-[11px] text-purple-400/60 uppercase tracking-widest mb-0.5">Phone</p>
                      <p className="text-sm font-medium">{p.phone}</p>
                    </div>
                  </a>
                )}
                {p.location && (
                  <div className="flex items-center gap-3 text-purple-200/70">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/20
                                    flex items-center justify-center shrink-0">
                      <MapPin className="w-4 h-4 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-[11px] text-purple-400/60 uppercase tracking-widest mb-0.5">Location</p>
                      <p className="text-sm font-medium">{p.location}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Availability badge */}
            {p.availability === 'available' && (
              <div className="flex items-center gap-3 p-4 rounded-2xl border border-green-500/20
                              bg-green-500/5">
                <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-green-400">Available for new projects</p>
                  <p className="text-xs text-green-300/60 mt-0.5">
                    Currently accepting freelance & consulting work
                  </p>
                </div>
              </div>
            )}

            {/* Social links */}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-purple-400/50 mb-3">
                Connect with me
              </p>
              <div className="flex flex-wrap gap-2">
                {Object.entries(SOCIALS).map(([key, { icon: Icon, color }]) => {
                  const url = socials[key];
                  if (!url) return null;
                  return (
                    <motion.a
                      key={key}
                      href={url}
                      target="_blank"
                      rel="noreferrer"
                      whileHover={{ scale: 1.1, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="w-10 h-10 rounded-xl flex items-center justify-center
                                 border border-purple-500/20 bg-white/5 hover:border-purple-500/50
                                 transition-all"
                    >
                      <Icon className="w-4 h-4 text-purple-300/70" />
                    </motion.a>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* ── Right: Form ── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="lg:col-span-3"
          >
            <div
              className="rounded-3xl p-6 sm:p-8 border border-purple-500/20"
              style={{
                background: 'rgba(13,13,40,0.6)',
                backdropFilter: 'blur(16px)',
              }}
            >
              <AnimatePresence mode="wait">

                {/* ── Success state ── */}
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.85 }}
                    className="flex flex-col items-center text-center py-10"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
                      className="w-20 h-20 rounded-full bg-green-500/15 border border-green-500/30
                                 flex items-center justify-center mb-6"
                    >
                      <CheckCircle2 className="w-10 h-10 text-green-400" />
                    </motion.div>

                    <motion.h3
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                      className="text-2xl font-bold text-white font-heading mb-2"
                    >
                      Message sent! 🎉
                    </motion.h3>
                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-purple-200/70 mb-8 max-w-sm"
                    >
                      Thanks for reaching out. I'll get back to you within
                      24–48 hours. Check your inbox for a confirmation.
                    </motion.p>
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      onClick={() => setSubmitted(false)}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold
                                 border border-purple-500/30 text-purple-300 hover:bg-purple-500/15
                                 transition-all"
                    >
                      Send another message <ArrowRight className="w-4 h-4" />
                    </motion.button>
                  </motion.div>

                ) : (

                  /* ── Form state ── */
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onSubmit={handleSubmit(onSubmit)}
                    noValidate
                    className="space-y-4"
                  >
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FloatingInput
                        label="Your name"
                        id="name"
                        error={errors.name?.message}
                        value={watch('name') || ''}
                        {...register('name', { required: 'Name is required' })}
                      />
                      <FloatingInput
                        label="Email address"
                        id="email"
                        type="email"
                        error={errors.email?.message}
                        value={watch('email') || ''}
                        {...register('email', {
                          required: 'Email is required',
                          pattern: { value: /^\S+@\S+\.\S+$/, message: 'Invalid email' },
                        })}
                      />
                    </div>

                    <FloatingInput
                      label="Subject"
                      id="subject"
                      error={errors.subject?.message}
                      value={watch('subject') || ''}
                      {...register('subject', { required: 'Subject is required' })}
                    />

                    <FloatingTextarea
                      label="Your message"
                      id="message"
                      rows={5}
                      error={errors.message?.message}
                      value={watch('message') || ''}
                      {...register('message', {
                        required: 'Message is required',
                        minLength: { value: 10, message: 'Message must be at least 10 characters' },
                      })}
                    />

                    {/* Server error */}
                    <AnimatePresence>
                      {serverError && (
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="text-sm text-red-400 bg-red-500/10 border border-red-500/20
                                     rounded-xl px-4 py-3"
                        >
                          {serverError}
                        </motion.p>
                      )}
                    </AnimatePresence>

                    <motion.button
                      type="submit"
                      disabled={submitting}
                      whileHover={{ scale: submitting ? 1 : 1.02 }}
                      whileTap={{ scale: submitting ? 1 : 0.97 }}
                      className="w-full flex items-center justify-center gap-2.5 py-3.5
                                 rounded-xl text-sm font-bold text-white transition-all
                                 disabled:opacity-70 disabled:cursor-not-allowed"
                      style={{
                        background: 'linear-gradient(135deg, #7C3AED, #6d28d9)',
                        boxShadow: submitting ? 'none' : '0 0 24px rgba(124,58,237,0.35)',
                      }}
                    >
                      {submitting ? (
                        <><Loader2 className="w-4 h-4 animate-spin" />Sending…</>
                      ) : (
                        <><Send className="w-4 h-4" />Send Message</>
                      )}
                    </motion.button>

                    <p className="text-center text-xs text-purple-300/40">
                      I'll reply within 24–48 hours. Your info is never shared.
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}