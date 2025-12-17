const Database = require('better-sqlite3');
const { drizzle } = require('drizzle-orm/better-sqlite3');
const path = require('path');
const fs = require('fs');

// Remove existing database if it exists
const dbPath = path.join(process.cwd(), 'cricket.db');
if (fs.existsSync(dbPath)) {
  try {
    fs.unlinkSync(dbPath);
    console.log('Removed existing database file');
  } catch (error) {
    console.log('Could not remove existing database file:', error.message);
  }
}

// Create new database
const sqlite = new Database(dbPath);

// Create tables directly with proper SQLite syntax
const createTables = `
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
  username TEXT NOT NULL UNIQUE,
  email TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'fan',
  profile_image TEXT,
  email_verified INTEGER DEFAULT 0,
  email_verification_token TEXT,
  email_verification_expires INTEGER,
  password_reset_token TEXT,
  password_reset_expires INTEGER,
  last_login_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS teams (
  id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
  name TEXT NOT NULL UNIQUE,
  short_name TEXT NOT NULL UNIQUE,
  country TEXT NOT NULL,
  logo TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS players (
  id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
  name TEXT NOT NULL,
  team_id TEXT REFERENCES teams(id),
  role TEXT NOT NULL,
  batting_style TEXT,
  bowling_style TEXT,
  image TEXT,
  date_of_birth INTEGER,
  nationality TEXT,
  is_injured INTEGER DEFAULT 0,
  form TEXT DEFAULT 'average',
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS venues (
  id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  country TEXT NOT NULL,
  capacity INTEGER,
  pitch_type TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS matches (
  id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
  team1_id TEXT NOT NULL REFERENCES teams(id),
  team2_id TEXT NOT NULL REFERENCES teams(id),
  venue_id TEXT REFERENCES venues(id),
  format TEXT NOT NULL,
  status TEXT DEFAULT 'upcoming',
  scheduled_at INTEGER NOT NULL,
  started_at INTEGER,
  completed_at INTEGER,
  team1_score TEXT,
  team2_score TEXT,
  result TEXT,
  winner_id TEXT REFERENCES teams(id),
  external_match_id TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS player_stats (
  id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
  player_id TEXT NOT NULL REFERENCES players(id),
  match_id TEXT REFERENCES matches(id),
  season TEXT,
  matches INTEGER DEFAULT 0,
  runs INTEGER DEFAULT 0,
  wickets INTEGER DEFAULT 0,
  average REAL DEFAULT 0,
  strike_rate REAL DEFAULT 0,
  economy REAL DEFAULT 0,
  fifties INTEGER DEFAULT 0,
  hundreds INTEGER DEFAULT 0,
  catches INTEGER DEFAULT 0,
  stumps INTEGER DEFAULT 0,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS predictions (
  id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
  user_id TEXT NOT NULL REFERENCES users(id),
  match_id TEXT NOT NULL REFERENCES matches(id),
  predicted_winner_id TEXT NOT NULL REFERENCES teams(id),
  confidence INTEGER,
  points INTEGER DEFAULT 0,
  is_correct INTEGER,
  prediction_data TEXT,
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  UNIQUE(user_id, match_id)
);

CREATE TABLE IF NOT EXISTS user_favorites (
  id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
  user_id TEXT NOT NULL REFERENCES users(id),
  player_id TEXT REFERENCES players(id),
  team_id TEXT REFERENCES teams(id),
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS saved_analyses (
  id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
  user_id TEXT NOT NULL REFERENCES users(id),
  title TEXT NOT NULL,
  description TEXT,
  analysis_type TEXT NOT NULL,
  analysis_data TEXT NOT NULL,
  match_id TEXT REFERENCES matches(id),
  created_at INTEGER NOT NULL DEFAULT (unixepoch()),
  updated_at INTEGER NOT NULL DEFAULT (unixepoch())
);

CREATE TABLE IF NOT EXISTS api_cache (
  id TEXT PRIMARY KEY DEFAULT (hex(randomblob(16))),
  cache_key TEXT NOT NULL UNIQUE,
  data TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL DEFAULT (unixepoch())
);
`;

// Execute the SQL
try {
  sqlite.exec(createTables);
  console.log('✅ Database tables created successfully!');
  
  // Insert some sample data
  const insertSampleData = `
  INSERT INTO teams (name, short_name, country) VALUES 
    ('India', 'IND', 'India'),
    ('Australia', 'AUS', 'Australia'),
    ('England', 'ENG', 'England'),
    ('Pakistan', 'PAK', 'Pakistan');
    
  INSERT INTO venues (name, city, country, capacity, pitch_type) VALUES
    ('Melbourne Cricket Ground', 'Melbourne', 'Australia', 100024, 'Balanced'),
    ('Lords Cricket Ground', 'London', 'England', 31100, 'Bowling'),
    ('Eden Gardens', 'Kolkata', 'India', 66000, 'Batting'),
    ('Gaddafi Stadium', 'Lahore', 'Pakistan', 27000, 'Balanced');
  `;
  
  sqlite.exec(insertSampleData);
  console.log('✅ Sample data inserted successfully!');
  
} catch (error) {
  console.error('❌ Error creating database:', error);
} finally {
  sqlite.close();
  console.log('🔒 Database connection closed');
}