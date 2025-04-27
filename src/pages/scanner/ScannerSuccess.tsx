
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Printer } from "lucide-react";
import { useStationStore } from "@/store/stationStore";

const ScannerSuccess = () => {
  const navigate = useNavigate();
  const { currentTransaction, scannedQrData } = useStationStore();
  
  useEffect(() => {
    if (!currentTransaction) {
      navigate("/scanner");
    }
  }, [currentTransaction, navigate]);
  
  if (!currentTransaction || !scannedQrData) {
    return null;
  }
  
  return (
    <div className="flex items-center justify-center py-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="bg-fuel-blue-100 p-4 rounded-full">
              <Check className="h-12 w-12 text-fuel-blue-500" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-fuel-blue-700">
            Payment Successful
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-white border rounded-lg p-4 mb-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Amount:</span>
                <span className="font-medium">${currentTransaction.amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Fuel:</span>
                <span className="font-medium">{currentTransaction.fuelType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Quantity:</span>
                <span className="font-medium">{currentTransaction.liters.toFixed(2)} L</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-medium">{currentTransaction.id.slice(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">
                  {new Date(currentTransaction.timestamp).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button
              variant="outline"
              onClick={() => window.print()}
              className="flex items-center justify-center"
            >
              <Printer className="h-4 w-4 mr-2" />
              Print Receipt
            </Button>
            <Button
              onClick={() => navigate("/scanner")}
              className="bg-fuel-blue-500 hover:bg-fuel-blue-600"
            >
              New Transaction
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScannerSuccess;
