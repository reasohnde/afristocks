import '@testing-library/jest-native/extend-expect';

// Mock AsyncStorage seulement si vous l'utilisez
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock react-native-vector-icons si vous l'utilisez
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

// Configuration globale pour les tests
global.fetch = jest.fn();

// Mock du module Animated de React Native de manière plus simple
jest.mock('react-native/Libraries/Animated/AnimatedImplementation', () => {
  return {
    ...jest.requireActual('react-native/Libraries/Animated/AnimatedImplementation'),
    timing: () => ({
      start: () => jest.fn(),
    }),
    sequence: () => ({
      start: () => jest.fn(),
    }),
    parallel: () => ({
      start: () => jest.fn(),
    }),
  };
});

// Mock console warnings in tests
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      (args[0].includes('Animated') ||
        args[0].includes('useNativeDriver'))
    ) {
      return;
    }
    originalWarn(...args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
});
