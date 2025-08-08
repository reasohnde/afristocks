// backend/src/scripts/createAdmin.ts
import { PrismaClient, KycStatus, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Vérifier si l'admin existe déjà
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@afristocks.com' }
    });

    if (existingAdmin) {
      console.log('✅ Admin existe déjà');
      return;
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash('Admin123!', 10);

    // Créer l'admin
    const admin = await prisma.user.create({
      data: {
        email: 'admin@afristocks.com',
        passwordHash: hashedPassword,
        name: 'Admin AfriStocks',
        phone_number: '+225 0123456789',  // snake_case comme dans le schéma
        role: UserRole.ADMIN,  // UserRole au lieu de Role
        kycStatus: KycStatus.VERIFIED,  // VERIFIED au lieu de APPROVED
        email_verified: true,
        isActive: true,
        two_factor_enabled: false
      }
    });

    console.log('✅ Admin créé avec succès:', admin.email);
    console.log('📧 Email: admin@afristocks.com');
    console.log('🔐 Mot de passe: Admin123!');
    
  } catch (error) {
    console.error('❌ Erreur création admin:', error);
  }
}

// Créer aussi des utilisateurs de test
async function createTestUsers() {
  const users = [
    {
      email: 'investor@test.com',
      password: 'Test123!',
      name: 'Test Investor',
      role: UserRole.USER
    },
    {
      email: 'startup@test.com', 
      password: 'Test123!',
      name: 'Test Startup',
      role: UserRole.STARTUP
    }
  ];

  for (const userData of users) {
    try {
      const existing = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (existing) {
        console.log(`✅ ${userData.email} existe déjà`);
        continue;
      }

      const hashedPassword = await bcrypt.hash(userData.password, 10);
      
      await prisma.user.create({
        data: {
          email: userData.email,
          passwordHash: hashedPassword,
          name: userData.name,
          role: userData.role,
          phone_number: '+225 0000000000',  // snake_case
          kycStatus: KycStatus.PENDING,
          email_verified: true,
          isActive: true,
          two_factor_enabled: false
        }
      });

      console.log(`✅ ${userData.role} créé: ${userData.email} / ${userData.password}`);
    } catch (error) {
      console.error(`❌ Erreur création ${userData.email}:`, error);
    }
  }
}

async function main() {
  console.log('🚀 Création des utilisateurs...');
  await createAdmin();
  await createTestUsers();
  console.log('\n📋 Récapitulatif des comptes créés:');
  console.log('================================');
  console.log('👤 Admin:');
  console.log('   Email: admin@afristocks.com');
  console.log('   Mot de passe: Admin123!');
  console.log('\n👤 Investisseur:');
  console.log('   Email: investor@test.com');
  console.log('   Mot de passe: Test123!');
  console.log('\n👤 Startup:');
  console.log('   Email: startup@test.com');
  console.log('   Mot de passe: Test123!');
  console.log('================================\n');
  
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error('❌ Erreur:', e);
  process.exit(1);
});