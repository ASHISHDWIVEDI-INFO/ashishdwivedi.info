import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Download, ExternalLink, Users, BookOpen, Calendar } from 'lucide-react';

const PAPERS: Record<string, {
  slug: string; title: string; abstract: string; venue: string; year: number;
  tags: string[]; co_authors: string[]; pdf_url: string; arxiv_url: string;
  citations: number; full_summary: string;
}> = {
  'llm-citation-networks': {
    slug: 'llm-citation-networks',
    title: 'Citation Network Analysis Using Large Language Models',
    abstract: 'We propose a novel approach to automated citation graph construction leveraging transformer-based models, achieving 94.2% precision on the ACL Anthology benchmark.',
    venue: 'NeurIPS 2024',
    year: 2024,
    tags: ['NLP', 'Citation Analysis', 'Transformers', 'Knowledge Graphs'],
    co_authors: ['Dr. Anjali Smith (IIT Delhi)', 'Prof. Rahul Patel (IISC)'],
    pdf_url: '/papers/llm-citation-networks.pdf',
    arxiv_url: 'https://arxiv.org/abs/2404.00001',
    citations: 42,
    full_summary: `## Problem\n\nScientific literature grows at over 4 million papers per year. Existing citation graph tools rely on rigid pattern-matching that fails on informal or cross-language citations, leaving roughly 23% of references unresolved.\n\n## Approach\n\nWe fine-tuned a SciBERT-based encoder to classify and normalise citation spans, then used a bi-encoder retrieval system to link normalised spans to canonical paper IDs in Semantic Scholar's open corpus. A lightweight graph neural network propagates confidence scores through the resulting citation graph.\n\n## Key Results\n\n- **94.2% precision** and **91.7% recall** on ACL Anthology (vs 78% for the previous SOTA)\n- **3× faster** than rule-based baselines at scale (1M+ papers)\n- Open-sourced as a Python library with 800+ GitHub stars\n\n## Broader Impact\n\nMore accurate citation graphs improve literature recommendation, plagiarism detection, and impact metrics for researchers from under-resourced institutions whose work is systematically under-cited due to formatting inconsistencies.`,
  },
  'sentiment-multilingual': {
    slug: 'sentiment-multilingual',
    title: 'Cross-Lingual Sentiment Transfer with Minimal Supervision',
    abstract: 'A semi-supervised framework for adapting sentiment analysis models to low-resource languages using contrastive alignment and back-translation augmentation.',
    venue: 'ACL 2024',
    year: 2024,
    tags: ['Sentiment Analysis', 'Multilingual NLP', 'Few-shot', 'Contrastive Learning'],
    co_authors: ['Dr. Priya Gupta (Microsoft Research)'],
    pdf_url: '/papers/sentiment-multilingual.pdf',
    arxiv_url: 'https://arxiv.org/abs/2401.00002',
    citations: 28,
    full_summary: `## Motivation\n\nSentiment analysis is well-solved for English but severely lacking for the 7,000+ other languages — including Hindi, Tamil, and Bengali, which together represent 600M+ speakers.\n\n## Method\n\nWe combine: (1) contrastive alignment to pull same-sentiment embeddings across languages together, (2) targeted back-translation to generate pseudo-labelled data for target languages, and (3) a consistency regularisation loss that penalises predictions that flip under paraphrase.\n\n## Results\n\nAchieved **F1 improvements of 8–14 points** over translate-then-classify baselines across 12 low-resource languages. Particularly strong gains on code-switched Hinglish data.`,
  },
};

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const paper = PAPERS[params.slug];
  if (!paper) return { title: 'Paper Not Found' };
  return {
    title: paper.title,
    description: paper.abstract,
  };
}

function renderMd(md: string) {
  return md
    .replace(/^## (.+)$/gm, '<h2 class="font-display text-2xl text-ink-100 font-light mt-10 mb-4">$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong class="text-accent font-medium">$1</strong>')
    .replace(/^- (.+)$/gm, '<li class="text-ink-400 ml-5 list-disc mb-1">$1</li>')
    .replace(/\n\n/g, '</p><p class="text-ink-400 leading-relaxed mb-4">')
    .replace(/^(?!<)(.+)/gm, '<p class="text-ink-400 leading-relaxed mb-4">$1</p>');
}

export default function PaperDetailPage({ params }: { params: { slug: string } }) {
  const paper = PAPERS[params.slug];
  if (!paper) notFound();

  return (
    <div className="pt-28 pb-24 max-w-3xl mx-auto px-6">
      <Link href="/research" className="inline-flex items-center gap-2 text-sm text-ink-500 hover:text-accent transition-colors mb-10">
        <ArrowLeft size={14} /> All Papers
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <span className="text-xs text-accent border border-accent/20 px-2 py-0.5 rounded font-mono">{paper.venue}</span>
          <span className="text-xs text-ink-500 flex items-center gap-1"><Calendar size={11} />{paper.year}</span>
          <span className="text-xs text-ink-500 flex items-center gap-1"><BookOpen size={11} />{paper.citations} citations</span>
        </div>
        <h1 className="font-display text-4xl md:text-5xl text-ink-50 font-light mb-6 leading-tight">{paper.title}</h1>

        <div className="flex items-start gap-2 mb-6">
          <Users size={14} className="text-accent mt-0.5 flex-shrink-0" />
          <p className="text-ink-400 text-sm">
            Your Name, {paper.co_authors.join(', ')}
          </p>
        </div>

        <div className="bg-surface-card border border-surface-border rounded-lg p-5 mb-6">
          <p className="text-xs font-mono text-accent mb-2">ABSTRACT</p>
          <p className="text-ink-300 text-sm leading-relaxed">{paper.abstract}</p>
        </div>

        <div className="flex flex-wrap gap-2 mb-8">
          {paper.tags.map(t => (
            <span key={t} className="text-xs text-ink-500 bg-surface border border-surface-border px-2 py-0.5 rounded">{t}</span>
          ))}
        </div>

        <div className="flex gap-3 flex-wrap">
          <a href={paper.pdf_url} download
            className="flex items-center gap-2 px-5 py-2 bg-accent text-surface text-sm font-medium rounded hover:bg-accent-light transition-colors">
            <Download size={14} /> Download PDF
          </a>
          <a href={paper.arxiv_url} target="_blank" rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2 border border-surface-border text-ink-300 hover:border-accent hover:text-accent text-sm rounded transition-colors">
            <ExternalLink size={14} /> arXiv
          </a>
        </div>
      </div>

      <div className="border-t border-surface-border pt-10">
        <p className="text-xs font-mono text-accent mb-6">SUMMARY</p>
        <div dangerouslySetInnerHTML={{ __html: renderMd(paper.full_summary) }} />
      </div>
    </div>
  );
}
