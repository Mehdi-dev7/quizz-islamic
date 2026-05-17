import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Score } from '@/lib/models/Score';
import { getAuthFromCookie } from '@/lib/jwt';

// GET /api/leaderboard — top 20 meilleurs scores d'examen
export async function GET() {
  try {
    const auth = await getAuthFromCookie();
    if (!auth) return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });

    await connectDB();

    // Un seul meilleur score par utilisateur (le meilleur correctAnswers)
    const scores = await Score.aggregate([
      // Meilleur score par utilisateur (score le plus élevé, à date égale le plus ancien gagne)
      { $sort: { correctAnswers: -1, completedAt: 1 } },
      {
        $group: {
          _id: '$userId',
          pseudo: { $first: '$pseudo' },
          avatar: { $first: '$avatar' },
          level: { $first: '$level' },
          correctAnswers: { $first: '$correctAnswers' },
          totalQuestions: { $first: '$totalQuestions' },
          bonusCorrect: { $first: '$bonusCorrect' },
          completedAt: { $first: '$completedAt' },
        },
      },
      // Tri final : score desc, puis à égalité le premier à l'avoir obtenu
      { $sort: { correctAnswers: -1, completedAt: 1 } },
      { $limit: 20 },
    ]);

    const result = scores.map((s, index) => ({
      rank: index + 1,
      userId: s._id.toString(),
      pseudo: s.pseudo,
      avatar: s.avatar,
      level: s.level,
      correctAnswers: s.correctAnswers,
      totalQuestions: s.totalQuestions,
      bonusCorrect: s.bonusCorrect,
      completedAt: s.completedAt,
      percentage: Math.round((s.correctAnswers / s.totalQuestions) * 100),
    }));

    return NextResponse.json({ scores: result, currentUserId: auth.userId });
  } catch (error) {
    console.error('Erreur leaderboard:', error);
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}
