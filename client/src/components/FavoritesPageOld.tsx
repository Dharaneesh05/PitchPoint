import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";

interface FavoriteItem {
  _id: string;
  playerId: string;
  playerName: string;
  playerRole: string;
  nationality: string;
  teamName: string;
  notes?: string;
  tags?: string[];
  userId: string;
  createdAt: string;
  updatedAt: string;
}

type UserRole = "coach" | "analyst" | "fan";

interface FavoritesPageProps {
  userRole: UserRole;
}

export function FavoritesPage({ userRole }: FavoritesPageProps) {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("recent");
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'batsman':
        return '🏏';
      case 'bowler':
        return '⚡';
      case 'wicket-keeper':
        return '🥅';
      case 'all-rounder':
        return '🌟';
      default:
        return '👤';
    }
  };

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    setIsLoading(true);
    try {
      const favoritePlayers = await apiClient.getFavoritePlayers();
      setFavorites(favoritePlayers);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load favorites",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFavorites = favorites.filter(item => {
    const matchesSearch = item.playerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (item.notes && item.notes.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         item.nationality.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.teamName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || item.playerRole.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesType;
  }).sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.playerName.localeCompare(b.playerName);
      case "type":
        return a.playerRole.localeCompare(b.playerRole);
      case "recent":
      default:
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
  });

  const removeFavorite = async (playerId: string) => {
    try {
      await apiClient.removeFavoritePlayer(playerId);
      setFavorites(prev => prev.filter(item => item.playerId !== playerId));
      toast({
        title: "Removed from Favorites",
        description: "Player has been removed from your favorites",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to remove from favorites",
        variant: "destructive"
      });
    }
  };
    toast({
      title: "Removed from Favorites",
      description: "Item has been removed from your favorites list.",
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'player': return 'P';
      case 'team': return 'T';
      case 'match': return 'M';
      case 'report': return 'R';
      default: return 'S';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'player': return 'bg-blue-500';
      case 'team': return 'bg-green-500';
      case 'match': return 'bg-purple-500';
      case 'report': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  const favoritesByType = {
    all: filteredFavorites,
    player: filteredFavorites, // All favorites are players now
    batsman: filteredFavorites.filter(item => item.playerRole.toLowerCase() === 'batsman'),
    bowler: filteredFavorites.filter(item => item.playerRole.toLowerCase() === 'bowler'),
    'wicket-keeper': filteredFavorites.filter(item => item.playerRole.toLowerCase() === 'wicket-keeper'),
    'all-rounder': filteredFavorites.filter(item => item.playerRole.toLowerCase() === 'all-rounder')
  };

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          My Favorites
        </h1>
        <p className="text-muted-foreground mt-2">
          Your favorite cricket players organized by role and team
        </p>
      </div>

      {/* Filters and Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            Filter & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Input
                  placeholder="Search favorites..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-4"
                />
              </div>
            </div>
            
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="batsman">Batsman</SelectItem>
                <SelectItem value="bowler">Bowler</SelectItem>
                <SelectItem value="all-rounder">All-Rounder</SelectItem>
                <SelectItem value="wicket-keeper">Wicket-Keeper</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-full md:w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Recently Added</SelectItem>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="type">Type</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Favorites Tabs */}
      <Tabs defaultValue="all" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">
            All ({favoritesByType.all.length})
          </TabsTrigger>
          <TabsTrigger value="player">
            Players ({favoritesByType.player.length})
          </TabsTrigger>
          <TabsTrigger value="batsman">
            Batsmen ({favoritesByType.batsman.length})
          </TabsTrigger>
          <TabsTrigger value="bowler">
            Bowlers ({favoritesByType.bowler.length})
          </TabsTrigger>
          <TabsTrigger value="all-rounder">
            All-Rounders ({favoritesByType['all-rounder'].length})
          </TabsTrigger>
        </TabsList>

        {Object.entries(favoritesByType).map(([type, items]) => (
          <TabsContent key={type} value={type}>
            {items.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <div className="text-4xl mb-4">❤️</div>
                  <h3 className="text-lg font-medium mb-2">No favorites found</h3>
                  <p className="text-muted-foreground">
                    {type === 'all' 
                      ? "Start adding players to your favorites to see them here"
                      : `No ${type === 'player' ? 'favorite players' : type + ' players'} found. Try adjusting your search.`
                    }
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {items.map((item, index) => (
                    <div key={item._id}>
                      <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                              <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white`}>
                                {getRoleIcon(item.playerRole)}
                              </div>
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg leading-tight">{item.playerName}</h3>
                                <Badge variant="outline" className="text-xs mt-1">
                                  <span className="ml-1 capitalize">{item.playerRole}</span>
                                </Badge>
                              </div>
                            </div>
                            
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeFavorite(item.playerId)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              Remove
                            </Button>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-4">
                          <div className="space-y-2">
                            <p className="text-sm"><strong>Team:</strong> {item.teamName}</p>
                            <p className="text-sm"><strong>Nationality:</strong> {item.nationality}</p>
                            {item.notes && (
                              <p className="text-sm text-muted-foreground">{item.notes}</p>
                            )}
                          </div>
                          
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            📅 Added {new Date(item.createdAt).toLocaleDateString()}
                          </div>
                          
                          {item.tags && item.tags.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="font-medium text-sm">Tags</h4>
                              <div className="flex flex-wrap gap-1">
                                {item.tags.map((tag, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="flex-1">
                              View Profile
                            </Button>
                            <Button variant="outline" size="sm">
                              Compare
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      {/* Summary Stats */}
      {favorites.length > 0 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📊 Favorites Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-blue-600">{favoritesByType.batsman.length}</div>
                <div className="text-sm text-muted-foreground">Batsmen</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-green-600">{favoritesByType.bowler.length}</div>
                <div className="text-sm text-muted-foreground">Bowlers</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-purple-600">{favoritesByType['all-rounder'].length}</div>
                <div className="text-sm text-muted-foreground">All-Rounders</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-lg">
                <div className="text-2xl font-bold text-orange-600">{favoritesByType['wicket-keeper'].length}</div>
                <div className="text-sm text-muted-foreground">Wicket-Keepers</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}