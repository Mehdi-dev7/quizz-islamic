import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI!;

const UserSchema = new mongoose.Schema({
  pseudo:   String,
  password: String,
});
const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function main() {
  const pseudo      = process.argv[2];
  const newPassword = process.argv[3];

  if (!pseudo || !newPassword) {
    console.log('Usage: npx tsx scripts/reset-password.ts <pseudo> <nouveau-mot-de-passe>');
    process.exit(1);
  }

  await mongoose.connect(MONGODB_URI);

  const user = await User.findOne({ pseudo });
  if (!user) {
    console.log(`❌ Utilisateur "${pseudo}" introuvable`);
    process.exit(1);
  }

  user.password = await bcrypt.hash(newPassword, 12);
  await user.save();

  console.log(`✅ Mot de passe de "${pseudo}" réinitialisé avec succès`);
  await mongoose.disconnect();
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
