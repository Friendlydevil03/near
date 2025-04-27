import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useStationStore } from "@/store/stationStore";
import { QrCode, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ManualEntry = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setScannedQrData } = useStationStore();
  const [activeTab, setActiveTab] = useState("form");

  // Use the correct name without any trailing text
  const userName = "Friendlydevil03";

  // Full JSON template
  const [qrData, setQrData] = useState(JSON.stringify({
    userId: "user-001",
    walletId: "wallet-001",
    name: userName,
    vehicle: {
      id: "vehicle-001",
      licensePlate: "ABC123",
      fuelType: "Regular"
    },
    timestamp: new Date().toISOString()
  }, null, 2));

  // Simple form fields (easier for manual entry)
  const [simpleForm, setSimpleForm] = useState({
    userId: "user-001",
    walletId: "wallet-001",
    name: userName,
    vehicleId: "vehicle-001",
    licensePlate: "ABC123",
    fuelType: "Regular"
  });

  const handleJSONSubmit = () => {
    try {
      const parsedData = JSON.parse(qrData);

      // Validate required fields
      if (!parsedData.userId || !parsedData.walletId) {
        throw new Error("Missing required fields: userId and walletId");
      }

      setScannedQrData(parsedData);

      toast({
        title: "QR Data Processed",
        description: `Customer ${parsedData.name || 'Unknown'} identified`,
      });

      // Navigate to fuel selection
      navigate(`/scanner/select-fuel/${parsedData.userId}`);
    } catch (error) {
      toast({
        title: "Invalid QR Data",
        description: `Error: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleSimpleFormSubmit = () => {
    try {
      // Construct data from simple form
      const data = {
        userId: simpleForm.userId,
        walletId: simpleForm.walletId,
        name: simpleForm.name,
        vehicle: {
          id: simpleForm.vehicleId,
          licensePlate: simpleForm.licensePlate,
          fuelType: simpleForm.fuelType
        },
        timestamp: new Date().toISOString()
      };

      setScannedQrData(data);

      toast({
        title: "Customer Data Processed",
        description: `Customer ${simpleForm.name || 'Unknown'} identified`,
      });

      // Navigate to fuel selection
      navigate(`/scanner/select-fuel/${simpleForm.userId}`);
    } catch (error) {
      toast({
        title: "Invalid Form Data",
        description: `Error: ${error.message}`,
        variant: "destructive",
      });
    }
  };

  const handleFormChange = (field, value) => {
    setSimpleForm({
      ...simpleForm,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/scanner')}
          className="flex items-center mr-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        <h2 className="text-2xl font-bold text-fuel-blue-700">Manual QR Entry</h2>
      </div>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="form" className={activeTab === "form" ? "bg-fuel-blue-500 text-white" : ""}>
            Simple Form
          </TabsTrigger>
          <TabsTrigger value="json" className={activeTab === "json" ? "bg-fuel-blue-500 text-white" : ""}>
            JSON Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="form" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enter Customer Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Customer ID</label>
                  <input
                    type="text"
                    value={simpleForm.userId}
                    onChange={(e) => handleFormChange('userId', e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Wallet ID</label>
                  <input
                    type="text"
                    value={simpleForm.walletId}
                    onChange={(e) => handleFormChange('walletId', e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Customer Name</label>
                  <input
                    type="text"
                    value={simpleForm.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Vehicle ID</label>
                  <input
                    type="text"
                    value={simpleForm.vehicleId}
                    onChange={(e) => handleFormChange('vehicleId', e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">License Plate</label>
                  <input
                    type="text"
                    value={simpleForm.licensePlate}
                    onChange={(e) => handleFormChange('licensePlate', e.target.value)}
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Fuel Type</label>
                  <select
                    value={simpleForm.fuelType}
                    onChange={(e) => handleFormChange('fuelType', e.target.value)}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="Regular">Regular</option>
                    <option value="Premium">Premium</option>
                    <option value="Diesel">Diesel</option>
                    <option value="Electric">Electric</option>
                  </select>
                </div>
              </div>

              <Button
                onClick={handleSimpleFormSubmit}
                className="w-full bg-fuel-blue-600 hover:bg-fuel-blue-700"
              >
                <QrCode className="mr-2 h-4 w-4" />
                Process Customer Data
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="json" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Enter QR Code JSON Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-gray-500">
                Enter or paste the JSON data from the customer's QR code:
              </p>

              <Textarea
                value={qrData}
                onChange={(e) => setQrData(e.target.value)}
                className="font-mono h-80"
                placeholder={`{
  "userId": "user-001",
  "walletId": "wallet-001",
  "name": "Friendlydevil03",
  "vehicle": {
    "id": "vehicle-001",
    "licensePlate": "ABC123",
    "fuelType": "Regular"
  }
}`}
              />

              <Button
                onClick={handleJSONSubmit}
                className="w-full bg-fuel-blue-600 hover:bg-fuel-blue-700"
              >
                <QrCode className="mr-2 h-4 w-4" />
                Process JSON Data
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManualEntry;