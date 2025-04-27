import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useUserStore } from '@/store/userStore';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import Login from '@/pages/Login';
import SelectFuel from '@/pages/scanner/SelectFuel';
import ScanQR from '@/pages/scanner/ScanQR';
import ProcessingPage from '@/pages/scanner/Processing';
import SuccessPage from '@/pages/scanner/SuccessPage';
import WalletApp from '@/pages/wallet/WalletApp';
import Navigation from '@/components/Navigation';
import { hasRole, UserRole } from "@/store/userStore";
import ManualEntry from "@/pages/scanner/ManualEntry.tsx";
// Import other components

// Protected route component
const ProtectedRoute = ({
  children,
  allowedRoles
}: {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}) => {
  const { currentUser, isLoading } = useUserStore();

  // Show loading indicator while checking auth status
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuel-blue-500"></div>
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (!hasRole(currentUser, allowedRoles)) {
    // Redirect attendants to scanner, customers to wallet
    if (hasRole(currentUser, 'attendant')) {
      return <Navigate to="/scanner" />;
    } else {
      return <Navigate to="/wallet" />;
    }
  }

  return <>{children}</>;
};

const AppLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navigation />
      <main className="flex-1 container mx-auto py-6 px-4">
        {children}
      </main>
    </div>
  );
};

const App = () => {
  const { checkSession, isLoading } = useUserStore();

  useEffect(() => {
    // Check if user is already logged in when app loads
    checkSession().catch(error => {
      console.error("Session check failed:", error);
    });
  }, [checkSession]);

  if (isLoading && window.location.pathname !== '/login') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-fuel-blue-500"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login/>}/>

        {/* Scanner Routes - Only for Attendants and Admins */}
        <Route path="/scanner" element={
          <ProtectedRoute allowedRoles={['admin', 'attendant']}>
            <AppLayout>
              <ScanQR/>
            </AppLayout>
          </ProtectedRoute>
        }/>
        <Route path="/scanner/select-fuel/:userId" element={
          <ProtectedRoute allowedRoles={['admin', 'attendant']}>
            <AppLayout>
              <SelectFuel/>
            </AppLayout>
          </ProtectedRoute>
        }/>

        {/* ... other scanner routes with the same protection */}
        <Route path="/scanner/manual-entry" element={<ManualEntry />} />
        {/* Wallet Routes - Only for Customers */}
        <Route path="/wallet/*" element={
          <ProtectedRoute allowedRoles={['customer']}>
            <AppLayout>
              <WalletApp/>
            </AppLayout>
          </ProtectedRoute>
        }/>



        {/* Default route */}
        <Route path="/" element={
          <Navigate to={
            hasRole(useUserStore.getState().currentUser, 'customer')
              ? "/wallet"
              : "/scanner"
          }/>
        }/>
      </Routes>

      <Toaster/>
    </BrowserRouter>
  );
};

export default App;