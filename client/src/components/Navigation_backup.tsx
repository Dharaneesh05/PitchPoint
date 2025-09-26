import { useState } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "./ThemeProvider";

type UserRole = "coach" | "analyst" | "fan";

interface NavigationProps {
  userRole: UserRole;
  userName: string;
  onLogout: () => void;
}

const navigationItems = {
  coach: [
    { name: "Dashboard", href: "/coach" },
    { name: "Player Search", href: "/coach/player-search" },
    { name: "Team Selection", href: "/coach/team-selection" },
    { name: "Player Analysis", href: "/coach/players" },
    { name: "Match Analysis", href: "/coach/matches" },
    { name: "Settings", href: "/coach/settings" },
  ],
  analyst: [
    { name: "Dashboard", href: "/analyst" },
    { name: "Player Search", href: "/analyst/player-search" },
    { name: "Team Analysis", href: "/analyst/teams" },
    { name: "Match Reports", href: "/analyst/matches" },
    { name: "Performance", href: "/analyst/performance" },
    { name: "Settings", href: "/analyst/settings" },
  ],
  fan: [
    { name: "Dashboard", href: "/fan" },
    { name: "Player Search", href: "/fan/player-search" },
    { name: "Live Matches", href: "/fan/live" },
    { name: "Predictions", href: "/fan/predictions" },
    { name: "Favorites", href: "/fan/favorites" },
    { name: "Settings", href: "/fan/settings" },
  ],
};

const roleConfig = {
  coach: { color: "bg-gradient-to-r from-blue-600 to-blue-700", label: "Coach" },
  analyst: { color: "bg-gradient-to-r from-green-600 to-green-700", label: "Analyst" },
  fan: { color: "bg-gradient-to-r from-purple-600 to-purple-700", label: "Fan" },
};

export function Navigation({ userRole, userName, onLogout }: NavigationProps) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const items = navigationItems[userRole];
  const config = roleConfig[userRole];

  const getThemeLabel = () => {
    switch (theme) {
      case "light": return "Light";
      case "dark": return "Dark";
      case "system": return "Auto";
      default: return "Dark";
    }
  };

  const cycleTheme = () => {
    if (theme === "light") setTheme("dark");
    else if (theme === "dark") setTheme("system");
    else setTheme("light");
  };

  return (
    <div>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 lg:z-50 lg:bg-gradient-to-b lg:from-slate-900 lg:via-slate-800 lg:to-slate-900 lg:border-r lg:border-slate-700">
        <div className="flex h-20 shrink-0 items-center px-8 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900">
          <div className="flex items-center gap-4">
            <img src="/Logo2.svg" alt="PitchPoint" className="w-12 h-12 object-contain rounded-full shadow-lg" />
            <div>
              <span className="text-xl font-bold text-white">PitchPoint</span>
              <p className="text-xs text-slate-300 uppercase tracking-wider">Cricket Analytics</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 px-6 py-8 space-y-2 overflow-y-auto">
          {items && items.length > 0 ? items.map((item, index) => {
            const isActive = location === item.href;
            return (
              <motion.div
                key={item.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1, duration: 0.3 }}
              >
                <Link href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={`w-full justify-start transition-all duration-200 ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-blue-500/30 shadow-lg' 
                        : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                    }`}
                  >
                    <span className="font-medium">{item.name}</span>
                  </Button>
                </Link>
              </motion.div>
            );
          }) : (
            <div className="text-slate-400 text-sm">No navigation items available</div>
          )}
        </nav>

        {/* User Profile and Logout */}
        <div className="mt-auto space-y-4 p-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onLogout}
            className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 mb-4"
          >
            Logout
          </Button>
          
          {/* User Profile Section */}
          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-600">
            <div className="text-sm">
              <p className="font-semibold text-white">{userName || 'User'}</p>
              <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300 border-slate-600 mt-1">
                <span className="font-semibold">{config.label}</span>
              </Badge>
            </div>
            <div className="mt-3 space-y-2 text-xs">
              <button className="block w-full text-left text-slate-300 hover:text-white">View Profile</button>
              <button className="block w-full text-left text-slate-300 hover:text-white">Favorites</button>
              <button className="block w-full text-left text-slate-300 hover:text-white">Saved Reports</button>
              <button className="block w-full text-left text-slate-300 hover:text-white">Settings</button>
            </div>
          </div>
          
          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={cycleTheme}
              data-testid="button-theme-toggle"
              className="relative overflow-hidden bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 px-4 py-2"
              title={`Current: ${theme === 'system' ? 'System' : theme.charAt(0).toUpperCase() + theme.slice(1)}`}
            >
              <motion.div
                key={theme}
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{ duration: 0.3 }}
                className="text-xs font-semibold"
              >
                {getThemeLabel()}
              </motion.div>
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Header */}
      <div className="lg:hidden">
        <div className="flex h-16 items-center justify-between px-4 border-b border-slate-600 bg-gradient-to-r from-slate-800 to-slate-900">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMobileMenuOpen(true)}
              className="text-slate-300 hover:text-white"
            >
              Menu
            </Button>
            <img src="/Logo2.svg" alt="PitchPoint" className="w-8 h-8 object-contain rounded-full" />
            <span className="text-lg font-bold text-white">PitchPoint</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-sm">
              <p className="font-semibold text-white">{userName || 'User'}</p>
              <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300 border-slate-600">
                <span className="font-semibold">{config.label}</span>
              </Badge>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-50 lg:hidden"
            >
              <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setIsMobileMenuOpen(false)} />
              <motion.div
                initial={{ x: -300 }}
                animate={{ x: 0 }}
                exit={{ x: -300 }}
                transition={{ type: "spring", damping: 30, stiffness: 300 }}
                className="fixed top-0 left-0 w-80 h-full bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700"
              >
                <div className="flex h-20 items-center px-8 border-b border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900">
                  <div className="flex items-center gap-4">
                    <img src="/Logo2.svg" alt="PitchPoint" className="w-12 h-12 object-contain rounded-full shadow-lg" />
                    <div>
                      <span className="text-xl font-bold text-white">PitchPoint</span>
                      <p className="text-xs text-slate-300 uppercase tracking-wider">Cricket Analytics</p>
                    </div>
                  </div>
                </div>
                
                <nav className="flex-1 px-6 py-8 space-y-3">
                  {items && items.length > 0 ? items.map((item, index) => {
                    const isActive = location === item.href;
                    return (
                      <motion.div
                        key={item.name}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.3 }}
                      >
                        <Link href={item.href}>
                          <Button
                            variant={isActive ? "secondary" : "ghost"}
                            className={`w-full justify-start transition-all duration-200 ${
                              isActive 
                                ? 'bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-white border border-blue-500/30' 
                                : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                            }`}
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            <span className="font-medium">{item.name}</span>
                          </Button>
                        </Link>
                      </motion.div>
                    );
                  }) : (
                    <div className="text-slate-400 text-sm">No navigation items available</div>
                  )}
                </nav>
                
                <div className="border-t border-slate-700 p-6 bg-gradient-to-r from-slate-800 to-slate-900">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex items-center gap-4 mb-6"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-white">{userName || 'User'}</p>
                      <Badge variant="secondary" className="text-xs bg-slate-700 text-slate-300 border-slate-600">
                        <span className="font-semibold">{config.label}</span>
                      </Badge>
                    </div>
                  </motion.div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onLogout}
                    data-testid="button-logout-mobile"
                    className="w-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600"
                  >
                    Logout
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}