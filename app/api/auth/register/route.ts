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

    if (pseudo.length < 3) {
      return NextResponse.json(
        { message: 'Le pseudo doit contenir au moins 3 caractères' },
        { status: 400 }
      );
    }

    // Vérifier les critères du mot de passe
    const passwordChecks = {
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    if (!Object.values(passwordChecks).every(Boolean)) {
      return NextResponse.json(
        { message: 'Le mot de passe ne respecte pas les critères requis' },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { pseudo },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: 'Ce pseudo est déjà utilisé' },
        { status: 409 }
      );
    }

    // Hasher le mot de passe avec bcrypt
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: {
        pseudo,
        password: hashedPassword,
      },
      select: {
        id: true,
        pseudo: true,
        level: true,
        xp: true,
        createdAt: true,
      },
    });

    // Créer et définir le token JWT
    const token = signToken({ userId: user.id, pseudo: user.pseudo });
    await setAuthCookie(token);

    return NextResponse.json(
      { message: 'Inscription réussie', user },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    return NextResponse.json(
      { message: 'Erreur serveur' },
      { status: 500 }
    );
  }
}
