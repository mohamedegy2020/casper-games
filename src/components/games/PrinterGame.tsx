import React, { useState, useEffect } from 'react';
import { ArrowRight, Printer, Sparkles, Trophy, Heart } from 'lucide-react';
import { useTikTokLive } from '../../context/TikTokLiveContext';
import { soundEffects } from '../../services/soundEffects';
import { User } from '../../types';

interface PrinterGameProps {
  onBackToLobby: () => void;
  onOpenHonorBoard: () => void;
}

interface PrintedCard {
  id: string;
  user: User;
  printReason: 'taps' | 'rose';
  printedAt: number;
}

export const PrinterGame: React.FC<PrinterGameProps> = ({ onBackToLobby, onOpenHonorBoard }) => {
  // Registered players who typed 't'
  const [registeredPlayers, setRegisteredPlayers] = useState<Record<string, { user: User; taps: number }>>({});
  // List of cards printed on the live wall
  const [printedCards, setPrintedCards] = useState<PrintedCard[]>([]);

  const { comments, recentGifts, users, gameResetKey } = useTikTokLive();

  useEffect(() => {
    setRegisteredPlayers({});
    setPrintedCards([]);
  }, [gameResetKey]);

  // Handle joining with 't'
  useEffect(() => {
    if (comments.length === 0) return;
    const latest = comments[0];
    const text = latest.text.trim().toLowerCase();

    if (text === 't') {
      soundEffects.playClick();
      setRegisteredPlayers(prev => {
        if (!prev[latest.user.username]) {
          return {
            ...prev,
            [latest.user.username]: {
              user: latest.user,
              taps: latest.user.taps || 0
            }
          };
        }
        return prev;
      });
    }
  }, [comments]);

  // Track taps of registered players (reach 300 taps -> print!)
  useEffect(() => {
    Object.keys(registeredPlayers).forEach(username => {
      const liveUser = users[username];
      if (!liveUser) return;

      const currentTaps = liveUser.taps;
      const alreadyPrinted = printedCards.some(c => c.user.username === username && c.printReason === 'taps');

      if (currentTaps >= 300 && !alreadyPrinted) {
        soundEffects.playStamp();
        setPrintedCards(prev => [
          {
            id: `print_${username}_${Date.now()}`,
            user: liveUser,
            printReason: 'taps',
            printedAt: Date.now()
          },
          ...prev
        ]);
      }
    });
  }, [users, registeredPlayers, printedCards]);

  // Rose gift immediately prints badge!
  useEffect(() => {
    if (recentGifts.length === 0) return;
    const g = recentGifts[0];
    const timeDiff = Date.now() - g.timestamp;

    if (timeDiff < 2000 && g.giftType === 'rose') {
      const alreadyPrintedRose = printedCards.some(
        c => c.user.username === g.user.username && c.printReason === 'rose' && (Date.now() - c.printedAt) < 10000
      );

      if (!alreadyPrintedRose) {
        soundEffects.playStamp();
        setPrintedCards(prev => [
          {
            id: `print_rose_${g.user.username}_${Date.now()}`,
            user: g.user,
            printReason: 'rose',
            printedAt: Date.now()
          },
          ...prev
        ]);
      }
    }
  }, [recentGifts, printedCards]);

  return (
    <div className="flex-1 flex flex-col justify-between p-3 sm:p-6 max-w-5xl mx-auto w-full">
      {/* Header */}
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
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Printer className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black font-display text-white">
              مسابقة الطباعة وطباعة بطاقة الحساب
            </h2>
            <p className="text-[11px] text-slate-400">
              اكتب <strong>t</strong> في التعليقات للاشتراك، و300 تكبيسة أو وردة تطبع بطاقتك
            </p>
          </div>
        </div>
      </div>

      {/* Rules Explainer Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-lg">
            300
          </div>
          <div>
            <div className="text-xs font-bold text-slate-200">الطباعة بالتكبيس (300 تكبيسة)</div>
            <div className="text-[11px] text-slate-400">اكتب حرف t واجمع 300 تكبيسة لطباعة بطاقتك فوراً</div>
          </div>
        </div>

        <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-rose-500/30 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center text-xl">
            🌹
          </div>
          <div>
            <div className="text-xs font-bold text-rose-300">الطباعة الفورية بهدية وردة VIP</div>
            <div className="text-[11px] text-slate-400">إرسال وردة يطبع بطاقة حسابك بالبث فوراً مع شارة VIP</div>
          </div>
        </div>
      </div>

      {/* Main Printed Cards Wall */}
      <div className="flex-1 my-2 flex flex-col">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4" />
            <span>البطاقات المطبوعة على الشاشة ({printedCards.length})</span>
          </span>
          <span className="text-xs text-slate-400">
            المشتركون بالانتظار: {Object.keys(registeredPlayers).length}
          </span>
        </div>

        <div className="flex-1 min-h-[220px] max-h-[360px] overflow-y-auto p-4 rounded-3xl bg-slate-900/60 border border-slate-800 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {printedCards.length === 0 ? (
            <div className="col-span-full py-16 text-center text-slate-500 flex flex-col items-center justify-center">
              <Printer className="w-12 h-12 mb-2 text-slate-700" />
              <p className="text-sm font-semibold text-slate-400">لم يتم طباعة أي بطاقة بعد</p>
              <p className="text-xs text-slate-500 mt-1">اكتب t وكبس 300 تكبيسة أو أرسل وردة لطباعة حسابك هنا!</p>
            </div>
          ) : (
            printedCards.map(card => (
              <div
                key={card.id}
                className={`p-3 rounded-2xl border flex flex-col items-center text-center justify-between shadow-lg transition-transform hover:scale-102 animate-in zoom-in-95 ${
                  card.printReason === 'rose'
                    ? 'bg-gradient-to-b from-rose-950/80 via-slate-900 to-slate-900 border-rose-500/60 shadow-rose-500/10'
                    : 'bg-gradient-to-b from-amber-950/60 via-slate-900 to-slate-900 border-amber-500/50 shadow-amber-500/10'
                }`}
              >
                <div className="relative my-1">
                  <img
                    src={card.user.avatarUrl}
                    alt={card.user.nickname}
                    className="w-14 h-14 rounded-full border-2 border-white/20 object-cover bg-slate-800 shadow-md"
                    referrerPolicy="no-referrer"
                  />
                  <span className="absolute -bottom-1 -right-1 p-1 rounded-full text-xs shadow">
                    {card.printReason === 'rose' ? '🌹' : '⚡'}
                  </span>
                </div>

                <div className="w-full truncate mt-1">
                  <div className="text-xs font-bold text-white truncate">{card.user.nickname}</div>
                  <div className="text-[10px] text-slate-400 font-mono truncate" dir="ltr">@{card.user.username}</div>
                </div>

                <div className="mt-2 pt-1.5 border-t border-slate-800/80 w-full text-[10px] text-slate-400">
                  {card.printReason === 'rose' ? (
                    <span className="text-rose-400 font-bold">طُبعت بوردة VIP</span>
                  ) : (
                    <span className="text-amber-400 font-bold">أكمل 300 تكبيسة</span>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Progress of in-flight registered participants */}
      {Object.keys(registeredPlayers).length > 0 && (
        <div className="mt-3 p-3 bg-slate-900/90 border border-slate-800 rounded-2xl">
          <div className="text-xs font-bold text-slate-300 mb-2">تقدّم تكبيسات المشتركين نحو الـ 300:</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.keys(registeredPlayers).slice(0, 8).map(username => {
              const u = users[username] || registeredPlayers[username].user;
              const taps = u.taps || 0;
              const pct = Math.min(100, Math.floor((taps / 300) * 100));

              return (
                <div key={username} className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 text-xs">
                  <div className="flex items-center justify-between mb-1 text-[11px]">
                    <span className="text-slate-200 font-semibold truncate max-w-[80px]">{u.nickname}</span>
                    <span className="font-mono text-amber-400">{taps}/300</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-500 to-rose-500 transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
        <span>اكتب <strong>t</strong> في التعليقات وسجل حضورك على شاشة البث!</span>
        <button
          onClick={onOpenHonorBoard}
          className="text-amber-400 hover:text-amber-300 font-bold flex items-center gap-1"
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>لوحة الشرف</span>
        </button>
      </div>
    </div>
  );
};
