import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Shuffle, Sparkles } from 'lucide-react';
import { QuestionItem } from '../../types';
import { DEFAULT_QUESTIONS } from '../../services/excelService';
import { StandardGameControls } from '../StandardGameControls';
import { useTikTokLive } from '../../context/TikTokLiveContext';
import { checkAnswerMatch } from '../../utils/arabic';
import { soundEffects } from '../../services/soundEffects';

interface ScrambledLettersGameProps {
  onBackToLobby: () => void;
}

export const ScrambledLettersGame: React.FC<ScrambledLettersGameProps> = ({ onBackToLobby }) => {
  const [questions, setQuestions] = useState<QuestionItem[]>(DEFAULT_QUESTIONS.scrambled_letters);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentQ = questions[currentIndex] || questions[0];

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

  // Track if current question already has a winner
  const [isAnswered, setIsAnswered] = useState(false);
  const answeredRef = useRef(false);
  answeredRef.current = isAnswered;
  const lastProcessedCommentIdRef = useRef<string | null>(null);

  // Reset answered status on question change or gameResetKey
  useEffect(() => {
    setIsAnswered(false);
  }, [currentIndex]);

  useEffect(() => {
    setCurrentIndex(0);
    setIsAnswered(false);
  }, [gameResetKey]);

  // Listen to incoming comments for answer matching
  useEffect(() => {
    if (answeredRef.current || !currentQ || winnerCelebration || comments.length === 0) return;

    for (const comment of comments) {
      if (lastProcessedCommentIdRef.current === comment.id) {
        break; // already checked up to this point
      }

      // Check follower condition if active
      if (isFollowerOnly && !comment.user.isFollower) {
        continue;
      }

      const isCorrect = checkAnswerMatch(
        comment.text,
        currentQ.answer,
        currentQ.extraAnswers
      );

      if (isCorrect) {
        lastProcessedCommentIdRef.current = comment.id;
        setIsAnswered(true);
        addGamePoints(comment.user.username, 10);
        setWinnerCelebration({
          winner: comment.user,
          gameTitle: 'لعبة الحروف المبعثرة',
          questionText: currentQ.question,
          correctAnswer: currentQ.answer,
          isGiftAnswer: false
        });
        break;
      }
    }

    if (comments.length > 0) {
      lastProcessedCommentIdRef.current = comments[0].id;
    }
  }, [comments, currentQ, isFollowerOnly, addGamePoints, setWinnerCelebration, winnerCelebration]);

  // Listen for Rose / Coin (Hint) & Finger Heart (Answer)
  useEffect(() => {
    if (answeredRef.current || !currentQ || winnerCelebration) return;

    if (recentGifts.length > 0) {
      const latestGift = recentGifts[0];
      const timeDiff = Date.now() - latestGift.timestamp;
      if (timeDiff < 2000) {
        if (latestGift.giftType === 'rose' || latestGift.giftType === 'coin') {
          triggerHint(currentQ.hint || 'تلميح: حاول تجميع الحروف لتكوين كلمة مفيدة!');
        } else if (latestGift.giftType === 'finger_heart') {
          setIsAnswered(true);
          addGamePoints(latestGift.user.username, 10);
          setWinnerCelebration({
            winner: latestGift.user,
            gameTitle: 'لعبة الحروف المبعثرة',
            questionText: currentQ.question,
            correctAnswer: currentQ.answer,
            isGiftAnswer: true
          });
        }
      }
    }
  }, [recentGifts, currentQ, triggerHint, addGamePoints, setWinnerCelebration, winnerCelebration]);

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
    triggerHint(currentQ.hint || 'تلميح: رتّب الحروف المعروضة لتصل للكلمة الصحيحة!');
  };

  const handleShowAnswer = () => {
    soundEffects.playVictory();
    setIsAnswered(true);
    setWinnerCelebration({
      winner: {
        id: 'creator',
        username: 'مبدع_البث',
        nickname: 'مقدم البث (كاسبر)',
        avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=creator',
        isFollower: true,
        taps: 0,
        shares: 0,
        reposts: 0,
        gamePoints: 0
      },
      gameTitle: 'لعبة الحروف المبعثرة',
      questionText: currentQ.question,
      correctAnswer: currentQ.answer,
      isGiftAnswer: false
    });
  };

  // Split scrambled letters into individual visual tiles
  const letters = currentQ.question.split(/\s+/).filter(Boolean);

  return (
    <div className="flex-1 flex flex-col justify-between p-3 sm:p-6 max-w-4xl mx-auto w-full">
      {/* Game Header Bar */}
      <div className="flex items-center justify-between gap-3 mb-4">
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
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Shuffle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black font-display text-white">
              لعبة الحروف المبعثرة
            </h2>
            <p className="text-[11px] text-slate-400">
              أعد ترتيب الحروف لتكوين الكلمة الصحيحة
            </p>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage */}
      <div className="my-auto py-6 flex flex-col items-center justify-center text-center">
        <span className="text-xs font-semibold text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 mb-4 inline-flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span>أول من يكتب الكلمة الصحيحة بالتعليقات يفوز 🏆</span>
        </span>

        {/* Question Letters Tiles */}
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 my-4 max-w-lg">
          {letters.map((letter, idx) => (
            <div
              key={idx}
              className="w-14 h-16 sm:w-20 sm:h-22 rounded-2xl bg-gradient-to-b from-slate-800 via-slate-850 to-slate-900 border-2 border-indigo-500/50 shadow-[0_8px_20px_rgba(99,102,241,0.25)] flex items-center justify-center text-3xl sm:text-4xl font-black text-indigo-200 font-display select-none transition-transform hover:-translate-y-1"
            >
              {letter}
            </div>
          ))}
        </div>

        {/* Revealed state indicator if completed */}
        {isAnswered && (
          <div className="mt-4 px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-lg animate-in zoom-in-95">
            الإجابة: {currentQ.answer}
          </div>
        )}
      </div>

      {/* Standard Bottom Game Controls Bar */}
      <StandardGameControls
        gameId="scrambled_letters"
        gameTitle="الحروف المبعثرة"
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        onPrev={handlePrev}
        onNext={handleNext}
        onShowHint={handleShowHint}
        onShowAnswer={handleShowAnswer}
        onQuestionsUploaded={(newItems) => {
          setQuestions(newItems);
          setCurrentIndex(0);
        }}
      />
    </div>
  );
};
