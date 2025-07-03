import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SystemTransaction {
  id: string;
  date: string;
  amount: number;
  sender: string;
  receiver: string;
  type: string;
  status: string;
  description?: string;
}

export const useSystemTransactions = () => {
  const [transactions, setTransactions] = useState<SystemTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          profiles!transactions_user_id_fkey (display_name, email)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedTransactions = data?.map(transaction => ({
        id: transaction.id,
        date: new Date(transaction.created_at).toLocaleString(),
        amount: transaction.amount,
        sender: transaction.profiles?.display_name || transaction.profiles?.email || 'Unknown',
        receiver: transaction.tournament_id ? `Tournament ${transaction.tournament_id.slice(0, 8)}` : 'System',
        type: transaction.type === 'credit' ? 'Prize Contribution' : 
              transaction.type === 'debit' ? 'Tournament Fee' : 
              transaction.description || 'Transaction',
        status: transaction.status || 'Completed',
        description: transaction.description || '',
      })) || [];

      setTransactions(formattedTransactions);
    } catch (error) {
      console.error('Error fetching system transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalStats = () => {
    const totalAmount = transactions.reduce((sum, t) => sum + Math.abs(t.amount), 0);
    const completedTransactions = transactions.filter(t => t.status === 'Completed').length;
    const successRate = transactions.length > 0 ? (completedTransactions / transactions.length) * 100 : 0;

    return {
      totalAmount,
      totalCount: transactions.length,
      successRate: Math.round(successRate),
    };
  };

  useEffect(() => {
    fetchTransactions();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('system-transactions-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, fetchTransactions)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    transactions,
    loading,
    refetch: fetchTransactions,
    getTotalStats,
  };
};