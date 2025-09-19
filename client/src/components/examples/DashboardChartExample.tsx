import { DashboardChart } from '../DashboardChart';

export default function DashboardChartExample() {
  const sampleData = [
    { name: "Jan", value: 85 },
    { name: "Feb", value: 92 },
    { name: "Mar", value: 78 },
    { name: "Apr", value: 95 },
    { name: "May", value: 88 },
    { name: "Jun", value: 91 },
  ];

  return (
    <div className="p-4 space-y-6">
      <DashboardChart 
        title="Performance Trends" 
        data={sampleData} 
        type="line" 
        height={250}
      />
    </div>
  );
}
