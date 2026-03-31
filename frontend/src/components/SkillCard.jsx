import { Link } from 'react-router-dom';
import ProgressBar from './ProgressBar';

const SkillCard = ({ path }) => {
  const total = path.roadmap?.length || 0;
  const completed = path.roadmap ? path.roadmap.filter(d => d.lessons.length > 0 && d.lessons.every(l => l.completed)).length : 0;
  const isComplete = total > 0 && completed === total;
  const hasNsqf = path.skillNsqfLevel != null;

  return (
    <Link
      to={`/roadmap/${path._id}`}
      className="block group"
    >
      <div className={`bg-card rounded-[2.5rem] p-6 sm:p-8 border-4 transition-colors h-full flex flex-col items-center justify-center text-center relative ${
        isComplete
          ? 'border-success/30 bg-success/5 hover:border-success/60'
          : 'border-surface-dark bg-white hover:border-primary/50 hover:bg-primary/5'
      }`}>
        {/* NSQF Level Badge */}
        {hasNsqf && (
          <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20">
            <span className="text-xs">🎯</span>
            <span className="text-xs font-black text-accent">Lvl {path.skillNsqfLevel}</span>
          </div>
        )}

        {/* World Icon */}
        <div className={`w-28 h-28 rounded-full flex items-center justify-center text-5xl mb-5 border-4 shadow-sm relative ${
          isComplete ? 'bg-success border-success-dark text-white' : 'bg-primary border-primary-dark text-white'
        } group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300`}>
          {/* Inner highlight for 3D effect */}
          <div className="absolute top-2 right-4 w-6 h-4 bg-white/30 rounded-full rotate-[-45deg]"></div>
          {isComplete ? '🏆' : '🌎'}
        </div>
        
        {/* Title */}
        <h3 className="font-extrabold text-dark text-xl sm:text-2xl leading-snug mb-4 group-hover:text-primary transition-colors line-clamp-2 min-h-[3rem] flex items-center">
          {path.topic}
        </h3>

        {/* NSQF Level Range */}
        {hasNsqf && path.targetNsqfLevel && (
          <div className="flex items-center gap-2 mb-3 text-sm">
            <span className="px-2 py-0.5 rounded-lg bg-primary/10 text-primary-dark font-bold text-xs">
              Lvl {path.startingNsqfLevel || '?'}
            </span>
            <span className="text-dark-light font-bold">→</span>
            <span className="px-2 py-0.5 rounded-lg bg-success/10 text-success-dark font-bold text-xs">
              Lvl {path.targetNsqfLevel}
            </span>
          </div>
        )}

        {/* Progress */}
        <div className="w-full">
           <ProgressBar completed={completed} total={total} size="lg" />
        </div>
      </div>
    </Link>
  );
};

export default SkillCard;

