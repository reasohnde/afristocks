declare module '../../contexts/FundContext' {
    export interface FundData {
        name: string;
        tagline: string;
        description: string;
        targetAmount: number;
        raisedAmount: number;
        minInvestment: number;
        expectedReturn: string;
        duration: string;
        email: string;
        whatsapp: string;
        phone: string;
        stripePublicKey: string;
        isActive: boolean;
    }

    export interface Investment {
        id: string;
        userId: string;
        userName: string;
        userEmail: string;
        amount: number;
        date: Date;
        status: 'pending' | 'completed' | 'failed';
        paymentMethod: string;
        stripePaymentId?: string;
    }

    export interface FundContextType {
        fundData: FundData;
        investments: Investment[];
        isLoading: boolean;
        error: string | null;
        updateFundData: (data: Partial<FundData>) => Promise<void>;
        addInvestment: (investment: Omit<Investment, 'id' | 'date'>) => Promise<void>;
        getInvestments: () => Investment[];
        getTotalInvestors: () => number;
        refreshData: () => Promise<void>;
    }

    export const useFund: () => FundContextType;
    export const FundProvider: React.FC<{ children: React.ReactNode }>;
} 