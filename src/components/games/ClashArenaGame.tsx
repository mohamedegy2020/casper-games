import React, { useState, useEffect, useRef } from 'react';
import { ArrowRight, Swords, Play, Pause, RotateCcw, Trophy, Shield, Zap } from 'lucide-react';
import { useTikTokLive } from '../../context/TikTokLiveContext';
import { soundEffects } from '../../services/soundEffects';
import { User } from '../../types';

interface ClashArenaGameProps {
  onBackToLobby: () => void;
  onOpenHonorBoard: () => void;
}

interface Fighter {
  id: string;
  user: User;
  team: 'blue' | 'red';
  x: number;
  y: number;
  vx: number;
  vy: number;
  hp: number;
  lastTapCount: number;
}

interface Bullet {
  id: string;
  ownerId: string;
  team: 'blue' | 'red';
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export const ClashArenaGame: React.FC<ClashArenaGameProps> = ({ onBackToLobby, onOpenHonorBoard }) => {
  const [roundDurationMinutes, setRoundDurationMinutes] = useState<3 | 5>(3);
  const [timeLeft, setTimeLeft] = useState<number>(3 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [winnerTeam, setWinnerTeam] = useState<'blue' | 'red' | 'draw' | null>(null);

  const [fighters, setFighters] = useState<Fighter[]>([
    {
      id: 'f_blue_init',
      user: {
        id: 'u_b',
        username: 'ahmed_gamer',
        nickname: 'أحمد',
        avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=ahmed',
        isFollower: true,
        taps: 0,
        shares: 0,
        reposts: 0,
        gamePoints: 0
      },
      team: 'blue',
      x: 75,
      y: 50,
      vx: -0.2,
      vy: 0.15,
      hp: 100,
      lastTapCount: 0
    },
    {
      id: 'f_red_init',
      user: {
        id: 'u_r',
        username: 'nour_egypt',
        nickname: 'نور',
        avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=nour',
        isFollower: true,
        taps: 0,
        shares: 0,
        reposts: 0,
        gamePoints: 0
      },
      team: 'red',
      x: 25,
      y: 50,
      vx: 0.2,
      vy: -0.15,
      hp: 100,
      lastTapCount: 0
    }
  ]);

  const [bullets, setBullets] = useState<Bullet[]>([]);

  const { comments, users, gameResetKey } = useTikTokLive();
  const arenaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsRunning(false);
    setTimeLeft(roundDurationMinutes * 60);
    setWinnerTeam(null);
    setBullets([]);
    setFighters([
      {
        id: 'f_blue_init',
        user: {
          id: 'u_b',
          username: 'ahmed_gamer',
          nickname: 'أحمد',
          avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=ahmed',
          isFollower: true,
          taps: 0,
          shares: 0,
          reposts: 0,
          gamePoints: 0
        },
        team: 'blue',
        x: 75,
        y: 50,
        vx: -0.2,
        vy: 0.15,
        hp: 100,
        lastTapCount: 0
      },
      {
        id: 'f_red_init',
        user: {
          id: 'u_r',
          username: 'nour_egypt',
          nickname: 'نور',
          avatarUrl: 'https://api.dicebear.com/7.x/bottts/svg?seed=nour',
          isFollower: true,
          taps: 0,
          shares: 0,
          reposts: 0,
          gamePoints: 0
        },
        team: 'red',
        x: 25,
        y: 50,
        vx: 0.2,
        vy: -0.15,
        hp: 100,
        lastTapCount: 0
      }
    ]);
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

  // Handle incoming comments: 1 -> Blue team, 2 -> Red team
  useEffect(() => {
    if (comments.length === 0) return;
    const latest = comments[0];
    const text = latest.text.trim();

    if (text === '1' || text === '١') {
      soundEffects.playClick();
      setFighters(prev => {
        if (prev.some(f => f.user.username === latest.user.username)) return prev;
        return [
          ...prev,
          {
            id: `f_blue_${latest.user.username}`,
            user: latest.user,
            team: 'blue',
            x: 70 + Math.random() * 20,
            y: 20 + Math.random() * 60,
            vx: -0.2 - Math.random() * 0.2,
            vy: (Math.random() - 0.5) * 0.3,
            hp: 100,
            lastTapCount: latest.user.taps || 0
          }
        ];
      });
    } else if (text === '2' || text === '٢') {
      soundEffects.playClick();
      setFighters(prev => {
        if (prev.some(f => f.user.username === latest.user.username)) return prev;
        return [
          ...prev,
          {
            id: `f_red_${latest.user.username}`,
            user: latest.user,
            team: 'red',
            x: 10 + Math.random() * 20,
            y: 20 + Math.random() * 60,
            vx: 0.2 + Math.random() * 0.2,
            vy: (Math.random() - 0.5) * 0.3,
            hp: 100,
            lastTapCount: latest.user.taps || 0
          }
        ];
      });
    }
  }, [comments]);

  // Taps fire bullets during active round: "كل 2 تكبيسه من نفس اللاعب يطلق رصاص على الفريق الاخر"
  // "الرصاص لا يؤثر قبل البدء ولا يؤثر بعد أنتهاء الجولة"
  useEffect(() => {
    if (!isRunning || timeLeft === 0) return;

    fighters.forEach(f => {
      const liveUser = users[f.user.username];
      if (!liveUser) return;

      const tapsDiff = (liveUser.taps || 0) - f.lastTapCount;
      if (tapsDiff >= 2) {
        soundEffects.playLaser();
        // Fire bullet towards opponent side
        const bulletDirectionX = f.team === 'blue' ? -1.2 : 1.2;
        const newBullet: Bullet = {
          id: `b_${Date.now()}_${Math.random()}`,
          ownerId: f.id,
          team: f.team,
          x: f.x,
          y: f.y,
          vx: bulletDirectionX,
          vy: (Math.random() - 0.5) * 0.2
        };

        setBullets(prev => [...prev.slice(-30), newBullet]);

        // Update fighter lastTapCount
        setFighters(prev =>
          prev.map(item =>
            item.id === f.id ? { ...item, lastTapCount: liveUser.taps } : item
          )
        );
      }
    });
  }, [users, isRunning, timeLeft, fighters]);

  // Physics animation loop: Movement, Bouncing, Collisions, Bullet hits
  useEffect(() => {
    const loop = setInterval(() => {
      // 1. Move and update fighters
      setFighters(prevFighters => {
        return prevFighters.map((f, i) => {
          let nx = f.x + f.vx;
          let ny = f.y + f.vy;
          let nvx = f.vx;
          let nvy = f.vy;

          // Arena boundary bounce (0 to 100%)
          if (nx <= 5 || nx >= 95) nvx = -nvx;
          if (ny <= 5 || ny >= 95) nvy = -nvy;

          // Collisions: ONLY with opposite team ("أعضاء نفس الفريق لا تتصادم ولكن من الفريق الاخر تتصادم")
          for (let j = 0; j < prevFighters.length; j++) {
            if (i === j) continue;
            const other = prevFighters[j];
            if (f.team !== other.team) {
              const dx = nx - other.x;
              const dy = ny - other.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < 8) { // collision distance
                nvx = -nvx * 1.05;
                nvy = -nvy * 1.05;
                if (isRunning && timeLeft > 0) {
                  soundEffects.playClick();
                }
              }
            }
          }

          return {
            ...f,
            x: Math.max(5, Math.min(95, nx)),
            y: Math.max(5, Math.min(95, ny)),
            vx: nvx,
            vy: nvy
          };
        });
      });

      // 2. Move bullets and check hits on enemy team
      setBullets(prevBullets => {
        const nextBullets: Bullet[] = [];

        prevBullets.forEach(b => {
          const bx = b.x + b.vx;
          const by = b.y + b.vy;

          // Out of bounds
          if (bx < 0 || bx > 100 || by < 0 || by > 100) return;

          let hit = false;

          // Check if hits any enemy fighter (friendly fire disabled!)
          if (isRunning && timeLeft > 0) {
            setFighters(currFighters => {
              return currFighters.map(f => {
                if (f.team !== b.team) {
                  const dx = bx - f.x;
                  const dy = by - f.y;
                  const dist = Math.sqrt(dx * dx + dy * dy);
                  if (dist < 6 && !hit) {
                    hit = true;
                    return {
                      ...f,
                      hp: Math.max(0, f.hp - 10)
                    };
                  }
                }
                return f;
              });
            });
          }

          if (!hit) {
            nextBullets.push({ ...b, x: bx, y: by });
          }
        });

        return nextBullets;
      });
    }, 40);

    return () => clearInterval(loop);
  }, [isRunning, timeLeft]);

  // Calculate team total HP
  const blueTotalHp = fighters.filter(f => f.team === 'blue').reduce((sum, f) => sum + f.hp, 0);
  const redTotalHp = fighters.filter(f => f.team === 'red').reduce((sum, f) => sum + f.hp, 0);

  // Determine winner at end of round
  useEffect(() => {
    if (timeLeft === 0) {
      if (blueTotalHp > redTotalHp) {
        setWinnerTeam('blue');
      } else if (redTotalHp > blueTotalHp) {
        setWinnerTeam('red');
      } else {
        setWinnerTeam('draw');
      }
    }
  }, [timeLeft, blueTotalHp, redTotalHp]);

  const handleStart = () => {
    soundEffects.playClick();
    if (timeLeft === 0) {
      setTimeLeft(roundDurationMinutes * 60);
      setWinnerTeam(null);
      // Restore HP
      setFighters(prev => prev.map(f => ({ ...f, hp: 100 })));
    }
    setIsRunning(true);
  };

  const handlePause = () => {
    soundEffects.playClick();
    setIsRunning(false);
  };

  const handleReset = () => {
    soundEffects.playClick();
    setIsRunning(false);
    setTimeLeft(roundDurationMinutes * 60);
    setWinnerTeam(null);
    setFighters(prev => prev.map(f => ({ ...f, hp: 100 })));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

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
          <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <Swords className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black font-display text-white">
              لعبة التصادم والرصاص الحماسي
            </h2>
            <p className="text-[11px] text-slate-400">
              الأزرق اكتب <strong>1</strong> | الأحمر اكتب <strong>2</strong>
            </p>
          </div>
        </div>
      </div>

      {/* Control Banner: Round Duration, Timer & Start Button */}
      <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md mb-3">
        {/* Duration selector */}
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
                roundDurationMinutes === 3 ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
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
                roundDurationMinutes === 5 ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              5 دقائق
            </button>
          </div>
        </div>

        {/* Timer */}
        <div className="text-xl sm:text-2xl font-black font-mono text-rose-400 bg-slate-950 px-4 py-1 rounded-xl border border-rose-500/30">
          {formatTime(timeLeft)}
        </div>

        {/* Start / Pause / Reset ("لاتبدء الجوالة إلا بعد الضغط على زر البدء") */}
        <div className="flex items-center gap-2">
          {isRunning ? (
            <button
              onClick={handlePause}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-amber-500 text-slate-950 font-bold text-xs hover:bg-amber-400 transition-colors cursor-pointer"
            >
              <Pause className="w-4 h-4" />
              <span>إيقاف مؤقت</span>
            </button>
          ) : (
            <button
              onClick={handleStart}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs hover:from-emerald-400 hover:to-teal-300 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>بدء الجولة ⚔️</span>
            </button>
          )}

          <button
            onClick={handleReset}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition-colors cursor-pointer"
            title="إعادة تعيين الجولة"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Teams Health Status */}
      <div className="grid grid-cols-2 gap-3 mb-2">
        <div className="p-2.5 rounded-xl bg-blue-950/70 border border-blue-500/50 flex items-center justify-between text-xs">
          <span className="font-bold text-blue-300">🔵 الفريق الأزرق (اكتب 1)</span>
          <span className="font-mono font-bold text-blue-400">{blueTotalHp} HP</span>
        </div>
        <div className="p-2.5 rounded-xl bg-rose-950/70 border border-rose-500/50 flex items-center justify-between text-xs">
          <span className="font-bold text-rose-300">🔴 الفريق الأحمر (اكتب 2)</span>
          <span className="font-mono font-bold text-rose-400">{redTotalHp} HP</span>
        </div>
      </div>

      {/* 2D Battle Arena Stage */}
      <div
        ref={arenaRef}
        className="relative flex-1 min-h-[300px] sm:min-h-[380px] rounded-3xl bg-slate-950/90 border-2 border-slate-700/80 shadow-2xl overflow-hidden my-1"
      >
        {/* Arena Grid Texture */}
        <div className="absolute inset-0 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:20px_20px] opacity-25" />

        {/* Center Arena Dividing Glow Line */}
        <div className="absolute inset-y-0 left-1/2 w-0.5 bg-gradient-to-b from-transparent via-amber-400/40 to-transparent" />

        {/* Status Indicator inside Arena */}
        {!isRunning && (
          <div className="absolute top-3 inset-x-0 mx-auto w-max px-3 py-1 rounded-full bg-slate-900/90 border border-slate-700 text-xs font-bold text-amber-300 shadow z-30">
            {timeLeft === 0 ? 'انتهت الجولة!' : 'اضغط على زر "بدء الجولة" لتفعيل الرصاص والقتال'}
          </div>
        )}

        {/* Render Fighters */}
        {fighters.map(fighter => {
          const isBlue = fighter.team === 'blue';

          return (
            <div
              key={fighter.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 transition-all flex flex-col items-center select-none z-20 pointer-events-none"
              style={{
                left: `${fighter.x}%`,
                top: `${fighter.y}%`
              }}
            >
              {/* HP Bar */}
              <div className="w-10 h-1.5 bg-slate-800 rounded-full mb-1 border border-slate-700 overflow-hidden">
                <div
                  className={`h-full ${isBlue ? 'bg-blue-400' : 'bg-rose-400'}`}
                  style={{ width: `${fighter.hp}%` }}
                />
              </div>

              {/* Character Avatar with Team Glow Ring */}
              <div
                className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 ${
                  isBlue
                    ? 'border-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.6)]'
                    : 'border-rose-400 shadow-[0_0_15px_rgba(244,63,94,0.6)]'
                }`}
              >
                <img
                  src={fighter.user.avatarUrl}
                  alt={fighter.user.nickname}
                  className="w-full h-full rounded-full object-cover bg-slate-800"
                  referrerPolicy="no-referrer"
                />
                <span className="absolute -top-1 -right-1 text-[10px]">
                  {isBlue ? '🔵' : '🔴'}
                </span>
              </div>

              <span className="text-[10px] text-white font-bold max-w-[60px] truncate mt-0.5 drop-shadow">
                {fighter.user.nickname}
              </span>
            </div>
          );
        })}

        {/* Render Bullets */}
        {bullets.map(b => (
          <div
            key={b.id}
            className={`absolute w-3 h-3 rounded-full -translate-x-1/2 -translate-y-1/2 shadow-lg z-20 ${
              b.team === 'blue'
                ? 'bg-blue-400 shadow-[0_0_10px_#60a5fa]'
                : 'bg-rose-400 shadow-[0_0_10px_#fb7185]'
            }`}
            style={{
              left: `${b.x}%`,
              top: `${b.y}%`
            }}
          />
        ))}

        {/* Winner Banner Overlay */}
        {winnerTeam && (
          <div className="absolute inset-0 z-40 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="p-6 rounded-3xl bg-slate-900 border-2 border-amber-400/80 text-center max-w-sm animate-in zoom-in-95">
              <Trophy className="w-12 h-12 text-amber-400 mx-auto mb-2 animate-bounce" />
              <h3 className="text-2xl font-black text-amber-300 font-display">
                {winnerTeam === 'blue' ? 'الفريق الأزرق هو البطل! 🏆🔵' : winnerTeam === 'red' ? 'الفريق الأحمر هو البطل! 🏆🔴' : 'تعادل حماسي بين الأبطال! 🤝'}
              </h3>
              <p className="text-xs text-slate-300 my-2">معركة تصادم أسطورية بين الفريقين!</p>
              <button
                onClick={handleReset}
                className="mt-2 py-2 px-6 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 transition-colors cursor-pointer"
              >
                جولة جديدة
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-2 p-2.5 bg-slate-900/90 border border-slate-800 rounded-2xl text-xs text-slate-300 flex items-center justify-between">
        <span>🔫 كل 2 تكبيسة تطلق رصاص ليزر على الفريق الآخر (لا يؤثر على أعضاء فريقك)!</span>
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
