import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    // Test environment
    environment: 'jsdom',

    // Setup files
    setupFiles: ['./src/test/setup.js'],

    // Global test utilities
    globals: true,

    // Include/exclude patterns
    include: ['src/**/*.{test,spec}.{js,jsx}'],
    exclude: ['node_modules', 'dist', '.git', '.cache'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json', 'lcov'],
      include: [
        'src/utils/**/*.js',
        'src/services/**/*.js',
        'src/context/**/*.jsx',
        'src/components/**/*.jsx',
      ],
      exclude: [
        'src/**/*.test.{js,jsx}',
        'src/**/*.spec.{js,jsx}',
        'src/test/**',
        'src/constants/**',
        'src/main.jsx',
        'src/App.jsx',
      ],
      all: true,
      lines: 80,
      functions: 80,
      branches: 75,
      statements: 80,
    },

    // Performance
    pool: 'forks',
    poolOptions: {
      forks: {
        singleFork: false,
      },
    },

    // Reporter configuration
    reporters: ['verbose'],

    // Timeout settings
    testTimeout: 10000,
    hookTimeout: 10000,
  },

  // Resolve aliases
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@services': path.resolve(__dirname, './src/services'),
      '@components': path.resolve(__dirname, './src/components'),
    },
  },
});
