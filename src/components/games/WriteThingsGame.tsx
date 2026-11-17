import React, { useState, useEffect } from 'react';
import { ArrowRight, ListOrdered, CheckCircle2, Award, Sparkles } from 'lucide-react';
import { QuestionItem, User } from '../../types';
import { DEFAULT_QUESTIONS } from '../../services/excelService';
import { StandardGameControls } from '../StandardGameControls';
import { useTikTokLive } from '../../context/TikTokLiveContext';
import { checkAnswerMatch } from '../../utils/arabic';
import { soundEffects } from '../../services/soundEffects';

interface WriteThingsGameProps {
  onBackToLobby: () => void;
  onOpenHonorBoard: () => void;
}

interface ItemSlotState {
  target: string;
  isFound: boolean;
  foundBy?: User;
}

export const WriteThingsGame: React.FC<WriteThingsGameProps> = ({ onBackToLobby, onOpenHonorBoard }) => {
  const [questions, setQuestions] = useState<QuestionItem[]>(DEFAULT_QUESTIONS.write_things);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentQ = questions[currentIndex] || questions[0];

  const {
    comments,
    recentGifts,
    isFollowerOnly,
    triggerHint,
    addGamePoints,
    setWinnerCelebration,
    gameResetKey
  } = useTikTokLive();

  // 10 items status for current question
  const [slots, setSlots] = useState<ItemSlotState[]>([]);
  const [isAllCompleted, setIsAllCompleted] = useState(false);

  // Initialize slots when current question changes or gameResetKey
  useEffect(() => {
    const rawItems = currentQ.items && currentQ.items.length > 0 
      ? currentQ.items.slice(0, 10) 
      : ['عنصر 1', 'عنصر 2', 'عنصر 3', 'عنصر 4', 'عنصر 5', 'عنصر 6', 'عنصر 7', 'عنصر 8', 'عنصر 9', 'عنصر 10'];

    setSlots(rawItems.map(item => ({
      target: item,
      isFound: false
    })));
    setIsAllCompleted(false);
  }, [currentIndex, currentQ, gameResetKey]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [gameResetKey]);

  // Check incoming comments against unrevealed slots
  useEffect(() => {
    if (isAllCompleted || slots.length === 0) return;

    if (comments.length > 0) {
      const latestComment = comments[0];
      if (isFollowerOnly && !latestComment.user.isFollower) return;

      // Find first unrevealed slot that matches comment
      const matchIndex = slots.findIndex(
        slot => !slot.isFound && checkAnswerMatch(latestComment.text, slot.target)
      );

      if (matchIndex !== -1) {
        soundEffects.playVictory();
        addGamePoints(latestComment.user.username, 10);

        setSlots(prev => {
          const next = [...prev];
          next[matchIndex] = {
            ...next[matchIndex],
            isFound: true,
            foundBy: latestComment.user
          };

          const remaining = next.filter(s => !s.isFound).length;
          if (remaining === 0) {
            setIsAllCompleted(true);
            setTimeout(() => {
              onOpenHonorBoard();
            }, 1200);
          }

          return next;
        });
      }
    }
  }, [comments, isAllCompleted, slots, isFollowerOnly, addGamePoints, onOpenHonorBoard]);

  // Gift listener
  useEffect(() => {
    if (isAllCompleted || slots.length === 0) return;

    if (recentGifts.length > 0) {
      const latestGift = recentGifts[0];
      const timeDiff = Date.now() - latestGift.timestamp;
      if (timeDiff < 2000) {
        if (latestGift.giftType === 'rose' || latestGift.giftType === 'coin') {
          triggerHint(currentQ.hint || 'تلميح: حاول تذكر أمثلة متنوعة ومشهورة!');
        } else if (latestGift.giftType === 'finger_heart') {
          // Reveal the first unfound item for this donor!
          const unrevealedIdx = slots.findIndex(s => !s.isFound);
          if (unrevealedIdx !== -1) {
            soundEffects.playVictory();
            addGamePoints(latestGift.user.username, 10);
            setSlots(prev => {
              const next = [...prev];
              next[unrevealedIdx] = {
                ...next[unrevealedIdx],
                isFound: true,
                foundBy: latestGift.user
              };
              if (next.filter(s => !s.isFound).length === 0) {
                setIsAllCompleted(true);
                setTimeout(() => onOpenHonorBoard(), 1200);
              }
              return next;
            });
          }
        }
      }
    }
  }, [recentGifts, isAllCompleted, slots, currentQ, triggerHint, addGamePoints, onOpenHonorBoard]);

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
    }
  };

  const handleShowHint = () => {
    triggerHint(currentQ.hint || 'تلميح: حاول التفكير في أشهر الأنواع المعروفة!');
  };

  const handleShowAnswer = () => {
    // Reveal all remaining slots with creator badge
    soundEffects.playVictory();
    setSlots(prev => prev.map(s => ({
      ...s,
      isFound: true,
      foundBy: s.foundBy || {
        id: 'creator',
        username: 'مبدع_البث',
        nickname: 'مقدم البث',
        avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=creator',
        isFollower: true,
        taps: 0,
        shares: 0,
        reposts: 0,
        gamePoints: 0
      }
    })));
    setIsAllCompleted(true);
  };

  const solvedCount = slots.filter(s => s.isFound).length;

  return (
    <div className="flex-1 flex flex-col justify-between p-3 sm:p-6 max-w-4xl mx-auto w-full">
      {/* Game Header Bar */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <button
          onClick={() => {
            soundEffects.playClick();
            onBackToLobby();
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-colors cursor-pointer"
        >
          <ArrowRight className="w-4 h-4" />
          <span>الرجوع للرئيسية</span>
        </button>

        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-teal-500/20 text-teal-400 border border-teal-500/30">
            <ListOrdered className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black font-display text-white">
              لعبة أكتب أشياء عن (10 عناصر)
            </h2>
            <p className="text-[11px] text-slate-400">
              كل إجابة صحيحة يُسجل اسم صاحبها تحت العنصر
            </p>
          </div>
        </div>
      </div>

      {/* Main 10 Slots Board */}
      <div className="flex-1 flex flex-col justify-center my-2">
        {/* Topic Title */}
        <div className="text-center mb-4">
          <span className="text-xs font-semibold text-teal-300 bg-teal-500/10 px-3 py-1 rounded-full border border-teal-500/20 inline-flex items-center gap-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
            <span>تم إيجاد {solvedCount} من 10 عناصر</span>
          </span>
          <h3 className="text-xl sm:text-2xl font-black text-white font-display">
            {currentQ.question}
          </h3>
        </div>

        {/* 10 Item Slots Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 sm:gap-3">
          {slots.map((slot, index) => (
            <div
              key={index}
              className={`p-3 rounded-2xl border flex flex-col items-center text-center justify-between min-h-[105px] transition-all ${
                slot.isFound
                  ? 'bg-gradient-to-b from-teal-950/60 to-slate-900 border-teal-500/50 shadow-md shadow-teal-500/10'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between w-full text-[11px] text-slate-400">
                <span className="font-mono">#{index + 1}</span>
                {slot.isFound && <CheckCircle2 className="w-4 h-4 text-teal-400" />}
              </div>

              {/* Value or Masked */}
              <div className="my-1">
                {slot.isFound ? (
                  <span className="text-sm sm:text-base font-black text-teal-300 font-display">
                    {slot.target}
                  </span>
                ) : (
                  <span className="text-lg font-black text-slate-600 font-mono tracking-widest">
                    ???
                  </span>
                )}
              </div>

              {/* Account Who Answered Correctly First */}
              <div className="w-full pt-1.5 border-t border-slate-800/80 text-[11px]">
                {slot.isFound && slot.foundBy ? (
                  <div className="flex items-center justify-center gap-1.5 truncate">
                    <img
                      src={slot.foundBy.avatarUrl}
                      alt={slot.foundBy.nickname}
                      className="w-4 h-4 rounded-full border border-teal-400/50 object-cover bg-slate-800"
                      referrerPolicy="no-referrer"
                    />
                    <span className="text-slate-200 font-bold truncate max-w-[80px]">
                      {slot.foundBy.nickname}
                    </span>
                  </div>
                ) : (
                  <span className="text-slate-500 text-[10px]">بانتظار الإجابة</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* All completed celebratory strip */}
        {isAllCompleted && (
          <div className="mt-4 p-3 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-center flex items-center justify-center gap-3">
            <Award className="w-6 h-6 text-amber-400" />
            <span className="font-bold text-amber-300 text-sm sm:text-base">
              كفو يا أبطال البث! تم حل الـ 10 عناصر بنجاح! 🏆
            </span>
            <button
              onClick={onOpenHonorBoard}
              className="px-3 py-1 bg-amber-400 text-slate-950 font-bold rounded-xl text-xs hover:bg-amber-300 transition-colors"
            >
              لوحة الشرف
            </button>
          </div>
        )}
      </div>

      {/* Standard Bottom Game Controls Bar */}
      <StandardGameControls
        gameId="write_things"
        gameTitle="اكتب_10_اشياء"
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        onPrev={handlePrev}
        onNext={handleNext}
        onShowHint={handleShowHint}
        onShowAnswer={handleShowAnswer}
        isWriteThings={true}
        onQuestionsUploaded={(newItems) => {
          setQuestions(newItems);
          setCurrentIndex(0);
        }}
      />
    </div>
  );
};
