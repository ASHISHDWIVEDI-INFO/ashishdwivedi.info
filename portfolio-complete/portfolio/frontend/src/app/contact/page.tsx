'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion } from 'framer-motion';
import { Mail, Github, Linkedin, Twitter, MapPin } from 'lucide-react';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  subject: z.string().min(4, 'Subject too short'),
  message: z.string().min(20, 'Message must be at least 20 characters'),
});

type FormData = z.infer<typeof schema>;

const socials = [
  { icon: Github, label: 'GitHub', href: 'https://github.com/yourusername', sub: '@yourusername' },
  { icon: Linkedin, label: 'LinkedIn', href: 'https://linkedin.com/in/yourusername', sub: 'Your Name' },
  { icon: Twitter, label: 'Twitter', href: 'https://twitter.com/yourusername', sub: '@yourusername' },
  { icon: Mail, label: 'Email', href: 'mailto:you@yourdomain.com', sub: 'you@yourdomain.com' },
];

export default function ContactPage() {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contact/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) { setSubmitted(true); reset(); }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pt-28 pb-24 max-w-5xl mx-auto px-6">
      <div className="mb-12">
        <p className="text-accent font-mono text-sm tracking-widest mb-2">CONTACT</p>
        <h1 className="font-display text-5xl md:text-6xl text-ink-50 font-light mb-4">Get in Touch</h1>
        <p className="text-ink-400 text-lg max-w-xl">
          Whether it's a project idea, research collaboration, or just to say hello — my inbox is open.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        <div>
          <div className="flex items-center gap-2 text-ink-400 text-sm mb-8">
            <MapPin size={14} className="text-accent" />
            Based in New Delhi, India · Open to remote worldwide
          </div>

          <div className="space-y-4 mb-10">
            {socials.map(({ icon: Icon, label, href, sub }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-4 p-4 bg-surface-card border border-surface-border rounded-lg hover:border-accent/30 transition-all group"
              >
                <div className="w-9 h-9 border border-surface-border rounded-lg flex items-center justify-center group-hover:border-accent/40 transition-colors">
                  <Icon size={16} className="text-ink-400 group-hover:text-accent transition-colors" />
                </div>
                <div>
                  <p className="text-ink-200 text-sm font-medium">{label}</p>
                  <p className="text-ink-500 text-xs">{sub}</p>
                </div>
              </a>
            ))}
          </div>
        </div>

        <div>
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-16"
            >
              <div className="text-5xl mb-4 font-display text-accent">✓</div>
              <h2 className="font-display text-2xl text-ink-100 mb-2">Message sent</h2>
              <p className="text-ink-400">I'll get back to you within 24 hours.</p>
              <button onClick={() => setSubmitted(false)} className="mt-6 text-sm text-ink-500 hover:text-accent transition-colors">
                Send another →
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {[
                { id: 'name', label: 'Name', type: 'text', placeholder: 'Your name' },
                { id: 'email', label: 'Email', type: 'email', placeholder: 'you@example.com' },
                { id: 'subject', label: 'Subject', type: 'text', placeholder: 'What is this about?' },
              ].map(({ id, label, type, placeholder }) => (
                <div key={id}>
                  <label className="block text-xs text-ink-400 mb-1.5 tracking-wide">{label}</label>
                  <input
                    type={type}
                    placeholder={placeholder}
                    {...register(id as keyof FormData)}
                    className="w-full bg-surface-card border border-surface-border rounded px-4 py-2.5 text-ink-100 text-sm placeholder:text-ink-600 focus:outline-none focus:border-accent/50 transition-colors"
                  />
                  {errors[id as keyof FormData] && (
                    <p className="text-red-400 text-xs mt-1">{errors[id as keyof FormData]?.message}</p>
                  )}
                </div>
              ))}

              <div>
                <label className="block text-xs text-ink-400 mb-1.5 tracking-wide">Message</label>
                <textarea
                  rows={5}
                  placeholder="Tell me about your project or question..."
                  {...register('message')}
                  className="w-full bg-surface-card border border-surface-border rounded px-4 py-2.5 text-ink-100 text-sm placeholder:text-ink-600 focus:outline-none focus:border-accent/50 transition-colors resize-none"
                />
                {errors.message && <p className="text-red-400 text-xs mt-1">{errors.message.message}</p>}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-accent text-surface font-medium text-sm rounded hover:bg-accent-light transition-colors disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
