import mongoose, { Schema, model, models } from 'mongoose';

export interface IQuestion {
  _id: mongoose.Types.ObjectId;
  categoryId: mongoose.Types.ObjectId;

  // Texte de la question en 3 langues
  questionEn: string;
  questionFr: string;
  questionAr: string;

  // 4 options × 3 langues
  option1En: string; option1Fr: string; option1Ar: string;
  option2En: string; option2Fr: string; option2Ar: string;
  option3En: string; option3Fr: string; option3Ar: string;
  option4En: string; option4Fr: string; option4Ar: string;

  correctAnswer: number;  // 1, 2, 3 ou 4
  difficulty: number;     // 1 (facile) → 5 (très difficile)
  isBonus: boolean;       // réservé aux 5 questions bonus de l'examen

  // Explication optionnelle en 3 langues
  explanationEn?: string;
  explanationFr?: string;
  explanationAr?: string;

  verse?: string; // référence coranique si applicable
  createdAt: Date;
}

const QuestionSchema = new Schema<IQuestion>(
  {
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', required: true },

    questionEn: { type: String, required: true },
    questionFr: { type: String, required: true },
    questionAr: { type: String, required: true },

    option1En: { type: String, required: true }, option1Fr: { type: String, required: true }, option1Ar: { type: String, required: true },
    option2En: { type: String, required: true }, option2Fr: { type: String, required: true }, option2Ar: { type: String, required: true },
    option3En: { type: String, required: true }, option3Fr: { type: String, required: true }, option3Ar: { type: String, required: true },
    option4En: { type: String, required: true }, option4Fr: { type: String, required: true }, option4Ar: { type: String, required: true },

    correctAnswer: { type: Number, required: true, min: 1, max: 4 },
    difficulty:    { type: Number, required: true, min: 1, max: 5 },
    isBonus:       { type: Boolean, default: false },

    explanationEn: { type: String },
    explanationFr: { type: String },
    explanationAr: { type: String },
    verse:         { type: String },
  },
  { timestamps: true }
);

// Index pour filtrer rapidement par catégorie et difficulté
QuestionSchema.index({ categoryId: 1, difficulty: 1 });
QuestionSchema.index({ isBonus: 1 });

export const Question = models.Question || model<IQuestion>('Question', QuestionSchema);
