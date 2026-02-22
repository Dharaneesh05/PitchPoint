import mongoose, { Schema, Document } from 'mongoose';

// Saved Analysis Schema
export interface ISavedAnalysis extends Document {
  _id: string;
  userId: string;
  title: string;
  description: string;
  analysisType: 'player_performance' | 'match_analysis' | 'team_comparison' | 'custom_report';
  analysisData: {
    playerId?: string;
    playerName?: string;
    matchId?: string;
    teamIds?: string[];
    format?: 'T20' | 'ODI' | 'Test' | 'all';
    analysisDate: string;
    stats?: any;
    insights?: string[];
    recommendation?: string;
    charts?: Array<{
      type: string;
      title: string;
      data: any;
    }>;
    customData?: any;
  };
  tags: string[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SavedAnalysisSchema = new Schema<ISavedAnalysis>({
  userId: { type: String, required: true, index: true },
  title: { type: String, required: true, maxlength: 200 },
  description: { type: String, required: true, maxlength: 1000 },
  analysisType: { 
    type: String, 
    required: true,
    enum: ['player_performance', 'match_analysis', 'team_comparison', 'custom_report']
  },
  analysisData: {
    playerId: { type: String },
    playerName: { type: String },
    matchId: { type: String },
    teamIds: [{ type: String }],
    format: { 
      type: String, 
      enum: ['T20', 'ODI', 'Test', 'all'],
      default: 'all'
    },
    analysisDate: { type: String, required: true },
    stats: { type: Schema.Types.Mixed },
    insights: [{ type: String }],
    recommendation: { type: String },
    charts: [{
      type: { type: String },
      title: { type: String },
      data: { type: Schema.Types.Mixed }
    }],
    customData: { type: Schema.Types.Mixed }
  },
  tags: [{ type: String, maxlength: 50 }],
  isPublic: { type: Boolean, default: false },
}, {
  timestamps: true
});

// Indexes for performance
SavedAnalysisSchema.index({ userId: 1, createdAt: -1 });
SavedAnalysisSchema.index({ userId: 1, analysisType: 1 });
SavedAnalysisSchema.index({ tags: 1 });
SavedAnalysisSchema.index({ isPublic: 1, createdAt: -1 });

// Favorite Players Schema
export interface IFavoritePlayer extends Document {
  _id: string;
  userId: string;
  playerId: string;
  playerName: string;
  playerRole: string;
  nationality: string;
  teamName?: string;
  notes?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const FavoritePlayerSchema = new Schema<IFavoritePlayer>({
  userId: { type: String, required: true, index: true },
  playerId: { type: String, required: true },
  playerName: { type: String, required: true, maxlength: 100 },
  playerRole: { 
    type: String, 
    required: true,
    enum: ['batsman', 'bowler', 'all-rounder', 'wicket-keeper']
  },
  nationality: { type: String, required: true, maxlength: 50 },
  teamName: { type: String, maxlength: 100 },
  notes: { type: String, maxlength: 500 },
  tags: [{ type: String, maxlength: 30 }]
}, {
  timestamps: true
});

// Unique constraint: one user can't favorite same player twice
FavoritePlayerSchema.index({ userId: 1, playerId: 1 }, { unique: true });

// User Activity Log Schema (for tracking user interactions)
export interface IUserActivity extends Document {
  _id: string;
  userId: string;
  activityType: 'view_player' | 'save_analysis' | 'favorite_player' | 'search_player' | 'export_report';
  activityData: {
    playerId?: string;
    playerName?: string;
    analysisId?: string;
    searchQuery?: string;
    metadata?: any;
  };
  timestamp: Date;
}

const UserActivitySchema = new Schema<IUserActivity>({
  userId: { type: String, required: true, index: true },
  activityType: { 
    type: String, 
    required: true,
    enum: ['view_player', 'save_analysis', 'favorite_player', 'search_player', 'export_report']
  },
  activityData: {
    playerId: { type: String },
    playerName: { type: String },
    analysisId: { type: String },
    searchQuery: { type: String },
    metadata: { type: Schema.Types.Mixed }
  },
  timestamp: { type: Date, default: Date.now, index: true }
});

// TTL index to automatically delete old activity logs after 90 days
UserActivitySchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

// Training Session Schema
export interface ITrainingSession extends Document {
  _id: string;
  userId: string;
  sessionTitle: string;
  sessionDate: string;
  sessionType: 'skill' | 'fitness' | 'strategy' | 'team-building' | 'match-preparation' | 'recovery';
  focus: string;
  duration: string;
  participants: number;
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled';
  notes?: string;
  venue?: string;
  equipment?: string[];
  objectives?: string[];
  outcome?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TrainingSessionSchema = new Schema<ITrainingSession>({
  userId: { type: String, required: true, index: true },
  sessionTitle: { type: String, required: true, maxlength: 200 },
  sessionDate: { type: String, required: true },
  sessionType: { 
    type: String, 
    required: true,
    enum: ['skill', 'fitness', 'strategy', 'team-building', 'match-preparation', 'recovery']
  },
  focus: { type: String, required: true, maxlength: 300 },
  duration: { type: String, required: true },
  participants: { type: Number, required: true, min: 1, max: 50 },
  status: { 
    type: String, 
    required: true,
    enum: ['scheduled', 'in-progress', 'completed', 'cancelled'],
    default: 'scheduled'
  },
  notes: { type: String, maxlength: 1000 },
  venue: { type: String, maxlength: 200 },
  equipment: [{ type: String, maxlength: 100 }],
  objectives: [{ type: String, maxlength: 200 }],
  outcome: { type: String, maxlength: 500 }
}, {
  timestamps: true
});

// Indexes for performance
TrainingSessionSchema.index({ userId: 1, sessionDate: -1 });
TrainingSessionSchema.index({ userId: 1, status: 1 });
TrainingSessionSchema.index({ userId: 1, sessionType: 1 });

// User Preferences Schema (for storing user-specific settings)
export interface IUserPreferences extends Document {
  _id: string;
  userId: string;
  preferences: {
    defaultFormat: 'T20' | 'ODI' | 'Test' | 'all';
    favoriteTeams: string[];
    analysisSettings: {
      autoSave: boolean;
      publicByDefault: boolean;
      includeCharts: boolean;
    };
    notifications: {
      playerUpdates: boolean;
      analysisShared: boolean;
      weeklyDigest: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserPreferencesSchema = new Schema<IUserPreferences>({
  userId: { type: String, required: true, unique: true, index: true },
  preferences: {
    defaultFormat: { 
      type: String, 
      enum: ['T20', 'ODI', 'Test', 'all'],
      default: 'all'
    },
    favoriteTeams: [{ type: String }],
    analysisSettings: {
      autoSave: { type: Boolean, default: false },
      publicByDefault: { type: Boolean, default: false },
      includeCharts: { type: Boolean, default: true }
    },
    notifications: {
      playerUpdates: { type: Boolean, default: true },
      analysisShared: { type: Boolean, default: true },
      weeklyDigest: { type: Boolean, default: false }
    }
  }
}, {
  timestamps: true
});

// Export models
export const SavedAnalysis = mongoose.model<ISavedAnalysis>('SavedAnalysis', SavedAnalysisSchema);
export const FavoritePlayer = mongoose.model<IFavoritePlayer>('FavoritePlayer', FavoritePlayerSchema);
export const UserActivity = mongoose.model<IUserActivity>('UserActivity', UserActivitySchema);
export const UserPreferences = mongoose.model<IUserPreferences>('UserPreferences', UserPreferencesSchema);
export const TrainingSession = mongoose.model<ITrainingSession>('TrainingSession', TrainingSessionSchema);

// Helper functions for common queries
export class AnalysisService {
  static async getUserAnalyses(userId: string, type?: string, limit: number = 20) {
    const query: any = { userId };
    if (type && type !== 'all') {
      query.analysisType = type;
    }
    
    return await SavedAnalysis.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();
  }

  static async saveUserAnalysis(userId: string, analysisData: Partial<ISavedAnalysis>) {
    const analysis = new SavedAnalysis({
      ...analysisData,
      userId
    });
    return await analysis.save();
  }

  static async getFavoriteplayers(userId: string) {
    return await FavoritePlayer.find({ userId })
      .sort({ createdAt: -1 })
      .lean();
  }

  static async addFavoritePlayer(userId: string, playerData: Partial<IFavoritePlayer>) {
    try {
      const favorite = new FavoritePlayer({
        ...playerData,
        userId
      });
      return await favorite.save();
    } catch (error: any) {
      if (error.code === 11000) {
        throw new Error('Player already in favorites');
      }
      throw error;
    }
  }

  static async removeFavoritePlayer(userId: string, playerId: string) {
    return await FavoritePlayer.deleteOne({ userId, playerId });
  }

  static async logUserActivity(userId: string, activityType: string, activityData: any) {
    const activity = new UserActivity({
      userId,
      activityType,
      activityData,
      timestamp: new Date()
    });
    
    // Don't await this to avoid blocking the main request
    activity.save().catch(error => {
      console.error('Failed to log user activity:', error);
    });
  }

  static async getUserPreferences(userId: string) {
    const preferences = await UserPreferences.findOne({ userId }).lean();
    if (!preferences) {
      // Create default preferences
      const defaultPrefs = new UserPreferences({
        userId,
        preferences: {
          defaultFormat: 'all',
          favoriteTeams: [],
          analysisSettings: {
            autoSave: false,
            publicByDefault: false,
            includeCharts: true
          },
          notifications: {
            playerUpdates: true,
            analysisShared: true,
            weeklyDigest: false
          }
        }
      });
      await defaultPrefs.save();
      return defaultPrefs.toObject();
    }
    return preferences;
  }

  static async updateUserPreferences(userId: string, preferences: any) {
    return await UserPreferences.findOneAndUpdate(
      { userId },
      { $set: { preferences } },
      { new: true, upsert: true }
    );
  }

  // Training Session methods
  static async getUserTrainingSessions(userId: string, status?: string, limit: number = 50) {
    const query: any = { userId };
    if (status && status !== 'all') {
      query.status = status;
    }
    
    return await TrainingSession.find(query)
      .sort({ sessionDate: -1, createdAt: -1 })
      .limit(limit)
      .lean();
  }

  static async createTrainingSession(userId: string, sessionData: Partial<ITrainingSession>) {
    const session = new TrainingSession({
      ...sessionData,
      userId
    });
    return await session.save();
  }

  static async updateTrainingSession(userId: string, sessionId: string, sessionData: Partial<ITrainingSession>) {
    return await TrainingSession.findOneAndUpdate(
      { _id: sessionId, userId },
      { $set: sessionData },
      { new: true }
    );
  }

  static async deleteTrainingSession(userId: string, sessionId: string) {
    return await TrainingSession.deleteOne({ _id: sessionId, userId });
  }

  static async getTrainingSessionById(userId: string, sessionId: string) {
    return await TrainingSession.findOne({ _id: sessionId, userId }).lean();
  }

  static async getTrainingStats(userId: string) {
    const [totalSessions, completedSessions, upcomingSessions] = await Promise.all([
      TrainingSession.countDocuments({ userId }),
      TrainingSession.countDocuments({ userId, status: 'completed' }),
      TrainingSession.countDocuments({ 
        userId, 
        status: 'scheduled',
        sessionDate: { $gte: new Date().toISOString().split('T')[0] }
      })
    ]);

    return {
      totalSessions,
      completedSessions,
      upcomingSessions,
      completionRate: totalSessions > 0 ? Math.round((completedSessions / totalSessions) * 100) : 0
    };
  }
}