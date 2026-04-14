import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import Navbar from '../components/Navbar';

const Signup = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signup(name, username, email, password);
      navigate('/dashboard');
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Signup failed';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 gradient-bg"></div>
      <div className="absolute inset-0">
        <div className="absolute top-10 right-20 w-80 h-80 bg-accent/20 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-secondary/20 rounded-full blur-3xl animate-float" style={{ animationDelay: '1.5s' }}></div>
        <div className="absolute top-1/3 left-1/3 w-64 h-64 bg-white/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '0.5s' }}></div>
      </div>

      {/* Navbar at top */}
      <div className="absolute top-0 left-0 right-0 z-50">
        <Navbar isAuthPage={true} />
      </div>

      {/* Card */}
      <div className="relative z-10 w-full max-w-md animate-slide-up mt-16">
        <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 border border-white/50">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-2xl gradient-bg flex items-center justify-center shadow-lg">
              <span className="text-3xl">✨</span>
            </div>
            <h1 className="text-3xl font-extrabold text-dark">Join Ascend</h1>
            <p className="text-dark-light mt-2">Start your personalized learning adventure</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-surface-dark bg-surface focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all duration-200 text-dark placeholder-dark-light/50"
                placeholder="Your full name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark mb-2">Username</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-light/50 font-semibold">@</span>
                <input
                  id="signup-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  className="w-full pl-9 pr-4 py-3 rounded-xl border-2 border-surface-dark bg-surface focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all duration-200 text-dark placeholder-dark-light/50"
                  placeholder="cool_learner"
                  required
                  minLength={3}
                  maxLength={20}
                />
              </div>
              <p className="text-xs text-dark-light mt-1">Letters, numbers, and underscores only</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-surface-dark bg-surface focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all duration-200 text-dark placeholder-dark-light/50"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-dark mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-surface-dark bg-surface focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all duration-200 text-dark placeholder-dark-light/50"
                placeholder="Min. 6 characters"
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 rounded-xl font-bold text-white gradient-bg hover:opacity-90 active:scale-[0.98] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Creating account...
                </span>
              ) : (
                'Create Account'
              )}
            </button>
          </form>

          <p className="text-center text-dark-light mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary font-semibold hover:text-primary-dark transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
