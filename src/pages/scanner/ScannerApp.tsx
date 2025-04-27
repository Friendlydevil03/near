
import { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Fuel, LogOut } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useStationStore } from "@/store/stationStore";

const ScannerApp = () => {
  const { currentStation, loginStation, logoutStation, isLoading, error } = useStationStore();
  const [stationId, setStationId] = useState("station1");
  const [password, setPassword] = useState("password");
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: error,
        variant: "destructive",
      });
    }
  }, [error, toast]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await loginStation(stationId, password);
      toast({
        title: "Success",
        description: "Logged in successfully",
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleLogout = () => {
    logoutStation();
    navigate("/scanner");
    toast({
      title: "Logged out",
      description: "You have been logged out",
    });
  };

  if (!currentStation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-fuel-blue-50 to-fuel-blue-100 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-fuel-blue-700">
              Fuel Station Login
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="stationId" className="block text-sm font-medium">
                  Station ID
                </label>
                <Input
                  id="stationId"
                  value={stationId}
                  onChange={(e) => setStationId(e.target.value)}
                  className="w-full"
                  placeholder="Station ID"
                  required
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="password" className="block text-sm font-medium">
                  Password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full"
                  placeholder="Password"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-fuel-blue-500 hover:bg-fuel-blue-600"
                disabled={isLoading}
              >
                {isLoading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-fuel-blue-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Fuel className="h-8 w-8 text-fuel-blue-500 mr-2" />
            <div>
              <h1 className="text-xl font-bold text-fuel-blue-700">{currentStation.name}</h1>
              <p className="text-sm text-gray-500">{currentStation.location}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-5 w-5 mr-1" />
            Logout
          </Button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </div>
    </div>
  );
};

export default ScannerApp;
