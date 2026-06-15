'use client';
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Pencil, Loader2, Award, X, Check, RefreshCw, ExternalLink, Calendar } from 'lucide-react';
import API from '@/lib/api';
import { formatDate, getErrorMessage } from '@/lib/utils';
import toast from 'react-hot-toast';

const BLANK = { name:'', issuer:'', issueDate:'', expiryDate:'', noExpiry:false, credentialId:'', credentialUrl:'', badgeUrl:'', category:'General', published:true, order:0 };
const inp = `w-full px-3.5 py-2.5 rounded-xl text-sm bg-white/5 border border-purple-500/20 text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all`;

function Modal({ initial, onSave, onClose, saving }) {
  const [form, setForm] = useState({
    ...BLANK, ...initial,
    issueDate:  initial?.issueDate  ? initial.issueDate.slice(0,10)  : '',
    expiryDate: initial?.expiryDate ? initial.expiryDate.slice(0,10) : '',
  });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto" style={{ background:'rgba(0,0,0,0.75)', backdropFilter:'blur(4px)' }}>
      <motion.div initial={{ scale:.94, opacity:0, y:16 }} animate={{ scale:1, opacity:1, y:0 }} exit={{ scale:.94, opacity:0 }}
        className="bg-[#0d0d28] border border-purple-500/25 rounded-2xl w-full max-w-lg my-6 shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-purple-500/15">
          <h3 className="text-base font-bold text-white flex items-center gap-2"><Award className="w-4 h-4 text-purple-400"/>{initial?._id ? 'Edit' : 'Add'} Certification</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/5 text-purple-400/60 hover:text-purple-300 transition-colors"><X className="w-4 h-4"/></button>
        </div>
        <div className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
          <div><label className="block text-[10px] font-semibold uppercase tracking-widest text-purple-300/60 mb-1">Certification Name *</label><input value={form.name} onChange={e=>set('name',e.target.value)} placeholder="AWS Solutions Architect" className={inp}/></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-[10px] font-semibold uppercase tracking-widest text-purple-300/60 mb-1">Issuer *</label><input value={form.issuer} onChange={e=>set('issuer',e.target.value)} placeholder="Amazon Web Services" className={inp}/></div>
            <div><label className="block text-[10px] font-semibold uppercase tracking-widest text-purple-300/60 mb-1">Category</label><input value={form.category} onChange={e=>set('category',e.target.value)} placeholder="Cloud" className={inp}/></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-[10px] font-semibold uppercase tracking-widest text-purple-300/60 mb-1">Issue Date</label><input type="date" value={form.issueDate} onChange={e=>set('issueDate',e.target.value)} className={`${inp} [color-scheme:dark]`}/></div>
            <div><label className="block text-[10px] font-semibold uppercase tracking-widest text-purple-300/60 mb-1">Expiry Date</label><input type="date" value={form.expiryDate} onChange={e=>set('expiryDate',e.target.value)} disabled={form.noExpiry} className={`${inp} [color-scheme:dark] disabled:opacity-40`}/></div>
          </div>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.noExpiry} onChange={e=>set('noExpiry',e.target.checked)} className="w-4 h-4 rounded accent-purple-500"/><span className="text-sm text-purple-200/70">No expiry date</span></label>
          <div><label className="block text-[10px] font-semibold uppercase tracking-widest text-purple-300/60 mb-1">Credential ID</label><input value={form.credentialId} onChange={e=>set('credentialId',e.target.value)} placeholder="ABC123" className={inp}/></div>
          <div><label className="block text-[10px] font-semibold uppercase tracking-widest text-purple-300/60 mb-1">Credential URL</label><input value={form.credentialUrl} onChange={e=>set('credentialUrl',e.target.value)} placeholder="https://..." className={inp}/></div>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.published} onChange={e=>set('published',e.target.checked)} className="w-4 h-4 rounded accent-purple-500"/><span className="text-sm text-purple-200/70">Published</span></label>
        </div>
        <div className="flex items-center justify-between px-5 py-4 border-t border-purple-500/15">
          <button onClick={onClose} className="px-4 py-2 rounded-xl text-sm font-medium border border-purple-500/20 text-purple-300/70 hover:bg-purple-500/10 transition-colors">Cancel</button>
          <button onClick={()=>onSave(form)} disabled={saving||!form.name.trim()||!form.issuer.trim()} className="flex items-center gap-2 px-6 py-2 rounded-xl text-sm font-bold text-white disabled:opacity-50" style={{background:'linear-gradient(135deg,#7C3AED,#6d28d9)'}}>
            {saving?<><Loader2 className="w-4 h-4 animate-spin"/>Saving…</>:<><Check className="w-4 h-4"/>Save</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function AdminCertificationsPage() {
  const [items,setItems]=useState([]);const [loading,setLoading]=useState(true);const [modal,setModal]=useState(null);const [saving,setSaving]=useState(false);const [deleting,setDeleting]=useState(null);
  const fetch_=useCallback(async()=>{setLoading(true);try{const r=await API.get('/certifications');setItems(r.data.data||[]);}catch(e){toast.error(getErrorMessage(e));}finally{setLoading(false);}}, []);
  useEffect(()=>{fetch_();},[fetch_]);
  const handleSave=async(form)=>{setSaving(true);try{if(form._id){const r=await API.put(`/certifications/${form._id}`,form);setItems(i=>i.map(x=>x._id===form._id?r.data.data:x));toast.success('Updated ✓');}else{const r=await API.post('/certifications',form);setItems(i=>[r.data.data,...i]);toast.success('Added ✓');}setModal(null);}catch(e){toast.error(getErrorMessage(e));}finally{setSaving(false);}};
  const handleDelete=async(id)=>{setDeleting(id);try{await API.delete(`/certifications/${id}`);setItems(i=>i.filter(x=>x._id!==id));toast.success('Deleted.');}catch(e){toast.error(getErrorMessage(e));}finally{setDeleting(null);}};
  return (
    <div className="max-w-4xl mx-auto space-y-5 pb-12">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-white font-heading">Certifications</h1><p className="text-sm text-purple-300/60 mt-0.5">{items.length} certification{items.length!==1?'s':''}</p></div>
        <div className="flex gap-2">
          <button onClick={fetch_} className="p-2.5 rounded-xl border border-purple-500/20 text-purple-400/60 hover:text-purple-300 hover:bg-purple-500/10 transition-all"><RefreshCw className={`w-4 h-4 ${loading?'animate-spin':''}`}/></button>
          <button onClick={()=>setModal(BLANK)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white" style={{background:'linear-gradient(135deg,#7C3AED,#6d28d9)'}}><Plus className="w-4 h-4"/>Add Certification</button>
        </div>
      </div>
      {loading?<div className="flex items-center justify-center h-48"><Loader2 className="w-8 h-8 text-purple-400 animate-spin"/></div>
        :items.length===0?<div className="flex flex-col items-center justify-center h-48 rounded-2xl border border-dashed border-purple-500/20"><Award className="w-10 h-10 text-purple-500/30 mb-3"/><p className="text-sm text-purple-300/50">No certifications yet</p><button onClick={()=>setModal(BLANK)} className="mt-3 text-xs text-purple-400 hover:text-purple-300 underline">Add your first →</button></div>
        :<div className="grid grid-cols-1 gap-3">{items.map((item,i)=>(
          <motion.div key={item._id} initial={{opacity:0,y:8}} animate={{opacity:1,y:0}} transition={{delay:i*0.03}}
            className="flex gap-4 p-4 rounded-2xl border border-purple-500/15 bg-white/3 hover:border-purple-500/30 transition-all">
            <div className="w-10 h-10 rounded-xl bg-purple-500/15 flex items-center justify-center shrink-0"><Award className="w-5 h-5 text-purple-400"/></div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-white">{item.name}</h3>
              <p className="text-xs text-purple-300/60">{item.issuer}{item.category ? ` · ${item.category}` : ''}</p>
              {item.issueDate&&<p className="text-xs text-purple-300/40 mt-0.5 flex items-center gap-1"><Calendar className="w-3 h-3"/>{formatDate(item.issueDate,'MMM yyyy')}{item.noExpiry ? ' · No expiry' : item.expiryDate ? ` → ${formatDate(item.expiryDate,'MMM yyyy')}` : ''}</p>}
            </div>
            <div className="flex items-center gap-1.5 shrink-0">
              {item.credentialUrl&&<a href={item.credentialUrl} target="_blank" rel="noreferrer" className="p-2 rounded-lg hover:bg-white/5 text-purple-400/40 hover:text-purple-300 transition-all"><ExternalLink className="w-4 h-4"/></a>}
              <button onClick={()=>setModal(item)} className="p-2 rounded-lg hover:bg-purple-500/15 text-purple-400/60 hover:text-purple-300 transition-all"><Pencil className="w-4 h-4"/></button>
              <button onClick={()=>handleDelete(item._id)} disabled={deleting===item._id} className="p-2 rounded-lg hover:bg-red-500/15 text-purple-400/40 hover:text-red-400 transition-all disabled:opacity-50">{deleting===item._id?<Loader2 className="w-4 h-4 animate-spin"/>:<Trash2 className="w-4 h-4"/>}</button>
            </div>
          </motion.div>
        ))}</div>}
      <AnimatePresence>{modal&&<Modal initial={modal} onSave={handleSave} onClose={()=>setModal(null)} saving={saving}/>}</AnimatePresence>
    </div>
  );
}
