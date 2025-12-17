import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { 
  User, 
  Heart, 
  Bookmark, 
  History, 
  Settings, 
  Bell, 
  LogOut, 
  ChevronDown, 
  Trophy, 
  Star,
  Shield,
  BarChart3,
  Users
} from "lucide-react";
import { apiClient } from "@/lib/api";

type UserRole = "coach" | "analyst" | "fan";

interface UserProfileProps {
  userRole: UserRole;
  userName: string;
  userEmail?: string;
  onLogout: () => void;
}

const roleConfig = {
  coach: { 
    color: "bg-blue-500", 
    label: "Coach",
    icon: Users,
    description: "Team Management & Strategy"
  },
  analyst: { 
    color: "bg-purple-500", 
    label: "Analyst",
    icon: BarChart3,
    description: "Performance Analysis & Insights" 
  },
  fan: { 
    color: "bg-green-500", 
    label: "Fan",
    icon: Heart,
    description: "Cricket Enthusiast"
  },
};

export function UserProfile({ userRole, userName, userEmail, onLogout }: UserProfileProps) {
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [userStats, setUserStats] = useState({
    favoritesCount: 0,
    savedAnalysisCount: 0,
    trainingSessionsCount: 0
  });
  const [isLoading, setIsLoading] = useState(false);

  const config = roleConfig[userRole];
  const Icon = config.icon;

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    setIsLoading(true);
    try {
      // Fetch user statistics from MongoDB
      const [favorites, savedAnalysis] = await Promise.all([
        apiClient.getFavoritePlayers().catch(() => []),
        apiClient.getSavedAnalyses().catch(() => [])
      ]);

      setUserStats({
        favoritesCount: favorites.length || 0,
        savedAnalysisCount: savedAnalysis.length || 0,
        trainingSessionsCount: 0 // Will be fetched from CoachDashboard context if needed
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileAction = (action: string) => {
    console.log(`[PROFILE] ${action} clicked for ${userName}`);
    setIsProfileOpen(false);
    
    if (action === 'logout') {
      onLogout();
    }
    // TODO: Implement other actions (favorites, settings, etc.)
  };

  return (
    <DropdownMenu open={isProfileOpen} onOpenChange={setIsProfileOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="flex items-center gap-3 p-2 h-auto hover:bg-sidebar-accent transition-colors"
        >
          <Avatar className="h-10 w-10">
            <AvatarImage src="" />
            <AvatarFallback className={config.color}>
              {userName.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0 text-left">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {userName}
            </p>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                <Icon className="w-3 h-3 mr-1" />
                {config.label}
              </Badge>
            </div>
          </div>
          <ChevronDown className={`w-4 h-4 text-sidebar-foreground/60 transition-transform ${
            isProfileOpen ? 'rotate-180' : ''
          }`} />
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className="w-64 p-2" 
        align="end" 
        side="top"
        sideOffset={8}
      >
        <DropdownMenuLabel className="p-3">
          <div className="flex items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src="" />
              <AvatarFallback className={config.color}>
                {userName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm">{userName}</p>
              {userEmail && (
                <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
              )}
              <Badge variant="outline" className="text-xs mt-1">
                <Icon className="w-3 h-3 mr-1" />
                {config.label}
              </Badge>
            </div>
          </div>
        </DropdownMenuLabel>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="flex items-center gap-3 p-3 cursor-pointer"
          onClick={() => handleProfileAction('profile')}
        >
          <User className="w-4 h-4" />
          <span>View Profile</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="flex items-center gap-3 p-3 cursor-pointer"
          onClick={() => handleProfileAction('favorites')}
        >
          <Heart className="w-4 h-4" />
          <span>Favorites</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="flex items-center gap-3 p-3 cursor-pointer"
          onClick={() => handleProfileAction('bookmarks')}
        >
          <Bookmark className="w-4 h-4" />
          <span>Saved Reports</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="flex items-center gap-3 p-3 cursor-pointer"
          onClick={() => handleProfileAction('history')}
        >
          <History className="w-4 h-4" />
          <span>Recent Activity</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="flex items-center gap-3 p-3 cursor-pointer"
          onClick={() => handleProfileAction('settings')}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="flex items-center gap-3 p-3 cursor-pointer"
          onClick={() => handleProfileAction('notifications')}
        >
          <Bell className="w-4 h-4" />
          <span>Notifications</span>
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem 
          className="flex items-center gap-3 p-3 cursor-pointer text-destructive focus:text-destructive"
          onClick={() => handleProfileAction('logout')}
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function UserProfileDialog({ userRole, userName, userEmail }: Omit<UserProfileProps, 'onLogout'>) {
  const [userStats, setUserStats] = useState({
    favoritesCount: 0,
    savedAnalysisCount: 0,
    trainingSessionsCount: 0,
    recentActivity: []
  });
  const [isLoading, setIsLoading] = useState(true);

  const config = roleConfig[userRole];
  const Icon = config.icon;

  useEffect(() => {
    fetchDetailedUserStats();
  }, [userRole]);

  const fetchDetailedUserStats = async () => {
    setIsLoading(true);
    try {
      const [favorites, savedAnalysis] = await Promise.all([
        apiClient.getFavoritePlayers().catch(() => []),
        apiClient.getSavedAnalyses().catch(() => [])
      ]);

      setUserStats({
        favoritesCount: favorites.length || 0,
        savedAnalysisCount: savedAnalysis.length || 0,
        trainingSessionsCount: 0, // Will be calculated from context if needed
        recentActivity: [
          ...favorites.slice(0, 3).map((f: any) => ({ type: 'favorite', name: f.playerName, date: f.createdAt })),
          ...savedAnalysis.slice(0, 3).map((s: any) => ({ type: 'analysis', name: s.title, date: s.createdAt }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5)
      });
    } catch (error) {
      console.error('Error fetching detailed user stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <User className="w-4 h-4 mr-2" />
          Profile Settings
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Profile Information</DialogTitle>
          <DialogDescription>
            Manage your account settings and preferences
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="" />
              <AvatarFallback className={config.color}>
                {userName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div>
              <h3 className="font-semibold text-lg">{userName}</h3>
              {userEmail && (
                <p className="text-sm text-muted-foreground">{userEmail}</p>
              )}
              <Badge variant="outline" className="mt-2">
                <Icon className="w-3 h-3 mr-1" />
                {config.label}
              </Badge>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              {userRole === 'coach' ? (
                <>
                  <Users className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Training Sessions</p>
                  <p className="text-2xl font-bold">
                    {isLoading ? '...' : userStats.trainingSessionsCount}
                  </p>
                </>
              ) : (
                <>
                  <Bookmark className="w-6 h-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">Saved Analysis</p>
                  <p className="text-2xl font-bold">
                    {isLoading ? '...' : userStats.savedAnalysisCount}
                  </p>
                </>
              )}
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <Heart className="w-6 h-6 mx-auto mb-2 text-primary" />
              <p className="text-sm font-medium">Favorite Players</p>
              <p className="text-2xl font-bold">
                {isLoading ? '...' : userStats.favoritesCount}
              </p>
            </div>
          </div>
          
          {userStats.recentActivity.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium">Recent Activity</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {userStats.recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex items-center gap-3 text-sm p-2 rounded bg-muted/50">
                    {activity.type === 'favorite' ? (
                      <Heart className="w-4 h-4 text-red-500" />
                    ) : (
                      <BarChart3 className="w-4 h-4 text-blue-500" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="truncate">{activity.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="space-y-3">
            <h4 className="font-medium">Quick Actions</h4>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" size="sm" className="justify-start">
                <Settings className="w-4 h-4 mr-2" />
                Preferences
              </Button>
              <Button variant="outline" size="sm" className="justify-start">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </Button>
              <Button variant="outline" size="sm" className="justify-start">
                <Heart className="w-4 h-4 mr-2" />
                Favorites
              </Button>
              <Button variant="outline" size="sm" className="justify-start">
                <History className="w-4 h-4 mr-2" />
                Activity
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}