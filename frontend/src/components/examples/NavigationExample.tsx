import { Navigation } from '../Navigation';
import { ThemeProvider } from '../ThemeProvider';

export default function NavigationExample() {
  return (
    <ThemeProvider>
      <div className="h-screen">
        <Navigation 
          userRole="coach" 
          userName="John Smith" 
          onLogout={() => console.log('Logout clicked')} 
        />
        <div className="lg:ml-64 p-8">
          <h1 className="text-2xl font-bold">Dashboard Content</h1>
          <p className="text-muted-foreground">This is where the main content would go.</p>
        </div>
      </div>
    </ThemeProvider>
  );
}
