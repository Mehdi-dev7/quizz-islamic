import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { signToken, setAuthCookie } from '@/lib/jwt';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  // 10 inscriptions max par IP par heure
  const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown';
  const { allowed, retryAfterSecs } = checkRateLimit(`register:${ip}`, { maxRequests: 10, windowMs: 60 * 60 * 1000 });
  if (!allowed) {
    return NextResponse.json(
      { message: `Trop de tentatives. Réessayez dans ${retryAfterSecs} secondes.` },
      { status: 429, headers: { 'Retry-After': String(retryAfterSecs) } }
    );
  }

  try {
    const { pseudo: rawPseudo, password } = await request.json();
    const pseudo = rawPseudo?.toLowerCase().trim();

    if (!pseudo || !password) {
      return NextResponse.json({ message: 'Pseudo et mot de passe requis' }, { status: 400 });
    }
    if (pseudo.length < 3 || pseudo.length > 30) {
      return NextResponse.json({ message: 'Le pseudo doit contenir entre 3 et 30 caractères' }, { status: 400 });
    }
    if (password.length > 100) {
      return NextResponse.json({ message: 'Mot de passe trop long' }, { status: 400 });
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
