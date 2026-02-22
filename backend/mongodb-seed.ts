import { dbConnection } from './mongodb';
import {
  Team, Player, Venue, Match, PlayerPerformance, FantasyPoints, User
} from '../shared/mongodb-schema';

const teamData = [
  {
    name: "India",
    shortName: "IND",
    country: "India",
    logo: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop",
    squad: [],
    captain: null,
    coach: null,
    ranking: {
      test: 1,
      odi: 1,
      t20: 1
    },
    isActive: true,
    teamType: "international"
  },
  {
    name: "Australia",
    shortName: "AUS", 
    country: "Australia",
    logo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop",
    squad: [],
    captain: null,
    coach: null,
    ranking: {
      test: 2,
      odi: 2,
      t20: 2
    },
    isActive: true,
    teamType: "international"
  },
  {
    name: "England",
    shortName: "ENG",
    country: "England", 
    logo: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop",
    squad: [],
    captain: null,
    coach: null,
    ranking: {
      test: 3,
      odi: 4,
      t20: 3
    },
    isActive: true,
    teamType: "international"
  },
  {
    name: "South Africa",
    shortName: "SA",
    country: "South Africa",
    logo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop",
    squad: [],
    captain: null,
    coach: null,
    ranking: {
      test: 4,
      odi: 3,
      t20: 4
    },
    isActive: true,
    teamType: "international"
  },
  {
    name: "Pakistan",
    shortName: "PAK",
    country: "Pakistan",
    logo: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop",
    squad: [],
    captain: null,
    coach: null,
    ranking: {
      test: 5,
      odi: 5,
      t20: 5
    },
    isActive: true,
    teamType: "international"
  },
  {
    name: "New Zealand",
    shortName: "NZ",
    country: "New Zealand",
    logo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop",
    squad: [],
    captain: null,
    coach: null,
    ranking: {
      test: 6,
      odi: 6,
      t20: 6
    },
    isActive: true,
    teamType: "international"
  },
  {
    name: "West Indies",
    shortName: "WI",
    country: "West Indies",
    logo: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop",
    squad: [],
    captain: null,
    coach: null,
    ranking: {
      test: 7,
      odi: 7,
      t20: 7
    },
    isActive: true,
    teamType: "international"
  },
  {
    name: "Sri Lanka",
    shortName: "SL",
    country: "Sri Lanka",
    logo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop",
    squad: [],
    captain: null,
    coach: null,
    ranking: {
      test: 8,
      odi: 8,
      t20: 8
    },
    isActive: true,
    teamType: "international"
  }
];

const venueData = [
  {
    name: "Melbourne Cricket Ground",
    city: "Melbourne",
    country: "Australia",
    capacity: 100024,
    pitchType: "Balanced",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Lord's Cricket Ground",
    city: "London", 
    country: "England",
    capacity: 31100,
    pitchType: "Bowling",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Eden Gardens",
    city: "Kolkata",
    country: "India",
    capacity: 66000,
    pitchType: "Batting",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "The Oval",
    city: "London",
    country: "England", 
    capacity: 25500,
    pitchType: "Balanced",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Wankhede Stadium",
    city: "Mumbai",
    country: "India",
    capacity: 33108,
    pitchType: "Batting",
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Sydney Cricket Ground",
    city: "Sydney",
    country: "Australia",
    capacity: 48000,
    pitchType: "Bowling",
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const playerData = [
  // India Players
  {
    name: "Virat Kohli",
    role: "batsman",
    battingStyle: "Right-hand bat",
    bowlingStyle: null,
    image: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop",
    dateOfBirth: new Date("1988-11-05"),
    nationality: "Indian",
    isInjured: false,
    isRetired: false,
    isCaptain: false,
    jerseyNumber: 18,
    stats: {
      test: {
        matches: 113,
        runs: 8848,
        average: 48.9,
        strikeRate: 55.78,
        fifties: 29,
        hundreds: 29,
        wickets: 0,
        catches: 122
      },
      odi: {
        matches: 295,
        runs: 13848,
        average: 58.18,
        strikeRate: 93.54,
        fifties: 71,
        hundreds: 50,
        wickets: 4,
        catches: 148
      },
      t20: {
        matches: 125,
        runs: 4037,
        average: 52.73,
        strikeRate: 137.96,
        fifties: 38,
        hundreds: 1,
        wickets: 0,
        catches: 59
      }
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Rohit Sharma",
    role: "batsman",
    battingStyle: "Right-hand bat",
    bowlingStyle: "Right-arm off break",
    image: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop",
    dateOfBirth: new Date("1987-04-30"),
    nationality: "Indian",
    isInjured: false,
    isRetired: false,
    isCaptain: true,
    jerseyNumber: 45,
    stats: {
      test: {
        matches: 62,
        runs: 4301,
        average: 44.81,
        strikeRate: 60.93,
        fifties: 18,
        hundreds: 11,
        wickets: 0,
        catches: 67
      },
      odi: {
        matches: 265,
        runs: 10866,
        average: 48.96,
        strikeRate: 90.99,
        fifties: 50,
        hundreds: 31,
        wickets: 8,
        catches: 136
      },
      t20: {
        matches: 159,
        runs: 4231,
        average: 31.32,
        strikeRate: 140.89,
        fifties: 31,
        hundreds: 5,
        wickets: 0,
        catches: 65
      }
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Jasprit Bumrah",
    role: "bowler",
    battingStyle: "Right-hand bat",
    bowlingStyle: "Right-arm fast",
    image: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop",
    dateOfBirth: new Date("1993-12-06"),
    nationality: "Indian",
    isInjured: false,
    isRetired: false,
    isCaptain: false,
    jerseyNumber: 93,
    stats: {
      test: {
        matches: 36,
        runs: 117,
        average: 4.33,
        strikeRate: 34.31,
        fifties: 0,
        hundreds: 0,
        wickets: 159,
        economy: 2.78,
        catches: 6
      },
      odi: {
        matches: 89,
        runs: 35,
        average: 8.75,
        strikeRate: 114.29,
        fifties: 0,
        hundreds: 0,
        wickets: 149,
        economy: 4.65,
        catches: 23
      },
      t20: {
        matches: 70,
        runs: 35,
        average: 17.50,
        strikeRate: 145.83,
        fifties: 0,
        hundreds: 0,
        wickets: 89,
        economy: 6.62,
        catches: 17
      }
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Hardik Pandya",
    role: "all-rounder",
    battingStyle: "Right-hand bat",
    bowlingStyle: "Right-arm fast-medium",
    image: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop",
    dateOfBirth: new Date("1993-10-11"),
    nationality: "Indian",
    isInjured: false,
    isRetired: false,
    isCaptain: false,
    jerseyNumber: 33,
    stats: {
      test: {
        matches: 11,
        runs: 532,
        average: 31.29,
        strikeRate: 70.18,
        fifties: 4,
        hundreds: 0,
        wickets: 17,
        economy: 3.31,
        catches: 11
      },
      odi: {
        matches: 92,
        runs: 1386,
        average: 32.23,
        strikeRate: 113.91,
        fifties: 3,
        hundreds: 0,
        wickets: 79,
        economy: 5.56,
        catches: 38
      },
      t20: {
        matches: 104,
        runs: 921,
        average: 27.91,
        strikeRate: 143.32,
        fifties: 1,
        hundreds: 0,
        wickets: 42,
        economy: 7.65,
        catches: 39
      }
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "MS Dhoni",
    role: "wicket-keeper",
    battingStyle: "Right-hand bat",
    bowlingStyle: "Right-arm medium",
    image: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop",
    dateOfBirth: new Date("1981-07-07"),
    nationality: "Indian",
    isInjured: false,
    isRetired: true,
    isCaptain: false,
    jerseyNumber: 7,
    stats: {
      test: {
        matches: 90,
        runs: 4876,
        average: 38.09,
        strikeRate: 58.99,
        fifties: 33,
        hundreds: 6,
        wickets: 0,
        dismissals: 294,
        catches: 256,
        stumpings: 38
      },
      odi: {
        matches: 350,
        runs: 10773,
        average: 50.57,
        strikeRate: 87.56,
        fifties: 73,
        hundreds: 10,
        wickets: 1,
        dismissals: 444,
        catches: 321,
        stumpings: 123
      },
      t20: {
        matches: 98,
        runs: 1617,
        average: 37.60,
        strikeRate: 126.13,
        fifties: 2,
        hundreds: 0,
        wickets: 0,
        dismissals: 91,
        catches: 57,
        stumpings: 34
      }
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // Australia Players
  {
    name: "Steve Smith",
    role: "batsman",
    battingStyle: "Right-hand bat",
    bowlingStyle: "Right-arm leg break",
    image: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop",
    dateOfBirth: new Date("1989-06-02"),
    nationality: "Australian",
    isInjured: false,
    isRetired: false,
    isCaptain: false,
    jerseyNumber: 49,
    stats: {
      test: {
        matches: 109,
        runs: 9685,
        average: 56.97,
        strikeRate: 55.26,
        fifties: 41,
        hundreds: 32,
        wickets: 19,
        catches: 204
      },
      odi: {
        matches: 155,
        runs: 4939,
        average: 43.34,
        strikeRate: 87.85,
        fifties: 29,
        hundreds: 12,
        wickets: 28,
        catches: 80
      },
      t20: {
        matches: 67,
        runs: 1063,
        average: 28.73,
        strikeRate: 126.03,
        fifties: 4,
        hundreds: 0,
        wickets: 0,
        catches: 38
      }
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "David Warner",
    role: "batsman",
    battingStyle: "Left-hand bat",
    bowlingStyle: "Right-arm leg break",
    image: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop",
    dateOfBirth: new Date("1986-10-27"),
    nationality: "Australian",
    isInjured: false,
    isRetired: false,
    isCaptain: false,
    jerseyNumber: 31,
    stats: {
      test: {
        matches: 112,
        runs: 8786,
        average: 44.59,
        strikeRate: 70.19,
        fifties: 37,
        hundreds: 26,
        wickets: 0,
        catches: 62
      },
      odi: {
        matches: 139,
        runs: 6007,
        average: 45.30,
        strikeRate: 95.42,
        fifties: 33,
        hundreds: 22,
        wickets: 0,
        catches: 64
      },
      t20: {
        matches: 110,
        runs: 3277,
        average: 33.43,
        strikeRate: 142.20,
        fifties: 24,
        hundreds: 1,
        wickets: 0,
        catches: 42
      }
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Pat Cummins",
    role: "bowler",
    battingStyle: "Right-hand bat",
    bowlingStyle: "Right-arm fast",
    image: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop",
    dateOfBirth: new Date("1993-05-08"),
    nationality: "Australian",
    isInjured: false,
    isRetired: false,
    isCaptain: true,
    jerseyNumber: 30,
    stats: {
      test: {
        matches: 61,
        runs: 1000,
        average: 19.23,
        strikeRate: 66.62,
        fifties: 2,
        hundreds: 0,
        wickets: 269,
        economy: 2.91,
        catches: 31
      },
      odi: {
        matches: 95,
        runs: 441,
        average: 14.70,
        strikeRate: 89.21,
        fifties: 0,
        hundreds: 0,
        wickets: 171,
        economy: 4.73,
        catches: 31
      },
      t20: {
        matches: 51,
        runs: 52,
        average: 8.67,
        strikeRate: 118.18,
        fifties: 0,
        hundreds: 0,
        wickets: 52,
        economy: 7.23,
        catches: 13
      }
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Glenn Maxwell",
    role: "all-rounder",
    battingStyle: "Right-hand bat",
    bowlingStyle: "Right-arm off break",
    image: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop",
    dateOfBirth: new Date("1988-10-14"),
    nationality: "Australian",
    isInjured: false,
    isRetired: false,
    isCaptain: false,
    jerseyNumber: 32,
    stats: {
      test: {
        matches: 7,
        runs: 339,
        average: 26.08,
        strikeRate: 94.99,
        fifties: 2,
        hundreds: 0,
        wickets: 4,
        economy: 4.86,
        catches: 5
      },
      odi: {
        matches: 137,
        runs: 3734,
        average: 33.33,
        strikeRate: 124.68,
        fifties: 22,
        hundreds: 3,
        wickets: 58,
        economy: 4.96,
        catches: 70
      },
      t20: {
        matches: 102,
        runs: 2157,
        average: 29.68,
        strikeRate: 154.70,
        fifties: 8,
        hundreds: 0,
        wickets: 29,
        economy: 7.04,
        catches: 45
      }
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  
  // England Players
  {
    name: "Joe Root",
    role: "batsman",
    battingStyle: "Right-hand bat",
    bowlingStyle: "Right-arm off break",
    image: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop",
    dateOfBirth: new Date("1990-12-30"),
    nationality: "English",
    isInjured: false,
    isRetired: false,
    isCaptain: false,
    jerseyNumber: 66,
    stats: {
      test: {
        matches: 146,
        runs: 12472,
        average: 49.69,
        strikeRate: 55.62,
        fifties: 63,
        hundreds: 31,
        wickets: 3,
        catches: 174
      },
      odi: {
        matches: 171,
        runs: 6109,
        average: 47.36,
        strikeRate: 86.55,
        fifties: 39,
        hundreds: 16,
        wickets: 4,
        catches: 74
      },
      t20: {
        matches: 32,
        runs: 893,
        average: 35.72,
        strikeRate: 126.59,
        fifties: 5,
        hundreds: 0,
        wickets: 0,
        catches: 12
      }
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "Ben Stokes",
    role: "all-rounder",
    battingStyle: "Left-hand bat",
    bowlingStyle: "Right-arm fast-medium",
    image: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop",
    dateOfBirth: new Date("1991-06-04"),
    nationality: "English",
    isInjured: false,
    isRetired: false,
    isCaptain: true,
    jerseyNumber: 55,
    stats: {
      test: {
        matches: 105,
        runs: 6402,
        average: 35.89,
        strikeRate: 57.73,
        fifties: 31,
        hundreds: 13,
        wickets: 204,
        economy: 3.17,
        catches: 130
      },
      odi: {
        matches: 113,
        runs: 3019,
        average: 38.31,
        strikeRate: 93.20,
        fifties: 21,
        hundreds: 3,
        wickets: 74,
        economy: 6.16,
        catches: 46
      },
      t20: {
        matches: 43,
        runs: 612,
        average: 21.86,
        strikeRate: 133.26,
        fifties: 1,
        hundreds: 0,
        wickets: 8,
        economy: 7.69,
        catches: 17
      }
    },
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    name: "James Anderson",
    role: "bowler",
    battingStyle: "Left-hand bat",
    bowlingStyle: "Right-arm fast-medium",
    image: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop",
    dateOfBirth: new Date("1982-07-30"),
    nationality: "English",
    isInjured: false,
    isRetired: false,
    isCaptain: false,
    jerseyNumber: 9,
    stats: {
      test: {
        matches: 188,
        runs: 1272,
        average: 9.22,
        strikeRate: 38.47,
        fifties: 0,
        hundreds: 0,
        wickets: 700,
        economy: 2.89,
        catches: 36
      },
      odi: {
        matches: 194,
        runs: 273,
        average: 8.53,
        strikeRate: 69.54,
        fifties: 0,
        hundreds: 0,
        wickets: 269,
        economy: 4.92,
        catches: 54
      },
      t20: {
        matches: 19,
        runs: 11,
        average: 3.67,
        strikeRate: 91.67,
        fifties: 0,
        hundreds: 0,
        wickets: 18,
        economy: 7.46,
        catches: 4
      }
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

async function seedMongoDB() {
  try {
    console.log('🌱 Starting MongoDB seeding...');

    // Connect to MongoDB
    await dbConnection.connect();

    // Clear existing data
    console.log('🗑️ Clearing existing data...');
    await Player.deleteMany({});
    await Team.deleteMany({});
    await Venue.deleteMany({});
    await Match.deleteMany({});
    await PlayerPerformance.deleteMany({});
    await FantasyPoints.deleteMany({});

    // Seed teams
    console.log('👥 Seeding teams...');
    const insertedTeams = await Team.insertMany(teamData);
    console.log(`[MONGODB] Inserted ${insertedTeams.length} teams`);

    // Seed venues
    console.log('🏟️ Seeding venues...');
    const insertedVenues = await Venue.insertMany(venueData);
    console.log(`[MONGODB] Inserted ${insertedVenues.length} venues`);

    // Seed players and assign to teams
    console.log('🏃‍♂️ Seeding players...');
    const playersWithTeams = playerData.map((player, index) => {
      const teamIndex = index < 5 ? 0 : index < 10 ? 1 : 2; // India, Australia, England
      return {
        ...player,
        teamId: insertedTeams[teamIndex]._id
      };
    });
    
    const insertedPlayers = await Player.insertMany(playersWithTeams);
    console.log(`[MONGODB] Inserted ${insertedPlayers.length} players`);

    // Update teams with their squad
    console.log('🔄 Updating team squads...');
    for (let i = 0; i < insertedTeams.length && i < 3; i++) {
      const teamPlayers = insertedPlayers.filter((_, index) => {
        if (i === 0) return index < 5; // India
        if (i === 1) return index >= 5 && index < 10; // Australia
        if (i === 2) return index >= 10; // England
        return false;
      });
      
      await Team.findByIdAndUpdate(insertedTeams[i]._id, {
        squad: teamPlayers.map(p => p._id),
        captain: teamPlayers.find(p => p.isCaptain)?._id || teamPlayers[0]._id
      });
    }

    // Seed matches
    console.log('🏏 Seeding matches...');
    const matchData = [
      {
        externalId: "match_001",
        team1Id: insertedTeams[0]._id, // India
        team2Id: insertedTeams[1]._id, // Australia
        venueId: insertedVenues[0]._id, // MCG
        matchType: "T20",
        status: "live",
        scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        startTime: new Date(Date.now() + 2 * 60 * 60 * 1000),
        team1Score: "185/4",
        team2Score: "188/6",
        overs: "20.0",
        series: "Australia vs India T20 Series",
        season: "2024-25",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        externalId: "match_002",
        team1Id: insertedTeams[2]._id, // England
        team2Id: insertedTeams[3]._id, // South Africa
        venueId: insertedVenues[1]._id, // Lord's
        matchType: "ODI",
        status: "upcoming",
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        series: "England vs South Africa ODI Series",
        season: "2024-25",
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        externalId: "match_003",
        team1Id: insertedTeams[4]._id, // Pakistan
        team2Id: insertedTeams[5]._id, // New Zealand
        venueId: insertedVenues[2]._id, // Eden Gardens
        matchType: "T20",
        status: "completed",
        scheduledAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        startTime: new Date(Date.now() - 24 * 60 * 60 * 1000),
        endTime: new Date(Date.now() - 20 * 60 * 60 * 1000),
        team1Score: "156",
        team2Score: "159/3",
        result: "New Zealand won by 7 wickets",
        winnerId: insertedTeams[5]._id,
        series: "Pakistan vs New Zealand T20 Series",
        season: "2024-25",
        overs: "20.0",
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ];

    const insertedMatches = await Match.insertMany(matchData);
    console.log(`[MONGODB] Inserted ${insertedMatches.length} matches`);

    // Seed some player performances
    console.log('📊 Seeding player performances...');
    const performanceData = [];
    
    // Add performances for completed match
    const completedMatch = insertedMatches.find(m => m.status === 'completed');
    if (completedMatch) {
      const pakPlayers = insertedPlayers.filter(p => p.nationality === 'Pakistani').slice(0, 3);
      const nzPlayers = insertedPlayers.filter(p => p.nationality === 'New Zealand').slice(0, 3);
      
      [...pakPlayers, ...nzPlayers].forEach((player, index) => {
        performanceData.push({
          playerId: player._id,
          matchId: completedMatch._id,
          runs: Math.floor(Math.random() * 50) + 10,
          ballsFaced: Math.floor(Math.random() * 30) + 15,
          fours: Math.floor(Math.random() * 5),
          sixes: Math.floor(Math.random() * 3),
          wickets: player.role === 'bowler' ? Math.floor(Math.random() * 3) : 0,
          oversBowled: player.role === 'bowler' ? Math.floor(Math.random() * 4) + 1 : 0,
          runsConceded: player.role === 'bowler' ? Math.floor(Math.random() * 30) + 10 : 0,
          catches: Math.floor(Math.random() * 2),
          stumpings: player.role === 'wicket-keeper' ? Math.floor(Math.random() * 1) : 0,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      });
    }

    if (performanceData.length > 0) {
      await PlayerPerformance.insertMany(performanceData);
      console.log(`[MONGODB] Inserted ${performanceData.length} player performances`);
    }

    console.log('🎉 MongoDB seeding completed successfully!');
    console.log('📈 Summary:');
    console.log(`   Teams: ${insertedTeams.length}`);
    console.log(`   Venues: ${insertedVenues.length}`);
    console.log(`   Players: ${insertedPlayers.length}`);
    console.log(`   Matches: ${insertedMatches.length}`);
    console.log(`   Performances: ${performanceData.length}`);

  } catch (error) {
    console.error('[MONGODB] Error seeding MongoDB:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
export { seedMongoDB };