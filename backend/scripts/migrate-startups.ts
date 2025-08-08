// backend/scripts/migrate-startups.ts
// Script pour créer les entités Startup pour les utilisateurs existants

import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import path from 'path';

// Charger les variables d'environnement
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const prisma = new PrismaClient();

async function migrateStartups() {
  console.log('🚀 Début de la migration des startups...');
  
  try {
    // Récupérer tous les utilisateurs avec le rôle STARTUP sans entité startup
    const startupUsers = await prisma.user.findMany({
      where: {
        role: 'STARTUP',
        startup: null // Pas d'entité startup associée
      }
    });

    console.log(`📊 ${startupUsers.length} utilisateurs STARTUP trouvés sans entité startup`);

    if (startupUsers.length === 0) {
      console.log('✅ Aucune migration nécessaire');
      return;
    }

    let successCount = 0;
    let errorCount = 0;

    // Créer une entité startup pour chaque utilisateur
    for (const user of startupUsers) {
      try {
        console.log(`\n🔄 Traitement de ${user.name} (${user.email})...`);
        
        const startup = await prisma.startup.create({
          data: {
            userId: user.id,
            registrationNumber: `REG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            companyName: user.name, // Utiliser le nom de l'utilisateur par défaut
            legalName: user.name,
            description: 'Description à compléter',
            sector: 'tech', // Valeur par défaut
            country: 'Côte d\'Ivoire',
            city: 'Abidjan',
            teamSize: 1,
            valuation: 0,
            totalShares: 0,
            availableShares: 0,
            sharePrice: 0,
            minInvestment: 0,
            raisedAmount: 0,
            targetAmount: 0,
            verified: false,
            isActive: true
          }
        });
        
        console.log(`✅ Startup créée avec l'ID: ${startup.id}`);
        successCount++;
        
        // Créer aussi un profil utilisateur si il n'existe pas
        const existingProfile = await prisma.userProfile.findUnique({
          where: { userId: user.id }
        });
        
        if (!existingProfile) {
          await prisma.userProfile.create({
            data: {
              userId: user.id,
              firstName: user.name.split(' ')[0] || '',
              lastName: user.name.split(' ').slice(1).join(' ') || '',
              country: 'Côte d\'Ivoire',
              city: 'Abidjan'
            }
          });
          console.log(`✅ Profil utilisateur créé`);
        }
        
      } catch (error: any) {
        console.error(`❌ Erreur pour ${user.email}:`, error.message);
        errorCount++;
      }
    }

    console.log('\n📈 Résumé de la migration:');
    console.log(`✅ Succès: ${successCount}`);
    console.log(`❌ Échecs: ${errorCount}`);
    console.log(`📊 Total: ${startupUsers.length}`);

  } catch (error) {
    console.error('❌ Erreur globale de migration:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
    console.log('\n✅ Migration terminée');
  }
}

// Fonction pour vérifier l'état actuel
async function checkCurrentState() {
  console.log('\n📊 État actuel de la base de données:');
  
  const totalUsers = await prisma.user.count();
  const startupUsers = await prisma.user.count({
    where: { role: 'STARTUP' }
  });
  const startupEntities = await prisma.startup.count();
  
  console.log(`Total utilisateurs: ${totalUsers}`);
  console.log(`Utilisateurs STARTUP: ${startupUsers}`);
  console.log(`Entités Startup: ${startupEntities}`);
  console.log(`Différence: ${startupUsers - startupEntities}`);
}

// Fonction principale
async function main() {
  console.log('='.repeat(50));
  console.log('Migration des entités Startup');
  console.log('='.repeat(50));
  
  // Vérifier l'état actuel
  await checkCurrentState();
  
  // Demander confirmation
  console.log('\n⚠️  Cette opération va créer des entités Startup pour tous les utilisateurs STARTUP qui n\'en ont pas.');
  console.log('Voulez-vous continuer ? (yes/no)');
  
  // Si exécuté avec --force, ne pas demander confirmation
  if (process.argv.includes('--force')) {
    console.log('Mode --force activé, exécution automatique...');
    await migrateStartups();
  } else {
    // Attendre l'input utilisateur
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });
    
    readline.question('', async (answer: string) => {
      if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
        await migrateStartups();
      } else {
        console.log('Migration annulée');
      }
      readline.close();
      process.exit(0);
    });
  }
}

// Exécuter si appelé directement
if (require.main === module) {
  main().catch(console.error);
}

export { migrateStartups, checkCurrentState };