import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Question } from '@/lib/models/Question';
import { User } from '@/lib/models/User';
import { Score } from '@/lib/models/Score';
import { getAuthFromCookie } from '@/lib/jwt';
import mongoose from 'mongoose';

interface SubmitAnswer {
  questionId: string;
  selectedAnswer: number; // 1-4
}

// POST /api/quiz/submit
// Body: { answers, mode: 'training' | 'exam' }
export async function POST(req: NextRequest) {
  try {
    const auth = await getAuthFromCookie();
    if (!auth) return NextResponse.json({ message: 'Non authentifié' }, { status: 401 });

    const body = await req.json();
    const { answers, mode, isRevision = false }: { answers: SubmitAnswer[]; mode: 'training' | 'exam'; isRevision?: boolean } = body;

    if (!answers?.length || !mode) {
      return NextResponse.json({ message: 'Données manquantes' }, { status: 400 });
    }

    await connectDB();

    // Récupérer toutes les questions en une requête
    const ids = answers.map((a) => new mongoose.Types.ObjectId(a.questionId));
    const questions = await Question.find({ _id: { $in: ids } }).lean();
    const questionMap = new Map(questions.map((q) => [q._id.toString(), q]));

    // Si aucune question trouvée, les IDs sont périmés (ex: reseed entre le chargement et la soumission)
    if (questionMap.size === 0) {
      return NextResponse.json({ message: 'Session expirée, veuillez relancer l\'examen.' }, { status: 409 });
    }

    // Calculer les bonnes réponses et les XP
    let correctAnswers = 0;
    let bonusCorrect = 0;
    let xpGained = 0;

    for (const answer of answers) {
      const q = questionMap.get(answer.questionId);
      if (!q) continue;

      const isCorrect = q.correctAnswer === answer.selectedAnswer;
      if (!isCorrect) continue;

      correctAnswers++;
      // Pas d'XP en mode révision
      if (!isRevision) {
        if (q.isBonus) {
          bonusCorrect++;
          xpGained += mode === 'exam' ? 15 : 5;
        } else {
          xpGained += mode === 'exam' ? 8 : 5;
        }
      }
    }

    const user = await User.findById(auth.userId);
    if (!user) return NextResponse.json({ message: 'Utilisateur introuvable' }, { status: 404 });

    let newXp = user.xp + xpGained;
    let newLevel = user.level;
    let leveledUp = false;

    if (!isRevision && xpGained > 0) {
      while (newXp >= newLevel * 200) {
        newXp -= newLevel * 200;
        newLevel++;
        leveledUp = true;
      }
      await User.findByIdAndUpdate(auth.userId, { xp: newXp, level: newLevel });
    } else {
      // Révision : on ne touche pas aux stats
      newXp = user.xp;
      newLevel = user.level;
    }

    // Sauvegarder le score si c'est un examen
    if (mode === 'exam') {
      await Score.create({
        userId: auth.userId,
        pseudo: user.pseudo,
        avatar: user.avatar,
        level: newLevel,
        correctAnswers,
        totalQuestions: answers.length,
        bonusCorrect,
        completedAt: new Date(),
      });
    }

    return NextResponse.json({
      correctAnswers,
      totalQuestions: answers.length,
      bonusCorrect,
      xpGained,
      levelUp: leveledUp,
      newLevel,
      newXp,
      isRevision,
    });
  } catch (error) {
    console.error('Erreur submit quiz:', error);
    return NextResponse.json({ message: 'Erreur serveur' }, { status: 500 });
  }
}
