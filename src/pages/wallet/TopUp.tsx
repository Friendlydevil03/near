
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { useUserStore } from "@/store/userStore";
import { CreditCard } from "lucide-react";

const TopUp = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { topUpBalance, isLoading } = useUserStore();
  
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  
  const presetAmounts = [10, 25, 50, 100];
  
  const handleSelectAmount = (value: number) => {
    setAmount(value.toString());
  };
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers and decimals
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }
    
    try {
      await topUpBalance(parseFloat(amount));
      navigate("/wallet/success");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div>
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Top Up Your Wallet</CardTitle>
          <CardDescription>Add funds to your fuel wallet</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <Label>Select Amount</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {presetAmounts.map((presetAmount) => (
                  <Button
                    key={presetAmount}
                    type="button"
                    variant={amount === presetAmount.toString() ? "default" : "outline"}
                    className={amount === presetAmount.toString() ? "bg-fuel-green-500" : ""}
                    onClick={() => handleSelectAmount(presetAmount)}
                  >
                    ${presetAmount}
                  </Button>
                ))}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="custom-amount">Custom Amount</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                  <Input
                    id="custom-amount"
                    type="text"
                    placeholder="0.00"
                    className="pl-8"
                    value={amount}
                    onChange={handleAmountChange}
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-4">
              <Label>Payment Method</Label>
              <RadioGroup
                defaultValue={paymentMethod}
                value={paymentMethod}
                onValueChange={setPaymentMethod}
                className="grid grid-cols-1 sm:grid-cols-2 gap-2"
              >
                <div>
                  <RadioGroupItem
                    value="card"
                    id="card"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="card"
                    className="flex items-center justify-between rounded-md border-2 border-muted p-4 hover:border-fuel-green-500 peer-data-[state=checked]:border-fuel-green-500 [&:has([data-state=checked])]:border-fuel-green-500"
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-fuel-green-500" />
                      <div>Credit/Debit Card</div>
                    </div>
                  </Label>
                </div>
                
                <div>
                  <RadioGroupItem
                    value="bank"
                    id="bank"
                    className="peer sr-only"
                  />
                  <Label
                    htmlFor="bank"
                    className="flex items-center justify-between rounded-md border-2 border-muted p-4 hover:border-fuel-green-500 peer-data-[state=checked]:border-fuel-green-500 [&:has([data-state=checked])]:border-fuel-green-500"
                  >
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-5 w-5 text-fuel-green-500"
                      >
                        <rect width="20" height="14" x="2" y="5" rx="2" />
                        <path d="M22 10H2" />
                      </svg>
                      <div>Bank Transfer</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="pt-4">
              <Button
                type="submit"
                className="w-full bg-fuel-green-500 hover:bg-fuel-green-600"
                disabled={!amount || parseFloat(amount) <= 0 || isLoading}
              >
                {isLoading ? "Processing..." : `Add $${amount || "0"} to Wallet`}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
      
      <div className="text-center">
        <Button
          variant="ghost"
          onClick={() => navigate('/wallet')}
          className="text-fuel-green-500"
        >
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default TopUp;
