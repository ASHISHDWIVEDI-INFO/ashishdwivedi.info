import Link from 'next/link';
import { Github, Linkedin, Twitter, Mail } from 'lucide-react';

const socials = [
  { icon: Github, href: 'https://github.com/yourusername', label: 'GitHub' },
  { icon: Linkedin, href: 'https://linkedin.com/in/yourusername', label: 'LinkedIn' },
  { icon: Twitter, href: 'https://twitter.com/yourusername', label: 'Twitter' },
  { icon: Mail, href: 'mailto:you@yourdomain.com', label: 'Email' },
];

export default function Footer() {
  return (
    <footer className="border-t border-surface-border py-12 mt-24">
      <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <p className="font-display text-lg text-accent">Your Name</p>
          <p className="text-ink-400 text-sm mt-1">Developer · Researcher · Entrepreneur</p>
        </div>

        <div className="flex items-center gap-6">
          {socials.map(({ icon: Icon, href, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="text-ink-400 hover:text-accent transition-colors"
            >
              <Icon size={18} />
            </a>
          ))}
        </div>

        <p className="text-ink-500 text-xs">
          © {new Date().getFullYear()} Your Name · Built with Next.js + Django
        </p>
      </div>
    </footer>
  );
}
