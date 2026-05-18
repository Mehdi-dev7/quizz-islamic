import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { signToken, setAuthCookie } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  try {
    const { pseudo: rawPseudo, password } = await request.json();
    const pseudo = rawPseudo?.toLowerCase().trim();

    if (!pseudo || !password) {
      return NextResponse.json({ message: 'Pseudo et mot de passe requis' }, { status: 400 });
    }
    if (pseudo.length < 3) {
      return NextResponse.json({ message: 'Le pseudo doit contenir au moins 3 caractères' }, { status: 400 });
    }

    const ok =
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!ok) {
      return NextResponse.json(
        { message: 'Le mot de passe doit contenir 8 caractères, une majuscule, un chiffre et un caractère spécial' },
        { status: 400 }
      );
    }

    await connectDB();

    const existing = await User.findOne({ pseudo });
    if (existing) {
      return NextResponse.json({ message: 'Ce pseudo est déjà utilisé' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ pseudo, password: hashedPassword });

    const token = signToken({ userId: user._id.toString(), pseudo: user.pseudo });
    await setAuthCookie(token);

    return NextResponse.json(
      { message: 'Inscription réussie', user: { id: user._id, pseudo: user.pseudo, level: user.level, xp: user.xp, avatar: user.avatar } },
      { status: 201 }
    );
  } catch (error) {
    console.error('Erreur inscription:', error);
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}
