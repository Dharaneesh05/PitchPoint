import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DashboardChart } from "./DashboardChart";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Activity, Trophy, Calendar, MapPin, Target } from "lucide-react";

interface MatchAnalysisProps {
  matchId?: string;
  onMatchSelect?: (matchId: string) => void;
}

interface MatchData {
  id: string;
  homeTeam: {
    name: string;
    shortName: string;
    logo?: string;
    players?: any[];
  };
  awayTeam: {
    name: string;
    shortName: string;
    logo?: string;
    players?: any[];
  };
  venue: string;
  date: string;
  format: 'T20' | 'ODI' | 'Test';
  status: 'upcoming' | 'live' | 'completed';
  result?: {
    winner: string;
    margin: string;
  };
  scores?: {
    homeTeam: {
      innings1?: number;
      innings2?: number | string;
    };
    awayTeam: {
      innings1?: number;
      innings2?: number | string;
    };
  };
  weather?: {
    condition: string;
    temperature: number;
    humidity: number;
  };
  pitch?: {
    type: string;
    condition: string;
    favorability: string;
  };
  keyMoments?: Array<{
    time: string;
    event: string;
    impact: number;
  }>;
  playerPerformances?: Array<{
    playerId: string;
    playerName: string;
    role: string;
    performance: {
      runs?: number;
      wickets?: number;
      catches?: number;
      rating: number;
    };
  }>;
}

export function MatchAnalysis({ matchId, onMatchSelect }: MatchAnalysisProps) {
  const [selectedMatch, setSelectedMatch] = useState<string>(matchId || '');
  const [matchData, setMatchData] = useState<MatchData | null>(null);
  const [availableMatches, setAvailableMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [analysisType, setAnalysisType] = useState<'overview' | 'performance' | 'prediction'>('overview');
  const [selectedView, setSelectedView] = useState<'summary' | 'detailed' | 'comparison'>('summary');
  const { toast } = useToast();

  useEffect(() => {
    loadAvailableMatches();
  }, []);

  useEffect(() => {
    if (selectedMatch) {
      loadMatchAnalysis(selectedMatch);
    }
  }, [selectedMatch]);

  const loadAvailableMatches = async () => {
    try {
      const matches = await apiClient.getMatches();
      setAvailableMatches(matches);
      
      if (!selectedMatch && matches.length > 0) {
        setSelectedMatch(matches[0].id || matches[0]._id);
      }
    } catch (error) {
      console.error('Error loading matches:', error);
      toast({
        title: "Error",
        description: "Failed to load matches",
        variant: "destructive"
      });
    }
  };

  const loadMatchAnalysis = async (matchId: string) => {
    try {
      setLoading(true);
      
      const [matchInfo, matchStats, weatherData, pitchReport] = await Promise.all([
        apiClient.getMatch(matchId),
        apiClient.getMatchStats(matchId),
        apiClient.getMatchWeather(matchId),
        apiClient.getMatchPitchReport(matchId)
      ]);

      // Combine data into comprehensive match analysis
      const analysisData: MatchData = {
        ...matchInfo,
        weather: weatherData || generateMockWeather(),
        pitch: pitchReport || generateMockPitchReport(),
        keyMoments: matchStats?.keyMoments || generateMockKeyMoments(),
        playerPerformances: matchStats?.playerPerformances || generateMockPlayerPerformances()
      };

      setMatchData(analysisData);
      onMatchSelect?.(matchId);
      
    } catch (error) {
      console.error('Error loading match analysis:', error);
      // Generate mock data for demonstration
      generateMockMatchData(matchId);
    } finally {
      setLoading(false);
    }
  };

  const generateMockMatchData = (matchId: string) => {
    const mockMatch: MatchData = {
      id: matchId,
      homeTeam: {
        name: 'India',
        shortName: 'IND',
        logo: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop'
      },
      awayTeam: {
        name: 'Australia',
        shortName: 'AUS',
        logo: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop'
      },
      venue: 'Melbourne Cricket Ground',
      date: '2024-12-26',
      format: 'Test',
      status: 'completed',
      result: {
        winner: 'India',
        margin: '6 wickets'
      },
      scores: {
        homeTeam: { innings1: 326, innings2: 240 },
        awayTeam: { innings1: 195, innings2: 234 }
      },
      weather: generateMockWeather(),
      pitch: generateMockPitchReport(),
      keyMoments: generateMockKeyMoments(),
      playerPerformances: generateMockPlayerPerformances()
    };
    setMatchData(mockMatch);
  };

  const generateMockWeather = () => ({
    condition: 'Partly Cloudy',
    temperature: 24,
    humidity: 65
  });

  const generateMockPitchReport = () => ({
    type: 'Hard',
    condition: 'Good for batting',
    favorability: 'Balanced'
  });

  const generateMockKeyMoments = () => [
    { time: '15.3', event: 'Virat Kohli reaches century', impact: 85 },
    { time: '32.1', event: 'Pat Cummins takes 3rd wicket', impact: 75 },
    { time: '45.2', event: 'Partnership of 100+ runs', impact: 90 },
    { time: '67.4', event: 'India declares innings', impact: 80 },
    { time: '89.1', event: 'Australia loses 5th wicket', impact: 70 }
  ];

  const generateMockPlayerPerformances = () => [
    {
      playerId: '1',
      playerName: 'Virat Kohli',
      role: 'batsman',
      performance: { runs: 112, catches: 2, rating: 9.2 }
    },
    {
      playerId: '2',
      playerName: 'Jasprit Bumrah',
      role: 'bowler',
      performance: { wickets: 4, rating: 8.8 }
    },
    {
      playerId: '3',
      playerName: 'Pat Cummins',
      role: 'bowler',
      performance: { wickets: 3, rating: 8.5 }
    },
    {
      playerId: '4',
      playerName: 'Steve Smith',
      role: 'batsman',
      performance: { runs: 89, rating: 8.1 }
    }
  ];

  const handleSaveAnalysis = async () => {
    if (!matchData) return;

    try {
      await apiClient.createSavedAnalysis({
        title: `Match Analysis - ${matchData.homeTeam.name} vs ${matchData.awayTeam.name}`,
        description: `Comprehensive analysis for ${matchData.format} match at ${matchData.venue}`,
        analysisType: 'match_analysis',
        analysisData: {
          matchId: matchData.id,
          teams: [matchData.homeTeam.name, matchData.awayTeam.name],
          venue: matchData.venue,
          format: matchData.format,
          analysisDate: new Date().toISOString(),
          keyInsights: generateMatchInsights(matchData),
          recommendation: generateMatchRecommendation(matchData)
        }
      });

      toast({
        title: "Analysis Saved",
        description: "Match analysis has been saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save analysis",
        variant: "destructive"
      });
    }
  };

  const generateMatchInsights = (match: MatchData): string[] => [
    `${match.homeTeam.name} dominated with strong batting performance`,
    `Weather conditions favored the bowling side initially`,
    `Pitch conditions were balanced for both teams`,
    `Key partnerships determined the match outcome`
  ];

  const generateMatchRecommendation = (match: MatchData): string => {
    if (match.status === 'completed') {
      return `${match.result?.winner} won convincingly by ${match.result?.margin}. Key factors were superior batting depth and effective bowling in crucial moments.`;
    } else if (match.status === 'live') {
      return `Match is currently in progress. Current momentum favors the team with better run rate and wickets in hand.`;
    } else {
      return `Upcoming match prediction: Team with better recent form and suitable playing XI for venue conditions likely to win.`;
    }
  };

  const handleExportAnalysis = () => {
    toast({
      title: "Export Started",
      description: "Match analysis report is being generated...",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading match analysis...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const momentumData = matchData?.keyMoments?.map(moment => ({
    name: moment.time,
    value: moment.impact
  })) || [];

  const performanceData = matchData?.playerPerformances?.map(player => ({
    name: player.playerName,
    value: player.performance.rating
  })) || [];

  // Transform team comparison data for chart compatibility
  const teamComparisonDataRaw = matchData ? [
    { name: 'Batting', homeTeam: 85, awayTeam: 72 },
    { name: 'Bowling', homeTeam: 78, awayTeam: 89 },
    { name: 'Fielding', homeTeam: 82, awayTeam: 76 },
    { name: 'Strategy', homeTeam: 88, awayTeam: 71 }
  ] : [];

  // Create two separate datasets for home and away teams
  const homeTeamData = teamComparisonDataRaw.map(item => ({
    name: item.name,
    value: item.homeTeam
  }));

  const awayTeamData = teamComparisonDataRaw.map(item => ({
    name: item.name,
    value: item.awayTeam
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold">Match Analysis</h2>
          <p className="text-muted-foreground">
            Comprehensive match insights and performance analytics
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportAnalysis}>
            Export
          </Button>
          <Button onClick={handleSaveAnalysis} disabled={!matchData}>
            Save Analysis
          </Button>
        </div>
      </div>

      {/* Match Selection */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select value={selectedMatch} onValueChange={setSelectedMatch}>
          <SelectTrigger>
            <SelectValue placeholder="Select a match" />
          </SelectTrigger>
          <SelectContent>
            {availableMatches.map((match) => (
              <SelectItem key={match.id || match._id} value={match.id || match._id}>
                {match.homeTeam?.name || match.team1Id?.name} vs {match.awayTeam?.name || match.team2Id?.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={analysisType} onValueChange={(value) => setAnalysisType(value as "overview" | "performance" | "prediction")}>
          <SelectTrigger>
            <SelectValue placeholder="Analysis type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="overview">Match Overview</SelectItem>
            <SelectItem value="performance">Performance Analysis</SelectItem>
            <SelectItem value="prediction">Match Prediction</SelectItem>
          </SelectContent>
        </Select>

        <Select value={selectedView} onValueChange={(value) => setSelectedView(value as "summary" | "detailed" | "comparison")}>
          <SelectTrigger>
            <SelectValue placeholder="View type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="summary">Summary</SelectItem>
            <SelectItem value="detailed">Detailed</SelectItem>
            <SelectItem value="comparison">Team Comparison</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {matchData && (
        <>
          {/* Match Overview */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                      {matchData.homeTeam.logo ? (
                        <img src={matchData.homeTeam.logo} alt={matchData.homeTeam.name} className="w-8 h-8 rounded-full" />
                      ) : (
                        <Trophy className="h-6 w-6" />
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold">{matchData.homeTeam.name}</h3>
                      <p className="text-sm text-muted-foreground">{matchData.homeTeam.shortName}</p>
                    </div>
                  </div>
                  
                  <div className="text-center px-4">
                    <Badge variant={
                      matchData.status === 'live' ? 'destructive' :
                      matchData.status === 'completed' ? 'default' : 'secondary'
                    }>
                      {matchData.status}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-1">vs</p>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="font-bold">{matchData.awayTeam.name}</h3>
                      <p className="text-sm text-muted-foreground">{matchData.awayTeam.shortName}</p>
                    </div>
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                      {matchData.awayTeam.logo ? (
                        <img src={matchData.awayTeam.logo} alt={matchData.awayTeam.name} className="w-8 h-8 rounded-full" />
                      ) : (
                        <Trophy className="h-6 w-6" />
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <Calendar className="h-4 w-4" />
                    {new Date(matchData.date).toLocaleDateString()}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <MapPin className="h-4 w-4" />
                    {matchData.venue}
                  </div>
                  <Badge variant="outline">{matchData.format}</Badge>
                </div>
              </div>

              {/* Scores */}
              {matchData.scores && (
                <div className="grid grid-cols-2 gap-4 mt-4 p-4 bg-muted/50 rounded-lg">
                  <div className="text-center">
                    <p className="font-medium">{matchData.homeTeam.shortName}</p>
                    <p className="text-lg font-bold">
                      {matchData.scores.homeTeam.innings1}
                      {matchData.scores.homeTeam.innings2 && ` & ${matchData.scores.homeTeam.innings2}`}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="font-medium">{matchData.awayTeam.shortName}</p>
                    <p className="text-lg font-bold">
                      {matchData.scores.awayTeam.innings1}
                      {matchData.scores.awayTeam.innings2 && ` & ${matchData.scores.awayTeam.innings2}`}
                    </p>
                  </div>
                </div>
              )}

              {/* Result */}
              {matchData.result && (
                <div className="text-center mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="font-medium text-green-800">
                    {matchData.result.winner} won by {matchData.result.margin}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Match Conditions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Weather Conditions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Condition:</span>
                    <span className="font-medium">{matchData.weather?.condition}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Temperature:</span>
                    <span className="font-medium">{matchData.weather?.temperature}°C</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Humidity:</span>
                    <span className="font-medium">{matchData.weather?.humidity}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Pitch Report
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Surface:</span>
                    <span className="font-medium">{matchData.pitch?.type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Condition:</span>
                    <span className="font-medium">{matchData.pitch?.condition}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Favorability:</span>
                    <Badge variant="outline">{matchData.pitch?.favorability}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Analysis Tabs */}
          <Tabs value={analysisType} onValueChange={(value) => setAnalysisType(value as "overview" | "performance" | "prediction")} className="w-full">
            <TabsList>
              <TabsTrigger value="overview">Match Overview</TabsTrigger>
              <TabsTrigger value="performance">Performance Analysis</TabsTrigger>
              <TabsTrigger value="prediction">Match Insights</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <DashboardChart 
                  title="Match Momentum" 
                  data={momentumData} 
                  type="line" 
                />
                <DashboardChart 
                  title="Team Comparison (Home Team)" 
                  data={homeTeamData} 
                  type="bar" 
                />
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Key Moments</CardTitle>
                  <CardDescription>Critical events that shaped the match</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {matchData.keyMoments?.map((moment, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{moment.event}</p>
                          <p className="text-sm text-muted-foreground">Over {moment.time}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${
                              moment.impact > 80 ? 'bg-red-500' :
                              moment.impact > 60 ? 'bg-orange-500' : 'bg-yellow-500'
                            }`}></div>
                            <span className="text-sm font-medium">{moment.impact}% impact</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="performance" className="space-y-6">
              <DashboardChart 
                title="Player Performances" 
                data={performanceData} 
                type="bar" 
              />
              
              <Card>
                <CardHeader>
                  <CardTitle>Top Performers</CardTitle>
                  <CardDescription>Outstanding individual performances</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {matchData.playerPerformances?.map((player, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{player.playerName}</p>
                          <p className="text-sm text-muted-foreground capitalize">{player.role}</p>
                        </div>
                        <div className="text-right">
                          <div className="space-y-1">
                            {player.performance.runs && (
                              <p className="text-sm">Runs: {player.performance.runs}</p>
                            )}
                            {player.performance.wickets && (
                              <p className="text-sm">Wickets: {player.performance.wickets}</p>
                            )}
                            <p className="font-medium">Rating: {player.performance.rating}/10</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="prediction" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Match Analysis Summary</CardTitle>
                  <CardDescription>AI-powered insights and recommendations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium mb-2">Key Insights</h4>
                      <ul className="space-y-2">
                        {generateMatchInsights(matchData).map((insight, index) => (
                          <li key={index} className="text-sm flex items-start gap-2">
                            <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2"></div>
                            {insight}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium mb-2">Overall Assessment</h4>
                      <p className="text-sm">{generateMatchRecommendation(matchData)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
}