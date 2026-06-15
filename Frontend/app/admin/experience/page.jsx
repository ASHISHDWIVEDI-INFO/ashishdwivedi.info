'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Pencil, X, Loader2, Briefcase,
  MapPin, Calendar, ExternalLink, RefreshCw,
  Check, Tag, ChevronDown, Building2,
} from 'lucide-react';
import { experienceAPI } from '@/lib/api';
import { formatDate, getErrorMessage } from '@/lib/utils';
import toast from 'react-hot-toast';

// ── Constants ─────────────────────────────────
const EMP_TYPES = ['full-time','part-time','contract','freelance','internship','co-founder'];
const TYPE_COLORS = {
  'full-time':   'bg-green-400/15  text-green-400  border-green-400/25',
  'part-time':   'bg-blue-400/15   text-blue-400   border-blue-400/25',
  'contract':    'bg-orange-400/15 text-orange-400 border-orange-400/25',
  'freelance':   'bg-purple-400/15 text-purple-400 border-purple-400/25',
  'internship':  'bg-cyan-400/15   text-cyan-400   border-cyan-400/25',
  'co-founder':  'bg-amber-400/15  text-amber-400  border-amber-400/25',
};

const BLANK = {
  role: '', company: '', companyUrl: '', location: '',
  employmentType: 'full-time', startDate: '', endDate: '',
  isCurrent: false, summary: '',
  responsibilities: [], achievements: [], technologiesUsed: [],
  featured: false, published: true, order: 0,
};

// ── Bullet list editor ────────────────────────
function BulletEditor({ label, value = [], onChange, placeholder }) {
  const [input, setInput] = useState('');
  const add = () => {
    const v = input.trim();
    if (v) { onChange([...value, v]); setInput(''); }
  };
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i));
  const onKey  = (e) => { if (e.key === 'Enter') { e.preventDefault(); add(); } };

  return (
    <div>
      <label className="block text-[10px] font-semibold uppercase tracking-widest
                         text-purple-300/60 mb-1.5">{label}</label>
      <div className="space-y-1.5 mb-2">
        {value.map((item, i) => (
          <div key={i} className="flex items-start gap-2 group">
            <span className="text-purple-400/40 mt-1 text-sm shrink-0">•</span>
            <span className="text-sm text-white/80 flex-1 leading-relaxed">{item}</span>
            <button type="button" onClick={() => remove(i)}
              className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-red-400/60
                         hover:text-red-400 transition-all shrink-0 mt-0.5">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={onKey}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 rounded-lg text-xs bg-white/5 border border-purple-500/20
                     text-white placeholder-white/25 focus:outline-none focus:ring-1
                     focus:ring-purple-500/50 transition-all" />
        <button type="button" onClick={add}
          disabled={!input.trim()}
          className="px-3 py-2 rounded-lg text-xs bg-purple-600/30 text-purple-300
                     hover:bg-purple-600/50 transition-colors disabled:opacity-40 border
                     border-purple-500/20">
          Add
        </button>
      </div>
    </div>
  );
}

// ── Tech tag input ────────────────────────────
function TechTags({ value = [], onChange }) {
  const [inp, setInp] = useState('');
  const add = () => {
    const v = inp.trim();
    if (v && !value.includes(v)) { onChange([...value, v]); setInp(''); }
  };
  const remove = (t) => onChange(value.filter(x => x !== t));
  const onKey  = (e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } };

  return (
    <div>
      <label className="block text-[10px] font-semibold uppercase tracking-widest
                         text-purple-300/60 mb-1.5">Technologies Used</label>
      <div className="rounded-lg border border-purple-500/20 bg-white/5 p-2 min-h-[40px]">
        <div className="flex flex-wrap gap-1.5 mb-1.5">
          {value.map(t => (
            <span key={t} className="flex items-center gap-1 px-2 py-0.5 rounded-full
                                      text-[11px] bg-purple-500/20 text-purple-300
                                      border border-purple-500/20">
              {t}
              <button type="button" onClick={() => remove(t)} className="text-purple-400/60 hover:text-red-400 transition-colors">
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          ))}
        </div>
        <input value={inp} onChange={e => setInp(e.target.value)} onKeyDown={onKey}
          onBlur={add}
          placeholder="React, Node.js… (Enter to add)"
          className="w-full bg-transparent text-xs text-white placeholder-white/25 outline-none" />
      </div>
    </div>
  );
}

// ── Experience modal ──────────────────────────
function ExperienceModal({ initial = null, onSave, onClose, saving }) {
  const isEdit = !!initial;
  const [form, setForm] = useState(initial ? {
    ...initial,
    startDate: initial.startDate ? initial.startDate.slice(0,10) : '',
    endDate:   initial.endDate   ? initial.endDate.slice(0,10)   : '',
  } : { ...BLANK });

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const inp = `w-full px-3 py-2 rounded-lg text-sm bg-white/5 border border-purple-500/20
    text-white placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-purple-500/50
    transition-all`;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto"
         style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
      <motion.div initial={{ scale:.94, opacity:0, y:20 }}
        animate={{ scale:1, opacity:1, y:0 }} exit={{ scale:.94, opacity:0 }}
        className="bg-[#0d0d28] border border-purple-500/25 rounded-2xl w-full max-w-2xl
                   my-6 shadow-2xl overflow-hidden">

        {/* Modal header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-purple-500/15">
          <div className="flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-purple-400" />
            <h3 className="text-base font-bold text-white">
              {isEdit ? 'Edit Experience' : 'Add Experience'}
            </h3>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/5 text-purple-400/60
                       hover:text-purple-300 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal body */}
        <div className="p-5 space-y-4 overflow-y-auto max-h-[75vh]">

          {/* Role + Company */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest
                                 text-purple-300/60 mb-1.5">Role / Title *</label>
              <input value={form.role} onChange={e => set('role', e.target.value)}
                placeholder="Founder & CEO" className={inp} />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest
                                 text-purple-300/60 mb-1.5">Company *</label>
              <input value={form.company} onChange={e => set('company', e.target.value)}
                placeholder="Startup Name" className={inp} />
            </div>
          </div>

          {/* Company URL + Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest
                                 text-purple-300/60 mb-1.5">Company URL</label>
              <div className="relative">
                <ExternalLink className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-purple-400/40" />
                <input value={form.companyUrl} onChange={e => set('companyUrl', e.target.value)}
                  placeholder="https://company.com" className={`${inp} pl-9`} />
              </div>
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest
                                 text-purple-300/60 mb-1.5">Location</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-purple-400/40" />
                <input value={form.location} onChange={e => set('location', e.target.value)}
                  placeholder="New Delhi, India / Remote" className={`${inp} pl-9`} />
              </div>
            </div>
          </div>

          {/* Employment type */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-widest
                               text-purple-300/60 mb-1.5">Employment Type</label>
            <div className="flex flex-wrap gap-2">
              {EMP_TYPES.map(t => (
                <button key={t} type="button"
                  onClick={() => set('employmentType', t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all capitalize
                    ${form.employmentType === t
                      ? 'bg-purple-600/30 border-purple-500/50 text-purple-300'
                      : 'bg-white/3 border-purple-500/15 text-purple-300/50 hover:bg-purple-500/10'
                    }`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 items-end">
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest
                                 text-purple-300/60 mb-1.5">Start Date *</label>
              <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)}
                className={`${inp} [color-scheme:dark]`} />
            </div>
            <div>
              <label className="block text-[10px] font-semibold uppercase tracking-widest
                                 text-purple-300/60 mb-1.5">End Date</label>
              <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)}
                disabled={form.isCurrent}
                className={`${inp} [color-scheme:dark] disabled:opacity-40`} />
            </div>
            <label className="flex items-center gap-2 cursor-pointer pb-1">
              <input type="checkbox" checked={form.isCurrent}
                onChange={e => set('isCurrent', e.target.checked)}
                className="w-4 h-4 rounded accent-purple-500" />
              <span className="text-sm text-purple-200/70">Present / Current</span>
            </label>
          </div>

          {/* Summary */}
          <div>
            <label className="block text-[10px] font-semibold uppercase tracking-widest
                               text-purple-300/60 mb-1.5">Summary</label>
            <textarea value={form.summary} onChange={e => set('summary', e.target.value)}
              rows={2} placeholder="Brief overview of your role and impact…"
              className={`${inp} resize-y`} />
          </div>

          {/* Responsibilities */}
          <BulletEditor
            label="Key Responsibilities"
            value={form.responsibilities}
            onChange={v => set('responsibilities', v)}
            placeholder="Led a team of 5 engineers…"
          />

          {/* Achievements */}
          <BulletEditor
            label="Achievements"
            value={form.achievements}
            onChange={v => set('achievements', v)}
            placeholder="Reduced deployment time by 60%…"
          />

          {/* Tech used */}
          <TechTags value={form.technologiesUsed} onChange={v => set('technologiesUsed', v)} />

          {/* Toggles */}
          <div className="flex gap-6 pt-1">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.featured}
                onChange={e => set('featured', e.target.checked)}
                className="w-4 h-4 rounded accent-purple-500" />
              <span className="text-sm text-purple-200/70">Featured</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={form.published}
                onChange={e => set('published', e.target.checked)}
                className="w-4 h-4 rounded accent-purple-500" />
              <span className="text-sm text-purple-200/70">Published</span>
            </label>
          </div>
        </div>

        {/* Modal footer */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-purple-500/15">
          <button onClick={onClose}
            className="px-4 py-2 rounded-xl text-sm font-medium border border-purple-500/20
                       text-purple-300/70 hover:bg-purple-500/10 transition-colors">
            Cancel
          </button>
          <button
            onClick={() => onSave(form)}
            disabled={saving || !form.role.trim() || !form.company.trim() || !form.startDate}
            className="flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold text-white
                       transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg,#7C3AED,#6d28d9)' }}>
            {saving
              ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</>
              : <><Check className="w-4 h-4" />{isEdit ? 'Update' : 'Add'} Experience</>
            }
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ── Timeline card ─────────────────────────────
function TimelineCard({ exp, onEdit, onDelete, deleting, isLast }) {
  const [expanded, setExpanded] = useState(false);

  const startStr = exp.startDate
    ? formatDate(exp.startDate, 'MMM yyyy') : '';
  const endStr   = exp.isCurrent ? 'Present'
    : exp.endDate ? formatDate(exp.endDate, 'MMM yyyy') : '';

  return (
    <div className="relative flex gap-4">
      {/* Timeline line + dot */}
      <div className="flex flex-col items-center shrink-0 w-8">
        <div className={`w-3 h-3 rounded-full border-2 mt-1 shrink-0 z-10
          ${exp.isCurrent
            ? 'border-purple-400 bg-purple-400 shadow-[0_0_10px_rgba(124,58,237,0.6)]'
            : 'border-purple-500/40 bg-[#0d0d28]'
          }`} />
        {!isLast && (
          <div className="w-px flex-1 mt-1 bg-gradient-to-b from-purple-500/30 to-transparent" />
        )}
      </div>

      {/* Card */}
      <motion.div layout
        className={`flex-1 mb-6 rounded-2xl border transition-all duration-200
          ${exp.published
            ? 'border-purple-500/15 bg-white/3 hover:border-purple-500/25'
            : 'border-dashed border-purple-500/10 bg-white/1 opacity-70'
          }`}
      >
        {/* Card header */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              {/* Role */}
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <h3 className="text-base font-bold text-white">{exp.role}</h3>
                {exp.featured && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400/15
                                   text-amber-400 border border-amber-400/20">Featured</span>
                )}
                {!exp.published && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-gray-400/15
                                   text-gray-400 border border-gray-400/20">Draft</span>
                )}
              </div>

              {/* Company */}
              <div className="flex items-center gap-2 flex-wrap">
                {exp.companyUrl ? (
                  <a href={exp.companyUrl} target="_blank" rel="noreferrer"
                    className="flex items-center gap-1 text-sm font-medium text-purple-300
                               hover:text-purple-200 transition-colors">
                    <Building2 className="w-3.5 h-3.5" />
                    {exp.company}
                    <ExternalLink className="w-3 h-3 opacity-60" />
                  </a>
                ) : (
                  <span className="flex items-center gap-1 text-sm font-medium text-purple-300">
                    <Building2 className="w-3.5 h-3.5" />{exp.company}
                  </span>
                )}
                <span className={`text-[10px] px-2 py-0.5 rounded-full border capitalize
                  ${TYPE_COLORS[exp.employmentType] || 'text-gray-400 bg-gray-400/10 border-gray-400/20'}`}>
                  {exp.employmentType}
                </span>
              </div>

              {/* Meta row */}
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <span className="flex items-center gap-1 text-xs text-purple-300/50">
                  <Calendar className="w-3 h-3" />
                  {startStr}{endStr ? ` — ${endStr}` : ''}
                  {exp.duration ? ` · ${exp.duration}` : ''}
                </span>
                {exp.location && (
                  <span className="flex items-center gap-1 text-xs text-purple-300/50">
                    <MapPin className="w-3 h-3" />{exp.location}
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={() => onEdit(exp)}
                className="p-1.5 rounded-lg hover:bg-purple-500/15 text-purple-400/50
                           hover:text-purple-300 transition-all">
                <Pencil className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => onDelete(exp._id)} disabled={deleting === exp._id}
                className="p-1.5 rounded-lg hover:bg-red-500/15 text-purple-400/40
                           hover:text-red-400 transition-all disabled:opacity-50">
                {deleting === exp._id
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <Trash2 className="w-3.5 h-3.5" />
                }
              </button>
              {(exp.summary || exp.responsibilities?.length > 0 || exp.achievements?.length > 0) && (
                <button onClick={() => setExpanded(e => !e)}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-purple-400/40
                             hover:text-purple-300 transition-all">
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </button>
              )}
            </div>
          </div>

          {/* Summary preview */}
          {exp.summary && !expanded && (
            <p className="text-xs text-purple-300/50 mt-2 line-clamp-1">{exp.summary}</p>
          )}

          {/* Tech tags */}
          {exp.technologiesUsed?.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {exp.technologiesUsed.slice(0, 6).map(t => (
                <span key={t} className="text-[10px] px-2 py-0.5 rounded-full
                                          bg-purple-500/10 text-purple-300/60
                                          border border-purple-500/15">{t}</span>
              ))}
              {exp.technologiesUsed.length > 6 && (
                <span className="text-[10px] text-purple-300/40">+{exp.technologiesUsed.length - 6}</span>
              )}
            </div>
          )}
        </div>

        {/* Expanded details */}
        <AnimatePresence>
          {expanded && (
            <motion.div initial={{ height:0, opacity:0 }} animate={{ height:'auto', opacity:1 }}
              exit={{ height:0, opacity:0 }} transition={{ duration:0.2 }}
              className="overflow-hidden border-t border-purple-500/10">
              <div className="p-4 space-y-3">
                {exp.summary && (
                  <p className="text-sm text-purple-200/70 leading-relaxed">{exp.summary}</p>
                )}
                {exp.responsibilities?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest
                                   text-purple-300/40 mb-1.5">Responsibilities</p>
                    <ul className="space-y-1">
                      {exp.responsibilities.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-purple-200/65">
                          <span className="text-purple-400/40 mt-0.5 shrink-0">•</span>{r}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {exp.achievements?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest
                                   text-purple-300/40 mb-1.5">Achievements</p>
                    <ul className="space-y-1">
                      {exp.achievements.map((a, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-green-300/70">
                          <Check className="w-3 h-3 text-green-400/60 mt-0.5 shrink-0" />{a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

// ========================
// Main Page
// ========================
export default function AdminExperiencePage() {
  const [experiences, setExperiences] = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [deleting,    setDeleting]    = useState(null);
  const [modal,       setModal]       = useState(null);  // null | 'new' | experience object
  const [saving,      setSaving]      = useState(false);

  const fetchExperience = useCallback(async () => {
    setLoading(true);
    try {
      const res = await experienceAPI.getAll();
      setExperiences(res.data.data || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchExperience(); }, [fetchExperience]);

  // ── Save (create or update) ───────────────
  const handleSave = async (form) => {
    setSaving(true);
    try {
      const isEdit = form._id;
      if (isEdit) {
        const res = await experienceAPI.update(form._id, form);
        setExperiences(e => e.map(x => x._id === form._id ? res.data.data : x));
        toast.success('Experience updated ✓');
      } else {
        const res = await experienceAPI.create(form);
        setExperiences(e => [res.data.data, ...e]);
        toast.success('Experience added ✓');
      }
      setModal(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  // ── Delete ────────────────────────────────
  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await experienceAPI.delete(id);
      setExperiences(e => e.filter(x => x._id !== id));
      toast.success('Experience deleted.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(null);
    }
  };

  const currentCount = experiences.filter(e => e.isCurrent).length;
  const totalYears   = experiences.reduce((acc, e) => {
    if (!e.startDate) return acc;
    const start  = new Date(e.startDate);
    const end    = e.isCurrent ? new Date() : e.endDate ? new Date(e.endDate) : new Date();
    return acc + (end - start) / (1000 * 60 * 60 * 24 * 365);
  }, 0);

  return (
    <div className="max-w-3xl mx-auto space-y-5 pb-16">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading">Experience</h1>
          <p className="text-sm text-purple-300/60 mt-0.5">
            {experiences.length} position{experiences.length !== 1 ? 's' : ''}
            {currentCount > 0 && ` · ${currentCount} current`}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchExperience}
            className="p-2.5 rounded-xl border border-purple-500/20 text-purple-400/60
                       hover:text-purple-300 hover:bg-purple-500/10 transition-all">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={() => setModal('new')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                       text-white" style={{ background: 'linear-gradient(135deg,#7C3AED,#6d28d9)' }}>
            <Plus className="w-4 h-4" />Add Experience
          </button>
        </div>
      </div>

      {/* Stats */}
      {!loading && experiences.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { label: 'Total Roles',    value: experiences.length },
            { label: 'Current',        value: currentCount },
            { label: 'Total Years',    value: `${totalYears.toFixed(1)}y` },
          ].map(s => (
            <div key={s.label}
              className="p-3 rounded-xl border border-purple-500/10 bg-white/3 text-center">
              <p className="text-xl font-bold text-white">{s.value}</p>
              <p className="text-[11px] text-purple-300/50 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Timeline */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      ) : experiences.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 rounded-2xl
                        border border-dashed border-purple-500/20 text-center">
          <Briefcase className="w-10 h-10 text-purple-500/30 mb-3" />
          <p className="text-sm text-purple-300/50">No experience added yet</p>
          <button onClick={() => setModal('new')}
            className="mt-3 text-xs text-purple-400 hover:text-purple-300 underline transition-colors">
            Add your first role →
          </button>
        </div>
      ) : (
        <div className="pt-2">
          {experiences.map((exp, i) => (
            <TimelineCard key={exp._id} exp={exp}
              onEdit={setModal} onDelete={handleDelete}
              deleting={deleting} isLast={i === experiences.length - 1} />
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {modal && (
          <ExperienceModal
            initial={modal === 'new' ? null : modal}
            onSave={handleSave}
            onClose={() => setModal(null)}
            saving={saving}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

