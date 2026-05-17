import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/lib/models/User';
import { getAuthFromCookie } from '@/lib/jwt';

export async function GET() {
  try {
    const auth = await getAuthFromCookie();

    if (!auth) {
      return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(auth.userId).select('-password');
    if (!user) {
      return NextResponse.json({ message: 'Utilisateur non trouvé' }, { status: 404 });
    }

    // XP requis pour le niveau suivant : niveau actuel × 100
    const xpForNextLevel = user.level * 200;

    return NextResponse.json({
      user: { id: user._id, pseudo: user.pseudo, level: user.level, xp: user.xp, avatar: user.avatar, xpForNextLevel }
    });
  } catch (error) {
    console.error('Erreur /me:', error);
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}
