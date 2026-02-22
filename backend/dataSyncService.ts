import cron from 'node-cron';
import { cricApiService } from './cricApiService';
import { 
  Series, Country, Player, Match, Team, Venue, BallByBall, FantasyPoints, 
  PlayerPerformance, ITeam, IPlayer, IVenue, IMatch, ISeries, ICountry 
} from '../shared/mongodb-schema';

export class DataSyncService {
  private isInitialized = false;

  constructor() {
    this.setupScheduledJobs();
  }

  // Initialize data sync on server startup
  async initialize() {
    if (this.isInitialized) return;
    
    console.log('Starting initial data synchronization with CricAPI...');
    
    try {
      // Initial data sync (run once on startup)
      await this.syncCountries();
      await this.syncSeries();
      await this.syncPlayers();
      await this.syncMatches();
      
      this.isInitialized = true;
      console.log('Initial data synchronization completed');
    } catch (error) {
      console.error('Error during initial data sync:', error);
    }
  }

  // Setup scheduled jobs for data updates
  private setupScheduledJobs() {
    // Update matches every hour
    cron.schedule('0 * * * *', async () => {
      console.log('Updating matches...');
      await this.syncMatches();
    });

    // Update player data every 6 hours
    cron.schedule('0 */6 * * *', async () => {
      console.log('Updating player data...');
      await this.syncPlayers();
    });

    // Update series data daily at 3 AM
    cron.schedule('0 3 * * *', async () => {
      console.log('Daily series update...');
      await this.syncSeries();
    });

    // Update countries weekly on Sunday at 2 AM
    cron.schedule('0 2 * * 0', async () => {
      console.log('Weekly countries update...');
      await this.syncCountries();
    });
  }

  // Sync all countries from CricAPI
  async syncCountries(): Promise<void> {
    try {
      console.log('Syncing countries from CricAPI...');
      const response = await cricApiService.getCountries();
      const countries = response.data;

      for (const countryData of countries) {
        await Country.findOneAndUpdate(
          { cricApiId: countryData.id },
          {
            cricApiId: countryData.id,
            name: countryData.name,
            updatedAt: new Date()
          },
          { upsert: true, new: true }
        );
      }

      console.log(`Synced ${countries.length} countries`);
    } catch (error) {
      console.error('Error syncing countries:', error);
    }
  }

  // Sync all series from CricAPI
  async syncSeries(): Promise<void> {
    try {
      console.log('Syncing series from CricAPI...');
      const response = await cricApiService.getSeries();
      const series = response.data;

      for (const seriesData of series) {
        await Series.findOneAndUpdate(
          { cricApiId: seriesData.id },
          {
            cricApiId: seriesData.id,
            name: seriesData.name,
            startDate: seriesData.startDate,
            endDate: seriesData.endDate,
            odi: seriesData.odi,
            t20: seriesData.t20,
            test: seriesData.test,
            squads: seriesData.squads,
            matches: seriesData.matches,
            updatedAt: new Date()
          },
          { upsert: true, new: true }
        );
      }

      console.log(`Synced ${series.length} series`);
    } catch (error) {
      console.error('Error syncing series:', error);
    }
  }

  // Sync all players from CricAPI
  async syncPlayers(limit: number = 500): Promise<void> {
    try {
      console.log('Syncing players from CricAPI...');
      let offset = 0;
      let totalSynced = 0;

      while (totalSynced < limit) {
        const response = await cricApiService.getPlayers(offset);
        const players = response.data;

        if (!players || players.length === 0) {
          break;
        }

        for (const playerData of players) {
          // Generate a unique apiId if it doesn't exist
          const apiId = playerData.id || `cricapi_${playerData.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
          
          // Find or create a team for this player based on their country
          let team = await Team.findOne({ country: playerData.country });
          if (!team && playerData.country) {
            // Create a default team for this country
            team = await Team.create({
              apiId: `team_${playerData.country.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`,
              name: `${playerData.country} National Team`,
              shortName: playerData.country.substring(0, 3).toUpperCase(),
              country: playerData.country,
              logo: '',
              establishedYear: 1900,
              homeVenue: 'TBD',
              captain: null,
              coach: 'TBD',
              totalPlayers: 0,
              ranking: 0 // Use a single number instead of object
            });
          }
          
          await Player.findOneAndUpdate(
            { cricApiId: playerData.id },
            {
              apiId: apiId,
              cricApiId: playerData.id,
              name: playerData.name,
              country: playerData.country,
              nationality: playerData.country || 'Unknown',
              role: playerData.role || 'unknown',
              battingStyle: playerData.battingStyle,
              bowlingStyle: playerData.bowlingStyle,
              placeOfBirth: playerData.placeOfBirth,
              dateOfBirth: playerData.dateOfBirth,
              teamId: team ? team._id : null, // Link to team
              form: 'average',
              isInjured: false,
              stats: {
                matches: 0,
                runs: 0,
                wickets: 0,
                batting: {
                  average: 0,
                  strikeRate: 0,
                  fifties: 0,
                  hundreds: 0,
                  highestScore: 0,
                },
                bowling: {
                  average: 0,
                  economy: 0,
                  strikeRate: 0,
                  bestFigures: '0/0',
                  fiveWickets: 0,
                },
                fielding: {
                  catches: 0,
                  stumps: 0,
                  runOuts: 0,
                },
              },
              fantasyPoints: 0,
              teamsPlayedFor: [],
              updatedAt: new Date()
            },
            { upsert: true, new: true }
          );
        }

        totalSynced += players.length;
        offset += players.length;
        
        console.log(`Synced ${totalSynced} players so far...`);

        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log(`Completed syncing ${totalSynced} players`);
    } catch (error) {
      console.error('Error syncing players:', error);
    }
  }

  // Sync all matches from CricAPI
  async syncMatches(limit: number = 200): Promise<void> {
    try {
      console.log('Syncing matches from CricAPI...');
      let offset = 0;
      let totalSynced = 0;

      while (totalSynced < limit) {
        const response = await cricApiService.getMatches(offset);
        const matches = response.data;

        if (!matches || matches.length === 0) {
          break;
        }

        for (const matchData of matches) {
          // Find or create teams
          let team1Id, team2Id;
          
          if (matchData.teams && matchData.teams.length >= 2) {
            // Create or find team 1
            const team1 = await Team.findOneAndUpdate(
              { name: matchData.teams[0] },
              {
                apiId: `team_${matchData.teams[0].toLowerCase().replace(/\s+/g, '_')}`,
                name: matchData.teams[0],
                shortName: matchData.teams[0].substring(0, 3).toUpperCase(),
                country: matchData.teams[0],
                squad: [],
                teamType: 'international',
                isActive: true,
              },
              { upsert: true, new: true }
            );
            team1Id = team1._id;

            // Create or find team 2
            const team2 = await Team.findOneAndUpdate(
              { name: matchData.teams[1] },
              {
                apiId: `team_${matchData.teams[1].toLowerCase().replace(/\s+/g, '_')}`,
                name: matchData.teams[1],
                shortName: matchData.teams[1].substring(0, 3).toUpperCase(),
                country: matchData.teams[1],
                squad: [],
                teamType: 'international',
                isActive: true,
              },
              { upsert: true, new: true }
            );
            team2Id = team2._id;
          } else {
            continue; // Skip matches without proper team data
          }

          await Match.findOneAndUpdate(
            { cricApiId: matchData.id },
            {
              apiId: matchData.id || `match_${Date.now()}`,
              cricApiId: matchData.id,
              name: matchData.name,
              matchType: matchData.matchType === 'odi' ? 'ODI' : 
                        matchData.matchType === 't20' ? 'T20' : 
                        matchData.matchType === 'test' ? 'Test' : 'T20',
              status: matchData.status === 'Fixture' ? 'upcoming' : 
                     matchData.status === 'Live' ? 'live' : 
                     matchData.status === 'Result' ? 'completed' : 'upcoming',
              scheduledAt: new Date(matchData.dateTimeGMT || matchData.date),
              team1Id: team1Id,
              team2Id: team2Id,
              venue: matchData.venue,
              date: matchData.date,
              dateTimeGMT: matchData.dateTimeGMT,
              teams: matchData.teams,
              seriesId: matchData.series_id,
              fantasyEnabled: matchData.fantasyEnabled || false,
              bbbEnabled: matchData.bbbEnabled || false,
              hasSquad: matchData.hasSquad || false,
              matchStarted: matchData.matchStarted || false,
              matchEnded: matchData.matchEnded || false,
              updatedAt: new Date()
            },
            { upsert: true, new: true }
          );
        }

        totalSynced += matches.length;
        offset += matches.length;
        
        console.log(`Synced ${totalSynced} matches so far...`);

        // Add a small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      console.log(`Completed syncing ${totalSynced} matches`);
    } catch (error) {
      console.error('Error syncing matches:', error);
    }
  }

  // Search and sync specific players
  async searchAndSyncPlayers(searchTerm: string): Promise<void> {
    try {
      console.log(`Searching for players: ${searchTerm}`);
      const response = await cricApiService.searchPlayers(searchTerm);
      const players = response.data;

      for (const playerData of players) {
        const apiId = playerData.id || `cricapi_${playerData.name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`;
        
        await Player.findOneAndUpdate(
          { cricApiId: playerData.id },
          {
            apiId: apiId,
            cricApiId: playerData.id,
            name: playerData.name,
            country: playerData.country,
            nationality: playerData.country || 'Unknown',
            role: playerData.role || 'unknown',
            battingStyle: playerData.battingStyle,
            bowlingStyle: playerData.bowlingStyle,
            placeOfBirth: playerData.placeOfBirth,
            dateOfBirth: playerData.dateOfBirth,
            form: 'average',
            isInjured: false,
            stats: {
              matches: 0,
              runs: 0,
              wickets: 0,
              batting: {
                average: 0,
                strikeRate: 0,
                fifties: 0,
                hundreds: 0,
                highestScore: 0,
              },
              bowling: {
                average: 0,
                economy: 0,
                strikeRate: 0,
                bestFigures: '0/0',
                fiveWickets: 0,
              },
              fielding: {
                catches: 0,
                stumps: 0,
                runOuts: 0,
              },
            },
            fantasyPoints: 0,
            teamsPlayedFor: [],
            updatedAt: new Date()
          },
          { upsert: true, new: true }
        );
      }

      console.log(`Synced ${players.length} players for search: ${searchTerm}`);
    } catch (error) {
      console.error(`Error searching and syncing players for "${searchTerm}":`, error);
    }
  }

  // Get detailed player information
  async getPlayerDetails(playerId: string): Promise<any> {
    try {
      const response = await cricApiService.getPlayerInfo(playerId);
      return response.data;
    } catch (error) {
      console.error(`Error getting player details for ${playerId}:`, error);
      return null;
    }
  }

  // Get detailed match information
  async getMatchDetails(matchId: string): Promise<any> {
    try {
      const response = await cricApiService.getMatchInfo(matchId);
      return response.data;
    } catch (error) {
      console.error(`Error getting match details for ${matchId}:`, error);
      return null;
    }
  }

  // Get match squad
  async getMatchSquad(matchId: string): Promise<any> {
    try {
      const response = await cricApiService.getMatchSquad(matchId);
      return response.data;
    } catch (error) {
      console.error(`Error getting match squad for ${matchId}:`, error);
      return null;
    }
  }

  // Sync all data
  async syncAllData(): Promise<void> {
    console.log('Starting complete data sync...');
    
    await this.syncCountries();
    await this.syncSeries();
    await this.syncPlayers(1000); // Sync up to 1000 players
    await this.syncMatches(500); // Sync up to 500 matches
    
    console.log('Complete data sync finished!');
  }

  // Manual sync methods for admin use
  async forceSync(type: 'all' | 'countries' | 'series' | 'players' | 'matches'): Promise<void> {
    console.log(`Force syncing ${type}...`);
    
    switch (type) {
      case 'all':
        await this.syncAllData();
        break;
      case 'countries':
        await this.syncCountries();
        break;
      case 'series':
        await this.syncSeries();
        break;
      case 'players':
        await this.syncPlayers();
        break;
      case 'matches':
        await this.syncMatches();
        break;
    }
    
    console.log(`Force sync ${type} completed`);
  }
}

export const dataSyncService = new DataSyncService();