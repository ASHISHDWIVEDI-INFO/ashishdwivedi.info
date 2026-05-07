import type { Project, ResearchPaper, BlogPost, ApiResponse, ContactFormData } from '@/types';

const BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    next: { revalidate: 60 },
    ...options,
  });
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`);
  return res.json();
}

// Projects
export const getProjects = (params?: string) =>
  apiFetch<ApiResponse<Project>>(`/api/projects/${params ? `?${params}` : ''}`);

export const getFeaturedProjects = () =>
  apiFetch<ApiResponse<Project>>('/api/projects/?featured=true');

export const getProject = (slug: string) =>
  apiFetch<Project>(`/api/projects/${slug}/`);

// Research
export const getPapers = () =>
  apiFetch<ApiResponse<ResearchPaper>>('/api/research/');

export const getPaper = (slug: string) =>
  apiFetch<ResearchPaper>(`/api/research/${slug}/`);

// Blog
export const getPosts = (category?: string) =>
  apiFetch<ApiResponse<BlogPost>>(`/api/blog/${category ? `?category=${category}` : ''}`);

export const getPost = (slug: string) =>
  apiFetch<BlogPost>(`/api/blog/${slug}/`);

// Contact
export const sendContact = async (data: ContactFormData): Promise<{ status: string }> => {
  const res = await fetch(`${BASE}/api/contact/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw err;
  }
  return res.json();
};
