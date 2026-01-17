import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Nettoyer la base de données
  await prisma.userAnswer.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.leaderboard.deleteMany();
  await prisma.question.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // ============================================
  // CATÉGORIES
  // ============================================
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: 'Coran',
        slug: 'coran',
        description: 'Questions sur le Saint Coran',
        icon: '📖',
        color: '#10B981',
        order: 1,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Prophètes',
        slug: 'prophetes',
        description: 'Questions sur les prophètes',
        icon: '🕌',
        color: '#3B82F6',
        order: 2,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Piliers',
        slug: 'piliers',
        description: 'Les 5 piliers de l\'Islam',
        icon: '🕋',
        color: '#8B5CF6',
        order: 3,
      },
    }),
    prisma.category.create({
      data: {
        name: 'Histoire',
        slug: 'histoire',
        description: 'Histoire de l\'Islam',
        icon: '📜',
        color: '#F59E0B',
        order: 4,
      },
    }),
  ]);

  console.log(`✅ ${categories.length} catégories créées`);

  // ============================================
  // QUESTIONS - CORAN
  // ============================================
  const coranQuestions = [
    {
      questionEn: 'How many surahs are in the Quran?',
      questionFr: 'Combien de sourates contient le Coran ?',
      questionAr: 'كم عدد سور القرآن الكريم؟',
      option1En: '114', option1Fr: '114', option1Ar: '١١٤',
      option2En: '100', option2Fr: '100', option2Ar: '١٠٠',
      option3En: '120', option3Fr: '120', option3Ar: '١٢٠',
      option4En: '99', option4Fr: '99', option4Ar: '٩٩',
      correctAnswer: 1,
      difficulty: 1,
      explanationEn: 'The Quran contains 114 surahs.',
      explanationFr: 'Le Coran contient 114 sourates.',
      explanationAr: 'يحتوي القرآن الكريم على ١١٤ سورة.',
    },
    {
      questionEn: 'What is the first surah of the Quran?',
      questionFr: 'Quelle est la première sourate du Coran ?',
      questionAr: 'ما هي أول سورة في القرآن الكريم؟',
      option1En: 'Al-Fatiha', option1Fr: 'Al-Fatiha', option1Ar: 'الفاتحة',
      option2En: 'Al-Baqara', option2Fr: 'Al-Baqara', option2Ar: 'البقرة',
      option3En: 'Al-Ikhlas', option3Fr: 'Al-Ikhlas', option3Ar: 'الإخلاص',
      option4En: 'An-Nas', option4Fr: 'An-Nas', option4Ar: 'الناس',
      correctAnswer: 1,
      difficulty: 1,
      explanationEn: 'Al-Fatiha (The Opening) is the first surah of the Quran.',
      explanationFr: 'Al-Fatiha (L\'Ouverture) est la première sourate du Coran.',
      explanationAr: 'الفاتحة هي أول سورة في القرآن الكريم.',
    },
    {
      questionEn: 'What is the longest surah in the Quran?',
      questionFr: 'Quelle est la plus longue sourate du Coran ?',
      questionAr: 'ما هي أطول سورة في القرآن الكريم؟',
      option1En: 'Al-Baqara', option1Fr: 'Al-Baqara', option1Ar: 'البقرة',
      option2En: 'Al-Imran', option2Fr: 'Al-Imran', option2Ar: 'آل عمران',
      option3En: 'An-Nisa', option3Fr: 'An-Nisa', option3Ar: 'النساء',
      option4En: 'Al-Maidah', option4Fr: 'Al-Maidah', option4Ar: 'المائدة',
      correctAnswer: 1,
      difficulty: 1,
      explanationEn: 'Al-Baqara (The Cow) is the longest surah with 286 verses.',
      explanationFr: 'Al-Baqara (La Vache) est la plus longue sourate avec 286 versets.',
      explanationAr: 'سورة البقرة هي أطول سورة بـ ٢٨٦ آية.',
    },
    {
      questionEn: 'What is the shortest surah in the Quran?',
      questionFr: 'Quelle est la plus courte sourate du Coran ?',
      questionAr: 'ما هي أقصر سورة في القرآن الكريم؟',
      option1En: 'Al-Kawthar', option1Fr: 'Al-Kawthar', option1Ar: 'الكوثر',
      option2En: 'Al-Ikhlas', option2Fr: 'Al-Ikhlas', option2Ar: 'الإخلاص',
      option3En: 'Al-Asr', option3Fr: 'Al-Asr', option3Ar: 'العصر',
      option4En: 'An-Nasr', option4Fr: 'An-Nasr', option4Ar: 'النصر',
      correctAnswer: 1,
      difficulty: 2,
      explanationEn: 'Al-Kawthar is the shortest surah with only 3 verses.',
      explanationFr: 'Al-Kawthar est la plus courte sourate avec seulement 3 versets.',
      explanationAr: 'سورة الكوثر هي أقصر سورة بـ ٣ آيات فقط.',
    },
    {
      questionEn: 'In which month was the Quran revealed?',
      questionFr: 'En quel mois le Coran a-t-il été révélé ?',
      questionAr: 'في أي شهر نزل القرآن الكريم؟',
      option1En: 'Ramadan', option1Fr: 'Ramadan', option1Ar: 'رمضان',
      option2En: 'Shaban', option2Fr: 'Chaabane', option2Ar: 'شعبان',
      option3En: 'Rajab', option3Fr: 'Rajab', option3Ar: 'رجب',
      option4En: 'Muharram', option4Fr: 'Mouharram', option4Ar: 'محرم',
      correctAnswer: 1,
      difficulty: 1,
      explanationEn: 'The Quran was revealed during the month of Ramadan.',
      explanationFr: 'Le Coran a été révélé pendant le mois de Ramadan.',
      explanationAr: 'نزل القرآن الكريم في شهر رمضان المبارك.',
      verse: 'Sourate Al-Baqara, 2:185',
    },
  ];

  // ============================================
  // QUESTIONS - PROPHÈTES
  // ============================================
  const prophetesQuestions = [
    {
      questionEn: 'Who is the last prophet in Islam?',
      questionFr: 'Qui est le dernier prophète en Islam ?',
      questionAr: 'من هو آخر الأنبياء في الإسلام؟',
      option1En: 'Muhammad ﷺ', option1Fr: 'Muhammad ﷺ', option1Ar: 'محمد ﷺ',
      option2En: 'Isa (Jesus)', option2Fr: 'Issa (Jésus)', option2Ar: 'عيسى عليه السلام',
      option3En: 'Musa (Moses)', option3Fr: 'Moussa (Moïse)', option3Ar: 'موسى عليه السلام',
      option4En: 'Ibrahim (Abraham)', option4Fr: 'Ibrahim (Abraham)', option4Ar: 'إبراهيم عليه السلام',
      correctAnswer: 1,
      difficulty: 1,
      explanationEn: 'Prophet Muhammad ﷺ is the seal of the prophets.',
      explanationFr: 'Le Prophète Muhammad ﷺ est le sceau des prophètes.',
      explanationAr: 'النبي محمد ﷺ هو خاتم الأنبياء والمرسلين.',
    },
    {
      questionEn: 'Which prophet built the Kaaba?',
      questionFr: 'Quel prophète a construit la Kaaba ?',
      questionAr: 'أي نبي بنى الكعبة؟',
      option1En: 'Ibrahim (Abraham)', option1Fr: 'Ibrahim (Abraham)', option1Ar: 'إبراهيم عليه السلام',
      option2En: 'Muhammad ﷺ', option2Fr: 'Muhammad ﷺ', option2Ar: 'محمد ﷺ',
      option3En: 'Nuh (Noah)', option3Fr: 'Nouh (Noé)', option3Ar: 'نوح عليه السلام',
      option4En: 'Adam', option4Fr: 'Adam', option4Ar: 'آدم عليه السلام',
      correctAnswer: 1,
      difficulty: 1,
      explanationEn: 'Prophet Ibrahim and his son Ismail built the Kaaba.',
      explanationFr: 'Le Prophète Ibrahim et son fils Ismaïl ont construit la Kaaba.',
      explanationAr: 'بنى النبي إبراهيم وابنه إسماعيل الكعبة المشرفة.',
    },
    {
      questionEn: 'Which prophet was swallowed by a whale?',
      questionFr: 'Quel prophète a été avalé par une baleine ?',
      questionAr: 'أي نبي ابتلعه الحوت؟',
      option1En: 'Yunus (Jonah)', option1Fr: 'Younous (Jonas)', option1Ar: 'يونس عليه السلام',
      option2En: 'Musa (Moses)', option2Fr: 'Moussa (Moïse)', option2Ar: 'موسى عليه السلام',
      option3En: 'Nuh (Noah)', option3Fr: 'Nouh (Noé)', option3Ar: 'نوح عليه السلام',
      option4En: 'Ayub (Job)', option4Fr: 'Ayoub (Job)', option4Ar: 'أيوب عليه السلام',
      correctAnswer: 1,
      difficulty: 1,
      explanationEn: 'Prophet Yunus was swallowed by a whale and prayed to Allah from its belly.',
      explanationFr: 'Le Prophète Younous a été avalé par une baleine et a prié Allah depuis son ventre.',
      explanationAr: 'ابتلع الحوت النبي يونس فدعا الله من بطنه.',
    },
    {
      questionEn: 'Which prophet could speak to animals?',
      questionFr: 'Quel prophète pouvait parler aux animaux ?',
      questionAr: 'أي نبي كان يتحدث مع الحيوانات؟',
      option1En: 'Sulayman (Solomon)', option1Fr: 'Souleymane (Salomon)', option1Ar: 'سليمان عليه السلام',
      option2En: 'Dawud (David)', option2Fr: 'Daoud (David)', option2Ar: 'داود عليه السلام',
      option3En: 'Yusuf (Joseph)', option3Fr: 'Youssouf (Joseph)', option3Ar: 'يوسف عليه السلام',
      option4En: 'Musa (Moses)', option4Fr: 'Moussa (Moïse)', option4Ar: 'موسى عليه السلام',
      correctAnswer: 1,
      difficulty: 2,
      explanationEn: 'Prophet Sulayman was given the ability to understand and speak to animals.',
      explanationFr: 'Le Prophète Souleymane a reçu la capacité de comprendre et de parler aux animaux.',
      explanationAr: 'أعطي النبي سليمان القدرة على فهم لغة الحيوانات والتحدث إليها.',
    },
    {
      questionEn: 'Who was the first prophet?',
      questionFr: 'Qui était le premier prophète ?',
      questionAr: 'من كان أول نبي؟',
      option1En: 'Adam', option1Fr: 'Adam', option1Ar: 'آدم عليه السلام',
      option2En: 'Nuh (Noah)', option2Fr: 'Nouh (Noé)', option2Ar: 'نوح عليه السلام',
      option3En: 'Ibrahim (Abraham)', option3Fr: 'Ibrahim (Abraham)', option3Ar: 'إبراهيم عليه السلام',
      option4En: 'Idris (Enoch)', option4Fr: 'Idris (Énoch)', option4Ar: 'إدريس عليه السلام',
      correctAnswer: 1,
      difficulty: 1,
      explanationEn: 'Adam was the first human and the first prophet.',
      explanationFr: 'Adam était le premier homme et le premier prophète.',
      explanationAr: 'آدم عليه السلام كان أول إنسان وأول نبي.',
    },
  ];

  // ============================================
  // QUESTIONS - PILIERS
  // ============================================
  const piliersQuestions = [
    {
      questionEn: 'How many pillars of Islam are there?',
      questionFr: 'Combien y a-t-il de piliers de l\'Islam ?',
      questionAr: 'كم عدد أركان الإسلام؟',
      option1En: '5', option1Fr: '5', option1Ar: '٥',
      option2En: '4', option2Fr: '4', option2Ar: '٤',
      option3En: '6', option3Fr: '6', option3Ar: '٦',
      option4En: '3', option4Fr: '3', option4Ar: '٣',
      correctAnswer: 1,
      difficulty: 1,
      explanationEn: 'There are 5 pillars of Islam: Shahada, Salat, Zakat, Sawm, and Hajj.',
      explanationFr: 'Il y a 5 piliers de l\'Islam : Shahada, Salat, Zakat, Sawm et Hajj.',
      explanationAr: 'أركان الإسلام خمسة: الشهادة، الصلاة، الزكاة، الصوم، والحج.',
    },
    {
      questionEn: 'How many daily prayers are obligatory in Islam?',
      questionFr: 'Combien de prières quotidiennes sont obligatoires en Islam ?',
      questionAr: 'كم عدد الصلوات اليومية المفروضة في الإسلام؟',
      option1En: '5', option1Fr: '5', option1Ar: '٥',
      option2En: '3', option2Fr: '3', option2Ar: '٣',
      option3En: '7', option3Fr: '7', option3Ar: '٧',
      option4En: '4', option4Fr: '4', option4Ar: '٤',
      correctAnswer: 1,
      difficulty: 1,
      explanationEn: 'Muslims pray 5 times a day: Fajr, Dhuhr, Asr, Maghrib, and Isha.',
      explanationFr: 'Les musulmans prient 5 fois par jour : Fajr, Dhuhr, Asr, Maghrib et Isha.',
      explanationAr: 'يصلي المسلمون ٥ صلوات يومياً: الفجر، الظهر، العصر، المغرب، والعشاء.',
    },
    {
      questionEn: 'What is the name of the Islamic fasting month?',
      questionFr: 'Comment s\'appelle le mois de jeûne islamique ?',
      questionAr: 'ما اسم شهر الصيام في الإسلام؟',
      option1En: 'Ramadan', option1Fr: 'Ramadan', option1Ar: 'رمضان',
      option2En: 'Shawwal', option2Fr: 'Chawwal', option2Ar: 'شوال',
      option3En: 'Dhul Hijjah', option3Fr: 'Dhoul Hijja', option3Ar: 'ذو الحجة',
      option4En: 'Muharram', option4Fr: 'Mouharram', option4Ar: 'محرم',
      correctAnswer: 1,
      difficulty: 1,
      explanationEn: 'Ramadan is the holy month of fasting, the 9th month of the Islamic calendar.',
      explanationFr: 'Le Ramadan est le mois sacré du jeûne, le 9ème mois du calendrier islamique.',
      explanationAr: 'رمضان هو شهر الصيام المبارك، الشهر التاسع من التقويم الهجري.',
    },
    {
      questionEn: 'What is Zakat?',
      questionFr: 'Qu\'est-ce que la Zakat ?',
      questionAr: 'ما هي الزكاة؟',
      option1En: 'Obligatory charity', option1Fr: 'Aumône obligatoire', option1Ar: 'صدقة واجبة',
      option2En: 'Voluntary prayer', option2Fr: 'Prière volontaire', option2Ar: 'صلاة تطوعية',
      option3En: 'Pilgrimage', option3Fr: 'Pèlerinage', option3Ar: 'الحج',
      option4En: 'Fasting', option4Fr: 'Jeûne', option4Ar: 'الصيام',
      correctAnswer: 1,
      difficulty: 1,
      explanationEn: 'Zakat is the obligatory charity, 2.5% of savings given to those in need.',
      explanationFr: 'La Zakat est l\'aumône obligatoire, 2,5% des économies donnés aux nécessiteux.',
      explanationAr: 'الزكاة هي الصدقة الواجبة، ٢.٥٪ من المدخرات تعطى للمحتاجين.',
    },
    {
      questionEn: 'Where do Muslims go for Hajj?',
      questionFr: 'Où les musulmans vont-ils pour le Hajj ?',
      questionAr: 'أين يذهب المسلمون لأداء الحج؟',
      option1En: 'Makkah (Mecca)', option1Fr: 'La Mecque', option1Ar: 'مكة المكرمة',
      option2En: 'Madinah', option2Fr: 'Médine', option2Ar: 'المدينة المنورة',
      option3En: 'Jerusalem', option3Fr: 'Jérusalem', option3Ar: 'القدس',
      option4En: 'Cairo', option4Fr: 'Le Caire', option4Ar: 'القاهرة',
      correctAnswer: 1,
      difficulty: 1,
      explanationEn: 'Hajj is performed in Makkah, Saudi Arabia.',
      explanationFr: 'Le Hajj s\'accomplit à La Mecque, en Arabie Saoudite.',
      explanationAr: 'يؤدى الحج في مكة المكرمة بالمملكة العربية السعودية.',
    },
  ];

  // ============================================
  // QUESTIONS - HISTOIRE
  // ============================================
  const histoireQuestions = [
    {
      questionEn: 'In which year was Prophet Muhammad ﷺ born?',
      questionFr: 'En quelle année est né le Prophète Muhammad ﷺ ?',
      questionAr: 'في أي عام ولد النبي محمد ﷺ؟',
      option1En: '570 CE', option1Fr: '570 après J.-C.', option1Ar: '٥٧٠ ميلادي',
      option2En: '610 CE', option2Fr: '610 après J.-C.', option2Ar: '٦١٠ ميلادي',
      option3En: '550 CE', option3Fr: '550 après J.-C.', option3Ar: '٥٥٠ ميلادي',
      option4En: '600 CE', option4Fr: '600 après J.-C.', option4Ar: '٦٠٠ ميلادي',
      correctAnswer: 1,
      difficulty: 2,
      explanationEn: 'Prophet Muhammad ﷺ was born in 570 CE, the Year of the Elephant.',
      explanationFr: 'Le Prophète Muhammad ﷺ est né en 570, l\'Année de l\'Éléphant.',
      explanationAr: 'ولد النبي محمد ﷺ عام ٥٧٠ ميلادي، عام الفيل.',
    },
    {
      questionEn: 'What is the Hijra?',
      questionFr: 'Qu\'est-ce que l\'Hégire ?',
      questionAr: 'ما هي الهجرة؟',
      option1En: 'Migration to Madinah', option1Fr: 'Migration vers Médine', option1Ar: 'الهجرة إلى المدينة',
      option2En: 'Battle of Badr', option2Fr: 'Bataille de Badr', option2Ar: 'غزوة بدر',
      option3En: 'Conquest of Makkah', option3Fr: 'Conquête de La Mecque', option3Ar: 'فتح مكة',
      option4En: 'Treaty of Hudaybiyyah', option4Fr: 'Traité de Hudaybiyyah', option4Ar: 'صلح الحديبية',
      correctAnswer: 1,
      difficulty: 1,
      explanationEn: 'The Hijra was the migration of Muslims from Makkah to Madinah in 622 CE.',
      explanationFr: 'L\'Hégire fut la migration des musulmans de La Mecque à Médine en 622.',
      explanationAr: 'الهجرة هي انتقال المسلمين من مكة إلى المدينة عام ٦٢٢ ميلادي.',
    },
    {
      questionEn: 'What was the first battle in Islam?',
      questionFr: 'Quelle fut la première bataille en Islam ?',
      questionAr: 'ما هي أول غزوة في الإسلام؟',
      option1En: 'Battle of Badr', option1Fr: 'Bataille de Badr', option1Ar: 'غزوة بدر',
      option2En: 'Battle of Uhud', option2Fr: 'Bataille d\'Uhud', option2Ar: 'غزوة أحد',
      option3En: 'Battle of Khandaq', option3Fr: 'Bataille de Khandaq', option3Ar: 'غزوة الخندق',
      option4En: 'Battle of Hunayn', option4Fr: 'Bataille de Hunayn', option4Ar: 'غزوة حنين',
      correctAnswer: 1,
      difficulty: 2,
      explanationEn: 'The Battle of Badr was the first major battle, fought in 624 CE.',
      explanationFr: 'La bataille de Badr fut la première grande bataille, en 624.',
      explanationAr: 'غزوة بدر كانت أول معركة كبرى، وقعت عام ٦٢٤ ميلادي.',
    },
    {
      questionEn: 'Who was the first Caliph after Prophet Muhammad ﷺ?',
      questionFr: 'Qui fut le premier calife après le Prophète Muhammad ﷺ ?',
      questionAr: 'من كان أول خليفة بعد النبي محمد ﷺ؟',
      option1En: 'Abu Bakr', option1Fr: 'Abou Bakr', option1Ar: 'أبو بكر الصديق',
      option2En: 'Umar', option2Fr: 'Omar', option2Ar: 'عمر بن الخطاب',
      option3En: 'Uthman', option3Fr: 'Othman', option3Ar: 'عثمان بن عفان',
      option4En: 'Ali', option4Fr: 'Ali', option4Ar: 'علي بن أبي طالب',
      correctAnswer: 1,
      difficulty: 1,
      explanationEn: 'Abu Bakr As-Siddiq was the first Caliph (632-634 CE).',
      explanationFr: 'Abou Bakr As-Siddiq fut le premier calife (632-634).',
      explanationAr: 'أبو بكر الصديق كان أول خليفة (٦٣٢-٦٣٤ ميلادي).',
    },
    {
      questionEn: 'In which cave did Prophet Muhammad ﷺ receive the first revelation?',
      questionFr: 'Dans quelle grotte le Prophète Muhammad ﷺ a-t-il reçu la première révélation ?',
      questionAr: 'في أي غار تلقى النبي محمد ﷺ أول وحي؟',
      option1En: 'Cave of Hira', option1Fr: 'Grotte de Hira', option1Ar: 'غار حراء',
      option2En: 'Cave of Thawr', option2Fr: 'Grotte de Thawr', option2Ar: 'غار ثور',
      option3En: 'Cave of Kahf', option3Fr: 'Grotte de Kahf', option3Ar: 'كهف أهل الكهف',
      option4En: 'Cave of Uhud', option4Fr: 'Grotte d\'Uhud', option4Ar: 'غار أحد',
      correctAnswer: 1,
      difficulty: 1,
      explanationEn: 'Prophet Muhammad ﷺ received the first revelation in the Cave of Hira.',
      explanationFr: 'Le Prophète Muhammad ﷺ a reçu la première révélation dans la grotte de Hira.',
      explanationAr: 'تلقى النبي محمد ﷺ أول وحي في غار حراء.',
    },
  ];

  // Insérer les questions
  const allQuestions = [
    ...coranQuestions.map(q => ({ ...q, categoryId: categories[0].id })),
    ...prophetesQuestions.map(q => ({ ...q, categoryId: categories[1].id })),
    ...piliersQuestions.map(q => ({ ...q, categoryId: categories[2].id })),
    ...histoireQuestions.map(q => ({ ...q, categoryId: categories[3].id })),
  ];

  for (const question of allQuestions) {
    await prisma.question.create({ data: question });
  }

  console.log(`✅ ${allQuestions.length} questions créées`);

  // ============================================
  // UTILISATEUR DE TEST
  // ============================================
  const testUser = await prisma.user.create({
    data: {
      pseudo: 'TestUser',
      password: '$2b$10$example', // À remplacer par un vrai hash bcrypt
      level: 1,
      xp: 0,
    },
  });

  console.log(`✅ Utilisateur de test créé: ${testUser.pseudo}`);

  console.log('');
  console.log('🎉 Seed terminé avec succès !');
  console.log('');
  console.log('📊 Résumé:');
  console.log(`   - ${categories.length} catégories`);
  console.log(`   - ${allQuestions.length} questions`);
  console.log(`   - 1 utilisateur de test`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors du seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
