// src/store/startupsSlice.ts
import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Startup {
  id: string;
  name: string;
  sector: string;
  country: string;
  description: string;
  valuation: number;
  sharePrice: number;
  availableShares: number;
  growth: number;
  rating: number;
}

interface StartupsState {
  startups: Startup[];
  selectedStartup: Startup | null;
  loading: boolean;
  filter: {
    sector: string | null;
    country: string | null;
    search: string;
  };
}

const initialState: StartupsState = {
  startups: [],
  selectedStartup: null,
  loading: false,
  filter: {
    sector: null,
    country: null,
    search: '',
  },
};

const startupsSlice = createSlice({
  name: 'startups',
  initialState,
  reducers: {
    setStartups: (state, action: PayloadAction<Startup[]>) => {
      state.startups = action.payload;
    },
    setSelectedStartup: (state, action: PayloadAction<Startup | null>) => {
      state.selectedStartup = action.payload;
    },
    setFilter: (state, action: PayloadAction<Partial<StartupsState['filter']>>) => {
      state.filter = { ...state.filter, ...action.payload };
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setStartups, setSelectedStartup, setFilter, setLoading } = startupsSlice.actions;
export default startupsSlice.reducer;