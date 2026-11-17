import React from 'react';
import { MessageSquareText } from 'lucide-react';
import { useTikTokLive } from '../context/TikTokLiveContext';

export const HorizontalCommentsBar: React.FC = () => {
  const { comments } = useTikTokLive();

  const recentComments = comments.slice(0, 15);

  return (
    <div className="w-full bg-slate-950/90 border-t border-slate-800/80 backdrop-blur-md px-3 py-2 flex items-center gap-3 z-30 shrink-0">
      {/* Label */}
      <div className="flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold whitespace-nowrap">
        <MessageSquareText className="w-3.5 h-3.5 text-indigo-400" />
        <span className="hidden sm:inline">إجابات الجمهور:</span>
        <span className="sm:hidden">التعليقات:</span>
      </div>

      {/* Horizontal scrolling stream of audience answers */}
      <div className="flex-1 overflow-x-auto no-scrollbar flex items-center gap-2.5 scroll-smooth py-0.5">
        {recentComments.length === 0 ? (
          <span className="text-xs text-slate-500 whitespace-nowrap">
            في انتظار إجابات وتعليقات الجمهور على البث...
          </span>
        ) : (
          recentComments.map((comment) => (
            <div
              key={comment.id}
              className="flex items-center gap-2 px-3 py-1 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 text-xs shrink-0 whitespace-nowrap shadow-sm transition-all"
            >
              <img
                src={comment.user.avatarUrl}
                alt={comment.user.nickname}
                className="w-5 h-5 rounded-full object-cover bg-slate-800"
                referrerPolicy="no-referrer"
              />
              <span className="font-semibold text-slate-300 max-w-[100px] truncate">
                {comment.user.nickname}:
              </span>
              <span className="font-bold text-white bg-slate-800/80 px-2 py-0.5 rounded-md text-[13px] border border-slate-700/50">
                {comment.text}
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
