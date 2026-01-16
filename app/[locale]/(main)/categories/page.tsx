// src/app/[locale]/(main)/categories/page.tsx
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { CategoryCard } from '@/components/categories/CategoryCard';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';

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

export default function CategoriesPage() {
  const t = useTranslations();
  
  // Dans une vraie app, récupérer l'utilisateur depuis la session
  const user = {
    pseudo: 'Utilisateur',
    level: 3,
    xp: 250,
    xpForNextLevel: 300,
  };

  const xpProgress = (user.xp / user.xpForNextLevel) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            {/* Logo et Titre */}
            <div className="flex items-center gap-3">
              <div className="text-4xl">🕌</div>
              <h1 className="text-2xl font-bold text-gray-900">
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
                Bienvenue, {user.pseudo} ! 👋
              </h2>
              <p className="text-gray-600 mt-1">
                Niveau {user.level} • {user.xp} XP
              </p>
            </div>

            {/* Bouton de déconnexion */}
            <button className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium">
              {t('auth.logout')}
            </button>
          </div>

          {/* Barre de progression XP */}
          <div className="relative">
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-green-500 to-blue-500 transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1 text-right">
              {user.xpForNextLevel - user.xp} XP pour le niveau {user.level + 1}
            </p>
          </div>
        </div>

        {/* Titre des catégories */}
        <div className="mb-8">
          <h3 className="text-3xl font-bold text-gray-900 mb-2">
            {t('categories.title')}
          </h3>
          <p className="text-gray-600">
            Choisissez une catégorie pour vous entraîner
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
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl shadow-xl p-8 border-4 border-yellow-400">
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
                • 10 questions par catégorie (40 questions)<br />
                • 5 questions bonus très difficiles<br />
                • Votre score apparaîtra dans le classement
              </p>
            </div>

            <Link
              href="/exam"
              className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-12 py-5 rounded-xl font-bold text-2xl hover:from-yellow-600 hover:to-orange-600 transform hover:scale-105 transition-all duration-200 shadow-2xl flex items-center gap-3 whitespace-nowrap"
            >
              <span>🎯</span>
              <span>Passer l'examen</span>
            </Link>
          </div>
        </div>

        {/* Liens rapides */}
        <div className="mt-8 flex justify-center gap-6">
          <Link
            href="/leaderboard"
            className="text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-2"
          >
            🏅 Classement
          </Link>
          <Link
            href="/profile"
            className="text-purple-600 hover:text-purple-800 font-semibold flex items-center gap-2"
          >
            👤 Mon profil
          </Link>
        </div>
      </main>
    </div>
  );
}
