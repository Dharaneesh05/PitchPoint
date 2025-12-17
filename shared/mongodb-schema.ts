import mongoose, { Schema, Document } from 'mongoose';
import { z } from 'zod';

// MongoDB Document Interfaces
export interface IUser extends Document {
  _id: string;
  username: string;
  email: string;
  password: string;
  role: 'coach' | 'analyst' | 'fan';
  profileImage?: string;
  emailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationExpires?: Date;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastLoginAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ITeam extends Document {
  _id: string;
  apiId: string; // External API team ID
  name: string;
  shortName: string;
  country: string;
  logo?: string;
  squad: mongoose.Types.ObjectId[]; // Array of player IDs
  coach?: string;
  captain?: mongoose.Types.ObjectId; // Player ID
  ranking?: number;
  teamType: 'international' | 'domestic' | 'franchise';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISeries extends Document {
  _id: string;
  cricApiId: string; // External CricAPI series ID
  name: string;
  startDate: string;
  endDate: string;
  odi: number;
  t20: number;
  test: number;
  squads: number;
  matches: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICountry extends Document {
  _id: string;
  cricApiId: string; // External CricAPI country ID
  name: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPlayer extends Document {
  _id: string;
  apiId: string; // External API player ID
  cricApiId?: string; // CricAPI player ID
  name: string;
  age?: number;
  nationality: string;
  country?: string; // CricAPI country field
  teamId?: mongoose.Types.ObjectId;
  role: 'batsman' | 'bowler' | 'all-rounder' | 'wicket-keeper' | 'batter' | 'keeper' | string;
  battingStyle?: string; // Right-hand bat, Left-hand bat
  bowlingStyle?: string; // Right-arm fast, Left-arm spin, etc.
  image?: string;
  dateOfBirth?: Date | string;
  placeOfBirth?: string; // CricAPI field
  isInjured: boolean;
  form: 'excellent' | 'good' | 'average' | 'poor';
  
  // Career Statistics
  stats: {
    matches: number;
    runs: number;
    wickets: number;
    batting: {
      average: number;
      strikeRate: number;
      fifties: number;
      hundreds: number;
      highestScore: number;
    };
    bowling: {
      average: number;
      economy: number;
      strikeRate: number;
      bestFigures: string;
      fiveWickets: number;
    };
    fielding: {
      catches: number;
      stumps: number;
      runOuts: number;
    };
  };
  
  // Fantasy specific
  fantasyPoints: number;
  teamsPlayedFor: string[]; // Array of team names
  
  createdAt: Date;
  updatedAt: Date;
}

export interface IVenue extends Document {
  _id: string;
  apiId: string; // External API venue ID
  name: string;
  city: string;
  country: string;
  capacity?: number;
  pitchType?: string; // Batting-friendly, Bowling-friendly, Balanced
  characteristics: string[]; // Pace, Spin, High-scoring, etc.
  timezone: string;
  altitude?: number;
  createdAt: Date;
}

export interface IMatch extends Document {
  _id: string;
  apiId: string; // External API match ID
  cricApiId?: string; // CricAPI match ID
  matchType: 'Test' | 'ODI' | 'T20' | 'T10';
  status: 'upcoming' | 'live' | 'completed' | 'cancelled' | 'abandoned';
  scheduledAt: Date;
  startedAt?: Date;
  completedAt?: Date;
  
  // Teams
  team1Id: mongoose.Types.ObjectId;
  team2Id: mongoose.Types.ObjectId;
  venueId?: mongoose.Types.ObjectId;
  
  // Match Details
  series?: string;
  seriesId?: string; // CricAPI series ID
  matchNumber?: number;
  season?: string;
  name?: string; // CricAPI match name
  venue?: string; // CricAPI venue name
  date?: string; // CricAPI date
  dateTimeGMT?: string; // CricAPI GMT time
  teams?: string[]; // CricAPI team names
  fantasyEnabled?: boolean; // CricAPI field
  bbbEnabled?: boolean; // CricAPI field
  hasSquad?: boolean; // CricAPI field
  matchStarted?: boolean; // CricAPI field
  matchEnded?: boolean; // CricAPI field
  
  // Results
  team1Score?: {
    innings1: { runs: number; wickets: number; overs: number; };
    innings2?: { runs: number; wickets: number; overs: number; };
  };
  team2Score?: {
    innings1: { runs: number; wickets: number; overs: number; };
    innings2?: { runs: number; wickets: number; overs: number; };
  };
  
  result?: string; // Team A won by 7 wickets
  winnerId?: mongoose.Types.ObjectId;
  
  // Live match data
  currentInnings?: number;
  currentOver?: number;
  currentBall?: number;
  striker?: mongoose.Types.ObjectId; // Player ID
  nonStriker?: mongoose.Types.ObjectId; // Player ID
  bowler?: mongoose.Types.ObjectId; // Player ID
  
  // Weather and conditions
  weather?: string;
  pitchReport?: string;
  tossWinner?: mongoose.Types.ObjectId;
  tossDecision?: 'bat' | 'bowl';
  
  createdAt: Date;
  updatedAt: Date;
}

export interface IBallByBall extends Document {
  _id: string;
  matchId: mongoose.Types.ObjectId;
  innings: number;
  over: number;
  ball: number;
  striker: mongoose.Types.ObjectId; // Player ID
  nonStriker: mongoose.Types.ObjectId; // Player ID
  bowler: mongoose.Types.ObjectId; // Player ID
  
  // Ball details
  runs: number;
  extras: {
    wide: boolean;
    noBall: boolean;
    bye: number;
    legBye: number;
    penalty: number;
  };
  
  // Events
  isWicket: boolean;
  wicketType?: 'bowled' | 'caught' | 'lbw' | 'run out' | 'stumped' | 'hit wicket';
  fielder?: mongoose.Types.ObjectId; // Player ID for catches/run outs
  
  // Commentary
  commentary?: string;
  
  createdAt: Date;
}

export interface IFantasyPoints extends Document {
  _id: string;
  matchId: mongoose.Types.ObjectId;
  playerId: mongoose.Types.ObjectId;
  
  // Batting points
  runs: number; // 1 point per run
  fours: number; // 2 points per four
  sixes: number; // 4 points per six
  thirtyBonus: number; // 10 points for 30+ runs
  fiftyBonus: number; // 20 points for 50+ runs
  hundredBonus: number; // 40 points for 100+ runs
  
  // Bowling points
  wickets: number; // 25 points per wicket
  maidens: number; // 5 points per maiden
  threeWicketBonus: number; // 10 points for 3+ wickets
  fiveWicketBonus: number; // 20 points for 5+ wickets
  
  // Fielding points
  catches: number; // 10 points per catch
  stumps: number; // 12 points per stumping
  runOuts: number; // 12 points per run out
  
  // Penalty points
  duck: number; // -5 points for duck (batting)
  
  totalPoints: number;
  
  createdAt: Date;
}

export interface IPlayerPerformance extends Document {
  _id: string;
  playerId: mongoose.Types.ObjectId;
  matchId: mongoose.Types.ObjectId;
  
  // Batting performance
  batting: {
    runs: number;
    ballsFaced: number;
    fours: number;
    sixes: number;
    strikeRate: number;
    isOut: boolean;
    dismissalType?: string;
  };
  
  // Bowling performance
  bowling: {
    overs: number;
    maidens: number;
    runs: number;
    wickets: number;
    economy: number;
    dots: number;
  };
  
  // Fielding performance
  fielding: {
    catches: number;
    stumps: number;
    runOuts: number;
    misses: number;
  };
  
  createdAt: Date;
}

export interface IPlayerStats extends Document {
  _id: string;
  playerId: mongoose.Types.ObjectId;
  matchId?: mongoose.Types.ObjectId;
  season?: string;
  matches: number;
  runs: number;
  wickets: number;
  average: number;
  strikeRate: number;
  economy: number;
  fifties: number;
  hundreds: number;
  catches: number;
  stumps: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IPrediction extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  matchId: mongoose.Types.ObjectId;
  predictedWinnerId: mongoose.Types.ObjectId;
  confidence?: number;
  points: number;
  isCorrect?: boolean;
  predictionData?: any;
  createdAt: Date;
}

export interface IUserFavorite extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  playerId?: mongoose.Types.ObjectId;
  teamId?: mongoose.Types.ObjectId;
  createdAt: Date;
}

export interface ISavedAnalysis extends Document {
  _id: string;
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  analysisType: string;
  analysisData: any;
  matchId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IApiCache extends Document {
  _id: string;
  cacheKey: string;
  data: any;
  expiresAt: Date;
  createdAt: Date;
}

// MongoDB Schemas
const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['coach', 'analyst', 'fan'], default: 'fan' },
  profileImage: String,
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLoginAt: Date,
}, { timestamps: true });

const TeamSchema = new Schema<ITeam>({
  apiId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  shortName: { type: String, required: true },
  country: { type: String, required: true },
  logo: String,
  squad: [{ type: Schema.Types.ObjectId, ref: 'Player' }],
  coach: String,
  captain: { type: Schema.Types.ObjectId, ref: 'Player' },
  ranking: Number,
  teamType: { type: String, enum: ['international', 'domestic', 'franchise'], default: 'international' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

const SeriesSchema = new Schema<ISeries>({
  cricApiId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  odi: { type: Number, default: 0 },
  t20: { type: Number, default: 0 },
  test: { type: Number, default: 0 },
  squads: { type: Number, default: 0 },
  matches: { type: Number, default: 0 },
}, { timestamps: true });

const CountrySchema = new Schema<ICountry>({
  cricApiId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
}, { timestamps: true });

const PlayerSchema = new Schema<IPlayer>({
  apiId: { type: String, required: true, unique: true },
  cricApiId: { type: String, unique: true, sparse: true },
  name: { type: String, required: true },
  age: Number,
  nationality: { type: String, required: true },
  country: String,
  teamId: { type: Schema.Types.ObjectId, ref: 'Team' },
  role: { type: String, required: true },
  battingStyle: String,
  bowlingStyle: String,
  image: String,
  dateOfBirth: Schema.Types.Mixed, // Can be Date or String
  placeOfBirth: String,
  isInjured: { type: Boolean, default: false },
  form: { type: String, enum: ['excellent', 'good', 'average', 'poor'], default: 'average' },
  
  stats: {
    matches: { type: Number, default: 0 },
    runs: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    batting: {
      average: { type: Number, default: 0 },
      strikeRate: { type: Number, default: 0 },
      fifties: { type: Number, default: 0 },
      hundreds: { type: Number, default: 0 },
      highestScore: { type: Number, default: 0 },
    },
    bowling: {
      average: { type: Number, default: 0 },
      economy: { type: Number, default: 0 },
      strikeRate: { type: Number, default: 0 },
      bestFigures: { type: String, default: '0/0' },
      fiveWickets: { type: Number, default: 0 },
    },
    fielding: {
      catches: { type: Number, default: 0 },
      stumps: { type: Number, default: 0 },
      runOuts: { type: Number, default: 0 },
    },
  },
  
  fantasyPoints: { type: Number, default: 0 },
  teamsPlayedFor: [String],
}, { timestamps: true });

const VenueSchema = new Schema<IVenue>({
  apiId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  capacity: Number,
  pitchType: String,
  characteristics: [String],
  timezone: { type: String, required: true },
  altitude: Number,
}, { timestamps: true });

const MatchSchema = new Schema<IMatch>({
  apiId: { type: String, required: true, unique: true },
  cricApiId: { type: String, unique: true, sparse: true },
  matchType: { type: String, enum: ['Test', 'ODI', 'T20', 'T10'], required: true },
  status: { type: String, enum: ['upcoming', 'live', 'completed', 'cancelled', 'abandoned'], default: 'upcoming' },
  scheduledAt: { type: Date, required: true },
  startedAt: Date,
  completedAt: Date,
  
  team1Id: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  team2Id: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  venueId: { type: Schema.Types.ObjectId, ref: 'Venue' },
  
  series: String,
  seriesId: String,
  matchNumber: Number,
  season: String,
  name: String,
  venue: String,
  date: String,
  dateTimeGMT: String,
  teams: [String],
  fantasyEnabled: { type: Boolean, default: false },
  bbbEnabled: { type: Boolean, default: false },
  hasSquad: { type: Boolean, default: false },
  matchStarted: { type: Boolean, default: false },
  matchEnded: { type: Boolean, default: false },
  
  team1Score: {
    innings1: {
      runs: { type: Number, default: 0 },
      wickets: { type: Number, default: 0 },
      overs: { type: Number, default: 0 },
    },
    innings2: {
      runs: { type: Number, default: 0 },
      wickets: { type: Number, default: 0 },
      overs: { type: Number, default: 0 },
    },
  },
  team2Score: {
    innings1: {
      runs: { type: Number, default: 0 },
      wickets: { type: Number, default: 0 },
      overs: { type: Number, default: 0 },
    },
    innings2: {
      runs: { type: Number, default: 0 },
      wickets: { type: Number, default: 0 },
      overs: { type: Number, default: 0 },
    },
  },
  
  result: String,
  winnerId: { type: Schema.Types.ObjectId, ref: 'Team' },
  
  currentInnings: Number,
  currentOver: Number,
  currentBall: Number,
  striker: { type: Schema.Types.ObjectId, ref: 'Player' },
  nonStriker: { type: Schema.Types.ObjectId, ref: 'Player' },
  bowler: { type: Schema.Types.ObjectId, ref: 'Player' },
  
  weather: String,
  pitchReport: String,
  tossWinner: { type: Schema.Types.ObjectId, ref: 'Team' },
  tossDecision: { type: String, enum: ['bat', 'bowl'] },
}, { timestamps: true });

const BallByBallSchema = new Schema<IBallByBall>({
  matchId: { type: Schema.Types.ObjectId, ref: 'Match', required: true },
  innings: { type: Number, required: true },
  over: { type: Number, required: true },
  ball: { type: Number, required: true },
  striker: { type: Schema.Types.ObjectId, ref: 'Player', required: true },
  nonStriker: { type: Schema.Types.ObjectId, ref: 'Player', required: true },
  bowler: { type: Schema.Types.ObjectId, ref: 'Player', required: true },
  
  runs: { type: Number, default: 0 },
  extras: {
    wide: { type: Boolean, default: false },
    noBall: { type: Boolean, default: false },
    bye: { type: Number, default: 0 },
    legBye: { type: Number, default: 0 },
    penalty: { type: Number, default: 0 },
  },
  
  isWicket: { type: Boolean, default: false },
  wicketType: { type: String, enum: ['bowled', 'caught', 'lbw', 'run out', 'stumped', 'hit wicket'] },
  fielder: { type: Schema.Types.ObjectId, ref: 'Player' },
  
  commentary: String,
}, { timestamps: true });

const FantasyPointsSchema = new Schema<IFantasyPoints>({
  matchId: { type: Schema.Types.ObjectId, ref: 'Match', required: true },
  playerId: { type: Schema.Types.ObjectId, ref: 'Player', required: true },
  
  runs: { type: Number, default: 0 },
  fours: { type: Number, default: 0 },
  sixes: { type: Number, default: 0 },
  thirtyBonus: { type: Number, default: 0 },
  fiftyBonus: { type: Number, default: 0 },
  hundredBonus: { type: Number, default: 0 },
  
  wickets: { type: Number, default: 0 },
  maidens: { type: Number, default: 0 },
  threeWicketBonus: { type: Number, default: 0 },
  fiveWicketBonus: { type: Number, default: 0 },
  
  catches: { type: Number, default: 0 },
  stumps: { type: Number, default: 0 },
  runOuts: { type: Number, default: 0 },
  
  duck: { type: Number, default: 0 },
  
  totalPoints: { type: Number, default: 0 },
}, { timestamps: true });

const PlayerPerformanceSchema = new Schema<IPlayerPerformance>({
  playerId: { type: Schema.Types.ObjectId, ref: 'Player', required: true },
  matchId: { type: Schema.Types.ObjectId, ref: 'Match', required: true },
  
  batting: {
    runs: { type: Number, default: 0 },
    ballsFaced: { type: Number, default: 0 },
    fours: { type: Number, default: 0 },
    sixes: { type: Number, default: 0 },
    strikeRate: { type: Number, default: 0 },
    isOut: { type: Boolean, default: false },
    dismissalType: String,
  },
  
  bowling: {
    overs: { type: Number, default: 0 },
    maidens: { type: Number, default: 0 },
    runs: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    economy: { type: Number, default: 0 },
    dots: { type: Number, default: 0 },
  },
  
  fielding: {
    catches: { type: Number, default: 0 },
    stumps: { type: Number, default: 0 },
    runOuts: { type: Number, default: 0 },
    misses: { type: Number, default: 0 },
  },
}, { timestamps: true });

// Add indexes for better performance
SeriesSchema.index({ cricApiId: 1 });
SeriesSchema.index({ name: 1 });
SeriesSchema.index({ startDate: 1 });

CountrySchema.index({ cricApiId: 1 });
CountrySchema.index({ name: 1 });

TeamSchema.index({ apiId: 1 });
TeamSchema.index({ name: 1 });
TeamSchema.index({ country: 1 });

PlayerSchema.index({ apiId: 1 });
PlayerSchema.index({ cricApiId: 1 });
PlayerSchema.index({ name: 1 });
PlayerSchema.index({ teamId: 1 });
PlayerSchema.index({ nationality: 1 });
PlayerSchema.index({ role: 1 });

VenueSchema.index({ apiId: 1 });
VenueSchema.index({ name: 1 });
VenueSchema.index({ country: 1 });

MatchSchema.index({ apiId: 1 });
MatchSchema.index({ cricApiId: 1 });
MatchSchema.index({ status: 1 });
MatchSchema.index({ matchType: 1 });
MatchSchema.index({ scheduledAt: 1 });
MatchSchema.index({ team1Id: 1, team2Id: 1 });

BallByBallSchema.index({ matchId: 1, innings: 1, over: 1, ball: 1 });

FantasyPointsSchema.index({ matchId: 1, playerId: 1 }, { unique: true });
FantasyPointsSchema.index({ playerId: 1 });

PlayerPerformanceSchema.index({ matchId: 1, playerId: 1 }, { unique: true });
PlayerPerformanceSchema.index({ playerId: 1 });

const PlayerStatsSchema = new Schema<IPlayerStats>({
  playerId: { type: Schema.Types.ObjectId, ref: 'Player', required: true },
  matchId: { type: Schema.Types.ObjectId, ref: 'Match' },
  season: String,
  matches: { type: Number, default: 0 },
  runs: { type: Number, default: 0 },
  wickets: { type: Number, default: 0 },
  average: { type: Number, default: 0 },
  strikeRate: { type: Number, default: 0 },
  economy: { type: Number, default: 0 },
  fifties: { type: Number, default: 0 },
  hundreds: { type: Number, default: 0 },
  catches: { type: Number, default: 0 },
  stumps: { type: Number, default: 0 },
}, { timestamps: true });

const PredictionSchema = new Schema<IPrediction>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  matchId: { type: Schema.Types.ObjectId, ref: 'Match', required: true },
  predictedWinnerId: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  confidence: Number,
  points: { type: Number, default: 0 },
  isCorrect: Boolean,
  predictionData: Schema.Types.Mixed,
}, { timestamps: true });

// Ensure unique user-match predictions
PredictionSchema.index({ userId: 1, matchId: 1 }, { unique: true });

const UserFavoriteSchema = new Schema<IUserFavorite>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  playerId: { type: Schema.Types.ObjectId, ref: 'Player' },
  teamId: { type: Schema.Types.ObjectId, ref: 'Team' },
}, { timestamps: true });

const SavedAnalysisSchema = new Schema<ISavedAnalysis>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  description: String,
  analysisType: { type: String, required: true },
  analysisData: { type: Schema.Types.Mixed, required: true },
  matchId: { type: Schema.Types.ObjectId, ref: 'Match' },
}, { timestamps: true });

const ApiCacheSchema = new Schema<IApiCache>({
  cacheKey: { type: String, required: true, unique: true },
  data: { type: Schema.Types.Mixed, required: true },
  expiresAt: { type: Date, required: true },
}, { timestamps: true });

// Models
export const Series = mongoose.model<ISeries>('Series', SeriesSchema);
export const Country = mongoose.model<ICountry>('Country', CountrySchema);
export const User = mongoose.model<IUser>('User', UserSchema);
export const Team = mongoose.model<ITeam>('Team', TeamSchema);
export const Player = mongoose.model<IPlayer>('Player', PlayerSchema);
export const Venue = mongoose.model<IVenue>('Venue', VenueSchema);
export const Match = mongoose.model<IMatch>('Match', MatchSchema);
export const BallByBall = mongoose.model<IBallByBall>('BallByBall', BallByBallSchema);
export const FantasyPoints = mongoose.model<IFantasyPoints>('FantasyPoints', FantasyPointsSchema);
export const PlayerPerformance = mongoose.model<IPlayerPerformance>('PlayerPerformance', PlayerPerformanceSchema);
export const PlayerStats = mongoose.model<IPlayerStats>('PlayerStats', PlayerStatsSchema);
export const Prediction = mongoose.model<IPrediction>('Prediction', PredictionSchema);
export const UserFavorite = mongoose.model<IUserFavorite>('UserFavorite', UserFavoriteSchema);
export const SavedAnalysis = mongoose.model<ISavedAnalysis>('SavedAnalysis', SavedAnalysisSchema);
export const ApiCache = mongoose.model<IApiCache>('ApiCache', ApiCacheSchema);

// Validation Schemas
export const insertUserSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: "Password must contain at least one uppercase letter, one lowercase letter, and one number"
  }),
  role: z.enum(['coach', 'analyst', 'fan']).default('fan'),
});

export const selectUserSchema = z.object({
  _id: z.string(),
  username: z.string(),
  email: z.string(),
  role: z.enum(['coach', 'analyst', 'fan']),
  profileImage: z.string().optional(),
  emailVerified: z.boolean(),
  lastLoginAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const insertTeamSchema = z.object({
  name: z.string(),
  shortName: z.string(),
  country: z.string(),
  logo: z.string().optional(),
});

export const insertPlayerSchema = z.object({
  name: z.string(),
  teamId: z.string().optional(),
  role: z.enum(['batsman', 'bowler', 'all-rounder', 'wicket-keeper']),
  battingStyle: z.string().optional(),
  bowlingStyle: z.string().optional(),
  image: z.string().optional(),
  dateOfBirth: z.date().optional(),
  nationality: z.string().optional(),
  isInjured: z.boolean().default(false),
  form: z.enum(['excellent', 'good', 'average', 'poor']).default('average'),
});

export const insertMatchSchema = z.object({
  team1Id: z.string(),
  team2Id: z.string(),
  venueId: z.string().optional(),
  format: z.enum(['T20', 'ODI', 'Test']),
  status: z.enum(['upcoming', 'live', 'completed', 'cancelled']).default('upcoming'),
  scheduledAt: z.date(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  team1Score: z.string().optional(),
  team2Score: z.string().optional(),
  result: z.string().optional(),
  winnerId: z.string().optional(),
  externalMatchId: z.string().optional(),
});

export const insertPredictionSchema = z.object({
  userId: z.string(),
  matchId: z.string(),
  predictedWinnerId: z.string(),
  confidence: z.number().optional(),
  predictionData: z.any().optional(),
});

export const insertSavedAnalysisSchema = z.object({
  userId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  analysisType: z.string(),
  analysisData: z.any(),
  matchId: z.string().optional(),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type PublicUser = z.infer<typeof selectUserSchema>;
export type InsertTeam = z.infer<typeof insertTeamSchema>;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;
export type InsertMatch = z.infer<typeof insertMatchSchema>;
export type InsertPrediction = z.infer<typeof insertPredictionSchema>;
export type InsertSavedAnalysis = z.infer<typeof insertSavedAnalysisSchema>;

// User role type for frontend
export type UserRole = 'coach' | 'analyst' | 'fan';
export type PlayerRole = 'batsman' | 'bowler' | 'all-rounder' | 'wicket-keeper';
export type MatchStatus = 'upcoming' | 'live' | 'completed' | 'cancelled';
export type MatchFormat = 'T20' | 'ODI' | 'Test';
export type PlayerForm = 'excellent' | 'good' | 'average' | 'poor';