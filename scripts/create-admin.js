const bcrypt = require('bcrypt');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Vérifier si l'admin existe déjà
    const existingAdmin = await prisma.user.findUnique({
      where: { email: 'admin@afristocks.com' }
    });

    if (existingAdmin) {
      console.log('❌ Un administrateur avec cet email existe déjà');
      return;
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash('Admin123!', 10);

    // Créer l'administrateur
    const admin = await prisma.user.create({
      data: {
        email: 'admin@afristocks.com',
        passwordHash: hashedPassword,
        name: 'Administrateur Principal',
        phone_number: '+225 0123456789',
        role: 'ADMIN',
        kycStatus: 'VERIFIED',
        email_verified: true,
        isActive: true,
        profile: {
          create: {
            firstName: 'Admin',
            lastName: 'Principal',
            country: 'Côte d\'Ivoire',
            city: 'Abidjan'
          }
        }
      }
    });

    console.log('✅ Administrateur créé avec succès!');
    console.log('📧 Email: admin@afristocks.com');
    console.log('🔑 Mot de passe: Admin123!');
    console.log('🆔 ID:', admin.id);

  } catch (error) {
    console.error('❌ Erreur lors de la création:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin();