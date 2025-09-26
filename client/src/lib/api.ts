import { type UserRole } from "@shared/schema";

const API_BASE_URL = import.meta.env.PROD 
  ? import.meta.env.VITE_API_URL || 'https://pitchpoint-backend.onrender.com'
  : '';

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
  private baseURL = API_BASE_URL;

  private async request(endpoint: string, options: RequestInit = {}): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('auth-token');
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }

    try {
      const response = await fetch(url, config);
      
      // If response is not ok, try to get the error message
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error(`API request failed for ${endpoint}:`, response.status, errorData);
        
        // For auth endpoints, don't use mock data, throw the actual error
        if (endpoint.includes('/api/auth/')) {
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
        }
        
        // For other endpoints, fall back to mock data
        console.warn(`API request failed for ${endpoint}, using mock data`);
        return this.getMockDataForEndpoint(endpoint);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`API request failed for ${endpoint}:`, error);
      
      // For auth endpoints, throw the error instead of using mock data
      if (endpoint.includes('/api/auth/')) {
        throw error;
      }
      
      // For other endpoints, return mock data as fallback
      return this.getMockDataForEndpoint(endpoint);
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
            name: 'KL Rahul',
            role: 'wicket-keeper',
            nationality: 'Indian',
            image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop',
            teamId: { name: 'India', shortName: 'IND', logo: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop' },
            age: 32,
            battingStyle: 'Right-hand bat',
            bowlingStyle: 'Right-arm off break',
            form: 'good',
            isInjured: false,
            stats: { 
              test: { matches: 48, runs: 2863, average: 34.12, strikeRate: 55.92, hundreds: 8, fifties: 13, wickets: 0, catches: 92 },
              odi: { matches: 72, runs: 2562, average: 45.58, strikeRate: 86.54, hundreds: 6, fifties: 15, wickets: 0, catches: 58 },
              t20: { matches: 72, runs: 2265, average: 37.75, strikeRate: 139.33, hundreds: 2, fifties: 16, wickets: 0, catches: 43 }
            }
          },
          {
            _id: '5',
            name: 'Hardik Pandya',
            role: 'all-rounder',
            nationality: 'Indian',
            image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop',
            teamId: { name: 'India', shortName: 'IND', logo: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop' },
            age: 30,
            battingStyle: 'Right-hand bat',
            bowlingStyle: 'Right-arm fast-medium',
            form: 'average',
            isInjured: true,
            stats: { 
              test: { matches: 11, runs: 532, average: 31.29, strikeRate: 70.10, hundreds: 1, fifties: 2, wickets: 17, catches: 6 },
              odi: { matches: 92, runs: 1769, average: 33.59, strikeRate: 113.91, hundreds: 0, fifties: 9, wickets: 79, catches: 34 },
              t20: { matches: 104, runs: 1915, average: 27.57, strikeRate: 143.32, hundreds: 0, fifties: 11, wickets: 79, catches: 45 }
            }
          },
          {
            _id: '6',
            name: 'Ravindra Jadeja',
            role: 'all-rounder',
            nationality: 'Indian',
            image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop',
            teamId: { name: 'India', shortName: 'IND', logo: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop' },
            age: 35,
            battingStyle: 'Left-hand bat',
            bowlingStyle: 'Slow left-arm orthodox',
            form: 'excellent',
            isInjured: false,
            stats: { 
              test: { matches: 73, runs: 2989, average: 35.96, strikeRate: 57.81, hundreds: 4, fifties: 18, wickets: 294, catches: 64 },
              odi: { matches: 197, runs: 2756, average: 32.24, strikeRate: 85.26, hundreds: 0, fifties: 13, wickets: 220, catches: 89 },
              t20: { matches: 74, runs: 515, average: 23.41, strikeRate: 127.22, hundreds: 0, fifties: 1, wickets: 54, catches: 34 }
            }
          },
          {
            _id: '7',
            name: 'Mohammed Shami',
            role: 'bowler',
            nationality: 'Indian',
            image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop',
            teamId: { name: 'India', shortName: 'IND', logo: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop' },
            age: 33,
            battingStyle: 'Right-hand bat',
            bowlingStyle: 'Right-arm fast',
            form: 'good',
            isInjured: false,
            stats: { 
              test: { matches: 64, runs: 434, wickets: 229, average: 27.61, economy: 2.82, strikeRate: 58.6, catches: 7 },
              odi: { matches: 95, runs: 123, wickets: 195, average: 25.33, economy: 5.96, strikeRate: 25.5, catches: 16 },
              t20: { matches: 23, runs: 17, wickets: 24, average: 23.54, economy: 7.36, strikeRate: 19.2, catches: 2 }
            }
          },
          {
            _id: '8',
            name: 'Rishabh Pant',
            role: 'wicket-keeper',
            nationality: 'Indian',
            image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop',
            teamId: { name: 'India', shortName: 'IND', logo: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop' },
            age: 27,
            battingStyle: 'Left-hand bat',
            bowlingStyle: 'Right-arm medium',
            form: 'excellent',
            isInjured: false,
            stats: { 
              test: { matches: 33, runs: 2271, average: 43.67, strikeRate: 73.50, hundreds: 5, fifties: 11, wickets: 0, catches: 91 },
              odi: { matches: 30, runs: 865, average: 32.04, strikeRate: 106.54, hundreds: 1, fifties: 5, wickets: 0, catches: 26 },
              t20: { matches: 66, runs: 987, average: 22.89, strikeRate: 126.37, hundreds: 0, fifties: 3, wickets: 0, catches: 35 }
            }
          },
          {
            _id: '9',
            name: 'Shubman Gill',
            role: 'batsman',
            nationality: 'Indian',
            image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop',
            teamId: { name: 'India', shortName: 'IND', logo: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop' },
            age: 25,
            battingStyle: 'Right-hand bat',
            bowlingStyle: 'Right-arm off break',
            form: 'good',
            isInjured: false,
            stats: { 
              test: { matches: 25, runs: 1421, average: 31.57, strikeRate: 55.12, hundreds: 4, fifties: 6, wickets: 0, catches: 13 },
              odi: { matches: 47, runs: 2328, average: 58.20, strikeRate: 96.69, hundreds: 6, fifties: 13, wickets: 0, catches: 19 },
              t20: { matches: 23, runs: 483, average: 26.83, strikeRate: 132.87, hundreds: 0, fifties: 2, wickets: 0, catches: 8 }
            }
          },
          {
            _id: '10',
            name: 'Ravichandran Ashwin',
            role: 'bowler',
            nationality: 'Indian',
            image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop',
            teamId: { name: 'India', shortName: 'IND', logo: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop' },
            age: 37,
            battingStyle: 'Right-hand bat',
            bowlingStyle: 'Right-arm off break',
            form: 'excellent',
            isInjured: false,
            stats: { 
              test: { matches: 100, runs: 3379, average: 25.75, strikeRate: 54.23, hundreds: 5, fifties: 14, wickets: 516, catches: 75 },
              odi: { matches: 116, runs: 707, average: 16.44, strikeRate: 94.76, hundreds: 0, fifties: 2, wickets: 156, catches: 54 },
              t20: { matches: 65, runs: 184, average: 11.50, strikeRate: 125.85, hundreds: 0, fifties: 0, wickets: 72, catches: 23 }
            }
          },
          // Australia Players
          {
            _id: '11',
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
            _id: '12',
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
              test: { matches: 62, runs: 1218, wickets: 269, average: 22.30, economy: 2.91, strikeRate: 45.9, catches: 28 },
              odi: { matches: 95, runs: 710, wickets: 171, average: 27.88, economy: 5.43, strikeRate: 30.8, catches: 35 },
              t20: { matches: 34, runs: 189, wickets: 37, average: 28.05, economy: 7.83, strikeRate: 21.5, catches: 13 }
            }
          },
          {
            _id: '13',
            name: 'David Warner',
            role: 'batsman',
            nationality: 'Australian',
            image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop',
            teamId: { name: 'Australia', shortName: 'AUS', logo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop' },
            age: 37,
            battingStyle: 'Left-hand bat',
            bowlingStyle: 'Right-arm leg break',
            form: 'good',
            isInjured: false,
            stats: { 
              test: { matches: 112, runs: 8786, average: 44.59, hundreds: 26, fifties: 37, wickets: 0, catches: 60 },
              odi: { matches: 161, runs: 6932, average: 45.30, hundreds: 22, fifties: 33, wickets: 0, catches: 78 },
              t20: { matches: 103, runs: 3277, average: 33.43, hundreds: 1, fifties: 24, wickets: 0, catches: 42 }
            }
          },
          {
            _id: '14',
            name: 'Mitchell Starc',
            role: 'bowler',
            nationality: 'Australian',
            image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop',
            teamId: { name: 'Australia', shortName: 'AUS', logo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop' },
            age: 34,
            battingStyle: 'Left-hand bat',
            bowlingStyle: 'Left-arm fast',
            form: 'good',
            isInjured: false,
            stats: { 
              test: { matches: 85, runs: 1366, wickets: 358, average: 27.86, economy: 3.15, strikeRate: 53.1, catches: 24 },
              odi: { matches: 114, runs: 375, wickets: 230, average: 22.73, economy: 4.88, strikeRate: 27.9, catches: 34 },
              t20: { matches: 57, runs: 126, wickets: 70, average: 21.42, economy: 7.29, strikeRate: 17.6, catches: 18 }
            }
          },
          {
            _id: '15',
            name: 'Alex Carey',
            role: 'wicket-keeper',
            nationality: 'Australian',
            image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop',
            teamId: { name: 'Australia', shortName: 'AUS', logo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop' },
            age: 33,
            battingStyle: 'Left-hand bat',
            bowlingStyle: 'Right-arm medium',
            form: 'good',
            isInjured: false,
            stats: { 
              test: { matches: 29, runs: 1136, average: 24.26, strikeRate: 61.29, hundreds: 2, fifties: 5, wickets: 0, catches: 96 },
              odi: { matches: 58, runs: 1363, average: 28.18, strikeRate: 85.04, hundreds: 0, fifties: 8, wickets: 0, catches: 76 },
              t20: { matches: 17, runs: 219, average: 21.90, strikeRate: 131.73, hundreds: 0, fifties: 1, wickets: 0, catches: 14 }
            }
          },
          // England Players  
          {
            _id: '16',
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
            _id: '17',
            name: 'Ben Stokes',
            role: 'all-rounder',
            nationality: 'English',
            image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop',
            teamId: { name: 'England', shortName: 'ENG', logo: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop' },
            age: 33,
            battingStyle: 'Left-hand bat',
            bowlingStyle: 'Right-arm fast-medium',
            form: 'excellent',
            isInjured: false,
            isCaptain: true,
            stats: { 
              test: { matches: 105, runs: 6362, average: 35.89, hundreds: 13, fifties: 30, wickets: 196, catches: 127 },
              odi: { matches: 117, runs: 2919, average: 38.94, hundreds: 3, fifties: 21, wickets: 74, catches: 51 },
              t20: { matches: 43, runs: 612, average: 24.48, hundreds: 0, fifties: 2, wickets: 28, catches: 19 }
            }
          },
          {
            _id: '18',
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
              test: { matches: 188, runs: 1301, wickets: 704, average: 26.45, economy: 2.89, strikeRate: 54.8, catches: 39 },
              odi: { matches: 194, runs: 273, wickets: 269, average: 29.22, economy: 4.92, strikeRate: 35.6, catches: 54 },
              t20: { matches: 19, runs: 16, wickets: 18, average: 30.00, economy: 7.46, strikeRate: 24.1, catches: 7 }
            }
          },
          {
            _id: '19',
            name: 'Jonny Bairstow',
            role: 'wicket-keeper',
            nationality: 'English',
            image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop',
            teamId: { name: 'England', shortName: 'ENG', logo: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop' },
            age: 35,
            battingStyle: 'Right-hand bat',
            bowlingStyle: 'Right-arm medium',
            form: 'good',
            isInjured: false,
            stats: { 
              test: { matches: 100, runs: 5416, average: 37.35, hundreds: 11, fifties: 26, wickets: 0, catches: 243 },
              odi: { matches: 113, runs: 4579, average: 47.83, hundreds: 12, fifties: 21, wickets: 0, catches: 132 },
              t20: { matches: 34, runs: 744, average: 31.00, hundreds: 0, fifties: 4, wickets: 0, catches: 26 }
            }
          },
          {
            _id: '20',
            name: 'Stuart Broad',
            role: 'bowler',
            nationality: 'English',
            image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop',
            teamId: { name: 'England', shortName: 'ENG', logo: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop' },
            age: 38,
            battingStyle: 'Left-hand bat',
            bowlingStyle: 'Right-arm fast-medium',
            form: 'good',
            isInjured: false,
            stats: { 
              test: { matches: 167, runs: 1506, wickets: 604, average: 27.68, economy: 3.16, strikeRate: 52.5, catches: 65 },
              odi: { matches: 121, runs: 559, wickets: 178, average: 30.22, economy: 5.24, strikeRate: 34.6, catches: 35 },
              t20: { matches: 56, runs: 119, wickets: 65, average: 24.77, economy: 7.66, strikeRate: 19.4, catches: 16 }
            }
          },
          // New Zealand Players
          {
            _id: '21',
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
              test: { matches: 101, runs: 8743, average: 54.31, hundreds: 32, fifties: 33, wickets: 0, catches: 75 },
              odi: { matches: 161, runs: 6173, average: 47.48, hundreds: 13, fifties: 42, wickets: 0, catches: 81 },
              t20: { matches: 85, runs: 2021, average: 32.89, hundreds: 0, fifties: 12, wickets: 0, catches: 42 }
            }
          },
          {
            _id: '22',
            name: 'Trent Boult',
            role: 'bowler',
            nationality: 'New Zealand',
            image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop',
            teamId: { name: 'New Zealand', shortName: 'NZ', logo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop' },
            age: 35,
            battingStyle: 'Right-hand bat',
            bowlingStyle: 'Left-arm fast-medium',
            form: 'excellent',
            isInjured: false,
            stats: { 
              test: { matches: 78, runs: 673, wickets: 317, average: 27.49, economy: 3.03, strikeRate: 54.4, catches: 26 },
              odi: { matches: 93, runs: 232, wickets: 169, average: 25.99, economy: 4.85, strikeRate: 32.1, catches: 34 },
              t20: { matches: 44, runs: 61, wickets: 50, average: 20.68, economy: 7.72, strikeRate: 16.1, catches: 14 }
            }
          },
          // South Africa Players
          {
            _id: '23',
            name: 'Quinton de Kock',
            role: 'wicket-keeper',
            nationality: 'South African',
            image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop',
            teamId: { name: 'South Africa', shortName: 'SA', logo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop' },
            age: 31,
            battingStyle: 'Left-hand bat',
            bowlingStyle: 'Right-arm medium',
            form: 'excellent',
            isInjured: false,
            stats: { 
              test: { matches: 54, runs: 3300, average: 38.82, hundreds: 6, fifties: 22, wickets: 0, catches: 221 },
              odi: { matches: 143, runs: 5422, average: 44.36, hundreds: 17, fifties: 18, wickets: 0, catches: 204 },
              t20: { matches: 81, runs: 1735, average: 25.73, hundreds: 0, fifties: 9, wickets: 0, catches: 58 }
            }
          },
          {
            _id: '24',
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
              test: { matches: 65, runs: 681, wickets: 295, average: 22.37, economy: 3.32, strikeRate: 40.4, catches: 17 },
              odi: { matches: 98, runs: 247, wickets: 154, average: 28.85, economy: 4.98, strikeRate: 34.7, catches: 22 },
              t20: { matches: 32, runs: 47, wickets: 31, average: 26.58, economy: 7.32, strikeRate: 21.8, catches: 8 }
            }
          },
          // Pakistan Players
          {
            _id: '25',
            name: 'Babar Azam',
            role: 'batsman',
            nationality: 'Pakistani',
            image: 'https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop',
            teamId: { name: 'Pakistan', shortName: 'PAK', logo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop' },
            age: 30,
            battingStyle: 'Right-hand bat',
            bowlingStyle: 'Right-arm medium',
            form: 'excellent',
            isInjured: false,
            isCaptain: true,
            stats: { 
              test: { matches: 53, runs: 3962, average: 45.85, hundreds: 10, fifties: 26, wickets: 0, catches: 67 },
              odi: { matches: 113, runs: 5729, average: 56.72, hundreds: 19, fifties: 31, wickets: 0, catches: 64 },
              t20: { matches: 109, runs: 3485, average: 41.48, hundreds: 3, fifties: 30, wickets: 0, catches: 52 }
            }
          }
        ],
        pagination: { page: 1, limit: 50, total: 25, pages: 1 }
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
          }
        ],
        pagination: { page: 1, limit: 20, total: 3, pages: 1 }
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
          { _id: 'venue3', name: 'Eden Gardens', city: 'Kolkata', country: 'India', capacity: 68000 }
        ],
        pagination: { page: 1, limit: 20, total: 5, pages: 1 }
      };
    }

    if (endpoint.includes('/v2/fantasy/leaderboard')) {
      return {
        leaderboard: [
          { playerId: '1', playerName: 'Virat Kohli', totalPoints: 2450, rank: 1 },
          { playerId: '6', playerName: 'Steve Smith', totalPoints: 2380, rank: 2 },
          { playerId: '11', playerName: 'Joe Root', totalPoints: 2350, rank: 3 }
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

    if (endpoint.includes('/v2/teams/stats')) {
      return {
        totalPlayers: 15,
        availablePlayers: 13,
        injuredPlayers: 2,
        averageFitness: 87,
        teamForm: 'excellent'
      };
    }

    if (endpoint.includes('/v2/training/schedule')) {
      return {
        schedule: [
          {
            id: "1",
            date: "2025-09-21",
            type: "Batting Practice",
            focus: "Power Hitting",
            duration: "2 hours",
            participants: 8
          },
          {
            id: "2",
            date: "2025-09-22", 
            type: "Bowling Session",
            focus: "Death Bowling",
            duration: "1.5 hours",
            participants: 6
          },
          {
            id: "3",
            date: "2025-09-23",
            type: "Fitness Training",
            focus: "Endurance",
            duration: "1 hour",
            participants: 15
          }
        ]
      };
    }

    if (endpoint.includes('/v2/search')) {
      // Mock search results based on query
      return [
        { name: 'Virat Kohli', type: 'player', id: '1', team: 'India' },
        { name: 'Steve Smith', type: 'player', id: '11', team: 'Australia' },
        { name: 'India', type: 'team', id: 'team1', shortName: 'IND' },
        { name: 'Australia', type: 'team', id: 'team2', shortName: 'AUS' },
        { name: 'Melbourne Cricket Ground', type: 'venue', id: 'venue1', city: 'Melbourne' }
      ];
    }

    // Default fallback for any unmatched endpoints
    return { 
      data: [], 
      message: 'Mock data not available for this endpoint',
      pagination: { page: 1, limit: 20, total: 0, pages: 0 }
    };
  }

  // Auth methods
  async register(userData: RegisterRequest): Promise<AuthResponse> {
    return this.request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    });
  }

  async login(credentials: LoginRequest): Promise<AuthResponse> {
    return this.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    });
  }

  async logout() {
    return this.request("/api/auth/logout", { method: "POST" });
  }

  async verifyEmail(token: string) {
    return this.request("/api/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
  }

  // Players API
  async getPlayers(params: any = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) queryParams.append(key, value.toString());
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
  async getTeams(params: any = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) queryParams.append(key, value.toString());
    });
    
    const response = await this.request(`/v2/teams?${queryParams}`);
    return response.teams || response.data || [];
  }

  async getTeam(id: string) {
    const response = await this.request(`/v2/teams/${id}`);
    return response.team || response.data || {};
  }

  // Matches API
  async getMatches(params: any = {}) {
    const queryParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) queryParams.append(key, value.toString());
    });
    
    const response = await this.request(`/v2/matches?${queryParams}`);
    return response.matches || response.data || [];
  }

  async getMatch(id: string) {
    const response = await this.request(`/v2/matches/${id}`);
    return response.match || response.data || {};
  }

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

  // Venues API
  async getVenues(params: any = {}) {
    const response = await this.request('/v2/venues');
    return response.venues || response.data || [];
  }

  // Fantasy API
  async getFantasyLeaderboard(type?: string, limit?: number) {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (limit) params.append('limit', limit.toString());
    
    const endpoint = `/v2/fantasy/leaderboard${params.toString() ? '?' + params.toString() : ''}`;
    const response = await this.request(endpoint);
    return response.leaderboard || response.data || [];
  }

  // Analytics API
  async getTopPerformers(format?: string) {
    const params = format ? `?format=${format}` : '';
    const response = await this.request(`/v2/analytics/top-performers${params}`);
    return response;
  }

  async getDashboardStats() {
    const response = await this.request('/v2/stats/dashboard');
    return response;
  }

  // Admin API
  async getAdminStats() {
    const response = await this.request('/v2/admin/stats');
    return response;
  }

  async syncData(type: string = 'all') {
    const response = await this.request('/v2/sync', {
      method: 'POST',
      body: JSON.stringify({ type })
    });
    return response;
  }

  // Search API
  async search(query: string, type: string = 'all', limit: number = 20) {
    const params = new URLSearchParams();
    params.append('query', query);
    params.append('type', type);
    params.append('limit', limit.toString());
    
    const response = await this.request(`/v2/search?${params.toString()}`);
    return response;
  }

  // Saved Analysis API
  async createSavedAnalysis(analysisData: {
    title: string;
    description: string;
    analysisType: string;
    analysisData: any;
    tags?: string[];
    isPublic?: boolean;
  }) {
    const response = await this.request('/v2/saved-analysis', {
      method: 'POST',
      body: JSON.stringify(analysisData)
    });
    return response;
  }

  async getSavedAnalyses(type?: string, limit?: number) {
    const params = new URLSearchParams();
    if (type) params.append('type', type);
    if (limit) params.append('limit', limit.toString());
    
    const endpoint = `/v2/saved-analysis${params.toString() ? '?' + params.toString() : ''}`;
    const response = await this.request(endpoint);
    return response.analyses || response.data || [];
  }

  async updateSavedAnalysis(id: string, analysisData: {
    title?: string;
    description?: string;
    analysisData?: any;
    tags?: string[];
    isPublic?: boolean;
  }) {
    const response = await this.request(`/v2/saved-analysis/${id}`, {
      method: 'PUT',
      body: JSON.stringify(analysisData)
    });
    return response;
  }

  async deleteSavedAnalysis(id: string) {
    const response = await this.request(`/v2/saved-analysis/${id}`, {
      method: 'DELETE'
    });
    return response;
  }

  // Favorite Players API
  async getFavoritePlayers() {
    const response = await this.request('/v2/favorite-players');
    return response.favorites || response.data || [];
  }

  async addFavoritePlayer(playerData: {
    playerId: string;
    playerName: string;
    playerRole: string;
    nationality: string;
    teamName: string;
    notes?: string;
    tags?: string[];
  }) {
    const response = await this.request('/v2/favorite-players', {
      method: 'POST',
      body: JSON.stringify(playerData)
    });
    return response;
  }

  async removeFavoritePlayer(playerId: string) {
    const response = await this.request(`/v2/favorite-players/${playerId}`, {
      method: 'DELETE'
    });
    return response;
  }

  // User Preferences API
  async getUserPreferences() {
    const response = await this.request('/v2/user/preferences');
    return response.preferences || response.data || {};
  }

  async updateUserPreferences(preferences: any) {
    const response = await this.request('/v2/user/preferences', {
      method: 'PUT',
      body: JSON.stringify({ preferences })
    });
    return response;
  }

  // Enhanced Player Search API
  async searchPlayers(query?: string, filters?: {
    role?: string;
    team?: string;
    form?: string;
    nationality?: string;
  }, limit?: number) {
    const params = new URLSearchParams();
    if (query) params.append('query', query);
    if (filters?.role) params.append('role', filters.role);
    if (filters?.team) params.append('team', filters.team);
    if (filters?.form) params.append('form', filters.form);
    if (filters?.nationality) params.append('nationality', filters.nationality);
    if (limit) params.append('limit', limit.toString());
    
    const endpoint = `/v2/players/search${params.toString() ? '?' + params.toString() : ''}`;
    const response = await this.request(endpoint);
    return response.players || response.data || [];
  }

  // Get player details (mock data)
  async getPlayerById(playerId: string) {
    const response = await this.request(`/v2/players/${playerId}`);
    return response.player || response.data || null;
  }

  // Token management methods
  setToken(token: string) {
    localStorage.setItem('auth-token', token);
  }

  clearToken() {
    localStorage.removeItem('auth-token');
  }

  // Additional auth methods
  async resendVerification(email: string) {
    const response = await this.request('/api/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
    return response;
  }

  async forgotPassword(email: string) {
    const response = await this.request('/api/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email })
    });
    return response;
  }

  async devVerify(emailOrUsername: string) {
    const response = await this.request('/api/auth/dev-verify', {
      method: 'POST',
      body: JSON.stringify({ emailOrUsername })
    });
    return response;
  }

  async devLogin(role: string = 'analyst') {
    const response = await this.request('/api/auth/dev-login', {
      method: 'POST',
      body: JSON.stringify({ role })
    });
    return response;
  }

  // Team management methods for coaches
  async getTeamStats() {
    const response = await this.request('/v2/teams/stats');
    return response;
  }

  async getTrainingSchedule() {
    const response = await this.request('/v2/training/schedule');
    return response;
  }

  // Generic HTTP methods
  async get(endpoint: string, params?: any) {
    // Remove /api prefix if present since it's already in baseURL
    const cleanEndpoint = endpoint.startsWith('/api') ? endpoint.substring(4) : endpoint;
    const queryParams = params ? new URLSearchParams(params).toString() : '';
    const url = queryParams ? `${cleanEndpoint}?${queryParams}` : cleanEndpoint;
    return await this.request(url);
  }

  async post(endpoint: string, data?: any) {
    // Remove /api prefix if present since it's already in baseURL
    const cleanEndpoint = endpoint.startsWith('/api') ? endpoint.substring(4) : endpoint;
    return await this.request(cleanEndpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  async put(endpoint: string, data?: any) {
    // Remove /api prefix if present since it's already in baseURL
    const cleanEndpoint = endpoint.startsWith('/api') ? endpoint.substring(4) : endpoint;
    return await this.request(cleanEndpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined
    });
  }

  async delete(endpoint: string) {
    // Remove /api prefix if present since it's already in baseURL
    const cleanEndpoint = endpoint.startsWith('/api') ? endpoint.substring(4) : endpoint;
    return await this.request(cleanEndpoint, {
      method: 'DELETE'
    });
  }
}

export const apiClient = new ApiClient();