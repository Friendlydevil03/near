import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation, Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Wallet, CreditCard, BarChart3, Clock, User, BellRing, Settings as SettingsIcon } from "lucide-react";
import { useUserStore, hasRole } from "@/store/userStore";
import { useTransactionStore } from "@/store/transactionStore";
import Dashboard from "@/pages/wallet/Dashboard";
import QRWallet from "@/pages/wallet/QRWallet";
import TransactionConfirmation from "@/pages/wallet/TransactionConfirmation";
import Receipt from "@/pages/wallet/Receipt";
import WalletLogin from "@/pages/wallet/WalletLogin";
import Settings from "@/pages/wallet/Settings";

const WalletApp = () => {
  const { currentUser, logout } = useUserStore();
  const {
    pendingTransactions,
    fetchPendingTransactions,
    setupTransactionListener
  } = useTransactionStore();
  const [currentDateTime, setCurrentDateTime] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Format current date and time in UTC as YYYY-MM-DD HH:MM:SS
  const updateDateTime = () => {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, '0');
    const day = String(now.getUTCDate()).padStart(2, '0');
    const hours = String(now.getUTCHours()).padStart(2, '0');
    const minutes = String(now.getUTCMinutes()).padStart(2, '0');
    const seconds = String(now.getUTCSeconds()).padStart(2, '0');

    setCurrentDateTime(`${year}-${month}-${day} ${hours}:${minutes}:${seconds}`);
  };

  // Update date time every second
  useEffect(() => {
    updateDateTime();
    const interval = setInterval(updateDateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // If not in the wallet/* path but directly at /wallet, auto-redirect to wallet dashboard
  useEffect(() => {
    if (location.pathname === '/wallet') {
      navigate('/wallet/dashboard');
    }
  }, [location.pathname, navigate]);

  // Check if the user role is customer, redirect if not
  useEffect(() => {
    if (currentUser && !hasRole(currentUser, 'customer')) {
      toast({
        title: "Access Denied",
        description: "Only customers can access the wallet app.",
        variant: "destructive",
      });
      navigate('/scanner');
    }
  }, [currentUser, navigate, toast]);

  // Fetch pending transactions and set up real-time listener
  useEffect(() => {
    if (currentUser) {
      // Initial fetch of pending transactions
      fetchPendingTransactions(currentUser.id);

      // Set up real-time listener for new transactions
      const cleanup = setupTransactionListener(currentUser.id);

      return cleanup;
    }
  }, [currentUser, fetchPendingTransactions, setupTransactionListener]);

  // Show notification for pending transactions
  useEffect(() => {
    if (pendingTransactions.length > 0) {
      const latestTransaction = pendingTransactions[0];

      // Show notification toast for new transaction
      toast({
        title: "New Payment Request",
        description: `${latestTransaction.station_name} requests $${latestTransaction.amount.toFixed(2)}`,
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/wallet/confirm/${latestTransaction.id}`)}
          >
            View
          </Button>
        ),
      });
    }
  }, [pendingTransactions, toast, navigate]);

  if (!currentUser) {
    return <WalletLogin currentDateTime={currentDateTime} />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-fuel-green-700">Wallet App</h1>

        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Balance: </span>
            <span className="text-fuel-green-600 font-bold">${currentUser.balance?.toFixed(2) || '500.00'}</span>
          </div>

          {/* Notifications indicator */}
          {pendingTransactions.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="relative"
              onClick={() => navigate(`/wallet/confirm/${pendingTransactions[0].id}`)}
            >
              <BellRing className="h-4 w-4" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {pendingTransactions.length}
              </span>
            </Button>
          )}

          {/* Settings Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/wallet/settings')}
          >
            <SettingsIcon className="h-4 w-4" />
          </Button>

          {/* User display with correct format */}
          <div className="text-sm text-gray-600 flex items-center">
            <User className="h-4 w-4 mr-1" />
            <span className="text-fuel-green-600">
              {currentUser?.name || "Customer"}
            </span>
          </div>

          {/* Date and time display with correct format */}
          <div className="text-sm text-gray-600 flex items-center">
            <Clock className="h-4 w-4 mr-1" />
            <span>{currentDateTime}</span>
          </div>
        </div>
      </div>

      {/* Only show the tabs if not on settings page */}
      {!location.pathname.includes('/wallet/settings') && (
        <Tabs defaultValue="dashboard" value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-2">
            <TabsTrigger value="dashboard" onClick={() => navigate('/wallet/dashboard')}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="payment" onClick={() => navigate('/wallet/payment')}>
              <CreditCard className="h-4 w-4 mr-2" />
              Payment
            </TabsTrigger>
          </TabsList>

          <Routes>
            <Route path="/dashboard" element={
              <TabsContent value="dashboard" className="space-y-4">
                <Dashboard
                  currentDateTime={currentDateTime}
                />
              </TabsContent>
            } />
            <Route path="/payment" element={
              <TabsContent value="payment" className="space-y-4">
                <QRWallet
                  currentDateTime={currentDateTime}
                />
              </TabsContent>
            } />
            <Route path="/confirm/:transactionId" element={
              <TransactionConfirmation
                currentDateTime={currentDateTime}
              />
            } />
            <Route path="/receipt/:receiptId" element={
              <Receipt
                currentDateTime={currentDateTime}
              />
            } />
            <Route path="/settings" element={
              <Settings
                currentDateTime={currentDateTime}
              />
            } />
          </Routes>
        </Tabs>
      )}

      {/* Show settings page directly if on settings path */}
      {location.pathname.includes('/wallet/settings') && (
        <Settings currentDateTime={currentDateTime} />
      )}
    </div>
  );
};

export default WalletApp;