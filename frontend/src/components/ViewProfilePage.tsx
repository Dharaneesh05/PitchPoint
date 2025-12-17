import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { DashboardChart } from "./DashboardChart";

interface ViewProfilePageProps {
  playerId?: string;
}

interface PlayerProfile {
  _id: string;
  name: string;
  teamId: {
    name: string;
    shortName: string;
    logo: string;
  };
  role: 'batsman' | 'bowler' | 'all-rounder' | 'wicket-keeper';
  battingStyle: string;
  bowlingStyle: string;
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

export function ViewProfilePage({ playerId = "virat_kohli_001" }: ViewProfilePageProps) {
  const [player, setPlayer] = useState<PlayerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFormat, setActiveFormat] = useState<'test' | 'odi' | 't20'>('test');
  const { toast } = useToast();

  useEffect(() => {
    loadPlayerProfile();
  }, [playerId]);

  const loadPlayerProfile = async () => {
    try {
      setLoading(true);
      const { getPlayerById } = await import('@/lib/mockPlayers');
      const playerData = getPlayerById(playerId);
      
      if (playerData) {
        setPlayer(playerData);
      } else {
        toast({
          title: "Player Not Found",
          description: "The requested player could not be found.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error loading player profile:', error);
      toast({
        title: "Error",
        description: "Failed to load player profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getFormColor = (form: string) => {
    switch (form) {
      case 'excellent': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'average': return 'bg-yellow-500';
      case 'poor': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getFormProgress = (form: string) => {
    switch (form) {
      case 'excellent': return 95;
      case 'good': return 75;
      case 'average': return 50;
      case 'poor': return 25;
      default: return 0;
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'batsman': return '🏏';
      case 'bowler': return '⚾';
      case 'all-rounder': return '🎯';
      case 'wicket-keeper': return '🥅';
      default: return '👤';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Player Not Found</h2>
        <p className="text-muted-foreground">The requested player profile could not be loaded.</p>
        <Button className="mt-4" onClick={() => window.history.back()}>
          Go Back
        </Button>
      </div>
    );
  }

  const currentStats = player.stats[activeFormat];

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="relative">
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="relative">
                <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center text-4xl">
                  {getRoleIcon(player.role)}
                </div>
              {player.isCaptain && (
                <div className="absolute -top-2 -right-2 bg-yellow-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold">
                  C
                </div>
              )}
            </div>
            
            <div className="flex-1">
              <h1 className="text-3xl font-bold mb-2">{player.name}</h1>
              <div className="flex flex-wrap gap-4 text-white/90">
                <span>{player.role.charAt(0).toUpperCase() + player.role.slice(1)}</span>
                <span>•</span>
                <span>{player.teamId.name}</span>
                <span>•</span>
                <span>{player.nationality}</span>
                <span>•</span>
                <span>Age: {player.age}</span>
              </div>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge className={`${getFormColor(player.form)} text-white`}>
                  Form: {player.form}
                </Badge>
                {player.isInjured && (
                  <Badge variant="destructive">Injured</Badge>
                )}
                {player.isCaptain && (
                  <Badge className="bg-yellow-500 text-white">Captain</Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Tabs */}
      <Tabs value={activeFormat} onValueChange={(value) => setActiveFormat(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="test">Test Cricket</TabsTrigger>
          <TabsTrigger value="odi">ODI</TabsTrigger>
          <TabsTrigger value="t20">T20</TabsTrigger>
        </TabsList>

        <TabsContent value={activeFormat} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Matches */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Matches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{currentStats.matches}</div>
                <p className="text-sm text-muted-foreground">Total {activeFormat.toUpperCase()} matches</p>
              </CardContent>
            </Card>

            {/* Runs (if batsman) */}
            {currentStats.runs !== undefined && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Runs</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{currentStats.runs?.toLocaleString()}</div>
                  <p className="text-sm text-muted-foreground">Career runs</p>
                </CardContent>
              </Card>
            )}

            {/* Wickets (if bowler) */}
            {currentStats.wickets !== undefined && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Wickets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">{currentStats.wickets}</div>
                  <p className="text-sm text-muted-foreground">Career wickets</p>
                </CardContent>
              </Card>
            )}

            {/* Average */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Average</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">{currentStats.average.toFixed(2)}</div>
                <p className="text-sm text-muted-foreground">
                  {currentStats.runs ? 'Batting' : 'Bowling'} average
                </p>
              </CardContent>
            </Card>

            {/* Strike Rate or Economy */}
            {currentStats.strikeRate && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Strike Rate</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">{currentStats.strikeRate.toFixed(2)}</div>
                  <p className="text-sm text-muted-foreground">Runs per 100 balls</p>
                </CardContent>
              </Card>
            )}

            {currentStats.economy && (
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">Economy</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">{currentStats.economy.toFixed(2)}</div>
                  <p className="text-sm text-muted-foreground">Runs per over</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Detailed Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Breakdown */}
            <Card>
              <CardHeader>
                <CardTitle>Performance Breakdown</CardTitle>
                <CardDescription>{activeFormat.toUpperCase()} career statistics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentStats.hundreds !== undefined && (
                  <div className="flex justify-between items-center">
                    <span>Centuries</span>
                    <Badge variant="secondary">{currentStats.hundreds}</Badge>
                  </div>
                )}
                {currentStats.fifties !== undefined && (
                  <div className="flex justify-between items-center">
                    <span>Half Centuries</span>
                    <Badge variant="secondary">{currentStats.fifties}</Badge>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span>Catches</span>
                  <Badge variant="secondary">{currentStats.catches}</Badge>
                </div>
                
                {/* Form Progress */}
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Current Form</span>
                    <span className="text-sm text-muted-foreground">{player.form}</span>
                  </div>
                  <Progress value={getFormProgress(player.form)} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Player Details */}
            <Card>
              <CardHeader>
                <CardTitle>Player Information</CardTitle>
                <CardDescription>Personal and playing details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Batting Style</p>
                    <p className="font-medium">{player.battingStyle}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Bowling Style</p>
                    <p className="font-medium">{player.bowlingStyle}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Nationality</p>
                    <p className="font-medium">{player.nationality}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Team</p>
                    <p className="font-medium">{player.teamId.shortName}</p>
                  </div>
                </div>
                
                {/* Strengths and Weaknesses */}
                {player.strengths && player.strengths.length > 0 && (
                  <div>
                    <p className="text-muted-foreground mb-2">Strengths</p>
                    <div className="flex flex-wrap gap-1">
                      {player.strengths.map((strength, index) => (
                        <Badge key={index} variant="outline" className="text-green-600 border-green-600">
                          {strength}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                
                {player.weaknesses && player.weaknesses.length > 0 && (
                  <div>
                    <p className="text-muted-foreground mb-2">Areas for Improvement</p>
                    <div className="flex flex-wrap gap-1">
                      {player.weaknesses.map((weakness, index) => (
                        <Badge key={index} variant="outline" className="text-orange-600 border-orange-600">
                          {weakness}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Recent Form Chart */}
          {player.recentForm && player.recentForm.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Recent Form</CardTitle>
                <CardDescription>Performance in last 5 matches</CardDescription>
              </CardHeader>
              <CardContent>
                <DashboardChart
                  data={player.recentForm.map(form => ({
                    name: form.match,
                    value: form.performance,
                    date: form.date
                  }))}
                  title="Recent Performances"
                  type="line"
                />
              </CardContent>
            </Card>
          )}

          {/* Format Comparison */}
          <Card>
            <CardHeader>
              <CardTitle>Format Comparison</CardTitle>
              <CardDescription>Performance across all formats</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(player.stats).map(([format, stats]) => (
                  <div 
                    key={format} 
                    className={`p-4 border rounded-lg ${format === activeFormat ? 'border-blue-500 bg-blue-50' : ''}`}
                  >
                    <h4 className="font-medium text-lg mb-2">{format.toUpperCase()}</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Matches:</span>
                        <span className="font-medium">{stats.matches}</span>
                      </div>
                      {stats.runs !== undefined && (
                        <div className="flex justify-between">
                          <span>Runs:</span>
                          <span className="font-medium">{stats.runs?.toLocaleString()}</span>
                        </div>
                      )}
                      {stats.wickets !== undefined && (
                        <div className="flex justify-between">
                          <span>Wickets:</span>
                          <span className="font-medium">{stats.wickets}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span>Average:</span>
                        <span className="font-medium">{stats.average.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button onClick={() => window.history.back()}>
          Back to Analysis
        </Button>
        <Button variant="outline">
          Add to Favorites
        </Button>
        <Button variant="outline">
          Share Profile
        </Button>
        <Button variant="outline">
          Export Report
        </Button>
      </div>
    </div>
  );
}