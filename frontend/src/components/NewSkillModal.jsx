import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';

const NewSkillModal = ({ isOpen, onClose, onCreated }) => {
  const [topic, setTopic] = useState('');
  const [level, setLevel] = useState('beginner');
  const [days, setDays] = useState(14);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data } = await api.post('/paths/generate', {
        topic: topic.trim(),
        level,
        days: Number(days),
      });
      toast.success(`Learning path for "${topic}" created! 🎯`);
      setTopic('');
      setLevel('beginner');
      setDays(14);
      onClose();
      if (onCreated) onCreated(data);
      navigate(`/roadmap/${data._id}`);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.errors?.[0]?.message || 'Failed to generate path';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-dark/60 backdrop-blur-sm"
        onClick={!isLoading ? onClose : undefined}
      ></div>

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg animate-slide-up">
        <div className="bg-white rounded-3xl shadow-2xl p-8 border border-surface-dark/20">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center text-2xl shadow-lg">
                ✨
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-dark">New Skill</h2>
                <p className="text-sm text-dark-light">AI will craft your roadmap</p>
              </div>
            </div>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="w-8 h-8 rounded-full bg-surface hover:bg-surface-dark flex items-center justify-center text-dark-light hover:text-dark transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Topic */}
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">
                What do you want to learn?
              </label>
              <input
                type="text"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-surface-dark bg-surface focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all duration-200 text-dark placeholder-dark-light/50"
                placeholder="e.g., React.js, Machine Learning, Piano..."
                required
                disabled={isLoading}
              />
            </div>

            {/* Level */}
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">
                Your current level
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: 'beginner', label: '🌱 Beginner', desc: "I'm new" },
                  { value: 'intermediate', label: '🌿 Intermediate', desc: 'Some experience' },
                  { value: 'advanced', label: '🌳 Advanced', desc: 'Deep dive' },
                ].map((opt) => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setLevel(opt.value)}
                    disabled={isLoading}
                    className={`p-3 rounded-xl border-2 text-center transition-all duration-200 cursor-pointer ${
                      level === opt.value
                        ? 'border-primary bg-primary/10 shadow-md'
                        : 'border-surface-dark bg-surface hover:border-primary/30'
                    }`}
                  >
                    <div className="text-lg">{opt.label.split(' ')[0]}</div>
                    <div className="text-xs font-semibold text-dark mt-1">{opt.label.split(' ').slice(1).join(' ')}</div>
                    <div className="text-[10px] text-dark-light">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Days */}
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">
                Available timeframe
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min="1"
                  max="120"
                  value={days}
                  onChange={(e) => setDays(Number(e.target.value))}
                  disabled={isLoading}
                  className="flex-1 accent-primary"
                />
                <div className="min-w-[80px] text-center px-3 py-2 rounded-xl bg-primary/10 border border-primary/20">
                  <span className="font-bold text-primary text-lg">{days}</span>
                  <span className="text-xs text-dark-light ml-1">day{days > 1 ? 's' : ''}</span>
                </div>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading || !topic.trim()}
              className="w-full py-3.5 rounded-xl font-bold text-white gradient-bg hover:opacity-90 active:scale-[0.98] transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  AI is crafting your roadmap...
                </span>
              ) : (
                '🚀 Generate My Learning Path'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default NewSkillModal;
