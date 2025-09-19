import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TrendingUp, TrendingDown, Heart, BarChart3 } from "lucide-react";

interface PlayerStats {
  matches: number;
  runs?: number;
  wickets?: number;
  average: number;
  strikeRate?: number;
  economy?: number;
}

interface Player {
  id: string;
  name: string;
  team: string;
  role: 'batsman' | 'bowler' | 'all-rounder' | 'wicket-keeper';
  stats: PlayerStats;
  form: 'excellent' | 'good' | 'average' | 'poor';
  injured?: boolean;
  image?: string;
}

interface PlayerCardProps {
  player: Player;
  showActions?: boolean;
  onAnalyze?: (playerId: string) => void;
  onFavorite?: (playerId: string) => void;
  isFavorite?: boolean;
}

const roleConfig = {
  batsman: { color: 'bg-chart-1', icon: '🏏' },
  bowler: { color: 'bg-chart-2', icon: '⚡' },
  'all-rounder': { color: 'bg-chart-3', icon: '🌟' },
  'wicket-keeper': { color: 'bg-chart-4', icon: '🥅' }
};

const formConfig = {
  excellent: { color: 'text-green-600', trend: TrendingUp },
  good: { color: 'text-blue-600', trend: TrendingUp },
  average: { color: 'text-yellow-600', trend: null },
  poor: { color: 'text-red-600', trend: TrendingDown }
};

export function PlayerCard({ player, showActions = false, onAnalyze, onFavorite, isFavorite = false }: PlayerCardProps) {
  const roleConf = roleConfig[player.role];
  const formConf = formConfig[player.form];
  const TrendIcon = formConf.trend;
  
  return (
    <Card className="hover-elevate transition-all duration-200" data-testid={`player-card-${player.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={player.image} />
              <AvatarFallback className={roleConf.color}>
                {player.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-foreground truncate">{player.name}</h3>
              <p className="text-sm text-muted-foreground">{player.team}</p>
              <Badge variant="secondary" className="text-xs mt-1">
                {player.role.replace('-', ' ')}
              </Badge>
            </div>
          </div>
          
          {player.injured && (
            <Badge variant="destructive" className="text-xs">
              Injured
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Form & Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted-foreground">Form</span>
              {TrendIcon && <TrendIcon className="w-3 h-3" />}
            </div>
            <span className={`text-sm font-medium capitalize ${formConf.color}`}>
              {player.form}
            </span>
          </div>
          
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Matches</span>
            <span className="text-sm font-medium font-mono">{player.stats.matches}</span>
          </div>
        </div>
        
        {/* Role-specific stats */}
        <div className="grid grid-cols-2 gap-4">
          {(player.role === 'batsman' || player.role === 'all-rounder' || player.role === 'wicket-keeper') && (
            <>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Runs</span>
                <span className="text-sm font-medium font-mono">{player.stats.runs || 0}</span>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Strike Rate</span>
                <span className="text-sm font-medium font-mono">{player.stats.strikeRate || 0}</span>
              </div>
            </>
          )}
          
          {(player.role === 'bowler' || player.role === 'all-rounder') && (
            <>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Wickets</span>
                <span className="text-sm font-medium font-mono">{player.stats.wickets || 0}</span>
              </div>
              <div className="space-y-1">
                <span className="text-sm text-muted-foreground">Economy</span>
                <span className="text-sm font-medium font-mono">{player.stats.economy || 0}</span>
              </div>
            </>
          )}
        </div>
        
        <div className="pt-2 border-t border-border">
          <div className="space-y-1">
            <span className="text-sm text-muted-foreground">Average</span>
            <span className="text-sm font-medium font-mono">{player.stats.average}</span>
          </div>
        </div>
        
        {/* Actions */}
        {showActions && (onAnalyze || onFavorite) && (
          <div className="flex gap-2 pt-2">
            {onAnalyze && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAnalyze(player.id)}
                className="flex-1"
                data-testid={`button-analyze-player-${player.id}`}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analyze
              </Button>
            )}
            {onFavorite && (
              <Button
                variant={isFavorite ? "default" : "outline"}
                size="sm"
                onClick={() => onFavorite(player.id)}
                data-testid={`button-favorite-player-${player.id}`}
              >
                <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
