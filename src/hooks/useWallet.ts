import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useProfile } from './useProfile';

export interface WalletBalance {
  id: string;
  user_id: string;
  balance: number;
  updated_at: string;
}

export interface Transaction {
  id: string;
  user_id: string;
  type: string;
  amount: number;
  description: string | null;
  status: string;
  tournament_id: string | null;
  created_at: string;
}

export const useWallet = () => {
  const { user } = useAuth();
  const { profile } = useProfile();
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);

  const fetchWalletData = async () => {
    if (!user) {
      setBalance(null);
      setTransactions([]);
      setLoading(false);
      return;
    }

    // Fetch balance
    const { data: balanceData, error: balanceError } = await supabase
      .from('wallet_balances')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (balanceError) {
      console.error('Error fetching wallet balance:', balanceError);
    } else {
      setBalance(balanceData);
    }

    // Fetch transactions
    const { data: transactionsData, error: transactionsError } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (transactionsError) {
      console.error('Error fetching transactions:', transactionsError);
    } else {
      setTransactions(transactionsData || []);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchWalletData();

    if (!user) return;

    // Subscribe to wallet changes
    const balanceChannel = supabase
      .channel('wallet-balance-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'wallet_balances',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            setBalance(payload.new as WalletBalance);
          }
        }
      )
      .subscribe();

    const transactionsChannel = supabase
      .channel('transactions-changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          setTransactions(prev => [payload.new as Transaction, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(balanceChannel);
      supabase.removeChannel(transactionsChannel);
    };
  }, [user]);

  const createStripeCheckout = async (amount: number) => {
    setPaymentLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('create-wallet-checkout', {
        body: { amount }
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      console.error('Error creating Stripe checkout:', error);
      return { data: null, error: error.message };
    } finally {
      setPaymentLoading(false);
    }
  };

  const verifyStripePayment = async (sessionId: string) => {
    setPaymentLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-wallet-payment', {
        body: { sessionId }
      });

      if (error) throw error;

      // Refetch wallet data after successful payment
      await fetchWalletData();

      return { data, error: null };
    } catch (error: any) {
      console.error('Error verifying Stripe payment:', error);
      return { data: null, error: error.message };
    } finally {
      setPaymentLoading(false);
    }
  };

  const createRazorpayOrder = async (amount: number) => {
    setPaymentLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('razorpay-integration', {
        body: { amount, action: 'create_order' }
      });

      if (error) throw error;

      return { data, error: null };
    } catch (error: any) {
      console.error('Error creating Razorpay order:', error);
      return { data: null, error: error.message };
    } finally {
      setPaymentLoading(false);
    }
  };

  const verifyRazorpayPayment = async (paymentData: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
  }) => {
    try {
      const { data, error } = await supabase.functions.invoke('razorpay-integration', {
        body: paymentData,
      });

      if (error) throw error;

      // Refresh wallet data after successful payment
      await fetchWalletData();
      
      return { data, error: null };
    } catch (error) {
      console.error('Error verifying payment:', error);
      return { error: error.message || 'Failed to verify payment' };
    }
  };

  const addTransaction = async (
    type: string,
    amount: number,
    description?: string,
    tournamentId?: string
  ) => {
    if (!user) return { error: 'No user found' };
    
    // Prevent frozen users from making transactions
    if (profile?.role === 'frozen') {
      return { error: 'Account is frozen. Contact support to resolve.' };
    }

    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        user_id: user.id,
        type,
        amount,
        description,
        tournament_id: tournamentId,
      }])
      .select()
      .single();

    if (!error) {
      // Update wallet balance
      const newBalance = (balance?.balance || 0) + (type === 'deposit' || type === 'prize_win' ? amount : -amount);
      
      await supabase
        .from('wallet_balances')
        .update({ balance: newBalance })
        .eq('user_id', user.id);
    }

    return { data, error };
  };

  return {
    balance,
    transactions,
    loading,
    paymentLoading,
    addTransaction,
    createRazorpayOrder,
    verifyRazorpayPayment,
    createStripeCheckout,
    verifyStripePayment,
    refetch: fetchWalletData,
  };
};