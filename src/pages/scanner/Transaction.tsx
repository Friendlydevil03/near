
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { useStationStore } from "@/store/stationStore";
import { ArrowLeft } from "lucide-react";

const Transaction = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { scannedQrData, currentStation, processTransaction, isLoading } = useStationStore();
  
  const [transaction, setTransaction] = useState({
    fuelType: scannedQrData?.fuelType || currentStation?.fuelTypes[0] || "",
    liters: "",
    pricePerLiter: "3.50",
    amount: "",
  });
  
  // Use useEffect for navigation instead of direct rendering navigation
  useEffect(() => {
    if (!scannedQrData) {
      navigate("/scanner");
    }
  }, [scannedQrData, navigate]);
  
  // If data is not available yet, render nothing
  if (!scannedQrData || !currentStation) {
    return null;
  }
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Only allow numbers and decimals
    if (!/^\d*\.?\d*$/.test(value) && value !== "") return;
    
    let updatedTransaction = {
      ...transaction,
      [name]: value,
    };
    
    // Auto-calculate based on what was changed
    if (name === "liters") {
      const liters = parseFloat(value) || 0;
      const pricePerLiter = parseFloat(transaction.pricePerLiter) || 0;
      updatedTransaction.amount = (liters * pricePerLiter).toFixed(2);
    } else if (name === "amount") {
      const amount = parseFloat(value) || 0;
      const pricePerLiter = parseFloat(transaction.pricePerLiter) || 0;
      if (pricePerLiter > 0) {
        updatedTransaction.liters = (amount / pricePerLiter).toFixed(2);
      }
    } else if (name === "pricePerLiter") {
      const pricePerLiter = parseFloat(value) || 0;
      // Update amount if liters is already entered
      if (transaction.liters) {
        const liters = parseFloat(transaction.liters) || 0;
        updatedTransaction.amount = (liters * pricePerLiter).toFixed(2);
      }
      // Or update liters if amount is already entered
      else if (transaction.amount) {
        const amount = parseFloat(transaction.amount) || 0;
        if (pricePerLiter > 0) {
          updatedTransaction.liters = (amount / pricePerLiter).toFixed(2);
        }
      }
    }
    
    setTransaction(updatedTransaction);
  };
  
  const handleSelectChange = (value: string) => {
    setTransaction({
      ...transaction,
      fuelType: value,
    });
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(transaction.amount);
    const liters = parseFloat(transaction.liters);
    
    if (!amount || amount <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }
    
    if (!liters || liters <= 0) {
      toast({
        title: "Invalid quantity",
        description: "Please enter a valid fuel quantity",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await processTransaction(amount, transaction.fuelType, liters);
      navigate("/scanner/success");
    } catch (error: any) {
      toast({
        title: "Transaction Failed",
        description: error.message || "Failed to process payment",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/scanner")}
          className="mr-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Back
        </Button>
        <h2 className="text-2xl font-bold text-fuel-blue-700">Process Payment</h2>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Transaction Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Fuel Type */}
              <div className="space-y-2">
                <label className="block text-sm font-medium">Fuel Type</label>
                <Select
                  value={transaction.fuelType}
                  onValueChange={handleSelectChange}
                  disabled={!!scannedQrData?.fuelType}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {currentStation?.fuelTypes.map((type) => (
                      <SelectItem
                        key={type}
                        value={type}
                        disabled={scannedQrData?.fuelType && scannedQrData.fuelType !== type}
                      >
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {scannedQrData?.fuelType && (
                  <p className="text-xs text-fuel-green-600">
                    Customer has preset this fuel type
                  </p>
                )}
              </div>
              
              {/* Price per Liter */}
              <div className="space-y-2">
                <label htmlFor="pricePerLiter" className="block text-sm font-medium">
                  Price per Liter ($)
                </label>
                <Input
                  id="pricePerLiter"
                  name="pricePerLiter"
                  value={transaction.pricePerLiter}
                  onChange={handleInputChange}
                />
              </div>
              
              {/* Liters */}
              <div className="space-y-2">
                <label htmlFor="liters" className="block text-sm font-medium">
                  Quantity (liters)
                </label>
                <Input
                  id="liters"
                  name="liters"
                  value={transaction.liters}
                  onChange={handleInputChange}
                />
              </div>
              
              {/* Amount */}
              <div className="space-y-2">
                <label htmlFor="amount" className="block text-sm font-medium">
                  Total Amount ($)
                </label>
                <Input
                  id="amount"
                  name="amount"
                  value={transaction.amount}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            
            {scannedQrData?.maxAmount && (
              <div className="bg-amber-50 border border-amber-200 p-3 rounded">
                <p className="text-amber-800 text-sm">
                  Maximum transaction limit: ${scannedQrData.maxAmount.toFixed(2)}
                </p>
              </div>
            )}
            
            <div className="pt-4">
              <Button
                type="submit"
                className="w-full bg-fuel-blue-500 hover:bg-fuel-blue-600"
                disabled={isLoading}
              >
                {isLoading ? "Processing..." : "Process Payment"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Transaction;
