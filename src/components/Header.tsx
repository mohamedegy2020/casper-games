import React from 'react';
import { 
  Gamepad2, 
  Radio, 
  UserCheck, 
  Maximize2, 
  Volume2, 
  VolumeX, 
  Settings, 
  Smartphone,
  Award
} from 'lucide-react';
import { useTikTokLive } from '../context/TikTokLiveContext';
import { soundEffects } from '../services/soundEffects';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenHonorBoard: () => void;
  isMobileHorizontal: boolean;
  onToggleMobileHorizontal: () => void;
  onToggleFullscreen: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSettings,
  onOpenHonorBoard,
  isMobileHorizontal,
  onToggleMobileHorizontal,
  onToggleFullscreen,
  soundEnabled,
  onToggleSound
}) => {
  const { 
    creatorUsername, 
    isConnected, 
    isFollowerOnly, 
    setIsFollowerOnly 
  } = useTikTokLive();

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/95 border-b border-slate-800 backdrop-blur-md px-3 sm:px-6 py-2.5 transition-all shadow-md">
      {/* Desktop Layout (hidden on small screens) */}
      <div className="hidden md:flex items-center justify-between gap-4">
        {/* Right (RTL right): Brand Name */}
        <div className="flex items-center gap-2.5 shrink-0">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-rose-500 via-purple-600 to-indigo-600 shadow-md shadow-rose-500/20 text-white">
            <Gamepad2 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white font-display">
              ألعاب كاسبر التفاعلية
            </h1>
            <p className="text-[10px] text-slate-400 font-medium -mt-0.5">
              منصة البث المباشر التفاعلي
            </p>
          </div>
        </div>

        {/* Center: TikTok Account Connection Status */}
        <div 
          onClick={() => {
            soundEffects.playClick();
            onOpenSettings();
          }}
          className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/90 border border-slate-700/80 hover:border-slate-600 transition-colors cursor-pointer group shadow-inner"
          title="انقر لتغيير حساب التيك توك أو إعدادات البث"
        >
          <span className="relative flex h-2.5 w-2.5">
            {isConnected && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            )}
            <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`} />
          </span>

          <Radio className="w-3.5 h-3.5 text-slate-400 group-hover:text-rose-400 transition-colors" />

          <span className="text-xs font-semibold text-slate-300">
            {isConnected ? 'متصل بحساب تيك توك:' : 'غير متصل:'}
          </span>

          <span className="text-xs font-bold font-mono text-rose-400 group-hover:text-rose-300" dir="ltr">
            @{creatorUsername}
          </span>

          <span className="text-[10px] text-slate-400 bg-slate-700/60 px-1.5 py-0.5 rounded-md">
            تغيير
          </span>
        </div>

        {/* Left (RTL left): Action Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Honor Board Quick Button */}
          <button
            onClick={() => {
              soundEffects.playClick();
              onOpenHonorBoard();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-amber-300 bg-amber-500/15 border border-amber-500/30 hover:bg-amber-500/25 transition-all cursor-pointer shadow-sm"
            title="لوحة الشرف وحساب نقاط اللاعبين"
          >
            <Award className="w-4 h-4 text-amber-400" />
            <span>لوحة الشرف</span>
          </button>

          {/* Follow Creator Toggle (زر متابعة المبدع) */}
          <button
            onClick={() => {
              soundEffects.playClick();
              setIsFollowerOnly((prev: boolean) => !prev);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
              isFollowerOnly
                ? 'bg-rose-500/25 border-rose-500/50 text-rose-300 shadow-sm shadow-rose-500/20'
                : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:text-white'
            }`}
            title="عند التفعيل: يشترط متابعة المبدع لاحتساب الإجابة الصحيحة والنقاط"
          >
            <UserCheck className={`w-4 h-4 ${isFollowerOnly ? 'text-rose-400' : 'text-slate-400'}`} />
            <span>متابعة المبدع: {isFollowerOnly ? 'مفعل' : 'الكل'}</span>
          </button>

          {/* Mobile Horizontal View (زر عرض الموبايل أفقي) */}
          <button
            onClick={() => {
              soundEffects.playClick();
              onToggleMobileHorizontal();
            }}
            className={`p-2 rounded-xl text-xs font-medium transition-all cursor-pointer border ${
              isMobileHorizontal
                ? 'bg-blue-500/25 border-blue-500/50 text-blue-300 shadow-sm'
                : 'bg-slate-800/80 border-slate-700 text-slate-400 hover:text-white'
            }`}
            title="زر عرض الموبايل أفقي"
          >
            <Smartphone className="w-4 h-4" />
          </button>

          {/* Fullscreen Toggle (زر لتكبير وتقليص الشاشة) */}
          <button
            onClick={() => {
              soundEffects.playClick();
              onToggleFullscreen();
            }}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
            title="تكبير وتصغير الشاشة (ملء الشاشة)"
          >
            <Maximize2 className="w-4 h-4" />
          </button>

          {/* Sound Toggle (زر للصوت) */}
          <button
            onClick={onToggleSound}
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-slate-800/80 border-slate-700 text-amber-400 hover:text-amber-300'
                : 'bg-slate-800/50 border-slate-800 text-slate-500'
            }`}
            title={soundEnabled ? 'كتم الصوت' : 'تشغيل المؤثرات الصوتية'}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Settings Button (زر للأعدادات) */}
          <button
            onClick={() => {
              soundEffects.playClick();
              onOpenSettings();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            title="إعدادات البث ومحاكي التفاعل"
          >
            <Settings className="w-4 h-4" />
            <span>الإعدادات</span>
          </button>
        </div>
      </div>

      {/* Mobile Layout (as specified: "على اليسار كاسبر وعلى اليسار زر الاعدادات، ملحوظة زر الاعدادات يكون فيه جميع الازرار لاعطاء مسافة للعبة") */}
      <div className="flex md:hidden items-center justify-between">
        {/* Brand "كاسبر" */}
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-tr from-rose-500 to-indigo-600 text-white">
            <Gamepad2 className="w-4 h-4" />
          </div>
          <span className="text-base font-black font-display text-white">
            كاسبر
          </span>
          <span className="text-[10px] font-mono text-rose-400 bg-rose-500/10 px-1.5 py-0.5 rounded-md" dir="ltr">
            @{creatorUsername}
          </span>
        </div>

        {/* Mobile Settings Button containing all actions to maximize gaming space */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => {
              soundEffects.playClick();
              onOpenHonorBoard();
            }}
            className="p-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold"
            title="لوحة الشرف"
          >
            <Award className="w-4 h-4" />
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              onOpenSettings();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs font-bold shadow-sm"
          >
            <Settings className="w-4 h-4 text-rose-400" />
            <span>الإعدادات</span>
          </button>
        </div>
      </div>
    </header>
  );
};
