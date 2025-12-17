import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

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
  batsman: { color: 'bg-blue-100', text: 'text-blue-700', label: 'BAT' },
  bowler: { color: 'bg-green-100', text: 'text-green-700', label: 'BOWL' },
  'all-rounder': { color: 'bg-purple-100', text: 'text-purple-700', label: 'ALL' },
  'wicket-keeper': { color: 'bg-orange-100', text: 'text-orange-700', label: 'WK' }
};

const formConfig = {
  excellent: { color: 'text-green-600', trend: '↗' },
  good: { color: 'text-blue-600', trend: '↗' },
  average: { color: 'text-yellow-600', trend: '→' },
  poor: { color: 'text-red-600', trend: '↘' }
};

export function PlayerCard({ player, showActions, onAnalyze, onFavorite, isFavorite }: PlayerCardProps) {
  const roleConf = roleConfig[player.role];
  const formConf = formConfig[player.form];
  
  return (
    <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-200 bg-slate-800/40 border-slate-700" data-testid={`player-card-${player.id}`}>
      <CardHeader className={`bg-gradient-to-r from-slate-800/60 to-slate-700/60 rounded-t-lg pb-3`}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
              <AvatarFallback className={`${roleConf.color} ${roleConf.text} font-bold`}>
                {player.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-white truncate">{player.name}</h3>
              <p className="text-sm text-gray-300 font-medium">{player.team}</p>
              <Badge className={`text-xs mt-1 ${roleConf.color} ${roleConf.text} font-bold border-0`}>
                {roleConf.label}
              </Badge>
            </div>
          </div>
          
          {player.injured && (
            <Badge variant="destructive" className="text-xs font-bold">
              Injured
            </Badge>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4 pt-4">
        {/* Form & Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <span className="text-sm text-gray-300 font-medium">Form</span>
              <span className={`text-sm ${formConf.color} font-bold`}>{formConf.trend}</span>
            </div>
            <span className={`text-sm font-bold capitalize ${formConf.color}`}>
              {player.form}
            </span>
          </div>
          
          <div className="space-y-1">
            <span className="text-sm text-gray-300 font-medium">Matches</span>
            <span className="text-sm font-bold text-white">{player.stats.matches}</span>
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
                className="flex-1 font-bold"
                data-testid={`button-analyze-player-${player.id}`}
              >
                <span className="mr-2">📊</span>
                Analyze
              </Button>
            )}
            {onFavorite && (
              <Button
                variant={isFavorite ? "default" : "outline"}
                size="sm"
                onClick={() => onFavorite(player.id)}
                data-testid={`button-favorite-player-${player.id}`}
                className="font-bold"
              >
                <span className={isFavorite ? '❤️' : '🤍'}></span>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
