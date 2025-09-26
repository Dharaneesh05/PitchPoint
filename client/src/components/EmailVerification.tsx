import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, CheckCircle2, AlertCircle, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiClient } from "@/lib/api";

interface EmailVerificationProps {
  token?: string;
  onVerificationComplete?: (user: any) => void;
  onBackToLogin?: () => void;
}

export function EmailVerification({ 
  token, 
  onVerificationComplete, 
  onBackToLogin 
}: EmailVerificationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [error, setError] = useState("");
  const { toast } = useToast();

  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await apiClient.verifyEmail(verificationToken);
      
      setVerificationStatus('success');
      
      toast({
        title: "Email Verified Successfully!",
        description: response.message,
      });

      // Auto-login the user after successful verification
      if (onVerificationComplete) {
        onVerificationComplete(response.user);
      }
    } catch (error: any) {
      console.error('Email verification error:', error);
      setVerificationStatus('error');
      setError(error.message || 'Verification failed. Please try again.');
      
      toast({
        title: "Verification Failed",
        description: error.message || 'Invalid or expired verification token.',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
              </div>
              <div>
                <h2 className="text-xl font-semibold">Verifying Your Email</h2>
                <p className="text-muted-foreground">Please wait while we verify your account...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verificationStatus === 'success') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-green-600">
              Email Verified Successfully!
            </CardTitle>
            <CardDescription>
              Your account has been successfully verified. Welcome to CricketPro!
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-green-200 bg-green-50">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-700">
                You can now access all features of your CricketPro account.
              </AlertDescription>
            </Alert>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Redirecting you to the dashboard...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (verificationStatus === 'error') {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-red-600">
              Verification Failed
            </CardTitle>
            <CardDescription>
              We couldn't verify your email address
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                {error}
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground text-center">
                The verification link may have expired or been used already.
              </p>
              
              <Button 
                variant="outline" 
                onClick={onBackToLogin}
                className="w-full"
              >
                Back to Login
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Default state - no token provided
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl font-bold">
            Email Verification Required
          </CardTitle>
          <CardDescription>
            Please check your email for a verification link
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              We've sent a verification email to your registered email address. 
              Click the link in the email to verify your account.
            </AlertDescription>
          </Alert>
          
          <Button 
            variant="outline" 
            onClick={onBackToLogin}
            className="w-full"
          >
            Back to Login
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}