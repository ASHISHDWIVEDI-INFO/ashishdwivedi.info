import type { Metadata } from 'next';
import { Download } from 'lucide-react';

export const metadata: Metadata = {
  title: 'About',
  description: 'Developer, researcher, and entrepreneur based in New Delhi, India.',
};

const timeline = [
  { year: '2025', title: 'Senior Full-Stack Engineer', org: 'Your Current Company', description: 'Leading development of AI-powered SaaS platform serving 50K+ users.' },
  { year: '2024', title: 'Research Paper Published', org: 'NeurIPS 2024', description: 'Citation network analysis using LLMs — 42 citations in first 6 months.' },
  { year: '2023', title: 'Founded AI Startup', org: 'StealthCo', description: 'Built and launched B2B NLP product, acquired 15 enterprise clients before exit.' },
  { year: '2022', title: 'MSc Computer Science', org: 'IIT Delhi', description: 'Specialisation in Machine Learning and Distributed Systems. GPA 9.2/10.' },
  { year: '2020', title: 'Software Engineer', org: 'Startup Inc', description: 'First professional role — shipped Django + React applications used by 10K+ users.' },
  { year: '2018', title: 'BSc Computer Science', org: 'Delhi University', description: 'Graduated with distinction. Built my first open-source project with 500+ stars.' },
];

const values = [
  { title: 'Ship early, iterate fast', body: 'Perfect is the enemy of shipped. I bias heavily toward getting working software in front of real users as quickly as possible.' },
  { title: 'Research-informed engineering', body: 'I read papers so I know when an off-the-shelf model beats a hand-rolled solution — and vice versa.' },
  { title: 'Open by default', body: 'Most of my tools, libraries, and learning notes live on GitHub. The best way to grow is to build in public.' },
];

export default function AboutPage() {
  return (
    <div className="pt-28 pb-24 max-w-4xl mx-auto px-6">
      <div className="mb-16">
        <p className="text-accent font-mono text-sm tracking-widest mb-2">ABOUT</p>
        <h1 className="font-display text-5xl md:text-6xl text-ink-50 font-light mb-6">Your Name</h1>

        <div className="prose prose-invert max-w-none">
          <p className="text-ink-300 text-lg leading-relaxed mb-4">
            I'm a full-stack developer, ML researcher, and occasional entrepreneur based in New Delhi, India.
            I've spent the past 7 years building web applications, publishing AI research, and launching products.
          </p>
          <p className="text-ink-400 leading-relaxed mb-4">
            My technical stack centres around <span className="text-ink-200">Next.js, Django, and Python ML libraries</span>,
            but I'm most interested in the intersection of AI capabilities and business value — finding the spots where
            a well-tuned model or a clever system design turns into real leverage for real people.
          </p>
          <p className="text-ink-400 leading-relaxed">
            When I'm not coding, I'm writing on this blog, reviewing papers for NeurIPS/ACL, or hiking in the Himalayas.
          </p>
        </div>

        <div className="mt-8 flex items-center gap-4">
          <a
            href="/resume.pdf"
            download
            className="flex items-center gap-2 px-6 py-2.5 bg-accent text-surface text-sm font-medium rounded hover:bg-accent-light transition-colors"
          >
            <Download size={14} /> Download Resume
          </a>
        </div>
      </div>

      <section className="mb-16">
        <h2 className="font-display text-3xl text-ink-100 font-light mb-8">Timeline</h2>
        <div className="relative">
          <div className="absolute left-0 top-0 bottom-0 w-px bg-surface-border" />
          <div className="space-y-8 pl-8">
            {timeline.map(({ year, title, org, description }) => (
              <div key={`${year}-${title}`} className="relative">
                <div className="absolute -left-8 top-1.5 w-2 h-2 rounded-full bg-accent/60 -translate-x-[calc(50%-0.5px)]" />
                <span className="text-xs font-mono text-accent">{year}</span>
                <h3 className="font-display text-xl text-ink-100 mt-0.5">{title}</h3>
                <p className="text-ink-400 text-sm mb-1">{org}</p>
                <p className="text-ink-500 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <h2 className="font-display text-3xl text-ink-100 font-light mb-8">Values</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {values.map(({ title, body }) => (
            <div key={title} className="bg-surface-card border border-surface-border rounded-lg p-5">
              <h3 className="text-accent text-sm font-medium mb-2">{title}</h3>
              <p className="text-ink-400 text-sm leading-relaxed">{body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
