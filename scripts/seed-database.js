const admin = require('firebase-admin');
const serviceAccount = require('./serviceAccountKey.json'); // Você vai baixar isso

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Categorias de serviço iniciais
const categories = [
  {
    id: 'plumber',
    name: 'Plumber',
    nameTranslations: {
      pt: 'Encanador',
      en: 'Plumber',
      es: 'Fontanero'
    },
    description: 'Water pipes, leaks, installations',
    icon: '🔧',
    color: '#3B82F6',
    isActive: true,
    displayOrder: 1
  },
  {
    id: 'electrician',
    name: 'Electrician',
    nameTranslations: {
      pt: 'Eletricista',
      en: 'Electrician',
      es: 'Electricista'
    },
    description: 'Electrical installations, repairs, wiring',
    icon: '⚡',
    color: '#F59E0B',
    isActive: true,
    displayOrder: 2
  },
  {
    id: 'painter',
    name: 'Painter',
    nameTranslations: {
      pt: 'Pintor',
      en: 'Painter',
      es: 'Pintor'
    },
    description: 'Interior and exterior painting',
    icon: '🎨',
    color: '#8B5CF6',
    isActive: true,
    displayOrder: 3
  },
  {
    id: 'handyman',
    name: 'Handyman',
    nameTranslations: {
      pt: 'Faz-tudo',
      en: 'Handyman',
      es: 'Manitas'
    },
    description: 'General repairs and maintenance',
    icon: '🔨',
    color: '#10B981',
    isActive: true,
    displayOrder: 4
  },
  {
    id: 'carpenter',
    name: 'Carpenter',
    nameTranslations: {
      pt: 'Carpinteiro',
      en: 'Carpenter',
      es: 'Carpintero'
    },
    description: 'Woodwork, furniture assembly, installations',
    icon: '🪚',
    color: '#92400E',
    isActive: true,
    displayOrder: 5
  },
  {
    id: 'cleaner',
    name: 'Cleaner',
    nameTranslations: {
      pt: 'Limpeza',
      en: 'Cleaner',
      es: 'Limpieza'
    },
    description: 'House cleaning, deep cleaning',
    icon: '🧹',
    color: '#06B6D4',
    isActive: true,
    displayOrder: 6
  },
  {
    id: 'gardener',
    name: 'Gardener',
    nameTranslations: {
      pt: 'Jardineiro',
      en: 'Gardener',
      es: 'Jardinero'
    },
    description: 'Garden maintenance, landscaping',
    icon: '🌱',
    color: '#22C55E',
    isActive: true,
    displayOrder: 7
  },
  {
    id: 'locksmith',
    name: 'Locksmith',
    nameTranslations: {
      pt: 'Chaveiro',
      en: 'Locksmith',
      es: 'Cerrajero'
    },
    description: 'Lock installation, emergency lockout',
    icon: '🔑',
    color: '#6B7280',
    isActive: true,
    displayOrder: 8
  }
];

async function seedDatabase() {
  console.log('🌱 Seeding database with initial data...\n');

  try {
    // Add service categories
    console.log('📝 Adding service categories...');
    for (const category of categories) {
      await db.collection('service_categories').doc(category.id).set({
        ...category,
        createdAt: admin.firestore.FieldValue.serverTimestamp()
      });
      console.log(`  ✅ Added: ${category.nameTranslations.en}`);
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log(`\n📊 Summary:`);
    console.log(`  - Service categories: ${categories.length}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

seedDatabase();
