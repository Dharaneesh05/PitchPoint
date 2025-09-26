import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Mail, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { DevVerification } from "./DevVerification";

type UserRole = "coach" | "analyst" | "fan";

interface AuthFormProps {
  onLogin: (loginData: any) => void;
}

interface FormData {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: UserRole;
}

interface AuthState {
  step: 'auth' | 'verify-email' | 'forgot-password' | 'reset-password';
  email?: string;
  requiresVerification?: boolean;
}

const roleDescriptions = {
  coach: {
    title: "Coach",
    description: "Access team selection tools, player analysis, and strategic insights for competitive advantage.",
    features: ["Team Selection Recommendations", "Player Performance Analysis", "Opponent Strategy Analysis", "Match Planning Tools"],
    color: "blue",
    gradient: "from-blue-600/20 to-indigo-700/30"
  },
  analyst: {
    title: "Analyst", 
    description: "Deep dive into cricket analytics with comprehensive data visualization and reporting tools.",
    features: ["Advanced Analytics Dashboard", "Performance Trend Analysis", "Custom Report Generation", "Historical Data Insights"],
    color: "purple",
    gradient: "from-purple-600/20 to-violet-700/30"
  },
  fan: {
    title: "Fan",
    description: "Engage with cricket through predictions, fantasy recommendations, and match insights.",
    features: ["Live Match Updates", "Fantasy Cricket Tips", "Match Predictions", "Player Performance Tracking"],
    color: "green",
    gradient: "from-green-600/20 to-emerald-700/30"
  }
};

export function AuthForm({ onLogin }: AuthFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"login" | "signup">("login");
  const [error, setError] = useState("");
  const [authState, setAuthState] = useState<AuthState>({ step: 'auth' });
  const [displayRole, setDisplayRole] = useState<UserRole>("fan");
  const [userSelectedRole, setUserSelectedRole] = useState(false); // Track if user manually selected a role
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<FormData>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "fan"
  });

  // Role rotation effect for both login and signup (when user hasn't selected a role)
  useEffect(() => {
    if (activeTab === "login" || (activeTab === "signup" && !userSelectedRole)) {
      const roles: UserRole[] = ["fan", "coach", "analyst"];
      let currentIndex = 0;
      
      const interval = setInterval(() => {
        currentIndex = (currentIndex + 1) % roles.length;
        setDisplayRole(roles[currentIndex]);
      }, 3000); // Change every 3 seconds
      
      return () => clearInterval(interval);
    }
  }, [activeTab, userSelectedRole]);

  // Reset user selection when switching to login tab
  useEffect(() => {
    if (activeTab === "login") {
      setUserSelectedRole(false);
    }
  }, [activeTab]);

  // Update display role when user selects role in signup
  useEffect(() => {
    if (activeTab === "signup" && userSelectedRole) {
      setDisplayRole(formData.role);
    }
  }, [formData.role, activeTab, userSelectedRole]);

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
    
    // Track when user manually selects a role in signup
    if (field === "role" && activeTab === "signup") {
      setUserSelectedRole(true);
    }
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
      
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError("Please enter a valid email address");
        setIsLoading(false);
        return;
      }

      if (formData.password.length < 8) {
        setError("Password must be at least 8 characters long");
        setIsLoading(false);
        return;
      }
      
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
      if (!passwordRegex.test(formData.password)) {
        setError("Password must contain at least one uppercase letter, one lowercase letter, and one number");
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
        const { apiClient } = await import('@/lib/api');
        response = await apiClient.login({
          username: formData.username,
          password: formData.password,
        });
        
        // Save token to localStorage
        localStorage.setItem('token', response.token);
        
        toast({
          title: response.message,
          description: `Welcome back, ${response.user.username}!`,
        });
        
        onLogin(response);
      } else {
        const { apiClient } = await import('@/lib/api');
        response = await apiClient.register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        });
        
        if (response.autoVerified) {
          // Auto-verified in development mode
          toast({
            title: response.message,
            description: `Welcome to PitchPoint, ${response.user.username}!`,
          });
          
          // Save token to localStorage
          localStorage.setItem('token', response.token);
          
          onLogin(response);
        } else if (response.requiresVerification) {
          setAuthState({ 
            step: 'verify-email', 
            email: formData.email,
            requiresVerification: true 
          });
          
          toast({
            title: "Registration Successful!",
            description: "Please check your email to verify your account.",
          });
        } else {
          toast({
            title: response.message,
            description: `Welcome to PitchPoint, ${response.user.username}!`,
          });
          
          onLogin(response);
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      
      if (error.message?.includes('Email not verified')) {
        setAuthState({ 
          step: 'verify-email', 
          email: formData.email || formData.username,
          requiresVerification: true 
        });
      } else {
        setError(error instanceof Error ? error.message : 'An error occurred');
        
        // In development mode, show quick verification option
        if (import.meta.env.DEV && error.message?.includes('Email not verified')) {
          setError(error.message + ' (Click the verification button below to fix this in development mode)');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!authState.email) return;
    
    setIsLoading(true);
    try {
      const { apiClient } = await import('@/lib/api');
      await apiClient.resendVerification(authState.email);
      
      toast({
        title: "Email Sent",
        description: "Verification email has been resent. Please check your inbox.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to resend verification email. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (email: string) => {
    setIsLoading(true);
    try {
      const { apiClient } = await import('@/lib/api');
      const response = await apiClient.forgotPassword(email);
      
      toast({
        title: "Reset Link Sent",
        description: response.message,
      });
      
      setAuthState({ step: 'auth' });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send reset link. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (authState.step === 'verify-email') {
    const isDevelopment = import.meta.env.DEV;
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3 }}
        className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-4 relative"
        style={{
          backgroundImage: 'url(/Bg.jpg)',
        }}
      >
        {/* Dark overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 via-slate-800/50 to-slate-900/70" />
        
        <div className="relative z-10">
        {isDevelopment ? (
          <DevVerification 
            email={authState.email || ''}
            onVerified={(user, token) => {
              toast({
                title: "Email Verified!",
                description: `Welcome to PitchPoint, ${user.username}!`,
              });
              onLogin({ user, token });
            }}
          />
        ) : (
          <Card className="w-full max-w-md backdrop-blur-xl border-2 border-white/20 shadow-2xl bg-gradient-to-br from-slate-800/40 via-slate-700/30 to-slate-600/40">
            <CardHeader className="text-center bg-gradient-to-br from-slate-700/50 to-slate-600/60 rounded-t-lg">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-16 h-16 bg-blue-500/20 border border-blue-400/40 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm"
              >
                <Mail className="w-8 h-8 text-blue-300" />
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <CardTitle className="text-2xl font-bold text-white">Check Your Email</CardTitle>
                <CardDescription className="text-gray-300">
                  We've sent a verification link to {authState.email}
                </CardDescription>
              </motion.div>
            </CardHeader>
            <CardContent className="space-y-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Alert className="bg-amber-500/20 border-amber-400/40 text-amber-200 backdrop-blur-sm">
                  <AlertCircle className="h-4 w-4 text-amber-300" />
                  <AlertDescription>
                    Please check your email and click the verification link to activate your account.
                  </AlertDescription>
                </Alert>
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-center space-y-2"
              >
                <p className="text-sm text-gray-300">
                  Didn't receive an email?
                </p>
                <Button 
                  variant="outline" 
                  onClick={handleResendVerification}
                  disabled={isLoading}
                  className="w-full bg-slate-700/60 border-blue-400/40 text-blue-200 hover:bg-slate-600/60 backdrop-blur-sm"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Resend Verification Email
                </Button>
              </motion.div>
              
              <Button 
                variant="ghost" 
                onClick={() => setAuthState({ step: 'auth' })}
                className="w-full text-gray-300 hover:bg-slate-700/60 backdrop-blur-sm"
              >
                Back to Login
              </Button>
            </CardContent>
          </Card>
        )}
        </div>
      </motion.div>
    );
  }

  // Forgot password step
  if (authState.step === 'forgot-password') {
    return (
      <div 
        className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-4 relative"
        style={{
          backgroundImage: 'url(/Bg.jpg)',
        }}
      >
        {/* Dark overlay for better contrast */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 via-slate-800/50 to-slate-900/70" />
        
        <div className="relative z-10">
        <Card className="w-full max-w-md backdrop-blur-xl border-2 border-white/20 shadow-2xl bg-gradient-to-br from-slate-800/40 via-slate-700/30 to-slate-600/40">
          <CardHeader className="bg-gradient-to-br from-slate-700/50 to-slate-600/60 rounded-t-lg">
            <CardTitle className="text-2xl font-bold text-white">Forgot Password</CardTitle>
            <CardDescription className="text-gray-300">
              Enter your email address and we'll send you a reset link
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => {
              e.preventDefault();
              const emailInput = (e.target as any).email.value;
              handleForgotPassword(emailInput);
            }} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset-email" className="text-gray-200">Email</Label>
                <Input
                  id="reset-email"
                  name="email"
                  type="email"
                  className="bg-slate-800/60 border-white/20 focus:border-blue-400 text-white placeholder:text-gray-400 backdrop-blur-sm"
                  required
                />
              </div>
              
              <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Send Reset Link
              </Button>
              
              <Button 
                type="button"
                variant="ghost" 
                onClick={() => setAuthState({ step: 'auth' })}
                className="w-full text-gray-300 hover:bg-slate-700/60 backdrop-blur-sm"
              >
                Back to Login
              </Button>
            </form>
          </CardContent>
        </Card>
        </div>
      </div>
    );
  }

  const currentRole = roleDescriptions[displayRole];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center p-4 relative"
      style={{
        backgroundImage: 'url(/Bg.jpg)',
      }}
    >
      {/* Dark overlay for better contrast */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/60 via-slate-800/50 to-slate-900/70" />
      
      <div className="relative z-10 w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-start">
        {/* Branding Side */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="space-y-8 lg:pr-8"
        >
          {/* Brand Header */}
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-center lg:text-left"
            >
              <div className="flex items-center justify-center lg:justify-start gap-4 mb-2">
                <img 
                  src="/Logo2.svg" 
                  alt="PitchPoint Logo" 
                  className="w-16 h-16 lg:w-20 lg:h-20 object-contain rounded-full brightness-150 contrast-125 saturate-125 hover:brightness-175 transition-all duration-300" 
                />
                <h1 className="text-5xl lg:text-6xl font-heading font-bold text-white drop-shadow-2xl bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                  PitchPoint
                </h1>
              </div>
              <p className="text-xl text-gray-200 drop-shadow-md font-medium mt-2">
                Professional Cricket Analytics Platform
              </p>
              <div className="mt-4 h-1 w-24 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full mx-auto lg:mx-0"></div>
            </motion.div>
          </div>
          
          {/* Role Information Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={`${displayRole}-${activeTab}-${userSelectedRole}`}
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
            >
              <Card className={`p-6 backdrop-blur-xl border-2 shadow-2xl relative overflow-hidden bg-gradient-to-br from-slate-800/40 via-slate-700/30 to-slate-600/40 ${currentRole.gradient} border-white/20 hover:border-white/30 transition-all duration-300`}>
                {/* Animated background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-y-12 animate-pulse" />
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-xl" />
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white/5 to-transparent rounded-full blur-xl" />
                </div>
                
                <div className="relative z-10">
                  {/* Remove the big role indicator box - just content */}
                  <div className="space-y-4">
                    {/* Role header */}
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-2xl font-heading font-bold text-white">{currentRole.title}</h3>
                        {/* Status indicator only for signup when role is selected */}
                        {activeTab === "signup" && userSelectedRole && (
                          <div className="flex items-center gap-1 px-2 py-1 bg-white/20 rounded-full backdrop-blur-sm">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                            <span className="text-xs text-green-200 font-medium">Selected</span>
                          </div>
                        )}
                      </div>
                      <p className="text-gray-200 text-sm leading-relaxed font-medium">{currentRole.description}</p>
                    </div>
                      
                    {/* Features list with bullet points */}
                    <div className="space-y-3">
                      <h4 className="font-semibold text-sm text-gray-100">
                        Key Features
                      </h4>
                      <div className="grid grid-cols-1 gap-2">
                        {currentRole.features.map((feature, index) => (
                          <motion.div
                            key={`${feature}-${displayRole}`}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 * index, duration: 0.3 }}
                            className="text-sm text-gray-300 flex items-center gap-3 py-1.5"
                          >
                            <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
                              currentRole.color === 'blue' ? 'bg-blue-300' :
                              currentRole.color === 'purple' ? 'bg-purple-300' :
                              'bg-green-300'
                            }`} />
                            <span className="font-medium">{feature}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>
        </motion.div>

        {/* Auth Form Side */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="w-full max-w-md mx-auto lg:mx-0 lg:ml-auto"
        >
          <Card className="w-full backdrop-blur-xl border-2 border-white/20 shadow-2xl bg-gradient-to-br from-slate-800/40 via-slate-700/30 to-slate-600/40 mt-16">
            <CardHeader className="space-y-1 bg-gradient-to-br from-slate-700/50 to-slate-600/60 rounded-t-lg border-b border-white/10 pt-8">
              <CardTitle className="text-2xl font-bold text-white">Welcome Back</CardTitle>
              <CardDescription className="text-gray-300">
                Sign in to your account or create a new one
              </CardDescription>
            </CardHeader>
            
            <CardContent className="bg-slate-800/30 rounded-b-lg">
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "login" | "signup")}>
              <TabsList className="grid w-full grid-cols-2 bg-slate-700/50 border border-white/20 backdrop-blur-sm mt-4" >
                <TabsTrigger value="login" data-testid="tab-login" className="data-[state=active]:bg-slate-600/80 data-[state=active]:text-white text-gray-300 font-medium">Login</TabsTrigger>
                <TabsTrigger value="signup" data-testid="tab-signup" className="data-[state=active]:bg-slate-600/80 data-[state=active]:text-white text-gray-300 font-medium">Sign Up</TabsTrigger>
              </TabsList>
              
              <form onSubmit={handleSubmit} className="space-y-4 mt-6">
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                
                {/* Development quick-fix for email verification */}
                {import.meta.env.DEV && error?.includes('Email not verified') && (
                  <Alert className="bg-blue-50/80 border-blue-200 text-blue-800">
                    <AlertDescription>
                      <div className="flex flex-col gap-2">
                        <span className="text-sm">Development Mode: Quick Fix Available</span>
                        <Button 
                          type="button"
                          variant="outline" 
                          size="sm"
                          className="bg-blue-100/60 border-blue-200 text-blue-700 hover:bg-blue-100"
                          onClick={async () => {
                            try {
                              setIsLoading(true);
                              const { apiClient } = await import('@/lib/api');
                              const response = await apiClient.devVerify(formData.email || formData.username);
                              
                              toast({
                                title: "Email Verified!",
                                description: `Welcome to PitchPoint, ${response.user.username}!`,
                              });
                              
                              onLogin({ user: response.user, token: response.token });
                            } catch (err: any) {
                              setError('Quick verification failed: ' + err.message);
                            } finally {
                              setIsLoading(false);
                            }
                          }}
                          disabled={isLoading}
                        >
                          {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          Auto-Verify & Login
                        </Button>
                      </div>
                    </AlertDescription>
                  </Alert>
                )}
                
                <TabsContent value="login" className="space-y-4 bg-slate-800/20 p-4 rounded-lg border border-white/10">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-gray-200 font-medium">Username</Label>
                    <Input
                      id="username"
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleInputChange("username", e.target.value)}
                      data-testid="input-username"
                      className="bg-slate-800/60 border-white/20 focus:border-blue-400 focus:ring-blue-400/20 text-white placeholder:text-gray-400 backdrop-blur-sm"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-gray-200 font-medium">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      data-testid="input-password"
                      className="bg-slate-800/60 border-white/20 focus:border-blue-400 focus:ring-blue-400/20 text-white placeholder:text-gray-400 backdrop-blur-sm"
                      required
                    />
                  </div>
                  
                  <div className="text-right">
                    <Button 
                      type="button"
                      variant="ghost" 
                      className="p-0 h-auto text-sm underline"
                      onClick={() => setAuthState({ step: 'forgot-password' })}
                    >
                      Forgot password?
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="signup" className="space-y-4 bg-slate-800/20 p-4 rounded-lg border border-white/10">
                  <div className="space-y-2">
                    <Label htmlFor="signup-username" className="text-gray-200 font-medium">Username</Label>
                    <Input
                      id="signup-username"
                      type="text"
                      value={formData.username}
                      onChange={(e) => handleInputChange("username", e.target.value)}
                      data-testid="input-signup-username"
                      className="bg-slate-800/60 border-white/20 focus:border-blue-400 focus:ring-blue-400/20 text-white placeholder:text-gray-400 backdrop-blur-sm"
                      placeholder="Choose a unique username"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-gray-200 font-medium">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange("email", e.target.value)}
                      data-testid="input-email"
                      className="bg-slate-800/60 border-white/20 focus:border-blue-400 focus:ring-blue-400/20 text-white placeholder:text-gray-400 backdrop-blur-sm"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="signup-password" className="text-gray-200 font-medium">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      data-testid="input-signup-password"
                      className="bg-slate-800/60 border-white/20 focus:border-blue-400 focus:ring-blue-400/20 text-white placeholder:text-gray-400 backdrop-blur-sm"
                      placeholder="Must contain uppercase, lowercase, number (min 8 chars)"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-gray-200 font-medium">Confirm Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                      data-testid="input-confirm-password"
                      className="bg-slate-800/60 border-white/20 focus:border-blue-400 focus:ring-blue-400/20 text-white placeholder:text-gray-400 backdrop-blur-sm"
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-gray-200 font-medium">Role</Label>
                    <Select 
                      value={formData.role} 
                      onValueChange={(value: UserRole) => handleInputChange("role", value)}
                    >
                      <SelectTrigger data-testid="select-role" className="bg-slate-800/60 border-white/20 focus:border-blue-400 text-white font-medium backdrop-blur-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border border-white/20 shadow-lg backdrop-blur-xl">
                        <SelectItem value="fan" className="text-gray-200 hover:bg-slate-700 focus:bg-slate-700">Fan - Fantasy & Predictions</SelectItem>
                        <SelectItem value="analyst" className="text-gray-200 hover:bg-slate-700 focus:bg-slate-700">Analyst - Data & Reports</SelectItem>
                        <SelectItem value="coach" className="text-gray-200 hover:bg-slate-700 focus:bg-slate-700">Coach - Team Management</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </TabsContent>
                
                <Button 
                  type="submit" 
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 font-medium" 
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
        </motion.div>
      </div>
    </motion.div>
  );
}
