import { useState, useEffect } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useUserStore, hasRole } from '@/store/userStore';
import {Loader2, Lock, Mail, Clock, AlertCircle, User, CreditCard} from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [activeTab, setActiveTab] = useState<'attendant' | 'customer'>('attendant');
  const { currentUser, login, isLoading, error, demoMode } = useUserStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Format current date and time in UTC as YYYY-MM-DD HH:MM:SS
  const updateDateTime = () => {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');

    setCurrentDateTime(`${year}-${month}-${day} ${hours}:${minutes}:${seconds}`);
  };

  // Update date time every second
  useEffect(() => {
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Handle tab change to pre-fill demo credentials
  useEffect(() => {
    if (activeTab === 'attendant') {
      setEmail('Friendlydevil03');
      setPassword('password');
    } else {
      setEmail('customer@example.com');
      setPassword('password');
    }
  }, [activeTab]);

  // If already logged in, redirect based on role
  if (currentUser) {
    if (hasRole(currentUser, 'customer')) {
      return <Navigate to="/wallet" />;
    } else {
      return <Navigate to="/scanner" />;
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast({
        title: 'Error',
        description: 'Please enter both email/username and password',
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
      // The redirect will happen automatically via the check above
    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: error.message || 'Invalid email or password',
        variant: 'destructive',
      });
    }
  };

  const isDemoModeActive = demoMode || !import.meta.env.VITE_SUPABASE_URL;

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-fuel-blue-50 to-fuel-blue-100">
      {/* Header with date/time */}
      <header className="p-4 bg-white shadow-sm">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold text-fuel-blue-700">Fuel Transaction System</h1>
          <div className="flex items-center text-gray-600">
            <Clock className="h-4 w-4 mr-2" />
            <span>{currentDateTime}</span>
          </div>
        </div>
      </header>

      <div className="flex-grow flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-fuel-blue-700">
              Login
            </CardTitle>
            <CardDescription>
              Choose your account type to log in
            </CardDescription>
          </CardHeader>

          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={(value) => setActiveTab(value as 'attendant' | 'customer')}
              className="w-full mb-6"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="attendant">
                  <User className="h-4 w-4 mr-2" />
                  Station Staff
                </TabsTrigger>
                <TabsTrigger value="customer">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Wallet User
                </TabsTrigger>
              </TabsList>

              <TabsContent value="attendant" className="mt-4">
                <div className="text-sm text-center mb-4">
                  Log in as a station attendant to manage fuel transactions
                </div>
              </TabsContent>

              <TabsContent value="customer" className="mt-4">
                <div className="text-sm text-center mb-4">
                  Access your wallet to make payments and view your transaction history
                </div>
              </TabsContent>
            </Tabs>

            {isDemoModeActive && (
              <Alert className="mb-4 bg-amber-50 text-amber-800 border-amber-300">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  Running in demo mode. No Supabase connection detected.
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="block text-sm font-medium">
                  {activeTab === 'attendant' ? 'Username' : 'Email'}
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    id="email"
                    type={activeTab === 'attendant' ? 'text' : 'email'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={activeTab === 'attendant' ? 'e.g. Friendlydevil03' : 'e.g. customer@example.com'}
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
                    placeholder="••••••••"
                    className="pl-10"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <Button
                type="submit"
                className={`w-full ${
                  activeTab === 'attendant' 
                    ? "bg-fuel-blue-500 hover:bg-fuel-blue-600" 
                    : "bg-fuel-green-500 hover:bg-fuel-green-600"
                }`}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : 'Login'}
              </Button>

              {error && (
                <p className="text-sm text-red-600 mt-2">{error}</p>
              )}
            </form>
          </CardContent>

          <CardFooter className="flex flex-col">
            <p className="text-xs text-center text-gray-500 mt-2">
              Default login: {activeTab === 'attendant' ? 'Friendlydevil03' : 'customer@example.com'} / password
            </p>
            <p className="text-xs text-center text-gray-500 mt-2">
              Current Date and Time (UTC): {currentDateTime}
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;