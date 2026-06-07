'use client';

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import {
  Save, Loader2, Upload, X, Github, ExternalLink,
  Image as ImageIcon, Tag, AlertCircle, Link2,
} from 'lucide-react';
import { projectsAPI } from '@/lib/api';
import { getImageUrl, getErrorMessage } from '@/lib/utils';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

// ── Shared atoms ─────────────────────────────
function Field({ label, error, hint, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-widest
                         text-purple-300/70 mb-1.5">
        {label}
      </label>
      {children}
      {hint  && <p className="mt-1 text-[11px] text-purple-300/40">{hint}</p>}
      {error && (
        <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />{error}
        </p>
      )}
    </div>
  );
}

const inputCls = `w-full px-3.5 py-2.5 rounded-xl text-sm bg-white/5 border border-purple-500/20
  text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-purple-500/50
  focus:border-purple-500/50 transition-all disabled:opacity-50`;

// ── Tech tag input ────────────────────────────
function TechInput({ value = [], onChange }) {
  const [input, setInput] = useState('');

  const add = () => {
    const v = input.trim();
    if (v && !value.includes(v)) onChange([...value, v]);
    setInput('');
  };

  const remove = (tag) => onChange(value.filter(t => t !== tag));

  const onKey = (e) => {
    if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); }
    if (e.key === 'Backspace' && !input && value.length) remove(value[value.length - 1]);
  };

  return (
    <div className="rounded-xl border border-purple-500/20 bg-white/5 p-2 min-h-[44px]
                    focus-within:ring-2 focus-within:ring-purple-500/50 transition-all">
      <div className="flex flex-wrap gap-1.5 mb-1.5">
        {value.map(tag => (
          <span key={tag} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs
                                      bg-purple-500/20 text-purple-300 border border-purple-500/20">
            {tag}
            <button type="button" onClick={() => remove(tag)}
              className="text-purple-400/60 hover:text-purple-300 transition-colors">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyDown={onKey}
        onBlur={add}
        placeholder={value.length ? 'Add more…' : 'React, Node.js, AWS… (Enter to add)'}
        className="w-full bg-transparent text-sm text-white placeholder-white/25
                   outline-none border-none focus:ring-0"
      />
    </div>
  );
}

// ========================
// ProjectForm (shared by /new and /[id])
// ========================
export default function ProjectForm({ existingProject = null }) {
  const router = useRouter();
  const [technologies, setTechnologies] = useState(existingProject?.technologies || []);
  const [imagePreview,  setImagePreview]  = useState(
    existingProject?.imageFileId ? getImageUrl(existingProject.imageFileId) : null
  );
  const [imageUploading, setImageUploading] = useState(false);
  const [uploadedImageId, setUploadedImageId] = useState(existingProject?.imageFileId || null);
  const [saving, setSaving] = useState(false);

  const imageRef = useRef(null);
  const isEdit   = !!existingProject;

  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      title:            existingProject?.title            || '',
      shortDescription: existingProject?.shortDescription || '',
      fullDescription:  existingProject?.fullDescription  || '',
      category:         existingProject?.category         || 'web',
      status:           existingProject?.status           || 'completed',
      githubUrl:        existingProject?.githubUrl        || '',
      liveUrl:          existingProject?.liveUrl          || '',
      caseStudyUrl:     existingProject?.caseStudyUrl     || '',
      imageUrl:         existingProject?.imageUrl         || '',
      featured:         existingProject?.featured         || false,
      published:        existingProject?.published        ?? true,
      order:            existingProject?.order            || 0,
    },
  });

  // ── Image upload (immediate upload after select) ──
  const handleImageChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Instant preview
    const reader = new FileReader();
    reader.onload = ev => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);

    if (!isEdit) {
      // For new projects: store file locally, upload after project is created
      setUploadedImageId(file); // store file object temporarily
      return;
    }

    // For existing projects: upload now
    setImageUploading(true);
    try {
      const fd = new FormData(); fd.append('image', file);
      const res = await projectsAPI.upload(existingProject._id, fd);
      setUploadedImageId(res.data.data.fileId);
      toast.success('Image uploaded ✓');
    } catch (err) {
      toast.error(getErrorMessage(err));
      setImagePreview(null);
    } finally {
      setImageUploading(false);
      e.target.value = '';
    }
  };

  // ── Submit ────────────────────────────────────
  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const payload = { ...data, technologies };

      if (isEdit) {
        await projectsAPI.update(existingProject._id, payload);
        toast.success('Project updated ✓');
        router.push('/admin/projects');
      } else {
        const res = await projectsAPI.create(payload);
        const newId = res.data.data._id;

        // Upload image to newly created project if one was selected
        if (uploadedImageId instanceof File) {
          const fd = new FormData(); fd.append('image', uploadedImageId);
          await projectsAPI.upload(newId, fd);
        }

        toast.success('Project created ✓');
        router.push('/admin/projects');
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto pb-16">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white font-heading">
          {isEdit ? 'Edit Project' : 'New Project'}
        </h1>
        <p className="text-sm text-purple-300/60 mt-0.5">
          {isEdit ? `Editing: ${existingProject.title}` : 'Fill in the details below'}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── Left col (main fields) ── */}
          <div className="lg:col-span-2 space-y-5">

            {/* Core info */}
            <div className="rounded-2xl border border-purple-500/15 bg-white/3 p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Tag className="w-4 h-4 text-purple-400" />Project Info
              </h3>

              <Field label="Title *" error={errors.title?.message}>
                <input {...register('title',{required:'Title is required'})}
                  placeholder="e.g. AI Chatbot Platform"
                  className={inputCls} />
              </Field>

              <Field label="Short Description"
                hint="Shown on project cards — max 300 chars">
                <textarea {...register('shortDescription')}
                  rows={2} placeholder="A brief summary of what this project does…"
                  className={`${inputCls} resize-y`} />
              </Field>

              <Field label="Full Description">
                <textarea {...register('fullDescription')}
                  rows={5} placeholder="Detailed description, challenges, approach…"
                  className={`${inputCls} resize-y`} />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Category">
                  <select {...register('category')} className={inputCls}>
                    {['web','mobile','ai-ml','devops','open-source','startup','other'].map(c => (
                      <option key={c} value={c} className="bg-gray-900 capitalize">{c}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Status">
                  <select {...register('status')} className={inputCls}>
                    {['completed','in-progress','on-hold','archived'].map(s => (
                      <option key={s} value={s} className="bg-gray-900 capitalize">{s}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Tech Stack" hint="Press Enter or comma to add each technology">
                <TechInput value={technologies} onChange={setTechnologies} />
              </Field>
            </div>

            {/* Links */}
            <div className="rounded-2xl border border-purple-500/15 bg-white/3 p-5 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Link2 className="w-4 h-4 text-purple-400" />Links
              </h3>
              <Field label="GitHub URL" error={errors.githubUrl?.message}>
                <div className="relative">
                  <Github className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/50" />
                  <input {...register('githubUrl')} placeholder="https://github.com/…"
                    className={`${inputCls} pl-10`} />
                </div>
              </Field>
              <Field label="Live Demo URL">
                <div className="relative">
                  <ExternalLink className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/50" />
                  <input {...register('liveUrl')} placeholder="https://…"
                    className={`${inputCls} pl-10`} />
                </div>
              </Field>
              <Field label="Case Study URL">
                <div className="relative">
                  <Link2 className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/50" />
                  <input {...register('caseStudyUrl')} placeholder="https://…"
                    className={`${inputCls} pl-10`} />
                </div>
              </Field>
            </div>
          </div>

          {/* ── Right col (image + settings) ── */}
          <div className="space-y-5">

            {/* Image upload */}
            <div className="rounded-2xl border border-purple-500/15 bg-white/3 p-5">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                <ImageIcon className="w-4 h-4 text-purple-400" />Project Image
              </h3>

              {/* Preview */}
              <div
                onClick={() => imageRef.current?.click()}
                className="relative aspect-video rounded-xl overflow-hidden border-2 border-dashed
                           border-purple-500/20 bg-purple-900/10 flex items-center justify-center
                           cursor-pointer hover:border-purple-500/40 transition-all group mb-3"
              >
                {imagePreview ? (
                  <>
                    <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100
                                    flex items-center justify-center transition-opacity">
                      {imageUploading
                        ? <Loader2 className="w-8 h-8 text-white animate-spin" />
                        : <Upload className="w-8 h-8 text-white" />
                      }
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <ImageIcon className="w-10 h-10 text-purple-500/30 mx-auto mb-2" />
                    <p className="text-xs text-purple-300/50">Click to upload image</p>
                    <p className="text-[11px] text-purple-300/30 mt-1">JPEG, PNG, WebP · Max 8MB</p>
                  </div>
                )}
              </div>

              <input ref={imageRef} type="file" accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange} className="hidden" />

              <button type="button" onClick={() => imageRef.current?.click()}
                disabled={imageUploading}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs
                           font-medium border border-purple-500/20 text-purple-300/70
                           hover:bg-purple-500/10 transition-colors disabled:opacity-50">
                <Upload className="w-3.5 h-3.5" />
                {imageUploading ? 'Uploading…' : imagePreview ? 'Change image' : 'Upload image'}
              </button>

              <div className="mt-3">
                <Field label="Or paste image URL" hint="Used if no file is uploaded">
                  <input {...register('imageUrl')} placeholder="https://…" className={inputCls} />
                </Field>
              </div>
            </div>

            {/* Settings */}
            <div className="rounded-2xl border border-purple-500/15 bg-white/3 p-5 space-y-4">
              <h3 className="text-sm font-bold text-white mb-1">Settings</h3>

              <Field label="Display Order" hint="Lower number = shown first">
                <input {...register('order')} type="number" min="0"
                  placeholder="0" className={inputCls} />
              </Field>

              <div className="flex flex-col gap-3">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-purple-200/80">Featured</span>
                  <input type="checkbox" {...register('featured')}
                    className="w-4 h-4 rounded accent-purple-500 cursor-pointer" />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-purple-200/80">Published</span>
                  <input type="checkbox" {...register('published')}
                    className="w-4 h-4 rounded accent-purple-500 cursor-pointer" />
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-between pt-2">
          <button type="button" onClick={() => router.push('/admin/projects')}
            className="px-5 py-2.5 rounded-xl text-sm font-medium border border-purple-500/20
                       text-purple-300/70 hover:bg-purple-500/10 transition-colors">
            Cancel
          </button>
          <motion.button type="submit" disabled={saving}
            whileHover={{ scale: saving ? 1 : 1.02 }} whileTap={{ scale: saving ? 1 : 0.97 }}
            className="flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-bold text-white
                       disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: 'linear-gradient(135deg,#7C3AED,#6d28d9)' }}>
            {saving
              ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</>
              : <><Save className="w-4 h-4" />{isEdit ? 'Update Project' : 'Create Project'}</>
            }
          </motion.button>
        </div>
      </form>
    </div>
  );
}