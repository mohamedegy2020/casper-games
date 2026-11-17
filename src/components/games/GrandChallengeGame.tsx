import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArrowRight, Hexagon, Timer, Trophy, Users, RotateCcw, Zap } from 'lucide-react';
import { QuestionItem, User } from '../../types';
import { DEFAULT_QUESTIONS } from '../../services/excelService';
import { StandardGameControls } from '../StandardGameControls';
import { useTikTokLive } from '../../context/TikTokLiveContext';
import { checkAnswerMatch } from '../../utils/arabic';
import { soundEffects } from '../../services/soundEffects';

interface GrandChallengeGameProps {
  onBackToLobby: () => void;
}

type ChallengePhase =
  | 'qualifying'
  | 'transitioning'
  | 'speed_challenge'
  | 'speed_timeout'
  | 'speed_won';

const SPEED_DURATION_SECONDS = 15;
const HEX_CLIP_PATH = 'polygon(50% 0%, 93.3% 25%, 93.3% 75%, 50% 100%, 6.7% 75%, 6.7% 25%)';

export const GrandChallengeGame: React.FC<GrandChallengeGameProps> = ({ onBackToLobby }) => {
  const [questions, setQuestions] = useState<QuestionItem[]>(DEFAULT_QUESTIONS.grand_challenge);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [phase, setPhase] = useState<ChallengePhase>('qualifying');
  const [honeycombPlayers, setHoneycombPlayers] = useState<User[]>([]);
  const [speedTimeLeft, setSpeedTimeLeft] = useState<number>(SPEED_DURATION_SECONDS);
  const [speedWinner, setSpeedWinner] = useState<User | null>(null);
  const [revealedAnswer, setRevealedAnswer] = useState<boolean>(false);
  const [failedAvatars, setFailedAvatars] = useState<Record<string, boolean>>({});

  const currentQ = questions[currentIndex] || questions[0];

  const {
    comments,
    recentGifts,
    isFollowerOnly,
    triggerHint,
    setWinnerCelebration,
    addGamePoints,
    winnerCelebration,
    gameResetKey,
    victoryNextSignal
  } = useTikTokLive();

  // Refs to ensure clean, non-stale comment/gift tracking across phases
  const phaseStartTimeRef = useRef<number>(Date.now());
  const processedCommentIdsRef = useRef<Set<string>>(new Set());
  const lastProcessedGiftIdRef = useRef<string | null>(
    recentGifts.length > 0 ? recentGifts[0].id : null
  );
  const transitionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialVictorySignalRef = useRef<number>(victoryNextSignal);
  const initialResetKeyRef = useRef<number>(gameResetKey);

  // Mark existing comments as already seen on initial mount so pre-game chat doesn't trigger
  useEffect(() => {
    comments.forEach(c => processedCommentIdsRef.current.add(c.id));
    phaseStartTimeRef.current = Date.now();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetCommentCursor = useCallback((latestComments: typeof comments) => {
    phaseStartTimeRef.current = Date.now();
    latestComments.forEach(c => processedCommentIdsRef.current.add(c.id));
  }, []);

  const clearPendingTransition = useCallback(() => {
    if (transitionTimerRef.current) {
      clearTimeout(transitionTimerRef.current);
      transitionTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => clearPendingTransition();
  }, [clearPendingTransition]);

  // Move to next question & empty all 4 honeycomb cells to restart from Phase 1
  const startNewRoundAt = useCallback(
    (nextIdx: number) => {
      clearPendingTransition();
      setCurrentIndex(nextIdx);
      setHoneycombPlayers([]);
      setSpeedWinner(null);
      setRevealedAnswer(false);
      setSpeedTimeLeft(SPEED_DURATION_SECONDS);
      setPhase('qualifying');
      resetCommentCursor(comments);
    },
    [clearPendingTransition, comments, resetCommentCursor]
  );

  // Advance round when VictoryModal's "التالي (السؤال التالي)" button is clicked
  useEffect(() => {
    if (victoryNextSignal !== initialVictorySignalRef.current) {
      initialVictorySignalRef.current = victoryNextSignal;
      const nextIdx = questions.length > 1 ? (currentIndex + 1) % questions.length : 0;
      startNewRoundAt(nextIdx);
    }
  }, [victoryNextSignal, currentIndex, questions.length, startNewRoundAt]);

  // Reset entire game when "تصفير اللعبة والبدء من الأول" is clicked in Settings
  useEffect(() => {
    if (gameResetKey !== initialResetKeyRef.current) {
      initialResetKeyRef.current = gameResetKey;
      startNewRoundAt(0);
    }
  }, [gameResetKey, startNewRoundAt]);

  // Transition helper into Phase 2 (15-second speed question)
  const enterSpeedPhase = useCallback(() => {
    clearPendingTransition();
    setPhase('transitioning');
    soundEffects.playVictory();

    transitionTimerRef.current = setTimeout(() => {
      setCurrentIndex(prev => (questions.length > 1 ? (prev + 1) % questions.length : 0));
      setSpeedTimeLeft(SPEED_DURATION_SECONDS);
      setSpeedWinner(null);
      setRevealedAnswer(false);
      setPhase('speed_challenge');
      phaseStartTimeRef.current = Date.now();
      comments.forEach(c => processedCommentIdsRef.current.add(c.id));
      soundEffects.playHint();
    }, 1400);
  }, [clearPendingTransition, questions.length, comments]);

  // 15-second countdown timer during Speed Challenge
  useEffect(() => {
    if (phase !== 'speed_challenge' || winnerCelebration) return;

    const timer = setInterval(() => {
      setSpeedTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setPhase('speed_timeout');
          setRevealedAnswer(true);
          soundEffects.playStamp();
          return 0;
        }
        const nextVal = prev - 1;
        if (nextVal <= 5) {
          soundEffects.playWheelTick();
        }
        return nextVal;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [phase, winnerCelebration]);

  // Process incoming live TikTok comments
  useEffect(() => {
    if (!currentQ || winnerCelebration || comments.length === 0) return;
    if (phase !== 'qualifying' && phase !== 'speed_challenge') return;

    const unprocessed = comments.filter(
      c => !processedCommentIdsRef.current.has(c.id) && c.timestamp >= phaseStartTimeRef.current - 500
    );

    if (unprocessed.length === 0) return;

    // Mark seen immediately and process chronologically (oldest first)
    unprocessed.forEach(c => processedCommentIdsRef.current.add(c.id));
    const chronological = [...unprocessed].reverse();

    if (phase === 'qualifying') {
      const updatedPlayers = [...honeycombPlayers];
      let addedAny = false;

      for (const comment of chronological) {
        if (updatedPlayers.length >= 4) break;
        if (isFollowerOnly && !comment.user.isFollower) continue;

        const alreadyQualified = updatedPlayers.some(
          p => p.username.toLowerCase() === comment.user.username.toLowerCase()
        );
        if (alreadyQualified) continue;

        const isCorrect = checkAnswerMatch(
          comment.text,
          currentQ.answer,
          currentQ.extraAnswers
        );

        if (isCorrect) {
          updatedPlayers.push(comment.user);
          addedAny = true;
        }
      }

      if (addedAny) {
        setHoneycombPlayers(updatedPlayers);
        if (updatedPlayers.length < 4) {
          soundEffects.playHint();
        } else if (updatedPlayers.length === 4) {
          enterSpeedPhase();
        }
      }
    } else if (phase === 'speed_challenge') {
      for (const comment of chronological) {
        if (isFollowerOnly && !comment.user.isFollower) continue;

        // Accept answers ONLY from the 4 players inside the honeycomb cells
        const isHoneycombContender = honeycombPlayers.some(
          p => p.username.toLowerCase() === comment.user.username.toLowerCase()
        );
        if (!isHoneycombContender) continue;

        const isCorrect = checkAnswerMatch(
          comment.text,
          currentQ.answer,
          currentQ.extraAnswers
        );

        if (isCorrect) {
          setPhase('speed_won');
          setSpeedWinner(comment.user);
          setRevealedAnswer(true);
          addGamePoints(comment.user.username, 10);
          setWinnerCelebration({
            winner: comment.user,
            gameTitle: 'لعبة التحدي الكبرى',
            questionText: currentQ.question,
            correctAnswer: currentQ.answer,
            isGiftAnswer: false
          });
          break;
        }
      }
    }
  }, [
    comments,
    currentQ,
    phase,
    honeycombPlayers,
    isFollowerOnly,
    winnerCelebration,
    addGamePoints,
    setWinnerCelebration,
    enterSpeedPhase
  ]);

  // Listen for Rose / Coin (Hint) & Finger Heart (Reveal Answer + Victory)
  useEffect(() => {
    if (!currentQ || winnerCelebration || recentGifts.length === 0) return;

    const latestGift = recentGifts[0];
    if (latestGift.id === lastProcessedGiftIdRef.current) return;

    const timeDiff = Date.now() - latestGift.timestamp;
    if (timeDiff > 2500) return;

    lastProcessedGiftIdRef.current = latestGift.id;

    if (latestGift.giftType === 'rose' || latestGift.giftType === 'coin') {
      triggerHint(currentQ.hint || 'تلميح: ركّز في السؤال واكتب الإجابة الصحيحة بسرعة!');
    } else if (latestGift.giftType === 'finger_heart') {
      clearPendingTransition();
      setPhase('speed_won');
      setRevealedAnswer(true);
      addGamePoints(latestGift.user.username, 10);
      setWinnerCelebration({
        winner: latestGift.user,
        gameTitle: 'لعبة التحدي الكبرى',
        questionText: currentQ.question,
        correctAnswer: currentQ.answer,
        isGiftAnswer: true
      });
    }
  }, [
    recentGifts,
    currentQ,
    winnerCelebration,
    triggerHint,
    addGamePoints,
    setWinnerCelebration,
    clearPendingTransition
  ]);

  const handleNext = () => {
    const nextIdx = currentIndex < questions.length - 1 ? currentIndex + 1 : 0;
    startNewRoundAt(nextIdx);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      startNewRoundAt(currentIndex - 1);
    }
  };

  const handleShowHint = () => {
    triggerHint(currentQ.hint || 'تلميح: اقرأ السؤال جيداً وكن من الأسرع!');
  };

  const handleShowAnswer = () => {
    clearPendingTransition();
    soundEffects.playVictory();
    setPhase('speed_won');
    setRevealedAnswer(true);
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
      gameTitle: 'لعبة التحدي الكبرى',
      questionText: currentQ.question,
      correctAnswer: currentQ.answer,
      isGiftAnswer: false
    });
  };

  const isSpeedStage = phase === 'speed_challenge' || phase === 'speed_timeout' || phase === 'speed_won';
  const timerProgressPct = Math.max(0, Math.min(100, (speedTimeLeft / SPEED_DURATION_SECONDS) * 100));

  return (
    <div className="flex-1 flex flex-col justify-between p-3 sm:p-6 max-w-5xl mx-auto w-full gap-4">
      {/* Top Game Header */}
      <div className="flex items-center justify-between gap-3">
        <button
          onClick={() => {
            soundEffects.playClick();
            onBackToLobby();
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 text-xs font-bold transition-colors cursor-pointer shrink-0"
        >
          <ArrowRight className="w-4 h-4" />
          <span>الرجوع للرئيسية</span>
        </button>

        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Hexagon className="w-5 h-5" />
          </div>
          <div className="text-right">
            <h2 className="text-base sm:text-lg font-black font-display text-white">
              لعبة التحدي الكبرى
            </h2>
            <p className="text-[11px] text-slate-400">
              أول 4 إجابات صحيحة تدخل خلايا النحل ثم سؤال سرعة 15 ثانية
            </p>
          </div>
        </div>
      </div>

      {/* Main Arena */}
      <div className="my-auto flex flex-col items-center gap-5 w-full">
        {/* Phase Status Strip & 15s Speed Timer */}
        <div className="w-full max-w-3xl flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-slate-900/90 border border-slate-800">
          <div className="flex items-center gap-2.5 text-sm font-bold">
            {phase === 'qualifying' && (
              <>
                <Users className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-slate-200">
                  المرحلة الأولى: التصفيات — اكتب الإجابة في التعليقات لحجز خلية نحل
                </span>
                <span className="text-amber-300 font-mono tabular-nums">
                  ({honeycombPlayers.length} / 4)
                </span>
              </>
            )}

            {phase === 'transitioning' && (
              <>
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-amber-300">
                  اكتملت خلايا النحل الأربع! استعدوا لسؤال السرعة لمدة 15 ثانية...
                </span>
              </>
            )}

            {phase === 'speed_challenge' && (
              <>
                <Zap className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="text-rose-200">
                  المرحلة الثانية: سؤال السرعة! الإجابة مقبولة فقط من أبطال خلايا النحل الأربع
                </span>
              </>
            )}

            {phase === 'speed_timeout' && (
              <>
                <Timer className="w-4 h-4 text-rose-400 shrink-0" />
                <span className="text-rose-300">
                  انتهت الـ 15 ثانية دون إجابة صحيحة من خلايا النحل
                </span>
              </>
            )}

            {phase === 'speed_won' && (
              <>
                <Trophy className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-emerald-300">
                  حُسم التحدي! اضغط التالي للانتقال وتفريغ خلايا النحل لجولة جديدة
                </span>
              </>
            )}
          </div>

          {/* 15s Countdown Indicator */}
          {isSpeedStage && (
            <div
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border font-mono font-black text-base tabular-nums shrink-0 ${
                speedTimeLeft <= 5 && phase === 'speed_challenge'
                  ? 'bg-rose-500/20 border-rose-500/60 text-rose-300'
                  : 'bg-amber-500/15 border-amber-500/40 text-amber-300'
              }`}
            >
              <Timer className="w-4 h-4" />
              <span>{speedTimeLeft} ث</span>
            </div>
          )}
        </div>

        {/* Question Display Card */}
        <div
          className={`relative w-full max-w-3xl p-6 sm:p-8 rounded-3xl bg-slate-900/95 border-2 transition-colors text-center shadow-2xl overflow-hidden ${
            phase === 'speed_challenge'
              ? 'border-rose-500/60 shadow-[0_12px_40px_rgba(244,63,94,0.2)]'
              : 'border-amber-500/40 shadow-[0_12px_40px_rgba(245,158,11,0.12)]'
          }`}
        >
          {/* Progress Bar for 15s Speed Question */}
          {phase === 'speed_challenge' && (
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-800">
              <div
                className={`h-full transition-all duration-1000 ease-linear ${
                  speedTimeLeft <= 5 ? 'bg-rose-500' : 'bg-amber-400'
                }`}
                style={{ width: `${timerProgressPct}%` }}
              />
            </div>
          )}

          <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-400 mb-3 tabular-nums">
            <span>سؤال رقم #{currentIndex + 1}</span>
            <span aria-hidden="true">·</span>
            <span className={phase === 'speed_challenge' ? 'text-rose-400 font-bold' : 'text-amber-400 font-bold'}>
              {phase === 'speed_challenge' || phase === 'speed_timeout'
                ? 'سؤال السرعة (15 ثانية)'
                : 'سؤال التأهل لخلايا النحل'}
            </span>
          </div>

          <p className="text-xl sm:text-3xl font-extrabold text-white leading-relaxed font-display text-balance">
            {currentQ.question}
          </p>

          {/* Revealed answer when timed out or won */}
          {revealedAnswer && (
            <div className="mt-5 inline-flex flex-col sm:flex-row items-center gap-3 px-5 py-2.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/40 text-emerald-300 font-bold text-base">
              <span>الإجابة الصحيحة: {currentQ.answer}</span>
              {phase === 'speed_timeout' && (
                <button
                  onClick={() => {
                    soundEffects.playClick();
                    handleNext();
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>السؤال التالي وتفريغ الخلايا</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* 4 Independent Honeycomb Cells */}
        <div className="w-full max-w-3xl">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-3 px-1">
            <span className="font-bold text-amber-300 flex items-center gap-1.5">
              <Hexagon className="w-4 h-4 text-amber-400" />
              <span>خلايا النحل الأربع (المتأهلون لسؤال السرعة)</span>
            </span>
            <span className="font-mono tabular-nums">
              {honeycombPlayers.length} / 4 مكتملة
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 items-start justify-items-center py-2">
            {[0, 1, 2, 3].map((slotIdx) => {
              const player = honeycombPlayers[slotIdx];
              const isWinner =
                Boolean(player && speedWinner) &&
                player.username.toLowerCase() === speedWinner?.username.toLowerCase();
              const isActiveContender = Boolean(player) && phase === 'speed_challenge';
              const avatarBroken = player ? failedAvatars[player.username] : false;

              return (
                <div
                  key={slotIdx}
                  className="flex flex-col items-center gap-2.5 w-full max-w-[155px]"
                >
                  {/* Independent Honeycomb Hexagon Shape */}
                  <div className="relative w-28 h-32 sm:w-32 sm:h-36 flex items-center justify-center">
                    {/* Outer Hex Frame SVG */}
                    <svg
                      viewBox="0 0 100 115"
                      className="absolute inset-0 w-full h-full drop-shadow-[0_6px_18px_rgba(245,158,11,0.18)]"
                      aria-hidden="true"
                    >
                      <polygon
                        points="50,2 96,28.5 96,86.5 50,113 4,86.5 4,28.5"
                        fill={player ? 'rgba(245, 158, 11, 0.14)' : 'rgba(15, 23, 42, 0.85)'}
                        stroke={
                          isWinner
                            ? '#10b981'
                            : isActiveContender
                            ? '#fb7185'
                            : player
                            ? '#f59e0b'
                            : '#334155'
                        }
                        strokeWidth={player ? '3.5' : '2.2'}
                        strokeDasharray={player ? undefined : '5 3'}
                      />
                    </svg>

                    {/* Inner Hexagon Content */}
                    <div
                      className="relative w-[84%] h-[84%] flex items-center justify-center overflow-hidden bg-slate-900"
                      style={{ clipPath: HEX_CLIP_PATH }}
                    >
                      {player ? (
                        !avatarBroken && player.avatarUrl ? (
                          <img
                            src={player.avatarUrl}
                            alt={player.nickname}
                            referrerPolicy="no-referrer"
                            onError={() =>
                              setFailedAvatars(prev => ({
                                ...prev,
                                [player.username]: true
                              }))
                            }
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-500 to-orange-600 text-slate-950 font-black text-3xl">
                            {player.nickname.slice(0, 1)}
                          </div>
                        )
                      ) : (
                        <div className="flex flex-col items-center justify-center text-slate-500 select-none">
                          <Hexagon className="w-7 h-7 mb-1 text-slate-600" />
                          <span className="text-xs font-mono font-bold tabular-nums">
                            #{slotIdx + 1}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Slot Order Number */}
                    <div
                      className={`absolute -bottom-1 px-2 py-0.5 rounded-md text-[11px] font-mono font-black border shadow-sm tabular-nums ${
                        isWinner
                          ? 'bg-emerald-500 text-slate-950 border-emerald-300'
                          : player
                          ? 'bg-amber-400 text-slate-950 border-amber-200'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}
                    >
                      {isWinner ? 'الفائز' : `خلية ${slotIdx + 1}`}
                    </div>
                  </div>

                  {/* Player Name below Honeycomb */}
                  <div className="text-center min-h-[34px] w-full px-1">
                    {player ? (
                      <>
                        <div className="text-xs sm:text-sm font-bold text-white truncate">
                          {player.nickname}
                        </div>
                        <div className="text-[11px] text-amber-300/80 font-mono truncate" dir="ltr">
                          @{player.username}
                        </div>
                      </>
                    ) : (
                      <div className="text-xs text-slate-500 font-medium pt-1">
                        بانتظار المتأهل...
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Standard Bottom Controls Bar */}
      <StandardGameControls
        gameId="grand_challenge"
        gameTitle="لعبة_التحدي_الكبرى"
        currentIndex={currentIndex}
        totalQuestions={questions.length}
        onPrev={handlePrev}
        onNext={handleNext}
        onShowHint={handleShowHint}
        onShowAnswer={handleShowAnswer}
        onQuestionsUploaded={(newItems) => {
          setQuestions(newItems);
          startNewRoundAt(0);
        }}
      />
    </div>
  );
};
