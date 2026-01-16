import { useTranslations } from 'next-intl';

export default function LoginPage() {
  const t = useTranslations('auth');  // Charge la section 'auth'
  
  return (
    <div>
      <h1>{t('login')}</h1>           {/* Affiche "Connexion" en FR */}
      <button>{t('register')}</button> {/* Affiche "S'inscrire" en FR */}
    </div>
  );
}