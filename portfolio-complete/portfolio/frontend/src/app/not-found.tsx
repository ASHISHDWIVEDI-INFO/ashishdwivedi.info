import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="text-center">
        <p className="font-mono text-accent text-sm tracking-widest mb-4">404</p>
        <h1 className="font-display text-6xl text-ink-100 font-light mb-4">Page not found</h1>
        <p className="text-ink-400 mb-8">The page you're looking for doesn't exist or has been moved.</p>
        <Link href="/" className="px-6 py-2.5 bg-accent text-surface text-sm font-medium rounded hover:bg-accent-light transition-colors">
          Go home
        </Link>
      </div>
    </div>
  );
}
