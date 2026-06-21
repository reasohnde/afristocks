// frontend/src/contexts/FundContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5002';

interface FundData {
  id: string;
  name: string;
  tagline: string;
  description: string;
  targetAmount: number;
  raisedAmount: number;
  minInvestment: number;
  maxInvestment?: number;
  expectedReturn: string;
  duration: string;
  isActive: boolean;
  email: string;
  phone: string;
  whatsapp: string;
}

interface Investment {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  paymentMethod: string;
  date: string;
}

interface FundContextType {
  fundData: FundData;
  investments: Investment[];
  loading: boolean;
  updateFundData: (data: Partial<FundData>) => Promise<void>;
  addInvestment: (investment: Omit<Investment, 'id' | 'date'>) => Promise<void>;
  getTotalInvestors: () => number;
  refreshFundData: () => Promise<void>;
}

const FundContext = createContext<FundContextType | undefined>(undefined);

export const FundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fundData, setFundData] = useState<FundData>({
    id: '1',
    name: 'AfriStocks Capital Fund',
    tagline: 'Investir dans l\'innovation africaine',
    description: 'Un fonds diversifié investissant dans les startups technologiques les plus prometteuses d\'Afrique.',
    targetAmount: 50000,
    raisedAmount: 15000,
    minInvestment: 50,
    maxInvestment: 10000,
    expectedReturn: '15-25%',
    duration: '3-5 ans',
    isActive: true,
    email: 'invest@afristocks.com',
    phone: '+225 01 23 45 67 89',
    whatsapp: '+225 01 23 45 67 89'
  });

  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);

  // Charger les données du fonds depuis l'API
  const refreshFundData = async () => {
    try {
      const response = await fetch(`${API_URL}/api/fund`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setFundData(data.data);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données du fonds:', error);
    }
  };

  // Charger les investissements
  const loadInvestments = async () => {
    try {
      const response = await fetch(`${API_URL}/api/fund/investments`);
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.data) {
          setInvestments(data.data);
        }
      }
    } catch (error) {
      console.error('Erreur lors du chargement des investissements:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([refreshFundData(), loadInvestments()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const updateFundData = async (data: Partial<FundData>) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/fund`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setFundData(prev => ({ ...prev, ...data }));
          return;
        }
      }
      throw new Error('Erreur lors de la mise à jour');
    } catch (error) {
      console.error('Erreur de mise à jour:', error);
      throw error;
    }
  };

  const addInvestment = async (investment: Omit<Investment, 'id' | 'date'>) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_URL}/api/fund/invest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(investment)
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          await loadInvestments();
          await refreshFundData();
          return;
        }
      }
      throw new Error('Erreur lors de l\'investissement');
    } catch (error) {
      console.error('Erreur d\'investissement:', error);
      throw error;
    }
  };

  const getTotalInvestors = () => {
    const uniqueInvestors = new Set(investments.filter(inv => inv.status === 'completed').map(inv => inv.userId));
    return uniqueInvestors.size;
  };

  return (
    <FundContext.Provider value={{
      fundData,
      investments,
      loading,
      updateFundData,
      addInvestment,
      getTotalInvestors,
      refreshFundData
    }}>
      {children}
    </FundContext.Provider>
  );
};

export const useFund = () => {
  const context = useContext(FundContext);
  if (!context) {
    throw new Error('useFund must be used within a FundProvider');
  }
  return context;
};