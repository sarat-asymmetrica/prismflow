// Jest E2E Setup for PrismFlow Browser
const puppeteer = require('puppeteer');

// Increase timeout for slower systems
jest.setTimeout(30000);

// Global setup
beforeAll(async () => {
  console.log('🚀 Starting PrismFlow Browser E2E Tests...');
  console.log('📊 Natural Asymmetry: 30% Emergence | 20% Precision | 50% Support');
});

afterAll(async () => {
  console.log('✅ E2E Tests Complete!');
});