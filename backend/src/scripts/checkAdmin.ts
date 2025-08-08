// backend/src/scripts/checkAdmin.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function checkAndCreateAdmin() {
    try {
        // Vérifier l'admin existant
        let admin = await prisma.user.findUnique({
            where: { email: 'admin@afristocks.com' }
        });

        if (admin) {
            console.log('✅ Admin existant trouvé:', {
                id: admin.id,
                email: admin.email,
                role: admin.role,
                isActive: admin.isActive
            });

            // S'assurer que le rôle est bien ADMIN
            if (admin.role !== 'ADMIN') {
                admin = await prisma.user.update({
                    where: { email: 'admin@afristocks.com' },
                    data: { role: 'ADMIN' }
                });
                console.log('✅ Rôle mis à jour en ADMIN');
            }
        } else {
            // Créer l'admin
            const hashedPassword = await bcrypt.hash('Admin123!', 10);

            admin = await prisma.user.create({
                data: {
                    email: 'admin@afristocks.com',
                    passwordHash: hashedPassword,
                    name: 'Admin AfriStocks',
                    phone_number: '+225 0123456789',
                    role: 'ADMIN',
                    kycStatus: 'VERIFIED',
                    email_verified: true,
                    isActive: true
                }
            });

            console.log('✅ Admin créé avec succès');
        }

        console.log('\n📋 Informations de connexion:');
        console.log('Email: admin@afristocks.com');
        console.log('Mot de passe: Admin123!');
        console.log('Rôle:', admin.role);

    } catch (error) {
        console.error('❌ Erreur:', error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAndCreateAdmin(); 