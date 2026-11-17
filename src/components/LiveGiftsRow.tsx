import React from 'react';
import { Gift } from 'lucide-react';
import { useTikTokLive } from '../context/TikTokLiveContext';

export const LiveGiftsRow: React.FC = () => {
  const { recentGifts, activeGame } = useTikTokLive();

  // If no gifts, provide helpful placeholder stream
  const displayGifts = recentGifts.length > 0 ? recentGifts : [
    {
      id: 'default_1',
      user: { nickname: 'أحمد', username: 'ahmed' },
      giftName: 'وردة (تلميح)',
      giftIcon: '🌹',
      repeatCount: 1
    },
    {
      id: 'default_2',
      user: { nickname: 'سارة', username: 'sara' },
      giftName: 'فنجر هارت (إظهار الإجابة والانتصار)',
      giftIcon: '🫰',
      repeatCount: 1
    },
    {
      id: 'default_3',
      user: { nickname: 'فيصل', username: 'faisal' },
      giftName: 'عملة (تلميح)',
      giftIcon: '🪙',
      repeatCount: 5
    }
  ];

  return (
    <div className="w-full bg-slate-900/90 border-y border-slate-800/80 backdrop-blur-md overflow-hidden py-1.5 px-0 flex items-center z-30 shadow-inner">
      {/* Full-width single-row moving slowly from left to right */}
      <div className="w-full overflow-hidden relative">
        <div className="animate-scroll-gifts flex items-center gap-3">
          {/* Render doubled for seamless loop */}
          {[...displayGifts, ...displayGifts, ...displayGifts].map((item, idx) => (
            <div
              key={`${item.id}-${idx}`}
              className="flex items-center gap-2 px-3 py-1 rounded-full bg-slate-800/90 border border-slate-700/60 text-xs whitespace-nowrap shadow-sm hover:border-amber-400/50 transition-colors"
            >
              <span className="text-base">{item.giftIcon}</span>
              <span className="font-bold text-amber-300">{item.giftName}</span>
              <span className="text-slate-400">من</span>
              <span className="font-semibold text-slate-200">{item.user.nickname}</span>
              {item.repeatCount > 1 && (
                <span className="px-1.5 py-0.5 rounded-full bg-rose-500 text-white font-mono text-[10px] font-bold">
                  x{item.repeatCount}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
