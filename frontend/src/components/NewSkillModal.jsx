import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';

const NewSkillModal = ({ isOpen, onClose, onCreated }) => {
  const [topic, setTopic] = useState('');
  const [currentKnowledge, setCurrentKnowledge] = useState('');
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
        currentKnowledge: currentKnowledge.trim(),
        days: Number(days),
      });
      toast.success(`Learning path for "${topic}" created! 🎯`);
      setTopic('');
      setCurrentKnowledge('');
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

            {/* Knowledge Context */}
            <div>
              <label className="block text-sm font-semibold text-dark mb-2">
                What do you already know about this topic?
              </label>
              <textarea
                value={currentKnowledge}
                onChange={(e) => setCurrentKnowledge(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-surface-dark bg-surface focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all duration-200 text-dark placeholder-dark-light/50 resize-none h-24"
                placeholder="e.g., I know the basics of HTML but struggling with CSS padding..."
                required
                disabled={isLoading}
              />
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
              className="w-full py-4 rounded-full font-extrabold text-white text-lg bg-primary border-primary-dark transition-all duration-200 btn-push disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Crafting Roadmap...
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
