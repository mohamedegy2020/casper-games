import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Eye, Sparkles, Trophy, ChevronRight, ChevronLeft, CheckCircle2 } from 'lucide-react';
import { useTikTokLive } from '../../context/TikTokLiveContext';
import { soundEffects } from '../../services/soundEffects';
import { User } from '../../types';

interface MemoryCardsGameProps {
  onBackToLobby: () => void;
  onOpenHonorBoard: () => void;
}

interface CardItem {
  id: number; // 1 to 16
  symbol: string;
  isCleared: boolean;
  clearedBy?: User;
}

// Icons pool for pairs
const SYMBOLS_POOL = [
  '🦁', '🚀', '💎', '👑', '🎮', '🍕', '⚡', '🏆',
  '🌟', '🔥', '🎯', '🎸', '⚽', '🏎️', '🦄', '🪐'
];

export const MemoryCardsGame: React.FC<MemoryCardsGameProps> = ({ onBackToLobby, onOpenHonorBoard }) => {
  const [level, setLevel] = useState<number>(1); // 1 to 100 levels
  const [cards, setCards] = useState<CardItem[]>([]);
  const [isPreviewRevealed, setIsPreviewRevealed] = useState<boolean>(true);
  const [previewSecondsLeft, setPreviewSecondsLeft] = useState<number>(30);
  const [levelSolvers, setLevelSolvers] = useState<User[]>([]);

  const { comments, recentGifts, isFollowerOnly, setWinnerCelebration, addGamePoints, gameResetKey } = useTikTokLive();

  // Generate 8 pairs of cards (16 cards) for the current level
  const initCardsForLevel = (lvl: number) => {
    // Pick 8 symbols based on level seed
    const seedOffset = (lvl * 3) % (SYMBOLS_POOL.length - 8);
    const chosenSymbols = SYMBOLS_POOL.slice(seedOffset, seedOffset + 8);

    // Duplicate each symbol to make 8 pairs (16 items)
    const deck = [...chosenSymbols, ...chosenSymbols];

    // Seeded shuffle so level is consistent
    const shuffled = deck
      .map((sym, i) => ({ sym, sortKey: Math.sin(lvl * 100 + i) }))
      .sort((a, b) => a.sortKey - b.sortKey)
      .map((item, idx) => ({
        id: idx + 1,
        symbol: item.sym,
        isCleared: false
      }));

    setCards(shuffled);
    setIsPreviewRevealed(true);
    setPreviewSecondsLeft(30);
    setLevelSolvers([]);
  };

  useEffect(() => {
    initCardsForLevel(level);
  }, [level, gameResetKey]);

  // 30 seconds initial preview countdown
  useEffect(() => {
    if (!isPreviewRevealed) return;

    const timer = setInterval(() => {
      setPreviewSecondsLeft(prev => {
        if (prev <= 1) {
          setIsPreviewRevealed(false);
          soundEffects.playHint();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPreviewRevealed]);

  // Listen to incoming comments for card pair numbers: "مثلا 1 12 الفاصل بينهم مسافة"
  useEffect(() => {
    if (isPreviewRevealed || cards.length === 0) return;

    if (comments.length > 0) {
      const latest = comments[0];
      if (isFollowerOnly && !latest.user.isFollower) return;

      // Extract two numbers from comment text (e.g. "1 12" or "3 7" or "1, 12")
      const matches = latest.text.match(/\b([1-9]|1[0-6])\b[^\d]+\b([1-9]|1[0-6])\b/);
      if (matches) {
        const n1 = parseInt(matches[1], 10);
        const n2 = parseInt(matches[2], 10);

        if (n1 !== n2 && n1 >= 1 && n1 <= 16 && n2 >= 1 && n2 <= 16) {
          const card1 = cards.find(c => c.id === n1);
          const card2 = cards.find(c => c.id === n2);

          // Check if both exist, neither is cleared yet, and symbols match!
          if (card1 && card2 && !card1.isCleared && !card2.isCleared && card1.symbol === card2.symbol) {
            soundEffects.playVictory();
            addGamePoints(latest.user.username, 10);

            setLevelSolvers(prev => {
              if (prev.some(u => u.username === latest.user.username)) return prev;
              return [...prev, latest.user];
            });

            setCards(prev => {
              const updated = prev.map(c => {
                if (c.id === n1 || c.id === n2) {
                  return {
                    ...c,
                    isCleared: true,
                    clearedBy: latest.user
                  };
                }
                return c;
              });

              // Check if all 16 cards are cleared!
              const remaining = updated.filter(c => !c.isCleared).length;
              if (remaining === 0) {
                setTimeout(() => {
                  setWinnerCelebration({
                    winner: latest.user,
                    gameTitle: `لعبة الذاكرة - المستوى ${level}`,
                    questionText: 'حل جميع البطاقات المتشابهة بنجاح!',
                    correctAnswer: 'اكتمل المستوى 100%',
                    isGiftAnswer: false
                  });
                }, 500);
              }

              return updated;
            });
          }
        }
      }
    }
  }, [comments, isPreviewRevealed, cards, isFollowerOnly, addGamePoints, level, setWinnerCelebration]);

  const handleNextLevel = () => {
    soundEffects.playClick();
    if (level < 100) {
      setLevel(prev => prev + 1);
    }
  };

  const handlePrevLevel = () => {
    soundEffects.playClick();
    if (level > 1) {
      setLevel(prev => prev - 1);
    }
  };

  const handleRevealPreview = () => {
    soundEffects.playClick();
    setIsPreviewRevealed(true);
    setPreviewSecondsLeft(30);
  };

  const handleShowAnswer = () => {
    // Reveal all cards
    soundEffects.playVictory();
    setCards(prev => prev.map(c => ({ ...c, isCleared: true })));
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
      gameTitle: `لعبة الذاكرة - المستوى ${level}`,
      questionText: 'كشف البطاقات من قبل المبدع',
      correctAnswer: 'تم كشف جميع الأزواج',
      isGiftAnswer: false
    });
  };

  const clearedPairsCount = cards.filter(c => c.isCleared).length / 2;

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
          <div className="p-2 rounded-xl bg-fuchsia-500/20 text-fuchsia-400 border border-fuchsia-500/30">
            <Eye className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black font-display text-white">
              لعبة الذاكرة (100 مستوى)
            </h2>
            <p className="text-[11px] text-slate-400">
              المستوى <strong className="text-fuchsia-400 font-mono">{level}</strong> من 100
            </p>
          </div>
        </div>
      </div>

      {/* Control Strip: Preview Countdown & Status */}
      <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-bold">حالة الكروت:</span>
          {isPreviewRevealed ? (
            <span className="px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold animate-pulse">
              معاينة مفتوحة لمدة: <strong className="font-mono text-white">{previewSecondsLeft}ث</strong>
            </span>
          ) : (
            <span className="px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-bold">
              البطاقات مقلوبة بالأرقام - اكتب الرقمين!
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">
            الأزواج المحلولة: <strong className="text-fuchsia-300 font-mono">{clearedPairsCount}/8</strong>
          </span>

          <button
            onClick={handleRevealPreview}
            disabled={isPreviewRevealed}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold disabled:opacity-40 transition-colors cursor-pointer"
          >
            معاينة 30 ثانية 👁️
          </button>
        </div>
      </div>

      {/* 16 Cards Grid (4x4) */}
      <div className="my-auto py-2">
        <div className="grid grid-cols-4 gap-2.5 sm:gap-4 max-w-lg mx-auto">
          {cards.map(card => {
            const isVisible = isPreviewRevealed || card.isCleared;

            return (
              <div
                key={card.id}
                className={`relative aspect-square rounded-2xl border-2 flex flex-col items-center justify-center select-none shadow-md transition-all duration-300 ${
                  card.isCleared
                    ? 'opacity-30 bg-slate-900/40 border-slate-800 scale-95'
                    : isVisible
                    ? 'bg-gradient-to-br from-fuchsia-950/80 via-slate-900 to-slate-900 border-fuchsia-500/70 shadow-fuchsia-500/20'
                    : 'bg-gradient-to-br from-slate-800 via-slate-850 to-slate-900 border-slate-700 hover:border-amber-400/50'
                }`}
              >
                {/* Number Badge at Top */}
                <span className="absolute top-1.5 right-2 text-[11px] font-mono font-bold text-slate-400">
                  #{card.id}
                </span>

                {/* Card Content: Symbol or Number */}
                {isVisible ? (
                  <span className="text-3xl sm:text-4xl animate-in zoom-in-75">
                    {card.symbol}
                  </span>
                ) : (
                  <span className="text-2xl sm:text-3xl font-black font-mono text-amber-400/90 font-display">
                    {card.id}
                  </span>
                )}

                {/* Solved by Badge */}
                {card.isCleared && card.clearedBy && (
                  <span className="absolute bottom-1 inset-x-1 text-[9px] text-emerald-400 font-bold truncate text-center">
                    {card.clearedBy.nickname}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Solvers Wall Strip */}
      {levelSolvers.length > 0 && (
        <div className="mt-2 p-2.5 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-slate-400 shrink-0 font-bold">أبطال هذا المستوى:</span>
          {levelSolvers.map(u => (
            <div key={u.username} className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-fuchsia-950/60 border border-fuchsia-800/40 shrink-0">
              <img src={u.avatarUrl} alt={u.nickname} className="w-4 h-4 rounded-full object-cover" referrerPolicy="no-referrer" />
              <span className="text-fuchsia-200 font-semibold">{u.nickname}</span>
            </div>
          ))}
        </div>
      )}

      {/* Level Navigation and Controls Bar */}
      <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-lg mt-3">
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevLevel}
            disabled={level <= 1}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold disabled:opacity-40 flex items-center gap-1 cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
            <span>المستوى السابق</span>
          </button>
          <span className="text-xs font-mono px-3 py-1 bg-slate-950 rounded-lg text-amber-300">
            مستوى {level} / 100
          </span>
          <button
            onClick={handleNextLevel}
            disabled={level >= 100}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-bold disabled:opacity-40 flex items-center gap-1 cursor-pointer"
          >
            <span>المستوى التالي</span>
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleShowAnswer}
            className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>كشف الإجابة والحل</span>
          </button>

          <button
            onClick={onOpenHonorBoard}
            className="text-amber-400 hover:text-amber-300 text-xs font-bold flex items-center gap-1"
          >
            <Trophy className="w-3.5 h-3.5" />
            <span>لوحة الشرف</span>
          </button>
        </div>
      </div>
    </div>
  );
};
