import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { 
  Loader2, 
  Trophy, 
  Shield, 
  BarChart3, 
  Heart, 
  Mail, 
  AlertCircle, 
  CheckCircle2,
  Users,
  Target,
  Activity,
  TrendingUp,
  Star,
  Clock,
  ChevronRight
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type UserRole = "coach" | "analyst" | "fan";

interface AuthFormProps {
  onLogin: (loginData: any) => void;
}

interface RolePreview {
  role: UserRole;
  icon: React.ElementType;
  title: string;
  tagline: string;
  description: string;
  features: string[];
  stats: { label: string; value: string; }[];
  color: string;
  bgGradient: string;
}

const rolePreviews: RolePreview[] = [
  {
    role: "coach",
    icon: Shield,
    title: "Cricket Coach",
    tagline: "Strategic Excellence",
    description: "Empower your team with data-driven insights and strategic analysis tools designed for professional coaching.",
    features: [
      "Advanced Team Selection AI",
      "Real-time Performance Analytics",
      "Opposition Analysis Reports",
      "Training Program Optimization"
    ],
    stats: [
      { label: "Win Rate Improvement", value: "23%" },
      { label: "Data Points Analyzed", value: "50K+" },
      { label: "Strategic Insights", value: "500+" }
    ],
    color: "text-blue-600",
    bgGradient: "from-blue-500/10 to-indigo-500/10"
  },
  {
    role: "analyst",
    icon: BarChart3,
    title: "Performance Analyst",
    tagline: "Data-Driven Insights",
    description: "Unlock deep cricket analytics with comprehensive visualization tools and advanced statistical modeling.",
    features: [
      "Machine Learning Predictions",
      "Historical Trend Analysis",
      "Custom Dashboard Creation",
      "Statistical Report Generation"
    ],
    stats: [
      { label: "Prediction Accuracy", value: "87%" },
      { label: "Metrics Tracked", value: "200+" },
      { label: "Reports Generated", value: "1.2K+" }
    ],
    color: "text-purple-600",
    bgGradient: "from-purple-500/10 to-pink-500/10"
  },
  {
    role: "fan",
    icon: Heart,
    title: "Cricket Enthusiast",
    tagline: "Ultimate Fan Experience",
    description: "Enhance your cricket passion with predictions, fantasy insights, and exclusive fan engagement features.",
    features: [
      "Live Match Predictions",
      "Fantasy Team Optimization",
      "Player Performance Tracking",
      "Community Leaderboards"
    ],
    stats: [
      { label: "Fantasy Success Rate", value: "91%" },
      { label: "Predictions Made", value: "5K+" },
      { label: "Active Fans", value: "25K+" }
    ],
    color: "text-green-600",
    bgGradient: "from-green-500/10 to-emerald-500/10"
  }
];

export function DynamicLoginPreview() {
  const [currentPreview, setCurrentPreview] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentPreview((prev) => (prev + 1) % rolePreviews.length);
    }, 4000); // Change every 4 seconds

    return () => clearInterval(interval);
  }, []);

  const currentRole = rolePreviews[currentPreview];
  const Icon = currentRole.icon;

  return (
    <motion.div className="hidden lg:block lg:flex-1 relative overflow-hidden">
      <div className={`absolute inset-0 bg-gradient-to-br ${currentRole.bgGradient} transition-all duration-1000`} />
      
      <AnimatePresence mode="wait">
        <motion.div
          key={currentPreview}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="relative z-10 p-12 h-full flex flex-col justify-center"
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-xl bg-white shadow-lg ${currentRole.color}`}>
                <Icon className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-3xl font-bold text-white">{currentRole.title}</h2>
                <p className={`text-lg font-medium ${currentRole.color}`}>{currentRole.tagline}</p>
              </div>
            </div>
            <p className="text-gray-300 text-lg leading-relaxed">{currentRole.description}</p>
          </div>

          {/* Features */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Key Features</h3>
            <div className="space-y-3">
              {currentRole.features.map((feature, index) => (
                <motion.div
                  key={feature}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="flex items-center gap-3"
                >
                  <CheckCircle2 className={`w-5 h-5 ${currentRole.color}`} />
                  <span className="text-gray-300">{feature}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-white mb-4">Performance Metrics</h3>
            <div className="grid grid-cols-1 gap-4">
              {currentRole.stats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="bg-slate-800/60 backdrop-blur-sm rounded-lg p-4 shadow-sm border border-slate-600"
                >
                  <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                  <div className="text-sm text-gray-300">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Navigation dots */}
          <div className="flex gap-2 mt-auto">
            {rolePreviews.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentPreview(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentPreview
                    ? 'bg-gray-900 scale-125'
                    : 'bg-gray-400 hover:bg-gray-600'
                }`}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Background decorative elements */}
      <div className="absolute top-10 right-10 opacity-10">
        <Trophy className="w-32 h-32 text-white" />
      </div>
      <div className="absolute bottom-10 left-10 opacity-5">
        <Target className="w-24 h-24 text-white" />
      </div>
    </motion.div>
  );
}