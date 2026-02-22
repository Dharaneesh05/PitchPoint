# PitchPoint

A comprehensive cricket analytics platform providing real-time match insights, player performance analysis, and team management tools for coaches, analysts, and cricket enthusiasts.

## Overview

PitchPoint is a full-stack web application that combines live cricket data with machine learning-powered analytics to deliver actionable insights for cricket professionals and fans. The platform features role-based dashboards, advanced data visualization, and predictive analytics.

## Features

### Core Functionality
- Real-time match tracking and live score updates
- Comprehensive player performance analytics
- Team composition analysis and recommendations
- Historical match data and trend analysis
- Fantasy cricket suggestions powered by ML models
- User authentication and role-based access control

### User Roles
- **Analyst Dashboard**: Advanced statistics, data visualization, and custom report generation
- **Coach Dashboard**: Team selection tools, player comparison, and performance tracking
- **Fan Dashboard**: Match highlights, favorite players, and simplified analytics

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling and development
- TanStack Query for state management and caching
- Radix UI components for accessible UI primitives
- Tailwind CSS for styling
- Recharts for data visualization

### Backend
- Node.js with Express
- TypeScript for type safety
- Drizzle ORM for database operations
- MongoDB for document storage
- SQLite (development) / PostgreSQL (production)
- RESTful API architecture

### Machine Learning
- Python-based ML models
- Jupyter notebooks for analysis and prototyping
- Cricket performance prediction models

### Additional Tools
- Drizzle Kit for database migrations
- Cross-env for environment management
- ESBuild for server bundling

## Project Structure

```
PitchPoint/
│
├── frontend/               # React client application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # API clients and utilities
│   │   └── pages/          # Page components
│   ├── public/             # Static assets
│   │   └── Bg.jpg          # Background image
│   ├── components.json     # shadcn/ui configuration
│   ├── index.html
│   ├── package.json
│   ├── postcss.config.js   # PostCSS configuration
│   ├── tailwind.config.ts  # Tailwind CSS configuration
│   └── vite.config.ts
│
├── backend/                # Node.js server application
│   ├── *.ts                # Server TypeScript files
│   ├── routes.ts           # API routes
│   ├── index.ts            # Entry point
│   └── package.json
│
├── shared/                 # Shared code between frontend and backend
│   ├── schema.ts           # Database schema (PostgreSQL)
│   ├── schema-sqlite.ts    # Database schema (SQLite)
│   └── mongodb-schema.ts   # MongoDB schemas
│
├── database/               # Database files and migrations
│   ├── migrations/         # Drizzle ORM migrations
│   └── cricket.db          # SQLite database (dev only)
│
├── scripts/                # Utility scripts
│   └── init-db.cjs         # Database initialization
│
├── notebooks/              # Jupyter notebooks for ML
│   ├── Cricket_ct.ipynb
│   └── Cricket_ct_bowl.ipynb
│
├── drizzle.config.ts       # Drizzle ORM configuration
├── package.json            # Root package configuration
├── tsconfig.json           # TypeScript configuration
├── vite.config.ts          # Vite build configuration
├── vercel.json             # Vercel deployment config
├── render.yaml             # Render deployment config
├── .gitignore              # Git ignore rules
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn package manager
- Python 3.8+ (for ML features)
- Git

### Installation

1. Clone the repository
```bash
git clone https://github.com/yourusername/PitchPoint.git
cd PitchPoint
```

2. Install dependencies
```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install backend dependencies
cd backend
npm install
cd ..
```

3. Set up environment variables
```bash
# Create .env file in root directory
cp .env.example .env
# Edit .env with your configuration
```

4. Initialize the database
```bash
# Run migrations
npm run db:push

# Seed database with initial data (optional)
npm run db:seed
```

### Running the Application

#### Development Mode

Run both frontend and backend concurrently:
```bash
npm run dev
```

Or run them separately:

**Frontend:**
```bash
cd frontend
npm run dev
```

**Backend:**
```bash
cd backend
npm run dev
```

#### Production Mode

1. Build the application
```bash
npm run build
```

2. Start the production server
```bash
npm start
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/user` - Get current user

### Matches
- `GET /api/matches` - Get all matches
- `GET /api/matches/:id` - Get match details
- `GET /api/matches/live` - Get live matches

### Players
- `GET /api/players` - Get all players
- `GET /api/players/:id` - Get player details
- `GET /api/players/:id/stats` - Get player statistics

### Analytics
- `GET /api/analytics/team/:id` - Get team analytics
- `GET /api/analytics/player/:id` - Get player analytics
- `POST /api/analytics/predict` - ML-based predictions

## Database Schema

### User Management
- Users with role-based access (analyst, coach, fan)
- Secure password hashing with bcrypt
- Session management

### Cricket Data
- Matches with detailed metadata
- Player profiles and career statistics
- Team compositions and lineups
- Performance metrics and analytics

## Machine Learning Features

The platform includes Python-based ML models for:
- Player performance prediction
- Team composition optimization
- Match outcome forecasting
- Fantasy cricket recommendations

Notebooks are available in the project root for experimentation and model training.

## Deployment

### Vercel (Frontend)
The application is configured for deployment on Vercel with the included `vercel.json` configuration.

### Render (Full-stack)
Deploy the entire application on Render using the `render.yaml` configuration.

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Cricket data provided by various cricket APIs
- Built with modern web technologies and best practices
- Designed for scalability and maintainability

## Roadmap

- [ ] Enhanced machine learning models
- [ ] Real-time notifications system
- [ ] Mobile application (React Native)
- [ ] Advanced visualization dashboards
- [ ] Integration with additional cricket data sources
- [ ] Multi-language support
- [ ] Social features and user interactions
---