import { useState, useEffect } from 'react';
import Confetti from 'react-confetti';
import { useWindowSize } from 'react-use';

const QuizModal = ({ quizData, isOpen, onClose, onPass, onFail }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [score, setScore] = useState(0);
  const [isAnswered, setIsAnswered] = useState(false);
  const { width, height } = useWindowSize();

  useEffect(() => {
    if (isOpen) {
      setCurrentQuestionIndex(0);
      setSelectedOption(null);
      setScore(0);
      setIsAnswered(false);
    }
  }, [isOpen]);

  if (!isOpen || !quizData || quizData.length === 0) return null;

  const currentQuestion = quizData[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quizData.length - 1;

  const handleSelect = (index) => {
    if (isAnswered) return;
    setSelectedOption(index);
  };

  const handleNext = () => {
    let currentScore = score;
    // Basic validation
    if (selectedOption === currentQuestion.correctAnswerIndex) {
      currentScore += 1;
      setScore(currentScore);
    }

    if (isLastQuestion) {
      // Evaluate Pass/Fail
      if (currentScore >= 2) {
        onPass();
      } else {
        onFail();
      }
    } else {
      setSelectedOption(null);
      setIsAnswered(false);
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleCheck = () => {
    if (selectedOption === null) return;
    setIsAnswered(true);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-dark/70 backdrop-blur-sm"
        onClick={onFail} // Abandoning acts as a fail
      ></div>

      {/* Modal */}
      <div className="relative z-10 w-full max-w-lg max-h-[90vh] h-auto bg-surface rounded-[2rem] shadow-2xl overflow-hidden animate-slide-up flex flex-col border-4 border-surface-dark">
        {/* Progress header */}
        <div className="p-6 border-b-4 border-surface-dark bg-white">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-extrabold text-dark tracking-tight">Active Recall Check</h2>
            <button 
              onClick={onFail}
              className="w-8 h-8 rounded-full bg-surface-dark flex items-center justify-center text-dark-light hover:text-dark font-black hover:bg-locked-dark cursor-pointer transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="w-full h-3 bg-surface-dark rounded-full overflow-hidden mt-4">
            <div 
              className="h-full bg-primary transition-all duration-300 rounded-full"
              style={{ width: `${((currentQuestionIndex) / quizData.length) * 100}%` }}
            ></div>
          </div>
          <p className="text-xs font-black text-dark-light uppercase mt-2 tracking-widest text-right">
            Question {currentQuestionIndex + 1} of {quizData.length}
          </p>
        </div>

        {/* Question Area */}
        <div className="p-5 sm:p-6 bg-white flex-1 overflow-y-auto flex flex-col">
          <h3 className="text-xl font-black text-dark mb-6 leading-snug">
            {currentQuestion.question}
          </h3>

          <div className="flex flex-col gap-2 flex-1 justify-center">
            {currentQuestion.options.map((option, idx) => {
              const isSelected = selectedOption === idx;
              let styleClass = "border-surface-dark bg-white text-dark hover:bg-primary/5 hover:border-primary/50 btn-push";
              
              if (isSelected) {
                styleClass = "border-primary bg-primary/10 text-primary-dark btn-push translate-y-1 mb-1 border-b-0"; 
              }

              if (isAnswered) {
                const isCorrectOption = idx === currentQuestion.correctAnswerIndex;
                if (isCorrectOption) {
                  styleClass = "border-success bg-success/20 text-success-dark translate-y-1 mb-1 border-b-0 shadow-[0_0_15px_rgba(88,204,2,0.3)]";
                } else if (isSelected && !isCorrectOption) {
                  styleClass = "border-danger bg-danger/20 text-danger-dark translate-y-1 mb-1 border-b-0 opacity-80";
                } else {
                  styleClass = "border-surface-dark bg-surface-dark/30 text-dark-light opacity-50 cursor-not-allowed border-b-0";
                }
              }

              return (
                <button
                  key={idx}
                  onClick={() => handleSelect(idx)}
                  disabled={isAnswered}
                  className={`w-full p-3 rounded-2xl border-4 text-left font-bold text-base transition-all duration-200 cursor-pointer flex items-center justify-between ${styleClass}`}
                >
                  <span>{option}</span>
                  {isAnswered && idx === currentQuestion.correctAnswerIndex && (
                    <span className="text-success text-2xl drop-shadow-sm font-black">✓</span>
                  )}
                  {isAnswered && isSelected && idx !== currentQuestion.correctAnswerIndex && (
                    <span className="text-danger text-2xl drop-shadow-sm font-black">✕</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 bg-surface border-t-4 border-surface-dark flex gap-4">
          {!isAnswered ? (
             <button
                onClick={handleCheck}
                disabled={selectedOption === null}
                className="w-full py-4 rounded-full font-extrabold text-white text-xl bg-primary border-primary-dark transition-all duration-200 btn-push disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
             >
                Check Answer
             </button>
          ) : (
             <button
                onClick={handleNext}
                className={`w-full py-4 rounded-full font-extrabold text-white text-xl transition-all duration-200 btn-push cursor-pointer ${
                  selectedOption === currentQuestion.correctAnswerIndex 
                  ? 'bg-success border-success-dark' 
                  : 'bg-danger border-danger-dark'
                }`}
             >
                {isLastQuestion ? 'Finish Quiz' : 'Next Question'}
             </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizModal;
