'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import {
  Save, Loader2, Upload, Eye, EyeOff, Star,
  StarOff, X, AlertCircle, Image as ImageIcon,
  ArrowLeft,
} from 'lucide-react';
import { blogAPI } from '@/lib/api';
import { getImageUrl, getErrorMessage } from '@/lib/utils';
import toast from 'react-hot-toast';

// ── Tag input ─────────────────────────────────
function TagInput({ value = [], onChange }) {
  const [inp, setInp] = useState('');
  const add = () => {
    const v = inp.trim();
    if (v && !value.includes(v)) onChange([...value, v]);
    setInp('');
  };
  const remove = (t) => onChange(value.filter(x => x !== t));
  const onKey  = (e) => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); add(); } };

  return (
    <div className="rounded-xl border border-purple-500/20 bg-white/5 p-2 min-h-[44px]">
      <div className="flex flex-wrap gap-1.5 mb-1.5">
        {value.map(t => (
          <span key={t} className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs
                                    bg-purple-500/20 text-purple-300 border border-purple-500/20">
            {t}
            <button type="button" onClick={() => remove(t)}
              className="text-purple-400/60 hover:text-purple-300 transition-colors">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <input value={inp} onChange={e => setInp(e.target.value)} onKeyDown={onKey}
        onBlur={add} placeholder={value.length ? 'Add more…' : 'react, nextjs… (Enter to add)'}
        className="w-full bg-transparent text-sm text-white placeholder-white/25 outline-none" />
    </div>
  );
}

const inp = `w-full px-3.5 py-2.5 rounded-xl text-sm bg-white/5 border border-purple-500/20
  text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-purple-500/50
  focus:border-purple-500/50 transition-all`;

// ========================
// Blog Editor Form
// ========================
export default function BlogEditorForm({ existingPost = null }) {
  const router  = useRouter();
  const isEdit  = !!existingPost;
  const coverRef = useRef(null);

  const [tags,           setTags]           = useState(existingPost?.tags || []);
  const [coverPreview,   setCoverPreview]   = useState(
    existingPost?.coverImageFileId ? getImageUrl(existingPost.coverImageFileId)
    : existingPost?.coverImageUrl  || null
  );
  const [coverUploading, setCoverUploading] = useState(false);
  const [saving,         setSaving]         = useState(false);

  // Simple textarea editor (avoids SSR issues with Tiptap)
  const [content, setContent] = useState(existingPost?.content || '');

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm({
    defaultValues: {
      title:           existingPost?.title           || '',
      excerpt:         existingPost?.excerpt         || '',
      category:        existingPost?.category        || 'General',
      published:       existingPost?.published       ?? false,
      featured:        existingPost?.featured        ?? false,
      metaTitle:       existingPost?.metaTitle       || '',
      metaDescription: existingPost?.metaDescription || '',
      coverImageUrl:   existingPost?.coverImageUrl   || '',
    },
  });

  const isPublished = watch('published');
  const isFeatured  = watch('featured');

  // ── Cover image upload ────────────────────
  const handleCoverChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file || !isEdit) {
      // For new posts: just preview, upload after create
      if (file) {
        const reader = new FileReader();
        reader.onload = ev => setCoverPreview(ev.target.result);
        reader.readAsDataURL(file);
        e.target._file = file; // store for later
      }
      return;
    }
    const reader = new FileReader();
    reader.onload = ev => setCoverPreview(ev.target.result);
    reader.readAsDataURL(file);

    setCoverUploading(true);
    try {
      const fd = new FormData(); fd.append('cover', file);
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog/${existingPost._id}/cover`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` },
        body: fd,
      });
      toast.success('Cover uploaded ✓');
    } catch { toast.error('Cover upload failed'); }
    finally { setCoverUploading(false); e.target.value = ''; }
  };

  // ── Submit ────────────────────────────────
  const onSubmit = async (data) => {
    setSaving(true);
    try {
      const payload = { ...data, tags, content };

      if (isEdit) {
        await blogAPI.update(existingPost._id, payload);
        toast.success('Post updated ✓');
        router.push('/admin/blog');
      } else {
        const res = await blogAPI.create(payload);
        const newId = res.data.data._id;

        // Upload cover if one was selected
        const fileInput = coverRef.current;
        if (fileInput?._file) {
          const fd = new FormData(); fd.append('cover', fileInput._file);
          await fetch(`${process.env.NEXT_PUBLIC_API_URL}/blog/${newId}/cover`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` },
            body: fd,
          });
        }

        toast.success('Post created ✓');
        router.push('/admin/blog');
      }
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-16">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => router.push('/admin/blog')}
          className="p-2 rounded-xl border border-purple-500/20 text-purple-400/60
                     hover:text-purple-300 hover:bg-purple-500/10 transition-all">
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white font-heading">
            {isEdit ? 'Edit Post' : 'New Post'}
          </h1>
          <p className="text-sm text-purple-300/60 mt-0.5">
            {isEdit ? existingPost.title : 'Write something great'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* ── Main editor (left 2/3) ── */}
          <div className="lg:col-span-2 space-y-4">

            {/* Title */}
            <div>
              <input {...register('title', { required: 'Title is required' })}
                placeholder="Post title…"
                className="w-full px-4 py-3.5 rounded-xl text-xl font-bold bg-white/5 border
                           border-purple-500/20 text-white placeholder-white/20 focus:outline-none
                           focus:ring-2 focus:ring-purple-500/50 transition-all" />
              {errors.title && (
                <p className="mt-1 text-xs text-red-400 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />{errors.title.message}
                </p>
              )}
            </div>

            {/* Excerpt */}
            <div className="rounded-2xl border border-purple-500/15 bg-white/3 p-5">
              <label className="block text-xs font-semibold uppercase tracking-widest
                                 text-purple-300/60 mb-2">Excerpt</label>
              <textarea {...register('excerpt')} rows={2}
                placeholder="Short summary shown on blog cards…"
                className={`${inp} resize-y`} />
            </div>

            {/* Content editor */}
            <div className="rounded-2xl border border-purple-500/15 bg-white/3 p-5">
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold uppercase tracking-widest text-purple-300/60">
                  Content (HTML supported)
                </label>
                <span className="text-[10px] text-purple-300/30">
                  {content.replace(/<[^>]+>/g,'').split(/\s+/).filter(Boolean).length} words
                </span>
              </div>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={20}
                placeholder="Write your post content here… HTML tags are supported."
                className={`${inp} resize-y font-mono text-xs leading-relaxed`}
              />
              <p className="mt-2 text-[11px] text-purple-300/30">
                Tip: Use &lt;h2&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;ul&gt;, &lt;code&gt; tags for formatting.
              </p>
            </div>

            {/* Tags */}
            <div className="rounded-2xl border border-purple-500/15 bg-white/3 p-5">
              <label className="block text-xs font-semibold uppercase tracking-widest
                                 text-purple-300/60 mb-2">Tags</label>
              <TagInput value={tags} onChange={setTags} />
            </div>

            {/* SEO */}
            <div className="rounded-2xl border border-purple-500/15 bg-white/3 p-5 space-y-4">
              <h3 className="text-sm font-bold text-white">SEO</h3>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest
                                   text-purple-300/60 mb-1.5">Meta Title</label>
                <input {...register('metaTitle')} placeholder="Overrides post title for SEO…"
                  className={inp} />
              </div>
              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest
                                   text-purple-300/60 mb-1.5">Meta Description</label>
                <textarea {...register('metaDescription')} rows={2}
                  placeholder="160 chars max for search engines…"
                  className={`${inp} resize-none`} />
              </div>
            </div>
          </div>

          {/* ── Sidebar (right 1/3) ── */}
          <div className="space-y-4">

            {/* Publish settings */}
            <div className="rounded-2xl border border-purple-500/15 bg-white/3 p-5 space-y-4">
              <h3 className="text-sm font-bold text-white">Publishing</h3>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-purple-200/80">Published</p>
                  <p className="text-[11px] text-purple-300/40">Visible to public</p>
                </div>
                <div className={`relative w-11 h-6 rounded-full transition-colors duration-200
                  ${isPublished ? 'bg-purple-600' : 'bg-white/10'}`}
                  onClick={() => setValue('published', !isPublished)}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform
                    ${isPublished ? 'translate-x-6' : 'translate-x-1'}`} />
                </div>
              </label>

              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <p className="text-sm font-medium text-purple-200/80">Featured</p>
                  <p className="text-[11px] text-purple-300/40">Shown prominently</p>
                </div>
                <div className={`relative w-11 h-6 rounded-full transition-colors duration-200
                  ${isFeatured ? 'bg-amber-500' : 'bg-white/10'}`}
                  onClick={() => setValue('featured', !isFeatured)}>
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform
                    ${isFeatured ? 'translate-x-6' : 'translate-x-1'}`} />
                </div>
              </label>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-widest
                                   text-purple-300/60 mb-1.5">Category</label>
                <input {...register('category')} placeholder="e.g. Startup, AWS, Product"
                  className={inp} />
              </div>
            </div>

            {/* Cover image */}
            <div className="rounded-2xl border border-purple-500/15 bg-white/3 p-5">
              <h3 className="text-sm font-bold text-white mb-4">Cover Image</h3>

              <div onClick={() => coverRef.current?.click()}
                className="aspect-video rounded-xl overflow-hidden border-2 border-dashed
                           border-purple-500/20 bg-purple-900/10 flex items-center justify-center
                           cursor-pointer hover:border-purple-500/40 transition-all group mb-3">
                {coverPreview ? (
                  <>
                    <img src={coverPreview} alt="" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100
                                    flex items-center justify-center transition-opacity rounded-xl">
                      {coverUploading
                        ? <Loader2 className="w-7 h-7 text-white animate-spin" />
                        : <Upload className="w-7 h-7 text-white" />
                      }
                    </div>
                  </>
                ) : (
                  <div className="text-center p-4">
                    <ImageIcon className="w-8 h-8 text-purple-500/30 mx-auto mb-2" />
                    <p className="text-xs text-purple-300/40">Click to upload</p>
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
                <label className="block text-[10px] font-semibold uppercase tracking-widest
                                   text-purple-300/50 mb-1">Or paste URL</label>
                <input {...register('coverImageUrl')} placeholder="https://…"
                  className={`${inp} text-xs`} />
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2">
              <motion.button type="submit" disabled={saving}
                whileHover={{ scale: saving ? 1 : 1.02 }} whileTap={{ scale: saving ? 1 : 0.97 }}
                className="w-full flex items-center justify-center gap-2.5 py-3 rounded-xl
                           text-sm font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ background: 'linear-gradient(135deg,#7C3AED,#6d28d9)' }}>
                {saving
                  ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</>
                  : <><Save className="w-4 h-4" />{isEdit ? 'Update Post' : 'Save Post'}</>
                }
              </motion.button>
              <button type="button" onClick={() => router.push('/admin/blog')}
                className="w-full py-2.5 rounded-xl text-sm font-medium border border-purple-500/20
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
