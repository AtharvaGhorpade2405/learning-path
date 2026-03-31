import { FileText, BarChart3, Map, PartyPopper } from 'lucide-react';

const steps = [
  {
    number: 1,
    icon: FileText,
    color: 'bg-primary',
    borderColor: 'border-primary-dark',
    title: 'Tell Us Your Background',
    description:
      'Paste your resume or describe your experience. No forms, no dropdowns — just free text.',
  },
  {
    number: 2,
    icon: BarChart3,
    color: 'bg-accent',
    borderColor: 'border-accent-light',
    title: 'Get Your Starting Level',
    description:
      'Our AI analyzes your background and assigns you an NSQF level from 1 to 10.',
  },
  {
    number: 3,
    icon: Map,
    color: 'bg-secondary',
    borderColor: 'border-secondary-dark',
    title: 'Follow the Daily Path',
    description:
      'Receive a personalized day-by-day roadmap with curated resources tailored to your level.',
  },
  {
    number: 4,
    icon: PartyPopper,
    color: 'bg-success',
    borderColor: 'border-success-dark',
    title: 'Pass Quizzes & Level Up',
    description:
      'Complete micro-quizzes to prove mastery, unlock the next node, and watch the confetti fly! 🎉',
  },
];

const JourneyStep = ({ step, isLast }) => {
  const { number, icon: Icon, color, borderColor, title, description } = step;

  return (
    <div className="relative flex gap-5 sm:gap-8">
      {/* Timeline line + node */}
      <div className="flex flex-col items-center shrink-0">
        {/* Node */}
        <div
          className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center border-b-[5px] shadow-lg ${color} ${borderColor} z-10`}
        >
          <div className="absolute top-1.5 left-1/2 -translate-x-1/2 w-[40%] h-2 bg-white/20 rounded-full" />
          <Icon size={24} strokeWidth={2.5} className="text-white relative z-10" />
        </div>
        {/* Connecting line */}
        {!isLast && (
          <div className="w-1 flex-1 min-h-[60px] bg-gradient-to-b from-surface-dark to-surface-dark/30 rounded-full mt-2" />
        )}
      </div>

      {/* Content */}
      <div className="pb-12 sm:pb-16 pt-1">
        <div className="text-[10px] font-black uppercase tracking-widest text-dark-light mb-1">
          Step {number}
        </div>
        <h3 className="text-lg sm:text-xl font-extrabold text-dark mb-2 leading-tight">{title}</h3>
        <p className="text-dark-light leading-relaxed max-w-md">{description}</p>
      </div>
    </div>
  );
};

const JourneySection = () => {
  return (
    <section className="py-16 sm:py-24 bg-gradient-to-b from-white to-primary/5">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-success/10 border border-success/20 mb-4">
            <span className="text-sm">🗺️</span>
            <span className="text-xs font-black uppercase tracking-widest text-success-dark">
              Your Journey
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-dark">
            How It <span className="text-success">Works</span>
          </h2>
        </div>

        {/* Timeline */}
        <div className="flex flex-col">
          {steps.map((step, index) => (
            <JourneyStep key={step.number} step={step} isLast={index === steps.length - 1} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default JourneySection;
