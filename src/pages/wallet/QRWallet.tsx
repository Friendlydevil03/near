import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useUserStore } from "@/store/userStore";
import { Car, Clock, Cog, RefreshCw } from "lucide-react";
import QRCode from "@/components/QRCode";
import { useNavigate } from "react-router-dom";

interface QRWalletProps {
  currentDateTime: string;
}

// Helper function to get vehicles from localStorage
const getVehiclesFromStorage = () => {
  try {
    const saved = localStorage.getItem('user-vehicles');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error("Failed to load vehicles from localStorage", e);
  }

  // Default vehicles if none found
  return [
    {
      id: "vehicle-001",
      make: "Toyota",
      model: "Camry",
      licensePlate: "ABC123",
      fuelType: "Regular"
    },
    {
      id: "vehicle-002",
      make: "Honda",
      model: "Civic",
      licensePlate: "XYZ789",
      fuelType: "Premium"
    }
  ];
};

const QRWallet = ({ currentDateTime }: QRWalletProps) => {
  const { currentUser } = useUserStore();
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState(getVehiclesFromStorage());

  // Get active vehicle from localStorage or use first vehicle
  const [activeVehicle, setActiveVehicle] = useState<string | null>(() => {
    const savedActiveId = localStorage.getItem('active-vehicle-id');
    // If the saved ID exists in the vehicles, use it; otherwise use the first vehicle
    const vehicleIds = vehicles.map(v => v.id);
    return (savedActiveId && vehicleIds.includes(savedActiveId)) ?
      savedActiveId :
      (vehicles[0]?.id || null);
  });

  // Create a stable timestamp that only changes when we want it to
  const [qrTimestamp, setQrTimestamp] = useState(new Date().toISOString());

  // Force refresh the QR code manually
  const refreshQRCode = () => {
    setQrTimestamp(new Date().toISOString());
  };

  // Save active vehicle to localStorage when it changes
  useEffect(() => {
    if (activeVehicle) {
      localStorage.setItem('active-vehicle-id', activeVehicle);
      // Update the QR timestamp when vehicle changes
      setQrTimestamp(new Date().toISOString());
    }
  }, [activeVehicle]);

  // Update vehicles when localStorage changes
  useEffect(() => {
    const handleVehiclesUpdate = () => {
      const updatedVehicles = getVehiclesFromStorage();
      setVehicles(updatedVehicles);

      // If active vehicle was deleted, update to first available
      const vehicleExists = updatedVehicles.some(v => v.id === activeVehicle);
      if (!vehicleExists && updatedVehicles.length > 0) {
        setActiveVehicle(updatedVehicles[0].id);
        // Update timestamp when active vehicle changes
        setQrTimestamp(new Date().toISOString());
      } else if (updatedVehicles.length === 0) {
        setActiveVehicle(null);
        // Update timestamp when active vehicle changes
        setQrTimestamp(new Date().toISOString());
      }
    };

    // Listen for both storage events and our custom event
    window.addEventListener('storage', handleVehiclesUpdate);
    window.addEventListener('vehicles-updated', handleVehiclesUpdate);

    return () => {
      window.removeEventListener('storage', handleVehiclesUpdate);
      window.removeEventListener('vehicles-updated', handleVehiclesUpdate);
    };
  }, [activeVehicle]);

  // Generate QR code data with stable timestamp - Fixed to use actual user name
  const getQRData = () => {
    if (!currentUser) return JSON.stringify({});

    const selectedVehicle = vehicles.find(v => v.id === activeVehicle);

    // Make sure we use the actual current user name, not a hardcoded value
    const userNameRaw = currentUser.name || "";
    const userName = typeof userNameRaw === 'string' ?
    userNameRaw.replace(/import.*$/, '') : // Remove "import..." if present
    "Friendlydevil03";

    const qrData = {
      userId: currentUser.id || "user-001",
      walletId: currentUser.id || "wallet-001",
      name: userName,
      vehicle: selectedVehicle ? {
        id: selectedVehicle.id,
        licensePlate: selectedVehicle.licensePlate,
        fuelType: selectedVehicle.fuelType
      } : undefined,
      timestamp: qrTimestamp // Use the stable timestamp
    };

    return JSON.stringify(qrData);
  };

  return (
    <div className="space-y-6">
      <Card className="border-fuel-green-200">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-center">Scan to Pay</CardTitle>
              <CardDescription className="text-center">
                Show this QR code to the gas station attendant
              </CardDescription>
            </div>
            <div className="text-sm text-gray-500 flex items-center">
              <Clock className="h-4 w-4 mr-1" />
              {currentDateTime}
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-4">
          <div className="bg-white p-4 rounded-lg border">
            <QRCode value={getQRData()} size={220} />
          </div>

          {/* Refresh button */}
          <Button
            variant="outline"
            size="sm"
            onClick={refreshQRCode}
            className="flex items-center text-fuel-green-600"
          >
            <RefreshCw className="h-4 w-4 mr-1" />
            Refresh QR Code
          </Button>

          <div className="w-full max-w-md">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-sm">Select Vehicle:</h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/wallet/settings')}
                className="text-xs flex items-center text-fuel-green-600"
              >
                <Cog className="h-3 w-3 mr-1" />
                Manage Vehicles
              </Button>
            </div>

            {vehicles.length > 0 ? (
              <div className="grid gap-2">
                {vehicles.map((vehicle) => (
                  <Button
                    key={vehicle.id}
                    variant={activeVehicle === vehicle.id ? "default" : "outline"}
                    className={`justify-start ${
                      activeVehicle === vehicle.id
                        ? "bg-fuel-green-500 hover:bg-fuel-green-600"
                        : "hover:border-fuel-green-500"
                    }`}
                    onClick={() => setActiveVehicle(vehicle.id)}
                  >
                    <Car className="h-5 w-5 mr-2" />
                    <div className="flex flex-col items-start text-left">
                      <span>{vehicle.make} {vehicle.model}</span>
                      <span className="text-xs opacity-80">
                        {vehicle.licensePlate} • {vehicle.fuelType} fuel
                      </span>
                    </div>
                  </Button>
                ))}
              </div>
            ) : (
              <div className="text-center p-4 border border-dashed rounded-md">
                <p className="text-gray-500 mb-2">No vehicles found</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/wallet/settings')}
                  className="text-fuel-green-600 border-fuel-green-200"
                >
                  Add a Vehicle
                </Button>
              </div>
            )}
          </div>

          <div className="w-full max-w-md border border-gray-200 p-3 rounded-md bg-gray-50">
            <h4 className="font-medium mb-1 text-sm">QR Code Contents:</h4>
            <div className="text-xs font-mono overflow-auto p-2 bg-white border rounded">
              {JSON.stringify(JSON.parse(getQRData()), null, 2)}
            </div>
          </div>

          <div className="w-full max-w-md">
            <div className="bg-fuel-green-50 p-4 rounded-md">
              <h3 className="font-medium mb-2">Instructions:</h3>
              <ol className="list-decimal pl-5 space-y-1 text-sm">
                <li>Show this QR code to the station attendant</li>
                <li>They will scan it and enter the fuel details</li>
                <li>You'll receive a payment confirmation request</li>
                <li>Review and approve the payment</li>
              </ol>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QRWallet;