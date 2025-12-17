import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { DashboardSkeleton, LoadingSpinner } from "./LoadingStates";

interface Match {
  id: string;
  team1: string;
  team2: string;
  date: string;
  venue: string;
  format: "T20" | "ODI" | "Test";
  status: "upcoming" | "live" | "completed";
  predictions?: {
    winner?: string;
    totalScore?: number;
    topScorer?: string;
    playerOfMatch?: string;
  };
  result?: {
    winner: string;
    score1: string;
    score2: string;
    playerOfMatch: string;
  };
}

interface Prediction {
  id: string;
  matchId: string;
  userId: string;
  type: "winner" | "totalScore" | "topScorer" | "playerOfMatch";
  prediction: string | number;
  points: number;
  status: "pending" | "correct" | "incorrect";
  createdAt: string;
}

interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  totalPoints: number;
  correctPredictions: number;
  totalPredictions: number;
  accuracy: number;
  streak: number;
  badge?: "gold" | "silver" | "bronze";
}

interface FantasyTip {
  id: string;
  type: "captain" | "player" | "strategy";
  title: string;
  description: string;
  confidence: "high" | "medium" | "low";
  points: number;
  category: "batting" | "bowling" | "all-rounder" | "wicket-keeper";
}

export function FanDashboard() {
  const [upcomingMatches, setUpcomingMatches] = useState<Match[]>([]);
  const [userPredictions, setUserPredictions] = useState<Prediction[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [fantasyTips, setFantasyTips] = useState<FantasyTip[]>([]);
  const [selectedMatch, setSelectedMatch] = useState<string>("");
  const [predictionType, setPredictionType] = useState<string>("winner");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchFanData();
  }, []);

  const fetchFanData = async () => {
    try {
      setIsLoading(true);
      // Simulate API calls for fan-specific data
      await new Promise(resolve => setTimeout(resolve, 1000));

      const mockMatches: Match[] = [
        {
          id: "1",
          team1: "India",
          team2: "Australia",
          date: "2024-12-25T14:30:00Z",
          venue: "MCG",
          format: "T20",
          status: "upcoming",
        },
        {
          id: "2",
          team1: "England",
          team2: "New Zealand",
          date: "2024-12-26T09:00:00Z",
          venue: "Lord's",
          format: "ODI",
          status: "upcoming",
        },
        {
          id: "3",
          team1: "Pakistan",
          team2: "South Africa",
          date: "2024-12-24T16:00:00Z",
          venue: "Dubai",
          format: "T20",
          status: "completed",
          result: {
            winner: "Pakistan",
            score1: "187/5",
            score2: "156/8",
            playerOfMatch: "Babar Azam",
          },
        },
      ];

      const mockPredictions: Prediction[] = [
        {
          id: "1",
          matchId: "3",
          userId: "user1",
          type: "winner",
          prediction: "Pakistan",
          points: 10,
          status: "correct",
          createdAt: "2024-12-24T10:00:00Z",
        },
        {
          id: "2",
          matchId: "3",
          userId: "user1",
          type: "playerOfMatch",
          prediction: "Babar Azam",
          points: 15,
          status: "correct",
          createdAt: "2024-12-24T10:00:00Z",
        },
      ];

      const mockLeaderboard: LeaderboardEntry[] = [
        { rank: 1, userId: "user2", username: "CricketKing", totalPoints: 1250, correctPredictions: 87, totalPredictions: 120, accuracy: 72.5, streak: 8, badge: "gold" },
        { rank: 2, userId: "user3", username: "SixHitter", totalPoints: 1180, correctPredictions: 82, totalPredictions: 115, accuracy: 71.3, streak: 5, badge: "silver" },
        { rank: 3, userId: "user4", username: "BowlMaster", totalPoints: 1150, correctPredictions: 79, totalPredictions: 118, accuracy: 66.9, streak: 3, badge: "bronze" },
        { rank: 4, userId: "user1", username: "You", totalPoints: 1089, correctPredictions: 75, totalPredictions: 112, accuracy: 67.0, streak: 2 },
        { rank: 5, userId: "user5", username: "SpinWizard", totalPoints: 1045, correctPredictions: 71, totalPredictions: 108, accuracy: 65.7, streak: 1 },
      ];

      const mockFantasyTips: FantasyTip[] = [
        {
          id: "1",
          type: "captain",
          title: "Captain Pick: Virat Kohli",
          description: "Kohli has scored 50+ in his last 4 matches at MCG. High probability of big score.",
          confidence: "high",
          points: 85,
          category: "batting",
        },
        {
          id: "2",
          type: "player",
          title: "Value Pick: Jasprit Bumrah",
          description: "Bumrah's economy rate is excellent in T20s. Great bowling points potential.",
          confidence: "high",
          points: 78,
          category: "bowling",
        },
        {
          id: "3",
          type: "strategy",
          title: "All-rounder Strategy",
          description: "Picking 3 all-rounders can maximize points in this pitch condition.",
          confidence: "medium",
          points: 72,
          category: "all-rounder",
        },
      ];

      setUpcomingMatches(mockMatches);
      setUserPredictions(mockPredictions);
      setLeaderboard(mockLeaderboard);
      setFantasyTips(mockFantasyTips);
    } catch (error) {
      console.error('Error fetching fan data:', error);
      toast({
        title: "Error loading data",
        description: "Failed to fetch fan dashboard data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const submitPrediction = async (matchId: string, type: string, value: string) => {
    try {
      setIsSubmitting(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newPrediction: Prediction = {
        id: Date.now().toString(),
        matchId,
        userId: "user1",
        type: type as any,
        prediction: value,
        points: 0,
        status: "pending",
        createdAt: new Date().toISOString(),
      };

      setUserPredictions(prev => [...prev, newPrediction]);
      
      toast({
        title: "Prediction Submitted!",
        description: `Your ${type} prediction has been recorded successfully.`,
      });
    } catch (error) {
      toast({
        title: "Submission Failed",
        description: "Failed to submit prediction. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "correct": return <span className="w-4 h-4 text-green-500 font-bold">✓</span>;
      case "incorrect": return <span className="w-4 h-4 text-red-500 font-bold">✗</span>;
      default: return <span className="w-4 h-4 text-yellow-500 font-bold">⏳</span>;
    }
  };

  const getBadgeIcon = (badge?: string) => {
    switch (badge) {
      case "gold": return <span className="w-4 h-4 text-yellow-500 font-bold">👑</span>;
      case "silver": return <span className="w-4 h-4 text-gray-400 font-bold">🥈</span>;
      case "bronze": return <span className="w-4 h-4 text-amber-600 font-bold">🥉</span>;
      default: return null;
    }
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const userStats = leaderboard.find(entry => entry.username === "You");

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-heading font-bold tracking-tight">Fan Zone</h1>
        <p className="text-muted-foreground">
          Make predictions, get fantasy tips, and compete with other cricket fans
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { 
            title: "Your Rank", 
            value: `#${userStats?.rank || 'N/A'}`, 
            change: userStats?.streak ? `${userStats.streak} win streak` : "No active streak"
          },
          { 
            title: "Total Points", 
            value: userStats?.totalPoints?.toLocaleString() || "0", 
            change: `${userStats?.accuracy || 0}% accuracy`
          },
          { 
            title: "Predictions Made", 
            value: userStats?.totalPredictions?.toString() || "0", 
            change: `${userStats?.correctPredictions || 0} correct`
          },
          { 
            title: "Fantasy Score", 
            value: "847", 
            change: "+23 this week"
          },
        ].map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="predictions" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="predictions">Predictions</TabsTrigger>
          <TabsTrigger value="fantasy">Fantasy Tips</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="favorites">Favorites</TabsTrigger>
        </TabsList>

        <TabsContent value="predictions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Make Predictions */}
            <Card>
              <CardHeader>
                <CardTitle>Make Predictions</CardTitle>
                <CardDescription>Predict match outcomes and earn points</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Select Match</label>
                  <Select value={selectedMatch} onValueChange={setSelectedMatch}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a match" />
                    </SelectTrigger>
                    <SelectContent>
                      {upcomingMatches
                        .filter(match => match.status === "upcoming")
                        .map(match => (
                          <SelectItem key={match.id} value={match.id}>
                            {match.team1} vs {match.team2} - {new Date(match.date).toLocaleDateString()}
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedMatch && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="space-y-4"
                  >
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Prediction Type</label>
                      <Select value={predictionType} onValueChange={setPredictionType}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="winner">Match Winner (10 pts)</SelectItem>
                          <SelectItem value="totalScore">Total Score Range (15 pts)</SelectItem>
                          <SelectItem value="topScorer">Top Scorer (20 pts)</SelectItem>
                          <SelectItem value="playerOfMatch">Player of Match (25 pts)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Button 
                      onClick={() => {
                        const selectedMatchData = upcomingMatches.find(m => m.id === selectedMatch);
                        if (predictionType === "winner" && selectedMatchData) {
                          submitPrediction(selectedMatch, predictionType, selectedMatchData.team1);
                        }
                      }}
                      className="w-full" 
                      disabled={isSubmitting}
                    >
                      {isSubmitting && <LoadingSpinner size="sm" />}
                      Submit Prediction
                    </Button>
                  </motion.div>
                )}
              </CardContent>
            </Card>

            {/* Recent Predictions */}
            <Card>
              <CardHeader>
                <CardTitle>Your Recent Predictions</CardTitle>
                <CardDescription>Track your prediction performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {userPredictions.slice(0, 5).map((prediction, index) => (
                    <motion.div
                      key={prediction.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        {getStatusIcon(prediction.status)}
                        <div>
                          <p className="font-medium text-sm">{prediction.type}</p>
                          <p className="text-xs text-muted-foreground">
                            {prediction.prediction}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{prediction.points} pts</p>
                        <Badge variant={
                          prediction.status === "correct" ? "default" : 
                          prediction.status === "incorrect" ? "destructive" : "secondary"
                        }>
                          {prediction.status}
                        </Badge>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Live Matches */}
          <Card>
            <CardHeader>
              <CardTitle>Live & Upcoming Matches</CardTitle>
              <CardDescription>Follow matches and make predictions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingMatches.map((match, index) => (
                  <motion.div
                    key={match.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card className="relative overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <Badge variant={match.status === "live" ? "default" : "secondary"}>
                            {match.status}
                          </Badge>
                          <Badge variant="outline">{match.format}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="text-center">
                          <h3 className="font-heading font-semibold">{match.team1} vs {match.team2}</h3>
                          <p className="text-sm text-muted-foreground">{match.venue}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(match.date).toLocaleDateString()}
                          </p>
                        </div>
                        
                        {match.result && (
                          <div className="text-center space-y-1">
                            <p className="text-sm font-medium text-green-600">
                              {match.result.winner} won
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {match.result.score1} vs {match.result.score2}
                            </p>
                          </div>
                        )}
                        
                        {match.status === "upcoming" && (
                          <Button size="sm" className="w-full">
                            Predict
                          </Button>
                        )}
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="fantasy" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {fantasyTips.map((tip, index) => (
              <motion.div
                key={tip.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant={tip.confidence === "high" ? "default" : tip.confidence === "medium" ? "secondary" : "outline"}>
                        {tip.confidence} confidence
                      </Badge>
                      <div className="flex items-center gap-1">
                        <span className="text-sm font-medium text-yellow-500">★</span>
                        <span className="text-sm font-medium">{tip.points}</span>
                      </div>
                    </div>
                    <CardTitle className="text-lg">{tip.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{tip.description}</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{tip.category}</Badge>
                      <Button size="sm" variant="outline">
                        Save Tip
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="leaderboard" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Global Leaderboard</CardTitle>
              <CardDescription>Top prediction experts this season</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Player</TableHead>
                    <TableHead>Points</TableHead>
                    <TableHead>Accuracy</TableHead>
                    <TableHead>Streak</TableHead>
                    <TableHead>Badge</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboard.map((entry, index) => (
                    <motion.tr
                      key={entry.userId}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={entry.username === "You" ? "bg-primary/5" : ""}
                    >
                      <TableCell className="font-medium">#{entry.rank}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getBadgeIcon(entry.badge)}
                          <span className={entry.username === "You" ? "font-semibold" : ""}>
                            {entry.username}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{entry.totalPoints.toLocaleString()}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Progress value={entry.accuracy} className="w-16" />
                          <span className="text-sm">{entry.accuracy}%</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={entry.streak > 5 ? "default" : "secondary"}>
                          {entry.streak}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {entry.badge && (
                          <Badge variant="outline" className="capitalize">
                            {entry.badge}
                          </Badge>
                        )}
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="favorites" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Favorite Teams</CardTitle>
                <CardDescription>Teams you follow closely</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {["India", "Australia", "England"].map((team, index) => (
                    <motion.div
                      key={team}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">{team.charAt(0)}</span>
                        </div>
                        <span className="font-medium">{team}</span>
                      </div>
                      <Button size="sm" variant="outline">
                        View Stats
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Favorite Players</CardTitle>
                <CardDescription>Players you track for fantasy</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {["Virat Kohli", "Jasprit Bumrah", "Ben Stokes"].map((player, index) => (
                    <motion.div
                      key={player}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center justify-between p-3 rounded-lg border"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                          <span className="text-sm font-medium text-primary">{player.charAt(0)}</span>
                        </div>
                        <span className="font-medium">{player}</span>
                      </div>
                      <Button size="sm" variant="outline">
                        Analysis
                      </Button>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}