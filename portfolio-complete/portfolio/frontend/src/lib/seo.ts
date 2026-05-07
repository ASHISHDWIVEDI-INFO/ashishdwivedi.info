import type { DefaultSeoProps } from 'next-seo';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://yourportfolio.com';

const SEO: DefaultSeoProps = {
  titleTemplate: '%s | Your Name',
  defaultTitle: 'Your Name — Developer, Researcher & Builder',
  description:
    'Full-stack developer, AI researcher, and entrepreneur. I build production web apps, publish ML research, and write about the business of technology.',
  canonical: siteUrl,
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Your Name Portfolio',
    images: [
      {
        url: `${siteUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: 'Your Name Portfolio',
      },
    ],
  },
  twitter: {
    handle: '@yourtwitterhandle',
    site: '@yourtwitterhandle',
    cardType: 'summary_large_image',
  },
  additionalMetaTags: [
    { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    { name: 'theme-color', content: '#0e0c0a' },
  ],
  additionalLinkTags: [
    { rel: 'icon', href: '/favicon.ico' },
    { rel: 'apple-touch-icon', href: '/apple-touch-icon.png', sizes: '180x180' },
    { rel: 'manifest', href: '/site.webmanifest' },
  ],
};

export default SEO;
