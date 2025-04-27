import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Printer, ArrowLeft, Clock } from "lucide-react";

interface ReceiptProps {
  currentDateTime: string;
}

interface ReceiptDetails {
  id: string;
  stationName: string;
  fuelType: string;
  amount: number;
  liters: number;
  timestamp: string;
  vehiclePlate?: string;
}

const Receipt = ({ currentDateTime }: ReceiptProps) => {
  const { receiptId } = useParams();
  const [receipt, setReceipt] = useState<ReceiptDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // In a real app, fetch from API using receiptId
    // Simulating API call with setTimeout
    setTimeout(() => {
      setReceipt({
        id: receiptId || "tx-" + Date.now(),
        stationName: "FuelTech Station - Downtown",
        fuelType: "Diesel",
        amount: 45.75,
        liters: 25.3,
        timestamp: new Date().toISOString(),
        vehiclePlate: "ABC123"
      });
      setIsLoading(false);
    }, 800);
  }, [receiptId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuel-green-500"></div>
      </div>
    );
  }

  if (!receipt) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Receipt Not Found</CardTitle>
        </CardHeader>
        <CardContent>
          <p>The requested receipt could not be found.</p>
          <Button onClick={() => navigate("/wallet/dashboard")} className="mt-4">
            Back to Wallet
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-fuel-green-700">Payment Receipt</h2>
        <div className="text-sm text-gray-500 flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          {currentDateTime}
        </div>
      </div>

      <Card className="border-fuel-green-200">
        <CardHeader className="text-center pb-0">
          <div className="flex justify-center mb-2">
            <div className="bg-fuel-green-100 p-4 rounded-full">
              <Check className="h-6 w-6 text-fuel-green-600" />
            </div>
          </div>
          <CardTitle className="text-fuel-green-700">Payment Successful</CardTitle>
          <p className="text-sm text-gray-500 mt-1">
            {new Date(receipt.timestamp).toLocaleString()}
          </p>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="bg-fuel-green-50 p-4 rounded-lg text-center">
              <p className="text-3xl font-bold text-fuel-green-700">
                ${receipt.amount.toFixed(2)}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {receipt.liters.toFixed(2)} Liters of {receipt.fuelType}
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Receipt #:</span>
                <span className="font-medium">{receipt.id.slice(0, 12)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Station:</span>
                <span className="font-medium">{receipt.stationName}</span>
              </div>
              {receipt.vehiclePlate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Vehicle:</span>
                  <span className="font-medium">{receipt.vehiclePlate}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600">Time of Transaction:</span>
                <span className="font-medium">
                  {new Date(receipt.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>

            <div className="pt-4 grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                onClick={() => window.print()}
                className="flex items-center justify-center"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </Button>
              <Button
                onClick={() => navigate("/wallet/dashboard")}
                className="bg-fuel-green-500 hover:bg-fuel-green-600"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Done
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Receipt;