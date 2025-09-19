import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MatchCard } from "./MatchCard";
import { PlayerCard } from "./PlayerCard";
import { DashboardChart } from "./DashboardChart";
import { TrendingUp, TrendingDown, Users, Trophy, Target, Activity, BarChart3 } from "lucide-react";

type UserRole = "coach" | "analyst" | "fan";

interface DashboardProps {
  userRole: UserRole;
  userName: string;
}

// todo: remove mock functionality - Mock data for demonstration
const mockMatches = [
  {
    id: "1",
    team1: { name: "India", score: "185/4 (18.2)" },
    team2: { name: "Australia", score: "188/6 (19.5)" },
    date: "Today, 7:30 PM",
    venue: "Melbourne Cricket Ground",
    status: "live" as const,
    format: "T20" as const,
  },
  {
    id: "2",
    team1: { name: "England" },
    team2: { name: "South Africa" },
    date: "Tomorrow, 2:00 PM",
    venue: "Lord's Cricket Ground",
    status: "upcoming" as const,
    format: "ODI" as const,
  },
  {
    id: "3",
    team1: { name: "Pakistan", score: "156" },
    team2: { name: "New Zealand", score: "159/3" },
    date: "Yesterday",
    venue: "Eden Gardens",
    status: "completed" as const,
    format: "T20" as const,
    result: "New Zealand won by 7 wickets"
  },
];

const mockPlayers = [
  {
    id: "1",
    name: "Virat Kohli",
    team: "Royal Challengers Bangalore",
    role: "batsman" as const,
    stats: { matches: 45, runs: 1842, average: 52.6, strikeRate: 138.2 },
    form: "excellent" as const,
  },
  {
    id: "2",
    name: "Jasprit Bumrah",
    team: "Mumbai Indians",
    role: "bowler" as const,
    stats: { matches: 38, wickets: 52, average: 18.4, economy: 6.8 },
    form: "good" as const,
  },
  {
    id: "3",
    name: "Ben Stokes",
    team: "Chennai Super Kings",
    role: "all-rounder" as const,
    stats: { matches: 42, runs: 1156, wickets: 24, average: 34.2, strikeRate: 142.8, economy: 7.2 },
    form: "average" as const,
    injured: true,
  },
];

const performanceData = [
  { name: "Jan", value: 85 },
  { name: "Feb", value: 92 },
  { name: "Mar", value: 78 },
  { name: "Apr", value: 95 },
  { name: "May", value: 88 },
  { name: "Jun", value: 91 },
];

const teamCompositionData = [
  { name: "Batsmen", value: 5 },
  { name: "Bowlers", value: 4 },
  { name: "All-rounders", value: 2 },
  { name: "Wicket-keepers", value: 1 },
];

const fanEngagementData = [
  { name: "Predictions", value: 234 },
  { name: "Favorites", value: 156 },
  { name: "Comments", value: 89 },
  { name: "Shares", value: 67 },
];

export function Dashboard({ userRole, userName }: DashboardProps) {
  const handleMatchAnalyze = (matchId: string) => {
    console.log('Analyzing match:', matchId);
  };

  const handleMatchPredict = (matchId: string) => {
    console.log('Predicting match:', matchId);
  };

  const handlePlayerAnalyze = (playerId: string) => {
    console.log('Analyzing player:', playerId);
  };

  const handlePlayerFavorite = (playerId: string) => {
    console.log('Toggling favorite for player:', playerId);
  };

  const renderCoachDashboard = () => (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Good morning, {userName}</h1>
        <p className="text-muted-foreground">Here's your team performance overview and upcoming matches.</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">73%</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Players</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">18</div>
            <p className="text-xs text-muted-foreground">
              3 injured, 15 fit
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Next Match</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2 days</div>
            <p className="text-xs text-muted-foreground">
              vs Australia - MCG
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Rating</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8.7</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              Excellent form
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardChart 
          title="Team Performance Trend" 
          data={performanceData} 
          type="line" 
        />
        <DashboardChart 
          title="Squad Composition" 
          data={teamCompositionData} 
          type="pie" 
        />
      </div>

      {/* Matches and Players */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Upcoming Matches</h2>
            <Button variant="outline" size="sm">View All</Button>
          </div>
          <div className="space-y-4">
            {mockMatches.slice(0, 2).map((match) => (
              <MatchCard 
                key={match.id} 
                match={match} 
                showAnalytics 
                onAnalyze={handleMatchAnalyze} 
              />
            ))}
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Key Players</h2>
            <Button variant="outline" size="sm">Team Selection</Button>
          </div>
          <div className="space-y-4">
            {mockPlayers.map((player) => (
              <PlayerCard 
                key={player.id} 
                player={player} 
                showActions 
                onAnalyze={handlePlayerAnalyze} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderAnalystDashboard = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Deep insights and performance analysis for {userName}.</p>
      </div>

      {/* Analytics Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reports Generated</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Data Points</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12.4K</div>
            <p className="text-xs text-muted-foreground">
              Analyzed this week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Accuracy Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">94%</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              +3% this quarter
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saved Analysis</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              Ready for review
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardChart 
          title="Performance Analysis Trends" 
          data={performanceData} 
          type="bar" 
        />
        <DashboardChart 
          title="Match Outcome Predictions" 
          data={teamCompositionData} 
          type="pie" 
        />
      </div>

      {/* Recent Analysis */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Match Analysis</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {mockMatches.map((match) => (
            <MatchCard 
              key={match.id} 
              match={match} 
              showAnalytics 
              onAnalyze={handleMatchAnalyze} 
            />
          ))}
        </div>
      </div>
    </div>
  );

  const renderFanDashboard = () => (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold text-foreground">Welcome back, {userName}!</h1>
        <p className="text-muted-foreground">Stay updated with live matches, make predictions, and track your favorites.</p>
      </div>

      {/* Fan Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prediction Score</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="inline h-3 w-3 mr-1" />
              Rank #156
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Correct Predictions</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <p className="text-xs text-muted-foreground">
              34 of 50 matches
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Favorite Teams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              Following updates
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fantasy Points</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,456</div>
            <p className="text-xs text-muted-foreground">
              This season
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Fan Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <DashboardChart 
          title="Your Prediction Accuracy" 
          data={performanceData} 
          type="line" 
        />
        <DashboardChart 
          title="Engagement Activity" 
          data={fanEngagementData} 
          type="bar" 
        />
      </div>

      {/* Live Matches and Favorites */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Live & Upcoming Matches</h2>
            <Badge variant="destructive" className="animate-pulse">2 LIVE</Badge>
          </div>
          <div className="space-y-4">
            {mockMatches.map((match) => (
              <MatchCard 
                key={match.id} 
                match={match} 
                showAnalytics 
                onPredict={handleMatchPredict} 
              />
            ))}
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Favorite Players</h2>
            <Button variant="outline" size="sm">Manage Favorites</Button>
          </div>
          <div className="space-y-4">
            {mockPlayers.map((player) => (
              <PlayerCard 
                key={player.id} 
                player={player} 
                showActions 
                onFavorite={handlePlayerFavorite} 
                isFavorite={player.id === '1'} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  switch (userRole) {
    case 'coach':
      return renderCoachDashboard();
    case 'analyst':
      return renderAnalystDashboard();
    case 'fan':
      return renderFanDashboard();
    default:
      return renderFanDashboard();
  }
}
