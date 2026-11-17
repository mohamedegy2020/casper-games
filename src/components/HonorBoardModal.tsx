import React, { useMemo } from 'react';
import { Award, X, Heart, Share2, Repeat2, Gamepad2, Trophy } from 'lucide-react';
import { useTikTokLive } from '../context/TikTokLiveContext';
import { soundEffects } from '../services/soundEffects';

interface HonorBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HonorBoardModal: React.FC<HonorBoardModalProps> = ({ isOpen, onClose }) => {
  const { users } = useTikTokLive();

  // Compute calculated scores according to exact user formula
  const rankedUsers = useMemo(() => {
    return Object.values(users)
      .map(user => {
        const tapPoints = Math.floor(user.taps / 200) * 2;
        const sharePoints = Math.floor(user.shares / 10) * 2;
        const repostPoints = user.reposts > 0 ? 5 : 0;
        const gamePoints = user.gamePoints || 0;
        const totalScore = gamePoints + tapPoints + sharePoints + repostPoints;

        return {
          ...user,
          tapPoints,
          sharePoints,
          repostPoints,
          gamePoints,
          totalScore
        };
      })
      .sort((a, b) => b.totalScore - a.totalScore);
  }, [users]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-3xl max-h-[90vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black font-display text-white">
                لوحة الشرف والتفاعل
              </h2>
              <p className="text-xs text-slate-400">
                حساب النقاط تلقائياً: التكبيس + الشير + إعادة النشر + نقاط الألعاب
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formula Explainer Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 p-3 bg-slate-950/60 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300">
            <Heart className="w-4 h-4 shrink-0" />
            <span>200 تكبيسة = <strong>2 نقطة</strong></span>
          </div>
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300">
            <Share2 className="w-4 h-4 shrink-0" />
            <span>10 شير = <strong>2 نقطة</strong></span>
          </div>
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">
            <Repeat2 className="w-4 h-4 shrink-0" />
            <span>1 إعادة نشر = <strong>5 نقاط</strong></span>
          </div>
          <div className="flex items-center gap-1.5 p-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300">
            <Gamepad2 className="w-4 h-4 shrink-0" />
            <span>فوز باللعبة = <strong>10 نقاط</strong></span>
          </div>
        </div>

        {/* Leaderboard Table */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2">
          {rankedUsers.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              لا توجد بيانات تفاعل بعد. ابدأ البث أو فعّل محاكي التفاعل لتسجيل النقاط!
            </div>
          ) : (
            rankedUsers.map((user, idx) => {
              const isTop1 = idx === 0;
              const isTop2 = idx === 1;
              const isTop3 = idx === 2;

              return (
                <div
                  key={user.username}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border transition-all ${
                    isTop1
                      ? 'bg-gradient-to-r from-amber-500/15 via-slate-800/80 to-slate-800 border-amber-500/40 shadow-sm'
                      : isTop2
                      ? 'bg-slate-800/80 border-slate-600/50'
                      : isTop3
                      ? 'bg-slate-800/60 border-amber-700/30'
                      : 'bg-slate-800/40 border-slate-700/40'
                  }`}
                >
                  {/* Left (RTL right): Rank + Avatar + Name */}
                  <div className="flex items-center gap-3 mb-2 sm:mb-0">
                    <div className="w-7 text-center font-bold font-mono text-base">
                      {isTop1 ? '🥇' : isTop2 ? '🥈' : isTop3 ? '🥉' : `#${idx + 1}`}
                    </div>
                    <img
                      src={user.avatarUrl}
                      alt={user.nickname}
                      className="w-10 h-10 rounded-full border-2 border-slate-700 object-cover bg-slate-800"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <div className="font-bold text-sm sm:text-base text-slate-100 flex items-center gap-2">
                        <span>{user.nickname}</span>
                        {user.isFollower && (
                          <span className="text-[10px] text-rose-400 font-normal">متابع</span>
                        )}
                      </div>
                      <div className="text-xs text-slate-400 font-mono" dir="ltr">
                        @{user.username}
                      </div>
                    </div>
                  </div>

                  {/* Right (RTL left): Metrics Breakdown + Total */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-4 text-xs font-mono">
                    {/* Taps */}
                    <div className="text-center px-2 py-1 bg-slate-900/60 rounded-lg">
                      <span className="text-[10px] text-slate-400 block font-sans">تكبيس ({user.taps})</span>
                      <span className="text-rose-400 font-bold">+{user.tapPoints}</span>
                    </div>

                    {/* Shares */}
                    <div className="text-center px-2 py-1 bg-slate-900/60 rounded-lg">
                      <span className="text-[10px] text-slate-400 block font-sans">شير ({user.shares})</span>
                      <span className="text-blue-400 font-bold">+{user.sharePoints}</span>
                    </div>

                    {/* Reposts */}
                    <div className="text-center px-2 py-1 bg-slate-900/60 rounded-lg">
                      <span className="text-[10px] text-slate-400 block font-sans">إعادة نشر</span>
                      <span className="text-emerald-400 font-bold">+{user.repostPoints}</span>
                    </div>

                    {/* Game Points */}
                    <div className="text-center px-2 py-1 bg-slate-900/60 rounded-lg">
                      <span className="text-[10px] text-slate-400 block font-sans">ألعاب</span>
                      <span className="text-amber-400 font-bold">+{user.gamePoints}</span>
                    </div>

                    {/* Total Score */}
                    <div className="text-center px-3 py-1.5 bg-gradient-to-r from-amber-500/20 to-yellow-500/20 border border-amber-500/40 rounded-xl min-w-[70px]">
                      <span className="text-[10px] text-amber-200 block font-sans">المجموع</span>
                      <span className="text-sm font-black text-amber-300 tabular-nums">
                        {user.totalScore}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-3 border-t border-slate-800 bg-slate-950 text-xs text-slate-400">
          <span>إجمالي المشاركين النشطين: {rankedUsers.length}</span>
          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="py-1.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
