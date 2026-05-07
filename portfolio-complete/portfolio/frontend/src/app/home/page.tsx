import type { Metadata } from 'next';
import Hero from './Hero';
import FeaturedProjects from './FeaturedProjects';
import SkillsSection from './SkillsSection';
import StatsSection from './StatsSection';
import RecentPosts from './RecentPosts';
import CTASection from './CTASection';

export const metadata: Metadata = {
  title: 'Home',
  description: 'Full-stack developer, researcher, and entrepreneur building AI-powered products.',
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <StatsSection />
      <FeaturedProjects />
      <SkillsSection />
      <RecentPosts />
      <CTASection />
    </>
  );
}
