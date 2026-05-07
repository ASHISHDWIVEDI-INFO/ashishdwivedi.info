'use client';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { ExternalLink, Github } from 'lucide-react';

const categories = ['All', 'Web', 'AI/ML', 'Research', 'Open Source', 'Business'];

const allProjects = [
  { slug: 'ai-research-platform', title: 'AI Research Platform', description: 'Collaborative ML paper publishing with citation graphs.', tags: ['Next.js', 'Python', 'OpenAI'], category: 'AI/ML', image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&q=80', github: '#', live: '#', year: '2025' },
  { slug: 'saas-analytics', title: 'SaaS Analytics Dashboard', description: 'Real-time BI with charting and automated reports.', tags: ['React', 'Django', 'Redis'], category: 'Business', image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80', github: '#', live: '#', year: '2025' },
  { slug: 'marketplace', title: 'Multi-Vendor Marketplace', description: 'Stripe Connect marketplace with ML recommendations.', tags: ['Next.js', 'Stripe', 'AWS'], category: 'Web', image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80', github: '#', live: '#', year: '2024' },
  { slug: 'nlp-toolkit', title: 'NLP Research Toolkit', description: 'Open-source Python library for NLP preprocessing pipelines.', tags: ['Python', 'HuggingFace', 'PyPI'], category: 'Open Source', image: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=600&q=80', github: '#', live: '#', year: '2024' },
  { slug: 'sentiment-engine', title: 'Sentiment Analysis Engine', description: 'Fine-tuned BERT model for multi-domain sentiment classification.', tags: ['PyTorch', 'BERT', 'FastAPI'], category: 'Research', image: 'https://images.unsplash.com/photo-1518186285589-2f7649de83e0?w=600&q=80', github: '#', live: '#', year: '2024' },
  { slug: 'devtools-cli', title: 'Developer CLI Tools', description: 'Collection of productivity CLI tools for full-stack developers.', tags: ['Node.js', 'CLI', 'npm'], category: 'Open Source', image: 'https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=600&q=80', github: '#', live: '#', year: '2023' },
];

export default function ProjectsClient() {
  const [active, setActive] = useState('All');

  const filtered = active === 'All' ? allProjects : allProjects.filter(p => p.category === active);

  return (
    <div className="pt-28 pb-24 max-w-7xl mx-auto px-6">
      <div className="mb-12">
        <p className="text-accent font-mono text-sm tracking-widest mb-2">PORTFOLIO</p>
        <h1 className="font-display text-5xl md:text-6xl text-ink-50 font-light mb-4">Projects</h1>
        <p className="text-ink-400 text-lg max-w-xl">
          Production applications, research tools, and open-source contributions spanning AI, web, and business.
        </p>
      </div>

      <div className="flex flex-wrap gap-2 mb-10">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActive(cat)}
            className={`text-sm px-4 py-1.5 rounded-full border transition-colors ${
              active === cat
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-surface-border text-ink-400 hover:border-accent/40 hover:text-ink-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence mode="popLayout">
          {filtered.map(({ slug, title, description, tags, image, github, live, year }, i) => (
            <motion.article
              key={slug}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
              className="group bg-surface-card border border-surface-border rounded-lg overflow-hidden hover:border-accent/30 transition-all"
            >
              <div className="relative h-44 overflow-hidden">
                <Image src={image} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-surface/40" />
                <span className="absolute top-3 right-3 text-xs text-ink-500 font-mono">{year}</span>
              </div>
              <div className="p-5">
                <h2 className="font-display text-xl text-ink-100 mb-2 group-hover:text-accent transition-colors">{title}</h2>
                <p className="text-ink-400 text-sm mb-4 leading-relaxed">{description}</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {tags.map(t => <span key={t} className="text-xs text-ink-500 bg-surface border border-surface-border px-2 py-0.5 rounded">{t}</span>)}
                </div>
                <div className="flex items-center gap-3">
                  <a href={github} target="_blank" rel="noopener noreferrer" className="text-ink-500 hover:text-accent transition-colors"><Github size={16} /></a>
                  <a href={live} target="_blank" rel="noopener noreferrer" className="text-ink-500 hover:text-accent transition-colors"><ExternalLink size={16} /></a>
                  <Link href={`/projects/${slug}`} className="ml-auto text-xs text-ink-500 hover:text-accent transition-colors">Case study →</Link>
                </div>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
