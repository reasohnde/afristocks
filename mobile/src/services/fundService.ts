// mobile/src/services/fundService.ts
import { API_URL } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const fundService = {
  // Récupérer les infos du fonds
  async getFundData() {
    try {
      const response = await fetch(`${API_URL}/api/fund`);
      const data = await response.json();
      if (data.success) {
        return data.data;
      }
      throw new Error(data.message);
    } catch (error) {
      console.error('Erreur getFundData:', error);
      throw error;
    }
  },

  // Ajouter un investissement
  async addInvestment(investmentData: {
    amount: number;
    userName: string;
    userEmail: string;
    paymentMethod: string;
  }) {
    try {
      const token = await AsyncStorage.getItem('token');
      
      const response = await fetch(`${API_URL}/api/fund/invest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify({
          ...investmentData,
          status: 'completed'
        })
      });

      const data = await response.json();
      if (data.success) {
        return data.data;
      }
      throw new Error(data.message);
    } catch (error) {
      console.error('Erreur addInvestment:', error);
      throw error;
    }
  },

  // Récupérer les investissements
  async getInvestments() {
    try {
      const response = await fetch(`${API_URL}/api/fund/investments`);
      const data = await response.json();
      if (data.success) {
        return data.data;
      }
      throw new Error(data.message);
    } catch (error) {
      console.error('Erreur getInvestments:', error);
      throw error;
    }
  }
};