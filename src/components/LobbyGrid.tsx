import React from 'react';
import { 
  Shuffle, 
  HelpCircle, 
  ListOrdered, 
  RotateCw, 
  Quote, 
  BrainCircuit, 
  Globe, 
  Users, 
  Printer, 
  Swords, 
  Eye, 
  Play,
  FileSpreadsheet,
  Flame,
  Hexagon
} from 'lucide-react';
import { GameId } from '../types';
import { soundEffects } from '../services/soundEffects';

interface LobbyGridProps {
  onSelectGame: (gameId: GameId) => void;
}

interface GameCardDef {
  id: GameId;
  title: string;
  tagline: string;
  badge: string;
  icon: React.ReactNode;
  gradient: string;
  borderGlow: string;
  hasExcel: boolean;
}

const GAMES_LIST: GameCardDef[] = [
  {
    id: 'scrambled_letters',
    title: 'لعبة الحروف المبعثرة',
    tagline: 'إعادة ترتيب الحروف المبعثرة لإيجاد الكلمة الصحيحة في التعليقات',
    badge: 'أسئلة وتخمين',
    icon: <Shuffle className="w-7 h-7 text-indigo-400" />,
    gradient: 'from-indigo-600/20 via-slate-900 to-slate-900',
    borderGlow: 'hover:border-indigo-500/80 hover:shadow-indigo-500/20',
    hasExcel: true
  },
  {
    id: 'guessing',
    title: 'لعبة التخمين والفوازير',
    tagline: 'وصف شيء أو لغز ذكي والإجابة بكلمة في تعليقات البث',
    badge: 'فوازير وألغاز',
    icon: <HelpCircle className="w-7 h-7 text-amber-400" />,
    gradient: 'from-amber-600/20 via-slate-900 to-slate-900',
    borderGlow: 'hover:border-amber-500/80 hover:shadow-amber-500/20',
    hasExcel: true
  },
  {
    id: 'write_things',
    title: 'لعبة أكتب أشياء عن (10 عناصر)',
    tagline: 'تحدي إيجاد 10 عناصر مرتبطة بالموضوع مع تسجيل اسم كل مجيب',
    badge: '10 عناصر تفاعلية',
    icon: <ListOrdered className="w-7 h-7 text-teal-400" />,
    gradient: 'from-teal-600/20 via-slate-900 to-slate-900',
    borderGlow: 'hover:border-teal-500/80 hover:shadow-teal-500/20',
    hasExcel: true
  },
  {
    id: 'roulette',
    title: 'لعبة عجلة الروليت',
    tagline: 'تدور عجلة الحظ وتقف على رقم سؤال مفاجئ للجمهور',
    badge: 'عجلة الحظ',
    icon: <RotateCw className="w-7 h-7 text-purple-400" />,
    gradient: 'from-purple-600/20 via-slate-900 to-slate-900',
    borderGlow: 'hover:border-purple-500/80 hover:shadow-purple-500/20',
    hasExcel: true
  },
  {
    id: 'proverbs',
    title: 'مسابقة الأمثال الشعبية',
    tagline: 'عرض شطر المثل والمطلوب إكمال الكلمة الناقصة في التعليقات',
    badge: 'أمثال وحكم',
    icon: <Quote className="w-7 h-7 text-rose-400" />,
    gradient: 'from-rose-600/20 via-slate-900 to-slate-900',
    borderGlow: 'hover:border-rose-500/80 hover:shadow-rose-500/20',
    hasExcel: true
  },
  {
    id: 'iq_game',
    title: 'لعبة الذكاء وسرعة البديهة',
    tagline: 'أسئلة منطق وخدع ذكاء تختبر سرعة البديهة والذاكرة',
    badge: 'ذكاء ومنطق',
    icon: <BrainCircuit className="w-7 h-7 text-cyan-400" />,
    gradient: 'from-cyan-600/20 via-slate-900 to-slate-900',
    borderGlow: 'hover:border-cyan-500/80 hover:shadow-cyan-500/20',
    hasExcel: true
  },
  {
    id: 'country_battle',
    title: 'تحدي البلاد العربية',
    tagline: 'اكتب اسم بلدك بالتعليقات وتنافس بالتكبيس والهدايا كل 30 ثانية',
    badge: '11 دولة عربية',
    icon: <Globe className="w-7 h-7 text-emerald-400" />,
    gradient: 'from-emerald-600/20 via-slate-900 to-slate-900',
    borderGlow: 'hover:border-emerald-500/80 hover:shadow-emerald-500/20',
    hasExcel: false
  },
  {
    id: 'tug_of_war',
    title: 'مسابقة شد الحبل',
    tagline: 'الأزرق يكتب y والأحمر يكتب r، والتكبيس والشير يحدد الفائز',
    badge: 'أزرق ضد أحمر',
    icon: <Users className="w-7 h-7 text-blue-400" />,
    gradient: 'from-blue-600/20 via-slate-900 to-slate-900',
    borderGlow: 'hover:border-blue-500/80 hover:shadow-blue-500/20',
    hasExcel: false
  },
  {
    id: 'printer',
    title: 'مسابقة الطباعة والشارات',
    tagline: 'اكتب t، وكل 300 تكبيسة أو وردة تطبع بطاقة الحساب على شاشة البث',
    badge: 'طباعة فورية',
    icon: <Printer className="w-7 h-7 text-amber-400" />,
    gradient: 'from-amber-600/20 via-slate-900 to-slate-900',
    borderGlow: 'hover:border-amber-500/80 hover:shadow-amber-500/20',
    hasExcel: false
  },
  {
    id: 'clash_arena',
    title: 'لعبة التصادم والرصاص',
    tagline: 'الأزرق 1 والأحمر 2، كل تكبيستين تطلق رصاص ليزر ومعركة تصادم حية',
    badge: 'قتال وتصادم',
    icon: <Swords className="w-7 h-7 text-rose-500" />,
    gradient: 'from-rose-600/20 via-slate-900 to-slate-900',
    borderGlow: 'hover:border-rose-500/80 hover:shadow-rose-500/20',
    hasExcel: false
  },
  {
    id: 'memory_cards',
    title: 'لعبة الذاكرة (100 مستوى)',
    tagline: '16 كارت مقلوب، تظهر 30 ثانية والجمهور يكتب رقمي الكارتين المتشابهين',
    badge: '100 مستوى تحدي',
    icon: <Eye className="w-7 h-7 text-fuchsia-400" />,
    gradient: 'from-fuchsia-600/20 via-slate-900 to-slate-900',
    borderGlow: 'hover:border-fuchsia-500/80 hover:shadow-fuchsia-500/20',
    hasExcel: false
  },
  {
    id: 'grand_challenge',
    title: 'لعبة التحدي الكبرى',
    tagline: 'أول 4 إجابات صحيحة تدخل خلايا النحل الأربع، ثم سؤال سرعة 15 ثانية حصري للمتأهلين',
    badge: 'خلايا النحل + سرعة',
    icon: <Hexagon className="w-7 h-7 text-amber-400" />,
    gradient: 'from-amber-600/20 via-slate-900 to-slate-900',
    borderGlow: 'hover:border-amber-500/80 hover:shadow-amber-500/20',
    hasExcel: true
  }
];

export const LobbyGrid: React.FC<LobbyGridProps> = ({ onSelectGame }) => {
  return (
    <div className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 lg:p-8 flex flex-col justify-center">
      {/* Hero Intro */}
      <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-bold mb-3 shadow-inner">
          <Flame className="w-4 h-4 text-rose-400 animate-pulse" />
          <span>منصة كاسبر للألعاب التفاعلية على تيك توك لايف</span>
        </div>

        <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white font-display tracking-tight leading-tight mb-3">
          حوّل بثك المباشر إلى عالم من الألعاب والتحديات 🎮🏆
        </h2>

        <p className="text-sm sm:text-base text-slate-300 font-medium leading-relaxed max-w-2xl mx-auto">
          اختر لعبتك، ودع جمهورك يشارك ويتنافس ويتفاعل لحظة بلحظة مع قراءة ذكية للتعليقات، استقبال الهدايا، احتساب النقاط، وإعلان الفائزين تلقائياً!
        </p>
      </div>

      {/* 11 Games Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        {GAMES_LIST.map((game) => (
          <div
            key={game.id}
            onClick={() => {
              soundEffects.playClick();
              onSelectGame(game.id);
            }}
            className={`group p-5 rounded-3xl bg-gradient-to-br ${game.gradient} border border-slate-800 shadow-xl flex flex-col justify-between cursor-pointer transition-all duration-200 hover:-translate-y-1 ${game.borderGlow}`}
          >
            <div>
              {/* Header inside card: Icon + Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-slate-800/80 border border-slate-700/60 shadow-md group-hover:scale-105 transition-transform">
                  {game.icon}
                </div>
                <div className="flex items-center gap-1.5">
                  {game.hasExcel && (
                    <span className="p-1 rounded-md bg-emerald-500/15 text-emerald-400" title="دعم شيتات إكسيل">
                      <FileSpreadsheet className="w-3.5 h-3.5" />
                    </span>
                  )}
                  <span className="text-[11px] font-bold text-slate-400 bg-slate-800/60 px-2 py-0.5 rounded-full border border-slate-700/50">
                    {game.badge}
                  </span>
                </div>
              </div>

              {/* Title & Description */}
              <h3 className="text-lg font-black text-white font-display group-hover:text-amber-300 transition-colors mb-2">
                {game.title}
              </h3>
              <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                {game.tagline}
              </p>
            </div>

            {/* Action Bottom */}
            <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 group-hover:text-white transition-colors">
                فتح اللعبة
              </span>
              <div className="w-8 h-8 rounded-xl bg-slate-800 group-hover:bg-amber-400 group-hover:text-slate-950 text-slate-300 flex items-center justify-center transition-all shadow-sm">
                <Play className="w-3.5 h-3.5 fill-current mr-0.5" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
