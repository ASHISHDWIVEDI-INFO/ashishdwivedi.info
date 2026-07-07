/**
 * Next.js Metadata File convention: a default-exported function here is
 * automatically built into a `/sitemap.xml` route — no manual route file
 * or public/sitemap.xml needed. See:
 * https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap
 *
 * This is what the CI "Check sitemap (SSG health)" smoke test hits after
 * every deploy; without this file the build never emits /sitemap.xml and
 * the smoke test 404s.
 */

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://ashishdwivedi.info').replace(/\/$/, '');
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Static, always-present routes.
const staticRoutes = [
  { path: '', changeFrequency: 'weekly', priority: 1.0 },
  { path: '/blog', changeFrequency: 'daily', priority: 0.8 },
];

async function getBlogSlugs() {
  try {
    const res = await fetch(`${API_URL}/blog`, {
      // Sitemap is generated at build time; don't let a slow/unreachable
      // API stall or fail the whole build.
      next: { revalidate: 3600 },
    });

    if (!res.ok) return [];

    const data = await res.json();
    const posts = Array.isArray(data) ? data : data?.data || data?.posts || [];

    return posts
      .filter((post) => post?.slug && post?.published !== false)
      .map((post) => ({
        slug: post.slug,
        updatedAt: post.updatedAt || post.createdAt,
      }));
  } catch (error) {
    // Never fail the build/sitemap over a flaky backend call.
    console.error('sitemap: failed to fetch blog posts', error);
    return [];
  }
}

export default async function sitemap() {
  const now = new Date();

  const entries = staticRoutes.map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  const blogSlugs = await getBlogSlugs();

  const blogEntries = blogSlugs.map(({ slug, updatedAt }) => ({
    url: `${SITE_URL}/blog/${slug}`,
    lastModified: updatedAt ? new Date(updatedAt) : now,
    changeFrequency: 'monthly',
    priority: 0.6,
  }));

  return [...entries, ...blogEntries];
}