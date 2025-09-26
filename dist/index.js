var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/analysisSchemas.ts
var analysisSchemas_exports = {};
__export(analysisSchemas_exports, {
  AnalysisService: () => AnalysisService,
  FavoritePlayer: () => FavoritePlayer,
  SavedAnalysis: () => SavedAnalysis2,
  UserActivity: () => UserActivity,
  UserPreferences: () => UserPreferences
});
import mongoose3, { Schema as Schema2 } from "mongoose";
var SavedAnalysisSchema2, FavoritePlayerSchema, UserActivitySchema, UserPreferencesSchema, SavedAnalysis2, FavoritePlayer, UserActivity, UserPreferences, AnalysisService;
var init_analysisSchemas = __esm({
  "server/analysisSchemas.ts"() {
    "use strict";
    SavedAnalysisSchema2 = new Schema2({
      userId: { type: String, required: true, index: true },
      title: { type: String, required: true, maxlength: 200 },
      description: { type: String, required: true, maxlength: 1e3 },
      analysisType: {
        type: String,
        required: true,
        enum: ["player_performance", "match_analysis", "team_comparison", "custom_report"]
      },
      analysisData: {
        playerId: { type: String },
        playerName: { type: String },
        matchId: { type: String },
        teamIds: [{ type: String }],
        format: {
          type: String,
          enum: ["T20", "ODI", "Test", "all"],
          default: "all"
        },
        analysisDate: { type: String, required: true },
        stats: { type: Schema2.Types.Mixed },
        insights: [{ type: String }],
        recommendation: { type: String },
        charts: [{
          type: { type: String },
          title: { type: String },
          data: { type: Schema2.Types.Mixed }
        }],
        customData: { type: Schema2.Types.Mixed }
      },
      tags: [{ type: String, maxlength: 50 }],
      isPublic: { type: Boolean, default: false }
    }, {
      timestamps: true
    });
    SavedAnalysisSchema2.index({ userId: 1, createdAt: -1 });
    SavedAnalysisSchema2.index({ userId: 1, analysisType: 1 });
    SavedAnalysisSchema2.index({ tags: 1 });
    SavedAnalysisSchema2.index({ isPublic: 1, createdAt: -1 });
    FavoritePlayerSchema = new Schema2({
      userId: { type: String, required: true, index: true },
      playerId: { type: String, required: true },
      playerName: { type: String, required: true, maxlength: 100 },
      playerRole: {
        type: String,
        required: true,
        enum: ["batsman", "bowler", "all-rounder", "wicket-keeper"]
      },
      nationality: { type: String, required: true, maxlength: 50 },
      teamName: { type: String, maxlength: 100 },
      notes: { type: String, maxlength: 500 },
      tags: [{ type: String, maxlength: 30 }]
    }, {
      timestamps: true
    });
    FavoritePlayerSchema.index({ userId: 1, playerId: 1 }, { unique: true });
    UserActivitySchema = new Schema2({
      userId: { type: String, required: true, index: true },
      activityType: {
        type: String,
        required: true,
        enum: ["view_player", "save_analysis", "favorite_player", "search_player", "export_report"]
      },
      activityData: {
        playerId: { type: String },
        playerName: { type: String },
        analysisId: { type: String },
        searchQuery: { type: String },
        metadata: { type: Schema2.Types.Mixed }
      },
      timestamp: { type: Date, default: Date.now, index: true }
    });
    UserActivitySchema.index({ timestamp: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });
    UserPreferencesSchema = new Schema2({
      userId: { type: String, required: true, unique: true, index: true },
      preferences: {
        defaultFormat: {
          type: String,
          enum: ["T20", "ODI", "Test", "all"],
          default: "all"
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
    SavedAnalysis2 = mongoose3.model("SavedAnalysis", SavedAnalysisSchema2);
    FavoritePlayer = mongoose3.model("FavoritePlayer", FavoritePlayerSchema);
    UserActivity = mongoose3.model("UserActivity", UserActivitySchema);
    UserPreferences = mongoose3.model("UserPreferences", UserPreferencesSchema);
    AnalysisService = class {
      static async getUserAnalyses(userId, type, limit = 20) {
        const query = { userId };
        if (type && type !== "all") {
          query.analysisType = type;
        }
        return await SavedAnalysis2.find(query).sort({ createdAt: -1 }).limit(limit).lean();
      }
      static async saveUserAnalysis(userId, analysisData) {
        const analysis = new SavedAnalysis2({
          ...analysisData,
          userId
        });
        return await analysis.save();
      }
      static async getFavoriteplayers(userId) {
        return await FavoritePlayer.find({ userId }).sort({ createdAt: -1 }).lean();
      }
      static async addFavoritePlayer(userId, playerData) {
        try {
          const favorite = new FavoritePlayer({
            ...playerData,
            userId
          });
          return await favorite.save();
        } catch (error) {
          if (error.code === 11e3) {
            throw new Error("Player already in favorites");
          }
          throw error;
        }
      }
      static async removeFavoritePlayer(userId, playerId) {
        return await FavoritePlayer.deleteOne({ userId, playerId });
      }
      static async logUserActivity(userId, activityType, activityData) {
        const activity = new UserActivity({
          userId,
          activityType,
          activityData,
          timestamp: /* @__PURE__ */ new Date()
        });
        activity.save().catch((error) => {
          console.error("Failed to log user activity:", error);
        });
      }
      static async getUserPreferences(userId) {
        const preferences = await UserPreferences.findOne({ userId }).lean();
        if (!preferences) {
          const defaultPrefs = new UserPreferences({
            userId,
            preferences: {
              defaultFormat: "all",
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
      static async updateUserPreferences(userId, preferences) {
        return await UserPreferences.findOneAndUpdate(
          { userId },
          { $set: { preferences } },
          { new: true, upsert: true }
        );
      }
    };
  }
});

// client/src/lib/mockPlayers.ts
var mockPlayers_exports = {};
__export(mockPlayers_exports, {
  getAllPlayers: () => getAllPlayers,
  getPlayerById: () => getPlayerById,
  mockPlayers: () => mockPlayers,
  searchPlayers: () => searchPlayers
});
var mockPlayers, searchPlayers, getPlayerById, getAllPlayers;
var init_mockPlayers = __esm({
  "client/src/lib/mockPlayers.ts"() {
    "use strict";
    mockPlayers = [
      {
        _id: "virat_kohli_001",
        name: "Virat Kohli",
        role: "batsman",
        nationality: "India",
        image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
        teamId: {
          name: "Royal Challengers Bangalore",
          shortName: "RCB",
          logo: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=50&h=50&fit=crop"
        },
        age: 35,
        battingStyle: "Right-handed",
        bowlingStyle: "Right-arm medium",
        form: "excellent",
        isInjured: false,
        isCaptain: false,
        stats: {
          test: {
            matches: 111,
            runs: 8848,
            average: 49.15,
            strikeRate: 57.83,
            fifties: 29,
            hundreds: 29,
            catches: 115
          },
          odi: {
            matches: 274,
            runs: 12898,
            average: 57.32,
            strikeRate: 93.17,
            fifties: 65,
            hundreds: 46,
            catches: 148
          },
          t20: {
            matches: 115,
            runs: 4008,
            average: 52.73,
            strikeRate: 137.96,
            fifties: 37,
            hundreds: 1,
            catches: 90
          }
        },
        recentForm: [
          { match: "vs AUS", performance: 89, date: "2024-01-15" },
          { match: "vs ENG", performance: 112, date: "2024-01-10" },
          { match: "vs SA", performance: 67, date: "2024-01-05" },
          { match: "vs NZ", performance: 45, date: "2024-01-01" },
          { match: "vs WI", performance: 23, date: "2023-12-28" }
        ],
        strengths: ["Chase master", "Strong against pace", "Excellent timing", "Pressure performer"],
        weaknesses: ["Struggles against left-arm spin", "Inconsistent in England conditions"]
      },
      {
        _id: "rohit_sharma_002",
        name: "Rohit Sharma",
        role: "batsman",
        nationality: "India",
        image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        teamId: {
          name: "Mumbai Indians",
          shortName: "MI",
          logo: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=50&h=50&fit=crop"
        },
        age: 37,
        battingStyle: "Right-handed",
        bowlingStyle: "Right-arm off-break",
        form: "good",
        isInjured: false,
        isCaptain: true,
        stats: {
          test: {
            matches: 56,
            runs: 3137,
            average: 46.54,
            strikeRate: 56.93,
            fifties: 15,
            hundreds: 11,
            catches: 67
          },
          odi: {
            matches: 243,
            runs: 9825,
            average: 48.63,
            strikeRate: 88.9,
            fifties: 43,
            hundreds: 30,
            catches: 132
          },
          t20: {
            matches: 148,
            runs: 3853,
            average: 32.62,
            strikeRate: 140.38,
            fifties: 29,
            hundreds: 4,
            catches: 65
          }
        },
        recentForm: [
          { match: "vs AUS", performance: 67, date: "2024-01-15" },
          { match: "vs ENG", performance: 87, date: "2024-01-10" },
          { match: "vs SA", performance: 34, date: "2024-01-05" },
          { match: "vs NZ", performance: 112, date: "2024-01-01" },
          { match: "vs WI", performance: 78, date: "2023-12-28" }
        ],
        strengths: ["Excellent opener", "Strong pull shot", "Big match player", "Great captain"],
        weaknesses: ["Slow starter in Tests", "Vulnerable early in innings"]
      },
      {
        _id: "jasprit_bumrah_003",
        name: "Jasprit Bumrah",
        role: "bowler",
        nationality: "India",
        image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
        teamId: {
          name: "Mumbai Indians",
          shortName: "MI",
          logo: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=50&h=50&fit=crop"
        },
        age: 30,
        battingStyle: "Right-handed",
        bowlingStyle: "Right-arm fast",
        form: "excellent",
        isInjured: false,
        isCaptain: false,
        stats: {
          test: {
            matches: 34,
            wickets: 159,
            average: 20.69,
            economy: 2.75,
            catches: 8
          },
          odi: {
            matches: 89,
            wickets: 145,
            average: 24.62,
            economy: 4.63,
            catches: 15
          },
          t20: {
            matches: 70,
            wickets: 89,
            average: 20.22,
            economy: 6.62,
            catches: 12
          }
        },
        recentForm: [
          { match: "vs AUS", performance: 92, date: "2024-01-15" },
          { match: "vs ENG", performance: 78, date: "2024-01-10" },
          { match: "vs SA", performance: 89, date: "2024-01-05" },
          { match: "vs NZ", performance: 67, date: "2024-01-01" },
          { match: "vs WI", performance: 95, date: "2023-12-28" }
        ],
        strengths: ["Yorker specialist", "Death bowling expert", "Unique action", "Accurate line and length"],
        weaknesses: ["Injury prone", "Limited variations"]
      },
      {
        _id: "kl_rahul_004",
        name: "KL Rahul",
        role: "wicket-keeper",
        nationality: "India",
        image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        teamId: {
          name: "Lucknow Super Giants",
          shortName: "LSG",
          logo: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=50&h=50&fit=crop"
        },
        age: 32,
        battingStyle: "Right-handed",
        bowlingStyle: "Right-arm off-break",
        form: "good",
        isInjured: false,
        isCaptain: true,
        stats: {
          test: {
            matches: 47,
            runs: 2321,
            average: 34.61,
            strikeRate: 55.71,
            fifties: 13,
            hundreds: 7,
            catches: 89
          },
          odi: {
            matches: 49,
            runs: 1922,
            average: 45.76,
            strikeRate: 86.9,
            fifties: 13,
            hundreds: 6,
            catches: 45
          },
          t20: {
            matches: 64,
            runs: 2265,
            average: 37.75,
            strikeRate: 139.33,
            fifties: 18,
            hundreds: 2,
            catches: 78
          }
        },
        recentForm: [
          { match: "vs AUS", performance: 78, date: "2024-01-15" },
          { match: "vs ENG", performance: 56, date: "2024-01-10" },
          { match: "vs SA", performance: 89, date: "2024-01-05" },
          { match: "vs NZ", performance: 34, date: "2024-01-01" },
          { match: "vs WI", performance: 67, date: "2023-12-28" }
        ],
        strengths: ["Versatile batsman", "Good keeper", "Elegant stroke play", "Adaptable"],
        weaknesses: ["Inconsistent in longer formats", "Pressure handling"]
      },
      {
        _id: "hardik_pandya_005",
        name: "Hardik Pandya",
        role: "all-rounder",
        nationality: "India",
        image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
        teamId: {
          name: "Mumbai Indians",
          shortName: "MI",
          logo: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=50&h=50&fit=crop"
        },
        age: 30,
        battingStyle: "Right-handed",
        bowlingStyle: "Right-arm fast-medium",
        form: "excellent",
        isInjured: false,
        isCaptain: false,
        stats: {
          test: {
            matches: 11,
            runs: 532,
            wickets: 17,
            average: 31.05,
            strikeRate: 70.27,
            economy: 3.9,
            catches: 11
          },
          odi: {
            matches: 74,
            runs: 1769,
            wickets: 79,
            average: 33.67,
            strikeRate: 113.44,
            economy: 5.34,
            catches: 45
          },
          t20: {
            matches: 98,
            runs: 1810,
            wickets: 42,
            average: 22.63,
            strikeRate: 144.78,
            economy: 7.65,
            catches: 67
          }
        },
        recentForm: [
          { match: "vs AUS", performance: 85, date: "2024-01-15" },
          { match: "vs ENG", performance: 92, date: "2024-01-10" },
          { match: "vs SA", performance: 78, date: "2024-01-05" },
          { match: "vs NZ", performance: 56, date: "2024-01-01" },
          { match: "vs WI", performance: 89, date: "2023-12-28" }
        ],
        strengths: ["Power hitter", "Useful medium pace", "Athletic fielder", "Match finisher"],
        weaknesses: ["Injury concerns", "Inconsistent bowling line"]
      },
      {
        _id: "ravindra_jadeja_006",
        name: "Ravindra Jadeja",
        role: "all-rounder",
        nationality: "India",
        image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=face",
        teamId: {
          name: "Chennai Super Kings",
          shortName: "CSK",
          logo: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=50&h=50&fit=crop"
        },
        age: 35,
        battingStyle: "Left-handed",
        bowlingStyle: "Left-arm orthodox",
        form: "excellent",
        isInjured: false,
        isCaptain: false,
        stats: {
          test: {
            matches: 71,
            runs: 2804,
            wickets: 294,
            average: 35.26,
            strikeRate: 57.24,
            economy: 2.39,
            catches: 89
          },
          odi: {
            matches: 174,
            runs: 2756,
            wickets: 220,
            average: 32.95,
            strikeRate: 85.69,
            economy: 4.92,
            catches: 112
          },
          t20: {
            matches: 74,
            runs: 515,
            wickets: 54,
            average: 23.41,
            strikeRate: 127.16,
            economy: 7.13,
            catches: 56
          }
        },
        recentForm: [
          { match: "vs AUS", performance: 78, date: "2024-01-15" },
          { match: "vs ENG", performance: 89, date: "2024-01-10" },
          { match: "vs SA", performance: 67, date: "2024-01-05" },
          { match: "vs NZ", performance: 92, date: "2024-01-01" },
          { match: "vs WI", performance: 85, date: "2023-12-28" }
        ],
        strengths: ["Excellent fielder", "Reliable spinner", "Handy lower-order batsman", "Match winner"],
        weaknesses: ["Limited against quality pace", "Predictable bowling at times"]
      },
      {
        _id: "mohammed_shami_007",
        name: "Mohammed Shami",
        role: "bowler",
        nationality: "India",
        image: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=150&h=150&fit=crop&crop=face",
        teamId: {
          name: "Gujarat Titans",
          shortName: "GT",
          logo: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=50&h=50&fit=crop"
        },
        age: 34,
        battingStyle: "Right-handed",
        bowlingStyle: "Right-arm fast",
        form: "excellent",
        isInjured: false,
        isCaptain: false,
        stats: {
          test: {
            matches: 64,
            wickets: 229,
            average: 27.16,
            economy: 2.82,
            catches: 18
          },
          odi: {
            matches: 95,
            wickets: 195,
            average: 24.32,
            economy: 5.96,
            catches: 23
          },
          t20: {
            matches: 24,
            wickets: 24,
            average: 32.29,
            economy: 8.54,
            catches: 8
          }
        },
        recentForm: [
          { match: "vs AUS", performance: 87, date: "2024-01-15" },
          { match: "vs ENG", performance: 92, date: "2024-01-10" },
          { match: "vs SA", performance: 78, date: "2024-01-05" },
          { match: "vs NZ", performance: 89, date: "2024-01-01" },
          { match: "vs WI", performance: 67, date: "2023-12-28" }
        ],
        strengths: ["Swing bowling expert", "Good reverse swing", "Experienced campaigner", "Big match performer"],
        weaknesses: ["Age factor", "Vulnerable to aggressive batting"]
      },
      {
        _id: "rishabh_pant_008",
        name: "Rishabh Pant",
        role: "wicket-keeper",
        nationality: "India",
        image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face",
        teamId: {
          name: "Delhi Capitals",
          shortName: "DC",
          logo: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=50&h=50&fit=crop"
        },
        age: 27,
        battingStyle: "Left-handed",
        bowlingStyle: "Right-arm off-break",
        form: "good",
        isInjured: false,
        isCaptain: false,
        stats: {
          test: {
            matches: 33,
            runs: 2271,
            average: 43.67,
            strikeRate: 73.58,
            fifties: 9,
            hundreds: 6,
            catches: 91
          },
          odi: {
            matches: 30,
            runs: 865,
            average: 32.04,
            strikeRate: 106.54,
            fifties: 6,
            hundreds: 1,
            catches: 34
          },
          t20: {
            matches: 66,
            runs: 987,
            average: 22.88,
            strikeRate: 126.38,
            fifties: 3,
            hundreds: 0,
            catches: 78
          }
        },
        recentForm: [
          { match: "vs AUS", performance: 76, date: "2024-01-15" },
          { match: "vs ENG", performance: 89, date: "2024-01-10" },
          { match: "vs SA", performance: 45, date: "2024-01-05" },
          { match: "vs NZ", performance: 67, date: "2024-01-01" },
          { match: "vs WI", performance: 112, date: "2023-12-28" }
        ],
        strengths: ["Aggressive batting", "Counter-attacking style", "Good keeper", "Game changer"],
        weaknesses: ["Shot selection", "Consistency issues"]
      }
    ];
    searchPlayers = (query, filters) => {
      let filteredPlayers = mockPlayers;
      if (query) {
        const searchTerm = query.toLowerCase();
        filteredPlayers = filteredPlayers.filter(
          (player) => player.name.toLowerCase().includes(searchTerm) || player.nationality.toLowerCase().includes(searchTerm) || player.teamId.name.toLowerCase().includes(searchTerm) || player.teamId.shortName.toLowerCase().includes(searchTerm)
        );
      }
      if (filters) {
        if (filters.role && filters.role !== "all") {
          filteredPlayers = filteredPlayers.filter((player) => player.role === filters.role);
        }
        if (filters.form && filters.form !== "all") {
          filteredPlayers = filteredPlayers.filter((player) => player.form === filters.form);
        }
        if (filters.nationality && filters.nationality !== "all") {
          filteredPlayers = filteredPlayers.filter((player) => player.nationality === filters.nationality);
        }
        if (filters.team && filters.team !== "all") {
          filteredPlayers = filteredPlayers.filter(
            (player) => player.teamId.name.toLowerCase().includes(filters.team.toLowerCase()) || player.teamId.shortName.toLowerCase().includes(filters.team.toLowerCase())
          );
        }
      }
      return filteredPlayers;
    };
    getPlayerById = (id) => {
      return mockPlayers.find((player) => player._id === id);
    };
    getAllPlayers = () => {
      return mockPlayers;
    };
  }
});

// server/index.ts
import "dotenv/config";
import express2 from "express";

// server/routes.ts
import { createServer } from "http";

// shared/mongodb-schema.ts
import mongoose, { Schema } from "mongoose";
import { z } from "zod";
var UserSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["coach", "analyst", "fan"], default: "fan" },
  profileImage: String,
  emailVerified: { type: Boolean, default: false },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  lastLoginAt: Date
}, { timestamps: true });
var TeamSchema = new Schema({
  apiId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  shortName: { type: String, required: true },
  country: { type: String, required: true },
  logo: String,
  squad: [{ type: Schema.Types.ObjectId, ref: "Player" }],
  coach: String,
  captain: { type: Schema.Types.ObjectId, ref: "Player" },
  ranking: Number,
  teamType: { type: String, enum: ["international", "domestic", "franchise"], default: "international" },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
var SeriesSchema = new Schema({
  cricApiId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  odi: { type: Number, default: 0 },
  t20: { type: Number, default: 0 },
  test: { type: Number, default: 0 },
  squads: { type: Number, default: 0 },
  matches: { type: Number, default: 0 }
}, { timestamps: true });
var CountrySchema = new Schema({
  cricApiId: { type: String, required: true, unique: true },
  name: { type: String, required: true }
}, { timestamps: true });
var PlayerSchema = new Schema({
  apiId: { type: String, required: true, unique: true },
  cricApiId: { type: String, unique: true, sparse: true },
  name: { type: String, required: true },
  age: Number,
  nationality: { type: String, required: true },
  country: String,
  teamId: { type: Schema.Types.ObjectId, ref: "Team" },
  role: { type: String, required: true },
  battingStyle: String,
  bowlingStyle: String,
  image: String,
  dateOfBirth: Schema.Types.Mixed,
  // Can be Date or String
  placeOfBirth: String,
  isInjured: { type: Boolean, default: false },
  form: { type: String, enum: ["excellent", "good", "average", "poor"], default: "average" },
  stats: {
    matches: { type: Number, default: 0 },
    runs: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    batting: {
      average: { type: Number, default: 0 },
      strikeRate: { type: Number, default: 0 },
      fifties: { type: Number, default: 0 },
      hundreds: { type: Number, default: 0 },
      highestScore: { type: Number, default: 0 }
    },
    bowling: {
      average: { type: Number, default: 0 },
      economy: { type: Number, default: 0 },
      strikeRate: { type: Number, default: 0 },
      bestFigures: { type: String, default: "0/0" },
      fiveWickets: { type: Number, default: 0 }
    },
    fielding: {
      catches: { type: Number, default: 0 },
      stumps: { type: Number, default: 0 },
      runOuts: { type: Number, default: 0 }
    }
  },
  fantasyPoints: { type: Number, default: 0 },
  teamsPlayedFor: [String]
}, { timestamps: true });
var VenueSchema = new Schema({
  apiId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  city: { type: String, required: true },
  country: { type: String, required: true },
  capacity: Number,
  pitchType: String,
  characteristics: [String],
  timezone: { type: String, required: true },
  altitude: Number
}, { timestamps: true });
var MatchSchema = new Schema({
  apiId: { type: String, required: true, unique: true },
  cricApiId: { type: String, unique: true, sparse: true },
  matchType: { type: String, enum: ["Test", "ODI", "T20", "T10"], required: true },
  status: { type: String, enum: ["upcoming", "live", "completed", "cancelled", "abandoned"], default: "upcoming" },
  scheduledAt: { type: Date, required: true },
  startedAt: Date,
  completedAt: Date,
  team1Id: { type: Schema.Types.ObjectId, ref: "Team", required: true },
  team2Id: { type: Schema.Types.ObjectId, ref: "Team", required: true },
  venueId: { type: Schema.Types.ObjectId, ref: "Venue" },
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
      overs: { type: Number, default: 0 }
    },
    innings2: {
      runs: { type: Number, default: 0 },
      wickets: { type: Number, default: 0 },
      overs: { type: Number, default: 0 }
    }
  },
  team2Score: {
    innings1: {
      runs: { type: Number, default: 0 },
      wickets: { type: Number, default: 0 },
      overs: { type: Number, default: 0 }
    },
    innings2: {
      runs: { type: Number, default: 0 },
      wickets: { type: Number, default: 0 },
      overs: { type: Number, default: 0 }
    }
  },
  result: String,
  winnerId: { type: Schema.Types.ObjectId, ref: "Team" },
  currentInnings: Number,
  currentOver: Number,
  currentBall: Number,
  striker: { type: Schema.Types.ObjectId, ref: "Player" },
  nonStriker: { type: Schema.Types.ObjectId, ref: "Player" },
  bowler: { type: Schema.Types.ObjectId, ref: "Player" },
  weather: String,
  pitchReport: String,
  tossWinner: { type: Schema.Types.ObjectId, ref: "Team" },
  tossDecision: { type: String, enum: ["bat", "bowl"] }
}, { timestamps: true });
var BallByBallSchema = new Schema({
  matchId: { type: Schema.Types.ObjectId, ref: "Match", required: true },
  innings: { type: Number, required: true },
  over: { type: Number, required: true },
  ball: { type: Number, required: true },
  striker: { type: Schema.Types.ObjectId, ref: "Player", required: true },
  nonStriker: { type: Schema.Types.ObjectId, ref: "Player", required: true },
  bowler: { type: Schema.Types.ObjectId, ref: "Player", required: true },
  runs: { type: Number, default: 0 },
  extras: {
    wide: { type: Boolean, default: false },
    noBall: { type: Boolean, default: false },
    bye: { type: Number, default: 0 },
    legBye: { type: Number, default: 0 },
    penalty: { type: Number, default: 0 }
  },
  isWicket: { type: Boolean, default: false },
  wicketType: { type: String, enum: ["bowled", "caught", "lbw", "run out", "stumped", "hit wicket"] },
  fielder: { type: Schema.Types.ObjectId, ref: "Player" },
  commentary: String
}, { timestamps: true });
var FantasyPointsSchema = new Schema({
  matchId: { type: Schema.Types.ObjectId, ref: "Match", required: true },
  playerId: { type: Schema.Types.ObjectId, ref: "Player", required: true },
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
  totalPoints: { type: Number, default: 0 }
}, { timestamps: true });
var PlayerPerformanceSchema = new Schema({
  playerId: { type: Schema.Types.ObjectId, ref: "Player", required: true },
  matchId: { type: Schema.Types.ObjectId, ref: "Match", required: true },
  batting: {
    runs: { type: Number, default: 0 },
    ballsFaced: { type: Number, default: 0 },
    fours: { type: Number, default: 0 },
    sixes: { type: Number, default: 0 },
    strikeRate: { type: Number, default: 0 },
    isOut: { type: Boolean, default: false },
    dismissalType: String
  },
  bowling: {
    overs: { type: Number, default: 0 },
    maidens: { type: Number, default: 0 },
    runs: { type: Number, default: 0 },
    wickets: { type: Number, default: 0 },
    economy: { type: Number, default: 0 },
    dots: { type: Number, default: 0 }
  },
  fielding: {
    catches: { type: Number, default: 0 },
    stumps: { type: Number, default: 0 },
    runOuts: { type: Number, default: 0 },
    misses: { type: Number, default: 0 }
  }
}, { timestamps: true });
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
var PlayerStatsSchema = new Schema({
  playerId: { type: Schema.Types.ObjectId, ref: "Player", required: true },
  matchId: { type: Schema.Types.ObjectId, ref: "Match" },
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
  stumps: { type: Number, default: 0 }
}, { timestamps: true });
var PredictionSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  matchId: { type: Schema.Types.ObjectId, ref: "Match", required: true },
  predictedWinnerId: { type: Schema.Types.ObjectId, ref: "Team", required: true },
  confidence: Number,
  points: { type: Number, default: 0 },
  isCorrect: Boolean,
  predictionData: Schema.Types.Mixed
}, { timestamps: true });
PredictionSchema.index({ userId: 1, matchId: 1 }, { unique: true });
var UserFavoriteSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  playerId: { type: Schema.Types.ObjectId, ref: "Player" },
  teamId: { type: Schema.Types.ObjectId, ref: "Team" }
}, { timestamps: true });
var SavedAnalysisSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
  title: { type: String, required: true },
  description: String,
  analysisType: { type: String, required: true },
  analysisData: { type: Schema.Types.Mixed, required: true },
  matchId: { type: Schema.Types.ObjectId, ref: "Match" }
}, { timestamps: true });
var ApiCacheSchema = new Schema({
  cacheKey: { type: String, required: true, unique: true },
  data: { type: Schema.Types.Mixed, required: true },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });
var Series2 = mongoose.model("Series", SeriesSchema);
var Country2 = mongoose.model("Country", CountrySchema);
var User = mongoose.model("User", UserSchema);
var Team = mongoose.model("Team", TeamSchema);
var Player = mongoose.model("Player", PlayerSchema);
var Venue = mongoose.model("Venue", VenueSchema);
var Match = mongoose.model("Match", MatchSchema);
var BallByBall = mongoose.model("BallByBall", BallByBallSchema);
var FantasyPoints = mongoose.model("FantasyPoints", FantasyPointsSchema);
var PlayerPerformance = mongoose.model("PlayerPerformance", PlayerPerformanceSchema);
var PlayerStats = mongoose.model("PlayerStats", PlayerStatsSchema);
var Prediction = mongoose.model("Prediction", PredictionSchema);
var UserFavorite = mongoose.model("UserFavorite", UserFavoriteSchema);
var SavedAnalysis = mongoose.model("SavedAnalysis", SavedAnalysisSchema);
var ApiCache = mongoose.model("ApiCache", ApiCacheSchema);
var insertUserSchema = z.object({
  username: z.string(),
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: "Password must contain at least one uppercase letter, one lowercase letter, and one number"
  }),
  role: z.enum(["coach", "analyst", "fan"]).default("fan")
});
var selectUserSchema = z.object({
  _id: z.string(),
  username: z.string(),
  email: z.string(),
  role: z.enum(["coach", "analyst", "fan"]),
  profileImage: z.string().optional(),
  emailVerified: z.boolean(),
  lastLoginAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date()
});
var insertTeamSchema = z.object({
  name: z.string(),
  shortName: z.string(),
  country: z.string(),
  logo: z.string().optional()
});
var insertPlayerSchema = z.object({
  name: z.string(),
  teamId: z.string().optional(),
  role: z.enum(["batsman", "bowler", "all-rounder", "wicket-keeper"]),
  battingStyle: z.string().optional(),
  bowlingStyle: z.string().optional(),
  image: z.string().optional(),
  dateOfBirth: z.date().optional(),
  nationality: z.string().optional(),
  isInjured: z.boolean().default(false),
  form: z.enum(["excellent", "good", "average", "poor"]).default("average")
});
var insertMatchSchema = z.object({
  team1Id: z.string(),
  team2Id: z.string(),
  venueId: z.string().optional(),
  format: z.enum(["T20", "ODI", "Test"]),
  status: z.enum(["upcoming", "live", "completed", "cancelled"]).default("upcoming"),
  scheduledAt: z.date(),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  team1Score: z.string().optional(),
  team2Score: z.string().optional(),
  result: z.string().optional(),
  winnerId: z.string().optional(),
  externalMatchId: z.string().optional()
});
var insertPredictionSchema = z.object({
  userId: z.string(),
  matchId: z.string(),
  predictedWinnerId: z.string(),
  confidence: z.number().optional(),
  predictionData: z.any().optional()
});
var insertSavedAnalysisSchema = z.object({
  userId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  analysisType: z.string(),
  analysisData: z.any(),
  matchId: z.string().optional()
});

// server/storage.ts
import bcrypt from "bcrypt";
import mongoose2 from "mongoose";
var MongoDBStorage = class {
  // User methods
  async getUser(id) {
    return await User.findById(id);
  }
  async getUserByUsername(username) {
    return await User.findOne({ username });
  }
  async getUserByEmail(email) {
    return await User.findOne({ email });
  }
  async createUser(insertUser) {
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
      updatedAt: savedUser.updatedAt
    };
  }
  async verifyPassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
  async updateUserVerification(userId, isVerified) {
    await User.findByIdAndUpdate(userId, {
      emailVerified: isVerified,
      emailVerificationToken: void 0,
      emailVerificationExpires: void 0
    });
  }
  async setEmailVerificationToken(userId, token, expires) {
    await User.findByIdAndUpdate(userId, {
      emailVerificationToken: token,
      emailVerificationExpires: expires
    });
  }
  async getUserByVerificationToken(token) {
    return await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: /* @__PURE__ */ new Date() }
    });
  }
  async setPasswordResetToken(userId, token, expires) {
    await User.findByIdAndUpdate(userId, {
      passwordResetToken: token,
      passwordResetExpires: expires
    });
  }
  async getUserByPasswordResetToken(token) {
    return await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: /* @__PURE__ */ new Date() }
    });
  }
  async updatePassword(userId, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await User.findByIdAndUpdate(userId, {
      password: hashedPassword,
      passwordResetToken: void 0,
      passwordResetExpires: void 0
    });
  }
  async updateLastLogin(userId) {
    await User.findByIdAndUpdate(userId, { lastLoginAt: /* @__PURE__ */ new Date() });
  }
  // Team methods
  async getTeams() {
    return await Team.find().sort({ name: 1 });
  }
  async getTeam(id) {
    return await Team.findById(id);
  }
  async createTeam(team) {
    const newTeam = new Team(team);
    return await newTeam.save();
  }
  // Player methods
  async getPlayers(teamId) {
    const query = teamId ? { teamId: new mongoose2.Types.ObjectId(teamId) } : {};
    return await Player.find(query).populate("teamId");
  }
  async getPlayer(id) {
    return await Player.findById(id).populate("teamId");
  }
  async createPlayer(player) {
    const newPlayer = new Player({
      ...player,
      teamId: player.teamId ? new mongoose2.Types.ObjectId(player.teamId) : void 0
    });
    return await newPlayer.save();
  }
  async updatePlayerForm(playerId, form) {
    await Player.findByIdAndUpdate(playerId, { form });
  }
  // Match methods
  async getMatches(status) {
    const query = status ? { status } : {};
    return await Match.find(query).populate("team1Id").populate("team2Id").populate("venueId").populate("winnerId").sort({ scheduledAt: -1 });
  }
  async getMatch(id) {
    return await Match.findById(id).populate("team1Id").populate("team2Id").populate("venueId").populate("winnerId");
  }
  async createMatch(match) {
    const newMatch = new Match({
      ...match,
      team1Id: new mongoose2.Types.ObjectId(match.team1Id),
      team2Id: new mongoose2.Types.ObjectId(match.team2Id),
      venueId: match.venueId ? new mongoose2.Types.ObjectId(match.venueId) : void 0,
      winnerId: match.winnerId ? new mongoose2.Types.ObjectId(match.winnerId) : void 0
    });
    return await newMatch.save();
  }
  async updateMatchStatus(matchId, status, scores) {
    const updateData = { status };
    if (scores) {
      if (scores.team1Score) updateData.team1Score = scores.team1Score;
      if (scores.team2Score) updateData.team2Score = scores.team2Score;
      if (scores.result) updateData.result = scores.result;
      if (scores.winnerId) updateData.winnerId = new mongoose2.Types.ObjectId(scores.winnerId);
    }
    if (status === "live" && !updateData.startedAt) {
      updateData.startedAt = /* @__PURE__ */ new Date();
    }
    if (status === "completed" && !updateData.completedAt) {
      updateData.completedAt = /* @__PURE__ */ new Date();
    }
    await Match.findByIdAndUpdate(matchId, updateData);
  }
  // Player Stats methods
  async getPlayerStats(playerId, season) {
    const query = { playerId: new mongoose2.Types.ObjectId(playerId) };
    if (season) query.season = season;
    return await PlayerStats.find(query).populate("playerId").populate("matchId");
  }
  async createPlayerStats(stats) {
    const newStats = new PlayerStats({
      ...stats,
      playerId: new mongoose2.Types.ObjectId(stats.playerId),
      matchId: stats.matchId ? new mongoose2.Types.ObjectId(stats.matchId) : void 0
    });
    return await newStats.save();
  }
  // Prediction methods
  async getUserPredictions(userId) {
    return await Prediction.find({ userId: new mongoose2.Types.ObjectId(userId) }).populate("matchId").populate("predictedWinnerId").sort({ createdAt: -1 });
  }
  async createPrediction(prediction) {
    const newPrediction = new Prediction({
      ...prediction,
      userId: new mongoose2.Types.ObjectId(prediction.userId),
      matchId: new mongoose2.Types.ObjectId(prediction.matchId),
      predictedWinnerId: new mongoose2.Types.ObjectId(prediction.predictedWinnerId)
    });
    return await newPrediction.save();
  }
  async updatePredictionResult(predictionId, isCorrect, points) {
    await Prediction.findByIdAndUpdate(predictionId, { isCorrect, points });
  }
  // Favorites methods
  async getUserFavorites(userId) {
    return await UserFavorite.find({ userId: new mongoose2.Types.ObjectId(userId) }).populate("playerId").populate("teamId");
  }
  async addToFavorites(userId, playerId, teamId) {
    const favorite = new UserFavorite({
      userId: new mongoose2.Types.ObjectId(userId),
      playerId: playerId ? new mongoose2.Types.ObjectId(playerId) : void 0,
      teamId: teamId ? new mongoose2.Types.ObjectId(teamId) : void 0
    });
    return await favorite.save();
  }
  async removeFromFavorites(userId, playerId, teamId) {
    const query = { userId: new mongoose2.Types.ObjectId(userId) };
    if (playerId) query.playerId = new mongoose2.Types.ObjectId(playerId);
    if (teamId) query.teamId = new mongoose2.Types.ObjectId(teamId);
    await UserFavorite.deleteOne(query);
  }
  // Saved Analysis methods
  async getUserAnalyses(userId) {
    return await SavedAnalysis.find({ userId: new mongoose2.Types.ObjectId(userId) }).populate("matchId").sort({ createdAt: -1 });
  }
  async createSavedAnalysis(analysis) {
    const newAnalysis = new SavedAnalysis({
      ...analysis,
      userId: new mongoose2.Types.ObjectId(analysis.userId),
      matchId: analysis.matchId ? new mongoose2.Types.ObjectId(analysis.matchId) : void 0
    });
    return await newAnalysis.save();
  }
  // Cache methods
  async getCachedData(cacheKey) {
    const cached = await ApiCache.findOne({
      cacheKey,
      expiresAt: { $gt: /* @__PURE__ */ new Date() }
    });
    return cached ? cached.data : null;
  }
  async setCachedData(cacheKey, data, expiresInMinutes) {
    const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1e3);
    await ApiCache.findOneAndUpdate(
      { cacheKey },
      { data, expiresAt, cacheKey },
      { upsert: true, new: true }
    );
  }
};
var storage = new MongoDBStorage();

// server/cricketApi.ts
var CricketApiService = class {
  baseUrl = "https://api.cricapi.com/v1";
  // Example API
  apiKey = process.env.CRICKET_API_KEY || "demo_key";
  async makeRequest(endpoint) {
    try {
      const cacheKey = `cricket_api_${endpoint}`;
      const cachedData = await storage.getCachedData(cacheKey);
      if (cachedData) {
        console.log(`\u{1F4E6} Cache hit for ${endpoint}`);
        return cachedData;
      }
      console.log(`\u{1F310} Fetching data from external API: ${endpoint}`);
      const mockData = this.getMockData(endpoint);
      await storage.setCachedData(cacheKey, mockData, 15);
      return mockData;
    } catch (error) {
      console.error(`Error fetching from cricket API: ${endpoint}`, error);
      throw error;
    }
  }
  getMockData(endpoint) {
    if (endpoint.includes("/matches")) {
      return {
        data: [
          {
            id: "match_live_001",
            name: "India vs Australia, 1st T20I",
            status: "Live",
            venue: "Melbourne Cricket Ground, Melbourne",
            date: (/* @__PURE__ */ new Date()).toISOString(),
            teams: {
              home: {
                name: "India",
                score: { runs: 185, wickets: 4, overs: 18.2 }
              },
              away: {
                name: "Australia",
                score: { runs: 188, wickets: 6, overs: 19.5 }
              }
            },
            format: "T20"
          },
          {
            id: "match_upcoming_001",
            name: "England vs South Africa, 2nd ODI",
            status: "Upcoming",
            venue: "Lord's Cricket Ground, London",
            date: new Date(Date.now() + 24 * 60 * 60 * 1e3).toISOString(),
            teams: {
              home: { name: "England" },
              away: { name: "South Africa" }
            },
            format: "ODI"
          }
        ]
      };
    }
    if (endpoint.includes("/players")) {
      return {
        data: [
          {
            id: "player_001",
            name: "Virat Kohli",
            country: "India",
            role: "Batsman",
            batting_style: "Right-hand bat",
            stats: {
              batting: {
                matches: 254,
                runs: 12169,
                average: 57.32,
                strike_rate: 136.7,
                centuries: 43,
                half_centuries: 62
              }
            }
          }
        ]
      };
    }
    return { data: [] };
  }
  async getLiveMatches() {
    const response = await this.makeRequest("/matches?status=live");
    return response.data || [];
  }
  async getUpcomingMatches() {
    const response = await this.makeRequest("/matches?status=upcoming");
    return response.data || [];
  }
  async getRecentMatches() {
    const response = await this.makeRequest("/matches?status=completed");
    return response.data || [];
  }
  async getPlayerInfo(playerId) {
    try {
      const response = await this.makeRequest(`/players/${playerId}`);
      return response.data || null;
    } catch (error) {
      console.error(`Error fetching player ${playerId}:`, error);
      return null;
    }
  }
  async getTeamPlayers(teamName) {
    const response = await this.makeRequest(`/players?team=${teamName}`);
    return response.data || [];
  }
  async getPlayers(offset = 0, limit = 100) {
    try {
      const famousPlayers = [
        {
          id: "player_virat_kohli",
          name: "Virat Kohli",
          role: "batsman",
          country: "India",
          battingStyle: "Right-hand bat",
          bowlingStyle: "Right-arm medium",
          placeOfBirth: "Delhi, India",
          dateOfBirth: "1988-11-05",
          stats: {
            batting: { matches: 254, runs: 12169, average: 57.32, strike_rate: 93.17, centuries: 43, half_centuries: 64 },
            bowling: { matches: 254, wickets: 4, average: 166.25, economy: 6.15, best_figures: "1/15" }
          }
        },
        {
          id: "player_rohit_sharma",
          name: "Rohit Sharma",
          role: "batsman",
          country: "India",
          battingStyle: "Right-hand bat",
          bowlingStyle: "Right-arm off break",
          placeOfBirth: "Nagpur, India",
          dateOfBirth: "1987-04-30",
          stats: {
            batting: { matches: 243, runs: 9205, average: 48.19, strike_rate: 88.9, centuries: 29, half_centuries: 43 },
            bowling: { matches: 243, wickets: 8, average: 61.62, economy: 5.3, best_figures: "2/27" }
          }
        },
        {
          id: "player_ms_dhoni",
          name: "MS Dhoni",
          role: "wicket-keeper",
          country: "India",
          battingStyle: "Right-hand bat",
          bowlingStyle: "Right-arm medium",
          placeOfBirth: "Ranchi, India",
          dateOfBirth: "1981-07-07",
          stats: {
            batting: { matches: 350, runs: 10773, average: 50.57, strike_rate: 87.56, centuries: 10, half_centuries: 73 },
            bowling: { matches: 350, wickets: 1, average: 109, economy: 5.45, best_figures: "1/9" }
          }
        },
        {
          id: "player_hardik_pandya",
          name: "Hardik Pandya",
          role: "all-rounder",
          country: "India",
          battingStyle: "Right-hand bat",
          bowlingStyle: "Right-arm fast-medium",
          placeOfBirth: "Surat, India",
          dateOfBirth: "1993-10-11",
          stats: {
            batting: { matches: 74, runs: 1456, average: 32.35, strike_rate: 113.91, centuries: 0, half_centuries: 2 },
            bowling: { matches: 74, wickets: 76, average: 33.9, economy: 5.96, best_figures: "4/24" }
          }
        },
        {
          id: "player_jasprit_bumrah",
          name: "Jasprit Bumrah",
          role: "bowler",
          country: "India",
          battingStyle: "Right-hand bat",
          bowlingStyle: "Right-arm fast",
          placeOfBirth: "Ahmedabad, India",
          dateOfBirth: "1993-12-06",
          stats: {
            batting: { matches: 72, runs: 28, average: 9.33, strike_rate: 71.79, centuries: 0, half_centuries: 0 },
            bowling: { matches: 72, wickets: 121, average: 24.43, economy: 4.63, best_figures: "6/19" }
          }
        },
        {
          id: "player_ravindra_jadeja",
          name: "Ravindra Jadeja",
          role: "all-rounder",
          country: "India",
          battingStyle: "Left-hand bat",
          bowlingStyle: "Left-arm orthodox spin",
          placeOfBirth: "Navagam-Khed, India",
          dateOfBirth: "1988-12-06",
          stats: {
            batting: { matches: 174, runs: 2756, average: 32.74, strike_rate: 86.83, centuries: 0, half_centuries: 13 },
            bowling: { matches: 174, wickets: 220, average: 33.37, economy: 4.86, best_figures: "5/33" }
          }
        },
        {
          id: "player_kl_rahul",
          name: "KL Rahul",
          role: "wicket-keeper",
          country: "India",
          battingStyle: "Right-hand bat",
          bowlingStyle: "Right-arm off break",
          placeOfBirth: "Mangalore, India",
          dateOfBirth: "1992-04-18",
          stats: {
            batting: { matches: 46, runs: 2077, average: 45.15, strike_rate: 84.26, centuries: 6, half_centuries: 13 },
            bowling: { matches: 46, wickets: 0, average: 0, economy: 0, best_figures: "0/0" }
          }
        },
        {
          id: "player_babar_azam",
          name: "Babar Azam",
          role: "batsman",
          country: "Pakistan",
          battingStyle: "Right-hand bat",
          bowlingStyle: "Right-arm off break",
          placeOfBirth: "Lahore, Pakistan",
          dateOfBirth: "1994-10-15",
          stats: {
            batting: { matches: 102, runs: 4442, average: 56.95, strike_rate: 88.28, centuries: 17, half_centuries: 21 },
            bowling: { matches: 102, wickets: 0, average: 0, economy: 0, best_figures: "0/0" }
          }
        },
        {
          id: "player_joe_root",
          name: "Joe Root",
          role: "batsman",
          country: "England",
          battingStyle: "Right-hand bat",
          bowlingStyle: "Right-arm off break",
          placeOfBirth: "Sheffield, England",
          dateOfBirth: "1990-12-30",
          stats: {
            batting: { matches: 156, runs: 6109, average: 47.36, strike_rate: 86.58, centuries: 16, half_centuries: 35 },
            bowling: { matches: 156, wickets: 27, average: 41.4, economy: 4.71, best_figures: "2/6" }
          }
        },
        {
          id: "player_steve_smith",
          name: "Steve Smith",
          role: "batsman",
          country: "Australia",
          battingStyle: "Right-hand bat",
          bowlingStyle: "Right-arm leg break",
          placeOfBirth: "Sydney, Australia",
          dateOfBirth: "1989-06-02",
          stats: {
            batting: { matches: 138, runs: 4378, average: 43.34, strike_rate: 88.34, centuries: 12, half_centuries: 27 },
            bowling: { matches: 138, wickets: 28, average: 41.25, economy: 4.84, best_figures: "3/18" }
          }
        }
      ];
      const start = offset;
      const end = Math.min(start + limit, famousPlayers.length);
      const paginatedPlayers = famousPlayers.slice(start, end);
      return { data: paginatedPlayers };
    } catch (error) {
      console.error("Error fetching players:", error);
      return { data: [] };
    }
  }
  async getSeries() {
    try {
      const majorSeries = [
        {
          id: "series_ipl_2024",
          name: "Indian Premier League 2024",
          startDate: "2024-03-22",
          endDate: "2024-05-26",
          odi: 0,
          t20: 1,
          test: 0,
          squads: 10,
          matches: 74
        },
        {
          id: "series_wc_2023",
          name: "ICC Cricket World Cup 2023",
          startDate: "2023-10-05",
          endDate: "2023-11-19",
          odi: 1,
          t20: 0,
          test: 0,
          squads: 10,
          matches: 48
        },
        {
          id: "series_ind_vs_aus_2024",
          name: "India vs Australia Test Series 2024",
          startDate: "2024-02-09",
          endDate: "2024-03-03",
          odi: 0,
          t20: 0,
          test: 1,
          squads: 2,
          matches: 4
        },
        {
          id: "series_ind_vs_eng_2024",
          name: "India vs England Test Series 2024",
          startDate: "2024-01-25",
          endDate: "2024-03-11",
          odi: 0,
          t20: 0,
          test: 1,
          squads: 2,
          matches: 5
        },
        {
          id: "series_psl_2024",
          name: "Pakistan Super League 2024",
          startDate: "2024-02-17",
          endDate: "2024-03-18",
          odi: 0,
          t20: 1,
          test: 0,
          squads: 6,
          matches: 34
        }
      ];
      return { data: majorSeries };
    } catch (error) {
      console.error("Error fetching series:", error);
      return { data: [] };
    }
  }
  async syncMatchData() {
    try {
      console.log("\u{1F504} Syncing match data from external API...");
      const [liveMatches, upcomingMatches, recentMatches] = await Promise.all([
        this.getLiveMatches(),
        this.getUpcomingMatches(),
        this.getRecentMatches()
      ]);
      for (const apiMatch of [...liveMatches, ...upcomingMatches, ...recentMatches]) {
        await this.syncMatch(apiMatch);
      }
      console.log("\u2705 Match data sync completed");
    } catch (error) {
      console.error("\u274C Error syncing match data:", error);
      throw error;
    }
  }
  async syncMatch(apiMatch) {
    try {
      const existingMatches = await storage.getMatches();
      const existingMatch = existingMatches.find((m) => m.externalMatchId === apiMatch.id);
      if (existingMatch) {
        const status = this.mapApiStatusToLocal(apiMatch.status);
        const scores = {
          team1Score: apiMatch.teams.home.score ? `${apiMatch.teams.home.score.runs}/${apiMatch.teams.home.score.wickets} (${apiMatch.teams.home.score.overs})` : void 0,
          team2Score: apiMatch.teams.away.score ? `${apiMatch.teams.away.score.runs}/${apiMatch.teams.away.score.wickets} (${apiMatch.teams.away.score.overs})` : void 0,
          result: apiMatch.result
        };
        await storage.updateMatchStatus(existingMatch.id, status, scores);
      } else {
        console.log(`\u{1F50D} Skipping new match from API: ${apiMatch.name}`);
      }
    } catch (error) {
      console.error(`Error syncing match ${apiMatch.id}:`, error);
    }
  }
  mapApiStatusToLocal(apiStatus) {
    const status = apiStatus.toLowerCase();
    if (status.includes("live") || status.includes("progress")) return "live";
    if (status.includes("complete") || status.includes("finished")) return "completed";
    return "upcoming";
  }
  async getPlayerPerformanceTrends(playerId, format = "all") {
    const cacheKey = `player_trends_${playerId}_${format}`;
    const cachedData = await storage.getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    const trendsData = {
      playerId,
      format,
      recentForm: [
        { match: "vs AUS", runs: 89, date: "2024-01-15" },
        { match: "vs ENG", runs: 45, date: "2024-01-10" },
        { match: "vs SA", runs: 112, date: "2024-01-05" },
        { match: "vs NZ", runs: 67, date: "2024-01-01" },
        { match: "vs WI", runs: 23, date: "2023-12-28" }
      ],
      seasonStats: {
        matches: 15,
        runs: 678,
        average: 52.1,
        strikeRate: 142.3,
        fifties: 4,
        hundreds: 2
      },
      strengths: ["Strong against pace", "Excellent in powerplay", "Good finisher"],
      weaknesses: ["Struggles against left-arm spin", "Inconsistent in middle overs"],
      recommendation: format === "T20" ? "Ideal for top-order batting" : "Strong middle-order option"
    };
    await storage.setCachedData(cacheKey, trendsData, 60);
    return trendsData;
  }
  async getTeamPerformanceAnalysis(teamId, opponentTeamId) {
    const cacheKey = `team_analysis_${teamId}_${opponentTeamId || "general"}`;
    const cachedData = await storage.getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }
    const analysisData = {
      teamId,
      opponentTeamId,
      recentForm: {
        matches: 10,
        wins: 7,
        losses: 3,
        winPercentage: 70
      },
      strengthsVsOpponent: opponentTeamId ? [
        "Strong powerplay batting",
        "Effective death bowling",
        "Good fielding in pressure situations"
      ] : [
        "Balanced squad composition",
        "Strong batting depth",
        "Versatile bowling attack"
      ],
      weaknessesVsOpponent: opponentTeamId ? [
        "Vulnerable to spin in middle overs",
        "Inconsistent middle-order"
      ] : [
        "Over-dependence on top 3 batsmen",
        "Limited left-arm pace options"
      ],
      keyPlayers: [
        { name: "Player A", impact: "High", role: "Batsman" },
        { name: "Player B", impact: "Medium", role: "Bowler" }
      ],
      recommendedStrategy: "Focus on building partnerships in middle overs and utilize spin-friendly conditions"
    };
    await storage.setCachedData(cacheKey, analysisData, 120);
    return analysisData;
  }
};
var cricketApiService = new CricketApiService();

// server/emailService.ts
import crypto from "crypto";
var MockEmailService = class {
  async sendVerificationEmail(email, token, username) {
    console.log(`\u{1F4E7} Mock Email Service: Sending verification email`);
    console.log(`To: ${email}`);
    console.log(`Subject: Verify your CricketPro account`);
    console.log(`Username: ${username}`);
    console.log(`Verification Token: ${token}`);
    console.log(`Verification URL: ${process.env.CLIENT_URL || "http://localhost:5000"}/verify-email?token=${token}`);
    return true;
  }
  async sendPasswordResetEmail(email, token, username) {
    console.log(`\u{1F4E7} Mock Email Service: Sending password reset email`);
    console.log(`To: ${email}`);
    console.log(`Subject: Reset your CricketPro password`);
    console.log(`Username: ${username}`);
    console.log(`Reset Token: ${token}`);
    console.log(`Reset URL: ${process.env.CLIENT_URL || "http://localhost:5000"}/reset-password?token=${token}`);
    return true;
  }
  async sendWelcomeEmail(email, username) {
    console.log(`\u{1F4E7} Mock Email Service: Sending welcome email`);
    console.log(`To: ${email}`);
    console.log(`Subject: Welcome to CricketPro!`);
    console.log(`Username: ${username}`);
    return true;
  }
};
var OTPService = class {
  static generateToken() {
    return crypto.randomBytes(32).toString("hex");
  }
  static generateOTP() {
    return Math.floor(1e5 + Math.random() * 9e5).toString();
  }
  static generateExpiry(minutes = 15) {
    return new Date(Date.now() + minutes * 60 * 1e3);
  }
  static isTokenValid(expires) {
    return /* @__PURE__ */ new Date() < expires;
  }
};
var emailService = new MockEmailService();

// server/dataSyncService.ts
import cron from "node-cron";

// server/cricApiService.ts
import axios from "axios";
var CRIC_API_BASE_URL = "https://api.cricapi.com/v1";
var API_KEY = "f836ea89-a2da-4470-89f9-4de0e0a04ac1";
var CricApiService = class {
  async makeRequest(endpoint, params = {}) {
    try {
      const response = await axios.get(`${CRIC_API_BASE_URL}${endpoint}`, {
        params: {
          apikey: API_KEY,
          ...params
        }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching from CricAPI ${endpoint}:`, error);
      throw error;
    }
  }
  // Get series list
  async getSeries(offset = 0) {
    return this.makeRequest("/series", { offset });
  }
  // Get matches list
  async getMatches(offset = 0) {
    return this.makeRequest("/matches", { offset });
  }
  // Get players list
  async getPlayers(offset = 0, search) {
    const params = { offset };
    if (search) {
      params.search = search;
    }
    return this.makeRequest("/players", params);
  }
  // Get countries list
  async getCountries(offset = 0) {
    return this.makeRequest("/countries", { offset });
  }
  // Get series info by ID
  async getSeriesInfo(seriesId) {
    return this.makeRequest("/series_info", { id: seriesId });
  }
  // Get match info by ID
  async getMatchInfo(matchId) {
    return this.makeRequest("/match_info", { id: matchId });
  }
  // Get player info by ID
  async getPlayerInfo(playerId) {
    return this.makeRequest("/players_info", { id: playerId });
  }
  // Get match squad by ID
  async getMatchSquad(matchId) {
    return this.makeRequest("/match_squad", { id: matchId });
  }
  // Get current matches
  async getCurrentMatches() {
    return this.makeRequest("/currentMatches");
  }
  // Get recent matches
  async getRecentMatches() {
    return this.makeRequest("/recentMatches");
  }
  // Search players by name
  async searchPlayers(searchTerm, offset = 0) {
    return this.makeRequest("/players", { offset, search: searchTerm });
  }
};
var cricApiService2 = new CricApiService();

// server/dataSyncService.ts
var DataSyncService = class {
  isInitialized = false;
  constructor() {
    this.setupScheduledJobs();
  }
  // Initialize data sync on server startup
  async initialize() {
    if (this.isInitialized) return;
    console.log("\u{1F680} Starting initial data synchronization with CricAPI...");
    try {
      await this.syncCountries();
      await this.syncSeries();
      await this.syncPlayers();
      await this.syncMatches();
      this.isInitialized = true;
      console.log("\u2705 Initial data synchronization completed");
    } catch (error) {
      console.error("\u274C Error during initial data sync:", error);
    }
  }
  // Setup scheduled jobs for data updates
  setupScheduledJobs() {
    cron.schedule("0 * * * *", async () => {
      console.log("\u{1F504} Updating matches...");
      await this.syncMatches();
    });
    cron.schedule("0 */6 * * *", async () => {
      console.log("\u{1F504} Updating player data...");
      await this.syncPlayers();
    });
    cron.schedule("0 3 * * *", async () => {
      console.log("\u{1F504} Daily series update...");
      await this.syncSeries();
    });
    cron.schedule("0 2 * * 0", async () => {
      console.log("\u{1F504} Weekly countries update...");
      await this.syncCountries();
    });
  }
  // Sync all countries from CricAPI
  async syncCountries() {
    try {
      console.log("\u{1F30D} Syncing countries from CricAPI...");
      const response = await cricApiService2.getCountries();
      const countries = response.data;
      for (const countryData of countries) {
        await Country2.findOneAndUpdate(
          { cricApiId: countryData.id },
          {
            cricApiId: countryData.id,
            name: countryData.name,
            updatedAt: /* @__PURE__ */ new Date()
          },
          { upsert: true, new: true }
        );
      }
      console.log(`\u2705 Synced ${countries.length} countries`);
    } catch (error) {
      console.error("\u274C Error syncing countries:", error);
    }
  }
  // Sync all series from CricAPI
  async syncSeries() {
    try {
      console.log("\u{1F3C6} Syncing series from CricAPI...");
      const response = await cricApiService2.getSeries();
      const series = response.data;
      for (const seriesData of series) {
        await Series2.findOneAndUpdate(
          { cricApiId: seriesData.id },
          {
            cricApiId: seriesData.id,
            name: seriesData.name,
            startDate: seriesData.startDate,
            endDate: seriesData.endDate,
            odi: seriesData.odi,
            t20: seriesData.t20,
            test: seriesData.test,
            squads: seriesData.squads,
            matches: seriesData.matches,
            updatedAt: /* @__PURE__ */ new Date()
          },
          { upsert: true, new: true }
        );
      }
      console.log(`\u2705 Synced ${series.length} series`);
    } catch (error) {
      console.error("\u274C Error syncing series:", error);
    }
  }
  // Sync all players from CricAPI
  async syncPlayers(limit = 500) {
    try {
      console.log("\u{1F3CF} Syncing players from CricAPI...");
      let offset = 0;
      let totalSynced = 0;
      while (totalSynced < limit) {
        const response = await cricApiService2.getPlayers(offset);
        const players = response.data;
        if (!players || players.length === 0) {
          break;
        }
        for (const playerData of players) {
          const apiId = playerData.id || `cricapi_${playerData.name.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}`;
          let team = await Team.findOne({ country: playerData.country });
          if (!team && playerData.country) {
            team = await Team.create({
              apiId: `team_${playerData.country.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}`,
              name: `${playerData.country} National Team`,
              shortName: playerData.country.substring(0, 3).toUpperCase(),
              country: playerData.country,
              logo: "",
              establishedYear: 1900,
              homeVenue: "TBD",
              captain: null,
              coach: "TBD",
              totalPlayers: 0,
              ranking: 0
              // Use a single number instead of object
            });
          }
          await Player.findOneAndUpdate(
            { cricApiId: playerData.id },
            {
              apiId,
              cricApiId: playerData.id,
              name: playerData.name,
              country: playerData.country,
              nationality: playerData.country || "Unknown",
              role: playerData.role || "unknown",
              battingStyle: playerData.battingStyle,
              bowlingStyle: playerData.bowlingStyle,
              placeOfBirth: playerData.placeOfBirth,
              dateOfBirth: playerData.dateOfBirth,
              teamId: team ? team._id : null,
              // Link to team
              form: "average",
              isInjured: false,
              stats: {
                matches: 0,
                runs: 0,
                wickets: 0,
                batting: {
                  average: 0,
                  strikeRate: 0,
                  fifties: 0,
                  hundreds: 0,
                  highestScore: 0
                },
                bowling: {
                  average: 0,
                  economy: 0,
                  strikeRate: 0,
                  bestFigures: "0/0",
                  fiveWickets: 0
                },
                fielding: {
                  catches: 0,
                  stumps: 0,
                  runOuts: 0
                }
              },
              fantasyPoints: 0,
              teamsPlayedFor: [],
              updatedAt: /* @__PURE__ */ new Date()
            },
            { upsert: true, new: true }
          );
        }
        totalSynced += players.length;
        offset += players.length;
        console.log(`\u{1F504} Synced ${totalSynced} players so far...`);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      console.log(`\u2705 Completed syncing ${totalSynced} players`);
    } catch (error) {
      console.error("\u274C Error syncing players:", error);
    }
  }
  // Sync all matches from CricAPI
  async syncMatches(limit = 200) {
    try {
      console.log("\u{1F4C5} Syncing matches from CricAPI...");
      let offset = 0;
      let totalSynced = 0;
      while (totalSynced < limit) {
        const response = await cricApiService2.getMatches(offset);
        const matches = response.data;
        if (!matches || matches.length === 0) {
          break;
        }
        for (const matchData of matches) {
          let team1Id, team2Id;
          if (matchData.teams && matchData.teams.length >= 2) {
            const team1 = await Team.findOneAndUpdate(
              { name: matchData.teams[0] },
              {
                apiId: `team_${matchData.teams[0].toLowerCase().replace(/\s+/g, "_")}`,
                name: matchData.teams[0],
                shortName: matchData.teams[0].substring(0, 3).toUpperCase(),
                country: matchData.teams[0],
                squad: [],
                teamType: "international",
                isActive: true
              },
              { upsert: true, new: true }
            );
            team1Id = team1._id;
            const team2 = await Team.findOneAndUpdate(
              { name: matchData.teams[1] },
              {
                apiId: `team_${matchData.teams[1].toLowerCase().replace(/\s+/g, "_")}`,
                name: matchData.teams[1],
                shortName: matchData.teams[1].substring(0, 3).toUpperCase(),
                country: matchData.teams[1],
                squad: [],
                teamType: "international",
                isActive: true
              },
              { upsert: true, new: true }
            );
            team2Id = team2._id;
          } else {
            continue;
          }
          await Match.findOneAndUpdate(
            { cricApiId: matchData.id },
            {
              apiId: matchData.id || `match_${Date.now()}`,
              cricApiId: matchData.id,
              name: matchData.name,
              matchType: matchData.matchType === "odi" ? "ODI" : matchData.matchType === "t20" ? "T20" : matchData.matchType === "test" ? "Test" : "T20",
              status: matchData.status === "Fixture" ? "upcoming" : matchData.status === "Live" ? "live" : matchData.status === "Result" ? "completed" : "upcoming",
              scheduledAt: new Date(matchData.dateTimeGMT || matchData.date),
              team1Id,
              team2Id,
              venue: matchData.venue,
              date: matchData.date,
              dateTimeGMT: matchData.dateTimeGMT,
              teams: matchData.teams,
              seriesId: matchData.series_id,
              fantasyEnabled: matchData.fantasyEnabled || false,
              bbbEnabled: matchData.bbbEnabled || false,
              hasSquad: matchData.hasSquad || false,
              matchStarted: matchData.matchStarted || false,
              matchEnded: matchData.matchEnded || false,
              updatedAt: /* @__PURE__ */ new Date()
            },
            { upsert: true, new: true }
          );
        }
        totalSynced += matches.length;
        offset += matches.length;
        console.log(`\u{1F504} Synced ${totalSynced} matches so far...`);
        await new Promise((resolve) => setTimeout(resolve, 100));
      }
      console.log(`\u2705 Completed syncing ${totalSynced} matches`);
    } catch (error) {
      console.error("\u274C Error syncing matches:", error);
    }
  }
  // Search and sync specific players
  async searchAndSyncPlayers(searchTerm) {
    try {
      console.log(`\u{1F50D} Searching for players: ${searchTerm}`);
      const response = await cricApiService2.searchPlayers(searchTerm);
      const players = response.data;
      for (const playerData of players) {
        const apiId = playerData.id || `cricapi_${playerData.name.toLowerCase().replace(/\s+/g, "_")}_${Date.now()}`;
        await Player.findOneAndUpdate(
          { cricApiId: playerData.id },
          {
            apiId,
            cricApiId: playerData.id,
            name: playerData.name,
            country: playerData.country,
            nationality: playerData.country || "Unknown",
            role: playerData.role || "unknown",
            battingStyle: playerData.battingStyle,
            bowlingStyle: playerData.bowlingStyle,
            placeOfBirth: playerData.placeOfBirth,
            dateOfBirth: playerData.dateOfBirth,
            form: "average",
            isInjured: false,
            stats: {
              matches: 0,
              runs: 0,
              wickets: 0,
              batting: {
                average: 0,
                strikeRate: 0,
                fifties: 0,
                hundreds: 0,
                highestScore: 0
              },
              bowling: {
                average: 0,
                economy: 0,
                strikeRate: 0,
                bestFigures: "0/0",
                fiveWickets: 0
              },
              fielding: {
                catches: 0,
                stumps: 0,
                runOuts: 0
              }
            },
            fantasyPoints: 0,
            teamsPlayedFor: [],
            updatedAt: /* @__PURE__ */ new Date()
          },
          { upsert: true, new: true }
        );
      }
      console.log(`\u2705 Synced ${players.length} players for search: ${searchTerm}`);
    } catch (error) {
      console.error(`\u274C Error searching and syncing players for "${searchTerm}":`, error);
    }
  }
  // Get detailed player information
  async getPlayerDetails(playerId) {
    try {
      const response = await cricApiService2.getPlayerInfo(playerId);
      return response.data;
    } catch (error) {
      console.error(`Error getting player details for ${playerId}:`, error);
      return null;
    }
  }
  // Get detailed match information
  async getMatchDetails(matchId) {
    try {
      const response = await cricApiService2.getMatchInfo(matchId);
      return response.data;
    } catch (error) {
      console.error(`Error getting match details for ${matchId}:`, error);
      return null;
    }
  }
  // Get match squad
  async getMatchSquad(matchId) {
    try {
      const response = await cricApiService2.getMatchSquad(matchId);
      return response.data;
    } catch (error) {
      console.error(`Error getting match squad for ${matchId}:`, error);
      return null;
    }
  }
  // Sync all data
  async syncAllData() {
    console.log("\u{1F680} Starting complete data sync...");
    await this.syncCountries();
    await this.syncSeries();
    await this.syncPlayers(1e3);
    await this.syncMatches(500);
    console.log("\u2705 Complete data sync finished!");
  }
  // Manual sync methods for admin use
  async forceSync(type) {
    console.log(`\u{1F504} Force syncing ${type}...`);
    switch (type) {
      case "all":
        await this.syncAllData();
        break;
      case "countries":
        await this.syncCountries();
        break;
      case "series":
        await this.syncSeries();
        break;
      case "players":
        await this.syncPlayers();
        break;
      case "matches":
        await this.syncMatches();
        break;
    }
    console.log(`\u2705 Force sync ${type} completed`);
  }
};
var dataSyncService = new DataSyncService();

// server/fantasyService.ts
var FantasyPointsService = class {
  // Fantasy points calculation rules
  POINTS_RULES = {
    // Batting points
    RUN: 1,
    FOUR: 2,
    SIX: 4,
    THIRTY_BONUS: 10,
    FIFTY_BONUS: 20,
    HUNDRED_BONUS: 40,
    // Bowling points
    WICKET: 25,
    MAIDEN: 5,
    THREE_WICKET_BONUS: 10,
    FIVE_WICKET_BONUS: 20,
    // Fielding points
    CATCH: 10,
    STUMPING: 12,
    RUN_OUT: 12,
    // Penalty points
    DUCK: -5
    // For batsmen scoring 0
  };
  // Calculate fantasy points for a player's performance in a match
  async calculatePlayerFantasyPoints(matchId, playerId, performance) {
    try {
      let totalPoints = 0;
      const points = {
        runs: 0,
        fours: 0,
        sixes: 0,
        thirtyBonus: 0,
        fiftyBonus: 0,
        hundredBonus: 0,
        wickets: 0,
        maidens: 0,
        threeWicketBonus: 0,
        fiveWicketBonus: 0,
        catches: 0,
        stumps: 0,
        runOuts: 0,
        duck: 0
      };
      if (performance.batting) {
        const batting = performance.batting;
        points.runs = (batting.runs || 0) * this.POINTS_RULES.RUN;
        totalPoints += points.runs;
        points.fours = (batting.fours || 0) * this.POINTS_RULES.FOUR;
        totalPoints += points.fours;
        points.sixes = (batting.sixes || 0) * this.POINTS_RULES.SIX;
        totalPoints += points.sixes;
        const runs = batting.runs || 0;
        if (runs >= 100) {
          points.hundredBonus = this.POINTS_RULES.HUNDRED_BONUS;
          totalPoints += points.hundredBonus;
        } else if (runs >= 50) {
          points.fiftyBonus = this.POINTS_RULES.FIFTY_BONUS;
          totalPoints += points.fiftyBonus;
        } else if (runs >= 30) {
          points.thirtyBonus = this.POINTS_RULES.THIRTY_BONUS;
          totalPoints += points.thirtyBonus;
        }
        if (runs === 0 && batting.ballsFaced > 0 && batting.isOut) {
          points.duck = this.POINTS_RULES.DUCK;
          totalPoints += points.duck;
        }
      }
      if (performance.bowling) {
        const bowling = performance.bowling;
        const wickets = bowling.wickets || 0;
        points.wickets = wickets * this.POINTS_RULES.WICKET;
        totalPoints += points.wickets;
        points.maidens = (bowling.maidens || 0) * this.POINTS_RULES.MAIDEN;
        totalPoints += points.maidens;
        if (wickets >= 5) {
          points.fiveWicketBonus = this.POINTS_RULES.FIVE_WICKET_BONUS;
          totalPoints += points.fiveWicketBonus;
        } else if (wickets >= 3) {
          points.threeWicketBonus = this.POINTS_RULES.THREE_WICKET_BONUS;
          totalPoints += points.threeWicketBonus;
        }
      }
      if (performance.fielding) {
        const fielding = performance.fielding;
        points.catches = (fielding.catches || 0) * this.POINTS_RULES.CATCH;
        totalPoints += points.catches;
        points.stumps = (fielding.stumps || 0) * this.POINTS_RULES.STUMPING;
        totalPoints += points.stumps;
        points.runOuts = (fielding.runOuts || 0) * this.POINTS_RULES.RUN_OUT;
        totalPoints += points.runOuts;
      }
      await FantasyPoints.findOneAndUpdate(
        { matchId, playerId },
        {
          matchId,
          playerId,
          ...points,
          totalPoints
        },
        { upsert: true, new: true }
      );
      return totalPoints;
    } catch (error) {
      console.error("Error calculating fantasy points:", error);
      throw error;
    }
  }
  // Calculate fantasy points for all players in a match
  async calculateMatchFantasyPoints(matchId) {
    try {
      console.log(`\u{1F3AF} Calculating fantasy points for match ${matchId}...`);
      const performances = await PlayerPerformance.find({ matchId }).populate("playerId");
      for (const performance of performances) {
        await this.calculatePlayerFantasyPoints(
          matchId,
          performance.playerId.toString(),
          performance
        );
      }
      console.log(`\u2705 Fantasy points calculated for ${performances.length} players`);
    } catch (error) {
      console.error("Error calculating match fantasy points:", error);
      throw error;
    }
  }
  // Get fantasy points for a specific player
  async getPlayerFantasyPoints(playerId, matchId) {
    try {
      const query = { playerId };
      if (matchId) {
        query.matchId = matchId;
      }
      const fantasyPoints = await FantasyPoints.find(query).populate("matchId", "team1Id team2Id scheduledAt matchType").sort({ createdAt: -1 });
      return fantasyPoints;
    } catch (error) {
      console.error("Error getting player fantasy points:", error);
      throw error;
    }
  }
  // Get fantasy leaderboard for a match
  async getMatchFantasyLeaderboard(matchId) {
    try {
      const leaderboard = await FantasyPoints.find({ matchId }).populate("playerId", "name image role nationality").sort({ totalPoints: -1 }).limit(20);
      return leaderboard.map((entry, index) => ({
        rank: index + 1,
        player: entry.playerId,
        points: entry.totalPoints,
        breakdown: {
          batting: entry.runs + entry.fours + entry.sixes + entry.thirtyBonus + entry.fiftyBonus + entry.hundredBonus,
          bowling: entry.wickets + entry.maidens + entry.threeWicketBonus + entry.fiveWicketBonus,
          fielding: entry.catches + entry.stumps + entry.runOuts,
          penalty: entry.duck
        }
      }));
    } catch (error) {
      console.error("Error getting fantasy leaderboard:", error);
      throw error;
    }
  }
  // Get overall fantasy leaderboard (cumulative points)
  async getOverallFantasyLeaderboard(limit = 50) {
    try {
      const leaderboard = await FantasyPoints.aggregate([
        {
          $group: {
            _id: "$playerId",
            totalPoints: { $sum: "$totalPoints" },
            matchesPlayed: { $sum: 1 },
            averagePoints: { $avg: "$totalPoints" },
            highestScore: { $max: "$totalPoints" }
          }
        },
        {
          $lookup: {
            from: "players",
            localField: "_id",
            foreignField: "_id",
            as: "player"
          }
        },
        {
          $unwind: "$player"
        },
        {
          $sort: { totalPoints: -1 }
        },
        {
          $limit: limit
        }
      ]);
      return leaderboard.map((entry, index) => ({
        rank: index + 1,
        player: {
          _id: entry.player._id,
          name: entry.player.name,
          image: entry.player.image,
          role: entry.player.role,
          nationality: entry.player.nationality
        },
        totalPoints: entry.totalPoints,
        matchesPlayed: entry.matchesPlayed,
        averagePoints: Math.round(entry.averagePoints * 100) / 100,
        highestScore: entry.highestScore
      }));
    } catch (error) {
      console.error("Error getting overall fantasy leaderboard:", error);
      throw error;
    }
  }
  // Get player's fantasy performance trends
  async getPlayerFantasyTrends(playerId, limit = 10) {
    try {
      const trends = await FantasyPoints.find({ playerId }).populate("matchId", "team1Id team2Id scheduledAt matchType result").sort({ createdAt: -1 }).limit(limit);
      return trends.map((trend) => ({
        match: trend.matchId,
        points: trend.totalPoints,
        breakdown: {
          batting: trend.runs + trend.fours + trend.sixes + trend.thirtyBonus + trend.fiftyBonus + trend.hundredBonus,
          bowling: trend.wickets + trend.maidens + trend.threeWicketBonus + trend.fiveWicketBonus,
          fielding: trend.catches + trend.stumps + trend.runOuts,
          penalty: trend.duck
        },
        date: trend.createdAt
      }));
    } catch (error) {
      console.error("Error getting player fantasy trends:", error);
      throw error;
    }
  }
  // Calculate and update fantasy points for completed matches
  async updateFantasyPointsForCompletedMatches() {
    try {
      console.log("\u{1F504} Updating fantasy points for completed matches...");
      const completedMatches = await Match.find({
        status: "completed",
        completedAt: { $exists: true }
      });
      for (const match of completedMatches) {
        const existingPoints = await FantasyPoints.findOne({ matchId: match._id });
        if (!existingPoints) {
          await this.calculateMatchFantasyPoints(match._id.toString());
        }
      }
      console.log(`\u2705 Fantasy points updated for completed matches`);
    } catch (error) {
      console.error("Error updating fantasy points for completed matches:", error);
      throw error;
    }
  }
  // Get fantasy points summary for fans dashboard
  async getFantasySummary() {
    try {
      const [topPerformers, recentMatches, totalPlayers] = await Promise.all([
        this.getOverallFantasyLeaderboard(5),
        FantasyPoints.find().populate("matchId", "team1Id team2Id scheduledAt matchType").populate("playerId", "name image").sort({ createdAt: -1 }).limit(10),
        FantasyPoints.distinct("playerId").countDocuments()
      ]);
      return {
        topPerformers,
        recentMatches: recentMatches.map((fp) => ({
          player: fp.playerId,
          match: fp.matchId,
          points: fp.totalPoints,
          date: fp.createdAt
        })),
        totalPlayers,
        lastUpdated: /* @__PURE__ */ new Date()
      };
    } catch (error) {
      console.error("Error getting fantasy summary:", error);
      throw error;
    }
  }
};
var fantasyPointsService = new FantasyPointsService();

// server/routes.ts
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { z as z2 } from "zod";
if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}
var JWT_SECRET = process.env.JWT_SECRET;
var authLimiter = rateLimit({
  windowMs: 15 * 60 * 1e3,
  // 15 minutes
  max: 5,
  // Limit each IP to 5 requests per windowMs
  message: { error: "Too many auth attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false
});
var authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await storage.getUser(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: "Invalid token" });
    }
    const { password, ...publicUser } = user;
    req.user = publicUser;
    next();
  } catch (error) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
};
var requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: "Insufficient permissions" });
    }
    next();
  };
};
var loginSchema = z2.object({
  username: z2.string(),
  password: z2.string()
});
var registerSchema = insertUserSchema;
var forgotPasswordSchema = z2.object({
  email: z2.string().email()
});
var resetPasswordSchema = z2.object({
  token: z2.string(),
  password: z2.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: "Password must contain at least one uppercase letter, one lowercase letter, and one number"
  })
});
async function registerRoutes(app2) {
  app2.post("/api/auth/register", authLimiter, async (req, res) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      const existingUserByUsername = await storage.getUserByUsername(validatedData.username);
      if (existingUserByUsername) {
        return res.status(400).json({ error: "Username already exists" });
      }
      const existingUserByEmail = await storage.getUserByEmail(validatedData.email);
      if (existingUserByEmail) {
        return res.status(400).json({ error: "Email already exists" });
      }
      const user = await storage.createUser(validatedData);
      if (process.env.SKIP_EMAIL_VERIFICATION === "true" && process.env.NODE_ENV === "development") {
        await storage.updateUserVerification(user._id, true);
        const jwtToken = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: "7d" });
        return res.status(201).json({
          user: { ...user, emailVerified: true },
          token: jwtToken,
          message: "Registration successful! Auto-verified in development mode.",
          autoVerified: true
        });
      }
      const verificationToken = OTPService.generateToken();
      const verificationExpires = OTPService.generateExpiry(24 * 60);
      await storage.setEmailVerificationToken(user._id, verificationToken, verificationExpires);
      const emailSent = await emailService.sendVerificationEmail(
        user.email,
        verificationToken,
        user.username
      );
      if (!emailSent) {
        console.warn("Failed to send verification email");
      }
      res.status(201).json({
        user,
        message: "Registration successful! Please check your email to verify your account.",
        requiresVerification: true,
        verificationToken: process.env.NODE_ENV === "development" ? verificationToken : void 0
      });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ error: "Invalid input data", details: error.errors });
      }
      console.error("Registration error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/auth/verify-email", authLimiter, async (req, res) => {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ error: "Verification token is required" });
      }
      const user = await storage.getUserByVerificationToken(token);
      if (!user) {
        return res.status(400).json({ error: "Invalid or expired verification token" });
      }
      await storage.updateUserVerification(user._id.toString(), true);
      await emailService.sendWelcomeEmail(user.email, user.username);
      const jwtToken = jwt.sign({ userId: user._id.toString() }, JWT_SECRET, { expiresIn: "7d" });
      const userObj = user.toObject();
      const { password, emailVerificationToken, passwordResetToken, ...publicUser } = userObj;
      res.json({
        user: { ...publicUser, emailVerified: true },
        token: jwtToken,
        message: "Email verified successfully! Welcome to PitchPoint!"
      });
    } catch (error) {
      console.error("Email verification error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/auth/resend-verification", authLimiter, async (req, res) => {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: "Email is required" });
      }
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      if (user.emailVerified) {
        return res.status(400).json({ error: "Email is already verified" });
      }
      const verificationToken = OTPService.generateToken();
      const verificationExpires = OTPService.generateExpiry(24 * 60);
      await storage.setEmailVerificationToken(user._id.toString(), verificationToken, verificationExpires);
      const emailSent = await emailService.sendVerificationEmail(
        user.email,
        verificationToken,
        user.username
      );
      if (!emailSent) {
        return res.status(500).json({ error: "Failed to send verification email" });
      }
      res.json({ message: "Verification email sent successfully" });
    } catch (error) {
      console.error("Resend verification error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/auth/login", authLimiter, async (req, res) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      let user = await storage.getUserByUsername(username);
      if (!user) {
        user = await storage.getUserByEmail(username);
      }
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      const isValidPassword = await storage.verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }
      if (!user.emailVerified) {
        return res.status(403).json({
          error: "Email not verified. Please check your email and verify your account.",
          requiresVerification: true,
          email: user.email
        });
      }
      await storage.updateLastLogin(user._id.toString());
      const token = jwt.sign({ userId: user._id.toString() }, JWT_SECRET, { expiresIn: "7d" });
      const userObj = user.toObject();
      const { password: _, emailVerificationToken, passwordResetToken, ...publicUser } = userObj;
      res.json({
        user: publicUser,
        token,
        message: "Login successful"
      });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ error: "Invalid input data", details: error.errors });
      }
      console.error("Login error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/auth/forgot-password", authLimiter, async (req, res) => {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.json({ message: "If an account with that email exists, a password reset link has been sent." });
      }
      const resetToken = OTPService.generateToken();
      const resetExpires = OTPService.generateExpiry(60);
      await storage.setPasswordResetToken(user._id.toString(), resetToken, resetExpires);
      const emailSent = await emailService.sendPasswordResetEmail(
        user.email,
        resetToken,
        user.username
      );
      if (!emailSent) {
        console.warn("Failed to send password reset email");
      }
      res.json({ message: "If an account with that email exists, a password reset link has been sent." });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ error: "Invalid input data", details: error.errors });
      }
      console.error("Forgot password error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/auth/reset-password", authLimiter, async (req, res) => {
    try {
      const { token, password } = resetPasswordSchema.parse(req.body);
      const user = await storage.getUserByPasswordResetToken(token);
      if (!user) {
        return res.status(400).json({ error: "Invalid or expired reset token" });
      }
      await storage.updatePassword(user._id.toString(), password);
      res.json({ message: "Password reset successfully. You can now log in with your new password." });
    } catch (error) {
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ error: "Invalid input data", details: error.errors });
      }
      console.error("Reset password error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/auth/me", authenticateToken, async (req, res) => {
    res.json({ user: req.user });
  });
  app2.post("/api/auth/logout", authenticateToken, async (req, res) => {
    res.json({ message: "Logout successful" });
  });
  if (process.env.NODE_ENV === "development") {
    app2.post("/api/auth/dev-verify", async (req, res) => {
      try {
        const { email } = req.body;
        if (!email) {
          return res.status(400).json({ error: "Email is required" });
        }
        const user = await storage.getUserByEmail(email);
        if (!user) {
          return res.status(404).json({ error: "User not found" });
        }
        if (user.emailVerified) {
          return res.status(400).json({ error: "Email is already verified" });
        }
        await storage.updateUserVerification(user._id.toString(), true);
        const jwtToken = jwt.sign({ userId: user._id.toString() }, JWT_SECRET, { expiresIn: "7d" });
        const userObj = user.toObject();
        const { password, emailVerificationToken, passwordResetToken, ...publicUser } = userObj;
        res.json({
          user: { ...publicUser, emailVerified: true },
          token: jwtToken,
          message: "Email verified successfully! (Development bypass)"
        });
      } catch (error) {
        console.error("Development verification error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
    app2.post("/api/auth/dev-login", async (req, res) => {
      try {
        if (process.env.NODE_ENV !== "development") {
          return res.status(403).json({ error: "Development endpoint not available in production" });
        }
        const { role = "analyst" } = req.body;
        const demoEmail = `demo-${role}@cricket.dev`;
        let user = await storage.getUserByEmail(demoEmail);
        if (!user) {
          user = await storage.createUser({
            username: `Demo ${role.charAt(0).toUpperCase() + role.slice(1)}`,
            email: demoEmail,
            password: "demo123",
            // This will be hashed by storage.createUser
            role,
            emailVerified: true
          });
        }
        const jwtToken = jwt.sign({ userId: user._id.toString() }, JWT_SECRET, { expiresIn: "7d" });
        const publicUser = {
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          role: user.role,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        };
        res.json({
          user: publicUser,
          token: jwtToken,
          message: "Development login successful",
          autoVerified: true
        });
      } catch (error) {
        console.error("Development login error:", error);
        res.status(500).json({ error: "Internal server error" });
      }
    });
  }
  app2.get("/api/teams", authenticateToken, requireRole(["coach", "analyst"]), async (req, res) => {
    try {
      const teams = await storage.getTeams();
      res.json(teams);
    } catch (error) {
      console.error("Error fetching teams:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/players", authenticateToken, requireRole(["coach", "analyst"]), async (req, res) => {
    try {
      const { teamId } = req.query;
      const players = await storage.getPlayers(teamId);
      res.json(players);
    } catch (error) {
      console.error("Error fetching players:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/players/:id", authenticateToken, requireRole(["coach", "analyst"]), async (req, res) => {
    try {
      const { id } = req.params;
      const player = await storage.getPlayer(id);
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }
      res.json(player);
    } catch (error) {
      console.error("Error fetching player:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/matches", authenticateToken, async (req, res) => {
    try {
      const { status } = req.query;
      const matches = await storage.getMatches(status);
      res.json(matches);
    } catch (error) {
      console.error("Error fetching matches:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/matches/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const match = await storage.getMatch(id);
      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }
      res.json(match);
    } catch (error) {
      console.error("Error fetching match:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/players/:id/stats", authenticateToken, requireRole(["coach", "analyst"]), async (req, res) => {
    try {
      const { id } = req.params;
      const { season } = req.query;
      const stats = await storage.getPlayerStats(id, season);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching player stats:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/user/predictions", authenticateToken, async (req, res) => {
    try {
      const predictions = await storage.getUserPredictions(req.user._id.toString());
      res.json(predictions);
    } catch (error) {
      console.error("Error fetching predictions:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/user/predictions", authenticateToken, async (req, res) => {
    try {
      const prediction = await storage.createPrediction({
        ...req.body,
        userId: req.user._id.toString()
      });
      res.status(201).json(prediction);
    } catch (error) {
      console.error("Error creating prediction:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/user/favorites", authenticateToken, async (req, res) => {
    try {
      const favorites = await storage.getUserFavorites(req.user._id.toString());
      res.json(favorites);
    } catch (error) {
      console.error("Error fetching favorites:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/user/favorites", authenticateToken, async (req, res) => {
    try {
      const { playerId, teamId } = req.body;
      const favorite = await storage.addToFavorites(req.user._id.toString(), playerId, teamId);
      res.status(201).json(favorite);
    } catch (error) {
      console.error("Error adding to favorites:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.delete("/api/user/favorites", authenticateToken, async (req, res) => {
    try {
      const { playerId, teamId } = req.body;
      await storage.removeFromFavorites(req.user._id.toString(), playerId, teamId);
      res.status(204).send();
    } catch (error) {
      console.error("Error removing from favorites:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/user/analyses", authenticateToken, requireRole(["coach", "analyst"]), async (req, res) => {
    try {
      const analyses = await storage.getUserAnalyses(req.user._id.toString());
      res.json(analyses);
    } catch (error) {
      console.error("Error fetching analyses:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/user/analyses", authenticateToken, requireRole(["coach", "analyst"]), async (req, res) => {
    try {
      const analysis = await storage.createSavedAnalysis({
        ...req.body,
        userId: req.user._id.toString()
      });
      res.status(201).json(analysis);
    } catch (error) {
      console.error("Error saving analysis:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/cricket/live-matches", authenticateToken, async (req, res) => {
    try {
      const liveMatches = await cricketApiService.getLiveMatches();
      res.json(liveMatches);
    } catch (error) {
      console.error("Error fetching live matches:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/cricket/upcoming-matches", authenticateToken, async (req, res) => {
    try {
      const upcomingMatches = await cricketApiService.getUpcomingMatches();
      res.json(upcomingMatches);
    } catch (error) {
      console.error("Error fetching upcoming matches:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/cricket/player-trends/:playerId", authenticateToken, requireRole(["coach", "analyst"]), async (req, res) => {
    try {
      const { playerId } = req.params;
      const { format = "all" } = req.query;
      const trends = await cricketApiService.getPlayerPerformanceTrends(playerId, format);
      res.json(trends);
    } catch (error) {
      console.error("Error fetching player trends:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/cricket/team-analysis/:teamId", authenticateToken, requireRole(["coach", "analyst"]), async (req, res) => {
    try {
      const { teamId } = req.params;
      const { opponentTeamId } = req.query;
      const analysis = await cricketApiService.getTeamPerformanceAnalysis(teamId, opponentTeamId);
      res.json(analysis);
    } catch (error) {
      console.error("Error fetching team analysis:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/cricket/sync-data", authenticateToken, requireRole(["coach", "analyst"]), async (req, res) => {
    try {
      await cricketApiService.syncMatchData();
      res.json({ message: "Data sync completed successfully" });
    } catch (error) {
      console.error("Error syncing cricket data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/v2/players", authenticateToken, async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        team,
        role,
        nationality,
        sortBy = "name",
        sortOrder = "asc"
      } = req.query;
      const query = {};
      if (search) {
        query.name = { $regex: search, $options: "i" };
      }
      if (team) {
        const teamDoc = await Team.findOne({ name: { $regex: team, $options: "i" } });
        if (teamDoc) query.teamId = teamDoc._id;
      }
      if (role) {
        query.role = role;
      }
      if (nationality) {
        query.nationality = { $regex: nationality, $options: "i" };
      }
      const sort = {};
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;
      const skip = (Number(page) - 1) * Number(limit);
      const [players, total] = await Promise.all([
        Player.find(query).populate("teamId", "name shortName country logo").sort(sort).skip(skip).limit(Number(limit)),
        Player.countDocuments(query)
      ]);
      res.json({
        players,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error("Error fetching players:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/v2/players/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const player = await Player.findById(id).populate("teamId", "name shortName country logo");
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }
      const [recentPerformances, fantasyPoints] = await Promise.all([
        PlayerPerformance.find({ playerId: id }).populate("matchId", "team1Id team2Id scheduledAt matchType result").sort({ createdAt: -1 }).limit(10),
        fantasyPointsService.getPlayerFantasyPoints(id)
      ]);
      res.json({
        player,
        recentPerformances,
        fantasyPoints
      });
    } catch (error) {
      console.error("Error fetching player:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/v2/teams", authenticateToken, async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        country,
        teamType,
        sortBy = "ranking",
        sortOrder = "asc"
      } = req.query;
      const query = { isActive: true };
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { shortName: { $regex: search, $options: "i" } }
        ];
      }
      if (country) {
        query.country = { $regex: country, $options: "i" };
      }
      if (teamType) {
        query.teamType = teamType;
      }
      const sort = {};
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;
      const skip = (Number(page) - 1) * Number(limit);
      const [teams, total] = await Promise.all([
        Team.find(query).populate("squad", "name role image").populate("captain", "name role image").sort(sort).skip(skip).limit(Number(limit)),
        Team.countDocuments(query)
      ]);
      res.json({
        teams,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error("Error fetching teams:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/v2/teams/stats", authenticateToken, async (req, res) => {
    try {
      const totalTeams = await Team.countDocuments();
      const totalPlayers = await Player.countDocuments();
      const activePlayers = await Player.countDocuments({ isActive: true });
      const injuredPlayers = await Player.countDocuments({ isInjured: true });
      const averageFitness = Math.floor(Math.random() * 20) + 80;
      const stats = {
        totalTeams,
        totalPlayers,
        availablePlayers: activePlayers,
        injuredPlayers,
        averageFitness,
        teamForm: "excellent",
        upcomingMatches: await Match.countDocuments({
          status: "scheduled",
          scheduledAt: { $gte: /* @__PURE__ */ new Date() }
        })
      };
      res.json(stats);
    } catch (error) {
      console.error("Error fetching team stats:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/v2/teams/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const team = await Team.findById(id).populate("squad", "name role image stats").populate("captain", "name role image");
      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }
      const recentMatches = await Match.find({
        $or: [{ team1Id: id }, { team2Id: id }],
        status: { $in: ["completed", "live"] }
      }).populate("team1Id team2Id", "name shortName logo").populate("venueId", "name city country").sort({ scheduledAt: -1 }).limit(10);
      res.json({
        team,
        recentMatches
      });
    } catch (error) {
      console.error("Error fetching team:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/v2/training/schedule", authenticateToken, async (req, res) => {
    try {
      const mockSchedule = [
        {
          id: "1",
          title: "Batting Practice",
          date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1e3).toISOString(),
          time: "09:00",
          duration: "2 hours",
          venue: "Main Practice Ground",
          type: "batting",
          participants: ["All Batsmen", "Coaches"],
          description: "Focus on technique improvement and match simulation"
        },
        {
          id: "2",
          title: "Bowling Training",
          date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1e3).toISOString(),
          time: "14:00",
          duration: "2.5 hours",
          venue: "Bowling Practice Area",
          type: "bowling",
          participants: ["All Bowlers", "Bowling Coach"],
          description: "Line and length practice, yorker training"
        },
        {
          id: "3",
          title: "Fielding Drills",
          date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1e3).toISOString(),
          time: "10:30",
          duration: "1.5 hours",
          venue: "Outfield",
          type: "fielding",
          participants: ["Full Squad"],
          description: "Catching practice, boundary saves, throw accuracy"
        },
        {
          id: "4",
          title: "Team Strategy Meeting",
          date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1e3).toISOString(),
          time: "11:00",
          duration: "1 hour",
          venue: "Conference Room",
          type: "strategy",
          participants: ["Full Squad", "Management"],
          description: "Discuss upcoming match tactics and game plans"
        },
        {
          id: "5",
          title: "Fitness Session",
          date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1e3).toISOString(),
          time: "07:00",
          duration: "1 hour",
          venue: "Gym",
          type: "fitness",
          participants: ["Full Squad"],
          description: "Strength and conditioning workout"
        }
      ];
      res.json({ schedule: mockSchedule });
    } catch (error) {
      console.error("Error fetching training schedule:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/v2/venues", authenticateToken, async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        search,
        country,
        sortBy = "name",
        sortOrder = "asc"
      } = req.query;
      const query = {};
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: "i" } },
          { city: { $regex: search, $options: "i" } }
        ];
      }
      if (country) {
        query.country = { $regex: country, $options: "i" };
      }
      const sort = {};
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;
      const skip = (Number(page) - 1) * Number(limit);
      const [venues, total] = await Promise.all([
        Venue.find(query).sort(sort).skip(skip).limit(Number(limit)),
        Venue.countDocuments(query)
      ]);
      res.json({
        venues,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error("Error fetching venues:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/v2/venues/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const venue = await Venue.findById(id);
      if (!venue) {
        return res.status(404).json({ error: "Venue not found" });
      }
      const matches = await Match.find({ venueId: id }).populate("team1Id team2Id", "name shortName logo").sort({ scheduledAt: -1 }).limit(20);
      res.json({
        venue,
        matches
      });
    } catch (error) {
      console.error("Error fetching venue:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/v2/matches", authenticateToken, async (req, res) => {
    try {
      const {
        page = 1,
        limit = 20,
        status = "all",
        matchType,
        team,
        venue,
        series,
        sortBy = "scheduledAt",
        sortOrder = "desc"
      } = req.query;
      const query = {};
      if (status !== "all") {
        query.status = status;
      }
      if (matchType) {
        query.matchType = matchType;
      }
      if (team) {
        const teamDoc = await Team.findOne({ name: { $regex: team, $options: "i" } });
        if (teamDoc) {
          query.$or = [{ team1Id: teamDoc._id }, { team2Id: teamDoc._id }];
        }
      }
      if (venue) {
        const venueDoc = await Venue.findOne({ name: { $regex: venue, $options: "i" } });
        if (venueDoc) query.venueId = venueDoc._id;
      }
      if (series) {
        query.series = { $regex: series, $options: "i" };
      }
      const sort = {};
      sort[sortBy] = sortOrder === "desc" ? -1 : 1;
      const skip = (Number(page) - 1) * Number(limit);
      const [matches, total] = await Promise.all([
        Match.find(query).populate("team1Id team2Id", "name shortName logo country").populate("venueId", "name city country").populate("winnerId", "name shortName logo").sort(sort).skip(skip).limit(Number(limit)),
        Match.countDocuments(query)
      ]);
      res.json({
        matches,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit))
        }
      });
    } catch (error) {
      console.error("Error fetching matches:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/v2/matches/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const match = await Match.findById(id).populate("team1Id team2Id", "name shortName logo country squad").populate("venueId", "name city country capacity pitchType").populate("winnerId", "name shortName logo");
      if (!match) {
        return res.status(404).json({ error: "Match not found" });
      }
      const fantasyLeaderboard = await fantasyPointsService.getMatchFantasyLeaderboard(id);
      let ballByBall = null;
      if (req.user?.role === "coach" || req.user?.role === "analyst") {
        if (match.status === "live" || match.status === "completed") {
          ballByBall = await BallByBall.find({ matchId: id }).populate("striker nonStriker bowler fielder", "name").sort({ innings: 1, over: 1, ball: 1 }).limit(50);
        }
      }
      res.json({
        match,
        fantasyLeaderboard,
        ballByBall
      });
    } catch (error) {
      console.error("Error fetching match:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/v2/fantasy/leaderboard", authenticateToken, async (req, res) => {
    try {
      const { matchId, limit = 50 } = req.query;
      let leaderboard;
      if (matchId) {
        leaderboard = await fantasyPointsService.getMatchFantasyLeaderboard(matchId);
      } else {
        leaderboard = await fantasyPointsService.getOverallFantasyLeaderboard(Number(limit));
      }
      res.json({ leaderboard });
    } catch (error) {
      console.error("Error fetching fantasy leaderboard:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/v2/fantasy/player/:playerId", authenticateToken, async (req, res) => {
    try {
      const { playerId } = req.params;
      const { matchId } = req.query;
      const [fantasyPoints, fantasyTrends] = await Promise.all([
        fantasyPointsService.getPlayerFantasyPoints(playerId, matchId),
        fantasyPointsService.getPlayerFantasyTrends(playerId)
      ]);
      res.json({
        fantasyPoints,
        fantasyTrends
      });
    } catch (error) {
      console.error("Error fetching player fantasy data:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/v2/fantasy/summary", authenticateToken, async (req, res) => {
    try {
      const summary = await fantasyPointsService.getFantasySummary();
      res.json(summary);
    } catch (error) {
      console.error("Error fetching fantasy summary:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/v2/search", authenticateToken, async (req, res) => {
    try {
      const { q: query, type = "all", limit = 10 } = req.query;
      if (!query) {
        return res.status(400).json({ error: "Search query is required" });
      }
      const searchRegex = { $regex: query, $options: "i" };
      const results = {};
      if (type === "all" || type === "players") {
        results.players = await Player.find({
          $or: [
            { name: searchRegex },
            { nationality: searchRegex }
          ]
        }).populate("teamId", "name shortName logo").limit(Number(limit));
      }
      if (type === "all" || type === "teams") {
        results.teams = await Team.find({
          $or: [
            { name: searchRegex },
            { shortName: searchRegex },
            { country: searchRegex }
          ]
        }).limit(Number(limit));
      }
      if (type === "all" || type === "venues") {
        results.venues = await Venue.find({
          $or: [
            { name: searchRegex },
            { city: searchRegex },
            { country: searchRegex }
          ]
        }).limit(Number(limit));
      }
      if (type === "all" || type === "matches") {
        results.matches = await Match.find({
          $or: [
            { series: searchRegex },
            { season: searchRegex }
          ]
        }).populate("team1Id team2Id", "name shortName logo").populate("venueId", "name city").limit(Number(limit));
      }
      res.json(results);
    } catch (error) {
      console.error("Error performing search:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/v2/admin/sync", authenticateToken, requireRole(["coach", "analyst"]), async (req, res) => {
    try {
      const { type = "all" } = req.body;
      await dataSyncService.forceSync(type);
      res.json({
        message: `Data sync for ${type} completed successfully`,
        timestamp: /* @__PURE__ */ new Date()
      });
    } catch (error) {
      console.error("Error performing admin sync:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/v2/admin/stats", authenticateToken, requireRole(["coach", "analyst"]), async (req, res) => {
    try {
      const [playersCount, teamsCount, venuesCount, matchesCount, fantasyPointsCount] = await Promise.all([
        Player.countDocuments(),
        Team.countDocuments(),
        Venue.countDocuments(),
        Match.countDocuments(),
        FantasyPoints.countDocuments()
      ]);
      const recentMatches = await Match.find().sort({ createdAt: -1 }).limit(5).populate("team1Id team2Id", "name shortName");
      res.json({
        stats: {
          players: playersCount,
          teams: teamsCount,
          venues: venuesCount,
          matches: matchesCount,
          fantasyCalculations: fantasyPointsCount
        },
        recentActivity: recentMatches,
        lastSyncTime: /* @__PURE__ */ new Date()
      });
    } catch (error) {
      console.error("Error fetching admin stats:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/v2/ml/predict/batting", authenticateToken, async (req, res) => {
    try {
      const { playerName, opposition, ballsFaced, overs } = req.body;
      if (!playerName || !opposition || ballsFaced === void 0 || overs === void 0) {
        return res.status(400).json({
          error: "Missing required fields: playerName, opposition, ballsFaced, overs"
        });
      }
      const { execSync } = __require("child_process");
      const path3 = __require("path");
      try {
        const mlScript = path3.join(__dirname, "mlService.py");
        const pythonCommand = `python "${mlScript}" predict_batting "${playerName}" "${opposition}" ${ballsFaced} ${overs}`;
        const result = execSync(pythonCommand, { encoding: "utf8", timeout: 1e4 });
        const prediction = JSON.parse(result);
        res.json({
          success: true,
          prediction,
          timestamp: /* @__PURE__ */ new Date()
        });
      } catch (pythonError) {
        console.warn("Python ML service failed, using fallback prediction:", pythonError);
        const baseRuns = Math.floor(Math.random() * 60) + 20;
        const strikeRate = baseRuns / ballsFaced * 100;
        res.json({
          success: true,
          prediction: {
            player: playerName,
            opposition,
            predicted_runs: baseRuns,
            ensemble_prediction: baseRuns + Math.floor(Math.random() * 10) - 5,
            confidence: 0.75,
            model_used: "fallback",
            insights: [
              `Predicted ${baseRuns} runs against ${opposition}`,
              strikeRate > 100 ? "Aggressive approach recommended" : "Build innings steadily",
              "Focus on playing to strengths"
            ],
            input_parameters: { balls_faced: ballsFaced, overs }
          },
          timestamp: /* @__PURE__ */ new Date(),
          source: "fallback"
        });
      }
    } catch (error) {
      console.error("Error in batting prediction:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/v2/ml/predict/bowling", authenticateToken, async (req, res) => {
    try {
      const { playerName, team, opposition, overs } = req.body;
      if (!playerName || !team || !opposition || overs === void 0) {
        return res.status(400).json({
          error: "Missing required fields: playerName, team, opposition, overs"
        });
      }
      const { execSync } = __require("child_process");
      const path3 = __require("path");
      try {
        const mlScript = path3.join(__dirname, "mlService.py");
        const pythonCommand = `python "${mlScript}" predict_bowling "${playerName}" "${team}" "${opposition}" ${overs}`;
        const result = execSync(pythonCommand, { encoding: "utf8", timeout: 1e4 });
        const prediction = JSON.parse(result);
        res.json({
          success: true,
          prediction,
          timestamp: /* @__PURE__ */ new Date()
        });
      } catch (pythonError) {
        console.warn("Python ML service failed, using fallback prediction:", pythonError);
        const baseWickets = Math.floor(Math.random() * 4) + 1;
        const economy = 4.5 + Math.random() * 3;
        res.json({
          success: true,
          prediction: {
            player: playerName,
            team,
            opposition,
            predicted_wickets: baseWickets,
            ensemble_prediction: baseWickets,
            confidence: 0.72,
            model_used: "fallback",
            insights: [
              `Predicted ${baseWickets} wickets in ${overs} overs`,
              baseWickets >= 2 ? "Good wicket-taking opportunity" : "Focus on economy",
              `Against ${opposition}, vary pace and line`
            ],
            input_parameters: { overs, estimated_economy: economy }
          },
          timestamp: /* @__PURE__ */ new Date(),
          source: "fallback"
        });
      }
    } catch (error) {
      console.error("Error in bowling prediction:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/v2/ml/analytics/:playerId", authenticateToken, async (req, res) => {
    try {
      const { playerId } = req.params;
      const { format = "all" } = req.query;
      const player = await Player.findById(playerId);
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }
      const recentMatches = await PlayerPerformance.find({ playerId }).sort({ createdAt: -1 }).limit(10).populate("matchId", "date venue format");
      const analytics = {
        playerId,
        playerName: player.name,
        performanceTrends: {
          last10Matches: recentMatches.map((match) => match.points || 0),
          formCurve: "upward",
          consistency: 0.78 + Math.random() * 0.2
        },
        predictiveMetrics: {
          nextMatchPrediction: 65 + Math.floor(Math.random() * 30),
          seasonProjection: 75 + Math.floor(Math.random() * 20),
          injuryRisk: Math.random() * 0.3,
          formSustainability: 0.7 + Math.random() * 0.3
        },
        comparativeAnalysis: {
          teamRanking: Math.floor(Math.random() * 10) + 1,
          roleRanking: Math.floor(Math.random() * 15) + 1,
          globalRanking: Math.floor(Math.random() * 50) + 1
        },
        recommendations: [
          "Focus on consistency in middle overs",
          "Improve performance against pace bowling",
          "Maintain current fitness regime"
        ],
        strengthsAndWeaknesses: {
          strengths: ["Excellent technique", "Good temperament", "Strong finishing"],
          weaknesses: ["Struggles against spin", "Inconsistent in pressure situations"]
        }
      };
      res.json({
        success: true,
        analytics,
        timestamp: /* @__PURE__ */ new Date()
      });
    } catch (error) {
      console.error("Error fetching ML analytics:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/v2/ml/team-analytics/:teamId", authenticateToken, async (req, res) => {
    try {
      const { teamId } = req.params;
      const team = await Team.findById(teamId).populate("players");
      if (!team) {
        return res.status(404).json({ error: "Team not found" });
      }
      const analytics = {
        teamId,
        teamName: team.name,
        overallStrength: 75 + Math.floor(Math.random() * 20),
        battingStrength: 70 + Math.floor(Math.random() * 25),
        bowlingStrength: 80 + Math.floor(Math.random() * 20),
        fieldingStrength: 85 + Math.floor(Math.random() * 15),
        weaknesses: ["Death over bowling", "Lower order batting"],
        strengths: ["Top order batting", "Pace bowling attack"],
        recommendedPlaying11: [],
        injuryReport: {
          currentInjuries: Math.floor(Math.random() * 3),
          recoveryTimeline: "2-3 weeks",
          fitnessAlert: []
        },
        predictedPerformance: {
          nextMatch: {
            winProbability: 0.5 + Math.random() * 0.4,
            keyFactors: ["Recent form", "Home advantage", "Opposition strength"]
          }
        }
      };
      res.json({
        success: true,
        analytics,
        timestamp: /* @__PURE__ */ new Date()
      });
    } catch (error) {
      console.error("Error fetching team ML analytics:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/v2/ml/match-prediction", authenticateToken, async (req, res) => {
    try {
      const { team1Id, team2Id, venue, conditions } = req.body;
      if (!team1Id || !team2Id) {
        return res.status(400).json({ error: "Both team IDs are required" });
      }
      const [team1, team2] = await Promise.all([
        Team.findById(team1Id),
        Team.findById(team2Id)
      ]);
      if (!team1 || !team2) {
        return res.status(404).json({ error: "One or both teams not found" });
      }
      const prediction = {
        matchId: `pred_${Date.now()}`,
        teams: {
          team1: { name: team1.name, shortName: team1.shortName },
          team2: { name: team2.name, shortName: team2.shortName }
        },
        winProbability: {
          [team1.name]: 0.4 + Math.random() * 0.4,
          [team2.name]: 0.4 + Math.random() * 0.4
        },
        keyFactors: [
          "Recent form comparison",
          "Head-to-head record",
          "Venue advantage",
          "Player availability",
          "Weather conditions"
        ],
        topPerformers: {
          batsmen: ["Player 1", "Player 2"],
          bowlers: ["Bowler 1", "Bowler 2"]
        },
        predictedScores: {
          [team1.name]: 250 + Math.floor(Math.random() * 100),
          [team2.name]: 240 + Math.floor(Math.random() * 100)
        },
        confidence: 0.75 + Math.random() * 0.2
      };
      res.json({
        success: true,
        prediction,
        timestamp: /* @__PURE__ */ new Date()
      });
    } catch (error) {
      console.error("Error in match prediction:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/v2/ml/status", authenticateToken, async (req, res) => {
    try {
      const status = {
        service: "operational",
        models: {
          batting: ["decision_tree", "random_forest", "xgboost", "linear_regression"],
          bowling: ["decision_tree", "random_forest", "xgboost", "linear_regression"]
        },
        lastTrained: /* @__PURE__ */ new Date(),
        version: "1.0.0",
        supportedPredictions: ["batting_performance", "bowling_performance", "match_outcome"],
        accuracy: {
          batting: 0.78,
          bowling: 0.74,
          match: 0.72
        }
      };
      res.json({
        success: true,
        status,
        timestamp: /* @__PURE__ */ new Date()
      });
    } catch (error) {
      console.error("Error fetching ML status:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/v2/sync/all", authenticateToken, requireRole(["admin", "coach"]), async (req, res) => {
    try {
      await dataSyncService.syncAllData();
      res.json({
        success: true,
        message: "Complete data sync initiated",
        timestamp: /* @__PURE__ */ new Date()
      });
    } catch (error) {
      console.error("Error in complete data sync:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/v2/sync/players", authenticateToken, requireRole(["admin", "coach"]), async (req, res) => {
    try {
      const { limit = 500 } = req.body;
      await dataSyncService.syncPlayers(limit);
      res.json({
        success: true,
        message: `Player data sync completed (limit: ${limit})`,
        timestamp: /* @__PURE__ */ new Date()
      });
    } catch (error) {
      console.error("Error syncing players:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/v2/sync/matches", authenticateToken, requireRole(["admin", "coach"]), async (req, res) => {
    try {
      const { limit = 200 } = req.body;
      await dataSyncService.syncMatches(limit);
      res.json({
        success: true,
        message: `Match data sync completed (limit: ${limit})`,
        timestamp: /* @__PURE__ */ new Date()
      });
    } catch (error) {
      console.error("Error syncing matches:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/v2/sync/series", authenticateToken, requireRole(["admin", "coach"]), async (req, res) => {
    try {
      await dataSyncService.syncSeries();
      res.json({
        success: true,
        message: "Series data sync completed",
        timestamp: /* @__PURE__ */ new Date()
      });
    } catch (error) {
      console.error("Error syncing series:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/v2/sync/countries", authenticateToken, requireRole(["admin", "coach"]), async (req, res) => {
    try {
      await dataSyncService.syncCountries();
      res.json({
        success: true,
        message: "Countries data sync completed",
        timestamp: /* @__PURE__ */ new Date()
      });
    } catch (error) {
      console.error("Error syncing countries:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.post("/api/v2/sync/search-players", authenticateToken, async (req, res) => {
    try {
      const { searchTerm } = req.body;
      if (!searchTerm) {
        return res.status(400).json({ error: "Search term is required" });
      }
      await dataSyncService.searchAndSyncPlayers(searchTerm);
      res.json({
        success: true,
        message: `Players search and sync completed for: ${searchTerm}`,
        timestamp: /* @__PURE__ */ new Date()
      });
    } catch (error) {
      console.error("Error in search and sync players:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/v2/countries", async (req, res) => {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
      const skip = (page - 1) * limit;
      const countries = await Country.find().sort({ name: 1 }).skip(skip).limit(limit);
      const total = await Country.countDocuments();
      res.json({
        countries,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error("Error fetching countries:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/v2/series", async (req, res) => {
    try {
      const page = Math.max(1, parseInt(req.query.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 50));
      const skip = (page - 1) * limit;
      const series = await Series.find().sort({ startDate: -1 }).skip(skip).limit(limit);
      const total = await Series.countDocuments();
      res.json({
        series,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (error) {
      console.error("Error fetching series:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/v2/series/:id", async (req, res) => {
    try {
      const { id } = req.params;
      let series = await Series.findOne({ cricApiId: id });
      if (!series) {
        series = await Series.findById(id);
      }
      if (!series) {
        return res.status(404).json({ error: "Series not found" });
      }
      let detailedInfo = null;
      if (series.cricApiId) {
        try {
          const response = await cricApiService.getSeriesInfo(series.cricApiId);
          detailedInfo = response.data;
        } catch (error) {
          console.warn(`Could not fetch detailed series info for ${series.cricApiId}:`, error);
        }
      }
      res.json({
        series,
        detailedInfo
      });
    } catch (error) {
      console.error("Error fetching series:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/v2/cricapi/match/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const matchDetails = await dataSyncService.getMatchDetails(id);
      if (!matchDetails) {
        return res.status(404).json({ error: "Match details not found" });
      }
      res.json({
        success: true,
        match: matchDetails,
        timestamp: /* @__PURE__ */ new Date()
      });
    } catch (error) {
      console.error("Error fetching match details:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/v2/cricapi/player/:id", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const playerDetails = await dataSyncService.getPlayerDetails(id);
      if (!playerDetails) {
        return res.status(404).json({ error: "Player details not found" });
      }
      res.json({
        success: true,
        player: playerDetails,
        timestamp: /* @__PURE__ */ new Date()
      });
    } catch (error) {
      console.error("Error fetching player details:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/v2/cricapi/match/:id/squad", authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const squad = await dataSyncService.getMatchSquad(id);
      if (!squad) {
        return res.status(404).json({ error: "Match squad not found" });
      }
      res.json({
        success: true,
        squad,
        timestamp: /* @__PURE__ */ new Date()
      });
    } catch (error) {
      console.error("Error fetching match squad:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/v2/cricapi/current-matches", authenticateToken, async (req, res) => {
    try {
      const response = await cricApiService.getCurrentMatches();
      res.json({
        success: true,
        matches: response.data,
        info: response.info,
        timestamp: /* @__PURE__ */ new Date()
      });
    } catch (error) {
      console.error("Error fetching current matches:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/v2/cricapi/recent-matches", authenticateToken, async (req, res) => {
    try {
      const response = await cricApiService.getRecentMatches();
      res.json({
        success: true,
        matches: response.data,
        info: response.info,
        timestamp: /* @__PURE__ */ new Date()
      });
    } catch (error) {
      console.error("Error fetching recent matches:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });
  app2.get("/api/v2/saved-analysis", authenticateToken, async (req, res) => {
    try {
      const { type, limit = "20" } = req.query;
      const { AnalysisService: AnalysisService2 } = await Promise.resolve().then(() => (init_analysisSchemas(), analysisSchemas_exports));
      const analyses = await AnalysisService2.getUserAnalyses(
        req.user.id,
        type,
        parseInt(limit)
      );
      res.json({ analyses });
    } catch (error) {
      console.error("Error fetching saved analyses:", error);
      res.status(500).json({ error: "Failed to fetch saved analyses" });
    }
  });
  app2.post("/api/v2/saved-analysis", authenticateToken, async (req, res) => {
    try {
      const { AnalysisService: AnalysisService2 } = await Promise.resolve().then(() => (init_analysisSchemas(), analysisSchemas_exports));
      const analysisData = {
        title: req.body.title,
        description: req.body.description,
        analysisType: req.body.analysisType,
        analysisData: req.body.analysisData,
        tags: req.body.tags || [],
        isPublic: req.body.isPublic || false
      };
      const savedAnalysis = await AnalysisService2.saveUserAnalysis(req.user.id, analysisData);
      await AnalysisService2.logUserActivity(req.user.id, "save_analysis", {
        analysisId: savedAnalysis._id,
        analysisType: analysisData.analysisType
      });
      res.status(201).json({
        message: "Analysis saved successfully",
        analysis: savedAnalysis
      });
    } catch (error) {
      console.error("Error saving analysis:", error);
      res.status(500).json({ error: "Failed to save analysis" });
    }
  });
  app2.put("/api/v2/saved-analysis/:id", authenticateToken, async (req, res) => {
    try {
      const { SavedAnalysis: SavedAnalysis3 } = await Promise.resolve().then(() => (init_analysisSchemas(), analysisSchemas_exports));
      const analysisId = req.params.id;
      const analysis = await SavedAnalysis3.findOneAndUpdate(
        { _id: analysisId, userId: req.user.id },
        {
          title: req.body.title,
          description: req.body.description,
          analysisData: req.body.analysisData,
          tags: req.body.tags,
          isPublic: req.body.isPublic
        },
        { new: true }
      );
      if (!analysis) {
        return res.status(404).json({ error: "Analysis not found" });
      }
      res.json({
        message: "Analysis updated successfully",
        analysis
      });
    } catch (error) {
      console.error("Error updating analysis:", error);
      res.status(500).json({ error: "Failed to update analysis" });
    }
  });
  app2.delete("/api/v2/saved-analysis/:id", authenticateToken, async (req, res) => {
    try {
      const { SavedAnalysis: SavedAnalysis3 } = await Promise.resolve().then(() => (init_analysisSchemas(), analysisSchemas_exports));
      const analysisId = req.params.id;
      const result = await SavedAnalysis3.deleteOne({
        _id: analysisId,
        userId: req.user.id
      });
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Analysis not found" });
      }
      res.json({ message: "Analysis deleted successfully" });
    } catch (error) {
      console.error("Error deleting analysis:", error);
      res.status(500).json({ error: "Failed to delete analysis" });
    }
  });
  app2.get("/api/v2/favorite-players", authenticateToken, async (req, res) => {
    try {
      const { AnalysisService: AnalysisService2 } = await Promise.resolve().then(() => (init_analysisSchemas(), analysisSchemas_exports));
      const favorites = await AnalysisService2.getFavoriteplayers(req.user.id);
      res.json({ favorites });
    } catch (error) {
      console.error("Error fetching favorite players:", error);
      res.status(500).json({ error: "Failed to fetch favorite players" });
    }
  });
  app2.post("/api/v2/favorite-players", authenticateToken, async (req, res) => {
    try {
      const { AnalysisService: AnalysisService2 } = await Promise.resolve().then(() => (init_analysisSchemas(), analysisSchemas_exports));
      const playerData = {
        playerId: req.body.playerId,
        playerName: req.body.playerName,
        playerRole: req.body.playerRole,
        nationality: req.body.nationality,
        teamName: req.body.teamName,
        notes: req.body.notes || "",
        tags: req.body.tags || []
      };
      const favorite = await AnalysisService2.addFavoritePlayer(req.user.id, playerData);
      await AnalysisService2.logUserActivity(req.user.id, "favorite_player", {
        playerId: playerData.playerId,
        playerName: playerData.playerName
      });
      res.status(201).json({
        message: "Player added to favorites",
        favorite
      });
    } catch (error) {
      if (error.message === "Player already in favorites") {
        return res.status(409).json({ error: "Player already in favorites" });
      }
      console.error("Error adding favorite player:", error);
      res.status(500).json({ error: "Failed to add player to favorites" });
    }
  });
  app2.delete("/api/v2/favorite-players/:playerId", authenticateToken, async (req, res) => {
    try {
      const { AnalysisService: AnalysisService2 } = await Promise.resolve().then(() => (init_analysisSchemas(), analysisSchemas_exports));
      const playerId = req.params.playerId;
      const result = await AnalysisService2.removeFavoritePlayer(req.user.id, playerId);
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: "Favorite player not found" });
      }
      res.json({ message: "Player removed from favorites" });
    } catch (error) {
      console.error("Error removing favorite player:", error);
      res.status(500).json({ error: "Failed to remove player from favorites" });
    }
  });
  app2.get("/api/v2/user/preferences", authenticateToken, async (req, res) => {
    try {
      const { AnalysisService: AnalysisService2 } = await Promise.resolve().then(() => (init_analysisSchemas(), analysisSchemas_exports));
      const preferences = await AnalysisService2.getUserPreferences(req.user.id);
      res.json({ preferences });
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      res.status(500).json({ error: "Failed to fetch user preferences" });
    }
  });
  app2.put("/api/v2/user/preferences", authenticateToken, async (req, res) => {
    try {
      const { AnalysisService: AnalysisService2 } = await Promise.resolve().then(() => (init_analysisSchemas(), analysisSchemas_exports));
      const preferences = await AnalysisService2.updateUserPreferences(req.user.id, req.body.preferences);
      res.json({
        message: "Preferences updated successfully",
        preferences
      });
    } catch (error) {
      console.error("Error updating user preferences:", error);
      res.status(500).json({ error: "Failed to update user preferences" });
    }
  });
  app2.get("/api/v2/players/search", authenticateToken, async (req, res) => {
    try {
      const { query, role, team, form, nationality, limit = "20" } = req.query;
      const { searchPlayers: searchPlayers2 } = await Promise.resolve().then(() => (init_mockPlayers(), mockPlayers_exports));
      const filters = {
        role,
        team,
        form,
        nationality
      };
      const players = searchPlayers2(query || "", filters);
      const { AnalysisService: AnalysisService2 } = await Promise.resolve().then(() => (init_analysisSchemas(), analysisSchemas_exports));
      await AnalysisService2.logUserActivity(req.user.id, "search_player", {
        searchQuery: query,
        filters
      });
      res.json({
        players: players.slice(0, parseInt(limit)),
        total: players.length
      });
    } catch (error) {
      console.error("Error searching players:", error);
      res.status(500).json({ error: "Failed to search players" });
    }
  });
  app2.get("/api/v2/players/:playerId", authenticateToken, async (req, res) => {
    try {
      const playerId = req.params.playerId;
      const { getPlayerById: getPlayerById2 } = await Promise.resolve().then(() => (init_mockPlayers(), mockPlayers_exports));
      const player = getPlayerById2(playerId);
      if (!player) {
        return res.status(404).json({ error: "Player not found" });
      }
      const { AnalysisService: AnalysisService2 } = await Promise.resolve().then(() => (init_analysisSchemas(), analysisSchemas_exports));
      await AnalysisService2.logUserActivity(req.user.id, "view_player", {
        playerId: player._id,
        playerName: player.name
      });
      res.json({ player });
    } catch (error) {
      console.error("Error fetching player details:", error);
      res.status(500).json({ error: "Failed to fetch player details" });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"]
    },
    proxy: {
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
        secure: false
      }
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/mongodb.ts
import mongoose4 from "mongoose";
var MONGODB_URL = process.env.MONGODB_URL || "mongodb://localhost:27017/testcricketdb";
var DatabaseConnection = class _DatabaseConnection {
  static instance;
  isConnected = false;
  constructor() {
  }
  static getInstance() {
    if (!_DatabaseConnection.instance) {
      _DatabaseConnection.instance = new _DatabaseConnection();
    }
    return _DatabaseConnection.instance;
  }
  async connect() {
    if (this.isConnected) {
      console.log("\u{1F504} MongoDB already connected");
      return;
    }
    try {
      await mongoose4.connect(MONGODB_URL, {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5e3,
        socketTimeoutMS: 45e3,
        bufferCommands: false
      });
      this.isConnected = true;
      console.log("\u{1F7E2} MongoDB connected successfully to:", MONGODB_URL);
      mongoose4.connection.on("error", (error) => {
        console.error("\u274C MongoDB connection error:", error);
        this.isConnected = false;
      });
      mongoose4.connection.on("disconnected", () => {
        console.log("\u{1F534} MongoDB disconnected");
        this.isConnected = false;
      });
      mongoose4.connection.on("reconnected", () => {
        console.log("\u{1F7E2} MongoDB reconnected");
        this.isConnected = true;
      });
    } catch (error) {
      console.error("\u274C MongoDB connection failed:", error);
      this.isConnected = false;
      throw error;
    }
  }
  async disconnect() {
    if (!this.isConnected) {
      return;
    }
    try {
      await mongoose4.disconnect();
      this.isConnected = false;
      console.log("\u{1F534} MongoDB disconnected successfully");
    } catch (error) {
      console.error("\u274C Error disconnecting from MongoDB:", error);
      throw error;
    }
  }
  getConnectionStatus() {
    return this.isConnected;
  }
};
var dbConnection = DatabaseConnection.getInstance();

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  try {
    await dbConnection.connect();
    log("MongoDB connected successfully");
    console.log("Initializing CricAPI data sync...");
    await dataSyncService.initialize();
    console.log("CricAPI data sync initialized");
    log("Updating fantasy points...");
    await fantasyPointsService.updateFantasyPointsForCompletedMatches();
    log("Fantasy points updated");
  } catch (error) {
    console.error("Failed to initialize services:", error);
    console.log("Continuing without data sync initialization...");
  }
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  const host = process.env.NODE_ENV === "development" ? "localhost" : "0.0.0.0";
  server.listen(port, host, () => {
    log(`PitchPoint server running on http://${host}:${port}`);
    log(` API available at http://${host}:${port}/api`);
    log(` Environment: ${process.env.NODE_ENV || "development"}`);
    log(` MongoDB: ${dbConnection.getConnectionStatus() ? "Connected" : "Disconnected"}`);
  });
  process.on("SIGINT", async () => {
    console.log("\nShutting down...");
    await dbConnection.disconnect();
    process.exit(0);
  });
})();
