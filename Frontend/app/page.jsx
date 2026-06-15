import Navbar             from '@/components/ui/Navbar';
import HeroSection        from '@/components/sections/HeroSection';
import AboutSection       from '@/components/sections/AboutSection';
import StartupSection     from '@/components/sections/StartupSection';
import SkillsSection      from '@/components/sections/SkillsSection';
import ExperienceSection  from '@/components/sections/ExperienceSection';
import ProjectsSection    from '@/components/sections/ProjectsSection';
import BlogSection        from '@/components/sections/BlogSection';
import ContactSection     from '@/components/sections/ContactSection';

// ── Placeholder for sections built in future modules ──
function ComingSoon({ id, label }) {
  return (
    <section id={id}
      className="min-h-[40vh] flex items-center justify-center border-t border-purple-500/10">
      <div className="text-center">
        <p className="text-xs uppercase tracking-widest text-purple-400/30 mb-2">{label}</p>
        <p className="text-sm text-purple-300/20">Coming in next module…</p>
      </div>
    </section>
  );
}

// ── Fetch profile server-side ─────────────────
async function getProfile() {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/profile`,
      { next: { revalidate: 60 } }  // ISR: revalidate every 60 seconds
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.data || null;
  } catch {
    return null;
  }
}

// ========================
// Page (Server Component)
// ========================
export default async function HomePage() {
  const profile = await getProfile();
  const resumeUrl = profile
    ? `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/profile/resume/download`
    : null;

  return (
    <main className="relative overflow-x-hidden">
      {/* Sticky Navbar */}
      <Navbar resumeUrl={resumeUrl} />

      {/* ── Section 1: Hero ── */}
      <HeroSection profile={profile} />

      {/* ── Sections 2–12: Built in upcoming modules ── */}
      {/* ── Section 2: About ── */}
      <AboutSection profile={profile} />

      {/* ── Section 3: Startup ── */}
      <StartupSection />

      {/* ── Section 4: Skills ── */}
      <SkillsSection />
      {/* ── Section 5: Experience ── */}
      <ExperienceSection />

      {/* ── Section 6: Projects ── */}
      <ProjectsSection />

      <ComingSoon id="achievements" label="Achievements"   />
      {/* ── Section 7: Blog ── */}
      <BlogSection />

      {/* ── Section 8: Contact ── */}
      <ContactSection profile={profile} />

      {/* Minimal footer placeholder */}
      <footer className="py-6 border-t border-purple-500/10 text-center">
        <p className="text-xs text-purple-300/30">
          © {new Date().getFullYear()} {profile?.name || 'Ashish Dwivedi'}. All rights reserved.
        </p>
      </footer>
    </main>
  );
}
