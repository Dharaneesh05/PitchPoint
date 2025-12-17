import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Route, Switch, Redirect } from "wouter";
import { AuthForm } from "./AuthForm";
import { Navigation } from "./Navigation";
import { Dashboard } from "./Dashboard";
import { TeamAnalysis } from "./TeamAnalysis";
import { MatchReports } from "./MatchReports";
import { Performance } from "./Performance";
import { TeamSelection } from "./TeamSelection";
import { PlayerAnalysis } from "./PlayerAnalysis";
import { PlayerSearch } from "./PlayerSearch";
import { SettingsPage } from "./SettingsPage";
import { FavoritesPage } from "./FavoritesPage";
import { ProfilePage } from "./ProfilePage";
import { SavedReportsPage } from "./SavedReportsPage";
import { ViewProfilePage } from "./ViewProfilePage";
import { LoadingSpinner, PageTransition } from "./LoadingStates";
import { useToast } from "@/hooks/use-toast";

type UserRole = "coach" | "analyst" | "fan";

interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  emailVerified: boolean;
}

export function CricketApp() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  useEffect(() => {
    const clearInvalidData = () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const userData = JSON.parse(storedUser);
          if (!userData || !userData.username || !userData.role) {
            console.log('Clearing invalid localStorage data');
            localStorage.removeItem('auth-token');
            localStorage.removeItem('user');
          }
        }
      } catch (error) {
        console.log('Clearing corrupted localStorage data');
        localStorage.removeItem('auth-token');
        localStorage.removeItem('user');
      }
    };
    
    clearInvalidData();
  }, []);

  useEffect(() => {
    const checkSession = async () => {
      try {
        setUser(null);
        
        localStorage.removeItem('auth-token');
        localStorage.removeItem('user');
        
        const { apiClient } = await import('@/lib/api');
        apiClient.clearToken();
        
        console.log('App initialized - requiring fresh login');
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  const handleLogin = async (loginData: any) => {
    const userData = {
      id: loginData.user.id || loginData.user._id,
      username: loginData.user.username,
      email: loginData.user.email,
      role: loginData.user.role as UserRole,
      emailVerified: loginData.user.emailVerified
    };
    
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('auth-token', loginData.token);
    const { apiClient } = await import('@/lib/api');
    apiClient.setToken(loginData.token);
    
    toast({
      title: "Welcome to PitchPoint!",
      description: `Successfully logged in as ${userData.username} (${userData.role})`,
    });
  };

  const handleLogout = async () => {
    try {
      const { apiClient } = await import('@/lib/api');
      await apiClient.logout();
      setUser(null);
      localStorage.removeItem('auth-token');
      localStorage.removeItem('user');
      apiClient.clearToken();
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      console.error('Logout error:', error);
      setUser(null);
      localStorage.removeItem('auth-token');
      localStorage.removeItem('user');
      const { apiClient } = await import('@/lib/api');
      apiClient.clearToken();
      
      toast({
        title: "Logged out",
        description: "You have been logged out",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <LoadingSpinner size="lg" />
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-muted-foreground"
          >
            Loading PitchPoint...
          </motion.p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800">
      <AnimatePresence mode="wait">
        {!user || !user.username || !user.role ? (
          <motion.div
            key="auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <AuthForm onLogin={handleLogin} />
          </motion.div>
        ) : (
          <motion.div
            key="app"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="min-h-screen"
          >
            <Navigation 
              userRole={user?.role || 'fan'} 
              userName={user?.username || 'Guest'} 
              onLogout={handleLogout} 
            />
            
            {/* Main Content */}
            <main className="lg:ml-72">
              <div className="lg:hidden h-16" /> {/* Spacer for mobile header */}
              <PageTransition className="p-6 lg:p-8">
                <div className="max-w-7xl mx-auto">
                <Switch>
                  {/* Default dashboard routes */}
                  <Route path="/coach" component={() => <Dashboard userRole="coach" userName={user?.username || 'Guest'} />} />
                  <Route path="/analyst" component={() => <Dashboard userRole="analyst" userName={user?.username || 'Guest'} />} />
                  <Route path="/fan" component={() => <Dashboard userRole="fan" userName={user?.username || 'Guest'} />} />
                  
                  {/* Analyst pages */}
                  <Route path="/analyst/player-search" component={() => <PlayerSearch />} />
                  <Route path="/analyst/teams" component={() => <TeamAnalysis />} />
                  <Route path="/analyst/matches" component={() => <MatchReports />} />
                  <Route path="/analyst/performance" component={() => <Performance />} />
                  <Route path="/analyst/settings" component={() => <SettingsPage userRole="analyst" userName={user?.username || 'Guest'} userEmail={user?.email || ''} />} />
                  <Route path="/analyst/favorites" component={() => <FavoritesPage userRole="analyst" />} />
                  <Route path="/analyst/profile" component={() => <ProfilePage userRole="analyst" userName={user?.username || 'Guest'} userEmail={user?.email || ''} />} />
                  <Route path="/analyst/saved-reports" component={() => <SavedReportsPage />} />
                  <Route path="/analyst/view-profile/:playerId?" component={({ params }) => <ViewProfilePage playerId={params.playerId} />} />
                  
                  {/* Coach pages */}
                  <Route path="/coach/player-search" component={() => <PlayerSearch />} />
                  <Route path="/coach/team-selection" component={() => <TeamSelection format="Test" userRole={user?.role || 'coach'} />} />
                  <Route path="/coach/players" component={() => <PlayerAnalysis />} />
                  <Route path="/coach/matches" component={() => <MatchReports />} />
                  <Route path="/coach/settings" component={() => <SettingsPage userRole="coach" userName={user?.username || 'Guest'} userEmail={user?.email || ''} />} />
                  <Route path="/coach/favorites" component={() => <FavoritesPage userRole="coach" />} />
                  <Route path="/coach/profile" component={() => <ProfilePage userRole="coach" userName={user?.username || 'Guest'} userEmail={user?.email || ''} />} />
                  <Route path="/coach/saved-reports" component={() => <SavedReportsPage />} />
                  <Route path="/coach/view-profile/:playerId?" component={({ params }) => <ViewProfilePage playerId={params.playerId} />} />
                  
                  {/* Fan pages */}
                  <Route path="/fan/player-search" component={() => <PlayerSearch />} />
                  <Route path="/fan/live" component={() => <div className="text-center py-20"><h1 className="text-2xl font-bold">Live Matches</h1><p className="text-muted-foreground mt-2">Coming soon...</p></div>} />
                  <Route path="/fan/predictions" component={() => <div className="text-center py-20"><h1 className="text-2xl font-bold">Predictions</h1><p className="text-muted-foreground mt-2">Coming soon...</p></div>} />
                  <Route path="/fan/favorites" component={() => <FavoritesPage userRole="fan" />} />
                  <Route path="/fan/settings" component={() => <SettingsPage userRole="fan" userName={user?.username || 'Guest'} userEmail={user?.email || ''} />} />
                  <Route path="/fan/profile" component={() => <ProfilePage userRole="fan" userName={user?.username || 'Guest'} userEmail={user?.email || ''} />} />
                  <Route path="/fan/saved-reports" component={() => <SavedReportsPage />} />
                  <Route path="/fan/view-profile/:playerId?" component={({ params }) => <ViewProfilePage playerId={params.playerId} />} />
                  
                  {/* Default redirect to role-specific dashboard */}
                  <Route path="/" component={() => <Redirect to={`/${user?.role || 'fan'}`} />} />
                  
                  {/* 404 fallback */}
                  <Route component={() => <div className="text-center py-20"><h1 className="text-2xl font-bold">Page Not Found</h1><p className="text-muted-foreground mt-2">The page you're looking for doesn't exist.</p></div>} />
                </Switch>
                </div>
              </PageTransition>
            </main>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
