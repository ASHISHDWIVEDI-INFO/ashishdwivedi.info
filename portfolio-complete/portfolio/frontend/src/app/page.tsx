import Hero from '@/components/sections/Hero';
import StatsSection from '@/components/sections/StatsSection';
import FeaturedProjects from '@/components/sections/FeaturedProjects';
import SkillsSection from '@/components/sections/SkillsSection';
import RecentPosts from '@/components/sections/RecentPosts';
import CTASection from '@/components/sections/CTASection';

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
