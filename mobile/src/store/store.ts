// src/store/store.ts
import { configureStore } from '@reduxjs/toolkit';
import authReducer from './authSlice';
import portfolioReducer from './portfolioSlice';
import startupsReducer from './startupsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    portfolio: portfolioReducer,
    startups: startupsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;