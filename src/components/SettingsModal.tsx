import React, { useState } from 'react';
import { 
  X, 
  UserCheck, 
  Radio, 
  Volume2, 
  VolumeX, 
  Palette, 
  Award, 
  Sliders, 
  Send, 
  Heart, 
  Share2, 
  Repeat2, 
  Sparkles,
  Maximize2,
  RotateCcw,
  Trash2,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useTikTokLive } from '../context/TikTokLiveContext';
import { soundEffects } from '../services/soundEffects';
import { ThemeBackground } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenHonorBoard: () => void;
  currentTheme: ThemeBackground;
  onChangeTheme: (theme: ThemeBackground) => void;
  isMobileHorizontal: boolean;
  onToggleMobileHorizontal: () => void;
  onToggleFullscreen: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onOpenHonorBoard,
  currentTheme,
  onChangeTheme,
  isMobileHorizontal,
  onToggleMobileHorizontal,
  onToggleFullscreen,
  soundEnabled,
  onToggleSound
}) => {
  const {
    creatorUsername,
    setCreatorUsername,
    isConnected,
    connectionStatus,
    connectionMessage,
    connectTikTokAccount,
    disconnectTikTokAccount,
    isFollowerOnly,
    setIsFollowerOnly,
    isSimulationActive,
    setIsSimulationActive,
    resetActiveGame,
    resetHonorBoardAndVictory,
    addComment,
    addGift,
    addTap,
    addShare,
    addRepost,
    activeGame
  } = useTikTokLive();

  const [inputUsername, setInputUsername] = useState(creatorUsername);
  const [customComment, setCustomComment] = useState('');
  const [customCommentUser, setCustomCommentUser] = useState('مشاهد_تيكتوك');
  const [resetConfirmMsg, setResetConfirmMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConnect = async () => {
    soundEffects.playClick();
    if (inputUsername.trim()) {
      await connectTikTokAccount(inputUsername.trim());
    }
  };

  const handleDisconnect = async () => {
    soundEffects.playClick();
    await disconnectTikTokAccount();
  };

  const handleSendCustomComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customComment.trim()) return;
    soundEffects.playClick();
    addComment(customCommentUser, customComment.trim(), true);
    setCustomComment('');
  };

  const handleResetCurrentGame = () => {
    resetActiveGame();
    setResetConfirmMsg('تم تصفير اللعبة وإعادة تشغيلها من البداية بنجاح 🔄');
    setTimeout(() => setResetConfirmMsg(null), 3000);
  };

  const handleResetBoards = () => {
    if (window.confirm('هل أنت متأكد من تصفير ومسح لوحة الانتصار ولوحة الشرف وإعادة النقاط إلى الصفر؟')) {
      resetHonorBoardAndVictory();
      setResetConfirmMsg('تم تصفير ومسح لوحة الشرف ولوحة الانتصار بنجاح 🗑️');
      setTimeout(() => setResetConfirmMsg(null), 3000);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-2xl max-h-[92vh] bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl flex flex-col text-white overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/90">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 text-white">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-black font-display text-white">
                إعدادات البث وغرفة التحكم
              </h2>
              <p className="text-xs text-slate-400">
                التحكم بالاتصال بالتيك توك وتصفير الألعاب ولوحات الشرف
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert if reset happened */}
        {resetConfirmMsg && (
          <div className="px-6 py-2.5 bg-emerald-500/20 border-b border-emerald-500/40 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{resetConfirmMsg}</span>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
          {/* Section 1: TikTok Account Connection */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-rose-300 flex items-center gap-2">
                <Radio className="w-4 h-4 text-rose-400" />
                <span>ربط والاتصال بحساب تيك توك لايف</span>
              </h3>
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                isConnected 
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                  : connectionStatus === 'connecting'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}>
                {connectionStatus === 'connecting' && <Loader2 className="w-3 h-3 animate-spin" />}
                {isConnected ? 'متصل بالبث المباشر 🟢' : connectionStatus === 'connecting' ? 'جاري الاتصال... 🟡' : 'غير متصل ⚪'}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <span className="absolute inset-y-0 right-3 flex items-center text-slate-400 font-mono" dir="ltr">
                  @
                </span>
                <input
                  type="text"
                  value={inputUsername}
                  onChange={(e) => setInputUsername(e.target.value)}
                  placeholder="اسم مستخدم التيك توك (مثال: casper_live)"
                  className="w-full pr-8 pl-3 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:border-rose-500 font-mono text-right"
                  dir="ltr"
                />
              </div>
              <button
                onClick={handleConnect}
                disabled={connectionStatus === 'connecting'}
                className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                {connectionStatus === 'connecting' ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>جاري الاتصال...</span>
                  </>
                ) : (
                  <span>اتصال بالحساب 📡</span>
                )}
              </button>
              {isConnected && (
                <button
                  onClick={handleDisconnect}
                  className="px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-red-300 font-bold text-xs rounded-xl border border-red-500/30 transition-colors"
                >
                  قطع الاتصال
                </button>
              )}
            </div>

            {/* Connection Status Log / Message */}
            <div className={`p-2.5 rounded-xl text-xs flex items-center gap-2 border ${
              isConnected
                ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
                : connectionStatus === 'error'
                ? 'bg-red-950/40 border-red-500/30 text-red-300'
                : 'bg-slate-950/60 border-slate-800 text-slate-400'
            }`}>
              {isConnected ? (
                <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
              )}
              <span className="leading-relaxed">{connectionMessage}</span>
            </div>
          </div>

          {/* Section 2: Reset & Clearing Controls (Requirement 5) */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
            <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-400" />
              <span>إدارة وتصفير الألعاب ولوحات الشرف</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Button 1: Reset Current Game */}
              <button
                onClick={handleResetCurrentGame}
                className="p-3.5 rounded-2xl bg-amber-500/15 border border-amber-500/40 hover:bg-amber-500/25 text-amber-200 transition-all flex items-center gap-3 text-right cursor-pointer shadow-sm group"
              >
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 group-hover:scale-105 transition-transform">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">تصفير اللعبة والبدء من الأول</div>
                  <div className="text-[11px] text-amber-300/80">
                    إعادة ضبط أسئلة ونقاط الجولة الحالية للصفر والبدء مجدداً
                  </div>
                </div>
              </button>

              {/* Button 2: Reset/Clear Honor Board & Victory */}
              <button
                onClick={handleResetBoards}
                className="p-3.5 rounded-2xl bg-rose-500/15 border border-rose-500/40 hover:bg-rose-500/25 text-rose-200 transition-all flex items-center gap-3 text-right cursor-pointer shadow-sm group"
              >
                <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 group-hover:scale-105 transition-transform">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white">تصفير ومسح لوحة الانتصار والشرف</div>
                  <div className="text-[11px] text-rose-300/80">
                    مسح كافة نقاط التكبيس والشير وإعادة كل الحسابات للصفر
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Section 3: Quick Toggles (Follower filter, Sound, Horizontal, Fullscreen) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Follower Only Rule */}
            <div 
              onClick={() => {
                soundEffects.playClick();
                setIsFollowerOnly(!isFollowerOnly);
              }}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                isFollowerOnly 
                  ? 'bg-rose-500/15 border-rose-500/40 text-rose-200' 
                  : 'bg-slate-800/50 border-slate-700/60 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <UserCheck className={`w-5 h-5 ${isFollowerOnly ? 'text-rose-400' : 'text-slate-400'}`} />
                <div>
                  <div className="text-xs font-bold">متابعة المبدع (حصري للمتابعين)</div>
                  <div className="text-[11px] text-slate-400">
                    {isFollowerOnly ? 'مفعل: فقط المتابعون يحسب لهم الفوز والنقاط' : 'معطل: متاح للجميع'}
                  </div>
                </div>
              </div>
              <div className={`w-10 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${isFollowerOnly ? 'bg-rose-500' : 'bg-slate-700'}`}>
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${isFollowerOnly ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </div>

            {/* Sound Toggle */}
            <div 
              onClick={onToggleSound}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                soundEnabled 
                  ? 'bg-amber-500/15 border-amber-500/40 text-amber-200' 
                  : 'bg-slate-800/50 border-slate-700/60 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                {soundEnabled ? (
                  <Volume2 className="w-5 h-5 text-amber-400" />
                ) : (
                  <VolumeX className="w-5 h-5 text-slate-400" />
                )}
                <div>
                  <div className="text-xs font-bold">المؤثرات الصوتية</div>
                  <div className="text-[11px] text-slate-400">
                    {soundEnabled ? 'مفعلة مع أصوات الفوز والتنبيه' : 'مكتومة'}
                  </div>
                </div>
              </div>
              <div className={`w-10 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${soundEnabled ? 'bg-amber-500' : 'bg-slate-700'}`}>
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${soundEnabled ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </div>

            {/* Mobile Horizontal View Mode */}
            <div 
              onClick={onToggleMobileHorizontal}
              className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                isMobileHorizontal 
                  ? 'bg-blue-500/15 border-blue-500/40 text-blue-200' 
                  : 'bg-slate-800/50 border-slate-700/60 text-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <span className="text-lg">📱</span>
                <div>
                  <div className="text-xs font-bold">عرض الموبايل أفقي (Landscape)</div>
                  <div className="text-[11px] text-slate-400">
                    {isMobileHorizontal ? 'مفعل: مخصص للبث الأفقي' : 'عرض عادي'}
                  </div>
                </div>
              </div>
              <div className={`w-10 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${isMobileHorizontal ? 'bg-blue-500' : 'bg-slate-700'}`}>
                <div className={`w-5 h-5 rounded-full bg-white transition-transform ${isMobileHorizontal ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </div>

            {/* Fullscreen Button */}
            <div 
              onClick={onToggleFullscreen}
              className="p-3.5 rounded-2xl bg-slate-800/50 border border-slate-700/60 text-slate-300 hover:text-white transition-all cursor-pointer flex items-center justify-between"
            >
              <div className="flex items-center gap-2.5">
                <Maximize2 className="w-5 h-5 text-indigo-400" />
                <div>
                  <div className="text-xs font-bold">ملء الشاشة</div>
                  <div className="text-[11px] text-slate-400">تكبير أو تصغير الشاشة للبث</div>
                </div>
              </div>
              <span className="text-xs px-2.5 py-1 rounded-md bg-slate-700 text-slate-200">
                تبديل
              </span>
            </div>
          </div>

          {/* Section 4: Animated Background Themes */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
            <h3 className="text-sm font-bold text-amber-300 flex items-center gap-2">
              <Palette className="w-4 h-4 text-amber-400" />
              <span>خلفية وأجواء اللعبة المتحركة</span>
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {[
                { id: 'cyber', name: 'السايبر نيون', color: 'from-fuchsia-900 via-purple-950 to-slate-950' },
                { id: 'space', name: 'الفضاء والمجرة', color: 'from-blue-950 via-indigo-950 to-black' },
                { id: 'arena', name: 'الاستاد الرياضي', color: 'from-emerald-950 via-slate-900 to-black' },
                { id: 'violet', name: 'البنفسج الملكي', color: 'from-purple-950 via-violet-900 to-slate-950' },
                { id: 'midnight', name: 'ميدنايت دارك', color: 'from-slate-950 via-gray-950 to-black' },
              ].map(theme => (
                <button
                  key={theme.id}
                  onClick={() => {
                    soundEffects.playClick();
                    onChangeTheme(theme.id as ThemeBackground);
                  }}
                  className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                    currentTheme === theme.id
                      ? 'border-amber-400 ring-2 ring-amber-400/30 text-white'
                      : 'border-slate-700 text-slate-400 hover:text-white'
                  }`}
                >
                  <div className={`w-full h-8 rounded-lg bg-gradient-to-br ${theme.color}`} />
                  <span>{theme.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Section 5: Live Audience Test Simulator & Manual Injection (Requirement 3: Default is OFF) */}
          <div className="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <div>
                  <span className="text-sm font-bold text-yellow-300 block">
                    محاكي التفاعل التجريبي
                  </span>
                  <span className="text-[11px] text-slate-400">
                    الوضع الطبيعي: غير فعّال (للاستخدام فقط عند رغبة المبدع في اختبار الألعاب)
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  soundEffects.playClick();
                  setIsSimulationActive(!isSimulationActive);
                }}
                className={`px-3 py-1.5 text-xs rounded-xl font-bold transition-colors cursor-pointer ${
                  isSimulationActive 
                    ? 'bg-yellow-400 text-slate-950 hover:bg-yellow-300' 
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {isSimulationActive ? 'المحاكي: شغال 🟢' : 'المحاكي: متوقف ⚪'}
              </button>
            </div>

            {/* Quick Interactive Triggers */}
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                onClick={() => {
                  soundEffects.playClick();
                  addTap('ahmed_gamer', 10);
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-300 hover:bg-rose-500/30 text-xs font-bold cursor-pointer"
              >
                <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                <span>+10 تكبيس</span>
              </button>

              <button
                onClick={() => {
                  soundEffects.playClick();
                  addShare('nour_egypt', 5);
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-500/20 border border-blue-500/40 text-blue-300 hover:bg-blue-500/30 text-xs font-bold cursor-pointer"
              >
                <Share2 className="w-3.5 h-3.5 text-blue-400" />
                <span>+5 شير</span>
              </button>

              <button
                onClick={() => {
                  soundEffects.playClick();
                  addRepost('faisal_ksa');
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/30 text-xs font-bold cursor-pointer"
              >
                <Repeat2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>إعادة نشر (5 نقاط)</span>
              </button>

              <button
                onClick={() => {
                  soundEffects.playClick();
                  addGift('sara_live', 'rose', 1);
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-600/30 border border-rose-500/50 text-rose-200 hover:bg-rose-600/40 text-xs font-bold cursor-pointer"
              >
                <span>🌹 إرسال وردة (تلميح)</span>
              </button>

              <button
                onClick={() => {
                  soundEffects.playClick();
                  addGift('ahmed_gamer', 'finger_heart', 1);
                }}
                className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-500/30 border border-amber-400/50 text-amber-200 hover:bg-amber-500/40 text-xs font-bold cursor-pointer"
              >
                <span>🫰 إرسال فنجر هارت (إجابة)</span>
              </button>
            </div>

            {/* Custom Comment Input */}
            <form onSubmit={handleSendCustomComment} className="flex gap-2 pt-2">
              <input
                type="text"
                value={customCommentUser}
                onChange={(e) => setCustomCommentUser(e.target.value)}
                placeholder="اسم الحساب"
                className="w-28 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
              />
              <input
                type="text"
                value={customComment}
                onChange={(e) => setCustomComment(e.target.value)}
                placeholder="اكتب تعليق مباشر للتجربة (مثال: كوكب، حاسب، 1 2)..."
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white"
              />
              <button
                type="submit"
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>إرسال</span>
              </button>
            </form>
          </div>
        </div>

        {/* Footer with Honor Board Action */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-slate-950">
          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
              onOpenHonorBoard();
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
          >
            <Award className="w-4 h-4" />
            <span>عرض لوحة الشرف</span>
          </button>

          <button
            onClick={() => {
              soundEffects.playClick();
              onClose();
            }}
            className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition-colors"
          >
            إغلاق
          </button>
        </div>
      </div>
    </div>
  );
};
