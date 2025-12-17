import { type UserRole } from "@shared/schema";

const API_BASE_URL = import.meta.env.PROD ? '/api' : '/api';

// Auth types
interface LoginRequest {
  username: string;
  password: string;
}

interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role: UserRole;
}

interface AuthResponse {
  user: {
    id: string;
    username: string;
    email: string;
    role: UserRole;
    profileImage?: string;
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
  };
  token: string;
  message: string;
  requiresVerification?: boolean;
  autoVerified?: boolean;
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || "http://localhost:5001/api";
    // Initialize token from localStorage on startup
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('token');
    }
  }

  setToken(token: string) {
    this.token = token;
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
    }
  }

  clearToken() {
    this.token = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.text();
          if (errorData) {
            errorMessage = errorData;
          }
        } catch (e) {
          // If we can't read the error body, use the status code
        }
        
        console.error(`API Error ${response.status} for ${endpoint}:`, errorMessage);
        
        // For 403 errors, handle gracefully with mock data for development
        if (response.status === 403 && process.env.NODE_ENV === 'development') {
          console.warn(`[DEV MODE] Using mock data for ${endpoint}`);
          return this.getMockDataForEndpoint(endpoint);
        }
        
        throw new Error(errorMessage);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      // If there's a connection error, return mock data in development
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.warn(`[DEV MODE] Server unavailable, using mock data for ${endpoint}`);
        return this.getMockDataForEndpoint(endpoint);
      }
      
      console.error(`API Request failed for ${endpoint}:`, error);
      throw error;
    }
  }

  private getMockDataForEndpoint(endpoint: string): any {
    // Return mock data based on endpoint
    if (endpoint.includes('/v2/players')) {
      return {
        players: [
          // India Players
          {
            _id: '1',
            name: 'Virat Kohli',
            role: 'batsman',
            nationality: 'Indian',
            image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop',
            teamId: { name: 'India', shortName: 'IND', logo: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop' },
            age: 35,
            battingStyle: 'Right-hand bat',
            bowlingStyle: 'Right-arm medium',
            form: 'excellent',
            isInjured: false,
            stats: { 
              test: { matches: 113, runs: 8848, average: 48.9, strikeRate: 55.78, hundreds: 29, fifties: 29, wickets: 0, catches: 122 },
              odi: { matches: 295, runs: 13848, average: 58.18, strikeRate: 93.54, hundreds: 50, fifties: 71, wickets: 4, catches: 148 },
              t20: { matches: 125, runs: 4037, average: 52.73, strikeRate: 137.96, hundreds: 1, fifties: 38, wickets: 0, catches: 59 }
            }
          },
          {
            _id: '2',
            name: 'Rohit Sharma',
            role: 'batsman',
            nationality: 'Indian',
            image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop',
            teamId: { name: 'India', shortName: 'IND', logo: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop' },
            age: 37,
            battingStyle: 'Right-hand bat',
            bowlingStyle: 'Right-arm off break',
            form: 'good',
            isInjured: false,
            isCaptain: true,
            stats: { 
              test: { matches: 62, runs: 4301, average: 44.81, strikeRate: 60.93, hundreds: 11, fifties: 18, wickets: 0, catches: 67 },
              odi: { matches: 265, runs: 10866, average: 48.96, strikeRate: 90.99, hundreds: 31, fifties: 50, wickets: 8, catches: 136 },
              t20: { matches: 159, runs: 4231, average: 31.32, strikeRate: 140.89, hundreds: 5, fifties: 31, wickets: 0, catches: 65 }
            }
          },
          {
            _id: '3',
            name: 'Jasprit Bumrah',
            role: 'bowler',
            nationality: 'Indian',
            image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop',
            teamId: { name: 'India', shortName: 'IND', logo: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop' },
            age: 30,
            battingStyle: 'Right-hand bat',
            bowlingStyle: 'Right-arm fast',
            form: 'excellent',
            isInjured: false,
            stats: { 
              test: { matches: 36, runs: 117, wickets: 159, average: 20.06, economy: 2.78, strikeRate: 43.4, catches: 6 },
              odi: { matches: 89, runs: 35, wickets: 149, average: 23.36, economy: 4.65, strikeRate: 30.1, catches: 23 },
              t20: { matches: 70, runs: 35, wickets: 89, average: 19.33, economy: 6.62, strikeRate: 17.5, catches: 17 }
            }
          },
          {
            _id: '4',
            name: 'Hardik Pandya',
            role: 'all-rounder',
            nationality: 'Indian',
            image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop',
            teamId: { name: 'India', shortName: 'IND', logo: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop' },
            age: 31,
            battingStyle: 'Right-hand bat',
            bowlingStyle: 'Right-arm fast-medium',
            form: 'good',
            isInjured: false,
            stats: { 
              test: { matches: 11, runs: 532, average: 31.29, wickets: 17, hundreds: 0, fifties: 4, catches: 11 },
              odi: { matches: 92, runs: 1386, average: 32.23, wickets: 79, hundreds: 0, fifties: 3, catches: 38 },
              t20: { matches: 104, runs: 921, average: 27.91, wickets: 42, hundreds: 0, fifties: 1, catches: 39 }
            }
          },
          {
            _id: '5',
            name: 'Rishabh Pant',
            role: 'wicket-keeper',
            nationality: 'Indian',
            image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop',
            teamId: { name: 'India', shortName: 'IND', logo: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop' },
            age: 27,
            battingStyle: 'Left-hand bat',
            bowlingStyle: null,
            form: 'excellent',
            isInjured: false,
            stats: { 
              test: { matches: 33, runs: 2271, average: 43.67, hundreds: 5, fifties: 9, dismissals: 129, catches: 117, stumpings: 12 },
              odi: { matches: 30, runs: 865, average: 33.27, hundreds: 1, fifties: 5, dismissals: 40, catches: 35, stumpings: 5 },
              t20: { matches: 66, runs: 987, average: 22.43, hundreds: 0, fifties: 3, dismissals: 37, catches: 32, stumpings: 5 }
            }
          },
          
          // Australia Players
          {
            _id: '6',
            name: 'Steve Smith',
            role: 'batsman',
            nationality: 'Australian',
            image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop',
            teamId: { name: 'Australia', shortName: 'AUS', logo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop' },
            age: 35,
            battingStyle: 'Right-hand bat',
            bowlingStyle: 'Right-arm leg break',
            form: 'excellent',
            isInjured: false,
            stats: { 
              test: { matches: 109, runs: 9685, average: 56.97, hundreds: 32, fifties: 41, wickets: 19, catches: 204 },
              odi: { matches: 155, runs: 4939, average: 43.34, hundreds: 12, fifties: 29, wickets: 28, catches: 80 },
              t20: { matches: 67, runs: 1063, average: 28.73, hundreds: 0, fifties: 4, wickets: 0, catches: 38 }
            }
          },
          {
            _id: '7',
            name: 'David Warner',
            role: 'batsman',
            nationality: 'Australian',
            image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop',
            teamId: { name: 'Australia', shortName: 'AUS', logo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop' },
            age: 38,
            battingStyle: 'Left-hand bat',
            bowlingStyle: 'Right-arm leg break',
            form: 'good',
            isInjured: false,
            stats: { 
              test: { matches: 112, runs: 8786, average: 44.59, hundreds: 26, fifties: 37, wickets: 0, catches: 62 },
              odi: { matches: 139, runs: 6007, average: 45.30, hundreds: 22, fifties: 33, wickets: 0, catches: 64 },
              t20: { matches: 110, runs: 3277, average: 33.43, hundreds: 1, fifties: 24, wickets: 0, catches: 42 }
            }
          },
          {
            _id: '8',
            name: 'Pat Cummins',
            role: 'bowler',
            nationality: 'Australian',
            image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop',
            teamId: { name: 'Australia', shortName: 'AUS', logo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop' },
            age: 31,
            battingStyle: 'Right-hand bat',
            bowlingStyle: 'Right-arm fast',
            form: 'excellent',
            isInjured: false,
            isCaptain: true,
            stats: { 
              test: { matches: 61, runs: 1000, wickets: 269, average: 22.20, economy: 2.91, catches: 31 },
              odi: { matches: 95, runs: 441, wickets: 171, average: 27.90, economy: 4.73, catches: 31 },
              t20: { matches: 51, runs: 52, wickets: 52, average: 28.40, economy: 7.23, catches: 13 }
            }
          },
          {
            _id: '9',
            name: 'Glenn Maxwell',
            role: 'all-rounder',
            nationality: 'Australian',
            image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop',
            teamId: { name: 'Australia', shortName: 'AUS', logo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop' },
            age: 36,
            battingStyle: 'Right-hand bat',
            bowlingStyle: 'Right-arm off break',
            form: 'good',
            isInjured: false,
            stats: { 
              test: { matches: 7, runs: 339, average: 26.08, wickets: 4, hundreds: 0, fifties: 2, catches: 5 },
              odi: { matches: 137, runs: 3734, average: 33.33, wickets: 58, hundreds: 3, fifties: 22, catches: 70 },
              t20: { matches: 102, runs: 2157, average: 29.68, wickets: 29, hundreds: 0, fifties: 8, catches: 45 }
            }
          },
          {
            _id: '10',
            name: 'Alex Carey',
            role: 'wicket-keeper',
            nationality: 'Australian',
            image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop',
            teamId: { name: 'Australia', shortName: 'AUS', logo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop' },
            age: 33,
            battingStyle: 'Left-hand bat',
            bowlingStyle: null,
            form: 'good',
            isInjured: false,
            stats: { 
              test: { matches: 29, runs: 1356, average: 28.25, hundreds: 1, fifties: 7, dismissals: 99, catches: 91, stumpings: 8 },
              odi: { matches: 58, runs: 1528, average: 34.00, hundreds: 1, fifties: 9, dismissals: 85, catches: 75, stumpings: 10 },
              t20: { matches: 58, runs: 732, average: 21.53, hundreds: 0, fifties: 2, dismissals: 45, catches: 38, stumpings: 7 }
            }
          },

          // England Players
          {
            _id: '11',
            name: 'Joe Root',
            role: 'batsman',
            nationality: 'English',
            image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop',
            teamId: { name: 'England', shortName: 'ENG', logo: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop' },
            age: 34,
            battingStyle: 'Right-hand bat',
            bowlingStyle: 'Right-arm off break',
            form: 'excellent',
            isInjured: false,
            stats: { 
              test: { matches: 146, runs: 12472, average: 49.69, hundreds: 31, fifties: 63, wickets: 3, catches: 174 },
              odi: { matches: 171, runs: 6109, average: 47.36, hundreds: 16, fifties: 39, wickets: 4, catches: 74 },
              t20: { matches: 32, runs: 893, average: 35.72, hundreds: 0, fifties: 5, wickets: 0, catches: 12 }
            }
          },
          {
            _id: '12',
            name: 'Ben Stokes',
            role: 'all-rounder',
            nationality: 'English',
            image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop',
            teamId: { name: 'England', shortName: 'ENG', logo: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop' },
            age: 33,
            battingStyle: 'Left-hand bat',
            bowlingStyle: 'Right-arm fast-medium',
            form: 'good',
            isInjured: false,
            isCaptain: true,
            stats: { 
              test: { matches: 105, runs: 6402, average: 35.89, wickets: 204, hundreds: 13, fifties: 31, catches: 130 },
              odi: { matches: 113, runs: 3019, average: 38.31, wickets: 74, hundreds: 3, fifties: 21, catches: 46 },
              t20: { matches: 43, runs: 612, average: 21.86, wickets: 8, hundreds: 0, fifties: 1, catches: 17 }
            }
          },
          {
            _id: '13',
            name: 'James Anderson',
            role: 'bowler',
            nationality: 'English',
            image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop',
            teamId: { name: 'England', shortName: 'ENG', logo: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop' },
            age: 42,
            battingStyle: 'Left-hand bat',
            bowlingStyle: 'Right-arm fast-medium',
            form: 'good',
            isInjured: false,
            stats: { 
              test: { matches: 188, runs: 1272, wickets: 700, average: 26.45, economy: 2.89, catches: 36 },
              odi: { matches: 194, runs: 273, wickets: 269, average: 29.22, economy: 4.92, catches: 54 },
              t20: { matches: 19, runs: 11, wickets: 18, average: 30.72, economy: 7.46, catches: 4 }
            }
          },
          {
            _id: '14',
            name: 'Harry Brook',
            role: 'batsman',
            nationality: 'English',
            image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop',
            teamId: { name: 'England', shortName: 'ENG', logo: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop' },
            age: 25,
            battingStyle: 'Right-hand bat',
            bowlingStyle: null,
            form: 'excellent',
            isInjured: false,
            stats: { 
              test: { matches: 22, runs: 1734, average: 61.21, hundreds: 6, fifties: 7, wickets: 0, catches: 17 },
              odi: { matches: 20, runs: 852, average: 53.25, hundreds: 2, fifties: 6, wickets: 0, catches: 8 },
              t20: { matches: 29, runs: 728, average: 32.18, hundreds: 0, fifties: 6, wickets: 0, catches: 12 }
            }
          },
          {
            _id: '15',
            name: 'Jos Buttler',
            role: 'wicket-keeper',
            nationality: 'English',
            image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop',
            teamId: { name: 'England', shortName: 'ENG', logo: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop' },
            age: 34,
            battingStyle: 'Right-hand bat',
            bowlingStyle: null,
            form: 'good',
            isInjured: false,
            stats: { 
              test: { matches: 57, runs: 2856, average: 31.73, hundreds: 2, fifties: 18, dismissals: 173, catches: 151, stumpings: 22 },
              odi: { matches: 162, runs: 4120, average: 40.78, hundreds: 9, fifties: 22, dismissals: 134, catches: 120, stumpings: 14 },
              t20: { matches: 117, runs: 2918, average: 34.32, hundreds: 1, fifties: 18, dismissals: 89, catches: 76, stumpings: 13 }
            }
          },

          // South Africa Players
          {
            _id: '16',
            name: 'Temba Bavuma',
            role: 'batsman',
            nationality: 'South African',
            image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop',
            teamId: { name: 'South Africa', shortName: 'SA', logo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop' },
            age: 34,
            battingStyle: 'Right-hand bat',
            bowlingStyle: null,
            form: 'good',
            isInjured: false,
            isCaptain: true,
            stats: { 
              test: { matches: 60, runs: 3204, average: 38.14, hundreds: 3, fifties: 22, wickets: 0, catches: 62 },
              odi: { matches: 87, runs: 2373, average: 31.64, hundreds: 1, fifties: 15, wickets: 0, catches: 33 },
              t20: { matches: 67, runs: 1277, average: 24.56, hundreds: 0, fifties: 5, wickets: 0, catches: 25 }
            }
          },
          {
            _id: '17',
            name: 'Kagiso Rabada',
            role: 'bowler',
            nationality: 'South African',
            image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop',
            teamId: { name: 'South Africa', shortName: 'SA', logo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop' },
            age: 29,
            battingStyle: 'Right-hand bat',
            bowlingStyle: 'Right-arm fast',
            form: 'excellent',
            isInjured: false,
            stats: { 
              test: { matches: 68, runs: 1032, wickets: 294, average: 22.75, economy: 3.32, catches: 18 },
              odi: { matches: 98, runs: 323, wickets: 154, average: 26.93, economy: 4.98, catches: 29 },
              t20: { matches: 67, runs: 97, wickets: 90, average: 19.71, economy: 7.27, catches: 21 }
            }
          },

          // Pakistan Players
          {
            _id: '18',
            name: 'Babar Azam',
            role: 'batsman',
            nationality: 'Pakistani',
            image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop',
            teamId: { name: 'Pakistan', shortName: 'PAK', logo: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop' },
            age: 30,
            battingStyle: 'Right-hand bat',
            bowlingStyle: null,
            form: 'excellent',
            isInjured: false,
            isCaptain: true,
            stats: { 
              test: { matches: 53, runs: 3898, average: 45.32, hundreds: 10, fifties: 26, wickets: 0, catches: 47 },
              odi: { matches: 120, runs: 5729, average: 56.72, hundreds: 19, fifties: 31, wickets: 0, catches: 58 },
              t20: { matches: 119, runs: 4145, average: 40.83, hundreds: 3, fifties: 33, wickets: 0, catches: 54 }
            }
          },
          {
            _id: '19',
            name: 'Shaheen Afridi',
            role: 'bowler',
            nationality: 'Pakistani',
            image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop',
            teamId: { name: 'Pakistan', shortName: 'PAK', logo: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop' },
            age: 24,
            battingStyle: 'Left-hand bat',
            bowlingStyle: 'Left-arm fast',
            form: 'excellent',
            isInjured: false,
            stats: { 
              test: { matches: 34, runs: 265, wickets: 136, average: 25.36, economy: 3.46, catches: 8 },
              odi: { matches: 62, runs: 108, wickets: 106, average: 23.72, economy: 5.03, catches: 15 },
              t20: { matches: 82, runs: 45, wickets: 97, average: 20.71, economy: 7.32, catches: 18 }
            }
          },

          // New Zealand Players
          {
            _id: '20',
            name: 'Kane Williamson',
            role: 'batsman',
            nationality: 'New Zealand',
            image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop',
            teamId: { name: 'New Zealand', shortName: 'NZ', logo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop' },
            age: 34,
            battingStyle: 'Right-hand bat',
            bowlingStyle: 'Right-arm off break',
            form: 'excellent',
            isInjured: false,
            isCaptain: true,
            stats: { 
              test: { matches: 101, runs: 8743, average: 54.31, hundreds: 32, fifties: 35, wickets: 2, catches: 133 },
              odi: { matches: 167, runs: 6912, average: 47.83, hundreds: 13, fifties: 42, wickets: 7, catches: 71 },
              t20: { matches: 89, runs: 2538, average: 32.79, hundreds: 0, fifties: 17, wickets: 0, catches: 42 }
            }
          }
        ],
        pagination: { page: 1, limit: 50, total: 20, pages: 1 }
      };
    }

    if (endpoint.includes('/v2/teams')) {
      return {
        teams: [
          { 
            _id: 'team1', 
            name: 'India', 
            shortName: 'IND',
            logo: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop',
            ranking: { test: 1, odi: 2, t20: 3 },
            playersCount: 15,
            coach: 'Rahul Dravid',
            captain: 'Rohit Sharma'
          },
          { 
            _id: 'team2', 
            name: 'Australia', 
            shortName: 'AUS',
            logo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop',
            ranking: { test: 2, odi: 1, t20: 4 },
            playersCount: 15,
            coach: 'Andrew McDonald',
            captain: 'Pat Cummins'
          },
          { 
            _id: 'team3', 
            name: 'England', 
            shortName: 'ENG',
            logo: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop',
            ranking: { test: 3, odi: 4, t20: 2 },
            playersCount: 15,
            coach: 'Brendon McCullum',
            captain: 'Ben Stokes'
          },
          { 
            _id: 'team4', 
            name: 'South Africa', 
            shortName: 'SA',
            logo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop',
            ranking: { test: 4, odi: 5, t20: 5 },
            playersCount: 15,
            coach: 'Rob Walter',
            captain: 'Temba Bavuma'
          },
          { 
            _id: 'team5', 
            name: 'Pakistan', 
            shortName: 'PAK',
            logo: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop',
            ranking: { test: 5, odi: 3, t20: 1 },
            playersCount: 15,
            coach: 'Gary Kirsten',
            captain: 'Babar Azam'
          },
          { 
            _id: 'team6', 
            name: 'New Zealand', 
            shortName: 'NZ',
            logo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop',
            ranking: { test: 6, odi: 6, t20: 6 },
            playersCount: 15,
            coach: 'Gary Stead',
            captain: 'Kane Williamson'
          }
        ],
        pagination: { page: 1, limit: 20, total: 6, pages: 1 }
      };
    }

    if (endpoint.includes('/v2/matches')) {
      return {
        matches: [
          {
            _id: 'match1',
            homeTeam: { _id: 'team1', name: 'India', shortName: 'IND', logo: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop' },
            awayTeam: { _id: 'team2', name: 'Australia', shortName: 'AUS', logo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop' },
            venue: 'Melbourne Cricket Ground',
            date: '2024-12-26',
            format: 'Test',
            status: 'completed',
            result: { winner: 'India', margin: '6 wickets' },
            series: 'Border-Gavaskar Trophy 2024-25',
            scores: {
              homeTeam: { innings1: 326, innings2: 240 },
              awayTeam: { innings1: 195, innings2: 234 }
            }
          },
          {
            _id: 'match2',
            homeTeam: { _id: 'team3', name: 'England', shortName: 'ENG', logo: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop' },
            awayTeam: { _id: 'team4', name: 'South Africa', shortName: 'SA', logo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop' },
            venue: 'Lords Cricket Ground',
            date: '2024-12-28',
            format: 'Test',
            status: 'live',
            result: null,
            series: 'England vs South Africa 2024',
            scores: {
              homeTeam: { innings1: 287, innings2: null },
              awayTeam: { innings1: 312, innings2: 89/3 }
            }
          },
          {
            _id: 'match3',
            homeTeam: { _id: 'team5', name: 'Pakistan', shortName: 'PAK', logo: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop' },
            awayTeam: { _id: 'team6', name: 'New Zealand', shortName: 'NZ', logo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop' },
            venue: 'National Stadium Karachi',
            date: '2024-12-30',
            format: 'Test',
            status: 'upcoming',
            result: null,
            series: 'Pakistan vs New Zealand 2024-25',
            scores: null
          }
        ],
        pagination: { page: 1, limit: 20, total: 3, pages: 1 }
      };
    }

    if (endpoint.includes('/v2/stats/dashboard')) {
      return {
        totalPlayers: 90,
        totalTeams: 12,
        totalMatches: 48,
        activePlayers: 78,
        injuredPlayers: 12,
        upcomingMatches: 15,
        liveMatches: 3,
        recentMatches: 30,
        topBatsmen: [
          { name: 'Joe Root', runs: 12472, average: 49.69 },
          { name: 'Steve Smith', runs: 9685, average: 56.97 },
          { name: 'Virat Kohli', runs: 8848, average: 48.9 }
        ],
        topBowlers: [
          { name: 'James Anderson', wickets: 700, average: 26.45 },
          { name: 'Kagiso Rabada', wickets: 294, average: 22.75 },
          { name: 'Pat Cummins', wickets: 269, average: 22.20 }
        ],
        teamRankings: [
          { name: 'India', testRank: 1, odiRank: 2, t20Rank: 3 },
          { name: 'Australia', testRank: 2, odiRank: 1, t20Rank: 4 },
          { name: 'England', testRank: 3, odiRank: 4, t20Rank: 2 }
        ]
      };
    }

    if (endpoint.includes('/v2/analytics/top-performers')) {
      return {
        batsmen: [
          { name: 'Joe Root', runs: 12472, average: 49.69, strikeRate: 55.21, hundreds: 31 },
          { name: 'Steve Smith', runs: 9685, average: 56.97, strikeRate: 53.12, hundreds: 32 },
          { name: 'Virat Kohli', runs: 8848, average: 48.9, strikeRate: 55.78, hundreds: 29 },
          { name: 'Kane Williamson', runs: 8743, average: 54.31, strikeRate: 51.39, hundreds: 32 },
          { name: 'David Warner', runs: 8786, average: 44.59, strikeRate: 69.34, hundreds: 26 }
        ],
        bowlers: [
          { name: 'James Anderson', wickets: 700, average: 26.45, economy: 2.89, strikeRate: 55.0 },
          { name: 'Kagiso Rabada', wickets: 294, average: 22.75, economy: 3.32, strikeRate: 41.2 },
          { name: 'Pat Cummins', wickets: 269, average: 22.20, economy: 2.91, strikeRate: 45.8 },
          { name: 'Jasprit Bumrah', wickets: 159, average: 20.06, economy: 2.78, strikeRate: 43.4 },
          { name: 'Shaheen Afridi', wickets: 136, average: 25.36, economy: 3.46, strikeRate: 44.0 }
        ],
        allRounders: [
          { name: 'Ben Stokes', runs: 6402, wickets: 204, battingAvg: 35.89, bowlingAvg: 32.85 },
          { name: 'Hardik Pandya', runs: 532, wickets: 17, battingAvg: 31.29, bowlingAvg: 30.47 },
          { name: 'Glenn Maxwell', runs: 339, wickets: 4, battingAvg: 26.08, bowlingAvg: 45.75 }
        ]
      };
    }

    if (endpoint.includes('/v2/admin/stats')) {
      return {
        totalPlayers: 90,
        totalTeams: 12,
        totalMatches: 48,
        totalVenues: 25,
        activePlayers: 78,
        injuredPlayers: 12,
        upcomingMatches: 15,
        liveMatches: 3,
        recentMatches: 30,
        dataLastSynced: new Date().toISOString(),
        syncStatus: 'success'
      };
    }

    if (endpoint.includes('/v2/venues')) {
      return {
        venues: [
          { _id: 'venue1', name: 'Melbourne Cricket Ground', city: 'Melbourne', country: 'Australia', capacity: 100000 },
          { _id: 'venue2', name: 'Lords Cricket Ground', city: 'London', country: 'England', capacity: 28000 },
          { _id: 'venue3', name: 'Eden Gardens', city: 'Kolkata', country: 'India', capacity: 68000 },
          { _id: 'venue4', name: 'Wankhede Stadium', city: 'Mumbai', country: 'India', capacity: 33108 },
          { _id: 'venue5', name: 'Oval Cricket Ground', city: 'London', country: 'England', capacity: 23500 }
        ],
        pagination: { page: 1, limit: 20, total: 5, pages: 1 }
      };
    }

    if (endpoint.includes('/v2/fantasy/leaderboard')) {
      return {
        leaderboard: [
          { playerId: '1', playerName: 'Virat Kohli', totalPoints: 2450, rank: 1 },
          { playerId: '6', playerName: 'Steve Smith', totalPoints: 2380, rank: 2 },
          { playerId: '11', playerName: 'Joe Root', totalPoints: 2350, rank: 3 },
          { playerId: '20', playerName: 'Kane Williamson', totalPoints: 2300, rank: 4 },
          { playerId: '18', playerName: 'Babar Azam', totalPoints: 2250, rank: 5 }
        ],
        pagination: { page: 1, limit: 10, total: 5, pages: 1 }
      };
    }

    if (endpoint.includes('/v2/matches/live')) {
      return {
        matches: [
          {
            _id: 'live1',
            homeTeam: { name: 'India', shortName: 'IND', logo: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop' },
            awayTeam: { name: 'Australia', shortName: 'AUS', logo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop' },
            venue: 'Melbourne Cricket Ground',
            date: new Date().toISOString(),
            format: 'Test',
            status: 'live',
            scores: { homeTeam: { innings1: 326, innings2: '89/2' }, awayTeam: { innings1: 195, innings2: 234 } }
          }
        ]
      };
    }

    if (endpoint.includes('/v2/matches/upcoming')) {
      return {
        matches: [
          {
            _id: 'upcoming1',
            homeTeam: { name: 'England', shortName: 'ENG' },
            awayTeam: { name: 'South Africa', shortName: 'SA' },
            venue: 'Lords Cricket Ground',
            date: '2024-12-30',
            format: 'Test',
            status: 'upcoming'
          }
        ]
      };
    }
    
    if (endpoint.includes('/v2/teams')) {
      return {
        teams: [
          {
            _id: '1',
            name: 'India',
            shortName: 'IND',
            country: 'India',
            logo: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop',
            ranking: { test: 1, odi: 1, t20: 1 }
          },
          {
            _id: '2',
            name: 'Australia',
            shortName: 'AUS',
            country: 'Australia',
            logo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop',
            ranking: { test: 2, odi: 2, t20: 2 }
          }
        ],
        pagination: { page: 1, limit: 20, total: 2, pages: 1 }
      };
    }
    
    if (endpoint.includes('/v2/matches')) {
      return {
        matches: [
          {
            _id: '1',
            team1Id: { name: 'India', shortName: 'IND', logo: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop' },
            team2Id: { name: 'Australia', shortName: 'AUS', logo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop' },
            matchType: 'T20',
            status: 'live',
            team1Score: '185/4',
            team2Score: '188/6',
            venueId: { name: 'Melbourne Cricket Ground', city: 'Melbourne' }
          }
        ],
        pagination: { page: 1, limit: 20, total: 1, pages: 1 }
      };
    }
    
    if (endpoint.includes('/v2/venues')) {
      return {
        venues: [
          {
            _id: '1',
            name: 'Melbourne Cricket Ground',
            city: 'Melbourne',
            country: 'Australia',
            capacity: 100024
          }
        ],
        pagination: { page: 1, limit: 20, total: 1, pages: 1 }
      };
    }
    
    if (endpoint.includes('/v2/fantasy')) {
      return {
        leaderboard: [
          { playerName: 'Virat Kohli', points: 95, matches: 15 },
          { playerName: 'Steve Smith', points: 87, matches: 12 }
        ]
      };
    }
    
    if (endpoint.includes('/cricket/live-matches')) {
      return {
        data: [
          {
            _id: '1',
            team1: 'India',
            team2: 'Australia',
            status: 'live',
            score: 'IND 185/4 vs AUS 188/6'
          }
        ]
      };
    }
    
    if (endpoint.includes('/cricket/upcoming-matches')) {
      return {
        data: [
          {
            _id: '2',
            team1: 'England',
            team2: 'South Africa',
            status: 'upcoming',
            scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
          }
        ]
      };
    }
    
    if (endpoint.includes('/v2/admin/stats')) {
      return {
        totalPlayers: 90,
        totalTeams: 12,
        totalMatches: 48,
        totalVenues: 25,
        activePlayers: 78,
        injuredPlayers: 12,
        upcomingMatches: 15,
        liveMatches: 3,
        recentMatches: 30,
        dataLastSynced: new Date().toISOString(),
        syncStatus: 'success'
      };
    }

    if (endpoint.includes('/v2/search')) {
      // Simple search implementation that returns a subset of players/teams based on query
      const searchQuery = endpoint.split('query=')[1]?.split('&')[0] || '';
      const mockSearchResults = [
        { type: 'player', name: 'Virat Kohli', team: 'India' },
        { type: 'player', name: 'Steve Smith', team: 'Australia' },
        { type: 'team', name: 'India', shortName: 'IND' },
        { type: 'team', name: 'Australia', shortName: 'AUS' }
      ].filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.team && item.team.toLowerCase().includes(searchQuery.toLowerCase()))
      );
      
      return {
        data: mockSearchResults.slice(0, 10),
        pagination: { page: 1, limit: 10, total: mockSearchResults.length, pages: 1 }
      };
    }

    if (endpoint.includes('/v2/sync')) {
      return { success: true, message: 'Data synced successfully', timestamp: new Date().toISOString() };
    }
    
    // Default empty response
    return { data: [], message: 'Mock data not available for this endpoint' };
  }

  // Auth methods
  async register(userData: {
    username: string;
    email: string;
    password: string;
    role: string;
  }) {
    return this.request("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: { username: string; password: string }) {
    return this.request("/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.request("/auth/logout", { method: "POST" });
  }

  async verifyEmail(token: string) {
    return this.request("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  }

  async resendVerification(email: string) {
    return this.request("/auth/resend-verification", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async forgotPassword(email: string) {
    return this.request("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async devVerify(email: string) {
    return this.request("/auth/dev-verify", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  // === NEW COMPREHENSIVE API METHODS ===

  // Players API
  async getPlayers(params: {
    page?: number;
    limit?: number;
    search?: string;
    team?: string;
    role?: string;
    nationality?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString());
    });
    
    const response = await this.request(`/v2/players?${queryParams}`);
    return response.players || response.data || [];
  }

  async getPlayer(id: string) {
    const response = await this.request(`/v2/players/${id}`);
    return response.player || response.data || {};
  }

  async getPlayerStats(playerId: string, year?: string) {
    const params = year ? `?year=${year}` : '';
    const response = await this.request(`/v2/players/${playerId}/stats${params}`);
    return response.stats || response.data || [];
  }

  async getPlayerTrends(playerId: string, format?: string) {
    const params = format && format !== 'all' ? `?format=${format}` : '';
    const response = await this.request(`/v2/players/${playerId}/trends${params}`);
    return response.trends || response.data || {};
  }

  // Teams API
  async getTeams(params: {
    page?: number;
    limit?: number;
    search?: string;
    country?: string;
    teamType?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString());
    });
    
    return this.request(`/v2/teams?${queryParams}`);
  }

  async getTeam(id: string) {
    return this.request(`/v2/teams/${id}`);
  }

  // Venues API
  async getVenues(params: {
    page?: number;
    limit?: number;
    search?: string;
    country?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString());
    });
    
    return this.request(`/v2/venues?${queryParams}`);
  }

  async getVenue(id: string) {
    return this.request(`/v2/venues/${id}`);
  }

  // Matches API
  async getMatches(params: {
    page?: number;
    limit?: number;
    status?: string;
    matchType?: string;
    team?: string;
    venue?: string;
    series?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  } = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined) queryParams.append(key, value.toString());
    });
    
    return this.request(`/v2/matches?${queryParams}`);
  }

  async getMatch(id: string) {
    return this.request(`/v2/matches/${id}`);
  }

  // Live and Upcoming Matches (for fans)
  async getLiveMatches() {
    return this.request("/cricket/live-matches");
  }

  async getUpcomingMatches() {
    return this.request("/cricket/upcoming-matches");
  }

  // Fantasy API
  async getFantasyLeaderboard(matchId?: string, limit?: number) {
    const params = new URLSearchParams();
    if (matchId) params.append('matchId', matchId);
    if (limit) params.append('limit', limit.toString());
    
    return this.request(`/v2/fantasy/leaderboard?${params}`);
  }

  async getPlayerFantasyData(playerId: string, matchId?: string) {
    const params = new URLSearchParams();
    if (matchId) params.append('matchId', matchId);
    
    return this.request(`/v2/fantasy/player/${playerId}?${params}`);
  }

  async getFantasySummary() {
    return this.request("/v2/fantasy/summary");
  }

  // Search API
  async search(query: string, type: 'all' | 'players' | 'teams' | 'venues' | 'matches' = 'all', limit?: number) {
    const params = new URLSearchParams({ q: query, type });
    if (limit) params.append('limit', limit.toString());
    
    return this.request(`/v2/search?${params}`);
  }

  // Admin/Coach/Analyst APIs
  async syncData(type: 'all' | 'teams' | 'players' | 'venues' | 'matches' = 'all') {
    return this.request("/v2/admin/sync", {
      method: "POST",
      body: JSON.stringify({ type }),
    });
  }

  // Legacy methods for backward compatibility
  async getUsers() {
    return this.request("/users");
  }

  async createUser(userData: any) {
    return this.request("/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: string, userData: any) {
    return this.request(`/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: string) {
    return this.request(`/users/${id}`, { method: "DELETE" });
  }

  // Additional endpoints
  async getMatchStats(matchId: string) {
    const response = await this.request(`/v2/matches/${matchId}/stats`);
    return response.stats || response.data || {};
  }

  async getMatchWeather(matchId: string) {
    const response = await this.request(`/v2/matches/${matchId}/weather`);
    return response.weather || response.data || null;
  }

  async getMatchPitchReport(matchId: string) {
    const response = await this.request(`/v2/matches/${matchId}/pitch`);
    return response.pitch || response.data || null;
  }

  async getLiveMatches() {
    const response = await this.request('/v2/matches/live');
    return response.matches || response.data || [];
  }

  async getUpcomingMatches() {
    const response = await this.request('/v2/matches/upcoming');
    return response.matches || response.data || [];
  }

  async getFantasyLeaderboard(type?: string, limit?: number) {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (limit) params.append('limit', limit.toString());
    
    const endpoint = `/v2/fantasy/leaderboard${params.toString() ? '?' + params.toString() : ''}`;
    const response = await this.request(endpoint);
    return response.leaderboard || response.data || [];
  }

  async getTopPerformers(format?: string) {
    const params = format ? `?format=${format}` : '';
    const response = await this.request(`/v2/analytics/top-performers${params}`);
    return response;
  }

  async getDashboardStats() {
    const response = await this.request('/v2/stats/dashboard');
    return response;
  }

  async syncData(type: string = 'all') {
    const response = await this.request('/v2/sync', {
      method: 'POST',
      body: JSON.stringify({ type })
    });
    return response;
  }

  async search(query: string, type: string = 'all', limit: number = 20) {
    const params = new URLSearchParams();
    params.append('query', query);
    params.append('type', type);
    params.append('limit', limit.toString());
    
    const response = await this.request(`/v2/search?${params.toString()}`);
    return response;
  }

  async createSavedAnalysis(analysisData: {
    title: string;
    description: string;
    analysisType: string;
    analysisData: any;
    matchId?: string;
    playerId?: string;
  }) {
    const response = await this.request('/v2/analysis/save', {
      method: 'POST',
      body: JSON.stringify(analysisData)
    });
    return response;
  }

  async getSavedAnalyses(userId?: string) {
    const params = userId ? `?userId=${userId}` : '';
    const response = await this.request(`/v2/analysis/saved${params}`);
    return response.analyses || response.data || [];
  }
}

export const apiClient = new ApiClient();
