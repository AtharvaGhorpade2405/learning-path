import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import ProgressBar from '../components/ProgressBar';
import SkillSwitcher from '../components/SkillSwitcher';
import RoadmapNode from '../components/RoadmapNode';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

const Roadmap = () => {
  const { id } = useParams();
  const [path, setPath] = useState(null);
  const [allPaths, setAllPaths] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const { width, height } = useWindowSize();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [pathRes, allRes] = await Promise.all([
          api.get(`/paths/${id}`),
          api.get('/paths'),
        ]);
        setPath(pathRes.data);
        setAllPaths(allRes.data);
      } catch {
        toast.error('Failed to load roadmap');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleToggle = (updatedPath) => {
    // Check if it just became completed
    const wasComplete = path.roadmap?.length > 0 && path.roadmap.every(d => d.lessons.length > 0 && d.lessons.every(l => l.completed));
    const isNowComplete = updatedPath.roadmap?.length > 0 && updatedPath.roadmap.every(d => d.lessons.length > 0 && d.lessons.every(l => l.completed));
    if (!wasComplete && isNowComplete) {
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 8000);
    }

    setPath(updatedPath);
    // Also update in allPaths for the switcher
    setAllPaths((prev) =>
      prev.map((p) => (p._id === updatedPath._id ? updatedPath : p))
    );
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this learning path? This cannot be undone.')) return;
    setIsDeleting(true);
    try {
      await api.delete(`/paths/${id}`);
      toast.success('Learning path deleted');
      window.location.href = '/dashboard';
    } catch {
      toast.error('Failed to delete');
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface">
        <Navbar />
        <div className="flex justify-center items-center py-40">
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-dark-light font-medium">Loading roadmap...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!path) {
    return (
      <div className="min-h-screen bg-surface">
        <Navbar />
        <div className="text-center py-40">
          <h2 className="text-2xl font-bold text-dark mb-4">Roadmap not found</h2>
          <Link to="/dashboard" className="text-primary font-semibold hover:underline">
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const total = path.roadmap?.length || 0;
  const completed = path.roadmap ? path.roadmap.filter(d => d.lessons.length > 0 && d.lessons.every(l => l.completed)).length : 0;
  const isComplete = total > 0 && completed === total;
  const totalLessons = path.roadmap?.reduce((acc, d) => acc + d.lessons.length, 0) || 0;

  return (
    <div className="min-h-screen bg-surface overflow-hidden">
      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />
        </div>
      )}
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 relative">
        {/* Skill Switcher */}
        {allPaths.length > 1 && (
          <div className="mb-6">
            <SkillSwitcher paths={allPaths} />
          </div>
        )}

        {/* Back link */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-dark-light hover:text-primary transition-colors mb-6 font-medium"
        >
          ← Back to Dashboard
        </Link>

        {/* Header */}
        <div className="bg-card rounded-3xl p-6 sm:p-8 shadow-lg border border-surface-dark/20 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-dark flex items-center gap-3">
                {isComplete && <span className="text-3xl animate-confetti">🏆</span>}
                {path.topic}
              </h1>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="text-sm text-dark-light">📅 {path.days} day plan</span>
                <span className="text-surface-dark">·</span>
                <span className="text-sm text-dark-light">{totalLessons} lessons</span>
              </div>
            </div>
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="text-sm text-danger hover:bg-danger/10 px-4 py-2 rounded-xl transition-colors self-start cursor-pointer font-medium"
            >
              {isDeleting ? 'Deleting...' : '🗑 Delete'}
            </button>
          </div>

          {/* Progress bar */}
          <ProgressBar completed={completed} total={total} size="lg" />

          {isComplete && (
            <div className="mt-4 p-4 rounded-xl bg-success/10 border border-success/20 text-center">
              <p className="text-success font-bold text-lg">
                🎉 Congratulations! You've completed this learning path!
              </p>
            </div>
          )}
        </div>

        {/* Roadmap Path */}
        <div className="relative">
          {/* Nodes grouped by Day */}
          <div className="relative py-6">
            {/* Central path line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 -translate-x-1/2 bg-gradient-to-b from-primary via-primary-light to-secondary rounded-full opacity-20 z-0"></div>

            {(() => {
              let globalIndex = 0;
              return path.roadmap?.map((dayObj, dayIndex) => {
                const isDayComplete = dayObj.lessons.length > 0 && dayObj.lessons.every(l => l.completed);
                
                return (
                  <div key={dayIndex} className="mb-16 relative">
                    {/* Day Header */}
                    <div className="flex justify-center mb-10 relative z-10">
                      <div className={`px-8 py-3 rounded-2xl border-2 shadow-sm transition-colors duration-500 text-center ${
                        isDayComplete 
                        ? 'bg-success/10 border-success/30 text-success' 
                        : 'bg-white border-surface-dark'
                      }`}>
                        <div className={`text-xs font-bold uppercase tracking-widest mb-1 ${isDayComplete ? 'text-success/80' : 'text-dark-light'}`}>
                          Day {dayObj.day}
                        </div>
                        <h3 className={`text-xl font-extrabold ${isDayComplete ? 'text-success' : 'text-dark'}`}>
                          {dayObj.title}
                        </h3>
                      </div>
                    </div>
                    
                    {/* Lessons in Day */}
                    <div className="space-y-10">
                      {dayObj.lessons.map((lesson, lessonIndex) => {
                        const isFirst = dayIndex === 0 && lessonIndex === 0;
                        const isLast = dayIndex === path.roadmap.length - 1 && lessonIndex === dayObj.lessons.length - 1;
                        
                        return (
                          <RoadmapNode
                            key={`${dayIndex}-${lessonIndex}`}
                            lesson={lesson}
                            dayIndex={dayIndex}
                            lessonIndex={lessonIndex}
                            globalIndex={globalIndex++}
                            isFirst={isFirst}
                            isLast={isLast}
                            pathId={path._id}
                            onToggle={handleToggle}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              });
            })()}
          </div>

          {/* End marker */}
          <div className="flex justify-center pt-4">
            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl border-4 ${
              isComplete
                ? 'bg-success border-success/30 text-white shadow-lg shadow-success/30'
                : 'bg-white border-surface-dark text-dark-light'
            }`}>
              {isComplete ? '🏆' : '🏁'}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Roadmap;
