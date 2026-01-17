// src/components/categories/CategoryCard.tsx
import Link from 'next/link';
import { useTranslations } from 'next-intl';

interface CategoryCardProps {
  slug: string;
  icon: string;
  color: string;
  borderColor: string;
}

export function CategoryCard({ slug, icon, color, borderColor }: CategoryCardProps) {
  const t = useTranslations('categories');

  return (
    <Link
      href={`/training/${slug}`}
      className="group"
    >
      <div className={`
        bg-white rounded-2xl shadow-lg p-6 
        border-4 ${borderColor}
        transform hover:scale-105 hover:shadow-2xl
        transition-all duration-300
        cursor-pointer
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
        <p className="text-gray-600 text-sm mb-4">
          {t(`${slug}.description`)}
        </p>

        {/* Badge "Mode entraînement" */}
        <div className={`
          inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold
          bg-linear-to-r ${color} text-white
        `}>
          <span>🏋️</span>
          <span>{t('training', { ns: 'quiz' })}</span>
        </div>
      </div>
    </Link>
  );
}
