import type { Metadata } from 'next';
import Link from 'next/link';
import { FileText, ExternalLink, Download } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Research',
  description: 'Published research papers in AI, machine learning, and human-computer interaction.',
};

const papers = [
  {
    slug: 'llm-citation-networks',
    title: 'Citation Network Analysis Using Large Language Models',
    abstract: 'We propose a novel approach to automated citation graph construction leveraging transformer-based models, achieving 94.2% precision on the ACL Anthology benchmark.',
    venue: 'NeurIPS 2024',
    year: 2024,
    tags: ['NLP', 'Citation Analysis', 'Transformers'],
    pdf: '/papers/llm-citation-networks.pdf',
    arxiv: 'https://arxiv.org/abs/2404.XXXXX',
    coAuthors: ['Dr. Smith', 'Prof. Patel'],
    citations: 42,
  },
  {
    slug: 'sentiment-multilingual',
    title: 'Cross-Lingual Sentiment Transfer with Minimal Supervision',
    abstract: 'A semi-supervised framework for adapting sentiment analysis models to low-resource languages using contrastive alignment and back-translation augmentation.',
    venue: 'ACL 2024',
    year: 2024,
    tags: ['Sentiment Analysis', 'Multilingual NLP', 'Few-shot'],
    pdf: '/papers/sentiment-multilingual.pdf',
    arxiv: 'https://arxiv.org/abs/2401.XXXXX',
    coAuthors: ['Dr. Gupta'],
    citations: 28,
  },
  {
    slug: 'knowledge-graph-qa',
    title: 'Grounding LLM Responses via Dynamic Knowledge Graphs',
    abstract: 'We introduce KG-RAG, a retrieval-augmented generation framework that dynamically constructs knowledge subgraphs to reduce hallucination in complex QA tasks.',
    venue: 'EMNLP 2023',
    year: 2023,
    tags: ['Knowledge Graphs', 'RAG', 'LLMs'],
    pdf: '/papers/knowledge-graph-qa.pdf',
    arxiv: 'https://arxiv.org/abs/2311.XXXXX',
    coAuthors: ['Prof. Kumar', 'Dr. Singh'],
    citations: 87,
  },
];

export default function ResearchPage() {
  return (
    <div className="pt-28 pb-24 max-w-4xl mx-auto px-6">
      <div className="mb-12">
        <p className="text-accent font-mono text-sm tracking-widest mb-2">ACADEMIA</p>
        <h1 className="font-display text-5xl md:text-6xl text-ink-50 font-light mb-4">Research Papers</h1>
        <p className="text-ink-400 text-lg">
          Published work in natural language processing, machine learning, and AI systems.
        </p>
      </div>

      <div className="space-y-6">
        {papers.map(({ slug, title, abstract, venue, year, tags, pdf, arxiv, coAuthors, citations }) => (
          <article
            key={slug}
            className="group bg-surface-card border border-surface-border rounded-lg p-6 hover:border-accent/30 transition-all"
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-center gap-3">
                <span className="text-xs text-accent border border-accent/20 px-2 py-0.5 rounded font-mono">{venue}</span>
                <span className="text-xs text-ink-500 font-mono">{year}</span>
                <span className="text-xs text-ink-500">{citations} citations</span>
              </div>
            </div>

            <h2 className="font-display text-xl text-ink-100 mb-3 group-hover:text-accent transition-colors leading-snug">
              <Link href={`/research/${slug}`}>{title}</Link>
            </h2>

            <p className="text-ink-400 text-sm leading-relaxed mb-4">{abstract}</p>

            <div className="flex flex-wrap gap-2 mb-4">
              {tags.map(t => (
                <span key={t} className="text-xs text-ink-500 bg-surface border border-surface-border px-2 py-0.5 rounded">{t}</span>
              ))}
            </div>

            <div className="flex items-center gap-2 text-xs text-ink-500 mb-4">
              <span>Co-authors:</span>
              {coAuthors.map((a, i) => <span key={a} className="text-ink-400">{a}{i < coAuthors.length - 1 ? ',' : ''}</span>)}
            </div>

            <div className="flex items-center gap-4">
              <a href={pdf} download className="flex items-center gap-1.5 text-sm text-ink-400 hover:text-accent transition-colors">
                <Download size={14} /> PDF
              </a>
              <a href={arxiv} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-sm text-ink-400 hover:text-accent transition-colors">
                <ExternalLink size={14} /> arXiv
              </a>
              <Link href={`/research/${slug}`} className="ml-auto flex items-center gap-1.5 text-sm text-ink-500 hover:text-accent transition-colors">
                <FileText size={14} /> Full Summary →
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
