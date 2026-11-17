import React, { useRef } from 'react';
import { ChevronRight, ChevronLeft, Lightbulb, CheckCircle2, Download, Upload } from 'lucide-react';
import { soundEffects } from '../services/soundEffects';
import { useTikTokLive } from '../context/TikTokLiveContext';
import { GameId, QuestionItem } from '../types';
import { downloadSampleExcel, parseUploadedExcel } from '../services/excelService';

interface StandardGameControlsProps {
  gameId: GameId;
  gameTitle: string;
  currentIndex: number;
  totalQuestions: number;
  onPrev: () => void;
  onNext: () => void;
  onShowHint: () => void;
  onShowAnswer: () => void;
  onQuestionsUploaded?: (newQuestions: QuestionItem[]) => void;
  isWriteThings?: boolean;
}

export const StandardGameControls: React.FC<StandardGameControlsProps> = ({
  gameId,
  gameTitle,
  currentIndex,
  totalQuestions,
  onPrev,
  onNext,
  onShowHint,
  onShowAnswer,
  onQuestionsUploaded,
  isWriteThings = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { isConnected } = useTikTokLive();

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onQuestionsUploaded) return;

    try {
      const parsed = await parseUploadedExcel(file, isWriteThings);
      onQuestionsUploaded(parsed);
      soundEffects.playVictory();
      alert(`تم تحميل ${parsed.length} سؤال بنجاح من الشيت! 📊🎯`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'فشل قراءة الملف';
      alert(`حدث خطأ أثناء قراءة الملف: ${msg}`);
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-lg backdrop-blur-md">
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".xlsx,.xls,.csv"
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* Excel Actions: Sample Download & Sheet Upload */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
        <button
          onClick={() => {
            soundEffects.playClick();
            downloadSampleExcel(gameId, gameTitle);
          }}
          className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors cursor-pointer"
          title="تحميل شيت إكسيل استرشادي للأسئلة"
        >
          <Download className="w-3.5 h-3.5 text-emerald-400" />
          <span>شيت استرشادي</span>
        </button>

        {onQuestionsUploaded && (
          <button
            onClick={() => {
              soundEffects.playClick();
              fileInputRef.current?.click();
            }}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded-xl border border-slate-700 transition-colors cursor-pointer"
            title="رفع شيت إكسيل بأسئلتك الخاصة"
          >
            <Upload className="w-3.5 h-3.5 text-blue-400" />
            <span>رفع شيت أسئلة</span>
          </button>
        )}

        <div className="text-xs font-mono text-slate-400 px-2 py-1 bg-slate-950/60 rounded-lg border border-slate-800 tabular-nums">
          {currentIndex + 1} / {totalQuestions}
        </div>
      </div>

      {/* 4 Standard Action Buttons: السابق - تلميح - الاجابة - التالى */}
      <div className="flex items-center gap-2 w-full sm:w-auto justify-center">
        {/* Previous */}
        <button
          onClick={() => {
            soundEffects.playClick();
            onPrev();
          }}
          disabled={currentIndex <= 0}
          className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer border border-slate-700"
        >
          <ChevronRight className="w-4 h-4" />
          <span>السابق</span>
        </button>

        {/* Hint (تلميح) */}
        <button
          onClick={() => {
            onShowHint();
          }}
          className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-amber-950 bg-gradient-to-r from-amber-400 to-yellow-300 hover:from-amber-300 hover:to-yellow-200 shadow-sm shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
          title="إظهار التلميح للمشاهدين أو بوردة/عملة"
        >
          <Lightbulb className="w-4 h-4 fill-amber-950" />
          <span>تلميح (💡)</span>
        </button>

        {/* Answer (الاجابة) */}
        <button
          onClick={() => {
            onShowAnswer();
          }}
          className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-emerald-950 bg-gradient-to-r from-emerald-400 to-teal-300 hover:from-emerald-300 hover:to-teal-200 shadow-sm shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer"
          title="كشف الإجابة أو بفنجر هارت"
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>الإجابة (🫰)</span>
        </button>

        {/* Next */}
        <button
          onClick={() => {
            soundEffects.playClick();
            onNext();
          }}
          disabled={currentIndex >= totalQuestions - 1}
          className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer border border-slate-700"
        >
          <span>التالي</span>
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
