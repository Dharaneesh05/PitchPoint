#!/usr/bin/env tsx
import { seedDatabase } from './seed';

seedDatabase()
  .then(() => {
    console.log('[SEED] Seeding process completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('[SEED] Seeding process failed:', error);
    process.exit(1);
  });