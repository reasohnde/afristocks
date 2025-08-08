const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  try {
    // Vérifier si des utilisateurs existent
    const userCount = await prisma.user.count();
    console.log(`📊 Nombre d'utilisateurs existants: ${userCount}`);
    
    // Vérifier si admin existe
    const adminExists = await prisma.user.findFirst({
      where: { 
        OR: [
          { email: 'admin@afristocks.com' },
          { role: 'ADMIN' }
        ]
      }
    });

    if (adminExists) {
      console.log('ℹ️ Un administrateur existe déjà:');
      console.log(`Email: ${adminExists.email}`);
      console.log(`Nom: ${adminExists.name}`);
      console.log(`Rôle: ${adminExists.role}`);
      return;
    }

    // Créer l'admin
    console.log('🔄 Création du compte admin...');
    const hashedPassword = await bcrypt.hash('Admin123!', 10);
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@afristocks.com',
        passwordHash: hashedPassword,
        name: 'Administrateur Principal',
        role: 'ADMIN',
        kycStatus: 'VERIFIED',
        email_verified: true,
        isActive: true
      }
    });

    console.log('✅ Admin créé avec succès!');
    console.log('📧 Email: admin@afristocks.com');
    console.log('🔑 Mot de passe: Admin123!');
    console.log('');
    console.log('🔐 IMPORTANT: Changez ce mot de passe après la première connexion!');
    
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    // Afficher plus de détails si l'erreur est liée à un champ manquant
    if (error.code === 'P2002') {
      console.log('Un utilisateur avec cet email existe déjà');
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();