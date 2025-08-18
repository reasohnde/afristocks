import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Début du seeding...');

  const adminPassword = await bcrypt.hash('Admin123!', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@afristocks.com' },
    update: {},
    create: {
      email: 'admin@afristocks.com',
      name: 'Admin AfriStocks',
      passwordHash: adminPassword,
      role: 'ADMIN',
      wallet: {
        create: {
          balance: 0,
          lockedBalance: 0,
          currency: 'XOF'
        }
      }
    }
  });

  console.log('✅ Admin créé:', admin.email);

  const startups = [
    {
      name: 'AgriTech Solutions',
      description: 'Plateforme de gestion agricole connectée pour les agriculteurs africains',
      website: 'https://agritech-solutions.com',
      valuationTarget: 50000000,
      minInvestment: 10000,
      maxInvestment: 1000000,
      pitch: 'Révolutionner l\'agriculture en Afrique avec la technologie'
    },
    {
      name: 'MobilePay Africa',
      description: 'Solution de paiement mobile pour les marchés émergents',
      website: 'https://mobilepay-africa.com',
      valuationTarget: 100000000,
      minInvestment: 25000,
      maxInvestment: 2000000,
      pitch: 'Faciliter les paiements digitaux partout en Afrique'
    },
    {
      name: 'EduConnect',
      description: 'Plateforme d\'e-learning adaptée au contexte africain',
      website: 'https://educonnect.africa',
      valuationTarget: 30000000,
      minInvestment: 5000,
      maxInvestment: 500000,
      pitch: 'Démocratiser l\'éducation de qualité en Afrique'
    }
  ];

  for (const startupData of startups) {
    const startup = await prisma.startup.create({
      data: {
        ...startupData,
        raisedAmount: Math.floor(Math.random() * startupData.valuationTarget * 0.3),
        startDate: new Date(),
        endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
        isActive: true
      }
    });
    console.log('✅ Startup créée:', startup.name);
  }

  console.log('🎉 Seeding terminé!');
}

main()
  .catch((e) => {
    console.error('❌ Erreur pendant le seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
