import { FantasyPoints, PlayerPerformance, Match, Player } from '../shared/mongodb-schema';

export class FantasyPointsService {
  
  // Fantasy points calculation rules
  private readonly POINTS_RULES = {
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
    DUCK: -5, // For batsmen scoring 0
  };

  // Calculate fantasy points for a player's performance in a match
  async calculatePlayerFantasyPoints(
    matchId: string, 
    playerId: string, 
    performance: any
  ): Promise<number> {
    try {
      let totalPoints = 0;
      
      // Initialize point categories
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
        duck: 0,
      };

      // Batting points calculation
      if (performance.batting) {
        const batting = performance.batting;
        
        // Basic run points
        points.runs = (batting.runs || 0) * this.POINTS_RULES.RUN;
        totalPoints += points.runs;
        
        // Boundary points
        points.fours = (batting.fours || 0) * this.POINTS_RULES.FOUR;
        totalPoints += points.fours;
        
        points.sixes = (batting.sixes || 0) * this.POINTS_RULES.SIX;
        totalPoints += points.sixes;
        
        // Milestone bonuses
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
        
        // Duck penalty (only for batsmen who faced balls)
        if (runs === 0 && batting.ballsFaced > 0 && batting.isOut) {
          points.duck = this.POINTS_RULES.DUCK;
          totalPoints += points.duck;
        }
      }

      // Bowling points calculation
      if (performance.bowling) {
        const bowling = performance.bowling;
        
        // Wicket points
        const wickets = bowling.wickets || 0;
        points.wickets = wickets * this.POINTS_RULES.WICKET;
        totalPoints += points.wickets;
        
        // Maiden over points
        points.maidens = (bowling.maidens || 0) * this.POINTS_RULES.MAIDEN;
        totalPoints += points.maidens;
        
        // Wicket milestone bonuses
        if (wickets >= 5) {
          points.fiveWicketBonus = this.POINTS_RULES.FIVE_WICKET_BONUS;
          totalPoints += points.fiveWicketBonus;
        } else if (wickets >= 3) {
          points.threeWicketBonus = this.POINTS_RULES.THREE_WICKET_BONUS;
          totalPoints += points.threeWicketBonus;
        }
      }

      // Fielding points calculation
      if (performance.fielding) {
        const fielding = performance.fielding;
        
        points.catches = (fielding.catches || 0) * this.POINTS_RULES.CATCH;
        totalPoints += points.catches;
        
        points.stumps = (fielding.stumps || 0) * this.POINTS_RULES.STUMPING;
        totalPoints += points.stumps;
        
        points.runOuts = (fielding.runOuts || 0) * this.POINTS_RULES.RUN_OUT;
        totalPoints += points.runOuts;
      }

      // Store fantasy points in database
      await FantasyPoints.findOneAndUpdate(
        { matchId, playerId },
        {
          matchId,
          playerId,
          ...points,
          totalPoints,
        },
        { upsert: true, new: true }
      );

      return totalPoints;
    } catch (error) {
      console.error('Error calculating fantasy points:', error);
      throw error;
    }
  }

  // Calculate fantasy points for all players in a match
  async calculateMatchFantasyPoints(matchId: string): Promise<void> {
    try {
      console.log(`🎯 Calculating fantasy points for match ${matchId}...`);
      
      // Get all player performances for this match
      const performances = await PlayerPerformance.find({ matchId }).populate('playerId');
      
      for (const performance of performances) {
        await this.calculatePlayerFantasyPoints(
          matchId,
          performance.playerId.toString(),
          performance
        );
      }
      
      console.log(`✅ Fantasy points calculated for ${performances.length} players`);
    } catch (error) {
      console.error('Error calculating match fantasy points:', error);
      throw error;
    }
  }

  // Get fantasy points for a specific player
  async getPlayerFantasyPoints(playerId: string, matchId?: string): Promise<any> {
    try {
      const query: any = { playerId };
      if (matchId) {
        query.matchId = matchId;
      }

      const fantasyPoints = await FantasyPoints.find(query)
        .populate('matchId', 'team1Id team2Id scheduledAt matchType')
        .sort({ createdAt: -1 });

      return fantasyPoints;
    } catch (error) {
      console.error('Error getting player fantasy points:', error);
      throw error;
    }
  }

  // Get fantasy leaderboard for a match
  async getMatchFantasyLeaderboard(matchId: string): Promise<any[]> {
    try {
      const leaderboard = await FantasyPoints.find({ matchId })
        .populate('playerId', 'name image role nationality')
        .sort({ totalPoints: -1 })
        .limit(20);

      return leaderboard.map((entry, index) => ({
        rank: index + 1,
        player: entry.playerId,
        points: entry.totalPoints,
        breakdown: {
          batting: entry.runs + entry.fours + entry.sixes + entry.thirtyBonus + entry.fiftyBonus + entry.hundredBonus,
          bowling: entry.wickets + entry.maidens + entry.threeWicketBonus + entry.fiveWicketBonus,
          fielding: entry.catches + entry.stumps + entry.runOuts,
          penalty: entry.duck,
        },
      }));
    } catch (error) {
      console.error('Error getting fantasy leaderboard:', error);
      throw error;
    }
  }

  // Get overall fantasy leaderboard (cumulative points)
  async getOverallFantasyLeaderboard(limit: number = 50): Promise<any[]> {
    try {
      const leaderboard = await FantasyPoints.aggregate([
        {
          $group: {
            _id: '$playerId',
            totalPoints: { $sum: '$totalPoints' },
            matchesPlayed: { $sum: 1 },
            averagePoints: { $avg: '$totalPoints' },
            highestScore: { $max: '$totalPoints' },
          }
        },
        {
          $lookup: {
            from: 'players',
            localField: '_id',
            foreignField: '_id',
            as: 'player'
          }
        },
        {
          $unwind: '$player'
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
          nationality: entry.player.nationality,
        },
        totalPoints: entry.totalPoints,
        matchesPlayed: entry.matchesPlayed,
        averagePoints: Math.round(entry.averagePoints * 100) / 100,
        highestScore: entry.highestScore,
      }));
    } catch (error) {
      console.error('Error getting overall fantasy leaderboard:', error);
      throw error;
    }
  }

  // Get player's fantasy performance trends
  async getPlayerFantasyTrends(playerId: string, limit: number = 10): Promise<any[]> {
    try {
      const trends = await FantasyPoints.find({ playerId })
        .populate('matchId', 'team1Id team2Id scheduledAt matchType result')
        .sort({ createdAt: -1 })
        .limit(limit);

      return trends.map(trend => ({
        match: trend.matchId,
        points: trend.totalPoints,
        breakdown: {
          batting: trend.runs + trend.fours + trend.sixes + trend.thirtyBonus + trend.fiftyBonus + trend.hundredBonus,
          bowling: trend.wickets + trend.maidens + trend.threeWicketBonus + trend.fiveWicketBonus,
          fielding: trend.catches + trend.stumps + trend.runOuts,
          penalty: trend.duck,
        },
        date: trend.createdAt,
      }));
    } catch (error) {
      console.error('Error getting player fantasy trends:', error);
      throw error;
    }
  }

  // Calculate and update fantasy points for completed matches
  async updateFantasyPointsForCompletedMatches(): Promise<void> {
    try {
      console.log('Updating fantasy points for completed matches...');
      
      // Find completed matches that don't have fantasy points calculated
      const completedMatches = await Match.find({ 
        status: 'completed',
        completedAt: { $exists: true }
      });

      for (const match of completedMatches) {
        // Check if fantasy points already calculated
        const existingPoints = await FantasyPoints.findOne({ matchId: match._id });
        
        if (!existingPoints) {
          await this.calculateMatchFantasyPoints(match._id.toString());
        }
      }
      
      console.log(`Fantasy points updated for completed matches`);
    } catch (error) {
      console.error('Error updating fantasy points for completed matches:', error);
      throw error;
    }
  }

  // Get fantasy points summary for fans dashboard
  async getFantasySummary(): Promise<any> {
    try {
      const [topPerformers, recentMatches, totalPlayers] = await Promise.all([
        this.getOverallFantasyLeaderboard(5),
        FantasyPoints.find()
          .populate('matchId', 'team1Id team2Id scheduledAt matchType')
          .populate('playerId', 'name image')
          .sort({ createdAt: -1 })
          .limit(10),
        FantasyPoints.distinct('playerId').countDocuments()
      ]);

      return {
        topPerformers,
        recentMatches: recentMatches.map(fp => ({
          player: fp.playerId,
          match: fp.matchId,
          points: fp.totalPoints,
          date: fp.createdAt,
        })),
        totalPlayers,
        lastUpdated: new Date(),
      };
    } catch (error) {
      console.error('Error getting fantasy summary:', error);
      throw error;
    }
  }
}

export const fantasyPointsService = new FantasyPointsService();