export interface Project {
  id: number;
  slug: string;
  title: string;
  description: string;
  long_description: string;
  category: 'web' | 'ai_ml' | 'research' | 'open_source' | 'business';
  tags: string[];
  image: string | null;
  image_url: string;
  github_url: string;
  live_url: string;
  featured: boolean;
  year: number;
  order: number;
  created_at: string;
}

export interface ResearchPaper {
  id: number;
  slug: string;
  title: string;
  abstract: string;
  venue: string;
  year: number;
  tags: string[];
  co_authors: string[];
  pdf_url: string;
  arxiv_url: string;
  citations: number;
  created_at: string;
}

export interface BlogPost {
  id: number;
  slug: string;
  title: string;
  excerpt: string;
  content?: string;
  category: 'business' | 'engineering' | 'research' | 'personal';
  tags: string[];
  published: boolean;
  featured: boolean;
  read_time: number;
  created_at: string;
  updated_at: string;
}

export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ApiResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
