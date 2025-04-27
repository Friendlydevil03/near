import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserStore } from "@/store/userStore";
import { Car, User, Droplet, Plus, Trash, ArrowLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";

interface SettingsProps {
  currentDateTime: string;
}

// Available fuel types
const FUEL_TYPES = ["Regular", "Premium", "Diesel", "Electric"];

// Helper functions for localStorage
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

const saveVehiclesToStorage = (vehicles) => {
  localStorage.setItem('user-vehicles', JSON.stringify(vehicles));
  // Dispatch a custom event to notify other components about the change
  window.dispatchEvent(new Event('vehicles-updated'));
};

const Settings = ({ currentDateTime }: SettingsProps) => {
  const { currentUser, updateUserProfile } = useUserStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const userNameValue = currentUser?.name || "";
  const cleanedName = typeof userNameValue === 'string' ?
    userNameValue.replace(/import.*$/, '') : // Remove "import..." if present
    "";

  // State for user profile
  const [username, setUsername] = useState(currentUser?.name || "");

  // State for vehicles - load from localStorage
  const [vehicles, setVehicles] = useState(getVehiclesFromStorage());

  // State for new vehicle form
  const [newVehicle, setNewVehicle] = useState({
    make: "",
    model: "",
    licensePlate: "",
    fuelType: "Regular"
  });

  // State for showing add vehicle form
  const [showAddForm, setShowAddForm] = useState(false);

  // Handle save profile
  const handleSaveProfile = () => {
      const trimmedUsername = username.trim();
    // Update the user profile
    updateUserProfile({ name: username });

    toast({
      title: "Profile Updated",
      description: "Your profile has been saved successfully",
    });
  };

  // Handle add vehicle
  const handleAddVehicle = () => {
    if (!newVehicle.make || !newVehicle.model || !newVehicle.licensePlate) {
      toast({
        title: "Missing Information",
        description: "Please fill in all vehicle fields",
        variant: "destructive",
      });
      return;
    }

    const vehicle = {
      id: `vehicle-${Date.now()}`,
      ...newVehicle
    };

    const updatedVehicles = [...vehicles, vehicle];
    setVehicles(updatedVehicles);
    saveVehiclesToStorage(updatedVehicles);

    setNewVehicle({
      make: "",
      model: "",
      licensePlate: "",
      fuelType: "Regular"
    });
    setShowAddForm(false);

    toast({
      title: "Vehicle Added",
      description: `${vehicle.make} ${vehicle.model} has been added to your vehicles`,
    });
  };

  // Handle delete vehicle
  const handleDeleteVehicle = (id: string) => {
    const updatedVehicles = vehicles.filter(vehicle => vehicle.id !== id);
    setVehicles(updatedVehicles);
    saveVehiclesToStorage(updatedVehicles);

    // If the deleted vehicle was the active vehicle, update active vehicle
    const activeVehicleId = localStorage.getItem('active-vehicle-id');
    if (activeVehicleId === id) {
      localStorage.setItem('active-vehicle-id', updatedVehicles[0]?.id || '');
    }

    toast({
      title: "Vehicle Removed",
      description: "The vehicle has been removed from your account",
    });
  };

  // Synchronize vehicles with localStorage if changed elsewhere
  useEffect(() => {
    const handleStorageChange = () => {
      setVehicles(getVehiclesFromStorage());
    };

    window.addEventListener('vehicles-updated', handleStorageChange);
    return () => window.removeEventListener('vehicles-updated', handleStorageChange);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/wallet/dashboard')}
          className="flex items-center"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
      </div>

      <Card className="border-fuel-green-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2 text-fuel-green-500" />
            Profile Settings
          </CardTitle>
          <CardDescription>
            Update your profile information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="space-y-2">
              <Label htmlFor="username">Display Name</Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your name"
              />
            </div>

            <Button
              onClick={handleSaveProfile}
              className="bg-fuel-green-500 hover:bg-fuel-green-600 w-full"
            >
              Save Profile
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-fuel-green-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Car className="h-5 w-5 mr-2 text-fuel-green-500" />
            Manage Vehicles
          </CardTitle>
          <CardDescription>
            Add or remove vehicles for your wallet
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Vehicle List */}
          <div className="space-y-3">
            {vehicles.length > 0 ? (
              vehicles.map((vehicle) => (
                <div
                  key={vehicle.id}
                  className="flex justify-between items-center p-3 border rounded-md hover:bg-gray-50"
                >
                  <div>
                    <div className="font-medium">{vehicle.make} {vehicle.model}</div>
                    <div className="text-sm text-gray-500">
                      {vehicle.licensePlate} • {vehicle.fuelType} fuel
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteVehicle(vehicle.id)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))
            ) : (
              <div className="text-center p-4 text-gray-500">
                No vehicles added yet. Add your first vehicle below.
              </div>
            )}
          </div>
          
          {/* Add New Vehicle Form */}
          {showAddForm ? (
            <div className="border rounded-md p-4 space-y-4">
              <h3 className="font-medium">Add New Vehicle</h3>
              <div className="grid gap-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="make">Make</Label>
                    <Input
                      id="make"
                      placeholder="e.g. Toyota"
                      value={newVehicle.make}
                      onChange={(e) => setNewVehicle({...newVehicle, make: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="model">Model</Label>
                    <Input
                      id="model"
                      placeholder="e.g. Camry"
                      value={newVehicle.model}
                      onChange={(e) => setNewVehicle({...newVehicle, model: e.target.value})}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label htmlFor="licensePlate">License Plate</Label>
                    <Input
                      id="licensePlate"
                      placeholder="e.g. ABC123"
                      value={newVehicle.licensePlate}
                      onChange={(e) => setNewVehicle({...newVehicle, licensePlate: e.target.value})}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="fuelType">Fuel Type</Label>
                    <Select 
                      value={newVehicle.fuelType}
                      onValueChange={(value) => setNewVehicle({...newVehicle, fuelType: value})}
                    >
                      <SelectTrigger id="fuelType">
                        <SelectValue placeholder="Select fuel type" />
                      </SelectTrigger>
                      <SelectContent>
                        {FUEL_TYPES.map(fuel => (
                          <SelectItem key={fuel} value={fuel}>
                            {fuel}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 mt-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowAddForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-fuel-green-500 hover:bg-fuel-green-600"
                    onClick={handleAddVehicle}
                  >
                    Save Vehicle
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <Button
              variant="outline"
              className="border-dashed border-2 border-fuel-green-200 w-full"
              onClick={() => setShowAddForm(true)}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add New Vehicle
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;