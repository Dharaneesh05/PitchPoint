import { PlayerCard } from '../PlayerCard';

export default function PlayerCardExample() {
  const samplePlayer = {
    id: "1",
    name: "Virat Kohli",
    team: "Royal Challengers Bangalore",
    role: "batsman" as const,
    stats: { matches: 45, runs: 1842, average: 52.6, strikeRate: 138.2 },
    form: "excellent" as const,
  };

  return (
    <div className="p-4 max-w-sm">
      <PlayerCard 
        player={samplePlayer} 
        showActions 
        onAnalyze={(id) => console.log('Analyze player:', id)}
        onFavorite={(id) => console.log('Toggle favorite:', id)}
        isFavorite={true}
      />
    </div>
  );
}
