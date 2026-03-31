import { Link } from 'react-router-dom';
import { Rocket } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const LandingNavbar = () => {
  const { user } = useAuth();

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-surface-dark/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105 border-b-[3px] border-primary-dark">
              <Rocket size={20} className="text-white" />
            </div>
            <span className="text-xl font-extrabold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Ascend
            </span>
          </Link>

          {/* Auth Buttons */}
          <div className="flex items-center gap-3">
            {user ? (
              <Link
                to="/dashboard"
                className="px-6 py-2.5 text-sm font-extrabold text-white bg-primary rounded-full border-b-4 border-primary-dark active:border-b-0 active:translate-y-1 transition-all duration-150 hover:brightness-110 shadow-md hover:shadow-lg"
              >
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  className="px-5 py-2 text-sm font-bold text-dark hover:text-primary rounded-full hover:bg-primary/5 transition-all duration-200"
                >
                  Log In
                </Link>
                <Link
                  to="/signup"
                  className="px-6 py-2.5 text-sm font-extrabold text-white bg-primary rounded-full border-b-4 border-primary-dark active:border-b-0 active:translate-y-1 transition-all duration-150 hover:brightness-110 shadow-md hover:shadow-lg"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default LandingNavbar;

