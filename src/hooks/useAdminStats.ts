import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface AdminStats {
  orgMembers: number;
  orgTournaments: number;
  totalPrizePool: number;
  pendingReviews: number;
}

export const useAdminStats = () => {
  const [stats, setStats] = useState<AdminStats>({
    orgMembers: 0,
    orgTournaments: 0,
    totalPrizePool: 0,
    pendingReviews: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchAdminStats = async () => {
    setLoading(true);
    try {
      // Get current admin's organization from localStorage
      const auth = localStorage.getItem("userAuth");
      const adminData = auth ? JSON.parse(auth) : null;
      const adminOrg = adminData?.organization || 'FireStorm';

      // Fetch org members count
      const { count: membersCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('organization', adminOrg);

      // Fetch org tournaments
      const { data: tournaments } = await supabase
        .from('tournaments')
        .select('prize_pool')
        .eq('status', 'active');

      // Calculate total prize pool for org tournaments
      const totalPrizePool = tournaments?.reduce((sum, t) => sum + (t.prize_pool || 0), 0) || 0;

      // Fetch pending reviews (reports)
      const { count: pendingCount } = await supabase
        .from('reports')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      setStats({
        orgMembers: membersCount || 0,
        orgTournaments: tournaments?.length || 0,
        totalPrizePool,
        pendingReviews: pendingCount || 0,
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();

    // Subscribe to changes
    const channel = supabase
      .channel('admin-stats-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, fetchAdminStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tournaments' }, fetchAdminStats)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'reports' }, fetchAdminStats)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    stats,
    loading,
    refetch: fetchAdminStats,
  };
};