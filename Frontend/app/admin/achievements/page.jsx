'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Pencil, Loader2, Trophy, X, Check, RefreshCw } from 'lucide-react';
import API from '@/lib/api';
import { formatDate, getErrorMessage } from '@/lib/utils';
import toast from 'react-hot-toast';

const CATS = ['award','competition','speaking','publication','milestone','other'];
const BLANK = { title:'', description:'', category:'award', date:'', issuer:'', url:'', icon:'🏆', featured:false, published:true, order:0 };
const inp = `w-full px-3.5 py-2.5 rounded-xl text-sm bg-white/5 border border-purple-500/20 text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all`;

function Modal({ initial, onSave, onClose, saving }) {
  const [form, setForm] = useState({ ...BLANK, ...initial, date: initial?.date?.slice(0,10)||'' });
  const set = (k,v) => setForm(f => ({ ...f, [k]:v }));
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto" style={{background:'rgba(0,0,0,0.75)',backdropFilter:'blur(4px)'}}>
      <motion.div initial={{scale:.94,opacity:0,y:16}} animate={{scale:1,opacity:1,y:0}} exit={{scale:.94,opacity:0}}
        className="bg-[#0d0d28] border border-purple-500/25 rounded-2xl w-full max-w-lg my-6 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-purple-500/15">
          <h3 className="text-base font-bold text-white flex items-center gap-2"><Trophy className="w-4 h-4 text-purple-400"/>{initial?._id?'Edit':'Add'} Achievement</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-purple-400/60 hover:text-purple-300"><X className="w-4 h-4"/></button>
        </div>
        <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-4 gap-3">
            <div><label className="block text-[10px] font-semibold uppercase tracking-widest text-purple-300/60 mb-1">Icon</label><input value={form.icon} onChange={e=>set('icon',e.target.value)} placeholder="🏆" className={`${inp} text-center text-xl`}/></div>
            <div className="col-span-3"><label className="block text-[10px] font-semibold uppercase tracking-widest text-purple-300/60 mb-1">Title *</label><input value={form.title} onChange={e=>set('title',e.target.value)} placeholder="Best Startup Award" className={inp}/></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-[10px] font-semibold uppercase tracking-widest text-purple-300/60 mb-1">Category</label>
              <select value={form.category} onChange={e=>set('category',e.target.value)} className={inp}>
                {CATS.map(c=><option key={c} value={c} className="bg-gray-900 capitalize">{c}</option>)}
              </select>
            </div>
            <div><label className="block text-[10px] font-semibold uppercase tracking-widest text-purple-300/60 mb-1">Date</label><input type="date" value={form.date} onChange={e=>set('date',e.target.value)} className={`${inp} [color-scheme:dark]`}/></div>
          </div>
          <div><label className="block text-[10px] font-semibold uppercase tracking-widest text-purple-300/60 mb-1">Issuer / Organization</label><input value={form.issuer} onChange={e=>set('issuer',e.target.value)} placeholder="TechCrunch Disrupt" className={inp}/></div>
          <div><label className="block text-[10px] font-semibold uppercase tracking-widest text-purple-300/60 mb-1">Description</label><textarea value={form.description} onChange={e=>set('description',e.target.value)} rows={2} className={`${inp} resize-y`}/></div>
          <div><label className="block text-[10px] font-semibold uppercase tracking-widest text-purple-300/60 mb-1">URL / Link</label><input value={form.url} onChange={e=>set('url',e.target.value)} placeholder="https://…" className={inp}/></div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.featured} onChange={e=>set('featured',e.target.checked)} className="w-4 h-4 rounded accent-purple-500"/><span className="text-sm text-purple-200/70">Featured</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.published} onChange={e=>set('published',e.target.checked)} className="w-4 h-4 rounded accent-purple-500"/><span className="text-sm text-purple-200/70">Published</span></label>
          </div>
        </div>
        <div className="flex items-center justify-between px-5 py-4 border-t border-purple-500/15">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium border border-purple-500/20 text-purple-300/70 hover:bg-purple-500/10 transition-colors">Cancel</button>
          <button onClick={()=>onSave(form)} disabled={saving||!form.title.trim()} className="flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{background:'linear-gradient(135deg,#7C3AED,#6d28d9)'}}>
            {saving?<><Loader2 className="w-4 h-4 animate-spin"/>Saving…</>:<><Check className="w-4 h-4"/>Save</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminAchievementsPage() {
  const [items,setItems]=useState([]);const [loading,setLoading]=useState(true);const [modal,setModal]=useState(null);const [saving,setSaving]=useState(false);const [deleting,setDeleting]=useState(null);
  const fetch_=useCallback(async()=>{setLoading(true);try{const r=await API.get('/achievements');setItems(r.data.data||[]);}catch(e){toast.error(getErrorMessage(e));}finally{setLoading(false);}}, []);
  useEffect(()=>{fetch_();},[fetch_]);
  const handleSave=async(form)=>{setSaving(true);try{if(form._id){const r=await API.put(`/achievements/${form._id}`,form);setItems(i=>i.map(x=>x._id===form._id?r.data.data:x));toast.success('Updated ✓');}else{const r=await API.post('/achievements',form);setItems(i=>[r.data.data,...i]);toast.success('Added ✓');}setModal(null);}catch(e){toast.error(getErrorMessage(e));}finally{setSaving(false);}};
  const handleDelete=async(id)=>{setDeleting(id);try{await API.delete(`/achievements/${id}`);setItems(i=>i.filter(x=>x._id!==id));toast.success('Deleted.');}catch(e){toast.error(getErrorMessage(e));}finally{setDeleting(null);}};
  const CAT_COLORS={award:'text-amber-400 bg-amber-400/10 border-amber-400/20',competition:'text-blue-400 bg-blue-400/10 border-blue-400/20',speaking:'text-purple-400 bg-purple-400/10 border-purple-400/20',publication:'text-green-400 bg-green-400/10 border-green-400/20',milestone:'text-cyan-400 bg-cyan-400/10 border-cyan-400/20',other:'text-gray-400 bg-gray-400/10 border-gray-400/20'};
  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-12">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white font-heading">Achievements</h1><p className="text-sm text-purple-300/60 mt-0.5">{items.length} achievement{items.length!==1?'s':''}</p></div>
        <div className="flex gap-2">
          <button onClick={fetch_} className="p-2.5 rounded-xl border border-purple-500/20 text-purple-400/60 hover:text-purple-300 hover:bg-purple-500/10 transition-all"><RefreshCw className={`w-4 h-4 ${loading?'animate-spin':''}`}/></button>
          <button onClick={()=>setModal(BLANK)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white" style={{background:'linear-gradient(135deg,#7C3AED,#6d28d9)'}}><Plus className="w-4 h-4"/>Add Achievement</button>
        </div>
      </div>
      {loading?<div className="flex items-center justify-center h-48"><Loader2 className="w-8 h-8 text-purple-400 animate-spin"/></div>
        :items.length===0?<div className="flex flex-col items-center justify-center h-48 rounded-2xl border border-dashed border-purple-500/20"><Trophy className="w-10 h-10 text-purple-500/30 mb-3"/><p className="text-sm text-purple-300/50">No achievements yet</p><button onClick={()=>setModal(BLANK)} className="mt-3 text-xs text-purple-400 hover:text-purple-300 underline">Add first achievement →</button></div>
        :<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{items.map((item,i)=>(
          <motion.div key={item._id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
            className="flex gap-3 p-4 rounded-2xl border border-purple-500/15 bg-white/3 hover:border-purple-500/30 transition-all">
            <div className="text-2xl shrink-0 mt-0.5">{item.icon||'🏆'}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                <h3 className="text-sm font-bold text-white truncate">{item.title}</h3>
                {item.featured&&<span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400/15 text-amber-400 border border-amber-400/20">★</span>}
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full border capitalize ${CAT_COLORS[item.category]||CAT_COLORS.other}`}>{item.category}</span>
                {item.issuer&&<span className="text-xs text-purple-300/50 truncate">{item.issuer}</span>}
                {item.date&&<span className="text-xs text-purple-300/40">{formatDate(item.date,'MMM yyyy')}</span>}
              </div>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <button onClick={()=>setModal(item)} className="p-1.5 rounded-lg hover:bg-purple-500/15 text-purple-400/60 hover:text-purple-300 transition-all"><Pencil className="w-3.5 h-3.5"/></button>
              <button onClick={()=>handleDelete(item._id)} disabled={deleting===item._id} className="p-1.5 rounded-lg hover:bg-red-500/15 text-purple-400/40 hover:text-red-400 transition-all disabled:opacity-50">{deleting===item._id?<Loader2 className="w-3.5 h-3.5 animate-spin"/>:<Trash2 className="w-3.5 h-3.5"/>}</button>
            </div>
          </motion.div>
        ))}</div>}
      <AnimatePresence>{modal&&<Modal initial={modal} onSave={handleSave} onClose={()=>setModal(null)} saving={saving}/>}</AnimatePresence>
    </div>
  );
}