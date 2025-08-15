// src/config/constants.ts
import { Platform } from 'react-native';

export const API_URL = process.env.API_URL || (
    Platform.OS === 'ios'
        ? 'http://localhost:3000'  // iOS simulator
        : 'http://10.0.2.2:3000'   // Android emulator
);

// Pour un appareil physique, utilisez votre IP locale :
// export const API_URL = 'http://192.168.1.XXX:3000';
export const APP_NAME = 'AfriStocks';
