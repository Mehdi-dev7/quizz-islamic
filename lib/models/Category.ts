import mongoose, { Schema, model, models } from 'mongoose';

export interface ICategory {
  _id: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;      // classe Tailwind gradient ex: "from-green-500 to-green-600"
  borderColor: string; // classe Tailwind border ex: "border-green-500"
  order: number;
  createdAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    name:        { type: String, required: true, unique: true },
    slug:        { type: String, required: true, unique: true },
    description: { type: String, required: true },
    icon:        { type: String, required: true },
    color:       { type: String, required: true },
    borderColor: { type: String, required: true },
    order:       { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Category = models.Category || model<ICategory>('Category', CategorySchema);
