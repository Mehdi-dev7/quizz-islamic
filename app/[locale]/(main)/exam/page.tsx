'use client';

import { useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { QuizEngine, QuizQuestion, QuizAnswer } from '@/components/quiz/QuizEngine';

interface ExamResult {
  correctAnswers: number;
  totalQuestions: number;
  bonusCorrect: number;
  xpGained: number;
  levelUp: boolean;
  newLevel: number;
  newXp: number;
}

type Phase = 'intro' | 'loading' | 'playing' | 'submitting' | 'results' | 'error';

const BG = 'bg-amber-50';

export default function ExamPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;

  const [phase, setPhase] = useState<Phase>('intro');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [result, setResult] = useState<ExamResult | null>(null);

  const startExam = async () => {
    setPhase('loading');
    try {
      const res = await fetch(`/api/quiz/exam?locale=${locale}`);
      if (res.status === 401) { router.push(`/${locale}/login`); return; }
      if (!res.ok) throw new Error();
      const data = await res.json();
      setQuestions(data.questions);
      setPhase('playing');
    } catch {
      setPhase('error');
    }
  };

  const handleComplete = useCallback(async (answers: QuizAnswer[]) => {
    setPhase('submitting');
    try {
      const res = await fetch('/api/quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, mode: 'exam' }),
      });
      const data = await res.json();
      setResult(data);
      setPhase('results');
    } catch {
      setPhase('error');
    }
  }, []);

  // ─── Intro ───
  if (phase === 'intro') {
    return (
      <div className={`min-h-screen ${BG} flex items-center justify-center p-4`}>
        <div className="w-full max-w-lg">
          <div className="bg-white rounded-3xl shadow-md border border-amber-100 p-10 text-center">
            <div className="text-7xl mb-4">🏆</div>
            <h1 className="text-3xl font-black text-stone-800 mb-2">Examen Final</h1>
            <p className="text-stone-400 mb-8">Testez vos connaissances sur toutes les catégories !</p>

            {/* Détails */}
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6 text-left space-y-3 mb-8">
              {[
                { icon: '📚', text: '10 questions par catégorie (40 au total)' },
                { icon: '⭐', text: '5 questions bonus très difficiles' },
                { icon: '🏅', text: 'Score enregistré au classement' },
                { icon: '⚡', text: 'XP bonus pour les bonnes réponses' },
              ].map(({ icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <span className="text-xl">{icon}</span>
                  <p className="text-stone-600 font-medium text-sm">{text}</p>
                </div>
              ))}
            </div>

            <button
              onClick={startExam}
              className="w-full bg-amber-500 text-white font-black text-xl py-4 px-8 rounded-2xl hover:bg-amber-600 transition-colors transform hover:scale-[1.02] shadow-md"
            >
              🎯 Commencer l&apos;examen
            </button>

            <Link href={`/${locale}/categories`} className="block mt-4 text-stone-400 hover:text-stone-600 text-sm font-medium transition-colors">
              ← Retour aux catégories
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── Loading / Submitting ───
  if (phase === 'loading' || phase === 'submitting') {
    return (
      <div className={`min-h-screen ${BG} flex items-center justify-center`}>
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🏆</div>
          <p className="text-stone-500 font-medium">
            {phase === 'submitting' ? 'Enregistrement du score...' : "Préparation de l'examen..."}
          </p>
        </div>
      </div>
    );
  }

  // ─── Erreur ───
  if (phase === 'error') {
    return (
      <div className={`min-h-screen ${BG} flex items-center justify-center`}>
        <div className="text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-stone-700 font-semibold mb-4">Une erreur est survenue</p>
          <button onClick={() => setPhase('intro')} className="px-6 py-3 bg-orange-500 text-white rounded-xl font-semibold hover:bg-orange-600">
            Retour
          </button>
        </div>
      </div>
    );
  }

  // ─── Quiz en cours ───
  if (phase === 'playing') {
    return <QuizEngine questions={questions} mode="exam" title="Examen Final" onComplete={handleComplete} />;
  }

  // ─── Résultats ───
  if (phase === 'results' && result) {
    const percentage = Math.round((result.correctAnswers / result.totalQuestions) * 100);
    const emoji = percentage >= 80 ? '🌟' : percentage >= 60 ? '🥈' : percentage >= 40 ? '🥉' : '💪';

    return (
      <div className={`min-h-screen ${BG} flex items-center justify-center p-4`}>
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-md border border-amber-100 p-8 text-center">
            <div className="text-7xl mb-4">{emoji}</div>
            <h1 className="text-2xl font-bold text-stone-800 mb-1">Examen terminé !</h1>
            <p className="text-emerald-600 font-semibold text-sm mb-7">✓ Score enregistré au classement</p>

            {/* Score principal */}
            <div className="bg-orange-50 border border-orange-100 rounded-2xl p-6 mb-4">
              <div className="text-5xl font-black text-orange-600 mb-1">
                {result.correctAnswers}/{result.totalQuestions}
              </div>
              <p className="text-orange-400 font-semibold">{percentage}% de bonnes réponses</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
                <p className="text-2xl font-bold text-amber-700">{result.bonusCorrect}/5</p>
                <p className="text-xs text-amber-500 font-medium">Questions bonus</p>
              </div>
              <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                <p className="text-2xl font-bold text-emerald-700">+{result.xpGained}</p>
                <p className="text-xs text-emerald-500 font-medium">XP gagnés</p>
              </div>
            </div>

            {/* Level up */}
            {result.levelUp && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5">
                <p className="text-amber-700 font-bold text-lg">🎉 Niveau {result.newLevel} atteint !</p>
              </div>
            )}

            <div className="space-y-3">
              <Link
                href={`/${locale}/leaderboard`}
                className="block w-full bg-amber-500 text-white font-bold py-3 px-6 rounded-xl hover:bg-amber-600 transition-colors text-center"
              >
                🏅 Voir le classement
              </Link>
              <Link
                href={`/${locale}/categories`}
                className="block w-full bg-stone-100 text-stone-600 font-bold py-3 px-6 rounded-xl hover:bg-stone-200 transition-colors text-center"
              >
                ← Retour aux catégories
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
