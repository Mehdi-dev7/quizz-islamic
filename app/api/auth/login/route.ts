import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { prisma } from '@/lib/db';
import { signToken, setAuthCookie } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const { pseudo, password } = await request.json();

    // Validation
    if (!pseudo || !password) {
      return NextResponse.json(
        { message: 'Pseudo et mot de passe requis' },
        { status: 400 }
      );
    }

    // Trouver l'utilisateur
    const user = await prisma.user.findUnique({
      where: { pseudo },
    });

    if (!user) {
      return NextResponse.json(
        { message: 'Identifiants invalides' },
        { status: 401 }
      );
    }

    // Vérifier le mot de passe avec bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { message: 'Identifiants invalides' },
        { status: 401 }
      );
    }

    // Retourner les informations de l'utilisateur (sans le mot de passe)
    const { password: _, ...userWithoutPassword } = user;

    // Créer et définir le token JWT
    const token = signToken({ userId: user.id, pseudo: user.pseudo });
    await setAuthCookie(token);

    return NextResponse.json(
      { message: 'Connexion réussie', user: userWithoutPassword },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    return NextResponse.json(
      { message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
