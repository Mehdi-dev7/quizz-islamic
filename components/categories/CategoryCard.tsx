'use client';

import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface CategoryCardProps {
  slug: string;
  icon: string;
  color: string;        // classe Tailwind gradient ex: "from-green-500 to-green-600"
  borderColor: string;  // classe Tailwind border ex: "border-green-500"
  questionCount?: number;
}

export function CategoryCard({ slug, icon, color, borderColor, questionCount }: CategoryCardProps) {
  const t = useTranslations('categories');
  const tQuiz = useTranslations('quiz');

  return (
    <Link href={`/training/${slug}`} className="group h-full">
      <div className={`
        bg-white rounded-2xl shadow-lg p-6 h-full
        border-4 ${borderColor}
        transform hover:scale-105 hover:shadow-2xl
        transition-all duration-300
        cursor-pointer flex flex-col
      `}>
        {/* Icône */}
        <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>

        {/* Nom de la catégorie */}
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {t(`${slug}.name`)}
        </h3>

        {/* Description */}
        <p className="text-gray-600 text-sm mb-4 flex-grow">
          {t(`${slug}.description`)}
        </p>

        <div className="flex items-center justify-between">
          {/* Badge mode entraînement */}
          <div className={`
            inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold
            bg-linear-to-r ${color} text-white
          `}>
            <span>🏋️</span>
            <span>{tQuiz('training')}</span>
          </div>

          {/* Nombre de questions */}
          {questionCount !== undefined && (
            <span className="text-xs text-gray-400 font-medium">
              {questionCount} {tQuiz('questions')}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}
