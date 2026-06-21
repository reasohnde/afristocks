// src/services/fundService.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';

export interface FundData {
    id?: string;
    name: string;
    tagline: string;
    description: string;
    targetAmount: number;
    raisedAmount: number;
    minInvestment: number;
    expectedReturn: string;
    duration: string;
    investors: number;
    isActive: boolean;
    email: string;
    whatsapp: string;
    phone: string;
    stripePublicKey?: string;
    features: Array<{
        icon: string;
        title: string;
        description: string;
    }>;
    sectors: Array<{
        name: string;
        percentage: number;
    }>;
}

export interface Investment {
    id: string;
    userId: string;
    userName: string;
    userEmail: string;
    userPhone?: string;
    amount: number;
    date: string;
    status: 'pending' | 'completed' | 'failed' | 'rejected';
    paymentMethod: string;
    transactionId?: string;
    verificationStatus?: 'pending' | 'verified' | 'rejected';
    country?: string;
    documents?: any[];
}

export interface FundStats {
    totalRaised: number;
    totalInvestors: number;
    pendingAmount: number;
    averageInvestment: number;
    conversionRate: number;
    monthlyGrowth: number;
    weeklyGrowth: number;
    recentActivities: any[];
}

class FundService {
    private getAuthHeaders() {
        const token = localStorage.getItem('token');
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    // Récupérer les données du fonds
    async getFundData(): Promise<FundData> {
        try {
            const response = await fetch(`${API_URL}/api/fund`, {
                headers: this.getAuthHeaders()
            });

            if (!response.ok) throw new Error('Erreur lors de la récupération des données');

            const data = await response.json();
            return data.success ? data.data : this.getDefaultFundData();
        } catch (error) {
            console.error('Erreur getFundData:', error);
            return this.getDefaultFundData();
        }
    }

    // Mettre à jour les données du fonds (Admin)
    async updateFundData(updates: Partial<FundData>): Promise<FundData> {
        try {
            const response = await fetch(`${API_URL}/api/admin/fund`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(updates)
            });

            if (!response.ok) throw new Error('Erreur lors de la mise à jour');

            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Erreur updateFundData:', error);
            throw error;
        }
    }

    // Créer un investissement
    async createInvestment(investmentData: {
        amount: number;
        paymentMethod: string;
        paymentDetails?: any;
    }): Promise<Investment> {
        try {
            const response = await fetch(`${API_URL}/api/investments`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(investmentData)
            });

            if (!response.ok) throw new Error('Erreur lors de la création de l\'investissement');

            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Erreur createInvestment:', error);
            throw error;
        }
    }

    // Récupérer tous les investissements (Admin)
    async getInvestments(filters?: {
        status?: string;
        startDate?: string;
        endDate?: string;
        search?: string;
    }): Promise<Investment[]> {
        try {
            const params = new URLSearchParams();
            if (filters) {
                Object.entries(filters).forEach(([key, value]) => {
                    if (value) params.append(key, value);
                });
            }

            const response = await fetch(`${API_URL}/api/admin/investments?${params}`, {
                headers: this.getAuthHeaders()
            });

            if (!response.ok) throw new Error('Erreur lors de la récupération des investissements');

            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Erreur getInvestments:', error);
            return [];
        }
    }

    // Mettre à jour le statut d'un investissement (Admin)
    async updateInvestmentStatus(investmentId: string, status: string, reason?: string): Promise<Investment> {
        try {
            const response = await fetch(`${API_URL}/api/admin/investments/${investmentId}/status`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({ status, reason })
            });

            if (!response.ok) throw new Error('Erreur lors de la mise à jour du statut');

            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Erreur updateInvestmentStatus:', error);
            throw error;
        }
    }

    // Récupérer les statistiques du fonds (Admin)
    async getFundStats(): Promise<FundStats> {
        try {
            const response = await fetch(`${API_URL}/api/admin/fund/stats`, {
                headers: this.getAuthHeaders()
            });

            if (!response.ok) throw new Error('Erreur lors de la récupération des statistiques');

            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Erreur getFundStats:', error);
            return {
                totalRaised: 0,
                totalInvestors: 0,
                pendingAmount: 0,
                averageInvestment: 0,
                conversionRate: 0,
                monthlyGrowth: 0,
                weeklyGrowth: 0,
                recentActivities: []
            };
        }
    }

    // Exporter les données (Admin)
    async exportInvestments(format: 'csv' | 'excel' = 'csv'): Promise<Blob> {
        try {
            const response = await fetch(`${API_URL}/api/admin/investments/export?format=${format}`, {
                headers: this.getAuthHeaders()
            });

            if (!response.ok) throw new Error('Erreur lors de l\'export');

            return await response.blob();
        } catch (error) {
            console.error('Erreur exportInvestments:', error);
            throw error;
        }
    }

    // Envoyer un email groupé (Admin)
    async sendBulkEmail(data: {
        investorIds: string[];
        subject: string;
        message: string;
    }): Promise<any> {
        try {
            const response = await fetch(`${API_URL}/api/admin/communications/email`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify(data)
            });

            if (!response.ok) throw new Error('Erreur lors de l\'envoi des emails');

            const result = await response.json();
            return result;
        } catch (error) {
            console.error('Erreur sendBulkEmail:', error);
            throw error;
        }
    }

    // Récupérer mes investissements (Utilisateur)
    async getMyInvestments(): Promise<Investment[]> {
        try {
            const response = await fetch(`${API_URL}/api/investments/my`, {
                headers: this.getAuthHeaders()
            });

            if (!response.ok) throw new Error('Erreur lors de la récupération de vos investissements');

            const data = await response.json();
            return data.data || [];
        } catch (error) {
            console.error('Erreur getMyInvestments:', error);
            return [];
        }
    }

    // Vérifier le statut de paiement
    async checkPaymentStatus(transactionId: string): Promise<any> {
        try {
            const response = await fetch(`${API_URL}/api/payments/status/${transactionId}`, {
                headers: this.getAuthHeaders()
            });

            if (!response.ok) throw new Error('Erreur lors de la vérification du paiement');

            const data = await response.json();
            return data.data;
        } catch (error) {
            console.error('Erreur checkPaymentStatus:', error);
            throw error;
        }
    }

    // Données par défaut
    getDefaultFundData(): FundData {
        return {
            name: "Fonds de Croissance AfriStocks",
            tagline: "Investir dans l'innovation africaine",
            description: "Un fonds diversifié investissant dans les startups technologiques les plus prometteuses d'Afrique. Notre équipe d'experts sélectionne rigoureusement les meilleures opportunités pour maximiser vos rendements.",
            targetAmount: 50000,
            raisedAmount: 15000,
            minInvestment: 50,
            expectedReturn: "15-25%",
            duration: "3-5 ans",
            investors: 124,
            isActive: true,
            email: "invest@afristocks.com",
            whatsapp: "+225 0123456789",
            phone: "+225 0123456789",
            features: [
                {
                    icon: "Shield",
                    title: "Sécurisé",
                    description: "Vos investissements sont protégés"
                },
                {
                    icon: "Award",
                    title: "Rendement élevé",
                    description: "15-25% de retour annuel estimé"
                },
                {
                    icon: "Users",
                    title: "Diversifié",
                    description: "Portfolio de 20+ startups"
                },
                {
                    icon: "Clock",
                    title: "Flexible",
                    description: "Sortie possible après 3 ans"
                }
            ],
            sectors: [
                { name: "FinTech", percentage: 35 },
                { name: "HealthTech", percentage: 25 },
                { name: "AgriTech", percentage: 20 },
                { name: "EdTech", percentage: 15 },
                { name: "Autres", percentage: 5 }
            ]
        };
    }
}

export const fundService = new FundService(); 