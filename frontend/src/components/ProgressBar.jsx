import React from 'react';

const ProgressBar = ({ completed, total, size = 'md', showLabel = true }) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const heights = {
    sm: 'h-3',
    md: 'h-4',
    lg: 'h-6',
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5 px-1">
          <span className="text-[10px] sm:text-xs font-black text-dark-light uppercase tracking-wider">
            {completed}/{total} Days
          </span>
          <span className="text-[10px] sm:text-xs font-black text-primary">{percentage}%</span>
        </div>
      )}
      <div className={`w-full ${heights[size]} bg-surface-dark rounded-full overflow-hidden border-2 border-surface-dark/50`}>
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out`}
          style={{
            width: `${percentage}%`,
            background: percentage === 100
              ? 'var(--color-success)'
              : 'var(--color-primary)',
          }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
