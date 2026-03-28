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
        <div className="bg-card rounded-[2rem] p-6 sm:p-8 shadow-sm border-4 border-surface-dark mb-10 text-center relative overflow-hidden">
          {isComplete && (
            <div className="absolute inset-0 bg-success/10 pointer-events-none z-0"></div>
          )}
          <div className="relative z-10 flex flex-col items-center gap-4">
            <h1 className="text-3xl sm:text-4xl font-black text-dark flex items-center gap-3">
              {isComplete && <span className="text-4xl animate-confetti drop-shadow-md">🏆</span>}
              {path.topic}
            </h1>
            <div className="flex items-center gap-3 font-bold text-dark-light uppercase tracking-widest text-sm bg-surface-dark px-4 py-2 rounded-full">
              <span>{path.days} Day Plan</span>
              <span className="text-dark opacity-30">|</span>
              <span>{totalLessons} Lessons</span>
            </div>
            
            <div className="w-full max-w-lg mt-4">
              <ProgressBar completed={completed} total={total} size="lg" />
            </div>

            {isComplete && (
               <div className="mt-2 text-success-dark font-black text-lg animate-pulse-soft">
                 Path Conquered! 🎉
               </div>
            )}

            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="mt-4 text-xs font-bold text-danger border-2 border-danger/20 hover:bg-danger/10 px-4 py-2 rounded-xl transition-all cursor-pointer inline-flex items-center gap-2"
            >
              {isDeleting ? 'Deleting...' : '🗑 Abandon Path'}
            </button>
          </div>
        </div>

        {/* Roadmap Path */}
        <div className="relative flex flex-col items-center">
          {(() => {
            let globalIndex = 0;
            let foundFirstUncompleted = false;

            return path.roadmap?.map((dayObj, dayIndex) => {
              const isDayComplete = dayObj.lessons.length > 0 && dayObj.lessons.every(l => l.completed);
              
              return (
                <div key={dayIndex} className="w-full relative flex flex-col items-center mb-12">
                  {/* Day Header Banner */}
                  <div className="relative z-10 w-full flex justify-center mb-10 px-4">
                    <div className={`px-6 sm:px-10 py-4 sm:py-5 rounded-3xl border-b-[6px] transition-colors text-center shadow-sm w-full max-w-md ${
                      isDayComplete 
                      ? 'bg-success/10 text-success-dark border-success/30' 
                      : 'bg-white text-dark border-surface-dark'
                    }`}>
                      <div className={`text-[10px] sm:text-xs font-black uppercase tracking-widest mb-1 opacity-70`}>
                        Day {dayObj.day}
                      </div>
                      <h3 className="text-lg sm:text-xl font-extrabold leading-tight">
                        {dayObj.title}
                      </h3>
                    </div>
                  </div>
                  
                  {/* Lessons in Day */}
                  <div className="relative w-full flex flex-col items-center">
                    {dayObj.lessons.map((lesson, lessonIndex) => {
                      const isFirst = globalIndex === 0;
                      const isLast = globalIndex === totalLessons - 1;
                      
                      let globalStatus = 'locked';
                      if (lesson.completed) {
                        globalStatus = 'completed';
                      } else if (!foundFirstUncompleted) {
                        globalStatus = 'available';
                        foundFirstUncompleted = true;
                      }

                      const node = (
                        <RoadmapNode
                          key={`${dayIndex}-${lessonIndex}`}
                          lesson={lesson}
                          dayIndex={dayIndex}
                          lessonIndex={lessonIndex}
                          globalIndex={globalIndex}
                          isFirst={isFirst}
                          isLast={isLast}
                          pathId={path._id}
                          globalStatus={globalStatus}
                          onToggle={handleToggle}
                          dayTitle={dayObj.title}
                          currentKnowledge={path.currentKnowledge}
                        />
                      );
                      globalIndex++;
                      return node;
                    })}
                  </div>
                </div>
              );
            });
          })()}

          {/* End marker */}
          <div className="flex justify-center pt-8 pb-16 relative z-10">
            <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl border-b-8 transition-transform ${
              isComplete
                ? 'bg-secondary border-secondary-dark text-white animate-bounce shadow-lg shadow-secondary/30'
                : 'bg-locked border-locked-dark text-dark/30 grayscale opacity-50'
            }`}>
              🏆
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Roadmap;
