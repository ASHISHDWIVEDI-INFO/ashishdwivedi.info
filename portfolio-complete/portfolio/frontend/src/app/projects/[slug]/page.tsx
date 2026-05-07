import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ExternalLink, Github, ArrowLeft, Calendar, Tag } from 'lucide-react';

// Static fallback data — replaced by API in production
const PROJECTS: Record<string, {
  slug: string; title: string; description: string; long_description: string;
  category: string; tags: string[]; image_url: string; github_url: string;
  live_url: string; year: number;
}> = {
  'ai-research-platform': {
    slug: 'ai-research-platform',
    title: 'AI Research Platform',
    description: 'A collaborative platform for publishing and peer-reviewing ML research papers.',
    long_description: `## Overview\n\nThe AI Research Platform was built to solve a frustrating problem I experienced firsthand: finding, cross-referencing, and discussing research papers is fragmented across arXiv, Semantic Scholar, and countless institution portals.\n\n## Technical Architecture\n\nThe system uses a Django REST backend that ingests papers from arXiv's API, runs embedding-based similarity searches (using Sentence-BERT), and stores citation graphs in MongoDB. The Next.js frontend renders a filterable, searchable library with real-time co-author and citation visualisations built in D3.\n\n## Key Challenges\n\nThe main technical challenge was building citation graph construction at scale. Each paper can reference hundreds of others, and those references are often formatted inconsistently. I fine-tuned a small BERT classifier to extract and normalise citations with 94% accuracy.\n\n## Results\n\n- 500+ researchers onboarded in first 3 months\n- 42 citations of the underlying methodology paper\n- Sub-200ms search latency across 1M+ papers`,
    category: 'AI/ML',
    tags: ['Next.js', 'Django', 'Python', 'MongoDB', 'OpenAI', 'D3.js', 'AWS S3'],
    image_url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=1200&q=80',
    github_url: 'https://github.com/yourusername/ai-research-platform',
    live_url: 'https://example.com',
    year: 2025,
  },
  'saas-analytics': {
    slug: 'saas-analytics',
    title: 'SaaS Analytics Dashboard',
    description: 'Real-time BI dashboard with custom charting and automated PDF reporting.',
    long_description: `## Overview\n\nBuilt for a SaaS client who outgrew their off-the-shelf analytics tool. The platform ingests events from multiple sources, computes business metrics in near-real-time, and lets non-technical users build their own dashboards.\n\n## Stack\n\nDjango handles ingestion, Redis queues background jobs, and PostgreSQL stores the time-series data. The React frontend uses Recharts for rendering and react-hook-form for dashboard configuration. PDF reports are generated server-side with WeasyPrint.\n\n## Impact\n\n- Reduced reporting time from 4 hours/week to 10 minutes\n- 15 enterprise customers adopted the platform\n- P95 query latency under 300ms`,
    category: 'Business',
    tags: ['React', 'Django', 'PostgreSQL', 'Redis', 'Recharts', 'AWS'],
    image_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80',
    github_url: 'https://github.com/yourusername/saas-analytics',
    live_url: 'https://example.com',
    year: 2025,
  },
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const project = PROJECTS[params.slug];
  if (!project) return { title: 'Project Not Found' };
  return {
    title: project.title,
    description: project.description,
    openGraph: { images: [{ url: project.image_url }] },
  };
}

function renderMarkdown(md: string): string {
  return md
    .replace(/^## (.+)$/gm, '<h2 class="font-display text-2xl text-ink-100 font-light mt-10 mb-4">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-ink-200">$1</strong>')
    .replace(/^- (.+)$/gm, '<li class="text-ink-400 ml-4 list-disc">$1</li>')
    .replace(/\n\n/g, '</p><p class="text-ink-400 leading-relaxed mb-4">')
    .replace(/^(?!<)(.+)/gm, '<p class="text-ink-400 leading-relaxed mb-4">$1</p>');
}

export default function ProjectDetailPage({ params }: { params: { slug: string } }) {
  const project = PROJECTS[params.slug];
  if (!project) notFound();

  return (
    <div className="pt-28 pb-24 max-w-4xl mx-auto px-6">
      <Link href="/projects" className="inline-flex items-center gap-2 text-sm text-ink-500 hover:text-accent transition-colors mb-10">
        <ArrowLeft size={14} /> All Projects
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs text-accent border border-accent/20 px-2 py-0.5 rounded-full font-mono">{project.category}</span>
          <span className="text-xs text-ink-500 flex items-center gap-1"><Calendar size={11} />{project.year}</span>
        </div>
        <h1 className="font-display text-5xl text-ink-50 font-light mb-4">{project.title}</h1>
        <p className="text-ink-300 text-lg leading-relaxed">{project.description}</p>
      </div>

      <div className="relative rounded-lg overflow-hidden mb-10 aspect-video">
        <Image src={project.image_url} alt={project.title} fill className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface/60 to-transparent" />
      </div>

      <div className="flex flex-wrap gap-2 mb-10">
        {project.tags.map(t => (
          <span key={t} className="flex items-center gap-1.5 text-xs text-ink-400 bg-surface-card border border-surface-border px-3 py-1 rounded-full">
            <Tag size={10} />{t}
          </span>
        ))}
      </div>

      <div className="flex gap-4 mb-12">
        {project.github_url && (
          <a href={project.github_url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2 border border-surface-border text-ink-300 hover:border-accent hover:text-accent rounded transition-colors text-sm">
            <Github size={15} /> View Source
          </a>
        )}
        {project.live_url && (
          <a href={project.live_url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2 bg-accent text-surface hover:bg-accent-light rounded transition-colors text-sm font-medium">
            <ExternalLink size={15} /> Live Demo
          </a>
        )}
      </div>

      <div
        className="prose-portfolio border-t border-surface-border pt-10"
        dangerouslySetInnerHTML={{ __html: renderMarkdown(project.long_description) }}
      />
    </div>
  );
}
