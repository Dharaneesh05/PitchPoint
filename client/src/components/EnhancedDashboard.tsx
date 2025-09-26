import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { DashboardChart } from "./DashboardChart";
import { PlayerCard } from "./PlayerCard";
import { MatchCard } from "./MatchCard";
import { apiClient } from "../lib/api";

interface User {
  id: string;
  username: string;
  email: string;
  role: string;
  emailVerified: boolean;
}

interface EnhancedDashboardProps {
  user: User | null;
}

interface FantasyLeaderboard {
  playerId: string;
  playerName: string;
  totalPoints: number;
  rank: number;
}

interface DashboardData {
  players: any[];
  teams: any[];
  matches: any[];
  venues: any[];
  fantasyLeaderboard: FantasyLeaderboard[];
  liveMatches?: any[];
  upcomingMatches?: any[];
  stats?: any;
}

export function EnhancedDashboard({ user }: EnhancedDashboardProps) {
  // Add safety check for user prop
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-900 via-emerald-800 to-slate-900 p-6">
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <h2 className="text-2xl font-heading font-bold text-white mb-4">Loading Dashboard...</h2>
            <p className="text-gray-300">Please wait while we load your dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  const [data, setData] = useState<DashboardData>({
    players: [],
    teams: [],
    matches: [],
    venues: [],
    fantasyLeaderboard: [],
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      const promises: Promise<any>[] = [
        apiClient.getPlayers({ limit: 10, sortBy: 'battingAverage', sortOrder: 'desc' }),
        apiClient.getTeams({ limit: 10 }),
        apiClient.getMatches({ limit: 10, sortBy: 'startDate', sortOrder: 'desc' }),
        apiClient.getVenues({ limit: 10 }),
        apiClient.getFantasyLeaderboard(undefined, 10),
      ];

      // Add role-specific data
      if (user?.role === 'fan') {
        promises.push(
          apiClient.getLiveMatches(),
          apiClient.getUpcomingMatches()
        );
      }

      if (user?.role === 'coach' || user?.role === 'analyst') {
        promises.push(apiClient.getAdminStats());
      }

      const results = await Promise.all(promises);
      
      const dashboardData: DashboardData = {
        players: results[0] || [],
        teams: results[1] || [],
        matches: results[2] || [],
        venues: results[3] || [],
        fantasyLeaderboard: results[4] || [],
      };

      if (user?.role === 'fan') {
        dashboardData.liveMatches = results[5] || [];
        dashboardData.upcomingMatches = results[6] || [];
      }

      if (user?.role === 'coach' || user?.role === 'analyst') {
        dashboardData.stats = results[5] || {};
      }

      setData(dashboardData);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const results = await apiClient.search(searchQuery, 'all', 20);
      setSearchResults(results || []);
    } catch (error) {
      console.error("Search error:", error);
      setSearchResults([]);
    }
  };

  const handleSync = async (type: 'all' | 'teams' | 'players' | 'venues' | 'matches' = 'all') => {
    if (user?.role !== 'coach' && user?.role !== 'analyst') return;
    
    try {
      setSyncing(true);
      await apiClient.syncData(type);
      await loadDashboardData(); // Refresh data after sync
    } catch (error) {
      console.error("Sync error:", error);
    } finally {
      setSyncing(false);
    }
  };

  const getRoleDisplay = (role: string) => {
    const roleConfig = {
      coach: { label: "Coach", variant: "default" as const, color: "text-emerald-700" },
      analyst: { label: "Analyst", variant: "secondary" as const, color: "text-blue-700" },
      fan: { label: "Fan", variant: "outline" as const, color: "text-purple-700" },
    };
    return roleConfig[role as keyof typeof roleConfig] || { label: role, variant: "outline" as const, color: "text-gray-300" };
  };

  const roleInfo = getRoleDisplay(user?.role || 'guest');

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-emerald-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-emerald-100 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-heading font-bold text-emerald-900">
            Welcome back, {user?.username || 'User'}!
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant={roleInfo.variant} className={roleInfo.color}>
              {roleInfo.label}
            </Badge>
            {!user?.emailVerified && (
              <Badge variant="destructive">Email Not Verified</Badge>
            )}
          </div>
        </div>
        
        {/* Search */}
        <div className="flex gap-2">
          <div className="relative">
            <Input
              placeholder="Search players, teams, matches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="w-80"
            />
          </div>
          <Button onClick={handleSearch} variant="outline">
            Search
          </Button>
          
          {/* Sync button for coaches and analysts */}
          {(user?.role === 'coach' || user?.role === 'analyst') && (
            <Button 
              onClick={() => handleSync('all')} 
              variant="outline"
              disabled={syncing}
            >
              {syncing ? 'Syncing...' : 'Sync Data'}
            </Button>
          )}
        </div>
      </div>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {searchResults.map((result, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-emerald-50">
                  <div>
                    <p className="font-medium">{result.name}</p>
                    <p className="text-sm text-gray-300 capitalize">{result.type}</p>
                  </div>
                  <Badge variant="outline">{result.type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Role-specific Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-600 text-sm font-medium">Players</p>
                <p className="text-2xl font-bold text-emerald-900">{data.players.length}+</p>
              </div>
              <Users className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Teams</p>
                <p className="text-2xl font-bold text-blue-900">{data.teams.length}+</p>
              </div>
              <Trophy className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Matches</p>
                <p className="text-2xl font-bold text-purple-900">{data.matches.length}+</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Venues</p>
                <p className="text-2xl font-bold text-orange-900">{data.venues.length}+</p>
              </div>
              <MapPin className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Role-specific Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="players">Players</TabsTrigger>
          {user?.role === 'fan' && <TabsTrigger value="live">Live Matches</TabsTrigger>}
          {(user?.role === 'coach' || user?.role === 'analyst') && <TabsTrigger value="analytics">Analytics</TabsTrigger>}
          <TabsTrigger value="fantasy">Fantasy</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Players */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  Top Performing Players
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.players.slice(0, 5).map((player, index) => (
                    <div key={player._id} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-sm font-medium text-emerald-700">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{player.name}</p>
                          <p className="text-sm text-gray-300">{player.team}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{player.battingAverage?.toFixed(2) || 'N/A'}</p>
                        <p className="text-xs text-gray-300">Avg</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Matches */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Matches</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.matches.slice(0, 5).map((match) => (
                    <div key={match._id} className="border rounded-lg p-3 hover:bg-emerald-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{match.team1?.name} vs {match.team2?.name}</p>
                          <p className="text-sm text-gray-300">{match.venue}</p>
                          <p className="text-xs text-gray-500">{new Date(match.startDate).toLocaleDateString()}</p>
                        </div>
                        <Badge variant={
                          match.status === 'live' ? 'destructive' :
                          match.status === 'completed' ? 'secondary' : 'outline'
                        }>
                          {match.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Dashboard Chart */}
          <DashboardChart 
            title="Performance Analytics" 
            data={[
              { name: "Jan", value: 85 },
              { name: "Feb", value: 92 },
              { name: "Mar", value: 78 },
              { name: "Apr", value: 95 },
              { name: "May", value: 88 },
              { name: "Jun", value: 91 },
            ]} 
            type="line" 
          />
        </TabsContent>

        <TabsContent value="players" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.players.map((player) => (
              <div key={player._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-heading font-semibold">{player.name}</h3>
                    <p className="text-sm text-gray-300">{player.team}</p>
                    <p className="text-xs text-gray-500 capitalize">{player.role}</p>
                  </div>
                  <Badge variant="outline">{player.nationality}</Badge>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <p className="text-gray-300">Matches</p>
                    <p className="font-medium">{player.matches || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-300">Runs</p>
                    <p className="font-medium">{player.runs || 0}</p>
                  </div>
                  <div>
                    <p className="text-gray-300">Average</p>
                    <p className="font-medium">{player.battingAverage?.toFixed(2) || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-300">Strike Rate</p>
                    <p className="font-medium">{player.strikeRate?.toFixed(2) || 'N/A'}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {user?.role === 'fan' && (
          <TabsContent value="live" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Live Matches */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600 flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    Live Matches
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data.liveMatches && data.liveMatches.length > 0 ? (
                    <div className="space-y-4">
                      {data.liveMatches.map((match) => (
                        <div key={match._id} className="border-l-4 border-red-500 pl-4 py-2">
                          <p className="font-medium">{match.team1?.name} vs {match.team2?.name}</p>
                          <p className="text-sm text-gray-300">{match.venue}</p>
                          <Badge variant="destructive" className="mt-1">LIVE</Badge>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-300">No live matches at the moment</p>
                  )}
                </CardContent>
              </Card>

              {/* Upcoming Matches */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-blue-600 flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Upcoming Matches
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {data.upcomingMatches && data.upcomingMatches.length > 0 ? (
                    <div className="space-y-4">
                      {data.upcomingMatches.slice(0, 5).map((match) => (
                        <div key={match._id} className="border-l-4 border-blue-500 pl-4 py-2">
                          <p className="font-medium">{match.team1?.name} vs {match.team2?.name}</p>
                          <p className="text-sm text-gray-300">{match.venue}</p>
                          <p className="text-xs text-gray-500">{new Date(match.startDate).toLocaleDateString()}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-300">No upcoming matches scheduled</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        {(user?.role === 'coach' || user?.role === 'analyst') && (
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* System Stats */}
              <Card>
                <CardHeader>
                  <CardTitle>System Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  {data.stats ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-emerald-50 rounded-lg">
                          <p className="text-2xl font-bold text-emerald-600">{data.stats.totalPlayers || 0}</p>
                          <p className="text-sm text-emerald-700">Total Players</p>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <p className="text-2xl font-bold text-blue-600">{data.stats.totalTeams || 0}</p>
                          <p className="text-sm text-blue-700">Total Teams</p>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <p className="text-2xl font-bold text-purple-600">{data.stats.totalMatches || 0}</p>
                          <p className="text-sm text-purple-700">Total Matches</p>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <p className="text-2xl font-bold text-orange-600">{data.stats.totalVenues || 0}</p>
                          <p className="text-sm text-orange-700">Total Venues</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="text-gray-300">Loading statistics...</p>
                  )}
                </CardContent>
              </Card>

              {/* Data Sync Controls */}
              <Card>
                <CardHeader>
                  <CardTitle>Data Synchronization</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-gray-300">Sync cricket data from external APIs</p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => handleSync('players')}
                        disabled={syncing}
                        className="w-full"
                      >
                        Sync Players
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => handleSync('teams')}
                        disabled={syncing}
                        className="w-full"
                      >
                        Sync Teams
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => handleSync('matches')}
                        disabled={syncing}
                        className="w-full"
                      >
                        Sync Matches
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => handleSync('venues')}
                        disabled={syncing}
                        className="w-full"
                      >
                        Sync Venues
                      </Button>
                    </div>
                    <Button 
                      onClick={() => handleSync('all')}
                      disabled={syncing}
                      className="w-full bg-emerald-600 hover:bg-emerald-700"
                    >
                      {syncing ? 'Syncing All Data...' : 'Sync All Data'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        )}

        <TabsContent value="fantasy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                Fantasy Leaderboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              {data.fantasyLeaderboard.length > 0 ? (
                <div className="space-y-4">
                  {data.fantasyLeaderboard.map((entry, index) => (
                    <div key={entry.playerId} className="flex items-center justify-between p-4 border rounded-lg hover:bg-emerald-50">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-yellow-100 text-yellow-700' :
                          index === 1 ? 'bg-gray-700 text-gray-300' :
                          index === 2 ? 'bg-orange-100 text-orange-700' :
                          'bg-emerald-100 text-emerald-700'
                        }`}>
                          {entry.rank}
                        </div>
                        <div>
                          <p className="font-medium">{entry.playerName}</p>
                          <p className="text-sm text-gray-300">Rank #{entry.rank}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-emerald-600">{entry.totalPoints}</p>
                        <p className="text-sm text-gray-300">points</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-300">No fantasy data available</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}