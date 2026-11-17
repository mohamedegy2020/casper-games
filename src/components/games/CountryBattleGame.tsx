import React, { useState, useEffect, useMemo } from 'react';
import { ArrowRight, Globe, Play, Pause, RotateCcw, Trophy, Users, Heart } from 'lucide-react';
import { useTikTokLive } from '../../context/TikTokLiveContext';
import { soundEffects } from '../../services/soundEffects';
import { normalizeArabic } from '../../utils/arabic';

interface CountryBattleGameProps {
  onBackToLobby: () => void;
  onOpenHonorBoard: () => void;
}

interface CountryData {
  id: string;
  name: string;
  flag: string;
  score: number;
  participants: Set<string>;
}

const INITIAL_COUNTRIES: Array<{ id: string; name: string; flag: string; aliases: string[] }> = [
  { id: 'egypt', name: 'مصر', flag: '🇪🇬', aliases: ['مصر', 'ام الدنيا', 'جمهورية مصر'] },
  { id: 'ksa', name: 'السعودية', flag: '🇸🇦', aliases: ['السعودية', 'المملكة', 'سعودية'] },
  { id: 'uae', name: 'الإمارات', flag: '🇦🇪', aliases: ['الامارات', 'امارات', 'دبي', 'ابوظبي'] },
  { id: 'jordan', name: 'الأردن', flag: '🇯🇴', aliases: ['الاردن', 'اردن', 'نشامى'] },
  { id: 'oman', name: 'عمان', flag: '🇴🇲', aliases: ['عمان', 'سلطنة عمان'] },
  { id: 'iraq', name: 'العراق', flag: '🇮🇶', aliases: ['العراق', 'عراق', 'بغداد'] },
  { id: 'morocco', name: 'المغرب', flag: '🇲🇦', aliases: ['المغرب', 'مغرب', 'اسود الاطلس'] },
  { id: 'syria', name: 'سوريا', flag: '🇸🇾', aliases: ['سوريا', 'شام', 'الشام'] },
  { id: 'palestine', name: 'فلسطين', flag: '🇵🇸', aliases: ['فلسطين', 'قدس', 'القدس', 'غزة'] },
  { id: 'tunisia', name: 'تونس', flag: '🇹🇳', aliases: ['تونس', 'نسور قرطاج'] },
  { id: 'libya', name: 'ليبيا', flag: '🇱🇾', aliases: ['ليبيا', 'طرابلس'] }
];

export const CountryBattleGame: React.FC<CountryBattleGameProps> = ({ onBackToLobby, onOpenHonorBoard }) => {
  const [roundDurationMinutes, setRoundDurationMinutes] = useState<3 | 5>(3);
  const [timeLeft, setTimeLeft] = useState<number>(3 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [secondsUntilReorder, setSecondsUntilReorder] = useState<number>(30);

  // Country scores and participants map
  const [countryStats, setCountryStats] = useState<Record<string, { score: number; participants: string[] }>>(() => {
    const init: Record<string, { score: number; participants: string[] }> = {};
    INITIAL_COUNTRIES.forEach(c => {
      init[c.id] = { score: Math.floor(Math.random() * 40), participants: [] };
    });
    return init;
  });

  // User-to-country mapping: username -> countryId
  const [userCountryMap, setUserCountryMap] = useState<Record<string, string>>({});

  const { comments, recentGifts, users, gameResetKey } = useTikTokLive();

  useEffect(() => {
    setIsRunning(false);
    setTimeLeft(roundDurationMinutes * 60);
    setSecondsUntilReorder(30);
    setUserCountryMap({});
    const init: Record<string, { score: number; participants: string[] }> = {};
    INITIAL_COUNTRIES.forEach(c => {
      init[c.id] = { score: 0, participants: [] };
    });
    setCountryStats(init);
  }, [gameResetKey]);

  // Round countdown timer
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

      // 30 seconds reorder indicator countdown
      setSecondsUntilReorder(prev => (prev <= 1 ? 30 : prev - 1));
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning]);

  // Handle incoming comments to join country
  useEffect(() => {
    if (comments.length === 0) return;
    const latest = comments[0];
    const norm = normalizeArabic(latest.text);

    // Check if user is typing a country name
    for (const c of INITIAL_COUNTRIES) {
      if (c.aliases.some(alias => norm.includes(normalizeArabic(alias)))) {
        // Register user to this country
        setUserCountryMap(prev => ({
          ...prev,
          [latest.user.username]: c.id
        }));

        setCountryStats(prev => {
          const current = prev[c.id] || { score: 0, participants: [] };
          if (!current.participants.includes(latest.user.username)) {
            return {
              ...prev,
              [c.id]: {
                ...current,
                score: current.score + 5,
                participants: [...current.participants, latest.user.username]
              }
            };
          }
          return prev;
        });
        break;
      }
    }
  }, [comments]);

  // Sync users taps & gifts to their assigned country
  useEffect(() => {
    if (!isRunning) return;

    // Check recent gifts
    if (recentGifts.length > 0) {
      const g = recentGifts[0];
      const assignedCountry = userCountryMap[g.user.username];
      if (assignedCountry) {
        const giftPoints = g.giftType === 'finger_heart' ? 100 : g.giftType === 'rose' ? 20 : 50;
        setCountryStats(prev => {
          const curr = prev[assignedCountry];
          if (!curr) return prev;
          return {
            ...prev,
            [assignedCountry]: {
              ...curr,
              score: curr.score + giftPoints
            }
          };
        });
      }
    }
  }, [recentGifts, userCountryMap, isRunning]);

  // Re-rank countries
  const sortedCountries = useMemo(() => {
    return INITIAL_COUNTRIES.map(c => ({
      ...c,
      score: countryStats[c.id]?.score || 0,
      participantCount: countryStats[c.id]?.participants?.length || 0
    })).sort((a, b) => b.score - a.score);
  }, [countryStats]);

  const handleStartRound = () => {
    soundEffects.playClick();
    if (timeLeft === 0) {
      setTimeLeft(roundDurationMinutes * 60);
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
    setSecondsUntilReorder(30);
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
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-black font-display text-white">
              تحدي وتنافس البلاد العربية
            </h2>
            <p className="text-[11px] text-slate-400">
              اكتب اسم بلدك في التعليقات واجمع التكبيسات والهدايا
            </p>
          </div>
        </div>
      </div>

      {/* Control Banner: Round Duration, Timer & Ranking Refresh */}
      <div className="p-3 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-wrap items-center justify-between gap-3 shadow-md mb-4">
        {/* Round Duration selector */}
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
                roundDurationMinutes === 3 ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
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
                roundDurationMinutes === 5 ? 'bg-emerald-500 text-slate-950 shadow-sm' : 'text-slate-400 hover:text-white'
              }`}
            >
              5 دقائق
            </button>
          </div>
        </div>

        {/* Timer Display */}
        <div className="flex items-center gap-2">
          <div className="text-xl sm:text-2xl font-black font-mono text-emerald-400 bg-slate-950 px-4 py-1 rounded-xl border border-emerald-500/30">
            {formatTime(timeLeft)}
          </div>
          <span className="text-[11px] text-slate-400">
            تحديث الترتيب خلال: <strong className="text-amber-400 font-mono">{secondsUntilReorder}ث</strong>
          </span>
        </div>

        {/* Action Buttons */}
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

      {/* Main Countries Grid */}
      <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3 my-2">
        {sortedCountries.map((country, idx) => {
          const isRank1 = idx === 0;
          const isRank2 = idx === 1;
          const isRank3 = idx === 2;

          return (
            <div
              key={country.id}
              className={`p-3 rounded-2xl border flex flex-col justify-between transition-all relative overflow-hidden ${
                isRank1
                  ? 'bg-gradient-to-br from-amber-500/20 via-slate-900 to-slate-900 border-amber-500 shadow-lg shadow-amber-500/10'
                  : isRank2
                  ? 'bg-slate-900/90 border-slate-600'
                  : isRank3
                  ? 'bg-slate-900/80 border-amber-800/40'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              {/* Rank Badge */}
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-black font-mono">
                  {isRank1 ? '🥇 المركز 1' : isRank2 ? '🥈 المركز 2' : isRank3 ? '🥉 المركز 3' : `#${idx + 1}`}
                </span>
                <span className="text-xl sm:text-2xl">{country.flag}</span>
              </div>

              {/* Country Name */}
              <h3 className="text-base sm:text-lg font-black text-white font-display mb-1">
                {country.name}
              </h3>

              {/* Score & Participant Stats */}
              <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1 text-slate-400">
                  <Users className="w-3.5 h-3.5" />
                  <span>{country.participantCount} لاعب</span>
                </div>

                <div className="flex items-center gap-1 font-mono font-bold text-emerald-400">
                  <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                  <span className="tabular-nums">{country.score}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Instructions Strip */}
      <div className="mt-3 p-3 bg-slate-900/90 border border-slate-800 rounded-2xl text-xs text-slate-300 flex flex-col sm:flex-row items-center justify-between gap-2 text-center">
        <span>
          📌 <strong>طريقة الاشتراك:</strong> اكتب اسم دولتك في التعليقات (مثال: مصر، السعودية، فلسطين...) لتبدأ تكبيساتك وهداياك في دعم بلدك!
        </span>
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
