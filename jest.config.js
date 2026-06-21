/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/tests'],
  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        // Le code source utilise NodeNext (résolu en CommonJS car pas de "type":"module").
        // On force CommonJS côté tests pour une exécution fiable et rapide.
        tsconfig: {
          module: 'CommonJS',
          moduleResolution: 'Node',
          esModuleInterop: true,
          skipLibCheck: true,
          target: 'ES2020',
          strict: true,
        },
      },
    ],
  },
  moduleFileExtensions: ['ts', 'js', 'json'],
  clearMocks: true,
  watchman: false,
};
