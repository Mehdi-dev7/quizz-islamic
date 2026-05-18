'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import Link from 'next/link';
import { QuizEngine, QuizQuestion, QuizAnswer } from '@/components/quiz/QuizEngine';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';

interface QuizResult {
  correctAnswers: number;
  totalQuestions: number;
  xpGained: number;
  levelUp: boolean;
  newLevel: number;
  newXp: number;
  isRevision: boolean;
}

// Couleurs par niveau de difficulté (labels viennent des traductions)
const DIFF_COLORS = [
  { color: 'border-emerald-400 bg-emerald-50 text-emerald-800', dot: 'bg-emerald-400' },
  { color: 'border-teal-400 bg-teal-50 text-teal-800',          dot: 'bg-teal-400'    },
  { color: 'border-amber-400 bg-amber-50 text-amber-800',       dot: 'bg-amber-400'   },
  { color: 'border-orange-400 bg-orange-50 text-orange-800',    dot: 'bg-orange-400'  },
  { color: 'border-rose-400 bg-rose-50 text-rose-800',          dot: 'bg-rose-400'    },
];

type Phase = 'lobby' | 'loading' | 'playing' | 'submitting' | 'results' | 'error';

export default function TrainingPage() {
  const params = useParams();
  const router = useRouter();
  const locale = params.locale as string;
  const slug = params.slug as string;
  const t = useTranslations('training');
  const tCats = useTranslations('categories');

  const [phase, setPhase] = useState<Phase>('lobby');
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const [userMaxDiff, setUserMaxDiff] = useState(2);
  const [selectedDiff, setSelectedDiff] = useState<number | null>(null);
  const [isRevision, setIsRevision] = useState(false);
  const [result, setResult] = useState<QuizResult | null>(null);

  // Charger les infos utilisateur pour le lobby
  useEffect(() => {
    async function loadUser() {
      try {
        const [userRes, catRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/categories'),
        ]);
        if (userRes.status === 401) { router.push(`/${locale}/login`); return; }
        const { user } = await userRes.json();
        const maxDiff = Math.min(user.level + 1, 5);
        setUserMaxDiff(maxDiff);
        setSelectedDiff(maxDiff);

        if (catRes.ok) {
          const { categories } = await catRes.json();
          const cat = categories.find((c: { slug: string }) => c.slug === slug);
          if (cat) setCategoryName(cat.slug);
        }
      } catch {
        router.push(`/${locale}/login`);
      }
    }
    loadUser();
  }, [slug, locale, router]);

  const startQuiz = async (diff: number) => {
    setPhase('loading');
    try {
      const res = await fetch(`/api/quiz/training/${slug}?locale=${locale}&difficulty=${diff}`);
      if (res.status === 401) { router.push(`/${locale}/login`); return; }
      if (!res.ok) throw new Error();
      const data = await res.json();
      setQuestions(data.questions);
      // Nom traduit depuis les fichiers locales (le modèle DB n'a pas de champs multilingues)
      setCategoryName(tCats(`${slug}.name`));
      setIsRevision(data.isRevision);
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
        body: JSON.stringify({ answers, mode: 'training', isRevision }),
      });
      const data = await res.json();
      setResult(data);
      setPhase('results');
    } catch {
      setPhase('error');
    }
  }, [isRevision]);

  // ─── Lobby ───
  if (phase === 'lobby') {
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center px-2 py-3 sm:p-4">
        <div className="w-full max-w-md">
          {/* Nav */}
          <div className="flex items-center justify-between mb-4">
            <Link href={`/${locale}/categories`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-stone-500 hover:text-stone-700 hover:bg-white/70 transition-all text-sm font-medium cursor-pointer">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
              {t('back')}
            </Link>
            <LanguageSwitcher />
          </div>

          <div className="bg-white rounded-3xl shadow-xl shadow-stone-200/80 border border-stone-100 p-4 sm:p-8">
            <div className="text-center mb-5">
              <div className="text-4xl sm:text-5xl mb-2">🏋️</div>
              <h1 className="text-xl sm:text-2xl font-bold text-stone-800">{t('title')}</h1>
              <p className="text-stone-400 text-sm mt-1">{t('chooseLevel')}</p>
            </div>

            {/* Sélecteur de difficulté */}
            <div className="space-y-2 mb-5">
              {DIFF_COLORS.map((cfg, i) => {
                const diff = i + 1;
                const isLocked = diff > userMaxDiff;
                const isSelected = selectedDiff === diff;
                const isMax = diff === userMaxDiff;
                const isRevisionLevel = diff < userMaxDiff;

                return (
                  <button
                    key={diff}
                    disabled={isLocked}
                    onClick={() => setSelectedDiff(diff)}
                    className={`
                      w-full flex items-center gap-2 sm:gap-4 px-3 py-3 sm:px-5 sm:py-4 rounded-2xl border-2 transition-all duration-150
                      ${isLocked ? 'border-stone-100 bg-stone-50 opacity-40 cursor-not-allowed' : 'cursor-pointer'}
                      ${isSelected && !isLocked ? cfg.color + ' shadow-sm' : ''}
                      ${!isSelected && !isLocked ? 'border-stone-200 bg-white hover:border-stone-300' : ''}
                    `}
                  >
                    {/* Indicateur sélectionné */}
                    <div className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${isSelected && !isLocked ? 'border-current' : 'border-stone-300'}`}>
                      {isSelected && !isLocked && <div className={`w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full ${cfg.dot}`} />}
                    </div>

                    {/* Éclairs de difficulté */}
                    <span className="text-sm sm:text-base shrink-0">{'⚡'.repeat(diff)}</span>

                    {/* Label */}
                    <div className="flex-1 text-left min-w-0">
                      <span className="font-semibold text-stone-700 text-sm sm:text-base">
                        {t(`difficulties.${diff}` as `difficulties.${1 | 2 | 3 | 4 | 5}`)}
                      </span>
                    </div>

                    {/* Badge */}
                    {isLocked && <span className="text-xs text-stone-400 font-medium shrink-0">🔒</span>}
                    {isMax && !isLocked && <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded-full shrink-0 whitespace-nowrap">{t('yourLevel')}</span>}
                    {isRevisionLevel && <span className="text-xs text-stone-400 font-medium italic shrink-0">{t('noXp')}</span>}
                  </button>
                );
              })}
            </div>

            {/* Info révision */}
            {selectedDiff !== null && selectedDiff < userMaxDiff && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-4 text-xs sm:text-sm text-amber-700 flex items-start gap-2">
                <span className="text-sm shrink-0">📖</span>
                <p dangerouslySetInnerHTML={{ __html: t('revisionInfo') }} />
              </div>
            )}

            <button
              onClick={() => selectedDiff && startQuiz(selectedDiff)}
              disabled={!selectedDiff}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-xl transition-colors cursor-pointer disabled:opacity-50"
            >
              {t('start')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── Loading / Submitting ───
  if (phase === 'loading' || phase === 'submitting') {
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🕌</div>
          <p className="text-stone-500 font-medium">
            {phase === 'submitting' ? t('calculatingScore') : t('loadingQuestions')}
          </p>
        </div>
      </div>
    );
  }

  // ─── Erreur ───
  if (phase === 'error') {
    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <p className="text-stone-700 font-semibold mb-4">{t('error')}</p>
          <button onClick={() => setPhase('lobby')} className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 cursor-pointer">
            {t('back')}
          </button>
        </div>
      </div>
    );
  }

  // ─── Quiz en cours ───
  if (phase === 'playing') {
    return <QuizEngine questions={questions} mode="training" title={categoryName} onComplete={handleComplete} />;
  }

  // ─── Résultats ───
  if (phase === 'results' && result) {
    const percentage = Math.round((result.correctAnswers / result.totalQuestions) * 100);
    const emoji = percentage >= 80 ? '🌟' : percentage >= 60 ? '👍' : '💪';

    return (
      <div className="min-h-screen bg-emerald-50 flex items-center justify-center px-2 py-3 sm:p-4">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-md border border-stone-100 p-4 sm:p-8 text-center">
            <div className="text-7xl mb-4">{emoji}</div>
            <h1 className="text-2xl font-bold text-stone-800 mb-1">{t('results.title')}</h1>
            <p className="text-stone-400 text-sm mb-7">{categoryName}</p>

            {/* Score */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6 mb-5">
              <div className="text-5xl font-black text-emerald-700 mb-1">
                {result.correctAnswers}/{result.totalQuestions}
              </div>
              <p className="text-emerald-500 font-semibold">{percentage}{t('results.percentage')}</p>
            </div>

            {/* XP ou info révision */}
            {result.isRevision ? (
              <div className="flex items-center justify-center gap-2 mb-5 text-stone-400 text-sm">
                <span>📖</span>
                <span>{t('results.revisionNoXp')}</span>
              </div>
            ) : (
              <div className="flex items-center justify-center gap-2 mb-5">
                <span className="text-2xl">⚡</span>
                <span className="text-xl font-bold text-amber-600">+{result.xpGained} XP</span>
              </div>
            )}

            {result.levelUp && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5">
                <p className="text-amber-700 font-bold text-lg">🎉 {t('results.levelUp', { level: result.newLevel })}</p>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={() => { setResult(null); setPhase('lobby'); }}
                className="w-full bg-emerald-600 text-white font-bold py-3 px-6 rounded-xl hover:bg-emerald-700 transition-colors cursor-pointer"
              >
                🔄 {t('results.replay')}
              </button>
              <Link href={`/${locale}/categories`} className="block w-full bg-stone-100 text-stone-600 font-bold py-3 px-6 rounded-xl hover:bg-stone-200 transition-colors text-center">
                {t('results.backToCategories')}
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
