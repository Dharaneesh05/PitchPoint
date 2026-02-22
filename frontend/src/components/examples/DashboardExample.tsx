import { Dashboard } from '../Dashboard';
import { ThemeProvider } from '../ThemeProvider';

export default function DashboardExample() {
  return (
    <ThemeProvider>
      <div className="p-6 max-w-7xl mx-auto">
        <Dashboard userRole="coach" userName="John Smith" />
      </div>
    </ThemeProvider>
  );
}
