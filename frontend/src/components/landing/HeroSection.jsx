import { Link } from 'react-router-dom';
import { Sparkles, Star, Zap, BookOpen, Code, Brain, Check } from 'lucide-react';

const PathNode = ({ icon: Icon, color, borderColor, label, delay, completed }) => (
  <div className="flex flex-col items-center gap-2 animate-slide-up" style={{ animationDelay: `${delay}ms` }}>
    <div
      className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center border-b-[6px] shadow-lg transition-transform hover:scale-110 ${color} ${borderColor}`}
    >
      {/* 3D highlight */}
      <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-[40%] h-2 bg-white/25 rounded-full" />
      <Icon size={28} strokeWidth={2.5} className="text-white relative z-10" />
      {completed && (
        <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-md border-2 border-surface-dark z-20">
          <Check size={12} strokeWidth={4} className="text-success" />
        </div>
      )}
    </div>
    <span className="text-[10px] sm:text-xs font-bold text-dark-light uppercase tracking-wider">
      {label}
    </span>
  </div>
);

const PathConnector = ({ delay }) => (
  <div
    className="hidden sm:flex items-center animate-slide-up"
    style={{ animationDelay: `${delay}ms` }}
  >
    <div className="w-12 lg:w-20 h-1 bg-gradient-to-r from-primary/40 to-primary rounded-full relative">
      {/* Animated pulse dot */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full animate-pulse-soft" />
    </div>
  </div>
);

const HeroSection = () => {
  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-primary/5 via-white to-white pt-12 sm:pt-20 pb-16 sm:pb-24">
      {/* Decorative blobs */}
      <div className="absolute top-10 -left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 -right-20 w-72 h-72 bg-accent/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/10 border border-secondary/20 mb-6 animate-slide-up">
          <Sparkles size={14} className="text-secondary-dark" />
          <span className="text-xs font-black uppercase tracking-widest text-secondary-dark">
            AI-Powered Learning
          </span>
        </div>

        {/* Headline */}
        <h1
          className="text-4xl sm:text-5xl lg:text-6xl font-black text-dark leading-tight mb-6 animate-slide-up"
          style={{ animationDelay: '100ms' }}
        >
          Level Up Your Career with{' '}
          <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
            AI-Powered Roadmaps
          </span>
        </h1>

        {/* Subheadline */}
        <p
          className="text-lg sm:text-xl text-dark-light max-w-2xl mx-auto mb-10 leading-relaxed animate-slide-up"
          style={{ animationDelay: '200ms' }}
        >
          Paste your resume, discover your NSQF skill level, and follow interactive, gamified paths
          to master any tech skill.
        </p>

        {/* CTA Button */}
        <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
          <Link
            to="/signup"
            className="inline-flex items-center gap-3 px-10 py-5 text-xl font-extrabold text-white bg-primary rounded-full border-b-[6px] border-primary-dark active:border-b-0 active:translate-y-1.5 transition-all duration-150 hover:brightness-110 shadow-xl hover:shadow-2xl animate-glow"
          >
            <span className="text-2xl">✨</span>
            Start Your Adventure
          </Link>
        </div>

        {/* Visual Path */}
        <div className="mt-16 sm:mt-20">
          <div className="flex flex-wrap sm:flex-nowrap items-center justify-center gap-4 sm:gap-0">
            <PathNode
              icon={BookOpen}
              color="bg-success"
              borderColor="border-success-dark"
              label="Basics"
              delay={400}
              completed
            />
            <PathConnector delay={450} />
            <PathNode
              icon={Code}
              color="bg-success"
              borderColor="border-success-dark"
              label="Build"
              delay={500}
              completed
            />
            <PathConnector delay={550} />
            <PathNode
              icon={Brain}
              color="bg-primary"
              borderColor="border-primary-dark"
              label="Practice"
              delay={600}
            />
            <PathConnector delay={650} />
            <PathNode
              icon={Star}
              color="bg-locked"
              borderColor="border-locked-dark"
              label="Master"
              delay={700}
            />
          </div>
        </div>

        {/* Social proof */}
        <div
          className="mt-12 flex items-center justify-center gap-6 text-dark-light animate-slide-up"
          style={{ animationDelay: '800ms' }}
        >
          <div className="flex items-center gap-2">
            <Zap size={16} className="text-secondary-dark" />
            <span className="text-sm font-bold">AI-Generated Paths</span>
          </div>
          <div className="w-1 h-1 bg-dark-light rounded-full" />
          <div className="flex items-center gap-2">
            <Star size={16} className="text-secondary-dark" />
            <span className="text-sm font-bold">NSQF Certified Levels</span>
          </div>
          <div className="hidden sm:block w-1 h-1 bg-dark-light rounded-full" />
          <div className="hidden sm:flex items-center gap-2">
            <Check size={16} className="text-success" />
            <span className="text-sm font-bold">Quiz Validated</span>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
