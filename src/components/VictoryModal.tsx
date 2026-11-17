import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Trophy, ChevronLeft, Sparkles, HeartHandshake } from 'lucide-react';
import { useTikTokLive } from '../context/TikTokLiveContext';
import { soundEffects } from '../services/soundEffects';

interface VictoryModalProps {
  onNextQuestion?: () => void;
}

export const VictoryModal: React.FC<VictoryModalProps> = ({ onNextQuestion }) => {
  const { winnerCelebration, triggerVictoryNext } = useTikTokLive();

  useEffect(() => {
    if (winnerCelebration) {
      soundEffects.playVictory();
      
      // Fire confetti celebration
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        setTimeout(() => {
          confetti({
            particleCount: 50,
            angle: 60,
            spread: 55,
            origin: { x: 0 }
          });
          confetti({
            particleCount: 50,
            angle: 120,
            spread: 55,
            origin: { x: 1 }
          });
        }, 250);
      } catch {
        // ignore
      }
    }
  }, [winnerCelebration]);

  if (!winnerCelebration) return null;

  const handleNext = () => {
    soundEffects.playClick();
    triggerVictoryNext();
    if (onNextQuestion) {
      onNextQuestion();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-md p-6 sm:p-8 bg-slate-900 border-2 border-amber-500/80 rounded-3xl shadow-[0_0_50px_rgba(245,158,11,0.3)] text-center text-white overflow-hidden">
        {/* Glow ambient background effect */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-rose-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Trophy & Badge */}
        <div className="relative inline-flex items-center justify-center w-24 h-24 mb-4 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-400 to-amber-200 shadow-lg shadow-amber-500/30 animate-bounce">
          <Trophy className="w-12 h-12 text-slate-950 stroke-[2.2]" />
          <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-yellow-200 animate-pulse" />
        </div>

        {/* Title */}
        <h2 className="text-3xl sm:text-4xl font-extrabold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-400 font-display mb-1">
          كفو منك يا بطل!
        </h2>
        <p className="text-xs sm:text-sm text-amber-200/80 mb-6 font-medium">
          {winnerCelebration.isGiftAnswer 
            ? 'قام بفتح الإجابة الصحيحة وإهداء فنجر هارت 🫰' 
            : 'أول إجابة صحيحة وسريعة في البث المباشر 🏆'}
        </p>

        {/* Winner User Profile Card */}
        <div className="flex flex-col items-center gap-3 p-4 mb-6 rounded-2xl bg-slate-800/90 border border-slate-700/80">
          <div className="relative">
            <img
              src={winnerCelebration.winner.avatarUrl}
              alt={winnerCelebration.winner.nickname}
              className="w-20 h-20 rounded-full border-4 border-amber-400 shadow-md bg-slate-800 object-cover"
              referrerPolicy="no-referrer"
            />
            {winnerCelebration.isGiftAnswer ? (
              <span className="absolute -bottom-1 -right-1 p-1 bg-rose-500 rounded-full text-xs text-white">
                <HeartHandshake className="w-4 h-4" />
              </span>
            ) : (
              <span className="absolute -bottom-1 -right-1 p-1 bg-amber-500 rounded-full text-xs text-slate-950 font-bold">
                1#
              </span>
            )}
          </div>

          <div className="text-center">
            <h3 className="text-lg sm:text-xl font-bold text-slate-100 flex items-center justify-center gap-1.5">
              <span>{winnerCelebration.winner.nickname}</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono" dir="ltr">
              @{winnerCelebration.winner.username}
            </span>
          </div>

          {/* Correct Answer Display */}
          <div className="w-full mt-2 pt-3 border-t border-slate-700/60 flex flex-col gap-1">
            <span className="text-xs text-slate-400 font-medium">الإجابة الصحيحة:</span>
            <span className="text-base sm:text-lg font-bold text-emerald-400 bg-emerald-950/60 py-1.5 px-3 rounded-xl border border-emerald-500/30">
              {winnerCelebration.correctAnswer}
            </span>
            <span className="text-[11px] text-amber-300 mt-1">
              +10 نقاط ألعاب أضيفت لرصيد اللاعب
            </span>
          </div>
        </div>

        {/* Next Question Button */}
        <button
          onClick={handleNext}
          className="w-full py-3.5 px-6 rounded-xl font-bold text-base text-slate-950 bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 hover:from-amber-300 hover:to-amber-400 active:scale-98 shadow-lg shadow-amber-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>التالي (السؤال التالي)</span>
          <ChevronLeft className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
