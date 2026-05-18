'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';

export interface QuizQuestion {
  _id: string;
  question: string;
  options: string[];
  correctAnswer: number; // 1-4
  explanation?: string;
  isBonus: boolean;
  difficulty: number;
}

export interface QuizAnswer {
  questionId: string;
  selectedAnswer: number;
}

interface QuizEngineProps {
  questions: QuizQuestion[];
  mode: 'training' | 'exam';
  title: string;
  onComplete: (answers: QuizAnswer[]) => void;
}

// Durée du timer selon le mode (en secondes)
const TIMER_DURATION = { training: 20, exam: 20 } as const;

// Cercle SVG animé qui représente le compte à rebours
function CircleTimer({ timeLeft, total }: { timeLeft: number; total: number }) {
  const r = 14;
  const circ = 2 * Math.PI * r;
  const ratio = timeLeft / total;
  const offset = circ * (1 - ratio);
  const color = ratio > 0.6 ? '#10b981' : ratio > 0.3 ? '#f59e0b' : '#ef4444';

  return (
    <div className="relative w-9 h-9 shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r={r} fill="none" stroke="#e5e7eb" strokeWidth="2.5" />
        <circle
          cx="18" cy="18" r={r} fill="none"
          stroke={color} strokeWidth="2.5"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.4s' }}
        />
      </svg>
      <span
        className="absolute inset-0 flex items-center justify-center text-xs font-bold"
        style={{ color }}
      >
        {timeLeft}
      </span>
    </div>
  );
}

export function QuizEngine({ questions, mode, title, onComplete }: QuizEngineProps) {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const t = useTranslations('quiz.engine');

  // Mélange les options une fois à l'init — empêche de mémoriser la position de la réponse
  // _originalIndexMap[i] = index original (1-4) de l'option affichée à la position i (0-indexé)
  // Nécessaire pour soumettre l'index ORIGINAL au backend (qui compare avec q.correctAnswer DB)
  const shuffledQuestions = useMemo<(QuizQuestion & { _originalIndexMap: number[] })[]>(() => {
    return questions.map(q => {
      const pairs = q.options.map((opt, i) => ({ opt, originalIndex: i + 1 }));
      for (let i = pairs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [pairs[i], pairs[j]] = [pairs[j], pairs[i]];
      }
      return {
        ...q,
        options: pairs.map(p => p.opt),
        correctAnswer: pairs.findIndex(p => p.originalIndex === q.correctAnswer) + 1,
        _originalIndexMap: pairs.map(p => p.originalIndex),
      };
    });
  }, [questions]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);

  const duration = TIMER_DURATION[mode];
  const [timeLeft, setTimeLeft] = useState<number>(duration);

  // Compte à rebours — s'arrête dès que le feedback est affiché
  useEffect(() => {
    if (showFeedback) return;
    if (timeLeft <= 0) {
      // -1 = timeout (aucune option sélectionnée) — converti en 0 lors du submit
      setSelectedAnswer(-1);
      setShowFeedback(true);
      return;
    }
    const id = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [timeLeft, showFeedback]);

  const handleQuit = () => {
    const confirmed = window.confirm(
      mode === 'exam' ? t('quitConfirmExam') : t('quitConfirmTraining')
    );
    if (confirmed) router.push(`/${locale}/categories`);
  };

  const current = shuffledQuestions[currentIndex];
  const isLast = currentIndex === shuffledQuestions.length - 1;
  const progress = ((currentIndex + (showFeedback ? 1 : 0)) / shuffledQuestions.length) * 100;

  const handleSelect = (optNum: number) => {
    if (showFeedback) return;
    setSelectedAnswer(optNum);
    setShowFeedback(true);
  };

  const handleNext = () => {
    // Convertit l'index mélangé (1-4) en index original DB (1-4)
    // Si timeout (-1) ou pas de réponse → 0 (jamais égal à correctAnswer 1-4 → toujours faux)
    const originalSelected = selectedAnswer !== null && selectedAnswer > 0
      ? current._originalIndexMap[selectedAnswer - 1]
      : 0;
    const newAnswers = [...answers, { questionId: current._id, selectedAnswer: originalSelected }];
    setAnswers(newAnswers);
    if (isLast) { onComplete(newAnswers); return; }
    // Reset le timer ici — évite que l'effet countdown relance avec timeLeft=0
    setTimeLeft(duration);
    setCurrentIndex((i) => i + 1);
    setSelectedAnswer(null);
    setShowFeedback(false);
  };

  const isTimeout = selectedAnswer === -1;
  const isCorrect = !isTimeout && selectedAnswer === current.correctAnswer;

  const getOptionStyle = (i: number) => {
    const opt = i + 1;
    if (!showFeedback) {
      return selectedAnswer === opt
        ? 'bg-amber-50 border-amber-400 text-amber-900'
        : 'bg-white border-stone-300 hover:border-stone-400 hover:bg-stone-50';
    }
    if (opt === current.correctAnswer) return 'bg-emerald-50 border-emerald-400 text-emerald-900';
    // selectedAnswer === -1 = timeout : aucune option marquée en rouge
    if (opt === selectedAnswer && !isTimeout) return 'bg-rose-50 border-rose-400 text-rose-900';
    return 'bg-white border-stone-200 text-stone-300';
  };

  const getLetterStyle = (i: number) => {
    const opt = i + 1;
    if (!showFeedback) return selectedAnswer === opt ? 'bg-amber-400 text-white' : 'bg-stone-100 text-stone-500';
    if (opt === current.correctAnswer) return 'bg-emerald-500 text-white';
    if (opt === selectedAnswer && !isTimeout) return 'bg-rose-500 text-white';
    return 'bg-stone-100 text-stone-300';
  };

  // Fond et barre selon le mode
  const bg          = mode === 'exam' ? 'bg-amber-50'   : 'bg-emerald-50';
  const barColor    = mode === 'exam' ? 'bg-amber-400'  : 'bg-emerald-500';
  const btnColor    = mode === 'exam' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-700';
  const modeLabel   = mode === 'exam' ? `🏆 ${t('modeExam')}` : `🏋️ ${t('modeTraining')}`;
  const labelColor  = mode === 'exam' ? 'text-amber-700' : 'text-emerald-700';

  return (
    <div className={`min-h-screen ${bg} flex items-center justify-center px-2 py-3 sm:p-4`}>
      <div className="w-full max-w-2xl">

        {/* Barre de navigation — Quitter masqué sur mobile, visible sur sm+ */}
        <div className="hidden sm:flex items-center justify-between mb-4">
          <button
            onClick={handleQuit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-stone-500 hover:text-stone-700 hover:bg-white/70 transition-all text-sm font-medium cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            {t('quit')}
          </button>
          <LanguageSwitcher />
        </div>

        {/* Sur mobile : LanguageSwitcher seul en haut à droite */}
        <div className="flex sm:hidden justify-end mb-3">
          <LanguageSwitcher />
        </div>

        {/* Header progression */}
        <div className="mb-4 sm:mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-xs sm:text-sm font-bold uppercase tracking-wide ${labelColor}`}>
              {modeLabel} — {title}
            </span>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-bold text-stone-400">
                {currentIndex + 1} / {shuffledQuestions.length}
              </span>
              {/* Timer circulaire — masqué pendant le feedback */}
              {!showFeedback && <CircleTimer timeLeft={timeLeft} total={duration} />}
            </div>
          </div>
          <div className="h-1.5 sm:h-2 bg-stone-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${barColor} rounded-full transition-all duration-500`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Carte question */}
        <div className="bg-white rounded-3xl shadow-xl shadow-stone-300 border border-stone-100 p-3 sm:p-8 mb-3 sm:mb-4">
          <div className="flex gap-2 mb-3 sm:mb-5">
            {current.isBonus && (
              <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                ⭐ BONUS
              </span>
            )}
            <span className="px-2 py-0.5 sm:px-3 sm:py-1 bg-stone-100 text-stone-500 text-xs font-semibold rounded-full">
              {'⚡'.repeat(current.difficulty)}
            </span>
          </div>

          <h2 className="text-base sm:text-xl font-bold text-stone-800 mb-5 sm:mb-8 leading-relaxed">
            {current.question}
          </h2>

          <div className="space-y-2 sm:space-y-3">
            {current.options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleSelect(i + 1)}
                disabled={showFeedback}
                className={`
                  w-full text-left px-3 py-2.5 sm:px-5 sm:py-4 rounded-2xl border-2 font-medium
                  transition-all duration-200 flex items-center gap-2 sm:gap-3 text-sm sm:text-base
                  ${getOptionStyle(i)}
                  ${!showFeedback ? 'cursor-pointer active:scale-[0.99]' : 'cursor-default'}
                `}
              >
                <span className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-bold shrink-0 transition-colors ${getLetterStyle(i)}`}>
                  {['A', 'B', 'C', 'D'][i]}
                </span>
                <span>{option}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Feedback */}
        {showFeedback && (
          <div className={`rounded-2xl p-3 sm:p-5 border ${
            isCorrect   ? 'bg-emerald-50 border-emerald-200' :
            isTimeout   ? 'bg-amber-50 border-amber-200'     :
                          'bg-rose-50 border-rose-200'
          }`}>
            <div className="flex items-start gap-2 sm:gap-3">
              <span className="text-lg sm:text-2xl">
                {isCorrect ? '✅' : isTimeout ? '⏰' : '❌'}
              </span>
              <div className="flex-1">
                <p className={`font-bold text-sm sm:text-lg ${
                  isCorrect ? 'text-emerald-700' : isTimeout ? 'text-amber-700' : 'text-rose-700'
                }`}>
                  {isCorrect ? t('correct') : isTimeout ? t('timeUp') : t('incorrect')}
                </p>
                {/* Montre la bonne réponse si incorrect ou timeout */}
                {!isCorrect && (
                  <p className="text-xs sm:text-sm text-stone-600 mt-1">
                    {t('correctAnswerLabel')} <strong>{current.options[current.correctAnswer - 1]}</strong>
                  </p>
                )}
                {current.explanation && (
                  <p className="text-xs sm:text-sm text-stone-500 mt-1.5 sm:mt-2 italic">💡 {current.explanation}</p>
                )}
              </div>
            </div>
            <button
              onClick={handleNext}
              className={`mt-3 sm:mt-4 w-full ${btnColor} text-white font-bold py-2.5 sm:py-3 px-6 rounded-xl transition-colors cursor-pointer text-sm sm:text-base`}
            >
              {isLast ? `🏁 ${t('viewResults')}` : t('next')}
            </button>
          </div>
        )}

        {/* Bouton Quitter en bas — mobile uniquement */}
        <div className="flex sm:hidden justify-center mt-4">
          <button
            onClick={handleQuit}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-stone-400 hover:text-stone-600 transition-all text-xs font-medium cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            {t('quitSession')}
          </button>
        </div>

      </div>
    </div>
  );
}
