'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { CategoryCard } from '@/components/categories/CategoryCard';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import Image from 'next/image';
import Logo from '@/public/pngtree-islamic-mosque-logo-transparent-background-png-image_15036132.png';


interface Category {
  _id: string;
  slug: string;
  icon: string;
  color: string;
  borderColor: string;
  questionCount: number;
}

interface User {
  id: string;
  pseudo: string;
  level: number;
  xp: number;
  xpForNextLevel: number;
}

export default function CategoriesPage() {
  const t = useTranslations();
  const tTraining = useTranslations('training');
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const [user, setUser] = useState<User | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger l'utilisateur et les catégories en parallèle
  useEffect(() => {
    async function loadData() {
      try {
        const [userRes, catsRes] = await Promise.all([
          fetch('/api/auth/me'),
          fetch('/api/categories'),
        ]);

        // Rediriger si non authentifié
        if (!userRes.ok) {
          router.push('/login');
          return;
        }

        const userData = await userRes.json();
        const catsData = await catsRes.json();

        setUser(userData.user);
        setCategories(catsData.categories ?? []);
      } catch (error) {
        console.error('Erreur chargement:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Erreur déconnexion:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4 animate-bounce">🕌</div>
          <p className="text-gray-600">{t('auth.loading')}</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const xpProgress = (user.xp / user.xpForNextLevel) * 100;

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-3">
              <Image src={Logo} alt="Logo" width={40} height={40} className="sm:w-[80px] sm:h-[80px]" />
              <h1 className="text-xl sm:text-4xl text-(--primary) font-semibold Macondo">
                {t('app.name')}
              </h1>
            </div>
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-12">
        {/* Carte utilisateur + XP */}
        <div className="bg-white rounded-2xl shadow-lg p-2 sm:p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                {t('user.welcome', { name: user.pseudo })} 👋
              </h2>
              <p className="text-gray-600 mt-1">
                {t('user.level', { level: user.level })} • {user.xp} XP
              </p>
            </div>

            <button
              onClick={handleLogout}
              aria-label={t('auth.logout')}
              className="flex items-center gap-1.5 px-2 sm:px-3 py-2 text-gray-400 hover:text-red-500 cursor-pointer transition-colors duration-200 rounded-lg hover:bg-red-50"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
              </svg>
              <span className="hidden sm:inline text-sm font-medium">{t('auth.logout')}</span>
            </button>
          </div>

          {/* Barre XP + difficulté débloquée */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-500 font-medium">
                {user.xp} / {user.xpForNextLevel} XP
              </span>
              <span className="text-xs text-gray-500">
                {t('user.xpForNextLevel', { xp: user.xpForNextLevel - user.xp, nextLevel: user.level + 1 })}
              </span>
            </div>
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-green-500 to-blue-500 transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            {/* Difficulté débloquée */}
            <div className="mt-3 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
              {/* Mobile : bloc vertical */}
              <div className="flex items-center justify-between sm:hidden">
                <span className="text-sm font-medium text-emerald-700">{tTraining('unlockedDifficulty')}</span>
                <span className="text-base">{'⚡'.repeat(Math.min(user.level + 1, 5))}</span>
              </div>
              <p className="text-sm text-emerald-800 font-semibold mt-0.5 sm:hidden">
                {tTraining(`difficulties.${Math.min(user.level + 1, 5)}` as `difficulties.${1|2|3|4|5}`)}
              </p>
              {/* Tablette+ : une seule ligne */}
              <div className="hidden sm:flex items-center gap-2">
                <span className="text-base">{'⚡'.repeat(Math.min(user.level + 1, 5))}</span>
                <span className="text-sm text-emerald-700 font-medium">
                  {tTraining('unlockedDifficulty')} —{' '}
                  <strong>{tTraining(`difficulties.${Math.min(user.level + 1, 5)}` as `difficulties.${1|2|3|4|5}`)}</strong>
                </span>
              </div>
              {user.level < 4 && (
                <p className="text-xs text-gray-400 mt-1">
                  {tTraining('nextLevel')} {tTraining(`difficulties.${Math.min(user.level + 2, 5)}` as `difficulties.${1|2|3|4|5}`)}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Titre */}
        <div className="mb-8">
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            {t('categories.title')}
          </h3>
          <p className="text-gray-600">
            {t('categories.chooseCategory')}
          </p>
        </div>

        {/* Grille des catégories */}
        {categories.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-5xl mb-4">📭</div>
            <p>Aucune catégorie disponible pour l&apos;instant.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {categories.map((category) => (
              <CategoryCard
                key={category._id}
                slug={category.slug}
                icon={category.icon}
                color={category.color}
                borderColor={category.borderColor}
                questionCount={category.questionCount}
              />
            ))}
          </div>
        )}

        {/* Section Examen */}
        <div className="bg-linear-to-r from-yellow-50 to-orange-50 rounded-2xl shadow-xl p-4 sm:p-8 border-4 border-yellow-400">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-5xl">🏆</div>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {t('quiz.exam')}
                </h3>
              </div>
              <p className="text-base sm:text-lg text-gray-700 mb-2">
                {t('quiz.examDescription')}
              </p>
              <p className="text-sm text-gray-600">
                • {t('quiz.examDetails.questionsPerCategory')}<br />
                • {t('quiz.examDetails.bonusQuestions')}<br />
                • {t('quiz.examDetails.scoreInLeaderboard')}
              </p>
            </div>

            <Link
              href={`/${locale}/exam`}
              className="bg-linear-to-r from-yellow-500 to-orange-500 text-white px-6 py-3 sm:px-12 sm:py-5 rounded-xl font-bold text-lg sm:text-2xl hover:from-yellow-600 hover:to-orange-600 transform hover:scale-105 transition-all duration-200 shadow-2xl flex items-center gap-3 whitespace-nowrap"
            >
              <span>🎯</span>
              <span>{t('quiz.startExam')}</span>
            </Link>
          </div>
        </div>

        {/* Liens rapides */}
        <div className="mt-8 flex justify-center gap-6">
          <Link href={`/${locale}/leaderboard`} className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2">
            🏅 {t('quiz.leaderboard')}
          </Link>
        </div>
      </main>

      <footer className="mt-6 sm:mt-2 pb-6 text-center text-gray-400 text-xs sm:text-sm">
        <p>© 2026 {t('app.name')} - {t('home.footer')}</p>
      </footer>
    </div>
  );
}
