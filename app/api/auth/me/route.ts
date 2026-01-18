import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { getAuthFromCookie } from '@/lib/jwt';

export async function GET() {
  try {
    // Récupérer l'utilisateur depuis le cookie JWT
    const auth = await getAuthFromCookie();

    if (!auth) {
      return NextResponse.json(
        { message: 'Non authentifié' },
        { status: 401 }
      );
    }

    // Récupérer les données complètes de l'utilisateur
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: {
        id: true,
        pseudo: true,
        level: true,
        xp: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Utilisateur non trouvé' },
        { status: 404 }
      );
    }

    // Calculer l'XP nécessaire pour le prochain niveau
    // Formule simple : niveau * 100 XP pour passer au niveau suivant
    const xpForNextLevel = user.level * 100;

    return NextResponse.json({
      user: {
        ...user,
        xpForNextLevel,
      },
    });
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    return NextResponse.json(
      { message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
