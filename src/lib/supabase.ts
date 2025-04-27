import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
  console.warn('Running in demo mode as fallback.');
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');

// Helper function for transaction subscriptions
export const subscribeToTransaction = (
  transactionId: string,
  callback: (transaction: any) => void
) => {
  if (!supabaseUrl || !supabaseAnonKey) {
    // In demo mode, simulate subscription with setTimeout
    setTimeout(() => {
      callback({
        id: transactionId,
        status: 'confirmed',
        // Add other fields as needed
      });
    }, 3000);
    return {
      unsubscribe: () => {}
    };
  }

  return supabase
    .channel(`transaction-${transactionId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'transactions',
        filter: `id=eq.${transactionId}`,
      },
      (payload) => {
        callback(payload.new);
      }
    )
    .subscribe();
};