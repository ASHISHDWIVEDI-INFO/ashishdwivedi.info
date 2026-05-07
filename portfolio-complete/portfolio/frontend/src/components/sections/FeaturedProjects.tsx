'use client';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ExternalLink, Github, ArrowRight } from 'lucide-react';
import Image from 'next/image';

const projects = [
  {
    slug: 'ai-research-platform',
    title: 'AI Research Platform',
    description: 'A collaborative platform for publishing and peer-reviewing ML research papers, with automated citation graphs and impact metrics.',
    tags: ['Next.js', 'Python', 'MongoDB', 'OpenAI'],
    category: 'AI / Research',
    image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&q=80',
    github: 'https://github.com/yourusername/ai-research-platform',
    live: 'https://example.com',
  },
  {
    slug: 'saas-analytics',
    title: 'SaaS Analytics Dashboard',
    description: 'Real-time business intelligence dashboard with custom charting, role-based access, and automated PDF reporting.',
    tags: ['React', 'Django', 'PostgreSQL', 'Redis'],
    category: 'Business',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
    github: 'https://github.com/yourusername/saas-analytics',
    live: 'https://example.com',
  },
  {
    slug: 'ecommerce-platform',
    title: 'Multi-Vendor Marketplace',
    description: 'Production e-commerce marketplace with Stripe Connect, inventory management, and ML-powered recommendations.',
    tags: ['Next.js', 'Node.js', 'Stripe', 'AWS'],
    category: 'Web',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&q=80',
    github: 'https://github.com/yourusername/marketplace',
    live: 'https://example.com',
  },
];

export default function FeaturedProjects() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section ref={ref} className="py-24 max-w-7xl mx-auto px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        className="flex items-end justify-between mb-12"
      >
        <div>
          <p className="text-accent font-mono text-sm tracking-widest mb-2">SELECTED WORK</p>
          <h2 className="font-display text-4xl md:text-5xl text-ink-50 font-light">Featured Projects</h2>
        </div>
        <Link href="/projects" className="hidden md:flex items-center gap-2 text-sm text-ink-400 hover:text-accent transition-colors">
          All Projects <ArrowRight size={14} />
        </Link>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        {projects.map(({ slug, title, description, tags, category, image, github, live }, i) => (
          <motion.article
            key={slug}
            initial={{ opacity: 0, y: 30 }}
            animate={inView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: i * 0.15 }}
            className="group bg-surface-card border border-surface-border rounded-lg overflow-hidden hover:border-accent/30 transition-all duration-300"
          >
            <div className="relative h-44 overflow-hidden">
              <Image src={image} alt={title} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-surface/40" />
              <span className="absolute top-3 left-3 text-xs bg-surface/80 text-accent border border-accent/20 px-2 py-0.5 rounded-full font-mono">
                {category}
              </span>
            </div>

            <div className="p-5">
              <h3 className="font-display text-xl text-ink-100 mb-2 group-hover:text-accent transition-colors">
                {title}
              </h3>
              <p className="text-ink-400 text-sm leading-relaxed mb-4">{description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {tags.map(tag => (
                  <span key={tag} className="text-xs text-ink-500 bg-surface border border-surface-border px-2 py-0.5 rounded">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center gap-3">
                <a href={github} target="_blank" rel="noopener noreferrer"
                  className="text-ink-500 hover:text-accent transition-colors">
                  <Github size={16} />
                </a>
                <a href={live} target="_blank" rel="noopener noreferrer"
                  className="text-ink-500 hover:text-accent transition-colors">
                  <ExternalLink size={16} />
                </a>
                <Link href={`/projects/${slug}`} className="ml-auto text-xs text-ink-500 hover:text-accent transition-colors flex items-center gap-1">
                  Case study <ArrowRight size={12} />
                </Link>
              </div>
            </div>
          </motion.article>
        ))}
      </div>
    </section>
  );
}
