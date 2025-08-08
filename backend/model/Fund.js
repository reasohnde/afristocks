// backend/model/Fund.js
const mongoose = require('mongoose');

const investmentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['equity', 'debt', 'convertible'], default: 'equity' },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ['pending', 'completed', 'cancelled'], default: 'pending' },
    transactionId: String,
    notes: String
});

const fundSchema = new mongoose.Schema({
    name: { type: String, required: true },
    tagline: { type: String, required: true },
    description: { type: String, required: true },
    targetAmount: { type: Number, required: true },
    raisedAmount: { type: Number, default: 0 },
    minInvestment: { type: Number, required: true },
    maxInvestment: { type: Number, required: true },
    expectedReturn: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    startDate: { type: Date, default: Date.now },
    endDate: { type: Date, required: true },
    riskLevel: { type: String, enum: ['Faible', 'Modéré', 'Élevé'], default: 'Modéré' },
    investmentType: { type: String, enum: ['Equity', 'Debt', 'Convertible', 'Hybrid'], default: 'Equity' },
    sector: { type: String, required: true },
    country: { type: String, required: true },
    currency: { type: String, default: 'XOF' },
    investments: [investmentSchema],
    documents: {
        prospectus: String,
        financialStatements: String,
        legalDocuments: String,
        other: [String]
    },
    terms: {
        managementFee: { type: Number, default: 2.0 }, // 2%
        performanceFee: { type: Number, default: 20.0 }, // 20%
        lockupPeriod: { type: Number, default: 12 }, // 12 mois
        distributionFrequency: { type: String, enum: ['Quarterly', 'Semi-annually', 'Annually'], default: 'Quarterly' }
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

// Middleware pour mettre à jour updatedAt
fundSchema.pre('save', function (next) {
    this.updatedAt = new Date();
    next();
});

// Méthode pour calculer le pourcentage de progression
fundSchema.methods.getProgress = function () {
    return (this.raisedAmount / this.targetAmount) * 100;
};

// Méthode pour obtenir le nombre total d'investisseurs
fundSchema.methods.getTotalInvestors = function () {
    const uniqueInvestors = new Set(this.investments.map(inv => inv.userId.toString()));
    return uniqueInvestors.size;
};

// Méthode pour obtenir l'investissement moyen
fundSchema.methods.getAverageInvestment = function () {
    if (this.investments.length === 0) return 0;
    return this.raisedAmount / this.investments.length;
};

// Méthode pour vérifier si le fonds est ouvert aux investissements
fundSchema.methods.isOpenForInvestment = function () {
    const now = new Date();
    return this.isActive && now >= this.startDate && now <= this.endDate;
};

// Méthode pour obtenir les jours restants
fundSchema.methods.getDaysRemaining = function () {
    const now = new Date();
    const timeDiff = this.endDate.getTime() - now.getTime();
    return Math.ceil(timeDiff / (1000 * 3600 * 24));
};

module.exports = mongoose.model('Fund', fundSchema); 