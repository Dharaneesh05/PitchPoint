import {
  User, Team, Player, Match, PlayerStats, Prediction, UserFavorite, SavedAnalysis, Venue, ApiCache,
  type IUser, type ITeam, type IPlayer, type IMatch, type IPlayerStats,
  type IPrediction, type IUserFavorite, type ISavedAnalysis, type IVenue, type IApiCache,
  type InsertUser, type PublicUser, type InsertTeam, type InsertPlayer, 
  type InsertMatch, type InsertPrediction, type InsertSavedAnalysis
} from "../shared/mongodb-schema";
import bcrypt from "bcrypt";
import mongoose from "mongoose";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<IUser | null>;
  getUserByUsername(username: string): Promise<IUser | null>;
  getUserByEmail(email: string): Promise<IUser | null>;
  createUser(user: InsertUser): Promise<PublicUser>;
  verifyPassword(password: string, hashedPassword: string): Promise<boolean>;
  updateUserVerification(userId: string, isVerified: boolean): Promise<void>;
  setEmailVerificationToken(userId: string, token: string, expires: Date): Promise<void>;
  getUserByVerificationToken(token: string): Promise<IUser | null>;
  setPasswordResetToken(userId: string, token: string, expires: Date): Promise<void>;
  getUserByPasswordResetToken(token: string): Promise<IUser | null>;
  updatePassword(userId: string, newPassword: string): Promise<void>;
  updateLastLogin(userId: string): Promise<void>;
  
  // Team methods
  getTeams(): Promise<ITeam[]>;
  getTeam(id: string): Promise<ITeam | null>;
  createTeam(team: InsertTeam): Promise<ITeam>;
  
  // Player methods
  getPlayers(teamId?: string): Promise<IPlayer[]>;
  getPlayer(id: string): Promise<IPlayer | null>;
  createPlayer(player: InsertPlayer): Promise<IPlayer>;
  updatePlayerForm(playerId: string, form: 'excellent' | 'good' | 'average' | 'poor'): Promise<void>;
  
  // Match methods
  getMatches(status?: 'upcoming' | 'live' | 'completed'): Promise<IMatch[]>;
  getMatch(id: string): Promise<IMatch | null>;
  createMatch(match: InsertMatch): Promise<IMatch>;
  updateMatchStatus(matchId: string, status: 'upcoming' | 'live' | 'completed', scores?: { team1Score?: string; team2Score?: string; result?: string; winnerId?: string }): Promise<void>;
  
  // Player Stats methods
  getPlayerStats(playerId: string, season?: string): Promise<IPlayerStats[]>;
  createPlayerStats(stats: any): Promise<IPlayerStats>;
  
  // Prediction methods
  getUserPredictions(userId: string): Promise<IPrediction[]>;
  createPrediction(prediction: InsertPrediction): Promise<IPrediction>;
  updatePredictionResult(predictionId: string, isCorrect: boolean, points: number): Promise<void>;
  
  // Favorites methods
  getUserFavorites(userId: string): Promise<IUserFavorite[]>;
  addToFavorites(userId: string, playerId?: string, teamId?: string): Promise<IUserFavorite>;
  removeFromFavorites(userId: string, playerId?: string, teamId?: string): Promise<void>;
  
  // Saved Analysis methods
  getUserAnalyses(userId: string): Promise<ISavedAnalysis[]>;
  createSavedAnalysis(analysis: InsertSavedAnalysis): Promise<ISavedAnalysis>;
  
  // Cache methods
  getCachedData(cacheKey: string): Promise<any | null>;
  setCachedData(cacheKey: string, data: any, expiresInMinutes: number): Promise<void>;
}

export class MongoDBStorage implements IStorage {
  // User methods
  async getUser(id: string): Promise<IUser | null> {
    return await User.findById(id);
  }

  async getUserByUsername(username: string): Promise<IUser | null> {
    return await User.findOne({ username });
  }

  async getUserByEmail(email: string): Promise<IUser | null> {
    return await User.findOne({ email });
  }

  async createUser(insertUser: InsertUser): Promise<PublicUser> {
    const hashedPassword = await bcrypt.hash(insertUser.password, 12);
    const user = new User({
      ...insertUser,
      password: hashedPassword,
      emailVerified: false
    });
    
    const savedUser = await user.save();
    
    return {
      _id: savedUser._id.toString(),
      username: savedUser.username,
      email: savedUser.email,
      role: savedUser.role,
      profileImage: savedUser.profileImage,
      emailVerified: savedUser.emailVerified,
      lastLoginAt: savedUser.lastLoginAt,
      createdAt: savedUser.createdAt,
      updatedAt: savedUser.updatedAt,
    };
  }

  async verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(password, hashedPassword);
  }

  async updateUserVerification(userId: string, isVerified: boolean): Promise<void> {
    await User.findByIdAndUpdate(userId, { 
      emailVerified: isVerified,
      emailVerificationToken: undefined,
      emailVerificationExpires: undefined
    });
  }

  async setEmailVerificationToken(userId: string, token: string, expires: Date): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      emailVerificationToken: token,
      emailVerificationExpires: expires
    });
  }

  async getUserByVerificationToken(token: string): Promise<IUser | null> {
    return await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: new Date() }
    });
  }

  async setPasswordResetToken(userId: string, token: string, expires: Date): Promise<void> {
    await User.findByIdAndUpdate(userId, {
      passwordResetToken: token,
      passwordResetExpires: expires
    });
  }

  async getUserByPasswordResetToken(token: string): Promise<IUser | null> {
    return await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }
    });
  }

  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await User.findByIdAndUpdate(userId, {
      password: hashedPassword,
      passwordResetToken: undefined,
      passwordResetExpires: undefined
    });
  }

  async updateLastLogin(userId: string): Promise<void> {
    await User.findByIdAndUpdate(userId, { lastLoginAt: new Date() });
  }

  // Team methods
  async getTeams(): Promise<ITeam[]> {
    return await Team.find().sort({ name: 1 });
  }

  async getTeam(id: string): Promise<ITeam | null> {
    return await Team.findById(id);
  }

  async createTeam(team: InsertTeam): Promise<ITeam> {
    const newTeam = new Team(team);
    return await newTeam.save();
  }

  // Player methods
  async getPlayers(teamId?: string): Promise<IPlayer[]> {
    const query = teamId ? { teamId: new mongoose.Types.ObjectId(teamId) } : {};
    return await Player.find(query).populate('teamId');
  }

  async getPlayer(id: string): Promise<IPlayer | null> {
    return await Player.findById(id).populate('teamId');
  }

  async createPlayer(player: InsertPlayer): Promise<IPlayer> {
    const newPlayer = new Player({
      ...player,
      teamId: player.teamId ? new mongoose.Types.ObjectId(player.teamId) : undefined
    });
    return await newPlayer.save();
  }

  async updatePlayerForm(playerId: string, form: 'excellent' | 'good' | 'average' | 'poor'): Promise<void> {
    await Player.findByIdAndUpdate(playerId, { form });
  }

  // Match methods
  async getMatches(status?: 'upcoming' | 'live' | 'completed'): Promise<IMatch[]> {
    const query = status ? { status } : {};
    return await Match.find(query)
      .populate('team1Id')
      .populate('team2Id')
      .populate('venueId')
      .populate('winnerId')
      .sort({ scheduledAt: -1 });
  }

  async getMatch(id: string): Promise<IMatch | null> {
    return await Match.findById(id)
      .populate('team1Id')
      .populate('team2Id')
      .populate('venueId')
      .populate('winnerId');
  }

  async createMatch(match: InsertMatch): Promise<IMatch> {
    const newMatch = new Match({
      ...match,
      team1Id: new mongoose.Types.ObjectId(match.team1Id),
      team2Id: new mongoose.Types.ObjectId(match.team2Id),
      venueId: match.venueId ? new mongoose.Types.ObjectId(match.venueId) : undefined,
      winnerId: match.winnerId ? new mongoose.Types.ObjectId(match.winnerId) : undefined
    });
    return await newMatch.save();
  }

  async updateMatchStatus(
    matchId: string, 
    status: 'upcoming' | 'live' | 'completed', 
    scores?: { team1Score?: string; team2Score?: string; result?: string; winnerId?: string }
  ): Promise<void> {
    const updateData: any = { status };
    
    if (scores) {
      if (scores.team1Score) updateData.team1Score = scores.team1Score;
      if (scores.team2Score) updateData.team2Score = scores.team2Score;
      if (scores.result) updateData.result = scores.result;
      if (scores.winnerId) updateData.winnerId = new mongoose.Types.ObjectId(scores.winnerId);
    }

    if (status === 'live' && !updateData.startedAt) {
      updateData.startedAt = new Date();
    }
    
    if (status === 'completed' && !updateData.completedAt) {
      updateData.completedAt = new Date();
    }

    await Match.findByIdAndUpdate(matchId, updateData);
  }

  // Player Stats methods
  async getPlayerStats(playerId: string, season?: string): Promise<IPlayerStats[]> {
    const query: any = { playerId: new mongoose.Types.ObjectId(playerId) };
    if (season) query.season = season;
    return await PlayerStats.find(query).populate('playerId').populate('matchId');
  }

  async createPlayerStats(stats: any): Promise<IPlayerStats> {
    const newStats = new PlayerStats({
      ...stats,
      playerId: new mongoose.Types.ObjectId(stats.playerId),
      matchId: stats.matchId ? new mongoose.Types.ObjectId(stats.matchId) : undefined
    });
    return await newStats.save();
  }

  // Prediction methods
  async getUserPredictions(userId: string): Promise<IPrediction[]> {
    return await Prediction.find({ userId: new mongoose.Types.ObjectId(userId) })
      .populate('matchId')
      .populate('predictedWinnerId')
      .sort({ createdAt: -1 });
  }

  async createPrediction(prediction: InsertPrediction): Promise<IPrediction> {
    const newPrediction = new Prediction({
      ...prediction,
      userId: new mongoose.Types.ObjectId(prediction.userId),
      matchId: new mongoose.Types.ObjectId(prediction.matchId),
      predictedWinnerId: new mongoose.Types.ObjectId(prediction.predictedWinnerId)
    });
    return await newPrediction.save();
  }

  async updatePredictionResult(predictionId: string, isCorrect: boolean, points: number): Promise<void> {
    await Prediction.findByIdAndUpdate(predictionId, { isCorrect, points });
  }

  // Favorites methods
  async getUserFavorites(userId: string): Promise<IUserFavorite[]> {
    return await UserFavorite.find({ userId: new mongoose.Types.ObjectId(userId) })
      .populate('playerId')
      .populate('teamId');
  }

  async addToFavorites(userId: string, playerId?: string, teamId?: string): Promise<IUserFavorite> {
    const favorite = new UserFavorite({
      userId: new mongoose.Types.ObjectId(userId),
      playerId: playerId ? new mongoose.Types.ObjectId(playerId) : undefined,
      teamId: teamId ? new mongoose.Types.ObjectId(teamId) : undefined
    });
    return await favorite.save();
  }

  async removeFromFavorites(userId: string, playerId?: string, teamId?: string): Promise<void> {
    const query: any = { userId: new mongoose.Types.ObjectId(userId) };
    if (playerId) query.playerId = new mongoose.Types.ObjectId(playerId);
    if (teamId) query.teamId = new mongoose.Types.ObjectId(teamId);
    await UserFavorite.deleteOne(query);
  }

  // Saved Analysis methods
  async getUserAnalyses(userId: string): Promise<ISavedAnalysis[]> {
    return await SavedAnalysis.find({ userId: new mongoose.Types.ObjectId(userId) })
      .populate('matchId')
      .sort({ createdAt: -1 });
  }

  async createSavedAnalysis(analysis: InsertSavedAnalysis): Promise<ISavedAnalysis> {
    const newAnalysis = new SavedAnalysis({
      ...analysis,
      userId: new mongoose.Types.ObjectId(analysis.userId),
      matchId: analysis.matchId ? new mongoose.Types.ObjectId(analysis.matchId) : undefined
    });
    return await newAnalysis.save();
  }

  // Cache methods
  async getCachedData(cacheKey: string): Promise<any | null> {
    const cached = await ApiCache.findOne({
      cacheKey,
      expiresAt: { $gt: new Date() }
    });
    return cached ? cached.data : null;
  }

  async setCachedData(cacheKey: string, data: any, expiresInMinutes: number): Promise<void> {
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
    
    await ApiCache.findOneAndUpdate(
      { cacheKey },
      { data, expiresAt, cacheKey },
      { upsert: true, new: true }
    );
  }
}

export const storage = new MongoDBStorage();
