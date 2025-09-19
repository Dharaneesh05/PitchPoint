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
    createdAt: string;
    updatedAt: string;
  };
  token: string;
  message: string;
}

class ApiClient {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage on initialization
    this.token = localStorage.getItem('cricket-auth-token');
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return headers;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Network error' }));
      throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Auth methods
  async login(credentials: LoginRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    
    this.setToken(response.token);
    return response;
  }

  async register(userData: RegisterRequest): Promise<AuthResponse> {
    const response = await this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    
    this.setToken(response.token);
    return response;
  }

  async getMe(): Promise<{ user: AuthResponse['user'] }> {
    return this.request('/auth/me');
  }

  async logout(): Promise<{ message: string }> {
    const response = await this.request<{ message: string }>('/auth/logout', {
      method: 'POST',
    });
    this.clearToken();
    return response;
  }

  setToken(token: string) {
    this.token = token;
    localStorage.setItem('cricket-auth-token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('cricket-auth-token');
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  // Data methods
  async getTeams() {
    return this.request('/teams');
  }

  async getPlayers(teamId?: string) {
    const query = teamId ? `?teamId=${teamId}` : '';
    return this.request(`/players${query}`);
  }

  async getPlayer(id: string) {
    return this.request(`/players/${id}`);
  }

  async getMatches(status?: 'upcoming' | 'live' | 'completed') {
    const query = status ? `?status=${status}` : '';
    return this.request(`/matches${query}`);
  }

  async getMatch(id: string) {
    return this.request(`/matches/${id}`);
  }

  async getPlayerStats(playerId: string, season?: string) {
    const query = season ? `?season=${season}` : '';
    return this.request(`/players/${playerId}/stats${query}`);
  }

  async getUserPredictions() {
    return this.request('/user/predictions');
  }

  async createPrediction(prediction: any) {
    return this.request('/user/predictions', {
      method: 'POST',
      body: JSON.stringify(prediction),
    });
  }

  async getUserFavorites() {
    return this.request('/user/favorites');
  }

  async addToFavorites(playerId?: string, teamId?: string) {
    return this.request('/user/favorites', {
      method: 'POST',
      body: JSON.stringify({ playerId, teamId }),
    });
  }

  async removeFromFavorites(playerId?: string, teamId?: string) {
    return this.request('/user/favorites', {
      method: 'DELETE',
      body: JSON.stringify({ playerId, teamId }),
    });
  }

  async getUserAnalyses() {
    return this.request('/user/analyses');
  }

  async createSavedAnalysis(analysis: any) {
    return this.request('/user/analyses', {
      method: 'POST',
      body: JSON.stringify(analysis),
    });
  }
}

export const apiClient = new ApiClient();
export type { AuthResponse, LoginRequest, RegisterRequest };
