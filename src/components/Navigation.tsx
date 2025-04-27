import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ScanBarcode, Wallet, Clock, User, LogOut } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { currentUser, logout } = useUserStore();
  const [currentDateTime, setCurrentDateTime] = useState("");

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

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-fuel-blue-700">FTS</h1>

            <nav className="ml-8 space-x-2">
              <Button
                asChild
                variant={location.pathname.startsWith('/scanner') ? "default" : "outline"}
                className={location.pathname.startsWith('/scanner') ?
                  "bg-fuel-blue-500 hover:bg-fuel-blue-600" : ""}
              >
                <Link to="/scanner">
                  <ScanBarcode className="h-4 w-4 mr-2" />
                  Scanner
                </Link>
              </Button>

              <Button
                asChild
                variant={location.pathname.startsWith('/wallet') ? "default" : "outline"}
                className={location.pathname.startsWith('/wallet') ?
                  "bg-fuel-green-500 hover:bg-fuel-green-600" : ""}
              >
                <Link to="/wallet">
                  <Wallet className="h-4 w-4 mr-2" />
                  Wallet
                </Link>
              </Button>
            </nav>
          </div>

          <div className="flex items-center space-x-6">
            {/* Current Date Time Display */}
            <div className="text-sm text-gray-600 flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              <span>{currentDateTime}</span>
            </div>

            {/* User Display and Logout */}
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <User className="h-4 w-4 text-gray-600" />
                <span className="font-medium">
                  {currentUser?.role === 'attendant' ? 'Friendlydevil03' : currentUser?.name || 'User'}
                </span>
              </div>

              {/* Logout Button */}
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-red-500 hover:text-red-700 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navigation;