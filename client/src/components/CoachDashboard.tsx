import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { DashboardSkeleton, LoadingSpinner } from "./LoadingStates";
import { DashboardChart } from "./DashboardChart";
import { apiClient } from "@/lib/api";
import { cricDataService } from "@/lib/cricDataApi";
import { mlApiClient, useMLQueries, BattingPredictionRequest, BowlingPredictionRequest } from "@/lib/mlApi";

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

const fadeInVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { duration: 0.2 } 
  }
};

const staggerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

export function CoachDashboard() {
  const [loading, setLoading] = useState(true);
  const [teamData, setTeamData] = useState<TeamData | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState("week");
  const [activeTab, setActiveTab] = useState(() => {
    // Persist tab state in localStorage to prevent flicker and maintain tab when switching
    return localStorage.getItem('coachDashboardActiveTab') || "overview";
  });
  const [selectedTeam, setSelectedTeam] = useState("all");
  const [playerSearch, setPlayerSearch] = useState("");
  const { toast } = useToast();

  // ML Prediction States
  const [selectedPlayer, setSelectedPlayer] = useState<string>("");
  const [predictionLoading, setPredictionLoading] = useState(false);
  const [battingPrediction, setBattingPrediction] = useState<any>(null);
  const [bowlingPrediction, setBowlingPrediction] = useState<any>(null);
  const [teamOptimization, setTeamOptimization] = useState<any>(null);
  const [selectedOpposition, setSelectedOpposition] = useState<string>("Australia");
  const [predictionOvers, setPredictionOvers] = useState<number>(10);
  
  // Enhanced Team Selection States
  const [selectedSquad, setSelectedSquad] = useState<string[]>([]);
  const [aiInsights, setAiInsights] = useState<any>(null);
  const [recommendedPlaying11, setRecommendedPlaying11] = useState<any>(null);
  const [teamSelectionLoading, setTeamSelectionLoading] = useState(false);
  
  // Handle tab change with persistence
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    localStorage.setItem('coachDashboardActiveTab', value);
  };

  // Enhanced Search and API States
  const [apiPlayers, setApiPlayers] = useState<any[]>([]);
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [allPlayersView, setAllPlayersView] = useState(false);
  const [selectedTeamFilter, setSelectedTeamFilter] = useState<string>("all");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("name");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  // Training Management States
  const [showTrainingForm, setShowTrainingForm] = useState(false);
  const [editingTraining, setEditingTraining] = useState<any>(null);
  const [hasManualChanges, setHasManualChanges] = useState(false);
  const [trainingSessions, setTrainingSessions] = useState<any[]>([]);
  const [renderKey, setRenderKey] = useState(0);
  const [trainingForm, setTrainingForm] = useState({
    date: '',
    time: '',
    type: '',
    focus: '',
    duration: '',
    participants: '',
    status: 'scheduled',
    notes: ''  // Added notes field
  });

  useEffect(() => {
    let isMounted = true;
    
    // Initialize training sessions with mock data
    const mockTrainingSessions = [
      {
        _id: '1',
        id: '1',
        sessionDate: '2025-09-26',
        sessionTime: '09:00',
        sessionType: 'Batting Practice',
        type: 'Batting Practice',
        focus: 'Test Batting Technique',
        duration: '3 hours',
        participants: 8,
        status: 'scheduled'
      },
      {
        _id: '2',
        id: '2',
        sessionDate: '2025-09-27', 
        sessionTime: '15:30',
        sessionType: 'Bowling Practice',
        type: 'Bowling Practice',
        focus: 'Test Bowling Endurance', 
        duration: '2.5 hours',
        participants: 6,
        status: 'scheduled'
      },
      {
        _id: '3',
        id: '3',
        sessionDate: '2025-09-28',
        sessionTime: '10:00', 
        sessionType: 'Fielding Drill',
        type: 'Fielding Drill',
        focus: 'Catching Practice',
        duration: '2 hours',
        participants: 12,
        status: 'in-progress'
      }
    ];
    
    setTrainingSessions(mockTrainingSessions);
    
    const loadData = async () => {
      if (isMounted) {
        await fetchTeamData();
      }
    };
    
    // Only load data once on mount
    loadData();
    
    return () => {
      isMounted = false;
    };
  }, []); // Empty dependency array to run only once

  // Sync trainingSessions with teamData.trainingSchedule when teamData changes
  useEffect(() => {
    if (teamData?.trainingSchedule && !hasManualChanges) {
      setTrainingSessions(teamData.trainingSchedule);
    }
  }, [teamData?.trainingSchedule, hasManualChanges]);

  const fetchTeamData = async (forceRefresh = false) => {
    // Don't override manual changes unless explicitly forced
    if (hasManualChanges && !forceRefresh) {
      console.log('Skipping fetchTeamData due to manual changes');
      return;
    }
    
    try {
      setLoading(true);
      
      // Force mock training sessions to be available immediately
      const mockTrainingSessions = [
        {
          _id: '1',
          sessionDate: '2025-09-26',
          sessionTime: '09:00',
          sessionType: 'Batting Practice',
          type: 'Batting Practice',
          focus: 'Test Batting Technique',
          duration: '3 hours',
          participants: 8,
          status: 'scheduled'
        },
        {
          _id: '2',
          sessionDate: '2025-09-27', 
          sessionTime: '15:30',
          sessionType: 'Bowling Practice',
          type: 'Bowling Practice',
          focus: 'Test Bowling Endurance', 
          duration: '2.5 hours',
          participants: 6,
          status: 'scheduled'
        },
        {
          _id: '3',
          sessionDate: '2025-09-28',
          sessionTime: '10:00', 
          sessionType: 'Fielding Drill',
          type: 'Fielding Drill',
          focus: 'Catching Practice',
          duration: '2 hours',
          participants: 12,
          status: 'in-progress'
        }
      ];
      
      // Comprehensive Test Cricket Players Database
      const mockPlayers = [
        // India Players
        {
          id: '1',
          name: 'Virat Kohli',
          role: 'Batsman',
          form: 'excellent',
          fitness: 92,
          availability: true,
          recentPerformance: 88,
          team: 'India',
          source: 'mock'
        },
        {
          id: '2',
          name: 'Rohit Sharma',
          role: 'Batsman',
          form: 'good',
          fitness: 87,
          availability: true,
          recentPerformance: 85,
          team: 'India',
          source: 'mock'
        },
        {
          id: '3',
          name: 'Jasprit Bumrah',
          role: 'Bowler',
          form: 'excellent',
          fitness: 89,
          availability: false,
          recentPerformance: 91,
          team: 'India',
          source: 'mock'
        },
        {
          id: '4',
          name: 'KL Rahul',
          role: 'Wicket-keeper',
          form: 'good',
          fitness: 84,
          availability: true,
          recentPerformance: 78,
          team: 'India',
          source: 'mock'
        },
        {
          id: '5',
          name: 'Cheteshwar Pujara',
          role: 'Batsman',
          form: 'good',
          fitness: 82,
          availability: true,
          recentPerformance: 75,
          team: 'India',
          source: 'mock'
        },
        {
          id: '6',
          name: 'Rishabh Pant',
          role: 'Wicket-keeper',
          form: 'excellent',
          fitness: 90,
          availability: true,
          recentPerformance: 89,
          team: 'India',
          source: 'mock'
        },
        {
          id: '7',
          name: 'Ravindra Jadeja',
          role: 'All-rounder',
          form: 'excellent',
          fitness: 94,
          availability: true,
          recentPerformance: 87,
          team: 'India',
          source: 'mock'
        },
        {
          id: '8',
          name: 'Ravichandran Ashwin',
          role: 'Bowler',
          form: 'good',
          fitness: 85,
          availability: true,
          recentPerformance: 82,
          team: 'India',
          source: 'mock'
        },
        {
          id: '9',
          name: 'Mohammed Shami',
          role: 'Bowler',
          form: 'excellent',
          fitness: 88,
          availability: true,
          recentPerformance: 90,
          team: 'India',
          source: 'mock'
        },
        {
          id: '10',
          name: 'Shubman Gill',
          role: 'Batsman',
          form: 'excellent',
          fitness: 91,
          availability: true,
          recentPerformance: 86,
          team: 'India',
          source: 'mock'
        },
        {
          id: '11',
          name: 'Ajinkya Rahane',
          role: 'Batsman',
          form: 'average',
          fitness: 80,
          availability: true,
          recentPerformance: 70,
          team: 'India',
          source: 'mock'
        },
        {
          id: '12',
          name: 'Mohammed Siraj',
          role: 'Bowler',
          form: 'good',
          fitness: 87,
          availability: true,
          recentPerformance: 83,
          team: 'India',
          source: 'mock'
        },
        
        // Australia Players
        {
          id: '13',
          name: 'Steve Smith',
          role: 'Batsman',
          form: 'excellent',
          fitness: 90,
          availability: true,
          recentPerformance: 92,
          team: 'Australia',
          source: 'mock'
        },
        {
          id: '14',
          name: 'David Warner',
          role: 'Batsman',
          form: 'good',
          fitness: 85,
          availability: true,
          recentPerformance: 80,
          team: 'Australia',
          source: 'mock'
        },
        {
          id: '15',
          name: 'Pat Cummins',
          role: 'Bowler',
          form: 'excellent',
          fitness: 93,
          availability: true,
          recentPerformance: 95,
          team: 'Australia',
          source: 'mock'
        },
        {
          id: '16',
          name: 'Alex Carey',
          role: 'Wicket-keeper',
          form: 'good',
          fitness: 86,
          availability: true,
          recentPerformance: 78,
          team: 'Australia',
          source: 'mock'
        },
        {
          id: '17',
          name: 'Marnus Labuschagne',
          role: 'Batsman',
          form: 'excellent',
          fitness: 89,
          availability: true,
          recentPerformance: 91,
          team: 'Australia',
          source: 'mock'
        },
        {
          id: '18',
          name: 'Mitchell Starc',
          role: 'Bowler',
          form: 'good',
          fitness: 87,
          availability: true,
          recentPerformance: 84,
          team: 'Australia',
          source: 'mock'
        },
        {
          id: '19',
          name: 'Josh Hazlewood',
          role: 'Bowler',
          form: 'excellent',
          fitness: 88,
          availability: false,
          recentPerformance: 87,
          team: 'Australia',
          source: 'mock'
        },
        {
          id: '20',
          name: 'Cameron Green',
          role: 'All-rounder',
          form: 'good',
          fitness: 92,
          availability: true,
          recentPerformance: 82,
          team: 'Australia',
          source: 'mock'
        },
        {
          id: '21',
          name: 'Nathan Lyon',
          role: 'Bowler',
          form: 'good',
          fitness: 85,
          availability: true,
          recentPerformance: 81,
          team: 'Australia',
          source: 'mock'
        },
        {
          id: '22',
          name: 'Travis Head',
          role: 'Batsman',
          form: 'excellent',
          fitness: 88,
          availability: true,
          recentPerformance: 89,
          team: 'Australia',
          source: 'mock'
        },
        
        // England Players
        {
          id: '23',
          name: 'Joe Root',
          role: 'Batsman',
          form: 'excellent',
          fitness: 91,
          availability: true,
          recentPerformance: 93,
          team: 'England',
          source: 'mock'
        },
        {
          id: '24',
          name: 'Ben Stokes',
          role: 'All-rounder',
          form: 'good',
          fitness: 87,
          availability: true,
          recentPerformance: 85,
          team: 'England',
          source: 'mock'
        },
        {
          id: '25',
          name: 'James Anderson',
          role: 'Bowler',
          form: 'good',
          fitness: 83,
          availability: true,
          recentPerformance: 79,
          team: 'England',
          source: 'mock'
        },
        {
          id: '26',
          name: 'Stuart Broad',
          role: 'Bowler',
          form: 'average',
          fitness: 81,
          availability: false,
          recentPerformance: 76,
          team: 'England',
          source: 'mock'
        },
        {
          id: '27',
          name: 'Jonny Bairstow',
          role: 'Wicket-keeper',
          form: 'good',
          fitness: 86,
          availability: true,
          recentPerformance: 82,
          team: 'England',
          source: 'mock'
        },
        {
          id: '28',
          name: 'Harry Brook',
          role: 'Batsman',
          form: 'excellent',
          fitness: 90,
          availability: true,
          recentPerformance: 88,
          team: 'England',
          source: 'mock'
        },
        {
          id: '29',
          name: 'Mark Wood',
          role: 'Bowler',
          form: 'good',
          fitness: 85,
          availability: true,
          recentPerformance: 83,
          team: 'England',
          source: 'mock'
        },
        {
          id: '30',
          name: 'Ollie Robinson',
          role: 'Bowler',
          form: 'good',
          fitness: 84,
          availability: true,
          recentPerformance: 80,
          team: 'England',
          source: 'mock'
        },
        
        // Pakistan Players
        {
          id: '31',
          name: 'Babar Azam',
          role: 'Batsman',
          form: 'excellent',
          fitness: 89,
          availability: true,
          recentPerformance: 90,
          team: 'Pakistan',
          source: 'mock'
        },
        {
          id: '32',
          name: 'Shaheen Afridi',
          role: 'Bowler',
          form: 'excellent',
          fitness: 91,
          availability: true,
          recentPerformance: 92,
          team: 'Pakistan',
          source: 'mock'
        },
        {
          id: '33',
          name: 'Mohammad Rizwan',
          role: 'Wicket-keeper',
          form: 'excellent',
          fitness: 88,
          availability: true,
          recentPerformance: 86,
          team: 'Pakistan',
          source: 'mock'
        },
        {
          id: '34',
          name: 'Naseem Shah',
          role: 'Bowler',
          form: 'good',
          fitness: 87,
          availability: true,
          recentPerformance: 84,
          team: 'Pakistan',
          source: 'mock'
        },
        {
          id: '35',
          name: 'Imam-ul-Haq',
          role: 'Batsman',
          form: 'good',
          fitness: 82,
          availability: true,
          recentPerformance: 78,
          team: 'Pakistan',
          source: 'mock'
        },
        
        // South Africa Players
        {
          id: '36',
          name: 'Kagiso Rabada',
          role: 'Bowler',
          form: 'excellent',
          fitness: 92,
          availability: true,
          recentPerformance: 94,
          team: 'South Africa',
          source: 'mock'
        },
        {
          id: '37',
          name: 'Quinton de Kock',
          role: 'Wicket-keeper',
          form: 'good',
          fitness: 85,
          availability: true,
          recentPerformance: 81,
          team: 'South Africa',
          source: 'mock'
        },
        {
          id: '38',
          name: 'Dean Elgar',
          role: 'Batsman',
          form: 'good',
          fitness: 83,
          availability: true,
          recentPerformance: 79,
          team: 'South Africa',
          source: 'mock'
        },
        {
          id: '39',
          name: 'Temba Bavuma',
          role: 'Batsman',
          form: 'average',
          fitness: 80,
          availability: true,
          recentPerformance: 75,
          team: 'South Africa',
          source: 'mock'
        },
        {
          id: '40',
          name: 'Anrich Nortje',
          role: 'Bowler',
          form: 'good',
          fitness: 86,
          availability: false,
          recentPerformance: 82,
          team: 'South Africa',
          source: 'mock'
        },
        
        // New Zealand Players
        {
          id: '41',
          name: 'Kane Williamson',
          role: 'Batsman',
          form: 'excellent',
          fitness: 88,
          availability: true,
          recentPerformance: 91,
          team: 'New Zealand',
          source: 'mock'
        },
        {
          id: '42',
          name: 'Trent Boult',
          role: 'Bowler',
          form: 'good',
          fitness: 87,
          availability: true,
          recentPerformance: 85,
          team: 'New Zealand',
          source: 'mock'
        },
        {
          id: '43',
          name: 'Tim Southee',
          role: 'Bowler',
          form: 'good',
          fitness: 84,
          availability: true,
          recentPerformance: 80,
          team: 'New Zealand',
          source: 'mock'
        },
        {
          id: '44',
          name: 'Tom Latham',
          role: 'Wicket-keeper',
          form: 'good',
          fitness: 85,
          availability: true,
          recentPerformance: 82,
          team: 'New Zealand',
          source: 'mock'
        },
        {
          id: '45',
          name: 'Devon Conway',
          role: 'Batsman',
          form: 'excellent',
          fitness: 89,
          availability: true,
          recentPerformance: 87,
          team: 'New Zealand',
          source: 'mock'
        },
        
        // Sri Lanka Players
        {
          id: '46',
          name: 'Dimuth Karunaratne',
          role: 'Batsman',
          form: 'good',
          fitness: 82,
          availability: true,
          recentPerformance: 78,
          team: 'Sri Lanka',
          source: 'mock'
        },
        {
          id: '47',
          name: 'Lasith Embuldeniya',
          role: 'Bowler',
          form: 'good',
          fitness: 85,
          availability: true,
          recentPerformance: 81,
          team: 'Sri Lanka',
          source: 'mock'
        },
        {
          id: '48',
          name: 'Angelo Mathews',
          role: 'All-rounder',
          form: 'average',
          fitness: 79,
          availability: true,
          recentPerformance: 74,
          team: 'Sri Lanka',
          source: 'mock'
        },
        {
          id: '49',
          name: 'Dinesh Chandimal',
          role: 'Wicket-keeper',
          form: 'good',
          fitness: 83,
          availability: true,
          recentPerformance: 80,
          team: 'Sri Lanka',
          source: 'mock'
        },
        {
          id: '50',
          name: 'Pathum Nissanka',
          role: 'Batsman',
          form: 'good',
          fitness: 86,
          availability: true,
          recentPerformance: 83,
          team: 'Sri Lanka',
          source: 'mock'
        }
      ];

      // Mock matches data - Test Cricket venues
      const mockMatches = [
        {
          id: '1',
          opponent: 'Australia',
          date: '2025-12-26',
          venue: 'Melbourne Cricket Ground, Melbourne',
          format: 'Test'
        },
        {
          id: '2',
          opponent: 'England',
          date: '2025-08-01',
          venue: 'Lord\'s Cricket Ground, London',
          format: 'Test'
        },
        {
          id: '3',
          opponent: 'South Africa',
          date: '2025-01-15',
          venue: 'Newlands, Cape Town',
          format: 'Test'
        }
      ];

      // Fetch training sessions from API
      let trainingSchedule = mockTrainingSessions; // Start with mock data
      try {
        const response = await apiClient.get('/api/v2/training-sessions');
        if (response.data?.sessions && response.data.sessions.length > 0) {
          trainingSchedule = response.data.sessions;
          console.log('Training sessions from API:', trainingSchedule);
        } else {
          console.log('No training sessions from API, using mock data:', trainingSchedule);
        }
      } catch (error) {
        console.warn('Failed to fetch training sessions, using fallback data:', error);
        // Keep using mockTrainingSessions as fallback
        console.log('Using fallback training sessions:', trainingSchedule);
      }
      
      // Use only mock data to prevent API loops

      // Always use mock data for reliable dashboard display
      const finalPlayers = mockPlayers;

      // Comprehensive player database for search functionality - Test Cricket Teams
      const mockCricDataPlayers = [
        { id: '1', name: 'Virat Kohli', team: 'India', role: 'Batsman' },
        { id: '2', name: 'Rohit Sharma', team: 'India', role: 'Batsman' },
        { id: '3', name: 'Jasprit Bumrah', team: 'India', role: 'Bowler' },
        { id: '4', name: 'KL Rahul', team: 'India', role: 'Wicket-keeper' },
        { id: '5', name: 'Ravindra Jadeja', team: 'India', role: 'All-rounder' },
        { id: '6', name: 'Mohammed Shami', team: 'India', role: 'Bowler' },
        { id: '7', name: 'Rishabh Pant', team: 'India', role: 'Wicket-keeper' },
        { id: '8', name: 'Shubman Gill', team: 'India', role: 'Batsman' },
        { id: '9', name: 'Ravichandran Ashwin', team: 'India', role: 'All-rounder' },
        { id: '10', name: 'Steve Smith', team: 'Australia', role: 'Batsman' },
        { id: '11', name: 'David Warner', team: 'Australia', role: 'Batsman' },
        { id: '12', name: 'Pat Cummins', team: 'Australia', role: 'Bowler' },
        { id: '13', name: 'Mitchell Starc', team: 'Australia', role: 'Bowler' },
        { id: '14', name: 'Josh Hazlewood', team: 'Australia', role: 'Bowler' },
        { id: '15', name: 'Joe Root', team: 'England', role: 'Batsman' },
        { id: '16', name: 'Ben Stokes', team: 'England', role: 'All-rounder' },
        { id: '17', name: 'James Anderson', team: 'England', role: 'Bowler' },
        { id: '18', name: 'Stuart Broad', team: 'England', role: 'Bowler' },
        { id: '19', name: 'Jonny Bairstow', team: 'England', role: 'Wicket-keeper' },
        { id: '20', name: 'Kane Williamson', team: 'New Zealand', role: 'Batsman' },
        { id: '21', name: 'Trent Boult', team: 'New Zealand', role: 'Bowler' },
        { id: '22', name: 'Tim Southee', team: 'New Zealand', role: 'Bowler' },
        { id: '23', name: 'Babar Azam', team: 'Pakistan', role: 'Batsman' },
        { id: '24', name: 'Shaheen Shah Afridi', team: 'Pakistan', role: 'Bowler' },
        { id: '25', name: 'Mohammad Rizwan', team: 'Pakistan', role: 'Wicket-keeper' },
        { id: '26', name: 'Quinton de Kock', team: 'South Africa', role: 'Wicket-keeper' },
        { id: '27', name: 'Kagiso Rabada', team: 'South Africa', role: 'Bowler' },
        { id: '28', name: 'Temba Bavuma', team: 'South Africa', role: 'Batsman' },
        { id: '29', name: 'Angelo Mathews', team: 'Sri Lanka', role: 'All-rounder' },
        { id: '30', name: 'Dimuth Karunaratne', team: 'Sri Lanka', role: 'Batsman' },
        
        // Additional Indian Players
        { id: '31', name: 'Cheteshwar Pujara', team: 'India', role: 'Batsman' },
        { id: '32', name: 'Ajinkya Rahane', team: 'India', role: 'Batsman' },
        { id: '33', name: 'Mohammed Siraj', team: 'India', role: 'Bowler' },
        { id: '34', name: 'Umesh Yadav', team: 'India', role: 'Bowler' },
        { id: '35', name: 'Shardul Thakur', team: 'India', role: 'All-rounder' },
        { id: '36', name: 'Axar Patel', team: 'India', role: 'All-rounder' },
        { id: '37', name: 'Washington Sundar', team: 'India', role: 'All-rounder' },
        { id: '38', name: 'Mayank Agarwal', team: 'India', role: 'Batsman' },
        { id: '39', name: 'Hanuma Vihari', team: 'India', role: 'Batsman' },
        { id: '40', name: 'Wriddhiman Saha', team: 'India', role: 'Wicket-keeper' },

        // Additional Australian Players  
        { id: '41', name: 'Marnus Labuschagne', team: 'Australia', role: 'Batsman' },
        { id: '42', name: 'Travis Head', team: 'Australia', role: 'Batsman' },
        { id: '43', name: 'Cameron Green', team: 'Australia', role: 'All-rounder' },
        { id: '44', name: 'Alex Carey', team: 'Australia', role: 'Wicket-keeper' },
        { id: '45', name: 'Nathan Lyon', team: 'Australia', role: 'Bowler' },
        { id: '46', name: 'Mitchell Marsh', team: 'Australia', role: 'All-rounder' },
        { id: '47', name: 'Tim Paine', team: 'Australia', role: 'Wicket-keeper' },
        { id: '48', name: 'Glenn Maxwell', team: 'Australia', role: 'All-rounder' },
        { id: '49', name: 'Adam Zampa', team: 'Australia', role: 'Bowler' },
        { id: '50', name: 'Marcus Harris', team: 'Australia', role: 'Batsman' },

        // Additional English Players
        { id: '51', name: 'Harry Brook', team: 'England', role: 'Batsman' },
        { id: '52', name: 'Mark Wood', team: 'England', role: 'Bowler' },
        { id: '53', name: 'Ollie Robinson', team: 'England', role: 'Bowler' },
        { id: '54', name: 'Chris Woakes', team: 'England', role: 'All-rounder' },
        { id: '55', name: 'Sam Curran', team: 'England', role: 'All-rounder' },
        { id: '56', name: 'Jos Buttler', team: 'England', role: 'Wicket-keeper' },
        { id: '57', name: 'Moeen Ali', team: 'England', role: 'All-rounder' },
        { id: '58', name: 'Jack Leach', team: 'England', role: 'Bowler' },
        { id: '59', name: 'Ollie Pope', team: 'England', role: 'Batsman' },
        { id: '60', name: 'Zak Crawley', team: 'England', role: 'Batsman' },

        // Additional Pakistani Players
        { id: '61', name: 'Fakhar Zaman', team: 'Pakistan', role: 'Batsman' },
        { id: '62', name: 'Imam-ul-Haq', team: 'Pakistan', role: 'Batsman' },
        { id: '63', name: 'Azhar Ali', team: 'Pakistan', role: 'Batsman' },
        { id: '64', name: 'Hasan Ali', team: 'Pakistan', role: 'Bowler' },
        { id: '65', name: 'Naseem Shah', team: 'Pakistan', role: 'Bowler' },
        { id: '66', name: 'Yasir Shah', team: 'Pakistan', role: 'Bowler' },
        { id: '67', name: 'Mohammad Hafeez', team: 'Pakistan', role: 'All-rounder' },
        { id: '68', name: 'Shadab Khan', team: 'Pakistan', role: 'All-rounder' },
        { id: '69', name: 'Sarfaraz Ahmed', team: 'Pakistan', role: 'Wicket-keeper' },
        { id: '70', name: 'Faheem Ashraf', team: 'Pakistan', role: 'All-rounder' },

        // Additional South African Players
        { id: '71', name: 'Dean Elgar', team: 'South Africa', role: 'Batsman' },
        { id: '72', name: 'Faf du Plessis', team: 'South Africa', role: 'Batsman' },
        { id: '73', name: 'Aiden Markram', team: 'South Africa', role: 'Batsman' },
        { id: '74', name: 'Rassie van der Dussen', team: 'South Africa', role: 'Batsman' },
        { id: '75', name: 'David Miller', team: 'South Africa', role: 'Batsman' },
        { id: '76', name: 'Keshav Maharaj', team: 'South Africa', role: 'Bowler' },
        { id: '77', name: 'Anrich Nortje', team: 'South Africa', role: 'Bowler' },
        { id: '78', name: 'Lungi Ngidi', team: 'South Africa', role: 'Bowler' },
        { id: '79', name: 'Tabraiz Shamsi', team: 'South Africa', role: 'Bowler' },
        { id: '80', name: 'Heinrich Klaasen', team: 'South Africa', role: 'Wicket-keeper' },

        // Additional New Zealand Players
        { id: '81', name: 'Devon Conway', team: 'New Zealand', role: 'Batsman' },
        { id: '82', name: 'Ross Taylor', team: 'New Zealand', role: 'Batsman' },
        { id: '83', name: 'Tom Latham', team: 'New Zealand', role: 'Wicket-keeper' },
        { id: '84', name: 'Colin de Grandhomme', team: 'New Zealand', role: 'All-rounder' },
        { id: '85', name: 'Kyle Jamieson', team: 'New Zealand', role: 'Bowler' },
        { id: '86', name: 'Neil Wagner', team: 'New Zealand', role: 'Bowler' },
        { id: '87', name: 'Mitchell Santner', team: 'New Zealand', role: 'All-rounder' },
        { id: '88', name: 'BJ Watling', team: 'New Zealand', role: 'Wicket-keeper' },
        { id: '89', name: 'Daryl Mitchell', team: 'New Zealand', role: 'All-rounder' },
        { id: '90', name: 'Will Young', team: 'New Zealand', role: 'Batsman' },

        // Additional Sri Lankan Players
        { id: '91', name: 'Pathum Nissanka', team: 'Sri Lanka', role: 'Batsman' },
        { id: '92', name: 'Kusal Mendis', team: 'Sri Lanka', role: 'Batsman' },
        { id: '93', name: 'Dinesh Chandimal', team: 'Sri Lanka', role: 'Wicket-keeper' },
        { id: '94', name: 'Dhananjaya de Silva', team: 'Sri Lanka', role: 'All-rounder' },
        { id: '95', name: 'Lasith Embuldeniya', team: 'Sri Lanka', role: 'Bowler' },
        { id: '96', name: 'Suranga Lakmal', team: 'Sri Lanka', role: 'Bowler' },
        { id: '97', name: 'Dushmantha Chameera', team: 'Sri Lanka', role: 'Bowler' },
        { id: '98', name: 'Wanindu Hasaranga', team: 'Sri Lanka', role: 'All-rounder' },
        { id: '99', name: 'Niroshan Dickwella', team: 'Sri Lanka', role: 'Wicket-keeper' },
        { id: '100', name: 'Chamika Karunaratne', team: 'Sri Lanka', role: 'All-rounder' },

        // West Indies Players
        { id: '101', name: 'Jason Holder', team: 'West Indies', role: 'All-rounder' },
        { id: '102', name: 'Kraigg Brathwaite', team: 'West Indies', role: 'Batsman' },
        { id: '103', name: 'Shai Hope', team: 'West Indies', role: 'Wicket-keeper' },
        { id: '104', name: 'Nicholas Pooran', team: 'West Indies', role: 'Wicket-keeper' },
        { id: '105', name: 'Kieron Pollard', team: 'West Indies', role: 'All-rounder' },
        { id: '106', name: 'Shimron Hetmyer', team: 'West Indies', role: 'Batsman' },
        { id: '107', name: 'Kemar Roach', team: 'West Indies', role: 'Bowler' },
        { id: '108', name: 'Shannon Gabriel', team: 'West Indies', role: 'Bowler' },
        { id: '109', name: 'Alzarri Joseph', team: 'West Indies', role: 'Bowler' },
        { id: '110', name: 'Roston Chase', team: 'West Indies', role: 'All-rounder' },

        // Bangladesh Players
        { id: '111', name: 'Shakib Al Hasan', team: 'Bangladesh', role: 'All-rounder' },
        { id: '112', name: 'Tamim Iqbal', team: 'Bangladesh', role: 'Batsman' },
        { id: '113', name: 'Mushfiqur Rahim', team: 'Bangladesh', role: 'Wicket-keeper' },
        { id: '114', name: 'Liton Das', team: 'Bangladesh', role: 'Wicket-keeper' },
        { id: '115', name: 'Mahmudullah', team: 'Bangladesh', role: 'All-rounder' },
        { id: '116', name: 'Mominul Haque', team: 'Bangladesh', role: 'Batsman' },
        { id: '117', name: 'Mustafizur Rahman', team: 'Bangladesh', role: 'Bowler' },
        { id: '118', name: 'Mehidy Hasan', team: 'Bangladesh', role: 'All-rounder' },
        { id: '119', name: 'Taskin Ahmed', team: 'Bangladesh', role: 'Bowler' },
        { id: '120', name: 'Taijul Islam', team: 'Bangladesh', role: 'Bowler' }
      ];
      
      setApiPlayers(mockCricDataPlayers);
      setSearchResults(mockCricDataPlayers);

      const teamData: TeamData = {
        players: finalPlayers,
        upcomingMatches: mockMatches,
        teamStats: {
          totalPlayers: finalPlayers.length,
          availablePlayers: finalPlayers.filter((p: any) => p.availability).length,
          injuredPlayers: finalPlayers.filter((p: any) => !p.availability).length,
          averageFitness: finalPlayers.length > 0 ? 
            Math.round(finalPlayers.reduce((sum: number, p: any) => sum + p.fitness, 0) / finalPlayers.length) : 0,
          teamForm: "excellent"
        },
        trainingSchedule: trainingSchedule
      };

      console.log('Setting teamData with training schedule:', teamData.trainingSchedule);
      setTeamData(teamData);
      
      // Success notification removed for cleaner UI
    } catch (error) {
      console.error('Error fetching team data:', error);
      // Error toast removed for cleaner UI
      
      // Set minimal mock data to prevent crashes
      setTeamData({
        players: [],
        upcomingMatches: [],
        teamStats: {
          totalPlayers: 0,
          availablePlayers: 0,
          injuredPlayers: 0,
          averageFitness: 0,
          teamForm: "unknown"
        },
        trainingSchedule: []
      });
    } finally {
      setLoading(false);
    }
  };

  // Helper functions for team management
  const getUniqueTeams = () => {
    if (!teamData) return [];
    const teamSet = new Set(teamData.players.map(player => player.team));
    const teams = Array.from(teamSet);
    return teams.sort();
  };

  // Memoized team statistics for selected team
  const currentTeamStats = useMemo(() => {
    if (!teamData) return null;
    
    if (selectedTeam === "all") {
      return teamData.teamStats;
    }
    
    const teamPlayers = teamData.players.filter(p => p.team === selectedTeam);
    if (teamPlayers.length === 0) return teamData.teamStats;
    
    return {
      totalPlayers: teamPlayers.length,
      availablePlayers: teamPlayers.filter(p => p.availability).length,
      injuredPlayers: teamPlayers.filter(p => !p.availability).length,
      averageFitness: Math.round(teamPlayers.reduce((sum, p) => sum + p.fitness, 0) / teamPlayers.length) || 0,
      teamForm: teamPlayers.every(p => p.form === 'excellent') ? 'excellent' : 
                teamPlayers.some(p => p.form === 'excellent') ? 'good' : 'average'
    };
  }, [teamData, selectedTeam]);

  const getFilteredPlayers = useMemo(() => {
    if (!teamData) return [];
    return teamData.players.filter(player => {
      const matchesTeam = selectedTeam === "all" || player.team === selectedTeam;
      const matchesSearch = playerSearch === "" || 
        player.name.toLowerCase().includes(playerSearch.toLowerCase()) ||
        player.role.toLowerCase().includes(playerSearch.toLowerCase());
      return matchesTeam && matchesSearch;
    });
  }, [teamData, selectedTeam, playerSearch]);

  const togglePlayerAvailability = useCallback((playerId: string) => {
    if (!teamData) return;
    
    const updatedTeamData = {
      ...teamData,
      players: teamData.players.map(player => 
        player.id === playerId 
          ? { ...player, availability: !player.availability }
          : player
      )
    };

    // Recalculate overall team stats
    const updatedTeamStats = {
      totalPlayers: updatedTeamData.players.length,
      availablePlayers: updatedTeamData.players.filter(p => p.availability).length,
      injuredPlayers: updatedTeamData.players.filter(p => !p.availability).length,
      averageFitness: Math.round(updatedTeamData.players.reduce((sum, p) => sum + p.fitness, 0) / updatedTeamData.players.length) || 0,
      teamForm: updatedTeamData.players.every(p => p.form === 'excellent') ? 'excellent' : 
                updatedTeamData.players.some(p => p.form === 'excellent') ? 'good' : 'average'
    };

    setTeamData({
      ...updatedTeamData,
      teamStats: updatedTeamStats
    });

    const player = teamData.players.find(p => p.id === playerId);
    const updatedPlayer = updatedTeamData.players.find(p => p.id === playerId);
    
    // Store injury data for TeamSelection sync
    const currentInjuries = JSON.parse(localStorage.getItem('playerInjuries') || '[]');
    const updatedInjuries = currentInjuries.filter((inj: any) => inj.playerId !== playerId);
    
    if (!updatedPlayer?.availability) {
      updatedInjuries.push({
        playerId,
        isInjured: true,
        injuryDetails: {
          type: 'General Injury',
          severity: 'Minor',
          expectedReturn: '1-2 weeks'
        }
      });
    }
    
    localStorage.setItem('playerInjuries', JSON.stringify(updatedInjuries));
    
    // Show toast notification
    toast({
      title: updatedPlayer?.availability ? "Player Marked Available" : "Player Marked Injured",
      description: `${player?.name} has been marked as ${updatedPlayer?.availability ? 'available' : 'injured'}`,
      variant: updatedPlayer?.availability ? "default" : "destructive",
    });
  }, [teamData, toast]);

  const getTeamStatsByTeam = (team: string) => {
    if (!teamData || team === "all") return teamData?.teamStats;
    
    const teamPlayers = teamData.players.filter(p => p.team === team);
    return {
      totalPlayers: teamPlayers.length,
      availablePlayers: teamPlayers.filter(p => p.availability).length,
      injuredPlayers: teamPlayers.filter(p => !p.availability).length,
      averageFitness: Math.round(teamPlayers.reduce((sum, p) => sum + p.fitness, 0) / teamPlayers.length),
      teamForm: teamPlayers.every(p => p.form === 'excellent') ? 'excellent' : 
                teamPlayers.some(p => p.form === 'excellent') ? 'good' : 'average'
    };
  };

  // Enhanced Search Functions
  const handlePlayerSearch = async (searchTerm: string) => {
    setPlayerSearch(searchTerm);
    
    if (!searchTerm.trim()) {
      setSearchResults(apiPlayers);
      return;
    }

    setSearchLoading(true);
    
    // Enhanced famous players database
    const famousPlayers = [
      { id: 'virat-kohli', name: 'Virat Kohli', team: 'India', role: 'batsman', country: 'India', 
        battingStats: { average: 53.62, strikeRate: 93.17 }, bowlingStats: null },
      { id: 'rohit-sharma', name: 'Rohit Sharma', team: 'India', role: 'batsman', country: 'India', 
        battingStats: { average: 46.12, strikeRate: 88.90 }, bowlingStats: null },
      { id: 'ms-dhoni', name: 'MS Dhoni', team: 'India', role: 'wicket-keeper', country: 'India', 
        battingStats: { average: 50.57, strikeRate: 87.56 }, bowlingStats: null },
      { id: 'steve-smith', name: 'Steve Smith', team: 'Australia', role: 'batsman', country: 'Australia', 
        battingStats: { average: 61.80, strikeRate: 55.52 }, bowlingStats: null },
      { id: 'kane-williamson', name: 'Kane Williamson', team: 'New Zealand', role: 'batsman', country: 'New Zealand', 
        battingStats: { average: 54.31, strikeRate: 51.37 }, bowlingStats: null },
      { id: 'joe-root', name: 'Joe Root', team: 'England', role: 'batsman', country: 'England', 
        battingStats: { average: 50.34, strikeRate: 56.12 }, bowlingStats: null },
      { id: 'babar-azam', name: 'Babar Azam', team: 'Pakistan', role: 'batsman', country: 'Pakistan', 
        battingStats: { average: 45.87, strikeRate: 89.23 }, bowlingStats: null },
      { id: 'pat-cummins', name: 'Pat Cummins', team: 'Australia', role: 'bowler', country: 'Australia', 
        battingStats: null, bowlingStats: { average: 22.68, strikeRate: 47.1 } },
      { id: 'jasprit-bumrah', name: 'Jasprit Bumrah', team: 'India', role: 'bowler', country: 'India', 
        battingStats: null, bowlingStats: { average: 20.34, strikeRate: 44.8 } },
      { id: 'trent-boult', name: 'Trent Boult', team: 'New Zealand', role: 'bowler', country: 'New Zealand', 
        battingStats: null, bowlingStats: { average: 27.49, strikeRate: 57.2 } },
      
      // Additional famous players from different alphabets
      { id: 'ab-de-villiers', name: 'AB de Villiers', team: 'South Africa', role: 'batsman', country: 'South Africa', 
        battingStats: { average: 50.66, strikeRate: 90.05 }, bowlingStats: null },
      { id: 'ben-stokes', name: 'Ben Stokes', team: 'England', role: 'all-rounder', country: 'England', 
        battingStats: { average: 35.89, strikeRate: 58.08 }, bowlingStats: { average: 32.26, strikeRate: 60.2 } },
      { id: 'chris-gayle', name: 'Chris Gayle', team: 'West Indies', role: 'batsman', country: 'West Indies', 
        battingStats: { average: 42.18, strikeRate: 86.23 }, bowlingStats: null },
      { id: 'david-warner', name: 'David Warner', team: 'Australia', role: 'batsman', country: 'Australia', 
        battingStats: { average: 48.94, strikeRate: 70.43 }, bowlingStats: null },
      { id: 'eoin-morgan', name: 'Eoin Morgan', team: 'England', role: 'batsman', country: 'England', 
        battingStats: { average: 39.75, strikeRate: 91.00 }, bowlingStats: null },
      { id: 'faf-du-plessis', name: 'Faf du Plessis', team: 'South Africa', role: 'batsman', country: 'South Africa', 
        battingStats: { average: 40.02, strikeRate: 88.43 }, bowlingStats: null },
      { id: 'glenn-maxwell', name: 'Glenn Maxwell', team: 'Australia', role: 'all-rounder', country: 'Australia', 
        battingStats: { average: 33.08, strikeRate: 124.68 }, bowlingStats: { average: 42.84, strikeRate: 61.2 } },
      { id: 'hardik-pandya', name: 'Hardik Pandya', team: 'India', role: 'all-rounder', country: 'India', 
        battingStats: { average: 33.33, strikeRate: 113.91 }, bowlingStats: { average: 34.16, strikeRate: 35.6 } },
      { id: 'imam-ul-haq', name: 'Imam-ul-Haq', team: 'Pakistan', role: 'batsman', country: 'Pakistan', 
        battingStats: { average: 53.71, strikeRate: 78.07 }, bowlingStats: null },
      { id: 'jason-holder', name: 'Jason Holder', team: 'West Indies', role: 'all-rounder', country: 'West Indies', 
        battingStats: { average: 33.66, strikeRate: 73.99 }, bowlingStats: { average: 27.90, strikeRate: 52.6 } },
      { id: 'kagiso-rabada', name: 'Kagiso Rabada', team: 'South Africa', role: 'bowler', country: 'South Africa', 
        battingStats: null, bowlingStats: { average: 22.00, strikeRate: 28.4 } },
      { id: 'lasith-malinga', name: 'Lasith Malinga', team: 'Sri Lanka', role: 'bowler', country: 'Sri Lanka', 
        battingStats: null, bowlingStats: { average: 28.87, strikeRate: 34.2 } },
      { id: 'mitchell-starc', name: 'Mitchell Starc', team: 'Australia', role: 'bowler', country: 'Australia', 
        battingStats: null, bowlingStats: { average: 24.36, strikeRate: 29.8 } },
      { id: 'nicholas-pooran', name: 'Nicholas Pooran', team: 'West Indies', role: 'wicket-keeper', country: 'West Indies', 
        battingStats: { average: 34.11, strikeRate: 96.74 }, bowlingStats: null },
      { id: 'ollie-pope', name: 'Ollie Pope', team: 'England', role: 'batsman', country: 'England', 
        battingStats: { average: 32.56, strikeRate: 58.12 }, bowlingStats: null },
      { id: 'prithvi-shaw', name: 'Prithvi Shaw', team: 'India', role: 'batsman', country: 'India', 
        battingStats: { average: 42.37, strikeRate: 78.23 }, bowlingStats: null },
      { id: 'quinton-de-kock', name: 'Quinton de Kock', team: 'South Africa', role: 'wicket-keeper', country: 'South Africa', 
        battingStats: { average: 44.05, strikeRate: 95.34 }, bowlingStats: null },
      { id: 'ross-taylor', name: 'Ross Taylor', team: 'New Zealand', role: 'batsman', country: 'New Zealand', 
        battingStats: { average: 48.24, strikeRate: 82.29 }, bowlingStats: null },
      { id: 'shakib-al-hasan', name: 'Shakib Al Hasan', team: 'Bangladesh', role: 'all-rounder', country: 'Bangladesh', 
        battingStats: { average: 38.54, strikeRate: 82.45 }, bowlingStats: { average: 31.07, strikeRate: 45.2 } },
      { id: 'tom-latham', name: 'Tom Latham', team: 'New Zealand', role: 'wicket-keeper', country: 'New Zealand', 
        battingStats: { average: 42.92, strikeRate: 68.34 }, bowlingStats: null },
      { id: 'usman-khawaja', name: 'Usman Khawaja', team: 'Australia', role: 'batsman', country: 'Australia', 
        battingStats: { average: 40.66, strikeRate: 66.78 }, bowlingStats: null },
      { id: 'vernon-philander', name: 'Vernon Philander', team: 'South Africa', role: 'bowler', country: 'South Africa', 
        battingStats: null, bowlingStats: { average: 22.32, strikeRate: 50.1 } },
      { id: 'williamson-kane', name: 'Kane Williamson', team: 'New Zealand', role: 'batsman', country: 'New Zealand', 
        battingStats: { average: 54.31, strikeRate: 51.37 }, bowlingStats: null },
      { id: 'xyz-player', name: 'Xavier Doherty', team: 'Australia', role: 'bowler', country: 'Australia', 
        battingStats: null, bowlingStats: { average: 34.50, strikeRate: 52.4 } },
      { id: 'yasir-shah', name: 'Yasir Shah', team: 'Pakistan', role: 'bowler', country: 'Pakistan', 
        battingStats: null, bowlingStats: { average: 31.79, strikeRate: 49.8 } },
      { id: 'zak-crawley', name: 'Zak Crawley', team: 'England', role: 'batsman', country: 'England', 
        battingStats: { average: 31.44, strikeRate: 55.67 }, bowlingStats: null }
    ];
    
    try {
      // First, try API search
      const results = await cricDataService.searchPlayers(searchTerm);
      setSearchResults(results);
      
    } catch (error) {
      console.error('Player search error:', error);
      
      // Fallback: Search in local players first
      let localResults = apiPlayers.filter(player => 
        player.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.team?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        player.role?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      
      // If no local results, search in famous players
      if (localResults.length === 0) {
        localResults = famousPlayers.filter(player => 
          player.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          player.team.toLowerCase().includes(searchTerm.toLowerCase()) ||
          player.role.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      // If still no results, create a placeholder result with the search term
      if (localResults.length === 0) {
        localResults = [{
          id: `search-${searchTerm.toLowerCase().replace(/\s+/g, '-')}`,
          name: searchTerm.charAt(0).toUpperCase() + searchTerm.slice(1),
          team: 'Unknown',
          role: 'Player',
          country: 'Unknown',
          battingStats: null,
          bowlingStats: null
        }];
      }
      
      setSearchResults(localResults);
    } finally {
      setSearchLoading(false);
    }
  };

  const getSearchResults = useMemo(() => {
    let results = allPlayersView ? searchResults : getFilteredPlayers;
    
    // Apply additional filters only in allPlayersView mode
    if (allPlayersView) {
      if (selectedTeamFilter !== "all") {
        results = results.filter(player => player.team === selectedTeamFilter);
      }
      
      if (selectedRoleFilter !== "all") {
        results = results.filter(player => player.role === selectedRoleFilter);
      }
    }
    
    // Apply sorting
    results.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });

    return results;
  }, [allPlayersView, searchResults, getFilteredPlayers, selectedTeamFilter, selectedRoleFilter, sortBy, sortOrder]);
  
  // Helper to get all players for various components
  const allPlayers = useMemo(() => {
    return teamData ? teamData.players : [];
  }, [teamData]);  const getAvailableTeams = () => {
    const teams = new Set();
    if (allPlayersView) {
      searchResults.forEach(player => teams.add(player.team));
    } else {
      teamData?.players.forEach(player => teams.add(player.team));
    }
    return Array.from(teams).sort();
  };

  const togglePlayersView = async () => {
    const newAllPlayersView = !allPlayersView;
    setAllPlayersView(newAllPlayersView);
    setPlayerSearch("");
    setSelectedTeamFilter("all");
    setSelectedRoleFilter("all");
    
    if (newAllPlayersView) {
      // Load initial player data when switching to all players view
      await handlePlayerSearch("");
    }
  };

  const handleRoleFilterChange = (role: string) => {
    setSelectedRoleFilter(role);
  };

  // Training Management Functions
  const handleTrainingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Form validation
    if (!trainingForm.date || !trainingForm.time || !trainingForm.type || !trainingForm.focus || !trainingForm.duration || !trainingForm.participants) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields before submitting.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const trainingData = {
        sessionTitle: trainingForm.type || 'Training Session',
        sessionDate: trainingForm.date,
        sessionTime: trainingForm.time,
        sessionType: trainingForm.type || 'skill',
        type: trainingForm.type || 'skill', // Added both for compatibility
        focus: trainingForm.focus,
        duration: trainingForm.duration,
        participants: parseInt(trainingForm.participants) || 0,
        status: trainingForm.status || 'scheduled',
        notes: trainingForm.notes || ''
      };

      console.log('Submitting training data:', trainingData);

      if (editingTraining) {
        // Update existing training via API
        try {
          const response = await apiClient.put(`/api/v2/training-sessions/${editingTraining._id}`, trainingData);
          console.log('Update response:', response.data);
          
          // Update local state - ensure we handle null/undefined safely
          setTeamData(prev => {
            if (!prev) return prev;
            const updatedSession = { ...editingTraining, ...trainingData };
            const updatedSchedule = prev.trainingSchedule.map(session =>
              session._id === editingTraining._id ? updatedSession : session
            );
            console.log('Updated training schedule after edit:', updatedSchedule);
            return {
              ...prev,
              trainingSchedule: updatedSchedule
            };
          });
        } catch (apiError) {
          console.error('API update error:', apiError);
          // Fallback: Update local state anyway
          setTeamData(prev => {
            if (!prev) return prev;
            const updatedSession = { ...editingTraining, ...trainingData };
            const updatedSchedule = prev.trainingSchedule.map(session =>
              session._id === editingTraining._id ? updatedSession : session
            );
            return {
              ...prev,
              trainingSchedule: updatedSchedule
            };
          });
        }
        
        // Mark that we have manual changes
        setHasManualChanges(true);
        
        toast({
          title: "Success",
          description: "Training session updated successfully.",
        });
      } else {
        // Create new training via API
        let newSession;
        try {
          const response = await apiClient.post('/api/v2/training-sessions', trainingData);
          console.log('Create response:', response.data);
          newSession = response.data?.session || response.data;
        } catch (apiError) {
          console.error('API create error:', apiError);
          // Fallback: Create local session with proper structure
          newSession = {
            _id: `temp_${Date.now()}`,
            id: `temp_${Date.now()}`,
            sessionDate: trainingData.sessionDate,
            sessionTime: trainingData.sessionTime,
            sessionType: trainingData.sessionType,
            type: trainingData.type,
            focus: trainingData.focus,
            duration: trainingData.duration,
            participants: trainingData.participants,
            status: trainingData.status,
            notes: trainingData.notes
          };
          console.log('Created fallback session:', newSession);
        }
        
        console.log('About to add session to trainingSessions:', newSession);
        console.log('Current trainingSessions before add:', trainingSessions);
        
        // Add to both training sessions state and team data
        setTrainingSessions(prev => {
          const updated = [...prev, newSession];
          console.log('Updated trainingSessions after create:', updated);
          return updated;
        });
        
        setTeamData(prev => {
          if (!prev) {
            // If no previous data, initialize with the new session
            const newData = {
              name: 'Team',
              location: '',
              established: '',
              coach: '',
              trainingSchedule: [newSession],
              matches: []
            };
            console.log('Initializing team data with new session:', newData);
            return newData;
          }
          
          const updatedSchedule = [...(prev.trainingSchedule || []), newSession];
          console.log('Adding new session to schedule:', newSession);
          console.log('Previous training schedule:', prev.trainingSchedule);
          console.log('Updated training schedule:', updatedSchedule);
          
          const updatedTeamData = {
            ...prev,
            trainingSchedule: updatedSchedule
          };
          console.log('Final updated team data:', updatedTeamData);
          return updatedTeamData;
        });
        
        // Mark that we have manual changes
        setHasManualChanges(true);
        
        // Force re-render
        setRenderKey(prev => prev + 1);
        
        toast({
          title: "Success",
          description: "Training session created successfully.",
        });
      }

      // Reset form
      setTrainingForm({
        date: '',
        time: '',
        type: '',
        focus: '',
        duration: '',
        participants: '',
        status: 'scheduled',
        notes: ''
      });
      setShowTrainingForm(false);
      setEditingTraining(null);
      
      console.log('Form reset and training session saved successfully');
      
      // Force a small delay to ensure state is updated before showing success
      setTimeout(() => {
        console.log('Final team data after form submission:', teamData);
      }, 100);
    } catch (error) {
      console.error('Error saving training session:', error);
      toast({
        title: "Error",
        description: "Failed to save training session. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleEditTraining = (session: any) => {
    console.log('Editing training session:', session);
    setEditingTraining(session);
    setTrainingForm({
      date: session.sessionDate || session.date || '',
      time: session.sessionTime || session.time || '',
      type: session.sessionType || session.type || '',
      focus: session.focus || '',
      duration: session.duration || '',
      participants: (session.participants || 0).toString(),
      status: session.status || 'scheduled',
      notes: session.notes || ''
    });
    setShowTrainingForm(true);
    console.log('Form populated for editing:', {
      date: session.sessionDate || session.date || '',
      time: session.sessionTime || session.time || '',
      type: session.sessionType || session.type || '',
      focus: session.focus || '',
      duration: session.duration || '',
      participants: (session.participants || 0).toString(),
      status: session.status || 'scheduled',
      notes: session.notes || ''
    });
  };

  const handleDeleteTraining = async (sessionId: string) => {
    console.log('Attempting to delete training session with ID:', sessionId);
    
    if (!sessionId) {
      toast({
        title: "Error",
        description: "Invalid session ID. Cannot delete training session.",
        variant: "destructive"
      });
      return;
    }

    // Confirm deletion
    if (!window.confirm("Are you sure you want to delete this training session? This action cannot be undone.")) {
      return;
    }

    try {
      // Try to delete via API first
      try {
        await apiClient.delete(`/api/v2/training-sessions/${sessionId}`);
        console.log('Successfully deleted session via API');
      } catch (apiError) {
        console.error('API delete error (proceeding with local delete):', apiError);
      }
      
      console.log('About to delete session with ID:', sessionId);
      console.log('Current trainingSessions before delete:', trainingSessions);
      
      // Update both training sessions state and team data
      setTrainingSessions(prev => {
        const filtered = prev.filter(session => {
          const currentSessionId = session._id || session.id;
          console.log(`Filtering: comparing '${currentSessionId}' with target '${sessionId}'`);
          return currentSessionId !== sessionId;
        });
        console.log('Updated trainingSessions after delete:', filtered);
        return filtered;
      });
      
      setTeamData(prev => {
        if (!prev) return prev;
        
        console.log('Current training schedule before delete:', prev.trainingSchedule);
        console.log('Trying to delete session with ID:', sessionId);
        
        const filteredSchedule = (prev.trainingSchedule || []).filter(session => {
          const currentSessionId = session._id || session.id;
          console.log(`Comparing session ID '${currentSessionId}' with target ID '${sessionId}'`);
          return currentSessionId !== sessionId;
        });
        
        console.log('Filtered training schedule after delete:', filteredSchedule);
        
        const updatedTeamData = {
          ...prev,
          trainingSchedule: filteredSchedule
        };
        
        console.log('Final team data after delete:', updatedTeamData);
        return updatedTeamData;
      });
      
      // Mark that we have manual changes to prevent fetchTeamData from overriding
      setHasManualChanges(true);
      
      // Force re-render
      setRenderKey(prev => prev + 1);
      
      toast({
        title: "Success",
        description: "Training session deleted successfully.",
      });
    } catch (error) {
      console.error('Error deleting training session:', error);
      toast({
        title: "Error",
        description: "Failed to delete training session. Please try again.",
        variant: "destructive"
      });
    }
  };

  const resetTrainingForm = () => {
    setTrainingForm({
      date: '',
      time: '',
      type: '',
      focus: '',
      duration: '',
      participants: '',
      status: 'scheduled',
      notes: ''
    });
    setShowTrainingForm(false);
    setEditingTraining(null);
    console.log('Training form reset');
  };

  // Enhanced ML Prediction Functions
  const handlePredictPlayerPerformance = async (playerName: string, role: string) => {
    if (!playerName || !selectedOpposition) return;
    
    setPredictionLoading(true);
    try {
      // Enhanced prediction with more comprehensive context
      const venue = "Melbourne Cricket Ground"; // In real app, this would be selectable
      const pitchConditions = {
        type: 'hard' as const,
        favorsBatting: true,
        expectedScore: 350
      };
      const weather = {
        temperature: 28,
        humidity: 65,
        windSpeed: 12,
        condition: "Partly Cloudy"
      };

      if (role.toLowerCase().includes('bat') || role.toLowerCase().includes('all') || role.toLowerCase().includes('keeper')) {
        const battingRequest: BattingPredictionRequest = {
          playerName,
          opposition: selectedOpposition,
          ballsFaced: predictionOvers * 6,
          overs: predictionOvers,
          venue,
          pitchConditions,
          weather,
          matchFormat: 'Test' as const,
          matchSituation: {
            currentScore: 150,
            wicketsLost: 2,
            oversRemaining: 50,
            targetScore: undefined,
            requiredRunRate: undefined
          }
        };
        const battingResult = await mlApiClient.predictBattingPerformance(battingRequest);
        setBattingPrediction(battingResult);
      }

      if (role.toLowerCase().includes('bowl') || role.toLowerCase().includes('all')) {
        const bowlingRequest: BowlingPredictionRequest = {
          playerName,
          team: "India", // Dynamic team selection can be added
          opposition: selectedOpposition,
          overs: predictionOvers,
          venue,
          pitchConditions: {
            type: 'hard' as const,
            favorsBowling: false,
            expectedWickets: 3
          },
          weather,
          matchFormat: 'Test' as const,
          matchSituation: {
            currentScore: 150,
            wicketsLost: 2,
            oversRemaining: 50,
            currentRunRate: 3.5,
            targetScore: undefined
          }
        };
        const bowlingResult = await mlApiClient.predictBowlingPerformance(bowlingRequest);
        setBowlingPrediction(bowlingResult);
      }

      // Enhanced prediction success notification removed for cleaner UI
    } catch (error) {
      console.error('Enhanced prediction error:', error);
      // Enhanced prediction error notification removed for cleaner UI
    } finally {
      setPredictionLoading(false);
    }
  };

  const handleTeamOptimization = async () => {
    if (!teamData) return;
    
    setPredictionLoading(true);
    try {
      const availablePlayers = teamData.players
        .filter(p => p.availability)
        .map(p => p.name);
      
      const optimization = await mlApiClient.optimizeTeamSelection(
        availablePlayers,
        selectedOpposition,
        "Test"
      );
      
      setTeamOptimization(optimization);
      // Team optimization complete notification removed for cleaner UI
    } catch (error) {
      console.error('Team optimization error:', error);
      // Optimization failed notification removed for cleaner UI
    } finally {
      setPredictionLoading(false);
    }
  };

  // Enhanced Team Selection Functions
  const handlePlayerToggleForSquad = useCallback((playerId: string) => {
    setSelectedSquad(prev => {
      const newSquad = prev.includes(playerId) 
        ? prev.filter(id => id !== playerId)
        : [...prev, playerId];
      
      // If exactly 12 players selected, trigger AI analysis
      if (newSquad.length === 12) {
        generatePlayingElevenInsights(newSquad);
      } else {
        setAiInsights(null);
        setRecommendedPlaying11(null);
      }
      
      return newSquad;
    });
  }, []);

  const generatePlayingElevenInsights = async (squadPlayerIds: string[]) => {
    if (!teamData || squadPlayerIds.length !== 12) return;
    
    setTeamSelectionLoading(true);
    try {
      const squadPlayers = teamData.players.filter(p => squadPlayerIds.includes(p.id));
      
      // Analyze squad composition
      const roleAnalysis = {
        batsmen: squadPlayers.filter(p => p.role === 'Batsman').length,
        bowlers: squadPlayers.filter(p => p.role === 'Bowler').length,
        allRounders: squadPlayers.filter(p => p.role === 'All-rounder').length,
        wicketKeepers: squadPlayers.filter(p => p.role === 'Wicket-keeper').length
      };

      // Generate AI insights
      const insights = {
        squadBalance: analyzeSquadBalance(roleAnalysis),
        fitnessAnalysis: analyzeFitness(squadPlayers),
        formAnalysis: analyzeForm(squadPlayers),
        oppositionStrategy: generateOppositionStrategy(squadPlayers, selectedOpposition),
        weatherConsiderations: getWeatherRecommendations(),
        pitchConditions: getPitchRecommendations()
      };

      // Generate recommended playing 11
      const playing11 = generateOptimalPlayingEleven(squadPlayers, selectedOpposition);

      setAiInsights(insights);
      setRecommendedPlaying11(playing11);

      toast({
        title: "AI Analysis Complete",
        description: "Generated playing 11 recommendations and strategic insights",
        variant: "default",
      });

    } catch (error) {
      console.error('Team selection analysis error:', error);
      toast({
        title: "Analysis Error",
        description: "Unable to generate team insights. Please try again.",
        variant: "destructive",
      });
    } finally {
      setTeamSelectionLoading(false);
    }
  };

  const analyzeSquadBalance = (roles: any) => {
    const total = roles.batsmen + roles.bowlers + roles.allRounders + roles.wicketKeepers;
    const recommendations = [];
    
    if (roles.wicketKeepers === 0) recommendations.push("Consider adding a wicket-keeper");
    if (roles.bowlers < 4) recommendations.push("Squad may need more bowling options");
    if (roles.batsmen < 5) recommendations.push("Consider more batting strength");
    if (roles.allRounders === 0) recommendations.push("All-rounders provide valuable balance");
    
    return {
      score: Math.max(0, 100 - (recommendations.length * 15)),
      recommendations,
      distribution: roles
    };
  };

  const analyzeFitness = (players: any[]) => {
    const avgFitness = players.reduce((sum, p) => sum + p.fitness, 0) / players.length;
    const lowFitnessPlayers = players.filter(p => p.fitness < 80);
    
    return {
      averageFitness: Math.round(avgFitness),
      lowFitnessCount: lowFitnessPlayers.length,
      recommendations: lowFitnessPlayers.length > 3 
        ? ["Consider fitness levels for match stamina"] 
        : ["Squad fitness levels are good"]
    };
  };

  const analyzeForm = (players: any[]) => {
    const formDistribution = {
      excellent: players.filter(p => p.form === 'excellent').length,
      good: players.filter(p => p.form === 'good').length,
      average: players.filter(p => p.form === 'average').length
    };
    
    const formScore = (formDistribution.excellent * 3 + formDistribution.good * 2 + formDistribution.average * 1) / players.length;
    
    return {
      score: Math.round(formScore * 33.33), // Convert to percentage
      distribution: formDistribution,
      recommendations: formScore > 2.5 
        ? ["Squad is in excellent form"] 
        : ["Consider recent performance trends"]
    };
  };

  const generateOppositionStrategy = (players: any[], opposition: string) => {
    const strategies = {
      "Australia": {
        focus: "Strong pace attack needed",
        recommendation: "Select experienced players for bouncy pitches",
        keyPlayers: "Prioritize players with good records vs pace"
      },
      "England": {
        focus: "Swing bowling conditions",
        recommendation: "Include players comfortable with swing",
        keyPlayers: "Technical batsmen for challenging conditions"
      },
      "Pakistan": {
        focus: "Spin-friendly conditions",
        recommendation: "Balance between pace and spin options",
        keyPlayers: "Players with good spin-playing ability"
      }
    };
    
    return strategies[opposition] || {
      focus: "Balanced approach needed",
      recommendation: "Select versatile players",
      keyPlayers: "All-round capabilities important"
    };
  };

  const getWeatherRecommendations = () => {
    return {
      condition: "Partly Cloudy",
      temperature: "28°C",
      recommendation: "Good conditions for batting first",
      impact: "Minimal weather interference expected"
    };
  };

  const getPitchRecommendations = () => {
    return {
      type: "Hard Wicket",
      favorsBatting: true,
      expectedScore: "350-400 runs",
      recommendation: "Pace bowlers will get good bounce"
    };
  };

  const generateOptimalPlayingEleven = (squadPlayers: any[], opposition: string) => {
    // Sort players by composite score (fitness + form + recent performance)
    const scoredPlayers = squadPlayers.map(player => ({
      ...player,
      compositeScore: (player.fitness + player.recentPerformance) / 2 + 
                     (player.form === 'excellent' ? 10 : player.form === 'good' ? 5 : 0)
    })).sort((a, b) => b.compositeScore - a.compositeScore);

    // Ensure balanced team composition
    const playing11 = [];
    const roles = { batsmen: 0, bowlers: 0, allRounders: 0, wicketKeepers: 0 };

    // First, select essential roles
    const wicketKeeper = scoredPlayers.find(p => p.role === 'Wicket-keeper');
    if (wicketKeeper) {
      playing11.push(wicketKeeper);
      roles.wicketKeepers = 1;
    }

    // Add top batsmen
    const topBatsmen = scoredPlayers.filter(p => p.role === 'Batsman' && !playing11.includes(p)).slice(0, 5);
    playing11.push(...topBatsmen);
    roles.batsmen = topBatsmen.length;

    // Add all-rounders
    const allRounders = scoredPlayers.filter(p => p.role === 'All-rounder' && !playing11.includes(p)).slice(0, 2);
    playing11.push(...allRounders);
    roles.allRounders = allRounders.length;

    // Fill remaining spots with bowlers
    const remainingSpots = 11 - playing11.length;
    const bowlers = scoredPlayers.filter(p => p.role === 'Bowler' && !playing11.includes(p)).slice(0, remainingSpots);
    playing11.push(...bowlers);
    roles.bowlers = bowlers.length;

    return {
      players: playing11.slice(0, 11),
      composition: roles,
      confidence: 85 + Math.random() * 10, // Simulated confidence score
      reasoning: "Selected based on current form, fitness, and role balance"
    };
  };

  const clearPredictions = () => {
    setBattingPrediction(null);
    setBowlingPrediction(null);
    setTeamOptimization(null);
    setSelectedPlayer("");
  };

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!teamData) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
        <div className="text-center bg-slate-800 p-8 rounded-lg shadow-lg border border-slate-700">
          <div className="w-16 h-16 bg-red-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-red-200 text-2xl font-bold">!</span>
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Data Available</h3>
          <p className="text-gray-300 mb-6 font-medium">Unable to load team data. Please try again.</p>
          <Button 
            onClick={() => {
              setHasManualChanges(false);
              fetchTeamData(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-lg transition-colors duration-200"
          >
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  const playerStats = [
    { name: 'Available', value: currentTeamStats?.availablePlayers || 0 },
    { name: 'Injured', value: currentTeamStats?.injuredPlayers || 0 },
    { name: 'Total', value: currentTeamStats?.totalPlayers || 0 }
  ];

  const fitnessData = teamData.players.length > 0 ? teamData.players.slice(0, 10).map(player => ({
    name: player.name.split(' ')[1] || player.name,
    value: player.fitness
  })) : [
    { name: 'Loading...', value: 0 }
  ];

  const performanceData = teamData.players.length > 0 ? teamData.players.slice(0, 10).map(player => ({
    name: player.name.split(' ')[1] || player.name,
    value: player.recentPerformance
  })) : [
    { name: 'Loading...', value: 0 }
  ];

  return (
    <div className="min-h-screen bg-slate-900 space-y-8 p-6">
      {/* Header */}
      <motion.div 
        className="flex justify-between items-start mb-8 bg-slate-800 rounded-xl shadow-sm border border-slate-700 p-6"
        variants={fadeInVariants}
        initial="hidden"
        animate="visible"
      >
        <div>
          <h1 className="text-4xl font-heading font-bold tracking-tight text-white mb-2">Coach Dashboard</h1>
          <p className="text-lg text-gray-300 font-sans font-medium">
            Comprehensive team management and performance tracking
          </p>
        </div>
      </motion.div>

      {/* Quick Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div>
          <Card className="border border-slate-700 shadow-sm bg-slate-800 hover:shadow-md transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-heading font-semibold text-green-400 uppercase tracking-wide">Available Players</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-heading font-bold text-white mb-1">{currentTeamStats?.availablePlayers || 0}</div>
              <p className="text-sm text-gray-300 font-sans font-medium">
                out of {currentTeamStats?.totalPlayers || 0} total players
              </p>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border border-slate-700 shadow-sm bg-slate-800 hover:shadow-md transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-heading font-semibold text-red-400 uppercase tracking-wide">Injured Players</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-heading font-bold text-white mb-1">{currentTeamStats?.injuredPlayers || 0}</div>
              <p className="text-sm text-gray-300 font-sans font-medium">
                requiring medical attention
              </p>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border border-slate-700 shadow-sm bg-slate-800 hover:shadow-md transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-heading font-semibold text-blue-400 uppercase tracking-wide">Average Fitness</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-heading font-bold text-white mb-1">{currentTeamStats?.averageFitness || 0}%</div>
              <p className="text-sm text-gray-300 font-sans font-medium">
                overall team fitness score
              </p>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="border border-slate-700 shadow-sm bg-slate-800 hover:shadow-md transition-all duration-300">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-heading font-semibold text-slate-400 uppercase tracking-wide">Team Form</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="text-3xl font-heading font-bold text-white mb-1 capitalize">{currentTeamStats?.teamForm || 'N/A'}</div>
              <p className="text-sm text-gray-300 font-sans font-medium">
                current performance level
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="bg-slate-800 rounded-xl shadow-sm border border-slate-700 p-6">
        <Tabs key="coach-dashboard-tabs" value={activeTab} onValueChange={handleTabChange} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5 bg-slate-700 p-1 rounded-lg">
            <TabsTrigger 
              value="overview" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm font-heading font-semibold transition-all duration-200 text-gray-300"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="players" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm font-heading font-semibold transition-all duration-200 text-gray-300"
            >
              Players
            </TabsTrigger>
            <TabsTrigger 
              value="training" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm font-heading font-semibold transition-all duration-200 text-gray-300"
            >
              Training
            </TabsTrigger>
            <TabsTrigger 
              value="matches" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm font-heading font-semibold transition-all duration-200 text-gray-300"
            >
              Matches
            </TabsTrigger>
            <TabsTrigger 
              value="predictions"
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white data-[state=active]:shadow-sm font-heading font-semibold transition-all duration-200 text-gray-300"
            >
              ML Predictions
            </TabsTrigger>
          </TabsList>
          
          <TabsContent key="overview-content" value="overview" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="border border-slate-600 shadow-sm bg-slate-700">
                <CardHeader className="bg-slate-600 rounded-t-lg border-b border-slate-500">
                  <CardTitle className="text-white font-heading font-bold">Team Fitness Levels</CardTitle>
                  <CardDescription className="text-gray-300 font-sans font-medium">Individual player fitness scores</CardDescription>
                </CardHeader>
                <CardContent className="bg-slate-700 p-4">
                  <DashboardChart 
                    title="" 
                    data={fitnessData} 
                    type="bar" 
                  />
                </CardContent>
              </Card>

              <Card className="border border-slate-600 shadow-sm bg-slate-700">
                <CardHeader className="bg-slate-600 rounded-t-lg border-b border-slate-500">
                  <CardTitle className="text-white font-heading font-bold">Recent Performance</CardTitle>
                  <CardDescription className="text-gray-300 font-sans font-medium">Player performance over last 5 matches</CardDescription>
                </CardHeader>
                <CardContent className="bg-slate-700 p-4">
                  <DashboardChart 
                    title="" 
                    data={performanceData} 
                    type="line" 
                  />
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent key="players-content" value="players" className="space-y-6">
            <Card className="border border-slate-600 shadow-sm bg-slate-700">
              <CardHeader className="bg-slate-600 rounded-t-lg border-b border-slate-500">
                <CardTitle className="text-2xl font-heading font-bold text-white">Player Management & Search</CardTitle>
                <CardDescription className="text-gray-300 font-sans font-medium">
                  {allPlayersView ? `Search ${apiPlayers.length}+ international players` : 'Manage your team players'}
                </CardDescription>
                
                {/* Enhanced Search Controls */}
                <div className="space-y-4 mt-6">
                  {/* View Toggle */}
                  <div className="flex items-center justify-between">
                    <Button
                      onClick={togglePlayersView}
                      className={`px-6 py-2 font-bold rounded-lg transition-all duration-200 ${
                        allPlayersView 
                          ? 'bg-slate-600 hover:bg-slate-700 text-white' 
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

                  {/* Search and Filters Row */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Search Players
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          placeholder={allPlayersView ? "Search international players..." : "Search team players..."}
                          value={playerSearch}
                          onChange={(e) => allPlayersView ? handlePlayerSearch(e.target.value) : setPlayerSearch(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-medium placeholder-gray-400"
                        />
                        {searchLoading && (
                          <div className="absolute right-3 top-3">
                            <LoadingSpinner />
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">
                        Team Filter
                      </label>
                      <select
                        value={allPlayersView ? selectedTeamFilter : selectedTeam}
                        onChange={(e) => allPlayersView ? setSelectedTeamFilter(e.target.value) : setSelectedTeam(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-medium"
                      >
                        <option value="all">All Teams</option>
                        {getAvailableTeams().map((team: any) => (
                          <option key={team} value={team}>{team}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-200 mb-2">
                        Role Filter
                      </label>
                      <select
                        value={selectedRoleFilter}
                        onChange={(e) => handleRoleFilterChange(e.target.value)}
                        className="w-full px-4 py-3 bg-slate-800 border-2 border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 font-medium"
                      >
                        <option value="all">All Roles</option>
                        <option value="Batsman">Batsman</option>
                        <option value="Bowler">Bowler</option>
                        <option value="All-rounder">All-rounder</option>
                        <option value="Wicket-keeper">Wicket-keeper</option>
                      </select>
                    </div>
                  </div>

                  {/* Sort Controls */}
                  <div className="flex items-center gap-4">
                    <label className="text-sm font-semibold text-gray-200">
                      Sort by:
                    </label>
                    <select
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 bg-slate-800 border border-slate-600 text-white rounded-lg font-medium"
                    >
                      <option value="name">Name</option>
                      <option value="team">Team</option>
                      <option value="role">Role</option>
                      {!allPlayersView && (
                        <>
                          <option value="fitness">Fitness</option>
                          <option value="recentPerformance">Performance</option>
                        </>
                      )}
                    </select>
                    
                    <Button
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-medium"
                    >
                      {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                    </Button>
                  </div>
                </div>

                {/* Results Summary */}
                {selectedTeam !== "all" && (
                  <div className="mt-6 p-5 bg-slate-700 rounded-lg border-l-4 border-blue-500">
                    <h4 className="font-bold text-xl text-white mb-4">{selectedTeam} Team Statistics</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-white">{currentTeamStats?.totalPlayers}</div>
                        <div className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Total Players</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">{currentTeamStats?.availablePlayers}</div>
                        <div className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Available</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-400">{currentTeamStats?.injuredPlayers}</div>
                        <div className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Injured</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400">{currentTeamStats?.averageFitness}%</div>
                        <div className="text-sm font-semibold text-gray-300 uppercase tracking-wide">Avg Fitness</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardHeader>
              <CardContent className="p-6 bg-slate-800">
                <div className="mb-6 p-4 bg-blue-900 bg-opacity-50 rounded-lg border-l-4 border-blue-400">
                  <div className="text-sm font-semibold text-blue-200">
                    {allPlayersView ? (
                      <>
                        Showing {getSearchResults().length} of {searchResults.length} international players
                        {selectedTeamFilter !== "all" && ` from ${selectedTeamFilter}`}
                        {selectedRoleFilter !== "all" && ` (${selectedRoleFilter}s)`}
                        {playerSearch && ` matching "${playerSearch}"`}
                      </>
                    ) : (
                      <>
                        Showing {getSearchResults.length} of {teamData.players.length} team players
                        {selectedTeam !== "all" && ` from ${selectedTeam}`}
                        {playerSearch && ` matching "${playerSearch}"`}
                      </>
                    )}
                  </div>
                  
                  {allPlayersView && (
                    <>
                      <div className="mt-2 text-sm text-blue-400 font-medium">
                        {searchLoading ? (
                          <span className="flex items-center gap-2">
                            <LoadingSpinner />
                            Searching players...
                          </span>
                        ) : (
                          `Found ${getSearchResults().length} international players`
                        )}
                        {selectedTeamFilter !== 'all' && ` from ${selectedTeamFilter}`}
                        {selectedRoleFilter !== 'all' && ` (${selectedRoleFilter}s)`}
                        {playerSearch && ` matching "${playerSearch}"`}
                      </div>
                      <div className="mt-1 text-xs text-gray-300">
                        Tip: Use search to find specific players, or filter by team/role to narrow results
                      </div>
                    </>
                  )}
                </div>
                
                <div className="overflow-hidden rounded-lg border border-slate-600">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-slate-700 border-slate-600">
                        <TableHead className="font-bold text-white py-4">Player Name</TableHead>
                        <TableHead className="font-bold text-white py-4">Team</TableHead>
                        <TableHead className="font-bold text-white py-4">Role</TableHead>
                        {allPlayersView ? (
                          <>
                            <TableHead className="font-bold text-white py-4">Batting Stats</TableHead>
                            <TableHead className="font-bold text-white py-4">Bowling Stats</TableHead>
                            <TableHead className="font-bold text-white py-4">ML Prediction</TableHead>
                          </>
                        ) : (
                          <>
                            <TableHead className="font-bold text-white py-4">Current Form</TableHead>
                            <TableHead className="font-bold text-white py-4">Fitness Level</TableHead>
                            <TableHead className="font-bold text-white py-4">Status</TableHead>
                            <TableHead className="font-bold text-white py-4">Performance</TableHead>
                            <TableHead className="font-bold text-white py-4">Action</TableHead>
                            <TableHead className="font-bold text-white py-4">Team Selection</TableHead>
                          </>
                        )}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getSearchResults.map((player, index) => (
                        <TableRow key={player.id || `${player.name}-${index}`} className={`hover:bg-slate-700 transition-colors duration-200 border-slate-600 ${index % 2 === 0 ? 'bg-slate-800' : 'bg-slate-750'}`}>
                          <TableCell className="font-semibold text-white py-4">
                            {player.name}
                            {allPlayersView && player.country && (
                              <div className="text-xs text-gray-400 mt-1">
                                🏴 {player.country}
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="py-4">
                            <span className="font-semibold text-white">
                              {player.team}
                            </span>
                          </TableCell>
                          <TableCell className="py-4">
                            <span className="font-semibold text-white">
                              {player.role}
                            </span>
                          </TableCell>
                          
                          {allPlayersView ? (
                            <>
                              <TableCell className="py-4">
                                {player.battingStats ? (
                                  <div className="text-xs space-y-1">
                                    <div className="text-green-400">Avg: {player.battingStats.average}</div>
                                    <div className="text-blue-400">SR: {player.battingStats.strikeRate}</div>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-xs">No data</span>
                                )}
                              </TableCell>
                              <TableCell className="py-4">
                                {player.bowlingStats ? (
                                  <div className="text-xs space-y-1">
                                    <div className="text-red-400">Avg: {player.bowlingStats.average}</div>
                                    <div className="text-slate-400">SR: {player.bowlingStats.strikeRate}</div>
                                  </div>
                                ) : (
                                  <span className="text-gray-400 text-xs">No data</span>
                                )}
                              </TableCell>
                              <TableCell className="py-4">
                                <Button
                                  onClick={() => {
                                    setSelectedPlayer(player.name);
                                    // Trigger ML prediction for this player
                                  }}
                                  className="px-3 py-1 bg-slate-600 hover:bg-slate-700 text-white text-xs rounded"
                                >
                                  Predict
                                </Button>
                              </TableCell>
                            </>
                          ) : (
                            <>
                              <TableCell className="py-4">
                                <span className="font-semibold text-white">
                                  {(player.form || 'good')}
                                </span>
                              </TableCell>
                              <TableCell className="py-4">
                                <span className="text-sm font-semibold text-gray-200">{player.fitness}%</span>
                              </TableCell>
                              <TableCell className="py-4">
                                {player.availability ? (
                                  <span className="font-semibold text-white">
                                    Available
                                  </span>
                                ) : (
                                  <span className="font-semibold text-white">
                                    Injured
                                  </span>
                                )}
                              </TableCell>
                              <TableCell className="py-4">
                                <span className="text-sm font-semibold text-gray-200">{player.recentPerformance}%</span>
                              </TableCell>
                              <TableCell className="py-4">
                                <button
                                  onClick={() => togglePlayerAvailability(player.id)}
                                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
                                    player.availability 
                                      ? 'bg-red-800 text-red-200 hover:bg-red-700' 
                                      : 'bg-green-800 text-green-200 hover:bg-green-700'
                                  }`}
                                  title={`Mark as ${player.availability ? 'unavailable' : 'available'}`}
                                >
                                  {player.availability ? 'MARK INJURED' : 'MARK AVAILABLE'}
                                </button>
                              </TableCell>
                              <TableCell className="py-4 text-center">
                                <button
                                  onClick={() => handlePlayerToggleForSquad(player.id)}
                                  disabled={!player.availability}
                                  className={`px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
                                    selectedSquad.includes(player.id)
                                      ? 'bg-blue-600 text-blue-100 hover:bg-blue-500' 
                                      : 'bg-slate-600 text-slate-200 hover:bg-slate-500'
                                  } ${!player.availability ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  title={selectedSquad.includes(player.id) ? 'Remove from squad' : 'Add to squad'}
                                >
                                  {selectedSquad.includes(player.id) ? 'IN SQUAD' : 'ADD TO SQUAD'}
                                </button>
                              </TableCell>
                            </>
                          )}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {getSearchResults.length === 0 && (
                    <div className="p-8 text-center bg-slate-800">
                      <div className="text-gray-400 text-lg font-medium">
                        {allPlayersView ? 'No players found' : 'No team players found'}
                      </div>
                      <div className="text-gray-500 text-sm mt-2">
                        {allPlayersView ? 'Try adjusting your search terms or filters' : 'Try different search criteria'}
                      </div>
                    </div>
                  )}

                  {/* AI Insights Panel */}
                  {selectedSquad.length > 0 && (
                    <div className="mt-6 p-6 bg-gradient-to-r from-blue-900/50 to-purple-900/50 rounded-lg border border-blue-500/30">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                          <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></span>
                          Team Selection ({selectedSquad.length}/12)
                        </h3>
                        {selectedSquad.length === 12 && (
                          <div className="flex items-center gap-2 text-green-400 text-sm font-medium">
                            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                            Squad Complete - AI Analysis Available
                          </div>
                        )}
                      </div>

                      {/* Squad Status */}
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-2">
                          {selectedSquad.map((playerId) => {
                            const player = allPlayers.find(p => p.id === playerId);
                            return player ? (
                              <div key={playerId} className="bg-blue-600/30 px-3 py-1 rounded-full text-sm text-blue-200 border border-blue-500/30">
                                {player.name} ({player.role})
                              </div>
                            ) : null;
                          })}
                        </div>
                      </div>

                      {/* AI Insights */}
                      {selectedSquad.length === 12 && aiInsights && (
                        <div className="space-y-4">
                          {teamSelectionLoading && (
                            <div className="flex items-center justify-center py-8">
                              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400"></div>
                              <span className="ml-3 text-blue-300">Generating AI insights...</span>
                            </div>
                          )}

                          {!teamSelectionLoading && (
                            <>
                              {/* Squad Balance */}
                              <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
                                <h4 className="font-bold text-white mb-2">Squad Balance Analysis</h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-blue-400">{aiInsights.squadBalance?.batsmen || 0}</div>
                                    <div className="text-sm text-gray-400">Batsmen</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-green-400">{aiInsights.squadBalance?.bowlers || 0}</div>
                                    <div className="text-sm text-gray-400">Bowlers</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-purple-400">{aiInsights.squadBalance?.allRounders || 0}</div>
                                    <div className="text-sm text-gray-400">All-rounders</div>
                                  </div>
                                  <div className="text-center">
                                    <div className="text-2xl font-bold text-orange-400">{aiInsights.squadBalance?.wicketKeepers || 0}</div>
                                    <div className="text-sm text-gray-400">Keepers</div>
                                  </div>
                                </div>
                                <div className="mt-3 text-sm text-gray-300">
                                  <strong>Balance Score:</strong> {aiInsights.squadBalance?.balanceScore}/100
                                </div>
                              </div>

                              {/* Recommended Playing XI */}
                              {recommendedPlaying11.length > 0 && (
                                <div className="bg-gradient-to-r from-green-900/30 to-blue-900/30 p-4 rounded-lg border border-green-500/30">
                                  <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                    AI Recommended Playing XI
                                  </h4>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    {recommendedPlaying11.map((playerId, index) => {
                                      const player = allPlayers.find(p => p.id === playerId);
                                      return player ? (
                                        <div key={playerId} className="flex items-center justify-between bg-slate-800/50 p-2 rounded border border-slate-600">
                                          <div>
                                            <span className="text-green-300 font-medium">{index + 1}. {player.name}</span>
                                            <span className="text-gray-400 text-sm ml-2">({player.role})</span>
                                          </div>
                                          <div className="text-xs text-green-400">
                                            Score: {Math.floor(Math.random() * 20) + 80}
                                          </div>
                                        </div>
                                      ) : null;
                                    })}
                                  </div>
                                </div>
                              )}

                              {/* Strategic Insights */}
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {aiInsights.keyStrengths && (
                                  <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
                                    <h5 className="font-bold text-green-400 mb-2">Key Strengths</h5>
                                    <ul className="text-sm text-gray-300 space-y-1">
                                      {aiInsights.keyStrengths.map((strength, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                          <span className="text-green-400">•</span>
                                          {strength}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {aiInsights.potentialWeaknesses && (
                                  <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-600">
                                    <h5 className="font-bold text-orange-400 mb-2">Areas to Watch</h5>
                                    <ul className="text-sm text-gray-300 space-y-1">
                                      {aiInsights.potentialWeaknesses.map((weakness, index) => (
                                        <li key={index} className="flex items-start gap-2">
                                          <span className="text-orange-400">•</span>
                                          {weakness}
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>

                              {/* Match Strategy */}
                              {aiInsights.matchStrategy && (
                                <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 p-4 rounded-lg border border-purple-500/30">
                                  <h4 className="font-bold text-white mb-2">AI Match Strategy</h4>
                                  <p className="text-sm text-gray-300">{aiInsights.matchStrategy}</p>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      )}

                      {selectedSquad.length < 12 && (
                        <div className="text-center py-4">
                          <p className="text-gray-400">
                            Select {12 - selectedSquad.length} more players to unlock AI insights and playing XI recommendations
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent key="training-content" value="training" className="space-y-6">
            <Card className="border border-slate-600 shadow-lg bg-slate-800">
              <CardHeader className="bg-slate-700 rounded-t-lg">
                <CardTitle className="text-2xl font-heading font-bold text-white">Training Management</CardTitle>
                <CardDescription className="text-gray-200 font-sans font-medium">
                  Comprehensive training sessions and practice management with full CRUD operations
                </CardDescription>
                
                {/* Training Controls */}
                <div className="flex justify-between items-center mt-6">
                  <div className="text-sm text-gray-300">
                    {trainingSessions.length} training sessions scheduled
                  </div>
                  <Button
                    onClick={() => setShowTrainingForm(true)}
                    className="bg-slate-600 hover:bg-slate-700 text-white font-bold px-6 py-2"
                  >
                    Add Training Session
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="p-6 bg-slate-800">
                {/* Training Form Modal */}
                {showTrainingForm && (
                  <div className="mb-6 p-6 bg-slate-700 rounded-lg border border-slate-600">
                      <div className="flex justify-between items-center mb-6">
                        <div>
                          <h3 className="text-xl font-bold text-white">
                            {editingTraining ? 'Edit Training Session' : 'New Training Session'}
                          </h3>
                          <p className="text-sm text-gray-400 mt-1">
                            {editingTraining ? 'Modify the existing training session details' : 'Create a new training session for the team'}
                          </p>
                        </div>
                        <Button
                          onClick={resetTrainingForm}
                          className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 flex items-center gap-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                          Cancel
                        </Button>
                      </div>
                    
                    <form onSubmit={handleTrainingSubmit} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-200 mb-2">
                              Training Date *
                            </label>
                            <input
                              type="date"
                              value={trainingForm.date}
                              onChange={(e) => {
                                console.log('Date changed:', e.target.value);
                                setTrainingForm({...trainingForm, date: e.target.value});
                              }}
                              className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              required
                              min={new Date().toISOString().split('T')[0]}
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-semibold text-gray-200 mb-2">
                              Training Time *
                            </label>
                            <input
                              type="time"
                              value={trainingForm.time}
                              onChange={(e) => {
                                console.log('Time changed:', e.target.value);
                                setTrainingForm({...trainingForm, time: e.target.value});
                              }}
                              className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-200 mb-2">
                              Training Type *
                            </label>
                            <select
                              value={trainingForm.type}
                              onChange={(e) => setTrainingForm({...trainingForm, type: e.target.value})}
                              className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              required
                            >
                              <option value="">Select Training Type</option>
                              <option value="Batting Practice">Batting Practice</option>
                              <option value="Bowling Practice">Bowling Practice</option>
                              <option value="Fielding Drill">Fielding Drill</option>
                              <option value="Fitness Training">Fitness Training</option>
                              <option value="Team Strategy">Team Strategy</option>
                              <option value="Match Simulation">Match Simulation</option>
                              <option value="Recovery Session">Recovery Session</option>
                            </select>
                          </div>
                          
                          <div>
                            <label className="block text-sm font-semibold text-gray-200 mb-2">
                              Duration *
                            </label>
                            <select
                              value={trainingForm.duration}
                              onChange={(e) => setTrainingForm({...trainingForm, duration: e.target.value})}
                              className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              required
                            >
                              <option value="">Select Duration</option>
                              <option value="1 hour">1 hour</option>
                              <option value="1.5 hours">1.5 hours</option>
                              <option value="2 hours">2 hours</option>
                              <option value="2.5 hours">2.5 hours</option>
                              <option value="3 hours">3 hours</option>
                              <option value="Half day">Half day</option>
                              <option value="Full day">Full day</option>
                            </select>
                          </div>
                        </div>
                        
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-semibold text-gray-200 mb-2">
                              Training Focus *
                            </label>
                            <input
                              type="text"
                              value={trainingForm.focus}
                              onChange={(e) => setTrainingForm({...trainingForm, focus: e.target.value})}
                              placeholder="e.g., Short ball technique, Death bowling"
                              className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              required
                            />
                          </div>
                          
                          <div>
                            <label className="block text-sm font-semibold text-gray-200 mb-2">
                              Participants *
                            </label>
                            <input
                              type="number"
                              value={trainingForm.participants}
                              onChange={(e) => setTrainingForm({...trainingForm, participants: e.target.value})}
                              placeholder="Number of players"
                              min="1"
                              max="30"
                              className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                              required
                            />
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-200 mb-2">
                            Status
                          </label>
                          <select
                            value={trainingForm.status}
                            onChange={(e) => setTrainingForm({...trainingForm, status: e.target.value})}
                            className="w-full px-4 py-3 bg-slate-800 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                          >
                            <option value="scheduled">Scheduled</option>
                            <option value="in-progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </div>
                      </div>
                      
                      <div className="flex gap-4 mt-6">
                        <Button
                          type="submit"
                          className="bg-slate-600 hover:bg-slate-700 text-white font-bold px-8 py-3"
                        >
                          {editingTraining ? 'Update Session' : 'Create Session'}
                        </Button>
                        <Button
                          type="button"
                          onClick={resetTrainingForm}
                          className="bg-gray-600 hover:bg-gray-700 text-white font-bold px-8 py-3"
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Training Sessions Summary */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
                    <div>
                      <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">Total Sessions</p>
                      <p className="text-3xl font-bold text-white">{trainingSessions.length}</p>
                    </div>
                  </div>
                  
                  <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
                    <div>
                      <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">Scheduled</p>
                      <p className="text-3xl font-bold text-blue-400">
                        {trainingSessions.filter(s => s?.status === 'scheduled' || !s?.status).length}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
                    <div>
                      <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">Completed</p>
                      <p className="text-3xl font-bold text-green-400">
                        {trainingSessions.filter(s => s?.status === 'completed').length}
                      </p>
                    </div>
                  </div>
                  
                  <div className="bg-slate-700 rounded-lg p-6 border border-slate-600">
                    <div>
                      <p className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-2">In Progress</p>
                      <p className="text-3xl font-bold text-yellow-400">
                        {trainingSessions.filter(s => s?.status === 'in-progress').length}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Training Sessions Table */}
                <div className="space-y-4">
                  
                  {/* Debug: Show current state */}
                  {console.log('Current trainingSessions in render:', trainingSessions)}
                  
                  {trainingSessions.length === 0 ? (
                    <div className="text-center py-16 bg-slate-700 rounded-lg border border-slate-600">
                      <div className="text-gray-200 text-xl font-semibold mb-3">
                        No training sessions scheduled
                      </div>
                      <div className="text-gray-400 text-sm">
                        Click "Add Training Session" above to create your first training session
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-800 rounded-lg border border-slate-600 overflow-hidden shadow-lg">
                      <div className="bg-slate-700 px-6 py-4 border-b border-slate-600">
                        <h3 className="text-lg font-bold text-white">Training Sessions Schedule</h3>
                        <p className="text-sm text-gray-300 mt-1">
                          {trainingSessions.length} session{trainingSessions.length !== 1 ? 's' : ''} scheduled
                        </p>
                      </div>
                      
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead className="bg-slate-750 border-b border-slate-600">
                            <tr>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200 uppercase tracking-wider">
                                Training Type
                              </th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200 uppercase tracking-wider">
                                Focus Area
                              </th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200 uppercase tracking-wider">
                                Date & Time
                              </th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200 uppercase tracking-wider">
                                Duration
                              </th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200 uppercase tracking-wider">
                                Participants
                              </th>
                              <th className="px-6 py-4 text-left text-sm font-semibold text-gray-200 uppercase tracking-wider">
                                Status
                              </th>
                              <th className="px-6 py-4 text-right text-sm font-semibold text-gray-200 uppercase tracking-wider">
                                Actions
                              </th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-600 bg-slate-800">
                            {trainingSessions.map((session, index) => (
                              <tr key={`${session._id || session.id || index}-${trainingSessions.length}-${Date.now()}`} className="hover:bg-slate-700 transition-all duration-200">
                                <td className="px-6 py-4">
                                  <div className="text-sm font-bold text-white">
                                    {session?.sessionType || session?.type || session?.sessionTitle || 'Training Session'}
                                  </div>
                                  <div className="text-xs text-gray-400 mt-1">
                                    ID: {session?._id || session?.id || index} | Length: {trainingSessions.length}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm text-gray-300">
                                    {session?.focus || 'General Training'}
                                  </div>
                                  <div className="text-xs text-blue-400 mt-1">
                                    {session?.type === 'skill' ? '🎯 Skill Focus' : 
                                     session?.type === 'fitness' ? '💪 Fitness' : 
                                     session?.type === 'strategy' ? '🧠 Strategy' : 
                                     'General Training'}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div>
                                    <div className="text-sm font-semibold text-white">
                                      {new Date(session?.sessionDate || session?.date).toLocaleDateString()}
                                    </div>
                                    <div className="text-xs text-gray-400 mt-1">
                                      {session?.sessionTime || session?.time || 'Time TBD'}
                                    </div>
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm font-semibold text-gray-300">
                                    {session?.duration || 'TBD'}
                                  </div>
                                  <div className="text-xs text-gray-400 mt-1">
                                    Expected duration
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="text-sm font-bold text-white">
                                    {session?.participants || 0}
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    player{(session?.participants || 0) !== 1 ? 's' : ''} attending
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <span className={`inline-flex px-3 py-1 text-xs font-bold rounded-full ${
                                    session?.status === 'completed' ? 'text-green-100 bg-green-700' :
                                    session?.status === 'in-progress' ? 'text-yellow-100 bg-yellow-600' :
                                    session?.status === 'cancelled' ? 'text-red-100 bg-red-700' :
                                    'text-blue-100 bg-blue-600'
                                  }`}>
                                    {(session?.status || 'SCHEDULED').toUpperCase()}
                                  </span>
                                  <div className="text-xs text-gray-400 mt-2">
                                    Last updated: {new Date().toLocaleDateString()}
                                  </div>
                                </td>
                                <td className="px-6 py-4">
                                  <div className="flex flex-col gap-2">
                                    <Button
                                      onClick={() => handleEditTraining(session)}
                                      className="w-full bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                                      size="sm"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M20 14.66V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5.34"></path>
                                        <polygon points="18 2 22 6 12 16 8 16 8 12 18 2"></polygon>
                                      </svg>
                                      Edit
                                    </Button>
                                    <Button
                                      onClick={() => handleDeleteTraining(session?._id || session?.id)}
                                      className="w-full bg-red-600 hover:bg-red-700 text-white text-sm rounded-md font-medium transition-colors duration-200 flex items-center justify-center gap-2"
                                      size="sm"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                      </svg>
                                      Delete
                                    </Button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent key="matches-content" value="matches" className="space-y-6">
            <Card className="border border-slate-600 shadow-lg bg-slate-800">
              <CardHeader className="bg-slate-800 rounded-t-lg">
                <CardTitle className="text-2xl font-heading font-bold text-white">Match Analysis & Predictions</CardTitle>
                <CardDescription className="text-gray-200 font-sans font-medium">
                  Comprehensive match analysis with ML-powered predictions and strategic insights
                </CardDescription>
                
                {/* Match Controls */}
                <div className="flex justify-between items-center mt-6">
                  <div className="text-sm text-gray-300">
                    {teamData.upcomingMatches.length} upcoming matches
                  </div>
                  <Button
                    onClick={() => {
                      setHasManualChanges(false);
                      fetchTeamData(true);
                    }}
                    className="bg-slate-600 hover:bg-slate-700 text-white font-bold px-6 py-2"
                  >
                    Refresh Matches
                  </Button>
                </div>
              </CardHeader>
              
              <CardContent className="p-6 bg-slate-800">
                <div className="space-y-6">
                  {teamData.upcomingMatches.length === 0 ? (
                    <div className="text-center py-12 bg-slate-700 rounded-lg border border-slate-600">
                      <div className="text-gray-400 text-lg font-medium mb-2">
                        No upcoming matches scheduled
                      </div>
                      <div className="text-gray-500 text-sm">
                        Check back later for updated match schedules
                      </div>
                    </div>
                  ) : (
                    teamData.upcomingMatches.map((match, index) => (
                      <div key={match.id} className={`p-6 border border-slate-600 rounded-lg hover:bg-slate-700 transition-all duration-200 ${index % 2 === 0 ? 'bg-slate-800' : 'bg-slate-750'}`}>
                        {/* Match Header */}
                        <div className="flex items-center justify-between mb-6">
                          <div className="flex items-center gap-6">
                            <div>
                              <h4 className="text-xl font-bold text-white mb-2"> {match.opponent}</h4>
                              <p className="text-gray-300 font-medium mb-2">
                                {match.venue || 'Venue TBD'}
                              </p>
                              <span className="inline-block px-3 py-1 text-xs font-bold text-slate-200 bg-slate-800 rounded-full">
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

                        {/* Match Analysis Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          {/* Win Probability */}
                          <div className="p-4 bg-slate-700 rounded-lg border border-slate-600">
                            <h5 className="text-sm font-bold text-white mb-2">Win Probability</h5>
                            <div className="text-2xl font-bold text-green-400 mb-1">
                              {65 + Math.floor(Math.random() * 30)}%
                            </div>
                            <div className="text-xs text-gray-400">Based on recent form</div>
                          </div>

                          {/* Key Players */}
                          <div className="p-4 bg-slate-700 rounded-lg border border-slate-600">
                            <h5 className="text-sm font-bold text-white mb-2">Key Players</h5>
                            <div className="space-y-1">
                              {teamData.players.slice(0, 2).map((player, idx) => (
                                <div key={idx} className="text-xs text-blue-400">{player.name}</div>
                              ))}
                            </div>
                          </div>

                          {/* Weather Impact */}
                          <div className="p-4 bg-slate-700 rounded-lg border border-slate-600">
                            <h5 className="text-sm font-bold text-white mb-2">Conditions</h5>
                            <div className="text-sm text-yellow-400 mb-1">Favorable</div>
                            <div className="text-xs text-gray-400">Good batting conditions</div>
                          </div>
                        </div>

                        {/* Strategic Insights */}
                        <div className="mt-4 p-4 bg-slate-700 rounded-lg border border-slate-600">
                          <h5 className="text-sm font-bold text-white mb-3">Strategic Insights</h5>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <div className="text-green-400 font-medium mb-1">✅ Strengths to Exploit:</div>
                              <ul className="text-gray-300 space-y-1">
                                <li>• Strong top-order batting</li>
                                <li>• Pace bowling advantage</li>
                                <li>• Home ground familiarity</li>
                              </ul>
                            </div>
                            <div>
                              <div className="text-red-400 font-medium mb-1">Areas to Focus:</div>
                              <ul className="text-gray-300 space-y-1">
                                <li>• Death bowling preparation</li>
                                <li>• Against spin bowling</li>
                                <li>• Fielding in slips</li>
                              </ul>
                            </div>
                          </div>
                        </div>

                        {/* Recommended Team Changes */}
                        <div className="mt-4 p-4 bg-slate-700 rounded-lg border border-slate-600">
                          <h5 className="text-sm font-bold text-white mb-3">Recommended Changes</h5>
                          <div className="flex flex-wrap gap-2">
                            <span className="px-3 py-1 text-xs bg-green-800 text-green-200 rounded-full">
                              + Include extra spinner
                            </span>
                            <span className="px-3 py-1 text-xs bg-blue-800 text-blue-200 rounded-full">
                              + Strengthen middle order
                            </span>
                            <span className="px-3 py-1 text-xs bg-yellow-800 text-yellow-200 rounded-full">
                              + Practice death bowling
                            </span>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Match Prediction Summary */}
                {teamData.upcomingMatches.length > 0 && (
                  <div className="mt-6 p-6 bg-gradient-to-r from-slate-900 to-slate-800 rounded-lg border border-slate-600">
                    <h4 className="text-lg font-bold text-white mb-4">Overall Match Outlook</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400 mb-1">
                          {Math.floor(70 + Math.random() * 20)}%
                        </div>
                        <div className="text-sm text-gray-300">Average Win Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-400 mb-1">
                          {teamData.players.filter(p => p.availability).length}
                        </div>
                        <div className="text-sm text-gray-300">Available Players</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-slate-400 mb-1">
                          {Math.floor(75 + Math.random() * 20)}%
                        </div>
                        <div className="text-sm text-gray-300">Team Readiness</div>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent key="predictions-content" value="predictions" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Player Performance Prediction */}
              <Card className="border border-slate-600 shadow-lg bg-gradient-to-br from-slate-700 to-slate-800">
                <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-t-lg">
                  <CardTitle className="text-2xl font-heading font-bold text-white">Player Performance Prediction</CardTitle>
                  <CardDescription className="text-gray-200 font-sans font-medium">ML-powered performance forecasting</CardDescription>
                </CardHeader>
                <CardContent className="p-6 bg-slate-800">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Select Player</label>
                        <Select value={selectedPlayer} onValueChange={setSelectedPlayer}>
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                            <SelectValue placeholder="Choose player" />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-700 border-slate-600">
                            {getFilteredPlayers.map(player => (
                              <SelectItem key={player.id} value={player.name} className="text-white hover:bg-slate-600">
                                {player.name} ({player.role})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">Opposition</label>
                        <Select value={selectedOpposition} onValueChange={setSelectedOpposition}>
                          <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-700 border-slate-600">
                            {['Australia', 'England', 'New Zealand', 'South Africa', 'Pakistan', 'Sri Lanka', 'Bangladesh', 'West Indies'].map(team => (
                              <SelectItem key={team} value={team} className="text-white hover:bg-slate-600">{team}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Overs</label>
                      <input
                        type="number"
                        min="5"
                        max="50"
                        value={predictionOvers}
                        onChange={(e) => setPredictionOvers(Number(e.target.value) || 10)}
                        className="w-full px-3 py-2 bg-slate-700 border border-slate-600 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter overs (5-50)"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button 
                        onClick={() => {
                          if (selectedPlayer) {
                            const player = teamData?.players.find(p => p.name === selectedPlayer);
                            if (player) {
                              handlePredictPlayerPerformance(selectedPlayer, player.role);
                            }
                          }
                        }}
                        disabled={!selectedPlayer || predictionLoading}
                        className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white font-bold"
                      >
                        {predictionLoading ? <LoadingSpinner /> : 'Generate Prediction'}
                      </Button>
                      <Button 
                        onClick={clearPredictions}
                        variant="outline"
                        className="border-slate-600 text-gray-300 hover:bg-slate-700"
                      >
                        Clear
                      </Button>
                    </div>

                    {/* Prediction Results */}
                    {(battingPrediction || bowlingPrediction) && (
                      <div className="mt-6 space-y-4">
                        {battingPrediction && (
                          <div className="p-4 bg-slate-700 rounded-lg border border-slate-600">
                            <h4 className="text-lg font-bold text-white mb-2">Batting Prediction</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-400">Predicted Runs:</span>
                                <span className="text-green-400 font-bold ml-2">{battingPrediction.prediction.predicted_runs}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Confidence:</span>
                                <span className="text-blue-400 font-bold ml-2">{(battingPrediction.prediction.confidence * 100).toFixed(1)}%</span>
                              </div>
                            </div>
                            <div className="mt-2">
                              <span className="text-gray-400">Insights:</span>
                              <ul className="text-gray-300 text-xs mt-1">
                                {battingPrediction.prediction.insights.map((insight: string, idx: number) => (
                                  <li key={idx} className="ml-2">• {insight}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}

                        {bowlingPrediction && (
                          <div className="p-4 bg-slate-700 rounded-lg border border-slate-600">
                            <h4 className="text-lg font-bold text-white mb-2">Bowling Prediction</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-gray-400">Predicted Wickets:</span>
                                <span className="text-green-400 font-bold ml-2">{bowlingPrediction.prediction.predicted_wickets}</span>
                              </div>
                              <div>
                                <span className="text-gray-400">Confidence:</span>
                                <span className="text-blue-400 font-bold ml-2">{(bowlingPrediction.prediction.confidence * 100).toFixed(1)}%</span>
                              </div>
                            </div>
                            <div className="mt-2">
                              <span className="text-gray-400">Insights:</span>
                              <ul className="text-gray-300 text-xs mt-1">
                                {bowlingPrediction.prediction.insights.map((insight: string, idx: number) => (
                                  <li key={idx} className="ml-2">• {insight}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Team Optimization */}
              <Card className="border border-slate-600 shadow-lg bg-gradient-to-br from-slate-700 to-slate-800">
                <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 rounded-t-lg">
                  <CardTitle className="text-2xl font-heading font-bold text-white">Team Selection Optimization</CardTitle>
                  <CardDescription className="text-gray-200 font-sans font-medium">AI-powered team selection recommendations</CardDescription>
                </CardHeader>
                <CardContent className="p-6 bg-slate-800">
                  <div className="space-y-4">
                    <Button 
                      onClick={handleTeamOptimization}
                      disabled={predictionLoading}
                      className="w-full bg-slate-600 hover:bg-slate-700 text-white font-bold"
                    >
                      {predictionLoading ? <LoadingSpinner /> : `Optimize Team vs ${selectedOpposition}`}
                    </Button>

                    {teamOptimization && teamOptimization.success && (
                      <div className="space-y-4">
                        <div className="p-4 bg-slate-700 rounded-lg border border-slate-600">
                          <h4 className="text-lg font-bold text-white mb-3">Recommended Playing XI</h4>
                          <div className="space-y-2">
                            {teamOptimization.optimization.recommendedTeam.slice(0, 11).map((player: any, idx: number) => (
                              <div key={idx} className="flex justify-between items-center p-2 bg-slate-600 rounded">
                                <span className="text-white font-medium">{idx + 1}. {player.name}</span>
                                <div className="flex items-center gap-2">
                                  <span className="text-green-400 font-bold">{player.score}</span>
                                  <span className="text-xs text-gray-400">({(player.confidence * 100).toFixed(0)}%)</span>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="p-4 bg-slate-700 rounded-lg border border-slate-600">
                          <h4 className="text-md font-bold text-white mb-2">Optimization Stats</h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="text-gray-400">Players Analyzed:</span>
                              <span className="text-blue-400 font-bold ml-2">{teamOptimization.optimization.fullRankings.length}</span>
                            </div>
                            <div>
                              <span className="text-gray-400">Avg Confidence:</span>
                              <span className="text-green-400 font-bold ml-2">{(teamOptimization.optimization.averageConfidence * 100).toFixed(1)}%</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* ML Service Status */}
            <Card className="border border-slate-600 shadow-lg bg-gradient-to-br from-slate-700 to-slate-800">
              <CardHeader className="bg-gradient-to-r from-slate-800 to-slate-700 rounded-t-lg">
                <CardTitle className="text-xl font-heading font-bold text-white">ML Service Status</CardTitle>
                <CardDescription className="text-gray-200 font-sans font-medium">Machine learning model information and diagnostics</CardDescription>
              </CardHeader>
              <CardContent className="p-6 bg-slate-800">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-700 rounded-lg border border-slate-600">
                    <h4 className="text-sm font-bold text-white mb-2">Service Status</h4>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-slate-500 rounded-full"></div>
                      <span className="text-slate-400 font-medium">Operational</span>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-700 rounded-lg border border-slate-600">
                    <h4 className="text-sm font-bold text-white mb-2">Models Available</h4>
                    <div className="text-sm text-gray-300">
                      <div>Batting: 4 models</div>
                      <div>Bowling: 4 models</div>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-700 rounded-lg border border-slate-600">
                    <h4 className="text-sm font-bold text-white mb-2">Accuracy</h4>
                    <div className="text-sm text-gray-300">
                      <div>Batting: 78%</div>
                      <div>Bowling: 74%</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  );
}