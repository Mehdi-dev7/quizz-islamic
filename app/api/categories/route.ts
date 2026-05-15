import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Category } from '@/lib/models/Category';
import { Question } from '@/lib/models/Question';

// GET /api/categories — retourne les catégories avec le nombre de questions chacune
export async function GET() {
  try {
    await connectDB();

    const categories = await Category.find().sort({ order: 1 }).lean();

    // Compter les questions par catégorie en une seule requête groupée
    const counts = await Question.aggregate([
      { $group: { _id: '$categoryId', count: { $sum: 1 } } },
    ]);

    // Mapper les counts sur les catégories
    const countMap = Object.fromEntries(counts.map((c) => [c._id.toString(), c.count]));

    const result = categories.map((cat) => ({
      ...cat,
      _id: cat._id.toString(),
      questionCount: countMap[cat._id.toString()] ?? 0,
    }));

    return NextResponse.json({ categories: result });
  } catch (error) {
    console.error('Erreur récupération catégories:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
