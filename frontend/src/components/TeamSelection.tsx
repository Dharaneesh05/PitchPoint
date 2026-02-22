import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { PlayerCard } from "./PlayerCard";
import { DashboardChart } from "./DashboardChart";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";


interface Player {
  id: string;
  name: string;
  team: string;
  role: 'batsman' | 'bowler' | 'all-rounder' | 'wicket-keeper';
  country: string;
  age: number;
  format: string[];
  stats: {
    matches: number;
    runs?: number;
    wickets?: number;
    average: number;
    strikeRate?: number;
    economyRate?: number;
    recentMatches: number;
    lastFiveScores?: number[];
    lastFiveFigures?: string[];
  };
  form: 'excellent' | 'good' | 'average' | 'poor';
  fitness: number;
  isInjured: boolean;
  injuryDetails?: {
    type: string;
    severity: 'minor' | 'moderate' | 'major';
    expectedReturn: string;
    affectedAreas: string[];
  };
  availability: boolean;
  lastPerformance: {
    runs?: number;
    wickets?: number;
    catches?: number;
    rating: number;
  };
  vsOpposition?: {
    matches: number;
    average?: number;
    wickets?: number;
  };
  venueRecord?: {
    matches: number;
    average?: number;
    wickets?: number;
  };
}

interface AIRecommendation {
  playingXI: Player[];
  reasoning: string;
  strengths: string[];
  concerns: string[];
  balanceRating: number;
  alternativeOptions: {
    player: Player;
    reason: string;
  }[];
}

// Comprehensive cricket teams database
const cricketTeams = [
  'India', 'Australia', 'England', 'Pakistan', 'South Africa', 
  'New Zealand', 'West Indies', 'Sri Lanka', 'Bangladesh', 'Afghanistan',
  'Zimbabwe', 'Ireland', 'Scotland', 'Netherlands', 'UAE', 'Oman'
];

// Enhanced players database with injury tracking
const getTeamPlayersDatabase = (selectedTeam: string): Player[] => {
  const teams = {
    'India': [
      {
        id: '1',
        name: 'Virat Kohli',
        team: 'India',
        role: 'batsman' as const,
        country: 'India',
        age: 36,
        format: ['Test', 'ODI', 'T20'],
        stats: {
          matches: 113,
          runs: 8848,
          average: 47.83,
          strikeRate: 55.37,
          recentMatches: 5,
          lastFiveScores: [45, 23, 78, 12, 89]
        },
        form: 'excellent' as const,
        fitness: 95,
        isInjured: false,
        availability: true,
        lastPerformance: { runs: 89, rating: 8.5 },
        vsOpposition: { matches: 8, average: 52.3 },
        venueRecord: { matches: 12, average: 49.2 }
      },
      {
        id: '2',
        name: 'Rohit Sharma',
        team: 'India',
        role: 'batsman' as const,
        country: 'India',
        age: 37,
        format: ['Test', 'ODI', 'T20'],
        stats: {
          matches: 59,
          runs: 4301,
          average: 46.24,
          strikeRate: 61.54,
          recentMatches: 5,
          lastFiveScores: [67, 34, 5, 91, 23]
        },
        form: 'good' as const,
        fitness: 88,
        isInjured: false,
        availability: true,
        lastPerformance: { runs: 23, rating: 6.0 },
        vsOpposition: { matches: 6, average: 38.7 },
        venueRecord: { matches: 8, average: 44.8 }
      },
      {
        id: '3',
        name: 'Cheteshwar Pujara',
        team: 'India',
        role: 'batsman' as const,
        country: 'India',
        age: 37,
        format: ['Test'],
        stats: {
          matches: 103,
          runs: 7195,
          average: 43.60,
          strikeRate: 44.73,
          recentMatches: 5,
          lastFiveScores: [56, 78, 23, 45, 12]
        },
        form: 'good' as const,
        fitness: 90,
        isInjured: false,
        availability: true,
        lastPerformance: { runs: 12, rating: 5.5 },
        vsOpposition: { matches: 5, average: 41.2 },
        venueRecord: { matches: 7, average: 39.8 }
      },
      {
        id: '4',
        name: 'Ajinkya Rahane',
        team: 'India',
        role: 'batsman' as const,
        country: 'India',
        age: 36,
        format: ['Test'],
        stats: {
          matches: 85,
          runs: 5077,
          average: 38.46,
          strikeRate: 50.80,
          recentMatches: 5,
          lastFiveScores: [34, 67, 8, 23, 45]
        },
        form: 'average' as const,
        fitness: 85,
        isInjured: true,
        injuryDetails: {
          type: 'Hamstring strain',
          severity: 'minor' as const,
          expectedReturn: '2 weeks',
          affectedAreas: ['Running', 'Quick singles']
        },
        availability: false,
        lastPerformance: { runs: 45, rating: 6.8 },
        vsOpposition: { matches: 4, average: 35.5 },
        venueRecord: { matches: 6, average: 42.1 }
      },
      {
        id: '5',
        name: 'KL Rahul',
        team: 'India',
        role: 'wicket-keeper' as const,
        country: 'India',
        age: 32,
        format: ['Test', 'ODI', 'T20'],
        stats: {
          matches: 48,
          runs: 2863,
          average: 34.09,
          strikeRate: 55.92,
          recentMatches: 5,
          lastFiveScores: [23, 78, 45, 12, 67]
        },
        form: 'good' as const,
        fitness: 92,
        isInjured: false,
        availability: true,
        lastPerformance: { runs: 67, catches: 2, rating: 7.5 },
        vsOpposition: { matches: 3, average: 28.3 },
        venueRecord: { matches: 5, average: 36.4 }
      },
      {
        id: '6',
        name: 'Ravindra Jadeja',
        team: 'India',
        role: 'all-rounder' as const,
        country: 'India',
        age: 35,
        format: ['Test', 'ODI', 'T20'],
        stats: {
          matches: 73,
          runs: 2804,
          wickets: 294,
          average: 35.26,
          strikeRate: 57.10,
          economyRate: 2.18,
          recentMatches: 5,
          lastFiveScores: [34, 23, 56, 78, 12],
          lastFiveFigures: ['2/45', '1/34', '3/67', '2/23', '1/89']
        },
        form: 'excellent' as const,
        fitness: 94,
        isInjured: false,
        availability: true,
        lastPerformance: { runs: 12, wickets: 1, rating: 7.0 },
        vsOpposition: { matches: 6, average: 32.1, wickets: 12 },
        venueRecord: { matches: 8, average: 38.5, wickets: 15 }
      },
      {
        id: '7',
        name: 'R Ashwin',
        team: 'India',
        role: 'bowler' as const,
        country: 'India',
        age: 38,
        format: ['Test'],
        stats: {
          matches: 100,
          runs: 3503,
          wickets: 516,
          average: 23.75,
          economyRate: 2.88,
          recentMatches: 5,
          lastFiveFigures: ['4/78', '2/45', '3/67', '5/89', '2/34']
        },
        form: 'excellent' as const,
        fitness: 89,
        isInjured: false,
        availability: true,
        lastPerformance: { wickets: 2, rating: 8.0 },
        vsOpposition: { matches: 7, average: 25.0, wickets: 18 },
        venueRecord: { matches: 9, average: 28.0, wickets: 24 }
      },
      {
        id: '8',
        name: 'Jasprit Bumrah',
        team: 'India',
        role: 'bowler' as const,
        country: 'India',
        age: 31,
        format: ['Test', 'ODI', 'T20'],
        stats: {
          matches: 36,
          wickets: 159,
          average: 20.69,
          economyRate: 2.75,
          recentMatches: 5,
          lastFiveFigures: ['3/45', '4/67', '2/34', '5/78', '3/23']
        },
        form: 'excellent' as const,
        fitness: 96,
        isInjured: false,
        availability: true,
        lastPerformance: { wickets: 3, rating: 9.0 },
        vsOpposition: { matches: 4, average: 28.0, wickets: 11 },
        venueRecord: { matches: 6, average: 30.5, wickets: 15 }
      },
      {
        id: '9',
        name: 'Mohammed Shami',
        team: 'India',
        role: 'bowler' as const,
        country: 'India',
        age: 34,
        format: ['Test', 'ODI'],
        stats: {
          matches: 64,
          wickets: 229,
          average: 27.51,
          economyRate: 2.82,
          recentMatches: 5,
          lastFiveFigures: ['2/56', '3/45', '1/67', '4/34', '2/89']
        },
        form: 'good' as const,
        fitness: 87,
        isInjured: true,
        injuryDetails: {
          type: 'Ankle injury',
          severity: 'moderate' as const,
          expectedReturn: '4 weeks',
          affectedAreas: ['Bowling action', 'Field mobility']
        },
        availability: false,
        lastPerformance: { wickets: 2, rating: 7.5 },
        vsOpposition: { matches: 5, average: 32.0, wickets: 14 },
        venueRecord: { matches: 7, average: 31.2, wickets: 19 }
      },
      {
        id: '10',
        name: 'Ishant Sharma',
        team: 'India',
        role: 'bowler' as const,
        country: 'India',
        age: 36,
        format: ['Test'],
        stats: {
          matches: 105,
          wickets: 311,
          average: 32.39,
          economyRate: 3.15,
          recentMatches: 5,
          lastFiveFigures: ['1/45', '2/67', '3/34', '1/78', '2/23']
        },
        form: 'average' as const,
        fitness: 84,
        isInjured: false,
        availability: true,
        lastPerformance: { wickets: 2, rating: 6.5 },
        vsOpposition: { matches: 8, average: 29.5, wickets: 16 },
        venueRecord: { matches: 10, average: 27.8, wickets: 22 }
      },
      {
        id: '11',
        name: 'Hardik Pandya',
        team: 'India',
        role: 'all-rounder' as const,
        country: 'India',
        age: 31,
        format: ['Test', 'ODI', 'T20'],
        stats: {
          matches: 11,
          runs: 532,
          wickets: 17,
          average: 31.05,
          strikeRate: 70.18,
          economyRate: 3.91,
          recentMatches: 5,
          lastFiveScores: [45, 67, 23, 12, 89],
          lastFiveFigures: ['1/34', '2/67', '0/45', '3/23', '1/78']
        },
        form: 'good' as const,
        fitness: 91,
        isInjured: false,
        availability: true,
        lastPerformance: { runs: 89, wickets: 1, rating: 8.0 },
        vsOpposition: { matches: 2, average: 42.5, wickets: 3 },
        venueRecord: { matches: 3, average: 38.7, wickets: 4 }
      },
      {
        id: '12',
        name: 'Shubman Gill',
        team: 'India',
        role: 'batsman' as const,
        country: 'India',
        age: 25,
        format: ['Test', 'ODI', 'T20'],
        stats: {
          matches: 25,
          runs: 1452,
          average: 31.56,
          strikeRate: 59.22,
          recentMatches: 5,
          lastFiveScores: [78, 45, 23, 89, 34]
        },
        form: 'excellent' as const,
        fitness: 97,
        isInjured: false,
        availability: true,
        lastPerformance: { runs: 34, rating: 6.8 },
        vsOpposition: { matches: 2, average: 45.5 },
        venueRecord: { matches: 3, average: 41.3 }
      },
      {
        id: '13',
        name: 'Mohammed Siraj',
        team: 'India',
        role: 'bowler' as const,
        country: 'India',
        age: 30,
        format: ['Test', 'ODI', 'T20'],
        stats: {
          matches: 23,
          wickets: 69,
          average: 28.69,
          economyRate: 3.24,
          recentMatches: 5,
          lastFiveFigures: ['2/45', '3/67', '1/34', '4/78', '2/23']
        },
        form: 'good' as const,
        fitness: 93,
        isInjured: false,
        availability: true,
        lastPerformance: { wickets: 2, rating: 7.8 },
        vsOpposition: { matches: 3, average: 35.0, wickets: 8 },
        venueRecord: { matches: 4, average: 32.8, wickets: 11 }
      },
      {
        id: '14',
        name: 'Axar Patel',
        team: 'India',
        role: 'all-rounder' as const,
        country: 'India',
        age: 30,
        format: ['Test', 'ODI', 'T20'],
        stats: {
          matches: 11,
          runs: 355,
          wickets: 43,
          average: 23.66,
          strikeRate: 63.78,
          economyRate: 2.62,
          recentMatches: 5,
          lastFiveScores: [23, 45, 12, 67, 34],
          lastFiveFigures: ['3/45', '2/34', '4/67', '1/23', '2/78']
        },
        form: 'excellent' as const,
        fitness: 95,
        isInjured: false,
        availability: true,
        lastPerformance: { runs: 34, wickets: 2, rating: 7.5 },
        vsOpposition: { matches: 2, average: 28.5, wickets: 6 },
        venueRecord: { matches: 3, average: 25.3, wickets: 9 }
      },
      {
        id: '15',
        name: 'Rishabh Pant',
        team: 'India',
        role: 'wicket-keeper' as const,
        country: 'India',
        age: 27,
        format: ['Test', 'ODI', 'T20'],
        stats: {
          matches: 33,
          runs: 2271,
          average: 43.67,
          strikeRate: 73.24,
          recentMatches: 5,
          lastFiveScores: [89, 45, 67, 23, 12]
        },
        form: 'excellent' as const,
        fitness: 88,
        isInjured: true,
        injuryDetails: {
          type: 'Knee surgery recovery',
          severity: 'major' as const,
          expectedReturn: '6 weeks',
          affectedAreas: ['Wicket-keeping', 'Quick movements', 'Running between wickets']
        },
        availability: false,
        lastPerformance: { runs: 12, catches: 1, rating: 6.0 },
        vsOpposition: { matches: 3, average: 52.3 },
        venueRecord: { matches: 4, average: 48.7 }
      }
    ],
    'Australia': [
      {
        id: '16',
        name: 'Steve Smith',
        team: 'Australia',
        role: 'batsman' as const,
        country: 'Australia',
        age: 35,
        format: ['Test', 'ODI', 'T20'],
        stats: {
          matches: 109,
          runs: 9685,
          average: 56.97,
          strikeRate: 54.73,
          recentMatches: 5,
          lastFiveScores: [67, 89, 45, 23, 78]
        },
        form: 'excellent' as const,
        fitness: 94,
        isInjured: false,
        availability: true,
        lastPerformance: { runs: 78, rating: 8.5 },
        vsOpposition: { matches: 12, average: 58.3 },
        venueRecord: { matches: 15, average: 54.7 }
      }
      // Add more Australian players...
    ]
    // Add more teams...
  };

  return teams[selectedTeam as keyof typeof teams] || [];
};

interface TeamSelectionProps {
  matchId?: string;
  opponentTeam?: string;
  venue?: string;
  format?: string;
  onSelectionSave?: (selection: any) => void;
  userRole?: string;
  coachTeam?: string;
}

export function TeamSelection({ 
  matchId, 
  opponentTeam = 'Australia', 
  venue = 'Melbourne Cricket Ground', 
  format = 'Test', 
  onSelectionSave,
  userRole,
  coachTeam 
}: TeamSelectionProps) {
  const [selectedTeam, setSelectedTeam] = useState<string>('India');
  const [availablePlayers, setAvailablePlayers] = useState<Player[]>([]);
  const [selectedSquad, setSelectedSquad] = useState<Player[]>([]);
  const [playingXI, setPlayingXI] = useState<Player[]>([]);
  const [filteredPlayers, setFilteredPlayers] = useState<Player[]>([]);
  const [aiRecommendation, setAIRecommendation] = useState<AIRecommendation | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');
  const [showInjured, setShowInjured] = useState(true);
  const [activeTab, setActiveTab] = useState('squad-selection');
  const [aiInsights, setAiInsights] = useState<AIRecommendation | null>(null);
  const [comparePlayer, setComparePlayer] = useState<Player | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const { toast } = useToast();
  
  // Use ref to store toast function to avoid dependency issues
  const toastRef = useRef(toast);
  toastRef.current = toast;

  // Define memoized functions first
  const loadTeamPlayers = useCallback(() => {
    const players = getTeamPlayersDatabase(selectedTeam);
    setAvailablePlayers(players);
    setSelectedSquad([]);
    setPlayingXI([]);
    setAIRecommendation(null);
  }, [selectedTeam]);

  const filterPlayers = useCallback(() => {
    let filtered = availablePlayers;

    if (searchQuery) {
      filtered = filtered.filter(player => 
        player.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        player.role.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedRole !== 'all') {
      filtered = filtered.filter(player => player.role === selectedRole);
    }

    if (!showInjured) {
      filtered = filtered.filter(player => !player.isInjured);
    }

    setFilteredPlayers(filtered);
  }, [availablePlayers, searchQuery, selectedRole, showInjured]);

  // Sync injury data from CoachDashboard (simulating real-time injury updates)
  // Enhanced sync injury data from CoachDashboard with better matching and performance
  const syncInjuryDataFromCoachDashboard = useCallback(() => {
    try {
      const coachDashboardInjuries = JSON.parse(localStorage.getItem('playerInjuries') || '[]');
      
      if (coachDashboardInjuries.length === 0) {
        return; // No injuries to sync, exit early
      }
      
      let hasChanges = false;
      let updatedPlayersCount = 0;
      
      setAvailablePlayers(prev => {
        const updated = prev.map(player => {
          // Match by player name if ID doesn't match (more flexible matching)
          const injuryUpdate = coachDashboardInjuries.find((inj: any) => 
            inj.playerId === player.id || inj.playerName === player.name
          );
          
          if (injuryUpdate && player.isInjured !== injuryUpdate.isInjured) {
            hasChanges = true;
            updatedPlayersCount++;
            return {
              ...player,
              isInjured: injuryUpdate.isInjured,
              injuryDetails: injuryUpdate.isInjured ? {
                type: injuryUpdate.injuryType || 'General injury',
                severity: (injuryUpdate.severity as 'minor' | 'moderate' | 'major') || 'moderate',
                expectedReturn: injuryUpdate.expectedReturn || 'Unknown',
                affectedAreas: injuryUpdate.affectedAreas || ['General']
              } : undefined
            };
          }
          return player;
        });
        
        // Only return updated array if there were actual changes
        return hasChanges ? updated : prev;
      });
      
      // Only update squad and playing XI if there were changes
      if (hasChanges) {
        setSelectedSquad(prev => prev.map(player => {
          const injuryUpdate = coachDashboardInjuries.find((inj: any) => 
            inj.playerId === player.id || inj.playerName === player.name
          );
          
          if (injuryUpdate) {
            return {
              ...player,
              isInjured: injuryUpdate.isInjured,
              injuryDetails: injuryUpdate.isInjured ? {
                type: injuryUpdate.injuryType || 'General injury',
                severity: (injuryUpdate.severity as 'minor' | 'moderate' | 'major') || 'moderate',
                expectedReturn: injuryUpdate.expectedReturn || 'Unknown',
                affectedAreas: injuryUpdate.affectedAreas || ['General']
              } : undefined
            };
          }
          return player;
        }));
        
        // Remove injured players from Playing XI
        setPlayingXI(prev => prev.filter(player => {
          const injuryUpdate = coachDashboardInjuries.find((inj: any) => 
            (inj.playerId === player.id || inj.playerName === player.name) && inj.isInjured
          );
          return !injuryUpdate;
        }));
        
        if (updatedPlayersCount > 0) {
          toastRef.current({
            title: "Injury Updates Synced",
            description: `${updatedPlayersCount} player injury status(es) updated from Coach Dashboard. Injured players automatically removed from Playing XI.`,
          });
        }
      }
    } catch (error) {
      console.error('Error syncing injury data:', error);
      toastRef.current({
        title: "Sync Error",
        description: "Failed to sync injury data from Coach Dashboard",
        variant: "destructive"
      });
    }
  }, []); // Remove toast dependency to prevent recreation on every render

  // Initial data loading when selectedTeam changes
  useEffect(() => {
    loadTeamPlayers();
  }, [selectedTeam]);

  // Initial sync of injury data - only runs once on mount
  useEffect(() => {
    syncInjuryDataFromCoachDashboard();
  }, []); // Only runs once on component mount

  useEffect(() => {
    // Listen for localStorage changes (when coach dashboard updates injury data)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'playerInjuries') {
        console.log('Injury data updated from Coach Dashboard, syncing...');
        syncInjuryDataFromCoachDashboard();
      }
    };

    // Add event listener for storage changes
    window.addEventListener('storage', handleStorageChange);
    
    // Check for changes periodically but less frequently and only when needed
    let lastInjuryCheck = '';
    const intervalId = setInterval(() => {
      const currentInjuriesStr = localStorage.getItem('playerInjuries') || '[]';
      // Only sync if data has actually changed
      if (currentInjuriesStr !== lastInjuryCheck && currentInjuriesStr !== '[]') {
        lastInjuryCheck = currentInjuriesStr;
        syncInjuryDataFromCoachDashboard();
      }
    }, 10000); // Check every 10 seconds instead of 3 seconds

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(intervalId);
    };
  }, []); // Empty dependency array - this effect only sets up listeners once

  useEffect(() => {
    filterPlayers();
  }, [availablePlayers, searchQuery, selectedRole, showInjured]); // Depend on actual state variables instead of the function

  // Update AI insights when squad changes
  useEffect(() => {
    if (selectedSquad.length >= 15) {
      const insights = generateAIInsights();
      setAiInsights(insights);
    } else {
      setAiInsights(null);
    }
  }, [selectedSquad, playingXI, opponentTeam, venue]); // Fixed: Use actual dependencies

  const getRoleColor = (role: string) => {
    const colors = {
      'batsman': 'bg-slate-600',
      'bowler': 'bg-slate-600', 
      'all-rounder': 'bg-slate-600',
      'wicket-keeper': 'bg-slate-600'
    };
    return colors[role as keyof typeof colors] || 'bg-slate-600';
  };

  const getFormColor = (form: string) => {
    const colors = {
      'excellent': 'text-green-400',
      'good': 'text-blue-400',
      'average': 'text-gray-400',
      'poor': 'text-red-400'
    };
    return colors[form as keyof typeof colors] || 'text-gray-400';
  };

  const getInjurySeverityColor = (severity: string) => {
    const colors = {
      'minor': 'text-yellow-400',
      'moderate': 'text-orange-400',
      'major': 'text-red-400'
    };
    return colors[severity as keyof typeof colors] || 'text-gray-400';
  };

  const handleSquadToggle = (player: Player) => {
    const isSelected = selectedSquad.some(p => p.id === player.id);
    
    if (isSelected) {
      setSelectedSquad(prev => prev.filter(p => p.id !== player.id));
      setPlayingXI(prev => prev.filter(p => p.id !== player.id));
    } else if (selectedSquad.length < 15) {
      if (player.isInjured) {
        toast({
          title: "Player Injured",
          description: `${player.name} is currently injured (${player.injuryDetails?.type}). Expected return: ${player.injuryDetails?.expectedReturn}`,
          variant: "destructive"
        });
        return;
      }
      setSelectedSquad(prev => [...prev, player]);
    } else {
      toast({
        title: "Squad Full",
        description: "Maximum 15 players can be selected for the squad",
        variant: "destructive"
      });
    }
  };

  const handlePlayingXIToggle = (player: Player, event?: React.MouseEvent) => {
    // Prevent event propagation to avoid navigation issues
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    const isSelected = playingXI.some(p => p.id === player.id);
    
    if (isSelected) {
      setPlayingXI(prev => prev.filter(p => p.id !== player.id));
      toast({
        title: "Player Removed",
        description: `${player.name} removed from Playing XI`,
      });
    } else if (playingXI.length < 11) {
      if (!selectedSquad.some(p => p.id === player.id)) {
        toast({
          title: "Not in Squad",
          description: "Player must be in the 15-member squad first",
          variant: "destructive"
        });
        return;
      }
      
      // Check if player is injured
      if (player.isInjured) {
        toast({
          title: "Player Injured",
          description: `${player.name} is currently injured and cannot be selected for Playing XI`,
          variant: "destructive"
        });
        return;
      }
      
      setPlayingXI(prev => [...prev, player]);
      toast({
        title: "Player Added",
        description: `${player.name} added to Playing XI (${playingXI.length + 1}/11)`,
      });
    } else {
      toast({
        title: "Playing XI Full",
        description: "Maximum 11 players can be selected for playing XI",
        variant: "destructive"
      });
    }
  };

  const generateAIRecommendation = () => {
    try {
      // First, ensure we have a complete squad of 15 players
      if (selectedSquad.length < 15) {
        toast({
          title: "Squad Incomplete",
          description: `Please select a complete squad of 15 players first. Currently have ${selectedSquad.length}/15 players.`,
          variant: "destructive"
        });
        return;
      }

      // Filter out injured players from the selected squad
      const availableSquadPlayers = selectedSquad.filter(player => !player.isInjured);
      const injuredPlayers = selectedSquad.filter(player => player.isInjured);
      
      if (availableSquadPlayers.length < 11) {
        const injuryDetails = injuredPlayers.map(p => 
          `${p.name} (${p.injuryDetails?.type || 'injury'})`
        ).join(', ');
        
        toast({
          title: "Too Many Injuries",
          description: `Only ${availableSquadPlayers.length} fit players available. Injured: ${injuryDetails}`,
          variant: "destructive"
        });
        return;
      }

      setLoading(true);

      // Enhanced AI Algorithm for Playing XI Selection
      const enhancedPlayerScoring = (player: Player) => {
        let score = 0;
        
        // 1. Current Form Analysis (30% weight)
        const formScores = { excellent: 100, good: 75, average: 50, poor: 25 };
        score += (formScores[player.currentForm as keyof typeof formScores] || 50) * 0.3;
        
        // 2. Fitness Level (20% weight)
        score += (player.fitness || 80) * 0.2;
        
        // 3. Recent Performance (25% weight)
        const recentRating = player.lastPerformance?.rating || 6;
        score += (recentRating * 10) * 0.25;
        
        // 4. Experience Factor (15% weight)
        const experience = player.experience || (player.age && player.age > 30 ? 8 : 5);
        score += experience * 1.5 * 0.15;
        
        // 5. Venue-specific Performance (10% weight)
        const venueAverage = player.venueRecord?.average || 35;
        const venueBonus = venue.toLowerCase().includes('india') ? 
          (player.country === 'India' ? 15 : 0) : 
          venue.toLowerCase().includes('australia') ? 
          (player.country === 'Australia' ? 15 : 0) : 5;
        score += (venueAverage + venueBonus) * 0.1;
        
        return Math.round(score);
      };

      // Score all available players
      const scoredPlayers = availableSquadPlayers.map(player => ({
        ...player,
        aiScore: enhancedPlayerScoring(player)
      })).sort((a, b) => b.aiScore - a.aiScore);

      // Smart Role-Based Selection Algorithm
      const selectedXI: Player[] = [];
      const roleCount: Record<string, number> = {};
      
      // Phase 1: Select essential roles first (Priority Selection)
      const essentialRoles = [
        { role: 'Wicket Keeper', min: 1, max: 1 },
        { role: 'Opening Batsman', min: 2, max: 2 },
        { role: 'Fast Bowler', min: 2, max: 4 },
        { role: 'Spin Bowler', min: 1, max: 3 }
      ];

      essentialRoles.forEach(({ role, min, max }) => {
        const rolePlayers = scoredPlayers.filter(p => 
          p.role === role && !selectedXI.includes(p)
        );
        
        for (let i = 0; i < Math.min(min, rolePlayers.length); i++) {
          if (selectedXI.length < 11) {
            selectedXI.push(rolePlayers[i]);
            roleCount[role] = (roleCount[role] || 0) + 1;
          }
        }
      });

      // Phase 2: Fill batting positions (Top Order, Middle Order)
      const battingRoles = ['Top Order Batsman', 'Middle Order Batsman'];
      battingRoles.forEach(role => {
        const batsmen = scoredPlayers.filter(p => 
          p.role === role && !selectedXI.includes(p)
        );
        
        for (let i = 0; i < Math.min(2, batsmen.length); i++) {
          if (selectedXI.length < 11) {
            selectedXI.push(batsmen[i]);
            roleCount[role] = (roleCount[role] || 0) + 1;
          }
        }
      });

      // Phase 3: Add All-Rounders for balance
      const allRounders = scoredPlayers.filter(p => 
        p.role === 'All Rounder' && !selectedXI.includes(p)
      );
      
      for (let i = 0; i < Math.min(2, allRounders.length); i++) {
        if (selectedXI.length < 11) {
          selectedXI.push(allRounders[i]);
          roleCount['All Rounder'] = (roleCount['All Rounder'] || 0) + 1;
        }
      }

      // Phase 4: Fill remaining spots with best available players
      while (selectedXI.length < 11) {
        const remainingPlayers = scoredPlayers.filter(p => !selectedXI.includes(p));
        if (remainingPlayers.length === 0) break;
        
        // Prefer players that improve team balance
        let nextPlayer = remainingPlayers[0];
        
        // Check if we need more bowling options
        const currentBowlers = selectedXI.filter(p => 
          ['Fast Bowler', 'Spin Bowler', 'All Rounder'].includes(p.role)
        ).length;
        
        if (currentBowlers < 5) {
          const bowlers = remainingPlayers.filter(p => 
            ['Fast Bowler', 'Spin Bowler', 'All Rounder'].includes(p.role)
          );
          if (bowlers.length > 0) nextPlayer = bowlers[0];
        }
        
        selectedXI.push(nextPlayer);
        roleCount[nextPlayer.role] = (roleCount[nextPlayer.role] || 0) + 1;
      }

      setLoading(false);

      if (selectedXI.length === 11) {
        setPlayingXI(selectedXI);
        
        // Enhanced success message with team analysis
        const teamAnalysis = {
          batting: selectedXI.filter(p => ['Opening Batsman', 'Top Order Batsman', 'Middle Order Batsman'].includes(p.role)).length,
          bowling: selectedXI.filter(p => ['Fast Bowler', 'Spin Bowler'].includes(p.role)).length,
          allRounders: selectedXI.filter(p => p.role === 'All Rounder').length,
          wicketKeepers: selectedXI.filter(p => p.role === 'Wicket Keeper').length,
          avgScore: Math.round(selectedXI.reduce((sum, p) => sum + (p.aiScore || 0), 0) / 11),
          avgFitness: Math.round(selectedXI.reduce((sum, p) => sum + (p.fitness || 80), 0) / 11)
        };

        toast({
          title: "AI Playing XI Selected",
          description: `Optimal team selected! Batting: ${teamAnalysis.batting}, Bowling: ${teamAnalysis.bowling}, All-rounders: ${teamAnalysis.allRounders}. Team Score: ${teamAnalysis.avgScore}/100, Fitness: ${teamAnalysis.avgFitness}%`,
        });
      } else {
        setLoading(false);
        toast({
          title: "Selection Error", 
          description: `Could only select ${selectedXI.length}/11 players. Please check squad composition.`,
          variant: "destructive"
        });
      }

    } catch (error) {
      setLoading(false);
      console.error('AI recommendation error:', error);
      toast({
        title: "AI Recommendation Failed",
        description: "Unable to generate recommendations. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Clear Playing XI function
  const clearPlayingXI = () => {
    setPlayingXI([]);
    toast({
      title: "Playing XI Cleared",
      description: "All players removed from Playing XI. You can now make new selections.",
    });
  };

  // Player comparison functions
  const openPlayerComparison = (player: Player) => {
    setComparePlayer(player);
    setShowComparison(true);
  };

  const getSimilarPlayers = (player: Player) => {
    return availablePlayers
      .filter(p => p.role === player.role && p.id !== player.id)
      .sort((a, b) => {
        // Sort by form, fitness, and recent performance
        const aScore = (a.currentForm === 'excellent' ? 4 : a.currentForm === 'good' ? 3 : 2) + 
                      (a.fitness || 80) / 20 + (a.lastPerformance?.rating || 6) / 2;
        const bScore = (b.currentForm === 'excellent' ? 4 : b.currentForm === 'good' ? 3 : 2) + 
                      (b.fitness || 80) / 20 + (b.lastPerformance?.rating || 6) / 2;
        return bScore - aScore;
      })
      .slice(0, 3);
  };

  const getPlayerComparisonScore = (player: Player) => {
    const formScore = player.currentForm === 'excellent' ? 25 : 
                     player.currentForm === 'good' ? 20 : 
                     player.currentForm === 'average' ? 15 : 10;
    const fitnessScore = (player.fitness || 80) * 0.25;
    const performanceScore = (player.lastPerformance?.rating || 6) * 2.5;
    const experienceScore = (player.experience || 5) * 2;
    const venueScore = (player.venueRecord?.average || 35) * 0.3;
    
    return Math.round(formScore + fitnessScore + performanceScore + experienceScore + venueScore);
  };

  // Enhanced AI insights generation
  // Enhanced AI insights generation with comprehensive analysis
  const generateAIInsights = useCallback(() => {
    if (selectedSquad.length < 15) {
      return null; // Don't call toast here, handle it in useEffect
    }

    const availablePlayers = selectedSquad.filter(p => !p.isInjured);
    const injuredPlayers = selectedSquad.filter(p => p.isInjured);
    
    // Enhanced helper functions with deeper analysis
    const generateStrengthsAnalysis = (squad: Player[], xi: Player[]) => {
      const strengths = [];
      
      // Form Analysis
      const excellentFormCount = squad.filter(p => p.currentForm === 'excellent').length;
      const goodFormCount = squad.filter(p => p.currentForm === 'good').length;
      if (excellentFormCount >= 5) {
        strengths.push(`Exceptional squad form with ${excellentFormCount} players in excellent form`);
      } else if (excellentFormCount + goodFormCount >= 10) {
        strengths.push(`Strong squad form with ${excellentFormCount + goodFormCount} players in good+ form`);
      }
      
      // Squad Depth
      const allRounders = squad.filter(p => p.role === 'All Rounder').length;
      if (allRounders >= 3) {
        strengths.push(`Outstanding balance with ${allRounders} all-rounders providing tactical flexibility`);
      }
      
      // Fitness Levels
      const avgFitness = Math.round(squad.reduce((sum, p) => sum + (p.fitness || 80), 0) / squad.length);
      if (avgFitness >= 90) {
        strengths.push(`Elite fitness levels averaging ${avgFitness}% across the squad`);
      } else if (avgFitness >= 85) {
        strengths.push(`Strong fitness levels averaging ${avgFitness}% across the squad`);
      }
      
      // Playing XI Analysis
      if (xi.length === 11) {
        const bowlingOptions = xi.filter(p => ['Fast Bowler', 'Spin Bowler', 'All Rounder'].includes(p.role)).length;
        if (bowlingOptions >= 6) {
          strengths.push(`Formidable bowling attack with ${bowlingOptions} bowling options in Playing XI`);
        }
        
        const battingDepth = xi.filter(p => 
          !['Fast Bowler', 'Spin Bowler'].includes(p.role)
        ).length;
        if (battingDepth >= 7) {
          strengths.push(`Excellent batting depth with ${battingDepth} capable batsmen`);
        }
        
        // Experience in Playing XI
        const experiencedPlayers = xi.filter(p => (p.experience || 0) >= 7).length;
        if (experiencedPlayers >= 6) {
          strengths.push(`Veteran leadership with ${experiencedPlayers} experienced players in XI`);
        }
      }
      
      // Venue Advantages
      const homeAdvantage = squad.filter(p => {
        if (venue.toLowerCase().includes('india')) return p.country === 'India';
        if (venue.toLowerCase().includes('australia')) return p.country === 'Australia';
        if (venue.toLowerCase().includes('england')) return p.country === 'England';
        return false;
      }).length;
      
      if (homeAdvantage >= 8) {
        strengths.push(`Home advantage with ${homeAdvantage} local players familiar with conditions`);
      }
      
      return strengths.length > 0 ? strengths : ['Squad shows solid foundation with balanced role distribution'];
    };

    const generateConcernsAnalysis = (squad: Player[], xi: Player[], injured: Player[]) => {
      const concerns = [];
      
      // Injury Analysis
      if (injured.length > 0) {
        const keyInjuries = injured.filter(p => 
          ['Opening Batsman', 'Wicket Keeper', 'Fast Bowler', 'All Rounder'].includes(p.role)
        );
        if (keyInjuries.length > 0) {
          concerns.push(`Critical injuries affecting key roles: ${keyInjuries.map(p => `${p.name} (${p.role})`).join(', ')}`);
        } else {
          concerns.push(`Squad depth reduced with ${injured.length} players injured`);
        }
      }
      
      // Form Concerns
      const poorFormCount = squad.filter(p => p.currentForm === 'poor').length;
      const averageFormCount = squad.filter(p => p.currentForm === 'average').length;
      if (poorFormCount >= 3) {
        concerns.push(`Form concerns with ${poorFormCount} players in poor form requiring attention`);
      } else if (poorFormCount + averageFormCount >= 8) {
        concerns.push(`Mixed form across squad with ${averageFormCount} players needing form boost`);
      }
      
      // Fitness Concerns
      const lowFitnessPlayers = squad.filter(p => (p.fitness || 80) < 75).length;
      if (lowFitnessPlayers >= 3) {
        concerns.push(`Fitness concerns with ${lowFitnessPlayers} players below optimal condition`);
      }
      
      // Playing XI Balance Issues
      if (xi.length === 11) {
        const wicketKeepers = xi.filter(p => p.role === 'Wicket Keeper').length;
        if (wicketKeepers === 0) {
          concerns.push('CRITICAL: No wicket keeper selected - mandatory for match eligibility');
        } else if (wicketKeepers > 1) {
          concerns.push('Team balance concern: Multiple wicket keepers may weaken specialist positions');
        }
        
        const bowlers = xi.filter(p => ['Fast Bowler', 'Spin Bowler'].includes(p.role)).length;
        if (bowlers < 4) {
          concerns.push(`Bowling weakness: Only ${bowlers} specialist bowlers - consider strengthening attack`);
        }
        
        // Age Balance
        const youngPlayers = xi.filter(p => p.age && p.age < 25).length;
        const veteranPlayers = xi.filter(p => p.age && p.age > 35).length;
        if (youngPlayers >= 6) {
          concerns.push(`Experience gap: ${youngPlayers} young players may lack big-match temperament`);
        } else if (veteranPlayers >= 5) {
          concerns.push(`Age concerns: ${veteranPlayers} veteran players may face fitness challenges`);
        }
      }
      
      return concerns.length > 0 ? concerns : ['No major concerns identified with current squad composition'];
    };

    const generateTacticalRecommendations = (xi: Player[], opponent: string, venue: string) => {
      if (xi.length === 0) return ['Complete Playing XI selection for comprehensive tactical analysis'];
      
      const recommendations = [];
      
      // Bowling Strategy
      const spinners = xi.filter(p => p.role === 'Spin Bowler').length;
      const pacers = xi.filter(p => p.role === 'Fast Bowler').length;
      
      if (venue.toLowerCase().includes('india') || venue.toLowerCase().includes('asia')) {
        if (spinners < 2) {
          recommendations.push('PITCH STRATEGY: Add more spinners - Asian conditions typically favor spin bowling');
        } else if (spinners >= 2) {
          recommendations.push('OPTIMAL: Spin-friendly combination well-suited for Asian conditions');
        }
      } else if (venue.toLowerCase().includes('australia') || venue.toLowerCase().includes('england')) {
        if (pacers < 3) {
          recommendations.push('PACE STRATEGY: Strengthen pace attack - overseas conditions demand pace bowling depth');
        } else if (pacers >= 3) {
          recommendations.push('EXCELLENT: Strong pace attack aligned with overseas conditions');
        }
      }
      
      // Batting Strategy
      const openers = xi.filter(p => p.role === 'Opening Batsman').length;
      if (openers < 2) {
        recommendations.push('BATTING ORDER: Ensure 2 specialist openers for new ball challenge');
      }
      
      // Match Situation Strategy
      const finishers = xi.filter(p => 
        p.role === 'All Rounder' || 
        (p.lastPerformance && p.lastPerformance.rating >= 7)
      ).length;
      
      if (finishers < 2) {
        recommendations.push('LOWER ORDER: Consider players with finishing ability for pressure situations');
      }
      
      // Opposition-specific
      if (opponent.toLowerCase().includes('australia')) {
        recommendations.push('🇦🇺 vs AUSTRALIA: Focus on pace bowling resistance and aggressive batting approach');
      } else if (opponent.toLowerCase().includes('england')) {
        recommendations.push('🏴󠁧󠁢󠁥󠁮󠁧󠁿 vs ENGLAND: Prepare for swing bowling and adaptable batting strategy');
      } else if (opponent.toLowerCase().includes('india')) {
        recommendations.push('🇮🇳 vs INDIA: Counter-spin strategy and pace variation crucial');
      }
      
      // Team Balance Assessment
      const teamScore = xi.reduce((sum, p) => {
        const formScore = p.currentForm === 'excellent' ? 4 : p.currentForm === 'good' ? 3 : 2;
        const fitnessScore = (p.fitness || 80) / 20;
        return sum + formScore + fitnessScore;
      }, 0) / xi.length;
      
      if (teamScore >= 6) {
        recommendations.push(`EAM STRENGTH: Exceptional XI with composite score ${teamScore.toFixed(1)}/8.0`);
      } else if (teamScore >= 5) {
        recommendations.push(`TEAM STRENGTH: Strong XI with composite score ${teamScore.toFixed(1)}/8.0`);
      } else {
        recommendations.push(`TEAM STRENGTH: Consider form/fitness improvements - score ${teamScore.toFixed(1)}/8.0`);
      }
      
      return recommendations.length > 0 ? recommendations : ['Well-balanced team composition suits match conditions effectively'];
    };
    
    // Enhanced squad analysis
    const roleCount = selectedSquad.reduce((acc, player) => {
      acc[player.role] = (acc[player.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const formDistribution = selectedSquad.reduce((acc, player) => {
      acc[player.currentForm || 'unknown'] = (acc[player.currentForm || 'unknown'] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Advanced Analytics
    const experienceLevels = selectedSquad.map(p => p.experience || 0);
    const avgExperience = experienceLevels.reduce((a, b) => a + b, 0) / experienceLevels.length;
    const avgFitness = Math.round(selectedSquad.reduce((sum, p) => sum + (p.fitness || 80), 0) / selectedSquad.length);
    const avgAge = Math.round(selectedSquad.reduce((sum, p) => sum + (p.age || 28), 0) / selectedSquad.length);
    
    // Playing XI detailed analysis
    const playingXIInsights = playingXI.length > 0 ? {
      battingStrength: playingXI.filter(p => 
        ['Opening Batsman', 'Top Order Batsman', 'Middle Order Batsman'].includes(p.role)
      ).length,
      bowlingOptions: playingXI.filter(p => 
        ['Fast Bowler', 'Spin Bowler'].includes(p.role)
      ).length,
      allRounders: playingXI.filter(p => p.role === 'All Rounder').length,
      wicketKeepers: playingXI.filter(p => p.role === 'Wicket Keeper').length,
      avgXIScore: Math.round(playingXI.reduce((sum, p) => {
        const formBonus = p.currentForm === 'excellent' ? 15 : p.currentForm === 'good' ? 10 : 5;
        return sum + formBonus + (p.fitness || 80)/4 + (p.experience || 5);
      }, 0) / 11),
      totalExperience: playingXI.reduce((sum, p) => sum + (p.experience || 5), 0)
    } : null;

    return {
      squadBalance: {
        total: selectedSquad.length,
        available: availablePlayers.length,
        injured: injuredPlayers.length,
        roleDistribution: roleCount,
        formDistribution: formDistribution,
        averageExperience: Math.round(avgExperience),
        averageFitness: avgFitness,
        averageAge: avgAge,
        squadStrength: Math.round((avgFitness * 0.3 + avgExperience * 10 * 0.4 + (15 - injuredPlayers.length) * 6.67 * 0.3))
      },
      playingXIAnalysis: playingXIInsights,
      recommendations: {
        strengths: generateStrengthsAnalysis(selectedSquad, playingXI),
        concerns: generateConcernsAnalysis(selectedSquad, playingXI, injuredPlayers),
        tactical: generateTacticalRecommendations(playingXI, opponentTeam, venue)
      }
    };
  }, [selectedSquad, playingXI, opponentTeam, venue]);

  // Advanced Team Balance Analysis Functions
  const generateBattingOrder = (playingXI: Player[]) => {
    if (playingXI.length < 11) return [];
    
    const orderAnalysis = playingXI.map(player => ({
      ...player,
      battingScore: calculateBattingScore(player)
    })).sort((a, b) => {
      // Openers: Best technique and defensive players
      if (a.role === 'batsman' && b.role === 'batsman') {
        return b.battingScore - a.battingScore;
      }
      // All-rounders in middle order
      if (a.role === 'all-rounder') return -1;
      if (b.role === 'all-rounder') return 1;
      // Wicket keeper at 7 typically
      if (a.role === 'wicket-keeper') return 0;
      if (b.role === 'wicket-keeper') return 0;
      return b.battingScore - a.battingScore;
    });

    return orderAnalysis;
  };

  const calculateBattingScore = (player: Player) => {
    const avgWeight = player.stats.average / 50 * 40; // Max 40 points
    const formWeight = player.form === 'Excellent' ? 30 : player.form === 'Good' ? 20 : player.form === 'Average' ? 10 : 5;
    const fitnessWeight = (player.fitness || 80) / 100 * 20; // Max 20 points
    const experienceWeight = Math.min(player.stats.matches / 50, 1) * 10; // Max 10 points
    
    return Math.round(avgWeight + formWeight + fitnessWeight + experienceWeight);
  };

  const analyzeBowlingAttack = (playingXI: Player[]) => {
    const bowlers = playingXI.filter(p => p.role === 'bowler' || p.role === 'all-rounder');
    const paceBowlers = bowlers.filter(p => p.bowlingStyle?.includes('pace') || p.bowlingStyle?.includes('fast')).length;
    const spinBowlers = bowlers.filter(p => p.bowlingStyle?.includes('spin')).length;
    const allRounders = bowlers.filter(p => p.role === 'all-rounder').length;
    
    return {
      totalBowlers: bowlers.length,
      paceBowlers,
      spinBowlers,
      allRounders,
      bowlingOptions: bowlers.length,
      attackBalance: paceBowlers >= 3 && spinBowlers >= 2 ? 'Excellent' : 
                   paceBowlers >= 2 && spinBowlers >= 1 ? 'Good' : 
                   bowlers.length >= 5 ? 'Average' : 'Weak',
      varietyScore: Math.min(100, (paceBowlers * 15) + (spinBowlers * 20) + (allRounders * 10))
    };
  };

  const analyzeFieldingPositions = (playingXI: Player[]) => {
    const positions = {
      slips: playingXI.filter(p => p.fieldingSkill >= 8).length,
      keeper: playingXI.filter(p => p.role === 'wicket-keeper').length,
      covers: playingXI.filter(p => p.fieldingSkill >= 7).length,
      boundary: playingXI.filter(p => p.fieldingSkill >= 6).length,
      overall: Math.round(playingXI.reduce((sum, p) => sum + (p.fieldingSkill || 6), 0) / playingXI.length)
    };
    
    return {
      ...positions,
      fieldingStrength: positions.overall >= 8 ? 'Excellent' : 
                       positions.overall >= 7 ? 'Good' : 
                       positions.overall >= 6 ? 'Average' : 'Weak'
    };
  };

  const generateStrategicFormation = (playingXI: Player[], venue: string, opposition: string) => {
    const bowlingAttack = analyzeBowlingAttack(playingXI);
    const batting = generateBattingOrder(playingXI);
    const fielding = analyzeFieldingPositions(playingXI);
    
    const venueStrategy = venue.toLowerCase().includes('subcontinental') || venue.toLowerCase().includes('india') ? 
      'Spin-heavy strategy recommended with more spinners' :
      'Pace-dominant strategy with strong seam attack';
    
    return {
      formation: '1-4-4-2', // Batsmen-Middle-Bowlers-Keepers formation
      strategy: venueStrategy,
      tacticalAdvice: [
        `Batting: ${batting.length >= 6 ? 'Strong batting depth' : 'Consider more batting options'}`,
        `Bowling: ${bowlingAttack.attackBalance} bowling balance with ${bowlingAttack.bowlingOptions} options`,
        `Fielding: ${fielding.fieldingStrength} fielding unit with ${fielding.overall}/10 average skill`
      ]
    };
  };

  // Update AI insights when squad changes
  useEffect(() => {
    if (selectedSquad.length >= 15) {
      const insights = generateAIInsights();
      setAiInsights(insights);
    } else {
      setAiInsights(null);
    }
  }, [generateAIInsights]);

  const updatePlayerInjuryStatus = (playerId: string, isInjured: boolean, injuryDetails?: any) => {
    const currentInjuries = JSON.parse(localStorage.getItem('playerInjuries') || '[]');
    const updatedInjuries = currentInjuries.filter((inj: any) => inj.playerId !== playerId);
    
    if (isInjured && injuryDetails) {
      updatedInjuries.push({
        playerId,
        isInjured: true,
        injuryType: injuryDetails.type,
        severity: injuryDetails.severity,
        expectedReturn: injuryDetails.expectedReturn,
        affectedAreas: injuryDetails.affectedAreas,
        updatedAt: new Date().toISOString()
      });
    } else if (!isInjured) {
      updatedInjuries.push({
        playerId,
        isInjured: false,
        updatedAt: new Date().toISOString()
      });
    }
    
    localStorage.setItem('playerInjuries', JSON.stringify(updatedInjuries));
    
    toast({
      title: "Injury Status Updated",
      description: `${isInjured ? 'Injury reported' : 'Recovery confirmed'} - data synced to Coach Dashboard`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold text-white mb-2 font-heading">
            Team Selection
          </h1>
          <p className="text-gray-400 text-lg font-sans">
            Squad Selection with Injury Tracking & Performance Analysis
          </p>
        </motion.div>

        {/* Team Selection Header */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              Team & Match Details
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Select Team</label>
                <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                    <SelectValue placeholder="Choose team" />
                  </SelectTrigger>
                  <SelectContent>
                    {cricketTeams.map((team) => (
                      <SelectItem key={team} value={team}>{team}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Opposition</label>
                <div className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                  {opponentTeam}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Venue</label>
                <div className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                  {venue}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Format</label>
                <div className="px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white">
                  {format}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-gray-800 border-gray-700">
            <TabsTrigger value="squad-selection" className="data-[state=active]:bg-slate-600">
              Squad Selection (15)
            </TabsTrigger>
            <TabsTrigger value="playing-xi" className="data-[state=active]:bg-slate-600">
              Playing XI (11)
            </TabsTrigger>
            <TabsTrigger value="ai-recommendations" className="data-[state=active]:bg-slate-600">
              AI Insights
            </TabsTrigger>
          </TabsList>

          {/* Squad Selection Tab */}
          <TabsContent value="squad-selection" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
              {/* Filters & Player List */}
              <div className="xl:col-span-3 space-y-6">
                {/* Filters */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      Player Search & Filters
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <Input
                          placeholder="Search players..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="bg-gray-700 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <Select value={selectedRole} onValueChange={setSelectedRole}>
                          <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                            <SelectValue placeholder="Filter by role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="batsman">Batsman</SelectItem>
                            <SelectItem value="bowler">Bowler</SelectItem>
                            <SelectItem value="all-rounder">All-rounder</SelectItem>
                            <SelectItem value="wicket-keeper">Wicket-keeper</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Button
                          variant={showInjured ? "default" : "outline"}
                          onClick={() => setShowInjured(!showInjured)}
                          className="w-full"
                        >
                          {showInjured ? "Hide" : "Show"} Injured
                        </Button>
                      </div>
                      <div>
                        <Badge variant="secondary" className="bg-slate-600 text-white px-4 py-2">
                          Available: {filteredPlayers.filter(p => !p.isInjured).length}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Players Grid */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                      <span>Team Players ({filteredPlayers.length})</span>
                      <Badge variant="secondary" className="bg-slate-600">
                        Squad: {selectedSquad.length}/15
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                      <AnimatePresence>
                        {filteredPlayers.map((player, index) => (
                          <motion.div
                            key={player.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: index * 0.05 }}
                          >
                            <Card 
                              className={`cursor-pointer transition-all relative ${
                                selectedSquad.some(p => p.id === player.id) 
                                  ? 'bg-slate-600/30 border-slate-400' 
                                  : player.isInjured 
                                    ? 'bg-red-600/20 border-red-400' 
                                    : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                              }`}
                              onClick={() => handleSquadToggle(player)}
                            >
                              {player.isInjured && (
                                <div className="absolute top-2 right-2">
                                  <span className="text-red-400 text-xs font-bold">!</span>
                                </div>
                              )}
                              <CardContent className="p-4">
                                <div className="space-y-2">
                                  <div className="flex items-center justify-between">
                                  <div className="space-y-1">
                                    <h3 className="font-medium text-white text-sm">{player.name}</h3>
                                    <span className="font-medium text-white text-xs">{player.team}</span>
                                  </div>
                                  <span className="font-medium text-white text-sm">{player.role}</span>
                                  </div>
                                  <div className="text-xs text-gray-300">
                                    <p>Age: {player.age} | Avg: {player.stats.average}</p>
                                    <p>Matches: {player.stats.matches} | Fitness: {player.fitness}%</p>
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <span className="font-medium text-white text-sm">{player.form} form</span>
                                    {player.lastPerformance && (
                                      <span className="text-xs text-gray-400">
                                        Rating: {player.lastPerformance.rating}/10
                                      </span>
                                    )}
                                  </div>
                                  {player.isInjured && player.injuryDetails && (
                                    <div className="text-xs space-y-1 p-2 bg-red-900/20 rounded border border-red-400/30">
                                      <p className={`font-medium ${getInjurySeverityColor(player.injuryDetails.severity)}`}>
                                        {player.injuryDetails.type}
                                      </p>
                                      <p className="text-gray-400">
                                        Return: {player.injuryDetails.expectedReturn}
                                      </p>
                                    </div>
                                  )}
                                  
                                  {/* Player Comparison Button */}
                                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-600">
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      className="text-xs text-blue-400 hover:text-blue-300 hover:bg-blue-900/20 px-2 py-1 h-auto"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openPlayerComparison(player);
                                      }}
                                    >
                                      Compare
                                    </Button>
                                    {selectedSquad.some(p => p.id === player.id) && (
                                      <span className="text-xs text-green-400 font-medium">✓ Selected</span>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>

                    {filteredPlayers.length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        No players found matching your criteria
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar - Squad Overview */}
              <div className="space-y-6">
                {/* Selected Squad Overview */}
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      Selected Squad ({selectedSquad.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 max-h-64 overflow-y-auto">
                    {selectedSquad.map((player) => (
                      <div key={player.id} className={`flex items-center justify-between p-2 rounded-lg ${
                        player.isInjured ? 'bg-red-900/30 border border-red-700/50' : 'bg-gray-700/50'
                      }`}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-white text-sm font-medium truncate">{player.name}</p>
                            {player.isInjured && (
                              <span className="text-red-400 text-xs bg-red-900/50 px-1.5 py-0.5 rounded">
                                INJURED
                              </span>
                            )}
                          </div>
                          <p className="text-gray-400 text-xs">
                            {player.role} • Form: {player.form}
                            {player.isInjured && player.injuryDetails && (
                              <span className="text-red-400 ml-1">
                                • {player.injuryDetails.type}
                              </span>
                            )}
                          </p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSquadToggle(player)}
                          className="ml-2 h-6 w-6 p-0 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                        >
                          ×
                        </Button>
                      </div>
                    ))}

                    {selectedSquad.length === 0 && (
                      <div className="text-center py-4 text-gray-400 text-sm">
                        No players in squad yet
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Squad Composition */}
                {selectedSquad.length > 0 && (
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white text-sm">Squad Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(
                          selectedSquad.reduce((acc, player) => {
                            const role = player.role;
                            acc[role] = (acc[role] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>)
                        ).map(([role, count]) => (
                          <div key={role} className="flex items-center justify-between">
                            <span className="text-gray-300 text-sm capitalize">{role}s</span>
                            <span className="text-white text-sm font-medium">{count}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Injury Report */}
                {selectedSquad.some(p => p.isInjured) && (
                  <Card className="bg-red-900/20 border-red-400/30">
                    <CardHeader>
                      <CardTitle className="text-red-400 text-sm flex items-center gap-2">
                        Injury Report
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {selectedSquad.filter(p => p.isInjured).map(player => (
                          <div key={player.id} className="text-xs">
                            <p className="text-white font-medium">{player.name}</p>
                            <p className="text-gray-400">{player.injuryDetails?.type}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          {/* Playing XI Tab */}
          <TabsContent value="playing-xi" className="space-y-6">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Playing XI Selection */}
              <div className="xl:col-span-2 space-y-6">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        Select Playing XI from Squad
                      </span>
                      <Badge variant="secondary" className="bg-slate-600">
                        Playing XI: {playingXI.length}/11
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {selectedSquad.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <p>Please select a 15-member squad first</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {selectedSquad.filter(p => !p.isInjured).map((player) => (
                          <Card 
                            key={player.id}
                            className={`cursor-pointer transition-all ${
                              playingXI.some(p => p.id === player.id) 
                                ? 'bg-slate-600/30 border-slate-400' 
                                : 'bg-gray-700 border-gray-600 hover:bg-gray-600'
                            }`}
                            onClick={(event) => handlePlayingXIToggle(player, event)}
                          >
                            <CardContent className="p-4">
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <h3 className="font-medium text-white text-sm">{player.name}</h3>
                                  <span className="font-medium text-white text-sm">{player.role}</span>
                                </div>
                                <div className="text-xs text-gray-300">
                                  <p>Form: {player.form} | Fitness: {player.fitness}%</p>
                                  <p>vs {opponentTeam}: Avg {player.vsOpposition?.average || 'N/A'}</p>
                                </div>
                                <div className="flex items-center justify-between">
                                  <span className="font-medium text-white text-sm">{player.form}</span>
                                  <span className="text-xs text-gray-400">
                                    Rating: {player.lastPerformance.rating}/10
                                  </span>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Playing XI Overview */}
              <div className="space-y-6">
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                      Playing XI ({playingXI.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 max-h-64 overflow-y-auto">
                    {playingXI.map((player, index) => (
                      <div key={player.id} className="flex items-center justify-between p-2 bg-gray-700/50 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400 text-xs">#{index + 1}</span>
                            <p className="text-white text-sm font-medium truncate">{player.name}</p>
                          </div>
                          <p className="text-gray-400 text-xs">{player.role} • {player.form} form</p>
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handlePlayingXIToggle(player)}
                          className="ml-2 h-6 w-6 p-0 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                        >
                          ×
                        </Button>
                      </div>
                    ))}

                    {playingXI.length === 0 && (
                      <div className="text-center py-4 text-gray-400 text-sm">
                        No players in playing XI yet
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Playing XI Balance */}
                {playingXI.length > 0 && (
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white text-sm">XI Balance</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(
                          playingXI.reduce((acc, player) => {
                            const role = player.role;
                            acc[role] = (acc[role] || 0) + 1;
                            return acc;
                          }, {} as Record<string, number>)
                        ).map(([role, count]) => (
                          <div key={role} className="flex items-center justify-between">
                            <span className="text-gray-300 text-sm capitalize">{role}s</span>
                            <span className="text-white text-sm font-medium">{count}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Advanced Team Metrics */}
                {playingXI.length >= 11 && (
                  <>
                    {/* Batting Order Analysis */}
                    <Card className="bg-gray-800/50 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white text-sm flex items-center gap-2">
                          🏏 Batting Order
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                          {generateBattingOrder(playingXI).slice(0, 11).map((player, index) => (
                            <div key={player.id} className="flex items-center justify-between p-2 bg-gray-700/30 rounded">
                              <div className="flex items-center gap-2">
                                <span className="text-gray-400 text-xs font-mono w-6">#{index + 1}</span>
                                <div>
                                  <p className="text-white text-xs font-medium">{player.name}</p>
                                  <p className="text-gray-400 text-xs">{player.role}</p>
                                </div>
                              </div>
                              <div className="text-center">
                                <div className="text-white text-xs font-medium">{player.battingScore}</div>
                                <div className="text-gray-400 text-xs">Score</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Bowling Attack Analysis */}
                    <Card className="bg-gray-800/50 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white text-sm flex items-center gap-2">
                          ⚡ Bowling Attack
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {(() => {
                            const bowlingAnalysis = analyzeBowlingAttack(playingXI);
                            return (
                              <>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div className="text-center p-2 bg-blue-900/20 rounded">
                                    <div className="text-blue-300 font-medium">{bowlingAnalysis.paceBowlers}</div>
                                    <div className="text-gray-400">Pace</div>
                                  </div>
                                  <div className="text-center p-2 bg-purple-900/20 rounded">
                                    <div className="text-purple-300 font-medium">{bowlingAnalysis.spinBowlers}</div>
                                    <div className="text-gray-400">Spin</div>
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className={`font-medium text-sm ${
                                    bowlingAnalysis.attackBalance === 'Excellent' ? 'text-green-400' :
                                    bowlingAnalysis.attackBalance === 'Good' ? 'text-blue-400' :
                                    bowlingAnalysis.attackBalance === 'Average' ? 'text-yellow-400' : 'text-red-400'
                                  }`}>
                                    {bowlingAnalysis.attackBalance} Balance
                                  </div>
                                  <div className="text-gray-400 text-xs">
                                    {bowlingAnalysis.bowlingOptions} bowling options
                                  </div>
                                </div>
                                <div className="bg-gray-700/30 rounded-full h-2">
                                  <div 
                                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                                    style={{ width: `${bowlingAnalysis.varietyScore}%` }}
                                  ></div>
                                </div>
                                <div className="text-center text-xs text-gray-400">
                                  Variety Score: {bowlingAnalysis.varietyScore}/100
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Fielding Analysis */}
                    <Card className="bg-gray-800/50 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white text-sm flex items-center gap-2">
                          Fielding Unit
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {(() => {
                            const fieldingAnalysis = analyzeFieldingPositions(playingXI);
                            return (
                              <>
                                <div className="text-center">
                                  <div className={`text-lg font-bold ${
                                    fieldingAnalysis.fieldingStrength === 'Excellent' ? 'text-green-400' :
                                    fieldingAnalysis.fieldingStrength === 'Good' ? 'text-blue-400' :
                                    fieldingAnalysis.fieldingStrength === 'Average' ? 'text-yellow-400' : 'text-red-400'
                                  }`}>
                                    {fieldingAnalysis.overall}/10
                                  </div>
                                  <div className="text-gray-400 text-xs">
                                    {fieldingAnalysis.fieldingStrength} Fielding
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                  <div className="text-center p-2 bg-gray-700/20 rounded">
                                    <div className="text-white font-medium">{fieldingAnalysis.slips}</div>
                                    <div className="text-gray-400">Slip Catchers</div>
                                  </div>
                                  <div className="text-center p-2 bg-gray-700/20 rounded">
                                    <div className="text-white font-medium">{fieldingAnalysis.boundary}</div>
                                    <div className="text-gray-400">Boundary Riders</div>
                                  </div>
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Strategic Formation */}
                    <Card className="bg-gray-800/50 border-gray-700">
                      <CardHeader>
                        <CardTitle className="text-white text-sm flex items-center gap-2">
                          ⚔️ Team Strategy
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {(() => {
                            const strategy = generateStrategicFormation(playingXI, venue, opponentTeam);
                            return (
                              <>
                                <div className="text-center p-2 bg-gradient-to-r from-blue-900/20 to-purple-900/20 rounded">
                                  <div className="text-white font-medium text-sm">{strategy.formation}</div>
                                  <div className="text-gray-400 text-xs">Formation</div>
                                </div>
                                <div className="space-y-2">
                                  <div className="text-xs text-gray-300 bg-gray-700/20 p-2 rounded">
                                    <strong className="text-white">Venue Strategy:</strong><br />
                                    {strategy.strategy}
                                  </div>
                                  {strategy.tacticalAdvice.map((advice, index) => (
                                    <div key={index} className="text-xs text-gray-300 bg-gray-700/20 p-2 rounded">
                                      {advice}
                                    </div>
                                  ))}
                                </div>
                              </>
                            );
                          })()}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}

                {/* AI Recommendation Button */}
                <div className="flex gap-3">
                  {selectedSquad.length >= 11 && (
                    <Button
                      onClick={generateAIRecommendation}
                      disabled={loading}
                      className="flex-1 bg-slate-600 hover:bg-slate-700"
                    >
                      {loading ? (
                        <div className="flex items-center gap-2">
                          Analyzing...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          Generate AI Playing XI
                        </div>
                      )}
                    </Button>
                  )}
                  
                  {playingXI.length > 0 && (
                    <Button
                      onClick={clearPlayingXI}
                      variant="outline"
                      className="bg-gray-700 border-gray-600 hover:bg-gray-600 text-white"
                    >
                      Clear Playing XI
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* AI Recommendations Tab */}
          <TabsContent value="ai-recommendations" className="space-y-6">
            {!aiInsights ? (
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="text-center py-12">
                  <h3 className="text-xl font-semibold text-white mb-2">AI Team Analysis</h3>
                  <p className="text-gray-400 mb-6">
                    Complete your 15-member squad selection to get comprehensive AI insights and tactical recommendations.
                  </p>
                  <p className="text-yellow-400">
                    Currently have {selectedSquad.length}/15 players in squad
                  </p>
                </CardContent>
              </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Squad Analysis */}
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Squad Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-3 bg-slate-600/30 rounded-lg">
                          <p className="text-2xl font-bold text-white">{aiInsights.squadBalance.available}</p>
                          <p className="text-xs text-gray-400">Available Players</p>
                        </div>
                        <div className="text-center p-3 bg-slate-600/30 rounded-lg">
                          <p className="text-2xl font-bold text-white">{aiInsights.squadBalance.averageExperience}</p>
                          <p className="text-xs text-gray-400">Avg Experience</p>
                        </div>
                      </div>
                      
                      {aiInsights.squadBalance.injured > 0 && (
                        <div className="p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
                          <p className="text-red-400 text-sm font-medium">Injury Report</p>
                          <p className="text-red-300 text-xs">{aiInsights.squadBalance.injured} players currently injured</p>
                        </div>
                      )}

                      <div className="space-y-2">
                        <p className="text-white text-sm font-medium">Role Distribution</p>
                        {Object.entries(aiInsights.squadBalance.roleDistribution).map(([role, count]) => (
                          <div key={role} className="flex justify-between items-center text-xs">
                            <span className="text-gray-400">{role}</span>
                            <span className="text-white font-medium">{count}</span>
                          </div>
                        ))}
                      </div>

                      <div className="space-y-2">
                        <p className="text-white text-sm font-medium">Form Distribution</p>
                        {Object.entries(aiInsights.squadBalance.formDistribution).map(([form, count]) => (
                          <div key={form} className="flex justify-between items-center text-xs">
                            <span className="text-gray-400 capitalize">{form}</span>
                            <span className={`font-medium ${
                              form === 'excellent' ? 'text-green-400' :
                              form === 'good' ? 'text-blue-400' :
                              form === 'average' ? 'text-yellow-400' :
                              form === 'poor' ? 'text-red-400' : 'text-gray-400'
                            }`}>{count}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Playing XI Analysis */}
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white">Playing XI Analysis</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {aiInsights.playingXIAnalysis ? (
                        <>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-slate-600/30 rounded-lg">
                              <p className="text-2xl font-bold text-white">
                                {aiInsights.playingXIAnalysis.battingStrength}
                              </p>
                              <p className="text-xs text-gray-400">Batting Options</p>
                            </div>
                            <div className="text-center p-3 bg-slate-600/30 rounded-lg">
                              <p className="text-2xl font-bold text-white">
                                {aiInsights.playingXIAnalysis.bowlingOptions}
                              </p>
                              <p className="text-xs text-gray-400">Bowling Options</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div className="text-center p-3 bg-slate-600/30 rounded-lg">
                              <p className="text-2xl font-bold text-white">
                                {aiInsights.playingXIAnalysis.allRounders}
                              </p>
                              <p className="text-xs text-gray-400">All-Rounders</p>
                            </div>
                            <div className="text-center p-3 bg-slate-600/30 rounded-lg">
                              <p className="text-2xl font-bold text-white">
                                {aiInsights.playingXIAnalysis.wicketKeepers}
                              </p>
                              <p className="text-xs text-gray-400">Wicket Keepers</p>
                            </div>
                          </div>
                        </>
                      ) : (
                        <div className="text-center py-8 text-gray-400">
                          <p>Select your Playing XI to see detailed analysis</p>
                          <Button
                            onClick={generateAIRecommendation}
                            className="mt-4 bg-slate-600 hover:bg-slate-700"
                            size="sm"
                          >
                            Generate AI Playing XI
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  {/* Team Strengths */}
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white text-green-400">Team Strengths</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {aiInsights.recommendations.strengths.map((strength, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-green-400 mt-0.5">✓</span>
                            <span className="text-gray-300 text-sm">{strength}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Areas of Concern */}
                  <Card className="bg-gray-800/50 border-gray-700">
                    <CardHeader>
                      <CardTitle className="text-white text-yellow-400">Areas to Monitor</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {aiInsights.recommendations.concerns.map((concern, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-yellow-400 mt-0.5">⚠</span>
                            <span className="text-gray-300 text-sm">{concern}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Tactical Recommendations */}
                  <Card className="bg-gray-800/50 border-gray-700 lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-white text-blue-400">Tactical Recommendations</CardTitle>
                      <p className="text-gray-400 text-sm">
                        Based on opponent: {opponentTeam} | Venue: {venue}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {aiInsights.recommendations.tactical.map((recommendation, index) => (
                          <li key={index} className="flex items-start gap-2">
                            <span className="text-blue-400 mt-0.5">💡</span>
                            <span className="text-gray-300 text-sm">{recommendation}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>

                  {/* Squad Depth Analysis */}
                  <Card className="bg-gray-800/50 border-gray-700 lg:col-span-2">
                    <CardHeader>
                      <CardTitle className="text-white text-green-400">Squad Depth & Coverage</CardTitle>
                      <p className="text-gray-400 text-sm">
                        Backup options and role coverage analysis
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Role Coverage */}
                        {Object.entries(aiInsights.squadBalance.roleDistribution).map(([role, count]) => {
                          const inPlayingXI = playingXI.filter(p => p.role === role).length;
                          const backupOptions = count - inPlayingXI;
                          const coverageLevel = backupOptions >= 2 ? 'excellent' : backupOptions >= 1 ? 'good' : 'limited';
                          const coverageColor = coverageLevel === 'excellent' ? 'text-green-400' : 
                                              coverageLevel === 'good' ? 'text-yellow-400' : 'text-red-400';
                          
                          return (
                            <div key={role} className="p-3 bg-gray-700/30 rounded-lg">
                              <h4 className="text-white font-medium text-sm mb-2">{role}</h4>
                              <div className="space-y-1">
                                <p className="text-xs text-gray-400">Total: {count}</p>
                                <p className="text-xs text-gray-400">In XI: {inPlayingXI}</p>
                                <p className={`text-xs font-medium ${coverageColor}`}>
                                  Backup: {backupOptions} ({coverageLevel})
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {/* Best Backup Players */}
                      <div className="mt-6">
                        <h4 className="text-white font-medium mb-3">🔄 Best Backup Options</h4>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                          {selectedSquad
                            .filter(player => !playingXI.some(xi => xi.id === player.id) && !player.isInjured)
                            .sort((a, b) => {
                              const aScore = (a.currentForm === 'excellent' ? 4 : a.currentForm === 'good' ? 3 : 2) + 
                                           (a.fitness || 80) / 20 + (a.experience || 5) / 2;
                              const bScore = (b.currentForm === 'excellent' ? 4 : b.currentForm === 'good' ? 3 : 2) + 
                                           (b.fitness || 80) / 20 + (b.experience || 5) / 2;
                              return bScore - aScore;
                            })
                            .slice(0, 4)
                            .map((player) => (
                              <div key={player.id} className="p-3 bg-gray-700/50 rounded-lg">
                                <div className="flex items-center justify-between mb-2">
                                  <h5 className="text-white font-medium text-sm">{player.name}</h5>
                                  <span className={`text-xs px-2 py-1 rounded ${
                                    player.currentForm === 'excellent' ? 'bg-green-900 text-green-300' :
                                    player.currentForm === 'good' ? 'bg-blue-900 text-blue-300' :
                                    'bg-yellow-900 text-yellow-300'
                                  }`}>
                                    {player.currentForm}
                                  </span>
                                </div>
                                <div className="text-xs text-gray-400 space-y-1">
                                  <p>{player.role} | Fitness: {player.fitness}%</p>
                                  <p>Experience: {player.experience || 5}/10 | Rating: {player.lastPerformance?.rating || 6}/10</p>
                                </div>
                              </div>
                            ))}
                        </div>
                      </div>

                      {/* Squad Strength Indicators */}
                      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-gradient-to-br from-blue-900/30 to-blue-800/20 rounded-lg">
                          <h4 className="text-blue-300 font-medium mb-2">Overall Strength</h4>
                          <div className="text-2xl font-bold text-white mb-1">
                            {aiInsights.squadBalance.squadStrength}/100
                          </div>
                          <div className="text-xs text-gray-400">
                            Fitness • Form • Depth
                          </div>
                        </div>
                        
                        <div className="text-center p-4 bg-gradient-to-br from-green-900/30 to-green-800/20 rounded-lg">
                          <h4 className="text-green-300 font-medium mb-2">Squad Fitness</h4>
                          <div className="text-2xl font-bold text-white mb-1">
                            {aiInsights.squadBalance.averageFitness}%
                          </div>
                          <div className="text-xs text-gray-400">
                            Team Average
                          </div>
                        </div>

                        <div className="text-center p-4 bg-gradient-to-br from-purple-900/30 to-purple-800/20 rounded-lg">
                          <h4 className="text-purple-300 font-medium mb-2">Squad Age</h4>
                          <div className="text-2xl font-bold text-white mb-1">
                            {aiInsights.squadBalance.averageAge}
                          </div>
                          <div className="text-xs text-gray-400">
                            Years Average
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
            )}
          </TabsContent>
        </Tabs>
        
        {/* Player Comparison Dialog */}
        {showComparison && comparePlayer && (
          <Dialog open={showComparison} onOpenChange={setShowComparison}>
            <DialogContent className="max-w-4xl bg-gray-800 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white text-xl">
                  Player Comparison: {comparePlayer.name}
                </DialogTitle>
              </DialogHeader>
              
              <div className="space-y-6">
                {/* Selected Player Stats */}
                <Card className="bg-gray-700 border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-white text-lg flex items-center gap-2">
                      {comparePlayer.name}
                      <Badge className={`
                        ${comparePlayer.form === 'Excellent' ? 'bg-green-600' : 
                          comparePlayer.form === 'Good' ? 'bg-blue-600' : 
                          comparePlayer.form === 'Average' ? 'bg-yellow-600' : 'bg-red-600'}
                      `}>
                        {comparePlayer.form}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div className="space-y-1">
                        <p className="text-gray-400">Team</p>
                        <p className="text-white font-medium">{comparePlayer.team}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-400">Role</p>
                        <p className="text-white font-medium">{comparePlayer.role}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-400">Age</p>
                        <p className="text-white font-medium">{comparePlayer.age}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-400">Fitness</p>
                        <p className={`font-medium ${comparePlayer.fitness >= 85 ? 'text-green-400' : comparePlayer.fitness >= 70 ? 'text-yellow-400' : 'text-red-400'}`}>
                          {comparePlayer.fitness}%
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-400">Average</p>
                        <p className="text-white font-medium">{comparePlayer.stats.average}</p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-gray-400">Matches</p>
                        <p className="text-white font-medium">{comparePlayer.stats.matches}</p>
                      </div>
                      {comparePlayer.stats.strikeRate && (
                        <div className="space-y-1">
                          <p className="text-gray-400">Strike Rate</p>
                          <p className="text-white font-medium">{comparePlayer.stats.strikeRate}</p>
                        </div>
                      )}
                      {comparePlayer.stats.economyRate && (
                        <div className="space-y-1">
                          <p className="text-gray-400">Economy</p>
                          <p className="text-white font-medium">{comparePlayer.stats.economyRate}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Similar Players */}
                <Card className="bg-gray-700 border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-white text-lg">
                      Similar Players ({comparePlayer.role})
                    </CardTitle>
                    <CardDescription className="text-gray-400">
                      Players with similar roles and performance metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {getSimilarPlayers(comparePlayer).slice(0, 4).map((similarPlayer, index) => {
                        const comparisonScore = getPlayerComparisonScore(comparePlayer, similarPlayer);
                        return (
                          <div key={similarPlayer.id} className="flex items-center justify-between p-3 bg-gray-600/50 rounded-lg">
                            <div className="flex items-center gap-4">
                              <div className="text-center">
                                <div className="text-white font-medium text-sm">{similarPlayer.name}</div>
                                <div className="text-gray-400 text-xs">{similarPlayer.team}</div>
                              </div>
                              <div className="flex gap-4 text-xs">
                                <div className="text-center">
                                  <div className="text-gray-400">Avg</div>
                                  <div className="text-white font-medium">{similarPlayer.stats.average}</div>
                                </div>
                                <div className="text-center">
                                  <div className="text-gray-400">Form</div>
                                  <div className={`font-medium ${
                                    similarPlayer.form === 'Excellent' ? 'text-green-400' : 
                                    similarPlayer.form === 'Good' ? 'text-blue-400' : 
                                    similarPlayer.form === 'Average' ? 'text-yellow-400' : 'text-red-400'
                                  }`}>
                                    {similarPlayer.form}
                                  </div>
                                </div>
                                <div className="text-center">
                                  <div className="text-gray-400">Fitness</div>
                                  <div className={`font-medium ${
                                    similarPlayer.fitness >= 85 ? 'text-green-400' : 
                                    similarPlayer.fitness >= 70 ? 'text-yellow-400' : 'text-red-400'
                                  }`}>
                                    {similarPlayer.fitness}%
                                  </div>
                                </div>
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-gray-400 text-xs">Similarity</div>
                              <div className={`font-bold text-sm ${
                                comparisonScore >= 80 ? 'text-green-400' : 
                                comparisonScore >= 60 ? 'text-yellow-400' : 'text-red-400'
                              }`}>
                                {comparisonScore}%
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {getSimilarPlayers(comparePlayer).length === 0 && (
                      <div className="text-center py-6 text-gray-400">
                        No similar players found in current squad
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Comparison Actions */}
                <div className="flex justify-end gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setShowComparison(false)}
                    className="bg-gray-600 border-gray-500 text-white hover:bg-gray-500"
                  >
                    Close
                  </Button>
                  {!selectedSquad.some(p => p.id === comparePlayer.id) ? (
                    <Button 
                      onClick={() => {
                        handleSquadToggle(comparePlayer);
                        setShowComparison(false);
                        toast({
                          title: "Player Added",
                          description: `${comparePlayer.name} has been added to your squad`,
                        });
                      }}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Add to Squad
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => {
                        handleSquadToggle(comparePlayer);
                        setShowComparison(false);
                        toast({
                          title: "Player Removed",
                          description: `${comparePlayer.name} has been removed from your squad`,
                        });
                      }}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      Remove from Squad
                    </Button>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
}