import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Trophy, Users, BarChart3, Clock, MapPin, Target, Activity } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from "recharts";
import { format } from "date-fns";

interface Match {
  id: string;
  team1: string;
  team2: string;
  date: string;
  venue: string;
  format: string;
  status: 'completed' | 'live' | 'upcoming';
  result: string;
  winner: string;
  margin: string;
  team1Score: string;
  team2Score: string;
  motm: string;
  attendance: number;
  weather: string;
}

interface MatchStats {
  totalRuns: number;
  totalWickets: number;
  boundaries: number;
  sixes: number;
  extras: number;
  overs: number;
  runRate: number;
  partnerships: number;
}

interface PlayerInnings {
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
  status: string;
}

interface BowlingFigures {
  name: string;
  overs: number;
  maidens: number;
  runs: number;
  wickets: number;
  economy: number;
  dots: number;
}

// Mock data
const mockMatches: Match[] = [
  {
    id: "1",
    team1: "Australia",
    team2: "India",
    date: "2025-09-18T14:30:00Z",
    venue: "Melbourne Cricket Ground",
    format: "Test",
    status: "completed",
    result: "Australia won by 4 wickets",
    winner: "Australia",
    margin: "4 wickets",
    team1Score: "487 & 234/6",
    team2Score: "445 & 275",
    motm: "Steve Smith",
    attendance: 85000,
    weather: "Sunny, 24°C"
  },
  {
    id: "2",
    team1: "England",
    team2: "South Africa",
    date: "2025-09-15T11:00:00Z",
    venue: "Lord's Cricket Ground",
    format: "Test",
    status: "completed",
    result: "Match drawn",
    winner: "Draw",
    margin: "Match drawn",
    team1Score: "421 & 198/4",
    team2Score: "378 & 267",
    motm: "Joe Root",
    attendance: 28000,
    weather: "Overcast, 18°C"
  },
  {
    id: "3",
    team1: "New Zealand",
    team2: "Pakistan",
    date: "2025-09-12T22:00:00Z",
    venue: "Eden Park",
    format: "ODI",
    status: "completed",
    result: "New Zealand won by 45 runs",
    winner: "New Zealand",
    margin: "45 runs",
    team1Score: "312/7 (50)",
    team2Score: "267 (48.2)",
    motm: "Kane Williamson",
    attendance: 35000,
    weather: "Partly cloudy, 16°C"
  },
  {
    id: "4",
    team1: "West Indies",
    team2: "Sri Lanka",
    date: "2025-09-20T19:30:00Z",
    venue: "Kensington Oval",
    format: "T20",
    status: "live",
    result: "In progress",
    winner: "",
    margin: "",
    team1Score: "156/8 (20)",
    team2Score: "89/3 (12.4)",
    motm: "",
    attendance: 15000,
    weather: "Clear, 28°C"
  },
  {
    id: "5",
    team1: "Australia",
    team2: "England",
    date: "2025-09-25T03:30:00Z",
    venue: "Sydney Cricket Ground",
    format: "Test",
    status: "upcoming",
    result: "Scheduled",
    winner: "",
    margin: "",
    team1Score: "",
    team2Score: "",
    motm: "",
    attendance: 0,
    weather: "Forecast: Sunny, 22°C"
  }
];

const mockBattingData: PlayerInnings[] = [
  { name: "Steve Smith", runs: 142, balls: 186, fours: 15, sixes: 2, strikeRate: 76.3, status: "not out" },
  { name: "Marnus Labuschagne", runs: 89, balls: 156, fours: 11, sixes: 0, strikeRate: 57.1, status: "c Kohli b Bumrah" },
  { name: "David Warner", runs: 67, balls: 98, fours: 9, sixes: 1, strikeRate: 68.4, status: "lbw b Ashwin" },
  { name: "Travis Head", runs: 45, balls: 62, fours: 6, sixes: 1, strikeRate: 72.6, status: "c Pant b Siraj" },
  { name: "Cameron Green", runs: 34, balls: 58, fours: 4, sixes: 0, strikeRate: 58.6, status: "b Jadeja" }
];

const mockBowlingData: BowlingFigures[] = [
  { name: "Jasprit Bumrah", overs: 23.2, maidens: 6, runs: 67, wickets: 4, economy: 2.87, dots: 98 },
  { name: "R Ashwin", overs: 31, maidens: 8, runs: 89, wickets: 3, economy: 2.87, dots: 124 },
  { name: "Mohammed Siraj", overs: 18, maidens: 3, runs: 72, wickets: 2, economy: 4.00, dots: 67 },
  { name: "Ravindra Jadeja", overs: 26, maidens: 7, runs: 58, wickets: 1, economy: 2.23, dots: 108 },
  { name: "Mohammed Shami", overs: 15, maidens: 2, runs: 54, wickets: 0, economy: 3.60, dots: 52 }
];

const COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-2))', 'hsl(var(--chart-3))', 'hsl(var(--chart-4))', 'hsl(var(--chart-5))'];

export function MatchReports() {
  const [selectedMatch, setSelectedMatch] = useState<string>(mockMatches[0].id);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterFormat, setFilterFormat] = useState<string>("all");
  const [matches, setMatches] = useState<Match[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate API call
    const loadData = async () => {
      setIsLoading(true);
      await new Promise(resolve => setTimeout(resolve, 800));
      setMatches(mockMatches);
      setIsLoading(false);
    };
    
    loadData();
  }, []);

  const filteredMatches = matches.filter(match => {
    const statusMatch = filterStatus === "all" || match.status === filterStatus;
    const formatMatch = filterFormat === "all" || match.format === filterFormat;
    return statusMatch && formatMatch;
  });

  const selectedMatchData = matches.find(m => m.id === selectedMatch);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'live': return 'bg-red-500 animate-pulse';
      case 'upcoming': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'live': return 'destructive';
      case 'upcoming': return 'secondary';
      default: return 'outline';
    }
  };

  const runsScoredData = mockBattingData.map(player => ({
    name: player.name.split(' ').pop(),
    runs: player.runs,
    balls: player.balls,
    strikeRate: player.strikeRate
  }));

  const wicketsTakenData = mockBowlingData.map(bowler => ({
    name: bowler.name.split(' ').pop(),
    wickets: bowler.wickets,
    economy: bowler.economy,
    runs: bowler.runs
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
          <h1 className="text-3xl font-bold tracking-tight">Match Reports</h1>
          <p className="text-muted-foreground">
            Detailed match analysis and performance insights
          </p>
        </div>
        
        <div className="flex gap-2">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="live">Live</SelectItem>
              <SelectItem value="upcoming">Upcoming</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={filterFormat} onValueChange={setFilterFormat}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Format" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Formats</SelectItem>
              <SelectItem value="Test">Test</SelectItem>
              <SelectItem value="ODI">ODI</SelectItem>
              <SelectItem value="T20">T20</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Matches</CardTitle>
            {/* <Trophy className="h-4 w-4 text-muted-foreground" /> */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{matches.length}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last week
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Live Matches</CardTitle>
            {/* <Activity className="h-4 w-4 text-muted-foreground" /> */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{matches.filter(m => m.status === 'live').length}</div>
            <p className="text-xs text-muted-foreground">
              Currently in progress
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            {/* <BarChart3 className="h-4 w-4 text-muted-foreground" /> */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{matches.filter(m => m.status === 'completed').length}</div>
            <p className="text-xs text-muted-foreground">
              Results available
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming</CardTitle>
            {/* <Calendar className="h-4 w-4 text-muted-foreground" /> */}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{matches.filter(m => m.status === 'upcoming').length}</div>
            <p className="text-xs text-muted-foreground">
              Scheduled fixtures
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Match Details */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Match List */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Recent Matches</CardTitle>
            <CardDescription>Select a match for detailed analysis</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {filteredMatches.map((match) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  selectedMatch === match.id ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                }`}
                onClick={() => setSelectedMatch(match.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getStatusColor(match.status)}`} />
                    <Badge variant={getStatusBadge(match.status)} className="text-xs">
                      {match.status.toUpperCase()}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {match.format}
                    </Badge>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="font-medium text-sm">{match.team1} vs {match.team2}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <MapPin className="w-3 h-3" />
                    <span>{match.venue}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{format(new Date(match.date), 'MMM dd, yyyy')}</span>
                  </div>
                  {match.result !== "Scheduled" && match.result !== "In progress" && (
                    <p className="text-xs font-medium text-primary">{match.result}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </CardContent>
        </Card>

        {/* Match Details */}
        <div className="lg:col-span-2 space-y-6">
          {selectedMatchData && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-xl">
                      {selectedMatchData.team1} vs {selectedMatchData.team2}
                    </CardTitle>
                    <CardDescription className="flex items-center gap-4 mt-2">
                      <span className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {selectedMatchData.venue}
                      </span>
                      <span className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        {format(new Date(selectedMatchData.date), 'PPP')}
                      </span>
                      <span className="flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {format(new Date(selectedMatchData.date), 'p')}
                      </span>
                    </CardDescription>
                  </div>
                  <Badge variant={getStatusBadge(selectedMatchData.status)} className="text-sm">
                    {selectedMatchData.status.toUpperCase()}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-muted-foreground">Match Format</p>
                      <p className="font-medium">{selectedMatchData.format}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Weather</p>
                      <p className="font-medium">{selectedMatchData.weather}</p>
                    </div>
                    {selectedMatchData.attendance > 0 && (
                      <div>
                        <p className="text-sm text-muted-foreground">Attendance</p>
                        <p className="font-medium">{selectedMatchData.attendance.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    {selectedMatchData.team1Score && (
                      <div>
                        <p className="text-sm text-muted-foreground">{selectedMatchData.team1}</p>
                        <p className="font-medium">{selectedMatchData.team1Score}</p>
                      </div>
                    )}
                    {selectedMatchData.team2Score && (
                      <div>
                        <p className="text-sm text-muted-foreground">{selectedMatchData.team2}</p>
                        <p className="font-medium">{selectedMatchData.team2Score}</p>
                      </div>
                    )}
                    {selectedMatchData.result !== "Scheduled" && (
                      <div>
                        <p className="text-sm text-muted-foreground">Result</p>
                        <p className="font-medium text-primary">{selectedMatchData.result}</p>
                      </div>
                    )}
                    {selectedMatchData.motm && (
                      <div>
                        <p className="text-sm text-muted-foreground">Player of the Match</p>
                        <p className="font-medium">{selectedMatchData.motm}</p>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Performance Analysis */}
          {selectedMatchData?.status === 'completed' && (
            <Tabs defaultValue="batting" className="space-y-4">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="batting">Batting</TabsTrigger>
                <TabsTrigger value="bowling">Bowling</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
              </TabsList>
              
              <TabsContent value="batting" className="space-y-4">
                <div className="grid gap-4 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Top Scorers</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={runsScoredData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="runs" fill="hsl(var(--primary))" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Batting Performance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {mockBattingData.slice(0, 5).map((player, index) => (
                          <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                            <div>
                              <p className="font-medium">{player.name}</p>
                              <p className="text-sm text-muted-foreground">{player.status}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{player.runs} ({player.balls})</p>
                              <p className="text-sm text-muted-foreground">SR: {player.strikeRate.toFixed(1)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="bowling" className="space-y-4">
                <div className="grid gap-4 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Bowling Figures</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={wicketsTakenData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="wickets" fill="hsl(var(--chart-2))" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Economy Rates</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={wicketsTakenData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" />
                          <YAxis />
                          <Tooltip />
                          <Line type="monotone" dataKey="economy" stroke="hsl(var(--chart-3))" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
              
              <TabsContent value="analysis" className="space-y-4">
                <div className="grid gap-4 lg:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Runs Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                          <Pie
                            data={[
                              { name: 'Boundaries', value: 45, fill: COLORS[0] },
                              { name: 'Singles', value: 35, fill: COLORS[1] },
                              { name: 'Dots', value: 20, fill: COLORS[2] }
                            ]}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {[0, 1, 2].map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle>Match Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-muted-foreground">Total Runs Scored</p>
                          <p className="text-2xl font-bold">721</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Total Wickets</p>
                          <p className="text-2xl font-bold">16</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Boundaries Hit</p>
                          <p className="text-2xl font-bold">89</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">Sixes Hit</p>
                          <p className="text-2xl font-bold">12</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          )}
        </div>
      </div>
    </motion.div>
  );
}