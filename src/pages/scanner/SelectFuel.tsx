import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { useStationStore } from "@/store/stationStore";
import { Droplet, DollarSign, Fuel, User, Clock } from "lucide-react"; // Added Clock icon
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/lib/supabase";
import { useUserStore } from "@/store/userStore";
import { useTransactionStore } from "@/store/transactionStore";

// Define types to fix the "any" error
interface QRData {
  userId: string;
  walletId: string;
  name?: string;
  vehicle?: {
    id: string;
    licensePlate: string;
    fuelType?: string;
  };
}

interface Station {
  id: string;
  name: string;
}

// Extend the store type
interface StationStore {
  scannedQrData: QRData | null;
  station: Station | null;
}

const FUEL_TYPES = [
  { id: "regular", name: "Regular", price: 3.45 },
  { id: "premium", name: "Premium", price: 3.95 },
  { id: "diesel", name: "Diesel", price: 3.75 },
];

const SelectFuel = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { scannedQrData, station } = useStationStore() as unknown as StationStore;
  const { currentUser, logout } = useUserStore();

  const [selectedFuel, setSelectedFuel] = useState(FUEL_TYPES[0].id);
  const [amount, setAmount] = useState("");
  const [liters, setLiters] = useState("");
  const [isLitersMode, setIsLitersMode] = useState(false);
  const [userData, setUserData] = useState<{id: string; name?: string} | null>(null);
  const [currentDateTime, setCurrentDateTime] = useState("");
  const { createTransaction } = useTransactionStore();

  const selectedFuelType = FUEL_TYPES.find(fuel => fuel.id === selectedFuel);

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

  // Check if user is logged in, redirect if not
  useEffect(() => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to continue",
        variant: "destructive",
      });
      navigate('/login');
    }
  }, [currentUser, navigate, toast]);

  // Update date time every second
  useEffect(() => {
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Fetch user data when component mounts
  useEffect(() => {
    if (!userId) return;

    const fetchUserData = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        setUserData(data);
      }
    };

    fetchUserData();
  }, [userId]);

  // Calculate the other value based on the input
  const updateValues = (value: string, isLiters: boolean) => {
    if (value === "") {
      isLiters ? setAmount("") : setLiters("");
      return;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue <= 0) return;

    if (isLiters) {
      setLiters(value);
      setAmount((numValue * selectedFuelType!.price).toFixed(2));
    } else {
      setAmount(value);
      setLiters((numValue / selectedFuelType!.price).toFixed(2));
    }
  };

  const handleFuelTypeChange = (value: string) => {
    setSelectedFuel(value);

    // Update calculations with new fuel price
    if (isLitersMode && liters) {
      const litersVal = parseFloat(liters);
      const newFuel = FUEL_TYPES.find(fuel => fuel.id === value);
      setAmount((litersVal * newFuel!.price).toFixed(2));
    } else if (!isLitersMode && amount) {
      const amountVal = parseFloat(amount);
      const newFuel = FUEL_TYPES.find(fuel => fuel.id === value);
      setLiters((amountVal / newFuel!.price).toFixed(2));
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been logged out successfully",
    });
    navigate('/login');
  };

   const handleSubmit = async () => {
    if (!amount || parseFloat(amount) <= 0 || !userId || !station) {
      toast({
        title: "Invalid Input",
        description: "Please enter valid transaction details",
        variant: "destructive",
      });
      return;
    }

    try {
      // Create transaction data
      const transactionData = {
        user_id: userId,
        wallet_id: userId, // In this example they're the same
        station_id: station.id,
        station_name: station.name,
        fuel_type: selectedFuelType!.name,
        amount: parseFloat(amount),
        liters: parseFloat(liters),
        vehicle_id: scannedQrData?.vehicle?.id,
        vehicle_plate: scannedQrData?.vehicle?.licensePlate,
        attendant_id: currentUser?.id, // Add attendant ID
      };

      // Create the transaction
      const transactionId = await createTransaction(transactionData);

      toast({
        title: "Request Sent",
        description: "Waiting for customer confirmation...",
      });

      // Navigate to processing page
      navigate(`/scanner/processing/${transactionId}`);
    } catch (error) {
      console.error('Error creating transaction:', error);
      toast({
        title: "Error",
        description: "Failed to create transaction. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (!scannedQrData) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-fuel-blue-700">Error</h2>
        <Card>
          <CardContent className="p-6">
            <p>No wallet data found. Please scan a valid QR code first.</p>
            <Button
              onClick={() => navigate("/scanner")}
              className="mt-4"
            >
              Back to Scanner
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User login info */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-fuel-blue-700">Fuel Transaction</h2>
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Logged in as: </span>
            <span className="text-fuel-blue-600">{currentUser?.name || "Friendlydevil03"}</span>
          </div>
          <Button variant="outline" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        </div>
      </div>

      <Card className="border-fuel-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-fuel-blue-700">
            <Fuel className="h-5 w-5" />
            Select Fuel and Amount
          </CardTitle>

          {/* Current date/time display with UTC indicator */}
          <div className="text-sm text-gray-500 flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {currentDateTime} (UTC)
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">
                Select Fuel Type
              </label>
              <Select
                value={selectedFuel}
                onValueChange={handleFuelTypeChange}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select fuel type" />
                </SelectTrigger>
                <SelectContent>
                  {FUEL_TYPES.map((fuel) => (
                    <SelectItem key={fuel.id} value={fuel.id}>
                      {fuel.name} (${fuel.price.toFixed(2)}/L)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">
                    {isLitersMode ? "Liters" : "Amount ($)"}
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setIsLitersMode(!isLitersMode);
                    }}
                    className="text-xs h-6"
                  >
                    Switch to {isLitersMode ? "Amount" : "Liters"}
                  </Button>
                </div>
                <div className="flex items-center">
                  <div className="bg-fuel-blue-100 p-2 rounded-l-md">
                    {isLitersMode ? <Droplet className="h-5 w-5 text-fuel-blue-500" /> : <DollarSign className="h-5 w-5 text-fuel-blue-500" />}
                  </div>
                  <Input
                    type="number"
                    placeholder={isLitersMode ? "Enter liters" : "Enter amount"}
                    value={isLitersMode ? liters : amount}
                    onChange={(e) => updateValues(e.target.value, isLitersMode)}
                    className="rounded-l-none"
                    min="0"
                    step={isLitersMode ? "0.01" : "0.01"}
                  />
                </div>
                <p className="text-sm text-gray-500">
                  {isLitersMode ?
                    `$${amount || '0.00'} for ${liters || '0'} liters` :
                    `${liters || '0'} liters for $${amount || '0.00'}`}
                </p>
              </div>
            </div>

            <Button
              onClick={handleSubmit}
              className="w-full mt-4 bg-fuel-blue-500 hover:bg-fuel-blue-600"
              disabled={!amount || parseFloat(amount) <= 0}
            >
              Send Request to Customer
            </Button>
          </div>

          <div className="p-4 bg-fuel-blue-50 rounded-md">
            <h4 className="font-medium mb-2">Customer Details</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Wallet ID:</span>
                <span className="font-medium">{scannedQrData.walletId}</span>
              </div>
              {scannedQrData.name && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium">{scannedQrData.name}</span>
                </div>
              )}
              {scannedQrData.vehicle && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Vehicle:</span>
                  <span className="font-medium">{scannedQrData.vehicle.licensePlate}</span>
                </div>
              )}
            </div>
          </div>

          {/* Attendant info */}
          <div className="p-4 bg-fuel-blue-50 rounded-md border-t border-fuel-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-fuel-blue-500" />
                <span className="font-medium">Attendant:</span>
              </div>
              <span>{currentUser?.name || "Friendlydevil03"}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SelectFuel;