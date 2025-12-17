import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DashboardChart } from "./DashboardChart";
import { apiClient } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { 
  Activity, 
  User,
  AlertTriangle, 
  Heart, 
  Share2, 
  Target, 
  TrendingUp, 
  TrendingDown, 
  Star,
  Search,
  BookmarkPlus
} from "lucide-react";

interface PlayerAnalysisProps {
  playerId?: string;
  onPlayerSelect?: (playerId: string) => void;
  userRole?: string;
}

interface PlayerData {
  _id: string;
  name: string;
  teamId: {
    name: string;
    shortName: string;
    logo: string;
  };
  role: 'batsman' | 'bowler' | 'all-rounder' | 'wicket-keeper';
  battingStyle?: string;
  bowlingStyle?: string;
  nationality: string;
  age: number;
  image?: string;
  form: 'excellent' | 'good' | 'average' | 'poor';
  isInjured: boolean;
  isCaptain?: boolean;
  stats: {
    test: { matches: number; runs?: number; wickets?: number; average: number; strikeRate?: number; economy?: number; hundreds?: number; fifties?: number; catches: number; };
    odi: { matches: number; runs?: number; wickets?: number; average: number; strikeRate?: number; economy?: number; hundreds?: number; fifties?: number; catches: number; };
    t20: { matches: number; runs?: number; wickets?: number; average: number; strikeRate?: number; economy?: number; hundreds?: number; fifties?: number; catches: number; };
  };
  recentForm?: Array<{
    match: string;
    performance: number;
    date: string;
  }>;
  strengths?: string[];
  weaknesses?: string[];
}

export function PlayerAnalysis({ playerId, onPlayerSelect, userRole = 'analyst' }: PlayerAnalysisProps) {
  const [selectedPlayer, setSelectedPlayer] = useState<string>(playerId || '');
  const [playerData, setPlayerData] = useState<PlayerData | null>(null);
  const [availablePlayers, setAvailablePlayers] = useState<PlayerData[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<PlayerData[]>([]);
  const [selectedFormat, setSelectedFormat] = useState<'test' | 'odi' | 't20'>('test');
  const [analysisType, setAnalysisType] = useState<'performance' | 'form' | 'comparison'>('performance');
  const [isFavorite, setIsFavorite] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadAvailablePlayers();
    // Load all players initially for search
    performPlayerSearch();
  }, []);

  useEffect(() => {
    if (selectedPlayer) {
      loadPlayerAnalysis(selectedPlayer);
      checkIfFavorite(selectedPlayer);
    }
  }, [selectedPlayer, selectedFormat]);

  useEffect(() => {
    // Always perform search to show results (all players if no query, search results if query exists)
    performPlayerSearch();
  }, [searchQuery]);

  const loadAvailablePlayers = async () => {
    try {
      // Import and use mock data directly
      const { getAllPlayers } = await import('@/lib/mockPlayers');
      const players = getAllPlayers();
      setAvailablePlayers(players);
      
      if (!selectedPlayer && players.length > 0) {
        setSelectedPlayer(players[0]._id);
      }
    } catch (error) {
      console.error('Error loading players:', error);
      toast({
        title: "Error",
        description: "Failed to load players",
        variant: "destructive"
      });
    }
  };

  const performPlayerSearch = async () => {
    try {
      // Import and use mock data directly
      const { searchPlayers, getAllPlayers } = await import('@/lib/mockPlayers');
      
      if (searchQuery.trim()) {
        // Search for specific query
        const searchResults = searchPlayers(searchQuery, {});
        
        // If no results found, show all players instead of empty results
        if (searchResults.length === 0) {
          const allPlayers = getAllPlayers();
          setSearchResults(allPlayers);
          console.log(`No exact matches for "${searchQuery}", showing all ${allPlayers.length} available players`);
        } else {
          setSearchResults(searchResults);
          console.log(`Found ${searchResults.length} players matching "${searchQuery}"`);
        }
      } else {
        // Show all players when search is empty
        const allPlayers = getAllPlayers();
        setSearchResults(allPlayers);
      }
    } catch (error) {
      console.error('Error searching players:', error);
      // Fallback to show all players on error
      try {
        const { getAllPlayers } = await import('@/lib/mockPlayers');
        setSearchResults(getAllPlayers());
      } catch (fallbackError) {
        console.error('Fallback error:', fallbackError);
      }
    }
  };

  const loadPlayerAnalysis = async (playerId: string) => {
    try {
      setLoading(true);
      
      // Import and use mock data directly
      const { getPlayerById } = await import('@/lib/mockPlayers');
      const player = getPlayerById(playerId);
      
      if (player) {
        setPlayerData(player);
        onPlayerSelect?.(playerId);
      }
      
    } catch (error) {
      console.error('Error loading player analysis:', error);
      toast({
        title: "Error",
        description: "Failed to load player analysis",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkIfFavorite = async (playerId: string) => {
    try {
      const favorites = await apiClient.getFavoritePlayers();
      setIsFavorite(favorites.some((fav: any) => fav.playerId === playerId));
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const handleToggleFavorite = async () => {
    if (!playerData) return;

    try {
      if (isFavorite) {
        await apiClient.removeFavoritePlayer(playerData._id);
        setIsFavorite(false);
        toast({
          title: "Removed from Favorites",
          description: `${playerData.name} has been removed from your favorites`,
        });
      } else {
        await apiClient.addFavoritePlayer({
          playerId: playerData._id,
          playerName: playerData.name,
          playerRole: playerData.role,
          nationality: playerData.nationality,
          teamName: playerData.teamId.name,
          notes: `Added on ${new Date().toLocaleDateString()}`,
          tags: [playerData.role, playerData.nationality]
        });
        setIsFavorite(true);
        toast({
          title: "Added to Favorites",
          description: `${playerData.name} has been added to your favorites`,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update favorites",
        variant: "destructive"
      });
    }
  };

  const handleSaveAnalysis = async () => {
    if (!playerData) return;

    try {
      const formatStats = playerData.stats[selectedFormat];
      
      await apiClient.createSavedAnalysis({
        title: `Player Analysis - ${playerData.name} (${selectedFormat.toUpperCase()})`,
        description: `Comprehensive ${selectedFormat.toUpperCase()} analysis for ${playerData.name} (${playerData.role})`,
        analysisType: 'player_performance',
        analysisData: {
          playerId: playerData._id,
          playerName: playerData.name,
          format: selectedFormat,
          analysisDate: new Date().toISOString(),
          stats: formatStats,
          form: playerData.form,
          team: playerData.teamId.name,
          role: playerData.role,
          nationality: playerData.nationality,
          age: playerData.age,
          recommendation: generatePlayerRecommendation(playerData, formatStats),
          performanceScore: calculatePerformanceScore(playerData, formatStats)
        },
        tags: [selectedFormat, playerData.role, playerData.nationality, playerData.teamId.shortName],
        isPublic: false
      });

      toast({
        title: "Analysis Saved",
        description: "Player analysis has been saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save analysis",
        variant: "destructive"
      });
    }
  };

  const generatePlayerRecommendation = (player: PlayerData, stats: any): string => {
    const performanceScore = calculatePerformanceScore(player, stats);
    
    if (performanceScore > 80) {
      return `${player.name} is in excellent form and should be a key player in the playing XI. Strong ${selectedFormat.toUpperCase()} performer with consistent statistics.`;
    } else if (performanceScore > 60) {
      return `${player.name} shows good potential and could be valuable in specific match conditions. Consider for team selection based on opposition and conditions.`;
    } else {
      return `${player.name} needs improvement in key areas before consideration for team selection. Focus on addressing weaknesses identified in the analysis.`;
    }
  };

  const calculatePerformanceScore = (player: PlayerData, stats: any): number => {
    let score = 50;
    
    // Form bonus
    if (player.form === 'excellent') score += 25;
    else if (player.form === 'good') score += 15;
    else if (player.form === 'average') score += 5;
    
    // Injury penalty
    if (player.isInjured) score -= 20;
    
    // Captain bonus
    if (player.isCaptain) score += 10;
    
    // Role-specific scoring
    if (stats) {
      if (player.role === 'batsman' || player.role === 'all-rounder') {
        if (stats.average > 40) score += 15;
        else if (stats.average > 30) score += 10;
        else if (stats.average > 20) score += 5;
        
        if (stats.strikeRate && stats.strikeRate > 80) score += 10;
      }
      
      if (player.role === 'bowler' || player.role === 'all-rounder') {
        if (stats.average && stats.average < 25) score += 15;
        else if (stats.average && stats.average < 30) score += 10;
        else if (stats.average && stats.average < 35) score += 5;
        
        if (stats.economy && stats.economy < 4) score += 10;
      }
      
      if (player.role === 'wicket-keeper') {
        if (stats.catches && stats.catches > stats.matches * 0.8) score += 10;
      }
    }
    
    return Math.min(100, Math.max(0, score));
  };

  const handleExportAnalysis = () => {
    toast({
      title: "Export Started",
      description: "Player analysis report is being generated...",
    });
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <Activity className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading player analysis...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const currentStats = playerData?.stats[selectedFormat];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-heading font-bold">Player Analysis</h2>
          <p className="text-muted-foreground">
            Detailed performance insights and recommendations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportAnalysis}>
            Export
          </Button>
          <Button onClick={handleSaveAnalysis} disabled={!playerData}>
            <BookmarkPlus className="h-4 w-4 mr-2" />
            Save Analysis
          </Button>
        </div>
      </div>

      {/* Player Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {/* <Search className="h-5 w-5" /> */}
            Player Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="relative">
              <Input
                placeholder="Search for players..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
              <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
            </div>
            
            {searchResults.length > 0 && (
              <div className="border rounded-lg p-4 max-h-60 overflow-y-auto">
                <div className="mb-2 text-sm text-muted-foreground">
                  {searchQuery.trim() 
                    ? `${searchResults.length} player(s) found${searchResults.length === 8 && !searchQuery.trim() ? '' : searchQuery.trim() ? ` for "${searchQuery}"` : ''}`
                    : `Showing all ${searchResults.length} available players`
                  }
                </div>
                <div className="grid gap-2">
                  {searchResults.map((player) => (
                    <div
                      key={player._id}
                      className="flex items-center justify-between p-3 hover:bg-muted rounded cursor-pointer border border-transparent hover:border-blue-200"
                    >
                      <div 
                        className="flex items-center gap-3 flex-1"
                        onClick={() => {
                          setSelectedPlayer(player._id);
                          setSearchQuery('');
                          setSearchResults([]);
                        }}
                      >
                        <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                            <User className="h-4 w-4" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{player.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {player.teamId.name} • {player.role}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{player.form}</Badge>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={(e) => {
                            e.stopPropagation();
                            window.location.href = `#/${userRole || 'analyst'}/view-profile/${player._id}`;
                          }}
                        >
                          View Profile
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Player Selection and Format */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
          <SelectTrigger>
            <SelectValue placeholder="Select a player" />
          </SelectTrigger>
          <SelectContent>
            {availablePlayers.map((player) => (
              <SelectItem key={player._id} value={player._id}>
                {player.name} ({player.teamId.shortName})
              </SelectItem>
            ))}
          </SelectContent>
        </Select> 

        <Select value={selectedFormat} onValueChange={(value) => setSelectedFormat(value as 'test' | 'odi' | 't20')}>
          <SelectTrigger>
            <SelectValue placeholder="Select format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="test">Test Cricket</SelectItem>
            <SelectItem value="odi">ODI</SelectItem>
            <SelectItem value="t20">T20</SelectItem>
          </SelectContent>
        </Select>

        <Select value={analysisType} onValueChange={(value) => setAnalysisType(value as "form" | "performance" | "comparison")}>
          <SelectTrigger>
            <SelectValue placeholder="Analysis type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="performance">Performance</SelectItem>
            <SelectItem value="form">Statistics</SelectItem>
            <SelectItem value="comparison">Assessment</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {playerData && (
        <>
          {/* Player Overview */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
                      <User className="h-8 w-8" />
                  </div>
                  <div>
                    <h3 className="text-xl font-heading font-bold">{playerData.name}</h3>
                    <p className="text-muted-foreground">{playerData.teamId.name}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">{playerData.role}</Badge>
                      <Badge variant="outline">{playerData.nationality}</Badge>
                      <Badge 
                        variant={playerData.form === 'excellent' ? 'default' : 
                               playerData.form === 'good' ? 'secondary' : 'destructive'}
                      >
                        {playerData.form}
                      </Badge>
                      {playerData.isCaptain && (
                        <Badge variant="default">Captain</Badge>
                      )}
                      {playerData.isInjured && (
                        <Badge variant="destructive">
                          <AlertTriangle className="h-3 w-3 mr-1" />
                          Injured
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant={isFavorite ? "default" : "outline"} 
                    size="sm"
                    onClick={handleToggleFavorite}
                  >
                    <Heart className={`h-4 w-4 mr-2 ${isFavorite ? 'fill-current' : ''}`} />
                    {isFavorite ? 'Favorited' : 'Favorite'}
                  </Button>
                  <Button variant="outline" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Key Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Matches</CardTitle>
                {/* <Activity className="h-4 w-4 text-muted-foreground" /> */}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{currentStats?.matches || 0}</div>
                <p className="text-xs text-muted-foreground">{selectedFormat.toUpperCase()} format</p>
              </CardContent>
            </Card>

            {(playerData.role === 'batsman' || playerData.role === 'all-rounder' || playerData.role === 'wicket-keeper') && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Runs</CardTitle>
                  {/* <Target className="h-4 w-4 text-muted-foreground" /> */}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentStats?.runs || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Avg: {currentStats?.average.toFixed(2) || 0}
                  </p>
                </CardContent>
              </Card>
            )}

            {(playerData.role === 'bowler' || playerData.role === 'all-rounder') && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Wickets</CardTitle>
                  {/* <TrendingUp className="h-4 w-4 text-muted-foreground" /> */}
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{currentStats?.wickets || 0}</div>
                  <p className="text-xs text-muted-foreground">
                    Avg: {currentStats?.average?.toFixed(2) || 0}
                  </p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Performance</CardTitle>
                {/* <Star className="h-4 w-4 text-muted-foreground" /> */}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{calculatePerformanceScore(playerData, currentStats)}%</div>
                <p className="text-xs text-muted-foreground">Overall rating</p>
              </CardContent>
            </Card>
          </div>

          {/* Analysis Tabs */}
          <Tabs value={analysisType} onValueChange={(value) => setAnalysisType(value as "form" | "performance" | "comparison")} className="w-full">
            <TabsList>
              <TabsTrigger value="performance">Performance Metrics</TabsTrigger>
              <TabsTrigger value="form">Statistics Breakdown</TabsTrigger>
              <TabsTrigger value="comparison">Player Assessment</TabsTrigger>
            </TabsList>
            
            <TabsContent value="performance" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Performance Overview</CardTitle>
                    <CardDescription>{selectedFormat.toUpperCase()} format statistics</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {currentStats && (
                        <>
                          <div className="flex justify-between">
                            <span>Matches Played</span>
                            <span className="font-bold">{currentStats.matches}</span>
                          </div>
                          {currentStats.runs !== undefined && (
                            <>
                              <div className="flex justify-between">
                                <span>Total Runs</span>
                                <span className="font-bold">{currentStats.runs}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Batting Average</span>
                                <span className="font-bold">{currentStats.average.toFixed(2)}</span>
                              </div>
                              {currentStats.strikeRate && (
                                <div className="flex justify-between">
                                  <span>Strike Rate</span>
                                  <span className="font-bold">{currentStats.strikeRate.toFixed(2)}</span>
                                </div>
                              )}
                              {currentStats.hundreds && (
                                <div className="flex justify-between">
                                  <span>Centuries</span>
                                  <span className="font-bold">{currentStats.hundreds}</span>
                                </div>
                              )}
                              {currentStats.fifties && (
                                <div className="flex justify-between">
                                  <span>Half Centuries</span>
                                  <span className="font-bold">{currentStats.fifties}</span>
                                </div>
                              )}
                            </>
                          )}
                          {currentStats.wickets !== undefined && (
                            <>
                              <div className="flex justify-between">
                                <span>Total Wickets</span>
                                <span className="font-bold">{currentStats.wickets}</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Bowling Average</span>
                                <span className="font-bold">{currentStats.average.toFixed(2)}</span>
                              </div>
                              {currentStats.economy && (
                                <div className="flex justify-between">
                                  <span>Economy Rate</span>
                                  <span className="font-bold">{currentStats.economy.toFixed(2)}</span>
                                </div>
                              )}
                            </>
                          )}
                          <div className="flex justify-between">
                            <span>Catches</span>
                            <span className="font-bold">{currentStats.catches}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Format Comparison</CardTitle>
                    <CardDescription>Performance across formats</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Object.entries(playerData.stats).map(([format, stats]) => (
                        <div key={format} className="border rounded-lg p-3">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-medium">{format.toUpperCase()}</span>
                            <Badge variant={format === selectedFormat ? "default" : "outline"}>
                              {stats.matches} matches
                            </Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            {stats.runs !== undefined && (
                              <div>Runs: {stats.runs}</div>
                            )}
                            {stats.wickets !== undefined && (
                              <div>Wickets: {stats.wickets}</div>
                            )}
                            <div>Average: {stats.average.toFixed(2)}</div>
                            <div>Catches: {stats.catches}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="form" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Current Form Analysis</CardTitle>
                    <CardDescription>Recent performance indicators</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Form Status</p>
                          <p className="text-sm text-muted-foreground">Current playing form</p>
                        </div>
                        <Badge 
                          variant={playerData.form === 'excellent' ? 'default' : 
                                 playerData.form === 'good' ? 'secondary' : 'destructive'}
                        >
                          {playerData.form}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Fitness Status</p>
                          <p className="text-sm text-muted-foreground">Physical condition</p>
                        </div>
                        <div className="text-right">
                          {playerData.isInjured ? (
                            <Badge variant="destructive">
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Injured
                            </Badge>
                          ) : (
                            <Badge variant="default">Fit</Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Experience Level</p>
                          <p className="text-sm text-muted-foreground">Age and career stage</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">{playerData.age} years</p>
                          <p className="text-sm text-muted-foreground">
                            {playerData.age < 25 ? 'Young' : 
                             playerData.age < 32 ? 'Prime' : 'Experienced'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader>
                    <CardTitle>Playing Style</CardTitle>
                    <CardDescription>Technical information</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {playerData.battingStyle && (
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">Batting Style</p>
                            <p className="text-sm text-muted-foreground">Technique preference</p>
                          </div>
                          <span className="font-medium">{playerData.battingStyle}</span>
                        </div>
                      )}
                      
                      {playerData.bowlingStyle && (
                        <div className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">Bowling Style</p>
                            <p className="text-sm text-muted-foreground">Bowling technique</p>
                          </div>
                          <span className="font-medium">{playerData.bowlingStyle}</span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">Team Role</p>
                          <p className="text-sm text-muted-foreground">Primary responsibility</p>
                        </div>
                        <div className="text-right">
                          <Badge variant="outline">{playerData.role}</Badge>
                          {playerData.isCaptain && (
                            <Badge variant="default" className="ml-2">Captain</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="comparison" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Player Assessment</CardTitle>
                  <CardDescription>AI-powered analysis and recommendations</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <h4 className="font-medium mb-2">Performance Score</h4>
                      <div className="flex items-center gap-4">
                        <div className="text-3xl font-bold text-blue-600">
                          {calculatePerformanceScore(playerData, currentStats)}%
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            Based on form, statistics, and current status
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <h4 className="font-medium mb-2">Recommendation</h4>
                      <p className="text-sm">{generatePlayerRecommendation(playerData, currentStats)}</p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h5 className="font-medium mb-3 flex items-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          Strengths
                        </h5>
                        <ul className="space-y-2 text-sm">
                          <li>• Consistent performer in {selectedFormat.toUpperCase()} format</li>
                          <li>• Strong technical foundation</li>
                          {playerData.isCaptain && <li>• Proven leadership qualities</li>}
                          {!playerData.isInjured && <li>• Currently injury-free</li>}
                          {playerData.form === 'excellent' && <li>• In excellent current form</li>}
                        </ul>
                      </div>
                      
                      <div className="p-4 border rounded-lg">
                        <h5 className="font-medium mb-3 flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-orange-500" />
                          Areas to Monitor
                        </h5>
                        <ul className="space-y-2 text-sm">
                          {playerData.isInjured && <li>• Currently dealing with injury</li>}
                          {playerData.form === 'poor' && <li>• Recent form concerns</li>}
                          {playerData.age > 35 && <li>• Age-related considerations</li>}
                          <li>• Match situation adaptability</li>
                          <li>• Pressure performance consistency</li>
                        </ul>
                      </div>
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