
export interface User {
  id: string;
  name: string;
  email: string;
  balance: number;
}

export interface Vehicle {
  id: string;
  userId: string;
  type: string;
  make: string;
  model: string;
  year: string;
  licensePlate: string;
  fuelType: string;
}

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  timestamp: string;
  stationId: string;
  stationName: string;
  fuelType: string;
  liters: number;
  vehicleId?: string;
  status: "pending" | "completed" | "failed";
  paymentType: "wallet" | "topup";
}

export interface FuelStation {
  id: string;
  name: string;
  location: string;
  fuelTypes: string[];
}

export interface QRData {
  userId: string;
  walletId: string;
  vehicleId?: string;
  fuelType?: string;
  maxAmount?: number;
}
