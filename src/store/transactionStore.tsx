import { create } from 'zustand';
import { useUserStore } from './userStore';
import { supabase } from '@/lib/supabase';

export interface Transaction {
  id: string;
  user_id: string;
  wallet_id: string;
  station_id: string;
  station_name: string;
  fuel_type: string;
  amount: number;
  liters: number;
  status: 'pending' | 'confirmed' | 'rejected' | 'completed' | 'cancelled' | 'expired';
  vehicle_id?: string;
  vehicle_plate?: string;
  attendant_id?: string;
  created_at: string;
}

interface TransactionState {
  pendingTransactions: Transaction[];
  currentTransaction: Transaction | null;
  transactionHistory: Transaction[];
  isLoading: boolean;
  error: string | null;

  fetchPendingTransactions: (userId: string) => Promise<void>;
  fetchTransactionHistory: (userId: string) => Promise<void>;
  updateTransactionStatus: (
    transactionId: string,
    status: Transaction['status']
  ) => Promise<void>;
  createTransaction: (
    transactionData: Omit<Transaction, 'id' | 'created_at' | 'status'>
  ) => Promise<string>;
  clearCurrentTransaction: () => void;
  setupTransactionListener: (userId: string) => () => void;
}

// Helper for demo mode
const createDemoTransaction = (data: Partial<Transaction>): Transaction => {
  return {
    id: `tx-${Date.now()}`,
    user_id: data.user_id || 'customer-001',
    wallet_id: data.wallet_id || 'customer-001',
    station_id: data.station_id || 'station-001',
    station_name: data.station_name || 'FuelTech Station - Downtown',
    fuel_type: data.fuel_type || 'Regular',
    amount: data.amount || 45.75,
    liters: data.liters || 25.3,
    status: data.status || 'pending',
    vehicle_id: data.vehicle_id,
    vehicle_plate: data.vehicle_plate,
    attendant_id: data.attendant_id,
    created_at: new Date().toISOString(),
  };
};

export const useTransactionStore = create<TransactionState>((set, get) => ({
  pendingTransactions: [],
  currentTransaction: null,
  transactionHistory: [],
  isLoading: false,
  error: null,

  fetchPendingTransactions: async (userId: string) => {
    set({ isLoading: true, error: null });

    try {
      const { demoMode } = useUserStore.getState();

      if (demoMode) {
        // Simulate API call with demo data
        setTimeout(() => {
          set({
            pendingTransactions: [],
            isLoading: false
          });
        }, 500);
        return;
      }

      // Real Supabase query
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      set({
        pendingTransactions: data as Transaction[],
        isLoading: false
      });
    } catch (error: any) {
      set({
        error: error.message,
        isLoading: false
      });
    }
  },

  fetchTransactionHistory: async (userId: string) => {
    set({ isLoading: true, error: null });

    try {
      const { demoMode } = useUserStore.getState();

      if (demoMode) {
        // Simulate API call with demo data
        setTimeout(() => {
          set({
            transactionHistory: [
              {
                id: 'tx-001',
                user_id: userId,
                wallet_id: userId,
                station_id: 'station-001',
                station_name: 'Main Station',
                fuel_type: 'Regular',
                amount: 45.75,
                liters: 15.25,
                status: 'completed',
                vehicle_plate: 'ABC123',
                created_at: '2025-04-25T10:30:00Z',
              },
              {
                id: 'tx-002',
                user_id: userId,
                wallet_id: userId,
                station_id: 'station-002',
                station_name: 'Downtown Station',
                fuel_type: 'Premium',
                amount: 62.30,
                liters: 18.50,
                status: 'completed',
                vehicle_plate: 'ABC123',
                created_at: '2025-04-22T14:15:00Z',
              },
            ] as Transaction[],
            isLoading: false
          });
        }, 500);
        return;
      }

      // Real Supabase query
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .in('status', ['completed', 'confirmed'])
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;

      set({
        transactionHistory: data as Transaction[],
        isLoading: false
      });
    } catch (error: any) {
      set({
        error: error.message,
        isLoading: false
      });
    }
  },

  updateTransactionStatus: async (transactionId, status) => {
    set({ isLoading: true, error: null });

    try {
      const { demoMode } = useUserStore.getState();

      if (demoMode) {
        // For demo mode, update local state directly
        setTimeout(() => {
          const { pendingTransactions, currentTransaction, transactionHistory } = get();

          // If this is the current transaction being processed
          if (currentTransaction && currentTransaction.id === transactionId) {
            set({
              currentTransaction: {
                ...currentTransaction,
                status
              }
            });
          }

          // Update in pending transactions list
          const updatedPending = pendingTransactions.filter(
            tx => tx.id !== transactionId
          );

          // If confirmed/completed, add to history
          let updatedHistory = [...transactionHistory];
          if (status === 'confirmed' || status === 'completed') {
            const txToUpdate = pendingTransactions.find(tx => tx.id === transactionId) ||
                               currentTransaction;

            if (txToUpdate) {
              updatedHistory = [
                {
                  ...txToUpdate,
                  status
                },
                ...transactionHistory
              ];
            }
          }

          set({
            pendingTransactions: updatedPending,
            transactionHistory: updatedHistory,
            isLoading: false
          });
        }, 500);
        return;
      }

      // Real Supabase update
      const { error } = await supabase
        .from('transactions')
        .update({ status })
        .eq('id', transactionId);

      if (error) throw error;

      // We don't need to update local state as the subscription will handle it
      set({ isLoading: false });
    } catch (error: any) {
      set({
        error: error.message,
        isLoading: false
      });
    }
  },

  createTransaction: async (transactionData) => {
    set({ isLoading: true, error: null });

    try {
      const { demoMode } = useUserStore.getState();

      if (demoMode) {
        // For demo mode, create a transaction locally
        const newTx = createDemoTransaction({
          ...transactionData,
          status: 'pending'
        });

        // For demo mode, add to customer's pending transactions directly
        // This simulates the real-time subscription that would normally handle this
        setTimeout(() => {
          // Check if we're on the customer side
          const { currentUser } = useUserStore.getState();
          if (currentUser?.id === newTx.user_id) {
            set(state => ({
              pendingTransactions: [newTx, ...state.pendingTransactions]
            }));
          }
        }, 1500);

        set({ isLoading: false });
        return newTx.id;
      }

      // Real Supabase insert
      const { data, error } = await supabase
        .from('transactions')
        .insert({
          ...transactionData,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;

      set({ isLoading: false });
      return data.id;
    } catch (error: any) {
      set({
        error: error.message,
        isLoading: false
      });
      throw error;
    }
  },

  clearCurrentTransaction: () => {
    set({ currentTransaction: null });
  },

  setupTransactionListener: (userId: string) => {
    const { demoMode } = useUserStore.getState();

    if (demoMode) {
      // No real-time in demo mode, just return a no-op cleanup function
      return () => {};
    }

    // Set up real-time subscription
    const channel = supabase
      .channel(`user-${userId}-transactions`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId} AND status=eq.pending`,
        },
        (payload) => {
          // Add new pending transaction to the list
          const newTransaction = payload.new as Transaction;
          set(state => ({
            pendingTransactions: [newTransaction, ...state.pendingTransactions]
          }));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const updatedTx = payload.new as Transaction;

          // Handle status changes
          if (updatedTx.status === 'confirmed' || updatedTx.status === 'completed') {
            // Move from pending to history
            set(state => ({
              pendingTransactions: state.pendingTransactions.filter(tx => tx.id !== updatedTx.id),
              transactionHistory: [updatedTx, ...state.transactionHistory]
            }));
          } else if (updatedTx.status === 'cancelled' || updatedTx.status === 'rejected') {
            // Just remove from pending
            set(state => ({
              pendingTransactions: state.pendingTransactions.filter(tx => tx.id !== updatedTx.id)
            }));
          }

          // Update current transaction if it matches
          set(state => {
            if (state.currentTransaction?.id === updatedTx.id) {
              return { currentTransaction: updatedTx };
            }
            return {};
          });
        }
      )
      .subscribe();

    // Return cleanup function
    return () => {
      supabase.removeChannel(channel);
    };
  }
}));