'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import {
  Save, Loader2, Upload, X, Eye, EyeOff,
  Bold, Italic, List, ListOrdered, Heading2,
  Heading3, Link2, Image as ImageIcon, Code,
  Quote, Minus, AlertCircle,
} from 'lucide-react';
import { blogAPI } from '@/lib/api';
import { getImageUrl, getErrorMessage } from '@/lib/utils';
import toast from 'react-hot-toast';

// ── Shared input styles ───────────────────────
const inp = `w-full px-3.5 py-2.5 rounded-xl text-sm bg-white/5 border border-purple-500/20
  text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-purple-500/50
  focus:border-purple-500/50 transition-all disabled:opacity-50`;

function Field({ label, hint, error, children }) {
  return (
    <div>
      <label className="block text-[10px] font-semibold uppercase tracking-widest
                         text-purple-300/60 mb-1.5">{label}</label>
      {children}
      {hint  && <p className="mt-1 text-[11px] text-purple-300/35">{hint}</p>}
      {error && <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
        <AlertCircle className="w-3 h-3" />{error}</p>}
    </div>
  );
}

// ── Tag input ─────────────────────────────────
function TagInput({ value = [], onChange }) {
  const [inp2, setInp2] = useState('');
  const add   = () => { const v = inp2.trim(); if (v && !value.includes(v)) { onChange([...value, v]); setInp2(''); } };
  const remove = t => onChange(value.filter(x => x !== t));
  const onKey  = e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } };
  return (
    <div className="rounded-xl border border-purple-500/20 bg-white/5 p-2 min-h-[44px]
                    focus-within:ring-2 focus-within:ring-purple-500/50 transition-all">
      <div className="flex flex-wrap gap-1.5 mb-1.5">
        {value.map(t => (
          <span key={t} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs
                                    bg-purple-500/20 text-purple-300 border border-purple-500/20">
            {t}
            <button type="button" onClick={() => remove(t)} className="text-purple-400/60 hover:text-red-400 transition-colors">
              <X className="w-2.5 h-2.5" />
            </button>
          </span>
        ))}
      </div>
      <input value={inp2} onChange={e => setInp2(e.target.value)} onKeyDown={onKey} onBlur={add}
        placeholder={value.length ? 'Add tag…' : 'Add tags (Enter to add)…'}
        className="w-full bg-transparent text-sm text-white placeholder-white/25 outline-none" />
    </div>
  );
}

// ── Tiptap toolbar ────────────────────────────
function Toolbar({ editor }) {
  if (!editor) return null;
  const btn = (action, isActive, icon) => (
    <button type="button" onClick={action}
      className={`p-1.5 rounded-lg transition-all ${isActive
        ? 'bg-purple-500/30 text-purple-300'
        : 'text-purple-400/50 hover:text-purple-300 hover:bg-purple-500/10'}`}>
      {icon}
    </button>
  );
  return (
    <div className="flex flex-wrap gap-0.5 p-2 border-b border-purple-500/15 bg-white/2">
      {btn(() => editor.chain().focus().toggleBold().run(),
        editor.isActive('bold'), <Bold className="w-3.5 h-3.5" />)}
      {btn(() => editor.chain().focus().toggleItalic().run(),
        editor.isActive('italic'), <Italic className="w-3.5 h-3.5" />)}
      {btn(() => editor.chain().focus().toggleHeading({ level: 2 }).run(),
        editor.isActive('heading', { level: 2 }), <Heading2 className="w-3.5 h-3.5" />)}
      {btn(() => editor.chain().focus().toggleHeading({ level: 3 }).run(),
        editor.isActive('heading', { level: 3 }), <Heading3 className="w-3.5 h-3.5" />)}
      {btn(() => editor.chain().focus().toggleBulletList().run(),
        editor.isActive('bulletList'), <List className="w-3.5 h-3.5" />)}
      {btn(() => editor.chain().focus().toggleOrderedList().run(),
        editor.isActive('orderedList'), <ListOrdered className="w-3.5 h-3.5" />)}
      {btn(() => editor.chain().focus().toggleCodeBlock().run(),
        editor.isActive('codeBlock'), <Code className="w-3.5 h-3.5" />)}
      {btn(() => editor.chain().focus().toggleBlockquote().run(),
        editor.isActive('blockquote'), <Quote className="w-3.5 h-3.5" />)}
      {btn(() => editor.chain().focus().setHorizontalRule().run(),
        false, <Minus className="w-3.5 h-3.5" />)}
      <button type="button"
        onClick={() => {
          const url = window.prompt('Enter URL');
          if (url) editor.chain().focus().setLink({ href: url }).run();
        }}
        className={`p-1.5 rounded-lg transition-all ${editor.isActive('link')
          ? 'bg-purple-500/30 text-purple-300'
          : 'text-purple-400/50 hover:text-purple-300 hover:bg-purple-500/10'}`}>
        <Link2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ========================
// BlogForm (shared new + edit)
// ========================
export default function BlogForm({ existingPost = null }) {
  const router  = useRouter();
  const isEdit  = !!existingPost;
  const [tags,          setTags]          = useState(existingPost?.tags || []);
  const [coverPreview,  setCoverPreview]  = useState(
    existingPost?.coverImageFileId ? getImageUrl(existingPost.coverImageFileId)
      : existingPost?.coverImageUrl || null
  );
  const [coverUploading, setCoverUploading] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [preview, setPreview] = useState(false);
  const coverRef = useRef(null);

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      title:           existingPost?.title           || '',
      excerpt:         existingPost?.excerpt         || '',
      category:        existingPost?.category        || 'General',
      coverImageUrl:   existingPost?.coverImageUrl   || '',
      published:       existingPost?.published       ?? false,
      featured:        existingPost?.featured        ?? false,
      metaTitle:       existingPost?.metaTitle       || '',
      metaDescription: existingPost?.metaDescription || '',
    },
  });

  // Tiptap editor
  const editor = useEditor({
    extensions: [StarterKit, Link.configure({ openOnClick: false }), Image],
    content: existingPost?.content || '',
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-sm max-w-none p-4 min-h-[320px] focus:outline-none text-purple-100/85',
      },
    },
  });

  // Cover upload
  const handleCoverChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => setCoverPreview(ev.target.result);
    reader.readAsDataURL(file);

    if (!isEdit) { setValue('_coverFile', file); return; }

    setCoverUploading(true);
    try {
      const fd = new FormData(); fd.append('cover', file);
      await blogAPI.update(existingPost._id + '/cover', fd); // handled via uploadCover endpoint
      toast.success('Cover uploaded ✓');
    } catch (err) { toast.error(getErrorMessage(err)); setCoverPreview(null); }
    finally { setCoverUploading(false); e.target.value = ''; }
  };

  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const payload = { ...data, tags, content: editor?.getHTML() || '' };
      delete payload._coverFile;

      if (isEdit) {
        await blogAPI.update(existingPost._id, payload);
        toast.success('Post updated ✓');
        router.push('/admin/blog');
      } else {
        const res = await blogAPI.create(payload);
        const newId = res.data.data._id;
        // Upload cover if file was selected
        const coverFile = data._coverFile;
        if (coverFile instanceof File) {
          const fd = new FormData(); fd.append('cover', coverFile);
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog/${newId}/cover`, {
            method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` },
            body: fd,
          });
        }
        toast.success('Post created ✓');
        router.push('/admin/blog');
      }
    } catch (err) { toast.error(getErrorMessage(err)); }
    finally { setSaving(false); }
  };

  return (
    <div className="max-w-5xl mx-auto pb-16">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading">
            {isEdit ? 'Edit Post' : 'New Blog Post'}
          </h1>
          <p className="text-sm text-purple-300/60 mt-0.5">
            {isEdit ? existingPost.title : 'Write something worth reading'}
          </p>
        </div>
        <button type="button" onClick={() => setPreview(p => !p)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                     border border-purple-500/20 text-purple-300/70 hover:bg-purple-500/10
                     transition-colors">
          {preview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {preview ? 'Edit' : 'Preview'}
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── Main editor col ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Title */}
            <div className="rounded-2xl border border-purple-500/15 bg-white/3 p-5 space-y-4">
              <Field label="Post Title *" error={errors.title?.message}>
                <input {...register('title', { required: 'Title is required' })}
                  placeholder="An interesting headline…" className={inp} />
              </Field>
              <Field label="Excerpt" hint="Shown in post cards — max 500 chars">
                <textarea {...register('excerpt')} rows={2}
                  placeholder="A brief summary of what this post is about…"
                  className={`${inp} resize-y`} />
              </Field>
            </div>

            {/* Rich text editor */}
            <div className="rounded-2xl border border-purple-500/15 bg-white/3 overflow-hidden">
              <div className="px-4 pt-4 pb-1">
                <label className="block text-[10px] font-semibold uppercase tracking-widest
                                   text-purple-300/60 mb-2">Content</label>
              </div>
              {!preview ? (
                <>
                  <Toolbar editor={editor} />
                  <EditorContent editor={editor} />
                </>
              ) : (
                <div
                  className="prose prose-invert prose-sm max-w-none p-6 min-h-[320px]
                             text-purple-100/85"
                  dangerouslySetInnerHTML={{ __html: editor?.getHTML() || '<p class="text-purple-400/40">Nothing to preview yet.</p>' }}
                />
              )}
            </div>
          </div>

          {/* ── Right sidebar ── */}
          <div className="space-y-4">

            {/* Cover image */}
            <div className="rounded-2xl border border-purple-500/15 bg-white/3 p-4">
              <label className="block text-[10px] font-semibold uppercase tracking-widest
                                 text-purple-300/60 mb-3">Cover Image</label>
              <div onClick={() => coverRef.current?.click()}
                className="aspect-video rounded-xl overflow-hidden border-2 border-dashed
                           border-purple-500/20 bg-purple-900/10 flex items-center justify-center
                           cursor-pointer hover:border-purple-500/40 transition-all group mb-2">
                {coverPreview ? (
                  <img src={coverPreview} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="text-center p-3">
                    <ImageIcon className="w-8 h-8 text-purple-500/25 mx-auto mb-1" />
                    <p className="text-[11px] text-purple-300/40">Click to upload</p>
                  </div>
                )}
              </div>
              <input ref={coverRef} type="file" accept="image/jpeg,image/png,image/webp"
                onChange={handleCoverChange} className="hidden" />
              <button type="button" onClick={() => coverRef.current?.click()}
                disabled={coverUploading}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs
                           font-medium border border-purple-500/20 text-purple-300/60
                           hover:bg-purple-500/10 transition-colors disabled:opacity-50">
                <Upload className="w-3.5 h-3.5" />
                {coverUploading ? 'Uploading…' : 'Upload cover'}
              </button>
              <div className="mt-3">
                <Field label="Or paste image URL">
                  <input {...register('coverImageUrl')} placeholder="https://…" className={inp} />
                </Field>
              </div>
            </div>

            {/* Meta */}
            <div className="rounded-2xl border border-purple-500/15 bg-white/3 p-4 space-y-4">
              <Field label="Category">
                <input {...register('category')} placeholder="Startup, Tech, AWS…" className={inp} />
              </Field>
              <Field label="Tags" hint="Press Enter or comma to add">
                <TagInput value={tags} onChange={setTags} />
              </Field>
            </div>

            {/* Settings */}
            <div className="rounded-2xl border border-purple-500/15 bg-white/3 p-4 space-y-3">
              <label className="block text-[10px] font-semibold uppercase tracking-widest
                                 text-purple-300/60 mb-2">Settings</label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-purple-200/70">Published</span>
                <input type="checkbox" {...register('published')}
                  className="w-4 h-4 rounded accent-purple-500 cursor-pointer" />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-sm text-purple-200/70">Featured</span>
                <input type="checkbox" {...register('featured')}
                  className="w-4 h-4 rounded accent-purple-500 cursor-pointer" />
              </label>
            </div>

            {/* SEO */}
            <div className="rounded-2xl border border-purple-500/15 bg-white/3 p-4 space-y-4">
              <label className="block text-[10px] font-semibold uppercase tracking-widest
                                 text-purple-300/60">SEO</label>
              <Field label="Meta Title">
                <input {...register('metaTitle')} placeholder="Override title for SEO…" className={inp} />
              </Field>
              <Field label="Meta Description">
                <textarea {...register('metaDescription')} rows={2}
                  placeholder="Brief description for search engines…"
                  className={`${inp} resize-none`} />
              </Field>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <motion.button type="submit" disabled={saving}
                whileHover={{ scale: saving ? 1 : 1.02 }} whileTap={{ scale: saving ? 1 : 0.97 }}
                className="flex items-center justify-center gap-2 py-3 rounded-xl text-sm
                           font-bold text-white disabled:opacity-50"
                style={{ background: 'linear-gradient(135deg,#7C3AED,#6d28d9)' }}>
                {saving
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</>
                  : <><Save className="w-4 h-4" />{isEdit ? 'Update Post' : 'Save Post'}</>
                }
              </motion.button>
              <button type="button" onClick={() => router.push('/admin/blog')}
                className="py-2.5 rounded-xl text-sm font-medium border border-purple-500/20
                           text-purple-300/60 hover:bg-purple-500/10 transition-colors">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
