import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

const CareerSetup = () => {
  const { user, updateCareerProfile } = useAuth();
  const [backgroundText, setBackgroundText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const { width, height } = useWindowSize();

  // Pre-fill with existing background text if re-analyzing
  useEffect(() => {
    if (user?.careerProfile?.rawBackgroundText) {
      setBackgroundText(user.careerProfile.rawBackgroundText);
    }
    if (user?.careerProfile?.baseNsqfScore) {
      setResult({
        parsedExperience: user.careerProfile.parsedExperience || [],
        baseNsqfScore: user.careerProfile.baseNsqfScore,
        justification: user.careerProfile.nsqfJustification || '',
      });
    }
  }, [user]);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (backgroundText.trim().length < 20) {
      toast.error('Please provide at least 20 characters of background information.');
      return;
    }

    setIsAnalyzing(true);
    setResult(null);
    try {
      const { data } = await api.post('/profile/analyze', {
        backgroundText: backgroundText.trim(),
      });

      setResult(data);
      updateCareerProfile({
        rawBackgroundText: backgroundText.trim(),
        parsedExperience: data.parsedExperience,
        baseNsqfScore: data.baseNsqfScore,
        nsqfJustification: data.justification,
        lastAnalyzedAt: data.lastAnalyzedAt,
      });

      // Trigger level-up animation
      setShowLevelUp(true);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 5000);

      toast.success('Career profile analyzed! 🎉');
    } catch (err) {
      const msg =
        err.response?.data?.message || 'Failed to analyze profile. Please try again.';
      toast.error(msg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getNsqfColor = (level) => {
    if (level <= 2) return { bg: 'bg-locked', border: 'border-locked-dark', text: 'text-dark' };
    if (level <= 4) return { bg: 'bg-primary', border: 'border-primary-dark', text: 'text-white' };
    if (level <= 6) return { bg: 'bg-accent', border: 'border-accent-light', text: 'text-white' };
    if (level <= 8) return { bg: 'bg-warning', border: 'border-warning', text: 'text-white' };
    return { bg: 'bg-success', border: 'border-success-dark', text: 'text-white' };
  };

  return (
    <div className="min-h-screen bg-surface">
      {showConfetti && (
        <div className="fixed inset-0 z-50 pointer-events-none">
          <Confetti width={width} height={height} recycle={false} numberOfPieces={400} />
        </div>
      )}
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Back link */}
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1 text-sm text-dark-light hover:text-primary transition-colors mb-6 font-medium"
        >
          ← Back to Dashboard
        </Link>

        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-full gradient-bg flex items-center justify-center text-4xl mx-auto mb-4 shadow-lg animate-float">
            🎯
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-dark mb-2">Career Setup</h1>
          <p className="text-dark-light text-lg max-w-xl mx-auto">
            Tell us about your background and we'll calculate your NSQF level to personalize your
            learning journey.
          </p>
        </div>

        {/* Input Section */}
        <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border-4 border-surface-dark mb-8">
          <form onSubmit={handleAnalyze}>
            <label className="block text-sm font-bold text-dark mb-3 uppercase tracking-wider">
              📝 Your Background
            </label>
            <textarea
              id="career-background-input"
              value={backgroundText}
              onChange={(e) => setBackgroundText(e.target.value)}
              disabled={isAnalyzing}
              rows={8}
              className="w-full px-5 py-4 rounded-2xl border-2 border-surface-dark bg-surface focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all duration-200 text-dark placeholder-dark-light/50 resize-none text-base leading-relaxed"
              placeholder="Paste your resume, LinkedIn summary, or describe your educational and professional background here...

Example: 'I have a B.Tech in Computer Science from XYZ University. I've been working as a junior frontend developer for 1.5 years, primarily using React.js and basic Node.js. I also completed a Coursera specialization in Machine Learning.'"
            />
            <div className="flex items-center justify-between mt-4">
              <span className="text-xs text-dark-light">
                {backgroundText.length} / 10,000 characters
              </span>
              <button
                id="analyze-nsqf-button"
                type="submit"
                disabled={isAnalyzing || backgroundText.trim().length < 20}
                className="px-8 py-4 rounded-full font-extrabold text-white text-lg bg-primary border-primary-dark transition-all duration-200 btn-push disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-3"
              >
                {isAnalyzing ? (
                  <span className="flex items-center gap-2">
                    <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Analyzing...
                  </span>
                ) : (
                  <>
                    <span>🔬</span>
                    Analyze & Calculate My NSQF Level
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Result Section: Level Unlocked */}
        {result && (
          <div className={`animate-slide-up ${showLevelUp ? 'animate-confetti' : ''}`}>
            {/* Big Level Badge */}
            <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border-4 border-surface-dark mb-6 text-center">
              <div className="text-xs font-black uppercase tracking-widest text-dark-light mb-3">
                {showLevelUp ? '🔓 Level Unlocked!' : '📊 Your NSQF Level'}
              </div>

              {/* Level Display */}
              <div className="flex justify-center mb-6">
                <div
                  className={`w-32 h-32 rounded-full flex flex-col items-center justify-center border-b-8 shadow-lg ${
                    getNsqfColor(result.baseNsqfScore).bg
                  } ${getNsqfColor(result.baseNsqfScore).border} ${
                    getNsqfColor(result.baseNsqfScore).text
                  } ${showLevelUp ? 'animate-pulse-soft' : ''}`}
                >
                  <span className="text-5xl font-black leading-none">{result.baseNsqfScore}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-80">
                    NSQF
                  </span>
                </div>
              </div>

              {/* NSQF Scale */}
              <div className="flex items-center gap-1 justify-center mb-6 max-w-md mx-auto">
                {Array.from({ length: 10 }, (_, i) => i + 1).map((level) => (
                  <div
                    key={level}
                    className={`flex-1 h-3 rounded-full transition-all duration-500 ${
                      level <= result.baseNsqfScore
                        ? `${getNsqfColor(result.baseNsqfScore).bg} shadow-sm`
                        : 'bg-surface-dark'
                    }`}
                  />
                ))}
              </div>

              {/* Justification */}
              <p className="text-dark-light text-sm leading-relaxed max-w-lg mx-auto">
                {result.justification}
              </p>
            </div>

            {/* Parsed Experience Tags */}
            {result.parsedExperience?.length > 0 && (
              <div className="bg-white rounded-[2rem] p-6 sm:p-8 shadow-sm border-4 border-surface-dark mb-6">
                <h3 className="text-sm font-black uppercase tracking-widest text-dark-light mb-4">
                  🏷️ Detected Skills & Experience
                </h3>
                <div className="flex flex-wrap gap-2">
                  {result.parsedExperience.map((exp, i) => (
                    <span
                      key={i}
                      className="px-4 py-2 rounded-full bg-primary/10 text-primary-dark text-sm font-bold border border-primary/20 animate-slide-up"
                      style={{ animationDelay: `${i * 80}ms` }}
                    >
                      {exp}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* CTA to go create a roadmap */}
            <div className="text-center">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-extrabold text-white text-lg bg-success border-success-dark btn-push transition-all"
              >
                <span>🚀</span>
                Start Learning with NSQF Roadmaps
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CareerSetup;
