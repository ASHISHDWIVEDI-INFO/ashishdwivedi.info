'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Pencil, Loader2, Building2, X, Check, RefreshCw, ExternalLink } from 'lucide-react';
import API from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import toast from 'react-hot-toast';

const BLANK = { name:'', tagline:'', description:'', problem:'', solution:'', website:'', status:'active', founded:'', teamSize:1, metrics:{ users:'', revenue:'', growth:'' }, techStack:[], keyFeatures:[], featured:false, published:true, order:0 };
const inp = `w-full px-3.5 py-2.5 rounded-xl text-sm bg-white/5 border border-purple-500/20 text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all`;

function TagInput({ value=[], onChange, placeholder }) {
  const [v,setV]=useState('');
  const add=()=>{if(v.trim()&&!value.includes(v.trim())){onChange([...value,v.trim()]);setV('');}};
  return (
    <div className="rounded-xl border border-purple-500/20 bg-white/5 p-2 min-h-[40px]">
      <div className="flex flex-wrap gap-1 mb-1">{value.map(t=><span key={t} className="flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-300 border border-purple-500/20">{t}<button type="button" onClick={()=>onChange(value.filter(x=>x!==t))}><X className="w-2.5 h-2.5"/></button></span>)}</div>
      <input value={v} onChange={e=>setV(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'||e.key===','){e.preventDefault();add();}}} onBlur={add} placeholder={placeholder||'Add… (Enter)'} className="w-full bg-transparent text-xs text-white placeholder-white/25 outline-none"/>
    </div>
  );
}

function Modal({ initial, onSave, onClose, saving }) {
  const [form, setForm] = useState({ ...BLANK, ...initial, metrics: { ...BLANK.metrics, ...initial?.metrics } });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  const setM = (k, v) => setForm(f => ({ ...f, metrics: { ...f.metrics, [k]: v } }));
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto" style={{ background:'rgba(0,0,0,0.75)', backdropFilter:'blur(4px)' }}>
      <motion.div initial={{ scale:.94, opacity:0, y:16 }} animate={{ scale:1, opacity:1, y:0 }} exit={{ scale:.94, opacity:0 }}
        className="bg-[#0d0d28] border border-purple-500/25 rounded-2xl w-full max-w-2xl my-6 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-purple-500/15">
          <h3 className="text-base font-bold text-white flex items-center gap-2"><Building2 className="w-4 h-4 text-purple-400"/>{initial?._id?'Edit':'Add'} Startup</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-purple-400/60 hover:text-purple-300 transition-colors"><X className="w-4 h-4"/></button>
        </div>
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-[10px] font-semibold uppercase tracking-widest text-purple-300/60 mb-1">Name *</label><input value={form.name} onChange={e=>set('name',e.target.value)} placeholder="Startup Name" className={inp}/></div>
            <div><label className="block text-[10px] font-semibold uppercase tracking-widest text-purple-300/60 mb-1">Status</label>
              <select value={form.status} onChange={e=>set('status',e.target.value)} className={inp}>
                {['active','acquired','closed','stealth'].map(s=><option key={s} value={s} className="bg-gray-900 capitalize">{s}</option>)}
              </select>
            </div>
          </div>
          <div><label className="block text-[10px] font-semibold uppercase tracking-widest text-purple-300/60 mb-1">Tagline</label><input value={form.tagline} onChange={e=>set('tagline',e.target.value)} placeholder="One-line pitch" className={inp}/></div>
          <div><label className="block text-[10px] font-semibold uppercase tracking-widest text-purple-300/60 mb-1">Description</label><textarea value={form.description} onChange={e=>set('description',e.target.value)} rows={3} className={`${inp} resize-y`}/></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-[10px] font-semibold uppercase tracking-widest text-purple-300/60 mb-1">Problem Solved</label><textarea value={form.problem} onChange={e=>set('problem',e.target.value)} rows={2} className={`${inp} resize-y`}/></div>
            <div><label className="block text-[10px] font-semibold uppercase tracking-widest text-purple-300/60 mb-1">Solution</label><textarea value={form.solution} onChange={e=>set('solution',e.target.value)} rows={2} className={`${inp} resize-y`}/></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="block text-[10px] font-semibold uppercase tracking-widest text-purple-300/60 mb-1">Founded</label><input type="number" value={form.founded} onChange={e=>set('founded',e.target.value)} placeholder="2022" className={inp}/></div>
            <div><label className="block text-[10px] font-semibold uppercase tracking-widest text-purple-300/60 mb-1">Team Size</label><input type="number" value={form.teamSize} onChange={e=>set('teamSize',e.target.value)} className={inp}/></div>
            <div><label className="block text-[10px] font-semibold uppercase tracking-widest text-purple-300/60 mb-1">Website</label><input value={form.website} onChange={e=>set('website',e.target.value)} placeholder="https://..." className={inp}/></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[['users','Users'],['revenue','Revenue'],['growth','Growth']].map(([k,l])=>(
              <div key={k}><label className="block text-[10px] font-semibold uppercase tracking-widest text-purple-300/60 mb-1">{l}</label><input value={form.metrics[k]} onChange={e=>setM(k,e.target.value)} placeholder="e.g. 10k+" className={inp}/></div>
            ))}
          </div>
          <div><label className="block text-[10px] font-semibold uppercase tracking-widest text-purple-300/60 mb-1.5">Tech Stack</label><TagInput value={form.techStack} onChange={v=>set('techStack',v)} placeholder="React, AWS… (Enter)"/></div>
          <div><label className="block text-[10px] font-semibold uppercase tracking-widest text-purple-300/60 mb-1.5">Key Features</label><TagInput value={form.keyFeatures} onChange={v=>set('keyFeatures',v)} placeholder="Feature (Enter)"/></div>
          <div className="flex gap-6">
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.featured} onChange={e=>set('featured',e.target.checked)} className="w-4 h-4 rounded accent-purple-500"/><span className="text-sm text-purple-200/70">Featured</span></label>
            <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.published} onChange={e=>set('published',e.target.checked)} className="w-4 h-4 rounded accent-purple-500"/><span className="text-sm text-purple-200/70">Published</span></label>
          </div>
        </div>
        <div className="flex items-center justify-between px-5 py-4 border-t border-purple-500/15">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium border border-purple-500/20 text-purple-300/70 hover:bg-purple-500/10 transition-colors">Cancel</button>
          <button onClick={()=>onSave(form)} disabled={saving||!form.name.trim()} className="flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{background:'linear-gradient(135deg,#7C3AED,#6d28d9)'}}>
            {saving?<><Loader2 className="w-4 h-4 animate-spin"/>Saving…</>:<><Check className="w-4 h-4"/>Save</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminStartupPage() {
  const [items,setItems]=useState([]);const [loading,setLoading]=useState(true);const [modal,setModal]=useState(null);const [saving,setSaving]=useState(false);const [deleting,setDeleting]=useState(null);
  const fetch_=useCallback(async()=>{setLoading(true);try{const r=await API.get('/startup');setItems(r.data.data||[]);}catch(e){toast.error(getErrorMessage(e));}finally{setLoading(false);}}, []);
  useEffect(()=>{fetch_();},[fetch_]);
  const handleSave=async(form)=>{setSaving(true);try{if(form._id){const r=await API.put(`/startup/${form._id}`,form);setItems(i=>i.map(x=>x._id===form._id?r.data.data:x));toast.success('Updated ✓');}else{const r=await API.post('/startup',form);setItems(i=>[r.data.data,...i]);toast.success('Added ✓');}setModal(null);}catch(e){toast.error(getErrorMessage(e));}finally{setSaving(false);}};
  const handleDelete=async(id)=>{setDeleting(id);try{await API.delete(`/startup/${id}`);setItems(i=>i.filter(x=>x._id!==id));toast.success('Deleted.');}catch(e){toast.error(getErrorMessage(e));}finally{setDeleting(null);}};
  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-12">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white font-heading">Startup</h1><p className="text-sm text-purple-300/60 mt-0.5">{items.length} record{items.length!==1?'s':''}</p></div>
        <div className="flex gap-2">
          <button onClick={fetch_} className="p-2.5 rounded-xl border border-purple-500/20 text-purple-400/60 hover:text-purple-300 hover:bg-purple-500/10 transition-all"><RefreshCw className={`w-4 h-4 ${loading?'animate-spin':''}`}/></button>
          <button onClick={()=>setModal(BLANK)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white" style={{background:'linear-gradient(135deg,#7C3AED,#6d28d9)'}}><Plus className="w-4 h-4"/>Add Startup</button>
        </div>
      </div>
      {loading?<div className="flex items-center justify-center h-48"><Loader2 className="w-8 h-8 text-purple-400 animate-spin"/></div>
        :items.length===0?<div className="flex flex-col items-center justify-center h-48 rounded-2xl border border-dashed border-purple-500/20"><Building2 className="w-10 h-10 text-purple-500/30 mb-3"/><p className="text-sm text-purple-300/50">No startups yet</p><button onClick={()=>setModal(BLANK)} className="mt-3 text-xs text-purple-400 hover:text-purple-300 underline">Add your first startup →</button></div>
        :<div className="space-y-3">{items.map((item,i)=>(
          <motion.div key={item._id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.04}}
            className="flex gap-4 p-5 rounded-2xl border border-purple-500/15 bg-white/3 hover:border-purple-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-500/15 border border-purple-500/20 flex items-center justify-center shrink-0"><Building2 className="w-6 h-6 text-purple-400"/></div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-0.5">
                <h3 className="text-sm font-bold text-white">{item.name}</h3>
                {item.featured&&<span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-400/15 text-amber-400 border border-amber-400/20">Featured</span>}
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full capitalize border ${item.status==='active'?'bg-green-400/10 text-green-400 border-green-400/20':'bg-gray-400/10 text-gray-400 border-gray-400/20'}`}>{item.status}</span>
              </div>
              <p className="text-sm text-purple-300/60 truncate">{item.tagline}</p>
              <p className="text-xs text-purple-300/40 mt-0.5">{item.founded&&`Founded ${item.founded}`}{item.teamSize>1&&` · ${item.teamSize} people`}</p>
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {item.website&&<a href={item.website} target="_blank" rel="noreferrer" className="p-2 rounded-lg hover:bg-white/5 text-purple-400/40 hover:text-purple-300 transition-all"><ExternalLink className="w-4 h-4"/></a>}
              <button onClick={()=>setModal(item)} className="p-2 rounded-lg hover:bg-purple-500/15 text-purple-400/60 hover:text-purple-300 transition-all"><Pencil className="w-4 h-4"/></button>
              <button onClick={()=>handleDelete(item._id)} disabled={deleting===item._id} className="p-2 rounded-lg hover:bg-red-500/15 text-purple-400/40 hover:text-red-400 transition-all disabled:opacity-50">{deleting===item._id?<Loader2 className="w-4 h-4 animate-spin"/>:<Trash2 className="w-4 h-4"/>}</button>
            </div>
          </motion.div>
        ))}</div>}
      <AnimatePresence>{modal&&<Modal initial={modal} onSave={handleSave} onClose={()=>setModal(null)} saving={saving}/>}</AnimatePresence>
    </div>
  );
}
