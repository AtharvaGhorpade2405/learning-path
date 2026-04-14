import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Flame, Users, Crown, Menu, X, Rocket } from 'lucide-react';
import { getRankInfo } from '../utils/ranks';

const Navbar = ({ isAuthPage = false }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const hasNsqf = user?.careerProfile?.baseNsqfScore != null;

  const isStreakActiveToday = (() => {
    if (!user?.lastLessonCompletedDate) return false;
    const lastActive = new Date(user.lastLessonCompletedDate).toISOString().slice(0, 10);
    const today = new Date().toISOString().slice(0, 10);
    return lastActive === today;
  })();

  const rankInfo = user ? getRankInfo(user.totalXP || 0) : null;

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${isAuthPage ? 'bg-white/95 backdrop-blur-xl border-b border-surface-dark shadow-sm' : 'glass border-b border-white/20 bg-white/80'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group" onClick={() => setIsOpen(false)}>
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 border-b-[3px] border-primary-dark">
              <Rocket size={20} className="text-white" />
            </div>
            <span className="text-xl font-bold gradient-text">
              Ascend
            </span>
          </Link>

          {/* Right Side - Desktop */}
          {user && (
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-3">
                {/* NSQF Badge */}
                {hasNsqf ? (
                  <Link
                    to="/career-setup"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/10 border border-accent/20 hover:bg-accent/20 transition-colors"
                  >
                    <span className="text-xs">🎯</span>
                    <span className="text-xs font-black text-accent">
                      NSQF {user.careerProfile.baseNsqfScore}
                    </span>
                  </Link>
                ) : (
                  <Link
                    to="/career-setup"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/5 border border-dashed border-accent/30 hover:bg-accent/10 transition-colors"
                  >
                    <span className="text-xs font-bold text-accent">Set NSQF →</span>
                  </Link>
                )}

                {/* Rank and XP Badge */}
                {rankInfo && (
                  <div className="flex items-center gap-0 border border-gray-200 rounded-full bg-white shadow-sm overflow-hidden">
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-50 border-r border-yellow-100">
                      <Crown size={16} className="text-yellow-500 fill-yellow-400" />
                      <span className="text-xs font-bold text-yellow-700">{rankInfo.name}</span>
                    </div>
                    <div className="px-3 py-1.5 bg-gray-50 flex items-center justify-center">
                      <span className="text-xs font-black text-gray-600">{user.totalXP || 0} XP</span>
                    </div>
                  </div>
                )}

                {/* Streak Badge */}
                <Link
                  to="/social"
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all duration-200 hover:scale-105 ${
                    isStreakActiveToday
                      ? 'bg-orange-50 border-orange-200 hover:bg-orange-100'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                >
                  <Flame
                    size={18}
                    className={`transition-colors duration-200 ${
                      isStreakActiveToday
                        ? 'text-orange-500 animate-pulse-soft'
                        : 'text-gray-400'
                    }`}
                    fill={isStreakActiveToday ? 'currentColor' : 'none'}
                  />
                  <span
                    className={`text-sm font-extrabold ${
                      isStreakActiveToday ? 'text-orange-600' : 'text-gray-400'
                    }`}
                  >
                    {user.personalStreak || 0}
                  </span>
                </Link>

                {/* Friends Link */}
                <Link
                  to="/social"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors"
                >
                  <Users size={16} className="text-primary" />
                  <span className="text-xs font-bold text-primary">Friends</span>
                </Link>

                <Link to="/dashboard" className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full hover:bg-primary/20 transition-colors">
                  <div className="w-6 h-6 rounded-full gradient-bg flex items-center justify-center text-white text-sm font-bold">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-semibold text-dark">
                    {user.name}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 text-sm font-medium text-danger hover:bg-danger/10 rounded-xl transition-all duration-200 cursor-pointer"
                >
                  Logout
                </button>
              </div>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 text-dark hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                onClick={() => setIsOpen(!isOpen)}
              >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          )}

          {!user && (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-4 py-2 text-sm font-bold text-dark hover:text-primary transition-colors duration-200"
              >
                Log in
              </Link>
              <Link
                to="/signup"
                className="px-5 py-2 text-sm font-bold text-white gradient-bg rounded-xl shadow-md hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200"
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {isOpen && user && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 shadow-[0_4px_20px_rgba(0,0,0,0.1)] flex flex-col p-4 gap-4 z-50">
          
          <div className="flex items-center gap-3 p-3 bg-primary/5 rounded-2xl border border-primary/10">
            <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-lg">
              {user.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-dark">{user.name}</p>
              <p className="text-xs text-dark-light">@{user.username}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
             {/* Streak Badge */}
             <Link
                to="/social"
                onClick={() => setIsOpen(false)}
                className={`flex justify-center items-center gap-2 px-4 py-3 rounded-xl border ${
                  isStreakActiveToday
                    ? 'bg-orange-50 border-orange-200'
                    : 'bg-gray-50 border-gray-200'
                }`}
              >
                <Flame
                  size={20}
                  className={isStreakActiveToday ? 'text-orange-500' : 'text-gray-400'}
                  fill={isStreakActiveToday ? 'currentColor' : 'none'}
                />
                <span className={`text-base font-extrabold ${isStreakActiveToday ? 'text-orange-600' : 'text-gray-400'}`}>
                  {user.personalStreak || 0} Streak
                </span>
              </Link>

              {/* Rank and XP */}
              {rankInfo && (
                <div className="flex flex-col justify-center items-center gap-1 px-4 py-2 rounded-xl border border-yellow-200 bg-yellow-50">
                  <div className="flex items-center gap-1.5">
                    <Crown size={16} className="text-yellow-500 fill-yellow-400" />
                    <span className="text-xs font-bold text-yellow-700">{rankInfo.name}</span>
                  </div>
                  <span className="text-sm font-black text-gray-600">{user.totalXP || 0} XP</span>
                </div>
              )}
          </div>

          <div className="flex flex-col gap-2">
             <Link 
                to="/dashboard" 
                onClick={() => setIsOpen(false)}
                className="flex items-center p-3 rounded-xl hover:bg-gray-50 text-dark font-bold border border-transparent hover:border-gray-100 transition-all font-medium text-lg"
             >
               🏠 Dashboard
             </Link>
             <Link 
                to="/social" 
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 p-3 rounded-xl hover:bg-gray-50 text-dark font-bold border border-transparent hover:border-gray-100 transition-all font-medium text-lg"
             >
               <Users size={20} className="text-primary" /> Friends & Social
             </Link>
             <Link 
                to="/career-setup" 
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 p-3 rounded-xl hover:bg-gray-50 text-dark font-bold border border-transparent hover:border-gray-100 transition-all font-medium text-lg"
             >
               🎯 Career & NSQF
               {hasNsqf && <span className="ml-auto text-sm text-accent bg-accent/10 px-2 py-1 rounded-full">Level {user.careerProfile.baseNsqfScore}</span>}
             </Link>
          </div>

          <hr className="my-2 border-gray-100" />

          <button
            onClick={() => {
               handleLogout();
               setIsOpen(false);
            }}
            className="w-full text-center p-3 text-danger font-bold rounded-xl hover:bg-danger/10 transition-colors"
          >
            Log Out
          </button>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
