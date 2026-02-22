import { MatchCard } from '../MatchCard';

export default function MatchCardExample() {
  const sampleMatch = {
    id: "1",
    team1: { name: "India", score: "185/4 (18.2)" },
    team2: { name: "Australia", score: "188/6 (19.5)" },
    date: "Today, 7:30 PM",
    venue: "Melbourne Cricket Ground",
    status: "live" as const,
    format: "T20" as const,
  };

  return (
    <div className="p-4 max-w-md">
      <MatchCard 
        match={sampleMatch} 
        showAnalytics 
        onAnalyze={(id) => console.log('Analyze:', id)}
        onPredict={(id) => console.log('Predict:', id)}
      />
    </div>
  );
}
