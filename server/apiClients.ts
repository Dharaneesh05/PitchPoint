import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';

// Rate limiting helper
class RateLimiter {
  private requests: number[] = [];
  private maxRequests: number;
  private timeWindow: number;

  constructor(maxRequests: number, timeWindowMs: number) {
    this.maxRequests = maxRequests;
    this.timeWindow = timeWindowMs;
  }

  async waitIfNeeded(): Promise<void> {
    const now = Date.now();
    
    // Remove requests outside the time window
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    
    if (this.requests.length >= this.maxRequests) {
      const oldestRequest = this.requests[0];
      const waitTime = this.timeWindow - (now - oldestRequest);
      if (waitTime > 0) {
        console.log(`Rate limit reached, waiting ${waitTime}ms...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
    }
    
    this.requests.push(now);
  }
}

// CricData API Client
export class CricDataAPIClient {
  private client: AxiosInstance;
  private rateLimiter: RateLimiter;
  private apiKey: string;

  constructor() {
    this.apiKey = 'f836ea89-a2da-4470-89f9-4de0e0a04ac1';
    this.rateLimiter = new RateLimiter(100, 60000); // 100 requests per minute
    
    this.client = axios.create({
      baseURL: 'https://api.cricapi.com/v1',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for rate limiting
    this.client.interceptors.request.use(async (config) => {
      await this.rateLimiter.waitIfNeeded();
      config.params = { ...config.params, apikey: this.apiKey };
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('CricData API Error:', error.response?.data || error.message);
        throw error;
      }
    );
  }

  // Get live matches
  async getLiveMatches() {
    try {
      const response = await this.client.get('/currentMatches');
      return response.data;
    } catch (error) {
      console.error('Error fetching live matches:', error);
      throw error;
    }
  }

  // Get upcoming matches
  async getUpcomingMatches() {
    try {
      const response = await this.client.get('/matches');
      return response.data;
    } catch (error) {
      console.error('Error fetching upcoming matches:', error);
      throw error;
    }
  }

  // Get match details
  async getMatchDetails(matchId: string) {
    try {
      const response = await this.client.get(`/match_info`, {
        params: { id: matchId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching match details:', error);
      throw error;
    }
  }

  // Get basic player info
  async getPlayerInfo(playerId: string) {
    try {
      const response = await this.client.get(`/player_info`, {
        params: { id: playerId }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching player info:', error);
      throw error;
    }
  }

  // Get series list
  async getSeries() {
    try {
      const response = await this.client.get('/series');
      return response.data;
    } catch (error) {
      console.error('Error fetching series:', error);
      throw error;
    }
  }
}

// EntitySport API Client
export class EntitySportAPIClient {
  private client: AxiosInstance;
  private rateLimiter: RateLimiter;
  private apiKey: string;

  constructor() {
    this.apiKey = 'ec471071441bb2ac538a0ff901abd249';
    this.rateLimiter = new RateLimiter(50, 60000); // 50 requests per minute (conservative)
    
    this.client = axios.create({
      baseURL: 'https://api.entitysport.com/v2/matches',
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Add request interceptor for rate limiting and auth
    this.client.interceptors.request.use(async (config) => {
      await this.rateLimiter.waitIfNeeded();
      config.params = { ...config.params, token: this.apiKey };
      return config;
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        console.error('EntitySport API Error:', error.response?.data || error.message);
        throw error;
      }
    );
  }

  // Get all players with detailed stats
  async getPlayers() {
    try {
      const response = await this.client.get('/players');
      return response.data;
    } catch (error) {
      console.error('Error fetching players:', error);
      throw error;
    }
  }

  // Get player details with career stats
  async getPlayerDetails(playerId: string) {
    try {
      const response = await this.client.get(`/players/${playerId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching player details:', error);
      throw error;
    }
  }

  // Get all teams
  async getTeams() {
    try {
      const response = await this.client.get('/teams');
      return response.data;
    } catch (error) {
      console.error('Error fetching teams:', error);
      throw error;
    }
  }

  // Get team details with squad
  async getTeamDetails(teamId: string) {
    try {
      const response = await this.client.get(`/teams/${teamId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching team details:', error);
      throw error;
    }
  }

  // Get venues
  async getVenues() {
    try {
      const response = await this.client.get('/venues');
      return response.data;
    } catch (error) {
      console.error('Error fetching venues:', error);
      throw error;
    }
  }

  // Get venue details
  async getVenueDetails(venueId: string) {
    try {
      const response = await this.client.get(`/venues/${venueId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching venue details:', error);
      throw error;
    }
  }

  // Get matches by format (Test, ODI, T20)
  async getMatchesByFormat(format: 'test' | 'odi' | 't20') {
    try {
      const response = await this.client.get(`/matches`, {
        params: { format }
      });
      return response.data;
    } catch (error) {
      console.error(`Error fetching ${format} matches:`, error);
      throw error;
    }
  }

  // Get detailed match data with ball-by-ball
  async getMatchDetails(matchId: string) {
    try {
      const response = await this.client.get(`/matches/${matchId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching match details:', error);
      throw error;
    }
  }

  // Get ball-by-ball data
  async getBallByBall(matchId: string) {
    try {
      const response = await this.client.get(`/matches/${matchId}/commentary`);
      return response.data;
    } catch (error) {
      console.error('Error fetching ball-by-ball data:', error);
      throw error;
    }
  }

  // Get player stats for a specific match
  async getPlayerMatchStats(matchId: string, playerId: string) {
    try {
      const response = await this.client.get(`/matches/${matchId}/players/${playerId}/stats`);
      return response.data;
    } catch (error) {
      console.error('Error fetching player match stats:', error);
      throw error;
    }
  }

  // Get team rankings
  async getTeamRankings(format: 'test' | 'odi' | 't20') {
    try {
      const response = await this.client.get(`/rankings/teams/${format}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching team rankings:', error);
      throw error;
    }
  }

  // Get player rankings
  async getPlayerRankings(format: 'test' | 'odi' | 't20', type: 'batting' | 'bowling' | 'allrounder') {
    try {
      const response = await this.client.get(`/rankings/players/${format}/${type}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching player rankings:', error);
      throw error;
    }
  }
}

// API Client instances
export const cricDataClient = new CricDataAPIClient();
export const entitySportClient = new EntitySportAPIClient();

// Combined API service for data aggregation
export class CricketDataService {
  private cricData: CricDataAPIClient;
  private entitySport: EntitySportAPIClient;

  constructor() {
    this.cricData = cricDataClient;
    this.entitySport = entitySportClient;
  }

  // Get comprehensive player data from both APIs
  async getPlayerData(playerId: string) {
    try {
      const [cricDataPlayer, entitySportPlayer] = await Promise.allSettled([
        this.cricData.getPlayerInfo(playerId),
        this.entitySport.getPlayerDetails(playerId)
      ]);

      return {
        basic: cricDataPlayer.status === 'fulfilled' ? cricDataPlayer.value : null,
        detailed: entitySportPlayer.status === 'fulfilled' ? entitySportPlayer.value : null,
      };
    } catch (error) {
      console.error('Error getting comprehensive player data:', error);
      throw error;
    }
  }

  // Get comprehensive match data
  async getMatchData(matchId: string) {
    try {
      const [cricDataMatch, entitySportMatch] = await Promise.allSettled([
        this.cricData.getMatchDetails(matchId),
        this.entitySport.getMatchDetails(matchId)
      ]);

      return {
        basic: cricDataMatch.status === 'fulfilled' ? cricDataMatch.value : null,
        detailed: entitySportMatch.status === 'fulfilled' ? entitySportMatch.value : null,
      };
    } catch (error) {
      console.error('Error getting comprehensive match data:', error);
      throw error;
    }
  }

  // Get live match updates
  async getLiveUpdates() {
    try {
      const liveMatches = await this.cricData.getLiveMatches();
      return liveMatches;
    } catch (error) {
      console.error('Error getting live updates:', error);
      throw error;
    }
  }

  // Get upcoming matches for fans
  async getUpcomingMatches() {
    try {
      const upcomingMatches = await this.cricData.getUpcomingMatches();
      return upcomingMatches;
    } catch (error) {
      console.error('Error getting upcoming matches:', error);
      throw error;
    }
  }
}

export const cricketDataService = new CricketDataService();