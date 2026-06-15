'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Loader2, Settings, RefreshCw } from 'lucide-react';
import API from '@/lib/api';
import { getErrorMessage } from '@/lib/utils';
import toast from 'react-hot-toast';

const inp = `w-full px-3.5 py-2.5 rounded-xl text-sm bg-white/5 border border-purple-500/20 text-white placeholder-white/25 focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all`;

function Section({ title, children }) {
  return (
    <div className="rounded-2xl border border-purple-500/15 bg-white/3 p-6 space-y-4">
      <h3 className="text-sm font-bold text-white flex items-center gap-2">
        <Settings className="w-4 h-4 text-purple-400" />{title}
      </h3>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label className="block text-xs font-semibold uppercase tracking-widest text-purple-300/60 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

export default function AdminSettingsPage() {
  const [form,    setForm]    = useState({ siteTitle:'', siteTagline:'', metaDescription:'', contactEmail:'', phone:'', address:'', footerText:'', maintenanceMode:false, analyticsId:'' });
  const [loading, setLoading] = useState(true);
  const [saving,  setSaving]  = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await API.get('/settings');
        setForm({ ...form, ...r.data.data });
      } catch (e) { toast.error(getErrorMessage(e)); }
      finally { setLoading(false); }
    })();
  }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = async () => {
    setSaving(true);
    try {
      await API.put('/settings', form);
      toast.success('Settings saved ✓');
    } catch (e) { toast.error(getErrorMessage(e)); }
    finally { setSaving(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 text-purple-400 animate-spin" /></div>;

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-heading">Settings</h1>
          <p className="text-sm text-purple-300/60 mt-0.5">Global site configuration</p>
        </div>
      </div>

      {/* Site */}
      <Section title="Site Identity">
        <Field label="Site Title"><input value={form.siteTitle} onChange={e=>set('siteTitle',e.target.value)} placeholder="Ashish Dwivedi" className={inp}/></Field>
        <Field label="Tagline"><input value={form.siteTagline} onChange={e=>set('siteTagline',e.target.value)} placeholder="Founder & Software Engineer" className={inp}/></Field>
        <Field label="Meta Description"><textarea value={form.metaDescription} onChange={e=>set('metaDescription',e.target.value)} rows={2} placeholder="160 chars for search engines…" className={`${inp} resize-y`}/></Field>
      </Section>

      {/* Contact */}
      <Section title="Contact Information">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Contact Email"><input value={form.contactEmail} onChange={e=>set('contactEmail',e.target.value)} placeholder="ashish@ashishdwivedi.info" className={inp}/></Field>
          <Field label="Phone"><input value={form.phone} onChange={e=>set('phone',e.target.value)} placeholder="+91 98765 43210" className={inp}/></Field>
        </div>
        <Field label="Address"><input value={form.address} onChange={e=>set('address',e.target.value)} placeholder="New Delhi, India" className={inp}/></Field>
      </Section>

      {/* Footer */}
      <Section title="Footer">
        <Field label="Footer Text"><textarea value={form.footerText} onChange={e=>set('footerText',e.target.value)} rows={2} placeholder="© 2025 Ashish Dwivedi. All rights reserved." className={`${inp} resize-y`}/></Field>
        <Field label="Google Analytics ID"><input value={form.analyticsId} onChange={e=>set('analyticsId',e.target.value)} placeholder="G-XXXXXXXXXX" className={inp}/></Field>
      </Section>

      {/* Maintenance */}
      <Section title="Maintenance">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-purple-200/80">Maintenance Mode</p>
            <p className="text-xs text-purple-300/40 mt-0.5">When enabled, visitors see a maintenance message</p>
          </div>
          <div className={`relative w-12 h-6 rounded-full transition-colors duration-200 cursor-pointer ${form.maintenanceMode ? 'bg-red-500' : 'bg-white/10'}`}
            onClick={() => set('maintenanceMode', !form.maintenanceMode)}>
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.maintenanceMode ? 'translate-x-7' : 'translate-x-1'}`} />
          </div>
        </div>
        {form.maintenanceMode && (
          <p className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
            ⚠️ Maintenance mode is ON — your portfolio is not visible to visitors.
          </p>
        )}
      </Section>

      {/* Save */}
      <div className="flex justify-end">
        <motion.button onClick={handleSave} disabled={saving}
          whileHover={{ scale: saving ? 1 : 1.02 }} whileTap={{ scale: saving ? 1 : 0.97 }}
          className="flex items-center gap-2.5 px-8 py-3 rounded-xl text-sm font-bold text-white disabled:opacity-50"
          style={{ background: 'linear-gradient(135deg,#7C3AED,#6d28d9)' }}>
          {saving ? <><Loader2 className="w-4 h-4 animate-spin" />Saving…</> : <><Save className="w-4 h-4" />Save Settings</>}
        </motion.button>
      </div>
    </div>
  );
}
