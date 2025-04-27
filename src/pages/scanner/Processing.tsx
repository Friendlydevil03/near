import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, AlertTriangle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { supabase, subscribeToTransaction } from "@/lib/supabase";

const Processing = () => {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [progress, setProgress] = useState(0);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [transactionStatus, setTransactionStatus] = useState<string | null>(null);

  // Increment progress bar for visual feedback
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress(prev => {
        // Cap at 90% until confirmation
        if (prev >= 90 && !transactionStatus) {
          return 90;
        }
        return Math.min(prev + 5, 100);
      });
    }, 500);

    return () => clearInterval(interval);
  }, [transactionStatus]);

  // Track time elapsed for timeout
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeElapsed(prev => {
        // After 60 seconds, if still no response, cancel transaction
        if (prev >= 60 && !transactionStatus) {
          clearInterval(interval);
          handleTimeout();
          return prev;
        }
        return prev + 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [transactionStatus]);

  // Subscribe to transaction updates
  useEffect(() => {
    if (!transactionId) return;

    // Check initial transaction status
    const checkTransaction = async () => {
      const { data } = await supabase
        .from('transactions')
        .select('status')
        .eq('id', transactionId)
        .single();

      if (data) {
        setTransactionStatus(data.status);

        // If already confirmed/rejected, navigate accordingly
        if (data.status === 'confirmed') {
          navigate(`/scanner/success/${transactionId}`);
        } else if (data.status === 'rejected') {
          toast({
            title: "Transaction Declined",
            description: "Customer declined the payment request",
            variant: "destructive",
          });
          navigate("/scanner");
        }
      }
    };

    checkTransaction();

    // Subscribe to changes
    const subscription = subscribeToTransaction(transactionId, (transaction) => {
      setTransactionStatus(transaction.status);

      if (transaction.status === 'confirmed') {
        setProgress(100);
        toast({
          title: "Payment Confirmed",
          description: "Customer has approved the payment",
        });

        // Navigate to success page after a short delay
        setTimeout(() => {
          navigate(`/scanner/success/${transactionId}`);
        }, 1000);
      } else if (transaction.status === 'rejected') {
        toast({
          title: "Transaction Declined",
          description: "Customer declined the payment request",
          variant: "destructive",
        });
        navigate("/scanner");
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [transactionId, navigate, toast]);

  const handleTimeout = async () => {
    if (!transactionId) return;

    try {
      // Update transaction status to expired
      await supabase
        .from('transactions')
        .update({ status: 'expired' })
        .eq('id', transactionId);

      toast({
        title: "Request Timed Out",
        description: "Customer did not respond in time",
        variant: "destructive",
      });

      navigate("/scanner");
    } catch (error) {
      console.error('Error updating transaction:', error);
    }
  };

  const handleCancel = async () => {
    if (!transactionId) return;

    try {
      // Update transaction status to cancelled
      await supabase
        .from('transactions')
        .update({ status: 'cancelled' })
        .eq('id', transactionId);

      toast({
        title: "Request Cancelled",
        description: "Transaction request has been cancelled",
      });

      navigate("/scanner");
    } catch (error) {
      console.error('Error cancelling transaction:', error);
      toast({
        title: "Error",
        description: "Failed to cancel transaction",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-fuel-blue-700">Processing Payment</h2>

      <Card className="border-fuel-blue-200">
        <CardContent className="p-8 flex flex-col items-center justify-center text-center space-y-4">
          {timeElapsed < 45 ? (
            <Loader2 className="h-12 w-12 text-fuel-blue-500 animate-spin" />
          ) : (
            <AlertTriangle className="h-12 w-12 text-amber-500" />
          )}

          <h3 className="text-xl font-semibold text-fuel-blue-700">
            {timeElapsed < 45
              ? "Waiting for Confirmation"
              : "Taking longer than expected..."}
          </h3>

          <p className="text-gray-500">
            {timeElapsed < 45
              ? "The customer is confirming payment on their device"
              : "The customer might not have seen the request yet"}
          </p>

          <div className="w-full bg-fuel-blue-100 rounded-full h-2.5 mt-2">
            <div
              className="bg-fuel-blue-500 h-2.5 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            ></div>
          </div>

          <p className="text-sm text-gray-500">
            Timeout in: {60 - timeElapsed} seconds
          </p>

          <Button
            variant="outline"
            className="border-red-300 text-red-600 hover:bg-red-50 mt-4"
            onClick={handleCancel}
          >
            Cancel Request
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Processing;