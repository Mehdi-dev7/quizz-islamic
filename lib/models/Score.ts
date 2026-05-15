import mongoose, { Schema, model, models } from 'mongoose';

// ============================================
// SCHÉMA SCORE
// Enregistré uniquement après un examen.
// Alimente le classement en live.
// ============================================
export interface IScore {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  pseudo: string;   // dénormalisé pour éviter un join à chaque affichage du classement
  avatar: string;   // idem
  level: number;    // niveau au moment de l'examen
  correctAnswers: number; // nombre de bonnes réponses (sur 45 max : 4x10 + 5 bonus)
  totalQuestions: number; // toujours 45
  bonusCorrect: number;   // bonnes réponses parmi les 5 bonus
  completedAt: Date;
}

const ScoreSchema = new Schema<IScore>(
  {
    userId:         { type: Schema.Types.ObjectId, ref: 'User', required: true },
    pseudo:         { type: String, required: true },
    avatar:         { type: String, required: true },
    level:          { type: Number, required: true },
    correctAnswers: { type: Number, required: true },
    totalQuestions: { type: Number, default: 45 },
    bonusCorrect:   { type: Number, default: 0 },
    completedAt:    { type: Date, default: Date.now },
  }
);

// Index pour trier le classement rapidement
ScoreSchema.index({ correctAnswers: -1, level: -1 });

export const Score = models.Score || model<IScore>('Score', ScoreSchema);
