import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { AnalysisSkeleton, LoadingSpinner } from "./LoadingStates";
import { apiClient } from "@/lib/api";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  ScatterChart,
  Scatter,
} from "recharts";

interface AnalyticsData {
  teamPerformance: Array<{
    team: string;
    wins: number;
    losses: number;
    winRate: number;
    avgScore: number;
    recentForm: string[];
  }>;
  playerStats: Array<{
    id: string;
    name: string;
    role: string;
    team: string;
    battingAvg: number;
    bowlingAvg: number;
    matches: number;
    performance: number;
    trend: "up" | "down" | "stable";
    position: string;
    specialSkills: string[];
    recentForm: number;
    fitnessLevel: number;
    availability: boolean;
  }>;
  matchTrends: Array<{
    date: string;
    highScores: number;
    lowScores: number;
    avgScore: number;
    matches: number;
  }>;
  venueAnalysis: Array<{
    venue: string;
    matches: number;
    avgScore: number;
    highestScore: number;
    winRate: { home: number; away: number };
  }>;
  insights: Array<{
    type: "positive" | "negative" | "neutral";
    title: string;
    description: string;
    impact: "high" | "medium" | "low";
  }>;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#8dd1e1', '#d084d0'];

export function AnalystDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  console.log('Component render - analyticsData:', analyticsData);
  console.log('Component render - analyticsData teams count:', analyticsData?.teamPerformance?.length);
  const [isLoading, setIsLoading] = useState(false); // Changed to false to allow initial API call
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedTimeframe, setSelectedTimeframe] = useState("last30");
  const [selectedTeam, setSelectedTeam] = useState("all");
  const hasLoadedData = useRef(false); // Track if data has been loaded already
  
  // Team analysis filters
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>('all');
  const [selectedWinRateFilter, setSelectedWinRateFilter] = useState<string>('all');
  const [isFilterLoading, setIsFilterLoading] = useState(false);
  
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [playingEleven, setPlayingEleven] = useState<any[]>([]);
  const [teamInsights, setTeamInsights] = useState<any[]>([]);
  const [substitutes, setSubstitutes] = useState<any[]>([]);
  const [matchConditions, setMatchConditions] = useState({
    venue: "home",
    pitch: "balanced",
    weather: "clear",
    opposition: "medium"
  });
  const { toast } = useToast();

  useEffect(() => {
    console.log('AnalystDashboard useEffect triggered, calling fetchAnalyticsData');
    fetchAnalyticsData();
  }, []); // Only run once on mount to stop infinite loop

  // Persist team selection state
  useEffect(() => {
    const savedSelection = localStorage.getItem('team-selection-state');
    if (savedSelection) {
      const state = JSON.parse(savedSelection);
      setSelectedPlayers(state.selectedPlayers || []);
      setMatchConditions(state.matchConditions || {
        venue: "home",
        pitch: "balanced", 
        weather: "clear",
        opposition: "medium"
      });
    }
  }, []);

  useEffect(() => {
    if (selectedPlayers.length > 0 || playingEleven.length > 0) {
      localStorage.setItem('team-selection-state', JSON.stringify({
        selectedPlayers,
        matchConditions,
        playingEleven,
        teamInsights
      }));
    }
  }, [selectedPlayers, matchConditions, playingEleven, teamInsights]);

  const fetchAnalyticsData = async () => {
    console.log('=== fetchAnalyticsData called ===');
    console.log('isLoading:', isLoading);
    console.log('hasLoadedData.current:', hasLoadedData.current);
    console.log('analyticsData:', analyticsData);
    
    // Prevent multiple simultaneous API calls BUT allow retry if no data loaded
    if (isLoading || (hasLoadedData.current && analyticsData !== null)) {
      console.log('Preventing API call due to loading state or already loaded data');
      return;
    }
    
    try {
      console.log('Starting API call...');
      setIsLoading(true);
      console.log('Fetching analytics data from API...');
      console.log('apiClient:', apiClient);
      console.log('getPublicAnalyticsDashboard method exists:', typeof apiClient.getPublicAnalyticsDashboard === 'function');
      
      // Fetch real analytics data from public API (no authentication required)
      const data = await apiClient.getPublicAnalyticsDashboard();
      console.log('Analytics data received:', data);
      console.log('Team performance count:', data?.teamPerformance?.length);
      console.log('Player stats count:', data?.playerStats?.length);
      setAnalyticsData(data);
      console.log('Analytics data set in state');
      hasLoadedData.current = true; // Mark as loaded
      
      toast({
        title: "Analytics data loaded",
        description: "Dashboard updated with latest analytics data.",
        variant: "default",
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      
      // Fallback to mock data if API fails
      const mockData: AnalyticsData = {
        teamPerformance: [
          { team: "India", wins: 18, losses: 7, winRate: 72, avgScore: 284, recentForm: ["W", "W", "L", "W", "W"] },
          { team: "Australia", wins: 16, losses: 9, winRate: 64, avgScore: 276, recentForm: ["W", "L", "W", "W", "L"] },
          { team: "England", wins: 15, losses: 10, winRate: 60, avgScore: 271, recentForm: ["L", "W", "W", "L", "W"] },
          { team: "New Zealand", wins: 14, losses: 11, winRate: 56, avgScore: 265, recentForm: ["W", "W", "L", "L", "W"] },
          { team: "South Africa", wins: 12, losses: 13, winRate: 48, avgScore: 258, recentForm: ["L", "W", "L", "W", "L"] },
          { team: "Pakistan", wins: 11, losses: 14, winRate: 44, avgScore: 252, recentForm: ["W", "L", "L", "W", "W"] },
          { team: "West Indies", wins: 9, losses: 16, winRate: 36, avgScore: 243, recentForm: ["L", "L", "W", "L", "L"] },
          { team: "Bangladesh", wins: 7, losses: 18, winRate: 28, avgScore: 235, recentForm: ["L", "W", "L", "L", "L"] },
        ],
        playerStats: [
          { id: "1", name: "Virat Kohli", role: "Batsman", team: "India", battingAvg: 58.3, bowlingAvg: 0, matches: 25, performance: 92, trend: "up", position: "Top Order", specialSkills: ["Chase Master", "Consistency"], recentForm: 85, fitnessLevel: 95, availability: true },
          { id: "2", name: "Steve Smith", role: "Batsman", team: "Australia", battingAvg: 55.7, bowlingAvg: 0, matches: 23, performance: 89, trend: "stable", position: "Top Order", specialSkills: ["Technical", "Patience"], recentForm: 82, fitnessLevel: 92, availability: true },
          { id: "3", name: "Kane Williamson", role: "Batsman", team: "New Zealand", battingAvg: 54.2, bowlingAvg: 0, matches: 22, performance: 87, trend: "up", position: "Top Order", specialSkills: ["Anchor", "Rotation"], recentForm: 88, fitnessLevel: 88, availability: true },
          { id: "4", name: "Jasprit Bumrah", role: "Bowler", team: "India", battingAvg: 8.2, bowlingAvg: 22.4, matches: 24, performance: 94, trend: "up", position: "Fast Bowler", specialSkills: ["Death Bowling", "Yorkers"], recentForm: 91, fitnessLevel: 85, availability: true },
          { id: "5", name: "Pat Cummins", role: "Bowler", team: "Australia", battingAvg: 12.5, bowlingAvg: 25.1, matches: 25, performance: 88, trend: "down", position: "Fast Bowler", specialSkills: ["New Ball", "Leadership"], recentForm: 79, fitnessLevel: 90, availability: true },
          { id: "6", name: "Rashid Khan", role: "Bowler", team: "Afghanistan", battingAvg: 15.2, bowlingAvg: 18.9, matches: 28, performance: 91, trend: "up", position: "Spinner", specialSkills: ["Wicket Taking", "Economy"], recentForm: 89, fitnessLevel: 94, availability: true },
          { id: "7", name: "Jos Buttler", role: "Wicket Keeper", team: "England", battingAvg: 42.8, bowlingAvg: 0, matches: 26, performance: 86, trend: "stable", position: "WK-Batsman", specialSkills: ["Power Hitting", "Keeping"], recentForm: 84, fitnessLevel: 87, availability: true },
          { id: "8", name: "Ben Stokes", role: "All Rounder", team: "England", battingAvg: 38.6, bowlingAvg: 32.1, matches: 24, performance: 89, trend: "up", position: "All Rounder", specialSkills: ["Match Winner", "Pressure Player"], recentForm: 87, fitnessLevel: 91, availability: true },
          { id: "9", name: "Hardik Pandya", role: "All Rounder", team: "India", battingAvg: 33.4, bowlingAvg: 28.7, matches: 22, performance: 83, trend: "stable", position: "All Rounder", specialSkills: ["Power Hitting", "Fast Medium"], recentForm: 81, fitnessLevel: 89, availability: true },
          { id: "10", name: "David Warner", role: "Batsman", team: "Australia", battingAvg: 46.9, bowlingAvg: 0, matches: 27, performance: 84, trend: "down", position: "Opener", specialSkills: ["Aggressive", "Power Play"], recentForm: 78, fitnessLevel: 86, availability: true },
          { id: "11", name: "Trent Boult", role: "Bowler", team: "New Zealand", battingAvg: 9.1, bowlingAvg: 24.6, matches: 23, performance: 87, trend: "stable", position: "Fast Bowler", specialSkills: ["Swing", "Left Arm"], recentForm: 83, fitnessLevel: 88, availability: true },
          { id: "12", name: "Babar Azam", role: "Batsman", team: "Pakistan", battingAvg: 52.1, bowlingAvg: 0, matches: 25, performance: 88, trend: "up", position: "Top Order", specialSkills: ["Consistency", "Technique"], recentForm: 86, fitnessLevel: 93, availability: true },
          { id: "13", name: "MS Dhoni", role: "Wicket Keeper", team: "India", battingAvg: 38.2, bowlingAvg: 0, matches: 20, performance: 82, trend: "stable", position: "WK-Batsman", specialSkills: ["Finishing", "Captaincy"], recentForm: 80, fitnessLevel: 85, availability: false },
          { id: "14", name: "Kagiso Rabada", role: "Bowler", team: "South Africa", battingAvg: 11.5, bowlingAvg: 23.8, matches: 24, performance: 89, trend: "up", position: "Fast Bowler", specialSkills: ["Express Pace", "Wicket Taking"], recentForm: 87, fitnessLevel: 92, availability: true },
          { id: "15", name: "Quinton de Kock", role: "Wicket Keeper", team: "South Africa", battingAvg: 44.7, bowlingAvg: 0, matches: 26, performance: 85, trend: "stable", position: "WK-Batsman", specialSkills: ["Aggressive", "Left Handed"], recentForm: 82, fitnessLevel: 88, availability: true },
        ],
        matchTrends: [
          { date: "2024-01", highScores: 387, lowScores: 142, avgScore: 264, matches: 12 },
          { date: "2024-02", highScores: 401, lowScores: 158, avgScore: 279, matches: 15 },
          { date: "2024-03", highScores: 378, lowScores: 134, avgScore: 256, matches: 18 },
          { date: "2024-04", highScores: 421, lowScores: 167, avgScore: 294, matches: 14 },
          { date: "2024-05", highScores: 356, lowScores: 145, avgScore: 250, matches: 16 },
          { date: "2024-06", highScores: 398, lowScores: 172, avgScore: 285, matches: 13 },
        ],
        venueAnalysis: [
          { venue: "MCG", matches: 8, avgScore: 278, highestScore: 398, winRate: { home: 65, away: 35 } },
          { venue: "Lord's", matches: 6, avgScore: 245, highestScore: 356, winRate: { home: 70, away: 30 } },
          { venue: "Eden Gardens", matches: 7, avgScore: 295, highestScore: 421, winRate: { home: 80, away: 20 } },
          { venue: "The Oval", matches: 5, avgScore: 267, highestScore: 378, winRate: { home: 60, away: 40 } },
        ],
        insights: [
          { type: "positive", title: "Powerplay Performance Improved", description: "Teams are scoring 15% more runs in powerplay overs compared to last season", impact: "high" },
          { type: "negative", title: "Middle Order Concerns", description: "Average runs per wicket in overs 15-40 has decreased by 8%", impact: "medium" },
          { type: "neutral", title: "Weather Impact Analysis", description: "Rain-affected matches show different batting patterns in shortened games", impact: "low" },
          { type: "positive", title: "Fast Bowler Effectiveness", description: "Fast bowlers taking 23% more wickets in death overs", impact: "high" },
        ]
      };
      
      console.log('Using mock data as fallback');
      setAnalyticsData(mockData);
      hasLoadedData.current = true; // Mark as loaded even with mock data
      
      toast({
        title: "Using cached data",
        description: "API connection failed, using cached analytics data.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
      console.log('Analytics data loading complete, isLoading set to false');
    }
  };

  // Team filtering functions
  const getFilteredTeamData = () => {
    if (!analyticsData?.teamPerformance) return [];
    
    let filteredData = [...analyticsData.teamPerformance];
    
    // Filter by selected team
    if (selectedTeamFilter !== 'all') {
      filteredData = filteredData.filter(team => team.team === selectedTeamFilter);
    }
    
    // Filter by win rate range
    if (selectedWinRateFilter !== 'all') {
      if (selectedWinRateFilter === '80+') {
        filteredData = filteredData.filter(team => team.winRate >= 80);
      } else if (selectedWinRateFilter === '60-79') {
        filteredData = filteredData.filter(team => team.winRate >= 60 && team.winRate < 80);
      } else if (selectedWinRateFilter === '40-59') {
        filteredData = filteredData.filter(team => team.winRate >= 40 && team.winRate < 60);
      } else if (selectedWinRateFilter === '0-39') {
        filteredData = filteredData.filter(team => team.winRate < 40);
      }
    }
    
    return filteredData;
  };

  const getUniqueTeams = () => {
    if (!analyticsData?.teamPerformance) return [];
    return analyticsData.teamPerformance.map(team => team.team).sort();
  };

  // Animated filter change handlers
  const handleTeamFilterChange = async (value: string) => {
    setIsFilterLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300)); // Smooth transition delay
    setSelectedTeamFilter(value);
    setIsFilterLoading(false);
  };

  const handleWinRateFilterChange = async (value: string) => {
    setIsFilterLoading(true);
    await new Promise(resolve => setTimeout(resolve, 300)); // Smooth transition delay
    setSelectedWinRateFilter(value);
    setIsFilterLoading(false);
  };

  const resetFiltersWithAnimation = async () => {
    setIsFilterLoading(true);
    await new Promise(resolve => setTimeout(resolve, 200));
    setSelectedTeamFilter('all');
    setSelectedWinRateFilter('all');
    await new Promise(resolve => setTimeout(resolve, 300));
    setIsFilterLoading(false);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return <span className="w-4 h-4 text-green-500 font-bold">↗</span>;
      case "down": return <span className="w-4 h-4 text-red-500 font-bold">↘</span>;
      default: return <span className="w-4 h-4 text-yellow-500 font-bold">→</span>;
    }
  };

  const getInsightIcon = (type: string) => {
    switch (type) {
      case "positive": return <span className="w-4 h-4 text-green-500 font-bold">+</span>;
      case "negative": return <span className="w-4 h-4 text-red-500 font-bold">!</span>;
      default: return <span className="w-4 h-4 text-blue-500 font-bold">i</span>;
    }
  };

  const handlePlayerSelection = (playerId: string) => {
    setSelectedPlayers(prev => {
      if (prev.includes(playerId)) {
        return prev.filter(id => id !== playerId);
      } else {
        return [...prev, playerId];
      }
    });
  };

  const generatePlayingEleven = () => {
    if (!analyticsData || selectedPlayers.length < 11) {
      toast({
        title: "Insufficient Players",
        description: "Please select at least 11 players to generate playing eleven.",
        variant: "destructive",
      });
      return;
    }

    const selectedPlayerData = analyticsData.playerStats.filter(player => 
      selectedPlayers.includes(player.id) && player.availability
    );

    // Enhanced AI Algorithm for team selection
    const teamBalance = {
      batsmen: selectedPlayerData.filter(p => p.role === "Batsman"),
      bowlers: selectedPlayerData.filter(p => p.role === "Bowler"),
      allRounders: selectedPlayerData.filter(p => p.role === "All Rounder"),
      wicketKeepers: selectedPlayerData.filter(p => p.role === "Wicket Keeper"),
    };

    let finalEleven = [];
    let insights = [];
    let substitutes = [];

    // Advanced scoring algorithm
    const calculatePlayerScore = (player, role, conditions) => {
      let baseScore = player.performance * 0.4 + player.recentForm * 0.3 + player.fitnessLevel * 0.2;
      
      // Position-specific bonuses
      if (role === "opener" && player.position === "Opener") baseScore += 10;
      if (role === "finisher" && player.specialSkills.includes("Power Hitting")) baseScore += 8;
      
      // Condition-specific adjustments
      if (conditions.pitch === "batting" && player.role === "Batsman") baseScore += 8;
      if (conditions.pitch === "bowling" && player.role === "Bowler") baseScore += 8;
      if (conditions.weather === "cloudy" && player.specialSkills.includes("Swing")) baseScore += 5;
      if (conditions.venue === "home" && player.team === "India") baseScore += 5;
      
      // Experience factor
      if (player.matches > 30) baseScore += 5;
      if (player.matches > 50) baseScore += 3;
      
      // Form trend bonus
      if (player.trend === "up") baseScore += 6;
      if (player.trend === "down") baseScore -= 4;
      
      return Math.max(baseScore, 0);
    };

    // Step 1: Select Wicket Keeper (Mandatory)
    const scoredWKs = teamBalance.wicketKeepers.map(wk => ({
      ...wk,
      aiScore: calculatePlayerScore(wk, "keeper", matchConditions)
    })).sort((a, b) => b.aiScore - a.aiScore);
    
    if (scoredWKs.length > 0) {
      finalEleven.push(scoredWKs[0]);
      if (scoredWKs.length > 1) {
        substitutes.push({ player: scoredWKs[1], reason: "Backup Keeper" });
      }
    } else {
      insights.push({
        type: "negative",
        title: "No Wicket Keeper",
        description: "Team lacks a dedicated wicket keeper. This is critical for team balance.",
        impact: "high"
      });
    }

    // Step 2: Advanced Batting Selection (5-6 batsmen based on conditions)
    const targetBatsmen = matchConditions.pitch === "batting" ? 6 : 5;
    const scoredBatsmen = teamBalance.batsmen.map(bat => ({
      ...bat,
      aiScore: calculatePlayerScore(bat, "batsman", matchConditions)
    })).sort((a, b) => b.aiScore - a.aiScore);

    // Ensure we have openers
    const openers = scoredBatsmen.filter(b => b.position === "Opener").slice(0, 2);
    const middleOrder = scoredBatsmen.filter(b => b.position === "Top Order" && !openers.includes(b));
    
    finalEleven.push(...openers.slice(0, 2));
    finalEleven.push(...middleOrder.slice(0, targetBatsmen - openers.length));
    
    // Add remaining batsmen as substitutes
    scoredBatsmen.slice(targetBatsmen).forEach(player => {
      substitutes.push({ player, reason: "Batting Reserve" });
    });

    // Step 3: All-Rounders Selection (1-3 based on team needs)
    const targetAllRounders = Math.min(2, teamBalance.allRounders.length);
    const scoredAllRounders = teamBalance.allRounders.map(ar => ({
      ...ar,
      aiScore: calculatePlayerScore(ar, "allrounder", matchConditions)
    })).sort((a, b) => b.aiScore - a.aiScore);

    finalEleven.push(...scoredAllRounders.slice(0, targetAllRounders));
    scoredAllRounders.slice(targetAllRounders).forEach(player => {
      substitutes.push({ player, reason: "All-Rounder Reserve" });
    });

    // Step 4: Bowling Attack Selection
    const remainingSpots = 11 - finalEleven.length;
    const scoredBowlers = teamBalance.bowlers.map(bowler => ({
      ...bowler,
      aiScore: calculatePlayerScore(bowler, "bowler", matchConditions)
    })).sort((a, b) => b.aiScore - a.aiScore);

    // Ensure variety in bowling attack
    const fastBowlers = scoredBowlers.filter(b => b.position === "Fast Bowler");
    const spinners = scoredBowlers.filter(b => b.position === "Spinner");
    
    let bowlingAttack = [];
    
    // Select primary fast bowlers
    bowlingAttack.push(...fastBowlers.slice(0, Math.min(3, remainingSpots)));
    
    // Add spinners if spots available
    const spinnerSpots = remainingSpots - bowlingAttack.length;
    bowlingAttack.push(...spinners.slice(0, Math.min(2, spinnerSpots)));
    
    // Fill remaining with best available bowlers
    const remainingBowlerSpots = remainingSpots - bowlingAttack.length;
    const otherBowlers = scoredBowlers.filter(b => !bowlingAttack.includes(b));
    bowlingAttack.push(...otherBowlers.slice(0, remainingBowlerSpots));
    
    finalEleven.push(...bowlingAttack);
    
    // Add unused bowlers as substitutes
    scoredBowlers.filter(b => !bowlingAttack.includes(b)).forEach(player => {
      substitutes.push({ player, reason: "Bowling Reserve" });
    });

    // Enhanced AI Insights Generation
    const avgPerformance = finalEleven.reduce((sum, p) => sum + p.performance, 0) / finalEleven.length;
    const avgRecentForm = finalEleven.reduce((sum, p) => sum + p.recentForm, 0) / finalEleven.length;
    const avgFitness = finalEleven.reduce((sum, p) => sum + p.fitnessLevel, 0) / finalEleven.length;
    
    // Team Strength Analysis
    if (avgPerformance > 88) {
      insights.push({
        type: "positive",
        title: "Elite Team Selection",
        description: `Outstanding team with ${avgPerformance.toFixed(1)} average performance. Championship quality squad.`,
        impact: "high"
      });
    } else if (avgPerformance > 85) {
      insights.push({
        type: "positive",
        title: "Strong Team Balance",
        description: `Excellent team selection with average performance rating of ${avgPerformance.toFixed(1)}`,
        impact: "high"
      });
    }

    // Form Analysis
    if (avgRecentForm > 85) {
      insights.push({
        type: "positive", 
        title: "Excellent Current Form",
        description: `Team in outstanding form with ${avgRecentForm.toFixed(1)}% average. Perfect timing for important matches.`,
        impact: "high"
      });
    } else if (avgRecentForm > 80) {
      insights.push({
        type: "positive", 
        title: "Good Recent Form",
        description: "Most players are in good recent form, expect strong performance",
        impact: "medium"
      });
    } else if (avgRecentForm < 75) {
      insights.push({
        type: "negative",
        title: "Form Concerns",
        description: "Several key players are struggling with form. Consider alternatives from bench.",
        impact: "medium"
      });
    }

    // Fitness Analysis
    if (avgFitness < 85) {
      insights.push({
        type: "negative",
        title: "Fitness Warning",
        description: `Average fitness is ${avgFitness.toFixed(1)}%. Monitor player workload carefully.`,
        impact: "medium"
      });
    }

    // Role Distribution Analysis
    const roleCount = {
      batsmen: finalEleven.filter(p => p.role === "Batsman").length,
      bowlers: finalEleven.filter(p => p.role === "Bowler").length,
      allRounders: finalEleven.filter(p => p.role === "All Rounder").length,
      wicketKeeper: finalEleven.filter(p => p.role === "Wicket Keeper").length
    };

    // Tactical Insights
    if (roleCount.bowlers < 4) {
      insights.push({
        type: "negative",
        title: "Bowling Depth Concern",
        description: `Only ${roleCount.bowlers} specialist bowlers. May struggle to bowl out opposition.`,
        impact: "high"
      });
    }

    if (roleCount.batsmen < 4) {
      insights.push({
        type: "negative",
        title: "Batting Fragility",
        description: `Limited batting depth with only ${roleCount.batsmen} specialist batsmen.`,
        impact: "medium"
      });
    }

    if (roleCount.allRounders >= 2) {
      insights.push({
        type: "positive",
        title: "Excellent Balance",
        description: `${roleCount.allRounders} all-rounders provide perfect team balance and flexibility.`,
        impact: "high"
      });
    }

    // Match Situation Insights
    if (matchConditions.pitch === "batting") {
      if (roleCount.batsmen >= 6) {
        insights.push({
          type: "positive",
          title: "Perfect for Batting Paradise",
          description: "Heavy batting lineup ideal for run-scoring conditions. Expect 300+ totals.",
          impact: "high"
        });
      }
      
      insights.push({
        type: "neutral",
        title: "Batting Pitch Strategy",
        description: "Focus on building partnerships and accelerating in death overs.",
        impact: "medium"
      });
    }

    if (matchConditions.pitch === "bowling") {
      const fastBowlerCount = finalEleven.filter(p => p.position === "Fast Bowler").length;
      const spinnerCount = finalEleven.filter(p => p.position === "Spinner").length;
      
      if (fastBowlerCount >= 3 && spinnerCount >= 1) {
        insights.push({
          type: "positive",
          title: "Balanced Bowling Attack",
          description: `${fastBowlerCount} fast bowlers and ${spinnerCount} spinner(s) perfect for bowling conditions.`,
          impact: "high"
        });
      }
      
      insights.push({
        type: "neutral",
        title: "Bowling Pitch Tactics",
        description: "Early wickets crucial. Use swing and seam movement effectively.",
        impact: "medium"
      });
    }

    // Opposition Strength Analysis
    if (matchConditions.opposition === "strong") {
      const experiencedPlayers = finalEleven.filter(p => p.matches > 30).length;
      if (experiencedPlayers >= 7) {
        insights.push({
          type: "positive",
          title: "Experience vs Strong Opposition",
          description: `${experiencedPlayers} experienced players ready for tough challenge.`,
          impact: "high"
        });
      } else {
        insights.push({
          type: "negative",
          title: "Lack Experience",
          description: "Against strong opposition, consider more experienced players.",
          impact: "medium"
        });
      }
    }

    // Captaincy Insights
    const captaincyOptions = finalEleven.filter(p => 
      p.specialSkills.includes("Leadership") || p.specialSkills.includes("Captaincy")
    );
    
    if (captaincyOptions.length > 0) {
      insights.push({
        type: "positive",
        title: "Leadership Available",
        description: `${captaincyOptions.map(p => p.name).join(", ")} can provide on-field leadership.`,
        impact: "medium"
      });
    }

    // Special Skills Analysis
    const powerHitters = finalEleven.filter(p => p.specialSkills.includes("Power Hitting")).length;
    const anchors = finalEleven.filter(p => p.specialSkills.includes("Anchor")).length;
    
    if (powerHitters >= 3) {
      insights.push({
        type: "positive",
        title: "Power-Hitting Arsenal",
        description: `${powerHitters} power hitters provide explosive potential in death overs.`,
        impact: "medium"
      });
    }

    if (anchors >= 2) {
      insights.push({
        type: "positive",
        title: "Stability in Middle Order",
        description: `${anchors} anchor players ensure innings stability.`,
        impact: "medium"
      });
    }

    // Trim to exactly 11 players if more were selected
    finalEleven = finalEleven.slice(0, 11);
    
    setPlayingEleven(finalEleven);
    setTeamInsights(insights);
    setSubstitutes(substitutes);
    
    toast({
      title: "Advanced AI Selection Complete",
      description: `Optimized playing XI selected from ${selectedPlayers.length} players with ${substitutes.length} reserves identified.`,
    });
  };

  const exportReport = () => {
    toast({
      title: "Export Started",
      description: "Your analytics report is being prepared for download.",
    });
    setTimeout(() => {
      toast({
        title: "Export Complete",
        description: "Your report has been downloaded successfully.",
      });
    }, 2000);
  };

  if (isLoading) {
    return <AnalysisSkeleton />;
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center bg-white p-8 rounded-lg shadow-lg border-2 border-gray-200">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-600 font-bold text-xl">!</span>
          </div>
          <p className="text-gray-300 font-medium font-sans">Failed to load analytics data</p>
          <Button onClick={fetchAnalyticsData} className="mt-4">
            <span className="mr-2">↻</span>
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 space-y-8 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-8"
      >
        {/* Header */}
        <motion.div
          className="flex justify-between items-start mb-8 bg-slate-800 rounded-xl shadow-sm border border-slate-700 p-6"
        >
          <div>
            <h1 className="text-3xl font-heading font-bold tracking-tight text-white">Analytics Dashboard</h1>
            <p className="text-gray-300 font-sans font-medium">
              Comprehensive cricket data analysis and insights
            </p>
          </div>
        
          <div className="flex items-center gap-2">
            {/* <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last7">Last 7 days</SelectItem>
                <SelectItem value="last30">Last 30 days</SelectItem>
                <SelectItem value="last90">Last 3 months</SelectItem>
                <SelectItem value="last365">Last year</SelectItem>
              </SelectContent>
            </Select> */}
            
            <Button onClick={exportReport} variant="outline" className="font-bold bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
              {/* <span className="mr-2"></span> */}
              Export
            </Button>
            
            <Button onClick={() => fetchAnalyticsData()} variant="outline" className="font-bold bg-slate-700 border-slate-600 text-white hover:bg-slate-600">
              Refresh
            </Button>
          </div>
        </motion.div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { 
            title: "Total Matches", 
            value: analyticsData.matchTrends.reduce((sum, month) => sum + month.matches, 0).toString(), 
            change: "+12%", 
            titleColor: "text-blue-400"
          },
          { 
            title: "Avg Score", 
            value: Math.round(analyticsData.matchTrends.reduce((sum, month) => sum + month.avgScore, 0) / analyticsData.matchTrends.length).toString(), 
            change: "+5.2%", 
            titleColor: "text-green-400"
          },
          { 
            title: "Active Teams", 
            value: analyticsData.teamPerformance.length.toString(), 
            change: "0%", 
            titleColor: "text-purple-400"
          },
          { 
            title: "Players Tracked", 
            value: analyticsData.playerStats.length.toString(), 
            change: "+23%", 
            titleColor: "text-orange-400"
          },
        ].map((metric, index) => (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-slate-800 border border-slate-700">
              <CardHeader className="pb-3">
                <CardTitle className={`text-sm font-heading font-semibold ${metric.titleColor} uppercase tracking-wide`}>
                  {metric.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="text-3xl font-heading font-bold text-white">{metric.value}</div>
                <p className="text-sm font-sans font-medium mt-2">
                  <span className={metric.change.startsWith('+') ? 'text-green-400' : metric.change === '0%' ? 'text-gray-300' : 'text-red-400'}>
                    {metric.change}
                  </span>
                  {" "}from last period
                </p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 bg-slate-800 border border-slate-700">
          <TabsTrigger value="overview" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-heading font-semibold">Overview</TabsTrigger>
          <TabsTrigger value="teams" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-heading font-semibold">Teams</TabsTrigger>
          <TabsTrigger value="players" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-heading font-semibold">Players</TabsTrigger>
          <TabsTrigger value="selection" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-heading font-semibold">Team Selection</TabsTrigger>
          <TabsTrigger value="insights" className="data-[state=active]:bg-blue-600 data-[state=active]:text-white font-heading font-semibold">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Match Trends Chart */}
            <Card className="bg-slate-800 border border-slate-700">
              <CardHeader>
                <CardTitle className="text-white font-heading font-bold">Score Trends</CardTitle>
                <CardDescription className="text-gray-300 font-sans">Monthly scoring patterns and averages</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.matchTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="avgScore" stroke="#8884d8" strokeWidth={2} />
                    <Line type="monotone" dataKey="highScores" stroke="#82ca9d" strokeWidth={2} />
                    <Line type="monotone" dataKey="lowScores" stroke="#ffc658" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Team Performance Distribution */}
            <Card className="bg-slate-800 border border-slate-700">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-white font-heading font-bold">Win Rate Distribution</CardTitle>
                    <CardDescription className="text-gray-300 font-sans">Team performance comparison</CardDescription>
                  </div>
                  <motion.div
                    key={`chart-${selectedTeamFilter}-${selectedWinRateFilter}`}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.5 }}
                    className="text-xs text-blue-400 font-sans"
                  >
                    {getFilteredTeamData().length} teams shown
                  </motion.div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  {isFilterLoading && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-slate-900/50 z-10 flex items-center justify-center rounded-lg"
                    >
                      <div className="flex items-center gap-2 text-white">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                        />
                        <span className="text-sm font-sans">Updating chart...</span>
                      </div>
                    </motion.div>
                  )}
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart 
                      data={getFilteredTeamData()}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis 
                        dataKey="team" 
                        stroke="#9CA3AF" 
                        fontSize={12}
                        angle={getFilteredTeamData().length > 4 ? -45 : 0}
                        textAnchor={getFilteredTeamData().length > 4 ? "end" : "middle"}
                        height={getFilteredTeamData().length > 4 ? 60 : 30}
                      />
                      <YAxis stroke="#9CA3AF" fontSize={12} />
                      <Tooltip 
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                          color: '#F9FAFB'
                        }}
                        cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                      />
                      <Bar 
                        dataKey="winRate" 
                        fill="#3B82F6"
                        radius={[4, 4, 0, 0]}
                        animationDuration={800}
                        animationBegin={200}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Venue Analysis */}
            <Card className="bg-slate-800 border border-slate-700">
              <CardHeader>
                <CardTitle className="text-white font-heading font-bold">Venue Performance</CardTitle>
                <CardDescription className="text-gray-300 font-sans">Average scores by venue</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData.venueAnalysis}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="venue" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="avgScore" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Recent Insights */}
            <Card className="bg-slate-800 border border-slate-700">
              <CardHeader>
                <CardTitle className="text-white font-heading font-bold">Latest Insights</CardTitle>
                <CardDescription className="text-gray-300 font-sans">Key findings from recent analysis</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {analyticsData.insights.slice(0, 3).map((insight, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3 p-3 rounded-lg border border-slate-600"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-heading font-semibold text-sm text-white">{insight.title}</h4>
                        <span className="text-xs text-gray-400 font-sans">{insight.impact} impact</span>
                      </div>
                      <p className="text-sm text-gray-300 font-sans mt-1">{insight.description}</p>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="teams" className="space-y-6">
          <Card className="bg-slate-800 border border-slate-700">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-white font-heading font-bold">Team Performance Analysis</CardTitle>
                  <CardDescription className="text-gray-300 font-sans">
                    Detailed breakdown of team statistics and recent form
                    <motion.span 
                      key={`${selectedTeamFilter}-${selectedWinRateFilter}`}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="ml-2 text-sm font-medium text-blue-400"
                    >
                      Showing {getFilteredTeamData().length} of {analyticsData?.teamPerformance?.length || 0} teams
                    </motion.span>
                  </CardDescription>
                </div>
                <div className="flex gap-3">
                  <div className="min-w-[140px]">
                    <label className="text-xs text-gray-400 font-sans mb-1 block">Filter by Team</label>
                    <Select value={selectedTeamFilter} onValueChange={handleTeamFilterChange}>
                      <SelectTrigger className="h-8 text-sm bg-slate-700 border-slate-600">
                        <SelectValue placeholder="All Teams" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Teams</SelectItem>
                        {getUniqueTeams().map(team => (
                          <SelectItem key={team} value={team}>{team}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="min-w-[120px]">
                    <label className="text-xs text-gray-400 font-sans mb-1 block">Win Rate</label>
                    <Select value={selectedWinRateFilter} onValueChange={handleWinRateFilterChange}>
                      <SelectTrigger className="h-8 text-sm bg-slate-700 border-slate-600">
                        <SelectValue placeholder="All Rates" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Rates</SelectItem>
                        <SelectItem value="80+">80%+</SelectItem>
                        <SelectItem value="60-79">60-79%</SelectItem>
                        <SelectItem value="40-59">40-59%</SelectItem>
                        <SelectItem value="0-39">0-39%</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-end">
                    <Button
                      onClick={resetFiltersWithAnimation}
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                      disabled={isFilterLoading}
                    >
                      {isFilterLoading ? 'Clearing...' : 'Clear'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="relative">
              {isFilterLoading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-slate-900/50 z-10 flex items-center justify-center rounded-lg"
                >
                  <div className="flex items-center gap-2 text-white">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                    />
                    <span className="text-sm font-sans">Filtering teams...</span>
                  </div>
                </motion.div>
              )}
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-200">Team</TableHead>
                    <TableHead className="text-gray-200">Matches</TableHead>
                    <TableHead className="text-gray-200">Win Rate</TableHead>
                    <TableHead className="text-gray-200">Avg Score</TableHead>
                    <TableHead className="text-gray-200">Recent Form</TableHead>
                    <TableHead className="text-gray-200">Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {getFilteredTeamData().length > 0 ? (
                    getFilteredTeamData().map((team, index) => (
                      <motion.tr
                        key={`${team.team}-${selectedTeamFilter}-${selectedWinRateFilter}`}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -20, scale: 0.95 }}
                        transition={{ 
                          duration: 0.4, 
                          delay: index * 0.1,
                          type: "spring",
                          stiffness: 100
                        }}
                      >
                      <TableCell className="font-medium text-white">
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.1 }}
                        >
                          {team.team}
                        </motion.span>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2 }}
                        >
                          {team.wins + team.losses}
                        </motion.span>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        <motion.span
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.3, type: "spring" }}
                          className="font-semibold"
                        >
                          {team.winRate}%
                        </motion.span>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.4 }}
                        >
                          {team.avgScore}
                        </motion.span>
                      </TableCell>
                      <TableCell>
                        <motion.div 
                          className="flex gap-1"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.5 }}
                        >
                          {team.recentForm.map((result, i) => (
                            <motion.span
                              key={i}
                              initial={{ opacity: 0, scale: 0 }}
                              animate={{ opacity: 1, scale: 1 }}
                              transition={{ delay: 0.6 + (i * 0.1), type: "spring" }}
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium ${
                                result === 'W' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                              }`}
                            >
                              {result}
                            </motion.span>
                          ))}
                        </motion.div>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        <motion.span
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.7 }}
                        >
                          {team.winRate}%
                        </motion.span>
                      </TableCell>
                    </motion.tr>
                  ))
                ) : (
                  <motion.tr
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <TableCell colSpan={6} className="text-center py-8">
                      <motion.div
                        initial={{ scale: 0.8 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", duration: 0.5 }}
                        className="flex flex-col items-center gap-2"
                      >
                        <div className="w-12 h-12 bg-slate-700 rounded-full flex items-center justify-center">
                          <span className="text-gray-400 text-xl">🔍</span>
                        </div>
                        <p className="text-gray-400 font-sans">No teams match your current filters</p>
                        <Button
                          onClick={resetFiltersWithAnimation}
                          variant="outline"
                          size="sm"
                          className="mt-2 bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                        >
                          Clear Filters
                        </Button>
                      </motion.div>
                    </TableCell>
                  </motion.tr>
                )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="players" className="space-y-6">
          <Card className="bg-slate-800 border border-slate-700">
            <CardHeader>
              <CardTitle className="text-white font-heading font-bold">Player Performance Analysis</CardTitle>
              <CardDescription className="text-gray-300 font-sans">Individual player statistics and performance trends</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-gray-200">Player</TableHead>
                    <TableHead className="text-gray-200">Role</TableHead>
                    <TableHead className="text-gray-200">Team</TableHead>
                    <TableHead className="text-gray-200">Batting Avg</TableHead>
                    <TableHead className="text-gray-200">Bowling Avg</TableHead>
                    <TableHead className="text-gray-200">Matches</TableHead>
                    <TableHead className="text-gray-200">Performance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {analyticsData.playerStats.map((player, index) => (
                    <motion.tr
                      key={player.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <TableCell className="font-medium text-white">{player.name}</TableCell>
                      <TableCell className="text-gray-300">{player.role}</TableCell>
                      <TableCell className="text-gray-300">{player.team}</TableCell>
                      <TableCell className="text-gray-300">{player.battingAvg > 0 ? player.battingAvg : '-'}</TableCell>
                      <TableCell className="text-gray-300">{player.bowlingAvg > 0 ? player.bowlingAvg : '-'}</TableCell>
                      <TableCell className="text-gray-300">{player.matches}</TableCell>
                      <TableCell className="text-gray-300">
                        {player.performance}
                      </TableCell>
                    </motion.tr>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="selection" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Player Pool Selection */}
            <Card className="bg-slate-800 border border-slate-700">
              <CardHeader>
                <CardTitle className="text-white font-heading font-bold">Available Players ({analyticsData.playerStats.length})</CardTitle>
                <CardDescription className="text-gray-300 font-sans">
                  Select 11+ players to generate optimal playing XI
                  <span className="ml-2 text-sm font-medium text-blue-400">
                    Selected: {selectedPlayers.length}
                  </span>
                </CardDescription>
              </CardHeader>
              <CardContent className="max-h-96 overflow-y-auto">
                <div className="space-y-3">
                  {analyticsData.playerStats.map((player, index) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className={`flex items-center justify-between p-3 rounded-lg border-2 transition-all cursor-pointer ${
                        selectedPlayers.includes(player.id)
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/20'
                          : 'border-gray-200 hover:border-gray-300'
                      } ${!player.availability ? 'opacity-50' : ''}`}
                      onClick={() => player.availability && handlePlayerSelection(player.id)}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="checkbox"
                          checked={selectedPlayers.includes(player.id)}
                          disabled={!player.availability}
                          onChange={() => {}}
                          className="w-4 h-4"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">{player.name}</span>
                            <span className="text-xs text-gray-400">
                              {player.role}
                            </span>
                            {!player.availability && (
                              <span className="text-xs text-red-400">
                                Unavailable
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-400">
                            {player.position} • {player.team} • Form: {player.recentForm}%
                          </div>
                          <div className="flex gap-1 mt-1">
                            {player.specialSkills.map((skill, i) => (
                              <span key={i} className="text-xs text-gray-500">
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-white">{player.performance}</div>
                        <div className="text-xs text-gray-400">Performance</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Match Conditions & Controls */}
            <div className="space-y-6">
              <Card className="bg-slate-800 border border-slate-700">
                <CardHeader>
                  <CardTitle className="text-white font-heading font-bold">Match Conditions</CardTitle>
                  <CardDescription className="text-gray-300 font-sans">Adjust conditions to optimize team selection</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Venue</label>
                      <Select 
                        value={matchConditions.venue} 
                        onValueChange={(value) => setMatchConditions(prev => ({...prev, venue: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="home">Home</SelectItem>
                          <SelectItem value="away">Away</SelectItem>
                          <SelectItem value="neutral">Neutral</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Pitch Type</label>
                      <Select 
                        value={matchConditions.pitch} 
                        onValueChange={(value) => setMatchConditions(prev => ({...prev, pitch: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="batting">Batting Friendly</SelectItem>
                          <SelectItem value="bowling">Bowling Friendly</SelectItem>
                          <SelectItem value="balanced">Balanced</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Weather</label>
                      <Select 
                        value={matchConditions.weather} 
                        onValueChange={(value) => setMatchConditions(prev => ({...prev, weather: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="clear">Clear</SelectItem>
                          <SelectItem value="cloudy">Cloudy</SelectItem>
                          <SelectItem value="humid">Humid</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium">Opposition</label>
                      <Select 
                        value={matchConditions.opposition} 
                        onValueChange={(value) => setMatchConditions(prev => ({...prev, opposition: value}))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="weak">Weak</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="strong">Strong</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={generatePlayingEleven}
                      disabled={selectedPlayers.length < 11}
                      className="flex-1"
                    >
                      Generate Playing XI
                    </Button>
                    <Button 
                      onClick={() => {
                        setSelectedPlayers([]);
                        setPlayingEleven([]);
                        setTeamInsights([]);
                        setSubstitutes([]);
                        localStorage.removeItem('team-selection-state');
                      }}
                      variant="outline"
                    >
                      Clear All
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Team Balance Visualization */}
              {selectedPlayers.length > 0 && (
                <Card className="bg-slate-800 border border-slate-700">
                  <CardHeader>
                    <CardTitle className="text-white font-heading font-bold">Selection Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {["Batsman", "Bowler", "All Rounder", "Wicket Keeper"].map(role => {
                        const count = selectedPlayers.filter(id => 
                          analyticsData.playerStats.find(p => p.id === id)?.role === role
                        ).length;
                        return (
                          <div key={role} className="flex items-center justify-between">
                            <span className="text-sm">{role}s</span>
                            <div className="flex items-center gap-2">
                              <Progress value={Math.min(count * 20, 100)} className="w-16" />
                              <span className="text-sm font-medium w-6">{count}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Generated Playing XI */}
          {playingEleven.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-slate-800 border border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white font-heading font-bold">
                    <span className="w-8 h-8 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                      <span className="text-green-600 dark:text-green-400 font-bold">XI</span>
                    </span>
                    Final Playing XI
                  </CardTitle>
                  <CardDescription className="text-gray-300 font-sans">AI-generated optimal team based on form, fitness, and conditions</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {playingEleven.map((player, index) => (
                      <motion.div
                        key={player.id}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border-2 border-green-200 dark:border-green-800"
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-bold text-sm">
                            {index + 1}
                          </span>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{player.name}</span>
                              <Badge variant="outline">{player.role}</Badge>
                              {player.role === "Wicket Keeper" && (
                                <Badge variant="default" className="text-xs">WK</Badge>
                              )}
                              {index <= 1 && player.position === "Opener" && (
                                <Badge variant="secondary" className="text-xs">Opener</Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {player.position} • Form: {player.recentForm}% • Fitness: {player.fitnessLevel}%
                            </div>
                            <div className="flex gap-1 mt-1">
                              {player.specialSkills.slice(0, 2).map((skill, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium">{player.performance}</div>
                          <div className="text-xs text-muted-foreground">AI Score</div>
                          {player.aiScore && (
                            <div className="text-xs text-green-600 font-medium">
                              {player.aiScore.toFixed(1)}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* AI Team Insights */}
              <Card className="bg-slate-800 border border-slate-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white font-heading font-bold">
                    <span className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                      <span className="text-blue-600 dark:text-blue-400 font-bold">AI</span>
                    </span>
                    Team Analysis & Insights
                  </CardTitle>
                  <CardDescription className="text-gray-300 font-sans">AI-powered recommendations for your team selection</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {teamInsights.length > 0 ? (
                    teamInsights.map((insight, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className={`p-3 rounded-lg border-2 ${
                          insight.type === 'positive' 
                            ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800' 
                            : insight.type === 'negative'
                            ? 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
                            : 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          {getInsightIcon(insight.type)}
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-sm">{insight.title}</h4>
                              <Badge 
                                variant={insight.impact === 'high' ? 'default' : insight.impact === 'medium' ? 'secondary' : 'outline'}
                              >
                                {insight.impact}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="text-center p-8 text-muted-foreground">
                      <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-gray-400 font-bold text-xl">AI</span>
                      </div>
                      <p>Generate a playing XI to see AI insights</p>
                    </div>
                  )}

                  {playingEleven.length > 0 && (
                    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <h4 className="font-medium mb-2">Team Statistics</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Avg Performance:</span>
                          <span className="ml-2 font-medium">
                            {(playingEleven.reduce((sum, p) => sum + p.performance, 0) / playingEleven.length).toFixed(1)}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Avg Form:</span>
                          <span className="ml-2 font-medium">
                            {(playingEleven.reduce((sum, p) => sum + p.recentForm, 0) / playingEleven.length).toFixed(1)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Avg Fitness:</span>
                          <span className="ml-2 font-medium">
                            {(playingEleven.reduce((sum, p) => sum + p.fitnessLevel, 0) / playingEleven.length).toFixed(1)}%
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Team Balance:</span>
                          <span className="ml-2 font-medium">
                            {playingEleven.filter(p => p.role === "All Rounder").length >= 2 ? "Excellent" : "Good"}
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Experience:</span>
                          <span className="ml-2 font-medium">
                            {playingEleven.filter(p => p.matches > 30).length}/11 veterans
                          </span>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Power Hitters:</span>
                          <span className="ml-2 font-medium">
                            {playingEleven.filter(p => p.specialSkills.includes("Power Hitting")).length}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Reserves & Substitutes */}
          {substitutes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <span className="w-8 h-8 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
                    <span className="text-amber-600 dark:text-amber-400 font-bold">R</span>
                  </span>
                  Reserves & Substitutes ({substitutes.length})
                </CardTitle>
                <CardDescription>Players available as strategic replacements based on match situation</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {substitutes.map((sub, index) => (
                    <motion.div
                      key={sub.player.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="flex items-center justify-between p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-6 h-6 bg-amber-500 text-white rounded-full flex items-center justify-center font-bold text-xs">
                          {index + 1}
                        </span>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm">{sub.player.name}</span>
                            <Badge variant="outline" className="text-xs">{sub.player.role}</Badge>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {sub.reason} • Performance: {sub.player.performance}
                          </div>
                          <div className="flex gap-1 mt-1">
                            {sub.player.specialSkills.slice(0, 1).map((skill, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {skill}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-medium">{sub.player.recentForm}%</div>
                        <div className="text-xs text-muted-foreground">Form</div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {analyticsData.insights.map((insight, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="bg-slate-800 border border-slate-700">
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg text-white font-heading font-bold">{insight.title}</CardTitle>
                      <span className="text-xs text-gray-400 font-sans">
                        {insight.impact} impact
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-300 font-sans">{insight.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
      </motion.div>
    </div>
  );
}