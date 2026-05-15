import mongoose, { Schema, model, models } from 'mongoose';

// ============================================
// SCHÉMA USER
// Contient auth + progression (level, xp)
// ============================================
export interface IUser {
  _id: mongoose.Types.ObjectId;
  pseudo: string;
  password: string; // hashé avec bcrypt
  level: number;    // niveau actuel (commence à 1)
  xp: number;       // xp accumulés
  avatar: string;   // identifiant avatar choisi (ex: "avatar_1")
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    pseudo:   { type: String, required: true, unique: true, trim: true, minlength: 3 },
    password: { type: String, required: true },
    level:    { type: Number, default: 1 },
    xp:       { type: Number, default: 0 },
    avatar:   { type: String, default: 'avatar_1' },
  },
  { timestamps: true }
);

// Évite de recréer le modèle en hot-reload Next.js
export const User = models.User || model<IUser>('User', UserSchema);
