'use client';
import { useInView } from 'react-intersection-observer';
import { motion } from 'framer-motion';

const skillGroups = [
  {
    category: 'Frontend',
    skills: ['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Three.js'],
  },
  {
    category: 'Backend',
    skills: ['Django', 'Python', 'Node.js', 'FastAPI', 'GraphQL', 'REST APIs'],
  },
  {
    category: 'Data & AI',
    skills: ['PyTorch', 'TensorFlow', 'scikit-learn', 'Pandas', 'NLP', 'Computer Vision'],
  },
  {
    category: 'Infrastructure',
    skills: ['AWS', 'Docker', 'MongoDB', 'PostgreSQL', 'Redis', 'Nginx'],
  },
];

export default function SkillsSection() {
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  return (
    <section ref={ref} className="py-24 bg-surface-card border-y border-surface-border">
      <div className="max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          className="mb-12"
        >
          <p className="text-accent font-mono text-sm tracking-widest mb-2">TOOLKIT</p>
          <h2 className="font-display text-4xl md:text-5xl text-ink-50 font-light">Skills & Technologies</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {skillGroups.map(({ category, skills }, gi) => (
            <motion.div
              key={category}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: gi * 0.1 }}
            >
              <h3 className="text-accent text-xs font-mono tracking-widest mb-4">{category.toUpperCase()}</h3>
              <ul className="space-y-2">
                {skills.map((skill, i) => (
                  <motion.li
                    key={skill}
                    initial={{ opacity: 0, x: -10 }}
                    animate={inView ? { opacity: 1, x: 0 } : {}}
                    transition={{ delay: gi * 0.1 + i * 0.06 }}
                    className="text-ink-300 text-sm flex items-center gap-2"
                  >
                    <span className="w-1 h-1 rounded-full bg-accent/60 flex-shrink-0" />
                    {skill}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
