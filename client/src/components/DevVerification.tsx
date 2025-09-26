import { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { apiClient } from '../lib/api';
import { Settings } from 'lucide-react';

interface DevVerificationProps {
  email: string;
  token?: string;
  onVerified: (user: any, token: string) => void;
}

export function DevVerification({ email, token, onVerified }: DevVerificationProps) {
  const [verificationToken, setVerificationToken] = useState(token || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handleVerifyWithToken = async () => {
    if (!verificationToken.trim()) {
      setError('Please enter the verification token');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await apiClient.verifyEmail(verificationToken.trim());

      setMessage('Email verified successfully!');
      setTimeout(() => {
        onVerified(response.user, response.token);
      }, 1000);
    } catch (error: any) {
      setError(error.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDevBypass = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await apiClient.devVerify(email);

      setMessage('Email verified successfully using development bypass!');
      setTimeout(() => {
        onVerified(response.user, response.token);
      }, 1000);
    } catch (error: any) {
      setError(error.message || 'Development verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Development Email Verification
        </CardTitle>
        <CardDescription>
          Since this is development mode, you can verify your email using the token from the server logs or use the bypass button.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {message && (
          <Alert>
            <AlertDescription className="text-green-600">{message}</AlertDescription>
          </Alert>
        )}

        <div className="bg-gray-100 p-3 rounded-lg text-sm">
          <p className="font-medium">Email to verify:</p>
          <p className="text-gray-300">{email}</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="token">Verification Token (from server logs)</Label>
          <Input
            id="token"
            type="text"
            placeholder="Enter the token from server console..."
            value={verificationToken}
            onChange={(e) => setVerificationToken(e.target.value)}
            className="font-mono text-sm"
          />
          <Button 
            onClick={handleVerifyWithToken} 
            className="w-full" 
            disabled={loading || !verificationToken.trim()}
          >
            {loading ? 'Verifying...' : 'Verify with Token'}
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">or</span>
          </div>
        </div>

        <Button 
          onClick={handleDevBypass} 
          variant="outline" 
          className="w-full" 
          disabled={loading}
        >
          {loading ? 'Processing...' : 'Development Bypass (Auto-verify)'}
        </Button>

        <div className="text-xs text-gray-500 mt-4">
          <p><strong>Tips:</strong></p>
          <ul className="list-disc list-inside space-y-1 mt-1">
            <li>Check the server console for the verification token</li>
            <li>Use the bypass button for quick development testing</li>
            <li>In production, users would receive the token via email</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}