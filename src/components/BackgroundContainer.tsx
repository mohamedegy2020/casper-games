import React from 'react';
import { ThemeBackground } from '../types';

interface BackgroundContainerProps {
  theme: ThemeBackground;
  children: React.ReactNode;
}

export const BackgroundContainer: React.FC<BackgroundContainerProps> = ({ theme, children }) => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950 text-slate-100 flex flex-col">
      {/* Background Layer according to theme */}
      {theme === 'cyber' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-950/40 via-slate-950 to-slate-950" />
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-fuchsia-600/15 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px] animate-pulse" />
          <div className="absolute bottom-0 inset-x-0 h-64 bg-gradient-to-t from-fuchsia-950/20 to-transparent" />
        </div>
      )}

      {theme === 'space' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-indigo-950/50 via-slate-950 to-black" />
          <div className="absolute top-10 left-1/4 w-80 h-80 bg-blue-600/15 rounded-full blur-[130px]" />
          <div className="absolute bottom-1/4 right-10 w-96 h-96 bg-violet-600/15 rounded-full blur-[140px]" />
        </div>
      )}

      {theme === 'arena' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-emerald-950/40 via-slate-950 to-slate-950" />
          <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-emerald-500/10 to-transparent" />
          <div className="absolute -bottom-20 left-1/3 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px]" />
        </div>
      )}

      {theme === 'violet' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-purple-950/50 via-slate-950 to-slate-950" />
          <div className="absolute top-20 right-1/4 w-96 h-96 bg-purple-600/20 rounded-full blur-[140px]" />
        </div>
      )}

      {theme === 'midnight' && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/60 via-slate-950 to-black" />
          <div className="absolute top-1/4 left-1/3 w-80 h-80 bg-slate-700/10 rounded-full blur-[100px]" />
        </div>
      )}

      {/* Content Layer */}
      <div className="relative z-10 flex-1 flex flex-col">
        {children}
      </div>
    </div>
  );
};
