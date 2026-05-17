import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI!;

const ScoreSchema = new mongoose.Schema({}, { strict: false });
const Score = mongoose.models.Score || mongoose.model('Score', ScoreSchema);

async function main() {
  await mongoose.connect(MONGODB_URI);

  const { deletedCount } = await Score.deleteMany({});
  console.log(`✅ Classement réinitialisé — ${deletedCount} score(s) supprimé(s)`);

  await mongoose.disconnect();
}

main().catch(e => { console.error('❌', e.message); process.exit(1); });
