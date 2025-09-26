import { db } from './db';
import { storage } from './storage';
import {
  teams, players, venues, matches, playerStats,
  type InsertTeam, type InsertPlayer, type InsertMatch, type InsertPlayerStats, type Player
} from '@shared/schema';

const teamData: InsertTeam[] = [
  {
    name: "India",
    shortName: "IND",
    country: "India",
    logo: "https://www.cricket.com.au/-/media/Images/ECB/Teams/India/india-logo.ashx"
  },
    throw error;
  }.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop"
  },
  {
    name: "Australia",
    shortName: "AUS", 
    country: "Australia",
    logo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop"
  },
  {
    name: "England",
    shortName: "ENG",
    country: "England", 
    logo: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop"
  },
  {
    name: "South Africa",
    shortName: "SA",
    country: "South Africa",
    logo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop"
  },
  {
    name: "Pakistan",
    shortName: "PAK",
    country: "Pakistan",
    logo: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop"
  },
  {
    name: "New Zealand",
    shortName: "NZ",
    country: "New Zealand",
    logo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop"
  },
  {
    name: "West Indies",
    shortName: "WI",
    country: "West Indies",
    logo: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=100&h=100&fit=crop"
  },
  {
    name: "Sri Lanka",
    shortName: "SL",
    country: "Sri Lanka",
    logo: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=100&h=100&fit=crop"
  }
];

const venueData = [
  {
    name: "Melbourne Cricket Ground",
    city: "Melbourne",
    country: "Australia",
    capacity: 100024,
    pitchType: "Balanced"
  },
  {
    name: "Lord's Cricket Ground",
    city: "London", 
    country: "England",
    capacity: 31100,
    pitchType: "Bowling"
  },
  {
    name: "Eden Gardens",
    city: "Kolkata",
    country: "India",
    capacity: 66000,
    pitchType: "Batting"
  },
  {
    name: "The Oval",
    city: "London",
    country: "England", 
    capacity: 25500,
    pitchType: "Balanced"
  },
  {
    name: "Wankhede Stadium",
    city: "Mumbai",
    country: "India",
    capacity: 33108,
    pitchType: "Batting"
  },
  {
    name: "Sydney Cricket Ground",
    city: "Sydney",
    country: "Australia",
    capacity: 48000,
    pitchType: "Bowling"
  }
];

const playerData = [
  // India Players
  {
    name: "Virat Kohli",
    role: "batsman" as const,
    battingStyle: "Right-hand bat",
    bowlingStyle: null,
    image: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop",
    dateOfBirth: new Date("1988-11-05"),
    nationality: "Indian",
    isInjured: false,
    form: "excellent" as const
  },
  {
    name: "Rohit Sharma",
    role: "batsman" as const,
    battingStyle: "Right-hand bat",
    bowlingStyle: "Right-arm off break",
    image: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop",
    dateOfBirth: new Date("1987-04-30"),
    nationality: "Indian",
    isInjured: false,
    form: "good" as const
  },
  {
    name: "Jasprit Bumrah",
    role: "bowler" as const,
    battingStyle: "Right-hand bat",
    bowlingStyle: "Right-arm fast",
    image: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop",
    dateOfBirth: new Date("1993-12-06"),
    nationality: "Indian",
    isInjured: false,
    form: "excellent" as const
  },
  {
    name: "Hardik Pandya",
    role: "all-rounder" as const,
    battingStyle: "Right-hand bat",
    bowlingStyle: "Right-arm fast-medium",
    image: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop",
    dateOfBirth: new Date("1993-10-11"),
    nationality: "Indian",
    isInjured: false,
    form: "good" as const
  },
  {
    name: "MS Dhoni",
    role: "wicket-keeper" as const,
    battingStyle: "Right-hand bat",
    bowlingStyle: "Right-arm medium",
    image: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop",
    dateOfBirth: new Date("1981-07-07"),
    nationality: "Indian",
    isInjured: false,
    form: "average" as const
  },
  
  // Australia Players
  {
    name: "Steve Smith",
    role: "batsman" as const,
    battingStyle: "Right-hand bat",
    bowlingStyle: "Right-arm leg break",
    image: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop",
    dateOfBirth: new Date("1989-06-02"),
    nationality: "Australian",
    isInjured: false,
    form: "excellent" as const
  },
  {
    name: "David Warner",
    role: "batsman" as const,
    battingStyle: "Left-hand bat",
    bowlingStyle: "Right-arm leg break",
    image: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop",
    dateOfBirth: new Date("1986-10-27"),
    nationality: "Australian",
    isInjured: false,
    form: "good" as const
  },
  {
    name: "Pat Cummins",
    role: "bowler" as const,
    battingStyle: "Right-hand bat",
    bowlingStyle: "Right-arm fast",
    image: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop",
    dateOfBirth: new Date("1993-05-08"),
    nationality: "Australian",
    isInjured: false,
    form: "excellent" as const
  },
  {
    name: "Glenn Maxwell",
    role: "all-rounder" as const,
    battingStyle: "Right-hand bat",
    bowlingStyle: "Right-arm off break",
    image: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop",
    dateOfBirth: new Date("1988-10-14"),
    nationality: "Australian",
    isInjured: true,
    form: "good" as const
  },
  
  // England Players
  {
    name: "Joe Root",
    role: "batsman" as const,
    battingStyle: "Right-hand bat",
    bowlingStyle: "Right-arm off break",
    image: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop",
    dateOfBirth: new Date("1990-12-30"),
    nationality: "English",
    isInjured: false,
    form: "excellent" as const
  },
  {
    name: "Ben Stokes",
    role: "all-rounder" as const,
    battingStyle: "Left-hand bat",
    bowlingStyle: "Right-arm fast-medium",
    image: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop",
    dateOfBirth: new Date("1991-06-04"),
    nationality: "English",
    isInjured: false,
    form: "good" as const
  },
  {
    name: "James Anderson",
    role: "bowler" as const,
    battingStyle: "Left-hand bat",
    bowlingStyle: "Right-arm fast-medium",
    image: "https://images.unsplash.com/photo-1566577739112-5180d4bf9390?w=150&h=150&fit=crop",
    dateOfBirth: new Date("1982-07-30"),
    nationality: "English",
    isInjured: false,
    form: "good" as const
  }
];

async function seedDatabase() {
  try {
    console.log('[SEED] Starting database seeding...');

    // Clear existing data
    console.log('[SEED] Clearing existing data...');
    await db.delete(playerStats);
    await db.delete(matches);
    await db.delete(players);
    await db.delete(venues);
    await db.delete(teams);

    // Seed teams
    console.log('[SEED] Seeding teams...');
    const insertedTeams = await db.insert(teams).values(teamData).returning();
    console.log(`[SEED] Inserted ${insertedTeams.length} teams`);

    // Seed venues
    console.log('[SEED] Seeding venues...');
    const insertedVenues = await db.insert(venues).values(venueData).returning();
    console.log(`[SEED] Inserted ${insertedVenues.length} venues`);

    // Seed players (assign to teams)
    console.log('[SEED] Seeding players...');
    const playersWithTeams = playerData.map((player, index) => ({
      ...player,
      teamId: insertedTeams[index % insertedTeams.length].id
    }));
    
    const insertedPlayers = await db.insert(players).values(playersWithTeams).returning();
    console.log(`[SEED] Inserted ${insertedPlayers.length} players`);

    // Seed matches
    console.log('[SEED] Seeding matches...');
    const matchData: InsertMatch[] = [
      {
        team1Id: insertedTeams[0].id, // India
        team2Id: insertedTeams[1].id, // Australia
        venueId: insertedVenues[0].id, // MCG
        format: "T20",
        status: "live",
        scheduledAt: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        startedAt: new Date(Date.now() + 2 * 60 * 60 * 1000),
        team1Score: "185/4 (18.2)",
        team2Score: "188/6 (19.5)",
        externalMatchId: "match_001"
      },
      {
        team1Id: insertedTeams[2].id, // England
        team2Id: insertedTeams[3].id, // South Africa
        venueId: insertedVenues[1].id, // Lord's
        format: "ODI",
        status: "upcoming",
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
        externalMatchId: "match_002"
      },
      {
        team1Id: insertedTeams[4].id, // Pakistan
        team2Id: insertedTeams[5].id, // New Zealand
        venueId: insertedVenues[2].id, // Eden Gardens
        format: "T20",
        status: "completed",
        scheduledAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
        startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        completedAt: new Date(Date.now() - 20 * 60 * 60 * 1000),
        team1Score: "156",
        team2Score: "159/3",
        result: "New Zealand won by 7 wickets",
        winnerId: insertedTeams[5].id,
        externalMatchId: "match_003"
      },
      {
        team1Id: insertedTeams[0].id, // India
        team2Id: insertedTeams[2].id, // England
        venueId: insertedVenues[4].id, // Wankhede
        format: "Test",
        status: "upcoming",
        scheduledAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
        externalMatchId: "match_004"
      },
      {
        team1Id: insertedTeams[1].id, // Australia
        team2Id: insertedTeams[6].id, // West Indies
        venueId: insertedVenues[5].id, // SCG
        format: "ODI",
        status: "upcoming",
        scheduledAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        externalMatchId: "match_005"
      }
    ];

    const insertedMatches = await db.insert(matches).values(matchData).returning();
    console.log(`[SEED] Inserted ${insertedMatches.length} matches`);

    // Seed player stats
    console.log('[SEED] Seeding player statistics...');
    const statsData: InsertPlayerStats[] = [];
    
    insertedPlayers.forEach((player: Player, index: number) => {
      // Generate stats for current season
      if (player.role === 'batsman' || player.role === 'all-rounder' || player.role === 'wicket-keeper') {
        statsData.push({
          playerId: player.id,
          season: "2024",
          matches: Math.floor(Math.random() * 50) + 20,
          runs: Math.floor(Math.random() * 2000) + 500,
          average: Math.floor(Math.random() * 40) + 25,
          strikeRate: Math.floor(Math.random() * 50) + 120,
          fifties: Math.floor(Math.random() * 15) + 2,
          hundreds: Math.floor(Math.random() * 8) + 1,
          catches: Math.floor(Math.random() * 20) + 5
        });
      }
      
      if (player.role === 'bowler' || player.role === 'all-rounder') {
        statsData.push({
          playerId: player.id,
          season: "2024",
          matches: Math.floor(Math.random() * 50) + 20,
          wickets: Math.floor(Math.random() * 60) + 15,
          average: Math.floor(Math.random() * 15) + 15,
          economy: Math.floor(Math.random() * 3) + 6,
          catches: Math.floor(Math.random() * 15) + 3
        });
      }
    });

    const insertedStats = await db.insert(playerStats).values(statsData).returning();
    console.log(`[SEED] Inserted ${insertedStats.length} player statistics`);

    console.log('[SEED] Database seeding completed successfully!');
    console.log('[SEED] Summary:');
    console.log(`   Teams: ${insertedTeams.length}`);
    console.log(`   Venues: ${insertedVenues.length}`);
    console.log(`   Players: ${insertedPlayers.length}`);
    console.log(`   Matches: ${insertedMatches.length}`);
    console.log(`   Player Stats: ${insertedStats.length}`);

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

// Run seeding if this file is executed directly
export { seedDatabase };