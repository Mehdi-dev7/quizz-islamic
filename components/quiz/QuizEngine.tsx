'use client';

import { useState, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
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

export function QuizEngine({ questions, mode, title, onComplete }: QuizEngineProps) {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  // Mélange les options une fois à l'init — empêche de mémoriser la position de la réponse
  const shuffledQuestions = useMemo(() => {
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
      };
    });
  }, [questions]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [answers, setAnswers] = useState<QuizAnswer[]>([]);

  const handleQuit = () => {
    const confirmed = window.confirm(
      mode === 'exam'
        ? "Quitter l'examen ? Votre progression sera perdue et le score ne sera pas enregistré."
        : "Quitter la session ? Votre progression sera perdue."
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
    const newAnswers = [...answers, { questionId: current._id, selectedAnswer: selectedAnswer! }];
    setAnswers(newAnswers);
    if (isLast) { onComplete(newAnswers); return; }
    setCurrentIndex((i) => i + 1);
    setSelectedAnswer(null);
    setShowFeedback(false);
  };

  const isCorrect = selectedAnswer === current.correctAnswer;

  const getOptionStyle = (i: number) => {
    const opt = i + 1;
    if (!showFeedback) {
      return selectedAnswer === opt
        ? 'bg-amber-50 border-amber-400 text-amber-900'
        : 'bg-white border-stone-300 hover:border-stone-400 hover:bg-stone-50';
    }
    if (opt === current.correctAnswer) return 'bg-emerald-50 border-emerald-400 text-emerald-900';
    if (opt === selectedAnswer)         return 'bg-rose-50 border-rose-400 text-rose-900';
    return 'bg-white border-stone-200 text-stone-300';
  };

  const getLetterStyle = (i: number) => {
    const opt = i + 1;
    if (!showFeedback) return selectedAnswer === opt ? 'bg-amber-400 text-white' : 'bg-stone-100 text-stone-500';
    if (opt === current.correctAnswer) return 'bg-emerald-500 text-white';
    if (opt === selectedAnswer)        return 'bg-rose-500 text-white';
    return 'bg-stone-100 text-stone-300';
  };

  // Fond et barre selon le mode
  const bg          = mode === 'exam' ? 'bg-amber-50'   : 'bg-emerald-50';
  const barColor    = mode === 'exam' ? 'bg-amber-400'  : 'bg-emerald-500';
  const btnColor    = mode === 'exam' ? 'bg-amber-500 hover:bg-amber-600' : 'bg-emerald-600 hover:bg-emerald-700';
  const modeLabel   = mode === 'exam' ? '🏆 Examen'    : '🏋️ Entraînement';
  const labelColor  = mode === 'exam' ? 'text-amber-700' : 'text-emerald-700';

  return (
    <div className={`min-h-screen ${bg} flex items-center justify-center p-4`}>
      <div className="w-full max-w-2xl">

        {/* Barre de navigation */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={handleQuit}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-stone-500 hover:text-stone-700 hover:bg-white/70 transition-all text-sm font-medium cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
            </svg>
            Quitter
          </button>
          <LanguageSwitcher />
        </div>

        {/* Header progression */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className={`text-sm font-bold uppercase tracking-wide ${labelColor}`}>
              {modeLabel} — {title}
            </span>
            <span className="text-sm font-bold text-stone-400">
              {currentIndex + 1} / {shuffledQuestions.length}
            </span>
          </div>
          <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${barColor} rounded-full transition-all duration-500`}
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Carte question */}
        <div className="bg-white rounded-3xl shadow-xl shadow-stone-300 border border-stone-100 p-8 mb-4">
          <div className="flex gap-2 mb-5">
            {current.isBonus && (
              <span className="px-3 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-full">
                ⭐ BONUS
              </span>
            )}
            <span className="px-3 py-1 bg-stone-100 text-stone-500 text-xs font-semibold rounded-full">
              {'⚡'.repeat(current.difficulty)}
            </span>
          </div>

          <h2 className="text-xl font-bold text-stone-800 mb-8 leading-relaxed">
            {current.question}
          </h2>

          <div className="space-y-3">
            {current.options.map((option, i) => (
              <button
                key={i}
                onClick={() => handleSelect(i + 1)}
                disabled={showFeedback}
                className={`
                  w-full text-left px-5 py-4 rounded-2xl border-2 font-medium
                  transition-all duration-200 flex items-center gap-4
                  ${getOptionStyle(i)}
                  ${!showFeedback ? 'cursor-pointer active:scale-[0.99]' : 'cursor-default'}
                `}
              >
                <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${getLetterStyle(i)}`}>
                  {['A', 'B', 'C', 'D'][i]}
                </span>
                <span>{option}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Feedback */}
        {showFeedback && (
          <div className={`rounded-2xl p-5 border ${isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
            <div className="flex items-start gap-3">
              <span className="text-2xl">{isCorrect ? '✅' : '❌'}</span>
              <div className="flex-1">
                <p className={`font-bold text-lg ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {isCorrect ? 'Bonne réponse !' : 'Mauvaise réponse'}
                </p>
                {!isCorrect && (
                  <p className="text-sm text-stone-600 mt-1">
                    Bonne réponse : <strong>{current.options[current.correctAnswer - 1]}</strong>
                  </p>
                )}
                {current.explanation && (
                  <p className="text-sm text-stone-500 mt-2 italic">💡 {current.explanation}</p>
                )}
              </div>
            </div>
            <button
              onClick={handleNext}
              className={`mt-4 w-full ${btnColor} text-white font-bold py-3 px-6 rounded-xl transition-colors cursor-pointer`}
            >
              {isLast ? '🏁 Voir les résultats' : 'Suivant →'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
