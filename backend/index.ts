import 'dotenv/config';
import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { dbConnection } from "./mongodb";
import { dataSyncService } from "./dataSyncService";
import { fantasyPointsService } from "./fantasyService";

const app = express();

// CORS configuration for production deployment
app.use((req, res, next) => {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://pitch-point-frontend.vercel.app',
    'https://pitchpoint-frontend.vercel.app',
    'https://pitchpoint.vercel.app',
    'https://your-actual-vercel-domain.vercel.app',
    process.env.CLIENT_URL
  ].filter(Boolean);

  const origin = req.headers.origin;
  if (origin && (allowedOrigins.includes(origin) || origin.includes('vercel.app'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  } else if (!origin) {
    // Allow requests without origin (mobile apps, etc.)
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  // Connect to MongoDB first
  try {
    await dbConnection.connect();
    log('MongoDB connected successfully');
    
    // Initialize data sync service with CricAPI
    console.log("Initializing CricAPI data sync...");
    await dataSyncService.initialize();
    console.log("CricAPI data sync initialized");
    
    // Update fantasy points for completed matches
    log('Updating fantasy points...');
    await fantasyPointsService.updateFantasyPointsForCompletedMatches();
    log('Fantasy points updated');
    
  } catch (error) {
    console.error('Failed to initialize services:', error);
    // Don't exit, continue without data sync for development
    console.log('Continuing without data sync initialization...');
  }

  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  
  // Try different host configurations for better compatibility
  const host = process.env.NODE_ENV === 'development' ? 'localhost' : '0.0.0.0';
  
  server.listen(port, host, () => {
    log(`PitchPoint server running on http://${host}:${port}`);
    log(`API available at http://${host}:${port}/api`);
    log(`Environment: ${process.env.NODE_ENV || 'development'}`);
    log(`MongoDB: ${dbConnection.getConnectionStatus() ? 'Connected' : 'Disconnected'}`);
  });

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\nShutting down...');
    await dbConnection.disconnect();
    process.exit(0);
  });
})();
