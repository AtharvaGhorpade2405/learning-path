import { Link } from 'react-router-dom';
import ProgressBar from './ProgressBar';

const SkillCard = ({ path }) => {
  const total = path.roadmap?.length || 0;
  const completed = path.roadmap ? path.roadmap.filter(d => d.lessons.length > 0 && d.lessons.every(l => l.completed)).length : 0;
  const isComplete = total > 0 && completed === total;

  return (
    <Link
      to={`/roadmap/${path._id}`}
      className="block group"
    >
      <div className={`bg-card rounded-2xl p-6 border-2 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
        isComplete
          ? 'border-success/30 hover:border-success/60'
          : 'border-transparent hover:border-primary/30'
      }`}>
        {/* Top row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
              isComplete ? 'bg-success/10' : 'bg-primary/10'
            } group-hover:scale-110 transition-transform duration-300`}>
              {isComplete ? '🏆' : '📚'}
            </div>
            <div>
              <h3 className="font-bold text-dark text-lg leading-tight group-hover:text-primary transition-colors">
                {path.topic}
              </h3>
            </div>
          </div>
          {isComplete && (
            <span className="text-2xl animate-confetti">✅</span>
          )}
        </div>

        {/* Progress */}
        <ProgressBar completed={completed} total={total} />

        {/* Footer */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-surface-dark/50">
          <span className="text-xs text-dark-light">
            📅 {path.days} day{path.days > 1 ? 's' : ''} plan
          </span>
          <span className="text-xs font-semibold text-primary group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
            View Roadmap →
          </span>
        </div>
      </div>
    </Link>
  );
};

export default SkillCard;
