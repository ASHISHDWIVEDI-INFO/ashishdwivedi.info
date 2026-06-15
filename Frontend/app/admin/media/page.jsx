'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Trash2, Loader2, ImageIcon, Copy, RefreshCw, Check, X } from 'lucide-react';
import API from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import toast from 'react-hot-toast';

function formatBytes(b) {
  if (!b) return '0 B';
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b/1024).toFixed(1)} KB`;
  return `${(b/(1024*1024)).toFixed(1)} MB`;
}

export default function AdminMediaPage() {
  const [files,     setFiles]     = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [uploading, setUploading] = useState(false);
  const [progress,  setProgress]  = useState(0);
  const [deleting,  setDeleting]  = useState(null);
  const [copied,    setCopied]    = useState(null);
  const [selected,  setSelected]  = useState(null);
  const fileRef = useRef(null);

  const fetchFiles = useCallback(async () => {
    setLoading(true);
    try {
      const r = await API.get('/media');
      setFiles(r.data.data || []);
    } catch (e) { toast.error(getErrorMessage(e)); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setProgress(0);
    try {
      const fd = new FormData(); fd.append('file', file);
      const r = await API.post('/media/upload', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: ev => setProgress(Math.round((ev.loaded * 100) / ev.total)),
      });
      setFiles(f => [r.data.data, ...f]);
      toast.success('File uploaded ✓');
    } catch (e) { toast.error(getErrorMessage(e)); }
    finally { setUploading(false); setProgress(0); e.target.value = ''; }
  };

  const handleDelete = async (fileId) => {
    setDeleting(fileId);
    try {
      await API.delete(`/media/${fileId}`);
      setFiles(f => f.filter(x => x.fileId?.toString() !== fileId?.toString()));
      if (selected?.fileId?.toString() === fileId?.toString()) setSelected(null);
      toast.success('Deleted.');
    } catch (e) { toast.error(getErrorMessage(e)); }
    finally { setDeleting(null); }
  };

  const copyUrl = (url) => {
    const full = `${process.env.NEXT_PUBLIC_API_URL}${url}`;
    navigator.clipboard.writeText(full).then(() => {
      setCopied(url);
      setTimeout(() => setCopied(null), 2000);
      toast.success('URL copied!');
    });
  };

  const isImage = (m) => m?.startsWith('image/');

  return (
    <div className="max-w-6xl mx-auto space-y-5 pb-12">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white font-heading">Media Library</h1>
          <p className="text-sm text-purple-300/60 mt-0.5">{files.length} file{files.length !== 1 ? 's' : ''} stored in MongoDB GridFS</p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchFiles} className="p-2.5 rounded-xl border border-purple-500/20 text-purple-400/60 hover:text-purple-300 hover:bg-purple-500/10 transition-all">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <input ref={fileRef} type="file" accept="image/*,application/pdf" onChange={handleUpload} className="hidden" />
          <button onClick={() => fileRef.current?.click()} disabled={uploading}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,#7C3AED,#6d28d9)' }}>
            {uploading ? <><Loader2 className="w-4 h-4 animate-spin" />{progress}%</> : <><Upload className="w-4 h-4" />Upload</>}
          </button>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center h-48"><Loader2 className="w-8 h-8 text-purple-400 animate-spin" /></div>
      ) : files.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 rounded-2xl border border-dashed border-purple-500/20">
          <ImageIcon className="w-10 h-10 text-purple-500/30 mb-3" />
          <p className="text-sm text-purple-300/50">No files yet</p>
          <button onClick={() => fileRef.current?.click()} className="mt-3 text-xs text-purple-400 hover:text-purple-300 underline">Upload first file →</button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <AnimatePresence>
            {files.map((file, i) => (
              <motion.div key={file.fileId?.toString()} initial={{ opacity:0, scale:.9 }} animate={{ opacity:1, scale:1 }}
                exit={{ opacity:0, scale:.9 }} transition={{ delay: i * 0.02 }}
                onClick={() => setSelected(file)}
                className={`group relative aspect-square rounded-xl overflow-hidden border cursor-pointer transition-all
                  ${selected?.fileId?.toString() === file.fileId?.toString()
                    ? 'border-purple-500/60 ring-2 ring-purple-500/30'
                    : 'border-purple-500/15 hover:border-purple-500/40'
                  }`}>

                {isImage(file.mimetype) ? (
                  <img src={`${process.env.NEXT_PUBLIC_API_URL}${file.url}`} alt={file.filename}
                    className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-purple-900/20 flex flex-col items-center justify-center p-2">
                    <ImageIcon className="w-8 h-8 text-purple-500/40 mb-1" />
                    <p className="text-[9px] text-purple-300/40 text-center truncate w-full">{file.filename}</p>
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity
                                flex items-center justify-center gap-1.5">
                  <button onClick={e => { e.stopPropagation(); copyUrl(file.url); }}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors"
                    title="Copy URL">
                    {copied === file.url ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                  <button onClick={e => { e.stopPropagation(); handleDelete(file.fileId); }}
                    disabled={deleting?.toString() === file.fileId?.toString()}
                    className="p-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/40 text-red-400 transition-colors disabled:opacity-50"
                    title="Delete">
                    {deleting?.toString() === file.fileId?.toString()
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Trash2 className="w-3.5 h-3.5" />
                    }
                  </button>
                </div>

                {/* Size badge */}
                <div className="absolute bottom-1 right-1 text-[9px] bg-black/70 text-white/70 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {formatBytes(file.size)}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Selected file detail panel */}
      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity:0, y:12 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:12 }}
            className="p-5 rounded-2xl border border-purple-500/25 bg-white/3 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white">File Details</h3>
              <button onClick={() => setSelected(null)} className="p-1 rounded-lg hover:bg-white/5 text-purple-400/60 hover:text-purple-300"><X className="w-4 h-4" /></button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {[
                ['Filename', selected.filename],
                ['Type',     selected.mimetype],
                ['Size',     formatBytes(selected.size)],
                ['URL',      `…/media/${selected.fileId}`],
              ].map(([k, v]) => (
                <div key={k} className="p-3 rounded-xl bg-white/3 border border-purple-500/10">
                  <p className="text-purple-300/40 uppercase tracking-widest text-[10px] mb-1">{k}</p>
                  <p className="text-white font-mono truncate">{v}</p>
                </div>
              ))}
            </div>
            <button onClick={() => copyUrl(selected.url)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border border-purple-500/25 text-purple-300 hover:bg-purple-500/15 transition-all">
              {copied === selected.url ? <><Check className="w-3.5 h-3.5" />Copied!</> : <><Copy className="w-3.5 h-3.5" />Copy Full URL</>}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
