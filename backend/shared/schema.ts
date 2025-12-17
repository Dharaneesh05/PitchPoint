import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, integer, decimal, timestamp, boolean, jsonb, pgEnum, unique, check, index } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const userRoleEnum = pgEnum('user_role', ['coach', 'analyst', 'fan']);
export const playerRoleEnum = pgEnum('player_role', ['batsman', 'bowler', 'all-rounder', 'wicket-keeper']);
export const matchStatusEnum = pgEnum('match_status', ['upcoming', 'live', 'completed', 'cancelled']);
export const matchFormatEnum = pgEnum('match_format', ['T20', 'ODI', 'Test']);
export const playerFormEnum = pgEnum('player_form', ['excellent', 'good', 'average', 'poor']);

// Users table
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  role: userRoleEnum("role").notNull().default('fan'),
  profileImage: text("profile_image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Teams table
export const teams = pgTable("teams", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull().unique(),
  shortName: text("short_name").notNull().unique(), // e.g., "IND", "AUS"
  country: text("country").notNull(),
  logo: text("logo"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Players table
export const players = pgTable("players", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  teamId: varchar("team_id").references(() => teams.id),
  role: playerRoleEnum("role").notNull(),
  battingStyle: text("batting_style"), // "Right-hand bat", "Left-hand bat"
  bowlingStyle: text("bowling_style"), // "Right-arm fast", "Left-arm spin", etc.
  image: text("image"),
  dateOfBirth: timestamp("date_of_birth"),
  nationality: text("nationality"),
  isInjured: boolean("is_injured").default(false),
  form: playerFormEnum("form").default('average'),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Venues table
export const venues = pgTable("venues", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  city: text("city").notNull(),
  country: text("country").notNull(),
  capacity: integer("capacity"),
  pitchType: text("pitch_type"), // "Batting", "Bowling", "Balanced"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Matches table
export const matches = pgTable("matches", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  team1Id: varchar("team1_id").references(() => teams.id).notNull(),
  team2Id: varchar("team2_id").references(() => teams.id).notNull(),
  venueId: varchar("venue_id").references(() => venues.id),
  format: matchFormatEnum("format").notNull(),
  status: matchStatusEnum("status").default('upcoming'),
  scheduledAt: timestamp("scheduled_at").notNull(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  team1Score: text("team1_score"), // "185/4 (18.2)"
  team2Score: text("team2_score"),
  result: text("result"), // "Team A won by 7 wickets"
  winnerId: varchar("winner_id").references(() => teams.id),
  externalMatchId: text("external_match_id"), // For API integration
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Player Statistics table
export const playerStats = pgTable("player_stats", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  playerId: varchar("player_id").references(() => players.id).notNull(),
  matchId: varchar("match_id").references(() => matches.id),
  season: text("season"), // "2024", "IPL 2024", etc.
  matches: integer("matches").default(0),
  runs: integer("runs").default(0),
  wickets: integer("wickets").default(0),
  average: decimal("average", { precision: 5, scale: 2 }).default('0'),
  strikeRate: decimal("strike_rate", { precision: 5, scale: 2 }).default('0'),
  economy: decimal("economy", { precision: 4, scale: 2 }).default('0'),
  fifties: integer("fifties").default(0),
  hundreds: integer("hundreds").default(0),
  catches: integer("catches").default(0),
  stumps: integer("stumps").default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User Predictions table
export const predictions = pgTable("predictions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  matchId: varchar("match_id").references(() => matches.id).notNull(),
  predictedWinnerId: varchar("predicted_winner_id").references(() => teams.id).notNull(),
  confidence: integer("confidence"), // 1-10 scale
  points: integer("points").default(0), // Points earned for correct prediction
  isCorrect: boolean("is_correct"),
  predictionData: jsonb("prediction_data"), // Additional prediction details
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  uniqueUserMatch: unique().on(table.userId, table.matchId), // Prevent duplicate predictions
}));

// User Favorites table
export const userFavorites = pgTable("user_favorites", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  playerId: varchar("player_id").references(() => players.id),
  teamId: varchar("team_id").references(() => teams.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => ({
  // Ensure exactly one of playerId or teamId is set
  checkOneTarget: check('check_one_target', sql`(
    (${table.playerId} IS NOT NULL AND ${table.teamId} IS NULL) OR
    (${table.playerId} IS NULL AND ${table.teamId} IS NOT NULL)
  )`),
  // Prevent duplicate favorites
  uniqueUserPlayer: unique().on(table.userId, table.playerId),
  uniqueUserTeam: unique().on(table.userId, table.teamId),
}));

// Saved Analysis table (for coaches and analysts)
export const savedAnalyses = pgTable("saved_analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id).notNull(),
  title: text("title").notNull(),
  description: text("description"),
  analysisType: text("analysis_type").notNull(), // "team_selection", "player_performance", "match_analysis"
  analysisData: jsonb("analysis_data").notNull(), // Stored analysis results
  matchId: varchar("match_id").references(() => matches.id),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// API Cache table (for cricket data caching)
export const apiCache = pgTable("api_cache", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cacheKey: text("cache_key").notNull().unique(),
  data: jsonb("data").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
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
