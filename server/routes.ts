import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { z } from "zod";
import { insertUserSchema, type PublicUser, type UserRole } from "@shared/schema";

// JWT Secret - required for security
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
const JWT_SECRET = process.env.JWT_SECRET;

// Rate limiting for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per windowMs
  message: { error: "Too many auth attempts, please try again later" },
  standardHeaders: true,
  legacyHeaders: false,
});

// Auth middleware
interface AuthenticatedRequest extends Request {
  user?: PublicUser & { role: UserRole };
}

const authenticateToken = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const user = await storage.getUser(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Remove password from user object
    const { password, ...publicUser } = user;
    req.user = publicUser as PublicUser & { role: UserRole };
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

// Role-based access control
const requireRole = (roles: UserRole[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};

// Login/Register schemas
const loginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

const registerSchema = insertUserSchema;

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post('/api/auth/register', authLimiter, async (req: Request, res: Response) => {
    try {
      const validatedData = registerSchema.parse(req.body);
      
      // Check if user already exists
      const existingUserByUsername = await storage.getUserByUsername(validatedData.username);
      if (existingUserByUsername) {
        return res.status(400).json({ error: 'Username already exists' });
      }
      
      const existingUserByEmail = await storage.getUserByEmail(validatedData.email);
      if (existingUserByEmail) {
        return res.status(400).json({ error: 'Email already exists' });
      }

      // Create user
      const user = await storage.createUser(validatedData);
      
      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
      
      res.status(201).json({
        user,
        token,
        message: 'User registered successfully'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input data', details: error.errors });
      }
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/auth/login', authLimiter, async (req: Request, res: Response) => {
    try {
      const { username, password } = loginSchema.parse(req.body);
      
      // Find user by username or email
      let user = await storage.getUserByUsername(username);
      if (!user) {
        user = await storage.getUserByEmail(username);
      }
      
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Verify password
      const isValidPassword = await storage.verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Generate JWT token
      const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '7d' });
      
      // Remove password from response
      const { password: _, ...publicUser } = user;
      
      res.json({
        user: publicUser,
        token,
        message: 'Login successful'
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: 'Invalid input data', details: error.errors });
      }
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/auth/me', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    res.json({ user: req.user });
  });

  app.post('/api/auth/logout', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    // In a production app, you'd invalidate the token server-side
    // For now, we'll rely on client-side token removal
    res.json({ message: 'Logout successful' });
  });

  // Team routes (coaches and analysts can view all teams)
  app.get('/api/teams', authenticateToken, requireRole(['coach', 'analyst']), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const teams = await storage.getTeams();
      res.json(teams);
    } catch (error) {
      console.error('Error fetching teams:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Player routes (coaches and analysts can view all players)
  app.get('/api/players', authenticateToken, requireRole(['coach', 'analyst']), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { teamId } = req.query;
      const players = await storage.getPlayers(teamId as string);
      res.json(players);
    } catch (error) {
      console.error('Error fetching players:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/players/:id', authenticateToken, requireRole(['coach', 'analyst']), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const player = await storage.getPlayer(id);
      if (!player) {
        return res.status(404).json({ error: 'Player not found' });
      }
      res.json(player);
    } catch (error) {
      console.error('Error fetching player:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Match routes
  app.get('/api/matches', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { status } = req.query;
      const matches = await storage.getMatches(status as 'upcoming' | 'live' | 'completed');
      res.json(matches);
    } catch (error) {
      console.error('Error fetching matches:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/matches/:id', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const match = await storage.getMatch(id);
      if (!match) {
        return res.status(404).json({ error: 'Match not found' });
      }
      res.json(match);
    } catch (error) {
      console.error('Error fetching match:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Player stats routes (coaches and analysts only)
  app.get('/api/players/:id/stats', authenticateToken, requireRole(['coach', 'analyst']), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { id } = req.params;
      const { season } = req.query;
      const stats = await storage.getPlayerStats(id, season as string);
      res.json(stats);
    } catch (error) {
      console.error('Error fetching player stats:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // User-specific routes
  app.get('/api/user/predictions', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const predictions = await storage.getUserPredictions(req.user!.id);
      res.json(predictions);
    } catch (error) {
      console.error('Error fetching predictions:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/user/predictions', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const prediction = await storage.createPrediction({
        ...req.body,
        userId: req.user!.id
      });
      res.status(201).json(prediction);
    } catch (error) {
      console.error('Error creating prediction:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.get('/api/user/favorites', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const favorites = await storage.getUserFavorites(req.user!.id);
      res.json(favorites);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/user/favorites', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { playerId, teamId } = req.body;
      const favorite = await storage.addToFavorites(req.user!.id, playerId, teamId);
      res.status(201).json(favorite);
    } catch (error) {
      console.error('Error adding to favorites:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.delete('/api/user/favorites', authenticateToken, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const { playerId, teamId } = req.body;
      await storage.removeFromFavorites(req.user!.id, playerId, teamId);
      res.status(204).send();
    } catch (error) {
      console.error('Error removing from favorites:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Coach/Analyst only routes
  app.get('/api/user/analyses', authenticateToken, requireRole(['coach', 'analyst']), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const analyses = await storage.getUserAnalyses(req.user!.id);
      res.json(analyses);
    } catch (error) {
      console.error('Error fetching analyses:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  app.post('/api/user/analyses', authenticateToken, requireRole(['coach', 'analyst']), async (req: AuthenticatedRequest, res: Response) => {
    try {
      const analysis = await storage.createSavedAnalysis({
        ...req.body,
        userId: req.user!.id
      });
      res.status(201).json(analysis);
    } catch (error) {
      console.error('Error saving analysis:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
