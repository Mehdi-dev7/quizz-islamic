import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Category } from '@/lib/models/Category';
import { Question } from '@/lib/models/Question';
import { User } from '@/lib/models/User';
import { getAuthFromCookie } from '@/lib/jwt';

// GET /api/quiz/training/[slug]?locale=fr
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const auth = await getAuthFromCookie();
    if (!auth) return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });

    const { slug } = await params;
    const locale = req.nextUrl.searchParams.get('locale') ?? 'fr';
    const diffParam = req.nextUrl.searchParams.get('difficulty');

    await connectDB();

    const [category, user] = await Promise.all([
      Category.findOne({ slug }).lean(),
      User.findById(auth.userId).select('level').lean(),
    ]);

    if (!category) return NextResponse.json({ message: 'Catégorie introuvable' }, { status: 404 });

    // Difficulté max débloquée pour ce joueur
    const userMaxDifficulty = Math.min((user?.level ?? 1) + 1, 5);

    // Si l'utilisateur choisit une difficulté, on la respecte (dans la limite de son max)
    const selectedDifficulty = diffParam
      ? Math.min(parseInt(diffParam), userMaxDifficulty)
      : userMaxDifficulty;

    // Révision = difficulté choisie < max débloqué
    const isRevision = selectedDifficulty < userMaxDifficulty;

    const allQuestions = await Question.find({
      categoryId: category._id,
      difficulty: { $lte: selectedDifficulty },
      isBonus: false,
    }).lean();

    // Mélanger et prendre 10 (Fisher-Yates — distribution uniforme)
    const shuffled = fisherYates(allQuestions).slice(0, 10);

    // Formater pour le client (langue + structure simplifiée)
    const questions = shuffled.map((q) => ({
      _id: q._id.toString(),
      question: q[`question${cap(locale)}`] as string,
      options: [
        q[`option1${cap(locale)}`] as string,
        q[`option2${cap(locale)}`] as string,
        q[`option3${cap(locale)}`] as string,
        q[`option4${cap(locale)}`] as string,
      ],
      correctAnswer: q.correctAnswer, // 1-4
      explanation: q[`explanation${cap(locale)}`] as string | undefined,
      difficulty: q.difficulty,
      isBonus: false,
    }));

    const categoryName = category[`name${cap(locale)}` as keyof typeof category] as string | undefined
      ?? category.name;

    return NextResponse.json({
      questions,
      categoryName,
      categorySlug: slug,
      isRevision,
      selectedDifficulty,
      userMaxDifficulty,
    });
  } catch (error) {
    console.error('Erreur training questions:', error);
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Mélange aléatoire non biaisé (Fisher-Yates)
function fisherYates<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
