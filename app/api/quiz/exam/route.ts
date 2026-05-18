import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Category } from '@/lib/models/Category';
import { Question } from '@/lib/models/Question';
import { getAuthFromCookie } from '@/lib/jwt';

// GET /api/quiz/exam?locale=fr
// Retourne 10 questions par catégorie + 5 questions bonus
export async function GET(req: NextRequest) {
  try {
    const auth = await getAuthFromCookie();
    if (!auth) return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });

    const locale = req.nextUrl.searchParams.get('locale') ?? 'fr';

    await connectDB();

    const categories = await Category.find().sort({ order: 1 }).lean();

    // 10 questions par catégorie (toutes difficultés)
    const categoryQuestionsPromises = categories.map(async (cat) => {
      const all = await Question.find({ categoryId: cat._id, isBonus: false }).lean();
      return fisherYates(all).slice(0, 10);
    });

    // 5 questions bonus (parmi toutes les catégories)
    const bonusPromise = Question.find({ isBonus: true }).lean().then((all) =>
      fisherYates(all).slice(0, 5)
    );

    const [categoryResults, bonusQuestions] = await Promise.all([
      Promise.all(categoryQuestionsPromises),
      bonusPromise,
    ]);

    const allQuestions = [...categoryResults.flat(), ...bonusQuestions];

    const formatted = allQuestions.map((q) => ({
      _id: q._id.toString(),
      question: q[`question${cap(locale)}`] as string,
      options: [
        q[`option1${cap(locale)}`] as string,
        q[`option2${cap(locale)}`] as string,
        q[`option3${cap(locale)}`] as string,
        q[`option4${cap(locale)}`] as string,
      ],
      correctAnswer: q.correctAnswer,
      explanation: q[`explanation${cap(locale)}`] as string | undefined,
      difficulty: q.difficulty,
      isBonus: q.isBonus,
    }));

    return NextResponse.json({ questions: formatted, total: formatted.length });
  } catch (error) {
    console.error('Erreur exam questions:', error);
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function fisherYates<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
