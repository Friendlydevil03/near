
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "react-router-dom";
import { Fuel, CreditCard } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-fuel-blue-50 to-fuel-blue-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-fuel-blue-800 mb-3">
            Fuel Flow Payment System
          </h1>
          <p className="text-xl text-fuel-blue-600 max-w-2xl mx-auto">
            A seamless solution for fuel payments. Choose which application you want to use.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Gas Station Scanner Card */}
          <Card className="border-2 border-fuel-blue-200 hover:border-fuel-blue-400 transition-all">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="bg-fuel-blue-100 p-4 rounded-full mb-4">
                <Fuel className="h-12 w-12 text-fuel-blue-500" />
              </div>
              <h2 className="text-2xl font-semibold text-fuel-blue-700 mb-2">Gas Station Scanner</h2>
              <p className="text-gray-500 mb-6">
                For gas station attendants to scan customer QR codes and process payments.
              </p>
              <Link to="/scanner" className="w-full">
                <Button className="w-full bg-fuel-blue-500 hover:bg-fuel-blue-600">
                  Open Scanner App
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Customer Wallet Card */}
          <Card className="border-2 border-fuel-green-200 hover:border-fuel-green-400 transition-all">
            <CardContent className="p-6 flex flex-col items-center text-center">
              <div className="bg-fuel-green-100 p-4 rounded-full mb-4">
                <CreditCard className="h-12 w-12 text-fuel-green-500" />
              </div>
              <h2 className="text-2xl font-semibold text-fuel-green-700 mb-2">Customer Wallet</h2>
              <p className="text-gray-500 mb-6">
                For customers to manage their wallet, top-up balance, and customize preferences.
              </p>
              <Link to="/wallet" className="w-full">
                <Button className="w-full bg-fuel-green-500 hover:bg-fuel-green-600">
                  Open Wallet App
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
