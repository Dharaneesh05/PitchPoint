import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "./ThemeProvider";
import {
  Home,
  BarChart3,
  Users,
  Trophy,
  Settings,
  Sun,
  Moon,
  Menu,
  X,
  Shield,
  TrendingUp,
  Heart,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type UserRole = "coach" | "analyst" | "fan";

interface NavigationProps {
  userRole: UserRole;
  userName: string;
  onLogout: () => void;
}

const navigationItems = {
  coach: [
    { name: "Dashboard", href: "/coach", icon: Home },
    { name: "Team Selection", href: "/coach/team-selection", icon: Users },
    { name: "Player Analysis", href: "/coach/players", icon: BarChart3 },
    { name: "Match Analysis", href: "/coach/matches", icon: Trophy },
    { name: "Settings", href: "/coach/settings", icon: Settings },
  ],
  analyst: [
    { name: "Dashboard", href: "/analyst", icon: Home },
    { name: "Team Analysis", href: "/analyst/teams", icon: BarChart3 },
    { name: "Match Reports", href: "/analyst/matches", icon: Trophy },
    { name: "Performance", href: "/analyst/performance", icon: TrendingUp },
    { name: "Settings", href: "/analyst/settings", icon: Settings },
  ],
  fan: [
    { name: "Dashboard", href: "/fan", icon: Home },
    { name: "Live Matches", href: "/fan/live", icon: Trophy },
    { name: "Predictions", href: "/fan/predictions", icon: TrendingUp },
    { name: "Favorites", href: "/fan/favorites", icon: Heart },
    { name: "Settings", href: "/fan/settings", icon: Settings },
  ],
};

const roleConfig = {
  coach: { color: "bg-primary", label: "Coach", icon: Shield },
  analyst: { color: "bg-chart-3", label: "Analyst", icon: BarChart3 },
  fan: { color: "bg-chart-2", label: "Fan", icon: Heart },
};

export function Navigation({ userRole, userName, onLogout }: NavigationProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [location] = useLocation();
  const { theme, setTheme } = useTheme();
  const config = roleConfig[userRole];
  const items = navigationItems[userRole];

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-50 lg:bg-sidebar lg:border-r lg:border-sidebar-border">
        <div className="flex h-16 shrink-0 items-center px-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Trophy className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold text-sidebar-foreground">CricketPro</span>
          </div>
        </div>
        
        <nav className="flex-1 px-4 py-6 space-y-2">
          {items.map((item) => {
            const Icon = item.icon;
            const isActive = location === item.href;
            return (
              <Link key={item.name} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className="w-full justify-start gap-3 h-10"
                  data-testid={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarImage src="" />
                <AvatarFallback className={config.color}>
                  {userName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">{userName}</p>
                <Badge variant="secondary" className="text-xs">
                  <config.icon className="w-3 h-3 mr-1" />
                  {config.label}
                </Badge>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              data-testid="button-theme-toggle"
              className="flex-1"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onLogout}
              data-testid="button-logout"
              className="flex-1"
            >
              Logout
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden">
        <div className="flex h-16 items-center justify-between px-4 border-b border-sidebar-border bg-background">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              data-testid="button-mobile-menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-primary rounded flex items-center justify-center">
                <Trophy className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold">CricketPro</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              data-testid="button-theme-toggle-mobile"
            >
              {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </Button>
            <Avatar className="h-8 w-8">
              <AvatarImage src="" />
              <AvatarFallback className={config.color}>
                {userName.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
            <div className="fixed top-0 left-0 w-72 h-full bg-sidebar border-r border-sidebar-border">
              <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-primary-foreground" />
                  </div>
                  <span className="text-lg font-semibold text-sidebar-foreground">CricketPro</span>
                </div>
              </div>
              
              <nav className="flex-1 px-4 py-6 space-y-2">
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location === item.href;
                  return (
                    <Link key={item.name} href={item.href}>
                      <Button
                        variant={isActive ? "secondary" : "ghost"}
                        className="w-full justify-start gap-3 h-10"
                        onClick={() => setIsMobileMenuOpen(false)}
                        data-testid={`nav-mobile-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
                      >
                        <Icon className="w-4 h-4" />
                        {item.name}
                      </Button>
                    </Link>
                  );
                })}
              </nav>

              <div className="border-t border-sidebar-border p-4">
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src="" />
                    <AvatarFallback className={config.color}>
                      {userName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-sidebar-foreground">{userName}</p>
                    <Badge variant="secondary" className="text-xs">
                      <config.icon className="w-3 h-3 mr-1" />
                      {config.label}
                    </Badge>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onLogout}
                  data-testid="button-logout-mobile"
                  className="w-full"
                >
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
