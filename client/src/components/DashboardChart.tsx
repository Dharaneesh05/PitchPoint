import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line } from "recharts";

interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: any;
}

interface DashboardChartProps {
  title: string;
  data: ChartDataPoint[];
  type: 'bar' | 'pie' | 'line';
  height?: number;
  color?: string;
}

// Dark theme colors optimized for visibility
const DARK_COLORS = {
  primary: '#60a5fa',    // blue-400
  secondary: '#34d399',  // emerald-400
  tertiary: '#f87171',   // red-400
  quaternary: '#a78bfa', // violet-400
  quinary: '#fbbf24'     // amber-400
};

const PIE_COLORS = [
  DARK_COLORS.primary, 
  DARK_COLORS.secondary, 
  DARK_COLORS.tertiary, 
  DARK_COLORS.quaternary, 
  DARK_COLORS.quinary
];

export function DashboardChart({ title, data, type, height = 300, color = DARK_COLORS.primary }: DashboardChartProps) {
  
  if (!data || data.length === 0) {
    return (
      <Card className="w-full bg-slate-800 border-slate-600">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-semibold text-white">{title}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <p className="text-gray-300">No data available</p>
        </CardContent>
      </Card>
    );
  }

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: '#e2e8f0' }}
                stroke="#64748b"
                interval={0}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#e2e8f0' }}
                stroke="#64748b"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#e2e8f0'
                }}
              />
              <Bar dataKey="value" fill={color} radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        );
      
      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={false}
                fill="#e2e8f0"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#e2e8f0'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        );
      
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis 
                dataKey="name" 
                tick={{ fontSize: 12, fill: '#e2e8f0' }}
                stroke="#64748b"
                interval={0}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fontSize: 12, fill: '#e2e8f0' }}
                stroke="#64748b"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '8px',
                  color: '#e2e8f0'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke={color} 
                strokeWidth={3} 
                dot={{ fill: color, strokeWidth: 2, r: 6 }}
                activeDot={{ r: 8, fill: color }}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      default:
        return (
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-300">Unsupported chart type: {type}</p>
          </div>
        );
    }
  };

  return (
    <div className="w-full">
      {title && (
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
        </div>
      )}
      <div className="bg-slate-800 rounded-lg p-4">
        {renderChart()}
      </div>
    </div>
  );
}
