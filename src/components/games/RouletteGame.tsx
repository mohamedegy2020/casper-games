import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, RotateCw, Sparkles, Award } from 'lucide-react';
import { QuestionItem } from '../../types';
import { DEFAULT_QUESTIONS } from '../../services/excelService';
import { StandardGameControls } from '../StandardGameControls';
import { useTikTokLive } from '../../context/TikTokLiveContext';
import { checkAnswerMatch } from '../../utils/arabic';
import { soundEffects } from '../../services/soundEffects';

interface RouletteGameProps {
  onBackToLobby: () => void;
  onOpenHonorBoard: () => void;
}

export const RouletteGame: React.FC<RouletteGameProps> = ({ onBackToLobby, onOpenHonorBoard }) => {
  const [questions, setQuestions] = useState<QuestionItem[]>(DEFAULT_QUESTIONS.roulette);
  const [wheelSlots, setWheelSlots] = useState<number[]>([1, 2, 3, 4, 5, 6, 7, 8]);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState<number | null>(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [rotationAngle, setRotationAngle] = useState(0);

  const [isAnswered, setIsAnswered] = useState(false);
  const [lastWinnerName, setLastWinnerName] = useState<string | null>(null);

  const currentQIndex = selectedSlotIndex !== null ? (selectedSlotIndex % questions.length) : 0;
  const currentQ = questions[currentQIndex] || questions[0];

  const {
    comments,
    recentGifts,
    isFollowerOnly,
    triggerHint,
    setWinnerCelebration,
    addGamePoints,
    winnerCelebration,
    gameResetKey
  } = useTikTokLive();

  const answeredRef = useRef(false);
  answeredRef.current = isAnswered;

  useEffect(() => {
    setIsAnswered(false);
    setLastWinnerName(null);
  }, [selectedSlotIndex]);

  useEffect(() => {
    setSelectedSlotIndex(0);
    setIsAnswered(false);
    setLastWinnerName(null);
    setWheelSlots([1, 2, 3, 4, 5, 6, 7, 8]);
    setRotationAngle(0);
  }, [gameResetKey]);

  // Comments matching
  useEffect(() => {
    if (answeredRef.current || !currentQ || winnerCelebration || isSpinning) return;

    if (comments.length > 0) {
      const latestComment = comments[0];
      if (isFollowerOnly && !latestComment.user.isFollower) return;

      const isCorrect = checkAnswerMatch(
        latestComment.text,
        currentQ.answer,
        currentQ.extraAnswers
      );

      if (isCorrect) {
        setIsAnswered(true);
        setLastWinnerName(latestComment.user.nickname);
        addGamePoints(latestComment.user.username, 10);
        setWinnerCelebration({
          winner: latestComment.user,
          gameTitle: 'عجلة الروليت',
          questionText: currentQ.question,
          correctAnswer: currentQ.answer,
          isGiftAnswer: false
        });

        // Replace number in wheel after answering
        if (selectedSlotIndex !== null) {
          setWheelSlots(prev => {
            const next = [...prev];
            next[selectedSlotIndex] = (next[selectedSlotIndex] % questions.length) + 1;
            return next;
          });
        }
      }
    }
  }, [comments, currentQ, isFollowerOnly, addGamePoints, setWinnerCelebration, winnerCelebration, isSpinning, selectedSlotIndex, questions.length]);

  // Gifts
  useEffect(() => {
    if (answeredRef.current || !currentQ || winnerCelebration || isSpinning) return;

    if (recentGifts.length > 0) {
      const latestGift = recentGifts[0];
      const timeDiff = Date.now() - latestGift.timestamp;
      if (timeDiff < 2000) {
        if (latestGift.giftType === 'rose' || latestGift.giftType === 'coin') {
          triggerHint(currentQ.hint || 'تلميح: السؤال مأخوذ من عجلة الحظ والروليت!');
        } else if (latestGift.giftType === 'finger_heart') {
          setIsAnswered(true);
          setLastWinnerName(latestGift.user.nickname);
          addGamePoints(latestGift.user.username, 10);
          setWinnerCelebration({
            winner: latestGift.user,
            gameTitle: 'عجلة الروليت',
            questionText: currentQ.question,
            correctAnswer: currentQ.answer,
            isGiftAnswer: true
          });
        }
      }
    }
  }, [recentGifts, currentQ, triggerHint, addGamePoints, setWinnerCelebration, winnerCelebration, isSpinning]);

  const spinWheel = () => {
    if (isSpinning) return;
    soundEffects.playWheelTick();
    setIsSpinning(true);
    setIsAnswered(false);

    // Calculate random rotations: 4 to 7 full circles + slot offset
    const randomSlot = Math.floor(Math.random() * wheelSlots.length);
    const degreesPerSlot = 360 / wheelSlots.length;
    const extraSpins = 360 * (5 + Math.floor(Math.random() * 3));
    const targetAngle = rotationAngle + extraSpins + (randomSlot * degreesPerSlot);

    setRotationAngle(targetAngle);

    // Audio ticking simulation
    let ticks = 0;
    const tickInterval = setInterval(() => {
      soundEffects.playWheelTick();
      ticks++;
      if (ticks >= 15) clearInterval(tickInterval);
    }, 200);

    setTimeout(() => {
      setIsSpinning(false);
      setSelectedSlotIndex(randomSlot);
      soundEffects.playVictory();
    }, 3200);
  };

  const handleNext = () => {
    spinWheel();
  };

  const handlePrev = () => {
    setSelectedSlotIndex(prev => (prev === null || prev <= 0 ? wheelSlots.length - 1 : prev - 1));
  };

  const handleShowHint = () => {
    triggerHint(currentQ.hint || 'تلميح: ركّز في صيغة السؤال المختار!');
  };

  const handleShowAnswer = () => {
    soundEffects.playVictory();
    setIsAnswered(true);
    setLastWinnerName('مقدم البث');
    setWinnerCelebration({
      winner: {
        id: 'creator',
        username: 'مبدع_البث',
        nickname: 'مقدم البث',
        avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=creator',
        isFollower: true,
        taps: 0,
        shares: 0,
        reposts: 0,
        gamePoints: 0
      },
      gameTitle: 'عجلة الروليت',
      questionText: currentQ.question,
      correctAnswer: currentQ.answer,
      isGiftAnswer: false
    });
  };

  const slotColors = [
    '#f43f5e', '#8b5cf6', '#06b6d4', '#10b981', 
    '#f59e0b', '#ec4899', '#3b82f6', '#14b8a6'
  ];

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
          <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <RotateCw className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black font-display text-white">
              لعبة عجلة الروليت
            </h2>
            <p className="text-[11px] text-slate-400">
              أدر الروليت واكشف السؤال المختار للجمهور
            </p>
          </div>
        </div>
      </div>

      {/* Main Wheel & Question Stage */}
      <div className="my-auto py-2 flex flex-col lg:flex-row items-center justify-center gap-6 sm:gap-10">
        {/* Roulette Wheel Container */}
        <div className="flex flex-col items-center">
          <div className="relative w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center">
            {/* Wheel Pointer Arrow at Top */}
            <div className="absolute -top-3 z-20 w-0 h-0 border-x-8 border-x-transparent border-t-[18px] border-t-amber-400 drop-shadow-md" />

            {/* Rotating Wheel Disc */}
            <div
              className="w-full h-full rounded-full border-4 border-amber-400/80 shadow-[0_0_35px_rgba(168,85,247,0.35)] relative overflow-hidden transition-transform ease-out"
              style={{
                transform: `rotate(${rotationAngle}deg)`,
                transitionDuration: isSpinning ? '3.2s' : '0.4s'
              }}
            >
              {wheelSlots.map((num, idx) => {
                const angle = (idx * 360) / wheelSlots.length;
                return (
                  <div
                    key={idx}
                    className="absolute inset-0 flex items-start justify-center pt-2 select-none"
                    style={{
                      transform: `rotate(${angle}deg)`,
                      transformOrigin: 'center center'
                    }}
                  >
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-xs font-mono shadow-md border border-white/30"
                      style={{ backgroundColor: slotColors[idx % slotColors.length] }}
                    >
                      {num}
                    </div>
                  </div>
                );
              })}

              {/* Center Hub */}
              <div className="absolute inset-0 m-auto w-14 h-14 rounded-full bg-slate-900 border-4 border-amber-400 shadow-inner flex items-center justify-center">
                <span className="text-base">🎯</span>
              </div>
            </div>
          </div>

          {/* Spin Wheel Button */}
          <button
            onClick={spinWheel}
            disabled={isSpinning}
            className="mt-4 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-sm shadow-lg shadow-purple-500/25 active:scale-95 disabled:opacity-50 transition-all cursor-pointer flex items-center gap-2"
          >
            <RotateCw className={`w-4 h-4 ${isSpinning ? 'animate-spin' : ''}`} />
            <span>تدوير الروليت 🎲</span>
          </button>
        </div>

        {/* Selected Question Card */}
        <div className="w-full max-w-md p-6 rounded-3xl bg-slate-900/90 border-2 border-purple-500/30 shadow-xl flex flex-col justify-between min-h-[220px]">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-purple-300 bg-purple-500/10 px-2.5 py-0.5 rounded-full border border-purple-500/20">
                سؤال رقم #{wheelSlots[selectedSlotIndex || 0]}
              </span>
              <span className="text-xs text-slate-400">
                {isSpinning ? 'جاري دوران العجلة...' : 'في انتظار الإجابة'}
              </span>
            </div>

            <p className="text-lg sm:text-xl font-extrabold text-white font-display my-3 leading-relaxed">
              {currentQ.question}
            </p>
          </div>

          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
            {lastWinnerName ? (
              <span className="text-emerald-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>أول إجابة صحيحة بواسطة: {lastWinnerName}</span>
              </span>
            ) : (
              <span className="text-slate-400">
                أول إجابة صحيحة بالتعليقات تفوز فوراً!
              </span>
            )}

            <button
              onClick={onOpenHonorBoard}
              className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
            >
              <Award className="w-3.5 h-3.5" />
              <span>لوحة الشرف</span>
            </button>
          </div>
        </div>
      </div>

      {/* Standard Bottom Game Controls Bar */}
      <StandardGameControls
        gameId="roulette"
        gameTitle="عجلة_الروليت"
        currentIndex={currentQIndex}
        totalQuestions={questions.length}
        onPrev={handlePrev}
        onNext={handleNext}
        onShowHint={handleShowHint}
        onShowAnswer={handleShowAnswer}
        onQuestionsUploaded={(newItems) => {
          setQuestions(newItems);
          setSelectedSlotIndex(0);
        }}
      />
    </div>
  );
};
