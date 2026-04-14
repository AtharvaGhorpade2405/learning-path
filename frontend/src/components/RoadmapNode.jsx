import { useState, useRef, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import QuizModal from './QuizModal';
import { 
  Code, Database, Globe, PenTool, Layout, Terminal, 
  Star, BookOpen, Server, Check, Smartphone, Monitor, Palette
} from 'lucide-react';

const getIconForTitle = (title) => {
  const t = title.toLowerCase();
  if (t.includes('html') || t.includes('css') || t.includes('code') || t.includes('script')) return Code;
  if (t.includes('data') || t.includes('sql') || t.includes('mongo')) return Database;
  if (t.includes('web') || t.includes('internet') || t.includes('network')) return Globe;
  if (t.includes('design') || t.includes('ui') || t.includes('ux') || t.includes('figma')) return Palette;
  if (t.includes('layout') || t.includes('flexbox') || t.includes('grid')) return Layout;
  if (t.includes('terminal') || t.includes('command') || t.includes('cli') || t.includes('linux')) return Terminal;
  if (t.includes('server') || t.includes('api') || t.includes('backend') || t.includes('node') || t.includes('express')) return Server;
  if (t.includes('mobile') || t.includes('app') || t.includes('ios') || t.includes('android')) return Smartphone;
  if (t.includes('front') || t.includes('react') || t.includes('vue') || t.includes('angular')) return Monitor;
  if (t.includes('concept') || t.includes('basics') || t.includes('intro') || t.includes('read')) return BookOpen;
  return Star;
};

// Play a delightful two-tone sound for completion
const playSuccessSound = () => {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const playTone = (freq, type, time, duration, vol) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, time);
      gain.gain.setValueAtTime(vol, time);
      gain.gain.exponentialRampToValueAtTime(0.01, time + duration);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(time);
      osc.stop(time + duration);
    };

    const now = audioCtx.currentTime;
    playTone(523.25, 'sine', now, 0.15, 0.1); 
    playTone(659.25, 'sine', now + 0.1, 0.3, 0.1); 
  } catch (e) {
    console.error('Audio play failed', e);
  }
};

const RoadmapNode = ({ lesson, dayIndex, lessonIndex, globalIndex, isFirst, isLast, pathId, onToggle, globalStatus, dayTitle, currentKnowledge }) => {
  const { updateStreak, updateXP } = useAuth();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isGeneratingQuiz, setIsGeneratingQuiz] = useState(false);
  const [quizData, setQuizData] = useState(null);
  
  const nodeRef = useRef(null);

  // Close popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (nodeRef.current && !nodeRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };
    if (isExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isExpanded]);

  const offsets = ['-translate-x-12', 'translate-x-12', 'translate-x-24', 'translate-x-12', '-translate-x-12', '-translate-x-24'];
  const offsetClass = offsets[globalIndex % offsets.length];

  const submitCompletion = async () => {
    setIsToggling(true);
    try {
      const { data } = await api.patch(`/paths/${pathId}/days/${dayIndex}/lessons/${lessonIndex}`);
      onToggle(data);

      if (data.totalXP !== undefined) {
        updateXP({ totalXP: data.totalXP, currentLevel: data.currentLevel });
      }

      if (!lesson.completed) {
        playSuccessSound();
        if (data.levelUp) {
          toast.success(`🎉 Level Up! You have reached the rank of ${data.newRankName}!`, { autoClose: 5000 });
        } else {
          toast.success(`Lesson completed: "${lesson.title}" 🎉 (+${data.xpAwarded} XP)`, { autoClose: 2000 });
        }
        // Ping activity to update streak (only on completion, not uncomplete)
        try {
          const { data: streakData } = await api.post('/user/ping-activity');
          updateStreak(streakData);
          
          if (streakData.totalXP !== undefined) {
            updateXP({ totalXP: streakData.totalXP, currentLevel: streakData.currentLevel });
          }
          if (streakData.levelUp) {
            toast.success(`🎉 Level Up! You have reached the rank of ${streakData.newRankName}!`, { autoClose: 5000 });
            onToggle({ path: data.path, levelUp: true }); // propagate confetti
          } else if (streakData.xpAwarded > 0) {
            toast.success(`Daily Login Bonus! +${streakData.xpAwarded} XP`, { autoClose: 2000 });
          }

          if (streakData.streakEvents?.length > 0) {
            streakData.streakEvents.forEach(event => {
              if (event.type === 'incremented') {
                toast.success(`You and @${event.friendUsername} extended your shared streak to ${event.count}! 🔥`);
              } else if (event.type === 'broken') {
                toast.error(`Oh no! Your shared streak with @${event.friendUsername} was broken. 💔 You can start a new one!`);
              }
            });
          }
        } catch (err) {
          console.error('Streak ping failed:', err);
        }
      }
      setIsExpanded(false);
    } catch {
      toast.error('Failed to update lesson state');
    } finally {
      setIsToggling(false);
    }
  };

  const handleToggle = async (e) => {
    e.stopPropagation();
    if (globalStatus === 'locked') return; // Do nothing if locked
    
    // If marking as incomplete, just patch
    if (lesson.completed) {
      await submitCompletion();
      return;
    }

    // Attempt to generate quiz
    setIsGeneratingQuiz(true);
    try {
      const { data } = await api.post('/quizzes/generate', {
        lessonTitle: lesson.title,
        dayTitle,
        currentKnowledge
      });
      setQuizData(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to generate Active Recall challenge. Skipping directly to completion...');
      // Fallback: If AI fails, we still allow them to complete it to avoid a total hard block
      await submitCompletion();
    } finally {
      setIsGeneratingQuiz(false);
    }
  };

  const handleQuizPass = async () => {
    setQuizData(null);
    await submitCompletion();
  };

  const handleQuizFail = () => {
    setQuizData(null);
    setIsExpanded(false);
    toast.error('Good try! Review the material and try again to pass this lesson.', { icon: '💪', autoClose: 4000 });
  };

  const IconComponent = getIconForTitle(lesson.title);

  let nodeStyle = '';
  let iconColor = '';
  
  if (globalStatus === 'completed') {
    nodeStyle = 'bg-success border-success-dark hover:bg-success-dark text-white cursor-pointer';
    iconColor = 'text-white';
  } else if (globalStatus === 'available') {
    nodeStyle = 'bg-primary border-primary-dark text-white cursor-pointer animate-pulse-soft shadow-[0_0_20px_rgba(28,176,246,0.5)]';
    iconColor = 'text-white';
  } else {
    // locked
    nodeStyle = 'bg-locked border-locked-dark cursor-not-allowed opacity-80';
    iconColor = 'text-dark-light opacity-60';
  }

  return (
    <>
      <QuizModal 
        isOpen={!!quizData}
        quizData={quizData}
        onClose={() => setQuizData(null)}
        onPass={handleQuizPass}
        onFail={handleQuizFail}
      />
      
      <div className={`relative flex flex-col items-center py-4 ${isExpanded ? 'z-50' : 'z-0'}`} ref={nodeRef}>
        {/* Node Container with horizontal offset */}
        <div className={`relative flex items-center justify-center transition-transform duration-500 ${offsetClass}`}>
          
          {/* Node Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            disabled={globalStatus === 'locked'}
            className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center border-b-8 transition-transform active:border-b-0 active:translate-y-2 focus:outline-none ${nodeStyle}`}
          >
            {/* Inner highlight (crown effect) */}
            <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[40%] h-3 bg-white/20 rounded-full"></div>
            
            <IconComponent size={36} strokeWidth={2.5} className={iconColor} />
            
            {/* Checkmark overlay for completed */}
            {globalStatus === 'completed' && (
              <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-1 shadow-md border-2 border-surface-dark z-20">
                <Check size={16} strokeWidth={4} className="text-success" />
              </div>
            )}
          </button>

          {/* Floating Popover Tooltip */}
          {isExpanded && (
            <div className="absolute z-50 top-full mt-4 left-1/2 -translate-x-1/2 w-72 bg-white rounded-2xl shadow-xl border-2 border-surface-dark p-4 animate-slide-up">
              {/* Tooltip Arrow */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-t-2 border-l-2 border-surface-dark rotate-45"></div>
              
              <div className="relative z-10">
                <h4 className="font-extrabold text-dark text-lg mb-2 leading-tight">
                  {lesson.title}
                </h4>
                <p className="text-dark-light text-sm mb-4">
                  {lesson.description}
                </p>
                
                {/* Resources */}
                {lesson.resources?.length > 0 && (
                  <div className="mb-4">
                    <h5 className="text-xs font-bold text-dark uppercase tracking-wider mb-2">
                      📚 Resources
                    </h5>
                    <div className="space-y-2">
                      {lesson.resources.map((resource, i) => (
                        <a
                          key={i}
                          href={resource.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-surface hover:bg-surface-dark transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span className="text-primary text-sm">→</span>
                          <span className="text-sm text-dark font-medium underline line-clamp-1">{resource.title}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                 {/* Action Button */}
                 <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleToggle(e);
                    }}
                    disabled={isToggling || isGeneratingQuiz}
                    className={`relative z-20 w-full py-3 rounded-xl font-extrabold text-sm transition-all focus:outline-none flex justify-center items-center gap-2 btn-push cursor-pointer ${
                      globalStatus === 'completed'
                        ? 'bg-surface text-dark-light border-surface-dark'
                        : 'bg-primary text-white border-primary-dark'
                    } disabled:opacity-50`}
                  >
                    {isGeneratingQuiz ? (
                       <>
                         <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                         </svg>
                         Preparing Challenge...
                       </>
                    ) : isToggling ? 'Updating...' : globalStatus === 'completed' ? 'Mark Incomplete' : 'Complete Lesson'}
                  </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default RoadmapNode;
