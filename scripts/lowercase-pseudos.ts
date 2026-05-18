import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

const UserSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.models.User || mongoose.model('User', UserSchema);

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!);

  const users = await User.find({});
  let updated = 0;

  for (const user of users) {
    const lower = user.pseudo?.toLowerCase().trim();
    if (lower && lower !== user.pseudo) {
      await User.updateOne({ _id: user._id }, { pseudo: lower });
      console.log(`  ${user.pseudo} → ${lower}`);
      updated++;
    }
  }

  console.log(`\n✅ ${updated} pseudo(s) mis en minuscules (${users.length - updated} déjà OK)`);
  await mongoose.disconnect();
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
