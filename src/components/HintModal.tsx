import React from 'react';
import { Lightbulb, X } from 'lucide-react';
import { useTikTokLive } from '../context/TikTokLiveContext';
import { soundEffects } from '../services/soundEffects';

export const HintModal: React.FC = () => {
  const { hintModalText, setHintModalText } = useTikTokLive();

  if (!hintModalText) return null;

  const handleClose = () => {
    soundEffects.playClick();
    setHintModalText(null);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={handleClose}
    >
      <div 
        className="relative w-full max-w-sm p-6 bg-slate-900 border-2 border-amber-400/90 rounded-2xl shadow-[0_0_40px_rgba(251,191,36,0.25)] text-center text-white"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={handleClose}
          className="absolute top-3 left-3 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title="إغلاق التلميح"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex items-center justify-center w-14 h-14 mb-3 rounded-full bg-amber-500/20 border border-amber-400/50 text-amber-400">
          <Lightbulb className="w-8 h-8 animate-pulse" />
        </div>

        <h3 className="text-xl font-bold text-amber-300 font-display mb-2">
          💡 تلميح السؤال
        </h3>

        <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-200 text-base leading-relaxed font-medium mb-5">
          {hintModalText}
        </div>

        <p className="text-[11px] text-slate-400 mb-4">
          يتم إظهار التلميح عبر زر المبدع أو إرسال هدية وردة 🌹 / عملة 🪙
        </p>

        <button
          onClick={handleClose}
          className="w-full py-2.5 px-4 rounded-xl font-bold text-sm text-slate-950 bg-amber-400 hover:bg-amber-300 transition-colors cursor-pointer"
        >
          إغلاق التلميح ومواصلة اللعب
        </button>
      </div>
    </div>
  );
};
