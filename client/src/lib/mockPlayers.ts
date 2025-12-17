export interface MockPlayer {
  _id: string;
  name: string;
  role: 'batsman' | 'bowler' | 'all-rounder' | 'wicket-keeper';
  nationality: string;
  image?: string;
  teamId: {
    name: string;
    shortName: string;
    logo: string;
  };
  age: number;
  battingStyle: string;
  bowlingStyle: string;
  form: 'excellent' | 'good' | 'average' | 'poor';
  isInjured: boolean;
  isCaptain?: boolean;
  stats: {
    test: {
      matches: number;
      runs?: number;
      wickets?: number;
      average: number;
      strikeRate?: number;
      economy?: number;
      fifties?: number;
      hundreds?: number;
      catches: number;
    };
    odi: {
      matches: number;
      runs?: number;
      wickets?: number;
      average: number;
      strikeRate?: number;
      economy?: number;
      fifties?: number;
      hundreds?: number;
      catches: number;
    };
    t20: {
      matches: number;
      runs?: number;
      wickets?: number;
      average: number;
      strikeRate?: number;
      economy?: number;
      fifties?: number;
      hundreds?: number;
      catches: number;
    };
  };
  recentForm: Array<{
    match: string;
    performance: number;
    date: string;
  }>;
  strengths: string[];
  weaknesses: string[];
}

export const mockPlayers: MockPlayer[] = [
  {
    _id: "virat_kohli_001",
    name: "Virat Kohli",
    role: "batsman",
    nationality: "India",
    image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    teamId: {
      name: "Royal Challengers Bangalore",
      shortName: "RCB",
      logo: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=50&h=50&fit=crop"
    },
    age: 35,
    battingStyle: "Right-handed",
    bowlingStyle: "Right-arm medium",
    form: "excellent",
    isInjured: false,
    isCaptain: false,
    stats: {
      test: {
        matches: 111,
        runs: 8848,
        average: 49.15,
        strikeRate: 57.83,
        fifties: 29,
        hundreds: 29,
        catches: 115
      },
      odi: {
        matches: 274,
        runs: 12898,
        average: 57.32,
        strikeRate: 93.17,
        fifties: 65,
        hundreds: 46,
        catches: 148
      },
      t20: {
        matches: 115,
        runs: 4008,
        average: 52.73,
        strikeRate: 137.96,
        fifties: 37,
        hundreds: 1,
        catches: 90
      }
    },
    recentForm: [
      { match: "vs AUS", performance: 89, date: "2024-01-15" },
      { match: "vs ENG", performance: 112, date: "2024-01-10" },
      { match: "vs SA", performance: 67, date: "2024-01-05" },
      { match: "vs NZ", performance: 45, date: "2024-01-01" },
      { match: "vs WI", performance: 23, date: "2023-12-28" }
    ],
    strengths: ["Chase master", "Strong against pace", "Excellent timing", "Pressure performer"],
    weaknesses: ["Struggles against left-arm spin", "Inconsistent in England conditions"]
  },
  {
    _id: "rohit_sharma_002",
    name: "Rohit Sharma",
    role: "batsman",
    nationality: "India",
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    teamId: {
      name: "Mumbai Indians",
      shortName: "MI",
      logo: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=50&h=50&fit=crop"
    },
    age: 37,
    battingStyle: "Right-handed",
    bowlingStyle: "Right-arm off-break",
    form: "good",
    isInjured: false,
    isCaptain: true,
    stats: {
      test: {
        matches: 56,
        runs: 3137,
        average: 46.54,
        strikeRate: 56.93,
        fifties: 15,
        hundreds: 11,
        catches: 67
      },
      odi: {
        matches: 243,
        runs: 9825,
        average: 48.63,
        strikeRate: 88.90,
        fifties: 43,
        hundreds: 30,
        catches: 132
      },
      t20: {
        matches: 148,
        runs: 3853,
        average: 32.62,
        strikeRate: 140.38,
        fifties: 29,
        hundreds: 4,
        catches: 65
      }
    },
    recentForm: [
      { match: "vs AUS", performance: 67, date: "2024-01-15" },
      { match: "vs ENG", performance: 87, date: "2024-01-10" },
      { match: "vs SA", performance: 34, date: "2024-01-05" },
      { match: "vs NZ", performance: 112, date: "2024-01-01" },
      { match: "vs WI", performance: 78, date: "2023-12-28" }
    ],
    strengths: ["Excellent opener", "Strong pull shot", "Big match player", "Great captain"],
    weaknesses: ["Slow starter in Tests", "Vulnerable early in innings"]
  },
  {
    _id: "jasprit_bumrah_003",
    name: "Jasprit Bumrah",
    role: "bowler",
    nationality: "India",
    image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    teamId: {
      name: "Mumbai Indians",
      shortName: "MI",
      logo: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=50&h=50&fit=crop"
    },
    age: 30,
    battingStyle: "Right-handed",
    bowlingStyle: "Right-arm fast",
    form: "excellent",
    isInjured: false,
    isCaptain: false,
    stats: {
      test: {
        matches: 34,
        wickets: 159,
        average: 20.69,
        economy: 2.75,
        catches: 8
      },
      odi: {
        matches: 89,
        wickets: 145,
        average: 24.62,
        economy: 4.63,
        catches: 15
      },
      t20: {
        matches: 70,
        wickets: 89,
        average: 20.22,
        economy: 6.62,
        catches: 12
      }
    },
    recentForm: [
      { match: "vs AUS", performance: 92, date: "2024-01-15" },
      { match: "vs ENG", performance: 78, date: "2024-01-10" },
      { match: "vs SA", performance: 89, date: "2024-01-05" },
      { match: "vs NZ", performance: 67, date: "2024-01-01" },
      { match: "vs WI", performance: 95, date: "2023-12-28" }
    ],
    strengths: ["Yorker specialist", "Death bowling expert", "Unique action", "Accurate line and length"],
    weaknesses: ["Injury prone", "Limited variations"]
  },
  {
    _id: "kl_rahul_004",
    name: "KL Rahul",
    role: "wicket-keeper",
    nationality: "India",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    teamId: {
      name: "Lucknow Super Giants",
      shortName: "LSG",
      logo: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=50&h=50&fit=crop"
    },
    age: 32,
    battingStyle: "Right-handed",
    bowlingStyle: "Right-arm off-break",
    form: "good",
    isInjured: false,
    isCaptain: true,
    stats: {
      test: {
        matches: 47,
        runs: 2321,
        average: 34.61,
        strikeRate: 55.71,
        fifties: 13,
        hundreds: 7,
        catches: 89
      },
      odi: {
        matches: 49,
        runs: 1922,
        average: 45.76,
        strikeRate: 86.90,
        fifties: 13,
        hundreds: 6,
        catches: 45
      },
      t20: {
        matches: 64,
        runs: 2265,
        average: 37.75,
        strikeRate: 139.33,
        fifties: 18,
        hundreds: 2,
        catches: 78
      }
    },
    recentForm: [
      { match: "vs AUS", performance: 78, date: "2024-01-15" },
      { match: "vs ENG", performance: 56, date: "2024-01-10" },
      { match: "vs SA", performance: 89, date: "2024-01-05" },
      { match: "vs NZ", performance: 34, date: "2024-01-01" },
      { match: "vs WI", performance: 67, date: "2023-12-28" }
    ],
    strengths: ["Versatile batsman", "Good keeper", "Elegant stroke play", "Adaptable"],
    weaknesses: ["Inconsistent in longer formats", "Pressure handling"]
  },
  {
    _id: "hardik_pandya_005",
    name: "Hardik Pandya",
    role: "all-rounder",
    nationality: "India",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face",
    teamId: {
      name: "Mumbai Indians",
      shortName: "MI",
      logo: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=50&h=50&fit=crop"
    },
    age: 30,
    battingStyle: "Right-handed",
    bowlingStyle: "Right-arm fast-medium",
    form: "excellent",
    isInjured: false,
    isCaptain: false,
    stats: {
      test: {
        matches: 11,
        runs: 532,
        wickets: 17,
        average: 31.05,
        strikeRate: 70.27,
        economy: 3.90,
        catches: 11
      },
      odi: {
        matches: 74,
        runs: 1769,
        wickets: 79,
        average: 33.67,
        strikeRate: 113.44,
        economy: 5.34,
        catches: 45
      },
      t20: {
        matches: 98,
        runs: 1810,
        wickets: 42,
        average: 22.63,
        strikeRate: 144.78,
        economy: 7.65,
        catches: 67
      }
    },
    recentForm: [
      { match: "vs AUS", performance: 85, date: "2024-01-15" },
      { match: "vs ENG", performance: 92, date: "2024-01-10" },
      { match: "vs SA", performance: 78, date: "2024-01-05" },
      { match: "vs NZ", performance: 56, date: "2024-01-01" },
      { match: "vs WI", performance: 89, date: "2023-12-28" }
    ],
    strengths: ["Power hitter", "Useful medium pace", "Athletic fielder", "Match finisher"],
    weaknesses: ["Injury concerns", "Inconsistent bowling line"]
  },
  {
    _id: "ravindra_jadeja_006",
    name: "Ravindra Jadeja",
    role: "all-rounder",
    nationality: "India",
    image: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=face",
    teamId: {
      name: "Chennai Super Kings",
      shortName: "CSK",
      logo: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=50&h=50&fit=crop"
    },
    age: 35,
    battingStyle: "Left-handed",
    bowlingStyle: "Left-arm orthodox",
    form: "excellent",
    isInjured: false,
    isCaptain: false,
    stats: {
      test: {
        matches: 71,
        runs: 2804,
        wickets: 294,
        average: 35.26,
        strikeRate: 57.24,
        economy: 2.39,
        catches: 89
      },
      odi: {
        matches: 174,
        runs: 2756,
        wickets: 220,
        average: 32.95,
        strikeRate: 85.69,
        economy: 4.92,
        catches: 112
      },
      t20: {
        matches: 74,
        runs: 515,
        wickets: 54,
        average: 23.41,
        strikeRate: 127.16,
        economy: 7.13,
        catches: 56
      }
    },
    recentForm: [
      { match: "vs AUS", performance: 78, date: "2024-01-15" },
      { match: "vs ENG", performance: 89, date: "2024-01-10" },
      { match: "vs SA", performance: 67, date: "2024-01-05" },
      { match: "vs NZ", performance: 92, date: "2024-01-01" },
      { match: "vs WI", performance: 85, date: "2023-12-28" }
    ],
    strengths: ["Excellent fielder", "Reliable spinner", "Handy lower-order batsman", "Match winner"],
    weaknesses: ["Limited against quality pace", "Predictable bowling at times"]
  },
  {
    _id: "mohammed_shami_007",
    name: "Mohammed Shami",
    role: "bowler",
    nationality: "India",
    image: "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=150&h=150&fit=crop&crop=face",
    teamId: {
      name: "Gujarat Titans",
      shortName: "GT",
      logo: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=50&h=50&fit=crop"
    },
    age: 34,
    battingStyle: "Right-handed",
    bowlingStyle: "Right-arm fast",
    form: "excellent",
    isInjured: false,
    isCaptain: false,
    stats: {
      test: {
        matches: 64,
        wickets: 229,
        average: 27.16,
        economy: 2.82,
        catches: 18
      },
      odi: {
        matches: 95,
        wickets: 195,
        average: 24.32,
        economy: 5.96,
        catches: 23
      },
      t20: {
        matches: 24,
        wickets: 24,
        average: 32.29,
        economy: 8.54,
        catches: 8
      }
    },
    recentForm: [
      { match: "vs AUS", performance: 87, date: "2024-01-15" },
      { match: "vs ENG", performance: 92, date: "2024-01-10" },
      { match: "vs SA", performance: 78, date: "2024-01-05" },
      { match: "vs NZ", performance: 89, date: "2024-01-01" },
      { match: "vs WI", performance: 67, date: "2023-12-28" }
    ],
    strengths: ["Swing bowling expert", "Good reverse swing", "Experienced campaigner", "Big match performer"],
    weaknesses: ["Age factor", "Vulnerable to aggressive batting"]
  },
  {
    _id: "rishabh_pant_008",
    name: "Rishabh Pant",
    role: "wicket-keeper",
    nationality: "India",
    image: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face",
    teamId: {
      name: "Delhi Capitals",
      shortName: "DC",
      logo: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=50&h=50&fit=crop"
    },
    age: 27,
    battingStyle: "Left-handed",
    bowlingStyle: "Right-arm off-break",
    form: "good",
    isInjured: false,
    isCaptain: false,
    stats: {
      test: {
        matches: 33,
        runs: 2271,
        average: 43.67,
        strikeRate: 73.58,
        fifties: 9,
        hundreds: 6,
        catches: 91
      },
      odi: {
        matches: 30,
        runs: 865,
        average: 32.04,
        strikeRate: 106.54,
        fifties: 6,
        hundreds: 1,
        catches: 34
      },
      t20: {
        matches: 66,
        runs: 987,
        average: 22.88,
        strikeRate: 126.38,
        fifties: 3,
        hundreds: 0,
        catches: 78
      }
    },
    recentForm: [
      { match: "vs AUS", performance: 76, date: "2024-01-15" },
      { match: "vs ENG", performance: 89, date: "2024-01-10" },
      { match: "vs SA", performance: 45, date: "2024-01-05" },
      { match: "vs NZ", performance: 67, date: "2024-01-01" },
      { match: "vs WI", performance: 112, date: "2023-12-28" }
    ],
    strengths: ["Aggressive batting", "Counter-attacking style", "Good keeper", "Game changer"],
    weaknesses: ["Shot selection", "Consistency issues"]
  }
];

export const searchPlayers = (query: string, filters?: {
  role?: string;
  team?: string;
  form?: string;
  nationality?: string;
}): MockPlayer[] => {
  let filteredPlayers = mockPlayers;

  // Search by name or nationality
  if (query) {
    const searchTerm = query.toLowerCase();
    filteredPlayers = filteredPlayers.filter(player => 
      player.name.toLowerCase().includes(searchTerm) ||
      player.nationality.toLowerCase().includes(searchTerm) ||
      player.teamId.name.toLowerCase().includes(searchTerm) ||
      player.teamId.shortName.toLowerCase().includes(searchTerm)
    );
  }

  // Apply filters
  if (filters) {
    if (filters.role && filters.role !== 'all') {
      filteredPlayers = filteredPlayers.filter(player => player.role === filters.role);
    }
    
    if (filters.form && filters.form !== 'all') {
      filteredPlayers = filteredPlayers.filter(player => player.form === filters.form);
    }
    
    if (filters.nationality && filters.nationality !== 'all') {
      filteredPlayers = filteredPlayers.filter(player => player.nationality === filters.nationality);
    }
    
    if (filters.team && filters.team !== 'all') {
      filteredPlayers = filteredPlayers.filter(player => 
        player.teamId.name.toLowerCase().includes(filters.team!.toLowerCase()) ||
        player.teamId.shortName.toLowerCase().includes(filters.team!.toLowerCase())
      );
    }
  }

  return filteredPlayers;
};

export const getPlayerById = (id: string): MockPlayer | undefined => {
  return mockPlayers.find(player => player._id === id);
};

export const getAllPlayers = (): MockPlayer[] => {
  return mockPlayers;
};