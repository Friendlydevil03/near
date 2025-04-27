
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useUserStore } from "@/store/userStore";
import { Transaction } from "@/types";
import { Fuel, CreditCard } from "lucide-react";

const Transactions = () => {
  const { transactions } = useUserStore();
  const [filter, setFilter] = useState<string>("all");
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>(transactions);

  // Apply filters whenever the filter changes
  useEffect(() => {
    if (filter === "all") {
      setFilteredTransactions(transactions);
    } else if (filter === "topup") {
      setFilteredTransactions(transactions.filter(tx => tx.paymentType === "topup"));
    } else if (filter === "payment") {
      setFilteredTransactions(transactions.filter(tx => tx.paymentType === "wallet"));
    }
  }, [filter, transactions]);

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center">
          <CardTitle>Transaction History</CardTitle>
          <div className="mt-2 sm:mt-0 w-full sm:w-auto">
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Transactions</SelectItem>
                <SelectItem value="topup">Top-ups</SelectItem>
                <SelectItem value="payment">Payments</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredTransactions.length > 0 ? (
            <div className="divide-y">
              {filteredTransactions.map((tx) => (
                <div key={tx.id} className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center">
                      {tx.paymentType === "wallet" ? (
                        <div className="bg-fuel-blue-100 p-2 rounded-full mr-3">
                          <Fuel className="h-5 w-5 text-fuel-blue-500" />
                        </div>
                      ) : (
                        <div className="bg-fuel-green-100 p-2 rounded-full mr-3">
                          <CreditCard className="h-5 w-5 text-fuel-green-500" />
                        </div>
                      )}
                      <div>
                        <h3 className="font-medium">
                          {tx.paymentType === "wallet"
                            ? `${tx.stationName}`
                            : "Top Up"}
                        </h3>
                        <p className="text-sm text-gray-500">{formatDate(tx.timestamp)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`font-semibold ${
                          tx.paymentType === "topup"
                            ? "text-fuel-green-500"
                            : "text-fuel-blue-500"
                        }`}
                      >
                        {tx.paymentType === "topup" ? "+" : "-"}$
                        {tx.amount.toFixed(2)}
                      </p>
                      {tx.paymentType === "wallet" && (
                        <p className="text-sm text-gray-500">
                          {tx.liters.toFixed(2)} L {tx.fuelType}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {tx.paymentType === "wallet" && (
                    <div className="mt-2 bg-gray-50 p-3 rounded-md">
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-gray-500">Station:</span>{" "}
                          <span className="font-medium">{tx.stationName}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Fuel:</span>{" "}
                          <span className="font-medium">{tx.fuelType}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Amount:</span>{" "}
                          <span className="font-medium">${tx.amount.toFixed(2)}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Quantity:</span>{" "}
                          <span className="font-medium">{tx.liters.toFixed(2)} L</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center">
              <p className="text-gray-500">No transactions found.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Transactions;
