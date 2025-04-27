import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useUserStore } from '@/store/userStore';
import { Loader2, Mail, Lock, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface WalletLoginProps {
  currentDateTime: string;
}

const WalletLogin = ({ currentDateTime }: WalletLoginProps) => {
  const [email, setEmail] = useState('customer@example.com');
  const [password, setPassword] = useState('password');
  const { login, isLoading, error } = useUserStore();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Please enter both email and password',
        variant: 'destructive',
      });
      return;
    }

    try {
      await login(email, password);
      toast({
        title: 'Success',
        description: 'Logged in successfully',
      });
    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: error.message || 'Invalid email or password',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center text-gray-600 hover:text-fuel-green-600">
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back to Scanner
        </Link>
        <div className="text-sm text-gray-600">
          {currentDateTime}
        </div>
      </div>

      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-fuel-green-700">
            Fuel Wallet Login
          </CardTitle>
          <CardDescription>
            Enter your customer credentials to access your wallet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="block text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-medium">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                  disabled={isLoading}
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-fuel-green-500 hover:bg-fuel-green-600"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Logging in...
                </>
              ) : 'Login'}
            </Button>

            {/* For development purposes */}
            <p className="text-xs text-center text-gray-500 mt-2">
              Use demo credentials: customer@example.com / password
            </p>

            {error && (
              <p className="text-sm text-red-600 mt-2">{error}</p>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletLogin;