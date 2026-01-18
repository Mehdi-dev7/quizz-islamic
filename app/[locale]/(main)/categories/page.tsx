// src/app/[locale]/(main)/categories/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { CategoryCard } from '@/components/categories/CategoryCard';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import Image from 'next/image';
import  Logo  from '@/public/pngtree-islamic-mosque-logo-transparent-background-png-image_15036132.png'

// Note : Dans une vraie app, ces données viendraient de la base de données
const categories = [
  {
    id: '1',
    slug: 'vie-prophete',
    icon: '📿',
    color: 'from-green-500 to-green-600',
    borderColor: 'border-green-500',
  },
  {
    id: '2',
    slug: 'jeune',
    icon: '🌙',
    color: 'from-blue-500 to-blue-600',
    borderColor: 'border-blue-500',
  },
  {
    id: '3',
    slug: 'histoires-prophetes',
    icon: '📖',
    color: 'from-purple-500 to-purple-600',
    borderColor: 'border-purple-500',
  },
  {
    id: '4',
    slug: 'salat',
    icon: '🕌',
    color: 'from-orange-500 to-orange-600',
    borderColor: 'border-orange-500',
  },
];

interface User {
  id: string;
  pseudo: string;
  level: number;
  xp: number;
  xpForNextLevel: number;
}

export default function CategoriesPage() {
  const t = useTranslations();
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Récupérer les données de l'utilisateur connecté
  useEffect(() => {
    async function fetchUser() {
      try {
        const response = await fetch('/api/auth/me');

        if (!response.ok) {
          // Non authentifié, rediriger vers login
          router.push('/login');
          return;
        }

        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        console.error('Erreur:', error);
        router.push('/login');
      } finally {
        setIsLoading(false);
      }
    }

    fetchUser();
  }, [router]);

  // Fonction de déconnexion
  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  // Afficher un loader pendant le chargement
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

  // Si pas d'utilisateur, ne rien afficher (redirection en cours)
  if (!user) {
    return null;
  }

  const xpProgress = (user.xp / user.xpForNextLevel) * 100;

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo et Titre */}
            <div className="flex items-center gap-3">
              <div className="text-4xl">
                <Image src={Logo} alt="Logo" width={80} height={80} />
              </div>
              <h1 className="text-4xl text-(--primary) font-semibold Macondo">
                {t('app.name')}
              </h1>
            </div>

            {/* Sélecteur de langue */}
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Informations utilisateur */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {t('user.welcome', { name: user.pseudo })} 👋
              </h2>
              <p className="text-gray-600 mt-1">
                {t('user.level', { level: user.level })} • {user.xp} XP
              </p>
            </div>

            {/* Bouton de déconnexion */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 font-medium cursor-pointer transition-colors duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" />
              </svg>
              {t('auth.logout')}
            </button>
          </div>

          {/* Barre de progression XP */}
          <div className="relative">
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-linear-to-r from-green-500 to-blue-500 transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1 text-right">
              {t('user.xpForNextLevel', { xp: user.xpForNextLevel - user.xp, nextLevel: user.level + 1 })}
            </p>
          </div>
        </div>

        {/* Titre des catégories */}
        <div className="mb-8">
          <h3 className="text-3xl font-bold text-gray-900 mb-2">
            {t('categories.title')}
          </h3>
          <p className="text-gray-600">
            {t('categories.chooseCategory')}
          </p>
        </div>

        {/* Grille des catégories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              slug={category.slug}
              icon={category.icon}
              color={category.color}
              borderColor={category.borderColor}
            />
          ))}
        </div>

        {/* Section Examen */}
        <div className="bg-linear-to-r from-yellow-50 to-orange-50 rounded-2xl shadow-xl p-8 border-4 border-yellow-400">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="text-5xl">🏆</div>
                <h3 className="text-3xl font-bold text-gray-900">
                  {t('quiz.exam')}
                </h3>
              </div>
              <p className="text-lg text-gray-700 mb-2">
                {t('quiz.examDescription')}
              </p>
              <p className="text-sm text-gray-600">
                • {t('quiz.examDetails.questionsPerCategory')}<br />
                • {t('quiz.examDetails.bonusQuestions')}<br />
                • {t('quiz.examDetails.scoreInLeaderboard')}
              </p>
            </div>

            <Link
              href="/exam"
              className="bg-linear-to-r from-yellow-500 to-orange-500 text-white px-12 py-5 rounded-xl font-bold text-2xl hover:from-yellow-600 hover:to-orange-600 transform hover:scale-105 transition-all duration-200 shadow-2xl flex items-center gap-3 whitespace-nowrap"
            >
              <span>🎯</span>
              <span>{t('quiz.startExam')}</span>
            </Link>
          </div>
        </div>

        {/* Liens rapides */}
        <div className="mt-8 flex justify-center gap-6">
          <Link
            href="/leaderboard"
            className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2"
          >
            🏅 {t('quiz.leaderboard')}
          </Link>
          <Link
            href="/profile"
            className="text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-2"
          >
            👤 {t('quiz.profile')}
          </Link>
        </div>
      </main>
    </div>
  );
}
