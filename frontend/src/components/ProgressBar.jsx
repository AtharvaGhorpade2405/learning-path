const ProgressBar = ({ completed, total, size = 'md', showLabel = true }) => {
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  const heights = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  return (
    <div className="w-full">
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs font-semibold text-dark-light">
            {completed}/{total} days
          </span>
          <span className="text-xs font-bold text-primary">{percentage}%</span>
        </div>
      )}
      <div className={`w-full ${heights[size]} bg-surface-dark rounded-full overflow-hidden`}>
        <div
          className={`${heights[size]} rounded-full transition-all duration-700 ease-out`}
          style={{
            width: `${percentage}%`,
            background: percentage === 100
              ? 'linear-gradient(90deg, #00B894, #00CEC9)'
              : 'linear-gradient(90deg, #6C5CE7, #A29BFE)',
          }}
        ></div>
      </div>
    </div>
  );
};

export default ProgressBar;
