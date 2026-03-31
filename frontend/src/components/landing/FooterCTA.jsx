import { Link } from 'react-router-dom';
import { Rocket } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const FooterCTA = () => {
  const { user } = useAuth();

  return (
    <section className="relative overflow-hidden">
      {/* Gradient background */}
      <div className="bg-gradient-to-r from-primary via-primary to-accent py-16 sm:py-24">
        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-40 h-40 bg-white/5 rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-60 h-60 bg-white/5 rounded-full translate-x-1/3 translate-y-1/3" />
        <div className="absolute top-1/2 left-1/4 w-20 h-20 bg-white/5 rounded-full" />

        <div className="relative max-w-3xl mx-auto px-4 sm:px-6 text-center">
          {/* Floating emoji */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-white/15 backdrop-blur-sm flex items-center justify-center text-4xl border border-white/20 animate-float shadow-lg">
              🚀
            </div>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-4 leading-tight">
            Ready to Start Your First Quest?
          </h2>
          <p className="text-white/80 text-lg sm:text-xl mb-10 max-w-xl mx-auto">
            Join thousands of learners who chose the fun way to master new skills. It's free to start.
          </p>

          <Link
            to={user ? '/dashboard' : '/signup'}
            className="inline-flex items-center gap-3 px-10 py-5 text-xl font-extrabold text-primary bg-white rounded-full border-b-[6px] border-surface-dark active:border-b-0 active:translate-y-1.5 transition-all duration-150 hover:brightness-110 shadow-xl hover:shadow-2xl"
          >
            <Rocket size={24} />
            {user ? 'Go to Dashboard' : 'Create Free Account'}
          </Link>

          {/* Sub-text */}
          {!user && (
            <p className="mt-6 text-white/60 text-sm font-medium">
              No credit card required · Setup in 30 seconds
            </p>
          )}
        </div>
      </div>

      {/* Footer bar */}
      <div className="bg-dark/90 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
              <Rocket size={14} className="text-white" />
            </div>
            <span className="text-sm font-bold text-white/70">Ascend</span>
          </div>
          <p className="text-xs text-white/40 font-medium">
            © {new Date().getFullYear()} Ascend. Level up, one quest at a time.
          </p>
        </div>
      </div>
    </section>
  );
};

export default FooterCTA;
