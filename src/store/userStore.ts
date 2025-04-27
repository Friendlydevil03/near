import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';

export type UserRole = 'admin' | 'attendant' | 'customer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  balance?: number;
}

interface UserState {
  currentUser: User | null;
  isLoading: boolean;
  error: string | null;
  demoMode: boolean;

  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkSession: () => Promise<void>;
  updateBalance: (newBalance: number) => void;
  updateUserProfile: (updates: Partial<User>) => void; // New function for updating profile
}

// Demo users for development
const DEMO_USERS = {
  attendant: {
    id: 'attendant-001',
    email: 'station@example.com',
    name: 'Friendlydevil03',
    role: 'attendant' as UserRole,
  },
  customer: {
    id: 'customer-001',
    email: 'customer@example.com',
    name: 'Customer',
    role: 'customer' as UserRole,
    balance: 500.00,
  }
};

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      isLoading: false,
      error: null,
      demoMode: !import.meta.env.VITE_SUPABASE_URL,

      login: async (email, password) => {
      set({ isLoading: true, error: null });

      try {
        // Demo users for development
        // Make sure the name is set correctly here without any trailing text
        if (email === 'Friendlydevil03' && password === 'password') {
          set({
            currentUser: {
              ...DEMO_USERS.attendant,
              // Make sure name is properly set
              name: "Friendlydevil03"
            },
            demoMode: true
          });
          return;
        }

        if (email === 'customer@example.com' && password === 'password') {
          set({
            currentUser: {
              ...DEMO_USERS.customer,
              // Make sure name is properly set
              name: "Customer"
            },
            demoMode: true
          });
          return;
        }

          // Regular Supabase authentication
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) throw error;

          if (data?.user) {
            // Get user profile from the users table
            const { data: profileData } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.user.id)
              .single();

            set({
              currentUser: {
                id: data.user.id,
                email: data.user.email || '',
                name: profileData?.name || data.user.email?.split('@')[0] || 'User',
                role: profileData?.role as UserRole || 'customer',
                balance: profileData?.balance || 0,
              },
              demoMode: false
            });
          }
        } catch (error: any) {
          set({ error: error.message });
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: async () => {
        set({ isLoading: true });

        try {
          if (!import.meta.env.VITE_SUPABASE_URL ||
              !import.meta.env.VITE_SUPABASE_ANON_KEY) {
            // Just clear the user in demo mode
            set({ currentUser: null });
            return;
          }

          await supabase.auth.signOut();
          set({ currentUser: null });
        } catch (error: any) {
          set({ error: error.message });
        } finally {
          set({ isLoading: false });
        }
      },

      checkSession: async () => {
        set({ isLoading: true });

        try {
          if (!import.meta.env.VITE_SUPABASE_URL ||
              !import.meta.env.VITE_SUPABASE_ANON_KEY) {
            // In demo mode, don't try to restore session
            set({ isLoading: false });
            return;
          }

          const { data } = await supabase.auth.getSession();

          if (data.session?.user) {
            // Get user profile from the users table
            const { data: profileData } = await supabase
              .from('users')
              .select('*')
              .eq('id', data.session.user.id)
              .single();

            set({
              currentUser: {
                id: data.session.user.id,
                email: data.session.user.email || '',
                name: profileData?.name || data.session.user.email?.split('@')[0] || 'User',
                role: profileData?.role as UserRole || 'customer',
                balance: profileData?.balance || 0,
              },
            });
          }
        } catch (error: any) {
          console.error("Session check error:", error);
        } finally {
          set({ isLoading: false });
        }
      },

      updateBalance: (newBalance: number) => {
        const { currentUser } = get();
        if (!currentUser) return;

        // Update user balance in store
        set({
          currentUser: {
            ...currentUser,
            balance: newBalance
          }
        });

        // If not in demo mode, update in database
        if (!get().demoMode) {
          supabase
            .from('users')
            .update({ balance: newBalance })
            .eq('id', currentUser.id)
            .then(({ error }) => {
              if (error) console.error('Failed to update balance:', error);
            });
        }
      },

      // New function to update user profile
      updateUserProfile: (updates: Partial<User>) => {
        const { currentUser } = get();
        if (!currentUser) return;

        // Update user profile in store
        set({
          currentUser: {
            ...currentUser,
            ...updates
          }
        });

        // If not in demo mode, update in database
        if (!get().demoMode) {
          supabase
            .from('users')
            .update(updates)
            .eq('id', currentUser.id)
            .then(({ error }) => {
              if (error) console.error('Failed to update profile:', error);
            });
        }
      }
    }),
    {
      name: 'user-storage', // name of the item in localStorage
      partialize: (state) => ({
        currentUser: state.currentUser,
        demoMode: state.demoMode,
      }),
    }
  )
);

// Helper function to check if user has a specific role
export const hasRole = (user: User | null, role: UserRole | UserRole[]): boolean => {
  if (!user) return false;

  if (Array.isArray(role)) {
    return role.includes(user.role);
  }

  return user.role === role;
};