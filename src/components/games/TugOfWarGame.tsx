import React, { useState, useEffect, useMemo } from 'react';
import { ArrowRight, Play, Pause, RotateCcw, Trophy, Users, Heart, Share2 } from 'lucide-react';
import { useTikTokLive } from '../../context/TikTokLiveContext';
import { soundEffects } from '../../services/soundEffects';
import { User } from '../../types';

interface TugOfWarGameProps {
  onBackToLobby: () => void;
  onOpenHonorBoard: () => void;
}

export const TugOfWarGame: React.FC<TugOfWarGameProps> = ({ onBackToLobby, onOpenHonorBoard }) => {
  const [roundDurationMinutes, setRoundDurationMinutes] = useState<3 | 5>(3);
  const [timeLeft, setTimeLeft] = useState<number>(3 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [winnerTeam, setWinnerTeam] = useState<'blue' | 'red' | 'draw' | null>(null);

  // Team players list
  const [blueTeamUsers, setBlueTeamUsers] = useState<Record<string, User>>({});
  const [redTeamUsers, setRedTeamUsers] = useState<Record<string, User>>({});

  const { comments, users, recentGifts, gameResetKey } = useTikTokLive();

  useEffect(() => {
    setIsRunning(false);
    setTimeLeft(roundDurationMinutes * 60);
    setWinnerTeam(null);
    setBlueTeamUsers({});
    setRedTeamUsers({});
  }, [gameResetKey]);

  // Round countdown
  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setIsRunning(false);
          soundEffects.playVictory();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning]);

  // Handle incoming comments: y -> Blue, r -> Red
  useEffect(() => {
    if (comments.length === 0) return;
    const latest = comments[0];
    const text = latest.text.trim().toLowerCase();

    if (text === 'y') {
      soundEffects.playClick();
      setBlueTeamUsers(prev => ({
        ...prev,
        [latest.user.username]: latest.user
      }));
      // Remove from opposite team if switched
      setRedTeamUsers(prev => {
        const copy = { ...prev };
        delete copy[latest.user.username];
        return copy;
      });
    } else if (text === 'r') {
      soundEffects.playClick();
      setRedTeamUsers(prev => ({
        ...prev,
        [latest.user.username]: latest.user
      }));
      setBlueTeamUsers(prev => {
        const copy = { ...prev };
        delete copy[latest.user.username];
        return copy;
      });
    }
  }, [comments]);

  // Calculate team scores from taps + shares of team members
  const blueScore = useMemo(() => {
    let sum = 20; // baseline
    Object.keys(blueTeamUsers).forEach(username => {
      const u = users[username] || blueTeamUsers[username];
      sum += (u.taps || 0) + (u.shares || 0) * 5;
    });
    return sum;
  }, [blueTeamUsers, users]);

  const redScore = useMemo(() => {
    let sum = 20; // baseline
    Object.keys(redTeamUsers).forEach(username => {
      const u = users[username] || redTeamUsers[username];
      sum += (u.taps || 0) + (u.shares || 0) * 5;
    });
    return sum;
  }, [redTeamUsers, users]);

  // Calculate rope percentage position (0% = full blue win, 100% = full red win, 50% = center)
  const totalPower = blueScore + redScore;
  const ropePositionPercent = totalPower > 0 ? (redScore / totalPower) * 100 : 50;

  // Determine winner when time expires
  useEffect(() => {
    if (timeLeft === 0) {
      if (blueScore > redScore) {
        setWinnerTeam('blue');
      } else if (redScore > blueScore) {
        setWinnerTeam('red');
      } else {
        setWinnerTeam('draw');
      }
    }
  }, [timeLeft, blueScore, redScore]);

  const handleStartRound = () => {
    soundEffects.playClick();
    if (timeLeft === 0) {
      setTimeLeft(roundDurationMinutes * 60);
      setWinnerTeam(null);
    }
    setIsRunning(true);
  };

  const handlePauseRound = () => {
    soundEffects.playClick();
    setIsRunning(false);
  };

  const handleResetRound = () => {
    soundEffects.playClick();
    setIsRunning(false);
    setTimeLeft(roundDurationMinutes * 60);
    setWinnerTeam(null);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="flex-1 flex flex-col justify-between p-3 sm:p-6 max-w-5xl mx-auto w-full">
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
          <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black font-display text-white">
              مسابقة شد الحبل (أزرق vs أحمر)
            </h2>
            <p className="text-[11px] text-slate-400">
              الأزرق اكتب <strong>y</strong> | الأحمر اكتب <strong>r</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Control Banner: Round Duration & Timer */}
      <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md mb-4">
        {/* Round Duration */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-bold">مدة الجولة:</span>
          <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                soundEffects.playClick();
                setRoundDurationMinutes(3);
                setTimeLeft(3 * 60);
                setIsRunning(false);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                roundDurationMinutes === 3 ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              3 دقائق
            </button>
            <button
              onClick={() => {
                soundEffects.playClick();
                setRoundDurationMinutes(5);
                setTimeLeft(5 * 60);
                setIsRunning(false);
              }}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                roundDurationMinutes === 5 ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              5 دقائق
            </button>
          </div>
        </div>

        {/* Timer */}
        <div className="text-xl sm:text-2xl font-black font-mono text-amber-400 bg-slate-950 px-4 py-1 rounded-xl border border-amber-500/30">
          {formatTime(timeLeft)}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {isRunning ? (
            <button
              onClick={handlePauseRound}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors cursor-pointer"
            >
              <Pause className="w-4 h-4" />
              <span>إيقاف مؤقت</span>
            </button>
          ) : (
            <button
              onClick={handleStartRound}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs hover:bg-emerald-400 transition-colors cursor-pointer"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>بدء الجولة</span>
            </button>
          )}

          <button
            onClick={handleResetRound}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="إعادة تعيين الجولة"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Tug Arena */}
      <div className="my-auto py-4 flex flex-col items-center">
        {/* Teams Heads-Up Header */}
        <div className="w-full grid grid-cols-2 gap-4 mb-4">
          {/* Blue Team Header */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-950/80 to-slate-900 border-2 border-blue-500/60 shadow-lg shadow-blue-500/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-right">
            <div>
              <div className="text-xs text-blue-300 font-bold">الفريق الأزرق (اكتب y)</div>
              <div className="text-xl sm:text-3xl font-black text-blue-400 font-mono tabular-nums">
                {blueScore} نقطة
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Users className="w-4 h-4 text-blue-400" />
              <span>{Object.keys(blueTeamUsers).length} بطل</span>
            </div>
          </div>

          {/* Red Team Header */}
          <div className="p-4 rounded-2xl bg-gradient-to-l from-rose-950/80 to-slate-900 border-2 border-rose-500/60 shadow-lg shadow-rose-500/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
            <div>
              <div className="text-xs text-rose-300 font-bold">الفريق الأحمر (اكتب r)</div>
              <div className="text-xl sm:text-3xl font-black text-rose-400 font-mono tabular-nums">
                {redScore} نقطة
              </div>
            </div>
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Users className="w-4 h-4 text-rose-400" />
              <span>{Object.keys(redTeamUsers).length} بطل</span>
            </div>
          </div>
        </div>

        {/* Dynamic Animated Tug Rope Bar */}
        <div className="w-full my-6 px-2">
          <div className="relative h-12 rounded-full bg-slate-950 border-2 border-slate-700/80 p-1.5 flex items-center shadow-inner overflow-hidden">
            {/* Blue Side Gradient */}
            <div className="absolute inset-y-0 right-0 w-1/2 bg-gradient-to-l from-blue-600/30 to-transparent pointer-events-none" />
            {/* Red Side Gradient */}
            <div className="absolute inset-y-0 left-0 w-1/2 bg-gradient-to-r from-rose-600/30 to-transparent pointer-events-none" />

            {/* Center Marker Line */}
            <div className="absolute inset-y-0 left-1/2 -translate-x-1/2 w-1 bg-amber-400/80 z-10 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />

            {/* The Moving Rope Ribbon Tag */}
            <div
              className="absolute top-1 bottom-1 w-12 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-300 shadow-lg shadow-amber-400/50 flex items-center justify-center text-slate-950 font-black text-xs transition-all duration-300 ease-out z-20 cursor-grab"
              style={{
                left: `calc(${ropePositionPercent}% - 24px)`
              }}
            >
              🚩
            </div>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-400 px-2 mt-1.5 font-mono">
            <span className="text-rose-400">طرف الأحمر ◀</span>
            <span className="text-amber-300">خط المنتصف</span>
            <span className="text-blue-400">▶ طرف الأزرق</span>
          </div>
        </div>

        {/* Team Rosters Preview */}
        <div className="w-full grid grid-cols-2 gap-4">
          {/* Blue Members List */}
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-blue-900/40">
            <div className="text-xs font-bold text-blue-300 mb-2">أبطال الفريق الأزرق:</div>
            <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto">
              {Object.values(blueTeamUsers).length === 0 ? (
                <span className="text-xs text-slate-500">اكتب y في التعليقات للانضمام</span>
              ) : (
                Object.values(blueTeamUsers).map(u => (
                  <div key={u.username} className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-blue-950/80 border border-blue-700/50 text-xs">
                    <img src={u.avatarUrl} alt={u.nickname} className="w-5 h-5 rounded-full object-cover" referrerPolicy="no-referrer" />
                    <span className="text-blue-200 font-semibold truncate max-w-[80px]">{u.nickname}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Red Members List */}
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-rose-900/40">
            <div className="text-xs font-bold text-rose-300 mb-2">أبطال الفريق الأحمر:</div>
            <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto">
              {Object.values(redTeamUsers).length === 0 ? (
                <span className="text-xs text-slate-500">اكتب r في التعليقات للانضمام</span>
              ) : (
                Object.values(redTeamUsers).map(u => (
                  <div key={u.username} className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-rose-950/80 border border-rose-700/50 text-xs">
                    <img src={u.avatarUrl} alt={u.nickname} className="w-5 h-5 rounded-full object-cover" referrerPolicy="no-referrer" />
                    <span className="text-rose-200 font-semibold truncate max-w-[80px]">{u.nickname}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Round Over Banner */}
        {winnerTeam && (
          <div className="mt-4 p-4 rounded-2xl bg-amber-500/20 border border-amber-500/50 text-center w-full max-w-md animate-in zoom-in-95">
            <Trophy className="w-8 h-8 text-amber-400 mx-auto mb-1 animate-bounce" />
            <h3 className="text-xl font-black text-amber-300 font-display">
              {winnerTeam === 'blue' ? 'الفريق الأزرق هو الفائز! 🏆🔵' : winnerTeam === 'red' ? 'الفريق الأحمر هو الفائز! 🏆🔴' : 'تعادل حماسي بين الفريقين! 🤝'}
            </h3>
            <p className="text-xs text-slate-300 mt-1">كفو يا أبطال على التكبيس والشيرات الأسطورية!</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="mt-3 p-3 bg-slate-900/90 border border-slate-800 rounded-2xl text-xs text-slate-300 flex items-center justify-between">
        <span>⚡ <strong>طريقة الفوز:</strong> التكبيسات تزيد نقطة واحدة، والشيرات تزيد 5 نقاط للشد!</span>
        <button
          onClick={onOpenHonorBoard}
          className="text-amber-400 hover:text-amber-300 font-bold whitespace-nowrap flex items-center gap-1"
        >
          <Trophy className="w-3.5 h-3.5" />
          <span>لوحة الشرف</span>
        </button>
      </div>
    </div>
  );
};
