import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, Check, X, Clock } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { useTransactionStore } from "@/store/transactionStore";

interface TransactionConfirmationProps {
  currentDateTime: string;
}

const TransactionConfirmation = ({ currentDateTime }: TransactionConfirmationProps) => {
  const { transactionId } = useParams();
  const [isProcessing, setIsProcessing] = useState(false);
  const { currentUser, updateBalance } = useUserStore();
  const {
    pendingTransactions,
    updateTransactionStatus,
    transactionHistory,
    fetchPendingTransactions
  } = useTransactionStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  // Find the transaction in pending transactions
  const transaction = pendingTransactions.find(tx => tx.id === transactionId);

  // Fetch pending transactions if not already loaded
  useEffect(() => {
    if (!transaction && currentUser && transactionId) {
      fetchPendingTransactions(currentUser.id);
    }
  }, [transaction, currentUser, transactionId, fetchPendingTransactions]);

  const handleConfirm = async () => {
    if (!currentUser || !transaction) return;

    setIsProcessing(true);

    try {
      // Check if user has sufficient balance
      if ((currentUser.balance || 0) < transaction.amount) {
        toast({
          title: "Insufficient Balance",
          description: "Please top up your wallet to complete this transaction",
          variant: "destructive",
        });
        setIsProcessing(false);
        return;
      }

      // Update transaction status to confirmed
      await updateTransactionStatus(transaction.id, 'confirmed');

      // Update user's balance
      updateBalance((currentUser.balance || 0) - transaction.amount);

      toast({
        title: "Payment Successful",
        description: `You have paid $${transaction.amount.toFixed(2)} for fuel`,
      });

      // Navigate to receipt page
      navigate(`/wallet/receipt/${transaction.id}`);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  const handleDecline = async () => {
    if (!transaction) return;

    setIsProcessing(true);

    try {
      // Update transaction status to rejected
      await updateTransactionStatus(transaction.id, 'rejected');

      toast({
        title: "Transaction Declined",
        description: "You have declined this transaction",
        variant: "destructive",
      });

      navigate("/wallet/dashboard");
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to decline payment. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  if (!transaction) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-fuel-green-700">Transaction Details</h2>
          <div className="text-sm text-gray-500 flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            {currentDateTime}
          </div>
        </div>

        <Card className="border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Transaction Not Found</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The requested transaction could not be found or has expired.</p>
            <Button onClick={() => navigate("/wallet/dashboard")} className="mt-4">
              Back to Wallet
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-fuel-green-700">Confirm Payment</h2>
        <div className="text-sm text-gray-500 flex items-center">
          <Clock className="h-4 w-4 mr-1" />
          {currentDateTime}
        </div>
      </div>

      <Card className="border-fuel-green-200">
        <CardHeader>
          <CardTitle className="text-fuel-green-700">Payment Request</CardTitle>
          <CardDescription>
            Review and confirm your fuel payment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="font-medium text-sm text-gray-500">Station</h3>
              <p className="font-semibold">{transaction.station_name}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <h3 className="font-medium text-sm text-gray-500">Fuel Type</h3>
                <p className="font-semibold">{transaction.fuel_type}</p>
              </div>
              <div className="space-y-1">
                <h3 className="font-medium text-sm text-gray-500">Liters</h3>
                <p className="font-semibold">{transaction.liters.toFixed(2)} L</p>
              </div>
            </div>

            <div className="pt-2 border-t">
              <div className="flex justify-between items-center">
                <span className="text-lg font-medium">Total Amount:</span>
                <span className="text-2xl font-bold text-fuel-green-700">
                  ${transaction.amount.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="pt-4 flex flex-col gap-3 sm:flex-row sm:justify-between">
              <Button
                variant="outline"
                className="border-red-300 text-red-600 hover:bg-red-50"
                onClick={handleDecline}
                disabled={isProcessing}
              >
                <X className="mr-2 h-4 w-4" />
                Decline
              </Button>

              <Button
                className="bg-fuel-green-500 hover:bg-fuel-green-600"
                onClick={handleConfirm}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Confirm Payment
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionConfirmation;