import { sql, relations } from "drizzle-orm";
import { sqliteTable, text, integer, real, unique } from "drizzle-orm/sqlite-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Users table
export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: text("role").notNull().default('fan'), // 'coach', 'analyst', 'fan'
  profileImage: text("profile_image"),
  emailVerified: integer("email_verified", { mode: 'boolean' }).default(false),
  emailVerificationToken: text("email_verification_token"),
  emailVerificationExpires: integer("email_verification_expires", { mode: 'timestamp' }),
  passwordResetToken: text("password_reset_token"),
  passwordResetExpires: integer("password_reset_expires", { mode: 'timestamp' }),
  lastLoginAt: integer("last_login_at", { mode: 'timestamp' }),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

// Teams table
export const teams = sqliteTable("teams", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull().unique(),
  shortName: text("short_name").notNull().unique(), // e.g., "IND", "AUS"
  country: text("country").notNull(),
  logo: text("logo"),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

// Players table
export const players = sqliteTable("players", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  teamId: text("team_id").references(() => teams.id),
  role: text("role").notNull(), // 'batsman', 'bowler', 'all-rounder', 'wicket-keeper'
  battingStyle: text("batting_style"), // "Right-hand bat", "Left-hand bat"
  bowlingStyle: text("bowling_style"), // "Right-arm fast", "Left-arm spin", etc.
  image: text("image"),
  dateOfBirth: integer("date_of_birth", { mode: 'timestamp' }),
  nationality: text("nationality"),
  isInjured: integer("is_injured", { mode: 'boolean' }).default(false),
  form: text("form").default('average'), // 'excellent', 'good', 'average', 'poor'
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

// Venues table
export const venues = sqliteTable("venues", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text("name").notNull(),
  city: text("city").notNull(),
  country: text("country").notNull(),
  capacity: integer("capacity"),
  pitchType: text("pitch_type"), // "Batting", "Bowling", "Balanced"
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

// Matches table
export const matches = sqliteTable("matches", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  team1Id: text("team1_id").references(() => teams.id).notNull(),
  team2Id: text("team2_id").references(() => teams.id).notNull(),
  venueId: text("venue_id").references(() => venues.id),
  format: text("format").notNull(), // 'T20', 'ODI', 'Test'
  status: text("status").default('upcoming'), // 'upcoming', 'live', 'completed', 'cancelled'
  scheduledAt: integer("scheduled_at", { mode: 'timestamp' }).notNull(),
  startedAt: integer("started_at", { mode: 'timestamp' }),
  completedAt: integer("completed_at", { mode: 'timestamp' }),
  team1Score: text("team1_score"), // "185/4 (18.2)"
  team2Score: text("team2_score"),
  result: text("result"), // "Team A won by 7 wickets"
  winnerId: text("winner_id").references(() => teams.id),
  externalMatchId: text("external_match_id"), // For API integration
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

// Player Statistics table
export const playerStats = sqliteTable("player_stats", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  playerId: text("player_id").references(() => players.id).notNull(),
  matchId: text("match_id").references(() => matches.id),
  season: text("season"), // "2024", "IPL 2024", etc.
  matches: integer("matches").default(0),
  runs: integer("runs").default(0),
  wickets: integer("wickets").default(0),
  average: real("average").default(0),
  strikeRate: real("strike_rate").default(0),
  economy: real("economy").default(0),
  fifties: integer("fifties").default(0),
  hundreds: integer("hundreds").default(0),
  catches: integer("catches").default(0),
  stumps: integer("stumps").default(0),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

// User Predictions table
export const predictions = sqliteTable("predictions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id).notNull(),
  matchId: text("match_id").references(() => matches.id).notNull(),
  predictedWinnerId: text("predicted_winner_id").references(() => teams.id).notNull(),
  confidence: integer("confidence"), // 1-10 scale
  points: integer("points").default(0), // Points earned for correct prediction
  isCorrect: integer("is_correct", { mode: 'boolean' }),
  predictionData: text("prediction_data"), // JSON string for additional prediction details
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
}, (table) => ({
  uniqueUserMatch: unique().on(table.userId, table.matchId), // Prevent duplicate predictions
}));

// User Favorites table
export const userFavorites = sqliteTable("user_favorites", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id).notNull(),
  playerId: text("player_id").references(() => players.id),
  teamId: text("team_id").references(() => teams.id),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

// Saved Analysis table (for coaches and analysts)
export const savedAnalyses = sqliteTable("saved_analyses", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  analysisType: text("analysis_type").notNull(), // "team_selection", "player_performance", "match_analysis"
  analysisData: text("analysis_data").notNull(), // JSON string for stored analysis results
  matchId: text("match_id").references(() => matches.id),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

// API Cache table (for cricket data caching)
export const apiCache = sqliteTable("api_cache", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  cacheKey: text("cache_key").notNull().unique(),
  data: text("data").notNull(), // JSON string
  expiresAt: integer("expires_at", { mode: 'timestamp' }).notNull(),
  createdAt: integer("created_at", { mode: 'timestamp' }).$defaultFn(() => new Date()).notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  predictions: many(predictions),
  favorites: many(userFavorites),
  savedAnalyses: many(savedAnalyses),
}));

export const teamsRelations = relations(teams, ({ many }) => ({
  players: many(players),
  homeMatches: many(matches, { relationName: "team1" }),
  awayMatches: many(matches, { relationName: "team2" }),
  wonMatches: many(matches, { relationName: "winner" }),
  predictions: many(predictions),
  favorites: many(userFavorites),
}));

export const playersRelations = relations(players, ({ one, many }) => ({
  team: one(teams, {
    fields: [players.teamId],
    references: [teams.id],
  }),
  stats: many(playerStats),
  favorites: many(userFavorites),
}));

export const matchesRelations = relations(matches, ({ one, many }) => ({
  team1: one(teams, {
    fields: [matches.team1Id],
    references: [teams.id],
    relationName: "team1",
  }),
  team2: one(teams, {
    fields: [matches.team2Id],
    references: [teams.id],
    relationName: "team2",
  }),
  winner: one(teams, {
    fields: [matches.winnerId],
    references: [teams.id],
    relationName: "winner",
  }),
  venue: one(venues, {
    fields: [matches.venueId],
    references: [venues.id],
  }),
  predictions: many(predictions),
  playerStats: many(playerStats),
  savedAnalyses: many(savedAnalyses),
}));

export const venuesRelations = relations(venues, ({ many }) => ({
  matches: many(matches),
}));

export const playerStatsRelations = relations(playerStats, ({ one }) => ({
  player: one(players, {
    fields: [playerStats.playerId],
    references: [players.id],
  }),
  match: one(matches, {
    fields: [playerStats.matchId],
    references: [matches.id],
  }),
}));

export const predictionsRelations = relations(predictions, ({ one }) => ({
  user: one(users, {
    fields: [predictions.userId],
    references: [users.id],
  }),
  match: one(matches, {
    fields: [predictions.matchId],
    references: [matches.id],
  }),
  predictedWinner: one(teams, {
    fields: [predictions.predictedWinnerId],
    references: [teams.id],
  }),
}));

export const userFavoritesRelations = relations(userFavorites, ({ one }) => ({
  user: one(users, {
    fields: [userFavorites.userId],
    references: [users.id],
  }),
  player: one(players, {
    fields: [userFavorites.playerId],
    references: [players.id],
  }),
  team: one(teams, {
    fields: [userFavorites.teamId],
    references: [teams.id],
  }),
}));

export const savedAnalysesRelations = relations(savedAnalyses, ({ one }) => ({
  user: one(users, {
    fields: [savedAnalyses.userId],
    references: [users.id],
  }),
  match: one(matches, {
    fields: [savedAnalyses.matchId],
    references: [matches.id],
  }),
}));

// Insert and Select Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: "Password must contain at least one uppercase letter, one lowercase letter, and one number"
  }),
});

export const selectUserSchema = createSelectSchema(users).omit({
  password: true,
});

export const insertTeamSchema = createInsertSchema(teams).omit({
  id: true,
  createdAt: true,
});

export const insertPlayerSchema = createInsertSchema(players).omit({
  id: true,
  createdAt: true,
});

export const insertMatchSchema = createInsertSchema(matches).omit({
  id: true,
  createdAt: true,
});

export const insertPlayerStatsSchema = createInsertSchema(playerStats).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertPredictionSchema = createInsertSchema(predictions).omit({
  id: true,
  createdAt: true,
  points: true,
  isCorrect: true,
});

export const insertSavedAnalysisSchema = createInsertSchema(savedAnalyses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type PublicUser = z.infer<typeof selectUserSchema>;
export type Team = typeof teams.$inferSelect;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type Player = typeof players.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type Match = typeof matches.$inferSelect;
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type PlayerStats = typeof playerStats.$inferSelect;
export type InsertPlayerStats = z.infer<typeof insertPlayerStatsSchema>;
export type Prediction = typeof predictions.$inferSelect;
export type InsertPrediction = z.infer<typeof insertPredictionSchema>;
export type UserFavorite = typeof userFavorites.$inferSelect;
export type SavedAnalysis = typeof savedAnalyses.$inferSelect;
export type InsertSavedAnalysis = z.infer<typeof insertSavedAnalysisSchema>;
export type Venue = typeof venues.$inferSelect;
export type ApiCache = typeof apiCache.$inferSelect;

// User role type for frontend
export type UserRole = 'coach' | 'analyst' | 'fan';
export type PlayerRole = 'batsman' | 'bowler' | 'all-rounder' | 'wicket-keeper';
export type MatchStatus = 'upcoming' | 'live' | 'completed' | 'cancelled';
export type MatchFormat = 'T20' | 'ODI' | 'Test';
export type PlayerForm = 'excellent' | 'good' | 'average' | 'poor';