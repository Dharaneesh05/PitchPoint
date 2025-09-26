import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { DashboardSkeleton, LoadingSpinner } from "./LoadingStates";
import { DashboardChart } from "./DashboardChart";
import { apiClient } from "@/lib/api";
import { cricDataService } from "@/lib/cricDataApi";
import { mlApiClient } from "@/lib/mlApi";

interface TeamData {
  players: Array<{
    id: string;
    name: string;
    role: string;
    form: string;
    fitness: number;
    availability: boolean;
    recentPerformance: number;
    team: string;
  }>;
  upcomingMatches: Array<{
    id: string;
    opponent: string;
    date: string;
    venue: string;
    format: string;
  }>;
  teamStats: {
    totalPlayers: number;
    availablePlayers: number;
    injuredPlayers: number;
    averageFitness: number;
    teamForm: string;
  };
  trainingSchedule: Array<{
    id: string;
    date: string;
    type: string;
    focus: string;
    duration: string;
    participants: number;
    status: string;
  }>;
}

export function CoachDashboard() {
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeRange, setSelectedTimeRange] = useState("7d");
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [playerSearch, setPlayerSearch] = useState("");
  const { toast } = useToast();

  // Enhanced Search and API States
  const [apiPlayers, setApiPlayers] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [allPlayersView, setAllPlayersView] = useState(false);

  useEffect(() => {
    fetchTeamData();
  }, [selectedTimeRange]);

  const fetchTeamData = async () => {
    try {
      setLoading(true);
      
      const [players, matches, stats, schedule, cricDataPlayers] = await Promise.all([
        apiClient.getPlayers(),
        apiClient.getMatches({ upcoming: true, limit: 5 }),
        apiClient.getTeamStats(),
        apiClient.getTrainingSchedule(),
        cricDataService.getAllPlayers()
      ]);

      const transformedPlayers = (players || []).map((player: any) => ({
        id: player._id || player.id,
        name: player.name,
        role: player.role === 'bowler' ? 'Bowler' : player.role === 'batsman' ? 'Batsman' : player.role === 'wicket-keeper' ? 'Wicket-keeper' : 'All-rounder',
        form: player.form || 'good',
        fitness: Math.floor(Math.random() * 20) + 80,
        availability: !player.isInjured,
        recentPerformance: Math.floor(Math.random() * 30) + 70,
        team: player.teamId?.name || player.team || 'Unknown',
      }));

      setApiPlayers(cricDataPlayers || []);
      setSearchResults(cricDataPlayers || []);

      const teamData: TeamData = {
        players: transformedPlayers,
        upcomingMatches: (matches || []).map((match: any) => ({
          id: match._id || match.id,
          opponent: match.awayTeam?.name || match.opponent || 'TBD',
          date: match.date,
          venue: match.venue || 'TBD',
          format: match.format || 'Test'
        })),
        teamStats: {
          totalPlayers: transformedPlayers.length,
          availablePlayers: transformedPlayers.filter((p: any) => p.availability).length,
          injuredPlayers: transformedPlayers.filter((p: any) => !p.availability).length,
          averageFitness: transformedPlayers.length > 0 ? 
            Math.round(transformedPlayers.reduce((sum: number, p: any) => sum + p.fitness, 0) / transformedPlayers.length) : 0,
          teamForm: "excellent"
        },
        trainingSchedule: schedule.schedule || schedule || []
      };

      setTeamData(teamData);
      
      toast({
        title: "Data Loaded Successfully",
        description: `Loaded ${transformedPlayers.length} team players and ${cricDataPlayers?.length || 0} searchable players`,
      });
    } catch (error) {
      console.error('Error fetching team data:', error);
      toast({
        title: "Error",
        description: "Failed to load team data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getFilteredPlayers = () => {
    if (!teamData) return [];
    return teamData.players.filter(player => {
      const matchesTeam = selectedTeam === "all" || player.team === selectedTeam;
      const matchesSearch = playerSearch === "" || 
        player.name.toLowerCase().includes(playerSearch.toLowerCase()) ||
        player.role.toLowerCase().includes(playerSearch.toLowerCase());
      return matchesTeam && matchesSearch;
    });
  };

  const getSearchResults = () => {
    return allPlayersView ? searchResults : getFilteredPlayers();
  };

  const togglePlayersView = () => {
    setAllPlayersView(!allPlayersView);
    setPlayerSearch("");
    
    if (!allPlayersView) {
      toast({
        title: "Switched to All Players",
        description: `Now showing ${apiPlayers.length} players from CricData API`,
      });
    } else {
      toast({
        title: "Switched to Team Players",
        description: `Now showing your team's ${teamData?.players.length || 0} players`,
      });
    }
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!teamData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 flex items-center justify-center p-6">
        <div className="text-center bg-gradient-to-br from-slate-800 to-slate-900 p-8 rounded-lg shadow-lg border border-slate-600">
          <div className="w-16 h-16 bg-red-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-200 text-2xl font-bold">!</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Data Available</h3>
          <p className="text-gray-300 mb-6 font-medium">Unable to load team data. Please try again.</p>
          <Button 
            onClick={fetchTeamData}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors duration-200"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 space-y-8 p-6">
      <motion.div 
        className="space-y-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header */}
        <div className="text-center bg-gradient-to-r from-slate-800 to-slate-900 p-8 rounded-lg shadow-lg border border-slate-600">
          <h1 className="text-4xl font-bold text-white mb-4">Coach Dashboard</h1>
          <p className="text-xl text-gray-300 font-medium">
            Team Management & Performance Analytics
          </p>
          <div className="mt-4 flex justify-center gap-4">
            <Badge className="bg-green-800 text-green-200 px-4 py-2 text-sm font-bold">
              {teamData.teamStats.availablePlayers} Available
            </Badge>
            <Badge className="bg-blue-800 text-blue-200 px-4 py-2 text-sm font-bold">
              {teamData.teamStats.averageFitness}% Avg Fitness
            </Badge>
          </div>
        </div>

        <Tabs defaultValue="players" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-slate-800 border border-slate-600">
            <TabsTrigger value="players" className="text-white font-semibold">Players</TabsTrigger>
            <TabsTrigger value="matches" className="text-white font-semibold">Matches</TabsTrigger>
            <TabsTrigger value="training" className="text-white font-semibold">Training</TabsTrigger>
            <TabsTrigger value="analytics" className="text-white font-semibold">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="players" className="space-y-6">
            <Card className="border border-slate-600 shadow-lg bg-gradient-to-br from-slate-700 to-slate-800">
              <CardHeader className="bg-gradient-to-r from-blue-800 to-indigo-800 rounded-t-lg">
                <CardTitle className="text-2xl font-bold text-white">Player Management & Search</CardTitle>
                <CardDescription className="text-gray-200 font-medium">
                  {allPlayersView ? `Search ${apiPlayers.length}+ international players` : 'Manage your team players'}
                </CardDescription>
                
                <div className="flex justify-between items-center mt-6">
                  <Button
                    onClick={togglePlayersView}
                    className={`px-6 py-2 font-bold rounded-lg transition-all duration-200 ${
                      allPlayersView 
                        ? 'bg-purple-600 hover:bg-purple-700 text-white' 
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {allPlayersView ? 'All Players' : 'Team Players'}
                  </Button>
                  
                  <div className="text-sm text-gray-300">
                    {allPlayersView 
                      ? `${searchResults.length} international players` 
                      : `${teamData?.players.length || 0} team players`}
                  </div>
                </div>

                <div className="mt-4">
                  <input
                    type="text"
                    placeholder={allPlayersView ? "Search international players..." : "Search team players..."}
                    value={playerSearch}
                    onChange={(e) => setPlayerSearch(e.target.value)}
                    className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-medium placeholder-gray-400"
                  />
                </div>
              </CardHeader>
              
              <CardContent className="p-6 bg-slate-800">
                <div className="overflow-hidden rounded-lg border border-slate-600">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-gradient-to-r from-slate-700 to-slate-600 border-slate-600">
                        <TableHead className="font-bold text-white py-4">Player Name</TableHead>
                        <TableHead className="font-bold text-white py-4">Team</TableHead>
                        <TableHead className="font-bold text-white py-4">Role</TableHead>
                        <TableHead className="font-bold text-white py-4">Stats</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getSearchResults().slice(0, 10).map((player, index) => (
                        <TableRow key={player.id || `${player.name}-${index}`} className={`hover:bg-slate-700 transition-colors duration-200 border-slate-600 ${index % 2 === 0 ? 'bg-slate-800' : 'bg-slate-750'}`}>
                          <TableCell className="font-semibold text-white py-4">
                            {player.name}
                          </TableCell>
                          <TableCell className="py-4">
                            <span className="inline-block px-3 py-1 text-xs font-bold text-gray-200 bg-slate-600 rounded-full">
                              {player.team}
                            </span>
                          </TableCell>
                          <TableCell className="py-4">
                            <span className="inline-block px-3 py-1 text-xs font-bold text-blue-200 bg-blue-800 rounded-full">
                              {player.role}
                            </span>
                          </TableCell>
                          <TableCell className="py-4">
                            {allPlayersView ? (
                              <div className="text-xs space-y-1">
                                <div className="text-green-400">Batting Avg: {player.battingStats?.average || 'N/A'}</div>
                                <div className="text-red-400">Bowling Avg: {player.bowlingStats?.average || 'N/A'}</div>
                              </div>
                            ) : (
                              <div className="text-xs space-y-1">
                                <div className="text-green-400">Fitness: {player.fitness}%</div>
                                <div className="text-blue-400">Performance: {player.recentPerformance}%</div>
                              </div>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {getSearchResults().length === 0 && (
                    <div className="p-8 text-center bg-slate-800">
                      <div className="text-gray-200 text-lg font-medium">
                        No players found
                      </div>
                      <div className="text-gray-300 text-sm mt-2">
                        Try adjusting your search criteria
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="matches" className="space-y-6">
            <Card className="border border-slate-600 shadow-lg bg-gradient-to-br from-slate-700 to-slate-800">
              <CardHeader className="bg-gradient-to-r from-purple-800 to-pink-800 rounded-t-lg">
                <CardTitle className="text-2xl font-bold text-white">Upcoming Matches</CardTitle>
                <CardDescription className="text-gray-200 font-medium">
                  Match schedule and analysis
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-6 bg-slate-800">
                <div className="space-y-4">
                  {teamData.upcomingMatches.length === 0 ? (
                    <div className="text-center py-12 bg-slate-700 rounded-lg border border-slate-600">
                      <div className="text-gray-200 text-lg font-medium mb-2">
                        No upcoming matches scheduled
                      </div>
                      <div className="text-gray-300 text-sm">
                        Check back later for updated match schedules
                      </div>
                    </div>
                  ) : (
                    teamData.upcomingMatches.map((match, index) => (
                      <div key={match.id} className={`flex items-center justify-between p-6 border border-slate-600 rounded-lg hover:bg-slate-700 transition-all duration-200 ${index % 2 === 0 ? 'bg-slate-800' : 'bg-slate-750'}`}>
                        <div className="flex items-center gap-6">
                          <div className="h-16 w-16 rounded-full bg-gradient-to-r from-purple-700 to-pink-700 flex items-center justify-center">
                            <span className="text-2xl font-bold text-purple-200">VS</span>
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-white mb-2">vs {match.opponent}</h4>
                            <p className="text-gray-300 font-medium mb-2">
                              {match.venue || 'Venue TBD'}
                            </p>
                            <span className="inline-block px-3 py-1 text-xs font-bold text-purple-200 bg-purple-800 rounded-full">
                              {(match.format || 'Test').toUpperCase()}
                            </span>
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-lg font-bold text-white mb-3">
                            {match.date ? new Date(match.date).toLocaleDateString() : 'TBD'}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="training" className="space-y-6">
            <Card className="border border-slate-600 shadow-lg bg-gradient-to-br from-slate-700 to-slate-800">
              <CardHeader className="bg-gradient-to-r from-green-800 to-teal-800 rounded-t-lg">
                <CardTitle className="text-2xl font-bold text-white">Training Schedule</CardTitle>
                <CardDescription className="text-gray-200 font-medium">
                  Practice sessions and team training
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-6 bg-slate-800">
                <div className="space-y-4">
                  {teamData.trainingSchedule.length === 0 ? (
                    <div className="text-center py-12 bg-slate-700 rounded-lg border border-slate-600">
                      <div className="text-gray-200 text-lg font-medium mb-2">
                        No training sessions scheduled
                      </div>
                      <div className="text-gray-300 text-sm">
                        Add training sessions to improve team performance
                      </div>
                    </div>
                  ) : (
                    teamData.trainingSchedule.map((session, index) => (
                      <div key={session.id} className={`flex items-center justify-between p-6 border border-slate-600 rounded-lg hover:bg-slate-700 transition-all duration-200 ${index % 2 === 0 ? 'bg-slate-800' : 'bg-slate-750'}`}>
                        <div className="flex items-center gap-6">
                          <div className="h-16 w-16 rounded-full bg-gradient-to-r from-green-700 to-teal-700 flex items-center justify-center">
                            <span className="text-sm font-bold text-green-200 uppercase">
                              {session.type.split(' ')[0].slice(0, 3)}
                            </span>
                          </div>
                          <div>
                            <h4 className="text-xl font-bold text-white mb-2">{session.type}</h4>
                            <p className="text-gray-300 font-medium mb-1">
                              Focus: {session.focus}
                            </p>
                            <p className="text-gray-300 font-medium">
                              Duration: {session.duration}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-bold text-white mb-2">{session.date}</p>
                          <p className="text-sm font-semibold text-gray-300 mb-2">
                            {session.participants} participants
                          </p>
                          <span className="inline-block px-3 py-1 text-xs font-bold text-green-200 bg-green-800 rounded-full">
                            {session.status?.toUpperCase() || 'SCHEDULED'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card className="border border-slate-600 shadow-lg bg-gradient-to-br from-slate-700 to-slate-800">
              <CardHeader className="bg-gradient-to-r from-orange-800 to-red-800 rounded-t-lg">
                <CardTitle className="text-2xl font-bold text-white">Team Analytics</CardTitle>
                <CardDescription className="text-gray-200 font-medium">
                  Performance metrics and insights
                </CardDescription>
              </CardHeader>
              
              <CardContent className="p-6 bg-slate-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-slate-700 rounded-lg border border-slate-600">
                    <h3 className="text-lg font-bold text-white mb-4">Team Overview</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-300">Total Players:</span>
                        <span className="text-white font-bold">{teamData.teamStats.totalPlayers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Available:</span>
                        <span className="text-green-400 font-bold">{teamData.teamStats.availablePlayers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Injured:</span>
                        <span className="text-red-400 font-bold">{teamData.teamStats.injuredPlayers}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-300">Avg Fitness:</span>
                        <span className="text-blue-400 font-bold">{teamData.teamStats.averageFitness}%</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-6 bg-slate-700 rounded-lg border border-slate-600">
                    <h3 className="text-lg font-bold text-white mb-4">Performance Chart</h3>
                    <DashboardChart data={[
                      { name: 'Available', value: teamData.teamStats.availablePlayers },
                      { name: 'Injured', value: teamData.teamStats.injuredPlayers }
                    ]} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}

export default CoachDashboard;