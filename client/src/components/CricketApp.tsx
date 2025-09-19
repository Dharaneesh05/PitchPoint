import { useState } from "react";
import { ThemeProvider } from "./ThemeProvider";
import { AuthForm } from "./AuthForm";
import { Navigation } from "./Navigation";
import { Dashboard } from "./Dashboard";
import { useToast } from "@/hooks/use-toast";

type UserRole = "coach" | "analyst" | "fan";

interface User {
  username: string;
  role: UserRole;
}

export function CricketApp() {
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  const handleLogin = (username: string, role: UserRole) => {
    setUser({ username, role });
    toast({
      title: "Welcome to CricketPro!",
      description: `Successfully logged in as ${role}`,
    });
  };

  const handleLogout = () => {
    setUser(null);
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  if (!user) {
    return (
      <ThemeProvider>
        <AuthForm onLogin={handleLogin} />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background">
        <Navigation 
          userRole={user.role} 
          userName={user.username} 
          onLogout={handleLogout} 
        />
        
        {/* Main Content */}
        <main className="lg:ml-64 lg:pl-0 pl-0">
          <div className="lg:hidden h-16" /> {/* Spacer for mobile header */}
          <div className="container mx-auto p-6 max-w-7xl">
            <Dashboard userRole={user.role} userName={user.username} />
          </div>
        </main>
      </div>
    </ThemeProvider>
  );
}
