import { Plus_Jakarta_Sans, DM_Sans, Fira_Code } from 'next/font/google';
import { Providers } from './providers';
import './globals.css';

// ========================
// Font Configuration
// ========================
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-plus-jakarta',
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500', '600'],
  display: 'swap',
});

const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-fira-code',
  weight: ['400', '500'],
  display: 'swap',
});

// ========================
// Site Metadata
// ========================
export const metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  ),
  title: {
    default: 'Ashish Dwivedi | Founder & Software Engineer',
    template: '%s | Ashish Dwivedi',
  },
  description:
    'Ashish Dwivedi — Founder, Software Engineer & Entrepreneur. Building scalable digital products and startups. Expert in React, Node.js, AWS, and Cloud Infrastructure.',
  keywords: [
    'Ashish Dwivedi',
    'Software Engineer',
    'Founder',
    'Entrepreneur',
    'Full Stack Developer',
    'React',
    'Node.js',
    'AWS',
    'Startup',
    'Portfolio',
    'New Delhi',
  ],
  authors: [{ name: 'Ashish Dwivedi', url: 'https://ashishdwivedi.info' }],
  creator: 'Ashish Dwivedi',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: process.env.NEXT_PUBLIC_SITE_URL,
    title: 'Ashish Dwivedi | Founder & Software Engineer',
    description:
      'Building scalable digital products and startups. Expert in Full Stack Development & Cloud Infrastructure.',
    siteName: 'Ashish Dwivedi Portfolio',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Ashish Dwivedi Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ashish Dwivedi | Founder & Software Engineer',
    description: 'Building scalable digital products and startups.',
    creator: '@ashishdwivedi',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  manifest: '/site.webmanifest',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
  },
};

// ========================
// Root Layout
// ========================
export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${plusJakarta.variable} ${dmSans.variable} ${firaCode.variable}`}
    >
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#7C3AED" />
      </head>
      <body className="font-sans antialiased bg-[var(--bg-primary)] text-[var(--text-primary)] transition-colors duration-300">

        {/* Loading Screen */}
        <div id="loading-screen" aria-hidden="true">
          <div className="loading-spinner" />
        </div>

        {/* Scroll Progress Bar */}
        <div id="scroll-progress" aria-hidden="true" />

        {/* Theme Provider wraps everything */}
        <Providers>
          <div className="page-transition">
            {children}
          </div>
        </Providers>

        {/* Loading Screen Script — runs before React hydrates */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.addEventListener('load', function() {
                const loader = document.getElementById('loading-screen');
                if (loader) {
                  loader.classList.add('hidden');
                  setTimeout(() => loader.remove(), 500);
                }
              });

              // Scroll progress bar
              window.addEventListener('scroll', function() {
                const el = document.getElementById('scroll-progress');
                if (!el) return;
                const scrollTop = document.documentElement.scrollTop;
                const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
                const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
                el.style.width = progress + '%';
              });
            `,
          }}
        />
      </body>
    </html>
  );
}
