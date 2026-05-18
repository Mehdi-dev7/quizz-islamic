// src/app/[locale]/page.tsx
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/layout/LanguageSwitcher';
import Image from 'next/image';
import  Logo  from '@/public/pngtree-islamic-mosque-logo-transparent-background-png-image_15036132.png'

export default function HomePage() {
  const t = useTranslations();

  return (
    <div className="min-h-screen bg-linear-to-br from-green-50 via-blue-50 to-purple-50">
      {/* Header avec sélecteur de langue */}
      <header className="absolute top-0 right-0 p-6">
        <LanguageSwitcher/>
      </header>

      {/* Contenu principal */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        {/* Logo ou Icône (optionnel) */}
        <div className="mb-2 animate-bounce-in">
          <Image src={Logo} alt="Logo" width={150} height={150} className="sm:w-[200px] sm:h-[200px]" />
        </div>

        {/* Titre de l'application */}
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-center mb-4 bg-linear-to-r from-green-600 to-blue-600 bg-clip-text text-transparent animate-fade-in">
          {t('app.name')}
        </h1>

        {/* Tagline */}
        <p className="text-lg sm:text-xl md:text-2xl text-gray-600 text-center mb-8 sm:mb-12 max-w-2xl animate-slide-up">
          {t('app.tagline')}
        </p>

        {/* Verset ou Citation inspirante */}
        <div className="mb-8 sm:mb-12 p-4 sm:p-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg max-w-2xl animate-fade-in">
          <p className="text-lg text-gray-700 italic text-center leading-relaxed">
            "{t('home.quote')}"
          </p>
          <p className="text-sm text-gray-500 text-center mt-2">
            - {t('home.quoteSource')} ﷺ
          </p>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md animate-slide-up">
          <Link
            href="/register"
            className="flex-1 bg-linear-to-r from-green-600 to-green-700 text-white px-8 py-4 rounded-xl font-bold text-lg text-center hover:from-green-700 hover:to-green-800 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {t('auth.register')}
          </Link>

          <Link
            href="/login"
            className="flex-1 bg-white text-green-600 px-8 py-4 rounded-xl font-bold text-lg text-center hover:bg-gray-50 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl border-2 border-green-600"
          >
            {t('auth.login')}
          </Link>
        </div>

        {/* Statistiques ou features (optionnel) */}
        <div className="mt-10 sm:mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl w-full">
          <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-lg text-center transform hover:scale-105 transition-all duration-200">
            <div className="text-4xl mb-2">📚</div>
            <div className="text-2xl font-bold text-green-600 mb-1">400+</div>
            <div className="text-gray-600">{t('home.stats.questions')}</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-lg text-center transform hover:scale-105 transition-all duration-200">
            <div className="text-4xl mb-2">🌍</div>
            <div className="text-2xl font-bold text-blue-600 mb-1">3</div>
            <div className="text-gray-600">{t('home.stats.languages')}</div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-4 sm:p-6 rounded-xl shadow-lg text-center transform hover:scale-105 transition-all duration-200">
            <div className="text-4xl mb-2">🎯</div>
            <div className="text-2xl font-bold text-purple-600 mb-1">4</div>
            <div className="text-gray-600">{t('home.stats.categories')}</div>
          </div>
        </div>
      </div>

      {/* Footer — relatif pour ne pas chevaucher les stats sur petit écran */}
      <footer className="relative mt-16 pb-6 w-full text-center text-gray-500 text-sm">
        <p>© 2026 {t('app.name')} - {t('home.footer')}</p>
      </footer>
    </div>
  );
}
