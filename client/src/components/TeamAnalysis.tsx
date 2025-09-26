import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart3, Users, Trophy, TrendingUp, Target, Activity, Zap, Award } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from "recharts";

interface TeamStats {
  name: string;
  matches: number;
  wins: number;
  losses: number;
  draws: number;
  winRate: number;
  avgScore: number;
  avgConceded: number;
  totalRuns: number;
  totalWickets: number;
  economy: number;
  strikeRate: number;
}

interface PlayerPerformance {
  name: string;
  runs: number;
  wickets: number;
  average: number;
  strikeRate: number;
  economy: number;
  matches: number;
}

// Mock data for teams
const mockTeams: TeamStats[] = [
  {
    name: "Australia",
    matches: 12,
    wins: 8,
    losses: 3,
    draws: 1,
    winRate: 66.7,
    avgScore: 387,
    avgConceded: 298,
    totalRuns: 4644,
    totalWickets: 178,
    economy: 3.2,
    strikeRate: 58.4
  },
  {
    name: "India", 
    matches: 14,
    wins: 9,
    losses: 4,
    draws: 1,
    winRate: 64.3,
    avgScore: 365,
    avgConceded: 312,
    totalRuns: 5110,
    totalWickets: 194,
    economy: 3.4,
    strikeRate: 54.2
  },
  {
    name: "England",
    matches: 13,
    wins: 7,
    losses: 5,
    draws: 1,
    winRate: 53.8,
    avgScore: 342,
    avgConceded: 329,
    totalRuns: 4446,
    totalWickets: 186,
    economy: 3.6,
    strikeRate: 62.1
  },
  {
    name: "South Africa",
    matches: 11,
    wins: 6,
    losses: 4,
    draws: 1,
    winRate: 54.5,
    avgScore: 328,
    avgConceded: 315,
    totalRuns: 3608,
    totalWickets: 162,
    economy: 3.5,
    strikeRate: 56.8
  },
  {
    name: "New Zealand",
    matches: 10,
    wins: 5,
    losses: 4,
    draws: 1,
    winRate: 50.0,
    avgScore: 315,
    avgConceded: 322,
    totalRuns: 3150,
    totalWickets: 148,
    economy: 3.7,
    strikeRate: 53.2
  },
  {
    name: "Pakistan",
    matches: 9,
    wins: 4,
    losses: 4,
    draws: 1,
    winRate: 44.4,
    avgScore: 298,
    avgConceded: 334,
    totalRuns: 2682,
    totalWickets: 132,
    economy: 3.8,
    strikeRate: 51.6
  },
  {
    name: "West Indies",
    matches: 8,
    wins: 3,
    losses: 5,
    draws: 0,
    winRate: 37.5,
    avgScore: 276,
    avgConceded: 356,
    totalRuns: 2208,
    totalWickets: 118,
    economy: 4.1,
    strikeRate: 59.3
  },
  {
    name: "Sri Lanka",
    matches: 7,
    wins: 2,
    losses: 5,
    draws: 0,
    winRate: 28.6,
    avgScore: 264,
    avgConceded: 378,
    totalRuns: 1848,
    totalWickets: 98,
    economy: 4.3,
    strikeRate: 48.7
  }
];

const mockTopPerformers: PlayerPerformance[] = [
  { name: "Steve Smith", runs: 892, wickets: 2, average: 59.5, strikeRate: 54.2, economy: 0, matches: 12 },
  { name: "Virat Kohli", runs: 856, wickets: 0, average: 61.1, strikeRate: 52.8, economy: 0, matches: 14 },
  { name: "Pat Cummins", runs: 156, wickets: 42, average: 19.5, strikeRate: 48.2, economy: 2.8, matches: 12 },
  { name: "Jasprit Bumrah", runs: 89, wickets: 38, average: 22.1, strikeRate: 45.6, economy: 2.9, matches: 14 },
  { name: "Joe Root", runs: 734, wickets: 3, average: 48.9, strikeRate: 56.7, economy: 0, matches: 13 }
];

export function TeamAnalysis() {
  const [selectedTeam, setSelectedTeam] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("winRate");
  const [teams, setTeams] = useState<TeamStats[]>([]);
  const [topPerformers, setTopPerformers] = useState<PlayerPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const loadData = async () => {
      setIsLoading(true);
      // Simulate loading delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      setTeams(mockTeams);
      setTopPerformers(mockTopPerformers);
      setIsLoading(false);
    };
    
    loadData();
  }, []);

  const filteredTeams = selectedTeam === "all" 
    ? teams 
    : teams.filter(team => team.name === selectedTeam);

  const sortedTeams = [...filteredTeams].sort((a, b) => {
    switch (sortBy) {
      case "winRate":
        return b.winRate - a.winRate;
      case "totalRuns":
        return b.totalRuns - a.totalRuns;
      case "totalWickets":
        return b.totalWickets - a.totalWickets;
      case "avgScore":
        return b.avgScore - a.avgScore;
      default:
        return b.winRate - a.winRate;
    }
  });

  const chartData = teams.map(team => ({
    name: team.name.substring(0, 3),
    wins: team.wins,
    losses: team.losses,
    draws: team.draws,
    winRate: team.winRate,
    avgScore: team.avgScore,
    economy: team.economy
  }));

  const radarData = selectedTeam !== "all" && teams.length > 0 
    ? [{
        metric: "Win Rate",
        value: teams.find(t => t.name === selectedTeam)?.winRate || 0,
        fullMark: 100
      }, {
        metric: "Avg Score",
        value: ((teams.find(t => t.name === selectedTeam)?.avgScore || 0) / 500) * 100,
        fullMark: 100
      }, {
        metric: "Economy",
        value: 100 - ((teams.find(t => t.name === selectedTeam)?.economy || 0) / 5) * 100,
        fullMark: 100
      }, {
        metric: "Strike Rate",
        value: (teams.find(t => t.name === selectedTeam)?.strikeRate || 0),
        fullMark: 100
      }]
    : [];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-muted rounded"></div>
            ))}
          </div>
          <div className="h-96 bg-muted rounded mt-6"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team Analysis</h1>
          <p className="text-muted-foreground">
            Comprehensive team performance analytics and comparisons
          </p>
        </div>
        
        <div className="flex gap-2">
          <Select value={selectedTeam} onValueChange={setSelectedTeam}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Select Team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teams</SelectItem>
              {teams.map((team) => (
                <SelectItem key={team.name} value={team.name}>
                  {team.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="winRate">Win Rate</SelectItem>
              <SelectItem value="totalRuns">Total Runs</SelectItem>
              <SelectItem value="totalWickets">Total Wickets</SelectItem>
              <SelectItem value="avgScore">Avg Score</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
            {/* <Users className="h-4 w-4 text-muted-foreground" /> */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teams.length}</div>
            <p className="text-xs text-muted-foreground">
              Active in competition
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
            {/* <Trophy className="h-4 w-4 text-muted-foreground" /> */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teams.reduce((sum, team) => sum + team.matches, 0)}</div>
            <p className="text-xs text-muted-foreground">
              Across all teams
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Runs</CardTitle>
            {/* <Target className="h-4 w-4 text-muted-foreground" /> */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teams.reduce((sum, team) => sum + team.totalRuns, 0).toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Combined scoring
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Wickets</CardTitle>
            {/* <Activity className="h-4 w-4 text-muted-foreground" /> */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teams.reduce((sum, team) => sum + team.totalWickets, 0)}</div>
            <p className="text-xs text-muted-foreground">
              Combined bowling
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
          <TabsTrigger value="players">Top Players</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Team Win Rates</CardTitle>
                <CardDescription>Comparison of team success rates</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="winRate" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Match Results Distribution</CardTitle>
                <CardDescription>Wins, losses, and draws across teams</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="wins" stackId="a" fill="hsl(var(--chart-1))" name="Wins" />
                    <Bar dataKey="losses" stackId="a" fill="hsl(var(--chart-2))" name="Losses" />
                    <Bar dataKey="draws" stackId="a" fill="hsl(var(--chart-3))" name="Draws" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Average Scores</CardTitle>
                <CardDescription>Team batting performance trends</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="avgScore" stroke="hsl(var(--primary))" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Economy Rates</CardTitle>
                <CardDescription>Bowling efficiency comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="economy" fill="hsl(var(--chart-4))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="comparison" className="space-y-4">
          {selectedTeam !== "all" && radarData.length > 0 ? (
            <Card>
              <CardHeader>
                <CardTitle>{selectedTeam} Performance Radar</CardTitle>
                <CardDescription>Multi-dimensional performance analysis</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="metric" />
                    <PolarRadiusAxis angle={90} domain={[0, 100]} />
                    <Radar
                      name={selectedTeam}
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      fill="hsl(var(--primary))"
                      fillOpacity={0.2}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <p className="text-muted-foreground">Select a specific team to view comparison radar chart</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="players" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performers</CardTitle>
              <CardDescription>Leading players across all teams</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPerformers.map((player, index) => (
                  <motion.div
                    key={player.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary">#{index + 1}</Badge>
                      <div>
                        <p className="font-medium">{player.name}</p>
                        <p className="text-sm text-muted-foreground">{player.matches} matches</p>
                      </div>
                    </div>
                    
                    <div className="flex gap-6 text-sm">
                      <div className="text-center">
                        <p className="font-medium">{player.runs}</p>
                        <p className="text-muted-foreground">Runs</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{player.wickets}</p>
                        <p className="text-muted-foreground">Wickets</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{player.average.toFixed(1)}</p>
                        <p className="text-muted-foreground">Average</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium">{player.strikeRate.toFixed(1)}</p>
                        <p className="text-muted-foreground">SR</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Team List */}
      <Card>
        <CardHeader>
          <CardTitle>Team Statistics</CardTitle>
          <CardDescription>Detailed performance metrics for all teams</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedTeams.map((team, index) => (
              <motion.div
                key={team.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 border rounded-lg space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline">#{index + 1}</Badge>
                    <h3 className="font-semibold text-lg">{team.name}</h3>
                    <Badge variant={team.winRate >= 60 ? "default" : team.winRate >= 40 ? "secondary" : "destructive"}>
                      {team.winRate.toFixed(1)}% Win Rate
                    </Badge>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {team.matches} matches played
                  </div>
                </div>
                
                <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                  <div>
                    <p className="text-sm text-muted-foreground">Wins</p>
                    <p className="font-medium text-green-600">{team.wins}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Losses</p>
                    <p className="font-medium text-red-600">{team.losses}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Draws</p>
                    <p className="font-medium text-yellow-600">{team.draws}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Avg Score</p>
                    <p className="font-medium">{team.avgScore}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Runs</p>
                    <p className="font-medium">{team.totalRuns.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Economy</p>
                    <p className="font-medium">{team.economy.toFixed(1)}</p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Win Rate</span>
                    <span>{team.winRate.toFixed(1)}%</span>
                  </div>
                  <Progress value={team.winRate} className="h-2" />
                </div>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}