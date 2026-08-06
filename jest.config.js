module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  roots: ['<rootDir>/src'],
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '^PortalStrings$': '<rootDir>/src/loc/testStrings.ts'
  },
  collectCoverageFrom: [
    'src/services/**/*.ts',
    'src/components/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/index.ts'
  ]
};