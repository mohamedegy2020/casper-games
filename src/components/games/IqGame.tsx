import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, BrainCircuit, Sparkles } from 'lucide-react';
import { QuestionItem } from '../../types';
import { DEFAULT_QUESTIONS } from '../../services/excelService';
import { StandardGameControls } from '../StandardGameControls';
import { useTikTokLive } from '../../context/TikTokLiveContext';
import { checkAnswerMatch } from '../../utils/arabic';
import { soundEffects } from '../../services/soundEffects';

interface IqGameProps {
  onBackToLobby: () => void;
}

export const IqGame: React.FC<IqGameProps> = ({ onBackToLobby }) => {
  const [questions, setQuestions] = useState<QuestionItem[]>(DEFAULT_QUESTIONS.iq_game);
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

  const [isAnswered, setIsAnswered] = useState(false);
  const answeredRef = useRef(false);
  answeredRef.current = isAnswered;
  const lastProcessedCommentIdRef = useRef<string | null>(null);

  useEffect(() => {
    setIsAnswered(false);
  }, [currentIndex]);

  useEffect(() => {
    setCurrentIndex(0);
    setIsAnswered(false);
  }, [gameResetKey]);

  useEffect(() => {
    if (answeredRef.current || !currentQ || winnerCelebration || comments.length === 0) return;

    for (const comment of comments) {
      if (lastProcessedCommentIdRef.current === comment.id) {
        break;
      }

      if (isFollowerOnly && !comment.user.isFollower) continue;

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
          gameTitle: 'تحدي الذكاء وسرعة البديهة',
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

  useEffect(() => {
    if (answeredRef.current || !currentQ || winnerCelebration) return;

    if (recentGifts.length > 0) {
      const latestGift = recentGifts[0];
      const timeDiff = Date.now() - latestGift.timestamp;
      if (timeDiff < 2000) {
        if (latestGift.giftType === 'rose' || latestGift.giftType === 'coin') {
          triggerHint(currentQ.hint || 'تلميح: فكّر خارج الصندوق بدقة!');
        } else if (latestGift.giftType === 'finger_heart') {
          setIsAnswered(true);
          addGamePoints(latestGift.user.username, 10);
          setWinnerCelebration({
            winner: latestGift.user,
            gameTitle: 'تحدي الذكاء وسرعة البديهة',
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
    triggerHint(currentQ.hint || 'تلميح: انتبه للخدعة اللغوية أو الرقمية في السؤال!');
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
      gameTitle: 'تحدي الذكاء',
      questionText: currentQ.question,
      correctAnswer: currentQ.answer,
      isGiftAnswer: false
    });
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-3 sm:p-6 max-w-4xl mx-auto w-full">
      {/* Header */}
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
          <div className="p-2 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black font-display text-white">
              لعبة الذكاء وسرعة البديهة
            </h2>
            <p className="text-[11px] text-slate-400">
              أسئلة ذكاء تختبر سرعة البديهة والمنطق
            </p>
          </div>
        </div>
      </div>

      {/* Main IQ Card */}
      <div className="my-auto py-6 flex flex-col items-center justify-center text-center">
        <span className="text-xs font-semibold text-cyan-300 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20 mb-4 inline-flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>تحدي أذكياء البث المباشر 🧠⚡</span>
        </span>

        <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/90 border-2 border-cyan-500/40 shadow-[0_10px_35px_rgba(6,182,212,0.2)] max-w-2xl w-full">
          <div className="text-xs font-mono text-cyan-400/80 mb-3">
            سؤال ذكاء رقم #{currentIndex + 1}
          </div>
          <p className="text-xl sm:text-3xl font-extrabold text-white leading-relaxed font-display">
            "{currentQ.question}"
          </p>
        </div>

        {isAnswered && (
          <div className="mt-4 px-5 py-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-bold text-lg animate-in zoom-in-95">
            الإجابة الصحيحة: {currentQ.answer}
          </div>
        )}
      </div>

      {/* Controls */}
      <StandardGameControls
        gameId="iq_game"
        gameTitle="لعبة_الذكاء"
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
