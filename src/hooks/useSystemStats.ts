import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SystemStats {
  totalUsers: number;
  totalAdmins: number;
  totalTransactions: number;
  totalRevenue: number;
  activeTournaments: number;
  pendingRequests: number;
  dailyActiveUsers: number;
  totalTeams: number;
  openReports: number;
}

export const useSystemStats = () => {
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    totalAdmins: 0,
    totalTransactions: 0,
    totalRevenue: 0,
    activeTournaments: 0,
    pendingRequests: 0,
    dailyActiveUsers: 0,
    totalTeams: 0,
    openReports: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchSystemStats = async () => {
    setLoading(true);
    try {
      // Fetch total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch total admins
      const { count: totalAdmins } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .in('role', ['admin', 'systemadmin']);

      // Fetch total transactions and revenue
      const { data: transactions } = await supabase
        .from('transactions')
        .select('amount, type');

      const totalTransactions = transactions?.length || 0;
      const totalRevenue = transactions?.reduce((sum, t) => {
        return t.type === 'credit' ? sum + t.amount : sum;
      }, 0) || 0;

      // Fetch active tournaments
      const { count: activeTournaments } = await supabase
        .from('tournaments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'active');

      // Fetch pending admin requests
      const { count: pendingRequests } = await supabase
        .from('admin_requests')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Fetch total teams
      const { count: totalTeams } = await supabase
        .from('teams')
        .select('*', { count: 'exact', head: true });

      // Fetch open reports
      const { count: openReports } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Calculate daily active users (mock for now as we don't track login times)
      const dailyActiveUsers = Math.floor((totalUsers || 0) * 0.7); // 70% activity rate

      setStats({
        totalUsers: totalUsers || 0,
        totalAdmins: totalAdmins || 0,
        totalTransactions,
        totalRevenue,
        activeTournaments: activeTournaments || 0,
        pendingRequests: pendingRequests || 0,
        dailyActiveUsers,
        totalTeams: totalTeams || 0,
        openReports: openReports || 0,
      });
    } catch (error) {
      console.error('Error fetching system stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemStats();

    // Subscribe to real-time changes
    const channel = supabase
      .channel('system-stats-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchSystemStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'transactions' }, fetchSystemStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tournaments' }, fetchSystemStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'admin_requests' }, fetchSystemStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'teams' }, fetchSystemStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, fetchSystemStats)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    stats,
    loading,
    refetch: fetchSystemStats,
  };
};