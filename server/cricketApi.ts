import { storage } from './storage';

// Mock external cricket API interface
interface ExternalApiMatch {
  id: string;
  name: string;
  status: string;
  venue: string;
  date: string;
  teams: {
    home: {
      name: string;
      score?: {
        runs: number;
        wickets: number;
        overs: number;
      };
    };
    away: {
      name: string;
      score?: {
        runs: number;
        wickets: number;
        overs: number;
      };
    };
  };
  result?: string;
  format: string;
}

interface ExternalApiPlayer {
  id: string;
  name: string;
  country: string;
  role: string;
  batting_style?: string;
  bowling_style?: string;
  stats: {
    batting?: {
      matches: number;
      runs: number;
      average: number;
      strike_rate: number;
      centuries: number;
      half_centuries: number;
    };
    bowling?: {
      matches: number;
      wickets: number;
      average: number;
      economy: number;
      best_figures: string;
    };
  };
}

class CricketApiService {
  private readonly baseUrl = 'https://api.cricapi.com/v1'; // Example API
  private readonly apiKey = process.env.CRICKET_API_KEY || 'demo_key';
  
  private async makeRequest<T>(endpoint: string): Promise<T> {
    try {
      // Check cache first
      const cacheKey = `cricket_api_${endpoint}`;
      const cachedData = await storage.getCachedData(cacheKey);
      
      if (cachedData) {
        console.log(`Cache hit for ${endpoint}`);
        return cachedData;
      }

      console.log(`Fetching data from external API: ${endpoint}`);
      
      // For development, return mock data to avoid API rate limits
      const mockData = this.getMockData(endpoint);
      
      // Cache the data for 15 minutes
      await storage.setCachedData(cacheKey, mockData, 15);
      
      return mockData;
      
      // Uncomment below for real API calls
      /*
      const response = await fetch(`${this.baseUrl}${endpoint}?apikey=${this.apiKey}`);
      
      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Cache successful responses for 15 minutes
      await storage.setCachedData(cacheKey, data, 15);
      
      return data;
      */
    } catch (error) {
      console.error(`Error fetching from cricket API: ${endpoint}`, error);
      throw error;
    }
  }

  private getMockData(endpoint: string): any {
    // Return mock data based on endpoint
    if (endpoint.includes('/matches')) {
      return {
        data: [
          {
            id: 'match_live_001',
            name: 'India vs Australia, 1st T20I',
            status: 'Live',
            venue: 'Melbourne Cricket Ground, Melbourne',
            date: new Date().toISOString(),
            teams: {
              home: {
                name: 'India',
                score: { runs: 185, wickets: 4, overs: 18.2 }
              },
              away: {
                name: 'Australia', 
                score: { runs: 188, wickets: 6, overs: 19.5 }
              }
            },
            format: 'T20'
          },
          {
            id: 'match_upcoming_001',
            name: 'England vs South Africa, 2nd ODI',
            status: 'Upcoming',
            venue: 'Lord\'s Cricket Ground, London',
            date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
            teams: {
              home: { name: 'England' },
              away: { name: 'South Africa' }
            },
            format: 'ODI'
          }
        ]
      };
    }

    if (endpoint.includes('/players')) {
      return {
        data: [
          {
            id: 'player_001',
            name: 'Virat Kohli',
            country: 'India',
            role: 'Batsman',
            batting_style: 'Right-hand bat',
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

  async getLiveMatches(): Promise<ExternalApiMatch[]> {
    const response = await this.makeRequest<{ data: ExternalApiMatch[] }>('/matches?status=live');
    return response.data || [];
  }

  async getUpcomingMatches(): Promise<ExternalApiMatch[]> {
    const response = await this.makeRequest<{ data: ExternalApiMatch[] }>('/matches?status=upcoming');
    return response.data || [];
  }

  async getRecentMatches(): Promise<ExternalApiMatch[]> {
    const response = await this.makeRequest<{ data: ExternalApiMatch[] }>('/matches?status=completed');
    return response.data || [];
  }

  async getPlayerInfo(playerId: string): Promise<ExternalApiPlayer | null> {
    try {
      const response = await this.makeRequest<{ data: ExternalApiPlayer }>(`/players/${playerId}`);
      return response.data || null;
    } catch (error) {
      console.error(`Error fetching player ${playerId}:`, error);
      return null;
    }
  }

  async getTeamPlayers(teamName: string): Promise<ExternalApiPlayer[]> {
    const response = await this.makeRequest<{ data: ExternalApiPlayer[] }>(`/players?team=${teamName}`);
    return response.data || [];
  }

  async getPlayers(offset: number = 0, limit: number = 100): Promise<{ data: ExternalApiPlayer[] }> {
    try {
      // For now, return famous cricket players as the API might not have a players endpoint
      const famousPlayers: ExternalApiPlayer[] = [
        {
          id: 'player_virat_kohli',
          name: 'Virat Kohli',
          role: 'batsman',
          country: 'India',
          battingStyle: 'Right-hand bat',
          bowlingStyle: 'Right-arm medium',
          placeOfBirth: 'Delhi, India',
          dateOfBirth: '1988-11-05',
          stats: {
            batting: { matches: 254, runs: 12169, average: 57.32, strike_rate: 93.17, centuries: 43, half_centuries: 64 },
            bowling: { matches: 254, wickets: 4, average: 166.25, economy: 6.15, best_figures: '1/15' }
          }
        },
        {
          id: 'player_rohit_sharma',
          name: 'Rohit Sharma',
          role: 'batsman',
          country: 'India',
          battingStyle: 'Right-hand bat',
          bowlingStyle: 'Right-arm off break',
          placeOfBirth: 'Nagpur, India',
          dateOfBirth: '1987-04-30',
          stats: {
            batting: { matches: 243, runs: 9205, average: 48.19, strike_rate: 88.90, centuries: 29, half_centuries: 43 },
            bowling: { matches: 243, wickets: 8, average: 61.62, economy: 5.30, best_figures: '2/27' }
          }
        },
        {
          id: 'player_ms_dhoni',
          name: 'MS Dhoni',
          role: 'wicket-keeper',
          country: 'India',
          battingStyle: 'Right-hand bat',
          bowlingStyle: 'Right-arm medium',
          placeOfBirth: 'Ranchi, India',
          dateOfBirth: '1981-07-07',
          stats: {
            batting: { matches: 350, runs: 10773, average: 50.57, strike_rate: 87.56, centuries: 10, half_centuries: 73 },
            bowling: { matches: 350, wickets: 1, average: 109.00, economy: 5.45, best_figures: '1/9' }
          }
        },
        {
          id: 'player_hardik_pandya',
          name: 'Hardik Pandya',
          role: 'all-rounder',
          country: 'India',
          battingStyle: 'Right-hand bat',
          bowlingStyle: 'Right-arm fast-medium',
          placeOfBirth: 'Surat, India',
          dateOfBirth: '1993-10-11',
          stats: {
            batting: { matches: 74, runs: 1456, average: 32.35, strike_rate: 113.91, centuries: 0, half_centuries: 2 },
            bowling: { matches: 74, wickets: 76, average: 33.90, economy: 5.96, best_figures: '4/24' }
          }
        },
        {
          id: 'player_jasprit_bumrah',
          name: 'Jasprit Bumrah',
          role: 'bowler',
          country: 'India',
          battingStyle: 'Right-hand bat',
          bowlingStyle: 'Right-arm fast',
          placeOfBirth: 'Ahmedabad, India',
          dateOfBirth: '1993-12-06',
          stats: {
            batting: { matches: 72, runs: 28, average: 9.33, strike_rate: 71.79, centuries: 0, half_centuries: 0 },
            bowling: { matches: 72, wickets: 121, average: 24.43, economy: 4.63, best_figures: '6/19' }
          }
        },
        {
          id: 'player_ravindra_jadeja',
          name: 'Ravindra Jadeja',
          role: 'all-rounder',
          country: 'India',
          battingStyle: 'Left-hand bat',
          bowlingStyle: 'Left-arm orthodox spin',
          placeOfBirth: 'Navagam-Khed, India',
          dateOfBirth: '1988-12-06',
          stats: {
            batting: { matches: 174, runs: 2756, average: 32.74, strike_rate: 86.83, centuries: 0, half_centuries: 13 },
            bowling: { matches: 174, wickets: 220, average: 33.37, economy: 4.86, best_figures: '5/33' }
          }
        },
        {
          id: 'player_kl_rahul',
          name: 'KL Rahul',
          role: 'wicket-keeper',
          country: 'India',
          battingStyle: 'Right-hand bat',
          bowlingStyle: 'Right-arm off break',
          placeOfBirth: 'Mangalore, India',
          dateOfBirth: '1992-04-18',
          stats: {
            batting: { matches: 46, runs: 2077, average: 45.15, strike_rate: 84.26, centuries: 6, half_centuries: 13 },
            bowling: { matches: 46, wickets: 0, average: 0, economy: 0, best_figures: '0/0' }
          }
        },
        {
          id: 'player_babar_azam',
          name: 'Babar Azam',
          role: 'batsman',
          country: 'Pakistan',
          battingStyle: 'Right-hand bat',
          bowlingStyle: 'Right-arm off break',
          placeOfBirth: 'Lahore, Pakistan',
          dateOfBirth: '1994-10-15',
          stats: {
            batting: { matches: 102, runs: 4442, average: 56.95, strike_rate: 88.28, centuries: 17, half_centuries: 21 },
            bowling: { matches: 102, wickets: 0, average: 0, economy: 0, best_figures: '0/0' }
          }
        },
        {
          id: 'player_joe_root',
          name: 'Joe Root',
          role: 'batsman',
          country: 'England',
          battingStyle: 'Right-hand bat',
          bowlingStyle: 'Right-arm off break',
          placeOfBirth: 'Sheffield, England',
          dateOfBirth: '1990-12-30',
          stats: {
            batting: { matches: 156, runs: 6109, average: 47.36, strike_rate: 86.58, centuries: 16, half_centuries: 35 },
            bowling: { matches: 156, wickets: 27, average: 41.40, economy: 4.71, best_figures: '2/6' }
          }
        },
        {
          id: 'player_steve_smith',
          name: 'Steve Smith',
          role: 'batsman',
          country: 'Australia',
          battingStyle: 'Right-hand bat',
          bowlingStyle: 'Right-arm leg break',
          placeOfBirth: 'Sydney, Australia',
          dateOfBirth: '1989-06-02',
          stats: {
            batting: { matches: 138, runs: 4378, average: 43.34, strike_rate: 88.34, centuries: 12, half_centuries: 27 },
            bowling: { matches: 138, wickets: 28, average: 41.25, economy: 4.84, best_figures: '3/18' }
          }
        }
      ];

      // Simulate pagination
      const start = offset;
      const end = Math.min(start + limit, famousPlayers.length);
      const paginatedPlayers = famousPlayers.slice(start, end);

      return { data: paginatedPlayers };
    } catch (error) {
      console.error('Error fetching players:', error);
      return { data: [] };
    }
  }

  async getSeries(): Promise<{ data: any[] }> {
    try {
      // Return mock series data for major cricket series
      const majorSeries = [
        {
          id: 'series_ipl_2024',
          name: 'Indian Premier League 2024',
          startDate: '2024-03-22',
          endDate: '2024-05-26',
          odi: 0,
          t20: 1,
          test: 0,
          squads: 10,
          matches: 74
        },
        {
          id: 'series_wc_2023',
          name: 'ICC Cricket World Cup 2023',
          startDate: '2023-10-05',
          endDate: '2023-11-19',
          odi: 1,
          t20: 0,
          test: 0,
          squads: 10,
          matches: 48
        },
        {
          id: 'series_ind_vs_aus_2024',
          name: 'India vs Australia Test Series 2024',
          startDate: '2024-02-09',
          endDate: '2024-03-03',
          odi: 0,
          t20: 0,
          test: 1,
          squads: 2,
          matches: 4
        },
        {
          id: 'series_ind_vs_eng_2024',
          name: 'India vs England Test Series 2024',
          startDate: '2024-01-25',
          endDate: '2024-03-11',
          odi: 0,
          t20: 0,
          test: 1,
          squads: 2,
          matches: 5
        },
        {
          id: 'series_psl_2024',
          name: 'Pakistan Super League 2024',
          startDate: '2024-02-17',
          endDate: '2024-03-18',
          odi: 0,
          t20: 1,
          test: 0,
          squads: 6,
          matches: 34
        }
      ];

      return { data: majorSeries };
    } catch (error) {
      console.error('Error fetching series:', error);
      return { data: [] };
    }
  }

  async syncMatchData(): Promise<void> {
    try {
      console.log('Syncing match data from external API...');
      
      const [liveMatches, upcomingMatches, recentMatches] = await Promise.all([
        this.getLiveMatches(),
        this.getUpcomingMatches(),
        this.getRecentMatches()
      ]);

      // Process and update local database
      for (const apiMatch of [...liveMatches, ...upcomingMatches, ...recentMatches]) {
        await this.syncMatch(apiMatch);
      }

      console.log('Match data sync completed');
    } catch (error) {
      console.error('Error syncing match data:', error);
      throw error;
    }
  }

  private async syncMatch(apiMatch: ExternalApiMatch): Promise<void> {
    try {
      // Check if match exists by external ID
      const existingMatches = await storage.getMatches();
      const existingMatch = existingMatches.find(m => m.externalMatchId === apiMatch.id);

      if (existingMatch) {
        // Update existing match
        const status = this.mapApiStatusToLocal(apiMatch.status);
        const scores = {
          team1Score: apiMatch.teams.home.score ? 
            `${apiMatch.teams.home.score.runs}/${apiMatch.teams.home.score.wickets} (${apiMatch.teams.home.score.overs})` : 
            undefined,
          team2Score: apiMatch.teams.away.score ? 
            `${apiMatch.teams.away.score.runs}/${apiMatch.teams.away.score.wickets} (${apiMatch.teams.away.score.overs})` : 
            undefined,
          result: apiMatch.result
        };

        await storage.updateMatchStatus(existingMatch.id, status, scores);
      } else {
        // This would require finding teams by name and creating new match
        // For now, we'll skip creating new matches from API data
        console.log(`Skipping new match from API: ${apiMatch.name}`);
      }
    } catch (error) {
      console.error(`Error syncing match ${apiMatch.id}:`, error);
    }
  }

  private mapApiStatusToLocal(apiStatus: string): 'upcoming' | 'live' | 'completed' {
    const status = apiStatus.toLowerCase();
    if (status.includes('live') || status.includes('progress')) return 'live';
    if (status.includes('complete') || status.includes('finished')) return 'completed';
    return 'upcoming';
  }

  async getPlayerPerformanceTrends(playerId: string, format: string = 'all'): Promise<any> {
    const cacheKey = `player_trends_${playerId}_${format}`;
    
    // Check cache first
    const cachedData = await storage.getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // Mock performance trends data
    const trendsData = {
      playerId,
      format,
      recentForm: [
        { match: 'vs AUS', runs: 89, date: '2024-01-15' },
        { match: 'vs ENG', runs: 45, date: '2024-01-10' },
        { match: 'vs SA', runs: 112, date: '2024-01-05' },
        { match: 'vs NZ', runs: 67, date: '2024-01-01' },
        { match: 'vs WI', runs: 23, date: '2023-12-28' }
      ],
      seasonStats: {
        matches: 15,
        runs: 678,
        average: 52.1,
        strikeRate: 142.3,
        fifties: 4,
        hundreds: 2
      },
      strengths: ['Strong against pace', 'Excellent in powerplay', 'Good finisher'],
      weaknesses: ['Struggles against left-arm spin', 'Inconsistent in middle overs'],
      recommendation: format === 'T20' ? 'Ideal for top-order batting' : 'Strong middle-order option'
    };

    // Cache for 1 hour
    await storage.setCachedData(cacheKey, trendsData, 60);
    
    return trendsData;
  }

  async getTeamPerformanceAnalysis(teamId: string, opponentTeamId?: string): Promise<any> {
    const cacheKey = `team_analysis_${teamId}_${opponentTeamId || 'general'}`;
    
    const cachedData = await storage.getCachedData(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    // Mock team analysis data
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
        'Strong powerplay batting',
        'Effective death bowling',
        'Good fielding in pressure situations'
      ] : [
        'Balanced squad composition',
        'Strong batting depth',
        'Versatile bowling attack'
      ],
      weaknessesVsOpponent: opponentTeamId ? [
        'Vulnerable to spin in middle overs',
        'Inconsistent middle-order'
      ] : [
        'Over-dependence on top 3 batsmen',
        'Limited left-arm pace options'
      ],
      keyPlayers: [
        { name: 'Player A', impact: 'High', role: 'Batsman' },
        { name: 'Player B', impact: 'Medium', role: 'Bowler' }
      ],
      recommendedStrategy: 'Focus on building partnerships in middle overs and utilize spin-friendly conditions'
    };

    await storage.setCachedData(cacheKey, analysisData, 120); // Cache for 2 hours
    
    return analysisData;
  }
}

export const cricketApiService = new CricketApiService();
export type { ExternalApiMatch, ExternalApiPlayer };