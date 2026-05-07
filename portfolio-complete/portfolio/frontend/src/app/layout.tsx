import type { Metadata } from 'next';
import { DefaultSeo } from 'next-seo';
import Script from 'next/script';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import '@/styles/globals.css';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourportfolio.com';
const GA_ID = process.env.NEXT_PUBLIC_GA_ID;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Your Name — Developer & Researcher', template: '%s | Your Name' },
  description: 'Full-stack developer, researcher, and entrepreneur building products at the intersection of AI and business.',
  keywords: ['developer', 'portfolio', 'research', 'AI', 'full-stack', 'Next.js', 'Django'],
  authors: [{ name: 'Your Name', url: siteUrl }],
  creator: 'Your Name',
  openGraph: {
    type: 'website', url: siteUrl,
    siteName: 'Your Name Portfolio',
    images: [{ url: `${siteUrl}/og-image.jpg`, width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', creator: '@yourtwitterhandle' },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        {GA_ID && (
          <>
            <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
            <Script id="ga-init" strategy="afterInteractive">{`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${GA_ID}');
            `}</Script>
          </>
        )}
      </head>
      <body>
        <div className="grain" aria-hidden />
        <Navbar />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
