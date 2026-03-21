import { Link, useParams } from 'react-router-dom';

const SkillSwitcher = ({ paths }) => {
  const { id: currentId } = useParams();

  if (!paths || paths.length === 0) return null;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {paths.map((path) => {
        const isActive = path._id === currentId;
        const completed = path.steps.filter((s) => s.completed).length;
        const total = path.steps.length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        return (
          <Link
            key={path._id}
            to={`/roadmap/${path._id}`}
            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all duration-200 border-2 ${
              isActive
                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/30'
                : 'bg-white text-dark hover:bg-primary/5 border-surface-dark hover:border-primary/30'
            }`}
          >
            <span>{path.topic}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${
              isActive ? 'bg-white/20' : 'bg-surface-dark'
            }`}>
              {percentage}%
            </span>
          </Link>
        );
      })}
    </div>
  );
};

export default SkillSwitcher;
