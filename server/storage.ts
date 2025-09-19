import { 
  type User, type InsertUser, type PublicUser,
  type Team, type InsertTeam,
  type Player, type InsertPlayer,
  type Match, type InsertMatch,
  type PlayerStats, type InsertPlayerStats,
  type Prediction, type InsertPrediction,
  type UserFavorite, type SavedAnalysis, type InsertSavedAnalysis,
  type Venue, type ApiCache,
  users, teams, players, matches, playerStats, predictions, userFavorites, savedAnalyses, venues, apiCache
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, sql } from "drizzle-orm";
import bcrypt from "bcrypt";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<PublicUser>;
  verifyPassword(password: string, hashedPassword: string): Promise<boolean>;
  
  // Team methods
  getTeams(): Promise<Team[]>;
  getTeam(id: string): Promise<Team | undefined>;
  createTeam(team: InsertTeam): Promise<Team>;
  
  // Player methods
  getPlayers(teamId?: string): Promise<Player[]>;
  getPlayer(id: string): Promise<Player | undefined>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  updatePlayerForm(playerId: string, form: 'excellent' | 'good' | 'average' | 'poor'): Promise<void>;
  
  // Match methods
  getMatches(status?: 'upcoming' | 'live' | 'completed'): Promise<Match[]>;
  getMatch(id: string): Promise<Match | undefined>;
  createMatch(match: InsertMatch): Promise<Match>;
  updateMatchStatus(matchId: string, status: 'upcoming' | 'live' | 'completed', scores?: { team1Score?: string; team2Score?: string; result?: string; winnerId?: string }): Promise<void>;
  
  // Player Stats methods
  getPlayerStats(playerId: string, season?: string): Promise<PlayerStats[]>;
  createPlayerStats(stats: InsertPlayerStats): Promise<PlayerStats>;
  
  // Prediction methods
  getUserPredictions(userId: string): Promise<Prediction[]>;
  createPrediction(prediction: InsertPrediction): Promise<Prediction>;
  updatePredictionResult(predictionId: string, isCorrect: boolean, points: number): Promise<void>;
  
  // Favorites methods
  getUserFavorites(userId: string): Promise<UserFavorite[]>;
  addToFavorites(userId: string, playerId?: string, teamId?: string): Promise<UserFavorite>;
  removeFromFavorites(userId: string, playerId?: string, teamId?: string): Promise<void>;
  
  // Saved Analysis methods
  getUserAnalyses(userId: string): Promise<SavedAnalysis[]>;
  createSavedAnalysis(analysis: InsertSavedAnalysis): Promise<SavedAnalysis>;
  
  // Cache methods
  getCachedData(cacheKey: string): Promise<any | undefined>;
  setCachedData(cacheKey: string, data: any, expiresInMinutes: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<PublicUser> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 10);
    const [user] = await db
      .insert(users)
      .values({ ...insertUser, password: hashedPassword })
      .returning();
    
    // Return user without password
    const { password, ...publicUser } = user;
    return publicUser;
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }

  async getTeams(): Promise<Team[]> {
    return db.select().from(teams).orderBy(teams.name);
  }

  async getTeam(id: string): Promise<Team | undefined> {
    const [team] = await db.select().from(teams).where(eq(teams.id, id));
    return team || undefined;
  }

  async createTeam(team: InsertTeam): Promise<Team> {
    const [newTeam] = await db.insert(teams).values(team).returning();
    return newTeam;
  }

  async getPlayers(teamId?: string): Promise<Player[]> {
    if (teamId) {
      return db.select().from(players).where(eq(players.teamId, teamId)).orderBy(players.name);
    }
    return db.select().from(players).orderBy(players.name);
  }

  async getPlayer(id: string): Promise<Player | undefined> {
    const [player] = await db.select().from(players).where(eq(players.id, id));
    return player || undefined;
  }

  async createPlayer(player: InsertPlayer): Promise<Player> {
    const [newPlayer] = await db.insert(players).values(player).returning();
    return newPlayer;
  }

  async updatePlayerForm(playerId: string, form: 'excellent' | 'good' | 'average' | 'poor'): Promise<void> {
    await db.update(players).set({ form }).where(eq(players.id, playerId));
  }

  async getMatches(status?: 'upcoming' | 'live' | 'completed'): Promise<Match[]> {
    if (status) {
      return db.select().from(matches).where(eq(matches.status, status)).orderBy(desc(matches.scheduledAt));
    }
    return db.select().from(matches).orderBy(desc(matches.scheduledAt));
  }

  async getMatch(id: string): Promise<Match | undefined> {
    const [match] = await db.select().from(matches).where(eq(matches.id, id));
    return match || undefined;
  }

  async createMatch(match: InsertMatch): Promise<Match> {
    const [newMatch] = await db.insert(matches).values(match).returning();
    return newMatch;
  }

  async updateMatchStatus(matchId: string, status: 'upcoming' | 'live' | 'completed', scores?: { team1Score?: string; team2Score?: string; result?: string; winnerId?: string }): Promise<void> {
    const updateData: any = { status };
    if (scores) {
      Object.assign(updateData, scores);
    }
    if (status === 'live' && !scores?.team1Score) {
      updateData.startedAt = new Date();
    }
    if (status === 'completed') {
      updateData.completedAt = new Date();
    }
    await db.update(matches).set(updateData).where(eq(matches.id, matchId));
  }

  async getPlayerStats(playerId: string, season?: string): Promise<PlayerStats[]> {
    if (season) {
      return db.select().from(playerStats)
        .where(and(eq(playerStats.playerId, playerId), eq(playerStats.season, season)))
        .orderBy(desc(playerStats.createdAt));
    }
    return db.select().from(playerStats)
      .where(eq(playerStats.playerId, playerId))
      .orderBy(desc(playerStats.createdAt));
  }

  async createPlayerStats(stats: InsertPlayerStats): Promise<PlayerStats> {
    const [newStats] = await db.insert(playerStats).values(stats).returning();
    return newStats;
  }

  async getUserPredictions(userId: string): Promise<Prediction[]> {
    return db.select().from(predictions)
      .where(eq(predictions.userId, userId))
      .orderBy(desc(predictions.createdAt));
  }

  async createPrediction(prediction: InsertPrediction): Promise<Prediction> {
    const [newPrediction] = await db.insert(predictions).values(prediction).returning();
    return newPrediction;
  }

  async updatePredictionResult(predictionId: string, isCorrect: boolean, points: number): Promise<void> {
    await db.update(predictions)
      .set({ isCorrect, points })
      .where(eq(predictions.id, predictionId));
  }

  async getUserFavorites(userId: string): Promise<UserFavorite[]> {
    return db.select().from(userFavorites)
      .where(eq(userFavorites.userId, userId))
      .orderBy(desc(userFavorites.createdAt));
  }

  async addToFavorites(userId: string, playerId?: string, teamId?: string): Promise<UserFavorite> {
    const [favorite] = await db.insert(userFavorites)
      .values({ userId, playerId, teamId })
      .returning();
    return favorite;
  }

  async removeFromFavorites(userId: string, playerId?: string, teamId?: string): Promise<void> {
    const conditions = [eq(userFavorites.userId, userId)];
    if (playerId) conditions.push(eq(userFavorites.playerId, playerId));
    if (teamId) conditions.push(eq(userFavorites.teamId, teamId));
    
    await db.delete(userFavorites).where(and(...conditions));
  }

  async getUserAnalyses(userId: string): Promise<SavedAnalysis[]> {
    return db.select().from(savedAnalyses)
      .where(eq(savedAnalyses.userId, userId))
      .orderBy(desc(savedAnalyses.createdAt));
  }

  async createSavedAnalysis(analysis: InsertSavedAnalysis): Promise<SavedAnalysis> {
    const [newAnalysis] = await db.insert(savedAnalyses).values(analysis).returning();
    return newAnalysis;
  }

  async getCachedData(cacheKey: string): Promise<any | undefined> {
    const [cached] = await db.select().from(apiCache)
      .where(and(
        eq(apiCache.cacheKey, cacheKey),
        sql`expires_at > NOW()`
      ));
    return cached?.data;
  }

  async setCachedData(cacheKey: string, data: any, expiresInMinutes: number): Promise<void> {
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
    await db.insert(apiCache)
      .values({ cacheKey, data, expiresAt })
      .onConflictDoUpdate({
        target: apiCache.cacheKey,
        set: { data, expiresAt, createdAt: new Date() }
      });
  }
}

export const storage = new DatabaseStorage();
