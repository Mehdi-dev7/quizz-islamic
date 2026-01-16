// src/app/[locale]/(main)/layout.tsx
import { ReactNode } from 'react';
import { redirect } from 'next/navigation';

// Note : Dans une vraie app, tu vérifieras la session ici
async function getUser() {
  // TODO: Récupérer l'utilisateur depuis la session/cookie
  // Si pas connecté, rediriger vers /login
  
  // Pour l'instant, on simule un utilisateur connecté
  const isAuthenticated = true; // À remplacer par une vraie vérification
  
  if (!isAuthenticated) {
    redirect('/login');
  }
  
  return {
    id: '1',
    pseudo: 'Utilisateur',
    level: 3,
    xp: 250,
  };
}

export default async function MainLayout({ children }: { children: ReactNode }) {
  // Vérifier l'authentification
  await getUser();

  return (
    <div className="min-h-screen">
      {children}
    </div>
  );
}
