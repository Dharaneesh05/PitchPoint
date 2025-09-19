import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Trophy, Shield, BarChart3, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type UserRole = "coach" | "analyst" | "fan";

interface AuthFormProps {
  onLogin: (username: string, role: UserRole) => void;
}

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

const roleDescriptions = {
  coach: {
    icon: Shield,
    title: "Coach",
    description: "Access team selection tools, player analysis, and strategic insights for competitive advantage.",
    features: ["Team Selection Recommendations", "Player Performance Analysis", "Opponent Strategy Analysis", "Match Planning Tools"]
  },
  analyst: {
    icon: BarChart3,
    title: "Analyst",
    description: "Deep dive into cricket analytics with comprehensive data visualization and reporting tools.",
    features: ["Advanced Analytics Dashboard", "Performance Trend Analysis", "Custom Report Generation", "Historical Data Insights"]
  },
  fan: {
    icon: Heart,
    title: "Fan",
    description: "Engage with cricket through predictions, fantasy recommendations, and match insights.",
    features: ["Live Match Updates", "Fantasy Cricket Tips", "Match Predictions", "Player Performance Tracking"]
  }
};

export function AuthForm({ onLogin }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [error, setError] = useState("");
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "fan"
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Basic validation
    if (!formData.username || !formData.password) {
      setError("Please fill in all required fields");
      setIsLoading(false);
      return;
    }

    if (activeTab === "signup") {
      if (!formData.email) {
        setError("Email is required for signup");
        setIsLoading(false);
        return;
      }
      
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        setIsLoading(false);
        return;
      }
    }

    try {
      let response;
      
      if (activeTab === "login") {
        // Import the API client dynamically to avoid issues
        const { apiClient } = await import('@/lib/api');
        response = await apiClient.login({
          username: formData.username,
          password: formData.password,
        });
      } else {
        // Import the API client dynamically to avoid issues
        const { apiClient } = await import('@/lib/api');
        response = await apiClient.register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        });
      }

      toast({
        title: response.message,
        description: `Welcome to CricketPro, ${response.user.username}!`,
      });
      
      onLogin(response.user.username, response.user.role);
    } catch (error) {
      console.error('Auth error:', error);
      setError(error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const currentRole = roleDescriptions[formData.role];
  const RoleIcon = currentRole.icon;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Branding Side */}
        <div className="space-y-8">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                <Trophy className="w-7 h-7 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-foreground">CricketPro</h1>
                <p className="text-muted-foreground">Professional Cricket Analytics Platform</p>
              </div>
            </div>
          </div>
          
          {/* Role Information */}
          <Card className="p-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <RoleIcon className="w-6 h-6 text-primary" />
              </div>
              <div className="space-y-3">
                <div>
                  <h3 className="text-xl font-semibold">{currentRole.title} Access</h3>
                  <p className="text-muted-foreground">{currentRole.description}</p>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Key Features:</h4>
                  <ul className="space-y-1">
                    {currentRole.features.map((feature, index) => (
                      <li key={index} className="text-sm text-muted-foreground flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Auth Form Side */}
        <Card className="w-full max-w-md mx-auto">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your account or create a new one
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "signup")}>
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login" data-testid="tab-login">Login</TabsTrigger>
                <TabsTrigger value="signup" data-testid="tab-signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                <TabsContent value="login" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleInputChange("username", e.target.value)}
                      data-testid="input-username"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      data-testid="input-password"
                      required
                    />
                  </div>
                </TabsContent>
                
                <TabsContent value="signup" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-username">Username</Label>
                    <Input
                      id="signup-username"
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleInputChange("username", e.target.value)}
                      data-testid="input-signup-username"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      data-testid="input-email"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      data-testid="input-signup-password"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      data-testid="input-confirm-password"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select 
                      value={formData.role} 
                      onValueChange={(value: UserRole) => handleInputChange("role", value)}
                    >
                      <SelectTrigger data-testid="select-role">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fan">Fan - Fantasy & Predictions</SelectItem>
                        <SelectItem value="analyst">Analyst - Data & Reports</SelectItem>
                        <SelectItem value="coach">Coach - Team Management</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
                
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                  data-testid="button-submit"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isLoading ? "Please wait..." : (activeTab === "login" ? "Sign In" : "Create Account")}
                </Button>
              </form>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
