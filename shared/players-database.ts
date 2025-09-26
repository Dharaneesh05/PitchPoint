// Comprehensive cricket players database
export interface Player {
  id: string;
  name: string;
  team: string;
  role: 'Batsman' | 'Bowler' | 'All-rounder' | 'Wicket-keeper';
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
  };
  form: 'excellent' | 'good' | 'average' | 'poor';
  fitness: number;
  isInjured: boolean;
  availability: boolean;
}

export const cricketPlayersDatabase: Player[] = [
  // Indian Players
  {
    id: '1',
    name: 'Virat Kohli',
    team: 'Royal Challengers Bangalore',
    role: 'Batsman',
    country: 'India',
    age: 36,
    format: ['Test', 'ODI', 'T20'],
    stats: {
      matches: 516,
      runs: 26733,
      average: 53.62,
      strikeRate: 93.27
    },
    form: 'excellent',
    fitness: 95,
    isInjured: false,
    availability: true
  },
  {
    id: '2',
    name: 'Rohit Sharma',
    team: 'Mumbai Indians',
    role: 'Batsman',
    country: 'India',
    age: 38,
    format: ['Test', 'ODI', 'T20'],
    stats: {
      matches: 474,
      runs: 18794,
      average: 43.41,
      strikeRate: 91.49
    },
    form: 'excellent',
    fitness: 92,
    isInjured: false,
    availability: true
  },
  {
    id: '3',
    name: 'Jasprit Bumrah',
    team: 'Mumbai Indians',
    role: 'Bowler',
    country: 'India',
    age: 31,
    format: ['Test', 'ODI', 'T20'],
    stats: {
      matches: 161,
      wickets: 322,
      average: 20.61,
      economyRate: 4.18
    },
    form: 'excellent',
    fitness: 89,
    isInjured: false,
    availability: true
  },
  {
    id: '4',
    name: 'KL Rahul',
    team: 'Lucknow Super Giants',
    role: 'Wicket-keeper',
    country: 'India',
    age: 33,
    format: ['Test', 'ODI', 'T20'],
    stats: {
      matches: 213,
      runs: 8659,
      average: 47.64,
      strikeRate: 88.31
    },
    form: 'good',
    fitness: 87,
    isInjured: false,
    availability: true
  },
  {
    id: '5',
    name: 'Hardik Pandya',
    team: 'Mumbai Indians',
    role: 'All-rounder',
    country: 'India',
    age: 32,
    format: ['Test', 'ODI', 'T20'],
    stats: {
      matches: 194,
      runs: 3386,
      wickets: 79,
      average: 31.96,
      strikeRate: 123.42
    },
    form: 'good',
    fitness: 88,
    isInjured: false,
    availability: true
  },
  {
    id: '6',
    name: 'Ravindra Jadeja',
    team: 'Chennai Super Kings',
    role: 'All-rounder',
    country: 'India',
    age: 36,
    format: ['Test', 'ODI', 'T20'],
    stats: {
      matches: 306,
      runs: 5546,
      wickets: 294,
      average: 33.37,
      strikeRate: 98.21
    },
    form: 'excellent',
    fitness: 94,
    isInjured: false,
    availability: true
  },
  {
    id: '7',
    name: 'Mohammed Shami',
    team: 'Gujarat Titans',
    role: 'Bowler',
    country: 'India',
    age: 35,
    format: ['Test', 'ODI'],
    stats: {
      matches: 219,
      wickets: 448,
      average: 27.14,
      economyRate: 4.73
    },
    form: 'good',
    fitness: 85,
    isInjured: true,
    availability: false
  },
  {
    id: '8',
    name: 'Rishabh Pant',
    team: 'Delhi Capitals',
    role: 'Wicket-keeper',
    country: 'India',
    age: 28,
    format: ['Test', 'ODI', 'T20'],
    stats: {
      matches: 159,
      runs: 4194,
      average: 35.66,
      strikeRate: 126.48
    },
    form: 'good',
    fitness: 82,
    isInjured: false,
    availability: true
  },
  {
    id: '9',
    name: 'Shubman Gill',
    team: 'Gujarat Titans',
    role: 'Batsman',
    country: 'India',
    age: 26,
    format: ['Test', 'ODI', 'T20'],
    stats: {
      matches: 79,
      runs: 2934,
      average: 41.91,
      strikeRate: 96.17
    },
    form: 'excellent',
    fitness: 91,
    isInjured: false,
    availability: true
  },
  {
    id: '10',
    name: 'Yuzvendra Chahal',
    team: 'Rajasthan Royals',
    role: 'Bowler',
    country: 'India',
    age: 35,
    format: ['ODI', 'T20'],
    stats: {
      matches: 154,
      wickets: 201,
      average: 25.95,
      economyRate: 6.14
    },
    form: 'good',
    fitness: 83,
    isInjured: false,
    availability: true
  },

  // Australian Players
  {
    id: '11',
    name: 'Steve Smith',
    team: 'Sydney Sixers',
    role: 'Batsman',
    country: 'Australia',
    age: 36,
    format: ['Test', 'ODI', 'T20'],
    stats: {
      matches: 368,
      runs: 18111,
      average: 56.97,
      strikeRate: 88.42
    },
    form: 'excellent',
    fitness: 93,
    isInjured: false,
    availability: true
  },
  {
    id: '12',
    name: 'David Warner',
    team: 'Delhi Capitals',
    role: 'Batsman',
    country: 'Australia',
    age: 38,
    format: ['Test', 'ODI', 'T20'],
    stats: {
      matches: 383,
      runs: 18995,
      average: 44.59,
      strikeRate: 95.16
    },
    form: 'good',
    fitness: 89,
    isInjured: false,
    availability: true
  },
  {
    id: '13',
    name: 'Pat Cummins',
    team: 'Kolkata Knight Riders',
    role: 'Bowler',
    country: 'Australia',
    age: 32,
    format: ['Test', 'ODI', 'T20'],
    stats: {
      matches: 174,
      wickets: 380,
      average: 22.59,
      economyRate: 4.51
    },
    form: 'excellent',
    fitness: 95,
    isInjured: false,
    availability: true
  },
  {
    id: '14',
    name: 'Glenn Maxwell',
    team: 'Royal Challengers Bangalore',
    role: 'All-rounder',
    country: 'Australia',
    age: 37,
    format: ['ODI', 'T20'],
    stats: {
      matches: 318,
      runs: 7496,
      wickets: 75,
      average: 32.52,
      strikeRate: 154.68
    },
    form: 'good',
    fitness: 87,
    isInjured: false,
    availability: true
  },
  {
    id: '15',
    name: 'Mitchell Starc',
    team: 'Kolkata Knight Riders',
    role: 'Bowler',
    country: 'Australia',
    age: 35,
    format: ['Test', 'ODI', 'T20'],
    stats: {
      matches: 232,
      wickets: 481,
      average: 22.85,
      economyRate: 4.88
    },
    form: 'excellent',
    fitness: 91,
    isInjured: false,
    availability: true
  },

  // English Players
  {
    id: '16',
    name: 'Joe Root',
    team: 'Yorkshire',
    role: 'Batsman',
    country: 'England',
    age: 35,
    format: ['Test', 'ODI', 'T20'],
    stats: {
      matches: 394,
      runs: 19955,
      average: 49.25,
      strikeRate: 87.73
    },
    form: 'excellent',
    fitness: 92,
    isInjured: false,
    availability: true
  },
  {
    id: '17',
    name: 'Ben Stokes',
    team: 'Durham',
    role: 'All-rounder',
    country: 'England',
    age: 34,
    format: ['Test', 'ODI', 'T20'],
    stats: {
      matches: 334,
      runs: 11541,
      wickets: 283,
      average: 35.89,
      strikeRate: 93.88
    },
    form: 'excellent',
    fitness: 89,
    isInjured: false,
    availability: true
  },
  {
    id: '18',
    name: 'Jos Buttler',
    team: 'Rajasthan Royals',
    role: 'Wicket-keeper',
    country: 'England',
    age: 35,
    format: ['Test', 'ODI', 'T20'],
    stats: {
      matches: 334,
      runs: 11946,
      average: 40.22,
      strikeRate: 115.68
    },
    form: 'good',
    fitness: 86,
    isInjured: false,
    availability: true
  },
  {
    id: '19',
    name: 'Jofra Archer',
    team: 'Sussex',
    role: 'Bowler',
    country: 'England',
    age: 30,
    format: ['Test', 'ODI', 'T20'],
    stats: {
      matches: 76,
      wickets: 143,
      average: 23.38,
      economyRate: 4.57
    },
    form: 'good',
    fitness: 84,
    isInjured: true,
    availability: false
  },
  {
    id: '20',
    name: 'Harry Brook',
    team: 'Yorkshire',
    role: 'Batsman',
    country: 'England',
    age: 26,
    format: ['Test', 'ODI', 'T20'],
    stats: {
      matches: 67,
      runs: 2956,
      average: 52.95,
      strikeRate: 89.34
    },
    form: 'excellent',
    fitness: 93,
    isInjured: false,
    availability: true
  },

  // Pakistani Players
  {
    id: '21',
    name: 'Babar Azam',
    team: 'Karachi Kings',
    role: 'Batsman',
    country: 'Pakistan',
    age: 30,
    format: ['Test', 'ODI', 'T20'],
    stats: {
      matches: 280,
      runs: 13723,
      average: 53.71,
      strikeRate: 89.28
    },
    form: 'excellent',
    fitness: 91,
    isInjured: false,
    availability: true
  },
  {
    id: '22',
    name: 'Shaheen Shah Afridi',
    team: 'Lahore Qalandars',
    role: 'Bowler',
    country: 'Pakistan',
    age: 25,
    format: ['Test', 'ODI', 'T20'],
    stats: {
      matches: 114,
      wickets: 239,
      average: 22.68,
      economyRate: 4.82
    },
    form: 'excellent',
    fitness: 89,
    isInjured: false,
    availability: true
  },
  {
    id: '23',
    name: 'Mohammad Rizwan',
    team: 'Multan Sultans',
    role: 'Wicket-keeper',
    country: 'Pakistan',
    age: 33,
    format: ['Test', 'ODI', 'T20'],
    stats: {
      matches: 178,
      runs: 6894,
      average: 42.66,
      strikeRate: 126.19
    },
    form: 'excellent',
    fitness: 88,
    isInjured: false,
    availability: true
  },
  {
    id: '24',
    name: 'Shadab Khan',
    team: 'Islamabad United',
    role: 'All-rounder',
    country: 'Pakistan',
    age: 27,
    format: ['ODI', 'T20'],
    stats: {
      matches: 178,
      runs: 2341,
      wickets: 156,
      average: 24.36,
      strikeRate: 118.47
    },
    form: 'good',
    fitness: 85,
    isInjured: false,
    availability: true
  },

  // South African Players
  {
    id: '25',
    name: 'Quinton de Kock',
    team: 'Lucknow Super Giants',
    role: 'Wicket-keeper',
    country: 'South Africa',
    age: 32,
    format: ['Test', 'ODI', 'T20'],
    stats: {
      matches: 315,
      runs: 11617,
      average: 38.82,
      strikeRate: 93.27
    },
    form: 'good',
    fitness: 86,
    isInjured: false,
    availability: true
  },
  {
    id: '26',
    name: 'Kagiso Rabada',
    team: 'Punjab Kings',
    role: 'Bowler',
    country: 'South Africa',
    age: 30,
    format: ['Test', 'ODI', 'T20'],
    stats: {
      matches: 181,
      wickets: 381,
      average: 21.89,
      economyRate: 4.72
    },
    form: 'excellent',
    fitness: 92,
    isInjured: false,
    availability: true
  },

  // New Zealand Players
  {
    id: '27',
    name: 'Kane Williamson',
    team: 'Gujarat Titans',
    role: 'Batsman',
    country: 'New Zealand',
    age: 35,
    format: ['Test', 'ODI', 'T20'],
    stats: {
      matches: 378,
      runs: 17134,
      average: 49.96,
      strikeRate: 83.21
    },
    form: 'excellent',
    fitness: 90,
    isInjured: false,
    availability: true
  },
  {
    id: '28',
    name: 'Trent Boult',
    team: 'Rajasthan Royals',
    role: 'Bowler',
    country: 'New Zealand',
    age: 36,
    format: ['Test', 'ODI', 'T20'],
    stats: {
      matches: 378,
      wickets: 663,
      average: 24.89,
      economyRate: 4.85
    },
    form: 'good',
    fitness: 87,
    isInjured: false,
    availability: true
  },

  // West Indies Players
  {
    id: '29',
    name: 'Andre Russell',
    team: 'Kolkata Knight Riders',
    role: 'All-rounder',
    country: 'West Indies',
    age: 37,
    format: ['ODI', 'T20'],
    stats: {
      matches: 225,
      runs: 4395,
      wickets: 126,
      average: 25.32,
      strikeRate: 169.71
    },
    form: 'good',
    fitness: 83,
    isInjured: false,
    availability: true
  },
  {
    id: '30',
    name: 'Nicholas Pooran',
    team: 'Lucknow Super Giants',
    role: 'Wicket-keeper',
    country: 'West Indies',
    age: 29,
    format: ['ODI', 'T20'],
    stats: {
      matches: 158,
      runs: 4289,
      average: 32.20,
      strikeRate: 135.84
    },
    form: 'good',
    fitness: 84,
    isInjured: false,
    availability: true
  }
];

// Helper functions
export const searchPlayers = (query: string): Player[] => {
  if (!query) return cricketPlayersDatabase;
  
  const lowercaseQuery = query.toLowerCase();
  return cricketPlayersDatabase.filter(player =>
    player.name.toLowerCase().includes(lowercaseQuery) ||
    player.team.toLowerCase().includes(lowercaseQuery) ||
    player.country.toLowerCase().includes(lowercaseQuery) ||
    player.role.toLowerCase().includes(lowercaseQuery)
  );
};

export const getPlayersByTeam = (team: string): Player[] => {
  return cricketPlayersDatabase.filter(player => 
    player.team.toLowerCase().includes(team.toLowerCase())
  );
};

export const getPlayersByCountry = (country: string): Player[] => {
  return cricketPlayersDatabase.filter(player => 
    player.country.toLowerCase() === country.toLowerCase()
  );
};

export const getAvailablePlayers = (): Player[] => {
  return cricketPlayersDatabase.filter(player => player.availability && !player.isInjured);
};

export const getInjuredPlayers = (): Player[] => {
  return cricketPlayersDatabase.filter(player => player.isInjured);
};