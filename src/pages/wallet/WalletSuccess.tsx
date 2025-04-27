
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

const WalletSuccess = () => {
  const navigate = useNavigate();
  
  // Automatically redirect back to dashboard after 5 seconds
  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/wallet");
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [navigate]);
  
  return (
    <div className="flex items-center justify-center py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="bg-fuel-green-100 p-4 rounded-full">
              <Check className="h-12 w-12 text-fuel-green-500" />
            </div>
          </div>
          <CardTitle className="text-2xl font-bold text-fuel-green-700">
            Transaction Successful
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-500 mb-6">
            Your transaction has been completed successfully
          </p>
          <Button
            onClick={() => navigate("/wallet")}
            className="bg-fuel-green-500 hover:bg-fuel-green-600"
          >
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default WalletSuccess;
