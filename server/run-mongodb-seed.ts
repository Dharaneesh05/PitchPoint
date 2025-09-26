import 'dotenv/config';
import { seedMongoDB } from './mongodb-seed';
import { dbConnection } from './mongodb';

async function runMongoDB() {
  try {
    console.log('🚀 Starting MongoDB seeding process...');
    await seedMongoDB();
    console.log('[MONGODB] MongoDB seeding process completed successfully');
    await dbConnection.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('💥 MongoDB seeding process failed:', error);
    await dbConnection.disconnect();
    process.exit(1);
  }
}

runMongoDB();