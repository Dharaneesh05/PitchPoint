import axios from 'axios';

const CRIC_API_BASE_URL = 'https://api.cricapi.com/v1';
const API_KEY = 'f836ea89-a2da-4470-89f9-4de0e0a04ac1';

interface CricApiResponse<T> {
  apikey: string;
  data: T;
  status: string;
  info: {
    hitsToday: number;
    hitsUsed: number;
    hitsLimit: number;
    credits: number;
    server: number;
    offsetRows: number;
    totalRows: number;
    queryTime: number;
    s: number;
    cache: number;
  };
}

interface Series {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  odi: number;
  t20: number;
  test: number;
  squads: number;
  matches: number;
}

interface Match {
  id: string;
  name: string;
  matchType: string;
  status: string;
  venue: string;
  date: string;
  dateTimeGMT: string;
  teams: string[];
  score?: any[];
  series_id: string;
  fantasyEnabled: boolean;
  bbbEnabled: boolean;
  hasSquad: boolean;
  matchStarted: boolean;
  matchEnded: boolean;
}

interface Player {
  id: string;
  name: string;
  country: string;
  role?: string;
  battingStyle?: string;
  bowlingStyle?: string;
  placeOfBirth?: string;
  dateOfBirth?: string;
}

interface Country {
  id: string;
  name: string;
}

interface PlayerInfo {
  id: string;
  name: string;
  country: string;
  role: string;
  battingStyle: string;
  bowlingStyle: string;
  placeOfBirth: string;
  dateOfBirth: string;
  stats?: any;
}

interface MatchInfo {
  id: string;
  name: string;
  matchType: string;
  status: string;
  venue: string;
  date: string;
  dateTimeGMT: string;
  teams: string[];
  teamInfo: any[];
  score: any[];
  series_id: string;
  fantasyEnabled: boolean;
  bbbEnabled: boolean;
  hasSquad: boolean;
  matchStarted: boolean;
  matchEnded: boolean;
}

interface MatchSquad {
  id: string;
  name: string;
  teams: {
    [key: string]: {
      name: string;
      players: Array<{
        id: string;
        name: string;
        role: string;
      }>;
    };
  };
}

class CricApiService {
  private async makeRequest<T>(endpoint: string, params: Record<string, any> = {}): Promise<T> {
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
  async getSeries(offset: number = 0): Promise<CricApiResponse<Series[]>> {
    return this.makeRequest('/series', { offset });
  }

  // Get matches list
  async getMatches(offset: number = 0): Promise<CricApiResponse<Match[]>> {
    return this.makeRequest('/matches', { offset });
  }

  // Get players list
  async getPlayers(offset: number = 0, search?: string): Promise<CricApiResponse<Player[]>> {
    const params: any = { offset };
    if (search) {
      params.search = search;
    }
    return this.makeRequest('/players', params);
  }

  // Get countries list
  async getCountries(offset: number = 0): Promise<CricApiResponse<Country[]>> {
    return this.makeRequest('/countries', { offset });
  }

  // Get series info by ID
  async getSeriesInfo(seriesId: string): Promise<CricApiResponse<any>> {
    return this.makeRequest('/series_info', { id: seriesId });
  }

  // Get match info by ID
  async getMatchInfo(matchId: string): Promise<CricApiResponse<MatchInfo>> {
    return this.makeRequest('/match_info', { id: matchId });
  }

  // Get player info by ID
  async getPlayerInfo(playerId: string): Promise<CricApiResponse<PlayerInfo>> {
    return this.makeRequest('/players_info', { id: playerId });
  }

  // Get match squad by ID
  async getMatchSquad(matchId: string): Promise<CricApiResponse<MatchSquad>> {
    return this.makeRequest('/match_squad', { id: matchId });
  }

  // Get current matches
  async getCurrentMatches(): Promise<CricApiResponse<Match[]>> {
    return this.makeRequest('/currentMatches');
  }

  // Get recent matches
  async getRecentMatches(): Promise<CricApiResponse<Match[]>> {
    return this.makeRequest('/recentMatches');
  }

  // Search players by name
  async searchPlayers(searchTerm: string, offset: number = 0): Promise<CricApiResponse<Player[]>> {
    return this.makeRequest('/players', { offset, search: searchTerm });
  }
}

export const cricApiService = new CricApiService();
export type { Series, Match, Player, Country, PlayerInfo, MatchInfo, MatchSquad, CricApiResponse };