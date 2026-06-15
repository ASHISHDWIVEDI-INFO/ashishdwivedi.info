'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail, MailOpen, Star, Archive, Trash2, Download,
  Loader2, Search, RefreshCw, X, Reply, CheckCircle2,
  Filter, MessageSquare,
} from 'lucide-react';
import { contactAPI } from '@/lib/api';
import { formatDate, timeAgo, getErrorMessage, truncate } from '@/lib/utils';
import toast from 'react-hot-toast';

// ── Message detail modal ──────────────────────
function MessageModal({ msg, onClose, onToggleRead, onToggleStar, onDelete, onMarkReplied }) {
  const [replying, setReplying] = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto"
         style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}>
      <motion.div initial={{ scale:.94, opacity:0, y:16 }}
        animate={{ scale:1, opacity:1, y:0 }} exit={{ scale:.94, opacity:0 }}
        className="bg-[#0d0d28] border border-purple-500/25 rounded-2xl w-full max-w-2xl
                   my-6 shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-start justify-between gap-3 p-5 border-b border-purple-500/15">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-bold text-white mb-0.5 truncate">{msg.subject}</h3>
            <p className="text-sm text-purple-300/60">
              From <span className="text-purple-200">{msg.name}</span>
              {' · '}<a href={`mailto:${msg.email}`}
                className="text-purple-400 hover:text-purple-300 transition-colors">
                {msg.email}
              </a>
              {' · '}<span>{timeAgo(msg.createdAt)}</span>
            </p>
          </div>
          <button onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/5 text-purple-400/60
                       hover:text-purple-300 transition-colors shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5">
          <div className="p-4 rounded-xl bg-white/3 border border-purple-500/10 mb-5">
            <p className="text-sm text-purple-100/80 whitespace-pre-wrap leading-relaxed">
              {msg.message}
            </p>
          </div>
          <p className="text-xs text-purple-300/40">
            Received: {formatDate(msg.createdAt, 'dd MMM yyyy, HH:mm')}
          </p>
          {msg.repliedAt && (
            <p className="text-xs text-green-400/60 mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" />
              Marked replied on {formatDate(msg.repliedAt, 'dd MMM yyyy')}
              {msg.replyNote && ` · "${msg.replyNote}"`}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 px-5 py-4 border-t border-purple-500/15">
          <a href={`mailto:${msg.email}?subject=Re: ${encodeURIComponent(msg.subject)}`}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold
                       text-white transition-all"
            style={{ background: 'linear-gradient(135deg,#7C3AED,#6d28d9)' }}>
            <Reply className="w-3.5 h-3.5" />Reply via email
          </a>
          {!msg.repliedAt && (
            <button onClick={() => { onMarkReplied(msg._id); onClose(); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                         border border-green-500/25 text-green-400 hover:bg-green-500/10
                         transition-colors">
              <CheckCircle2 className="w-3.5 h-3.5" />Mark replied
            </button>
          )}
          <button onClick={() => { onToggleRead(msg._id); onClose(); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                       border border-purple-500/20 text-purple-300/70 hover:bg-purple-500/10
                       transition-colors">
            {msg.isRead
              ? <><Mail className="w-3.5 h-3.5" />Mark unread</>
              : <><MailOpen className="w-3.5 h-3.5" />Mark read</>
            }
          </button>
          <button onClick={() => { onDelete(msg._id); onClose(); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium
                       border border-red-500/20 text-red-400/70 hover:bg-red-500/10
                       hover:text-red-400 transition-colors ml-auto">
            <Trash2 className="w-3.5 h-3.5" />Delete
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// ========================
// Main Page
// ========================
export default function AdminContactPage() {
  const [messages,  setMessages]  = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [unread,    setUnread]    = useState(0);
  const [search,    setSearch]    = useState('');
  const [filter,    setFilter]    = useState('all'); // all | unread | starred | archived
  const [selected,  setSelected]  = useState(null);
  const [deleting,  setDeleting]  = useState(null);
  const [toggling,  setToggling]  = useState({});
  const [exporting, setExporting] = useState(false);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (filter === 'unread')   { params.isRead = 'false'; params.isArchived = 'false'; }
      if (filter === 'starred')  { params.isStarred = 'true'; }
      if (filter === 'archived') { params.isArchived = 'true'; }
      if (filter === 'all')      { params.isArchived = 'false'; }

      const res = await contactAPI.getAll(params);
      setMessages(res.data.data || []);
      setUnread(res.data.unreadCount || 0);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  // ── Client-side search ────────────────────
  const filtered = messages.filter(m =>
    !search ||
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    m.subject.toLowerCase().includes(search.toLowerCase())
  );

  // ── Toggle read ───────────────────────────
  const handleToggleRead = async (id) => {
    setToggling(t => ({ ...t, [id + 'r']: true }));
    try {
      const res = await contactAPI.markRead(id);
      setMessages(ms => ms.map(m =>
        m._id === id ? { ...m, isRead: res.data.isRead } : m
      ));
      if (res.data.isRead) setUnread(u => Math.max(0, u - 1));
      else setUnread(u => u + 1);
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setToggling(t => ({ ...t, [id + 'r']: false }));
    }
  };

  // ── Toggle star ───────────────────────────
  const handleToggleStar = async (id) => {
    setToggling(t => ({ ...t, [id + 's']: true }));
    try {
      const res = await contactAPI.markRead(id); // using markRead endpoint temporarily
      // Actually use the star endpoint
      const starRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/contact/${id}/star`,
        { method: 'PATCH', headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` } }
      );
      const data = await starRes.json();
      setMessages(ms => ms.map(m =>
        m._id === id ? { ...m, isStarred: data.isStarred } : m
      ));
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setToggling(t => ({ ...t, [id + 's']: false }));
    }
  };

  // ── Delete ────────────────────────────────
  const handleDelete = async (id) => {
    setDeleting(id);
    try {
      await contactAPI.delete(id);
      setMessages(ms => ms.filter(m => m._id !== id));
      toast.success('Message deleted.');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setDeleting(null);
    }
  };

  // ── Mark replied ──────────────────────────
  const handleMarkReplied = async (id) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/contact/${id}/reply`,
        { method: 'PATCH', headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('admin_token')}`,
        }, body: JSON.stringify({ note: '' }) }
      );
      const data = await res.json();
      setMessages(ms => ms.map(m => m._id === id ? data.data : m));
      toast.success('Marked as replied ✓');
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  // ── Export CSV ────────────────────────────
  const handleExport = async () => {
    setExporting(true);
    try {
      const token = localStorage.getItem('admin_token');
      const res   = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/contact/export`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url; a.download = `contacts-${Date.now()}.csv`; a.click();
      URL.revokeObjectURL(url);
      toast.success('CSV exported ✓');
    } catch (err) {
      toast.error(getErrorMessage(err));
    } finally {
      setExporting(false);
    }
  };

  const FILTERS = [
    { key: 'all',      label: 'Inbox'    },
    { key: 'unread',   label: `Unread${unread > 0 ? ` (${unread})` : ''}` },
    { key: 'starred',  label: 'Starred'  },
    { key: 'archived', label: 'Archived' },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-5 pb-12">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white font-heading">
            Messages
            {unread > 0 && (
              <span className="ml-2 text-sm font-medium px-2 py-0.5 rounded-full
                               bg-purple-500 text-white align-middle">
                {unread}
              </span>
            )}
          </h1>
          <p className="text-sm text-purple-300/60 mt-0.5">
            {messages.length} message{messages.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={fetchMessages}
            className="p-2.5 rounded-xl border border-purple-500/20 text-purple-400/60
                       hover:text-purple-300 hover:bg-purple-500/10 transition-all">
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button onClick={handleExport} disabled={exporting}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium
                       border border-purple-500/20 text-purple-300/70 hover:bg-purple-500/10
                       transition-colors disabled:opacity-50">
            {exporting
              ? <Loader2 className="w-4 h-4 animate-spin" />
              : <Download className="w-4 h-4" />
            }
            Export CSV
          </button>
        </div>
      </div>

      {/* Filter tabs + search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 p-1 rounded-xl bg-white/3 border border-purple-500/10 shrink-0">
          {FILTERS.map(f => (
            <button key={f.key} onClick={() => setFilter(f.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all
                ${filter === f.key
                  ? 'bg-purple-600/30 text-purple-300 border border-purple-500/30'
                  : 'text-purple-300/50 hover:text-purple-300 hover:bg-white/5'
                }`}>
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-purple-400/50" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name, email or subject…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-white/5 border
                       border-purple-500/20 text-white placeholder-white/25 focus:outline-none
                       focus:ring-2 focus:ring-purple-500/50 transition-all" />
        </div>
      </div>

      {/* Message list */}
      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 className="w-8 h-8 text-purple-400 animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-48 rounded-2xl
                        border border-dashed border-purple-500/20">
          <MessageSquare className="w-10 h-10 text-purple-500/30 mb-3" />
          <p className="text-sm text-purple-300/50">
            {search ? 'No messages match your search' : 'No messages yet'}
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          <AnimatePresence>
            {filtered.map((msg, i) => (
              <motion.div key={msg._id}
                initial={{ opacity:0, y:6 }} animate={{ opacity:1, y:0 }}
                exit={{ opacity:0, scale:.97 }} transition={{ delay: i * 0.02 }}
                onClick={() => setSelected(msg)}
                className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer
                             transition-all hover:border-purple-500/30 hover:bg-white/4
                  ${msg.isRead
                    ? 'border-purple-500/10 bg-white/2'
                    : 'border-purple-500/25 bg-purple-500/5'
                  }`}
              >
                {/* Read indicator */}
                <div className="mt-1 shrink-0">
                  {msg.isRead
                    ? <MailOpen className="w-4 h-4 text-purple-400/30" />
                    : <Mail className="w-4 h-4 text-purple-400" />
                  }
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <span className={`text-sm font-semibold ${msg.isRead ? 'text-purple-200/70' : 'text-white'}`}>
                      {msg.name}
                    </span>
                    {!msg.isRead && (
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                    )}
                    {msg.isStarred && (
                      <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400/50 shrink-0" />
                    )}
                    {msg.repliedAt && (
                      <span className="text-[10px] text-green-400/70 bg-green-500/10
                                       border border-green-500/20 px-1.5 py-0.5 rounded-full">
                        Replied
                      </span>
                    )}
                    <span className="text-xs text-purple-300/40 ml-auto shrink-0">
                      {timeAgo(msg.createdAt)}
                    </span>
                  </div>
                  <p className={`text-sm mb-0.5 truncate ${msg.isRead ? 'text-purple-200/50' : 'text-purple-100'}`}>
                    {msg.subject}
                  </p>
                  <p className="text-xs text-purple-300/40 truncate">
                    {msg.email} · {truncate(msg.message, 80)}
                  </p>
                </div>

                {/* Row actions */}
                <div className="flex flex-col gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                  <button onClick={() => handleToggleStar(msg._id)}
                    disabled={toggling[msg._id + 's']}
                    className={`p-1.5 rounded-lg transition-all disabled:opacity-50
                      ${msg.isStarred
                        ? 'text-amber-400 hover:bg-amber-400/10'
                        : 'text-purple-400/30 hover:text-amber-400 hover:bg-amber-400/10'
                      }`}>
                    {toggling[msg._id + 's']
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Star className={`w-3.5 h-3.5 ${msg.isStarred ? 'fill-amber-400/50' : ''}`} />
                    }
                  </button>
                  <button onClick={() => handleDelete(msg._id)}
                    disabled={deleting === msg._id}
                    className="p-1.5 rounded-lg text-purple-400/30 hover:text-red-400
                               hover:bg-red-400/10 transition-all disabled:opacity-50">
                    {deleting === msg._id
                      ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      : <Trash2 className="w-3.5 h-3.5" />
                    }
                  </button>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Message detail modal */}
      <AnimatePresence>
        {selected && (
          <MessageModal
            msg={selected}
            onClose={() => setSelected(null)}
            onToggleRead={handleToggleRead}
            onToggleStar={handleToggleStar}
            onDelete={handleDelete}
            onMarkReplied={handleMarkReplied}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
