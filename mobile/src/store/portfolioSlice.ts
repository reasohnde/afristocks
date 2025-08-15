// src/store/portfolioSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Investment {
  id: string;
  startupId: string;
  startupName: string;
  shares: number;
  investedAmount: number;
  currentValue: number;
  purchaseDate: string;
}

interface PortfolioState {
  investments: Investment[];
  totalValue: number;
  totalInvested: number;
  loading: boolean;
}

const initialState: PortfolioState = {
  investments: [],
  totalValue: 0,
  totalInvested: 0,
  loading: false,
};

const portfolioSlice = createSlice({
  name: 'portfolio',
  initialState,
  reducers: {
    setInvestments: (state, action: PayloadAction<Investment[]>) => {
      state.investments = action.payload;
      state.totalInvested = action.payload.reduce((sum, inv) => sum + inv.investedAmount, 0);
      state.totalValue = action.payload.reduce((sum, inv) => sum + inv.currentValue, 0);
    },
    addInvestment: (state, action: PayloadAction<Investment>) => {
      state.investments.push(action.payload);
      state.totalInvested += action.payload.investedAmount;
      state.totalValue += action.payload.currentValue;
    },
    updateInvestmentValue: (state, action: PayloadAction<{ id: string; currentValue: number }>) => {
      const investment = state.investments.find(inv => inv.id === action.payload.id);
      if (investment) {
        const oldValue = investment.currentValue;
        investment.currentValue = action.payload.currentValue;
        state.totalValue = state.totalValue - oldValue + action.payload.currentValue;
      }
    },
  },
});

export const { setInvestments, addInvestment, updateInvestmentValue } = portfolioSlice.actions;
export default portfolioSlice.reducer;