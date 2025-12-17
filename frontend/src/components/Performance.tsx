import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TrendingUp, TrendingDown, Target, Activity, Zap, Award, BarChart3, Users } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend, ScatterChart, Scatter } from "recharts";

interface PlayerPerformance {
  name: string;
  team: string;
  matches: number;
  runs: number;
  wickets: number;
  average: number;
  strikeRate: number;
  economy: number;
  catches: number;
  fifties: number;
  hundreds: number;
  fiveWickets: number;
  form: number[];
  trend: 'up' | 'down' | 'stable';
  rating: number;
  role: 'batsman' | 'bowler' | 'allrounder' | 'wicketkeeper';
}

interface TeamPerformance {
  name: string;
  matches: number;
  points: number;
  netRunRate: number;
  powerplayAvg: number;
  middleOversAvg: number;
  deathOversAvg: number;
  battingRating: number;
  bowlingRating: number;
  fieldingRating: number;
  overallRating: number;
  recentForm: string[];
}

const mockPlayers: PlayerPerformance[] = [
  {
    name: "Virat Kohli",
    team: "India",
    matches: 14,
    runs: 856,
    wickets: 0,
    average: 61.1,
    strikeRate: 52.8,
    economy: 0,
    catches: 12,
    fifties: 4,
    hundreds: 2,
    fiveWickets: 0,
    form: [89, 67, 102, 45, 78, 134, 56, 91],
    trend: 'up',
    rating: 892,
    role: 'batsman'
  },
  {
    name: "Steve Smith",
    team: "Australia", 
    matches: 12,
    runs: 892,
    wickets: 2,
    average: 59.5,
    strikeRate: 54.2,
    economy: 0,
    catches: 8,
    fifties: 3,
    hundreds: 3,
    fiveWickets: 0,
    form: [142, 67, 89, 23, 156, 78, 45, 98],
    trend: 'stable',
    rating: 884,
    role: 'batsman'
  },
  {
    name: "Jasprit Bumrah",
    team: "India",
    matches: 14,
    runs: 89,
    wickets: 38,
    average: 22.1,
    strikeRate: 45.6,
    economy: 2.9,
    catches: 3,
    fifties: 0,
    hundreds: 0,
    fiveWickets: 3,
    form: [4, 2, 5, 1, 3, 6, 2, 4],
    trend: 'up',
    rating: 876,
    role: 'bowler'
  },
  {
    name: "Pat Cummins",
    team: "Australia",
    matches: 12,
    runs: 156,
    wickets: 42,
    average: 19.5,
    strikeRate: 48.2,
    economy: 2.8,
    catches: 5,
    fifties: 0,
    hundreds: 0,
    fiveWickets: 4,
    form: [3, 5, 2, 4, 1, 3, 6, 2],
    trend: 'down',
    rating: 863,
    role: 'bowler'
  },
  {
    name: "Ben Stokes",
    team: "England",
    matches: 13,
    runs: 623,
    wickets: 18,
    average: 43.8,
    strikeRate: 67.2,
    economy: 3.4,
    catches: 14,
    fifties: 3,
    hundreds: 1,
    fiveWickets: 1,
    form: [67, 89, 23, 45, 112, 34, 78, 56],
    trend: 'up',
    rating: 798,
    role: 'allrounder'
  }
];

const mockTeams: TeamPerformance[] = [
  {
    name: "Australia",
    matches: 12,
    points: 18,
    netRunRate: 0.89,
    powerplayAvg: 67.4,
    middleOversAvg: 142.6,
    deathOversAvg: 89.2,
    battingRating: 8.7,
    bowlingRating: 8.9,
    fieldingRating: 8.5,
    overallRating: 8.7,
    recentForm: ['W', 'W', 'L', 'W', 'W']
  },
  {
    name: "India", 
    matches: 14,
    points: 20,
    netRunRate: 0.76,
    powerplayAvg: 63.2,
    middleOversAvg: 138.9,
    deathOversAvg: 86.7,
    battingRating: 8.5,
    bowlingRating: 8.8,
    fieldingRating: 8.3,
    overallRating: 8.5,
    recentForm: ['W', 'L', 'W', 'W', 'D']
  },
  {
    name: "England",
    matches: 13,
    points: 15,
    netRunRate: 0.34,
    powerplayAvg: 71.8,
    middleOversAvg: 129.4,
    deathOversAvg: 92.1,
    battingRating: 8.2,
    bowlingRating: 7.9,
    fieldingRating: 8.1,
    overallRating: 8.1,
    recentForm: ['L', 'W', 'W', 'L', 'D']
  }
];

export function Performance() {
  const [selectedTab, setSelectedTab] = useState("players");
  const [filterRole, setFilterRole] = useState("all");
  const [filterTeam, setFilterTeam] = useState("all");
  const [sortBy, setSortBy] = useState("rating");
  const [players, setPlayers] = useState<PlayerPerformance[]>([]);
  const [teams, setTeams] = useState<TeamPerformance[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const loadData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 900));
      setPlayers(mockPlayers);
      setTeams(mockTeams);
      setIsLoading(false);
    };
    
    loadData();
  }, []);

  const filteredPlayers = players.filter(player => {
    const roleMatch = filterRole === "all" || player.role === filterRole;
    const teamMatch = filterTeam === "all" || player.team === filterTeam;
    return roleMatch && teamMatch;
  });

  const sortedPlayers = [...filteredPlayers].sort((a, b) => {
    switch (sortBy) {
      case "rating":
        return b.rating - a.rating;
      case "runs":
        return b.runs - a.runs;
      case "wickets":
        return b.wickets - a.wickets;
      case "average":
        return b.average - a.average;
      default:
        return b.rating - a.rating;
    }
  });

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'down': return <TrendingDown className="w-4 h-4 text-red-500" />;
      default: return <Target className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'batsman': return 'bg-blue-500';
      case 'bowler': return 'bg-red-500';
      case 'allrounder': return 'bg-green-500';
      case 'wicketkeeper': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  const performanceData = players.map(player => ({
    name: player.name.split(' ').pop(),
    rating: player.rating,
    average: player.average,
    strikeRate: player.strikeRate,
    runs: player.runs,
    wickets: player.wickets
  }));

  const teamComparisonData = teams.map(team => ({
    name: team.name,
    batting: team.battingRating,
    bowling: team.bowlingRating,
    fielding: team.fieldingRating,
    overall: team.overallRating
  }));

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
          <h1 className="text-3xl font-bold tracking-tight">Performance Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive player and team performance insights
          </p>
        </div>
        
        <div className="flex gap-2">
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="batsman">Batsman</SelectItem>
              <SelectItem value="bowler">Bowler</SelectItem>
              <SelectItem value="allrounder">All-rounder</SelectItem>
              <SelectItem value="wicketkeeper">Wicketkeeper</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterTeam} onValueChange={setFilterTeam}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Team" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Teams</SelectItem>
              {Array.from(new Set(players.map(p => p.team))).map(team => (
                <SelectItem key={team} value={team}>{team}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rating">Rating</SelectItem>
              <SelectItem value="runs">Runs</SelectItem>
              <SelectItem value="wickets">Wickets</SelectItem>
              <SelectItem value="average">Average</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Rated Player</CardTitle>
            {/* <Award className="h-4 w-4 text-muted-foreground" /> */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sortedPlayers[0]?.rating || 0}</div>
            <p className="text-xs text-muted-foreground">
              {sortedPlayers[0]?.name || 'No data'}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Highest Average</CardTitle>
            {/* <Target className="h-4 w-4 text-muted-foreground" /> */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.max(...players.map(p => p.average)).toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Batting average
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Most Wickets</CardTitle>
            {/* <Activity className="h-4 w-4 text-muted-foreground" /> */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.max(...players.map(p => p.wickets))}
            </div>
            <p className="text-xs text-muted-foreground">
              Season total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Players</CardTitle>
            {/* <Users className="h-4 w-4 text-muted-foreground" /> */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{players.length}</div>
            <p className="text-xs text-muted-foreground">
              Active players
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="players">Players</TabsTrigger>
          <TabsTrigger value="teams">Teams</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
          <TabsTrigger value="comparison">Comparison</TabsTrigger>
        </TabsList>
        
        <TabsContent value="players" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Player Ratings</CardTitle>
                <CardDescription>Current ICC ratings comparison</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="rating" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Performance Scatter</CardTitle>
                <CardDescription>Average vs Strike Rate correlation</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <ScatterChart data={performanceData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="average" name="Average" />
                    <YAxis dataKey="strikeRate" name="Strike Rate" />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                    <Scatter dataKey="runs" fill="hsl(var(--chart-1))" />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          {/* Player Cards */}
          <div className="space-y-4">
            {sortedPlayers.map((player, index) => (
              <motion.div
                key={player.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <Badge variant="outline">#{index + 1}</Badge>
                        <div>
                          <h3 className="font-semibold text-lg">{player.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="secondary">{player.team}</Badge>
                            <div className={`w-2 h-2 rounded-full ${getRoleColor(player.role)}`} />
                            <span className="text-sm text-muted-foreground capitalize">{player.role}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <p className="text-2xl font-bold">{player.rating}</p>
                          <p className="text-sm text-muted-foreground">ICC Rating</p>
                        </div>
                        {getTrendIcon(player.trend)}
                      </div>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Matches</p>
                        <p className="font-medium">{player.matches}</p>
                      </div>
                      
                      {player.role !== 'bowler' && (
                        <>
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Runs</p>
                            <p className="font-medium">{player.runs}</p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Average</p>
                            <p className="font-medium">{player.average.toFixed(1)}</p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Strike Rate</p>
                            <p className="font-medium">{player.strikeRate.toFixed(1)}</p>
                          </div>
                        </>
                      )}
                      
                      {player.role !== 'batsman' && player.wickets > 0 && (
                        <>
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Wickets</p>
                            <p className="font-medium">{player.wickets}</p>
                          </div>
                          <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">Economy</p>
                            <p className="font-medium">{player.economy.toFixed(1)}</p>
                          </div>
                        </>
                      )}
                    </div>
                    
                    <div className="mt-4">
                      <p className="text-sm text-muted-foreground mb-2">Recent Form</p>
                      <div className="flex gap-1">
                        {player.form.slice(-8).map((score, idx) => (
                          <div
                            key={idx}
                            className="w-8 h-8 bg-muted rounded flex items-center justify-center text-xs font-medium"
                          >
                            {score}
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="teams" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Team Ratings Comparison</CardTitle>
                <CardDescription>Overall performance across departments</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={teamComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[7, 10]} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="batting" fill="hsl(var(--chart-1))" name="Batting" />
                    <Bar dataKey="bowling" fill="hsl(var(--chart-2))" name="Bowling" />
                    <Bar dataKey="fielding" fill="hsl(var(--chart-3))" name="Fielding" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Overall Ratings</CardTitle>
                <CardDescription>Combined team performance scores</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={teamComparisonData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis domain={[7, 10]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="overall" stroke="hsl(var(--primary))" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          {/* Team Cards */}
          <div className="space-y-4">
            {teams.map((team, index) => (
              <motion.div
                key={team.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold text-lg">{team.name}</h3>
                        <p className="text-sm text-muted-foreground">{team.matches} matches played</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{team.overallRating.toFixed(1)}</p>
                        <p className="text-sm text-muted-foreground">Overall Rating</p>
                      </div>
                    </div>
                    
                    <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Points</p>
                        <p className="font-medium">{team.points}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">NRR</p>
                        <p className="font-medium">{team.netRunRate.toFixed(2)}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Batting</p>
                        <p className="font-medium">{team.battingRating.toFixed(1)}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Bowling</p>
                        <p className="font-medium">{team.bowlingRating.toFixed(1)}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Fielding</p>
                        <p className="font-medium">{team.fieldingRating.toFixed(1)}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">Recent Form</p>
                        <div className="flex gap-1">
                          {team.recentForm.map((result, idx) => (
                            <div
                              key={idx}
                              className={`w-6 h-6 rounded text-xs font-medium flex items-center justify-center ${
                                result === 'W' ? 'bg-green-500 text-white' :
                                result === 'L' ? 'bg-red-500 text-white' :
                                'bg-yellow-500 text-white'
                              }`}
                            >
                              {result}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
        
        <TabsContent value="trends" className="space-y-4">
          <div className="grid gap-4 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Player Form Trends</CardTitle>
                <CardDescription>Recent performance patterns</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={Array.from({length: 8}, (_, i) => ({
                    match: `M${i + 1}`,
                    kohli: mockPlayers[0].form[i] || 0,
                    smith: mockPlayers[1].form[i] || 0,
                    stokes: mockPlayers[4].form[i] || 0
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="match" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="kohli" stroke="hsl(var(--chart-1))" name="V. Kohli" strokeWidth={2} />
                    <Line type="monotone" dataKey="smith" stroke="hsl(var(--chart-2))" name="S. Smith" strokeWidth={2} />
                    <Line type="monotone" dataKey="stokes" stroke="hsl(var(--chart-3))" name="B. Stokes" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Role Distribution</CardTitle>
                <CardDescription>Player roles breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['batsman', 'bowler', 'allrounder', 'wicketkeeper'].map(role => {
                    const count = players.filter(p => p.role === role).length;
                    const percentage = (count / players.length) * 100;
                    
                    return (
                      <div key={role} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="capitalize font-medium">{role}</span>
                          <span className="text-muted-foreground">{count} players</span>
                        </div>
                        <Progress value={percentage} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="comparison" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performers Comparison</CardTitle>
              <CardDescription>Multi-dimensional performance analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={[
                  { metric: 'Batting Avg', kohli: 90, smith: 85, stokes: 65 },
                  { metric: 'Strike Rate', kohli: 75, smith: 70, stokes: 85 },
                  { metric: 'Bowling Avg', kohli: 0, smith: 0, stokes: 60 },
                  { metric: 'Fielding', kohli: 80, smith: 70, stokes: 90 },
                  { metric: 'Consistency', kohli: 95, smith: 90, stokes: 75 },
                  { metric: 'Impact', kohli: 90, smith: 85, stokes: 95 }
                ]}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="metric" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="V. Kohli" dataKey="kohli" stroke="hsl(var(--chart-1))" fill="hsl(var(--chart-1))" fillOpacity={0.1} />
                  <Radar name="S. Smith" dataKey="smith" stroke="hsl(var(--chart-2))" fill="hsl(var(--chart-2))" fillOpacity={0.1} />
                  <Radar name="B. Stokes" dataKey="stokes" stroke="hsl(var(--chart-3))" fill="hsl(var(--chart-3))" fillOpacity={0.1} />
                  <Legend />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}