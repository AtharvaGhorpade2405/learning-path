import { useState } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';

const RoadmapNode = ({ step, index, totalSteps, pathId, onToggle }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  // Determine visual position for winding path: alternate left and right
  const isLeft = index % 2 === 0;
  const isFirst = index === 0;
  const isLast = index === totalSteps - 1;

  const handleToggle = async (e) => {
    e.stopPropagation();
    setIsToggling(true);
    try {
      const { data } = await api.patch(`/paths/${pathId}/steps/${index}`);
      onToggle(data);
      if (!step.completed) {
        toast.success(`Step completed: "${step.title}" 🎉`, { autoClose: 2000 });
      }
    } catch {
      toast.error('Failed to update step');
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div
      className={`relative flex items-center animate-slide-up ${isLeft ? 'justify-start' : 'justify-end'}`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Connector line */}
      {!isFirst && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1 h-8 -mt-8">
          <div className={`w-full h-full rounded-full ${step.completed ? 'bg-success' : 'bg-surface-dark'}`}></div>
        </div>
      )}

      {/* Node card */}
      <div
        className={`relative w-full max-w-sm cursor-pointer transition-all duration-300 ${
          isLeft ? 'ml-4 sm:ml-16' : 'mr-4 sm:mr-16'
        }`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Step indicator */}
        <div className={`absolute top-1/2 -translate-y-1/2 ${isLeft ? '-left-6 sm:-left-10' : '-right-6 sm:-right-10'} z-10`}>
          <div
            className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border-4 transition-all duration-300 ${
              step.completed
                ? 'bg-success border-success/30 text-white shadow-lg shadow-success/30'
                : 'bg-white border-primary/30 text-primary hover:border-primary hover:shadow-lg hover:shadow-primary/20'
            } ${!step.completed && index === 0 ? 'animate-glow' : ''}`}
          >
            {step.completed ? '✓' : index + 1}
          </div>
        </div>

        {/* Card */}
        <div
          className={`rounded-2xl p-5 border-2 transition-all duration-300 ${
            step.completed
              ? 'bg-success/5 border-success/20 hover:border-success/40'
              : 'bg-white border-surface-dark hover:border-primary/30 hover:shadow-lg'
          } ${isExpanded ? 'shadow-xl' : 'shadow-md'}`}
        >
          {/* Header */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-bold text-dark-light uppercase tracking-wider">
                  Step {index + 1}{isLast ? ' · Final' : ''}
                </span>
                {step.completed && (
                  <span className="text-xs bg-success/10 text-success font-semibold px-2 py-0.5 rounded-full">
                    Done
                  </span>
                )}
              </div>
              <h3 className={`font-bold text-lg leading-snug ${
                step.completed ? 'text-success' : 'text-dark'
              }`}>
                {step.title}
              </h3>
            </div>
            <div className={`text-lg transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
              ▾
            </div>
          </div>

          {/* Expanded content */}
          {isExpanded && (
            <div className="mt-4 pt-4 border-t border-surface-dark/50 animate-slide-up">
              <p className="text-dark-light text-sm leading-relaxed mb-4">
                {step.description}
              </p>

              {/* Resources */}
              {step.resources?.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-bold text-dark uppercase tracking-wider mb-2">
                    📚 Resources
                  </h4>
                  <div className="space-y-2">
                    {step.resources.map((resource, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/10"
                      >
                        <span className="text-primary text-sm">→</span>
                        <span className="text-sm text-dark font-medium">{resource}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Toggle button */}
              <button
                onClick={handleToggle}
                disabled={isToggling}
                className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 cursor-pointer ${
                  step.completed
                    ? 'bg-surface text-dark-light hover:bg-surface-dark border border-surface-dark'
                    : 'bg-success text-white hover:bg-success/90 shadow-md hover:shadow-lg'
                } disabled:opacity-50`}
              >
                {isToggling ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Updating...
                  </span>
                ) : step.completed ? (
                  'Mark as Incomplete'
                ) : (
                  '✓ Mark as Complete'
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoadmapNode;
