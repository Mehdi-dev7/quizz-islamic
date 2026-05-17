import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI!;

const UserSchema = new mongoose.Schema({ pseudo: String, xp: Number, level: Number });
const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function main() {
  const pseudo = process.argv[2];

  if (!pseudo) {
    console.log('Usage: npx tsx scripts/reset-xp.ts <pseudo>');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);

  const result = await User.findOneAndUpdate(
    { pseudo },
    { xp: 0, level: 1 },
    { new: true }
  );

  if (!result) {
    console.log(`❌ Utilisateur "${pseudo}" introuvable`);
    process.exit(1);
  }

  console.log(`✅ "${pseudo}" → niveau 1, 0 XP`);
  await mongoose.disconnect();
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
