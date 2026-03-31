import { Brain, TrendingUp, ShieldCheck, Target } from 'lucide-react';
import FeatureCard from './FeatureCard';

const FeaturesGrid = () => {
  const features = [
    {
      icon: Brain,
      iconBg: 'bg-primary',
      iconBorder: 'border-primary-dark',
      title: 'Smart AI Paths',
      description:
        'Dynamic roadmaps generated instantly based on what you already know. No one-size-fits-all curricula — every path is uniquely yours.',
      delay: 100,
    },
    {
      icon: TrendingUp,
      iconBg: 'bg-accent',
      iconBorder: 'border-accent-light',
      title: 'NSQF Leveling',
      description:
        "Don't just learn — level up. We track your progress against real-world National Skills Qualifications Framework standards.",
      delay: 200,
    },
    {
      icon: ShieldCheck,
      iconBg: 'bg-success',
      iconBorder: 'border-success-dark',
      title: 'Prove Your Skills',
      description:
        'Pass AI-generated micro-quizzes to conquer each node. No honor system — real validation before you advance.',
      delay: 300,
    },
    {
      icon: Target,
      iconBg: 'bg-secondary',
      iconBorder: 'border-secondary-dark',
      title: 'Career-Ready Focus',
      description:
        'Paste your resume to get a personalized starting point. Every roadmap bridges the gap between where you are and where you want to be.',
      delay: 400,
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4">
            <span className="text-sm">🎮</span>
            <span className="text-xs font-black uppercase tracking-widest text-primary-dark">
              Why Ascend?
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-dark">
            Learning That Feels Like{' '}
            <span className="text-primary">Playing</span>
          </h2>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <FeatureCard key={feature.title} {...feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesGrid;
