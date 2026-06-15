'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus, Trash2, Pencil, Check, X, Loader2,
  Wrench, ChevronDown, ChevronUp, RefreshCw, Save,
} from 'lucide-react';
import { skillsAPI } from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import toast from 'react-hot-toast';

// ── Constants ─────────────────────────────────
const CATEGORIES = [
  { key: 'frontend',     label: 'Frontend',        color: '#61DAFB' },
  { key: 'backend',      label: 'Backend',         color: '#68D391' },
  { key: 'database',     label: 'Database',        color: '#F6AD55' },
  { key: 'cloud-devops', label: 'Cloud & DevOps',  color: '#76E4F7' },
  { key: 'mobile',       label: 'Mobile',          color: '#B794F4' },
  { key: 'ai-ml',        label: 'AI / ML',         color: '#FC8181' },
  { key: 'tools',        label: 'Tools',           color: '#68D391' },
  { key: 'soft-skills',  label: 'Soft Skills',     color: '#F687B3' },
  { key: 'other',        label: 'Other',           color: '#A0AEC0' },
];

const LEVELS  = ['beginner', 'intermediate', 'advanced', 'expert'];
const LEVEL_COLOR = {
  beginner:     'text-gray-400   bg-gray-400/10   border-gray-400/20',
  intermediate: 'text-blue-400   bg-blue-400/10   border-blue-400/20',
  advanced:     'text-purple-400 bg-purple-400/10 border-purple-400/20',
  expert:       'text-amber-400  bg-amber-400/10  border-amber-400/20',
};

const BLANK_SKILL = {
  name: '', category: 'frontend', proficiency: 80,
  level: 'advanced', icon: '', color: '#7C3AED',
  yearsOfExperience: 0, featured: false,
};

// ── Inline input ──────────────────────────────
const inp = `px-2.5 py-1.5 rounded-lg text-xs bg-white/5 border border-purple-500/20
  text-white placeholder-white/25 focus:outline-none focus:ring-1 focus:ring-purple-500/50
  transition-all w-full`;

// ── Skill row (view mode) ─────────────────────
function SkillRow({ skill, onEdit, onDelete, deleting }) {
  return (
    <motion.div layout initial={{ opacity:0, x:-8 }} animate={{ opacity:1, x:0 }}
      exit={{ opacity:0, scale:.96 }}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/4
                 border border-transparent hover:border-purple-500/10 transition-all group"
    >
      {/* Color dot */}
      <div className="w-2.5 h-2.5 rounded-full shrink-0"
        style={{ background: skill.color || '#7C3AED',
                 boxShadow: `0 0 6px ${skill.color || '#7C3AED'}60` }} />

      {/* Name + icon */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-white truncate">{skill.name}</span>
          {skill.featured && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400/15
                             text-amber-400 border border-amber-400/20">Featured</span>
          )}
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${LEVEL_COLOR[skill.level]}`}>
            {skill.level}
          </span>
        </div>
        {skill.yearsOfExperience > 0 && (
          <p className="text-[11px] text-purple-300/40">{skill.yearsOfExperience}y exp</p>
        )}
      </div>

      {/* Proficiency bar */}
      <div className="hidden sm:flex items-center gap-2 w-28 shrink-0">
        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${skill.proficiency}%` }}
            transition={{ duration: 0.8, delay: 0.1, ease: 'easeOut' }}
            className="h-full rounded-full"
            style={{ background: skill.color || '#7C3AED' }}
          />
        </div>
        <span className="text-[11px] text-purple-300/50 w-7 text-right">
          {skill.proficiency}%
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={() => onEdit(skill)}
          className="p-1.5 rounded-lg hover:bg-purple-500/15 text-purple-400/60
                     hover:text-purple-300 transition-all">
          <Pencil className="w-3.5 h-3.5" />
        </button>
        <button onClick={() => onDelete(skill._id)} disabled={deleting === skill._id}
          className="p-1.5 rounded-lg hover:bg-red-500/15 text-purple-400/40
                     hover:text-red-400 transition-all disabled:opacity-50">
          {deleting === skill._id
            ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : <Trash2 className="w-3.5 h-3.5" />
          }
        </button>
      </div>
    </motion.div>
  );
}

// ── Skill edit / add row ──────────────────────
function SkillEditRow({ initial = BLANK_SKILL, onSave, onCancel, saving }) {
  const [form, setForm] = useState({ ...BLANK_SKILL, ...initial });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <motion.div initial={{ opacity:0, y:-6 }} animate={{ opacity:1, y:0 }}
      className="p-3 rounded-xl border border-purple-500/30 bg-purple-500/5 space-y-3">

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {/* Name */}
        <div className="sm:col-span-2">
          <label className="block text-[10px] text-purple-300/50 mb-1 uppercase tracking-widest">Name *</label>
          <input value={form.name} onChange={e => set('name', e.target.value)}
            placeholder="e.g. React" className={inp} autoFocus />
        </div>

        {/* Category */}
        <div>
          <label className="block text-[10px] text-purple-300/50 mb-1 uppercase tracking-widest">Category</label>
          <select value={form.category} onChange={e => set('category', e.target.value)}
            className={inp}>
            {CATEGORIES.map(c => (
              <option key={c.key} value={c.key} className="bg-gray-900">{c.label}</option>
            ))}
          </select>
        </div>

        {/* Level */}
        <div>
          <label className="block text-[10px] text-purple-300/50 mb-1 uppercase tracking-widest">Level</label>
          <select value={form.level} onChange={e => set('level', e.target.value)}
            className={inp}>
            {LEVELS.map(l => (
              <option key={l} value={l} className="bg-gray-900 capitalize">{l}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 items-end">
        {/* Proficiency slider */}
        <div className="sm:col-span-2">
          <label className="block text-[10px] text-purple-300/50 mb-1 uppercase tracking-widest">
            Proficiency — {form.proficiency}%
          </label>
          <input type="range" min="1" max="100" value={form.proficiency}
            onChange={e => set('proficiency', Number(e.target.value))}
            className="w-full accent-purple-500 cursor-pointer" />
        </div>

        {/* Years */}
        <div>
          <label className="block text-[10px] text-purple-300/50 mb-1 uppercase tracking-widest">Years exp</label>
          <input type="number" min="0" max="30" value={form.yearsOfExperience}
            onChange={e => set('yearsOfExperience', Number(e.target.value))}
            className={inp} />
        </div>

        {/* Color */}
        <div>
          <label className="block text-[10px] text-purple-300/50 mb-1 uppercase tracking-widest">Color</label>
          <div className="flex items-center gap-2">
            <input type="color" value={form.color}
              onChange={e => set('color', e.target.value)}
              className="w-8 h-8 rounded-lg border border-purple-500/20 bg-transparent
                         cursor-pointer p-0.5" />
            <input value={form.color} onChange={e => set('color', e.target.value)}
              placeholder="#7C3AED" className={`${inp} flex-1`} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 items-center">
        {/* Icon hint */}
        <div className="sm:col-span-2">
          <label className="block text-[10px] text-purple-300/50 mb-1 uppercase tracking-widest">
            Icon class (devicon or simple-icons)
          </label>
          <input value={form.icon} onChange={e => set('icon', e.target.value)}
            placeholder="devicon-react-original" className={inp} />
        </div>

        {/* Featured */}
        <label className="flex items-center gap-2 cursor-pointer pt-4">
          <input type="checkbox" checked={form.featured}
            onChange={e => set('featured', e.target.checked)}
            className="w-4 h-4 rounded accent-purple-500" />
          <span className="text-xs text-purple-200/70">Featured</span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button onClick={() => onSave(form)} disabled={saving || !form.name.trim()}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold
                     bg-purple-600 hover:bg-purple-500 text-white transition-colors
                     disabled:opacity-50 disabled:cursor-not-allowed">
          {saving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button onClick={onCancel}
          className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium
                     border border-purple-500/20 text-purple-300/70 hover:bg-purple-500/10
                     transition-colors">
          <X className="w-3.5 h-3.5" />Cancel
        </button>
      </div>
    </motion.div>
  );
}

// ── Category section ──────────────────────────
function CategorySection({ catMeta, skills, onEdit, onDelete, onAdd, deleting }) {
  const [expanded, setExpanded] = useState(true);
  const [adding,   setAdding]   = useState(false);
  const [saving,   setSaving]   = useState(false);

  const handleAdd = async (form) => {
    setSaving(true);
    try {
      await onAdd({ ...form, category: catMeta.key });
      setAdding(false);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-2xl border border-purple-500/15 bg-white/3 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        className="w-full flex items-center gap-3 px-4 py-3.5 hover:bg-white/3
                   transition-colors text-left"
      >
        <div className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ background: catMeta.color, boxShadow: `0 0 8px ${catMeta.color}50` }} />
        <span className="text-sm font-bold text-white flex-1">{catMeta.label}</span>
        <span className="text-xs text-purple-300/40 mr-2">
          {skills.length} skill{skills.length !== 1 ? 's' : ''}
        </span>
        {expanded ? <ChevronUp className="w-4 h-4 text-purple-400/40" /> : <ChevronDown className="w-4 h-4 text-purple-400/40" />}
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-0.5 border-t border-purple-500/10 pt-2">
              <AnimatePresence>
                {skills.map(skill => (
                  <SkillRow key={skill._id} skill={skill}
                    onEdit={onEdit} onDelete={onDelete} deleting={deleting} />
                ))}
              </AnimatePresence>

              {/* Add row (inline) */}
              <AnimatePresence>
                {adding && (
                  <SkillEditRow
                    initial={{ ...BLANK_SKILL, category: catMeta.key, color: catMeta.color }}
                    onSave={handleAdd}
                    onCancel={() => setAdding(false)}
                    saving={saving}
                  />
                )}
              </AnimatePresence>

              {!adding && (
                <button onClick={() => setAdding(true)}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs
                             text-purple-400/50 hover:text-purple-300 hover:bg-purple-500/8
                             transition-all border border-dashed border-purple-500/15
                             hover:border-purple-500/30 mt-1">
                  <Plus className="w-3.5 h-3.5" />Add {catMeta.label} skill
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ========================
// Main page
// ========================
export default function AdminSkillsPage() {
  const [skills,   setSkills]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [editing,  setEditing]  = useState(null);   // skill being edited
  const [editSaving, setEditSaving] = useState(false);

  const fetchSkills = useCallback(async () => {
    setLoading(true);
    try {
      const res = await skillsAPI.getAll();
      setSkills(res.data.data || []);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchSkills(); }, [fetchSkills]);

  // ── Add skill ─────────────────────────────
  const handleAdd = async (form) => {
    const res = await skillsAPI.create(form);
    setSkills(s => [...s, res.data.data]);
    toast.success(`"${res.data.data.name}" added ✓`);
  };

  // ── Delete ────────────────────────────────
  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await skillsAPI.delete(id);
      setSkills(s => s.filter(sk => sk._id !== id));
      toast.success('Skill deleted.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(null);
    }
  };

  // ── Edit save ─────────────────────────────
  const handleEditSave = async (form) => {
    setEditSaving(true);
    try {
      const res = await skillsAPI.update(editing._id, form);
      setSkills(s => s.map(sk => sk._id === editing._id ? res.data.data : sk));
      toast.success(`"${res.data.data.name}" updated ✓`);
      setEditing(null);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setEditSaving(false);
    }
  };

  // ── Group skills by category ──────────────
  const grouped = CATEGORIES.map(cat => ({
    ...cat,
    skills: skills.filter(s => s.category === cat.key),
  })).filter(cat => cat.skills.length > 0 || true); // show all categories always

  const total = skills.length;

  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-16">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading">Skills & Expertise</h1>
          <p className="text-sm text-purple-300/60 mt-0.5">
            {total} skill{total !== 1 ? 's' : ''} across {CATEGORIES.filter(c => skills.some(s => s.category === c.key)).length} categories
          </p>
        </div>
        <button onClick={fetchSkills}
          className="p-2.5 rounded-xl border border-purple-500/20 text-purple-400/60
                     hover:text-purple-300 hover:bg-purple-500/10 transition-all">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Edit modal overlay */}
      <AnimatePresence>
        {editing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
               style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
            <motion.div initial={{ scale:.9, opacity:0 }} animate={{ scale:1, opacity:1 }}
              exit={{ scale:.9, opacity:0 }}
              className="bg-[#0d0d28] border border-purple-500/25 rounded-2xl p-5 w-full max-w-lg shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-white">Edit Skill</h3>
                <button onClick={() => setEditing(null)}
                  className="p-1.5 rounded-lg hover:bg-white/5 text-purple-400/60
                             hover:text-purple-300 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <SkillEditRow
                initial={editing}
                onSave={handleEditSave}
                onCancel={() => setEditing(null)}
                saving={editSaving}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Skills grouped by category */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      ) : (
        <div className="space-y-3">
          {grouped.map(cat => (
            <CategorySection
              key={cat.key}
              catMeta={cat}
              skills={cat.skills}
              onEdit={setEditing}
              onDelete={handleDelete}
              onAdd={handleAdd}
              deleting={deleting}
            />
          ))}
        </div>
      )}

      {/* Quick stats footer */}
      {!loading && total > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {[
            { label: 'Total Skills',  value: total },
            { label: 'Featured',      value: skills.filter(s => s.featured).length },
            { label: 'Expert level',  value: skills.filter(s => s.level === 'expert').length },
            { label: 'Avg proficiency',value: `${Math.round(skills.reduce((a,s) => a + s.proficiency, 0) / total)}%` },
          ].map(stat => (
            <div key={stat.label}
              className="p-3 rounded-xl border border-purple-500/10 bg-white/3 text-center">
              <p className="text-xl font-bold text-white">{stat.value}</p>
              <p className="text-[11px] text-purple-300/50 mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

