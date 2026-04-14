import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import SkillCard from '../components/SkillCard';
import NewSkillModal from '../components/NewSkillModal';
import { getRankInfo } from '../utils/ranks';

const Dashboard = () => {
  const { user, updateCareerProfile } = useAuth();
  const [paths, setPaths] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const hasCareerProfile = user?.careerProfile?.baseNsqfScore != null;

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


  const rankInfo = user ? getRankInfo(user.totalXP || 0) : null;
  const currentXP = user?.totalXP || 0;
  const nextTarget = rankInfo?.nextRankMinXp || currentXP;
  const currentTarget = rankInfo?.minXp || 0;
  
  // Prevent division by zero if apex
  const progressPercent = rankInfo?.nextRankName 
    ? Math.min(100, Math.max(0, ((currentXP - currentTarget) / (nextTarget - currentTarget)) * 100))
    : 100;

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

        {/* Career Setup CTA Banner */}
        {!hasCareerProfile && (
          <Link
            to="/career-setup"
            id="career-setup-cta"
            className="block mb-8 group"
          >
            <div className="relative overflow-hidden rounded-[2rem] p-6 sm:p-8 border-4 border-accent/30 bg-gradient-to-r from-accent/10 via-primary/5 to-secondary/10 hover:border-accent/60 transition-all duration-300">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-accent/20 flex items-center justify-center text-3xl group-hover:scale-110 transition-transform shrink-0">
                  🎯
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-extrabold text-dark mb-1">
                    Set Up Your Career Profile
                  </h3>
                  <p className="text-dark-light text-sm">
                    Paste your resume or describe your background — our AI will calculate your NSQF
                    level and personalize every roadmap to your experience.
                  </p>
                </div>
                <div className="hidden sm:flex items-center text-accent font-black text-3xl group-hover:translate-x-2 transition-transform">
                  →
                </div>
              </div>
              {/* Decorative corner glow */}
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-accent/10 rounded-full blur-2xl pointer-events-none" />
            </div>
          </Link>
        )}

        {/* Stats Row */}
        {paths.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            {[
              { label: 'Worlds', value: paths.length, emoji: '🌎', color: 'bg-primary border-primary-dark text-white' },
              { label: 'Total Days', value: totalDays, emoji: '📅', color: 'bg-secondary border-secondary-dark text-white' },
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

        {/* Next Rank Progress Bar */}
        {rankInfo && rankInfo.nextRankName && (
          <div className="mb-10 p-5 sm:p-6 bg-white border border-gray-200 rounded-3xl shadow-sm">
            <div className="flex justify-between items-end mb-2">
              <div>
                <p className="text-xs font-black text-gray-500 uppercase tracking-widest mb-1">Next Rank</p>
                <h3 className="text-xl font-extrabold text-dark tracking-tight">{rankInfo.nextRankName}</h3>
              </div>
              <div className="text-right">
                <span className="text-lg font-black text-dark">{currentXP}</span>
                <span className="text-sm font-bold text-gray-400"> / {nextTarget} XP</span>
              </div>
            </div>
            <div className="w-full h-4 bg-gray-100 rounded-full overflow-hidden mt-3 shadow-inner">
              <div 
                className="h-full bg-yellow-400 rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <p className="text-right text-xs font-bold text-yellow-600 mt-2">
              {nextTarget - currentXP} XP to go!
            </p>
          </div>
        )}

        {/* Action Buttons Row */}
        <div className="flex flex-wrap gap-4 mb-10">
          <button
            onClick={() => setShowModal(true)}
            className="flex-1 sm:flex-none px-8 py-4 rounded-full font-extrabold text-white bg-primary border-primary-dark transition-all duration-200 flex items-center justify-center gap-3 text-xl cursor-pointer btn-push"
          >
            <span className="text-2xl">✨</span>
            Unlock New World
          </button>
        </div>

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
              Click "Unlock New World" above to let AI create a personalized roadmap just for you.
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

