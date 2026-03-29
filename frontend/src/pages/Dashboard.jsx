import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import SkillCard from '../components/SkillCard';
import NewSkillModal from '../components/NewSkillModal';

const Dashboard = () => {
  const { user } = useAuth();
  const [paths, setPaths] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const fetchPaths = async () => {
    try {
      const { data } = await api.get('/paths');
      setPaths(data);
    } catch {
      // handled by axios interceptor
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPaths();
  }, []);

  const handleCreated = (newPath) => {
    setPaths((prev) => [newPath, ...prev]);
  };

  const totalDays = paths.reduce((sum, p) => sum + (p.roadmap?.length || 0), 0);
  const completedDays = paths.reduce((sum, p) => {
    if (!p.roadmap) return sum;
    const completedInPath = p.roadmap.filter(day => day.lessons.length > 0 && day.lessons.every(l => l.completed)).length;
    return sum + completedInPath;
  }, 0);

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-dark">
            Hey, {user?.name?.split(' ')[0]}! 👋
          </h1>
          <p className="text-dark-light mt-2 text-lg">
            {paths.length === 0
              ? "Ready to start learning something amazing?"
              : "Keep going - you're doing great!"}
          </p>
        </div>

        {/* Stats Row */}
        {paths.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            {[
              { label: 'Worlds', value: paths.length, emoji: '🌎', color: 'bg-primary border-primary-dark text-white' },
              { label: 'Total Days', value: totalDays, emoji: '🎯', color: 'bg-secondary border-secondary-dark text-white' },
              { label: 'Completed', value: completedDays, emoji: '✅', color: 'bg-success border-success-dark text-white' },
              { label: 'Progress', value: totalDays > 0 ? `${Math.round((completedDays / totalDays) * 100)}%` : '0%', emoji: '🔥', color: 'bg-accent border-accent-light text-white' },
            ].map((stat) => (
              <div key={stat.label} className={`rounded-3xl p-4 sm:p-5 border-b-[6px] transition-transform hover:-translate-y-1 flex flex-col items-center justify-center text-center ${stat.color}`}>
                <span className="text-3xl sm:text-4xl mb-1 drop-shadow-sm">{stat.emoji}</span>
                <p className="text-3xl sm:text-4xl font-extrabold drop-shadow-sm pt-1">{stat.value}</p>
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest opacity-80 mt-1">{stat.label}</span>
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => setShowModal(true)}
          className="w-full sm:w-auto mb-10 px-8 py-4 rounded-full font-extrabold text-white bg-primary border-primary-dark transition-all duration-200 flex items-center justify-center gap-3 text-xl cursor-pointer btn-push"
        >
          <span className="text-2xl">✨</span>
          Unlock New World
        </button>

        {/* Skills Grid */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <p className="text-dark-light font-medium">Loading your skills...</p>
            </div>
          </div>
        ) : paths.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-primary/10 flex items-center justify-center animate-float">
              <span className="text-5xl">🎓</span>
            </div>
            <h2 className="text-2xl font-bold text-dark mb-2">No learning paths yet</h2>
            <p className="text-dark-light max-w-md mx-auto mb-6">
              Click "Learn a New Skill" above to let AI create a personalized roadmap just for you.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paths.map((path) => (
              <SkillCard key={path._id} path={path} />
            ))}
          </div>
        )}
      </main>

      <NewSkillModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onCreated={handleCreated}
      />
    </div>
  );
};

export default Dashboard;
