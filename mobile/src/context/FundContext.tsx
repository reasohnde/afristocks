// src/contexts/FundContext.tsx
import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface FundData {
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

interface Investment {
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

interface FundContextType {
  fundData: FundData;
  investments: Investment[];
  updateFundData: (data: Partial<FundData>) => Promise<void>;
  addInvestment: (investment: Omit<Investment, 'id' | 'date'>) => Promise<void>;
  getInvestments: () => Investment[];
  getTotalInvestors: () => number;
  refreshData: () => Promise<void>;
}

const defaultFundData: FundData = {
  name: 'AfriStocks Capital Fund',
  tagline: 'Investissez dès aujourd\'hui dans l\'avenir de l\'Afrique !',
  description: 'Premier fonds d\'investissement dédié aux startups africaines prometteuses. Diversifiez votre portfolio et participez à la croissance économique du continent.',
  targetAmount: 50000,
  raisedAmount: 15000,
  minInvestment: 100,
  expectedReturn: '15-25%',
  duration: '3-5 ans',
  email: 'invest@afristocks.com',
  whatsapp: '+225 0123456789',
  phone: '+225 0123456789',
  stripePublicKey: '',
  isActive: true,
};

const FundContext = createContext<FundContextType | undefined>(undefined);

export const FundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fundData, setFundData] = useState<FundData>(defaultFundData);
  const [investments, setInvestments] = useState<Investment[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Charger les données du fonds
      const savedFundData = await AsyncStorage.getItem('fundData');
      if (savedFundData) {
        setFundData(JSON.parse(savedFundData));
      }

      // Charger les investissements
      const savedInvestments = await AsyncStorage.getItem('investments');
      if (savedInvestments) {
        setInvestments(JSON.parse(savedInvestments));
      }
    } catch (error) {
      console.error('Error loading fund data:', error);
    }
  };

  const updateFundData = async (data: Partial<FundData>) => {
    try {
      const newFundData = { ...fundData, ...data };
      setFundData(newFundData);
      await AsyncStorage.setItem('fundData', JSON.stringify(newFundData));
    } catch (error) {
      console.error('Error updating fund data:', error);
      throw error;
    }
  };

  const addInvestment = async (investment: Omit<Investment, 'id' | 'date'>) => {
    try {
      const newInvestment: Investment = {
        ...investment,
        id: Date.now().toString(),
        date: new Date(),
      };
      const newInvestments = [...investments, newInvestment];
      setInvestments(newInvestments);
      await AsyncStorage.setItem('investments', JSON.stringify(newInvestments));

      // Mettre à jour le montant levé
      if (investment.status === 'completed') {
        const newRaisedAmount = fundData.raisedAmount + investment.amount;
        await updateFundData({ raisedAmount: newRaisedAmount });
      }
    } catch (error) {
      console.error('Error adding investment:', error);
      throw error;
    }
  };

  const getInvestments = () => investments;

  const getTotalInvestors = () => {
    const uniqueInvestors = new Set(investments
      .filter(inv => inv.status === 'completed')
      .map(inv => inv.userId));
    return uniqueInvestors.size;
  };

  const refreshData = async () => {
    await loadData();
  };

  return (
    <FundContext.Provider value={{
      fundData,
      investments,
      updateFundData,
      addInvestment,
      getInvestments,
      getTotalInvestors,
      refreshData,
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