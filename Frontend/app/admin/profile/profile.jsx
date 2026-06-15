'use client';

import { useState, useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, MapPin, FileText, Upload, Save,
  Loader2, Camera, Download, Eye, AlertCircle, CheckCircle,
  Link2, Github, Linkedin, Twitter, Instagram, Globe,
  Youtube, RefreshCw,
} from 'lucide-react';
import { profileAPI } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import toast from 'react-hot-toast';

/* ── tiny shared atoms ──────────────────────── */
function Field({ label, error, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-purple-300/70 uppercase tracking-widest mb-1.5">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />{error}
        </p>
      )}
    </div>
  );
}

function Input({ className = '', ...props }) {
  return (
    <input
      className={`w-full px-3.5 py-2.5 rounded-xl text-sm bg-white/5 border border-purple-500/20
        text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-purple-500/50
        focus:border-purple-500/50 transition-all disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}

function Textarea({ className = '', ...props }) {
  return (
    <textarea
      className={`w-full px-3.5 py-2.5 rounded-xl text-sm bg-white/5 border border-purple-500/20
        text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-purple-500/50
        transition-all resize-y disabled:opacity-50 ${className}`}
      {...props}
    />
  );
}

function Section({ title, icon: Icon, children }) {
  return (
    <div className="rounded-2xl border border-purple-500/15 bg-white/3 p-6">
      <h3 className="flex items-center gap-2 text-sm font-bold text-white mb-5">
        <Icon className="w-4 h-4 text-purple-400" />{title}
      </h3>
      {children}
    </div>
  );
}

/* ── Page ───────────────────────────────────── */
export default function AdminProfilePage() {
  const [loading,         setLoading]         = useState(true);
  const [saving,          setSaving]          = useState(false);
  const [photoPreview,    setPhotoPreview]    = useState(null);
  const [photoUploading,  setPhotoUploading]  = useState(false);
  const [resumeInfo,      setResumeInfo]      = useState(null);
  const [resumeUploading, setResumeUploading] = useState(false);
  const [uploadProgress,  setUploadProgress]  = useState(0);

  const photoInputRef  = useRef(null);
  const resumeInputRef = useRef(null);

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm();

  /* load ─────────────────────────────────────── */
  useEffect(() => {
    (async () => {
      try {
        const res = await profileAPI.get();
        const p   = res.data.data;
        reset({
          name:         p.name         || '',
          title:        p.title        || '',
          tagline:      p.tagline      || '',
          bio:          p.bio          || '',
          about:        p.about        || '',
          mission:      p.mission      || '',
          vision:       p.vision       || '',
          email:        p.email        || '',
          phone:        p.phone        || '',
          location:     p.location     || '',
          availability: p.availability || 'available',
          'stats.yearsExperience':   p.stats?.yearsExperience   ?? 0,
          'stats.projectsCompleted': p.stats?.projectsCompleted ?? 0,
          'stats.happyClients':      p.stats?.happyClients      ?? 0,
          'stats.startupsFounded':   p.stats?.startupsFounded   ?? 0,
          'socialLinks.linkedin':    p.socialLinks?.linkedin    || '',
          'socialLinks.github':      p.socialLinks?.github      || '',
          'socialLinks.twitter':     p.socialLinks?.twitter     || '',
          'socialLinks.instagram':   p.socialLinks?.instagram   || '',
          'socialLinks.youtube':     p.socialLinks?.youtube     || '',
          'socialLinks.website':     p.socialLinks?.website     || '',
          metaTitle:       p.metaTitle       || '',
          metaDescription: p.metaDescription || '',
        });
        if (p.photoFileId) {
          setPhotoPreview(`${process.env.NEXT_PUBLIC_API_URL}/media/${p.photoFileId}`);
        }
        /* resume info */
        const token = localStorage.getItem('admin_token');
        const rRes  = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/profile/resume/info`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const rData = await rRes.json();
        if (rData.success) setResumeInfo(rData.data);
      } catch (err) {
        toast.error(getErrorMessage(err));
      } finally {
        setLoading(false);
      }
    })();
  }, [reset]);

  /* save ─────────────────────────────────────── */
  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const payload = { ...data,
        stats: {
          yearsExperience:   Number(data['stats.yearsExperience']),
          projectsCompleted: Number(data['stats.projectsCompleted']),
          happyClients:      Number(data['stats.happyClients']),
          startupsFounded:   Number(data['stats.startupsFounded']),
        },
        socialLinks: {
          linkedin:  data['socialLinks.linkedin'],
          github:    data['socialLinks.github'],
          twitter:   data['socialLinks.twitter'],
          instagram: data['socialLinks.instagram'],
          youtube:   data['socialLinks.youtube'],
          website:   data['socialLinks.website'],
        },
      };
      ['stats.','socialLinks.'].forEach(prefix =>
        Object.keys(payload).filter(k => k.startsWith(prefix)).forEach(k => delete payload[k])
      );
      await profileAPI.update(payload);
      toast.success('Profile saved ✓');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  /* photo ────────────────────────────────────── */
  const handlePhotoChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhotoPreview(ev.target.result);
    reader.readAsDataURL(file);
    setPhotoUploading(true);
    try {
      const fd = new FormData(); fd.append('photo', file);
      await profileAPI.uploadPhoto(fd, (pct) => setUploadProgress(pct));
      toast.success('Photo updated ✓');
    } catch (err) {
      toast.error(getErrorMessage(err)); setPhotoPreview(null);
    } finally {
      setPhotoUploading(false); setUploadProgress(0); e.target.value = '';
    }
  };

  /* resume ───────────────────────────────────── */
  const handleResumeChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setResumeUploading(true);
    try {
      const fd = new FormData(); fd.append('resume', file);
      await profileAPI.uploadResume(fd, (pct) => setUploadProgress(pct));
      const token = localStorage.getItem('admin_token');
      const rRes  = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/profile/resume/info`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const rData = await rRes.json();
      if (rData.success) setResumeInfo(rData.data);
      toast.success('Resume uploaded ✓');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setResumeUploading(false); setUploadProgress(0); e.target.value = '';
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-16">

      {/* header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading">Profile</h1>
          <p className="text-sm text-purple-300/60 mt-0.5">Manage your personal &amp; professional info</p>
        </div>
        {isDirty && (
          <motion.div initial={{ opacity:0,scale:0.9 }} animate={{ opacity:1,scale:1 }}
            className="flex items-center gap-1.5 text-xs text-amber-400 bg-amber-400/10
                       border border-amber-400/20 px-3 py-1.5 rounded-full">
            <RefreshCw className="w-3 h-3" />Unsaved changes
          </motion.div>
        )}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

        {/* identity */}
        <Section title="Identity" icon={User}>
          <div className="flex flex-col sm:flex-row gap-6">
            {/* photo */}
            <div className="flex flex-col items-center gap-3 shrink-0">
              <div className="relative group w-28 h-28 rounded-2xl overflow-hidden
                              border-2 border-purple-500/30 bg-white/5 flex items-center justify-center">
                {photoPreview
                  ? <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
                  : <User className="w-10 h-10 text-purple-500/40" />
                }
                <button type="button" onClick={() => photoInputRef.current?.click()}
                  disabled={photoUploading}
                  className="absolute inset-0 flex items-center justify-center bg-black/60
                             opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl cursor-pointer">
                  {photoUploading
                    ? <Loader2 className="w-6 h-6 text-white animate-spin" />
                    : <Camera className="w-6 h-6 text-white" />
                  }
                </button>
              </div>
              <input ref={photoInputRef} type="file" accept="image/jpeg,image/png,image/webp"
                onChange={handlePhotoChange} className="hidden" />
              <button type="button" onClick={() => photoInputRef.current?.click()}
                disabled={photoUploading}
                className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300
                           transition-colors disabled:opacity-50">
                <Upload className="w-3 h-3" />{photoUploading ? `${uploadProgress}%` : 'Change photo'}
              </button>
            </div>

            {/* basic fields */}
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Full Name" error={errors.name?.message}>
                <Input {...register('name',{required:'Name is required'})} placeholder="Ashish Dwivedi" />
              </Field>
              <Field label="Professional Title">
                <Input {...register('title')} placeholder="Founder | Software Engineer" />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Tagline">
                  <Input {...register('tagline')} placeholder="Building scalable products…" />
                </Field>
              </div>
              <Field label="Availability">
                <select {...register('availability')}
                  className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-white/5 border border-purple-500/20
                             text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all">
                  <option value="available"      className="bg-gray-900">✅ Available for work</option>
                  <option value="busy"           className="bg-gray-900">🟡 Busy / Limited</option>
                  <option value="not-available"  className="bg-gray-900">🔴 Not available</option>
                </select>
              </Field>
            </div>
          </div>
        </Section>

        {/* about */}
        <Section title="About Me" icon={FileText}>
          <div className="space-y-4">
            <Field label="Short Bio"><Textarea {...register('bio')} rows={3} placeholder="Passionate entrepreneur…" /></Field>
            <Field label="Full About Text"><Textarea {...register('about')} rows={5} placeholder="Detailed introduction…" /></Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Mission"><Textarea {...register('mission')} rows={3} placeholder="My mission is to…" /></Field>
              <Field label="Vision"><Textarea {...register('vision')} rows={3} placeholder="I envision…" /></Field>
            </div>
          </div>
        </Section>

        {/* contact */}
        <Section title="Contact Info" icon={Mail}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Email"><div className="relative"><Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-purple-400/50" /><Input {...register('email')} type="email" placeholder="ashish@ashishdwivedi.info" className="pl-9" /></div></Field>
            <Field label="Phone"><div className="relative"><Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-purple-400/50" /><Input {...register('phone')} placeholder="+91 98765 43210" className="pl-9" /></div></Field>
            <Field label="Location"><div className="relative"><MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-purple-400/50" /><Input {...register('location')} placeholder="New Delhi, India" className="pl-9" /></div></Field>
          </div>
        </Section>

        {/* stats */}
        <Section title="Statistics (About counters)" icon={Eye}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { key:'stats.yearsExperience',   label:'Years Exp' },
              { key:'stats.projectsCompleted', label:'Projects'  },
              { key:'stats.happyClients',      label:'Clients'   },
              { key:'stats.startupsFounded',   label:'Startups'  },
            ].map(({ key, label }) => (
              <Field key={key} label={label}>
                <Input {...register(key)} type="number" min="0" placeholder="0" className="text-center text-lg font-bold" />
              </Field>
            ))}
          </div>
        </Section>

        {/* social */}
        <Section title="Social Links" icon={Link2}>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { key:'socialLinks.linkedin',  label:'LinkedIn',   icon:Linkedin,  ph:'https://linkedin.com/in/...' },
              { key:'socialLinks.github',    label:'GitHub',     icon:Github,    ph:'https://github.com/...'     },
              { key:'socialLinks.twitter',   label:'X / Twitter',icon:Twitter,   ph:'https://twitter.com/...'   },
              { key:'socialLinks.instagram', label:'Instagram',  icon:Instagram, ph:'https://instagram.com/...' },
              { key:'socialLinks.youtube',   label:'YouTube',    icon:Youtube,   ph:'https://youtube.com/...'   },
              { key:'socialLinks.website',   label:'Website',    icon:Globe,     ph:'https://ashishdwivedi.info'},
            ].map(({ key, label, icon:Icon, ph }) => (
              <Field key={key} label={label}>
                <div className="relative"><Icon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-purple-400/50" /><Input {...register(key)} placeholder={ph} className="pl-9" /></div>
              </Field>
            ))}
          </div>
        </Section>

        {/* resume */}
        <Section title="Resume / CV" icon={Download}>
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              {resumeInfo?.hasResume ? (
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-green-500/10 border border-green-500/20">
                  <CheckCircle className="w-5 h-5 text-green-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-white font-medium truncate">{resumeInfo.filename}</p>
                    <p className="text-xs text-green-300/70">{resumeInfo.downloadCount} downloads</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3.5 rounded-xl bg-white/5 border border-purple-500/15">
                  <FileText className="w-5 h-5 text-purple-400/50 shrink-0" />
                  <p className="text-sm text-purple-300/50">No resume uploaded yet</p>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <input ref={resumeInputRef} type="file" accept="application/pdf" onChange={handleResumeChange} className="hidden" />
              <button type="button" onClick={() => resumeInputRef.current?.click()} disabled={resumeUploading}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                           bg-purple-600 hover:bg-purple-500 text-white transition-colors disabled:opacity-50">
                {resumeUploading ? <><Loader2 className="w-4 h-4 animate-spin" />{uploadProgress}%</> : <><Upload className="w-4 h-4" />Upload PDF</>}
              </button>
              {resumeInfo?.hasResume && (
                <a href={`${process.env.NEXT_PUBLIC_API_URL}/profile/resume/download`} target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                             border border-purple-500/30 text-purple-300 hover:bg-purple-500/10 transition-colors">
                  <Download className="w-4 h-4" />Preview
                </a>
              )}
            </div>
          </div>
        </Section>

        {/* seo */}
        <Section title="SEO / Meta Tags" icon={Globe}>
          <div className="space-y-4">
            <Field label="Meta Title"><Input {...register('metaTitle')} placeholder="Ashish Dwivedi | Founder & Software Engineer" /></Field>
            <Field label="Meta Description"><Textarea {...register('metaDescription')} rows={2} placeholder="Building scalable digital products…" /></Field>
          </div>
        </Section>

        {/* save */}
        <div className="flex justify-end pt-2">
          <motion.button type="submit" disabled={saving || !isDirty}
            whileHover={{ scale: saving ? 1 : 1.02 }} whileTap={{ scale: saving ? 1 : 0.97 }}
            className="flex items-center gap-2.5 px-8 py-3 rounded-xl text-sm font-bold text-white
                       transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background:'linear-gradient(135deg,#7C3AED,#6d28d9)' }}>
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : <><Save className="w-4 h-4" />Save Profile</>}
          </motion.button>
        </div>
      </form>
    </div>
  );
}

