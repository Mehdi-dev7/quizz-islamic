import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcrypt';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { signToken, setAuthCookie } from '@/lib/jwt';
import { checkRateLimit } from '@/lib/rateLimit';

export async function POST(request: NextRequest) {
  // 5 tentatives max par IP toutes les 15 minutes
  const ip = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown';
  const { allowed, retryAfterSecs } = checkRateLimit(`login:${ip}`, { maxRequests: 5, windowMs: 15 * 60 * 1000 });
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

    // Limites de taille pour éviter les payloads abusifs
    if (pseudo.length > 30 || password.length > 100) {
      return NextResponse.json({ message: 'Identifiants invalides' }, { status: 400 });
    }

    await connectDB();

    const user = await User.findOne({ pseudo });
    if (!user) {
      return NextResponse.json({ message: 'Identifiants invalides' }, { status: 401 });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return NextResponse.json({ message: 'Identifiants invalides' }, { status: 401 });
    }

    const token = signToken({ userId: user._id.toString(), pseudo: user.pseudo });
    await setAuthCookie(token);

    return NextResponse.json(
      { message: 'Connexion réussie', user: { id: user._id, pseudo: user.pseudo, level: user.level, xp: user.xp, avatar: user.avatar } },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erreur connexion:', error);
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}
