import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Team {
  name: string;
  score?: string;
  logo?: string;
}

interface Match {
  id: string;
  team1: Team;
  team2: Team;
  date: string;
  venue: string;
  status: 'upcoming' | 'live' | 'completed';
  format: 'T20' | 'ODI' | 'Test';
  result?: string;
}

interface MatchCardProps {
  match: Match;
  showAnalytics?: boolean;
  onAnalyze?: (matchId: string) => void;
  onPredict?: (matchId: string) => void;
}

const statusConfig = {
  upcoming: { color: 'bg-chart-2', text: 'Upcoming' },
  live: { color: 'bg-destructive', text: 'Live' },
  completed: { color: 'bg-muted', text: 'Completed' }
};

export function MatchCard({ match, showAnalytics = false, onAnalyze, onPredict }: MatchCardProps) {
  const config = statusConfig[match.status];
  
  return (
    <Card className="hover-elevate transition-all duration-200" data-testid={`match-card-${match.id}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className={`${config.color} text-white`}>
              {config.text}
            </Badge>
            <Badge variant="outline">{match.format}</Badge>
          </div>
          {match.status === 'live' && (
            <div className="flex items-center gap-1 text-destructive">
              <div className="w-2 h-2 bg-destructive rounded-full animate-pulse" />
              <span className="text-sm font-medium">LIVE</span>
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Teams */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-primary">
                  {match.team1.name.substring(0, 2).toUpperCase()}
                </span>
              </div>
              <span className="font-medium text-foreground">{match.team1.name}</span>
            </div>
            {match.team1.score && (
              <span className="font-mono text-sm font-medium text-muted-foreground">
                {match.team1.score}
              </span>
            )}
          </div>
          
          <div className="flex items-center justify-center">
            <span className="text-muted-foreground text-sm font-medium">VS</span>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-chart-3/10 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium text-chart-3">
                  {match.team2.name.substring(0, 2).toUpperCase()}
                </span>
              </div>
              <span className="font-medium text-foreground">{match.team2.name}</span>
            </div>
            {match.team2.score && (
              <span className="font-mono text-sm font-medium text-muted-foreground">
                {match.team2.score}
              </span>
            )}
          </div>
        </div>
        
        {/* Match Info */}
        <div className="space-y-2 pt-2 border-t border-border">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span>{match.date}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <MapPin className="w-4 h-4" />
            <span>{match.venue}</span>
          </div>
        </div>
        
        {/* Result */}
        {match.result && (
          <div className="p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-2">
              <Trophy className="w-4 h-4 text-chart-2" />
              <span className="text-sm font-medium">{match.result}</span>
            </div>
          </div>
        )}
        
        {/* Actions */}
        {showAnalytics && (onAnalyze || onPredict) && (
          <div className="flex gap-2 pt-2">
            {onAnalyze && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAnalyze(match.id)}
                className="flex-1"
                data-testid={`button-analyze-${match.id}`}
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Analyze
              </Button>
            )}
            {onPredict && match.status === 'upcoming' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPredict(match.id)}
                className="flex-1"
                data-testid={`button-predict-${match.id}`}
              >
                <Eye className="w-4 h-4 mr-2" />
                Predict
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
