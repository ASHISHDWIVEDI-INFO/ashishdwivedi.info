import type { Metadata } from 'next';
import ProjectsClient from './ProjectsClient';

export const metadata: Metadata = {
  title: 'Projects',
  description: 'A collection of web applications, AI tools, and open-source projects.',
};

export default function ProjectsPage() {
  return <ProjectsClient />;
}
