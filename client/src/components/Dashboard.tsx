import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MatchCard } from "./MatchCard";
import { PlayerCard } from "./PlayerCard";
import { DashboardChart } from "./DashboardChart";
import { AnalystDashboard } from "./AnalystDashboard";
import { FanDashboard } from "./FanDashboard";
import { CoachDashboard } from "./CoachDashboard";

type UserRole = "coach" | "analyst" | "fan";

interface DashboardProps {
  userRole: UserRole;
  userName: string;
}

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-lg bg-slate-800/40 border-slate-700">
          <CardHeader className="bg-gradient-to-r from-green-800/40 to-emerald-800/40 rounded-t-lg pb-3">
            <CardTitle className="text-sm font-bold text-white flex items-center justify-between">
              Win Rate
              <span className="h-8 w-8 rounded-full bg-green-800/60 flex items-center justify-center">
                <span className="text-green-300 font-bold text-xs">W</span>
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-white">73%</div>
            <p className="text-sm text-green-400 font-medium mt-2">
              ↗ +12% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-slate-800/40 border-slate-700">
          <CardHeader className="bg-gradient-to-r from-blue-800/40 to-indigo-800/40 rounded-t-lg pb-3">
            <CardTitle className="text-sm font-bold text-white flex items-center justify-between">
              Available Players
              <span className="h-8 w-8 rounded-full bg-blue-800/60 flex items-center justify-center">
                <span className="text-blue-300 font-bold text-xs">P</span>
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-white">18</div>
            <p className="text-sm text-gray-300 font-medium mt-2">
              3 injured, 15 fit
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-slate-800/40 border-slate-700">
          <CardHeader className="bg-gradient-to-r from-purple-800/40 to-pink-800/40 rounded-t-lg pb-3">
            <CardTitle className="text-sm font-bold text-white flex items-center justify-between">
              Next Match
              <span className="h-8 w-8 rounded-full bg-purple-800/60 flex items-center justify-center">
                <span className="text-purple-300 font-bold text-xs">M</span>
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-white">2 days</div>
            <p className="text-sm text-gray-300 font-medium mt-2">
              vs Australia - MCG
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg bg-slate-800/40 border-slate-700">
          <CardHeader className="bg-gradient-to-r from-orange-800/40 to-amber-800/40 rounded-t-lg pb-3">
            <CardTitle className="text-sm font-bold text-white flex items-center justify-between">
              Team Rating
              <span className="h-8 w-8 rounded-full bg-orange-800/60 flex items-center justify-center">
                <span className="text-orange-300 font-bold text-xs">R</span>
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="text-3xl font-bold text-white">8.7</div>
            <p className="text-sm text-green-400 font-medium mt-2">
              ↗ Excellent form
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

  const renderAnalystDashboard = () => <AnalystDashboard />;

  const renderFanDashboard = () => <FanDashboard />;

  const renderCoachDashboardNew = () => <CoachDashboard />;

  switch (userRole) {
    case 'coach':
      return renderCoachDashboardNew();
    case 'analyst':
      return renderAnalystDashboard();
    case 'fan':
      return renderFanDashboard();
    default:
      return renderFanDashboard();
  }
}
