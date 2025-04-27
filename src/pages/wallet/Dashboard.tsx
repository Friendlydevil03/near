import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, CreditCard, Clock, DollarSign, User } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { useTransactionStore } from "@/store/transactionStore";
import { useNavigate } from "react-router-dom";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

interface DashboardProps {
  currentDateTime: string;
}

const Dashboard = ({ currentDateTime }: DashboardProps) => {
  const { currentUser, updateBalance } = useUserStore();
  const { transactionHistory, fetchTransactionHistory } = useTransactionStore();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [topUpAmount, setTopUpAmount] = useState("");
  const [isTopUpDialogOpen, setIsTopUpDialogOpen] = useState(false);
  const [isProcessingTopUp, setIsProcessingTopUp] = useState(false);

  // Fetch transaction history when component mounts
  useEffect(() => {
    if (currentUser) {
      fetchTransactionHistory(currentUser.id);
    }
  }, [currentUser, fetchTransactionHistory]);

  const handleTopUp = () => {
    setIsTopUpDialogOpen(true);
  };

  const processTopUp = () => {
    const amount = parseFloat(topUpAmount);

    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessingTopUp(true);

    // Simulate processing delay
    setTimeout(() => {
      // Add to user's balance
      updateBalance((currentUser?.balance || 0) + amount);

      setIsProcessingTopUp(false);
      setIsTopUpDialogOpen(false);
      setTopUpAmount("");

      toast({
        title: "Top Up Successful",
        description: `$${amount.toFixed(2)} has been added to your balance.`,
      });
    }, 1500);
  };

  const handleShowQR = () => {
    navigate("/wallet/payment");
  };

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <Card className="border-fuel-green-200">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-fuel-green-700">Your Balance</CardTitle>
              <CardDescription>Available for fuel payments</CardDescription>
            </div>
            <div className="flex items-center gap-4">
              {/* User info display */}
              <div className="text-sm text-gray-600 flex items-center">
                <User className="h-4 w-4 mr-1" />
                <span>{currentUser?.name || "Customer"}</span>
              </div>

              {/* Current Date and Time display */}
              <div className="text-sm text-gray-500 flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{currentDateTime}</span>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-3xl font-bold">${currentUser?.balance?.toFixed(2) || "500.00"}</p>
            </div>
            <div className="space-x-2">
              <Button
                onClick={handleTopUp}
                className="bg-fuel-green-500 hover:bg-fuel-green-600"
              >
                <Plus className="h-5 w-5 mr-1" />
                Top Up
              </Button>
              <Button
                onClick={handleShowQR}
                variant="outline"
                className="border-fuel-green-500 text-fuel-green-500"
              >
                <CreditCard className="h-5 w-5 mr-1" />
                Pay
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {transactionHistory && transactionHistory.length > 0 ? (
              <div className="divide-y">
                {transactionHistory.map((tx) => (
                  <div key={tx.id} className="py-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium">{tx.station_name}</h4>
                        <p className="text-sm text-gray-500">
                          {new Date(tx.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-fuel-green-700">
                          -${tx.amount.toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500">
                          {tx.liters.toFixed(2)} L of {tx.fuel_type}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-4">
                No transactions yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Top Up Dialog */}
      <Dialog open={isTopUpDialogOpen} onOpenChange={setIsTopUpDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Top Up Wallet</DialogTitle>
            <DialogDescription>
              Enter the amount you want to add to your wallet.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Amount</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    className="pl-10"
                    min="0"
                    step="0.01"
                    disabled={isProcessingTopUp}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsTopUpDialogOpen(false)}
              disabled={isProcessingTopUp}
            >
              Cancel
            </Button>
            <Button
              onClick={processTopUp}
              className="bg-fuel-green-500 hover:bg-fuel-green-600"
              disabled={isProcessingTopUp}
            >
              {isProcessingTopUp ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing
                </>
              ) : "Confirm"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;