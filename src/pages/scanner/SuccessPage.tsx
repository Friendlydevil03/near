import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Printer } from "lucide-react";
import { supabase, Transaction } from "@/lib/supabase";
import { useStationStore } from "@/store/stationStore";

const SuccessPage = () => {
  const { transactionId } = useParams();
  const navigate = useNavigate();
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setCurrentTransaction } = useStationStore();

  useEffect(() => {
    if (!transactionId) return;

    const fetchTransaction = async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('id', transactionId)
        .eq('status', 'confirmed')
        .single();

      if (error) {
        console.error('Error fetching transaction:', error);
        navigate('/scanner');
        return;
      }

      if (data) {
        setTransaction(data as Transaction);
        setCurrentTransaction(data as any);
      }

      setIsLoading(false);
    };

    fetchTransaction();
  }, [transactionId, navigate, setCurrentTransaction]);

  const completeTransaction = async () => {
    if (!transaction) return;

    // Mark transaction as completed in database
    await supabase
      .from('transactions')
      .update({ status: 'completed' })
      .eq('id', transaction.id);

    // Navigate back to scanner
    navigate("/scanner");
  };

  if (isLoading || !transaction) {
    return <div>Loading transaction details...</div>;
  }

  return (
    <div className="flex items-center justify-center py-6">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <div className="bg-fuel-blue-100 p-4 rounded-full">
              <Check className="h-8 w-8 text-fuel-blue-500" />
            </div>
          </div>
          <CardTitle className="text-2xl text-fuel-blue-700">
            Payment Successful
          </CardTitle>
          <p className="text-gray-500 mt-2">
            Transaction completed on {new Date(transaction.created_at).toLocaleString()}
          </p>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-fuel-blue-50 p-4 rounded-lg text-center">
            <p className="text-3xl font-bold text-fuel-blue-700">
              ${transaction.amount.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {transaction.liters.toFixed(2)} Liters of {transaction.fuel_type}
            </p>
          </div>

          <div>
            <h3 className="font-medium mb-3">Receipt Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Customer:</span>
                <span className="font-medium">{transaction.user_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Transaction ID:</span>
                <span className="font-medium">{transaction.id.slice(0, 8)}...</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Date:</span>
                <span className="font-medium">
                  {new Date(transaction.created_at).toLocaleString()}
                </span>
              </div>
              {transaction.vehicle_plate && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Vehicle:</span>
                  <span className="font-medium">{transaction.vehicle_plate}</span>
                </div>
              )}
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
              onClick={completeTransaction}
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

export default SuccessPage;