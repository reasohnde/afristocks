const express = require('express');
const router = express.Router();
const Fund = require('../model/Fund');
const auth = require('../middleware/auth');

// GET /api/fund - Récupérer les informations du fonds
router.get('/', async (req, res) => {
    try {
        let fund = await Fund.findOne();

        if (!fund) {
            // Créer un fonds par défaut s'il n'existe pas
            fund = new Fund({
                name: 'Fonds AfriStocks',
                tagline: 'Investir dans l\'avenir de l\'Afrique',
                description: 'Le fonds AfriStocks permet aux investisseurs de participer au développement économique de l\'Afrique en investissant dans des startups innovantes.',
                targetAmount: 10000000, // 10M XOF
                raisedAmount: 0,
                minInvestment: 50000, // 50k XOF
                maxInvestment: 1000000, // 1M XOF
                expectedReturn: '15-25% par an',
                isActive: true,
                startDate: new Date(),
                endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 an
                riskLevel: 'Modéré',
                investmentType: 'Equity',
                sector: 'Diversifié',
                country: 'Côte d\'Ivoire',
                currency: 'XOF'
            });
            await fund.save();
        }

        res.json({
            success: true,
            data: fund
        });
    } catch (error) {
        console.error('Erreur lors de la récupération du fonds:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération du fonds'
        });
    }
});

// PUT /api/fund - Mettre à jour les informations du fonds (Admin seulement)
router.put('/', auth, async (req, res) => {
    try {
        // Vérifier que l'utilisateur est admin
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Accès refusé. Seuls les administrateurs peuvent modifier le fonds.'
            });
        }

        const updates = req.body;
        let fund = await Fund.findOne();

        if (!fund) {
            return res.status(404).json({
                success: false,
                message: 'Fonds non trouvé'
            });
        }

        // Mettre à jour les champs autorisés
        const allowedFields = [
            'name', 'tagline', 'description', 'targetAmount',
            'minInvestment', 'maxInvestment', 'expectedReturn',
            'isActive', 'riskLevel', 'investmentType', 'sector'
        ];

        allowedFields.forEach(field => {
            if (updates[field] !== undefined) {
                fund[field] = updates[field];
            }
        });

        await fund.save();

        res.json({
            success: true,
            data: fund,
            message: 'Fonds mis à jour avec succès'
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du fonds:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la mise à jour du fonds'
        });
    }
});

// POST /api/fund/investments - Ajouter un investissement au fonds
router.post('/investments', auth, async (req, res) => {
    try {
        const { amount, investmentType = 'equity' } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Montant invalide'
            });
        }

        let fund = await Fund.findOne();
        if (!fund) {
            return res.status(404).json({
                success: false,
                message: 'Fonds non trouvé'
            });
        }

        // Vérifier les limites d'investissement
        if (amount < fund.minInvestment) {
            return res.status(400).json({
                success: false,
                message: `Le montant minimum d'investissement est de ${fund.minInvestment.toLocaleString()} XOF`
            });
        }

        if (amount > fund.maxInvestment) {
            return res.status(400).json({
                success: false,
                message: `Le montant maximum d'investissement est de ${fund.maxInvestment.toLocaleString()} XOF`
            });
        }

        // Créer l'investissement
        const investment = {
            userId: req.user.id,
            userName: req.user.name,
            userEmail: req.user.email,
            amount: amount,
            type: investmentType,
            date: new Date(),
            status: 'pending'
        };

        // Ajouter l'investissement au fonds
        if (!fund.investments) {
            fund.investments = [];
        }
        fund.investments.push(investment);

        // Mettre à jour le montant levé
        fund.raisedAmount += amount;

        await fund.save();

        res.json({
            success: true,
            data: {
                investment,
                fund: {
                    raisedAmount: fund.raisedAmount,
                    targetAmount: fund.targetAmount,
                    progress: (fund.raisedAmount / fund.targetAmount) * 100
                }
            },
            message: 'Investissement ajouté avec succès'
        });
    } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'investissement:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de l\'ajout de l\'investissement'
        });
    }
});

// GET /api/fund/investments - Récupérer les investissements du fonds
router.get('/investments', auth, async (req, res) => {
    try {
        let fund = await Fund.findOne();

        if (!fund) {
            return res.status(404).json({
                success: false,
                message: 'Fonds non trouvé'
            });
        }

        const investments = fund.investments || [];

        res.json({
            success: true,
            data: investments
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des investissements:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des investissements'
        });
    }
});

// GET /api/fund/stats - Récupérer les statistiques du fonds
router.get('/stats', async (req, res) => {
    try {
        let fund = await Fund.findOne();

        if (!fund) {
            return res.status(404).json({
                success: false,
                message: 'Fonds non trouvé'
            });
        }

        const investments = fund.investments || [];
        const totalInvestors = new Set(investments.map(inv => inv.userId)).size;
        const totalInvestments = investments.length;
        const progress = (fund.raisedAmount / fund.targetAmount) * 100;

        const stats = {
            totalRaised: fund.raisedAmount,
            targetAmount: fund.targetAmount,
            progress: progress,
            totalInvestors: totalInvestors,
            totalInvestments: totalInvestments,
            averageInvestment: totalInvestments > 0 ? fund.raisedAmount / totalInvestments : 0,
            isActive: fund.isActive,
            daysRemaining: Math.ceil((new Date(fund.endDate) - new Date()) / (1000 * 60 * 60 * 24))
        };

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des statistiques:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la récupération des statistiques'
        });
    }
});

// PUT /api/fund/toggle-status - Activer/Désactiver le fonds (Admin seulement)
router.put('/toggle-status', auth, async (req, res) => {
    try {
        // Vérifier que l'utilisateur est admin
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({
                success: false,
                message: 'Accès refusé. Seuls les administrateurs peuvent modifier le statut du fonds.'
            });
        }

        let fund = await Fund.findOne();

        if (!fund) {
            return res.status(404).json({
                success: false,
                message: 'Fonds non trouvé'
            });
        }

        fund.isActive = !fund.isActive;
        await fund.save();

        res.json({
            success: true,
            data: {
                isActive: fund.isActive
            },
            message: `Fonds ${fund.isActive ? 'activé' : 'désactivé'} avec succès`
        });
    } catch (error) {
        console.error('Erreur lors de la modification du statut:', error);
        res.status(500).json({
            success: false,
            message: 'Erreur lors de la modification du statut'
        });
    }
});

module.exports = router; 