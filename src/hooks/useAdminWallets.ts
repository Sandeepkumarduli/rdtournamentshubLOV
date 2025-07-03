import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AdminWallet {
  id: string;
  username: string;
  wallet: number;
  status: string;
  lastActivity: string;
}

export const useAdminWallets = () => {
  const [wallets, setWallets] = useState<AdminWallet[]>([]);
  const [orgBalance, setOrgBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchWallets = async () => {
    setLoading(true);
    try {
      // Get current admin's organization
      const auth = localStorage.getItem("userAuth");
      const adminData = auth ? JSON.parse(auth) : null;
      const adminOrg = adminData?.organization || 'FireStorm';

      // Fetch users in the organization with their wallet data
      const { data: profiles } = await supabase
        .from('profiles')
        .select(`
          *,
          wallet_balances (balance)
        `)
        .eq('organization', adminOrg);

      // Format wallet data
      const formattedWallets = profiles?.map(profile => ({
        id: profile.id,
        username: profile.display_name || profile.email || 'Unknown',
        wallet: profile.wallet_balances?.[0]?.balance || 0,
        status: 'Active',
        lastActivity: new Date(profile.updated_at).toLocaleDateString(),
      })) || [];

      setWallets(formattedWallets);

      // Calculate organization balance (sum of all transactions for the org)
      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount, type')
        .in('user_id', profiles?.map(p => p.user_id) || []);

      const totalBalance = transactions?.reduce((sum, t) => {
        return t.type === 'credit' ? sum + t.amount : sum - t.amount;
      }, 50000) || 50000; // Start with base amount

      setOrgBalance(totalBalance);
    } catch (error) {
      console.error('Error fetching admin wallets:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendMoney = async (userId: string, amount: number, type: 'individual' | 'team') => {
    try {
      // Create transaction record
      const { error } = await supabase
        .from('transactions')
        .insert([{
          user_id: userId,
          amount: amount,
          type: 'credit',
          description: `Prize money from organization - ${type}`,
        }]);

      if (error) throw error;

      // Update wallet balance
      const { error: walletError } = await supabase
        .from('wallet_balances')
        .upsert({
          user_id: userId,
          balance: amount,
        });

      if (walletError) throw walletError;

      // Refresh data
      fetchWallets();
      
      return { success: true };
    } catch (error) {
      console.error('Error sending money:', error);
      return { error: 'Failed to send money' };
    }
  };

  useEffect(() => {
    fetchWallets();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('admin-wallets-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'wallet_balances' }, fetchWallets)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, fetchWallets)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    wallets,
    orgBalance,
    loading,
    refetch: fetchWallets,
    sendMoney,
  };
};