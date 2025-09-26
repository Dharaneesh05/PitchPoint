import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import * as sqliteSchema from '@shared/schema-sqlite';
import path from 'path';

// Use SQLite for local development
const isDevelopment = process.env.NODE_ENV === 'development';

let db: any;

if (isDevelopment) {
  // SQLite for development
  const dbPath = path.join(process.cwd(), 'cricket.db');
  const sqlite = new Database(dbPath);
  db = drizzle(sqlite, { schema: sqliteSchema });
  console.log('Using SQLite database at:', dbPath);
} else {
  // Neon for production (when properly configured)
  const { Pool, neonConfig } = require('@neondatabase/serverless');
  const ws = require("ws");
  
  neonConfig.webSocketConstructor = ws;
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is required for production');
  }
  
  const pool = new Pool({ connectionString: databaseUrl });
  const pgSchema = require('@shared/schema');
  db = drizzle({ client: pool, schema: pgSchema });
  console.log('Using Neon database');
}

export { db };
