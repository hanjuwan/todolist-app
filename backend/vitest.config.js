'use strict';

const { defineConfig } = require('vitest/config');

module.exports = defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/__tests__/**/*.test.js', 'src/**/*.test.js'],
    globals: true,
  },
});
